import math

from app.services.emi_service import calculate_emi


def calculate_prepayment(
    principal,
    annual_interest_rate,
    remaining_months,
    prepayment_amount,
):
    """
    Calculate the impact of making a lump-sum
    prepayment on an existing loan.

    The EMI is kept approximately the same,
    while the remaining tenure is reduced.
    """

    if principal <= 0:
        raise ValueError(
            "Outstanding principal must be greater than zero."
        )

    if annual_interest_rate < 0:
        raise ValueError(
            "Interest rate cannot be negative."
        )

    if remaining_months <= 0:
        raise ValueError(
            "Remaining tenure must be greater than zero."
        )

    if prepayment_amount <= 0:
        raise ValueError(
            "Prepayment amount must be greater than zero."
        )

    if prepayment_amount >= principal:
        raise ValueError(
            "Prepayment amount must be less than "
            "the outstanding principal."
        )

    current_emi_data = calculate_emi(
        principal,
        annual_interest_rate,
        remaining_months,
    )

    current_emi = current_emi_data["monthly_emi"]

    current_total_payment = (
        current_emi * remaining_months
    )

    current_remaining_interest = (
        current_total_payment - principal
    )

    new_principal = (
        principal - prepayment_amount
    )

    monthly_rate = (
        annual_interest_rate / 12 / 100
    )

    if monthly_rate == 0:
        new_remaining_months = (
            new_principal / current_emi
        )

    else:
        payment_ratio = (
            new_principal
            * monthly_rate
            / current_emi
        )

        if payment_ratio >= 1:
            raise ValueError(
                "The prepayment is too large for "
                "the current EMI configuration."
            )

        new_remaining_months = (
            -math.log(
                1 - payment_ratio
            )
            / math.log(
                1 + monthly_rate
            )
        )

    new_remaining_months_rounded = max(
        1,
        math.ceil(new_remaining_months),
    )

    new_total_payment = (
        current_emi
        * new_remaining_months_rounded
    )

    new_remaining_interest = max(
        0,
        new_total_payment - new_principal,
    )

    interest_saved = max(
        0,
        current_remaining_interest
        - new_remaining_interest,
    )

    tenure_reduction = max(
        0,
        remaining_months
        - new_remaining_months_rounded,
    )

    return {
        "current_principal": round(
            principal,
            2,
        ),
        "prepayment_amount": round(
            prepayment_amount,
            2,
        ),
        "remaining_principal": round(
            new_principal,
            2,
        ),
        "monthly_emi": round(
            current_emi,
            2,
        ),
        "original_remaining_months": (
            remaining_months
        ),
        "new_remaining_months": (
            new_remaining_months_rounded
        ),
        "tenure_reduction_months": (
            tenure_reduction
        ),
        "current_remaining_interest": round(
            current_remaining_interest,
            2,
        ),
        "new_remaining_interest": round(
            new_remaining_interest,
            2,
        ),
        "interest_saved": round(
            interest_saved,
            2,
        ),
    }