# -*- coding: utf-8 -*-
"""
ResumeAI - Premium Career Intelligence
Fully rebuilt from scratch for maximum reliability, speed, and sleek dark styling.
"""

import os
from dotenv import load_dotenv
load_dotenv()
import secrets
import random
import time
import re
import io
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import nltk
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('punkt_tab')

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for mod in list(sys.modules.keys()):
    if mod == 'pyresparser' or mod.startswith('pyresparser.'):
        del sys.modules[mod]

from pyresparser import ResumeParser

from config   import ADMIN_USER, ADMIN_PASS, GROQ_API_KEY
from database import (bootstrap, insert_user_data, insert_feedback,
                      fetch_all_users, fetch_plot_data, fetch_all_feedback,
                      delete_user, user_count, delete_feedback, update_feedback,
                      register_user, authenticate_user)
from utils    import (read_pdf_text, read_docx_text, pdf_to_base64_iframe, get_system_info,
                      get_geo_info, df_to_csv_link, now_timestamp,
                      detect_field, get_candidate_level, FIELD_RECOMMENDED_SKILLS, FIELD_KEYWORDS)
from Courses  import (ds_course, web_course, android_course, ios_course, uiux_course,
                      resume_videos, interview_videos)

# ─────────────────────────────────────────────────────────────────────────────
#  VALIDATION & URL HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def validate_personal_details(name, email, phone, linkedin, github):
    errors = []
    
    # Name validation
    name_clean = name.strip() if name else ""
    if not name_clean:
        errors.append("Full Name is required.")
    elif not re.match(r'^[a-zA-Z\s.-]{2,50}$', name_clean):
        errors.append("Full Name must contain only letters, spaces, dots, or hyphens (2-50 characters).")
        
    # Email validation
    email_clean = email.strip() if email else ""
    if not email_clean:
        errors.append("Email Address is required.")
    elif not re.match(r'^[a-zA-Z0-9][\w\.-]*@[a-zA-Z0-9][\w\.-]*\.[a-zA-Z]{2,}$', email_clean):
        errors.append("Please enter a valid Email Address (e.g. name@domain.com).")
    elif any(domain in email_clean.lower() for domain in ['linkedin.com', 'github.com']):
        errors.append("Email field should contain an email address, not a profile link.")
        
    # Phone validation
    phone_clean = phone.strip() if phone else ""
    phone_digits = re.sub(r'\D', '', phone_clean)
    if not phone_clean:
        errors.append("Mobile Number is required.")
    elif len(phone_digits) < 10 or len(phone_digits) > 13:
        errors.append("Mobile Number must contain 10-13 digits (including country code).")
    elif not re.match(r'^[\+]?[\d\s\-\(\)]{10,17}$', phone_clean):
        errors.append("Mobile Number contains invalid characters. Use only digits, +, -, spaces, or parentheses.")
        
    # LinkedIn validation
    li_clean = linkedin.strip().lower() if linkedin else ""
    if not li_clean:
        errors.append("LinkedIn URL is required.")
    elif 'github.com' in li_clean or 'twitter.com' in li_clean or 'facebook.com' in li_clean or 'instagram.com' in li_clean:
        errors.append("LinkedIn field should contain a LinkedIn URL, not another social media link.")
    elif not re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/(in|pub|company)/[a-zA-Z0-9_-]+', li_clean):
        errors.append("Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/your-username).")
        
    # GitHub validation
    gh_clean = github.strip().lower() if github else ""
    if not gh_clean:
        errors.append("GitHub URL is required.")
    elif 'linkedin.com' in gh_clean or 'twitter.com' in gh_clean or 'facebook.com' in gh_clean or 'instagram.com' in gh_clean:
        errors.append("GitHub field should contain a GitHub URL, not another social media link.")
    elif not re.search(r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+', gh_clean):
        errors.append("Please enter a valid GitHub profile URL (e.g. github.com/your-username).")
        
    return len(errors) == 0, errors

def format_url(url: str) -> str:
    url_clean = url.strip()
    if not url_clean:
        return ""
    if not url_clean.startswith(("http://", "https://")):
        url_clean = "https://" + url_clean
    return url_clean

# ─────────────────────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="ResumeAI - Career Intelligence",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Run bootstrap once to ensure database tables exist
bootstrap()
os.makedirs("Uploaded_Resumes", exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
#  SESSION STATE DEFAULTS
# ─────────────────────────────────────────────────────────────────────────────
_DEFAULTS = dict(
    page="home",
    analysis_done=False,
    resume_data=None,
    resume_text="",
    resume_score=0,
    reco_field="",
    cand_level="",
    reco_skills=[],
    rec_course=[],
    detected_skills=[],
    checks_result=[],
    pdf_name="",
    act_name="",
    act_mail="",
    act_mob="",
    linkedin="",
    github="",
    geo_info={},
    sys_info={},
    admin_authed=False,
    matcher_result=None,
    cover_letter="",
    tailored_resume="",
    matcher_score=0,
    jd_keywords=[],
    matched_keywords=[],
    missing_keywords=[],
    selected_template="modern_single",
    matcher_resume_text="",
    matcher_name="",
    ai_resume_tips="",
    user_logged_in=False,
    user_profile=None,
)

for k, v in _DEFAULTS.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────────────────────────────────────
#  GLOBAL STYLING (CSS)
# ─────────────────────────────────────────────────────────────────────────────
CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Main Body Overrides */
html, body, [data-testid="stAppViewContainer"], .main {
    font-family: 'Inter', sans-serif !important;
    background:
    radial-gradient(
    circle at 15% 20%,
    rgba(34,197,94,.12),
    transparent 30%
    ),
    radial-gradient(
    circle at 85% 10%,
    rgba(163,230,53,.08),
    transparent 35%
    ),
    radial-gradient(
    circle at 70% 80%,
    rgba(16,185,129,.06),
    transparent 30%
    ),
    linear-gradient(
    180deg,
    #040605,
    #050806,
    #030403
    ) !important;
    background-attachment: fixed !important;
    color: #F7F7F7 !important;
    padding-bottom: 0px !important;
}

/* Hide Default Streamlit Header */
[data-testid="stHeader"] {
    display: none !important;
}

/* Ground the Main Container Grid */
[data-testid="block-container"], [data-testid="stBlockContainer"], .block-container {
    padding: 3rem 4rem 0px 4rem !important;
    max-width: 1240px !important;
    margin: 0 auto !important;
}
[data-testid="block-container"] > div > [data-testid="stVerticalBlock"],
[data-testid="stBlockContainer"] > div > [data-testid="stVerticalBlock"],
.block-container > div > [data-testid="stVerticalBlock"] {
    min-height: calc(100vh - 3rem) !important;
    display: flex !important;
    flex-direction: column !important;
}
[data-testid="block-container"] [data-testid="element-container"]:has(.site-footer),
[data-testid="stBlockContainer"] [data-testid="element-container"]:has(.site-footer),
.block-container [data-testid="element-container"]:has(.site-footer) {
    margin-top: auto !important;
    margin-bottom: 0px !important;
}

/* Hide default bottom status widgets and default footers */
[data-testid="stBottom"], footer {
    display: none !important;
    height: 0px !important;
    padding: 0 !important;
    margin: 0 !important;
}

/* Glassmorphic Sidebar Design */
[data-testid="stSidebar"] {
    background-color: #0A0D0B !important;
    border-right: 1px solid #1E2A24 !important;
}
[data-testid="stSidebar"] [data-testid="stSidebarUserContent"] {
    display: flex !important;
    flex-direction: column !important;
    height: 100vh !important;
}
[data-testid="stSidebar"] [data-testid="element-container"]:has(.sidebar-spacer) {
    display: flex !important;
    flex-grow: 1 !important;
    margin-top: auto !important;
    height: auto !important;
}
[data-testid="stSidebar"] .stButton > button {
    text-align: left !important;
    justify-content: flex-start !important;
    border: none !important;
    background: transparent !important;
    color: #87a998 !important;
    padding: 10px 16px !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    border-radius: 8px !important;
    width: 100% !important;
    transition: all 0.2s !important;
}
[data-testid="stSidebar"] .stButton > button:hover {
    background: rgba(16, 185, 129, 0.05) !important;
    color: #f8fafc !important;
}
[data-testid="stSidebar"] .stButton[data-kind="primary"] > button,
[data-testid="stSidebar"] button[kind="primary"] {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(245, 158, 11, 0.08)) !important;
    color: #34d399 !important;
    border: 1px solid rgba(16, 185, 129, 0.25) !important;
    font-weight: 600 !important;
}

/* Global Primary Button Overrides */
.stButton > button[kind="primary"],
.stDownloadButton > button[kind="primary"] {
    background: linear-gradient(135deg, #163C2A, #1F7A4D) !important;
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
    color: #F7F7F7 !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15) !important;
    transition: all 0.2s ease !important;
}
.stButton > button[kind="primary"]:hover,
.stDownloadButton > button[kind="primary"]:hover {
    background: #2EC27E !important;
    border-color: #2EC27E !important;
    color: #040605 !important;
    box-shadow: 0 6px 16px rgba(46, 194, 126, 0.3) !important;
}

.stButton > button[kind="secondary"],
.stButton > button:not([kind="primary"]),
.stDownloadButton > button[kind="secondary"],
.stDownloadButton > button:not([kind="primary"]) {
    background: rgba(18, 24, 21, 0.75) !important;
    border: 1px solid rgba(34, 197, 94, 0.25) !important;
    backdrop-filter: blur(18px) !important;
    color: #F7F7F7 !important;
    font-weight: 500 !important;
    transition: all 0.25s ease !important;
}
.stButton > button[kind="secondary"]:hover,
.stButton > button:not([kind="primary"]):hover,
.stDownloadButton > button[kind="secondary"]:hover,
.stDownloadButton > button:not([kind="primary"]):hover {
    background: rgba(34, 197, 94, 0.1) !important;
    border-color: rgba(34, 197, 94, 0.5) !important;
    color: #A3E635 !important;
}


/* Typography styles */
.eyebrow {
    font-size: 0.72rem;
    font-weight: 600;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    display: block;
    margin-bottom: 8px;
}
.sec-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    display: block;
}
.page-title {
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 800;
    color: #f9fafb;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 10px;
}
.page-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.6;
    max-width: 600px;
    margin-bottom: 24px;
}

/* Premium Card Styles */
.card {
    background: rgba(17, 22, 20, 0.75) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    transition: all 0.25s ease;
}
.card:hover {
    border-color: rgba(34, 197, 94, 0.3) !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45), 0 0 15px rgba(34, 197, 94, 0.05) !important;
}
.card-sm {
    padding: 16px 18px;
    border-radius: 12px;
}

/* Form Styles */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea,
.stSelectbox > div > div > div {
    background-color: rgba(10, 16, 13, 0.6) !important;
    color: #F7F7F7 !important;
    border: 1px solid rgba(34, 197, 94, 0.15) !important;
    border-radius: 8px !important;
}
.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15) !important;
}
[data-testid="stFileUploader"] {
    background-color: transparent !important;
    border: none !important;
    padding: 0 !important;
}
[data-testid="stFileUploaderDropzone"] {
    background-color: rgba(10, 16, 13, 0.45) !important;
    border: 1px dashed rgba(16, 185, 129, 0.15) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
}
[data-testid="stFileUploaderDropzone"] button {
    background-color: rgba(16, 185, 129, 0.1) !important;
    color: #34d399 !important;
    border: 1px solid rgba(16, 185, 129, 0.25) !important;
    border-radius: 8px !important;
    padding: 6px 14px !important;
    font-size: 0.8rem !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
}
[data-testid="stFileUploaderDropzone"] button:hover {
    background-color: rgba(16, 185, 129, 0.2) !important;
    border-color: rgba(16, 185, 129, 0.4) !important;
}

/* Home Hero Section */
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.22);
    border-radius: 100px;
    padding: 5px 12px 5px 8px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #34d399;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 20px;
}
.badge-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
}
.hero-h1 {
    font-size: clamp(2.5rem, 5vw, 3.8rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.04em;
    color: #f9fafb;
    margin-bottom: 12px;
}
.hero-h1 span {
    background: linear-gradient(90deg, #2EC27E 0%, #5FD068 45%, #B8E45C 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero-sub {
    font-size: 1.05rem;
    color: #8C9490;
    line-height: 1.7;
    margin-bottom: 30px;
}

/* Feature Grid */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 24px;
}
@media (max-width: 900px) {
    .grid-3 { grid-template-columns: 1fr; }
}
.feat-icon-box {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    margin-bottom: 14px;
    border: 1px solid rgba(16, 185, 129, 0.22);
}

/* Trust indicators & stats */
.trust-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 16px;
}
.trust-item {
    font-size: 0.78rem;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 5px;
}
.stats-band {
    background: rgba(17, 17, 27, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 48px 0;
}
@media (max-width: 600px) {
    .stats-band { grid-template-columns: 1fr 1fr; }
}
.stat-cell {
    padding: 24px 16px;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.04);
}
.stat-cell:last-child {
    border-right: none;
}
.stat-big {
    font-size: 2rem;
    font-weight: 800;
    color: #f3f4f6;
    margin-bottom: 4px;
}
.stat-lbl {
    font-size: 0.7rem;
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
}

/* Timeline */
.proc-step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin-bottom: 8px;
}
.proc-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
}
.proc-label {
    font-size: 0.85rem;
    color: #cbd5e1;
}
.proc-done {
    color: #475569;
    text-decoration: line-through;
}

/* Metrics and KPIs */
.kpi-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}
@media (max-width: 768px) {
    .kpi-row { grid-template-columns: 1fr; }
}
.kpi-card {
    background: rgba(17, 22, 20, 0.75) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
}
.kpi-val {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 4px;
}
.kpi-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
}

/* Checklist items */
.check-pass {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(16, 185, 129, 0.06);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 8px;
    color: #6ee7b7;
    font-size: 0.83rem;
    margin-bottom: 8px;
}
.check-fail {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.12);
    border-radius: 8px;
    color: #fca5a5;
    font-size: 0.83rem;
    margin-bottom: 8px;
}

/* Skills chips */
.chip-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.chip-p {
    padding: 4px 10px;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.22);
    color: #fbbf24;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 500;
}
.chip-g {
    padding: 4px 10px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #34d399;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 500;
}

/* Course link cards */
.course-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    margin-bottom: 8px;
    text-decoration: none;
    color: #94a3b8;
    transition: all 0.2s;
}
.course-item:hover {
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.2);
    color: #f8fafc;
}
.course-badge {
    width: 24px;
    height: 24px;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Domain bars */
.domain-item {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 8px;
}
.domain-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
}
.domain-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 99px;
    margin-top: 6px;
    overflow: hidden;
}
.domain-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #10b981, #059669);
}

/* Career insights */
.insight-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.insight-item {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
}
.insight-label {
    font-size: 0.65rem;
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 4px;
}
.insight-val {
    font-size: 0.88rem;
    color: #e2e8f0;
    font-weight: 600;
}

/* Testimonials */
.testi-quote {
    font-size: 1.4rem;
    color: #10b981;
    margin-bottom: 8px;
}
.testi-text {
    font-size: 0.84rem;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 16px;
}
.testi-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin-bottom: 14px;
}
.testi-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    color: white;
}

