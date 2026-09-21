from decimal import Decimal

from flask import session

from app.models.loan import Loan
from app.models.emi_schedule import EMISchedule
from app.services.tavily_service import search_web
from app.services.groq_service import generate_ai_response


def needs_web_search(question):
    """
    Decide whether the question requires
    current or external web information.
    """

    web_keywords = [
        "current",
        "latest",
        "today",
        "recent",
        "2026",
        "current rate",
        "interest rate",
        "interest rates",
        "home loan rate",
        "home loan rates",
        "loan rate",
        "loan rates",
        "bank rate",
        "bank rates",
        "government scheme",
        "government schemes",
        "government loan",
        "subsidy",
        "new scheme",
        "updated",
        "update",
        "news",
        "eligibility",
        "offer",
        "offers",
        "rates in india",
        "available in india",
    ]

    question_lower = question.lower()

    return any(
        keyword in question_lower
        for keyword in web_keywords
    )


def _money(value):
    """
    Convert Decimal/database values to float.
    """

    if value is None:
        return 0.0

    return float(
        Decimal(str(value))
    )


def _get_user_id():
    """
    Get the currently logged-in user's ID.
    """

    return session.get("user_id")


def _get_user_loans():
    """
    Get loans belonging to the logged-in user.
    """

    user_id = _get_user_id()

    if not user_id:
        return []

    return (
        Loan.query
        .filter_by(user_id=user_id)
        .order_by(Loan.created_at.desc())
        .all()
    )


def _get_user_financial_summary():
    """
    Build a financial summary from the user's
    SmartEMI database records.
    """

    loans = _get_user_loans()

    if not loans:
        return {
            "loan_count": 0,
            "active_loans": 0,
            "total_principal": 0.0,
            "monthly_emi": 0.0,
            "total_outstanding": 0.0,
            "paid_emis": 0,
            "pending_emis": 0,
            "overdue_emis": 0,
        }

    total_principal = 0.0
    monthly_emi = 0.0
    total_outstanding = 0.0

    active_loans = 0
    paid_emis = 0
    pending_emis = 0
    overdue_emis = 0

    for loan in loans:

        total_principal += _money(
            loan.principal_amount
        )

        if str(loan.status).lower() == "active":

            active_loans += 1

            monthly_emi += _money(
                loan.emi_amount
            )

        schedules = (
            EMISchedule.query
            .filter_by(loan_id=loan.id)
            .all()
        )

        for emi in schedules:

            status = str(
                emi.status
            ).lower()

            if status == "paid":
                paid_emis += 1

            elif status == "overdue":
                overdue_emis += 1

            else:
                pending_emis += 1

        latest_schedule = (
            EMISchedule.query
            .filter_by(loan_id=loan.id)
            .order_by(
                EMISchedule.installment_number.desc()
            )
            .first()
        )

        if latest_schedule:

            total_outstanding += _money(
                latest_schedule.remaining_balance
            )

        else:

            total_outstanding += _money(
                loan.principal_amount
            )

    return {
        "loan_count": len(loans),
        "active_loans": active_loans,
        "total_principal": total_principal,
        "monthly_emi": monthly_emi,
        "total_outstanding": total_outstanding,
        "paid_emis": paid_emis,
        "pending_emis": pending_emis,
        "overdue_emis": overdue_emis,
    }


def _format_money(value):
    """
    Format Indian currency for assistant responses.
    """

    return f"₹{value:,.2f}"


def _is_user_data_question(question):
    """
    Detect questions referring to the user's
    own SmartEMI data.
    """

    question_lower = question.lower()

    user_keywords = [
        "my loan",
        "my loans",
        "my emi",
        "my emis",
        "my payment",
        "my payments",
        "my outstanding",
        "my balance",
        "my repayment",
        "my account",
        "my loan details",
        "how many loans",
        "how many loan",
        "monthly emi",
        "total emi",
        "pending emi",
        "paid emi",
        "overdue emi",
        "outstanding amount",
        "outstanding balance",
        "how much do i owe",
    ]

    return any(
        keyword in question_lower
        for keyword in user_keywords
    )


def _get_user_context():
    """
    Create a concise context string containing
    the logged-in user's SmartEMI information.
    """

    summary = _get_user_financial_summary()

    if summary["loan_count"] == 0:

        return (
            "The logged-in SmartEMI user currently has "
            "no loans stored in the database."
        )

    return (
        f"Number of loans: {summary['loan_count']}\n"
        f"Active loans: {summary['active_loans']}\n"
        f"Total principal: "
        f"{_format_money(summary['total_principal'])}\n"
        f"Combined monthly EMI: "
        f"{_format_money(summary['monthly_emi'])}\n"
        f"Recorded outstanding balance: "
        f"{_format_money(summary['total_outstanding'])}\n"
        f"Paid EMI installments: {summary['paid_emis']}\n"
        f"Pending EMI installments: {summary['pending_emis']}\n"
        f"Overdue EMI installments: {summary['overdue_emis']}"
    )


