import httpx
from app.core.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Primary and fallback models from OpenRouter
MODELS = [
    "google/gemma-3-12b-it:free",
    "stepfun/step-3.5-flash:free",
    "openai/gpt-oss-120b:free",
]


async def rewrite_bullet(original_bullet: str, keyword: str, jd_context: str = "") -> str:
    """
    Use OpenRouter (Gemini/Llama) to rewrite a resume bullet point
    incorporating a missing keyword using the STAR method.
    """
    if not settings.OPENROUTER_API_KEY or settings.OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return (
            f"{original_bullet} — leveraging {keyword} to drive measurable results. "
            "(Note: Set OPENROUTER_API_KEY in .env for AI-powered rewrites.)"
        )

    prompt = f"""You are an expert resume writer specializing in ATS optimization.

I have a resume bullet point: "{original_bullet}"

I need to naturally incorporate the keyword "{keyword}" to match a job description.

{"Job description context: " + jd_context if jd_context else ""}

Rewrite this into a single, high-impact, STAR-method bullet point that:
1. Naturally includes the keyword "{keyword}"
2. Starts with a strong action verb
3. Includes a quantifiable achievement or metric
4. Sounds professional and authentic (not keyword-stuffed)
5. Is concise (under 30 words)

Return ONLY the rewritten bullet point, nothing else."""

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model_name in MODELS:
            try:
                response = await client.post(
                    url=OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://github.com/AryanBagane/Refactor-AI",
                        "X-Title": "Refactor AI",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    logger.debug(f"OpenRouter Raw Response: {data}")
                    
                    if not data.get("choices") or not data["choices"][0].get("message"):
                        logger.error(f"OpenRouter returned unexpected structure: {data}")
                        continue

                    rewritten = data["choices"][0]["message"].get("content", "").strip()
                    logger.info(f"AI content before cleaning: '{rewritten}'")
                    
                    # Clean up common AI prefixes
                    rewritten = rewritten.strip('"').strip("•").strip("-").strip()
                    
                    if not rewritten:
                        logger.warning(f"Model {model_name} returned empty content, trying next...")
                        continue

                    logger.info(f"AI rewrite successful for keyword: {keyword} (model: {model_name}) - result: '{rewritten}'")
                    return rewritten
                
                # Handle rate limits or other API errors by trying the next model
                logger.warning(f"OpenRouter error ({model_name}): {response.status_code} {response.text}")
                continue

            except Exception as e:
                logger.error(f"OpenRouter integration error ({model_name}): {e}")
                continue

    return (
        f"{original_bullet} — utilizing {keyword} to optimize performance and deliver results."
    )

