"""
NLP Service — Advanced Resume Analysis Engine
==============================================
Features:
  • SentenceTransformer semantic embeddings (all-MiniLM-L6-v2)
  • 5 000+ skill ontology with category awareness
  • Resume section detection
  • Experience-years extraction
  • ATS composite scoring (keyword, semantic, sections, experience, skill-depth)
"""

import re
import json
import pathlib
import nltk
from nltk.tokenize import word_tokenize
from nltk.util import ngrams
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# NLTK downloads
# ─────────────────────────────────────────────────────────────────────────────
for pkg in ["punkt_tab", "stopwords"]:
    try:
        nltk.data.find(
            f"tokenizers/{pkg}" if "punkt" in pkg else f"corpora/{pkg}"
        )
    except LookupError:
        nltk.download(pkg, quiet=True)

STOP_WORDS = set(stopwords.words("english"))

# ─────────────────────────────────────────────────────────────────────────────
# Sentence-Transformer model (loaded once at startup)
# ─────────────────────────────────────────────────────────────────────────────
logger.info("Loading SentenceTransformer model…")
_model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("SentenceTransformer model loaded.")

# ─────────────────────────────────────────────────────────────────────────────
# Skill Ontology – loaded from JSON data file
# ─────────────────────────────────────────────────────────────────────────────
_DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "data"

def _load_skill_ontology() -> tuple[set[str], dict[str, str]]:
    """Load skill_ontology.json → flat set of skills + skill→category map."""
    path = _DATA_DIR / "skill_ontology.json"
    with open(path, "r", encoding="utf-8") as f:
        ontology: dict[str, list[str]] = json.load(f)
    flat: set[str] = set()
    category_map: dict[str, str] = {}
    for category, skills in ontology.items():
        for s in skills:
            s_lower = s.lower().strip()
            flat.add(s_lower)
            category_map[s_lower] = category
    return flat, category_map

SKILL_SET, SKILL_CATEGORY_MAP = _load_skill_ontology()
logger.info(f"Skill ontology loaded: {len(SKILL_SET)} skills across {len(set(SKILL_CATEGORY_MAP.values()))} categories")

# ─────────────────────────────────────────────────────────────────────────────
# Tech Alias Map
# ─────────────────────────────────────────────────────────────────────────────
TECH_ALIASES: dict[str, str] = {
    "ml": "machine learning",
    "dl": "deep learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "py": "python",
    "js": "javascript",
    "ts": "typescript",
    "tf": "tensorflow",
    "pt": "pytorch",
    "k8s": "kubernetes",
    "ci/cd": "ci cd",
    "ci-cd": "ci cd",
    "db": "database",
    "dbs": "databases",
    "api": "rest api",
    "apis": "rest api",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "swe": "software engineer",
    "fe": "frontend",
    "be": "backend",
    "fs": "full stack",
    "ux": "user experience",
    "ui": "user interface",
    "pm": "project management",
    "qa": "quality assurance",
    "devops": "development operations",
    "sre": "site reliability engineering",
    "oop": "object oriented programming",
    "fp": "functional programming",
    "tdd": "test driven development",
    "bdd": "behavior driven development",
    "ddd": "domain driven design",
    "etl": "extract transform load",
    "elt": "extract load transform",
    "bi": "business intelligence",
    "crm": "customer relationship management",
    "erp": "enterprise resource planning",
    "saas": "software as a service",
    "paas": "platform as a service",
    "iaas": "infrastructure as a service",
    "sdk": "software development kit",
    "ide": "integrated development environment",
    "orm": "object relational mapping",
    "nosql": "non-relational database",
    "rdbms": "relational database management system",
    "rbac": "role based access control",
    "sso": "single sign on",
    "mfa": "multi factor authentication",
    "2fa": "two factor authentication",
    "cdn": "content delivery network",
    "dns": "domain name system",
    "vpn": "virtual private network",
    "seo": "search engine optimization",
    "sem": "search engine marketing",
    "roi": "return on investment",
    "kpi": "key performance indicator",
}

# Build reverse map (expansion → abbreviation)
_REVERSE_ALIASES: dict[str, str] = {}
for abbr, expansion in TECH_ALIASES.items():
    _REVERSE_ALIASES.setdefault(expansion, abbr)

# ─────────────────────────────────────────────────────────────────────────────
# Text Cleaning
# ─────────────────────────────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    """Lowercase, strip special chars (keep hyphens), collapse whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\-/+#.]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ─────────────────────────────────────────────────────────────────────────────
# Skill Normalisation
# ─────────────────────────────────────────────────────────────────────────────

