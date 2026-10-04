import React, { useState, useMemo } from 'react';
import { matcherApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import SectionChecklist from '../components/SectionChecklist';
import { useAuth } from '../context/AuthContext';
import {
  Target, Upload, FileText, Sparkles, CheckCircle2, XCircle,
  Download, RotateCcw, AlertCircle, FileDown, Split, FileEdit,
  Mail, AlertTriangle, Layers, LayoutTemplate, Briefcase,
  ExternalLink, MapPin, Building2, Check, ArrowRight, DollarSign,
  Search, Filter
} from 'lucide-react';

// Comprehensive catalog of curated target job opportunities with direct application links
const CURATED_JOBS_CATALOG = {
  "Data Science & AI": [
    {
      role: "Machine Learning Engineer",
      company: "Microsoft",
      match: "96% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹24 - 40 LPA",
      job_type: "Full-time",
      tags: ["Python", "PyTorch", "Azure ML", "MLOps", "Transformers"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Machine+Learning+Engineer+Microsoft",
      description: "Design, build, and deploy production ML models at scale on Azure. Requires strong knowledge of Python, PyTorch/TensorFlow, deep learning architectures, and distributed training pipelines."
    },
    {
      role: "Senior Data Scientist",
      company: "Amazon AWS",
      match: "93% Match",
      location: "Hyderabad, India (Hybrid)",
      salary: "₹28 - 48 LPA",
      job_type: "Full-time",
      tags: ["Python", "Scikit-Learn", "AWS SageMaker", "SQL", "Statistics"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Amazon",
      description: "Lead predictive modeling, customer behavioral segmentation, and statistical experimentation across AWS cloud services using Python, SQL, and SageMaker."
    },
    {
      role: "AI / GenAI Research Engineer",
      company: "Google",
      match: "90% Match",
      location: "Bengaluru, India / Remote",
      salary: "₹32 - 55 LPA",
      job_type: "Full-time",
      tags: ["Deep Learning", "NLP", "LLMs", "RAG", "Vector DB"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=AI+Engineer+Google",
      description: "Develop and fine-tune large multimodal models, retrieval-augmented generation (RAG) frameworks, and agentic workflows using cutting-edge deep learning techniques."
    },
    {
      role: "Data Analyst / BI Specialist",
      company: "Deloitte",
      match: "87% Match",
      location: "Gurgaon, India (Hybrid)",
      salary: "₹14 - 22 LPA",
      job_type: "Full-time",
      tags: ["Tableau", "Power BI", "SQL", "Pandas", "EDA"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Deloitte",
      description: "Transform complex datasets into actionable executive dashboards and data stories. Develop automated ETL pipelines, SQL queries, and KPI reporting systems."
    },
    {
      role: "Computer Vision Engineer",
      company: "Flipkart",
      match: "85% Match",
      location: "Bengaluru, India (On-site)",
      salary: "₹20 - 35 LPA",
      job_type: "Full-time",
      tags: ["OpenCV", "PyTorch", "YOLO", "CNN", "Docker"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Computer+Vision+Engineer+Flipkart",
      description: "Architect visual search, automated catalog tagging, and defect detection algorithms using convolutional networks and real-time edge vision inference."
    },
    {
      role: "Applied Data Science Consultant",
      company: "McKinsey & Company",
      match: "82% Match",
      location: "Mumbai, India (Hybrid)",
      salary: "₹26 - 45 LPA",
      job_type: "Full-time",
      tags: ["Machine Learning", "Python", "Business Analytics", "Optimization"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+McKinsey",
      description: "Partner with global Fortune 500 executives to formulate AI-driven revenue strategies, pricing optimization engines, and supply chain predictive forecasting models."
    }
  ],
  "Full Stack Web Development": [
    {
      role: "Senior Full Stack Engineer",
      company: "Meta",
      match: "96% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹28 - 50 LPA",
      job_type: "Full-time",
      tags: ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer+Meta",
      description: "Build high-throughput web applications and scalable GraphQL services serving hundreds of millions of daily active users across Meta's family of apps."
    },
    {
      role: "Frontend Software Engineer",
      company: "Google",
      match: "94% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹26 - 45 LPA",
      job_type: "Full-time",
      tags: ["React", "Next.js", "TypeScript", "TailwindCSS", "Web Performance"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Frontend+Engineer+Google",
      description: "Architect accessible, ultra-responsive frontend web platforms with a focus on core web vitals, state management, and modern component systems."
    },
    {
      role: "Backend Engineer (Node/Python)",
      company: "Uber",
      match: "91% Match",
      location: "Hyderabad, India (Hybrid)",
      salary: "₹25 - 42 LPA",
      job_type: "Full-time",
      tags: ["Node.js", "Python", "Microservices", "Kafka", "Redis"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Backend+Engineer+Uber",
      description: "Develop low-latency distributed dispatch and pricing services handling millions of concurrent geospatial events and transactions."
    },
    {
      role: "Full Stack Developer",
      company: "Swiggy",
      match: "88% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹18 - 30 LPA",
      job_type: "Full-time",
      tags: ["React", "Node.js", "MongoDB", "Express", "Docker"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer+Swiggy",
      description: "Deliver customer-facing discovery, checkout, and merchant dashboard features using React, micro-frontends, and Node.js RESTful APIs."
    },
    {
      role: "Full Stack Platform Engineer",
      company: "Atlassian",
      match: "85% Match",
      location: "Bengaluru, India / Remote",
      salary: "₹24 - 40 LPA",
      job_type: "Full-time",
      tags: ["TypeScript", "React", "AWS", "Java", "REST APIs"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Atlassian",
      description: "Collaborate on Jira and Confluence cloud ecosystems, building extensible plugin architectures and real-time collaborative document editing interfaces."
    },
    {
      role: "UI Engineer / Frontend Specialist",
      company: "Razorpay",
      match: "83% Match",
      location: "Bengaluru, India (On-site)",
      salary: "₹16 - 28 LPA",
      job_type: "Full-time",
      tags: ["React", "JavaScript", "HTML5/CSS3", "Design Systems", "Jest"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Frontend+Developer+Razorpay",
      description: "Craft frictionless payment checkout SDKs, internal merchant analytics dashboards, and custom accessible UI design libraries."
    }
  ],
  "Software Engineering": [
    {
      role: "Software Development Engineer II",
      company: "Amazon",
      match: "95% Match",
      location: "Hyderabad / Bengaluru, India",
      salary: "₹28 - 46 LPA",
      job_type: "Full-time",
      tags: ["Java", "System Design", "Distributed Systems", "AWS", "OOP"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Development+Engineer+Amazon",
      description: "Architect fault-tolerant e-commerce tier-1 services with high availability, robust system design, and rigorous automated testing."
    },
    {
      role: "Member of Technical Staff",
      company: "Oracle",
      match: "92% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹22 - 36 LPA",
      job_type: "Full-time",
      tags: ["C++", "Algorithms", "Multithreading", "Linux", "Databases"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Developer+Oracle",
      description: "Design core relational database engine optimizations, memory allocators, and high-performance multithreaded cloud database kernels."
    },
    {
      role: "Backend Software Engineer",
      company: "Stripe",
      match: "89% Match",
      location: "Bengaluru, India / Remote",
      salary: "₹30 - 52 LPA",
      job_type: "Full-time",
      tags: ["Go", "Ruby", "PostgreSQL", "APIs", "Distributed Caching"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Stripe",
      description: "Build resilient global payments infrastructure and idempotent billing APIs capable of moving billions of dollars with five-nines reliability."
    },
    {
      role: "Systems Software Engineer",
      company: "Adobe",
      match: "86% Match",
      location: "Noida / Bengaluru, India",
      salary: "₹20 - 34 LPA",
      job_type: "Full-time",
      tags: ["C++", "Java", "Data Structures", "Algorithms", "Cloud APIs"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Adobe",
      description: "Implement high-performance graphics algorithms, document rendering engines, and real-time cloud collaboration services for Creative Cloud."
    },
    {
      role: "Software Engineer (Fintech)",
      company: "CRED",
      match: "84% Match",
      location: "Bengaluru, India (On-site)",
      salary: "₹25 - 42 LPA",
      job_type: "Full-time",
      tags: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Redis"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+CRED",
      description: "Design highly concurrent financial transaction engines, rewards ledgers, and credit risk evaluation microservices."
    },
    {
      role: "Core Platform Engineer",
      company: "Goldman Sachs",
      match: "82% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹24 - 38 LPA",
      job_type: "Full-time",
      tags: ["Java", "Python", "Distributed Systems", "SQL", "Unix"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Goldman+Sachs",
      description: "Develop algorithmic trading risk calculation pipelines and low-latency order routing systems for global financial markets."
    }
  ],
  "Cloud & DevOps Engineering": [
    {
      role: "DevOps / Site Reliability Engineer",
      company: "Netflix",
      match: "95% Match",
      location: "Mumbai / Remote, India",
      salary: "₹32 - 55 LPA",
      job_type: "Full-time",
      tags: ["Kubernetes", "AWS", "Terraform", "Linux", "Chaos Engineering"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer+Netflix",
      description: "Automate resilient multi-region infrastructure, automated rollbacks, and zero-downtime deployment pipelines for global streaming services."
    },
    {
      role: "Cloud Solutions Architect",
      company: "Amazon AWS",
      match: "92% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹28 - 48 LPA",
      job_type: "Full-time",
      tags: ["AWS", "Docker", "Terraform", "CI/CD", "Security"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Cloud+Architect+AWS",
      description: "Design secure enterprise cloud migrations, containerized microservices architectures, and automated infrastructure as code."
    },
    {
      role: "Site Reliability Engineer (SRE)",
      company: "LinkedIn",
      match: "89% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹24 - 40 LPA",
      job_type: "Full-time",
      tags: ["Kubernetes", "Python", "Prometheus", "Grafana", "Linux"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=SRE+LinkedIn",
      description: "Manage telemetry, latency SLOs, automated incident remediation, and distributed system stability for over 1 billion professional members."
    },
    {
      role: "DevOps Engineer",
      company: "Zomato",
      match: "87% Match",
      location: "Gurgaon, India (Hybrid)",
      salary: "₹18 - 30 LPA",
      job_type: "Full-time",
      tags: ["Docker", "Kubernetes", "CI/CD", "Jenkins", "AWS"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=DevOps+Engineer+Zomato",
      description: "Maintain automated container build pipelines, blue-green deployments, and auto-scaling clusters for peak flash-sale demand."
    },
    {
      role: "Cloud Security Engineer",
      company: "Cisco",
      match: "84% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹20 - 35 LPA",
      job_type: "Full-time",
      tags: ["Azure", "AWS", "IAM", "Compliance", "Terraform"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Cloud+Security+Cisco",
      description: "Enforce zero-trust cloud network security, automated vulnerability remediation, and IAM compliance policies across hybrid cloud environments."
    },
    {
      role: "Infrastructure Automation Engineer",
      company: "Salesforce",
      match: "82% Match",
      location: "Hyderabad, India (Hybrid)",
      salary: "₹22 - 36 LPA",
      job_type: "Full-time",
      tags: ["Ansible", "Terraform", "Python", "GCP", "Kubernetes"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Infrastructure+Engineer+Salesforce",
      description: "Automate declarative configuration management, multi-tenant database provisioning, and continuous deployment workflows."
    }
  ],
  "UI/UX Design & Research": [
    {
      role: "Senior Product Designer",
      company: "Airbnb",
      match: "96% Match",
      location: "Gurgaon / Remote, India",
      salary: "₹24 - 42 LPA",
      job_type: "Full-time",
      tags: ["Figma", "Design Systems", "Prototyping", "User Research"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Airbnb",
      description: "Shape next-generation host and guest travel discovery workflows through elegant interactions, comprehensive design systems, and rapid prototyping."
    },
    {
      role: "UI/UX Specialist",
      company: "Adobe",
      match: "92% Match",
      location: "Noida, India (Hybrid)",
      salary: "₹20 - 34 LPA",
      job_type: "Full-time",
      tags: ["Adobe XD", "Figma", "Wireframing", "Interaction Design", "Usability"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=UX+Designer+Adobe",
      description: "Design intuitive creative tools, accessible interface component libraries, and end-to-end user journeys for cloud-based authoring apps."
    },
    {
      role: "UX Researcher",
      company: "Spotify",
      match: "89% Match",
      location: "Mumbai / Remote, India",
      salary: "₹22 - 38 LPA",
      job_type: "Full-time",
      tags: ["User Interviews", "Usability Testing", "Personas", "Analytics"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=UX+Researcher+Spotify",
      description: "Conduct qualitative interviews, usability benchmarking, and quantitative surveys to guide personalized audio recommendation interfaces."
    },
    {
      role: "Lead Interaction Designer",
      company: "Flipkart",
      match: "86% Match",
      location: "Bengaluru, India (On-site)",
      salary: "₹18 - 32 LPA",
      job_type: "Full-time",
      tags: ["Micro-interactions", "Figma", "Design Tokens", "Mobile UX"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=UI+UX+Designer+Flipkart",
      description: "Craft delightful mobile e-commerce checkout funnels, micro-animations, and regional localization design patterns."
    },
    {
      role: "Product Experience Designer",
      company: "Razorpay",
      match: "84% Match",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹16 - 28 LPA",
      job_type: "Full-time",
      tags: ["Fintech UX", "Wireframing", "Figma", "Information Architecture"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Product+Designer+Razorpay",
      description: "Simplify B2B financial onboarding, payment gateway verification, and corporate treasury management workflows."
    },
    {
      role: "Design Systems Engineer / Designer",
      company: "Postman",
      match: "81% Match",
      location: "Bengaluru, India / Remote",
      salary: "₹20 - 35 LPA",
      job_type: "Full-time",
      tags: ["Design Tokens", "Figma", "Storybook", "Accessibility (WCAG)"],
      apply_url: "https://www.linkedin.com/jobs/search/?keywords=Design+Systems+Postman",
      description: "Maintain multi-platform design tokens, accessible React component libraries, and unified UI guidelines for developer productivity tools."
    }
  ]
};

export default function Matcher({ setActivePage }) {
  const { user, latestAnalysis } = useAuth();
  const [candidateName, setCandidateName] = useState(latestAnalysis?.parsed_name || user?.name || '');
  const [resumeText, setResumeText] = useState(latestAnalysis?.resume_text || '');
  const [jdText, setJdText] = useState('');
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);

  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [activeTab, setActiveTab] = useState('score');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedJobBadge, setSelectedJobBadge] = useState(null);

  // Tailored contents
  const [tailoredResume, setTailoredResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern_single');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Domain filter for job cards
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('auto');

  // Detect domain from resume text or latestAnalysis
  const detectedDomain = useMemo(() => {
    if (latestAnalysis?.predicted_field && CURATED_JOBS_CATALOG[latestAnalysis.predicted_field]) {
      return latestAnalysis.predicted_field;
    }
    const txt = (resumeText || '').toLowerCase();
    if (txt.includes('machine learning') || txt.includes('deep learning') || txt.includes('tensorflow') || txt.includes('pytorch') || txt.includes('pandas') || txt.includes('data science') || txt.includes('nlp')) {
      return 'Data Science & AI';
    }
    if (txt.includes('react') || txt.includes('frontend') || txt.includes('full stack') || txt.includes('node.js') || txt.includes('javascript') || txt.includes('express')) {
      return 'Full Stack Web Development';
    }
    if (txt.includes('kubernetes') || txt.includes('docker') || txt.includes('terraform') || txt.includes('aws') || txt.includes('devops') || txt.includes('ci/cd')) {
      return 'Cloud & DevOps Engineering';
    }
    if (txt.includes('figma') || txt.includes('ui/ux') || txt.includes('wireframing') || txt.includes('user research') || txt.includes('prototyping')) {
      return 'UI/UX Design & Research';
    }
    return 'Software Engineering';
  }, [latestAnalysis, resumeText]);

  // Active domain to display
  const activeDomain = selectedDomainFilter === 'auto' ? detectedDomain : selectedDomainFilter;

  // Retrieve top 5-6 target jobs
  const targetJobs = useMemo(() => {
    // If auto mode and latestAnalysis has 6 rich jobs with apply_url, prioritize it
    if (selectedDomainFilter === 'auto' && latestAnalysis?.best_matches?.length >= 5 && latestAnalysis.best_matches[0].apply_url) {
      return latestAnalysis.best_matches.slice(0, 6);
    }
    const catalog = CURATED_JOBS_CATALOG[activeDomain] || CURATED_JOBS_CATALOG['Data Science & AI'];
    return catalog.slice(0, 6);
  }, [selectedDomainFilter, latestAnalysis, activeDomain]);

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedResumeFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') setResumeText(content);
    };
    reader.readAsText(file);
  };

  // Populate Job Description when user clicks "Use as Target JD"
  const handleSelectJobForMatch = (job) => {
    const formattedJd = `ROLE: ${job.role}
COMPANY: ${job.company}
LOCATION: ${job.location || 'Remote / Hybrid'}
EMPLOYMENT TYPE: ${job.job_type || 'Full-time'}
TARGET COMPENSATION: ${job.salary || 'Competitive Industry Standard'}

ROLE SUMMARY:
${job.description}

CORE TECHNICAL REQUIREMENTS:
• Strong hands-on proficiency in: ${job.tags.join(', ')}.
• Proven track record architecting, building, and delivering scalable production systems.
• Solid background in automated unit testing, CI/CD deployment pipelines, and performance tuning.
• Experience collaborating with cross-functional engineering, product, and design teams.

KEY RESPONSIBILITIES:
• Lead end-to-end design and implementation of resilient, high-availability services.
• Solve complex technical challenges with clean, maintainable, and well-documented code.
• Optimize application latency, throughput, and system resource efficiency.
• Mentor junior engineers and participate actively in architecture and code reviews.`;

    setJdText(formattedJd);
    setSelectedJobBadge(`${job.role} at ${job.company}`);

    // Smooth scroll down to the inputs form
    const formElement = document.getElementById('matcher-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const runJobMatch = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) {
      setErrorMessage('Please provide both your Resume text and the Job Description.');
      return;
    }
    setErrorMessage('');
    setIsMatching(true);
    try {
      const res = await matcherApi.match({
        resume_text: resumeText,
        jd_text: jdText,
        name: candidateName || 'Candidate',
      });
      if (res.data.success) {
        setMatchResult(res.data);
        setIsTailoring(true);
        try {
          const [tailorRes, coverRes] = await Promise.all([
            matcherApi.tailor({ resume_text: resumeText, jd_text: jdText, name: candidateName || 'Candidate', missing_keywords: res.data.missing_keywords || [] }),
            matcherApi.coverLetter({ resume_text: resumeText, jd_text: jdText, name: candidateName || 'Candidate' }),
          ]);
          if (tailorRes.data.success) setTailoredResume(tailorRes.data.tailored_resume);
          if (coverRes.data.success) setCoverLetter(coverRes.data.cover_letter);
        } catch (genErr) {
          console.error('Tailor generation notice:', genErr);
        } finally {
          setIsTailoring(false);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error occurred during job matching.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!tailoredResume) return;
    setIsDownloadingPdf(true);
    try {
      const res = await matcherApi.exportPdf({ resume_text: tailoredResume, template: selectedTemplate, name: candidateName || 'Candidate Name' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored_resume_${selectedTemplate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please check server logs.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const resetMatcher = () => {
    setMatchResult(null);
    setTailoredResume('');
    setCoverLetter('');
    setActiveTab('score');
    setSelectedJobBadge(null);
  };

  // Reusable Target Jobs Grid component
  const renderTargetJobsGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
      {targetJobs.map((job, idx) => {
        const isSelected = selectedJobBadge && selectedJobBadge.includes(job.company) && selectedJobBadge.includes(job.role);
        return (
          <div
            key={idx}
            style={{
              background: isSelected ? 'rgba(142, 59, 70, 0.04)' : 'var(--bg-card)',
              border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {/* Header: Company Avatar + Role + Match Pill */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}
                  >
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.25', margin: 0 }}>
                      {job.role}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600', marginTop: '2px' }}>
                      {job.company}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#2D6A4F',
                    background: 'rgba(45, 106, 79, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '99px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={11} />
                  {job.match}
                </span>
              </div>

              {/* Badges row: Location, Salary, Employment type */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {job.location && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--primary)" />
                    {job.location}
                  </span>
                )}
                {job.salary && (
                  <span style={{ fontSize: '0.72rem', color: '#8E3B46', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <DollarSign size={12} />
                    {job.salary}
                  </span>
                )}
                {job.job_type && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--bg-card-2)', padding: '1px 6px', borderRadius: '4px' }}>
                    {job.job_type}
                  </span>
                )}
              </div>

              {/* Description snippet */}
              <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: '1.5', marginBottom: '14px', minHeight: '38px' }}>
                {job.description}
              </p>

              {/* Tag Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                {job.tags?.map((t, tidx) => (
                  <span
                    key={tidx}
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      background: 'var(--bg-card-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                      fontWeight: '500'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <a
                href={job.apply_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>Apply Now</span>
                <ExternalLink size={12} />
              </a>

              <button
                type="button"
                onClick={() => handleSelectJobForMatch(job)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  background: isSelected ? 'var(--primary-soft)' : 'var(--bg-card-2)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-body)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Populate the target job description box below with this role"
              >
                <Target size={12} />
                <span>{isSelected ? 'Loaded' : 'Match ATS'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">Targeted Optimization</span>
        <h1 className="page-title">Job Matcher &amp; Target Roles</h1>
        <p className="page-subtitle">
          Explore curated high-match job openings based on your resume, apply with direct links, and run deep ATS keyword gap comparisons to generate STAR-tailored applications.
        </p>
      </div>

      {errorMessage && (
        <div style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.25)', borderRadius: '8px', padding: '12px 16px', color: '#C0392B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION: TARGET JOB MATCHES (Recommended for You)
          Only shown after a resume has been analyzed
          ───────────────────────────────────────────────────────────── */}
      {latestAnalysis ? (
        <div className="card" style={{ marginBottom: '28px', padding: '24px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Top Recommendations
                </span>
                <span style={{ fontSize: '0.75rem', color: '#2D6A4F', fontWeight: '700' }}>
                  • {latestAnalysis.best_matches?.length || 6} Roles Matched to Your Resume
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0 2px 0' }}>
                Target Job Matches
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Based on your detected domain <b>({detectedDomain})</b> and verified technical skills. Click <b>Apply Now</b> to open the live job application, or click <b>Match ATS</b> to test compatibility.
              </p>
            </div>

            {/* Domain Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'auto', label: '⭐ Recommended' },
                { id: 'Data Science & AI', label: 'Data & AI' },
                { id: 'Full Stack Web Development', label: 'Full Stack' },
                { id: 'Software Engineering', label: 'Software Eng' },
                { id: 'Cloud & DevOps Engineering', label: 'DevOps & Cloud' },
                { id: 'UI/UX Design & Research', label: 'UI/UX Design' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedDomainFilter(pill.id)}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: selectedDomainFilter === pill.id ? '700' : '500',
                    padding: '5px 12px',
                    borderRadius: '99px',
                    border: `1px solid ${selectedDomainFilter === pill.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedDomainFilter === pill.id ? 'var(--primary)' : 'var(--bg-card-2)',
                    color: selectedDomainFilter === pill.id ? '#FFFFFF' : 'var(--text-body)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Target Job Cards Grid */}
          {renderTargetJobsGrid()}
        </div>
      ) : (
        /* Empty state — no resume analyzed yet */
        <div className="card" style={{ marginBottom: '28px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--primary-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#8E3B46', margin: '0 auto 16px auto'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            Upload Your Resume to See Job Matches
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
            Job recommendations are dynamically generated based on the skills and domain detected from your resume. Analyze your resume first to unlock personalized matches.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            onClick={() => setActivePage && setActivePage('analyzer')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Go to Resume Analyzer
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION: MATCHER INPUT FORM & COMPARISON
          ───────────────────────────────────────────────────────────── */}
      {!matchResult ? (
        <div id="matcher-form-section" className="card" style={{ padding: '24px 22px' }}>
          <div style={{ marginBottom: '18px' }}>
            <span className="sec-label" style={{ margin: 0 }}>Step 2: Semantic ATS Compatibility Test</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              Compare Resume Against Target Job Description
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evaluate keyword overlap, identify critical missing requirements, and generate an ATS-optimized STAR resume and cover letter.
            </p>
          </div>

          {selectedJobBadge && (
            <div style={{
              background: 'rgba(45, 106, 79, 0.08)',
              border: '1px solid rgba(45, 106, 79, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#2D6A4F',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>Loaded Target Job Description for: <b>{selectedJobBadge}</b></span>
              </div>
              <button
                type="button"
                onClick={() => { setJdText(''); setSelectedJobBadge(null); }}
                style={{ background: 'none', border: 'none', color: '#2D6A4F', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                Clear
              </button>
            </div>
          )}

          <form onSubmit={runJobMatch}>
            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '20px' }}>
              <label className="form-label">Candidate Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Priya Sharma"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div className="sec-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span>1. Master Resume Content *</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {latestAnalysis?.resume_text && resumeText && (
                      <span style={{ fontSize: '0.72rem', color: '#2D6A4F', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} /> Auto-filled
                      </span>
                    )}
                    {resumeText && (
                      <button
                        type="button"
                        onClick={() => setResumeText('')}
                        style={{
                          background: 'var(--bg-card-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#C0392B';
                          e.currentTarget.style.borderColor = '#C0392B';
                          e.currentTarget.style.background = 'rgba(192, 57, 43, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'var(--bg-card-2)';
                        }}
                        title="Clear resume text"
                      >
                        <XCircle size={12} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  className="form-textarea"
                  style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder="Paste your full resume text here (Summary, Skills, Experience, Education, Projects)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <div>
                <div className="sec-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span>2. Target Job Description *</span>
                  {jdText && (
                    <button
                      type="button"
                      onClick={() => {
                        setJdText('');
                        setSelectedJobBadge(null);
                      }}
                      style={{
                        background: 'var(--bg-card-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#C0392B';
                        e.currentTarget.style.borderColor = '#C0392B';
                        e.currentTarget.style.background = 'rgba(192, 57, 43, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg-card-2)';
                      }}
                      title="Clear target job description"
                    >
                      <XCircle size={12} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
                <textarea
                  className="form-textarea"
                  style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder="Paste target job responsibilities, skills, and qualifications, or click 'Match ATS' on any job card above..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '24px', padding: '12px' }}
              disabled={isMatching || !resumeText.trim() || !jdText.trim()}
            >
              <Target size={16} />
              <span>{isMatching ? 'Running Semantic Match...' : 'Compare & Tailor Resume'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Results View */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {candidateName || 'Candidate Match Assessment'}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Job Description Match &amp; Application Optimization
              </div>
            </div>
            <button className="btn-secondary" onClick={resetMatcher}>
              <RotateCcw size={15} />
              <span>New Job Match</span>
            </button>
          </div>

          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#8E3B46' }}>{matchResult.match_score}%</div>
              <div className="kpi-label">Job Description Match Score</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#2D6A4F' }}>{matchResult.matched_keywords?.length || 0}</div>
              <div className="kpi-label">Target Keywords Matched</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#C0392B' }}>{matchResult.missing_keywords?.length || 0}</div>
              <div className="kpi-label">Missing Keywords to Add</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-header">
            {[
              { id: 'score', label: 'ATS & Match Score', icon: <CheckCircle2 size={14} /> },
              { id: 'keywords', label: 'Keyword Gap Analysis', icon: <Split size={14} /> },
              { id: 'tailor', label: 'Tailored Resume Text', icon: <FileEdit size={14} /> },
              { id: 'letter', label: 'Tailored Cover Letter', icon: <Mail size={14} /> },
              { id: 'export', label: 'Export PDF', icon: <Download size={14} /> },
            ].map((tab) => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: ATS Score */}
          {activeTab === 'score' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="sec-label" style={{ marginBottom: '16px' }}>ATS Match Rating</div>
                <ScoreGauge score={matchResult.match_score} size={200} label="Job Match Score" />
              </div>
              <div className="card">
                <SectionChecklist
                  resumeText={resumeText}
                  checksResult={matchResult.ats_checks}
                  initialPersonalInfo={{ parsed_name: candidateName, resume_text: resumeText }}
                  title="Section Checklist"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Keyword Diff */}
          {activeTab === 'keywords' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#2D6A4F" />
                  <span>Matched Keywords ({matchResult.matched_keywords?.length || 0})</span>
                </div>
                {matchResult.matched_keywords?.length > 0 ? (
                  <div className="chip-wrap">
                    {matchResult.matched_keywords.map((k, idx) => <span key={idx} className="chip-g">{k}</span>)}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No matching keywords detected.</div>
                )}
              </div>
              <div className="card">
                <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color="#A07840" />
                  <span>Missing Keywords ({matchResult.missing_keywords?.length || 0})</span>
                </div>
                {matchResult.missing_keywords?.length > 0 ? (
                  <div className="chip-wrap">
                    {matchResult.missing_keywords.map((k, idx) => <span key={idx} className="chip-p">{k}</span>)}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#2D6A4F', fontWeight: '600' }}>Outstanding! All target keywords matched.</div>
                )}
              </div>
            </div>
          )}


          {/* Tab 4: Tailored Resume Text */}
          {activeTab === 'tailor' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="sec-label" style={{ margin: 0 }}>STAR-Method Tailored Resume (Editable)</div>
                {isTailoring && <span style={{ fontSize: '0.78rem', color: '#8E3B46' }}>Generating tailored resume...</span>}
              </div>
              <textarea
                className="form-textarea"
                style={{ height: '450px', fontFamily: 'monospace', fontSize: '0.84rem', lineHeight: '1.6' }}
                value={tailoredResume}
                onChange={(e) => setTailoredResume(e.target.value)}
                placeholder="AI-generated tailored resume text will appear here..."
              />
            </div>
          )}

          {/* Tab 5: Cover Letter */}
          {activeTab === 'letter' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="sec-label" style={{ margin: 0 }}>Tailored Cover Letter (Editable)</div>
                <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleDownloadCoverLetter}>
                  <Download size={13} /><span>Download .txt</span>
                </button>
              </div>
              <textarea
                className="form-textarea"
                style={{ height: '380px', fontSize: '0.88rem', lineHeight: '1.7' }}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="AI-generated cover letter will appear here..."
              />
            </div>
          )}

          {/* Tab 6: Export PDF */}
          {activeTab === 'export' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label">Select Layout Design Template</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: selectedTemplate === 'modern_single' ? 'var(--primary-soft)' : 'var(--bg-card-2)', border: `1px solid ${selectedTemplate === 'modern_single' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tpl" value="modern_single" checked={selectedTemplate === 'modern_single'} onChange={() => setSelectedTemplate('modern_single')} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Modern Single Column</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean Helvetica sans-serif with subtle typography for Tech &amp; Startups.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: selectedTemplate === 'classic_single' ? 'rgba(160, 120, 64, 0.08)' : 'var(--bg-card-2)', border: `1px solid ${selectedTemplate === 'classic_single' ? 'var(--accent-gold)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tpl" value="classic_single" checked={selectedTemplate === 'classic_single'} onChange={() => setSelectedTemplate('classic_single')} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Classic Single Column</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Traditional Times-Roman serif typography for Finance, Consulting, and Corporate.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
                <FileDown size={44} color="#8E3B46" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Generate ReportLab PDF</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '320px', marginBottom: '24px' }}>
                  Compiles the tailored resume text into a publication-quality ATS-compatible PDF file.
                </p>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.92rem' }} onClick={handleDownloadPdf} disabled={isDownloadingPdf || !tailoredResume}>
                  <Download size={15} />
                  <span>{isDownloadingPdf ? 'Compiling PDF...' : 'Download Tailored PDF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
