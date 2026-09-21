import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


class GroqService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError(
                "GROQ_API_KEY is not configured."
            )

        self.client = Groq(
            api_key=api_key
        )

        self.model = os.getenv(
            "GROQ_MODEL",
            "llama-3.3-70b-versatile"
        )

    def generate_response(
        self,
        system_prompt,
        user_prompt,
        temperature=0.2,
        max_tokens=800
    ):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content.strip()


def generate_ai_response(
    system_prompt,
    user_prompt,
    temperature=0.2,
    max_tokens=800
):
    service = GroqService()

    return service.generate_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=temperature,
        max_tokens=max_tokens
    )