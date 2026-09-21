from datetime import datetime
import csv
import io

from flask import Blueprint, jsonify, request, session

from app.models.emi_schedule import EMISchedule
from app.models.loan import Loan
from app.models.payment import Payment


reports_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/api/reports",
)


def get_user_loans(user_id):
    return Loan.query.filter_by(
        user_id=user_id
    ).order_by(
        Loan.created_at.desc()
    ).all()


def parse_report_period():
    period = request.args.get(
        "period",
        "monthly",
    ).lower()

    month = request.args.get("month")
    year = request.args.get("year")

    current_date = datetime.today()

    try:
        parsed_year = (
            int(year)
            if year
            else current_date.year
        )

        if (
            parsed_year < 2000
            or parsed_year > 2100
        ):
            raise ValueError

        if period not in {
            "monthly",
            "yearly",
            "all",
        }:
            raise ValueError

        parsed_month = None

        if period == "monthly":
            parsed_month = (
                int(month)
                if month
                else current_date.month
            )

            if (
                parsed_month < 1
                or parsed_month > 12
            ):
                raise ValueError

        return (
            period,
            parsed_month,
            parsed_year,
        )

    except (ValueError, TypeError):
        return None, None, None


def is_schedule_in_period(
    emi,
    period,
    month,
    year,
):
    if not emi.due_date:
        return False

    if period == "all":
        return True

    if period == "yearly":
        return emi.due_date.year == year

    return (
        emi.due_date.year == year
        and emi.due_date.month == month
    )


def is_payment_in_period(
    payment,
    period,
    month,
    year,
):
    if not payment.payment_date:
        return False

    if period == "all":
        return True

    if period == "yearly":
        return payment.payment_date.year == year

    return (
        payment.payment_date.year == year
        and payment.payment_date.month == month
    )


def get_period_label(
    period,
    month,
    year,
):
    if period == "all":
        return "All Time"

    if period == "yearly":
        return str(year)

    return datetime(
        year,
        month,
        1,
    ).strftime("%B %Y")


