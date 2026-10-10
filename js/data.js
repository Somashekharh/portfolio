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
    email: 'somashekharh999@gmail.com',
    links: {
      github: 'https://github.com/Somashekharh',
      linkedin: 'https://www.linkedin.com/in/somashekharhiremath/',
      portfolio: 'https://somashekharh.github.io/portfolio/',
      textResume: 'resume.html'
    }
  },
  contact: {
    formspreeEndpoint: 'https://formspree.io/f/xzedbpnd'
  },
  seo: {
    title: 'Somashekhar Hiremath | Oracle DBA Portfolio',
    description: 'Somashekhar Hiremath — Oracle DBA and Cloud & Infrastructure Engineer. Explore experience, database skills, projects, education, and training.',
    keywords: 'Somashekhar Hiremath, Oracle DBA, Oracle Database 19c, Oracle Enterprise Manager, RMAN, Linux, cloud infrastructure, database modernization'
  },
  experienceSummary: {
    exposure: 'Technical background includes Oracle Database 19c, Oracle Enterprise Manager (OEM), SQL, RMAN, Data Guard concepts, Data Pump, Linux/Unix administration, Shell scripting, and Power BI.',
    interests: 'Strong interest in Oracle Database Administration, Linux, automation, DevOps, and Azure database administration, supported by continuous learning through technical courses and practical lab work.',
    technologies: ['Oracle Database 19c', 'OEM', 'SQL', 'RMAN', 'Data Guard concepts', 'Data Pump', 'Linux/Unix', 'Shell scripting', 'Power BI']
  },
  education: [
    {
      qualification: 'Bachelor of Computer Applications (BCA)',
      institution: 'KLE Society’s College of BCA, Belagavi',
      period: '2023–2025'
    },
    {
      qualification: 'Pre-University — PCMB',
      institution: 'Government PU College, Bailhongal',
      period: '2020–2022'
    }
  ],
  experience: [
    {
      id: 'ltm',
      company: 'LTM',
      role: 'Oracle DBA | Cloud & Infrastructure Engineer',
      period: 'Current',
      location: 'Mumbai, India',
      highlights: []
    },
    {
      id: 'systemtron',
      company: 'System Tron',
      role: 'Cybersecurity Intern',
      period: 'Mar 2025–Apr 2025',
      description: 'Hands-on cybersecurity internship covering network scanning, vulnerability assessment, controlled exploitation, incident response, system hardening and security practices.',
      highlights: [
        'Assessed 25+ endpoints and identified 10+ critical issues.',
        'Supported incident response and log analysis, improving detection by 15%.',
        'Simulated attacks and security configurations in a home lab.'
      ]
    },
    {
      id: 'deloitte',
      company: 'Deloitte Australia · Forage',
      role: 'Cybersecurity Virtual Experience',
      period: '2025',
      description: 'Completed a cybersecurity virtual experience program analyzing breach logs and documenting incident response.'
    }
  ],
  // Project assignments are distinct from employer and virtual experience
  // records above. Keep the source dates exactly as supplied.
  projectExperience: [
    {
      id: 'cis-fmb-app-dev-coe',
      name: 'CIS-FMB-App Dev COE',
      startDate: '20-Aug-2026',
      endDate: '20-Aug-2026',
      description: 'Cloud and infrastructure management engagement supporting application development and operational activities within the CIS-FMB App Dev Centre of Excellence.',
      contributions: [
        'Support Oracle database and infrastructure operational activities for assigned environments.',
        'Monitor database availability, storage utilization, sessions, alerts, listener connectivity, backup status, and general health using OEM and SQL checks.',
        'Assist with user access, role and privilege administration, account troubleshooting, and adherence to access-control procedures.',
        'Investigate incidents and service requests, document observations, provide status updates, and coordinate with application and infrastructure teams.',
        'Use Linux/Unix, SQL, Shell, and PowerShell utilities for troubleshooting and recurring operational checks.',
        'Maintain handover notes, technical documentation, and operational reports.'
      ]
    },
    {
      id: 'cis-fmb-alaska-modernization',
      name: 'CIS-FMB-Alaska Database Modernization',
      startDate: '11-Dec-2025',
      endDate: '31-Dec-2026',
      endDateNote: 'Scheduled end date',
      description: 'Database modernization engagement within Cloud & Infrastructure, supporting assessment, operational readiness, database administration, validation, coordination, and reporting activities for the Alaska environment.',
      contributions: [
        'Assist with database inventory, configuration review, readiness checks, and technical information collection for modernization activities.',
        'Support database health checks, capacity review, backup validation, connectivity verification, and pre-change or post-change validation.',
        'Coordinate with database, application, cloud, and infrastructure teams during planned modernization and change activities.',
        'Prepare SQL-based reports and structured updates covering database growth, backup, inventory, and operational observations.',
        'Follow incident, change, security, access-control, and documentation processes to support traceable delivery.',
        'Contribute to reusable scripts, checklists, and reporting templates to improve consistency and reduce manual effort.'
      ]
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
    { category: 'Database', items: [
      'Oracle Database 19c', 'Oracle SQL',
      'Oracle Enterprise Manager (OEM)', 'RMAN',
      'Data Guard concepts', 'Data Pump',
      'Backup and recovery', 'User and privilege management', 'Listener and connectivity troubleshooting'
    ] },
    { category: 'Operating Systems', items: ['Linux', 'Unix', 'RHEL', 'Ubuntu', 'Windows'] },
    { category: 'Automation and DevOps', items: ['Shell scripting', { name: 'Ansible', level: 'Basic' }, { name: 'Jenkins', level: 'Learning' }, 'SSH', 'Git and GitHub fundamentals', 'PL/SQL'] },
    { category: 'Reporting and Tools', items: ['Power BI', 'Excel', 'HTML reporting', 'SQL Developer', 'Toad', 'PuTTY', 'WinSCP', 'VS Code'] },
    { category: 'Service Management', items: ['Incident management', 'Change management', 'Production support', 'Operational reporting', 'Documentation', 'Stakeholder coordination'] },
    { category: 'Professional Skills', items: ['Troubleshooting', 'Ownership', 'Collaboration', 'Continuous learning', 'Security awareness', 'Attention to detail'] },
    { category: 'Languages', items: ['English', 'Hindi', 'Kannada'] },
    { category: 'Cybersecurity', items: ['Kali Linux', 'Nmap', 'Wireshark', 'Metasploit', 'IDS/IPS', 'VirusTotal', 'Vulnerability Assessment', 'Incident Response', 'Log Analysis'] },
    { category: 'Networking', items: ['TCP/IP', 'Subnetting', 'Firewalls'] },
    { category: 'Cloud and Virtualization', items: ['AWS', 'Azure', 'VMware', 'VirtualBox'] },
    { category: 'Programming', items: ['Python', 'Bash'] }
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
  training: [
    { name: 'Oracle Database Foundations', status: 'Completed training' },
    { name: 'Linux Fundamentals', issuer: 'Packt', date: 'Jan 2026', status: 'Completed training' },
    { name: 'Foundations of Oracle Database Administration', status: 'Completed training' },
    { name: 'Google Cybersecurity Specialization', issuer: 'Google', date: 'Apr 2024', status: 'Completed training' },
    { name: 'Fundamentals of Ansible', issuer: 'Red Hat', date: 'Jul 2026', status: 'Completed training' }
  ],
  learningInProgress: [
    { name: 'IBM Applied DevOps Engineering Specialization', provider: 'Coursera', status: 'In progress' },
    { name: 'Claude Certified Developer Foundations', provider: 'Preparatory', status: 'In progress' }
  ],
  certifications: [
    { name: 'LFS101: Introduction to Linux', issuer: 'The Linux Foundation', date: 'Dec 2025' },
    { name: 'Information Technology Fundamentals', issuer: 'IBM SkillsBuild', date: 'Jun 2025' },
    { name: 'Deloitte Australia - Cyber Job Simulation', issuer: 'Forage', date: 'May 2025' },
    { name: 'Computer Hardware Basics', issuer: 'Cisco', date: 'Apr 2024' },
    { name: 'Google IT Automation with Python Specialization', issuer: 'Google', date: 'Feb 2024' },
    { name: 'Introduction to Cybersecurity', issuer: 'Cisco', date: 'Jan 2024' },
    { name: 'MongoDB Basics - ICT Academy Learnathon', issuer: 'MongoDB', date: 'Oct 2023' }
  ],
  awards: [
    { name: 'Winner, Abhimanyu’s Cyber Vyuh — National IT Fest 2025, KLS Gogte College of Commerce' }
  ],
  resume: {
    file: 'resume/resume.pdf',
    htmlFile: 'resume.html',
    note: 'The PDF and text résumé contain the same recruiter-friendly résumé. Use the text version for the easiest screen-reader and ATS parsing.'
  },
  recycleBin: [
    { name: 'old_resume.doc', kind: 'document', note: 'A very early draft. Replaced by a much better version.' },
    { name: 'final_resume_final.doc', kind: 'document', note: 'The filename says final. It was not final.' },
    { name: 'bug_fixed_FINAL.js', kind: 'script', note: 'The bug was fixed. The file was not named well.' },
    { name: 'project_backup.zip', kind: 'archive', note: 'A reminder to keep backups somewhere sensible.' },
    { name: 'coffee.exe', kind: 'program', note: 'Not an actual beverage. Please do not run.' }
  ]
};
