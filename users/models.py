from django.conf import settings
from django.db import models


class UserRole(models.TextChoices):
    CLIENT = 'client', 'Client'
    THERAPIST = 'therapist', 'Therapist'


class UserProfile(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('unsure', 'Unsure'),
    ]
    QUESTION_TYPE_CHOICES = [
        ('standard', 'Standard'),
        ('tailored', 'Tailored'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Existing fields
    journaling_frequency = models.CharField(
        max_length=10,
        choices=FREQUENCY_CHOICES,
        default='unsure'
    )

    question_type = models.CharField(
        max_length=10,
        choices=QUESTION_TYPE_CHOICES,
        default='standard'
    )

    onboarding_completed = models.BooleanField(default=False)

    # NEW: User role
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CLIENT
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"


class TherapistProfile(models.Model):
    """Extended profile for therapists"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='therapist_profile'
    )
    
    license_number = models.CharField(max_length=100, blank=True)
    specialty = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Therapist: {self.user.username}"


class ClientTherapistRelationship(models.Model):
    """Links clients to their therapists"""
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_relationships'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='therapist_relationship'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('therapist', 'client')
        verbose_name = 'Client-Therapist Relationship'
        verbose_name_plural = 'Client-Therapist Relationships'

    def __str__(self):
        return f"{self.client.username} → {self.therapist.username}"