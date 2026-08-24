import uuid
from datetime import date

from django.db import models

MEMBERSHIP_STATUS = (
    ("pending_payment", "Pending Payment"),
    ("pending_cash", "Pending Cash"),
    ("active", "Active"),
    ("expired", "Expired"),
    ("cancelled", "Cancelled"),
)

PAYMENT_METHODS = (
    ("upi", "UPI"),
    ("cash", "Cash"),
)

# Lifecycle: created → (authorized →) paid | failed. A late webhook may move
# failed → paid (money was actually captured); `paid` is only ever left via an
# explicit refund. Never regress paid/failed to pending states.
PAYMENT_STATUS = (
    ("created", "Created"),
    ("authorized", "Authorized"),
    ("paid", "Paid"),
    ("failed", "Failed"),
    ("refunded", "Refunded"),
)

PAYMENT_TRANSITIONS = {
    "created": {"authorized", "paid", "failed"},
    "authorized": {"authorized", "paid", "failed"},
    "failed": {"paid"},
    "paid": {"refunded"},
    "refunded": set(),
}

DAYS_PER_MONTH = 30


class Membership(models.Model):
    """A paid pass for one time block for a chosen duration (1–12 months).

    Price is the shift's per-day price × 30 days × duration months.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="memberships"
    )
    shift = models.ForeignKey(
        "library.Shift", on_delete=models.PROTECT, related_name="memberships"
    )
    seat = models.ForeignKey(
        "library.Seat",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="memberships",
    )
    duration_months = models.PositiveSmallIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=MEMBERSHIP_STATUS, default="pending_payment"
    )
    payment_method = models.CharField(
        max_length=10, choices=PAYMENT_METHODS, default="upi"
    )
    cash_request_expires_at = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status", "end_date"]),
            models.Index(fields=["member", "status"]),
            models.Index(fields=["seat", "status", "start_date", "end_date"]),
        ]

    def __str__(self):
        return f"{self.member.email} · {self.shift.name} · {self.start_date} · {self.status}"

    @property
    def days_left(self):
        if not self.end_date:
            return None
        return (self.end_date - date.today()).days

    def compute_dates(self, start=None):
        from datetime import timedelta

        start = start or date.today()
        self.start_date = start
        self.end_date = start + timedelta(days=DAYS_PER_MONTH * self.duration_months)
        return self.start_date, self.end_date


class Payment(models.Model):
    """Razorpay UPI payment tied 1:1 to a membership."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.OneToOneField(
        Membership, on_delete=models.CASCADE, related_name="payment"
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=120, blank=True, default="")
    razorpay_signature = models.CharField(max_length=255, blank=True, default="")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, default="upi")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="created")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            # Webhook lookups arrive by gateway order/payment id.
            models.Index(fields=["razorpay_order_id"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            # DB-level duplicate protection: the same gateway order / payment
            # can never be recorded on two Payment rows (empty values exempt).
            models.UniqueConstraint(
                fields=["razorpay_order_id"],
                condition=~models.Q(razorpay_order_id=""),
                name="uniq_payment_razorpay_order_id",
            ),
            models.UniqueConstraint(
                fields=["razorpay_payment_id"],
                condition=~models.Q(razorpay_payment_id=""),
                name="uniq_payment_razorpay_payment_id",
            ),
        ]

    def transition_to(self, new_status):
        """Apply a guarded status change. Returns True when applied.

        Invalid transitions (e.g. a stale webhook trying to move a captured
        payment back to pending/failed) are refused and logged by callers.
        """
        if new_status == self.status:
            return False
        if new_status not in PAYMENT_TRANSITIONS.get(self.status, set()):
            return False
        self.status = new_status
        return True

    def __str__(self):
        return f"Payment {self.amount} {self.status} · {self.membership_id}"


class WebhookEvent(models.Model):
    """Idempotency store for Razorpay webhook deliveries.

    The primary key is a stable dedupe key (`<event>:<payment_id>`), so a
    repeated delivery collides at the database level and is answered from the
    existing row instead of re-running business logic.
    """

    id = models.CharField(primary_key=True, max_length=120)
    event_type = models.CharField(max_length=100, blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    processed = models.BooleanField(default=False)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-received_at",)

    def __str__(self):
        return f"{self.id} ({'processed' if self.processed else 'pending'})"
