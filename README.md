# Refactor AI — The Anti-ATS Resume Optimizer

A full-stack web application that acts as a "mirror" for job seekers. It identifies the keyword gap between your resume and a specific job description (JD), provides a real-time **Match Score**, extracts missing hard skills, and suggests **AI-powered bullet point rewrites** to bypass Applicant Tracking Systems.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite) + Tailwind CSS v4 + Lucide Icons + Framer Motion |
| **Backend** | FastAPI (Python) with async SQLAlchemy |
| **Database** | PostgreSQL |
| **NLP Engine** | spaCy + scikit-learn (TF-IDF Cosine Similarity) |
| **AI Rewrite** | Google Gemini 1.5 Flash |
| **Auth** | JWT (python-jose + passlib bcrypt) |
| **PDF Parsing** | PyMuPDF + python-docx |

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use Docker)

### 1. Start PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker compose up db -d
```

**Option B: Local Postgres**
Create a database named `refactor_ai_db` with user `refactor_user` / password `refactor_pass`.

### 2. Configure Environment
Edit the `.env` file in the project root:
```env
DATABASE_URL=postgresql+asyncpg://refactor_user:refactor_pass@localhost:5432/refactor_ai_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```
The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`.

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### 5. Full Stack with Docker Compose
```bash
docker compose up --build
```

## Project Structure

```
Refactor-AI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── database.py          # Async SQLAlchemy engine
│   │   ├── models.py            # User, ScanHistory models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── constants.py         # App constants
│   │   ├── init_config.py       # DB table initialization
│   │   ├── core/
│   │   │   ├── config.py        # Settings (env vars)
│   │   │   ├── security.py      # JWT + password hashing
│   │   │   └── dependencies.py  # get_current_user
│   │   ├── routers/
│   │   │   ├── auth.py          # Signup, Login, Reset
│   │   │   └── scan.py          # Analyze, Rewrite, History
│   │   ├── services/
│   │   │   ├── nlp_service.py   # spaCy + TF-IDF engine
│   │   │   └── ai_service.py    # Gemini AI rewrite
│   │   └── utils/
│   │       ├── pdf_parser.py    # PDF/DOCX extraction
│   │       └── logger.py        # Logging config
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # Entry point
│   │   ├── App.jsx              # Routes
│   │   ├── index.css            # Tailwind + design system
│   │   ├── components/          # All React components
│   │   ├── context/             # AuthContext
│   │   └── services/            # Axios API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register & get JWT |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/forgot-password` | Verify email exists |
| POST | `/api/auth/reset-password` | Set new password |

### Scan & Analysis (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scan/analyze` | Analyze resume vs JD |
| POST | `/api/scan/rewrite` | AI bullet rewrite |
| GET | `/api/scan/history` | Get scan history |
| DELETE | `/api/scan/history/{id}` | Delete a scan |

## License
MIT