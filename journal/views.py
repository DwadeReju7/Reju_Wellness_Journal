from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import JournalEntry
from .serializers import JournalEntrySerializer
from .prompts import get_prompt
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError

def index(request):
    return HttpResponse("Journal app is running!")

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        today = now().date()

        if JournalEntry.objects.filter(
            user=self.request.user,
            created_at__date=today
        ).exists():
            raise ValidationError("You have already submitted a journal entry")

        prompt = get_prompt(self.request.user)
        serializer.save(user=self.request.user, prompt=prompt)

    @action(detail=False, methods=['get'])
    def prompt(self, request):
        profile = request.user.profile

        if profile.question_type == "standard":
            prompt = "What went well today?"
        else:
            prompt = "Reflect on a recent challenge and what it taught you."

        return Response({'prompt': prompt})
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        today = now().date()
        entry = JournalEntry.objects.filter(user=request.user,created_at__date=today).first()

        if entry:
            serializer = self.get_serializer(entry)
            return Response({
                "has_entry": True,
                "entry": serializer.data
            })
        
        return Response({"has_entry": False})

# Create your views here.
  