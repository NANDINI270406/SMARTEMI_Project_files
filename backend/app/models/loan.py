from datetime import date, datetime

from app.extensions.db import db


class Loan(db.Model):
    __tablename__ = "loans"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    loan_name = db.Column(
        db.String(100),
        nullable=False,
    )

    lender_name = db.Column(
        db.String(150),
        nullable=False,
    )

    loan_type = db.Column(
        db.String(50),
        nullable=False,
    )

    principal_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    interest_rate = db.Column(
        db.Numeric(5, 2),
        nullable=False,
    )

    tenure_months = db.Column(
        db.Integer,
        nullable=False,
    )

    emi_amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    start_date = db.Column(
        db.Date,
        nullable=False,
        default=date.today,
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="active",
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = db.relationship(
        "User",
        backref=db.backref("loans", lazy=True),
    )

    def __repr__(self):
        return f"<Loan {self.loan_name}>"