# 🧠 AI Resume Analyzer v2.0

An intelligent resume parsing and recommendation platform — built with Python, Streamlit, spaCy, and SQLite.

## Features

- **AI Parsing** — extracts name, email, phone, skills, degree from PDF resumes
- **Field Prediction** — identifies best-fit domain (Data Science, Web Dev, Android, iOS, UI/UX)
- **Skill Gap Analysis** — shows missing skills for predicted field
- **Resume Health Score** — scores 0–100 based on section completeness
- **Course Recommendations** — curated courses per field
- **Admin Dashboard** — analytics, charts, record management, CSV export
- **Feedback System** — community ratings and comments

## Project Structure

```
AI-Resume-Analyzer/
├── App/
│   ├── App.py              # Main Streamlit application
│   ├── config.py           # Environment variable loader
│   ├── database.py         # SQLite / MySQL DB layer
│   ├── utils.py            # Helper functions
│   ├── Courses.py          # Course & video data
│   ├── requirements.txt    # Python dependencies
│   └── Uploaded_Resumes/   # Uploaded PDFs (gitignored)
├── pyresparser/            # Resume parser module
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

## Setup

### 1. Clone & create virtual environment
```bash
git clone <your-repo>
cd AI-Resume-Analyzer
python -m venv venv
# Windows:  venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
```

### 2. Install dependencies
```bash
cd App
pip install -r requirements.txt
```

### 3. Download spaCy model
```bash
python -m spacy download en_core_web_sm
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env — set ADMIN_PASS at minimum
```

### 5. Run the app
```bash
cd App
streamlit run App.py
```

## Database

The app uses **SQLite by default** — no setup required. A `resume_analyzer.db` file is created automatically on first run.

To switch to MySQL, set `DB_TYPE=mysql` and the MySQL vars in `.env`.

## Admin Access

Default credentials (change in `.env`):
- Username: `admin`
- Password: `admin@resume-analyzer`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_TYPE` | `sqlite` | `sqlite` or `mysql` |
| `SQLITE_PATH` | `resume_analyzer.db` | SQLite file path |
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASS` | _(empty)_ | MySQL password |
| `MYSQL_DB` | `cv` | MySQL database name |
| `ADMIN_USER` | `admin` | Admin login username |
| `ADMIN_PASS` | `admin@resume-analyzer` | Admin login password |