def _normalize_skill(skill: str) -> str:
    """Normalise a candidate skill string (alias expansion, punctuation cleanup)."""
    skill = skill.lower().strip()
    skill = skill.replace("-", " ").replace("_", " ")
    return TECH_ALIASES.get(skill, skill)

# ─────────────────────────────────────────────────────────────────────────────
# Keyword / Skill Extraction
# ─────────────────────────────────────────────────────────────────────────────

# Extra stop words: common JD/resume filler words that aren't skills
_EXTRA_STOP = {
    "able", "about", "across", "also", "always", "among", "apply", "area",
    "based", "best", "build", "building", "business", "candidate", "come",
    "company", "competitive", "could", "current", "day", "demonstrate",
    "desired", "develop", "developing", "driven", "early", "either",
    "ensure", "environment", "equal", "every", "excellent", "exciting",
    "experience", "familiar", "first", "focus", "full", "get", "given",
    "global", "good", "great", "grow", "growth", "hand", "help", "high",
    "highly", "ideal", "including", "industry", "interest", "interested",
    "involve", "join", "key", "knowledge", "large", "lead", "level",
    "like", "looking", "make", "making", "manage", "many", "market",
    "member", "minimum", "modern", "must", "need", "needed", "new",
    "next", "offer", "one", "open", "opportunity", "order", "organization",
    "part", "passionate", "people", "platform", "please", "plus",
    "position", "preferred", "previous", "prior", "problem", "problems",
    "product", "professional", "proficiency", "proven", "provide",
    "related", "relevant", "required", "requirement", "requirements",
    "responsible", "result", "right", "role", "scale", "seek",
    "seeking", "senior", "set", "shall", "similar", "solution",
    "solutions", "solve", "solving", "someone", "start", "state",
    "strong", "success", "successful", "support", "sure", "take",
    "taking", "technology", "thing", "time", "top", "two", "type",
    "understand", "understanding", "use", "using", "value", "various",
    "want", "way", "welcome", "well", "will", "within", "work",
    "working", "world", "would", "write", "writing", "year", "years",
}


def extract_keywords(text: str) -> set[str]:
    """Extract skills from text using n-grams matched against the skill ontology.

    Pipeline:
      1. Clean & tokenise
      2. Build unigrams, bigrams, trigrams
      3. Normalise each candidate (alias expansion)
      4. Keep those present in the 5 000+ skill ontology
      5. Also keep single-word technical terms (4+ chars, not noise)
    """
    cleaned = _clean_text(text)
    tokens = word_tokenize(cleaned)

    candidates: set[str] = set()

    # Unigrams
    for tok in tokens:
        if tok not in STOP_WORDS and tok not in _EXTRA_STOP and len(tok) > 2:
            candidates.add(_normalize_skill(tok))

    # Bigrams
    for bg in ngrams(tokens, 2):
        if all(w not in STOP_WORDS and w not in _EXTRA_STOP for w in bg):
            candidates.add(_normalize_skill(" ".join(bg)))

    # Trigrams
    for tg in ngrams(tokens, 3):
        if all(w not in STOP_WORDS and w not in _EXTRA_STOP for w in tg):
            candidates.add(_normalize_skill(" ".join(tg)))

    # Filter: keep ontology-matched skills AND meaningful general keywords
    result: set[str] = set()
    for kw in candidates:
        if kw in SKILL_SET:
            result.add(kw)
        elif (
            len(kw.split()) == 1
            and len(kw) >= 4
            and kw.isalpha()
            and kw not in _EXTRA_STOP
            and kw not in STOP_WORDS
        ):
            # Keep single-word general keywords (4+ chars, not noise)
            result.add(kw)

    return result

# ─────────────────────────────────────────────────────────────────────────────
# Semantic Similarity (SentenceTransformer)
# ─────────────────────────────────────────────────────────────────────────────

def _semantic_similarity(a: str, b: str) -> float:
    """Cosine similarity between two phrases using SentenceTransformer embeddings."""
    emb = _model.encode([a, b])
    return float(cosine_similarity([emb[0]], [emb[1]])[0][0])


def _bulk_semantic_similarity(phrases_a: list[str], phrases_b: list[str]) -> np.ndarray:
    """Compute pairwise cosine similarity matrix between two lists of phrases.

    Returns shape (len(phrases_a), len(phrases_b)).
    """
    if not phrases_a or not phrases_b:
        return np.array([])
    emb_a = _model.encode(phrases_a, show_progress_bar=False)
    emb_b = _model.encode(phrases_b, show_progress_bar=False)
    return cosine_similarity(emb_a, emb_b)