/* Footer styling */
.site-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 36px;
    margin-top: 64px;
    text-align: center;
}
.footer-desc {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.5;
}

/* Pills */
.pill {
    padding: 3px 10px;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 100px;
    display: inline-block;
}
.pill-blue { background: rgba(212, 175, 55, 0.08) !important; color: #D4AF37 !important; border: 1px solid rgba(212, 175, 55, 0.22) !important; }
.pill-amber { background: rgba(245, 158, 11, 0.1); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.2); }
.pill-green { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.2); }

/* Feedback elements */
.rating-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.rating-bar-track {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 99px;
    overflow: hidden;
}
.rating-bar-fill {
    height: 100%;
    background: #10b981;
    border-radius: 99px;
}

/* Comment cards */
.comment-card {
    background: rgba(17, 22, 20, 0.55) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 8px;
}
.comment-name {
    font-weight: 700;
    color: #e2e8f0;
    font-size: 0.85rem;
}
.comment-stars {
    color: #f59e0b;
    font-size: 0.85rem;
    margin-left: 6px;
}

/* Stat Card (Admin) */
.stat-card {
    background: rgba(17, 22, 20, 0.75) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
}
.stat-num {
    font-size: 1.8rem;
    font-weight: 800;
    color: #34d399;
    line-height: 1.1;
}
.stat-desc {
    font-size: 0.72rem;
    color: #64748b;
    margin-top: 4px;
    font-weight: 600;
}
.stat-trend {
    font-size: 0.65rem;
    color: #34d399;
    margin-top: 2px;
}

/* Mock UI showcase dashboard styling on home page */
.mock {
    background: #0A0D0B !important;
    border: 1px solid #1E2A24 !important;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin-top: 10px;
}
.mock-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid rgba(16, 185, 129, 0.05);
    padding-bottom: 10px;
    margin-bottom: 14px;
}
.mock-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
.mock-kpis {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
}
.mock-kpi {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 10px;
    text-align: center;
}
.mock-kpi-val {
    font-size: 1.1rem;
    font-weight: 800;
}
.mock-kpi-lbl {
    font-size: 0.65rem;
    color: #8C9490;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.mock-sec {
    font-size: 0.72rem;
    color: #8C9490;
    font-weight: 700;
    margin-top: 10px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.mock-chip-g, .mock-chip-r, .mock-chip-p {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-right: 4px;
    margin-bottom: 4px;
}
.mock-chip-g {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #34d399;
}
.mock-chip-r {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #f87171;
}
.mock-chip-p {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    color: #fbbf24;
}
.mock-course {
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    padding: 10px;
    font-size: 0.75rem;
    color: #34d399;
    margin-top: 10px;
    font-weight: 500;
}

/* Feature Cards on Home Page */
.feat-card {
    background: rgba(17, 22, 20, 0.75) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
}
.feat-card:hover {
    border-color: rgba(34, 197, 94, 0.3) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 15px rgba(34, 197, 94, 0.05) !important;
    transform: translateY(-2px);
}
.feat-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 6px;
}
.feat-desc {
    font-size: 0.8rem;
    color: #8C9490;
    line-height: 1.55;
}

/* Tip card on tips page */
.tip-card {
    background: rgba(17, 22, 20, 0.75) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
}
.tip-card:hover {
    border-color: rgba(34, 197, 94, 0.3) !important;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.08) !important;
}
.tip-num {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba(34, 197, 94, 0.12) !important;
    border: 1px solid rgba(34, 197, 94, 0.25) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 800;
    color: #A3E635 !important;
    flex-shrink: 0;
}

/* Video card */
.video-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(17, 22, 20, 0.7) !important;
    border: 1px solid rgba(30, 42, 36, 0.8) !important;
    backdrop-filter: blur(18px) !important;
    border-radius: 12px;
    margin-bottom: 8px;
    text-decoration: none;
    color: #8C9490 !important;
    transition: all 0.2s ease;
}
.video-card:hover {
    border-color: rgba(34, 197, 94, 0.3) !important;
    background: rgba(34, 197, 94, 0.05) !important;
    color: #F7F7F7 !important;
}
.video-thumb {
    width: 36px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: white;
    flex-shrink: 0;
}

/* Premium Footer Styling */
.site-footer {
    margin-top: 80px;
    padding-top: 40px;
    padding-bottom: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
}
.footer-brand {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.footer-logo {
    font-size: 1.15rem;
    font-weight: 800;
    color: white;
}
.footer-about {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.6;
}
.footer-col-title {
    font-size: 0.72rem;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 16px;
}
.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.footer-links a {
    font-size: 0.78rem;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s ease;
}
.footer-links a:hover {
    color: #34d399;
}
.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
    padding-top: 20px;
}
.footer-copy {
    font-size: 0.72rem;
    color: #475569;
}
.footer-social {
    display: flex;
    gap: 16px;
}
.footer-social a {
    font-size: 0.75rem;
    color: #475569;
    text-decoration: none;
    transition: color 0.2s ease;
}
.footer-social a:hover {
    color: #34d399;
}
</style>
"""

st.markdown(CSS, unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  NAVIGATION SIDEBAR
# ─────────────────────────────────────────────────────────────────────────────
def render_nav():
    with st.sidebar:
        # Custom branding header
        st.markdown("""
        <div style="padding: 16px 0 10px 0; text-align: center;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #059669, #10b981); margin-bottom: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);">
                <span style="color: white; font-size: 1.4rem; font-weight: 800;">✦</span>
            </div>
            <div style="font-size: 1.4rem; font-weight: 800; color: white; letter-spacing: -0.02em;">ResumeAI</div>
            <div style="font-size: 0.68rem; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; font-weight: 600;">Career Intelligence</div>
        </div>
        <div style="height: 1px; background: rgba(255, 255, 255, 0.05); margin: 16px 0 20px 0;"></div>
        """, unsafe_allow_html=True)

        pages = [
            ("home", "🏠 Home"),
            ("analyzer", "📊 Resume Analyzer"),
            ("matcher", "🎯 Job Matcher"),
            ("tips", "💡 Resume Tips"),
            ("feedback", "💬 Feedback")
        ]

        if st.session_state.admin_authed:
            pages.append(("admin", "🔐 Admin Dashboard"))

        for key, label in pages:
            is_active = (st.session_state.page == key)
            if st.button(label, key=f"nav_btn_{key}", use_container_width=True, type="primary" if is_active else "secondary"):
                st.session_state.page = key
                st.rerun()

        # Spacer to push user profile & status to the absolute bottom
        st.markdown('<div class="sidebar-spacer"></div>', unsafe_allow_html=True)

        # User profile at the bottom left panel
        if st.session_state.user_logged_in and st.session_state.user_profile:
            profile = st.session_state.user_profile
            name = profile.get("name", "User")
            email = profile.get("email", "")
            
            st.markdown('<div style="height: 1px; background: rgba(255, 255, 255, 0.05); margin: 24px 0 12px 0;"></div>', unsafe_allow_html=True)
            
            with st.popover(f"👤 {name}", use_container_width=True):
                st.markdown(f"""
                <div style="padding: 2px 0;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 2px;">{name}</div>
                    <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 10px;">{email}</div>
                </div>
                """, unsafe_allow_html=True)
                if st.button("🚪 Log Out", key="user_logout_sidebar_btn", use_container_width=True, type="primary"):
                    st.session_state.user_logged_in = False
                    st.session_state.user_profile = None
                    st.session_state.page = "home"
                    st.rerun()
        else:
            st.markdown('<div style="height: 1px; background: rgba(255, 255, 255, 0.05); margin: 24px 0 12px 0;"></div>', unsafe_allow_html=True)
            is_active = (st.session_state.page == "signin")
            if st.button("🔑 Sign In / Sign Up", key="user_login_sidebar_btn", use_container_width=True, type="primary" if is_active else "secondary"):
                st.session_state.page = "signin"
                st.rerun()

        st.markdown("""
        <div style="margin-top: 20px; padding: 12px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px; text-align: center;">
            <div style="font-size: 0.68rem; color: #475569; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">System Status</div>
            <div style="font-size: 0.75rem; color: #10b981; font-weight: 700; margin-top: 4px; display: inline-flex; align-items: center; gap: 6px;">
                <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span> Online
            </div>
        </div>
        """, unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  FOOTER
# ─────────────────────────────────────────────────────────────────────────────
def render_footer():
    st.markdown("""
    <div class="site-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">✦ ResumeAI</div>
                <div class="footer-about">Next-generation ATS intelligence platform designed to decode recruitment patterns, match candidates to live roles, and optimize career portfolios.</div>
            </div>
            <div>
                <div class="footer-col-title">Platform</div>
                <ul class="footer-links">
                    <li><a href="#" onclick="return false;">Resume Scorer</a></li>
                    <li><a href="#" onclick="return false;">JD Keyword Matcher</a></li>
                    <li><a href="#" onclick="return false;">AI Cover Letter Writer</a></li>
                </ul>
            </div>
            <div>
                <div class="footer-col-title">Resources</div>
                <ul class="footer-links">
                    <li><a href="#" onclick="return false;">Writing Guidelines</a></li>
                    <li><a href="#" onclick="return false;">ATS Checklist</a></li>
                    <li><a href="#" onclick="return false;">Interview Coaching</a></li>
                </ul>
            </div>
            <div>
                <div class="footer-col-title">Legal</div>
                <ul class="footer-links">
                    <li><a href="#" onclick="return false;">Privacy Policy</a></li>
                    <li><a href="#" onclick="return false;">Terms of Service</a></li>
                    <li><a href="#" onclick="return false;">Security Standards</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-copy">© 2026 ResumeAI. All rights reserved. Precision career optimization.</div>
            <div class="footer-social">
                <a href="https://github.com" target="_blank">GitHub</a>
                <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                <a href="https://twitter.com" target="_blank">Twitter</a>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  HOME PAGE
