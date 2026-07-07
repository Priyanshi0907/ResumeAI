"""
utils.py  –  Stateless helper functions for App.py
"""

import io
import os
import base64
import socket
import platform
import datetime
import time

import geocoder
from geopy.geocoders import Nominatim
from pdfminer3.layout import LAParams
from pdfminer3.pdfpage import PDFPage
from pdfminer3.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer3.converter import TextConverter


# ─────────────────────────────────────────────────────────────
#  PDF helpers
# ─────────────────────────────────────────────────────────────

def read_pdf_text(file_path: str) -> str:
    """Extract raw text from a PDF file."""
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle, laparams=LAParams())
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    try:
        with open(file_path, "rb") as fh:
            for page in PDFPage.get_pages(fh, caching=True, check_extractable=True):
                page_interpreter.process_page(page)
        text = fake_file_handle.getvalue()
    finally:
        converter.close()
        fake_file_handle.close()
    return text


def read_docx_text(file_path: str) -> str:
    """Extract raw text from a DOCX file."""
    import docx2txt
    try:
        return docx2txt.process(file_path)
    except Exception as e:
        print(f"Error reading docx: {e}")
        return ""


def pdf_to_base64_iframe(file_path: str) -> str:
    """Return an HTML iframe string to embed a PDF inline."""
    with open(file_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return (
        f'<iframe src="data:application/pdf;base64,{b64}" '
        f'width="100%" height="700" style="border:none; border-radius:12px;"></iframe>'
    )


# ─────────────────────────────────────────────────────────────
#  System / environment info  (all safe — no crash on server)
# ─────────────────────────────────────────────────────────────

def get_system_info() -> dict:
    host_name   = socket.gethostname()
    ip_add      = "Unknown"
    try:
        ip_add = socket.gethostbyname(host_name)
    except Exception:
        pass

    dev_user = "Unknown"
    try:
        dev_user = os.getlogin()
    except Exception:
        dev_user = os.environ.get("USER", os.environ.get("USERNAME", "Unknown"))

    os_name_ver = platform.system() + " " + platform.release()
    return dict(host_name=host_name, ip_add=ip_add, dev_user=dev_user, os_name_ver=os_name_ver)


def get_geo_info() -> dict:
    result = dict(latlong="", city="Unknown", state="Unknown", country="Unknown")
    try:
        g = geocoder.ip("me")
        if g and g.latlng:
            result["latlong"] = str(g.latlng)
            geolocator = Nominatim(user_agent="ai-resume-analyzer", timeout=4)
            location = geolocator.reverse(g.latlng, language="en")
            if location and "address" in location.raw:
                addr = location.raw["address"]
                result["city"]    = addr.get("city", addr.get("town", addr.get("village", "Unknown")))
                result["state"]   = addr.get("state", "Unknown")
                result["country"] = addr.get("country", "Unknown")
    except Exception:
        pass
    return result


# ─────────────────────────────────────────────────────────────
#  Download helper
# ─────────────────────────────────────────────────────────────

def df_to_csv_link(df, filename: str, label: str) -> str:
    csv  = df.to_csv(index=False)
    b64  = base64.b64encode(csv.encode()).decode()
    return f'<a href="data:file/csv;base64,{b64}" download="{filename}" class="dl-link">{label}</a>'


# ─────────────────────────────────────────────────────────────
#  Timestamp
# ─────────────────────────────────────────────────────────────

def now_timestamp() -> str:
    ts = time.time()
    d  = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
    t  = datetime.datetime.fromtimestamp(ts).strftime("%H:%M:%S")
    return f"{d}_{t}"


# ─────────────────────────────────────────────────────────────
#  Skill field matcher  (scores every field, picks the best)
# ─────────────────────────────────────────────────────────────

FIELD_KEYWORDS = {
    "Data Science": [
        "machine learning","deep learning","python","tensorflow","keras","pytorch",
        "scikit-learn","pandas","numpy","data analysis","data science","nlp",
        "computer vision","statistics","big data","hadoop","spark","sql","r",
        "tableau","power bi","data visualization","data mining","neural network",
    ],
    "Web Development": [
        "html","css","javascript","react","angular","vue","node","express",
        "django","flask","php","laravel","mongodb","mysql","postgresql",
        "rest api","graphql","typescript","bootstrap","tailwind","webpack","redux",
    ],
    "Android Development": [
        "android","kotlin","java","flutter","dart","xml","sdk","gradle",
        "android studio","firebase","sqlite","material design","jetpack","retrofit",
    ],
    "iOS Development": [
        "ios","swift","objective-c","xcode","cocoa","swiftui","uikit",
        "core data","arkit","avfoundation","testflight","app store",
    ],
    "UI/UX Design": [
        "figma","adobe xd","sketch","invision","zeplin","balsamiq",
        "prototyping","wireframe","user research","usability","interaction design",
        "ux","ui","typography","design thinking","user experience","user interface",
    ],
}

FIELD_RECOMMENDED_SKILLS = {
    "Data Science": [
        "Data Visualization","Predictive Analysis","Statistical Modeling",
        "Data Mining","Clustering & Classification","ML Algorithms",
        "Keras","PyTorch","Scikit-learn","TensorFlow","Flask","Streamlit",
    ],
    "Web Development": [
        "React","Django","Node.js","TypeScript","GraphQL","Docker",
        "Redis","PostgreSQL","REST APIs","CI/CD","Tailwind CSS",
    ],
    "Android Development": [
        "Kotlin","Jetpack Compose","Firebase","Room DB","Retrofit",
        "MVVM","Android Studio","Gradle","Material 3","WorkManager",
    ],
    "iOS Development": [
        "SwiftUI","Combine","Core Data","ARKit","CloudKit",
        "TestFlight","XCTest","App Store Connect","WidgetKit",
    ],
    "UI/UX Design": [
        "Figma","Adobe XD","Interaction Design","User Research",
        "A/B Testing","Accessibility","Motion Design","Design Systems",
    ],
}


def detect_field(skills: list) -> str:
    """Score each field and return the best match (or 'General')."""
    skills_lower = {s.lower() for s in skills}
    scores = {}
    for field, keywords in FIELD_KEYWORDS.items():
        scores[field] = sum(1 for kw in keywords if kw in skills_lower)
    best_field = max(scores, key=scores.get)
    return best_field if scores[best_field] > 0 else "General"


def get_candidate_level(resume_text: str, no_of_pages: int) -> str:
    text_up = resume_text.upper()
    if any(x in text_up for x in ["EXPERIENCE", "WORK EXPERIENCE"]):
        return "Experienced"
    if any(x in text_up for x in ["INTERNSHIP", "INTERNSHIPS"]):
        return "Intermediate"
    if no_of_pages == 1:
        return "Fresher"
    return "Intermediate"
