/**
 * sectionExtractor.js
 * Intelligent real-time resume section segmentation, contact info extraction,
 * text formatting, and itemized project/certificate/experience card parsing utility.
 */

export const SECTION_CONFIGS = [
  {
    id: 'summary',
    label: 'Summary & Objective',
    points: 10,
    headers: [
      'professional summary', 'executive summary', 'career summary', 'summary of qualifications',
      'summary', 'career objective', 'objective', 'about me', 'profile', 'personal profile', 'statement'
    ],
    proTip: 'A 3-4 line targeted executive summary highlighting your primary domain, years of experience, and core stack improves ATS keyword density.',
    templateExample: 'PROFESSIONAL SUMMARY\nResults-driven Software Engineer with 3+ years of experience building scalable full-stack web applications and microservices. Proficient in React, Node.js, Python, and AWS. Proven track record of improving system uptime by 35% and optimizing database query latency.'
  },
  {
    id: 'education',
    label: 'Education Details',
    points: 15,
    headers: [
      'education details', 'educational background', 'academic background', 'education & qualifications',
      'education', 'academics', 'academic qualifications', 'degrees', 'qualifications'
    ],
    proTip: 'List your degree, university/institute, graduation year, and key coursework or honors (e.g. Dean\'s List, GPA >= 3.5).',
    templateExample: 'EDUCATION\nBachelor of Technology (B.Tech) in Computer Science & Engineering\nABC Institute of Technology | 2020 – 2024\n• GPA: 8.9 / 10.0 | Relevant Coursework: Data Structures, Distributed Systems, Database Management'
  },
  {
    id: 'experience',
    label: 'Work Experience & Internships',
    points: 25,
    headers: [
      'work experience & internships', 'work experience', 'professional experience', 'employment history',
      'internships & training', 'internship experience', 'internships', 'internship', 'experience',
      'work history', 'career history', 'relevant experience', 'employment', 'apprenticeship', 'industrial training'
    ],
    proTip: 'Use the STAR format (Situation, Task, Action, Result) with strong action verbs (Engineered, Spearheaded, Optimized) and quantified metrics (%, $, scale).',
    templateExample: 'WORK EXPERIENCE & INTERNSHIPS\nSoftware Engineer | Acme Technologies (June 2022 – Present)\n• Architected and deployed microservices handling 2M+ daily requests, improving system availability to 99.98%.\n• Optimized PostgreSQL queries and Redis caching, reducing average response latency by 42%.\n• Spearheaded the migration from monolithic architecture to Docker & Kubernetes on AWS.'
  },
  {
    id: 'skills',
    label: 'Skills Section',
    points: 20,
    headers: [
      'technical skills', 'skills & competencies', 'core competencies', 'skills & abilities',
      'skills', 'technologies', 'skill set', 'tools & technologies', 'key skills', 'areas of expertise'
    ],
    proTip: 'Organize skills into distinct categories: Programming Languages, Frameworks & Libraries, Cloud & Databases, and Developer Tools.',
    templateExample: 'TECHNICAL SKILLS\n• Languages: Python, JavaScript, TypeScript, SQL, C++\n• Frameworks & Libraries: React, Node.js, Express, FastAPI, Django, Redux\n• Cloud & Databases: AWS (S3, EC2, Lambda), PostgreSQL, MongoDB, Redis, Docker\n• Developer Tools: Git, GitHub Actions, Linux, Postman, Jest, Figma'
  },
  {
    id: 'achievements',
    label: 'Achievements & Awards',
    points: 10,
    headers: [
      'achievements & awards', 'honors & awards', 'key achievements', 'achievements',
      'awards', 'honors', 'accomplishments', 'recognitions', 'awards & recognitions'
    ],
    proTip: 'Include competitive rankings, hackathon wins, published papers, or employee excellence recognitions.',
    templateExample: 'ACHIEVEMENTS & AWARDS\n• Winner – National Smart India Hackathon (Rank 1 / 1,200+ teams nationwide).\n• Dean\'s Merit Scholarship for academic excellence across consecutive semesters.\n• Solved 600+ problems on LeetCode with a contest rating in the top 5% globally.'
  },
  {
    id: 'certifications',
    label: 'Certifications & Credentials',
    points: 10,
    headers: [
      'certifications & credentials', 'licenses & certifications', 'professional certifications',
      'certifications', 'certification', 'certificates', 'credentials', 'courses & certifications'
    ],
    proTip: 'Add verified certifications with issuing authorities (AWS, Google Cloud, Meta, Coursera) and credential IDs/links.',
    templateExample: 'CERTIFICATIONS & CREDENTIALS\n• AWS Certified Solutions Architect – Associate (Amazon Web Services, 2023)\n• Meta Front-End Developer Professional Certificate (Coursera, 2023)\n• Python for Data Science and Machine Learning (Udemy, 2022)'
  },
  {
    id: 'projects',
    label: 'Projects & Initiatives',
    points: 10,
    headers: [
      'projects & initiatives', 'key projects', 'personal projects', 'academic projects',
      'selected projects', 'projects', 'project work', 'initiatives', 'notable projects'
    ],
    proTip: 'Provide project title, tech stack used, problem solved, quantified result, and live GitHub demo URL.',
    templateExample: 'PROJECTS & INITIATIVES\nAI Resume Analyzer & Job Matcher | React, Node.js, FastAPI, NLP, Groq LLM\n• Built an end-to-end ATS resume parser evaluating skill gaps and generating tailored resumes in real time.\n• Integrated Groq LLM API for STAR-format cover letters and instant section-level coaching tips.'
  }
];

