from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalEntryViewSet, index, today_page, history_page, trends_page 
from .therapist_views import therapist_dashboard, client_detail, login_redirect, therapist_trends

router = DefaultRouter()
router.register(r'journal', JournalEntryViewSet, basename='journal')

urlpatterns = [
    path('', index, name='index'),
    path("today/", today_page, name="journal-today"),
    path("history/", history_page, name="journal-history"),
    path("trends/", trends_page, name="journal-trends"),

    # Therapist URLs
    path("therapist/dashboard/", therapist_dashboard, name="therapist-dashboard"),
    path("therapist/client/<int:client_id>/", client_detail, name="client-detail"),
    path("login-redirect/", login_redirect, name="login-redirect"),
    path("therapist/trends/", therapist_trends, name="therapist-trends"),

    # DRF router at the end
    path('api/', include(router.urls)),
]