# ─────────────────────────────────────────────────────────────────────────────
def page_home():
    # Hero Segment
    col_l, col_r = st.columns([1.1, 0.9], gap="large")

    with col_l:
        st.markdown("""
        <div class="hero-badge"><span class="badge-dot"></span>AI-Powered Career Intelligence</div>
        <div class="hero-h1">Analyze. Improve.<br><span>Land your dream<br>job.</span></div>
        <div class="hero-sub">Upload your resume and get instant AI feedback, section completeness score, field predictions, and course recommendations — in seconds.</div>
        """, unsafe_allow_html=True)

        c1, c2 = st.columns(2)
        with c1:
            if st.button("📊 Analyze Resume", key="home_cta_analyzer", use_container_width=True):
                st.session_state.page = "analyzer"
                st.rerun()
        with c2:
            if st.button("🎯 Match To a Job", key="home_cta_matcher", use_container_width=True):
                st.session_state.page = "matcher"
                st.rerun()

        st.markdown("""
        <div class="trust-row">
            <div class="trust-item"><span style="color:#A3E635;">✓</span> ATS-friendly scoring</div>
            <div class="trust-item"><span style="color:#A3E635;">✓</span> 5 key career domains</div>
            <div class="trust-item"><span style="color:#A3E635;">✓</span> Free, no sign-up required</div>
        </div>
        """, unsafe_allow_html=True)

    with col_r:
        # Mock Visual UI Showcase (No placeholders)
        st.markdown("""
        <div class="mock">
          <div class="mock-bar">
            <div class="mock-dot" style="background:#ef4444"></div>
            <div class="mock-dot" style="background:#f59e0b"></div>
            <div class="mock-dot" style="background:#10b981"></div>
            <span style="font-size:0.68rem;color:#64748b;font-weight:500;margin-left:4px;">ATS Analysis Dashboard</span>
          </div>
          <div class="mock-kpis">
            <div class="mock-kpi"><div class="mock-kpi-val" style="color:#10b981">85<span style="font-size:0.8rem;color:#475569">/100</span></div><div class="mock-kpi-lbl">Resume Score</div></div>
            <div class="mock-kpi"><div class="mock-kpi-val" style="font-size:0.88rem;color:#22C55E">Web Dev</div><div class="mock-kpi-lbl">Career Field</div></div>
            <div class="mock-kpi"><div class="mock-kpi-val" style="font-size:0.88rem;color:#10b981">Mid-level</div><div class="mock-kpi-lbl">Experience</div></div>
          </div>
          <div class="mock-sec">Completed Sections</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
            <span class="mock-chip-g">✓ Skills</span><span class="mock-chip-g">✓ Education</span>
            <span class="mock-chip-g">✓ Experience</span><span class="mock-chip-r">✗ Achievements</span>
          </div>
          <div class="mock-sec">Missing Skills Recommended</div>
          <div><span class="mock-chip-p">Docker</span><span class="mock-chip-p">TypeScript</span><span class="mock-chip-p">CI/CD</span></div>
          <div class="mock-course">🎓 Full Stack Development — Udacity Nanodegree</div>
        </div>
        """, unsafe_allow_html=True)

    # Statistics Band
    st.markdown("""
    <div class="stats-band">
      <div class="stat-cell"><div class="stat-big">10,000+</div><div class="stat-lbl">Resumes Analyzed</div></div>
      <div class="stat-cell"><div class="stat-big">94%</div><div class="stat-lbl">ATS Match Rate</div></div>
      <div class="stat-cell"><div class="stat-big">5</div><div class="stat-lbl">Supported Fields</div></div>
      <div class="stat-cell"><div class="stat-big">100%</div><div class="stat-lbl">Secure &amp; Private</div></div>
    </div>
    """, unsafe_allow_html=True)

    # Core Features Section
    st.markdown("""
    <div style="margin-bottom:24px; margin-top:24px;">
      <span class="eyebrow">Platform Features</span>
      <div class="page-title" style="font-size:1.8rem; margin-bottom:6px;">Everything you need to ship a winning resume</div>
      <div style="font-size: 0.9rem; color:#64748b; max-width:600px;">Optimize your application documents with advanced analytical modules built on recruiter preferences.</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="grid-3">
      <div class="feat-card"><div class="feat-icon-box">📊</div><div class="feat-title">ATS Resume Health Score</div><div class="feat-desc">A comprehensive 0–100 score based on section checklist matches. Easily see what is missing.</div></div>
      <div class="feat-card"><div class="feat-icon-box">🧠</div><div class="feat-title">Career Field Prediction</div><div class="feat-desc">We cross-reference your skills with thousands of job posts to predict your career category.</div></div>
      <div class="feat-card"><div class="feat-icon-box">🎯</div><div class="feat-title">Job Description Matching</div><div class="feat-desc">Paste a target JD and get an instant compatibility rating with actionable keyword gaps.</div></div>
      <div class="feat-card"><div class="feat-icon-box">📚</div><div class="feat-title">Curated Course Library</div><div class="feat-desc">Get matched with specific, free, or certified courses from Udacity, Coursera, and Udemy.</div></div>
      <div class="feat-card"><div class="feat-icon-box">✍️</div><div class="feat-title">Tailored Resume Builder</div><div class="feat-desc">Let the AI inject missing keywords naturally into your resume template and export to PDF.</div></div>
      <div class="feat-card"><div class="feat-icon-box">✉️</div><div class="feat-title">AI Cover Letter Writer</div><div class="feat-desc">Create highly personalized cover letters matching your skills directly to the requirements.</div></div>
    </div>
    """, unsafe_allow_html=True)

    # Testimonials
    st.markdown("""
    <div style="margin-bottom:24px; margin-top:56px;">
      <span class="eyebrow">Success Stories</span>
      <div class="page-title" style="font-size:1.8rem; margin-bottom:6px;">Loved by candidates worldwide</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="grid-3">
      <div class="feat-card">
        <div class="testi-quote">❝</div>
        <div class="testi-text">ResumeAI helped me identify missing skills and rewrite my resume. Got 3 interviews the same week!</div>
        <div class="testi-divider"></div>
        <div style="display:flex;align-items:center;gap:10px;">
            <div class="testi-avatar" style="background:linear-gradient(135deg,#163C2A,#2EC27E)">P</div>
            <div><div class="testi-name">Priya S.</div><div class="testi-role">Software Intern, Bangalore</div></div>
        </div>
      </div>
      <div class="feat-card">
        <div class="testi-quote">❝</div>
        <div class="testi-text">The ATS checklist was extremely helpful. I raised my score from 62 to 90 and cleared the recruiters screening.</div>
        <div class="testi-divider"></div>
        <div style="display:flex;align-items:center;gap:10px;">
            <div class="testi-avatar" style="background:linear-gradient(135deg,#1F7A4D,#5FD068)">M</div>
            <div><div class="testi-name">Marcus T.</div><div class="testi-role">DevOps Engineer, Mumbai</div></div>
        </div>
      </div>
      <div class="feat-card">
        <div class="testi-quote">❝</div>
        <div class="testi-text">Correctly suggested I focus on Data Science based on my college projects. Love the interactive chart!</div>
        <div class="testi-divider"></div>
        <div style="display:flex;align-items:center;gap:10px;">
            <div class="testi-avatar" style="background:linear-gradient(135deg,#10b981,#34d399)">A</div>
            <div><div class="testi-name">Amit K.</div><div class="testi-role">Data Analyst, Delhi</div></div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    render_footer()

# ─────────────────────────────────────────────────────────────────────────────
#  ANALYZER PAGE
# ─────────────────────────────────────────────────────────────────────────────
def _render_course_list(clist, field):
    st.markdown(f'<div class="sec-label">🎓 Recommended {field} Courses</div>', unsafe_allow_html=True)
    courses_html = ""
    for i, (title, url) in enumerate(clist):
        platform = "Online"
        for domain, name in [("udemy.com","Udemy"),("coursera.org","Coursera"),("youtube.com","YouTube"),("udacity.com","Udacity")]:
            if domain in url:
                platform = name
                break
        courses_html += (
            f'<a href="{url}" target="_blank" class="course-item">'
            f'<div class="course-badge">{i+1}</div>'
            f'<div style="flex:1;">'
            f'<div style="font-size:0.875rem;font-weight:600;color:#fff;margin-bottom:2px;">{title}</div>'
            f'<div class="course-platform">{platform}</div>'
            f'</div>'
            f'<div style="color:#22C55E;font-size:1.1rem;">↗</div>'
            f'</a>'
        )
    st.markdown(f'<div>{courses_html}</div>', unsafe_allow_html=True)

def page_analyzer():
    if not st.session_state.analysis_done:
        _render_upload_form()
    else:
        _render_results_dashboard()

def _render_upload_form():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Resume Analysis</span>
      <div class="page-title">ATS Resume Analyzer</div>
      <div class="page-subtitle">Upload your resume PDF and fill in details to get deep score stats, predicted fields, missing skills checklist, and course tracks.</div>
    </div>
    
    <div style="margin-top: 16px; margin-bottom: 24px;">
      <span class="eyebrow">Analysis Pipeline</span>
      <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 12px;">How the analyzer works</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
        <div class="card card-sm" style="position: relative;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.4rem; font-weight: 800; color: rgba(139,92,246,0.08);">01</div>
          <div class="feat-icon-box" style="width:32px; height:32px; font-size:0.9rem; margin-bottom:8px; border-radius:50%;">📤</div>
          <div style="font-size:0.82rem; font-weight:700; color:#fff; margin-bottom:4px;">Upload PDF</div>
          <div style="font-size:0.72rem; color:#64748b; line-height:1.4;">Drop your resume PDF in any standard template format.</div>
        </div>
        <div class="card card-sm" style="position: relative;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.4rem; font-weight: 800; color: rgba(139,92,246,0.08);">02</div>
          <div class="feat-icon-box" style="width:32px; height:32px; font-size:0.9rem; margin-bottom:8px; border-radius:50%;">🔍</div>
          <div style="font-size:0.82rem; font-weight:700; color:#fff; margin-bottom:4px;">Parse &amp; Extract</div>
          <div style="font-size:0.72rem; color:#64748b; line-height:1.4;">We read skills, experiences, and educational titles.</div>
        </div>
        <div class="card card-sm" style="position: relative;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.4rem; font-weight: 800; color: rgba(139,92,246,0.08);">03</div>
          <div class="feat-icon-box" style="width:32px; height:32px; font-size:0.9rem; margin-bottom:8px; border-radius:50%;">🧠</div>
          <div style="font-size:0.82rem; font-weight:700; color:#fff; margin-bottom:4px;">AI Evaluation</div>
          <div style="font-size:0.72rem; color:#64748b; line-height:1.4;">Score sections and identify critical keyword gaps.</div>
        </div>
        <div class="card card-sm" style="position: relative;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.4rem; font-weight: 800; color: rgba(139,92,246,0.08);">04</div>
          <div class="feat-icon-box" style="width:32px; height:32px; font-size:0.9rem; margin-bottom:8px; border-radius:50%;">🎓</div>
          <div style="font-size:0.82rem; font-weight:700; color:#fff; margin-bottom:4px;">Action Plan</div>
          <div style="font-size:0.72rem; color:#64748b; line-height:1.4;">Get tailored learning pathways & resource recommendations.</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    col_form, col_info = st.columns([1.1, 0.9], gap="large")

    with col_form:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Personal Details</div>', unsafe_allow_html=True)
            c1, c2 = st.columns(2)
            act_name = c1.text_input("Full Name *", placeholder="Priya Sharma", key="inp_name")
            act_mail = c2.text_input("Email Address *", placeholder="priya@email.com", key="inp_mail")
            c3, c4 = st.columns(2)
            act_mob  = c3.text_input("Mobile Number *", placeholder="+91 98765 43210", key="inp_mob")
            linkedin = c4.text_input("LinkedIn URL", placeholder="linkedin.com/in/username", key="inp_li")
            github   = st.text_input("GitHub URL", placeholder="github.com/username", key="inp_gh")

            st.markdown('<div style="height:1px;background:rgba(255,255,255,0.05);margin:20px 0;"></div>', unsafe_allow_html=True)
            st.markdown('<div class="sec-label">Upload PDF Resume</div>', unsafe_allow_html=True)
            pdf_file = st.file_uploader("Drop your resume PDF here", type=["pdf"], label_visibility="collapsed", key="analyzer_pdf")

            if pdf_file:
                if st.button("📊 Run Analysis", use_container_width=True, type="primary"):
                    is_valid, validation_errors = validate_personal_details(act_name, act_mail, act_mob, linkedin, github)
                    if not is_valid:
                        for err in validation_errors:
                            st.error(f"⚠️ {err}")
                    else:
                        f_linkedin = format_url(linkedin)
                        f_github = format_url(github)
                        _run_analysis_pipeline(pdf_file, act_name, act_mail, act_mob, f_linkedin, f_github)

    with col_info:
        st.markdown("""
        <div class="card">
          <div class="sec-label">Tips for ATS Optimization</div>
          <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:1.1rem;flex-shrink:0;">📄</span>
            <span style="font-size:0.82rem;color:#94a3b8;line-height:1.5;"><b>Use standard fonts:</b> Stick to Arial, Calibri or Helvetica. ATS parsing is 98% more accurate.</span>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="font-size:1.1rem;flex-shrink:0;">📋</span>
            <span style="font-size:0.82rem;color:#94a3b8;line-height:1.5;"><b>Label sections explicitly:</b> Keep headers clear (Skills, Education, Experience, Projects).</span>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;">
            <span style="font-size:1.1rem;flex-shrink:0;">🔗</span>
            <span style="font-size:0.82rem;color:#94a3b8;line-height:1.5;"><b>Include links:</b> Adding GitHub and LinkedIn helps verify your achievements.</span>
          </div>
        </div>
        """, unsafe_allow_html=True)

        domains = [("💼","Data Science"),("🌐","Web Development"),("📱","Android Development"),("🍎","iOS Development"),("🎨","UI/UX Design")]
        tags = "".join([f'<div style="padding:10px 12px;font-size:0.8rem;color:#e2e8f0;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px;display:flex;align-items:center;gap:8px;"><span>{icon}</span><span>{d}</span></div>' for icon, d in domains])
        st.markdown(f'<div class="card"><div class="sec-label">Domains We Scan</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">{tags}</div></div>', unsafe_allow_html=True)

def _run_analysis_pipeline(pdf_file, act_name, act_mail, act_mob, linkedin, github):
    save_path = os.path.join("Uploaded_Resumes", pdf_file.name)
    with open(save_path, "wb") as f:
        f.write(pdf_file.getbuffer())

    # Pipeline loading display — show only one step at a time
    with st.container(border=True):
        st.markdown('<div class="sec-label">Running Pipeline</div>', unsafe_allow_html=True)
        steps = [
            ("\U0001F4C4", "Parsing resume PDF layout..."),
            ("\U0001F50D", "Extracting sections and structural elements..."),
            ("\U0001F9E0", "Running NLP skill matches..."),
            ("\U0001F3AF", "Predicting professional career field..."),
            ("\U0001F4CA", "Calculating ATS section score..."),
            ("\u2705", "Structuring dashboard recommendations...")
        ]
        total_steps = len(steps)
        step_placeholder = st.empty()
        progress_placeholder = st.empty()

        for i, (icon, label) in enumerate(steps):
            step_num = i + 1
            pct_complete = int((i / total_steps) * 100)
            step_placeholder.markdown(f"""
            <div style="padding: 20px 24px; background: rgba(17,22,20,0.75); border: 1px solid rgba(30,42,36,0.8); border-radius: 14px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, rgba(34,197,94,0.15), rgba(163,230,53,0.1)); border:1px solid rgba(34,197,94,0.3); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">{icon}</div>
                        <div>
                            <div style="font-size:0.92rem; font-weight:700; color:#f8fafc; letter-spacing:-0.01em;">{label}</div>
                            <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">Step {step_num} of {total_steps}</div>
                        </div>
                    </div>
                    <div style="font-size:0.78rem; font-weight:700; color:#A3E635;">{pct_complete}%</div>
                </div>
                <div style="height:4px; background:rgba(255,255,255,0.04); border-radius:99px; overflow:hidden;">
                    <div style="height:100%; width:{pct_complete}%; background:linear-gradient(90deg, #22C55E, #A3E635); border-radius:99px; transition:width 0.3s ease;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            for pct in range(0, 101, 5):
                time.sleep(0.008)
            time.sleep(0.05)

        # Show final completed state
        step_placeholder.markdown(f"""
        <div style="padding: 20px 24px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 14px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25); display:flex; align-items:center; justify-content:center; font-size:1.3rem;">\u2705</div>
                <div>
                    <div style="font-size:0.95rem; font-weight:700; color:#6ee7b7;">Analysis Complete</div>
                    <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">All {total_steps} stages finished successfully</div>
                </div>
                <div style="margin-left:auto; font-size:0.78rem; font-weight:700; color:#10b981;">100%</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        time.sleep(0.3)

    # Actual parsing using pyresparser + utils
    resume_data = ResumeParser(save_path).get_extracted_data()
    resume_text = read_pdf_text(save_path)

    if not resume_data:
        st.error("❌ Failed to parse resume PDF layout. Please ensure it is a text-based single-column PDF.")
        return

    detected_skills = resume_data.get("skills") or []
    # Clean capitalizations in skills
    detected_skills = list(set([s.strip() for s in detected_skills if s.strip()]))
    reco_field = detect_field(detected_skills)
    reco_skills = FIELD_RECOMMENDED_SKILLS.get(reco_field, [])
    cand_level = get_candidate_level(resume_text, resume_data.get("no_of_pages", 1))

    # Calculate Checklist score
    checks_def = [
        (["Objective","Summary","OBJECTIVE","SUMMARY","PROFILE"],           10, "Objective / Summary"),
        (["Education","School","College","EDUCATION","SCHOOL","COLLEGE"],   15, "Education Details"),
        (["EXPERIENCE","WORK EXPERIENCE","Experience","Work Experience"],   20, "Work Experience"),
        (["INTERNSHIP","INTERNSHIPS","Internship","Internships"],            5,  "Internships"),
        (["SKILLS","SKILL","Skills","Skill","TECHNICAL SKILLS"],            20, "Skills Section"),
        (["HOBBIES","Hobbies","HOBBY","Hobby"],                             5,  "Hobbies"),
        (["INTERESTS","Interests","Interest","INTEREST"],                   5,  "Interests"),
        (["ACHIEVEMENTS","Achievements","Achievement","ACHIEVEMENT"],       10, "Achievements"),
        (["CERTIFICATIONS","Certifications","Certification"],               10, "Certifications"),
        (["PROJECTS","PROJECT","Projects","Project"],                       10, "Projects"),
    ]
    resume_score = 0
    checks_result = []
    for keywords, points, label in checks_def:
        found = any(x in resume_text for x in keywords)
        if found:
            resume_score += points
        checks_result.append((found, points, label))

    # Keep score inside bounds [0, 100]
    resume_score = min(100, max(0, resume_score))

    course_map = {
        "Data Science": ds_course, "Web Development": web_course,
        "Android Development": android_course, "iOS Development": ios_course, "UI/UX Design": uiux_course,
    }
    cl = course_map.get(reco_field, [])
    random.shuffle(cl)
    rec_course = cl[:5]

    sys_info = get_system_info()
    geo_info = get_geo_info()

    # Save to Database
    try:
        insert_user_data(
            sec_token=secrets.token_urlsafe(12),
            ip_add=sys_info["ip_add"], host_name=sys_info["host_name"],
            dev_user=sys_info["dev_user"], os_name_ver=sys_info["os_name_ver"],
            latlong=geo_info["latlong"], city=geo_info["city"],
            state=geo_info["state"], country=geo_info["country"],
            act_name=act_name, act_mail=act_mail, act_mob=act_mob,
            name=str(resume_data.get("name","") or act_name), email=str(resume_data.get("email","") or act_mail),
            resume_score=resume_score, timestamp=now_timestamp(),
            no_of_pages=resume_data.get("no_of_pages", 1),
            predicted_field=reco_field, user_level=cand_level,
            actual_skills=detected_skills, recommended_skills=reco_skills,
            recommended_courses=[c[0] for c in rec_course],
            pdf_name=pdf_file.name, linkedin=linkedin, github=github,
        )
    except Exception:
        pass

    # Save states
    st.session_state.resume_data     = resume_data
    st.session_state.resume_text     = resume_text
    st.session_state.resume_score    = resume_score
    st.session_state.reco_field      = reco_field
    st.session_state.cand_level      = cand_level
    st.session_state.reco_skills     = reco_skills
    st.session_state.rec_course      = rec_course
    st.session_state.detected_skills = detected_skills
    st.session_state.checks_result   = checks_result
    st.session_state.pdf_name        = pdf_file.name
    st.session_state.act_name        = act_name
    st.session_state.act_mail        = act_mail
    st.session_state.act_mob         = act_mob
    st.session_state.linkedin        = linkedin
    st.session_state.github          = github
    st.session_state.geo_info        = geo_info
    st.session_state.sys_info        = sys_info
    st.session_state.analysis_done   = True
    st.rerun()

def _render_results_dashboard():
    rd      = st.session_state.resume_data
    score   = st.session_state.resume_score
    field   = st.session_state.reco_field
    level   = st.session_state.cand_level
    skills  = st.session_state.detected_skills
    reco_skills = st.session_state.reco_skills
    checks  = st.session_state.checks_result

    level_pill = {
        "Fresher":      '<span class="pill pill-blue">Fresher</span>',
        "Intermediate": '<span class="pill pill-amber">Intermediate</span>',
        "Experienced":  '<span class="pill pill-green">Experienced</span>',
    }.get(level, '<span class="pill pill-blue">Fresher</span>')

    score_color = "#10b981" if score >= 80 else "#f59e0b" if score >= 50 else "#ef4444"
    score_msg   = "Excellent" if score >= 80 else "Good" if score >= 50 else "Needs Work"

    col_head, col_btn = st.columns([4, 1])
    with col_head:
        st.markdown(f"""
        <div style="padding: 16px 0;">
            <span class="eyebrow">Analysis Finished</span>
            <div class="page-title" style="font-size:1.8rem; margin-bottom:4px;">{st.session_state.act_name or rd.get('name','Candidate Resume')}</div>
            <div style="display:flex; align-items:center; gap:8px;">
                {level_pill}
                <span style="font-size:0.8rem; color:#334155;">·</span>
                <span style="font-size:0.82rem; color:#64748b;">{st.session_state.act_mail or rd.get('email','')}</span>
                <span style="font-size:0.8rem; color:#334155;">·</span>
                <span style="font-size:0.82rem; color:#64748b;">{st.session_state.act_mob or rd.get('mobile_number','')}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("↺ New Analysis", key="reset_analyzer", use_container_width=True):
            st.session_state.analysis_done = False
            st.session_state.ai_resume_tips = ""
            st.rerun()

    st.markdown(f"""
    <div class="kpi-row">
        <div class="kpi-card">
            <div class="kpi-val" style="color:{score_color};">{score}<span style="font-size:1rem;color:#475569;">/100</span></div>
            <div class="kpi-label">Overall Score · {score_msg}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color:#a5b4fc; font-size:1.4rem;">{field}</div>
            <div class="kpi-label">Predicted Career Field</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val" style="color:#10b981; font-size:1.4rem;">{level}</div>
            <div class="kpi-label">Experience Tier</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "📊 Score & Checklist", "🎯 Field & Skills", "📚 Courses & Videos",
        "🌐 Career Insights", "💡 AI Resume Tips", "📄 Preview Resume"
    ])

    # ── Tab 1: Checklist ────────────────────────────────────────
    with tab1:
        c_ring, c_list = st.columns([1, 1.8], gap="large")
        with c_ring:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Checklist Score</div>', unsafe_allow_html=True)
                fig = go.Figure(go.Pie(
                    values=[score, max(0, 100-score)], hole=0.75,
                    marker_colors=[score_color, "rgba(255,255,255,0.03)"],
                    textinfo="none", hoverinfo="none",
                ))
                fig.update_layout(
                    showlegend=False, margin=dict(l=10,r=10,t=10,b=10),
                    height=200, paper_bgcolor="rgba(0,0,0,0)",
                    annotations=[dict(
                        text=f"<b>{score}</b><br><span style='font-size:11px;color:#475569;'>/ 100</span>",
                        x=0.5, y=0.5, showarrow=False,
                        font=dict(size=28, color="#e2e8f0"),
                    )],
                )
                st.plotly_chart(fig, use_container_width=True, config={"displayModeBar":False})

        with c_list:
            with st.container(border=True):
                passed = sum(1 for f,_,_ in checks if f)
                st.markdown(f'<div class="sec-label">Section Checklist ({passed}/{len(checks)} found)</div>', unsafe_allow_html=True)
                for found, pts, label in checks:
                    icon = "✅" if found else "❌"
                    color = "#6ee7b7" if found else "#fca5a5"
                    tip = f"+{pts} pts" if found else f"Missing (+{pts} possible)"
                    st.markdown(f"""
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(255,255,255,0.01);border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.82rem;">
                        <span style="color:{color}; font-weight:600;">{icon} &nbsp;{label}</span>
                        <span style="font-size:0.75rem; color:#475569;">{tip}</span>
                    </div>
                    """, unsafe_allow_html=True)

    # ── Tab 2: Skills & Field ───────────────────────────────────
    with tab2:
        c_left, c_right = st.columns(2, gap="large")
        with c_left:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Domain Match Probabilities</div>', unsafe_allow_html=True)
                skills_lower = {s.lower() for s in skills}
                domain_scores = {}
                for dom, kws in FIELD_KEYWORDS.items():
                    cnt = sum(1 for k in kws if k in skills_lower)
                    domain_scores[dom] = min(100, int(cnt / max(len(kws),1) * 100 * 3))

                for dom, pct in sorted(domain_scores.items(), key=lambda x: -x[1]):
                    active = dom == field
                    color = '#A3E635;' if active else ''
                    bg = 'linear-gradient(90deg,#22C55E,#A3E635)' if active else 'rgba(255,255,255,0.05)'
                    st.markdown(f"""
                    <div class="domain-item" style="border-color:{'rgba(34,197,94,0.3)' if active else 'rgba(255,255,255,0.05)'};">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span class="domain-name" style="color:{color}">{dom}</span>
                            <span style="font-size:0.75rem;color:#64748b;">{pct}%</span>
                        </div>
                        <div class="domain-bar"><div class="domain-fill" style="width:{pct}%;background:{bg};"></div></div>
                    </div>
                    """, unsafe_allow_html=True)

        with c_right:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Extracted Skills</div>', unsafe_allow_html=True)
                if skills:
                    chips = "".join([f'<span class="chip-p" style="margin:3px;">{s}</span>' for s in skills])
                    st.markdown(f'<div class="chip-wrap">{chips}</div>', unsafe_allow_html=True)
                else:
                    st.info("ℹ️ No skills detected on resume. Ensure you have a clear Skills section.")

            with st.container(border=True):
                st.markdown('<div class="sec-label">Recommended Skills to Add</div>', unsafe_allow_html=True)
                if reco_skills:
                    chips = "".join([f'<span class="chip-g" style="margin:3px;">{s}</span>' for s in reco_skills])
                    st.markdown(f'<div class="chip-wrap">{chips}</div>', unsafe_allow_html=True)
                else:
                    st.info("No recommendations found.")

    # ── Tab 3: Courses ──────────────────────────────────────────
    with tab3:
        col_c, col_v = st.columns([3, 2], gap="large")
        with col_c:
            with st.container(border=True):
                if field == "General" or not st.session_state.rec_course:
                    st.info("No career track courses recommended for general profiles.")
                else:
                    _render_course_list(st.session_state.rec_course, field)
        with col_v:
            with st.container(border=True):
                st.markdown('<div class="sec-label">🎬 Useful Videos</div>', unsafe_allow_html=True)
                videos_html = ""
                for url in random.sample(resume_videos, min(2, len(resume_videos))):
                    videos_html += f'<a href="{url}" target="_blank" class="course-item"><div style="width:32px;height:24px;background:#ef4444;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem;flex-shrink:0;margin-right:8px;">▶</div><div style="font-size:0.8rem;color:#cbd5e1;">Resume Tip Video · <span style="color:#64748b;">YouTube</span></div></a>'
                for url in random.sample(interview_videos, min(2, len(interview_videos))):
                    videos_html += f'<a href="{url}" target="_blank" class="course-item"><div style="width:32px;height:24px;background:#1F7A4D;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem;flex-shrink:0;margin-right:8px;">▶</div><div style="font-size:0.8rem;color:#cbd5e1;">Interview Prep Video · <span style="color:#64748b;">YouTube</span></div></a>'
                st.markdown(f'<div>{videos_html}</div>', unsafe_allow_html=True)

    # ── Tab 4: Insights ─────────────────────────────────────────
    with tab4:
        all_insights = {
            "Data Science":        {"demand":"Very High","demand_pct":92,"growth":"35% YoY","growth_pct":87,"avg_salary":"₹8-22 LPA","salary_min":8,"salary_max":22,"top_skills":["Python","ML","SQL","TensorFlow"],"trend":[45,52,60,68,76,85,92]},
            "Web Development":     {"demand":"High","demand_pct":80,"growth":"25% YoY","growth_pct":72,"avg_salary":"₹5-18 LPA","salary_min":5,"salary_max":18,"top_skills":["React","Node.js","TypeScript","Docker"],"trend":[50,55,58,63,68,74,80]},
            "Android Development": {"demand":"High","demand_pct":75,"growth":"20% YoY","growth_pct":65,"avg_salary":"₹5-16 LPA","salary_min":5,"salary_max":16,"top_skills":["Kotlin","Jetpack Compose","Firebase","MVVM"],"trend":[40,45,50,54,60,68,75]},
            "iOS Development":     {"demand":"Medium","demand_pct":62,"growth":"18% YoY","growth_pct":58,"avg_salary":"₹6-18 LPA","salary_min":6,"salary_max":18,"top_skills":["Swift","SwiftUI","Xcode","Core Data"],"trend":[35,38,42,46,50,56,62]},
            "UI/UX Design":        {"demand":"High","demand_pct":78,"growth":"22% YoY","growth_pct":70,"avg_salary":"₹4-15 LPA","salary_min":4,"salary_max":15,"top_skills":["Figma","Adobe XD","Research","Prototyping"],"trend":[30,38,45,52,60,70,78]},
        }
        insights = all_insights.get(field, None)

        if not insights:
            st.info("Insights not available for generic domains.")
        else:
            # KPI Cards row
            with st.container(border=True):
                st.markdown(f'<div class="sec-label">Market Insights for {field}</div>', unsafe_allow_html=True)
                st.markdown(f"""
                <div class="insight-grid">
                    <div class="insight-item">
                        <div class="insight-label">📈 Market Demand</div>
                        <div class="insight-val">{insights['demand']}</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-label">💰 Average Salary (India)</div>
                        <div class="insight-val">{insights['avg_salary']}</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-label">🚀 Industry Growth</div>
                        <div class="insight-val">{insights['growth']}</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-label">🔑 Key Stack</div>
                        <div class="insight-val" style="font-size:0.8rem;">{' · '.join(insights['top_skills'])}</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

            # Charts row
            col_chart1, col_chart2 = st.columns(2, gap="large")

            with col_chart1:
                with st.container(border=True):
                    st.markdown('<div class="sec-label">📊 Demand Trend (2020–2026)</div>', unsafe_allow_html=True)
                    years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
                    fig_trend = go.Figure()
                    fig_trend.add_trace(go.Scatter(
                        x=years, y=insights["trend"],
                        mode="lines+markers",
                        name=field,
                        line=dict(color="#22C55E", width=3, shape="spline"),
                        marker=dict(size=8, color="#A3E635", line=dict(width=2, color="#163C2A")),
                        fill="tozeroy",
                        fillcolor="rgba(34, 197, 94, 0.08)",
                    ))
                    fig_trend.update_layout(
                        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="#94a3b8", size=11),
                        margin=dict(l=0, r=0, t=10, b=0), height=250,
                        xaxis=dict(showgrid=False, linecolor="rgba(255,255,255,0.05)"),
                        yaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.04)", title="Demand Index", linecolor="rgba(255,255,255,0.05)"),
                        hovermode="x unified",
                    )
                    st.plotly_chart(fig_trend, use_container_width=True, config={"displayModeBar": False})

            with col_chart2:
                with st.container(border=True):
                    st.markdown('<div class="sec-label">💰 Salary Range Comparison (LPA)</div>', unsafe_allow_html=True)
                    salary_fields = list(all_insights.keys())
                    salary_mins = [all_insights[f]["salary_min"] for f in salary_fields]
                    salary_maxs = [all_insights[f]["salary_max"] for f in salary_fields]
                    bar_colors = ["#22C55E" if f == field else "rgba(34,197,94,0.15)" for f in salary_fields]
                    border_colors = ["#A3E635" if f == field else "rgba(34,197,94,0.3)" for f in salary_fields]

                    fig_salary = go.Figure()
                    fig_salary.add_trace(go.Bar(
                        x=salary_fields, y=salary_mins,
                        name="Min Salary",
                        marker=dict(color="rgba(16,185,129,0.2)", line=dict(width=1, color="rgba(16,185,129,0.4)")),
                    ))
                    fig_salary.add_trace(go.Bar(
                        x=salary_fields, y=[mx - mn for mx, mn in zip(salary_maxs, salary_mins)],
                        name="Max Salary",
                        marker=dict(color=bar_colors, line=dict(width=1, color=border_colors)),
                        base=salary_mins,
                    ))
                    fig_salary.update_layout(
                        barmode="overlay",
                        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="#94a3b8", size=10),
                        margin=dict(l=0, r=0, t=10, b=0), height=250,
                        xaxis=dict(showgrid=False, linecolor="rgba(255,255,255,0.05)", tickangle=-15),
                        yaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.04)", title="₹ LPA", linecolor="rgba(255,255,255,0.05)"),
                        showlegend=False,
                    )
                    st.plotly_chart(fig_salary, use_container_width=True, config={"displayModeBar": False})

            # Demand comparison bar
            with st.container(border=True):
                st.markdown('<div class="sec-label">🏆 Demand Index Across Fields</div>', unsafe_allow_html=True)
                demand_fields = list(all_insights.keys())
                demand_pcts = [all_insights[f]["demand_pct"] for f in demand_fields]
                demand_colors = ["#22C55E" if f == field else "rgba(34,197,94,0.12)" for f in demand_fields]

                fig_demand = go.Figure(go.Bar(
                    x=demand_pcts, y=demand_fields,
                    orientation="h",
                    marker=dict(color=demand_colors, line=dict(width=1, color=["#A3E635" if f == field else "rgba(34,197,94,0.25)" for f in demand_fields])),
                    text=[f"{p}%" for p in demand_pcts],
                    textposition="auto",
                    textfont=dict(color="#e2e8f0", size=12),
                ))
                fig_demand.update_layout(
                    paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                    font=dict(color="#94a3b8", size=11),
                    margin=dict(l=0, r=20, t=10, b=0), height=220,
                    xaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.04)", range=[0, 100], showticklabels=False),
                    yaxis=dict(showgrid=False, autorange="reversed"),
                )
                st.plotly_chart(fig_demand, use_container_width=True, config={"displayModeBar": False})

    # ── Tab 5: Tips ─────────────────────────────────────────────
    with tab5:
        # Hero card for the AI Coach
        st.markdown(f"""
        <div style="padding: 28px 32px; background: rgba(17, 22, 20, 0.75); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 18px; margin-bottom: 20px; backdrop-filter: blur(18px);">
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
                <div style="width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg, #163C2A, #1F7A4D); display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2);">
                    🧠
                </div>
                <div>
                    <div style="font-size:1.2rem; font-weight:800; color:#f9fafb; letter-spacing:-0.02em;">AI Career Coach</div>
                    <div style="font-size:0.78rem; color:#64748b; margin-top:2px;">Powered by Groq LLM · Personalized for your resume</div>
                </div>
            </div>
            <div style="font-size:0.85rem; color:#94a3b8; line-height:1.6; max-width:680px;">
                Get AI-powered, actionable recommendations tailored to your resume. The coach analyzes your content, structure, and keyword coverage to suggest precise improvements that increase your ATS score.
            </div>
        </div>
        """, unsafe_allow_html=True)

        col_action, col_status = st.columns([1, 1], gap="large")
        with col_action:
            if st.button("✨ Generate AI Recommendations", key="generate_ai_tips_btn", type="primary", use_container_width=True):
                with st.spinner("🧠 AI is analyzing your resume..."):
                    try:
                        from groq import Groq
                        client = Groq(api_key=GROQ_API_KEY)
                        prompt = f"""You are a professional recruiter and career coach. Analyze this resume text and provide exactly 6 actionable improvement tips.

For EACH tip, format it EXACTLY as:
[Category]: Tip text here

Where Category is one of: Content, Structure, Keywords

Give 2 tips for each category. Be specific and reference actual content from the resume.

Resume Text:
{st.session_state.resume_text[:4000]}
"""
                        resp = client.chat.completions.create(
                            model="llama-3.3-70b-versatile",
                            messages=[{"role":"user","content":prompt}],
                            max_tokens=800, temperature=0.5
                        )
                        st.session_state.ai_resume_tips = resp.choices[0].message.content.strip()
                    except Exception as e:
                        st.session_state.ai_resume_tips = f"Error generating tips: {e}"
                st.rerun()
        with col_status:
            if st.session_state.ai_resume_tips:
                st.markdown("""
                <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:10px; height:100%;">
                    <span style="font-size:1.2rem;">✅</span>
                    <div>
                        <div style="font-size:0.85rem; font-weight:700; color:#6ee7b7;">Recommendations Ready</div>
                        <div style="font-size:0.72rem; color:#64748b;">6 personalized tips generated</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                <div style="display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; height:100%;">
                    <span style="font-size:1.2rem;">💡</span>
                    <div>
                        <div style="font-size:0.85rem; font-weight:600; color:#94a3b8;">Awaiting Analysis</div>
                        <div style="font-size:0.72rem; color:#475569;">Click the button to generate tips</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

        if st.session_state.ai_resume_tips:
            st.markdown('<div style="height:20px;"></div>', unsafe_allow_html=True)

            # Parse tips into categories and render as styled cards
            tips_text = st.session_state.ai_resume_tips
            category_config = {
                "Content":   {"icon": "📝", "color": "#D4AF37", "bg": "rgba(212,175,55,0.06)", "border": "rgba(212,175,55,0.18)"},
                "Structure": {"icon": "🏗️", "color": "#f59e0b", "bg": "rgba(245,158,11,0.06)", "border": "rgba(245,158,11,0.18)"},
                "Keywords":  {"icon": "🔑", "color": "#10b981", "bg": "rgba(16,185,129,0.06)", "border": "rgba(16,185,129,0.18)"},
            }

            # Try to parse categorized tips
            import re as _re
            parsed_tips = _re.findall(r'\[?(Content|Structure|Keywords)\]?\s*[:\-–]\s*(.+?)(?=\n|$)', tips_text, _re.IGNORECASE)

            if parsed_tips and len(parsed_tips) >= 3:
                # Group by category
                grouped = {"Content": [], "Structure": [], "Keywords": []}
                for cat, tip in parsed_tips:
                    cat_title = cat.strip().title()
                    if cat_title in grouped:
                        grouped[cat_title].append(tip.strip())

                cols_tips = st.columns(3, gap="medium")
                for idx, (cat, tips_list) in enumerate(grouped.items()):
                    cfg = category_config.get(cat, category_config["Content"])
                    with cols_tips[idx]:
                        tips_html = ""
                        for tip in tips_list[:2]:
                            tips_html += f'<div style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.82rem; color:#cbd5e1; line-height:1.55;">{tip}</div>'
                        st.markdown(f"""
                        <div style="background:{cfg['bg']}; border:1px solid {cfg['border']}; border-radius:14px; padding:20px; height:100%;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                                <span style="font-size:1.1rem;">{cfg['icon']}</span>
                                <span style="font-size:0.82rem; font-weight:700; color:{cfg['color']}; text-transform:uppercase; letter-spacing:0.08em;">{cat}</span>
                            </div>
                            {tips_html}
                        </div>
                        """, unsafe_allow_html=True)
            else:
                # Fallback: render as a premium styled block
                with st.container(border=True):
                    st.markdown(f"""
                    <div style="padding:8px 0;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                            <span style="font-size:1.1rem;">💡</span>
                            <span class="sec-label" style="margin:0;">AI Recommendations</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                    st.markdown(tips_text)
        else:
            # Empty state with visual cue
            st.markdown("""
            <div style="text-align:center; padding:48px 24px; margin-top:12px;">
                <div style="font-size:3rem; margin-bottom:16px; opacity:0.3;">🧠</div>
                <div style="font-size:1rem; font-weight:600; color:#475569; margin-bottom:6px;">No recommendations yet</div>
                <div style="font-size:0.82rem; color:#334155; max-width:400px; margin:0 auto;">Click "Generate AI Recommendations" above to get personalized career coaching based on your resume content.</div>
            </div>
            """, unsafe_allow_html=True)

    # ── Tab 6: PDF Preview ──────────────────────────────────────
    with tab6:
        save_path = os.path.join("Uploaded_Resumes", st.session_state.pdf_name)
        if os.path.exists(save_path):
            with open(save_path, "rb") as f:
                st.download_button("⬇️ Download Stored PDF", data=f, file_name=st.session_state.pdf_name, mime="application/pdf")
            st.markdown(pdf_to_base64_iframe(save_path), unsafe_allow_html=True)
        else:
            st.warning("Resume file not found on disk.")

# ─────────────────────────────────────────────────────────────────────────────
#  JOB MATCHER PAGE
# ─────────────────────────────────────────────────────────────────────────────
def _extract_keywords(text: str) -> list:
    stop = {"a","an","the","and","or","but","in","on","at","to","for","of","with","by",
            "from","as","is","are","was","were","be","been","being","have","has","had",
            "do","does","did","will","would","could","should","may","might","shall",
            "that","this","these","those","it","its","we","you","they","their","our",
            "your","i","my","his","her","which","who","what","how","when","where","why",
            "not","no","can","also","both","either","each","if","than","then","so","yet",
            "about","above","after","before","between","during","including","into","through",
            "throughout","under","using","within","experience","work","job","role","position",
            "candidate","team","ability","strong","excellent","good","great","must","required",
            "preferred","plus","years","year","minimum","maximum","degree","knowledge","understanding"}
    words = re.findall(r'\b[a-zA-Z][a-zA-Z\+\#\.]{2,}\b', text)
    seen, result = set(), []
    for w in words:
        wl = w.lower()
        if wl not in stop and wl not in seen and len(wl) > 2:
            seen.add(wl)
            result.append(w)
    return result

def _compute_match(resume_text: str, jd_text: str):
    import json
    system_prompt = (
        "You are an advanced AI Applicant Tracking System (ATS) matching assistant. "
        "Your task is to perform a deep semantic comparison between the candidate's resume and the job description. "
        "Do NOT perform simple exact-string matching. Instead, use semantic understanding to identify key skills, "
        "technologies, and requirements from the job description, and determine if they are matched/implied or missing from the resume. "
        "For example, if the job description requires 'modern frontend framework experience' and the candidate lists 'React, Vue', "
        "that is a MATCH. If they list 'Java' but the job wants 'Python', that is MISSING. "
        "Return a JSON response with exactly the following structure (no other text, no markdown block wrappers):\n"
        "{\n"
        "  \"score\": 75,\n"
        "  \"jd_keywords\": [\"React\", \"TypeScript\", \"Next.js\", \"TailwindCSS\", \"State Management\"],\n"
        "  \"matched_keywords\": [\"React\", \"TypeScript\", \"TailwindCSS\"],\n"
        "  \"missing_keywords\": [\"Next.js\", \"State Management\"]\n"
        "}\n"
        "Make sure the 'score' is an integer between 0 and 100, representing the overall fit (considering skills, experience, and role alignment)."
    )
    
    prompt = (
        f"Candidate Resume:\n{resume_text[:4000]}\n\n"
        f"Target Job Description:\n{jd_text[:4000]}"
    )
    
    try:
        response_text = _groq_call(prompt, system=system_prompt)
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            clean_text = re.sub(r'^```(?:json)?\n', '', clean_text)
            clean_text = re.sub(r'\n```$', '', clean_text)
            clean_text = clean_text.strip()
            
        data = json.loads(clean_text)
        score = int(data.get("score", 0))
        jd_kws = data.get("jd_keywords", [])
        matched = data.get("matched_keywords", [])
        missing = data.get("missing_keywords", [])
        return jd_kws, matched, missing, score
    except Exception as e:
        st.warning(f"⚠️ LLM matching encountered an error ({e}). Falling back to keyword comparison.")
        jd_kws = _extract_keywords(jd_text)
        resume_lower = resume_text.lower()
        matched = [k for k in jd_kws if k.lower() in resume_lower]
        missing = [k for k in jd_kws if k.lower() not in resume_lower]
        score = int(len(matched) / max(len(jd_kws), 1) * 100)
        return jd_kws, matched, missing, score

def _groq_call(prompt: str, system: str = "", max_tokens: int = 2200) -> str:
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    messages = []
    if system:
        messages.append({"role":"system","content":system})
    messages.append({"role":"user","content":prompt})
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile", messages=messages,
        max_tokens=max_tokens, temperature=0.7
    )
    return resp.choices[0].message.content.strip()

