from app.services.emi_service import calculate_emi


def validate_loan(loan, index):
    """
    Validate the details provided for one loan.
    """

    required_fields = [
        "name",
        "principal",
        "annual_interest_rate",
        "tenure_months",
    ]

    for field in required_fields:
        if field not in loan:
            raise ValueError(
                f"Loan {index}: {field} is required."
            )

    if not isinstance(loan["name"], str):
        raise ValueError(
            f"Loan {index}: name must be text."
        )

    name = loan["name"].strip()

    if not name:
        raise ValueError(
            f"Loan {index}: name cannot be empty."
        )

    try:
        principal = float(
            loan["principal"]
        )

        annual_interest_rate = float(
            loan["annual_interest_rate"]
        )

        tenure_months = int(
            loan["tenure_months"]
        )

    except (ValueError, TypeError):
        raise ValueError(
            f"Loan {index}: invalid numeric values."
        )

    if principal <= 0:
        raise ValueError(
            f"Loan {index}: principal must be greater than zero."
        )

    if annual_interest_rate < 0:
        raise ValueError(
            f"Loan {index}: interest rate cannot be negative."
        )

    if tenure_months <= 0:
        raise ValueError(
            f"Loan {index}: tenure must be greater than zero."
        )

    return {
        "name": name,
        "principal": principal,
        "annual_interest_rate": annual_interest_rate,
        "tenure_months": tenure_months,
    }


def compare_loans(loans):
    """
    Compare multiple loans based on EMI,
    total repayment, and total interest.
    """

    if not isinstance(loans, list):
        raise ValueError(
            "Loans must be provided as a list."
        )

    if len(loans) < 2:
        raise ValueError(
            "At least two loans are required for comparison."
        )

    if len(loans) > 5:
        raise ValueError(
            "A maximum of five loans can be compared."
        )

    comparison = []

    for index, loan in enumerate(
        loans,
        start=1,
    ):
        validated_loan = validate_loan(
            loan,
            index,
        )

        emi_data = calculate_emi(
            validated_loan["principal"],
            validated_loan["annual_interest_rate"],
            validated_loan["tenure_months"],
        )

        comparison.append({
            "name": validated_loan["name"],
            "principal": round(
                validated_loan["principal"],
                2,
            ),
            "annual_interest_rate": round(
                validated_loan["annual_interest_rate"],
                2,
            ),
            "tenure_months": (
                validated_loan["tenure_months"]
            ),
            "monthly_emi": round(
                emi_data["monthly_emi"],
                2,
            ),
            "total_payment": round(
                emi_data["total_payment"],
                2,
            ),
            "total_interest": round(
                emi_data["total_interest"],
                2,
            ),
        })

    lowest_emi = min(
        comparison,
        key=lambda loan: loan["monthly_emi"],
    )

    lowest_interest = min(
        comparison,
        key=lambda loan: loan["total_interest"],
    )

    lowest_total_payment = min(
        comparison,
        key=lambda loan: loan["total_payment"],
    )

    return {
        "loans": comparison,
        "summary": {
            "lowest_emi_loan": lowest_emi["name"],
            "lowest_emi": lowest_emi["monthly_emi"],
            "lowest_interest_loan": (
                lowest_interest["name"]
            ),
            "lowest_interest": (
                lowest_interest["total_interest"]
            ),
            "lowest_total_payment_loan": (
                lowest_total_payment["name"]
            ),
            "lowest_total_payment": (
                lowest_total_payment["total_payment"]
            ),
        },
    }