/*
 * Portfolio facts and links. Edit this file to update the applications.
 * Credentials without a supplied verification URL are shown without a fake link.
 */
window.PORTFOLIO_DATA = {
  personal: {
    name: 'Somashekhar Hiremath',
    initials: 'SH',
    profileImage: 'assets/profile/somashekhar.jpg',
    username: 'Somashekhar',
    title: 'Oracle DBA | Cloud & Infrastructure Engineer',
    location: 'Mumbai Metropolitan Region, India',
    summary: 'Oracle DBA and cloud/infrastructure professional with a cybersecurity and IT support foundation. Hands-on experience includes vulnerability assessment, log analysis, Linux, networking and virtualized security labs, with continued learning across databases, cloud and security.',
    email: 'somashekharh999@gmail.com',
    links: {
      github: 'https://github.com/Somashekharh',
      linkedin: 'https://www.linkedin.com/in/somashekharhiremath/',
      portfolio: 'https://somashekharh.github.io/portfolio/'
    }
  },
  contact: {
    formspreeEndpoint: 'https://formspree.io/f/xzedbpnd',
    email: 'somashekharh999@gmail.com',
    github: 'https://github.com/Somashekharh',
    linkedin: 'https://www.linkedin.com/in/somashekharhiremath/'
  },
  seo: {
    title: 'Somashekhar Hiremath | Portfolio 95',
    description: "Explore Somashekhar Hiremath's work in Oracle database administration, cloud infrastructure and cybersecurity inside an interactive Windows 95 desktop.",
    keywords: 'Somashekhar Hiremath, Oracle DBA, cloud infrastructure, cybersecurity, portfolio'
  },
  education: [
    {
      qualification: 'Bachelor of Computer Applications',
      institution: "KLE Society's College of BCA, RLSI, Belagavi",
      period: '2023–2025',
      result: '87.13% on LinkedIn; the resume summary in the supplied brief says 87.1%.',
      resultNote: 'The two supplied source summaries differ slightly.'
    },
    {
      qualification: 'Pre-University · PCMB',
      institution: 'Government PU College, Bailhongal',
      period: '2020–2022',
      result: '81%'
    }
  ],
  experience: [
    {
      id: 'ltm',
      company: 'LTM',
      role: 'Oracle DBA | Cloud & Infrastructure Engineer',
      period: 'Current',
      location: 'Mumbai, India',
      description: 'Current professional direction in Oracle database administration and cloud & infrastructure engineering, listed on the public profile.',
      highlights: []
    },
    {
      id: 'systemtron',
      company: 'SystemTron',
      role: 'Cybersecurity Intern',
      period: 'Internship',
      description: 'Hands-on cybersecurity internship covering network scanning, vulnerability assessment, controlled exploitation, incident response, system hardening and security practices.',
      highlights: [
        'Assessed 25+ endpoints and identified 10+ critical issues, as stated in the supplied resume summary.',
        'Worked with incident response, log analysis and home-lab security configuration.'
      ]
    },
    {
      id: 'deloitte',
      company: 'Deloitte Australia · Forage',
      role: 'Cybersecurity Virtual Experience',
      period: 'Job simulation',
      description: 'Reviewed web activity logs, supported a simulated cybersecurity breach response, and identified suspicious user activity.'
    }
  ],
  projects: [
    {
      id: 'phishnet',
      name: 'PhishNet',
      subtitle: 'Phishing URL detector',
      description: 'A Django web application that analyzes URLs for phishing risk using a Random Forest model. Includes secure login, a scan dashboard, PDF reports and admin controls.',
      technologies: ['Python', 'Django', 'Random Forest', 'Machine Learning'],
      features: ['Phishing URL analysis', 'Secure user login', 'Scan dashboard', 'PDF report generation'],
      metric: '92% accuracy, as stated in the supplied resume summary.',
      github: 'https://github.com/Somashekharh/PhishNet',
      category: 'Cybersecurity'
    },
    {
      id: 'home-lab',
      name: 'Cybersecurity Home Lab',
      subtitle: 'VMware virtual lab',
      description: 'A controlled virtual environment for practicing network reconnaissance, vulnerability assessment, packet analysis and system hardening.',
      technologies: ['VMware', 'Kali Linux', 'Metasploitable 2', 'Windows 10', 'Nmap', 'Metasploit', 'Wireshark'],
      features: ['Isolated virtual machines', 'Authorized vulnerability testing', 'Windows and Linux practice', 'Security hardening'],
      category: 'Security lab'
    },
    {
      id: 'security-tools',
      name: 'Cybersecurity Tools & Scripts',
      subtitle: 'Small defensive utilities',
      description: 'A set of beginner security projects: a password strength checker, a port scanner for systems you are authorized to assess, and a phishing website detector that can use reputation APIs.',
      technologies: ['Python', 'Sockets', 'VirusTotal API'],
      features: ['Password strength feedback', 'Authorized port scanning', 'Phishing URL checks'],
      github: 'https://github.com/Somashekharh/Cybersecurity-Projects',
      category: 'Cybersecurity'
    },
    {
      id: 'studybot',
      name: 'StudyBot AI',
      subtitle: 'AI learning assistant',
      description: 'A Streamlit study assistant powered by Google Gemini. It answers academic questions and explains complex concepts in simpler language.',
      technologies: ['Python', 'Streamlit', 'Google Gemini API'],
      features: ['Academic Q&A', 'Concept simplification', 'Responsive study interface'],
      github: 'https://github.com/Somashekharh/StudyBot',
      category: 'AI project'
    },
    {
      id: 'gadgethub',
      name: 'Ethical-Hacking-GadgetHub',
      subtitle: 'Hardware security research',
      description: 'Documentation for hardware-based security research using a Raspberry Pi Pico and ESP8266. Experiments are framed for isolated, authorized testing and resilience evaluation.',
      technologies: ['Raspberry Pi Pico', 'ESP8266', 'CircuitPython'],
      features: ['Controlled lab demonstrations', 'Access point resilience evaluation', 'Setup and configuration notes'],
      github: 'https://github.com/Somashekharh/Ethical-Hacking-GadgetHub',
      category: 'Security research'
    }
  ],
  repositories: [
    { name: 'Cybersecurity-Projects', description: 'Password strength checker, port scanner and phishing website detector.', url: 'https://github.com/Somashekharh/Cybersecurity-Projects' },
    { name: 'PhishNet', description: 'Django and Random Forest phishing URL detection application.', url: 'https://github.com/Somashekharh/PhishNet' },
    { name: 'StudyBot', description: 'Streamlit learning assistant powered by the Gemini API.', url: 'https://github.com/Somashekharh/StudyBot' },
    { name: 'Ethical-Hacking-GadgetHub', description: 'Hardware security research notes and controlled lab projects.', url: 'https://github.com/Somashekharh/Ethical-Hacking-GadgetHub' },
    { name: 'portfolio', description: 'Personal portfolio website repository.', url: 'https://github.com/Somashekharh/portfolio' }
  ],
  skills: [
    { category: 'Database', items: ['Oracle Database', 'SQL', 'PL/SQL', 'RMAN', 'Database Administration'] },
    { category: 'Cybersecurity', items: ['Nmap', 'Wireshark', 'Metasploit', 'IDS/IPS', 'VirusTotal', 'Vulnerability Assessment', 'Incident Response', 'Log Analysis'] },
    { category: 'Linux', items: ['Linux', 'Kali Linux', 'Ubuntu', 'Bash'] },
    { category: 'Networking', items: ['TCP/IP', 'Subnetting', 'Firewalls', 'Wi-Fi'] },
    { category: 'Programming', items: ['Python', 'Bash', 'SQL', 'JavaScript'] },
    { category: 'Virtualization', items: ['VMware', 'VirtualBox'] },
    { category: 'Cloud', items: ['AWS', 'Azure', 'Oracle Cloud Infrastructure'] },
    { category: 'Tools', items: ['Git', 'GitHub', 'AnyDesk'] }
  ],
  oracle: {
    overview: 'Oracle DBA and cloud infrastructure are the current professional direction shown on the supplied LinkedIn profile.',
    sections: [
      { category: 'Architecture', items: ['Oracle Database Architecture'] },
      { category: 'SQL', items: ['SQL'] },
      { category: 'PL/SQL', items: ['PL/SQL'] },
      { category: 'RMAN', items: ['RMAN'] },
      { category: 'Backup & Recovery', items: ['Backup & Recovery'] },
      { category: 'Performance', items: ['Performance'] },
      { category: 'Monitoring', items: ['Monitoring'] },
      { category: 'Administration', items: ['Database Administration'] }
    ],
    projects: []
  },
  certifications: [
    { name: 'Fundamentals of Ansible', issuer: 'Red Hat', date: 'Jul 2026' },
    { name: 'Linux Fundamental', issuer: 'Packt', date: 'Jan 2026' },
    { name: 'LFS101: Introduction to Linux', issuer: 'The Linux Foundation', date: 'Dec 2025' },
    { name: 'Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate', issuer: 'Oracle', date: '2025' },
    { name: 'Information Technology Fundamentals', issuer: 'IBM SkillsBuild', date: 'Jun 2025' },
    { name: 'Deloitte Australia - Cyber Job Simulation', issuer: 'Forage', date: 'May 2025' },
    { name: 'Computer Hardware Basics', issuer: 'Cisco', date: 'Apr 2024' },
    { name: 'Google Cybersecurity Specialization', issuer: 'Google', date: 'Apr 2024' },
    { name: 'Google IT Automation with Python Specialization', issuer: 'Google', date: 'Feb 2024' },
    { name: 'Introduction to Cybersecurity', issuer: 'Cisco', date: 'Jan 2024' },
    { name: 'MongoDB Basics - ICT Academy Learnathon', issuer: 'MongoDB', date: 'Oct 2023' }
  ],
  awards: [
    { name: 'National cybersecurity competition award' }
  ],
  resume: {
    file: 'resume/resume.pdf',
    note: 'This portfolio PDF is a concise summary assembled from the supplied brief and public profile. Replace it with the original resume PDF when available.'
  },
  recycleBin: [
    { name: 'old_resume.doc', kind: 'document', note: 'A very early draft. Replaced by a much better version.' },
    { name: 'final_resume_final.doc', kind: 'document', note: 'The filename says final. It was not final.' },
    { name: 'bug_fixed_FINAL.js', kind: 'script', note: 'The bug was fixed. The file was not named well.' },
    { name: 'project_backup.zip', kind: 'archive', note: 'A reminder to keep backups somewhere sensible.' },
    { name: 'coffee.exe', kind: 'program', note: 'Not an actual beverage. Please do not run.' }
  ]
};
