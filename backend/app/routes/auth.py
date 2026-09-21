import os
import secrets
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode

from flask import (
    Blueprint,
    jsonify,
    request,
    session,
    redirect,
)

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app.extensions.bcrypt import bcrypt
from app.extensions.db import db
from app.models.user import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


# =========================================================
# HELPERS
# =========================================================

def get_serializer():
    secret_key = os.getenv(
        "SECRET_KEY",
        "development-secret-key",
    )

    return URLSafeTimedSerializer(
        secret_key,
        salt="smartemi-password-reset",
    )


def create_password_reset_token(email):
    serializer = get_serializer()

    return serializer.dumps({
        "email": email,
    })


def read_password_reset_token(token):
    serializer = get_serializer()

    return serializer.loads(
        token,
        max_age=3600,
    )


def send_password_reset_email(
    recipient_email,
    reset_link,
):
    mail_server = os.getenv("MAIL_SERVER")
    mail_port = os.getenv("MAIL_PORT")
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv(
        "MAIL_FROM",
        mail_username,
    )

    if not all([
        mail_server,
        mail_port,
        mail_username,
        mail_password,
        mail_from,
    ]):
        return False

    message = EmailMessage()

    message["Subject"] = "SmartEMI - Password Reset"
    message["From"] = mail_from
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

We received a request to reset your SmartEMI password.

Click the link below to create a new password:

{reset_link}

This link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

