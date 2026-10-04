# -*- coding: utf-8 -*-
"""
ResumeAI - Python/FastAPI NLP & ML Service
Provides high-performance resume parsing, spaCy NER entity extraction,
universal domain classification, Groq LLM integration, and ReportLab PDF compilation.
"""

import os
import sys
import io
import re
import random
import time
import json
import secrets
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import nltk
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except Exception as e:
    print(f"NLTK download notice: {e}")

from pyresparser import ResumeParser
from config import GROQ_API_KEY
from utils import (
    read_pdf_text, read_docx_text, pdf_to_base64_iframe, get_system_info,
    get_geo_info, now_timestamp, detect_field, get_candidate_level,
    FIELD_RECOMMENDED_SKILLS, FIELD_KEYWORDS
)
from Courses import (
    ds_course, web_course, android_course, ios_course, uiux_course,
    resume_videos, interview_videos
)

UPLOAD_DIR = os.path.join(current_dir, "Uploaded_Resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="ResumeAI ML & NLP Service",
    description="FastAPI microservice for Universal Resume Parsing, spaCy NER, Domain Matching, and Groq LLM Intelligence",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AITipsRequest(BaseModel):
    resume_text: str

class MatchRequest(BaseModel):
    resume_text: str
    jd_text: str
    name: Optional[str] = "Candidate"

class TailorResumeRequest(BaseModel):
    resume_text: str
    jd_text: str
    name: Optional[str] = "Candidate"
    missing_keywords: Optional[List[str]] = []

class CoverLetterRequest(BaseModel):
    resume_text: str
    jd_text: str
    name: Optional[str] = "Candidate"

class GeneratePDFRequest(BaseModel):
    resume_text: str
    template: Optional[str] = "modern_single"
    name: Optional[str] = "Candidate Name"

def groq_call(prompt: str, system: str = "", max_tokens: int = 2200) -> str:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured on the server.")
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    candidate_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "llama-3.3-70b-versatile"]
    
    last_err = None
    for model_name in candidate_models:
        try:
            resp = client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.6
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            last_err = e
            continue
    raise last_err or ValueError("Failed to call Groq API with candidate models")

SECTION_DEFINITIONS = [
    {
        "id": "summary",
        "label": "Summary & Objective",
        "points": 10,
        "keywords": ["Objective", "Summary", "OBJECTIVE", "SUMMARY", "PROFILE", "About Me", "Executive Summary", "Professional Summary", "Career Summary", "Personal Statement"],
        "pro_tip": "A 3-4 line targeted executive summary highlighting your primary domain, years of experience, and core stack improves ATS keyword density."
    },
    {
        "id": "education",
        "label": "Education Details",
        "points": 15,
        "keywords": ["Education", "School", "College", "University", "EDUCATION", "Academic", "Degree", "Qualifications", "Educational Background", "Academics"],
        "pro_tip": "List your degree, university/institute, graduation year, and key coursework or honors (e.g. Dean's List, GPA >= 3.5)."
    },
    {
        "id": "experience",
        "label": "Work Experience & Internships",
        "points": 25,
        "keywords": ["EXPERIENCE", "WORK EXPERIENCE", "Experience", "Work Experience", "Employment", "Professional Experience", "Work History", "Career History", "INTERNSHIP", "INTERNSHIPS", "Internship", "Internships", "Training", "Apprenticeship", "Industrial Training", "Practical Training"],
        "pro_tip": "Use the STAR format (Situation, Task, Action, Result) with strong action verbs (Engineered, Spearheaded, Optimized) and quantified metrics (%, $, scale)."
    },
    {
        "id": "skills",
        "label": "Skills Section",
        "points": 20,
        "keywords": ["SKILLS", "SKILL", "Skills", "Skill", "TECHNICAL SKILLS", "Core Competencies", "Technologies", "Key Skills", "Skill Set", "Tools & Technologies"],
        "pro_tip": "Organize skills into distinct categories: Programming Languages, Frameworks & Libraries, Cloud & Databases, and Developer Tools."
    },
    {
        "id": "achievements",
        "label": "Achievements & Awards",
        "points": 10,
        "keywords": ["ACHIEVEMENTS", "Achievements", "AWARDS", "Awards", "Honors", "Accomplishments", "Recognitions", "Honors & Awards"],
        "pro_tip": "Include competitive rankings, hackathon wins, published papers, or employee excellence recognitions."
    },
    {
        "id": "certifications",
        "label": "Certifications & Credentials",
        "points": 10,
        "keywords": ["CERTIFICATIONS", "Certifications", "Certification", "Courses", "Credentials", "Licenses & Certifications", "Certificates"],
        "pro_tip": "Add verified certifications with issuing authorities (AWS, Google Cloud, Meta, Coursera) and credential IDs/links."
    },
    {
        "id": "projects",
        "label": "Projects & Initiatives",
        "points": 10,
        "keywords": ["PROJECTS", "Projects", "PROJECT", "Key Initiatives", "Open Source", "Academic Projects", "Personal Projects", "Project Work"],
        "pro_tip": "Provide project title, tech stack used, problem solved, quantified result, and live GitHub demo URL."
    },
]

def calculate_ats_checklist(text: str):
    score = 0
    checks = []
    lines = text.replace('\r\n', '\n').split('\n')
    
    detected_headers = []
    for line_idx, line in enumerate(lines):
        clean_line = line.strip()
        if not clean_line or len(clean_line) > 70:
            continue
        clean_lower = re.sub(r'^[\s#*>\-–—•0-9.)]+', '', clean_line)
        clean_lower = re.sub(r'[:\-\—\.\*#]+$', '', clean_lower).strip().lower()
        
        for sec in SECTION_DEFINITIONS:
            for kw in sec["keywords"]:
                kw_lower = kw.lower()
                if clean_lower == kw_lower or clean_lower.startswith(kw_lower + ' ') or clean_lower.endswith(' ' + kw_lower):
                    detected_headers.append({
                        "sec_id": sec["id"],
                        "line_idx": line_idx,
                        "line_text": line
                    })
                    break
                    
    # Deduplicate headers
    seen_sec_ids = set()
    unique_headers = []
    for h in detected_headers:
        if h["sec_id"] not in seen_sec_ids:
            seen_sec_ids.add(h["sec_id"])
            unique_headers.append(h)
    unique_headers.sort(key=lambda x: x["line_idx"])
    
    # Extract slices
    extracted_sections = {}
    for i, curr in enumerate(unique_headers):
        start_line = curr["line_idx"] + 1
        end_line = unique_headers[i + 1]["line_idx"] if i + 1 < len(unique_headers) else len(lines)
        content_lines = lines[start_line:end_line]
        extracted_sections[curr["sec_id"]] = "\n".join(content_lines).strip()
        
    for sec in SECTION_DEFINITIONS:
        content = extracted_sections.get(sec["id"], "")
        found = bool(content and len(content) >= 8)
        if not found:
            # Fallback search anywhere in text
            found = any(re.search(r'\b' + re.escape(k.lower()) + r'\b', text.lower()) for k in sec["keywords"])
            if found:
                for k in sec["keywords"]:
                    k_lower = k.lower()
                    pos = text.lower().find(k_lower)
                    if pos != -1:
                        snippet = text[pos + len(k_lower): pos + len(k_lower) + 400].strip()
                        if len(snippet) > 15:
                            content = snippet.split('\n\n')[0].strip()
                            break
                            
        if found:
            score += sec["points"]
            
        word_count = len(content.split()) if content else 0
        checks.append({
            "id": sec["id"],
            "label": sec["label"],
            "points": sec["points"],
            "found": found,
            "content": content,
            "word_count": word_count,
            "pro_tip": sec["pro_tip"]
        })
        
    score = min(100, max(0, score))
    return score, checks

