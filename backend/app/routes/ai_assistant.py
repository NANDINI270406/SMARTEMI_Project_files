from flask import Blueprint, jsonify, request

from app.services.ai_assistant_service import (
    create_assistant_response,
)


ai_assistant_bp = Blueprint(
    "ai_assistant",
    __name__,
    url_prefix="/api/ai-assistant",
)


@ai_assistant_bp.post("")
def ask_assistant():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required.",
        }), 400

    question = data.get(
        "question",
        "",
    )

    if not isinstance(question, str):
        return jsonify({
            "success": False,
            "message": "Question must be text.",
        }), 400

    question = question.strip()

    if not question:
        return jsonify({
            "success": False,
            "message": "Question is required.",
        }), 400

    if len(question) > 1000:
        return jsonify({
            "success": False,
            "message": (
                "Question must be less than "
                "1000 characters."
            ),
        }), 400

    try:
        result = create_assistant_response(
            question
        )

        return jsonify({
            "success": True,
            "data": result,
        }), 200

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": (
                "AI Assistant is temporarily "
                "unavailable. Please try again."
            ),
        }), 500