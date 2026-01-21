from rest_framework import serializers
from journal.models import JournalEntry

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = [
            'id',
            'prompt',
            'reflection',
            'mood',
            'created_at',
        ]
        read_only_fields = ['user', 'id', 'created_at', 'prompt']