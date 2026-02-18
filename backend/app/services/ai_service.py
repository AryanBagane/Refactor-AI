import google.generativeai as genai
from app.core.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


async def rewrite_bullet(original_bullet: str, keyword: str, jd_context: str = "") -> str:
    """
    Use Gemini 1.5 Flash to rewrite a resume bullet point
    incorporating a missing keyword using the STAR method.
    """
    if not settings.GEMINI_API_KEY:
        return (
            f"{original_bullet} — leveraging {keyword} to drive measurable results. "
            "(Note: Set GEMINI_API_KEY in .env for AI-powered rewrites.)"
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

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        rewritten = response.text.strip().strip('"').strip("•").strip("-").strip()
        logger.info(f"AI rewrite successful for keyword: {keyword}")
        return rewritten
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return (
            f"{original_bullet} — utilizing {keyword} to optimize performance and deliver results."
        )