const KNOWN_TECH_KEYWORDS = new Set([
  'fastapi', 'react', 'react.js', 'python', 'node', 'nodejs', 'sql', 'sqlite', 'mongodb', 'docker', 'aws',
  'javascript', 'typescript', 'c++', 'java', 'html', 'css', 'git', 'github', 'express', 'flask',
  'django', 'pytorch', 'tensorflow', 'keras', 'pandas', 'numpy', 'scipy', 'sqlalchemy', 'power bi', 'tableau',
  'graphql', 'redis', 'kubernetes', 'linux', 'azure', 'gcp', 'streamlit', 'postman', 'jest', 'grad-cam',
  'github actions', 'langsmith', 'promptfoo', 'openai', 'gemini', 'anthropic', 'cnn', 'rag', 'llm'
]);

/**
 * Intelligent text cleaner that repairs PDF extraction line-wrap splits,
 * de-hyphenates words across lines, and merges broken bullet items cleanly.
 */
export function cleanAndFormatText(raw = '') {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.replace(/\r\n/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Fix hyphenated word breaks across lines
  text = text.replace(/([a-zA-Z0-9]+)-\s*\n+\s*([a-zA-Z0-9]+)/g, '$1-$2');

  const rawLines = text.split('\n');
  const processedLines = [];
  let currentBuffer = '';

  const bulletPattern = /^[\s]*([•\-\*▪▫–—]|[0-9]{1,2}[.)]|[a-zA-Z][.)])\s+/;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    const isNewBullet = bulletPattern.test(line);
    const isHeadingLike = (line.toUpperCase() === line && line.length < 50 && line.length > 2) || line.startsWith('#') || (line.endsWith(':') && line.length < 40);

    if (isNewBullet || isHeadingLike) {
      if (currentBuffer) {
        processedLines.push(currentBuffer.trim());
      }
      currentBuffer = line;
    } else if (currentBuffer) {
      const endsWithTerminal = /[.:;!?]$/.test(currentBuffer);
      const startsWithLower = /^[a-z]/.test(line);

      if (endsWithTerminal && !startsWithLower && !bulletPattern.test(currentBuffer)) {
        processedLines.push(currentBuffer.trim());
        currentBuffer = line;
      } else {
        currentBuffer += ' ' + line;
      }
    } else {
      currentBuffer = line;
    }
  }

  if (currentBuffer) {
    processedLines.push(currentBuffer.trim());
  }

  return processedLines.join('\n\n');
}

/**
 * Extracts tech stack keywords from a text block.
 */
export function extractStackFromText(text = '') {
  const words = text.toLowerCase().split(/[\s,;|/•()—–]+/);
  const found = new Set();
  words.forEach(w => {
    const clean = w.trim().replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/g, '');
    if (KNOWN_TECH_KEYWORDS.has(clean)) {
      found.add(clean === 'c++' ? 'C++' : clean === 'react.js' ? 'React.js' : clean.charAt(0).toUpperCase() + clean.slice(1));
    }
  });
  return Array.from(found).slice(0, 8);
}

/**
 * Extracts distinct URL links (GitHub, Live Demo, Docs) from text.
 */
export function extractLinksFromText(text = '') {
  const links = [];
  const foundUrls = new Set();

  // 1. GitHub links
  const ghMatches = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_\-\/]+/gi) || [];
  ghMatches.forEach(url => {
    const full = url.startsWith('http') ? url : `https://${url}`;
    if (!foundUrls.has(full)) {
      foundUrls.add(full);
      links.push({ label: 'GitHub Repo', url: full, type: 'github' });
    }
  });

  // 2. Vercel / Netlify / Live Demos
  const demoMatches = text.match(/(?:https?:\/\/)?([a-zA-Z0-9_\-]+\.(?:vercel\.app|netlify\.app|github\.io|streamlit\.app|dev|me))(?:\/[^\s|•]*)?/gi) || [];
  demoMatches.forEach(url => {
    const full = url.startsWith('http') ? url : `https://${url}`;
    if (!foundUrls.has(full) && !url.includes('github.com')) {
      foundUrls.add(full);
      links.push({ label: 'Live Demo', url: full, type: 'demo' });
    }
  });

  return links;
}

