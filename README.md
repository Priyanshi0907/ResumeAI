<div align="center">

# 🧠 ResumeAI — Universal AI Resume Analyzer & Career Intelligence Engine

**Turn any resume into a personalized, ATS-optimized career roadmap.**

Upload a PDF or DOCX resume — receive an instant universal domain prediction, granular 5-pillar health diagnostic, ATS compliance scoring, keyword gap diffs, actionable AI transformation measures, and tailored 1–1.5 page resume/cover letter exports.

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/ML%20Service-Python%20%7C%20FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![spaCy](https://img.shields.io/badge/NLP-spaCy%20v3-09A3D5?logo=spacy&logoColor=white)](https://spacy.io)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Cloud%20AI-F55036)](https://groq.com)
[![ReportLab](https://img.shields.io/badge/PDF-ReportLab%20Engine-D4A373)](https://www.reportlab.com/)

</div>

---

## 🏗️ System Architecture

The platform operates on a decoupled 3-tier microservices architecture designed for real-time NLP analysis and generative AI workflows:

```
┌─────────────────────────────────────────────────────────────┐
│                       React Frontend                        │
│     (Vite · Luxury Editorial Design System · Real-Time Hub) │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST APIs / JWT
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js Backend Gateway                  │
│       (Express · SQLite · Auth / Onboarding · Feedback)     │
└──────────────────────────────┬──────────────────────────────┘
                               │  Multipart / JSON Proxy
┌──────────────────────────────▼──────────────────────────────┐
│                  Python / FastAPI ML Engine                 │
│      (spaCy NER · Universal Domain Classifier · ReportLab)  │
└──────────────────────────────┬──────────────────────────────┘
                               │  High-Throughput Prompts
┌──────────────────────────────▼──────────────────────────────┐
│                      Groq AI Cloud                          │
│               (Fast Inference LLM Endpoints)                │
└─────────────────────────────────────────────────────────────┘
```

1. **React Frontend (`frontend/`)**: Modern Single Page Application built with Vite and a custom Luxury Editorial design system (Burgundy `#8E3B46`, Cream `#F2EBE0`, Deep Charcoal `#1C1515`). Features real-time state synchronization, score gauges, interactive progress tracking, and specialized workspaces.
2. **Node.js Gateway (`backend/`)**: Handles candidate authentication (JWT, bcrypt), instant resume onboarding upon signup, feedback management, and API proxy routing.
3. **Python / FastAPI ML Service (`App/`)**: Houses the spaCy entity extraction engine, 500+ technical skill taxonomy, universal multi-domain classification, ReportLab PDF compilation, and Groq LLM integration.

---

## ✨ Key Features & Functionality

### 🏠 1. Overview Dashboard
- **ATS Score Gauge**: Circular SVG gauge scoring overall ATS performance out of 100 with percentile ranking.
- **Resume Health Strip**: Horizontal diagnostic meters for Content, Formatting, Keywords, Impact, and Completeness.
- **AI Diagnostic Insight**: Instant evaluation of candidate strengths and high-priority optimization areas.
- **Recommended Improvements**: 4 unique, high-yield actionable Next Moves with point values (`+10 pts`, `+6 pts`, `+4 pts`, `+3 pts`).
- **Target Job Matches**: Domain-specific job listings with company badges, match percentages, and required skill tags.
- **Resume Progress**: Version-over-version comparison tracking real score deltas across scans.

### 📄 2. Resume Analyzer
- **Automatic Insights Navigation**: Direct access to analysis results if a resume is already uploaded.
- **Universal Multi-Domain Classification**: Classifies resumes across all tech & business domains with matching probability distribution bars.
- **Section-by-Section ATS Checklist**: 100-point audit verifying Summary, Work Experience, Skills, Education, Projects, and Certifications.
- **Curated Learning Pathways**: Dynamic recommendations for online certifications and expert interview/resume tutorials.
- **AI Career Coach Tips**: Groq-powered bulleted coaching categorized into Content Enhancements, Structure & Flow, and Keywords.

### 🎯 3. Job Matcher & Tailoring Studio
- **High-Precision Keyword Extraction**: Matches against a 500+ technical skill taxonomy while filtering out generic verbs and stopwords.
- **Match Compatibility & Gap Analysis**: Calculates semantic ATS match percentage with visual tags for Matched vs. Missing keywords.
- **STAR-Method Tailored Resume Generator**: Rewrites resumes into clean, ATS-compliant bullet points strictly formatted to fit **1 to 1.5 pages**.
- **Executive Cover Letter Writer**: Generates authentic, tailored 3-paragraph cover letters matching experience to job descriptions.
- **ReportLab PDF Exporter**: One-click download of publication-ready tailored resumes in Modern Single-Column or Classic Single-Column templates.

### 🏥 4. Resume Health Diagnostic Breakdown
- **5-Pillar Score Cards**: Deep-dive scores for Content Quality, ATS Formatting, Keyword Alignment, Quantified Impact, and Section Completeness.
- **Executive Health Strategy Panel**: ATS screening verdict (94% pass rate), verified structural strengths, and immediate action checkpoints.

### 💡 5. AI Insights & Next Moves
- **Personalized Diagnostic Assessment**: In-depth explanations of why scores were awarded.
- **Solution Measures & Examples**: Copy-ready Before vs. After transformation examples (*e.g., transforming qualitative descriptions into quantified STAR metrics*).
- **Interactive Priority Action Plan**: Interactive checkboxes to track completed resume updates.

### 🕒 6. Resume History & Progression Audit
- **Real-Time Audit Timeline**: Chronological records stored in `localStorage` tracking every analyzed version.
- **Automated Delta Calculation**: Live computation of point gains and metric evolutions across resume revisions.

### 📖 7. Resume Guidelines & Recruitment Standards
- **Writing Do's & Don'ts**: Practical rules for action verbs, metric quantification, and visual layout traps.
- **ATS Guidelines**: Parser mechanics, keyword density rules, dual acronym strategies (*e.g. "Natural Language Processing (NLP)"*), and STAR transformation cards.
- **Section Checklists & Templates**: Guidance for freshers and experienced candidates.

### 👤 8. User Profile Management
- Centralized modal to edit and update candidate name, email, mobile, LinkedIn, GitHub, portfolio URL, and target career domain.

---

## 📁 Project Structure

```
AI-Resume-Analyzer/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Navbar, Footer, UploadModal, ProfileModal, ScoreGauge
│   │   ├── pages/                # Home, Dashboard, Analyzer, Matcher, Tips, Feedback, Auth
│   │   ├── services/             # Axios API Client & Endpoints
│   │   ├── context/              # AuthContext (Candidate authentication & persistent state)
│   │   ├── index.css             # Luxury Editorial Design System Tokens
│   │   └── App.jsx               # Client Routing & Navigation
│   ├── index.html
│   └── package.json
│
├── backend/                      # Node.js Express Gateway
│   ├── src/
│   │   ├── config/               # Database & Environment Setup
│   │   ├── middleware/           # JWT Authentication & Multer File Uploads
│   │   ├── controllers/          # Auth, Analyzer, Matcher, and Feedback Controllers
│   │   ├── routes/               # API Gateway Endpoints
│   │   ├── services/             # FastAPI ML Client Service
│   │   └── server.js             # Express Gateway Entrypoint
│   └── package.json
│
├── App/                          # Python FastAPI NLP & ML Engine
│   ├── main.py                   # FastAPI Application, NLP Matching, LLM, ReportLab PDF
│   ├── config.py                 # Environment Configuration Loader
│   ├── Courses.py                # Curated Course & Video Resource Taxonomy
│   ├── utils.py                  # Domain Classification & PDF Parsing Utilities
│   ├── requirements.txt          # Python Dependencies (FastAPI, spaCy, Groq, ReportLab)
│   └── Uploaded_Resumes/         # Storage for Uploaded Candidate Documents
│
├── pyresparser/                  # Local spaCy NER Resume Parser Module
├── .env.example                  # Environment Variables Template
├── package.json                  # Root Monorepo Scripts
└── README.md
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **Groq Cloud API Key** ([console.groq.com](https://console.groq.com))

---

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
FASTAPI_URL=http://127.0.0.1:8000
JWT_SECRET=your_jwt_secret_key
```

---

### 2. Start the Python / FastAPI ML Service

```bash
# Windows
.\venv\Scripts\python -m uvicorn main:app --app-dir App --host 127.0.0.1 --port 8000 --reload

# macOS / Linux
source venv/bin/activate
uvicorn main:app --app-dir App --host 127.0.0.1 --port 8000 --reload
```
*Service runs at: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)*

---

### 3. Start the Node.js Backend Gateway

In a separate terminal:

```bash
cd backend
npm install
npm start
```
*Gateway runs at: `http://localhost:5000`*

---

### 4. Start the React Frontend

In a third terminal:

```bash
cd frontend
npm install
npm run dev
```
*Access the application at: `http://localhost:5173`*

---

## 🛠️ Tech Stack & Libraries

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS | Luxury Editorial UI, real-time dashboards, interactive charts |
| **Backend** | Node.js, Express, SQLite, JWT, Multer | Authentication, user onboarding, file stream proxying |
| **NLP / ML Engine** | Python 3.10+, FastAPI, spaCy NER, pyresparser, NLTK | Resume parsing, keyword taxonomy matching, domain classification |
| **Generative AI** | Groq Cloud AI (`openai/gpt-oss-120b`, `qwen/qwen3.6-27b`) | Tailored resume rewrites, cover letters, career coaching insights |
| **Document Export** | ReportLab | Compact 1–1.5 page ATS-compliant PDF resume generation |

---

## 📄 License

This project is licensed under the MIT License.