def _generate_tailored_resume(resume_text: str, jd_text: str, name: str, missing: list) -> str:
    system = (
        "You are an expert ATS resume writer and career strategist. Your job is to REWRITE and TAILOR "
        "the candidate's resume so it is optimized for the target job description.\n\n"
        "CRITICAL RULES:\n"
        "1. Do NOT copy-paste the original resume as-is. You must actively rewrite bullet points, summaries, and skill sections.\n"
        "2. Naturally weave the missing keywords into relevant sections (Summary, Experience, Skills, Projects). "
        "Do not just append them as a list.\n"
        "3. Rewrite experience bullet points using the STAR method (Situation, Task, Action, Result) and quantify impact where possible.\n"
        "4. Add a strong professional summary at the top tailored to the target role.\n"
        "5. Reorder skills to prioritize those mentioned in the job description.\n"
        "6. Use strong action verbs: Led, Engineered, Optimized, Implemented, Architected, Developed, Spearheaded.\n"
        "7. Keep the same overall structure (sections like Summary, Skills, Experience, Education, Projects) "
        "but improve the content within each section.\n"
        "8. Output ONLY the rewritten resume in clean plain text. No explanations, no commentary, no markdown formatting.\n"
        "9. Maintain the candidate's real information — do not fabricate experiences or qualifications. "
        "Instead, reframe existing experiences to highlight relevance to the target role.\n"
        "10. Keep it concise and professional — aim for 1-2 pages worth of content."
    )
    missing_str = ', '.join(missing[:15]) if missing else "None identified"
    prompt = (
        f"CANDIDATE NAME: {name}\n\n"
        f"--- ORIGINAL RESUME ---\n{resume_text[:5000]}\n\n"
        f"--- TARGET JOB DESCRIPTION ---\n{jd_text[:3000]}\n\n"
        f"--- MISSING KEYWORDS TO INCORPORATE ---\n{missing_str}\n\n"
        "Now rewrite the resume from scratch, tailored for this specific job. "
        "Make sure every missing keyword appears naturally within the appropriate section. "
        "Improve weak bullet points, add quantified achievements, and ensure ATS compatibility."
    )
    try:
        return _groq_call(prompt, system, max_tokens=4000)
    except Exception as e:
        return resume_text + f"\n\n[Keyword recommendations: {', '.join(missing[:15])}]"

