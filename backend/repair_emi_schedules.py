from datetime import datetime

from app import create_app
from app.extensions.db import db
from app.models.loan import Loan
from app.models.emi_schedule import EMISchedule
from app.services.emi_service import generate_amortization_schedule


app = create_app()


with app.app_context():

    loans = Loan.query.order_by(Loan.id.asc()).all()

    repaired_count = 0

    print("\n========================================")
    print("SMARTEMI EMI SCHEDULE REPAIR")
    print("========================================\n")

    for loan in loans:

        existing_count = EMISchedule.query.filter_by(
            loan_id=loan.id
        ).count()

        print(
            f"Loan ID {loan.id} | "
            f"{loan.loan_name} | "
            f"Existing schedules: {existing_count}"
        )

        # Do not touch loans that already have schedules
        if existing_count > 0:
            print("  -> Already has schedule. Skipping.\n")
            continue

        print("  -> Schedule missing. Generating...")

        try:
            schedule = generate_amortization_schedule(
                principal=float(loan.principal_amount),
                annual_interest_rate=float(loan.interest_rate),
                tenure_months=int(loan.tenure_months),
                start_date=loan.start_date,
            )

            for installment in schedule:

                emi_schedule = EMISchedule(
                    loan_id=loan.id,
                    installment_number=installment[
                        "installment_number"
                    ],
                    due_date=datetime.strptime(
                        installment["due_date"],
                        "%Y-%m-%d",
                    ).date(),
                    emi_amount=installment["emi_amount"],
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

            db.session.commit()

            repaired_count += 1

            print(
                f"  -> SUCCESS: "
                f"{len(schedule)} EMI installments created.\n"
            )

        except Exception as error:

            db.session.rollback()

            print(
                f"  -> ERROR: {error}\n"
            )


    print("========================================")
    print(
        f"Repair completed. "
        f"Loans repaired: {repaired_count}"
    )
    print("========================================\n")


    print("--- FINAL SCHEDULE COUNTS ---")

    for loan in Loan.query.order_by(Loan.id.asc()).all():

        count = EMISchedule.query.filter_by(
            loan_id=loan.id
        ).count()

        print(
            f"Loan ID: {loan.id} | "
            f"Name: {loan.loan_name} | "
            f"Schedule Count: {count}"
        )

    print()