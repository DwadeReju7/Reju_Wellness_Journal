from django.conf import settings
from django.db import models


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

    def __str__(self):
        return f"{self.user.username}'s Profile"


