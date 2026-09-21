from datetime import datetime

from flask import Blueprint, jsonify, request, session

from app.extensions.db import db
from app.models.emi_schedule import EMISchedule
from app.models.loan import Loan
from app.services.emi_service import (
    calculate_emi,
    generate_amortization_schedule,
)


loan_bp = Blueprint(
    "loan",
    __name__,
    url_prefix="/api/loans",
)


@loan_bp.post("")
def create_loan():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    loan_name = data.get(
        "loan_name",
        "",
    ).strip()

    lender_name = data.get(
        "lender_name",
        "",
    ).strip()

    loan_type = data.get(
        "loan_type",
        "",
    ).strip()

    principal_amount = data.get(
        "principal_amount"
    )

    interest_rate = data.get(
        "interest_rate"
    )

    tenure_months = data.get(
        "tenure_months"
    )

    start_date = data.get(
        "start_date"
    )

    if not loan_name:
        return jsonify({
            "success": False,
            "message": "Loan name is required",
        }), 400

    if not lender_name:
        return jsonify({
            "success": False,
            "message": "Lender name is required",
        }), 400

    if not loan_type:
        return jsonify({
            "success": False,
            "message": "Loan type is required",
        }), 400

    if principal_amount is None:
        return jsonify({
            "success": False,
            "message": "Loan amount is required",
        }), 400

    if interest_rate is None:
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
        principal_amount = float(
            principal_amount
        )

        interest_rate = float(
            interest_rate
        )

        tenure_months = int(
            tenure_months
        )

        if principal_amount <= 0:
            raise ValueError(
                "Loan amount must be greater than 0"
            )

        if interest_rate < 0:
            raise ValueError(
                "Interest rate cannot be negative"
            )

        if tenure_months <= 0:
            raise ValueError(
                "Tenure must be greater than 0"
            )

        parsed_start_date = None

        if start_date:
            parsed_start_date = datetime.strptime(
                start_date,
                "%Y-%m-%d",
            ).date()

        else:
            parsed_start_date = datetime.today().date()

        # Calculate EMI
        emi_result = calculate_emi(
            principal=principal_amount,
            annual_interest_rate=interest_rate,
            tenure_months=tenure_months,
        )

        # Create loan
        loan = Loan(
            user_id=user_id,
            loan_name=loan_name,
            lender_name=lender_name,
            loan_type=loan_type,
            principal_amount=principal_amount,
            interest_rate=interest_rate,
            tenure_months=tenure_months,
            emi_amount=emi_result["monthly_emi"],
            start_date=parsed_start_date,
            status="active",
        )

        db.session.add(loan)

        # Generate EMI schedule
        schedule = generate_amortization_schedule(
            principal=principal_amount,
            annual_interest_rate=interest_rate,
            tenure_months=tenure_months,
            start_date=parsed_start_date,
        )

        # Save every EMI installment
        for installment in schedule:

            emi_schedule = EMISchedule(
                loan=loan,
                installment_number=installment[
                    "installment_number"
                ],
                due_date=datetime.strptime(
                    installment["due_date"],
                    "%Y-%m-%d",
                ).date(),
                emi_amount=installment[
                    "emi_amount"
                ],
                principal_amount=installment[
                    "principal_amount"
                ],
                interest_amount=installment[
                    "interest_amount"
                ],
                remaining_balance=installment[
                    "remaining_balance"
                ],
                status="pending",
            )

            db.session.add(emi_schedule)

        # Save loan + complete EMI schedule together
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Loan and EMI schedule created successfully",
            "data": {
                "id": loan.id,
                "loan_name": loan.loan_name,
                "lender_name": loan.lender_name,
                "loan_type": loan.loan_type,
                "principal_amount": float(
                    loan.principal_amount
                ),
                "interest_rate": float(
                    loan.interest_rate
                ),
                "tenure_months": loan.tenure_months,
                "emi_amount": float(
                    loan.emi_amount
                ),
                "start_date": loan.start_date.isoformat(),
                "status": loan.status,
                "total_installments": len(schedule),
            },
        }), 201

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except Exception:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create loan and EMI schedule",
        }), 500


@loan_bp.get("")
def get_loans():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    loans = Loan.query.filter_by(
        user_id=user_id
    ).order_by(
        Loan.created_at.desc()
    ).all()

    loan_list = []

    for loan in loans:

        loan_list.append({
            "id": loan.id,
            "loan_name": loan.loan_name,
            "lender_name": loan.lender_name,
            "loan_type": loan.loan_type,
            "principal_amount": float(
                loan.principal_amount
            ),
            "interest_rate": float(
                loan.interest_rate
            ),
            "tenure_months": loan.tenure_months,
            "emi_amount": float(
                loan.emi_amount
            ),
            "start_date": (
                loan.start_date.isoformat()
                if loan.start_date
                else None
            ),
            "status": loan.status,
        })

    return jsonify({
        "success": True,
        "data": {
            "total_loans": len(loan_list),
            "loans": loan_list,
        },
    }), 200
@loan_bp.get("/<int:loan_id>/schedule")
def get_loan_schedule(loan_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    loan = Loan.query.get(loan_id)

    if not loan:
        return jsonify({
            "success": False,
            "message": "Loan not found",
        }), 404

    if loan.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "You are not allowed to access this loan",
        }), 403

    schedule = EMISchedule.query.filter_by(
        loan_id=loan_id
    ).order_by(
        EMISchedule.installment_number.asc()
    ).all()

    schedule_list = []

    for emi in schedule:

        schedule_list.append({
            "id": emi.id,
            "installment_number": (
                emi.installment_number
            ),
            "due_date": (
                emi.due_date.isoformat()
            ),
            "emi_amount": float(
                emi.emi_amount
            ),
            "principal_amount": float(
                emi.principal_amount
            ),
            "interest_amount": float(
                emi.interest_amount
            ),
            "remaining_balance": float(
                emi.remaining_balance
            ),
            "status": emi.status,
            "paid_date": (
                emi.paid_date.isoformat()
                if emi.paid_date
                else None
            ),
        })

    return jsonify({
        "success": True,
        "data": {
            "loan_id": loan_id,
            "total_installments": len(
                schedule_list
            ),
            "schedule": schedule_list,
        },
    }), 200