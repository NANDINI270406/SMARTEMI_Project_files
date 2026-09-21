from datetime import datetime

from flask import Blueprint, jsonify, request

from app.services.emi_service import (
    calculate_emi,
    generate_amortization_schedule,
)


emi_bp = Blueprint(
    "emi",
    __name__,
    url_prefix="/api/emi",
)


@emi_bp.post("/calculate")
def calculate_emi_api():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    principal = data.get("principal")
    annual_interest_rate = data.get(
        "annual_interest_rate"
    )
    tenure_months = data.get("tenure_months")

    if principal is None:
        return jsonify({
            "success": False,
            "message": "Loan amount is required",
        }), 400

    if annual_interest_rate is None:
        return jsonify({
            "success": False,
            "message": "Interest rate is required",
        }), 400

    if tenure_months is None:
        return jsonify({
            "success": False,
            "message": "Tenure is required",
        }), 400

    try:
        result = calculate_emi(
            principal=principal,
            annual_interest_rate=annual_interest_rate,
            tenure_months=tenure_months,
        )

        return jsonify({
            "success": True,
            "message": "EMI calculated successfully",
            "data": result,
        }), 200

    except (ValueError, TypeError) as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to calculate EMI",
        }), 500


@emi_bp.post("/schedule")
def generate_schedule_api():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    principal = data.get("principal")
    annual_interest_rate = data.get(
        "annual_interest_rate"
    )
    tenure_months = data.get("tenure_months")
    start_date = data.get("start_date")

    if principal is None:
        return jsonify({
            "success": False,
            "message": "Loan amount is required",
        }), 400

    if annual_interest_rate is None:
        return jsonify({
            "success": False,
            "message": "Interest rate is required",
        }), 400

    if tenure_months is None:
        return jsonify({
            "success": False,
            "message": "Tenure is required",
        }), 400

    try:
        parsed_start_date = None

        if start_date:
            parsed_start_date = datetime.strptime(
                start_date,
                "%Y-%m-%d",
            ).date()

        schedule = generate_amortization_schedule(
            principal=principal,
            annual_interest_rate=annual_interest_rate,
            tenure_months=tenure_months,
            start_date=parsed_start_date,
        )

        return jsonify({
            "success": True,
            "message": (
                "Amortization schedule "
                "generated successfully"
            ),
            "data": {
                "total_installments": len(
                    schedule
                ),
                "schedule": schedule,
            },
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except (TypeError, AttributeError):
        return jsonify({
            "success": False,
            "message": (
                "Invalid date or loan details"
            ),
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to generate "
                "amortization schedule"
            ),
        }), 500