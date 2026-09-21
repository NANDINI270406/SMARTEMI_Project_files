from app.services.tavily_service import search_web


def needs_web_search(question):
    """
    Decide whether the user's question needs
    current web information.
    """

    web_keywords = [
        "current",
        "latest",
        "today",
        "recent",
        "2026",
        "interest rate",
        "interest rates",
        "home loan rate",
        "loan rate",
        "bank rate",
        "government scheme",
        "government schemes",
        "subsidy",
        "new scheme",
        "updated",
        "news",
        "eligibility",
        "offer",
        "rates in india",
    ]

    question_lower = question.lower()

    for keyword in web_keywords:
        if keyword in question_lower:
            return True

    return False


def create_assistant_response(question):
    """
    Process a user's question for the SmartEMI Assistant.
    """

    if not question or not question.strip():
        raise ValueError(
            "Question is required."
        )

    question = question.strip()

    use_web = needs_web_search(question)

    if use_web:
        web_data = search_web(
            query=question,
            max_results=5,
        )

        return {
            "question": question,
            "source_type": "web",
            "message": (
                "I found current information from the web "
                "using Tavily."
            ),
            "web_results": web_data["results"],
            "total_results": web_data["total_results"],
        }

    return {
        "question": question,
        "source_type": "smartemi",
        "message": (
            "This question can be handled using "
            "SmartEMI's own data and calculations."
        ),
        "web_results": [],
        "total_results": 0,
    }