/**
 * Parses itemized individual Project Cards with Title, Stack, Summary, and Links.
 */
export function extractProjectCards(cleanText = '') {
  if (!cleanText) return [];

  // Split multiple projects if separated by double newlines or embedded project titles
  let text = cleanText;

  // Split out lines where a new project title starts after links
  text = text.replace(/(https?:\/\/[^\s|•]+|\.vercel\.app|\.app|\.dev)\s+([A-Z0-9][A-Za-z0-9\s-]{2,30}\s+[—|•:])/g, '$1\n\n$2');

  const rawBullets = text.split('\n\n').filter(Boolean);
  const bulletPattern = /^[\s]*([•\-\*▪▫–—]|[0-9]{1,2}[.)]|[a-zA-Z][.)])\s*/;
  const projectCards = [];

  let currentProject = null;

  rawBullets.forEach(block => {
    const cleanBlock = block.replace(bulletPattern, '').trim();
    if (!cleanBlock) return;

    const isPureLinkLine = /^(?:GitHub|Live Demo|Demo|Links?)\s*:\s*[^\s]+/i.test(cleanBlock) || /^https?:\/\//i.test(cleanBlock);

    if (isPureLinkLine && currentProject) {
      const foundLinks = extractLinksFromText(cleanBlock);
      foundLinks.forEach(l => {
        if (!currentProject.links.some(existing => existing.url === l.url)) {
          currentProject.links.push(l);
        }
      });
      return;
    }

    const isNewProject =
      /^[A-Z0-9][A-Za-z0-9\s-]{2,35}(?:\s+[—|•:]|\s+Python|\s+React|\s+FastAPI|\s+AI|\s+App|\s+Platform|\s+Detection|\s+Classifier)/.test(cleanBlock) &&
      !isPureLinkLine;

    if (isNewProject && currentProject && currentProject.summaryLines.length > 0) {
      finalizeProjectCard(currentProject, projectCards);
      currentProject = null;
    }

    if (!currentProject) {
      let title = '';
      let headerRest = cleanBlock;

      if (cleanBlock.includes('—')) {
        const parts = cleanBlock.split('—');
        title = parts[0].replace(/GitHub:.*|Live Demo:.*/i, '').trim();
        headerRest = parts.slice(1).join('—').trim();
      } else if (cleanBlock.includes('|')) {
        const parts = cleanBlock.split('|');
        title = parts[0].replace(/GitHub:.*|Live Demo:.*/i, '').trim();
        headerRest = parts.slice(1).join('|').trim();
      } else {
        const titleMatch = cleanBlock.match(/^([A-Z0-9][A-Za-z0-9\s-]{2,35})(?:\s+Python|\s+React|\s+FastAPI|\s+AI|\s+Docker|\s+•)/);
        if (titleMatch) {
          title = titleMatch[1].trim();
          headerRest = cleanBlock.substring(titleMatch[1].length).trim();
        } else {
          title = cleanBlock.split(/•|\n/)[0].trim().substring(0, 35);
          headerRest = cleanBlock.substring(title.length).trim();
        }
      }

      currentProject = {
        title: title || 'Featured Project',
        summaryLines: [headerRest],
        fullText: cleanBlock,
        links: extractLinksFromText(cleanBlock)
      };
    } else {
      currentProject.summaryLines.push(cleanBlock);
      currentProject.fullText += ' ' + cleanBlock;
      const newLinks = extractLinksFromText(cleanBlock);
      newLinks.forEach(l => {
        if (!currentProject.links.some(existing => existing.url === l.url)) {
          currentProject.links.push(l);
        }
      });
    }
  });

  if (currentProject) {
    finalizeProjectCard(currentProject, projectCards);
  }

  return projectCards;
}

