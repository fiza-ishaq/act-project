import { JobDescription, Candidate } from '../types';

export const INITIAL_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: 'jd-001',
    title: 'Senior Full Stack Engineer (React/Node.js)',
    department: 'Engineering',
    location: 'Remote (US/Canada)',
    type: 'Full-time',
    experienceRequired: '5+ years of software engineering experience with full stack web development',
    requiredSkills: [
      '5+ years full stack engineering experience',
      'Proficiency in React 18+ and modern TypeScript',
      'Backend development with Node.js & Express or NestJS',
      'RESTful and GraphQL API design & implementation',
      'Database design with PostgreSQL or MongoDB',
      'Unit & E2E testing (Jest, Playwright, or Cypress)'
    ],
    niceToHaveSkills: [
      'Experience with Docker & Kubernetes containerization',
      'AWS cloud infrastructure (S3, Lambda, CloudFront)',
      'CI/CD pipeline configuration (GitHub Actions)',
      'Agile/Scrum team leadership experience'
    ],
    toolsAndTech: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Git'],
    educationRequired: ['Bachelor’s degree in Computer Science, Software Engineering, or equivalent experience'],
    certificationsRequired: ['AWS Certified Developer or Solutions Architect (Nice-to-have)'],
    descriptionText: `We are looking for a Senior Full Stack Engineer to build responsive, high-performance web applications.

Required Qualifications:
- 5+ years of full stack software engineering experience building scalable web apps.
- Advanced expertise in React, TypeScript, and modern state management.
- Strong backend experience with Node.js, Express/NestJS, and asynchronous architectures.
- Experience writing SQL queries and designing schemas in PostgreSQL or MongoDB.
- Track record of writing automated tests (unit, integration, E2E).

Nice to Have:
- Container deployment with Docker & Kubernetes.
- Cloud deployment on AWS (Lambda, ECS, S3).
- AWS Certified Developer certification.

Responsibilities:
- Architect and develop new client-facing web features and robust API services.
- Mentor mid-level developers and conduct thorough code reviews.
- Drive performance optimization, accessibility, and clean architectural standards.`,
    updatedAt: '2026-07-20T10:00:00.000Z'
  },
  {
    id: 'jd-002',
    title: 'Senior Product Marketing Manager',
    department: 'Marketing',
    location: 'New York, NY (Hybrid)',
    type: 'Full-time',
    experienceRequired: '4+ years in B2B SaaS Product Marketing',
    requiredSkills: [
      '4+ years B2B SaaS product marketing experience',
      'GTM strategy creation and execute product launch campaigns',
      'Competitive intelligence & positioning matrix creation',
      'Sales enablement materials and collateral creation',
      'Customer messaging, copywriting, and value proposition design'
    ],
    niceToHaveSkills: [
      'SQL / Product Analytics (Mixpanel, Amplitude, Google Analytics 4)',
      'Growth marketing and A/B testing strategy',
      'Public speaking and webinar hosting'
    ],
    toolsAndTech: ['Mixpanel', 'HubSpot', 'Salesforce', 'GA4', 'Figma', 'Notion'],
    educationRequired: ['Bachelor’s degree in Marketing, Communications, Business, or related field'],
    certificationsRequired: ['Pragmatic Institute Product Marketing Certification (Preferred)'],
    descriptionText: `HireLens is searching for a Senior Product Marketing Manager to lead messaging and go-to-market strategies for our enterprise HR products.

Required Qualifications:
- 4+ years of B2B SaaS product marketing experience.
- Proven track record launching successful software products to enterprise personas.
- Exceptional copywriting, value proposition design, and market positioning skills.
- Ability to equip sales teams with battlecards, pitch decks, and competitive breakdown.

Nice to Have:
- Hands-on experience with SQL or data analytics platforms (Mixpanel/Amplitude).
- Pragmatic Institute Certification.`,
    updatedAt: '2026-07-21T11:30:00.000Z'
  },
  {
    id: 'jd-003',
    title: 'Lead Data Scientist (LLMs & AI)',
    department: 'AI & Analytics',
    location: 'San Francisco, CA (On-site)',
    type: 'Full-time',
    experienceRequired: '6+ years in Machine Learning and Data Science',
    requiredSkills: [
      '6+ years applied ML/Data Science experience',
      'Deep Python expertise (PyTorch, TensorFlow, Pandas, Scikit-learn)',
      'Hands-on fine-tuning and evaluation of Large Language Models (LLMs)',
      'Complex SQL query optimization & data pipeline construction',
      'A/B experimentation and statistical hypothesis testing'
    ],
    niceToHaveSkills: [
      'Publication record in top AI conferences (NeurIPS, ICML, ACL)',
      'Vector databases (Pinecone, Qdrant, Chroma)',
      'MLOps framework expertise (MLflow, Kubeflow)'
    ],
    toolsAndTech: ['Python', 'PyTorch', 'HuggingFace', 'SQL', 'Databricks', 'Docker', 'Vector DBs'],
    educationRequired: ['Master’s or Ph.D. in Computer Science, Statistics, Mathematics, or AI field'],
    certificationsRequired: ['Google Cloud Professional Data Engineer or AWS Machine Learning Specialty'],
    descriptionText: `Seeking a Lead Data Scientist to build state-of-the-art NLP and LLM feature pipelines for candidate screening algorithms.

Requirements:
- 6+ years experience in Applied AI/Data Science.
- Deep hands-on experience training, fine-tuning, and evaluating transformer models and LLMs.
- Strong mathematical background in statistics, vector embeddings, and scoring metrics.
- Master's or PhD degree in quantitative discipline.`,
    updatedAt: '2026-07-22T14:15:00.000Z'
  }
];

