def get_prompt(user):
    profile = user.profile

    if profile.question_type == "standard":
        return "What is one thing that went well today?"
    
    if profile.question_type == "tailored":
        if profile.journaling_frequency == "daily":
            return "How did today align with your goals?"
        if profile.journaling_frequency == "weekly":
            return "What stood out emotionally this week?"
        if profile.journaling_frequency == "monthly":
            return "What paterns are you noticing this month?"
        
    return "How are you feeling right now?"