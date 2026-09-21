from flask import Blueprint, jsonify, request

from app.services.government_scheme_service import (
    search_government_schemes,
    get_default_government_schemes,
)


government_schemes_bp = Blueprint(
    "government_schemes",
    __name__,
    url_prefix="/api/government-schemes",
)


@government_schemes_bp.get("")
def get_schemes():
    """
    Get current government loan and
    subsidy schemes using Tavily.
    """

    query = request.args.get(
        "query",
        "",
    ).strip()

    try:
        if query:
            result = search_government_schemes(
                query
            )
        else:
            result = get_default_government_schemes()

        return jsonify({
            "success": True,
            "data": result,
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
                "Unable to fetch government schemes "
                "right now. Please try again later."
            ),
        }), 500