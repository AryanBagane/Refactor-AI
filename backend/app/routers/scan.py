from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models import User, ScanHistory
from app.schemas import AnalyzeRequest, AnalyzeResponse, RewriteRequest, RewriteResponse, BulkRewriteRequest, BulkRewriteResponse, ScanHistoryOut, SaveRewritesRequest
from app.core.dependencies import get_current_user
from app.services.nlp_service import analyze
from app.services.ai_service import rewrite_bullet, rewrite_bulk
from app.utils.pdf_parser import extract_text_from_pdf, extract_text_from_docx
from app.utils.logger import get_logger
from typing import List, Optional

router = APIRouter(prefix="/scan", tags=["Scan & Analysis"])
logger = get_logger(__name__)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    job_description: str = Form(...),
    resume_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze a resume against a job description. Accepts text or file upload."""
    # Extract resume text from file if provided
    final_resume_text = resume_text or ""

    if resume_file:
        file_bytes = await resume_file.read()
        filename = resume_file.filename.lower()

        if filename.endswith(".pdf"):
            final_resume_text = extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            final_resume_text = extract_text_from_docx(file_bytes)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload a PDF or DOCX file.",
            )

    if not final_resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is empty. Please provide text or upload a file.",
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required.",
        )

    # Run NLP analysis
    result = analyze(job_description, final_resume_text)

    # Save to history
    scan_record = ScanHistory(
        user_id=current_user.id,
        job_description=job_description,
        resume_text=final_resume_text,
        match_score=result["match_score"],
        missing_keywords=result["missing_keywords"],
        matched_keywords=result["matched_keywords"],
        ats_breakdown=result.get("ats_breakdown", {}),
        resume_sections=result.get("resume_sections", []),
        experience_years=result.get("experience_years"),
    )
    db.add(scan_record)
    await db.commit()
    logger.info(f"Scan saved for user {current_user.id} — score: {result['match_score']}%")

    return AnalyzeResponse(
        scan_id=scan_record.id,
        **result
    )


@router.post("/rewrite", response_model=RewriteResponse)
async def ai_rewrite(
    data: RewriteRequest,
    current_user: User = Depends(get_current_user),
):
    """AI-powered bullet point rewrite using Gemini."""
    rewritten = await rewrite_bullet(
        original_bullet=data.original_bullet,
        keyword=data.keyword,
        jd_context=data.jd_context,
    )
    return RewriteResponse(rewritten_bullet=rewritten)


@router.post("/rewrite-bulk", response_model=BulkRewriteResponse)
async def ai_rewrite_bulk(
    data: BulkRewriteRequest,
    current_user: User = Depends(get_current_user),
):
    """AI-powered bulk rewrite to generate 3 bullet points from missing keywords."""
    rewritten_bullets = await rewrite_bulk(
        keywords=data.keywords,
        jd_context=data.jd_context,
    )
    return BulkRewriteResponse(rewritten_bullets=rewritten_bullets)


@router.get("/history", response_model=List[ScanHistoryOut])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's scan history."""
    result = await db.execute(
        select(ScanHistory)
        .where(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/history/{scan_id}", response_model=dict)
async def delete_history(
    scan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a specific scan record (only if owned by the current user)."""
    result = await db.execute(
        select(ScanHistory).where(
            ScanHistory.id == scan_id,
            ScanHistory.user_id == current_user.id,
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found.",
        )

    await db.delete(scan)
    await db.commit()
    logger.info(f"Scan {scan_id} deleted by user {current_user.id}")
    return {"message": "Scan record deleted successfully."}


@router.patch("/history/{scan_id}/rewrites", response_model=ScanHistoryOut)
async def save_rewrites(
    scan_id: int,
    data: SaveRewritesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save AI-generated bullet point rewrites against a scan record."""
    result = await db.execute(
        select(ScanHistory).where(
            ScanHistory.id == scan_id,
            ScanHistory.user_id == current_user.id,
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found.",
        )

    scan.ai_rewrites = data.ai_rewrites
    await db.commit()
    await db.refresh(scan)
    logger.info(f"Saved {len(data.ai_rewrites)} ai_rewrites for scan {scan_id}")
    return scan
