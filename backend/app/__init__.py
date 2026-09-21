import os

from dotenv import load_dotenv
from flask import (
    Flask,
    jsonify,
    send_from_directory,
)
from flask_cors import CORS

from app.extensions.db import db
from app.extensions.bcrypt import bcrypt

from app.routes.auth import auth_bp
from app.routes.emi import emi_bp
from app.routes.loan import loan_bp
from app.routes.payment import payment_bp
from app.routes.dashboard import dashboard_bp
from app.routes.reports import reports_bp
from app.routes.web_search import web_search_bp
from app.routes.ai_assistant import ai_assistant_bp
from app.routes.government_schemes import government_schemes_bp
from app.routes.prepayment import prepayment_bp
from app.routes.loan_comparison import loan_comparison_bp
from app.routes.notifications import notifications_bp


load_dotenv()


def create_app():

    app = Flask(__name__)

    # =========================
    # APPLICATION CONFIGURATION
    # =========================

    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY",
        "development-secret-key",
    )

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "sqlite:///../instance/smartemi.db"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # =========================
    # INITIALIZE EXTENSIONS
    # =========================

    db.init_app(app)
    bcrypt.init_app(app)

    # =========================
    # REGISTER BLUEPRINTS
    # =========================

    app.register_blueprint(auth_bp)

    app.register_blueprint(emi_bp)

    app.register_blueprint(loan_bp)

    app.register_blueprint(payment_bp)

    app.register_blueprint(dashboard_bp)

    app.register_blueprint(reports_bp)

    app.register_blueprint(web_search_bp)

    app.register_blueprint(ai_assistant_bp)

    app.register_blueprint(
        government_schemes_bp
    )

    app.register_blueprint(
        prepayment_bp
    )

    app.register_blueprint(
        loan_comparison_bp
    )

    app.register_blueprint(
        notifications_bp
    )

    # =========================
    # CORS CONFIGURATION
    # =========================

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5000",
                    "http://localhost:5000",
                ]
            }
        },
        supports_credentials=True,
    )

    # =========================
    # API HOME
    # =========================

    @app.get("/api")
    def api_home():
        return {
            "success": True,
            "message": "SmartEMI API is running",
        }

    # =========================
    # HEALTH CHECK
    # =========================

    @app.get("/api/health")
    def health_check():
        return {
            "success": True,
            "service": "SmartEMI API",
            "status": "healthy",
        }

    # =========================
    # REACT FRONTEND PATH
    # =========================

    frontend_dist = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "frontend",
            "dist",
        )
    )

    # =========================
    # SERVE REACT APPLICATION
    # =========================

    @app.route("/")
    def serve_frontend():
        return send_from_directory(
            frontend_dist,
            "index.html",
        )

    # =========================
    # REACT ROUTER SUPPORT
    # =========================

    @app.route(
        "/<path:path>"
    )
    def serve_react_routes(path):

        # Never treat API routes as React routes
        if path.startswith("api/"):
            return jsonify({
                "success": False,
                "message": "API endpoint not found.",
            }), 404

        requested_file = os.path.join(
            frontend_dist,
            path,
        )

        # Serve static frontend files
        # such as JS, CSS, images, etc.
        if os.path.isfile(requested_file):
            return send_from_directory(
                frontend_dist,
                path,
            )

        # React Router routes such as:
        # /dashboard
        # /my-loans
        # /reports
        # /ai-assistant
        # /government-schemes
        # /prepayment
        # /loan-comparison
        # /notifications

        return send_from_directory(
            frontend_dist,
            "index.html",
        )

    return app