# ─────────────────────────────────────────────────────────────────────────────
# Keyword Matching (exact + semantic)
# ─────────────────────────────────────────────────────────────────────────────

_SEMANTIC_THRESHOLD = 0.55  # cosine similarity threshold for a "match"


def _match_keywords(
    jd_keywords: set[str], resume_keywords: set[str]
) -> tuple[set[str], set[str]]:
    """Match JD keywords against resume keywords.

    Strategy:
      1. Exact match
      2. Alias expansion match
      3. Batch semantic-embedding similarity (threshold >= 0.55)
    """
    matched: set[str] = set()
    remaining: set[str] = set()

    resume_kw_list = sorted(resume_keywords)  # deterministic order for embeddings

    # ── Pass 1: exact & alias match ──
    for jd_kw in jd_keywords:
        if jd_kw in resume_keywords:
            matched.add(jd_kw)
        elif _normalize_skill(jd_kw) in resume_keywords:
            matched.add(jd_kw)
        elif jd_kw in _REVERSE_ALIASES and _REVERSE_ALIASES[jd_kw] in resume_keywords:
            matched.add(jd_kw)
        else:
            remaining.add(jd_kw)

    if not remaining or not resume_kw_list:
        return matched, remaining

    # ── Pass 2: batch semantic similarity ──
    jd_remaining_list = sorted(remaining)
    sim_matrix = _bulk_semantic_similarity(jd_remaining_list, resume_kw_list)

    still_missing: set[str] = set()
    for i, jd_kw in enumerate(jd_remaining_list):
        best_sim = float(np.max(sim_matrix[i])) if sim_matrix.size > 0 else 0.0
        if best_sim >= _SEMANTIC_THRESHOLD:
            matched.add(jd_kw)
        else:
            still_missing.add(jd_kw)

    return matched, still_missing

# ─────────────────────────────────────────────────────────────────────────────
# Resume Section Detection
# ─────────────────────────────────────────────────────────────────────────────

# Canonical sections and their regex heading variants
_SECTION_PATTERNS: dict[str, list[str]] = {
    "experience": [
        r"\b(work\s+)?experience\b", r"\bemployment(\s+history)?\b",
        r"\bprofessional\s+(experience|background|history)\b",
        r"\bwork\s+history\b", r"\bcareer(\s+history)?\b",
    ],
    "education": [
        r"\beducation(al)?\s*(background|qualification|history)?\b",
        r"\bacademic\b", r"\bdegree\b", r"\buniversity\b", r"\bcollege\b",
    ],
    "skills": [
        r"\b(technical\s+)?skills?\b", r"\bcompetenc(ies|e)\b",
        r"\btechnolog(ies|y)\b", r"\btools?\b", r"\bproficienc(ies|y)\b",
        r"\bcore\s+skills\b", r"\bkey\s+skills\b",
    ],
    "projects": [
        r"\bprojects?\b", r"\bportfolio\b", r"\bpersonal\s+projects?\b",
        r"\bacademic\s+projects?\b", r"\bkey\s+projects?\b",
    ],
    "certifications": [
        r"\bcertificat(ions?|es?)\b", r"\blicen(s|c)es?\b",
        r"\bprofessional\s+development\b", r"\bcredentials?\b",
    ],
    "summary": [
        r"\b(professional\s+)?summary\b", r"\bobjective\b", r"\bprofile\b",
        r"\babout(\s+me)?\b", r"\bpersonal\s+statement\b",
        r"\bcareer\s+(summary|objective)\b",
    ],
    "awards": [
        r"\bawards?\b", r"\bhonors?\b", r"\bachievements?\b",
        r"\brecognition\b", r"\baccomplishments?\b",
    ],
    "publications": [
        r"\bpublications?\b", r"\bpapers?\b", r"\bresearch\b",
        r"\bconference\s+papers?\b", r"\bjournal\b",
    ],
    "volunteer": [
        r"\bvolunteer(ing)?\b", r"\bcommunity\s+service\b",
        r"\bextracurricular\b", r"\bactivities\b",
    ],
    "languages": [
        r"\blanguages?\b", r"\blinguistic\b",
    ],
    "interests": [
        r"\binterests?\b", r"\bhobbies?\b",
    ],
    "references": [
        r"\breferences?\b",
    ],
}