Regards,
SmartEMI Team
"""
    )

    try:
        with smtplib.SMTP(
            mail_server,
            int(mail_port),
        ) as server:

            server.starttls()

            server.login(
                mail_username,
                mail_password,
            )

            server.send_message(message)

        return True

    except Exception as error:
        print(
            "PASSWORD RESET EMAIL ERROR:",
            error,
        )

        return False


# =========================================================
# TEST
# =========================================================

@auth_bp.get("/test")
def auth_test():

    return {
        "success": True,
        "message": "Authentication route is working",
    }


# =========================================================
# REGISTER
# =========================================================

@auth_bp.post("/register")
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    full_name = data.get(
        "full_name",
        "",
    ).strip()

    email = data.get(
        "email",
        "",
    ).strip().lower()

    password = data.get(
        "password",
        "",
    )

    if not full_name:
        return jsonify({
            "success": False,
            "message": "Full name is required",
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required",
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required",
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters",
        }), 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "success": False,
            "message": "An account with this email already exists. Please login instead.",
            "account_exists": True,
        }), 409

    password_hash = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")

    user = User(
        full_name=full_name,
        email=email,
        password_hash=password_hash,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },
    }), 201


# =========================================================
# LOGIN
# =========================================================

@auth_bp.post("/login")
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    email = data.get(
        "email",
        "",
    ).strip().lower()

    password = data.get(
        "password",
        "",
    )

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required",
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required",
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({
            "success": False,
            "message": "Invalid email or password",
        }), 401

    if not bcrypt.check_password_hash(
        user.password_hash,
        password,
    ):

        return jsonify({
            "success": False,
            "message": "Invalid email or password",
        }), 401

    session.clear()

    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },
    }), 200


# =========================================================
# CURRENT USER
# =========================================================

@auth_bp.get("/me")
def get_current_user():

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        return jsonify({
            "success": False,
            "message": "Authentication required",
        }), 401

    user = User.query.get(
        user_id
    )

    if not user:

        session.clear()

        return jsonify({
            "success": False,
            "message": "User account not found",
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
        },
    }), 200


# =========================================================
# LOGOUT
# =========================================================

@auth_bp.post("/logout")
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful",
    }), 200


# =========================================================
# FORGOT PASSWORD
# =========================================================

@auth_bp.post("/forgot-password")
def forgot_password():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    email = data.get(
        "email",
        "",
    ).strip().lower()

    if not email:

        return jsonify({
            "success": False,
            "message": "Email is required",
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    # Security:
    # Do not reveal whether an email exists.
    if not user:

        return jsonify({
            "success": True,
            "message": "If an account exists with this email, a password reset link has been sent.",
        }), 200

    token = create_password_reset_token(
        email
    )

    reset_link = (
        "http://localhost:5000/reset-password?"
        + urlencode({
            "token": token,
        })
    )

    email_sent = send_password_reset_email(
        email,
        reset_link,
    )

    if not email_sent:

        print(
            "\n=========================================="
        )
        print(
            "SMARTEMI PASSWORD RESET LINK"
        )
        print(
            "=========================================="
        )
        print(reset_link)
        print(
            "==========================================\n"
        )

    return jsonify({
        "success": True,
        "message": "If an account exists with this email, a password reset link has been sent.",
    }), 200


# =========================================================
# RESET PASSWORD
# =========================================================

@auth_bp.post("/reset-password")
def reset_password():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required",
        }), 400

    token = data.get(
        "token",
        "",
    )

    new_password = data.get(
        "password",
        "",
    )

    if not token:

        return jsonify({
            "success": False,
            "message": "Reset token is required",
        }), 400

    if not new_password:

        return jsonify({
            "success": False,
            "message": "New password is required",
        }), 400

    if len(new_password) < 8:

        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters",
        }), 400

    try:

        token_data = read_password_reset_token(
            token
        )

        email = token_data.get(
            "email"
        )

    except SignatureExpired:

        return jsonify({
            "success": False,
            "message": "This password reset link has expired.",
        }), 400

    except BadSignature:

        return jsonify({
            "success": False,
            "message": "Invalid password reset link.",
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({
            "success": False,
            "message": "User account not found.",
        }), 404

    user.password_hash = (
        bcrypt.generate_password_hash(
            new_password
        ).decode("utf-8")
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Password reset successfully. Please login.",
    }), 200


# =========================================================
# GOOGLE LOGIN
# =========================================================

@auth_bp.get("/google")
def google_login():

    from authlib.integrations.flask_client import OAuth

    client_id = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    client_secret = os.getenv(
        "GOOGLE_CLIENT_SECRET"
    )

    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:5000/api/auth/google/callback",
    )

    if not client_id or not client_secret:

        return jsonify({
            "success": False,
            "message": "Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.",
        }), 503

    oauth = OAuth()

    google = oauth.register(
        name="google",
        client_id=client_id,
        client_secret=client_secret,
        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),
        client_kwargs={
            "scope": "openid email profile",
        },
    )

    return google.authorize_redirect(
        redirect_uri
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@auth_bp.get("/google/callback")
def google_callback():

    from authlib.integrations.flask_client import OAuth

    client_id = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    client_secret = os.getenv(
        "GOOGLE_CLIENT_SECRET"
    )

    frontend_url = "http://localhost:5000"

    if not client_id or not client_secret:

        return redirect(
            frontend_url
            + "/login?google_error=not_configured"
        )

    oauth = OAuth()

    google = oauth.register(
        name="google",
        client_id=client_id,
        client_secret=client_secret,
        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),
        client_kwargs={
            "scope": "openid email profile",
        },
    )

    try:

        token = google.authorize_access_token()

        user_info = token.get(
            "userinfo"
        )

        if not user_info:

            user_info = google.userinfo()

        google_email = user_info.get(
            "email",
            "",
        ).strip().lower()

        google_name = user_info.get(
            "name"
        ) or user_info.get(
            "given_name"
        ) or "SmartEMI User"

        if not google_email:

            return redirect(
                frontend_url
                + "/login?google_error=email_missing"
            )

        user = User.query.filter_by(
            email=google_email
        ).first()

        if not user:

            random_password = secrets.token_urlsafe(
                32
            )

            password_hash = (
                bcrypt.generate_password_hash(
                    random_password
                ).decode("utf-8")
            )

            user = User(
                full_name=google_name,
                email=google_email,
                password_hash=password_hash,
            )

            db.session.add(user)
            db.session.commit()

        session.clear()

        session["user_id"] = user.id

        return redirect(
            frontend_url
            + "/dashboard"
        )

    except Exception as error:

        print(
            "GOOGLE LOGIN ERROR:",
            error,
        )

        return redirect(
            frontend_url
            + "/login?google_error=failed"
        )