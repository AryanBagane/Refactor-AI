import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Download required NLTK data (one-time)
for resource in ['punkt_tab', 'averaged_perceptron_tagger_eng', 'stopwords']:
    try:
        nltk.data.find(f'tokenizers/{resource}' if 'punkt' in resource else f'{resource}')
    except LookupError:
        nltk.download(resource, quiet=True)

STOP_WORDS = set(stopwords.words('english'))


def _clean_text(text: str) -> str:
    """Lowercase and strip extra whitespace."""
    return " ".join(text.lower().split())


def extract_keywords(text: str) -> set[str]:
    """Extract nouns and proper nouns from text using NLTK POS tagging."""
    tokens = word_tokenize(_clean_text(text))
    tagged = pos_tag(tokens)
    keywords = set()
    # NN = noun singular, NNS = noun plural, NNP = proper noun, NNPS = proper noun plural
    noun_tags = {'NN', 'NNS', 'NNP', 'NNPS'}
    for word, tag in tagged:
        if tag in noun_tags and word not in STOP_WORDS and len(word) > 1 and word.isalpha():
            keywords.add(word.lower())
    return keywords


def compute_match_score(jd_text: str, resume_text: str) -> float:
    """Compute cosine similarity between JD and Resume using TF-IDF."""
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform([_clean_text(jd_text), _clean_text(resume_text)])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return round(float(similarity[0][0]) * 100, 2)


def analyze(jd_text: str, resume_text: str) -> dict:
    """Full analysis: match score + keyword gap report."""
    jd_keywords = extract_keywords(jd_text)
    resume_keywords = extract_keywords(resume_text)

    matched = jd_keywords.intersection(resume_keywords)
    missing = jd_keywords.difference(resume_keywords)
    score = compute_match_score(jd_text, resume_text)

    logger.info(f"Analysis complete — score: {score}%, matched: {len(matched)}, missing: {len(missing)}")

    return {
        "match_score": score,
        "missing_keywords": sorted(list(missing)),
        "matched_keywords": sorted(list(matched)),
    }
