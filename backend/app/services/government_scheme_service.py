from app.services.tavily_service import search_web


def search_government_schemes(query):
    """
    Search current Indian government loan
    and subsidy schemes using Tavily.
    """

    if not query or not query.strip():
        raise ValueError(
            "Scheme search query is required."
        )

    query = query.strip()

    search_query = (
        f"{query} "
        "India government official scheme "
        "loan subsidy eligibility"
    )

    web_data = search_web(
        query=search_query,
        max_results=8,
    )

    return {
        "query": query,
        "source_type": "tavily",
        "results": web_data["results"],
        "total_results": web_data["total_results"],
    }


def get_default_government_schemes():
    """
    Search for currently available government
    loan and subsidy schemes in India.
    """

    query = (
        "current government loan schemes and "
        "subsidy schemes in India"
    )

    return search_government_schemes(query)