@reports_bp.get("/summary")
def get_report_summary():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    (
        period,
        month,
        year,
    ) = parse_report_period()

    if period is None:
        return jsonify({
            "success": False,
            "message": (
                "Invalid report period, month or year"
            ),
        }), 400

    loans = get_user_loans(user_id)

    loan_ids = [
        loan.id
        for loan in loans
    ]

    period_label = get_period_label(
        period,
        month,
        year,
    )

    if not loan_ids:
        return jsonify({
            "success": True,
            "data": {
                "period": {
                    "type": period,
                    "month": month,
                    "year": year,
                    "label": period_label,
                },
                "summary": {
                    "total_loans": 0,
                    "total_emi_scheduled": 0,
                    "total_emi_paid": 0,
                    "total_principal": 0,
                    "total_interest": 0,
                    "total_paid_amount": 0,
                    "total_pending_amount": 0,
                    "total_overdue_amount": 0,
                    "collection_percentage": 0,
                    "principal_percentage": 0,
                    "interest_percentage": 0,
                },
                "loan_reports": [],
                "payment_history": [],
            },
        }), 200

    schedules = EMISchedule.query.filter(
        EMISchedule.loan_id.in_(loan_ids)
    ).all()

    payments = Payment.query.filter(
        Payment.loan_id.in_(loan_ids)
    ).order_by(
        Payment.payment_date.desc(),
        Payment.created_at.desc(),
    ).all()

    today = datetime.today().date()

    period_schedules = [
        emi
        for emi in schedules
        if is_schedule_in_period(
            emi,
            period,
            month,
            year,
        )
    ]

    period_payments = [
        payment
        for payment in payments
        if is_payment_in_period(
            payment,
            period,
            month,
            year,
        )
    ]

    loan_lookup = {
        loan.id: loan
        for loan in loans
    }

    total_emi_scheduled = sum(
        float(emi.emi_amount or 0)
        for emi in period_schedules
    )

    total_emi_paid = sum(
        float(emi.emi_amount or 0)
        for emi in period_schedules
        if emi.status == "paid"
    )

    total_principal = sum(
        float(emi.principal_amount or 0)
        for emi in period_schedules
    )

    total_interest = sum(
        float(emi.interest_amount or 0)
        for emi in period_schedules
    )

    total_paid_amount = sum(
        float(payment.amount or 0)
        for payment in period_payments
    )

    total_pending_amount = sum(
        float(emi.emi_amount or 0)
        for emi in period_schedules
        if (
            emi.status != "paid"
            and emi.due_date >= today
        )
    )

    total_overdue_amount = sum(
        float(emi.emi_amount or 0)
        for emi in period_schedules
        if (
            emi.status != "paid"
            and emi.due_date < today
        )
    )

    collection_percentage = 0

    if total_emi_scheduled > 0:
        collection_percentage = round(
            (
                total_paid_amount
                / total_emi_scheduled
            ) * 100,
            1,
        )

    principal_interest_total = (
        total_principal
        + total_interest
    )

    principal_percentage = 0
    interest_percentage = 0

    if principal_interest_total > 0:
        principal_percentage = round(
            (
                total_principal
                / principal_interest_total
            ) * 100,
            1,
        )

        interest_percentage = round(
            (
                total_interest
                / principal_interest_total
            ) * 100,
            1,
        )

    loan_reports = []

    for loan in loans:
        loan_schedules = [
            emi
            for emi in period_schedules
            if emi.loan_id == loan.id
        ]

        loan_payments = [
            payment
            for payment in period_payments
            if payment.loan_id == loan.id
        ]

        scheduled_amount = sum(
            float(emi.emi_amount or 0)
            for emi in loan_schedules
        )

        paid_amount = sum(
            float(payment.amount or 0)
            for payment in loan_payments
        )

        principal_amount = sum(
            float(emi.principal_amount or 0)
            for emi in loan_schedules
        )

        interest_amount = sum(
            float(emi.interest_amount or 0)
            for emi in loan_schedules
        )

        paid_count = sum(
            1
            for emi in loan_schedules
            if emi.status == "paid"
        )

        pending_count = sum(
            1
            for emi in loan_schedules
            if (
                emi.status != "paid"
                and emi.due_date >= today
            )
        )

        overdue_count = sum(
            1
            for emi in loan_schedules
            if (
                emi.status != "paid"
                and emi.due_date < today
            )
        )

        loan_collection_percentage = 0

        if scheduled_amount > 0:
            loan_collection_percentage = round(
                (
                    paid_amount
                    / scheduled_amount
                ) * 100,
                1,
            )

        loan_reports.append({
            "loan_id": loan.id,
            "loan_name": loan.loan_name,
            "lender_name": loan.lender_name,
            "loan_type": loan.loan_type,
            "emi_amount": float(
                loan.emi_amount or 0
            ),
            "scheduled_amount": round(
                scheduled_amount,
                2,
            ),
            "paid_amount": round(
                paid_amount,
                2,
            ),
            "principal_amount": round(
                principal_amount,
                2,
            ),
            "interest_amount": round(
                interest_amount,
                2,
            ),
            "paid_count": paid_count,
            "pending_count": pending_count,
            "overdue_count": overdue_count,
            "collection_percentage": (
                loan_collection_percentage
            ),
        })

    payment_history = []

    for payment in period_payments:
        loan = loan_lookup.get(
            payment.loan_id
        )

        payment_history.append({
            "id": payment.id,
            "loan_id": payment.loan_id,
            "loan_name": (
                loan.loan_name
                if loan
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
            "notes": payment.notes,
        })

    return jsonify({
        "success": True,
        "data": {
            "period": {
                "type": period,
                "month": month,
                "year": year,
                "label": period_label,
            },
            "summary": {
                "total_loans": len(loans),
                "total_emi_scheduled": round(
                    total_emi_scheduled,
                    2,
                ),
                "total_emi_paid": round(
                    total_emi_paid,
                    2,
                ),
                "total_principal": round(
                    total_principal,
                    2,
                ),
                "total_interest": round(
                    total_interest,
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
                "collection_percentage": (
                    collection_percentage
                ),
                "principal_percentage": (
                    principal_percentage
                ),
                "interest_percentage": (
                    interest_percentage
                ),
            },
            "loan_reports": loan_reports,
            "payment_history": payment_history,
        },
    }), 200


@reports_bp.get("/export")
def export_report_csv():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    (
        period,
        month,
        year,
    ) = parse_report_period()

    if period is None:
        return jsonify({
            "success": False,
            "message": (
                "Invalid report period, month or year"
            ),
        }), 400

    loans = get_user_loans(user_id)

    loan_ids = [
        loan.id
        for loan in loans
    ]

    schedules = EMISchedule.query.filter(
        EMISchedule.loan_id.in_(loan_ids)
    ).all() if loan_ids else []

    payments = Payment.query.filter(
        Payment.loan_id.in_(loan_ids)
    ).order_by(
        Payment.payment_date.desc()
    ).all() if loan_ids else []

    period_schedules = [
        emi
        for emi in schedules
        if is_schedule_in_period(
            emi,
            period,
            month,
            year,
        )
    ]

    period_payments = [
        payment
        for payment in payments
        if is_payment_in_period(
            payment,
            period,
            month,
            year,
        )
    ]

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "SmartEMI Report",
    ])

    writer.writerow([
        "Period",
        get_period_label(
            period,
            month,
            year,
        ),
    ])

    writer.writerow([])

    writer.writerow([
        "Loan Name",
        "Lender",
        "Loan Type",
        "EMI",
        "Scheduled Amount",
        "Paid Amount",
        "Principal",
        "Interest",
        "Paid EMIs",
        "Pending EMIs",
        "Overdue EMIs",
    ])

    loan_lookup = {
        loan.id: loan
        for loan in loans
    }

    today = datetime.today().date()

    for loan in loans:
        loan_schedules = [
            emi
            for emi in period_schedules
            if emi.loan_id == loan.id
        ]

        loan_payments = [
            payment
            for payment in period_payments
            if payment.loan_id == loan.id
        ]

        scheduled_amount = sum(
            float(emi.emi_amount or 0)
            for emi in loan_schedules
        )

        paid_amount = sum(
            float(payment.amount or 0)
            for payment in loan_payments
        )

        paid_count = sum(
            1
            for emi in loan_schedules
            if emi.status == "paid"
        )

        pending_count = sum(
            1
            for emi in loan_schedules
            if (
                emi.status != "paid"
                and emi.due_date >= today
            )
        )

        overdue_count = sum(
            1
            for emi in loan_schedules
            if (
                emi.status != "paid"
                and emi.due_date < today
            )
        )

        principal_amount = sum(
            float(emi.principal_amount or 0)
            for emi in loan_schedules
        )

        interest_amount = sum(
            float(emi.interest_amount or 0)
            for emi in loan_schedules
        )

        writer.writerow([
            loan.loan_name,
            loan.lender_name,
            loan.loan_type,
            float(loan.emi_amount or 0),
            round(scheduled_amount, 2),
            round(paid_amount, 2),
            round(principal_amount, 2),
            round(interest_amount, 2),
            paid_count,
            pending_count,
            overdue_count,
        ])

    writer.writerow([])
    writer.writerow([
        "Payment History",
    ])

    writer.writerow([
        "Date",
        "Loan",
        "Amount",
        "Payment Method",
        "Transaction Reference",
        "Notes",
    ])

    for payment in period_payments:
        loan = loan_lookup.get(
            payment.loan_id
        )

        writer.writerow([
            (
                payment.payment_date.isoformat()
                if payment.payment_date
                else ""
            ),
            (
                loan.loan_name
                if loan
                else "Unknown Loan"
            ),
            float(payment.amount or 0),
            payment.payment_method or "",
            payment.transaction_reference or "",
            payment.notes or "",
        ])

    csv_content = output.getvalue()
    output.close()

    from flask import Response

    return Response(
        csv_content,
        mimetype="text/csv",
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=smartemi_report.csv"
            )
        },
    )