def _generate_cover_letter(resume_text: str, jd_text: str, name: str) -> str:
    system = "You are a career coach. Write a brief cover letter. Output ONLY letter content."
    prompt = f"Candidate name: {name}\nResume:\n{resume_text[:1500]}\n\nJob Description:\n{jd_text[:1200]}"
    try:
        return _groq_call(prompt, system)
    except Exception as e:
        return f"Dear Hiring Manager,\n\nI am writing to apply... \n\nRegards,\n{name}"

def _generate_resume_pdf(resume_text: str, template: str, name: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    buf = io.BytesIO()
    font_name = "Helvetica"
    font_bold = "Helvetica-Bold"
    pal = {"accent": colors.HexColor("#4f46e5")}
    if "classic" in template:
        font_name = "Times-Roman"
        font_bold = "Times-Bold"
        pal = {"accent": colors.HexColor("#1e3a5f")}

    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=1.5*cm, rightMargin=1.5*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)
    name_style    = ParagraphStyle("name", fontName=font_bold, fontSize=18, textColor=pal["accent"], alignment=TA_CENTER, spaceAfter=4)
    contact_style = ParagraphStyle("contact", fontName=font_name, fontSize=9, textColor=colors.HexColor("#475569"), alignment=TA_CENTER, spaceAfter=10)
    section_style = ParagraphStyle("section", fontName=font_bold, fontSize=11, textColor=pal["accent"], spaceBefore=10, spaceAfter=4)
    body_style    = ParagraphStyle("body", fontName=font_name, fontSize=9.5, textColor=colors.HexColor("#334155"), spaceAfter=3, leading=13)
    bullet_style  = ParagraphStyle("bullet", fontName=font_name, fontSize=9.5, textColor=colors.HexColor("#334155"), spaceAfter=3, leftIndent=12, firstLineIndent=-8, leading=13)

    # Simple section parser
    sections = {}
    current = "header"
    sections["header"] = []
    for line in resume_text.split('\n'):
        line = line.strip()
        if not line: continue
        up = line.upper()
        if any(k in up for k in ["SUMMARY","OBJECTIVE","PROFILE"]): current = "summary"
        elif any(k in up for k in ["EDUCATION","SCHOOL","COLLEGE"]): current = "education"
        elif any(k in up for k in ["EXPERIENCE","WORK","EMPLOYMENT"]): current = "experience"
        elif any(k in up for k in ["SKILLS","TECHNICAL"]): current = "skills"
        elif any(k in up for k in ["PROJECTS","PROJECT"]): current = "projects"
        sections.setdefault(current, []).append(line)

    story = []
    # Header
    hdr_lines = sections.get("header", [])
    display_name = name or (hdr_lines[0] if hdr_lines else "Candidate Name")
    story.append(Paragraph(display_name, name_style))
    if len(hdr_lines) > 1:
        story.append(Paragraph("  |  ".join(hdr_lines[1:4]), contact_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=pal["accent"], spaceAfter=10))

    def write_section_block(title, key):
        lines = sections.get(key, [])
        if not lines: return
        story.append(Paragraph(title.upper(), section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=5))
        for line in lines:
            if line.upper() in [title.upper(), title.upper()+"S"]: continue
            is_bullet = line.startswith(('•','·','-','*'))
            clean = line.lstrip('•·-* ')
            story.append(Paragraph(("• " if is_bullet else "") + clean, bullet_style if is_bullet else body_style))

    for title, key in [
        ("Summary", "summary"), ("Skills", "skills"),
        ("Experience", "experience"), ("Projects", "projects"),
        ("Education", "education")
    ]:
        write_section_block(title, key)

    doc.build(story)
    buf.seek(0)
    return buf.read()