def detect_universal_field_with_scores(skills: list, text: str):
    skills_lower = " ".join([s.lower() for s in skills]) + " " + text.lower()
    
    domain_map = [
        ("Data Science & AI", ["machine learning", "deep learning", "python", "pandas", "numpy", "pytorch", "tensorflow", "nlp", "computer vision", "statistics", "data science", "tableau", "power bi", "eda", "data analyst", "artificial intelligence"]),
        ("Full Stack Web Development", ["react", "node", "express", "javascript", "typescript", "django", "flask", "mongodb", "postgresql", "html", "css", "next.js", "frontend", "backend", "full stack"]),
        ("Software Engineering", ["c++", "java", "c#", ".net", "algorithms", "data structures", "microservices", "multithreading", "oop", "system design", "software engineer", "database"]),
        ("Cloud & DevOps Engineering", ["docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd", "jenkins", "ansible", "linux", "cloud", "devops", "sre"]),
        ("Data Engineering", ["spark", "hadoop", "kafka", "airflow", "etl", "data warehouse", "snowflake", "bigquery", "sql", "data engineering", "pipeline"]),
        ("Mobile App Engineering", ["flutter", "dart", "react native", "android", "ios", "kotlin", "swift", "swiftui", "jetpack compose"]),
        ("UI/UX Design & Research", ["figma", "adobe xd", "wireframing", "prototyping", "user research", "usability testing", "design systems", "interaction design", "ui/ux"]),
        ("Cybersecurity & Infosec", ["penetration testing", "siem", "soc", "cryptography", "firewall", "vulnerability", "cissp", "ceh", "wireshark", "security"]),
        ("Product Management", ["product management", "roadmap", "agile", "scrum", "user stories", "kpi", "market research", "stakeholder management"]),
        ("Finance & Quantitative Analysis", ["financial modeling", "valuation", "excel", "bloomberg", "risk management", "accounting", "portfolio", "trading"])
    ]
    
    raw_counts = {}
    for domain, kws in domain_map:
        cnt = sum(1 for kw in kws if kw in skills_lower)
        raw_counts[domain] = cnt
        
    max_cnt = max(raw_counts.values()) if raw_counts else 1
    best_dom = max(raw_counts.items(), key=lambda x: x[1])[0] if max_cnt > 0 else "Data Science & AI"
    
    domain_scores = {}
    for domain, cnt in raw_counts.items():
        if max_cnt > 0 and cnt > 0:
            pct = int((cnt / max_cnt) * 65) + random.randint(25, 32)
            if domain == best_dom:
                pct = max(88, min(97, pct))
            else:
                pct = min(82, max(18, pct))
        else:
            pct = 92 if domain == best_dom else random.randint(12, 28)
        domain_scores[domain] = pct
        
    return best_dom, domain_scores

def generate_health_breakdown(ats_score: int, text: str, detected_skills: list):
    has_metrics = bool(re.search(r'\b\d+(\.\d+)?%|\$\d+|\b\d+\+?\s*(users|ms|clients|hours|x|k|m)\b', text, re.IGNORECASE))
    content = min(98, max(65, ats_score + (6 if len(text.split()) > 200 else -10)))
    formatting = min(95, max(70, 84 if ats_score >= 60 else 68))
    keywords = min(98, max(60, min(95, len(detected_skills) * 8 + 40)))
    impact = min(95, max(55, 86 if has_metrics else 68))
    completeness = min(98, max(65, ats_score + 4))
    
    return {
        "content": content,
        "formatting": formatting,
        "keywords": keywords,
        "impact": impact,
        "completeness": completeness
    }

def generate_next_moves_personalized(detected_skills: list, predicted_field: str, checks_result: list, text: str):
    skills_lower = [s.lower() for s in detected_skills]
    text_lower = text.lower()
    
    moves = []
    added_titles = set()
    
    def add_move(title, pts, impact, detail):
        if title not in added_titles and len(moves) < 4:
            added_titles.add(title)
            moves.append({
                "id": f"0{len(moves)+1}",
                "title": title,
                "pts": pts,
                "impact": impact,
                "detail": detail
            })
    
    # 1. Check for missing sections
    missing_sections = [c for c in checks_result if not c["found"]]
    if any("certif" in c["label"].lower() for c in missing_sections):
        add_move(
            "Add Verified Certifications Section",
            "+10 pts potential",
            "High impact",
            "Add recognized industry credentials (e.g. AWS Certified, Google Cloud, Meta Professional) to prove verified technical competency."
        )
    elif any("summary" in c["label"].lower() for c in missing_sections):
        add_move(
            "Add 3-Line Targeted Executive Summary",
            "+8 pts potential",
            "High impact",
            "Start your resume with a punchy summary highlighting your primary domain, years of experience, and standout core stack."
        )

    # 2. Check for metric quantification (STAR format)
    has_metrics = bool(re.search(r'\b\d+(\.\d+)?%|\$\d+|\b\d+\+?\s*(users|ms|clients|hours|x|k|m|lpa)\b', text, re.IGNORECASE))
    if not has_metrics or text.count('%') < 2:
        add_move(
            "Quantify 3+ Bullet Points with STAR Metrics",
            "+6 pts potential",
            "High impact",
            "Include measurable business outcomes in your experience (e.g. 'Optimized model inference time by 38% on 50k+ test samples')."
        )

    # 3. High-demand domain skill gaps
    reco_pool = {
        "Data Science & AI": [
            ("Integrate MLflow & Experiment Tracking", "Feature MLflow and model registry tracking in key project descriptions to match senior roles."),
            ("Integrate Vector Databases (RAG)", "Highlight embeddings, vector search (Chroma/FAISS), or LLM pipelines in your core project stack."),
            ("Integrate Feature Engineering Pipelines", "Showcase data preprocessing, scaling, and automated feature selection workflows.")
        ],
        "Full Stack Web Development": [
            ("Integrate Docker Containerization", "Mention containerizing web services and microservices with Docker and Compose."),
            ("Integrate Next.js App Router & SSR", "Demonstrate production proficiency in server-side rendering, routing, and modern full-stack workflows."),
            ("Integrate Redis Caching Layer", "Highlight distributed caching and API latency optimization in backend endpoints.")
        ],
        "Software Engineering": [
            ("Feature Microservices Architecture", "Demonstrate scalable REST/gRPC service decomposition and event-driven architecture."),
            ("Integrate Unit & Automated CI/CD Testing", "Mention Jest/PyTest test coverage and automated deployment workflows."),
            ("Demonstrate Distributed Caching", "Highlight Redis/Memcached integration for high-throughput system performance.")
        ],
        "Cloud & DevOps Engineering": [
            ("Integrate Kubernetes & Helm", "Highlight container orchestration, Helm charts, and cluster scaling."),
            ("Integrate Terraform (IaC)", "Feature infrastructure-as-code automation across multi-region environments."),
            ("Integrate Prometheus & Grafana", "Demonstrate end-to-end telemetry, monitoring, and automated alerting.")
        ]
    }
    
    fallback_pool = [
        ("Group Technical Skills into Clear Subcategories", "Organize skills under: Languages, Frameworks & Libraries, Databases & Cloud, and Developer Tools."),
        ("Add Live GitHub & Deployment Links", "Include clickable hyperlinks to live demo websites or public GitHub repositories for top projects."),
        ("Strengthen Action Verbs in Bullet Points", "Start every bullet with strong verbs: Spearheaded, Engineered, Architected, Optimized, Implemented.")
    ]
    
    domain_recos = reco_pool.get(predicted_field, reco_pool["Data Science & AI"])
    for title, detail in domain_recos:
        keyword = title.replace("Integrate ", "").replace("Feature ", "").lower()
        if not any(w in skills_lower or w in text_lower for w in keyword.split()[:2]):
            add_move(title, "+4 pts potential", "Medium impact", detail)
            
    for title, detail in fallback_pool:
        add_move(title, "+3 pts potential", "Medium impact", detail)
        
    return moves[:4]

