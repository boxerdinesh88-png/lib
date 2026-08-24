from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminMembershipViewSet

router = DefaultRouter()
router.register("memberships", AdminMembershipViewSet, basename="admin-membership")

urlpatterns = [
    path("", include(router.urls)),
]
