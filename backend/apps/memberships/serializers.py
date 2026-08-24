from rest_framework import serializers

from apps.library.models import Seat, Shift
from apps.library.serializers import SeatSerializer, ShiftSerializer

from .models import Membership, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id", "razorpay_order_id", "razorpay_payment_id",
            "amount", "method", "status", "created_at", "paid_at",
        )


class MembershipCreateSerializer(serializers.Serializer):
    shift = serializers.PrimaryKeyRelatedField(queryset=Shift.objects.all())
    seat = serializers.PrimaryKeyRelatedField(
        queryset=Seat.objects.all(), required=False, allow_null=True
    )
    duration_months = serializers.IntegerField(min_value=1, max_value=12, default=1)

    def validate_seat(self, seat):
        if seat and not seat.is_active:
            raise serializers.ValidationError("This seat is inactive.")
        return seat


class MembershipSerializer(serializers.ModelSerializer):
    shift = ShiftSerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = (
            "id", "shift", "seat", "duration_months", "start_date",
            "end_date", "status", "payment_method", "cash_request_expires_at",
            "amount", "days_left", "created_at", "payment",
        )
        read_only_fields = fields


class MembershipAdminSerializer(serializers.ModelSerializer):
    member = serializers.SerializerMethodField()
    shift = ShiftSerializer(read_only=True)
    seat = SeatSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    member_name = serializers.CharField(source="member.name", read_only=True)

    class Meta:
        model = Membership
        fields = (
            "id", "member", "member_name", "shift",
            "seat", "duration_months", "start_date", "end_date", "status",
            "payment_method", "cash_request_expires_at", "amount",
            "days_left", "created_at", "payment",
        )
        read_only_fields = ("id", "member", "amount", "created_at", "payment")

    def get_member(self, obj):
        request = self.context.get("request")
        member = obj.member
        aadhar_url = None
        if member.aadhar_document:
            aadhar_url = (
                request.build_absolute_uri(member.aadhar_document.url)
                if request
                else member.aadhar_document.url
            )
        return {
            "id": str(member.id),
            "name": member.name,
            "email": member.email,
            "phone": member.phone,
            "gender": member.gender,
            "aadhar_document_url": aadhar_url,
            "wifi_device_name": member.wifi_device_name,
            "ip_address": member.ip_address,
        }