function finalizeProjectCard(proj, list) {
  const combined = proj.summaryLines.join(' ');
  const stack = extractStackFromText(proj.fullText);

  let cleanTitle = proj.title
    .replace(/^GitHub:.*|Live Demo:.*|Demo:.*/i, '')
    .replace(/[•|—:]+$/, '')
    .trim();

  let conciseSummary = combined
    .replace(/(?:GitHub|Live Demo|Demo):\s*[^\s|•]+/gi, '')
    .replace(/^[•\-\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (conciseSummary.length > 220) {
    const sentences = conciseSummary.split(/(?<=[.!?])\s+/);
    conciseSummary = sentences.slice(0, 2).join(' ');
  }

  const metricMatches = proj.fullText.match(/\b\d+(\.\d+)?%|\$\d+[\d,.]*|₹\s*\d+[\d,.]*\s*(?:L|Cr|Crore|K|M)?|\b\d+[\d,.]*\+?\s*(?:users|clients|ms|hours|lpa|crore|k|m|teams|schemes|slicers|aum|tables?|queries|records|transactions|rows|samples)\b/gi) || [];

  list.push({
    title: cleanTitle || 'Featured Project',
    summary: conciseSummary || 'Built scalable solution with modern tech architecture.',
    stack,
    links: proj.links,
    metrics: Array.from(new Set(metricMatches.map(m => m.trim()))).slice(0, 3)
  });
}

/**
 * Parses itemized individual Certificate Cards with Title, Issuer, and Year.
 */
export function extractCertificationCards(cleanText = '') {
  if (!cleanText) return [];

  // Split on ANY bullet/separator variant: •, ·, ▪, ▫, ▸, ►, ●, *, –, — at start of token, or newlines
  // This handles both "one cert per line" and "all certs on a single line joined by •"
  const rawItems = cleanText
    .split(/[\u2022\u00B7\u25AA\u25AB\u25B8\u25CF\u25CB\u2023\u2043\u204C\u204D•·▪▫▸►●\n\r]+/)
    .map(s => s.replace(/^[\s\-–—*]+/, '').trim())
    .filter(s => s.length > 4);

  const certCards = [];

  rawItems.forEach(item => {
    // Skip standalone date ranges like "2024 – 2028" or "2024"
    if (/^\d{4}\s*[-–—]?\s*\d{0,4}$/.test(item.trim())) return;
    // Skip very short fragments
    if (item.trim().length < 5) return;

    let title = '';
    let issuer = '';
    let date = '';

    // Extract year/date range
    const dateMatch = item.match(/\b(20\d{2}(?:\s*[-–—]\s*20\d{2})?)\b/);
    if (dateMatch) {
      date = dateMatch[0];
    }

    // Remove date from item before parsing title/issuer
    const cleanItem = item
      .replace(/\b(20\d{2}(?:\s*[-–—]\s*20\d{2})?)\b/, '')
      .replace(/^[\s,;]+|[\s,;]+$/, '')
      .trim();

    if (!cleanItem || cleanItem.length < 4) return;

    // Parse "Title — Issuer" pattern
    if (cleanItem.includes('—')) {
      const parts = cleanItem.split('—');
      title = parts[0].trim();
      issuer = parts.slice(1).join('—').trim();
    } else if (cleanItem.includes('|')) {
      const parts = cleanItem.split('|');
      title = parts[0].trim();
      issuer = parts.slice(1).join('|').trim();
    } else if (cleanItem.includes('(')) {
      const parenIdx = cleanItem.indexOf('(');
      title = cleanItem.substring(0, parenIdx).trim();
      issuer = cleanItem.substring(parenIdx + 1).replace(')', '').trim();
    } else {
      // No separator: try to detect known providers inside the text
      title = cleanItem;
      const providers = [
        'AWS Training & Certification', 'AWS', 'Coursera', 'Udemy', 'Google', 'Microsoft',
        'Deloitte', 'Forage', 'Tata', 'HP LIFE', 'University of Helsinki', 'MinnaLearn',
        'IBM', 'Meta', 'LinkedIn Learning', 'edX', 'DataCamp', 'Pluralsight', 'Cisco'
      ];
      const found = providers.find(p => cleanItem.toLowerCase().includes(p.toLowerCase()));
      if (found) {
        // Try to split on the provider name
        const pIdx = cleanItem.toLowerCase().indexOf(found.toLowerCase());
        if (pIdx > 4) {
          title = cleanItem.substring(0, pIdx).replace(/[,\s]+$/, '').trim();
          issuer = found;
        } else {
          issuer = found;
        }
      }
    }

    // Clean trailing punctuation from title
    title = (title || cleanItem).replace(/^[-•\s,]+|[,:\s]+$/, '').trim();
    issuer = (issuer || '').replace(/^[-•\s,]+|[,:\s]+$/, '').trim();

    if (title && title.length > 3) {
      certCards.push({
        title,
        issuer: issuer || 'Verified Credential',
        date
      });
    }
  });

  return certCards;
}

/**
 * Parses itemized individual Work Experience / Internship Cards.
 */
export function extractExperienceCards(cleanText = '') {
  if (!cleanText) return [];

  const rawBullets = cleanText.split('\n\n').filter(Boolean);
  const bulletPattern = /^[\s]*([•\-\*▪▫–—]|[0-9]{1,2}[.)]|[a-zA-Z][.)])\s*/;
  const expCards = [];

  let currentExp = null;

  rawBullets.forEach(block => {
    const cleanBlock = block.replace(bulletPattern, '').trim();

    const isHeader = /intern|engineer|developer|analyst|scientist|manager|lead|architect|associate|specialist/i.test(cleanBlock) &&
      (cleanBlock.includes('—') || cleanBlock.includes('|') || cleanBlock.includes('at ') || cleanBlock.includes('–'));

    if (isHeader && currentExp) {
      finalizeExperienceCard(currentExp, expCards);
      currentExp = null;
    }

    if (!currentExp) {
      let role = '';
      let company = '';
      let location = '';

      if (cleanBlock.includes('—')) {
        const parts = cleanBlock.split('—');
        role = parts[0].trim();
        const rest = parts[1]?.trim() || '';
        const words = rest.split(/\s+/);
        if (words.length >= 2) {
          company = words.slice(0, 2).join(' ');
          location = words.slice(2).join(' ');
        } else {
          company = rest;
        }
      } else if (cleanBlock.includes('|')) {
        const parts = cleanBlock.split('|');
        role = parts[0].trim();
        company = parts[1]?.trim() || '';
        location = parts[2]?.trim() || '';
      } else {
        role = cleanBlock.split(/•|\n/)[0].trim();
      }

      currentExp = {
        role: role || 'Professional Role',
        company: company || 'Organization',
        location: location || '',
        bullets: [],
        fullText: cleanBlock
      };
    } else {
      currentExp.bullets.push(cleanBlock);
      currentExp.fullText += ' ' + cleanBlock;
    }
  });

  if (currentExp) {
    finalizeExperienceCard(currentExp, expCards);
  }

  return expCards;
}

