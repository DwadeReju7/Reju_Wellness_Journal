from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps

from .models import UserProfile

User = apps.get_model(settings.AUTH_USER_MODEL)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)