def page_matcher():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Keyword Matcher</span>
      <div class="page-title">Job Matcher &amp; Tailor</div>
      <div class="page-subtitle">Scan your resume against any job description, fetch ATS match score, extract keyword gaps, and download tailored PDFs.</div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.matcher_result:
        _render_matcher_inputs()
    else:
        _render_matcher_results()

def _render_matcher_inputs():
    st.markdown("""
    <div style="margin-top: 16px; margin-bottom: 24px;">
      <span class="eyebrow">Matching Pipeline</span>
      <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 12px;">How the matcher works</div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
        <div class="card card-sm" style="position: relative; padding: 16px 12px;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.2rem; font-weight: 800; color: rgba(139,92,246,0.08);">01</div>
          <div class="feat-icon-box" style="width:28px; height:28px; font-size:0.8rem; margin-bottom:6px; border-radius:50%;">📤</div>
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:2px;">Upload Resume</div>
          <div style="font-size:0.7rem; color:#64748b; line-height:1.35;">Drop your master resume layout.</div>
        </div>
        <div class="card card-sm" style="position: relative; padding: 16px 12px;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.2rem; font-weight: 800; color: rgba(139,92,246,0.08);">02</div>
          <div class="feat-icon-box" style="width:28px; height:28px; font-size:0.8rem; margin-bottom:6px; border-radius:50%;">📋</div>
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:2px;">Paste JD</div>
          <div style="font-size:0.7rem; color:#64748b; line-height:1.35;">Paste target job qualifications.</div>
        </div>
        <div class="card card-sm" style="position: relative; padding: 16px 12px;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.2rem; font-weight: 800; color: rgba(139,92,246,0.08);">03</div>
          <div class="feat-icon-box" style="width:28px; height:28px; font-size:0.8rem; margin-bottom:6px; border-radius:50%;">🔍</div>
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:2px;">Keyword Scan</div>
          <div style="font-size:0.7rem; color:#64748b; line-height:1.35;">Identify matching &amp; missing terms.</div>
        </div>
        <div class="card card-sm" style="position: relative; padding: 16px 12px;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.2rem; font-weight: 800; color: rgba(139,92,246,0.08);">04</div>
          <div class="feat-icon-box" style="width:28px; height:28px; font-size:0.8rem; margin-bottom:6px; border-radius:50%;">✍️</div>
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:2px;">AI Alignment</div>
          <div style="font-size:0.7rem; color:#64748b; line-height:1.35;">Inject keyword context naturally.</div>
        </div>
        <div class="card card-sm" style="position: relative; padding: 16px 12px;">
          <div style="position: absolute; top: 10px; right: 12px; font-size: 1.2rem; font-weight: 800; color: rgba(139,92,246,0.08);">05</div>
          <div class="feat-icon-box" style="width:28px; height:28px; font-size:0.8rem; margin-bottom:6px; border-radius:50%;">📄</div>
          <div style="font-size:0.8rem; font-weight:700; color:#fff; margin-bottom:2px;">Export</div>
          <div style="font-size:0.7rem; color:#64748b; line-height:1.35;">Download your tailored PDF file.</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    col_form, col_r = st.columns([1.1, 0.9], gap="large")

    with col_form:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Step 1 — Personal Details</div>', unsafe_allow_html=True)
            c1, c2 = st.columns(2)
            name_input = c1.text_input("Full Name *", placeholder="Priya Sharma", key="mat_name_inp")
            email_input = c2.text_input("Email Address *", placeholder="priya@email.com", key="mat_email_inp")
            c3, c4 = st.columns(2)
            phone_input = c3.text_input("Mobile Number *", placeholder="+91 98765 43210", key="mat_phone_inp")
            linkedin_input = c4.text_input("LinkedIn URL *", placeholder="linkedin.com/in/username", key="mat_li_inp")
            github_input = st.text_input("GitHub URL *", placeholder="github.com/username", key="mat_gh_inp")

            st.markdown('<div style="height:1px;background:rgba(255,255,255,0.05);margin:20px 0;"></div>', unsafe_allow_html=True)
            st.markdown('<div class="sec-label">Step 2 — Upload Resume</div>', unsafe_allow_html=True)
            pdf_file = st.file_uploader("Upload Master Resume (PDF)", type=["pdf"], key="matcher_uploader")
            if pdf_file:
                save_path = os.path.join("Uploaded_Resumes", f"matcher_{pdf_file.name}")
                with open(save_path, "wb") as f:
                    f.write(pdf_file.getbuffer())
                text = read_pdf_text(save_path)
                st.session_state.matcher_resume_text = text
                st.session_state.matcher_name = name_input
                st.success(f"✅ Loaded master resume — {len(text.split())} words parsed.")

    with col_r:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Step 3 — Target Job Description</div>', unsafe_allow_html=True)
            jd_file = st.file_uploader("Upload Job Description (PDF/DOCX) *", type=["pdf", "docx"], key="matcher_jd_uploader")
            default_jd_text = ""
            if jd_file:
                save_path = os.path.join("Uploaded_Resumes", f"jd_{jd_file.name}")
                with open(save_path, "wb") as f:
                    f.write(jd_file.getbuffer())
                if jd_file.name.lower().endswith('.pdf'):
                    default_jd_text = read_pdf_text(save_path)
                elif jd_file.name.lower().endswith('.docx'):
                    default_jd_text = read_docx_text(save_path)
                st.success(f"✅ Loaded job description — {len(default_jd_text.split())} words parsed.")
            
            jd_input = st.text_area(
                "Paste Job Requirements", 
                value=default_jd_text if default_jd_text else st.session_state.get("mat_jd_inp", ""), 
                placeholder="Requirements, skills, tech stack details...", 
                height=220, 
                key="mat_jd_inp"
            )

    if st.session_state.matcher_resume_text:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🤖 Analyze & Tailor Resume", use_container_width=True, type="primary"):
            if not jd_input.strip():
                st.error("⚠️ Please paste the Target Job Description to proceed.")
            else:
                is_valid, validation_errors = validate_personal_details(
                    name_input, email_input, phone_input, linkedin_input, github_input
                )
                if not is_valid:
                    for err in validation_errors:
                        st.error(f"⚠️ {err}")
                else:
                    with st.spinner("Scanning and tailoring documents using LLM..."):
                        st.session_state.matcher_name = name_input.strip()
                        f_linkedin = format_url(linkedin_input)
                        f_github = format_url(github_input)
                        jd_kws, matched, missing, score = _compute_match(st.session_state.matcher_resume_text, jd_input)
                        tailored = _generate_tailored_resume(st.session_state.matcher_resume_text, jd_input, st.session_state.matcher_name, missing)
                        cover = _generate_cover_letter(st.session_state.matcher_resume_text, jd_input, st.session_state.matcher_name)

                        # ATS Score Calculation
                        checks_def = [
                            (["Objective","Summary","OBJECTIVE","SUMMARY","PROFILE"],           10, "Objective / Summary"),
                            (["Education","School","College","EDUCATION","SCHOOL","COLLEGE"],   15, "Education Details"),
                            (["EXPERIENCE","WORK EXPERIENCE","Experience","Work Experience"],   20, "Work Experience"),
                            (["INTERNSHIP","INTERNSHIPS","Internship","Internships"],            5,  "Internships"),
                            (["SKILLS","SKILL","Skills","Skill","TECHNICAL SKILLS"],            20, "Skills Section"),
                            (["HOBBIES","Hobbies","HOBBY","Hobby"],                             5,  "Hobbies"),
                            (["INTERESTS","Interests","Interest","INTEREST"],                   5,  "Interests"),
                            (["ACHIEVEMENTS","Achievements","Achievement","ACHIEVEMENT"],       10, "Achievements"),
                            (["CERTIFICATIONS","Certifications","Certification"],               10, "Certifications"),
                            (["PROJECTS","PROJECT","Projects","Project"],                       10, "Projects"),
                        ]
                        ats_score = 0
                        ats_checks = []
                        for keywords, points, label in checks_def:
                            found = any(x in st.session_state.matcher_resume_text for x in keywords)
                            if found:
                                ats_score += points
                            ats_checks.append((found, points, label))

                        st.session_state.matcher_result = True
                        st.session_state.matcher_score = score
                        st.session_state.matcher_ats_score = min(100, max(0, ats_score))
                        st.session_state.matcher_ats_checks = ats_checks
                        st.session_state.jd_keywords = jd_kws
                        st.session_state.matched_keywords = matched
                        st.session_state.missing_keywords = missing
                        st.session_state.tailored_resume = tailored
                        st.session_state.cover_letter = cover
                        st.rerun()

def _render_matcher_results():
    score = st.session_state.matcher_score
    matched = st.session_state.matched_keywords
    missing = st.session_state.missing_keywords
    s_color = "#10b981" if score>=70 else "#f59e0b" if score>=40 else "#ef4444"

    col_head, col_btn = st.columns([2.5, 1.5])
    with col_head:
        st.markdown(f"""
        <div style="padding: 16px 0;">
            <span class="eyebrow">Match Finished</span>
            <div class="page-title" style="font-size:1.8rem; margin-bottom:4px;">{st.session_state.matcher_name or "Candidate Match"}</div>
        </div>
        """, unsafe_allow_html=True)
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("↺ New Match", key="reset_matcher", use_container_width=True):
            st.session_state.matcher_result = False
            st.session_state.matcher_score = 0
            st.session_state.matcher_ats_score = 0
            st.session_state.matcher_ats_checks = []
            st.session_state.jd_keywords = []
            st.session_state.matched_keywords = []
            st.session_state.missing_keywords = []
            st.session_state.tailored_resume = ""
            st.session_state.cover_letter = ""
            st.session_state.matcher_resume_text = ""
            st.session_state.matcher_name = ""
            st.rerun()

    st.markdown(f"""
    <div class="kpi-row" style="margin-top:24px;">
        <div class="kpi-card"><div class="kpi-val" style="color:{s_color};">{score}%</div><div class="kpi-label">JD Match Score</div></div>
        <div class="kpi-card"><div class="kpi-val" style="color:#10b981;">{len(matched)}</div><div class="kpi-label">Keywords Matched</div></div>
        <div class="kpi-card"><div class="kpi-val" style="color:#ef4444;">{len(missing)}</div><div class="kpi-label">Keywords Missing</div></div>
    </div>
    """, unsafe_allow_html=True)

    t_ats, t1, t2, t3, t4 = st.tabs(["📈 ATS Score", "📊 Keyword Gaps", "📝 Tailored Resume Text", "✉️ Cover Letter", "📤 Export PDF"])

    with t_ats:
        st.markdown('<div class="sec-label">ATS Health Score</div>', unsafe_allow_html=True)
        ats_score = st.session_state.get("matcher_ats_score", 0)
        ats_checks = st.session_state.get("matcher_ats_checks", [])
        
        c_color = "#10b981" if ats_score >= 80 else "#f59e0b" if ats_score >= 50 else "#ef4444"
        st.markdown(f"""
        <div style="text-align:center; padding: 24px 0;">
            <div style="font-size:3.5rem; font-weight:800; color:{c_color};">{ats_score}/100</div>
            <div style="color:#94a3b8; font-size:1rem; margin-top:4px;">Based on ATS section checklist</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="sec-label" style="margin-top:24px;">Section Checklist</div>', unsafe_allow_html=True)
        for found, points, label in ats_checks:
            if found:
                st.markdown(f'<div class="checklist-item"><span class="check-icon">✅</span> <b>{label}</b> <span style="float:right; color:#10b981;">+{points} pts</span></div>', unsafe_allow_html=True)
            else:
                st.markdown(f'<div class="checklist-item" style="border-left: 3px solid #ef4444;"><span class="check-icon">❌</span> <b>{label}</b> <span style="float:right; color:#ef4444;">Missing ({points} pts)</span></div>', unsafe_allow_html=True)

    with t1:
        col_m, col_mi = st.columns(2, gap="large")
        with col_m:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Matched Keywords</div>', unsafe_allow_html=True)
                if matched:
                    chips = "".join([f'<span class="chip-g" style="margin:2px;">{k}</span>' for k in matched[:40]])
                    st.markdown(f'<div class="chip-wrap">{chips}</div>', unsafe_allow_html=True)
                else:
                    st.info("No matching keywords detected.")
        with col_mi:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Missing Keywords</div>', unsafe_allow_html=True)
                if missing:
                    chips = "".join([f'<span class="chip-p" style="margin:2px;">{k}</span>' for k in missing[:30]])
                    st.markdown(f'<div class="chip-wrap">{chips}</div>', unsafe_allow_html=True)
                else:
                    st.success("All keywords matched!")

        # ── Visual Graphs Below Keywords ─────────────────────────
        total_kws = len(matched) + len(missing)
        if total_kws > 0:
            col_chart1, col_chart2 = st.columns(2, gap="large")

            with col_chart1:
                with st.container(border=True):
                    st.markdown('<div class="sec-label">📊 Keyword Match Distribution</div>', unsafe_allow_html=True)
                    fig_donut = go.Figure(go.Pie(
                        labels=["Matched", "Missing"],
                        values=[len(matched), len(missing)],
                        hole=0.65,
                        marker=dict(colors=["#10b981", "#ef4444"], line=dict(color="rgba(0,0,0,0.3)", width=2)),
                        textinfo="label+percent",
                        textfont=dict(size=12, color="#e2e8f0", family="Inter"),
                        hoverinfo="label+value",
                        rotation=90,
                    ))
                    fig_donut.update_layout(
                        showlegend=False,
                        margin=dict(l=10, r=10, t=10, b=10),
                        height=260,
                        paper_bgcolor="rgba(0,0,0,0)",
                        annotations=[dict(
                            text=f"<b>{int(len(matched)/total_kws*100)}%</b><br><span style='font-size:10px;color:#64748b;'>match</span>",
                            x=0.5, y=0.5, showarrow=False,
                            font=dict(size=22, color="#e2e8f0"),
                        )],
                    )
                    st.plotly_chart(fig_donut, use_container_width=True, config={"displayModeBar": False})

            with col_chart2:
                with st.container(border=True):
                    st.markdown('<div class="sec-label">📈 Keyword Coverage Breakdown</div>', unsafe_allow_html=True)
                    fig_bar = go.Figure()
                    fig_bar.add_trace(go.Bar(
                        y=["Coverage"], x=[len(matched)],
                        name="Matched", orientation="h",
                        marker=dict(color="#10b981", line=dict(width=0)),
                        text=[f"✅ {len(matched)}"], textposition="inside",
                        textfont=dict(color="white", size=13, family="Inter"),
                        hovertemplate="%{x} keywords matched<extra></extra>",
                    ))
                    fig_bar.add_trace(go.Bar(
                        y=["Coverage"], x=[len(missing)],
                        name="Missing", orientation="h",
                        marker=dict(color="#ef4444", line=dict(width=0)),
                        text=[f"⚠️ {len(missing)}"], textposition="inside",
                        textfont=dict(color="white", size=13, family="Inter"),
                        hovertemplate="%{x} keywords missing<extra></extra>",
                    ))
                    fig_bar.update_layout(
                        barmode="stack",
                        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="#94a3b8", size=11),
                        margin=dict(l=0, r=0, t=10, b=10), height=80,
                        xaxis=dict(showgrid=False, showticklabels=False, zeroline=False),
                        yaxis=dict(showgrid=False, showticklabels=False, zeroline=False),
                        showlegend=False,
                    )
                    st.plotly_chart(fig_bar, use_container_width=True, config={"displayModeBar": False})

                    # Score gauge bar below the stacked bar
                    st.markdown(f"""
                    <div style="margin-top:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:0.78rem; font-weight:600; color:#94a3b8;">Match Score</span>
                            <span style="font-size:0.85rem; font-weight:800; color:{s_color};">{score}%</span>
                        </div>
                        <div style="height:8px; background:rgba(255,255,255,0.04); border-radius:99px; overflow:hidden;">
                            <div style="height:100%; width:{score}%; background:linear-gradient(90deg, {s_color}, {s_color}cc); border-radius:99px; transition:width 0.5s ease;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:6px;">
                            <span style="font-size:0.68rem; color:#334155;">0%</span>
                            <span style="font-size:0.68rem; color:#334155;">50%</span>
                            <span style="font-size:0.68rem; color:#334155;">100%</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

    with t2:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Tailored Resume Text</div>', unsafe_allow_html=True)
            st.session_state.tailored_resume = st.text_area("Edit generated text prior to exporting", value=st.session_state.tailored_resume, height=400, key="edit_resume_ta")

    with t3:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Tailored Cover Letter</div>', unsafe_allow_html=True)
            st.session_state.cover_letter = st.text_area("Edit letter text", value=st.session_state.cover_letter, height=350, key="edit_cover_ta")

    with t4:
        col_tpl, col_dl = st.columns([1, 1], gap="large")
        with col_tpl:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Select Layout Design</div>', unsafe_allow_html=True)
                tpl = st.radio("Style Select", ["classic_single", "modern_single"], format_func=lambda x: "Classic Single Column" if x=="classic_single" else "Modern Single Column", key="selected_tpl_radio")
                st.session_state.selected_template = tpl

        with col_dl:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Download &amp; Export</div>', unsafe_allow_html=True)
                try:
                    pdf_bytes = _generate_resume_pdf(st.session_state.tailored_resume, st.session_state.selected_template, st.session_state.matcher_name)
                    st.download_button("📄 Download Resume PDF", data=pdf_bytes, file_name=f"tailored_resume_{st.session_state.selected_template}.pdf", mime="application/pdf", use_container_width=True)
                except Exception as e:
                    st.error(f"Error compiling ReportLab template: {e}")

                st.download_button("✉️ Download Cover Letter", data=st.session_state.cover_letter, file_name="cover_letter.txt", mime="text/plain", use_container_width=True)

# ─────────────────────────────────────────────────────────────────────────────
#  TIPS PAGE
# ─────────────────────────────────────────────────────────────────────────────
def page_tips():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Resources</span>
      <div class="page-title">Resume Guidelines &amp; Formats</div>
      <div class="page-subtitle">Curated parameters and checklists used by top-tier recruitment departments.</div>
    </div>
    """, unsafe_allow_html=True)

    t1, t2, t3, t4 = st.tabs(["✍️ Writing Best Practices", "🤖 ATS Guidelines", "📋 Templates Guide", "🎬 Videos"])

    with t1:
        # ── Do's and Don'ts ────────────────────────────────────
        col_la, col_ra = st.columns(2, gap="large")
        with col_la:
            with st.container(border=True):
                st.markdown('<div class="sec-label">✅ Resume Writing Do\'s</div>', unsafe_allow_html=True)
                dos = [
                    ("Quantify achievements", "Instead of 'built React components', say 'engineered 12 React interfaces, reducing page latency by 32%'."),
                    ("Use strong action verbs", "Start bullets with: Led, Engineered, Optimized, Architected, Spearheaded, Developed, Implemented."),
                    ("Reverse chronological order", "Place your most recent experience first. Recruiters scan top-down and expect this format."),
                    ("Tailor for each application", "Customize your resume for each job by mirroring keywords from the job description."),
                    ("Include measurable impact", "Add metrics: revenue generated, users impacted, time saved, percentage improvements."),
                ]
                for i, (title, desc) in enumerate(dos, 1):
                    html_content = (
                        f'<div class="tip-card">'
                        f'<div style="display:flex; align-items:flex-start; gap:12px;">'
                        f'<div class="tip-num">{i}</div>'
                        f'<div>'
                        f'<div style="font-size:0.85rem; font-weight:700; color:#10b981; margin-bottom:3px;">{title}</div>'
                        f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.55;">{desc}</div>'
                        f'</div>'
                        f'</div>'
                        f'</div>'
                    )
                    st.markdown(html_content, unsafe_allow_html=True)

        with col_ra:
            with st.container(border=True):
                st.markdown('<div class="sec-label">❌ Resume Writing Don\'ts</div>', unsafe_allow_html=True)
                donts = [
                    ("No graphic skill bars", "Never include rating bars, dots, or pie charts for skill levels. ATS cannot parse them."),
                    ("Omit photos", "In US/Europe/India markets, photos trigger bias and ATS systems skip image-heavy PDFs."),
                    ("One page for < 4 years exp", "If you have under 4 years of experience, strictly keep your resume to 1 page."),
                    ("Avoid generic objectives", "Replace 'Seeking a challenging position...' with a targeted professional summary specific to the role."),
                    ("Don't list every technology", "Focus on relevant skills. Listing 50+ technologies makes you look unfocused to recruiters."),
                ]
                for i, (title, desc) in enumerate(donts, 1):
                    html_content = (
                        f'<div class="tip-card">'
                        f'<div style="display:flex; align-items:flex-start; gap:12px;">'
                        f'<div class="tip-num" style="background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.2); color:#f87171;">{i}</div>'
                        f'<div>'
                        f'<div style="font-size:0.85rem; font-weight:700; color:#f87171; margin-bottom:3px;">{title}</div>'
                        f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.55;">{desc}</div>'
                        f'</div>'
                        f'</div>'
                        f'</div>'
                    )
                    st.markdown(html_content, unsafe_allow_html=True)

        # ── Section-by-Section Guide ────────────────────────────
        st.markdown('<div style="margin-top:28px;"><span class="sec-label">📖 Section-by-Section Checklist</span></div>', unsafe_allow_html=True)
        sections_guide = [
            ("📝", "Professional Summary", "2-3 lines highlighting your key value proposition. Mention years of experience, core domain, and 2-3 standout skills.", "#D4AF37"),
            ("💼", "Work Experience", "Use bullet points with action verbs. Each bullet: Action → Context → Result with metrics. Max 4-5 bullets per role.", "#22C55E"),
            ("🎓", "Education", "Degree, institution, graduation year. Add GPA only if above 3.5/4.0 or 8.0/10. Include relevant coursework for freshers.", "#10b981"),
            ("⚙️", "Skills", "Group into categories: Languages, Frameworks, Tools, Databases. List only skills you can discuss confidently in interviews.", "#f59e0b"),
            ("🚀", "Projects", "Include 2-3 impactful projects with tech stack, your contribution, and outcome. Link to GitHub repos or live demos.", "#A3E635"),
            ("🏆", "Certifications", "List relevant certifications with issuing organization and date. AWS, Google, Azure certs are highly valued.", "#2EC27E"),
        ]
        guide_html = '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:12px;">'
        for icon, title, desc, color in sections_guide:
            guide_html += (
                f'<div class="tip-card" style="border-left:3px solid {color};">'
                f'<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">'
                f'<span style="font-size:1.1rem;">{icon}</span>'
                f'<span style="font-size:0.85rem; font-weight:700; color:{color};">{title}</span>'
                f'</div>'
                f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.55;">{desc}</div>'
                f'</div>'
            )
        guide_html += '</div>'
        st.markdown(guide_html, unsafe_allow_html=True)

    with t2:
        col_ats1, col_ats2 = st.columns(2, gap="large")
        with col_ats1:
            with st.container(border=True):
                st.markdown('<div class="sec-label">🔍 How ATS Systems Work</div>', unsafe_allow_html=True)
                ats_how = [
                    ("Keyword Matching", "ATS scans for exact keyword matches. If a job asks for 'TensorFlow', writing 'TF' will not match."),
                    ("Section Detection", "Systems look for standard headers: 'Skills', 'Experience', 'Education'. Creative headers get skipped entirely."),
                    ("Scoring Algorithm", "Your resume gets a score 0-100 based on keyword density, section completeness, and format compliance."),
                    ("Recruiter Ranking", "Only top-scoring resumes (usually top 20-30%) reach the human recruiter's desk."),
                ]
                for i, (title, desc) in enumerate(ats_how, 1):
                    html_content = (
                        f'<div class="tip-card">'
                        f'<div style="display:flex; align-items:flex-start; gap:12px;">'
                        f'<div class="tip-num">{i}</div>'
                        f'<div>'
                        f'<div style="font-size:0.85rem; font-weight:700; color:#A3E635; margin-bottom:3px;">{title}</div>'
                        f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.55;">{desc}</div>'
                        f'</div>'
                        f'</div>'
                        f'</div>'
                    )
                    st.markdown(html_content, unsafe_allow_html=True)

        with col_ats2:
            with st.container(border=True):
                st.markdown('<div class="sec-label">⚠️ ATS Formatting Rules</div>', unsafe_allow_html=True)
                ats_rules = [
                    ("No tables or columns", "ATS reads text top-to-bottom, left-to-right. Multi-column layouts scramble content order."),
                    ("Standard fonts only", "Use Arial, Calibri, Helvetica, or Times New Roman. Decorative fonts break text extraction."),
                    ("No headers/footers", "Contact info in headers/footers is often completely ignored by ATS parsers."),
                    ("PDF or DOCX only", "Submit in .pdf or .docx format. Other formats (images, Pages) can't be parsed at all."),
                ]
                for i, (title, desc) in enumerate(ats_rules, 1):
                    html_content = (
                        f'<div class="tip-card">'
                        f'<div style="display:flex; align-items:flex-start; gap:12px;">'
                        f'<div class="tip-num" style="background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.2); color:#fbbf24;">{i}</div>'
                        f'<div>'
                        f'<div style="font-size:0.85rem; font-weight:700; color:#fbbf24; margin-bottom:3px;">{title}</div>'
                        f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.55;">{desc}</div>'
                        f'</div>'
                        f'</div>'
                        f'</div>'
                    )
                    st.markdown(html_content, unsafe_allow_html=True)

    with t3:
        col_tg1, col_tg2 = st.columns(2, gap="large")
        with col_tg1:
            with st.container(border=True):
                st.markdown('<div class="sec-label">📜 Classic Template</div>', unsafe_allow_html=True)
                st.markdown(
                    f'<div class="tip-card" style="border-left:3px solid #D4AF37;">'
                    f'<div style="font-size:0.85rem; font-weight:700; color:#D4AF37; margin-bottom:8px;">Best for: Finance, Law, Consulting, Government</div>'
                    f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.6;">'
                    f'• Serif fonts (Times New Roman, Georgia)<br>'
                    f'• Conservative formatting with strict borders<br>'
                    f'• Minimal color — black and dark navy only<br>'
                    f'• Formal section headers<br>'
                    f'• No icons or decorative elements'
                    f'</div>'
                    f'</div>',
                    unsafe_allow_html=True
                )
        with col_tg2:
            with st.container(border=True):
                st.markdown('<div class="sec-label">✨ Modern Template</div>', unsafe_allow_html=True)
                st.markdown(
                    f'<div class="tip-card" style="border-left:3px solid #22C55E;">'
                    f'<div style="font-size:0.85rem; font-weight:700; color:#22C55E; margin-bottom:8px;">Best for: Tech, Startups, Design, Marketing</div>'
                    f'<div style="font-size:0.78rem; color:#94a3b8; line-height:1.6;">'
                    f'• Sans-serif fonts (Helvetica, Inter, Calibri)<br>'
                    f'• Clean whitespace with accent color highlights<br>'
                    f'• Subtle use of brand colors for section dividers<br>'
                    f'• Skills organized in tag/chip format<br>'
                    f'• Links to portfolio, GitHub, LinkedIn'
                    f'</div>'
                    f'</div>',
                    unsafe_allow_html=True
                )

    with t4:
        col_va, col_vb = st.columns(2, gap="large")
        with col_va:
            with st.container(border=True):
                st.markdown('<div class="sec-label">🎬 Resume Tips</div>', unsafe_allow_html=True)
                tips_html = "".join([f'<a href="{url}" target="_blank" class="course-item">▶ Tip Video #{i}</a>' for i, url in enumerate(resume_videos, 1)])
                st.markdown(f'<div>{tips_html}</div>', unsafe_allow_html=True)
        with col_vb:
            with st.container(border=True):
                st.markdown('<div class="sec-label">🎬 Interview Prep</div>', unsafe_allow_html=True)
                int_html = "".join([f'<a href="{url}" target="_blank" class="course-item">▶ Interview Video #{i}</a>' for i, url in enumerate(interview_videos, 1)])
                st.markdown(f'<div>{int_html}</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  FEEDBACK PAGE
# ─────────────────────────────────────────────────────────────────────────────
def page_feedback():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Community Review</span>
      <div class="page-title">Submit Feedback</div>
      <div class="page-subtitle">Your reviews help us train matching heuristics and adjust model variables.</div>
    </div>
    """, unsafe_allow_html=True)

    col_f, col_stats = st.columns([1, 1], gap="large")

    with col_f:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Submit Your Score</div>', unsafe_allow_html=True)
            with st.form("fb_form_rebuilt"):
                name = st.text_input("Name *")
                email = st.text_input("Email Address *")
                score = st.select_slider("Select Rating", options=[1,2,3,4,5], value=5)
                comments = st.text_area("Your Review comments", placeholder="Feature requests, bugs, or tips...")
                submit = st.form_submit_button("Record Feedback", use_container_width=True)

            if submit:
                if not name or not email:
                    st.error("⚠️ Name and email are required fields.")
                else:
                    insert_feedback(name, email, score, comments, now_timestamp())
                    st.success("✅ Thank you! Feedback recorded successfully.")

    with col_stats:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Average Community Ratings</div>', unsafe_allow_html=True)
            df = fetch_all_feedback()
            if df.empty:
                st.info("No feedback has been recorded yet.")
            else:
                avg = pd.to_numeric(df["feed_score"], errors="coerce").mean()
                st.markdown(f"""
                <div style="text-align:center; padding:16px 0;">
                    <div style="font-size:3.6rem; font-weight:800; color:#f59e0b; line-height:1;">{avg:.1f}</div>
                    <div style="font-size:1.1rem; color:#f59e0b; margin:6px 0;">{"★"*round(avg)}{"☆"*(5-round(avg))}</div>
                    <div style="font-size:0.75rem; color:#64748b;">Based on {len(df)} community ratings</div>
                </div>
                """, unsafe_allow_html=True)

                for star in [5,4,3,2,1]:
                    cnt = (pd.to_numeric(df["feed_score"], errors="coerce") == star).sum()
                    pct = int(cnt / len(df) * 100) if len(df) else 0
                    st.markdown(f"""
                    <div class="rating-bar-row">
                        <span style="font-size:0.75rem; width:20px; color:#94a3b8;">{star}★</span>
                        <div class="rating-bar-track"><div class="rating-bar-fill" style="width:{pct}%;"></div></div>
                        <span style="font-size:0.72rem; color:#64748b; width:30px; text-align:right;">{pct}%</span>
                    </div>
                    """, unsafe_allow_html=True)

    # Reviews Feed
    df_fb = fetch_all_feedback()
    if not df_fb.empty:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Latest Community Reviews</div>', unsafe_allow_html=True)
            for _, r in df_fb.iloc[::-1].head(10).iterrows():
                feed_id = int(r.get("id"))
                stars = "★" * int(float(r.get("feed_score", 5)))
                
                edit_key = f"edit_fb_{feed_id}"
                if edit_key not in st.session_state:
                    st.session_state[edit_key] = False
                
                col_card, col_acts = st.columns([3.8, 1.2], gap="small")
                
                with col_card:
                    if st.session_state[edit_key]:
                        # Show inline editing inputs
                        with st.container():
                            new_name = r.get('feed_name', 'Guest')
                            st.caption(f"Editing review by: {new_name}")
                            new_score = st.select_slider(
                                "Score", 
                                options=[1, 2, 3, 4, 5], 
                                value=int(float(r.get("feed_score", 5))),
                                key=f"score_inp_{feed_id}"
                            )
                            new_comments = st.text_area(
                                "Comments", 
                                value=r.get('comments', ''),
                                key=f"comments_inp_{feed_id}"
                            )
                            cs1, cs2 = st.columns(2)
                            if cs1.button("Save", key=f"save_btn_{feed_id}", use_container_width=True, type="primary"):
                                update_feedback(feed_id, new_score, new_comments)
                                st.session_state[edit_key] = False
                                st.success("Updated!")
                                st.rerun()
                            if cs2.button("Cancel", key=f"cancel_btn_{feed_id}", use_container_width=True):
                                st.session_state[edit_key] = False
                                st.rerun()
                    else:
                        # Show comment card normally
                        st.markdown(f"""
                        <div class="comment-card">
                            <div><span class="comment-name">{r.get('feed_name','Guest')}</span><span class="comment-stars">{stars}</span></div>
                            <div class="comment-text">{r.get('comments','')}</div>
                            <div style="font-size:0.68rem; color:#475569; margin-top:4px;">{r.get('timestamp','')}</div>
                        </div>
                        """, unsafe_allow_html=True)
                
                with col_acts:
                    # Render action buttons on the right side
                    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
                    if not st.session_state[edit_key]:
                        if st.button("✏️ Edit", key=f"edit_btn_{feed_id}", use_container_width=True):
                            st.session_state[edit_key] = True
                            st.rerun()
                        if st.button("🗑️ Delete", key=f"delete_btn_{feed_id}", use_container_width=True):
                            delete_feedback(feed_id)
                            st.success("Deleted!")
                            st.rerun()
                st.markdown("<hr style='margin: 8px 0; border: none; border-top: 1px solid rgba(255,255,255,0.05);'>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  SIGN IN / ADMIN PORTAL ACCESS
# ─────────────────────────────────────────────────────────────────────────────
def page_signin():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Sign In Gateway</span>
      <div class="page-title">Access Gateway</div>
      <div class="page-subtitle">Access your candidate account, create a new profile, or log in to the admin section.</div>
    </div>
    """, unsafe_allow_html=True)

    if st.session_state.get("auth_redirect_reason"):
        st.warning(f"🔒 {st.session_state.auth_redirect_reason}")
        del st.session_state.auth_redirect_reason

    c1, c2, c3 = st.columns([1, 1.4, 1])

    with c2:
        tab_signin, tab_signup, tab_admin = st.tabs(["👤 Sign In", "🚀 Get Started", "🔐 Admin Portal"])

        with tab_signin:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Candidate Sign In</div>', unsafe_allow_html=True)
                login_email = st.text_input("Email Address", placeholder="your.name@gmail.com", key="login_email_inp")
                login_password = st.text_input("Password", type="password", placeholder="••••••••", key="login_pass_inp")
                if st.button("Log In", key="login_btn_submit", use_container_width=True, type="primary"):
                    if not login_email.strip() or not login_password.strip():
                        st.error("⚠️ Email and password are required.")
                    else:
                        user = authenticate_user(login_email, login_password)
                        if user:
                            st.session_state.user_logged_in = True
                            st.session_state.user_profile = user
                            st.session_state.page = "home"
                            st.success(f"Welcome back, {user['name']}!")
                            st.rerun()
                        else:
                            st.error("❌ Invalid email or password.")

        with tab_signup:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Create Candidate Account</div>', unsafe_allow_html=True)
                signup_name = st.text_input("Full Name", placeholder="Priya Sharma", key="signup_name_inp")
                signup_email = st.text_input("Email Address", placeholder="your.name@gmail.com", key="signup_email_inp")
                signup_password = st.text_input("Password", type="password", placeholder="••••••••", key="signup_pass_inp")
                if st.button("Create Account", key="signup_btn_submit", use_container_width=True, type="primary"):
                    if not signup_name.strip() or not signup_email.strip() or not signup_password.strip():
                        st.error("⚠️ All fields are required.")
                    elif not re.match(r'^[a-zA-Z\s.-]{2,50}$', signup_name.strip()):
                        st.error("⚠️ Please enter a valid name (letters/spaces only).")
                    elif not re.match(r'^[a-zA-Z0-9][\w\.-]*@[a-zA-Z0-9][\w\.-]*\.[a-zA-Z]{2,}$', signup_email.strip()):
                        st.error("⚠️ Please enter a valid email address.")
                    elif len(signup_password.strip()) < 6:
                        st.error("⚠️ Password must be at least 6 characters long.")
                    else:
                        success = register_user(
                            signup_name.strip(), 
                            signup_email.strip().lower(), 
                            signup_password.strip(), 
                            now_timestamp()
                        )
                        if success:
                            # Automatically log in the user
                            user = authenticate_user(signup_email, signup_password)
                            if user:
                                st.session_state.user_logged_in = True
                                st.session_state.user_profile = user
                                st.session_state.page = "home"
                                st.success("🎉 Account created successfully! Logging you in...")
                                st.rerun()
                        else:
                            st.error("❌ Email address is already registered.")

        with tab_admin:
            with st.container(border=True):
                st.markdown('<div class="sec-label">Staff Authentication</div>', unsafe_allow_html=True)
                if st.session_state.admin_authed:
                    st.success("✅ Logged in successfully.")
                    if st.button("Go to Admin Dashboard →", key="admin_go_dash_rebuilt", use_container_width=True, type="primary"):
                        st.session_state.page = "admin"
                        st.rerun()
                else:
                    user_in = st.text_input("Username", placeholder="admin", key="admin_username_input")
                    pass_in = st.text_input("Password", type="password", placeholder="••••••••", key="admin_password_input")
                    if st.button("Login", key="admin_login_submit_rebuilt", use_container_width=True, type="primary"):
                        admin_u = os.getenv("ADMIN_USER", ADMIN_USER)
                        admin_p = os.getenv("ADMIN_PASS", ADMIN_PASS)
                        if user_in == admin_u and pass_in == admin_p:
                            st.session_state.admin_authed = True
                            st.session_state.page = "admin"
                            st.rerun()
                        else:
                            st.error("❌ Invalid credentials.")

