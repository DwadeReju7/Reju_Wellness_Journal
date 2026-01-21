from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        read_only_fields = fields 

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "journaling_frequency",
            "question_type",
            "onboarding_completed",
        ]
        read_only_fields = ["onboarding_completed"]

class OnboardingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["onboarding_completed"]