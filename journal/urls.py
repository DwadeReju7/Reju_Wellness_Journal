from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JournalEntryViewSet, index

router = DefaultRouter()
router.register(r'journal', JournalEntryViewSet, basename='journal')


urlpatterns = [
    path('', index, name='index'),
    path('', include(router.urls)),
]
