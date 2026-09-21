from flask import Blueprint, jsonify, request

from app.services.prepayment_service import (
    calculate_prepayment,
)


prepayment_bp = Blueprint(
    "prepayment",
    __name__,
    url_prefix="/api/prepayment",
)


@prepayment_bp.post("/calculate")
def calculate_prepayment_route():
    """
    Calculate the financial impact of
    making a lump-sum loan prepayment.
    """

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required.",
        }), 400

    required_fields = [
        "principal",
        "annual_interest_rate",
        "remaining_months",
        "prepayment_amount",
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "success": False,
                "message": (
                    f"{field} is required."
                ),
            }), 400

    try:
        principal = float(
            data["principal"]
        )

        annual_interest_rate = float(
            data["annual_interest_rate"]
        )

        remaining_months = int(
            data["remaining_months"]
        )

        prepayment_amount = float(
            data["prepayment_amount"]
        )

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": (
                "Principal, interest rate, "
                "remaining months, and prepayment "
                "amount must contain valid numbers."
            ),
        }), 400

    try:
        result = calculate_prepayment(
            principal=principal,
            annual_interest_rate=annual_interest_rate,
            remaining_months=remaining_months,
            prepayment_amount=prepayment_amount,
        )

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
                "Unable to calculate prepayment "
                "impact right now."
            ),
        }), 500