export const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: 'cand-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    jobDescriptionId: 'jd-001',
    status: 'evaluated',
    createdAt: '2026-07-24T08:30:00.000Z',
    hrStage: 'Phone Screen',
    notes: 'Solid full stack profile with 6 years experience. Strong match on React, TS, and Node. AWS certified.',
    resumeText: `ALEX RIVERA
San Francisco, CA | alex.rivera@example.com | github.com/arivera

SUMMARY
Passionate Senior Full Stack Engineer with 6.5 years of experience architecting and scaling React, TypeScript, and Node.js web applications. Experienced in cloud deployments (AWS), automated testing, and PostgreSQL schema optimization.

WORK EXPERIENCE

Senior Full Stack Developer | TechScale Inc. | 2022 - Present
- Led a team of 5 engineers building enterprise React 18 frontend applications with TypeScript and Tailwind CSS.
- Designed and maintained Node.js / Express microservices serving 200k daily active users with 99.9% uptime.
- Optimized PostgreSQL database queries, reducing API response latency by 42%.
- Configured CI/CD pipelines with GitHub Actions and Docker container deployments on AWS ECS and S3.
- Implemented comprehensive Jest unit tests and Playwright E2E testing suites achieving 88% code coverage.

Full Stack Software Engineer | CloudVibe Systems | 2019 - 2022
- Built full stack features using React, Node.js, GraphQL, and MongoDB.
- Created RESTful API endpoints for payment processing and user authentication.
- Mentored 3 junior developers and established code review standards across frontend & backend codebases.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley (Graduated 2019)

CERTIFICATIONS & SKILLS
- AWS Certified Developer – Associate (2023)
- Languages/Frameworks: JavaScript, TypeScript, React, Node.js, Express, HTML5, CSS3/Tailwind
- Databases & Tools: PostgreSQL, MongoDB, Docker, Git, Jest, Playwright, GraphQL, REST APIs`,
    evaluation: {
      candidateName: 'Alex Rivera',
      matchScore: 94,
      confidenceLevel: 'High',
      subScores: {
        requiredSkills: 96,
        relevantExperience: 95,
        education: 90,
        certifications: 95,
        projectsAndResponsibilities: 92
      },
      matchedRequirements: [
        '5+ years full stack software engineering experience (Candidate has 6.5 years)',
        'Proficiency in React 18+ and TypeScript',
        'Backend development with Node.js & Express',
        'RESTful and GraphQL API design & implementation',
        'Database design with PostgreSQL and MongoDB',
        'Automated testing experience (Jest and Playwright)',
        'Bachelor’s degree in Computer Science from UC Berkeley',
        'Nice-to-have: Docker containerization and AWS ECS/S3 cloud deployment',
        'Nice-to-have: AWS Certified Developer certification',
        'Nice-to-have: CI/CD GitHub Actions experience'
      ],
      missingRequirements: [
        'Kubernetes container orchestration experience (Not explicitly mentioned)'
      ],
      strengths: [
        '6.5 years of directly relevant full stack software engineering experience with React, TypeScript, and Node.js.',
        'Extensive database optimization experience with PostgreSQL and MongoDB.',
        'Holds AWS Certified Developer certification and has proven cloud deployment experience on AWS ECS and S3.',
        'Strong automated testing background with Jest unit testing and Playwright E2E coverage.'
      ],
      weaknesses: [
        'Resume does not mention Kubernetes experience for container orchestration.'
      ],
      summary: 'Alex Rivera is an exceptional fit for the Senior Full Stack Engineer position, exceeding the 5+ year experience requirement with 6.5 years of active full stack engineering. The candidate possesses strong technical proficiency across the entire target tech stack including React, TypeScript, Node.js, Express, PostgreSQL, and Docker. Additionally, Alex satisfies nice-to-have qualifications including an AWS Developer certification and CI/CD pipeline automation.',
      recommendation: 'Strong Match',
      disclaimer: 'This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers.',
      fairnessAudit: {
        protectedAttributesFiltered: ['Age', 'Gender', 'Race', 'Religion', 'Marital Status', 'Photo'],
        isFairAndObjective: true,
        auditMessage: 'Candidate was evaluated strictly on job-relevant skills, technical stack, experience, and educational credentials. Protected personal attributes were fully excluded.'
      },
      evaluatedAt: '2026-07-24T08:31:00.000Z'
    }
  },
  {
    id: 'cand-102',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    jobDescriptionId: 'jd-001',
    status: 'evaluated',
    createdAt: '2026-07-24T09:15:00.000Z',
    hrStage: 'Screened',
    notes: 'Solid mid-level developer (3.5 yrs exp). Strong Vue/React skills, but under 5 yrs experience required and missing AWS/Docker.',
    resumeText: `PRIYA SHARMA
Austin, TX | priya.sharma@example.com

PROFESSIONAL SUMMARY
Full Stack Web Developer with 3.5 years of hands-on experience building web interfaces with React, Vue.js, JavaScript, and Node.js backends. Skilled in REST API integration, SQL databases, and responsive UI engineering.

EXPERIENCE
Software Developer | WebFlow Solutions | 2023 - Present
- Developed modular React and Vue components for customer portal handling 50,000 monthly active users.
- Built Node.js and Express REST APIs connected to PostgreSQL databases.
- Participated in weekly agile sprint planning and daily standups.

Junior Frontend Developer | Apex Media | 2021 - 2023
- Built responsive UI layouts using HTML5, CSS3, JavaScript (ES6+), and React.
- Fixed bugs and improved cross-browser compatibility across desktop and mobile devices.

EDUCATION
Bachelor of Science in Information Technology | University of Texas at Austin (2021)

SKILLS & TOOLS
JavaScript, TypeScript (Basic), React, Vue.js, Node.js, Express, HTML/CSS, PostgreSQL, Git, Postman`,
    evaluation: {
      candidateName: 'Priya Sharma',
      matchScore: 68,
      confidenceLevel: 'High',
      subScores: {
        requiredSkills: 65,
        relevantExperience: 60,
        education: 85,
        certifications: 50,
        projectsAndResponsibilities: 70
      },
      matchedRequirements: [
        'Proficiency in React and JavaScript/TypeScript',
        'Backend API development with Node.js & Express',
        'Database experience with PostgreSQL',
        'Bachelor’s degree in IT / Computer Science equivalent'
      ],
      missingRequirements: [
        'Requires 5+ years experience (Candidate has 3.5 years total experience)',
        'GraphQL API design & implementation (Not Mentioned)',
        'Automated testing frameworks such as Jest, Playwright, or Cypress (Not Mentioned)',
        'Docker containerization (Not Mentioned)',
        'AWS Cloud Infrastructure (Not Mentioned)',
        'AWS Certification (Not Mentioned)'
      ],
      strengths: [
        'Proven hands-on experience building frontend UIs with React and Vue along with Node.js/Express backends.',
        'Direct experience with PostgreSQL database integration and RESTful API development.',
        'Relevant BS degree in Information Technology.'
      ],
      weaknesses: [
        'Does not meet the 5+ years minimum experience threshold required for a Senior position (currently at 3.5 years).',
        'No mentioned experience with automated unit/E2E testing tools (Jest, Cypress, Playwright).',
        'Missing nice-to-have cloud (AWS) and containerization (Docker) background.'
      ],
      summary: 'Priya Sharma is a Partial Match for the Senior Full Stack Engineer role. While she displays good foundational skills in React, Node.js, Express, and PostgreSQL with 3.5 years of web development experience, she falls short of the required 5+ years senior threshold. Furthermore, her resume does not mention automated testing (Jest/Playwright) or cloud infrastructure tools.',
      recommendation: 'Partial Match',
      disclaimer: 'This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers.',
      fairnessAudit: {
        protectedAttributesFiltered: ['Age', 'Gender', 'Ethnicity', 'Marital Status'],
        isFairAndObjective: true,
        auditMessage: 'Candidate evaluated strictly against stated job requirements without assumption or personal attribute influence.'
      },
      evaluatedAt: '2026-07-24T09:16:00.000Z'
    }
  },
  {
    id: 'cand-103',
    name: 'David Kim',
    email: 'david.k@example.com',
    jobDescriptionId: 'jd-001',
    status: 'evaluated',
    createdAt: '2026-07-24T10:00:00.000Z',
    hrStage: 'New',
    notes: 'Junior profile (1 yr exp). Lacks required senior experience, TypeScript depth, and backend architecture.',
    resumeText: `DAVID KIM
Seattle, WA | david.k@example.com

OBJECTIVE
Entry-level Web Developer seeking a Junior Software Developer role.

EXPERIENCE
Junior Web Intern | Local Digital Agency | 2025 - Present (10 months)
- Maintained HTML/CSS and JavaScript files for client marketing websites.
- Created simple contact forms using PHP and HTML.
- Assisted with website content updates on WordPress.

EDUCATION
Associate Degree in Web Design | Seattle Community College (2024)

SKILLS
HTML5, CSS3, JavaScript (Basic), Bootstrap, WordPress, Git`,
    evaluation: {
      candidateName: 'David Kim',
      matchScore: 32,
      confidenceLevel: 'High',
      subScores: {
        requiredSkills: 25,
        relevantExperience: 20,
        education: 50,
        certifications: 30,
        projectsAndResponsibilities: 35
      },
      matchedRequirements: [
        'Basic JavaScript and Git version control'
      ],
      missingRequirements: [
        'Requires 5+ years of full stack software engineering experience (Candidate has 10 months intern experience)',
        'Proficiency in React 18+ and modern TypeScript (Not Mentioned)',
        'Backend development with Node.js / Express / NestJS (Not Mentioned)',
        'Database design with PostgreSQL / MongoDB (Not Mentioned)',
        'Automated testing tools Jest/Playwright/Cypress (Not Mentioned)',
        'Bachelor’s degree in Computer Science or Software Engineering (Candidate holds Associate degree in Web Design)',
        'Nice-to-haves: Docker, AWS, CI/CD, AWS Certification (Not Mentioned)'
      ],
      strengths: [
        'Has foundational exposure to HTML, CSS, JavaScript, and Git during a 10-month internship.'
      ],
      weaknesses: [
        'Significant experience gap: 10 months of intern experience vs. required 5+ years for a Senior role.',
        'Lacks proficiency in key target technologies: React, TypeScript, Node.js, Express, and PostgreSQL.',
        'No experience with testing, API architecture, or cloud platforms.'
      ],
      summary: 'David Kim is a Weak Match for the Senior Full Stack Engineer role. He possesses 10 months of entry-level web maintenance experience, which does not satisfy the 5+ years required for a Senior position. Key required technologies including React, TypeScript, Node.js, Express, and database engineering are missing from his background.',
      recommendation: 'Weak Match',
      disclaimer: 'This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers.',
      fairnessAudit: {
        protectedAttributesFiltered: ['Age', 'Gender', 'Ethnicity', 'Location'],
        isFairAndObjective: true,
        auditMessage: 'Candidate evaluated objectively based strictly on qualifications and experience provided.'
      },
      evaluatedAt: '2026-07-24T10:01:00.000Z'
    }
  },
  {
    id: 'cand-104',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    jobDescriptionId: 'jd-002',
    status: 'evaluated',
    createdAt: '2026-07-24T11:20:00.000Z',
    hrStage: 'Shortlisted',
    notes: 'Excellent candidate for Senior PMM. 5 yrs B2B SaaS experience, Pragmatic Institute certified, strong GTM metrics.',
    resumeText: `ELENA ROSTOVA
New York, NY | elena.rostova@example.com

SUMMARY
Senior Product Marketing Specialist with 5 years of experience leading go-to-market strategies, product launches, competitive positioning, and sales enablement for enterprise B2B SaaS solutions.

EXPERIENCE
Product Marketing Manager | SaaSify Cloud | 2022 - Present
- Directed 4 major product feature launches, increasing enterprise pipeline by 35% year-over-year.
- Developed comprehensive sales battlecards, pitch decks, and buyer persona documentation used by 40+ sales reps.
- Conducted customer interview programs and competitive win/loss analysis to refine core value propositions.
- Collaborated with growth marketing to execute multi-channel launch campaigns across webinars, email, and content.

Associate Product Marketing Specialist | Enterprise Hub | 2020 - 2022
- Authored product whitepapers, case studies, and product feature release notes.
- Analyzed campaign performance metrics using Google Analytics 4 and HubSpot CRM.

EDUCATION
B.A. in Marketing & Communications | New York University (2020)

CERTIFICATIONS & SKILLS
- Pragmatic Institute Certified Product Marketer (PMC-III)
- Skills: GTM Strategy, Competitive Intelligence, Copywriting, Sales Enablement, Customer Messaging
- Tools: Mixpanel, HubSpot, Salesforce, GA4, Figma, Notion`,
    evaluation: {
      candidateName: 'Elena Rostova',
      matchScore: 92,
      confidenceLevel: 'High',
      subScores: {
        requiredSkills: 95,
        relevantExperience: 92,
        education: 90,
        certifications: 95,
        projectsAndResponsibilities: 90
      },
      matchedRequirements: [
        '4+ years B2B SaaS product marketing experience (Candidate has 5 years)',
        'GTM strategy creation and multi-channel product launch execution',
        'Competitive intelligence & positioning matrix creation',
        'Sales enablement collateral (battlecards, pitch decks, buyer personas)',
        'Customer messaging and value proposition design',
        'Bachelor’s degree in Marketing & Communications',
        'Nice-to-have: Pragmatic Institute Product Marketing Certification',
        'Nice-to-have: Tools & analytics experience (Mixpanel, HubSpot, GA4)'
      ],
      missingRequirements: [
        'Direct SQL query writing experience (Not explicitly mentioned; uses Mixpanel/GA4 GUI interfaces)'
      ],
      strengths: [
        '5 years of directly relevant B2B SaaS product marketing experience with proven revenue and pipeline impact.',
        'Holds Pragmatic Institute Certification (PMC-III).',
        'Strong track record creating sales enablement battlecards and conducting customer win/loss research.',
        'Fluent with product marketing software stack (Mixpanel, HubSpot, Salesforce, GA4).'
      ],
      weaknesses: [
        'Resume does not explicitly mention writing SQL queries (uses product analytics tools via GUI).'
      ],
      summary: 'Elena Rostova is a Strong Match for the Senior Product Marketing Manager position. She brings 5 years of specialized B2B SaaS product marketing experience, exceeding the required 4 years. She demonstrates strong execution in GTM strategy, sales enablement, and messaging, and holds the preferred Pragmatic Institute Certification.',
      recommendation: 'Strong Match',
      disclaimer: 'This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers.',
      fairnessAudit: {
        protectedAttributesFiltered: ['Age', 'Gender', 'Nationality', 'Photo'],
        isFairAndObjective: true,
        auditMessage: 'Evaluated solely on professional qualifications, marketing achievements, and certifications.'
      },
      evaluatedAt: '2026-07-24T11:21:00.000Z'
    }
  },
  {
    id: 'cand-105',
    name: 'Jordan Vance',
    email: 'jordan.vance@example.com',
    jobDescriptionId: 'jd-003',
    status: 'evaluated',
    createdAt: '2026-07-24T13:00:00.000Z',
    hrStage: 'New',
    notes: 'Data Scientist with 7 yrs experience in LLMs and PyTorch. Note: Resume contained personal details (Age: 38, Photo attached) which were automatically filtered by HireLens fairness audit.',
    resumeText: `JORDAN VANCE
San Francisco, CA | jordan.vance@example.com
[Personal Information: Age 38 | Married | Photo attached]

SUMMARY
Lead Data Scientist with 7 years of experience developing machine learning models, fine-tuning Large Language Models (LLMs), and designing statistical experiment pipelines.

EXPERIENCE
Lead ML Scientist | AI Innovations Lab | 2021 - Present
- Architected and fine-tuned domain-adapted Transformer LLMs (Llama, Mistral) using PyTorch and HuggingFace.
- Built automated evaluation benchmarks and LLM alignment pipelines (RLHF, DPO).
- Optimized complex SQL queries on Snowflake database handling 100M+ data points daily.
- Designed A/B experimentation frameworks for model deployment scoring.

Data Scientist | DataCore Systems | 2018 - 2021
- Developed predictive NLP models and customer churn classifiers using Scikit-learn and Python.
- Built ETL pipelines using Databricks and SQL.

EDUCATION
Ph.D. in Computer Science (Artificial Intelligence Focus) | Stanford University (2018)

PUBLICATIONS & CERTIFICATIONS
- 2 First-author publications in NeurIPS and ACL on Transformer Attention Mechanisms
- Google Cloud Professional Data Engineer Certification
- Tools: Python, PyTorch, SQL, Databricks, Docker, Pinecone Vector DB`,
    evaluation: {
      candidateName: 'Jordan Vance',
      matchScore: 96,
      confidenceLevel: 'High',
      subScores: {
        requiredSkills: 98,
        relevantExperience: 96,
        education: 100,
        certifications: 95,
        projectsAndResponsibilities: 95
      },
      matchedRequirements: [
        '6+ years applied ML/Data Science experience (Candidate has 7 years)',
        'Deep Python expertise (PyTorch, HuggingFace, Scikit-learn)',
        'Hands-on fine-tuning and evaluation of Large Language Models (LLMs)',
        'Complex SQL query optimization and pipeline construction',
        'A/B experimentation and statistical testing',
        'Ph.D. in Computer Science (AI focus) from Stanford University',
        'Nice-to-have: Publications in top AI conferences (NeurIPS, ACL)',
        'Nice-to-have: Vector databases (Pinecone)',
        'Nice-to-have: Google Cloud Professional Data Engineer certification'
      ],
      missingRequirements: [],
      strengths: [
        '7 years of advanced applied machine learning and LLM fine-tuning experience.',
        'Holds a Ph.D. in Computer Science with focus on AI from Stanford University.',
        'Has first-author publications at top-tier AI conferences (NeurIPS, ACL).',
        'Possesses Google Cloud Professional Data Engineer certification and vector database expertise.'
      ],
      weaknesses: [],
      summary: 'Jordan Vance is a Strong Match for the Lead Data Scientist role, fully satisfying and exceeding all required qualifications. Jordan brings 7 years of ML/LLM engineering experience, holds a Ph.D. in Computer Science from Stanford with top-tier conference publications, and holds a GCP Professional Data Engineer certification. Note: Personal attributes found in the original document were ignored in accordance with HireLens fairness rules.',
      recommendation: 'Strong Match',
      disclaimer: 'This evaluation is intended only to assist recruiters during the screening process. It is not a hiring decision. Final hiring decisions should always be made by qualified human reviewers.',
      fairnessAudit: {
        protectedAttributesFiltered: ['Age (38)', 'Marital Status (Married)', 'Photo', 'Personal Info'],
        isFairAndObjective: true,
        auditMessage: 'Personal attributes (Age 38, Marital Status, Photo) present in source resume were detected and strictly excluded from evaluation scoring.'
      },
      evaluatedAt: '2026-07-24T13:01:00.000Z'
    }
  }
];