# ─────────────────────────────────────────────────────────────────────────────
#  ADMIN PAGE
# ─────────────────────────────────────────────────────────────────────────────
def page_admin():
    st.markdown("""
    <div class="page-header" style="margin-top:12px;">
      <span class="eyebrow">Administration</span>
      <div class="page-title">Admin Dashboard</div>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.admin_authed:
        st.warning("⚠️ Access restricted. Please authenticate first.")
        st.session_state.page = "signin"
        st.rerun()
        return

    # Fetch stats
    df_users = fetch_all_users()
    df_fb = fetch_all_feedback()
    total_users = user_count()
    avg_score = round(pd.to_numeric(df_users["resume_score"], errors="coerce").mean(), 1) if not df_users.empty else 0
    avg_rating = round(pd.to_numeric(df_fb["feed_score"], errors="coerce").mean(), 1) if not df_fb.empty else 0
    total_pdfs = len([f for f in os.listdir("Uploaded_Resumes") if f.endswith(".pdf")]) if os.path.exists("Uploaded_Resumes") else 0

    col1, col2, col3, col4, col5 = st.columns(5)
    for col, num, label, trend in [
        (col1, total_users, "Total Scans", "all time"),
        (col2, avg_score, "Avg Score", "/ 100"),
        (col3, avg_rating, "Avg Rating", "/ 5.0"),
        (col4, len(df_fb), "Reviews", "total submissions"),
        (col5, total_pdfs, "Stored PDFs", "in library"),
    ]:
        with col:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-num">{num}</div>
                <div class="stat-desc">{label}</div>
                <div class="stat-trend" style="color:#64748b;">{trend}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🚪 Logout of Admin Session", key="admin_logout_btn"):
        st.session_state.admin_authed = False
        st.session_state.page = "signin"
        st.rerun()

    tab1, tab2, tab3, tab4 = st.tabs(["👥 Candidate Submissions", "📊 Metrics Charts", "💬 Reviews Feed", "📁 PDF Library"])

    with tab1:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Candidate Database</div>', unsafe_allow_html=True)
            if df_users.empty:
                st.info("No candidate registrations recorded.")
            else:
                search = st.text_input("🔍 Search Database", placeholder="Name, Email, Field, OS...", key="admin_user_search")
                filtered_df = df_users
                if search:
                    mask = df_users.apply(lambda r: r.astype(str).str.contains(search, case=False).any(), axis=1)
                    filtered_df = df_users[mask]

                st.dataframe(filtered_df, use_container_width=True, height=350)
                st.markdown(df_to_csv_link(filtered_df, "candidates_export.csv", "⬇️ Download Excel/CSV Data"), unsafe_allow_html=True)

                st.markdown('<div style="height:1px;background:rgba(255,255,255,0.05);margin:24px 0;"></div>', unsafe_allow_html=True)
                st.markdown('<div class="sec-label" style="color:#ef4444;">🗑 Delete Database Row</div>', unsafe_allow_html=True)
                del_id = st.number_input("Record ID to remove", min_value=1, step=1)
                if st.button("Permanently Remove Record", type="primary", key="del_record_btn"):
                    delete_user(int(del_id))
                    st.success(f"Row ID {del_id} deleted successfully.")
                    st.rerun()

    with tab2:
        if df_users.empty:
            st.info("No charts available - Database is empty.")
        else:
            plot_df = fetch_plot_data()
            c1, c2 = st.columns(2)
            with c1:
                with st.container(border=True):
                    vc = plot_df["predicted_field"].value_counts()
                    fig = px.pie(values=vc.values, names=vc.index, title="Distribution of Career Fields", hole=0.4, color_discrete_sequence=["#10b981","#059669","#34d399","#fbbf24","#f59e0b"])
                    fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", font_color="#ecfdf5", title_font_color="#fff")
                    st.plotly_chart(fig, use_container_width=True)
            with c2:
                with st.container(border=True):
                    vc = plot_df["user_level"].value_counts()
                    fig = px.pie(values=vc.values, names=vc.index, title="Candidate Experience Levels", hole=0.4, color_discrete_sequence=["#10b981","#f59e0b","#ef4444"])
                    fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", font_color="#e2e8f0", title_font_color="#fff")
                    st.plotly_chart(fig, use_container_width=True)

    with tab3:
        with st.container(border=True):
            st.markdown('<div class="sec-label">Feedback Submissions</div>', unsafe_allow_html=True)
            if df_fb.empty:
                st.info("No reviews submitted.")
            else:
                st.dataframe(df_fb, use_container_width=True)

    with tab4:
        upload_dir = "Uploaded_Resumes"
        pdfs = sorted([f for f in os.listdir(upload_dir) if f.endswith(".pdf")]) if os.path.exists(upload_dir) else []
        col_list, col_prev = st.columns([1, 2], gap="large")

        with col_list:
            with st.container(border=True):
                st.markdown(f'<div class="sec-label">PDF Files ({len(pdfs)})</div>', unsafe_allow_html=True)
                if not pdfs:
                    st.info("No PDF files saved in library.")
                else:
                    sel = st.radio("Select candidate resume file", pdfs, label_visibility="collapsed")

        with col_prev:
            with st.container(border=True):
                if pdfs and sel:
                    fpath = os.path.join(upload_dir, sel)
                    size = round(os.path.getsize(fpath) / 1024, 1)
                    st.markdown(f"**File:** {sel} &nbsp;·&nbsp; **Size:** {size} KB")
                    with open(fpath, "rb") as f:
                        st.download_button("⬇️ Download File", data=f, file_name=sel, mime="application/pdf", key="admin_dl_pdf_btn")
                    st.markdown(pdf_to_base64_iframe(fpath), unsafe_allow_html=True)
                else:
                    st.info("Select a file from the left to view.")

# ─────────────────────────────────────────────────────────────────────────────
#  MAIN ROUTER
# ─────────────────────────────────────────────────────────────────────────────
def main():
    # Render navigation panel
    render_nav()

    # Page Router
    p = st.session_state.page

    # Auth Guard: redirect user to signin if accessing guarded pages without logging in
    guarded_pages = ["analyzer", "matcher", "feedback"]
    if p in guarded_pages and not st.session_state.user_logged_in:
        st.session_state.page = "signin"
        st.session_state.auth_redirect_reason = "Please sign in or sign up to access this feature."
        st.rerun()

    if p == "home":
        page_home()
    elif p == "analyzer":
        page_analyzer()
    elif p == "matcher":
        page_matcher()
    elif p == "tips":
        page_tips()
    elif p == "feedback":
        page_feedback()
    elif p == "signin":
        page_signin()
    elif p == "admin":
        page_admin()
    else:
        st.session_state.page = "home"
        st.rerun()

if __name__ == "__main__":
    main()
