from django.db import models
from django.contrib.auth.models import User

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    mood = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)],
                               null=True,
                               blank=True)
    activity = models.CharField(max_length=100, null=True, blank=True)
    reflection = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.date()}"
