from datetime import datetime

from app.extensions.db import db


class EMISchedule(db.Model):
    __tablename__ = "emi_schedules"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    loan_id = db.Column(
        db.Integer,
        db.ForeignKey("loans.id"),
        nullable=False,
        index=True,
    )

    installment_number = db.Column(
        db.Integer,
        nullable=False,
    )

    due_date = db.Column(
        db.Date,
        nullable=False,
    )

    emi_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    principal_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    interest_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    remaining_balance = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending",
    )

    paid_date = db.Column(
        db.Date,
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    loan = db.relationship(
        "Loan",
        backref=db.backref("emi_schedules", lazy=True),
    )

    def __repr__(self):
        return (
            f"<EMISchedule Loan={self.loan_id} "
            f"Installment={self.installment_number}>"
        )