def _answer_user_data_question(question):
    """
    Provide a deterministic answer for simple
    user-specific SmartEMI data questions.

    More complex questions can be handled by Groq.
    """

    summary = _get_user_financial_summary()

    if summary["loan_count"] == 0:

        return (
            "I could not find any loans in your "
            "SmartEMI account yet. You can add a loan "
            "from the My Loans section."
        )

    question_lower = question.lower()

    if (
        "how many loans" in question_lower
        or "how many loan" in question_lower
        or "my loans" in question_lower
    ):

        return (
            f"You currently have "
            f"{summary['loan_count']} loan(s) "
            f"in SmartEMI, including "
            f"{summary['active_loans']} active loan(s)."
        )

    if (
        "monthly emi" in question_lower
        or "my emi" in question_lower
        or "total emi" in question_lower
    ):

        return (
            f"Based on your active loans, your "
            f"combined monthly EMI is approximately "
            f"{_format_money(summary['monthly_emi'])}."
        )

    if (
        "outstanding" in question_lower
        or "how much do i owe" in question_lower
        or "outstanding balance" in question_lower
    ):

        return (
            f"Based on the repayment schedules stored "
            f"in SmartEMI, your recorded outstanding "
            f"balance is approximately "
            f"{_format_money(summary['total_outstanding'])}."
        )

    if "paid emi" in question_lower:

        return (
            f"You have {summary['paid_emis']} "
            f"paid EMI installment(s) recorded "
            f"in SmartEMI."
        )

    if "pending emi" in question_lower:

        return (
            f"You currently have "
            f"{summary['pending_emis']} pending "
            f"EMI installment(s) recorded "
            f"in SmartEMI."
        )

    if "overdue emi" in question_lower:

        return (
            f"You currently have "
            f"{summary['overdue_emis']} overdue "
            f"EMI installment(s) recorded "
            f"in SmartEMI."
        )

    return None


def _answer_common_question(question):
    """
    Provide deterministic answers for basic EMI
    concepts. More natural/general questions are
    handled by Groq.
    """

    q = question.lower()

    if "what is emi" in q or "meaning of emi" in q:

        return (
            "EMI stands for Equated Monthly Installment. "
            "It is the amount a borrower generally pays "
            "each month toward a loan. An EMI usually "
            "contains both principal and interest."
        )

    if (
        "what is amortization" in q
        or "meaning of amortization" in q
    ):

        return (
            "An amortization schedule shows how a loan "
            "is repaid over time. Each EMI is divided "
            "into principal and interest components, "
            "while the outstanding balance gradually "
            "decreases."
        )

    if (
        "what is principal" in q
        or "principal amount" in q
    ):

        return (
            "Principal is the original amount borrowed "
            "from the lender. A part of each EMI normally "
            "goes toward reducing the principal."
        )

    if "what is interest" in q:

        return (
            "Interest is the cost charged by the lender "
            "for providing the loan. It is generally "
            "calculated using the applicable interest "
            "rate and outstanding principal."
        )

    if (
        "what is loan tenure" in q
        or "what is tenure" in q
    ):

        return (
            "Loan tenure is the period over which a loan "
            "is scheduled to be repaid. A longer tenure "
            "can reduce the monthly EMI but may increase "
            "the total interest paid."
        )

    if "what is prepayment" in q:

        return (
            "Loan prepayment means paying an additional "
            "amount toward the outstanding principal "
            "before the scheduled end of the loan. "
            "Depending on the loan terms, this can reduce "
            "future interest and repayment time."
        )

    return None


def _build_web_context(web_data):
    """
    Convert Tavily results into context for Groq.
    """

    results = web_data.get(
        "results",
        []
    )

    if not results:
        return "No useful web results were returned."

    context_parts = []

    for index, result in enumerate(
        results[:5],
        start=1
    ):

        title = result.get(
            "title",
            ""
        ).strip()

        url = result.get(
            "url",
            ""
        ).strip()

        content = result.get(
            "content",
            ""
        ).strip()

        if len(content) > 1200:
            content = (
                content[:1200].rstrip()
                + "..."
            )

        context_parts.append(
            f"Source {index}:\n"
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content: {content}"
        )

    return "\n\n".join(
        context_parts
    )


def _build_web_results(web_data):
    """
    Keep Tavily results available for the frontend.
    """

    results = web_data.get(
        "results",
        []
    )

    normalized = []

    for result in results:

        normalized.append({
            "title": result.get(
                "title",
                ""
            ),
            "url": result.get(
                "url",
                ""
            ),
            "content": result.get(
                "content",
                ""
            ),
            "score": result.get(
                "score",
                0
            ),
        })

    return normalized