function finalizeExperienceCard(exp, list) {
  const stack = extractStackFromText(exp.fullText);
  const metricMatches = exp.fullText.match(/\b\d+(\.\d+)?%|\$\d+[\d,.]*|₹\s*\d+[\d,.]*\s*(?:L|Cr|Crore|K|M)?|\b\d+[\d,.]*\+?\s*(?:users|clients|ms|hours|lpa|crore|k|m|teams|schemes|slicers|aum|tables?|queries|records|transactions|rows|datasets)\b/gi) || [];

  // Generate a punchy 2-sentence summary
  let summary = '';
  if (exp.bullets.length > 0) {
    summary = exp.bullets.slice(0, 2).join(' ');
    if (summary.length > 220) {
      const sents = summary.split(/(?<=[.!?])\s+/);
      summary = sents.slice(0, 2).join(' ');
    }
  } else {
    summary = exp.fullText;
  }

  list.push({
    role: exp.role.replace(/^[-•\s]+/, '').trim(),
    company: exp.company.replace(/^[-•\s]+/, '').trim(),
    location: exp.location,
    summary: summary || 'Delivered key engineering solutions and business deliverables.',
    bullets: exp.bullets.slice(0, 3),
    stack,
    metrics: Array.from(new Set(metricMatches.map(m => m.trim()))).slice(0, 4)
  });
}

/**
 * Generates an intelligent, high-impact executive summary for a section.
 */
