from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ── Auth Schemas ──────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class MessageResponse(BaseModel):
    message: str


# ── Scan / Analysis Schemas ───────────────────────────────────

class AnalyzeRequest(BaseModel):
    job_description: str
    resume_text: str


class AnalyzeResponse(BaseModel):
    scan_id: Optional[int] = None
    match_score: float
    missing_keywords: List[str]
    matched_keywords: List[str]


class RewriteRequest(BaseModel):
    original_bullet: str
    keyword: str
    jd_context: Optional[str] = ""


class RewriteResponse(BaseModel):
    rewritten_bullet: str


class BulkRewriteRequest(BaseModel):
    keywords: List[str]
    jd_context: Optional[str] = ""


class BulkRewriteResponse(BaseModel):
    rewritten_bullets: List[str]


class SaveRewritesRequest(BaseModel):
    ai_rewrites: List[str]


class ScanHistoryOut(BaseModel):
    id: int
    job_description: str
    resume_text: str
    match_score: float
    missing_keywords: List[str]
    matched_keywords: List[str]
    ai_rewrites: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True
