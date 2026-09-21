import os

from dotenv import load_dotenv
from tavily import TavilyClient


load_dotenv()


class TavilySearchService:
    """
    Service responsible for searching the web using Tavily.
    """

    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")

        if not self.api_key:
            raise ValueError(
                "TAVILY_API_KEY is not configured."
            )

        self.client = TavilyClient(
            api_key=self.api_key
        )

    def search(
        self,
        query,
        max_results=5,
    ):
        """
        Search the web using Tavily.
        """

        if not query or not query.strip():
            raise ValueError(
                "Search query is required."
            )

        query = query.strip()

        if max_results < 1:
            max_results = 1

        if max_results > 10:
            max_results = 10

        response = self.client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_answer=False,
            include_raw_content=False,
        )

        results = response.get(
            "results",
            [],
        )

        normalized_results = []

        for result in results:
            normalized_results.append({
                "title": result.get(
                    "title",
                    "",
                ),
                "url": result.get(
                    "url",
                    "",
                ),
                "content": result.get(
                    "content",
                    "",
                ),
                "score": result.get(
                    "score",
                    0,
                ),
            })

        return {
            "query": query,
            "results": normalized_results,
            "total_results": len(
                normalized_results
            ),
        }


def search_web(
    query,
    max_results=5,
):
    """
    Convenience function for other
    SmartEMI services.
    """

    service = TavilySearchService()

    return service.search(
        query=query,
        max_results=max_results,
    )