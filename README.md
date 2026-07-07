# 🧠 AI Resume Analyzer v2.0

[![Python Version](https://img.shields.io/badge/Python-3.10-blue.svg)](https://python.org)
[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://streamlit.io)
[![NLP - spaCy](https://img.shields.io/badge/NLP-spaCy%20v3-red.svg)](https://spacy.io)
[![LLM - Groq](https://img.shields.io/badge/LLM-Groq%20AI-orange.svg)](https://groq.com)

An intelligent, premium resume parsing and career intelligence recommendation platform. Built with Python, Streamlit, spaCy, and SQLite, powered by Groq LLM for smart recommendations.

---

## ✨ Features

- **AI Parsing** — Automatically extracts candidate name, email, phone, and skills from PDF/Docx resumes.
- **Domain Recommendation** — Identifies the candidate's best-fit domain (e.g., Data Science, Web Development, Android, iOS, UI/UX Design).
- **Skill Gap Analysis** — Dynamically highlights missing skills required for the predicted field.
- **Tailored Resume & Cover Letter Generator** — Powered by Groq AI, generates tailored resume text improvements and custom cover letters.
- **Resume Health Score** — Evaluates the resume out of 100 based on standard industry sections present in the PDF.
- **Admin Dashboard** — Sleek analytics panels, charts, activity logs, and CSV download capability for record management.
- **Feedback & Rating System** — Interactive user feedback system logged directly to the database.

---

## 📁 Project Structure

```text
AI-Resume-Analyzer/
├── App/
│   ├── App.py              # Main Streamlit application
│   ├── config.py           # Configuration and env loader
│   ├── database.py         # SQLite / MySQL database layer
│   ├── utils.py            # Helper extraction logic & matchers
│   ├── Courses.py          # Curated courses and video data
│   ├── requirements.txt    # Python package dependencies
│   └── Uploaded_Resumes/   # Storage for analyzed PDFs (gitignored)
├── pyresparser/            # Local patched resume parser module
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # Documentation
```

---

## 🚀 Setup & Local Installation

### 1. Clone the Repository & Navigate
```bash
git clone https://github.com/Priyanshi0907/ResumeAI.git
cd AI-Resume-Analyzer
```

### 2. Create and Activate a Virtual Environment
```bash
# Create environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Installs python packages and the pre-built spaCy language model dependency automatically:
```bash
pip install -r App/requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Open `.env` and make sure to add your **Groq API Key**:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 5. Run the Application
```bash
cd App
streamlit run App.py
```

---

## 🗄️ Database

By default, the app uses **SQLite** for zero-configuration setup. A `resume_analyzer.db` file will be created automatically in your working directory on the first run.

If you prefer to use **MySQL**, change `DB_TYPE=mysql` in your `.env` and configure the database connection variables list below.

---

## 🔑 Admin Dashboard

To access the admin analytics panel, use the credentials configured in your `.env` (default credentials below):
- **Username:** `admin`
- **Password:** `admin@123`

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | _(empty)_ | API Key to enable AI resume improvements and cover letter generation |
| `DB_TYPE` | `sqlite` | Database selector (`sqlite` or `mysql`) |
| `SQLITE_PATH` | `resume_analyzer.db` | Path where the SQLite file should be written |
| `MYSQL_HOST` | `localhost` | MySQL server host address |
| `MYSQL_USER` | `root` | Username for MySQL database |
| `MYSQL_PASS` | _(empty)_ | Password for MySQL database |
| `MYSQL_DB` | `cv` | Database schema name |
| `ADMIN_USER` | `admin` | Admin dashboard login username |
| `ADMIN_PASS` | `admin@123` | Admin dashboard login password |
