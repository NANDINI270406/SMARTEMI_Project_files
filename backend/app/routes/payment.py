from datetime import datetime

from flask import Blueprint, jsonify, request, session

from app.extensions.db import db
from app.models.emi_schedule import EMISchedule
from app.models.loan import Loan
from app.models.payment import Payment


payment_bp = Blueprint(
    "payment",
    __name__,
    url_prefix="/api/payments",
)


# ---------------------------------------------------------
# Helper: Validate payment date
# ---------------------------------------------------------

def parse_payment_date(payment_date):
    if not payment_date:
        return datetime.today().date()

    try:
        parsed_date = datetime.strptime(
            payment_date,
            "%Y-%m-%d",
        ).date()
    except ValueError:
        raise ValueError(
            "Payment date must be in YYYY-MM-DD format"
        )

    today = datetime.today().date()

    if parsed_date > today:
        raise ValueError(
            "Payment date cannot be in the future"
        )

    return parsed_date


# ---------------------------------------------------------
# Helper: Validate payment method
# ---------------------------------------------------------

def validate_payment_method(payment_method):
    if not payment_method:
        return None

    allowed_methods = {
        "UPI",
        "Bank Transfer",
        "Debit Card",
        "Credit Card",
        "Cash",
        "Auto Debit",
        "Manual",
        "Other",
    }

    if payment_method not in allowed_methods:
        raise ValueError(
            "Invalid payment method"
        )

    return payment_method


# ---------------------------------------------------------
# Mark EMI as Paid
# ---------------------------------------------------------

@payment_bp.post("/mark-paid")
def mark_emi_paid():

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

    emi_schedule_id = data.get(
        "emi_schedule_id"
    )

    payment_date = data.get(
        "payment_date"
    )

    payment_method = data.get(
        "payment_method"
    )

    transaction_reference = data.get(
        "transaction_reference"
    )

    notes = data.get(
        "notes"
    )

    # -----------------------------------------------------
    # Required EMI ID
    # -----------------------------------------------------

    if emi_schedule_id is None:
        return jsonify({
            "success": False,
            "message": "EMI schedule ID is required",
        }), 400

    try:

        # -------------------------------------------------
        # Validate EMI ID
        # -------------------------------------------------

        try:
            emi_schedule_id = int(
                emi_schedule_id
            )
        except (ValueError, TypeError):
            raise ValueError(
                "Invalid EMI schedule ID"
            )

        # -------------------------------------------------
        # Find EMI
        # -------------------------------------------------

        emi = EMISchedule.query.get(
            emi_schedule_id
        )

        if not emi:
            return jsonify({
                "success": False,
                "message": "EMI schedule not found",
            }), 404

        # -------------------------------------------------
        # Find Loan
        # -------------------------------------------------

        loan = Loan.query.get(
            emi.loan_id
        )

        if not loan:
            return jsonify({
                "success": False,
                "message": "Loan not found",
            }), 404

        # -------------------------------------------------
        # User ownership check
        # -------------------------------------------------

        if loan.user_id != user_id:
            return jsonify({
                "success": False,
                "message": (
                    "You are not allowed to access this EMI"
                ),
            }), 403

        # -------------------------------------------------
        # Duplicate EMI payment protection
        # -------------------------------------------------

        if emi.status == "paid":
            return jsonify({
                "success": False,
                "message": (
                    "This EMI is already marked as paid"
                ),
            }), 409

        # -------------------------------------------------
        # Validate payment date
        # -------------------------------------------------

        parsed_payment_date = parse_payment_date(
            payment_date
        )

        # -------------------------------------------------
        # Validate payment method
        # -------------------------------------------------

        validated_payment_method = (
            validate_payment_method(
                payment_method
            )
        )

        # -------------------------------------------------
        # Clean transaction reference
        # -------------------------------------------------

        if transaction_reference:

            transaction_reference = (
                transaction_reference.strip()
            )

            if len(transaction_reference) > 100:
                raise ValueError(
                    "Transaction reference cannot exceed 100 characters"
                )

            # ---------------------------------------------
            # Duplicate transaction protection
            # ---------------------------------------------

            existing_payment = Payment.query.filter_by(
                transaction_reference=transaction_reference
            ).first()

            if existing_payment:
                return jsonify({
                    "success": False,
                    "message": (
                        "This transaction reference "
                        "has already been used"
                    ),
                }), 409

        else:
            transaction_reference = None

        # -------------------------------------------------
        # Validate notes
        # -------------------------------------------------

        if notes:

            notes = notes.strip()

            if len(notes) > 500:
                raise ValueError(
                    "Notes cannot exceed 500 characters"
                )

        # -------------------------------------------------
        # IMPORTANT:
        # Amount always comes from backend EMI record.
        # Never trust amount sent by frontend.
        # -------------------------------------------------

        payment_amount = emi.emi_amount

        # -------------------------------------------------
        # Create payment record
        # -------------------------------------------------

        payment = Payment(
            loan_id=loan.id,
            emi_schedule_id=emi.id,
            amount=payment_amount,
            payment_date=parsed_payment_date,
            payment_method=validated_payment_method,
            transaction_reference=transaction_reference,
            notes=notes,
        )

        # -------------------------------------------------
        # Update EMI status
        # -------------------------------------------------

        emi.status = "paid"
        emi.paid_date = parsed_payment_date

        db.session.add(payment)

        db.session.commit()

        # -------------------------------------------------
        # Success response
        # -------------------------------------------------

        return jsonify({
            "success": True,
            "message": (
                "EMI marked as paid successfully"
            ),
            "data": {
                "payment_id": payment.id,
                "emi_schedule_id": emi.id,
                "loan_id": loan.id,
                "installment_number": (
                    emi.installment_number
                ),
                "amount": float(
                    payment.amount
                ),
                "payment_date": (
                    payment.payment_date.isoformat()
                ),
                "payment_method": (
                    payment.payment_method
                ),
                "transaction_reference": (
                    payment.transaction_reference
                ),
                "status": emi.status,
            },
        }), 200

    except ValueError as error:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except Exception as error:

        db.session.rollback()

        print(
            "MARK EMI PAID ERROR:",
            str(error),
        )

        return jsonify({
            "success": False,
            "message": (
                "Unable to mark EMI as paid"
            ),
        }), 500


