from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MembershipViewSet, RazorpayWebhookView

router = DefaultRouter()
router.register("", MembershipViewSet, basename="membership")

urlpatterns = [
    # Must precede the router so "webhooks" is never swallowed as a pk.
    path("webhooks/razorpay/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    path("", include(router.urls)),
]
