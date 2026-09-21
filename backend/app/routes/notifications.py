from flask import Blueprint, jsonify, request
from flask import session

from app.services.notification_service import (
    get_user_notifications,
    get_unread_count,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    delete_notification,
    create_upcoming_emi_notifications,
    create_overdue_emi_notifications,
)


notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications",
)


def get_current_user_id():
    """
    Get the currently logged-in user's ID
    from the Flask session.
    """

    return session.get("user_id")


def notification_to_dict(notification):
    """
    Convert a Notification model object
    into a JSON-friendly dictionary.
    """

    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": (
            notification.notification_type
        ),
        "is_read": notification.is_read,
        "created_at": (
            notification.created_at.isoformat()
            if notification.created_at
            else None
        ),
    }


@notifications_bp.get("")
def get_notifications():
    """
    Get notifications for the logged-in user.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    unread_only = (
        request.args.get(
            "unread_only",
            "false",
        ).lower()
        == "true"
    )

    try:
        notifications = get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
        )

        return jsonify({
            "success": True,
            "data": [
                notification_to_dict(
                    notification
                )
                for notification in notifications
            ],
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to fetch notifications "
                "right now."
            ),
        }), 500


@notifications_bp.get("/unread-count")
def unread_notification_count():
    """
    Get the number of unread notifications
    for the logged-in user.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    try:
        count = get_unread_count(
            user_id
        )

        return jsonify({
            "success": True,
            "data": {
                "unread_count": count,
            },
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to fetch unread "
                "notification count."
            ),
        }), 500


@notifications_bp.patch(
    "/<int:notification_id>/read"
)
def mark_read(notification_id):
    """
    Mark one notification as read.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    try:
        notification = (
            mark_notification_as_read(
                user_id=user_id,
                notification_id=notification_id,
            )
        )

        return jsonify({
            "success": True,
            "message": (
                "Notification marked as read."
            ),
            "data": notification_to_dict(
                notification
            ),
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to update notification."
            ),
        }), 500


@notifications_bp.patch("/read-all")
def mark_all_read():
    """
    Mark all notifications as read.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    try:
        updated_count = (
            mark_all_notifications_as_read(
                user_id
            )
        )

        return jsonify({
            "success": True,
            "message": (
                "All notifications marked as read."
            ),
            "data": {
                "updated_count": updated_count,
            },
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to update notifications."
            ),
        }), 500


@notifications_bp.delete(
    "/<int:notification_id>"
)
def remove_notification(notification_id):
    """
    Delete one notification.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    try:
        delete_notification(
            user_id=user_id,
            notification_id=notification_id,
        )

        return jsonify({
            "success": True,
            "message": "Notification deleted.",
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 404

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to delete notification."
            ),
        }), 500


@notifications_bp.post(
    "/generate-upcoming"
)
def generate_upcoming_notifications():
    """
    Generate reminders for upcoming EMIs.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    data = request.get_json(
        silent=True
    ) or {}

    days_ahead = data.get(
        "days_ahead",
        7,
    )

    try:
        days_ahead = int(days_ahead)

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": (
                "days_ahead must be a valid number."
            ),
        }), 400

    if days_ahead < 1:
        return jsonify({
            "success": False,
            "message": (
                "days_ahead must be at least 1."
            ),
        }), 400

    if days_ahead > 30:
        return jsonify({
            "success": False,
            "message": (
                "days_ahead cannot be greater than 30."
            ),
        }), 400

    try:
        notifications = (
            create_upcoming_emi_notifications(
                user_id=user_id,
                days_ahead=days_ahead,
            )
        )

        return jsonify({
            "success": True,
            "message": (
                "Upcoming EMI notifications generated."
            ),
            "data": [
                notification_to_dict(
                    notification
                )
                for notification in notifications
            ],
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to generate upcoming "
                "EMI notifications."
            ),
        }), 500


@notifications_bp.post(
    "/generate-overdue"
)
def generate_overdue_notifications():
    """
    Generate notifications for overdue EMIs.
    """

    user_id = get_current_user_id()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Authentication required.",
        }), 401

    try:
        notifications = (
            create_overdue_emi_notifications(
                user_id=user_id
            )
        )

        return jsonify({
            "success": True,
            "message": (
                "Overdue EMI notifications generated."
            ),
            "data": [
                notification_to_dict(
                    notification
                )
                for notification in notifications
            ],
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "Unable to generate overdue "
                "EMI notifications."
            ),
        }), 500