# ---------------------------------------------------------
# Get Payment History for Loan
# ---------------------------------------------------------

@payment_bp.get(
    "/loan/<int:loan_id>"
)
def get_loan_payments(loan_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    loan = Loan.query.get(
        loan_id
    )

    if not loan:
        return jsonify({
            "success": False,
            "message": "Loan not found",
        }), 404

    # -----------------------------------------------------
    # User ownership check
    # -----------------------------------------------------

    if loan.user_id != user_id:
        return jsonify({
            "success": False,
            "message": (
                "You are not allowed to access this loan"
            ),
        }), 403

    payments = Payment.query.filter_by(
        loan_id=loan_id
    ).order_by(
        Payment.payment_date.desc(),
        Payment.created_at.desc(),
    ).all()

    payment_list = []

    for payment in payments:

        payment_list.append({
            "id": payment.id,
            "emi_schedule_id": (
                payment.emi_schedule_id
            ),
            "amount": float(
                payment.amount
            ),
            "payment_date": (
                payment.payment_date.isoformat()
            ),
            "payment_method": (
                payment.payment_method
            ),
            "transaction_reference": (
                payment.transaction_reference
            ),
            "notes": payment.notes,
        })

    return jsonify({
        "success": True,
        "data": {
            "loan_id": loan_id,
            "total_payments": len(
                payment_list
            ),
            "payments": payment_list,
        },
    }), 200


# ---------------------------------------------------------
# Payment Summary
# ---------------------------------------------------------

@payment_bp.get(
    "/loan/<int:loan_id>/summary"
)
def get_payment_summary(loan_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    loan = Loan.query.get(
        loan_id
    )

    if not loan:
        return jsonify({
            "success": False,
            "message": "Loan not found",
        }), 404

    # -----------------------------------------------------
    # User ownership check
    # -----------------------------------------------------

    if loan.user_id != user_id:
        return jsonify({
            "success": False,
            "message": (
                "You are not allowed to access this loan"
            ),
        }), 403

    schedule = EMISchedule.query.filter_by(
        loan_id=loan_id
    ).order_by(
        EMISchedule.installment_number.asc()
    ).all()

    payments = Payment.query.filter_by(
        loan_id=loan_id
    ).all()

    today = datetime.today().date()

    total_emis = len(schedule)

    paid_emis = 0
    pending_emis = 0
    overdue_emis = 0

    total_scheduled_amount = 0.0
    total_paid_amount = 0.0
    total_pending_amount = 0.0
    total_overdue_amount = 0.0

    # -----------------------------------------------------
    # Calculate EMI status
    # -----------------------------------------------------

    for emi in schedule:

        emi_amount = float(
            emi.emi_amount or 0
        )

        total_scheduled_amount += emi_amount

        if emi.status == "paid":

            paid_emis += 1

        elif (
            emi.due_date
            and emi.due_date < today
        ):

            overdue_emis += 1

            total_overdue_amount += (
                emi_amount
            )

        else:

            pending_emis += 1

            total_pending_amount += (
                emi_amount
            )

    # -----------------------------------------------------
    # Calculate actual payments
    # -----------------------------------------------------

    for payment in payments:

        total_paid_amount += float(
            payment.amount or 0
        )

    # -----------------------------------------------------
    # Payment Summary Response
    # -----------------------------------------------------

    return jsonify({
        "success": True,
        "data": {
            "loan_id": loan_id,

            "total_emis": total_emis,

            "paid_emis": paid_emis,

            "pending_emis": pending_emis,

            "overdue_emis": overdue_emis,

            "total_scheduled_amount": round(
                total_scheduled_amount,
                2,
            ),

            "total_paid_amount": round(
                total_paid_amount,
                2,
            ),

            "total_pending_amount": round(
                total_pending_amount,
                2,
            ),

            "total_overdue_amount": round(
                total_overdue_amount,
                2,
            ),
        },
    }), 200