# Standard sections an ATS expects
_STANDARD_SECTIONS = {"experience", "education", "skills", "summary"}
_ALL_KNOWN_SECTIONS = set(_SECTION_PATTERNS.keys())


def _detect_resume_sections(text: str) -> list[str]:
    """Detect which sections are present in the resume text."""
    text_lower = text.lower()
    found: set[str] = set()
    for section, patterns in _SECTION_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text_lower):
                found.add(section)
                break
    return sorted(found)

# ─────────────────────────────────────────────────────────────────────────────
# Experience Extraction
# ─────────────────────────────────────────────────────────────────────────────

def _extract_experience_years(text: str) -> int:
    """Extract approximate years of experience from resume text.

    Looks for patterns like:
      • "5+ years of experience"
      • "3-5 years experience"
      • "over 10 years"
      • Date ranges like "2018 – 2024" or "Jan 2019 - Present"
    """
    text_lower = text.lower()
    years: list[int] = []

    # Pattern 1: explicit "X+ years" or "X years"
    for m in re.finditer(r"(\d{1,2})\+?\s*(?:years?|yrs?)[\s\-]*(?:of\s+)?(?:experience|exp)?", text_lower):
        years.append(int(m.group(1)))

    # Pattern 2: "over/more than X years"
    for m in re.finditer(r"(?:over|more\s+than|approximately|about|nearly)\s+(\d{1,2})\s*(?:years?|yrs?)", text_lower):
        years.append(int(m.group(1)))

    # Pattern 3: range "X-Y years"
    for m in re.finditer(r"(\d{1,2})\s*[\-–—to]+\s*(\d{1,2})\s*(?:years?|yrs?)", text_lower):
        years.append(int(m.group(2)))  # take upper bound

    # Pattern 4: Calculate from date ranges (e.g. "2018 - 2024", "2015 - present")
    current_year = 2026  # hardcoded to match the current year
    date_ranges = re.findall(
        r"(20[012]\d|19\d{2})\s*[\-–—]+\s*(20[012]\d|19\d{2}|present|current|now|ongoing)",
        text_lower,
    )
    for start_str, end_str in date_ranges:
        start_y = int(start_str)
        if end_str in ("present", "current", "now", "ongoing"):
            end_y = current_year
        else:
            end_y = int(end_str)
        diff = end_y - start_y
        if 0 < diff <= 50:
            years.append(diff)

    if years:
        return max(years)
    return 0

# ─────────────────────────────────────────────────────────────────────────────
# JD Experience Requirement Extraction
# ─────────────────────────────────────────────────────────────────────────────

def _extract_jd_experience_requirement(text: str) -> int:
    """Extract the years-of-experience requirement from a JD."""
    text_lower = text.lower()

    # "minimum of 5 years", "at least 3 years", "5+ years required"
    patterns = [
        r"(?:minimum|at\s+least|require[sd]?)\s+(?:of\s+)?(\d{1,2})\+?\s*(?:years?|yrs?)",
        r"(\d{1,2})\+?\s*(?:years?|yrs?)[\s\-]*(?:of\s+)?(?:experience|exp)",
        r"(\d{1,2})\s*[\-–—to]+\s*(\d{1,2})\s*(?:years?|yrs?)",
    ]
    values: list[int] = []
    for pat in patterns:
        for m in re.finditer(pat, text_lower):
            values.append(int(m.group(1)))
    return min(values) if values else 0

# ─────────────────────────────────────────────────────────────────────────────
# ATS Composite Score
# ─────────────────────────────────────────────────────────────────────────────

# Weights for ATS composite score (must sum to 1.0)
_W_KEYWORD   = 0.40
_W_SEMANTIC  = 0.25
_W_SECTION   = 0.15
_W_EXPERIENCE = 0.10
_W_SKILL_DEPTH = 0.10


def _compute_keyword_score(matched_count: int, total_jd: int) -> float:
    """Keyword coverage: matched / total JD keywords × 100."""
    if total_jd == 0:
        return 100.0
    return round((matched_count / total_jd) * 100, 2)


def _compute_semantic_score(jd_text: str, resume_text: str) -> float:
    """Full-document semantic similarity (0–100)."""
    sim = _semantic_similarity(jd_text[:5000], resume_text[:5000])  # cap length
    return round(float(max(0, sim)) * 100, 2)


