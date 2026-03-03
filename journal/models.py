from django.db import models
from django.contrib.auth.models import User

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='journal_entries')
    mood = models.CharField(
    max_length=20,
    choices=[
        ('great', 'Great'),
        ('good', 'Good'),
        ('okay', 'Okay'),
        ('low', 'Low'),
    ],
                               null=True,
                               blank=True)
    activity = models.CharField(max_length=100, null=True, blank=True)
    prompt = models.TextField(blank=True, null=True)
    reflection = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

def __str__(self):
    username = self.user.username if self.user else "Anonymous"
    return f"Journal Entry by {username} - {self.created_at.date()}"