export function generateSectionSummary(sectionId, rawText, cleanText, structured) {
  if (!cleanText || cleanText.length < 10) {
    return {
      synopsis: 'No detailed content detected in this section.',
      keyEntities: [],
      stack: [],
      metrics: [],
      highlights: [],
      itemCards: []
    };
  }

  const stack = extractStackFromText(cleanText);
  const metricMatches = cleanText.match(/\b\d+(\.\d+)?%|\$\d+[\d,.]*|₹\s*\d+[\d,.]*\s*(?:L|Cr|Crore|K|M)?|\b\d+[\d,.]*\+?\s*(?:users|clients|ms|hours|lpa|crore|k|m|teams|schemes|slicers|aum|tables?|queries|records|transactions|rows|datasets)\b/gi) || [];
  const uniqueMetrics = Array.from(new Set(metricMatches.map(m => m.trim()))).slice(0, 5);

  const lines = cleanText.split('\n\n').filter(Boolean);
  const bulletPattern = /^[\s]*([•\-\*▪▫–—]|[0-9]{1,2}[.)]|[a-zA-Z][.)])\s*/;

  if (sectionId === 'projects') {
    const projectCards = extractProjectCards(cleanText);
    return {
      title: `${projectCards.length || 'Key'} Engineering Projects`,
      synopsis: `Architected and shipped ${projectCards.length} high-impact project${projectCards.length > 1 ? 's' : ''} with live deployments and production repositories.`,
      keyEntities: projectCards.map(p => p.title),
      stack,
      metrics: uniqueMetrics,
      highlights: [],
      itemCards: projectCards,
      cardType: 'projects'
    };
  }

  if (sectionId === 'certifications') {
    const certCards = extractCertificationCards(cleanText);
    return {
      title: `${certCards.length} Verified Certifications`,
      synopsis: `Demonstrated technical competency across verified industry programs and specializations.`,
      keyEntities: certCards.map(c => c.title),
      stack,
      metrics: [],
      highlights: [],
      itemCards: certCards,
      cardType: 'certifications'
    };
  }

  if (sectionId === 'experience') {
    const expCards = extractExperienceCards(cleanText);
    return {
      title: expCards[0]?.role ? `${expCards[0].role} — ${expCards[0].company}` : 'Professional Experience & Internships',
      synopsis: expCards[0]?.summary || `Professional experience encompassing ${stack.slice(0, 4).join(', ') || 'production workflows'}.`,
      keyEntities: expCards.map(e => e.role),
      stack,
      metrics: uniqueMetrics,
      highlights: expCards[0]?.bullets || [],
      itemCards: expCards,
      cardType: 'experience'
    };
  }

  if (sectionId === 'education') {
    let degreeFound = '';
    for (const l of lines) {
      if (/bachelor|master|b\.tech|b\.e|b\.s|b\.sc|m\.tech|m\.s|phd|diploma/i.test(l)) {
        degreeFound = l.replace(bulletPattern, '').split('|')[0].split('•')[0].trim();
        break;
      }
    }

    return {
      title: degreeFound || 'Academic Credentials',
      synopsis: degreeFound ? `Academic background in ${degreeFound} with foundational engineering coursework.` : `Completed formal academic qualifications and technical coursework.`,
      keyEntities: degreeFound ? [degreeFound] : [],
      stack: [],
      metrics: uniqueMetrics,
      highlights: lines.slice(0, 2).map(l => l.replace(bulletPattern, '').trim()),
      itemCards: [],
      cardType: 'education'
    };
  }

  if (sectionId === 'skills') {
    // Extract ALL distinct skill tokens from the section text
    const allSkillTokens = cleanText
      .split(/[,|•·;\n\r\t]+/)
      .map(s => s.replace(/^[\s\-–—*▪▫►]+|[\s\-–—*▪▫►]+$/g, '').trim())
      .filter(s => s.length > 1 && s.length < 50 && !/^(and|the|or|with|using|for|in|of|to|a|an)$/i.test(s));
    const uniqueAllSkills = Array.from(new Set(allSkillTokens.map(s => s)));
    const count = uniqueAllSkills.length;
    return {
      title: `${count > 1 ? count + '+' : ''} Technical Competencies`,
      synopsis: `Strong coverage across core languages, backend/frontend frameworks, databases, and engineering tools (${stack.slice(0, 6).join(', ')}).`,
      keyEntities: stack,
      stack,
      allSkills: uniqueAllSkills,
      metrics: [],
      highlights: [],
      itemCards: [],
      cardType: 'skills'
    };
  }

  if (sectionId === 'achievements') {
    return {
      title: `Standout Honors & Recognitions`,
      synopsis: `Documented achievements, contest performance, and academic/professional recognitions.`,
      keyEntities: [],
      stack: [],
      metrics: uniqueMetrics,
      highlights: lines.slice(0, 3).map(l => l.replace(bulletPattern, '').trim()),
      itemCards: [],
      cardType: 'achievements'
    };
  }

  // Summary / Objective
  return {
    title: 'Executive Profile Summary',
    synopsis: cleanText.length > 200 ? cleanText.substring(0, 220) + '...' : cleanText,
    keyEntities: [],
    stack,
    metrics: uniqueMetrics,
    highlights: [],
    itemCards: [],
    cardType: 'summary'
  };
}

/**
 * Parses cleaned section text into structured bullet points or paragraphs.
 */
export function parseStructuredItems(cleanedText = '', sectionId = '') {
  if (!cleanedText) return { type: 'empty', items: [] };

  const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);
  const bulletPattern = /^[\s]*([•\-\*▪▫–—]|[0-9]{1,2}[.)]|[a-zA-Z][.)])\s*/;

  if (sectionId === 'skills') {
    const categories = [];
    const plainSkills = [];

    lines.forEach(line => {
      const cleanLine = line.replace(bulletPattern, '').trim();
      if (cleanLine.includes(':')) {
        const [catTitle, ...rest] = cleanLine.split(':');
        const skillList = rest.join(':').split(/[,|•·;]/).map(s => s.trim()).filter(Boolean);
        categories.push({
          category: catTitle.trim(),
          skills: skillList
        });
      } else {
        const list = cleanLine.split(/[,|•·;]/).map(s => s.trim()).filter(Boolean);
        plainSkills.push(...list);
      }
    });

    if (categories.length > 0) {
      return { type: 'skills_categorized', categories, plainSkills };
    } else if (plainSkills.length > 0) {
      return { type: 'skills_list', items: plainSkills };
    }
  }

  const items = [];
  lines.forEach(line => {
    const isBullet = bulletPattern.test(line);
    const content = line.replace(bulletPattern, '').trim();

    if (content) {
      const metricMatches = content.match(/\b\d+(\.\d+)?%|\$\d+[\d,.]*|₹\s*\d+[\d,.]*\s*(?:L|Cr|Crore|K|M)?|\b\d+[\d,.]*\+?\s*(?:users|clients|ms|hours|lpa|crore|k|m|teams|schemes|slicers|aum|tables?|queries|records|transactions|rows)\b/gi) || [];

      items.push({
        isBullet: isBullet || lines.length > 1,
        text: content,
        metrics: metricMatches.slice(0, 5)
      });
    }
  });

  return {
    type: items.some(i => i.isBullet) ? 'bullets' : 'paragraph',
    items
  };
}

