import os
from dotenv import load_dotenv
load_dotenv() # Load variables from .env if present

# ── Database ──────────────────────────────────────────────
# SQLite by default — zero config, works everywhere.
# To switch to MySQL set DB_TYPE=mysql and the vars below.
DB_TYPE      = os.getenv("DB_TYPE", "sqlite")           # "sqlite" | "mysql"
SQLITE_PATH  = os.getenv("SQLITE_PATH", "resume_analyzer.db")

MYSQL_HOST   = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER   = os.getenv("MYSQL_USER", "root")
MYSQL_PASS   = os.getenv("MYSQL_PASS", "Priyanshi0310")
MYSQL_DB     = os.getenv("MYSQL_DB",   "cv")

# ── Admin credentials ────────────────────────────────────
ADMIN_USER   = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS   = os.getenv("ADMIN_PASS", "admin@123")

# ── Groq AI ──────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ── App meta ─────────────────────────────────────────────
APP_NAME     = "AI Resume Analyzer"
APP_VERSION  = "2.0"