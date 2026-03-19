from django.contrib import admin
from .models import UserProfile, TherapistProfile, ClientTherapistRelationship

@admin.register(TherapistProfile)
class TherapistProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'specialty', 'created_at')
    search_fields = ('user__username', 'user__email', 'license_number')

@admin.register(ClientTherapistRelationship)
class ClientTherapistRelationshipAdmin(admin.ModelAdmin):
    list_display = ('client', 'therapist', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('client__username', 'therapist__username')
    
# Update existing UserProfile admin to show role
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'journaling_frequency', 'onboarding_completed')
    list_filter = ('role', 'journaling_frequency')
# Register your models here.