def _compute_section_score(detected_sections: list[str]) -> float:
    """Score based on how many standard ATS sections are present (0–100).

    Standard sections: experience, education, skills, summary.
    Bonus points for additional sections up to 100%.
    """
    standard_found = len(_STANDARD_SECTIONS.intersection(detected_sections))
    standard_score = (standard_found / len(_STANDARD_SECTIONS)) * 80  # up to 80%
    bonus_sections = len(set(detected_sections) - _STANDARD_SECTIONS)
    bonus_score = min(bonus_sections * 5, 20)  # up to 20% bonus
    return round(min(standard_score + bonus_score, 100), 2)


def _compute_experience_score(resume_years: int, jd_required: int) -> float:
    """How well the candidate's experience meets the JD requirement (0–100).

    100% if resume_years >= jd_required.
    Otherwise proportional, with a floor of 20%.
    If JD doesn't specify → 80% by default.
    """
    if jd_required == 0:
        return 80.0  # no explicit requirement
    if resume_years >= jd_required:
        return 100.0
    ratio = resume_years / jd_required
    return round(max(ratio * 100, 20.0), 2)


def _compute_skill_depth_score(
    resume_keywords: set[str],
) -> float:
    """Score based on how many resume keywords are ontology-recognised skills (0–100).

    More ontology-matched skills = deeper technical profile.
    """
    if not resume_keywords:
        return 0.0
    ontology_matched = sum(1 for kw in resume_keywords if kw in SKILL_SET)
    ratio = ontology_matched / max(len(resume_keywords), 1)
    # Scale: having 50%+ of keywords be real skills is excellent
    return round(min(ratio * 150, 100), 2)  # 1.5× multiplier, capped at 100


def _compute_ats_score(
    keyword_score: float,
    semantic_score: float,
    section_score: float,
    experience_score: float,
    skill_depth_score: float,
) -> float:
    """Weighted composite ATS score."""
    composite = (
        _W_KEYWORD * keyword_score
        + _W_SEMANTIC * semantic_score
        + _W_SECTION * section_score
        + _W_EXPERIENCE * experience_score
        + _W_SKILL_DEPTH * skill_depth_score
    )
    return round(composite, 2)

# ─────────────────────────────────────────────────────────────────────────────
# Public API — Main Analysis
# ─────────────────────────────────────────────────────────────────────────────

def analyze(jd_text: str, resume_text: str) -> dict:
    """Full ATS-style resume analysis.

    Returns:
      {
        "match_score": float,          # composite ATS score
        "matched_keywords": [...],
        "missing_keywords": [...],
        "ats_breakdown": {
            "keyword_score": float,
            "semantic_score": float,
            "section_score": float,
            "experience_score": float,
            "skill_depth_score": float,
        },
        "resume_sections": [...],
        "experience_years": int,
      }
    """
    # 1. Extract keywords
    jd_keywords = extract_keywords(jd_text)
    resume_keywords = extract_keywords(resume_text)

    # 2. Match keywords (exact + semantic)
    matched, missing = _match_keywords(jd_keywords, resume_keywords)

    # 3. Section detection
    sections = _detect_resume_sections(resume_text)

    # 4. Experience extraction
    resume_exp = _extract_experience_years(resume_text)
    jd_exp_req = _extract_jd_experience_requirement(jd_text)

    # 5. Sub-scores
    keyword_score = _compute_keyword_score(len(matched), len(jd_keywords))
    semantic_score = _compute_semantic_score(jd_text, resume_text)
    section_score = _compute_section_score(sections)
    experience_score = _compute_experience_score(resume_exp, jd_exp_req)
    skill_depth_score = _compute_skill_depth_score(resume_keywords)

    # 6. Composite ATS score
    ats_score = _compute_ats_score(
        keyword_score, semantic_score, section_score,
        experience_score, skill_depth_score,
    )

    logger.info(
        f"Analysis: ATS={ats_score}% | KW={keyword_score}% ({len(matched)}/{len(jd_keywords)}) | "
        f"Sem={semantic_score}% | Sec={section_score}% | Exp={experience_score}% ({resume_exp}y/{jd_exp_req}y req) | "
        f"Depth={skill_depth_score}% | Sections={sections}"
    )

    return {
        "match_score": ats_score,
        "matched_keywords": sorted(list(matched)),
        "missing_keywords": sorted(list(missing)),
        "ats_breakdown": {
            "keyword_score": keyword_score,
            "semantic_score": semantic_score,
            "section_score": section_score,
            "experience_score": experience_score,
            "skill_depth_score": skill_depth_score,
        },
        "resume_sections": sections,
        "experience_years": resume_exp,
    }