def _generate_groq_answer(
    question,
    web_context="",
    user_context=""
):
    """
    Generate the final natural-language answer
    using Groq.
    """

    system_prompt = """
You are SmartEMI AI Assistant, an AI assistant
inside a professional loan and EMI management
application.

Your job is to provide clear, accurate and useful
answers about:

- EMI
- loans
- interest
- principal
- loan tenure
- amortization
- repayment
- prepayment
- loan comparison
- financial planning concepts
- SmartEMI features

Important rules:

1. Answer the user's actual question directly.
2. Do not give a generic response.
3. Use SmartEMI user data when it is provided.
4. Use web information only when it is provided
   in the web context.
5. Do not invent current interest rates,
   government schemes, eligibility rules,
   financial figures or other current facts.
6. If web sources are provided, base current
   factual claims on those sources.
7. If the question is general, answer using
   your financial knowledge.
8. Keep answers understandable for a normal
   SmartEMI user.
9. Use Indian Rupee formatting when discussing
   Indian financial amounts.
10. Do not claim that you accessed information
    that was not provided to you.
11. This is an informational assistant, not a
    substitute for professional financial advice.
12. If the question involves an important financial
    decision, mention relevant assumptions or
    advise checking the lender's official terms
    where appropriate.

Return only the final answer to the user.
"""

    user_prompt = (
        f"USER QUESTION:\n{question}\n\n"
    )

    if user_context:

        user_prompt += (
            "SMARTEMI USER DATA:\n"
            f"{user_context}\n\n"
        )

    if web_context:

        user_prompt += (
            "CURRENT WEB INFORMATION FROM TAVILY:\n"
            f"{web_context}\n\n"
        )

    user_prompt += (
        "Now answer the user's question using "
        "the available information."
    )

    return generate_ai_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=0.2,
        max_tokens=800,
    )


def create_assistant_response(question):
    """
    Main SmartEMI Assistant response engine.

    Flow:

    1. Detect whether current web information
       is required.
    2. Retrieve current information using Tavily.
    3. Retrieve logged-in user's SmartEMI data.
       when relevant.
    4. Send available context to Groq.
    5. Groq generates the final response.
    6. Use deterministic fallback if Groq
       is temporarily unavailable.
    """

    if not question or not question.strip():

        raise ValueError(
            "Question is required."
        )

    question = question.strip()

    use_web = needs_web_search(
        question
    )

    user_context = ""

    if (
        _is_user_data_question(question)
        or not use_web
    ):

        user_context = _get_user_context()

    web_data = {
        "results": [],
        "total_results": 0,
    }

    web_context = ""

    # -------------------------------------------------
    # 1. Tavily current information
    # -------------------------------------------------

    if use_web:

        try:

            web_data = search_web(
                query=question,
                max_results=5,
            )

            web_context = _build_web_context(
                web_data
            )

        except Exception as error:

            print(
                "TAVILY ASSISTANT ERROR:",
                str(error)
            )

            web_data = {
                "results": [],
                "total_results": 0,
            }

            web_context = (
                "Tavily web search was unavailable "
                "for this request."
            )

    # -------------------------------------------------
    # 2. Groq AI response
    # -------------------------------------------------

    try:

        ai_answer = _generate_groq_answer(
            question=question,
            web_context=web_context,
            user_context=user_context,
        )

        if not ai_answer:

            raise ValueError(
                "Groq returned an empty response."
            )

        if use_web and web_data.get("results"):

            source_type = "smartemi+web"

        elif user_context:

            source_type = "smartemi"

        else:

            source_type = "groq"

        return {
            "question": question,
            "source_type": source_type,
            "message": ai_answer,
            "web_results": _build_web_results(
                web_data
            ),
            "total_results": web_data.get(
                "total_results",
                0
            ),
        }

    except Exception as error:

        print(
            "GROQ ASSISTANT ERROR:",
            str(error)
        )

        # -------------------------------------------------
        # 3. Fallback to SmartEMI deterministic answers
        # -------------------------------------------------

        if _is_user_data_question(question):

            fallback = _answer_user_data_question(
                question
            )

            if fallback:

                return {
                    "question": question,
                    "source_type": "smartemi-fallback",
                    "message": fallback,
                    "web_results": _build_web_results(
                        web_data
                    ),
                    "total_results": web_data.get(
                        "total_results",
                        0
                    ),
                }

        common_answer = _answer_common_question(
            question
        )

        if common_answer:

            return {
                "question": question,
                "source_type": "smartemi-fallback",
                "message": common_answer,
                "web_results": _build_web_results(
                    web_data
                ),
                "total_results": web_data.get(
                    "total_results",
                    0
                ),
            }

        if use_web and web_data.get("results"):

            return {
                "question": question,
                "source_type": "web-fallback",
                "message": (
                    "I found relevant current information "
                    "using Tavily, but the AI response "
                    "generation service is temporarily "
                    "unavailable. Please review the "
                    "retrieved sources below."
                ),
                "web_results": _build_web_results(
                    web_data
                ),
                "total_results": web_data.get(
                    "total_results",
                    0
                ),
            }

        return {
            "question": question,
            "source_type": "assistant-fallback",
            "message": (
                "The AI Assistant is temporarily "
                "unable to generate a response. "
                "Please try again in a moment."
            ),
            "web_results": [],
            "total_results": 0,
        }