/**
 * Extract Personal & Contact Details with high precision from resume text.
 */
export function extractPersonalDetails(rawText = '', initialData = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      name: initialData?.parsed_name || initialData?.act_name || '',
      email: initialData?.parsed_email || initialData?.act_mail || '',
      phone: initialData?.parsed_mobile || initialData?.act_mob || '',
      linkedin: initialData?.linkedin || '',
      github: initialData?.github || '',
      portfolio: '',
      location: ''
    };
  }

  const text = rawText.replace(/\r\n/g, '\n');
  const first1200 = text.substring(0, 1400);

  // 1. Email Extraction
  const emailMatch = first1200.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/);
  const email = emailMatch ? emailMatch[0] : (initialData?.parsed_email || initialData?.act_mail || '');

  // 2. Phone Extraction
  const phoneMatch = first1200.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\b\d{10}\b)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : (initialData?.parsed_mobile || initialData?.act_mob || '');

  // 3. LinkedIn Extraction
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i) ||
                        text.match(/\blinkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  let linkedin = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : (initialData?.linkedin || '');

  // 4. GitHub Extraction
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i) ||
                      text.match(/\bgithub\.com\/([a-zA-Z0-9_-]+)/i);
  let github = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : (initialData?.github || '');

  // 5. Portfolio / Website Extraction
  let portfolio = '';
  const portfolioMatch = text.match(/(?:https?:\/\/)?([a-zA-Z0-9_-]+\.(?:github\.io|vercel\.app|netlify\.app))(?:\/[^\s]*)?/i) ||
                        text.match(/(?:https?:\/\/|www\.)([a-zA-Z0-9_-]+\.(?:dev|me|tech|io|ai|com|in))(?:\/[^\s]*)?/i);
  if (portfolioMatch) {
    const matchedUrl = portfolioMatch[0];
    if (!/b\.tech|m\.tech|btech|mtech|degree/i.test(matchedUrl)) {
      portfolio = matchedUrl.startsWith('http') ? matchedUrl : `https://${matchedUrl}`;
    }
  }

  // 6. Name Extraction
  let name = initialData?.parsed_name || initialData?.act_name || '';
  if (!name || name === 'Candidate' || name.toLowerCase().includes('resume')) {
    const topLines = first1200.split('\n').map(l => l.trim()).filter(Boolean);
    for (const l of topLines.slice(0, 4)) {
      if (
        l.length >= 2 &&
        l.length <= 40 &&
        !l.includes('@') &&
        !l.includes('http') &&
        !l.includes('github') &&
        !l.includes('linkedin') &&
        !/\d/.test(l) &&
        !/resume|curriculum|vitae|profile|summary|page/i.test(l)
      ) {
        name = l;
        break;
      }
    }
  }

  // 7. Strict Accurate Location Extraction
  let location = '';
  const KNOWN_LOCATIONS = [
    'Mumbai', 'Bengaluru', 'Bangalore', 'Delhi', 'New Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata',
    'Noida', 'Gurgaon', 'Gurugram', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Bhopal', 'Chandigarh',
    'San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Los Angeles',
    'Toronto', 'Vancouver', 'London', 'Berlin', 'Singapore', 'Sydney', 'Dubai',
    'India', 'USA', 'United States', 'UK', 'United Kingdom', 'Canada', 'Germany', 'Maharashtra', 'Karnataka', 'Tamil Nadu'
  ];

  const directLoc = first1200.match(/(?:location|address|residence|city|📍)\s*[:\-]?\s*([A-Za-z\s,]+)/i);
  if (directLoc && directLoc[1]) {
    const candidate = directLoc[1].split('\n')[0].trim();
    if (!KNOWN_TECH_KEYWORDS.has(candidate.toLowerCase()) && candidate.length < 35) {
      location = candidate;
    }
  }

  if (!location) {
    for (const loc of KNOWN_LOCATIONS) {
      const locRegex = new RegExp(`\\b(?:${loc})(?:,\\s*(?:India|USA|UK|Canada|Maharashtra|Karnataka|CA|NY|Texas|TX|Delhi))?\\b`, 'i');
      const match = first1200.match(locRegex);
      if (match) {
        const surrounding = first1200.substring(Math.max(0, match.index - 20), Math.min(first1200.length, match.index + match[0].length + 20)).toLowerCase();
        if (!surrounding.includes('fastapi') && !surrounding.includes('react') && !surrounding.includes('python')) {
          location = match[0].trim();
          break;
        }
      }
    }
  }

  return {
    name: name || 'Candidate',
    email,
    phone,
    linkedin,
    github,
    portfolio,
    location
  };
}

