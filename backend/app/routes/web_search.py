from flask import Blueprint, jsonify, request

from app.services.tavily_service import search_web


web_search_bp = Blueprint(
    "web_search",
    __name__,
    url_prefix="/api/web-search",
)


@web_search_bp.post("")
def web_search():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required.",
        }), 400

    query = data.get("query", "").strip()

    if not query:
        return jsonify({
            "success": False,
            "message": "Search query is required.",
        }), 400

    max_results = data.get(
        "max_results",
        5,
    )

    try:
        max_results = int(max_results)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "max_results must be a number.",
        }), 400

    try:
        results = search_web(
            query=query,
            max_results=max_results,
        )

        return jsonify({
            "success": True,
            "data": results,
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to search the web right now. "
                "Please try again later."
            ),
        }), 500