def generate_best_job_matches(predicted_field: str, detected_skills: list):
    job_templates = {
        "Data Science & AI": [
            {
                "role": "Machine Learning Engineer",
                "company": "Microsoft",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b924 - 40 LPA",
                "job_type": "Full-time",
                "tags": ["Python", "PyTorch", "Azure ML", "MLOps", "Transformers", "TensorFlow", "Scikit-Learn"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Machine+Learning+Engineer+Microsoft",
                "description": "Design, build, and deploy production ML models at scale on Azure."
            },
            {
                "role": "Senior Data Scientist",
                "company": "Amazon AWS",
                "location": "Hyderabad, India (Hybrid)",
                "salary": "\u20b928 - 48 LPA",
                "job_type": "Full-time",
                "tags": ["Python", "Scikit-Learn", "AWS SageMaker", "SQL", "Statistics", "Pandas", "NumPy"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Amazon",
                "description": "Lead predictive modeling, behavioral segmentation, and statistical experimentation across AWS cloud services."
            },
            {
                "role": "AI / GenAI Research Engineer",
                "company": "Google",
                "location": "Bengaluru, India / Remote",
                "salary": "\u20b932 - 55 LPA",
                "job_type": "Full-time",
                "tags": ["Deep Learning", "NLP", "LLMs", "RAG", "Vector DB", "Python", "Transformers"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=AI+Engineer+Google",
                "description": "Develop and fine-tune large multimodal models and retrieval-augmented generation frameworks."
            },
            {
                "role": "Data Analyst / BI Specialist",
                "company": "Deloitte",
                "location": "Gurgaon, India (Hybrid)",
                "salary": "\u20b914 - 22 LPA",
                "job_type": "Full-time",
                "tags": ["Tableau", "Power BI", "SQL", "Pandas", "EDA", "Excel", "Python"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Deloitte",
                "description": "Transform complex datasets into actionable executive dashboards and ETL pipelines."
            },
            {
                "role": "Computer Vision Engineer",
                "company": "Flipkart",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b920 - 35 LPA",
                "job_type": "Full-time",
                "tags": ["OpenCV", "PyTorch", "YOLO", "CNN", "Docker", "Python", "TensorFlow"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Computer+Vision+Engineer+Flipkart",
                "description": "Architect visual search, catalog tagging, and defect detection using convolutional networks."
            },
            {
                "role": "Applied Data Science Consultant",
                "company": "McKinsey & Company",
                "location": "Mumbai, India (Hybrid)",
                "salary": "\u20b926 - 45 LPA",
                "job_type": "Full-time",
                "tags": ["Machine Learning", "Python", "Business Analytics", "Optimization", "Statistics", "SQL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+McKinsey",
                "description": "Formulate AI-driven revenue strategies, pricing optimization engines, and supply chain forecasting models."
            }
        ],
        "Full Stack Web Development": [
            {
                "role": "Senior Full Stack Engineer",
                "company": "Meta",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b928 - 50 LPA",
                "job_type": "Full-time",
                "tags": ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "JavaScript", "REST APIs"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer+Meta",
                "description": "Build high-throughput web applications and scalable GraphQL services for hundreds of millions of daily active users."
            },
            {
                "role": "Frontend Software Engineer",
                "company": "Google",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b926 - 45 LPA",
                "job_type": "Full-time",
                "tags": ["React", "Next.js", "TypeScript", "Web Performance", "JavaScript", "HTML", "CSS"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Frontend+Engineer+Google",
                "description": "Architect accessible, ultra-responsive frontend platforms focused on core web vitals and state management."
            },
            {
                "role": "Backend Engineer (Node/Python)",
                "company": "Uber",
                "location": "Hyderabad, India (Hybrid)",
                "salary": "\u20b925 - 42 LPA",
                "job_type": "Full-time",
                "tags": ["Node.js", "Python", "Microservices", "Kafka", "Redis", "PostgreSQL", "REST APIs"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Backend+Engineer+Uber",
                "description": "Develop low-latency distributed dispatch and pricing services handling millions of concurrent geospatial events."
            },
            {
                "role": "Full Stack Developer",
                "company": "Swiggy",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b918 - 30 LPA",
                "job_type": "Full-time",
                "tags": ["React", "Node.js", "MongoDB", "Express", "Docker", "JavaScript", "HTML", "CSS"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer+Swiggy",
                "description": "Deliver customer-facing discovery and checkout features using React micro-frontends and Node.js APIs."
            },
            {
                "role": "Full Stack Platform Engineer",
                "company": "Atlassian",
                "location": "Bengaluru, India / Remote",
                "salary": "\u20b924 - 40 LPA",
                "job_type": "Full-time",
                "tags": ["TypeScript", "React", "AWS", "Java", "REST APIs", "Node.js", "PostgreSQL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Atlassian",
                "description": "Build extensible plugin architectures and real-time collaborative document editing interfaces on Jira/Confluence."
            },
            {
                "role": "UI Engineer / Frontend Specialist",
                "company": "Razorpay",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b916 - 28 LPA",
                "job_type": "Full-time",
                "tags": ["React", "JavaScript", "HTML", "CSS", "Design Systems", "Jest", "TypeScript"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+Razorpay",
                "description": "Craft frictionless payment checkout SDKs, analytics dashboards, and accessible UI design libraries."
            }
        ],
        "Software Engineering": [
            {
                "role": "Software Development Engineer II",
                "company": "Amazon",
                "location": "Hyderabad / Bengaluru, India",
                "salary": "\u20b928 - 46 LPA",
                "job_type": "Full-time",
                "tags": ["Java", "System Design", "Distributed Systems", "AWS", "OOP", "Algorithms", "Data Structures"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Development+Engineer+Amazon",
                "description": "Architect fault-tolerant e-commerce services with high availability, robust system design, and automated testing."
            },
            {
                "role": "Member of Technical Staff",
                "company": "Oracle",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b922 - 36 LPA",
                "job_type": "Full-time",
                "tags": ["C++", "Algorithms", "Multithreading", "Linux", "Java", "SQL", "Databases"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Developer+Oracle",
                "description": "Design core relational database engine optimizations and high-performance multithreaded cloud kernels."
            },
            {
                "role": "Backend Software Engineer",
                "company": "Stripe",
                "location": "Bengaluru, India / Remote",
                "salary": "\u20b930 - 52 LPA",
                "job_type": "Full-time",
                "tags": ["Go", "Ruby", "PostgreSQL", "APIs", "Python", "Microservices", "Distributed Systems"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Stripe",
                "description": "Build resilient global payments infrastructure and idempotent billing APIs with five-nines reliability."
            },
            {
                "role": "Systems Software Engineer",
                "company": "Adobe",
                "location": "Noida / Bengaluru, India",
                "salary": "\u20b920 - 34 LPA",
                "job_type": "Full-time",
                "tags": ["C++", "Java", "Data Structures", "Algorithms", "Python", "Linux", "Cloud APIs"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Adobe",
                "description": "Implement high-performance graphics algorithms, document rendering engines, and real-time cloud collaboration services."
            },
            {
                "role": "Software Engineer (Fintech)",
                "company": "CRED",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b925 - 42 LPA",
                "job_type": "Full-time",
                "tags": ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Redis", "Microservices", "SQL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+CRED",
                "description": "Design highly concurrent financial transaction engines, rewards ledgers, and credit risk evaluation microservices."
            },
            {
                "role": "Core Platform Engineer",
                "company": "Goldman Sachs",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b924 - 38 LPA",
                "job_type": "Full-time",
                "tags": ["Java", "Python", "Distributed Systems", "SQL", "Unix", "Algorithms", "C++"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Goldman+Sachs",
                "description": "Develop algorithmic trading risk calculation pipelines and low-latency order routing systems."
            }
        ],
        "Cloud & DevOps Engineering": [
            {
                "role": "DevOps / Site Reliability Engineer",
                "company": "Netflix",
                "location": "Mumbai / Remote, India",
                "salary": "\u20b932 - 55 LPA",
                "job_type": "Full-time",
                "tags": ["Kubernetes", "AWS", "Terraform", "Linux", "Docker", "CI/CD", "Python"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer+Netflix",
                "description": "Automate resilient multi-region infrastructure and zero-downtime deployment pipelines for global streaming."
            },
            {
                "role": "Cloud Solutions Architect",
                "company": "Amazon AWS",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b928 - 48 LPA",
                "job_type": "Full-time",
                "tags": ["AWS", "Docker", "Terraform", "CI/CD", "Security", "Kubernetes", "Python"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Cloud+Architect+AWS",
                "description": "Design secure enterprise cloud migrations, containerized microservices, and automated infrastructure as code."
            },
            {
                "role": "Site Reliability Engineer (SRE)",
                "company": "LinkedIn",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b924 - 40 LPA",
                "job_type": "Full-time",
                "tags": ["Kubernetes", "Python", "Prometheus", "Grafana", "Linux", "AWS", "Terraform"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=SRE+LinkedIn",
                "description": "Manage telemetry, SLOs, automated incident remediation, and distributed system stability for 1B+ members."
            },
            {
                "role": "DevOps Engineer",
                "company": "Zomato",
                "location": "Gurgaon, India (Hybrid)",
                "salary": "\u20b918 - 30 LPA",
                "job_type": "Full-time",
                "tags": ["Docker", "Kubernetes", "CI/CD", "Jenkins", "AWS", "Linux", "Terraform"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer+Zomato",
                "description": "Maintain automated container build pipelines, blue-green deployments, and auto-scaling clusters."
            },
            {
                "role": "Cloud Security Engineer",
                "company": "Cisco",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b920 - 35 LPA",
                "job_type": "Full-time",
                "tags": ["Azure", "AWS", "IAM", "Compliance", "Terraform", "Security", "Linux"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Cloud+Security+Cisco",
                "description": "Enforce zero-trust cloud network security, vulnerability remediation, and IAM compliance across hybrid environments."
            },
            {
                "role": "Infrastructure Automation Engineer",
                "company": "Salesforce",
                "location": "Hyderabad, India (Hybrid)",
                "salary": "\u20b922 - 36 LPA",
                "job_type": "Full-time",
                "tags": ["Ansible", "Terraform", "Python", "GCP", "Kubernetes", "CI/CD", "Docker"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Infrastructure+Engineer+Salesforce",
                "description": "Automate declarative configuration management, multi-tenant database provisioning, and continuous deployment workflows."
            }
        ],
        "UI/UX Design & Research": [
            {
                "role": "Senior Product Designer",
                "company": "Airbnb",
                "location": "Gurgaon / Remote, India",
                "salary": "\u20b924 - 42 LPA",
                "job_type": "Full-time",
                "tags": ["Figma", "Design Systems", "Prototyping", "User Research", "Adobe XD", "Wireframing"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Airbnb",
                "description": "Shape next-generation travel discovery workflows through elegant interactions and rapid prototyping."
            },
            {
                "role": "UI/UX Specialist",
                "company": "Adobe",
                "location": "Noida, India (Hybrid)",
                "salary": "\u20b920 - 34 LPA",
                "job_type": "Full-time",
                "tags": ["Adobe XD", "Figma", "Wireframing", "Interaction Design", "Usability", "Prototyping"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=UX+Designer+Adobe",
                "description": "Design intuitive creative tools and accessible interface component libraries for cloud-based authoring apps."
            },
            {
                "role": "UX Researcher",
                "company": "Spotify",
                "location": "Mumbai / Remote, India",
                "salary": "\u20b922 - 38 LPA",
                "job_type": "Full-time",
                "tags": ["User Interviews", "Usability Testing", "Personas", "Analytics", "Figma", "User Research"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=UX+Researcher+Spotify",
                "description": "Conduct qualitative interviews and usability benchmarking to guide personalized recommendation UX."
            },
            {
                "role": "Lead Interaction Designer",
                "company": "Flipkart",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b918 - 32 LPA",
                "job_type": "Full-time",
                "tags": ["Micro-interactions", "Figma", "Design Tokens", "Mobile UX", "Prototyping", "Wireframing"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=UI+UX+Designer+Flipkart",
                "description": "Craft mobile e-commerce checkout funnels, micro-animations, and regional localization design patterns."
            },
            {
                "role": "Product Experience Designer",
                "company": "Razorpay",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b916 - 28 LPA",
                "job_type": "Full-time",
                "tags": ["Fintech UX", "Wireframing", "Figma", "Information Architecture", "User Research", "Prototyping"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Razorpay",
                "description": "Simplify B2B financial onboarding, payment gateway verification, and treasury management workflows."
            },
            {
                "role": "Design Systems Engineer",
                "company": "Postman",
                "location": "Bengaluru, India / Remote",
                "salary": "\u20b920 - 35 LPA",
                "job_type": "Full-time",
                "tags": ["Design Tokens", "Figma", "Storybook", "Accessibility", "React", "CSS"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Design+Systems+Postman",
                "description": "Maintain multi-platform design tokens, accessible React component libraries, and unified UI guidelines."
            }
        ],
        "Data Engineering": [
            {
                "role": "Senior Data Engineer",
                "company": "Databricks",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b928 - 48 LPA",
                "job_type": "Full-time",
                "tags": ["Apache Spark", "Python", "SQL", "Delta Lake", "Kafka", "Airflow", "ETL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Engineer+Databricks",
                "description": "Design and optimize petabyte-scale Spark pipelines, Delta Lake architectures, and real-time streaming ingestion."
            },
            {
                "role": "Analytics Engineer",
                "company": "PhonePe",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b920 - 34 LPA",
                "job_type": "Full-time",
                "tags": ["dbt", "SQL", "BigQuery", "Python", "Airflow", "Data Warehouse", "ETL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Analytics+Engineer+PhonePe",
                "description": "Own end-to-end analytical data models, dbt transformation pipelines, and reliable BI-layer datasets."
            },
            {
                "role": "Data Platform Engineer",
                "company": "Flipkart",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b922 - 38 LPA",
                "job_type": "Full-time",
                "tags": ["Hadoop", "Hive", "Kafka", "Python", "SQL", "Spark", "ETL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Engineer+Flipkart",
                "description": "Build robust data lake ingestion layers and real-time event streaming pipelines for e-commerce analytics."
            },
            {
                "role": "Cloud Data Engineer",
                "company": "Accenture",
                "location": "Pune / Bengaluru, India",
                "salary": "\u20b916 - 28 LPA",
                "job_type": "Full-time",
                "tags": ["AWS Glue", "Redshift", "SQL", "Python", "Terraform", "ETL", "S3"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Engineer+Accenture",
                "description": "Migrate enterprise data warehouses to cloud and build serverless ETL jobs in AWS-based architectures."
            },
            {
                "role": "Real-time Streaming Engineer",
                "company": "Ola",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b922 - 36 LPA",
                "job_type": "Full-time",
                "tags": ["Kafka", "Flink", "Spark Streaming", "Python", "SQL", "Redis", "Kubernetes"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Streaming+Engineer+Ola",
                "description": "Build event-driven streaming architectures for real-time ride demand forecasting and live driver positioning."
            },
            {
                "role": "ML Data Engineer",
                "company": "Meesho",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b918 - 30 LPA",
                "job_type": "Full-time",
                "tags": ["Python", "Spark", "Kafka", "SQL", "MLflow", "Feature Store", "ETL"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Data+Engineer+Meesho",
                "description": "Architect training data pipelines, feature stores, and serving infrastructure for recommendation models."
            }
        ],
        "Mobile App Engineering": [
            {
                "role": "Senior Flutter Developer",
                "company": "Paytm",
                "location": "Noida, India (Hybrid)",
                "salary": "\u20b918 - 32 LPA",
                "job_type": "Full-time",
                "tags": ["Flutter", "Dart", "Firebase", "REST APIs", "GetX", "BLoC", "Android"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Flutter+Developer+Paytm",
                "description": "Lead cross-platform mobile feature delivery for 300M+ Paytm users using Flutter and Dart."
            },
            {
                "role": "Android Engineer",
                "company": "Zomato",
                "location": "Gurgaon, India (On-site)",
                "salary": "\u20b920 - 35 LPA",
                "job_type": "Full-time",
                "tags": ["Kotlin", "Jetpack Compose", "Android", "Coroutines", "MVVM", "Room", "Retrofit"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Android+Developer+Zomato",
                "description": "Craft high-performance food discovery and order tracking experiences on Android using Jetpack Compose."
            },
            {
                "role": "iOS Engineer",
                "company": "CRED",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b922 - 38 LPA",
                "job_type": "Full-time",
                "tags": ["Swift", "SwiftUI", "iOS", "Combine", "CoreData", "REST APIs", "XCode"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=iOS+Developer+CRED",
                "description": "Engineer premium fintech iOS experiences with fluid animations, biometric auth, and real-time credit analytics."
            },
            {
                "role": "React Native Developer",
                "company": "OYO",
                "location": "Gurgaon / Remote, India",
                "salary": "\u20b916 - 28 LPA",
                "job_type": "Full-time",
                "tags": ["React Native", "JavaScript", "TypeScript", "Redux", "REST APIs", "Firebase"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=React+Native+Developer+OYO",
                "description": "Build cross-platform hotel booking flows, real-time availability search, and property management tools."
            },
            {
                "role": "Mobile Platform Engineer",
                "company": "Swiggy",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b920 - 36 LPA",
                "job_type": "Full-time",
                "tags": ["Kotlin", "Flutter", "Android", "iOS", "Swift", "Performance Optimization"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Mobile+Engineer+Swiggy",
                "description": "Own mobile performance optimization and shared architecture across Android and iOS apps."
            },
            {
                "role": "Mobile SDK Engineer",
                "company": "Razorpay",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b918 - 32 LPA",
                "job_type": "Full-time",
                "tags": ["Android", "iOS", "Kotlin", "Swift", "REST APIs", "Security", "Payment SDK"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=SDK+Engineer+Razorpay",
                "description": "Build and maintain the Razorpay Android and iOS payment SDKs used by 500K+ merchant integrations."
            }
        ],
        "Cybersecurity & Infosec": [
            {
                "role": "Security Engineer",
                "company": "Razorpay",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b920 - 38 LPA",
                "job_type": "Full-time",
                "tags": ["Penetration Testing", "OWASP", "Python", "Burp Suite", "Security Audits", "Linux"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Security+Engineer+Razorpay",
                "description": "Perform application and network security assessments and harden payment infrastructure."
            },
            {
                "role": "SOC Analyst (Tier 2)",
                "company": "Wipro",
                "location": "Hyderabad, India (Hybrid)",
                "salary": "\u20b914 - 24 LPA",
                "job_type": "Full-time",
                "tags": ["SIEM", "SOAR", "Threat Intelligence", "Incident Response", "Splunk", "Linux"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=SOC+Analyst+Wipro",
                "description": "Triage security alerts using SIEM platforms, escalate incidents, and develop detection playbooks."
            },
            {
                "role": "Cloud Security Architect",
                "company": "Cisco",
                "location": "Bengaluru, India (Hybrid)",
                "salary": "\u20b928 - 48 LPA",
                "job_type": "Full-time",
                "tags": ["Zero Trust", "AWS", "Azure", "IAM", "Firewall", "Compliance", "Terraform"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Cloud+Security+Cisco",
                "description": "Design zero-trust cloud network policies, identity governance, and regulatory compliance across hybrid environments."
            },
            {
                "role": "Application Security Engineer",
                "company": "PhonePe",
                "location": "Bengaluru, India (On-site)",
                "salary": "\u20b922 - 40 LPA",
                "job_type": "Full-time",
                "tags": ["DAST", "SAST", "Python", "Cryptography", "API Security", "OWASP", "CI/CD"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=AppSec+Engineer+PhonePe",
                "description": "Integrate security into SDLC, automate SAST/DAST pipelines, and perform secure code reviews."
            },
            {
                "role": "Threat & Vulnerability Analyst",
                "company": "HCL Technologies",
                "location": "Noida, India (Hybrid)",
                "salary": "\u20b916 - 28 LPA",
                "job_type": "Full-time",
                "tags": ["CVE", "Nessus", "Vulnerability Management", "Python", "Linux", "Wireshark"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Vulnerability+Analyst+HCL",
                "description": "Operate vulnerability scanning programs, prioritize CVEs by business risk, and report remediation status."
            },
            {
                "role": "Malware & Forensics Analyst",
                "company": "Quick Heal",
                "location": "Pune, India (On-site)",
                "salary": "\u20b912 - 22 LPA",
                "job_type": "Full-time",
                "tags": ["Reverse Engineering", "Malware Analysis", "YARA", "Python", "Assembly", "Linux"],
                "apply_url": "https://www.linkedin.com/jobs/search/?keywords=Malware+Analyst+Quick+Heal",
                "description": "Reverse-engineer malware samples, write YARA detection rules, and contribute threat intelligence to AV engine signatures."
            }
        ]
    }

    # --- Dynamic skill-based scoring ---
    # Normalize candidate skills to lowercase tokens for fuzzy matching
    candidate_skills_lower = set()
    for s in detected_skills:
        for token in re.split(r'[\s/,]+', s.lower()):
            if token:
                candidate_skills_lower.add(token)

    # Score every job across ALL domain pools
    scored_jobs = []
    for domain, jobs in job_templates.items():
        domain_bonus = 1.0 if domain == predicted_field else 0.0
        for job in jobs:
            job_tags_lower = [t.lower() for t in job.get("tags", [])]
            matched = 0
            for tag in job_tags_lower:
                tag_tokens = set(re.split(r'[\s/,]+', tag))
                if tag_tokens & candidate_skills_lower:
                    matched += 1

            total_tags = max(len(job_tags_lower), 1)
            skill_overlap = matched / total_tags  # 0.0 - 1.0

            # Weighted score: 70% skill match + 30% domain alignment
            raw_score = (skill_overlap * 0.70) + (domain_bonus * 0.30)

            # Map to a realistic percentage band (55-98%)
            match_pct = int(55 + raw_score * 43)
            match_pct = max(55, min(98, match_pct))

            scored_jobs.append({
                **job,
                "match": f"{match_pct}% Match",
                "_score": raw_score,
                "_domain": domain
            })

    # Sort descending by score; domain-aligned jobs break ties first
    scored_jobs.sort(key=lambda x: (-x["_score"], 0 if x["_domain"] == predicted_field else 1))

    # Strip internal scoring keys before returning
    top_jobs = []
    for j in scored_jobs[:6]:
        j_clean = {k: v for k, v in j.items() if not k.startswith("_")}
        top_jobs.append(j_clean)

    return top_jobs

@app.get("/health")
def health():
    return {"status": "ok", "service": "ResumeAI Python/FastAPI Universal NLP Engine", "version": "2.0.0"}

@app.post("/api/ml/parse-and-analyze")
async def parse_and_analyze(
    file: UploadFile = File(...),
    act_name: Optional[str] = Form(""),
    act_mail: Optional[str] = Form(""),
    act_mob: Optional[str] = Form(""),
    linkedin: Optional[str] = Form(""),
    github: Optional[str] = Form("")
):
    filename = file.filename or f"resume_{secrets.token_hex(4)}.pdf"
    save_path = os.path.join(UPLOAD_DIR, filename)
    
    file_bytes = await file.read()
    with open(save_path, "wb") as f:
        f.write(file_bytes)
        
    is_pdf = filename.lower().endswith(".pdf")
    is_docx = filename.lower().endswith(".docx")
    
    resume_text = ""
    if is_pdf:
        try:
            resume_text = read_pdf_text(save_path)
        except Exception as e:
            print(f"Error reading pdf text: {e}")
    elif is_docx:
        try:
            resume_text = read_docx_text(save_path)
        except Exception as e:
            print(f"Error reading docx text: {e}")
            
    extracted_data = {}
    try:
        extracted_data = ResumeParser(save_path).get_extracted_data() or {}
    except Exception as e:
        print(f"ResumeParser error: {e}")
        extracted_data = {}

    detected_skills = extracted_data.get("skills") or []
    detected_skills = list(set([s.strip() for s in detected_skills if s and s.strip()]))
    
    predicted_field, domain_scores = detect_universal_field_with_scores(detected_skills, resume_text)
    no_of_pages = extracted_data.get("no_of_pages", 1)
    cand_level = get_candidate_level(resume_text, no_of_pages)
    resume_score, checks_result = calculate_ats_checklist(resume_text)
    health_breakdown = generate_health_breakdown(resume_score, resume_text, detected_skills)
    next_moves = generate_next_moves_personalized(detected_skills, predicted_field, checks_result, resume_text)
    best_matches = generate_best_job_matches(predicted_field, detected_skills)
    
    ai_insight = f"Your resume demonstrates strong technical depth in {predicted_field}. However, project descriptions currently lack quantified business results and explicit cloud deployment details."
    
    ai_solutions = [
        {
            "category": "Quantify Impact",
            "action": "Convert qualitative project descriptions into STAR quantified results",
            "example": "Instead of 'Trained CNN model', write 'Engineered custom CNN architecture, achieving 94.2% validation accuracy on 10,000+ medical imaging samples.'",
            "impact": "+8 pts potential"
        },
        {
            "category": "Technical Categorization",
            "action": "Group Technical Skills into 4 distinct pillars for automated parsers",
            "example": "Languages: Python, SQL | Frameworks: PyTorch, Scikit-learn | BI & Visuals: Tableau, Power BI | Tools: Git, Docker",
            "impact": "+5 pts potential"
        },
        {
            "category": "Domain Alignment",
            "action": "Incorporate key target architecture keywords in Project titles",
            "example": "Feature explicit details on data preprocessing pipelines, exploratory data analysis (EDA), and model evaluation metrics.",
            "impact": "+4 pts potential"
        }
    ]
    
    course_map = {
        "Data Science & AI": ds_course,
        "Full Stack Web Development": web_course,
        "Mobile App Engineering": android_course,
        "UI/UX Design & Research": uiux_course,
    }
    cl = list(course_map.get(predicted_field, ds_course))
    random.shuffle(cl)
    recommended_courses = cl[:6] if cl else []
    
    res_vids = random.sample(resume_videos, min(2, len(resume_videos))) if resume_videos else []
    int_vids = random.sample(interview_videos, min(2, len(interview_videos))) if interview_videos else []
    
    insights = {
        "demand": "Very High", "demand_pct": 92, "growth": "28% YoY", "growth_pct": 84,
        "avg_salary": "₹8 - 22 LPA", "salary_min": 8, "salary_max": 22,
        "top_skills": detected_skills[:4] if len(detected_skills) >= 4 else ["Python", "SQL", "Machine Learning", "Tableau"],
        "trend": [45, 55, 62, 70, 78, 86, 92]
    }

    pdf_base64 = ""
    if is_pdf:
        try:
            import base64
            with open(save_path, "rb") as f:
                pdf_base64 = base64.b64encode(f.read()).decode("utf-8")
        except Exception:
            pdf_base64 = ""

    # Robust regex extraction for contact details
    parsed_email = extracted_data.get("email") or act_mail or ""
    if not parsed_email:
        em_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', resume_text)
        if em_match:
            parsed_email = em_match.group(0)

    parsed_mobile = extracted_data.get("mobile_number") or act_mob or ""
    if not parsed_mobile:
        mob_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\b\d{10}\b', resume_text)
        if mob_match:
            parsed_mobile = mob_match.group(0).strip()

    parsed_linkedin = linkedin or ""
    if not parsed_linkedin:
        li_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)', resume_text, re.IGNORECASE)
        if li_match:
            parsed_linkedin = li_match.group(0)

    parsed_github = github or ""
    if not parsed_github:
        gh_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)', resume_text, re.IGNORECASE)
        if gh_match:
            parsed_github = gh_match.group(0)

    parsed_name = extracted_data.get("name") or act_name or ""
    if not parsed_name or parsed_name == "Candidate":
        first_lines = [l.strip() for l in resume_text[:600].split('\n') if l.strip()]
        for l in first_lines[:3]:
            if len(l) < 35 and not any(x in l.lower() for x in ['@', 'http', 'github', 'linkedin', 'resume', 'cv']) and not re.search(r'\d', l):
                parsed_name = l
                break
    if not parsed_name:
        parsed_name = "Candidate"

    response_payload = {
        "success": True,
        "data": {
            "parsed_name": parsed_name,
            "parsed_email": parsed_email,
            "parsed_mobile": parsed_mobile,
            "act_name": act_name,
            "act_mail": act_mail,
            "act_mob": act_mob,
            "linkedin": parsed_linkedin,
            "github": parsed_github,
            "predicted_field": predicted_field,
            "domain_scores": domain_scores,
            "candidate_level": cand_level,
            "resume_score": resume_score,
            "health_breakdown": health_breakdown,
            "next_moves": next_moves,
            "best_matches": best_matches,
            "ai_insight": ai_insight,
            "ai_solutions": ai_solutions,
            "checks_result": checks_result,
            "detected_skills": detected_skills,
            "recommended_skills": [m["title"].replace("Add ", "").replace("Integrate ", "") for m in next_moves],
            "recommended_courses": recommended_courses,
            "recommended_videos": {
                "resume": res_vids,
                "interview": int_vids
            },
            "insights": insights,
            "no_of_pages": no_of_pages,
            "pdf_name": filename,
            "pdf_base64": pdf_base64,
            "resume_text": resume_text
        }
    }
    return response_payload

@app.post("/api/ml/ai-tips")
async def ai_tips_endpoint(payload: AITipsRequest):
    text = payload.resume_text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
        
    prompt = f"""You are an elite executive career coach and ATS optimization specialist.
Analyze the following resume text and provide 6 highly concrete, actionable bullet points grouped into exactly three categories:
1. Content Enhancements (2 bullet points)
2. Structure & Flow (2 bullet points)
3. Keyword & ATS Alignment (2 bullet points)

Format your response as valid JSON with keys "Content", "Structure", "Keywords", where each is a list of 2 strings.

Resume Text:
\"\"\"{text[:4000]}\"\"\""""

    try:
        raw_json = groq_call(prompt, system="You only output valid JSON. No conversational preamble.")
        match = re.search(r'\{.*\}', raw_json, re.DOTALL)
        if match:
            tips_dict = json.loads(match.group(0))
            return {"success": True, "categorized": tips_dict}
        else:
            return {"success": True, "categorized": {
                "Content": ["Quantify project impact with measurable percentage gains.", "Add specific tooling and cloud infrastructure used in each role."],
                "Structure": ["Place most recent experience in reverse chronological order.", "Ensure education and degree details are listed clearly."],
                "Keywords": ["Include industry-standard technical keywords in bullet points.", "Match skill terminology to target job requirements."]
            }}
    except Exception as e:
        print(f"Groq AI Tips notice: {e}")
        return {"success": True, "categorized": {
            "Content": ["Quantify achievements with business metrics, users impacted, or latency cuts.", "Highlight individual leadership and technical decision-making."],
            "Structure": ["Ensure standard single-column layout for automated parsers.", "Keep bullet points concise and action-verb driven."],
            "Keywords": ["Mirror exact keywords and cloud frameworks from target job listings.", "Group technical competencies cleanly under languages, frameworks, and databases."]
        }}

TECH_KEYWORDS_TAXONOMY = [
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "golang", "go", "rust", "ruby", "php",
    "swift", "kotlin", "r", "matlab", "scala", "dart", "sql", "html", "html5", "css", "css3", "sass", "bash", "shell",
    "machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "artificial intelligence",
    "data science", "data analysis", "data analytics", "data visualization", "eda", "exploratory data analysis",
    "feature engineering", "model evaluation", "a/b testing", "statistics", "statistical modeling", "probability",
    "predictive modeling", "time series", "time series forecasting", "regression", "classification", "clustering",
    "neural networks", "cnn", "rnn", "lstm", "transformers", "llms", "large language models", "prompt engineering", "rag",
    "scikit-learn", "sklearn", "pandas", "numpy", "scipy", "pytorch", "tensorflow", "keras", "opencv", "spacy", "nltk",
    "huggingface", "xgboost", "lightgbm", "random forest",
    "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "cassandra", "dynamodb", "oracle",
    "elasticsearch", "apache spark", "pyspark", "hadoop", "apache kafka", "kafka", "snowflake", "bigquery",
    "databricks", "etl", "data pipelines", "data warehousing", "dbt", "airflow", "apache airflow",
    "react", "react.js", "react native", "angular", "vue", "vue.js", "next.js", "nuxt", "node.js", "express", "express.js",
    "django", "flask", "fastapi", "spring", "spring boot", "asp.net", ".net", "ruby on rails", "graphql", "rest apis",
    "restful apis", "microservices", "websockets", "redux", "tailwind css", "bootstrap", "material ui",
    "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "ci/cd", "jenkins", "github actions", "gitlab ci", "terraform", "ansible", "linux", "git", "github", "gitlab",
    "prometheus", "grafana", "nginx", "serverless", "cloud computing",
    "tableau", "power bi", "excel", "advanced excel", "looker", "matplotlib", "seaborn", "plotly", "google data studio",
    "dash", "streamlit", "reporting", "dashboards", "business intelligence",
    "android studio", "jetpack compose", "swiftui", "uikit", "xcode", "flutter", "figma", "adobe xd", "ui/ux",
    "wireframing", "prototyping", "user research", "usability testing", "design systems",
    "data structures", "algorithms", "oop", "object-oriented programming", "system design", "distributed systems",
    "agile", "scrum", "jira", "unit testing", "tdd", "test driven development", "version control"
]

GENERIC_STOPWORDS = {
    "perform", "performing", "basic", "basics", "support", "supporting", "create", "creating", "driven", "member",
    "members", "understand", "understanding", "project", "projects", "goal", "goals", "contribute", "contributing",
    "idea", "ideas", "research", "researching", "simple", "present", "presenting", "findings", "finding",
    "identify", "identifying", "pattern", "patterns", "insight", "insights", "prepare", "preparing", "presentation",
    "presentations", "intern", "internship", "internships", "responsibility", "responsibilities", "requirement",
    "requirements", "candidate", "candidates", "position", "positions", "ability", "abilities", "strong", "excellent",
    "written", "verbal", "communication", "skills", "skill", "experience", "experiences", "year", "years", "degree",
    "plus", "must", "preferred", "preference", "knowledge", "working", "team", "teams", "environment", "work",
    "works", "help", "helping", "good", "including", "related", "equivalent", "opportunity", "qualified", "role",
    "roles", "looking", "seeking", "join", "joining", "deliver", "delivering", "assist", "assisting", "tasks", "task",
    "daily", "weekly", "monthly", "overall", "using", "uses", "used", "knowledge of", "proficiency in", "hands-on"
}

def extract_meaningful_keywords(text: str) -> List[str]:
    text_lower = text.lower()
    found_keywords = []

    sorted_tax = sorted(TECH_KEYWORDS_TAXONOMY, key=len, reverse=True)
    matched_tax_spans = []
    
    for kw in sorted_tax:
        pattern = r'\b' + re.escape(kw) + r'\b'
        for m in re.finditer(pattern, text_lower):
            span = m.span()
            if not any(s[0] <= span[0] and s[1] >= span[1] for s in matched_tax_spans):
                matched_tax_spans.append(span)
                acronyms = {"eda", "nlp", "sql", "aws", "gcp", "k8s", "ai", "ml", "cnn", "rnn", "lstm", "rag", "llms", "etl", "dbt", "ci/cd", "rest apis", "oop", "tdd", "ui/ux"}
                if kw in acronyms:
                    formatted_kw = kw.upper()
                else:
                    formatted_kw = kw.title()
                if formatted_kw not in found_keywords:
                    found_keywords.append(formatted_kw)

    capitalized_tokens = re.findall(r'\b[A-Z]{2,6}\b', text)
    for tok in capitalized_tokens:
        if tok.lower() not in GENERIC_STOPWORDS and tok.lower() not in [k.lower() for k in found_keywords]:
            if len(tok) >= 2 and tok not in {"THE", "AND", "FOR", "WITH", "THIS", "THAT", "HAVE", "WILL"}:
                found_keywords.append(tok)

    return found_keywords

@app.post("/api/ml/match-job")
async def match_job_endpoint(payload: MatchRequest):
    r_text = payload.resume_text
    j_text = payload.jd_text
    name = payload.name or "Candidate"

    if not r_text or not r_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    if not j_text or not j_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is required.")

    jd_skills = extract_meaningful_keywords(j_text)
    
    if len(jd_skills) < 5:
        tokens = re.findall(r'\b[a-zA-Z\+\#\.]{2,}\b', j_text)
        for t in tokens:
            t_clean = t.strip('.')
            if len(t_clean) >= 3 and t_clean.lower() not in GENERIC_STOPWORDS:
                if t_clean.title() not in jd_skills and t_clean.upper() not in jd_skills:
                    jd_skills.append(t_clean.title())
            if len(jd_skills) >= 20:
                break

    jd_skills = jd_skills[:25]
    r_text_lower = r_text.lower()
    
    matched = []
    missing = []
    
    for skill in jd_skills:
        skill_lower = skill.lower()
        if re.search(r'\b' + re.escape(skill_lower) + r'\b', r_text_lower) or skill_lower in r_text_lower:
            matched.append(skill)
        else:
            missing.append(skill)
            
    total_kws = len(jd_skills) if len(jd_skills) > 0 else 1
    raw_match_pct = (len(matched) / total_kws) * 100
    
    match_score = int(raw_match_pct)
    match_score = max(25, min(96, match_score))

    ats_score, ats_checks = calculate_ats_checklist(r_text)

    return {
        "success": True,
        "match_score": match_score,
        "ats_score": ats_score,
        "ats_checks": ats_checks,
        "matched_keywords": matched,
        "missing_keywords": missing
    }

@app.post("/api/ml/tailor-resume")
async def tailor_resume_endpoint(payload: TailorResumeRequest):
    missing_str = ", ".join(payload.missing_keywords[:10]) if payload.missing_keywords else "Relevant industry skills"
    
    prompt = f"""You are an elite executive resume writer and ATS optimization specialist.
Rewrite the candidate's resume to create an ultra-clean, high-impact, ATS-friendly resume specifically tailored for the target job description.

CRITICAL LENGTH & CONSTRAINTS:
1. TARGET LENGTH: Strict 1 to 1.5 pages (approx 350-450 words total). Keep each bullet point to 1-2 punchy lines.
2. Structure clearly with standard ATS headings:
   - CANDIDATE NAME & CONTACT (Email, Phone, LinkedIn, GitHub, Location)
   - PROFESSIONAL SUMMARY (3 concise lines highlighting core value proposition)
   - TECHNICAL SKILLS (Categorized cleanly: Languages, Frameworks/Tools, Databases/Cloud, Methodologies)
   - PROFESSIONAL EXPERIENCE (Reverse-chronological, each role having 2-3 bullet points written with the STAR format: Action Verb + Context + Quantified Metric/Result)
   - KEY PROJECTS (1-2 strong projects with tech stack and quantifiable impact)
   - EDUCATION & CERTIFICATIONS (Degree, Institution, Year)
3. Incorporate missing target keywords naturally: {missing_str} into bullet points and skills section.
4. Use powerful action verbs (Engineered, Spearheaded, Architected, Optimized, Implemented).
5. Output ONLY the plain text formatted resume. Do NOT output conversational text, explanations, or markdown code blocks (no ```).

Candidate Resume:
\"\"\"{payload.resume_text[:3500]}\"\"\"

Target Job Description:
\"\"\"{payload.jd_text[:2000]}\"\"\""""

    try:
        tailored = groq_call(prompt, system="You write clean, publication-ready resumes without markdown fences or filler.")
        return {"success": True, "tailored_resume": tailored}
    except Exception as e:
        print(f"Tailor resume notice: {e}")
        return {"success": True, "tailored_resume": payload.resume_text}

@app.post("/api/ml/generate-cover-letter")
async def cover_letter_endpoint(payload: CoverLetterRequest):
    prompt = f"""You are an executive career advisor.
Write an authentic, highly tailored, compelling 3-paragraph professional cover letter for {payload.name} applying for the position described in the job description.
Highlight relevant technical accomplishments and domain skills from the candidate's resume.

Candidate Name: {payload.name}

Candidate Resume:
\"\"\"{payload.resume_text[:2800]}\"\"\"

Target Job Description:
\"\"\"{payload.jd_text[:2000]}\"\"\"

Requirements:
- Professional greeting: Dear Hiring Team,
- Paragraph 1: Strong opening expressing enthusiasm for the specific role and company, and a concise thesis on why {payload.name} is an exceptional match.
- Paragraph 2: Highlight 2-3 specific technical achievements and projects from the resume directly addressing the key requirements in the job description.
- Paragraph 3: Reiterate cultural value, forward-looking impact, and call to interview.
- Professional sign-off: Sincerely,\n{payload.name}

Output ONLY the formatted cover letter text. No conversational preamble or code blocks."""

    try:
        letter = groq_call(prompt, system="You write exceptional, publication-ready cover letters.")
        return {"success": True, "cover_letter": letter}
    except Exception as e:
        print(f"Cover letter generation error: {e}")
        return {"success": True, "cover_letter": f"Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position. Having reviewed your job requirements, I am confident that my technical background and project experience make me an exceptional candidate for your team.\n\nThroughout my background, I have consistently built robust, high-impact solutions with measurable outcomes. My hands-on experience with modern tooling and analytical frameworks aligns directly with the goals of this position.\n\nThank you for your time and consideration. I welcome the opportunity to discuss how my skill set can deliver immediate value for your organization.\n\nSincerely,\n{payload.name}"}

@app.post("/api/ml/generate-pdf")
async def generate_pdf_endpoint(payload: GeneratePDFRequest):
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib import colors

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    story = []

    primary_color = colors.HexColor("#8E3B46") if payload.template == "modern_single" else colors.HexColor("#1A1212")
    font_name = "Helvetica" if payload.template == "modern_single" else "Times-Roman"
    font_bold = "Helvetica-Bold" if payload.template == "modern_single" else "Times-Bold"

    title_style = ParagraphStyle(
        'NameTitle',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=18,
        leading=22,
        textColor=primary_color
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName=font_bold,
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=8,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#2C2420")
    )

    cand_name = (payload.name or "Candidate Name").strip()
    story.append(Paragraph(cand_name, title_style))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    name_tokens = set(cand_name.lower().split())
    lines = payload.resume_text.split('\n')
    skipped_first_name = False

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        if not skipped_first_name:
            line_tokens = set(line_str.lower().split())
            if line_tokens and (line_tokens.issubset(name_tokens) or line_str.lower() == cand_name.lower()):
                skipped_first_name = True
                continue
            skipped_first_name = True
            
        is_heading = (line_str.isupper() and len(line_str) < 40) or line_str.startswith(('###', '##', 'PROFESSIONAL SUMMARY', 'TECHNICAL SKILLS', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'))
        
        if is_heading:
            clean_head = line_str.replace('#', '').strip()
            story.append(Paragraph(clean_head, heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2D8CE"), spaceAfter=4))
        else:
            story.append(Paragraph(line_str, body_style))
            story.append(Spacer(1, 2))

    doc.build(story)
    pdf_bytes = buf.getvalue()
    buf.close()

    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=tailored_resume.pdf"})
