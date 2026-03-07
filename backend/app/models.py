import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scans = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_description = Column(Text, nullable=False)
    resume_text = Column(Text, nullable=False)
    match_score = Column(Float, nullable=False)
    missing_keywords = Column(JSON, default=[])
    matched_keywords = Column(JSON, default=[])
    ai_rewrites = Column(JSON, default=[])
    ats_breakdown = Column(JSON, default={})
    resume_sections = Column(JSON, default=[])
    experience_years = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scans")

    def __repr__(self):
        return f"<ScanHistory(id={self.id}, score={self.match_score})>"
