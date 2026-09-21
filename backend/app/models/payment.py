from datetime import datetime

from app.extensions.db import db


class Payment(db.Model):
    __tablename__ = "payments"

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

    emi_schedule_id = db.Column(
        db.Integer,
        db.ForeignKey("emi_schedules.id"),
        nullable=True,
        index=True,
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    payment_date = db.Column(
        db.Date,
        nullable=False,
    )

    payment_method = db.Column(
        db.String(50),
        nullable=True,
    )

    transaction_reference = db.Column(
        db.String(100),
        nullable=True,
        unique=True,
    )

    notes = db.Column(
        db.String(500),
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    loan = db.relationship(
        "Loan",
        backref=db.backref("payments", lazy=True),
    )

    emi_schedule = db.relationship(
        "EMISchedule",
        backref=db.backref("payments", lazy=True),
    )

    def __repr__(self):
        return f"<Payment Loan={self.loan_id} Amount={self.amount}>"