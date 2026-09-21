from flask import Blueprint, jsonify, request

from app.services.loan_comparison_service import (
    compare_loans,
)


loan_comparison_bp = Blueprint(
    "loan_comparison",
    __name__,
    url_prefix="/api/loan-comparison",
)


@loan_comparison_bp.post("/compare")
def compare_loans_route():
    """
    Compare multiple loan options based on
    EMI, total payment, and total interest.
    """

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required.",
        }), 400

    loans = data.get("loans")

    if loans is None:
        return jsonify({
            "success": False,
            "message": "Loans are required.",
        }), 400

    if not isinstance(loans, list):
        return jsonify({
            "success": False,
            "message": "Loans must be provided as a list.",
        }), 400

    try:
        result = compare_loans(loans)

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
                "Unable to compare loans right now. "
                "Please try again later."
            ),
        }), 500