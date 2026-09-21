from datetime import date

from dateutil.relativedelta import relativedelta


def calculate_emi(
    principal,
    annual_interest_rate,
    tenure_months,
):
    """
    Calculate monthly EMI and related loan values.

    Parameters:
        principal: Loan amount
        annual_interest_rate: Annual interest rate in percentage
        tenure_months: Loan tenure in months

    Returns:
        Dictionary containing EMI details.
    """

    principal = float(principal)
    annual_interest_rate = float(annual_interest_rate)
    tenure_months = int(tenure_months)

    if principal <= 0:
        raise ValueError(
            "Loan amount must be greater than 0"
        )

    if annual_interest_rate < 0:
        raise ValueError(
            "Interest rate cannot be negative"
        )

    if tenure_months <= 0:
        raise ValueError(
            "Tenure must be greater than 0"
        )

    monthly_interest_rate = (
        annual_interest_rate / 12 / 100
    )

    if monthly_interest_rate == 0:
        emi = principal / tenure_months

    else:
        emi = (
            principal
            * monthly_interest_rate
            * (1 + monthly_interest_rate)
            ** tenure_months
        ) / (
            (1 + monthly_interest_rate)
            ** tenure_months - 1
        )

    total_payment = emi * tenure_months

    total_interest = (
        total_payment - principal
    )

    return {
        "principal": round(
            principal,
            2,
        ),
        "annual_interest_rate": round(
            annual_interest_rate,
            2,
        ),
        "tenure_months": tenure_months,
        "monthly_emi": round(
            emi,
            2,
        ),
        "total_payment": round(
            total_payment,
            2,
        ),
        "total_interest": round(
            total_interest,
            2,
        ),
    }


def generate_amortization_schedule(
    principal,
    annual_interest_rate,
    tenure_months,
    start_date=None,
):
    """
    Generate a month-by-month amortization schedule.

    Parameters:
        principal: Loan amount
        annual_interest_rate: Annual interest rate in percentage
        tenure_months: Loan tenure in months
        start_date: Loan start date. Defaults to today.

    Returns:
        List containing every EMI installment.
    """

    principal = float(principal)
    annual_interest_rate = float(
        annual_interest_rate
    )
    tenure_months = int(tenure_months)

    if principal <= 0:
        raise ValueError(
            "Loan amount must be greater than 0"
        )

    if annual_interest_rate < 0:
        raise ValueError(
            "Interest rate cannot be negative"
        )

    if tenure_months <= 0:
        raise ValueError(
            "Tenure must be greater than 0"
        )

    if start_date is None:
        start_date = date.today()

    monthly_interest_rate = (
        annual_interest_rate / 12 / 100
    )

    if monthly_interest_rate == 0:
        emi = principal / tenure_months

    else:
        emi = (
            principal
            * monthly_interest_rate
            * (1 + monthly_interest_rate)
            ** tenure_months
        ) / (
            (1 + monthly_interest_rate)
            ** tenure_months - 1
        )

    remaining_balance = principal

    schedule = []

    for installment_number in range(
        1,
        tenure_months + 1,
    ):
        interest_amount = (
            remaining_balance
            * monthly_interest_rate
        )

        principal_amount = (
            emi - interest_amount
        )

        if installment_number == tenure_months:
            principal_amount = remaining_balance

            emi_amount = (
                principal_amount
                + interest_amount
            )

            remaining_balance = 0

        else:
            emi_amount = emi

            remaining_balance -= (
                principal_amount
            )

        due_date = (
            start_date
            + relativedelta(
                months=installment_number
            )
        )

        schedule.append({
            "installment_number": (
                installment_number
            ),
            "due_date": due_date.isoformat(),
            "emi_amount": round(
                emi_amount,
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
            "remaining_balance": round(
                max(
                    remaining_balance,
                    0,
                ),
                2,
            ),
            "status": "pending",
        })

    return schedule