/**
 * Extract all section contents and their executive summaries from raw resume text in real time.
 */
export function extractResumeSections(rawText = '', existingChecks = null) {
  if (!rawText || typeof rawText !== 'string') {
    return SECTION_CONFIGS.map(cfg => ({
      ...cfg,
      found: false,
      content: '',
      cleanContent: '',
      structured: { type: 'empty', items: [] },
      summary: { synopsis: '', keyEntities: [], stack: [], metrics: [], highlights: [], itemCards: [] },
      wordCount: 0,
      charCount: 0
    }));
  }

  const normalizedText = rawText.replace(/\r\n/g, '\n');
  const lines = normalizedText.split('\n');

  const detectedHeaders = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line || line.length > 70) continue;

    const cleanLine = line
      .replace(/^[\s#*>\-–—•0-9.)]+/, '')
      .replace(/[:\-\—\.\*#]+$/, '')
      .trim()
      .toLowerCase();

    for (const config of SECTION_CONFIGS) {
      const isMatch = config.headers.some(hdr => {
        if (cleanLine === hdr) return true;
        if (cleanLine.startsWith(hdr + ' ') || cleanLine.endsWith(' ' + hdr)) return true;
        const regex = new RegExp(`^(${hdr})$`, 'i');
        return regex.test(cleanLine);
      });

      if (isMatch) {
        detectedHeaders.push({
          configId: config.id,
          lineIndex,
          lineText: line
        });
        break;
      }
    }
  }

  const uniqueHeadersMap = new Map();
  for (const h of detectedHeaders) {
    if (!uniqueHeadersMap.has(h.configId)) {
      uniqueHeadersMap.set(h.configId, h);
    }
  }

  const sortedHeaders = Array.from(uniqueHeadersMap.values()).sort(
    (a, b) => a.lineIndex - b.lineIndex
  );

  const extractedSectionsMap = new Map();

  for (let i = 0; i < sortedHeaders.length; i++) {
    const current = sortedHeaders[i];
    const next = sortedHeaders[i + 1];

    const startLine = current.lineIndex + 1;
    const endLine = next ? next.lineIndex : lines.length;

    const sectionLines = lines.slice(startLine, endLine);
    const rawContent = sectionLines.join('\n').trim();

    extractedSectionsMap.set(current.configId, {
      rawContent,
      headerLine: current.lineText
    });
  }

  return SECTION_CONFIGS.map(cfg => {
    const extracted = extractedSectionsMap.get(cfg.id);
    let rawContent = extracted?.rawContent || '';

    const existing = existingChecks?.find(c => (c.id === cfg.id || c.label === cfg.label));
    if (!rawContent && existing?.content) {
      rawContent = existing.content;
    }

    let found = Boolean(rawContent && rawContent.length >= 10);
    if (!found && existing?.found) {
      found = true;
    } else if (!found) {
      const hasKeywords = cfg.headers.some(h => {
        const reg = new RegExp(`\\b${h}\\b`, 'i');
        return reg.test(normalizedText);
      });
      if (hasKeywords) {
        found = true;
        for (const h of cfg.headers) {
          const idx = normalizedText.toLowerCase().indexOf(h);
          if (idx !== -1) {
            const snippet = normalizedText.substring(idx + h.length, idx + h.length + 500).trim();
            if (snippet.length > 15) {
              rawContent = snippet.split('\n\n')[0] || snippet;
              break;
            }
          }
        }
      }
    }

    const cleanContent = cleanAndFormatText(rawContent);
    if (cleanContent.length < 8 && !rawContent) {
      found = false;
    }

    const structured = parseStructuredItems(cleanContent, cfg.id);
    const summary = generateSectionSummary(cfg.id, rawContent, cleanContent, structured);
    const words = cleanContent ? cleanContent.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanContent ? cleanContent.length : 0;

    return {
      id: cfg.id,
      label: cfg.label,
      points: cfg.points,
      found,
      content: rawContent,
      cleanContent,
      structured,
      summary,
      wordCount: words,
      charCount: chars,
      proTip: cfg.proTip,
      templateExample: cfg.templateExample
    };
  });
}
