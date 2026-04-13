import json

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from users.models import ClientTherapistRelationship, UserRole
from journal.models import JournalEntry
from datetime import datetime, timedelta

User = get_user_model()


def is_therapist(user):
    """Check if user is a therapist"""
    return hasattr(user, 'profile') and user.profile.role == UserRole.THERAPIST

@login_required
def therapist_dashboard(request):
    """Main therapist dashboard showing all clients"""
    # Add this check at the start
    if not is_therapist(request.user):
        return redirect('today')
    therapist = request.user
    
    # Get all active client relationships
    relationships = ClientTherapistRelationship.objects.filter(
        therapist=therapist,
        is_active=True
    ).select_related('client', 'client__profile')
    
    # Build client data
    clients_data = []
    for rel in relationships:
        client = rel.client
        
        # Get journal stats
        total_entries = JournalEntry.objects.filter(user=client).count()
        
        # Get last entry date
        last_entry = JournalEntry.objects.filter(user=client).order_by('-created_at').first()
        last_entry_date = last_entry.created_at if last_entry else None
        
        # Get entries this week
        week_ago = datetime.now() - timedelta(days=7)
        entries_this_week = JournalEntry.objects.filter(
            user=client,
            created_at__gte=week_ago
        ).count()
        
        clients_data.append({
            'client': client,
            'relationship': rel,
            'total_entries': total_entries,
            'last_entry_date': last_entry_date,
            'entries_this_week': entries_this_week,
        })
    
    context = {
        'clients': clients_data,
        'total_clients': len(clients_data),
    }
    
    return render(request, 'therapist/dashboard.html', context)


@login_required
def client_detail(request, client_id):
    """View detailed journal entries for a specific client"""

    if not is_therapist(request.user):
        return redirect('today')
    therapist = request.user
    
    # Verify therapist has access to this client
    try:
        relationship = ClientTherapistRelationship.objects.get(
            therapist=therapist,
            client_id=client_id,
            is_active=True
        )
    except ClientTherapistRelationship.DoesNotExist:
        return redirect('therapist-dashboard')
    
    client = relationship.client
    
    # Get all journal entries for this client
    entries = JournalEntry.objects.filter(user=client).order_by('-created_at')
    
    # Get mood distribution
    mood_counts = {}
    for entry in entries:
        mood = entry.mood or 'unknown'
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    context = {
        'client': client,
        'entries': entries,
        'total_entries': entries.count(),
        'mood_distribution': mood_counts,
    }
    
    return render(request, 'therapist/client_detail.html', context)


# Update your existing login redirect logic in settings.py or middleware
# We'll create a custom login redirect function

def login_redirect(request):
    """Redirect users after login based on their role"""
    user = request.user
    
    if is_therapist(user):
        return redirect('therapist-dashboard')
    else:
        return redirect('today')
    
@login_required
def therapist_trends(request):
    """Aggregate mood trends for all therapist's clients"""
    # Check if user is a therapist
    if not is_therapist(request.user):
        return redirect('today')
    
    therapist = request.user
    
    # Get all active client relationships
    relationships = ClientTherapistRelationship.objects.filter(
        therapist=therapist,
        is_active=True
    ).select_related('client')
    
    # Build client data with their entries
    clients_data = []
    for rel in relationships:
        client = rel.client
        entries = JournalEntry.objects.filter(user=client).order_by('-created_at')
        
        # Serialize entries for JavaScript
        entries_list = [{
            'mood': entry.mood,
            'created_at': entry.created_at.isoformat(),
        } for entry in entries]
        
        clients_data.append({
            'id': client.id,
            'name': f"{client.first_name} {client.last_name}" if client.first_name else client.username,
            'entries': entries_list
        })
    
    context = {
        'clients_data': json.dumps(clients_data),
        'total_clients': len(clients_data),
    }
    
    return render(request, 'therapist/trends.html', context)
 