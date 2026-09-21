from datetime import datetime

from flask import Blueprint, jsonify, session

from app.models.emi_schedule import EMISchedule
from app.models.loan import Loan
from app.models.payment import Payment


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard",
)


@dashboard_bp.get("/summary")
def get_dashboard_summary():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    # --------------------------------------------------
    # Get user's loans
    # --------------------------------------------------

    loans = Loan.query.filter_by(
        user_id=user_id
    ).order_by(
        Loan.created_at.desc()
    ).all()

    loan_ids = [
        loan.id
        for loan in loans
    ]

    today = datetime.today().date()

    # --------------------------------------------------
    # No loans
    # --------------------------------------------------

    if not loan_ids:

        return jsonify({
            "success": True,
            "data": {
                "overview": {
                    "total_loans": 0,
                    "active_loans": 0,
                    "total_principal": 0,
                    "outstanding_principal": 0,
                    "monthly_emi": 0,
                    "total_paid": 0,
                    "total_pending": 0,
                    "total_overdue": 0,
                },

                "emi_statistics": {
                    "total_emis": 0,
                    "paid_emis": 0,
                    "pending_emis": 0,
                    "overdue_emis": 0,
                },

                "payment_progress": {
                    "percentage": 0,
                    "paid_emis": 0,
                    "total_emis": 0,
                },

                "chart_data": {
                    "principal": 0,
                    "interest": 0,
                    "paid": 0,
                    "pending": 0,
                    "overdue": 0,
                },

                "upcoming_emi": None,
                "recent_payments": [],
                "loan_overview": [],
                "insights": [],
            },
        }), 200

    # --------------------------------------------------
    # Active loans
    # --------------------------------------------------

    active_loans = [
        loan
        for loan in loans
        if loan.status == "active"
    ]

    total_active_loans = len(
        active_loans
    )

    # --------------------------------------------------
    # Get EMI schedules
    # --------------------------------------------------

    schedules = EMISchedule.query.filter(
        EMISchedule.loan_id.in_(loan_ids)
    ).order_by(
        EMISchedule.due_date.asc()
    ).all()

    # --------------------------------------------------
    # Get payments
    # --------------------------------------------------

    payments = Payment.query.filter(
        Payment.loan_id.in_(loan_ids)
    ).order_by(
        Payment.payment_date.desc(),
        Payment.created_at.desc(),
    ).all()

    # --------------------------------------------------
    # Basic loan calculations
    # --------------------------------------------------

    total_principal = sum(
        float(loan.principal_amount or 0)
        for loan in loans
    )

    monthly_emi = sum(
        float(loan.emi_amount or 0)
        for loan in active_loans
    )

    # --------------------------------------------------
    # EMI calculations
    # --------------------------------------------------

    total_emis = len(schedules)

    paid_emis = 0
    pending_emis = 0
    overdue_emis = 0

    total_pending = 0.0
    total_overdue = 0.0

    outstanding_principal = 0.0

    total_schedule_principal = 0.0
    total_schedule_interest = 0.0

    upcoming_emi = None

    # --------------------------------------------------
    # Process schedules
    # --------------------------------------------------

    for emi in schedules:

        emi_amount = float(
            emi.emi_amount or 0
        )

        principal_amount = float(
            emi.principal_amount or 0
        )

        interest_amount = float(
            emi.interest_amount or 0
        )

        total_schedule_principal += (
            principal_amount
        )

        total_schedule_interest += (
            interest_amount
        )

        # ----------------------------------------------
        # Paid EMI
        # ----------------------------------------------

        if emi.status == "paid":

            paid_emis += 1

        # ----------------------------------------------
        # Overdue EMI
        # ----------------------------------------------

        elif (
            emi.due_date
            and emi.due_date < today
        ):

            overdue_emis += 1

            total_overdue += emi_amount

            outstanding_principal += (
                principal_amount
            )

        # ----------------------------------------------
        # Pending EMI
        # ----------------------------------------------

        else:

            pending_emis += 1

            total_pending += emi_amount

            outstanding_principal += (
                principal_amount
            )

            # ------------------------------------------
            # Nearest upcoming EMI
            # ------------------------------------------

            if upcoming_emi is None:

                upcoming_emi = emi

    # --------------------------------------------------
    # Total payments
    # --------------------------------------------------

    total_paid = sum(
        float(payment.amount or 0)
        for payment in payments
    )

    # --------------------------------------------------
    # Loan lookup
    # --------------------------------------------------

    loan_lookup = {
        loan.id: loan
        for loan in loans
    }

    # --------------------------------------------------
    # Upcoming EMI
    # --------------------------------------------------

    upcoming_emi_data = None

    if upcoming_emi:

        upcoming_loan = loan_lookup.get(
            upcoming_emi.loan_id
        )

        days_until_due = (
            upcoming_emi.due_date - today
        ).days

        upcoming_emi_data = {
            "emi_id": upcoming_emi.id,
            "loan_id": upcoming_emi.loan_id,
            "loan_name": (
                upcoming_loan.loan_name
                if upcoming_loan
                else "Unknown Loan"
            ),
            "installment_number": (
                upcoming_emi.installment_number
            ),
            "due_date": (
                upcoming_emi.due_date.isoformat()
            ),
            "amount": float(
                upcoming_emi.emi_amount
            ),
            "days_until_due": days_until_due,
        }

    # --------------------------------------------------
    # Recent payments
    # --------------------------------------------------

    recent_payments = []

    for payment in payments[:10]:

        payment_loan = loan_lookup.get(
            payment.loan_id
        )

        recent_payments.append({
            "id": payment.id,
            "loan_id": payment.loan_id,
            "loan_name": (
                payment_loan.loan_name
                if payment_loan
                else "Unknown Loan"
            ),
            "amount": float(
                payment.amount or 0
            ),
            "payment_date": (
                payment.payment_date.isoformat()
                if payment.payment_date
                else None
            ),
            "payment_method": (
                payment.payment_method
            ),
            "transaction_reference": (
                payment.transaction_reference
            ),
        })

    # --------------------------------------------------
    # Loan-wise overview
    # --------------------------------------------------

    loan_overview = []

    for loan in loans:

        loan_schedule = [
            emi
            for emi in schedules
            if emi.loan_id == loan.id
        ]

        loan_paid = 0.0
        loan_pending = 0.0
        loan_overdue = 0.0

        loan_outstanding_principal = 0.0

        loan_paid_count = 0
        loan_pending_count = 0
        loan_overdue_count = 0

        loan_principal = 0.0
        loan_interest = 0.0

        for emi in loan_schedule:

            emi_amount = float(
                emi.emi_amount or 0
            )

            principal_amount = float(
                emi.principal_amount or 0
            )

            interest_amount = float(
                emi.interest_amount or 0
            )

            loan_principal += principal_amount
            loan_interest += interest_amount

            if emi.status == "paid":

                loan_paid += emi_amount
                loan_paid_count += 1

            elif (
                emi.due_date
                and emi.due_date < today
            ):

                loan_overdue += emi_amount
                loan_overdue_count += 1

                loan_outstanding_principal += (
                    principal_amount
                )

            else:

                loan_pending += emi_amount
                loan_pending_count += 1

                loan_outstanding_principal += (
                    principal_amount
                )

        loan_overview.append({
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
            "emi_amount": float(
                loan.emi_amount
            ),
            "status": loan.status,

            "paid_emis": loan_paid_count,
            "pending_emis": loan_pending_count,
            "overdue_emis": loan_overdue_count,

            "paid_amount": round(
                loan_paid,
                2,
            ),

            "pending_amount": round(
                loan_pending,
                2,
            ),

            "overdue_amount": round(
                loan_overdue,
                2,
            ),

            "outstanding_principal": round(
                loan_outstanding_principal,
                2,
            ),

            "total_interest": round(
                loan_interest,
                2,
            ),
        })

    # --------------------------------------------------
    # Payment progress
    # --------------------------------------------------

    payment_percentage = 0

    if total_emis > 0:

        payment_percentage = round(
            (
                paid_emis /
                total_emis
            ) * 100,
            1,
        )

    # --------------------------------------------------
    # Financial insights
    # --------------------------------------------------

    insights = []

    if total_active_loans > 0:

        insights.append(
            f"You currently have "
            f"{total_active_loans} active loan"
            f"{'s' if total_active_loans != 1 else ''}."
        )

    if monthly_emi > 0:

        insights.append(
            f"Your combined monthly EMI "
            f"amount is ₹{monthly_emi:,.2f}."
        )

    if overdue_emis > 0:

        insights.append(
            f"You have {overdue_emis} overdue EMI"
            f"{'s' if overdue_emis != 1 else ''} "
            f"totalling ₹{total_overdue:,.2f}."
        )

    elif pending_emis > 0:

        insights.append(
            f"You have {pending_emis} pending EMI"
            f"{'s' if pending_emis != 1 else ''} "
            f"totalling ₹{total_pending:,.2f}."
        )

    if payment_percentage > 0:

        insights.append(
            f"{payment_percentage}% of your "
            f"scheduled EMIs are marked as paid."
        )

    if upcoming_emi_data:

        if upcoming_emi_data["days_until_due"] == 0:

            insights.append(
                "Your next EMI is due today."
            )

        elif upcoming_emi_data["days_until_due"] == 1:

            insights.append(
                "Your next EMI is due tomorrow."
            )

        else:

            insights.append(
                f"Your next EMI is due in "
                f"{upcoming_emi_data['days_until_due']} "
                f"days."
            )

    # --------------------------------------------------
    # Final response
    # --------------------------------------------------

    return jsonify({
        "success": True,

        "data": {

            "overview": {

                "total_loans": len(loans),

                "active_loans": total_active_loans,

                "total_principal": round(
                    total_principal,
                    2,
                ),

                "outstanding_principal": round(
                    outstanding_principal,
                    2,
                ),

                "monthly_emi": round(
                    monthly_emi,
                    2,
                ),

                "total_paid": round(
                    total_paid,
                    2,
                ),

                "total_pending": round(
                    total_pending,
                    2,
                ),

                "total_overdue": round(
                    total_overdue,
                    2,
                ),
            },

            "emi_statistics": {

                "total_emis": total_emis,

                "paid_emis": paid_emis,

                "pending_emis": pending_emis,

                "overdue_emis": overdue_emis,
            },

            "payment_progress": {

                "percentage": payment_percentage,

                "paid_emis": paid_emis,

                "total_emis": total_emis,
            },

            "chart_data": {

                "principal": round(
                    total_schedule_principal,
                    2,
                ),

                "interest": round(
                    total_schedule_interest,
                    2,
                ),

                "paid": round(
                    total_paid,
                    2,
                ),

                "pending": round(
                    total_pending,
                    2,
                ),

                "overdue": round(
                    total_overdue,
                    2,
                ),
            },

            "upcoming_emi": upcoming_emi_data,

            "recent_payments": recent_payments,

            "loan_overview": loan_overview,

            "insights": insights,
        },
    }), 200