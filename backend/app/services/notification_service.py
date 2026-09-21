from datetime import date, timedelta

from app.extensions.db import db
from app.models.notification import Notification
from app.models.emi_schedule import EMISchedule
from app.models.loan import Loan


def create_notification(
    user_id,
    title,
    message,
    notification_type="general",
):
    """
    Create a notification for a user.
    """

    if not user_id:
        raise ValueError(
            "User ID is required."
        )

    if not title or not title.strip():
        raise ValueError(
            "Notification title is required."
        )

    if not message or not message.strip():
        raise ValueError(
            "Notification message is required."
        )

    notification = Notification(
        user_id=user_id,
        title=title.strip(),
        message=message.strip(),
        notification_type=notification_type,
        is_read=False,
    )

    db.session.add(notification)
    db.session.commit()

    return notification


def get_user_notifications(
    user_id,
    unread_only=False,
):
    """
    Get notifications belonging to a user.
    """

    query = Notification.query.filter_by(
        user_id=user_id
    )

    if unread_only:
        query = query.filter_by(
            is_read=False
        )

    notifications = query.order_by(
        Notification.created_at.desc()
    ).all()

    return notifications


def get_unread_count(user_id):
    """
    Get total unread notifications
    for a user.
    """

    return Notification.query.filter_by(
        user_id=user_id,
        is_read=False,
    ).count()


def mark_notification_as_read(
    user_id,
    notification_id,
):
    """
    Mark one notification as read.
    """

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id,
    ).first()

    if not notification:
        raise ValueError(
            "Notification not found."
        )

    notification.is_read = True

    db.session.commit()

    return notification


def mark_all_notifications_as_read(
    user_id,
):
    """
    Mark all notifications of a user
    as read.
    """

    notifications = Notification.query.filter_by(
        user_id=user_id,
        is_read=False,
    ).all()

    for notification in notifications:
        notification.is_read = True

    db.session.commit()

    return len(notifications)


def delete_notification(
    user_id,
    notification_id,
):
    """
    Delete one notification belonging
    to the current user.
    """

    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id,
    ).first()

    if not notification:
        raise ValueError(
            "Notification not found."
        )

    db.session.delete(notification)
    db.session.commit()


def create_upcoming_emi_notifications(
    user_id,
    days_ahead=7,
):
    """
    Create notifications for upcoming EMIs.

    Only pending EMIs within the specified
    number of days are considered.
    """

    if days_ahead < 1:
        days_ahead = 1

    today = date.today()

    target_date = today + timedelta(
        days=days_ahead
    )

    schedules = (
        db.session.query(
            EMISchedule,
            Loan,
        )
        .join(
            Loan,
            EMISchedule.loan_id == Loan.id,
        )
        .filter(
            Loan.user_id == user_id,
            EMISchedule.status == "pending",
            EMISchedule.due_date >= today,
            EMISchedule.due_date <= target_date,
        )
        .order_by(
            EMISchedule.due_date.asc()
        )
        .all()
    )

    created_notifications = []

    for schedule, loan in schedules:

        existing_notification = (
            Notification.query
            .filter_by(
                user_id=user_id,
                notification_type="emi_reminder",
            )
            .filter(
                Notification.message.contains(
                    str(schedule.id)
                )
            )
            .first()
        )

        if existing_notification:
            continue

        title = "Upcoming EMI Reminder"

        message = (
            f"Your EMI of ₹{schedule.emi_amount:.2f} "
            f"for {loan.loan_name} is due on "
            f"{schedule.due_date.strftime('%d %b %Y')}. "
            f"EMI Schedule ID: {schedule.id}"
        )

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="emi_reminder",
            is_read=False,
        )

        db.session.add(notification)

        created_notifications.append(
            notification
        )

    db.session.commit()

    return created_notifications


def create_overdue_emi_notifications(
    user_id,
):
    """
    Create notifications for overdue EMIs.
    """

    today = date.today()

    schedules = (
        db.session.query(
            EMISchedule,
            Loan,
        )
        .join(
            Loan,
            EMISchedule.loan_id == Loan.id,
        )
        .filter(
            Loan.user_id == user_id,
            EMISchedule.status == "pending",
            EMISchedule.due_date < today,
        )
        .order_by(
            EMISchedule.due_date.asc()
        )
        .all()
    )

    created_notifications = []

    for schedule, loan in schedules:

        existing_notification = (
            Notification.query
            .filter_by(
                user_id=user_id,
                notification_type="overdue_emi",
            )
            .filter(
                Notification.message.contains(
                    str(schedule.id)
                )
            )
            .first()
        )

        if existing_notification:
            continue

        title = "Overdue EMI Alert"

        message = (
            f"Your EMI of ₹{schedule.emi_amount:.2f} "
            f"for {loan.loan_name} was due on "
            f"{schedule.due_date.strftime('%d %b %Y')}. "
            f"EMI Schedule ID: {schedule.id}"
        )

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="overdue_emi",
            is_read=False,
        )

        db.session.add(notification)

        created_notifications.append(
            notification
        )

    db.session.commit()

    return created_notifications