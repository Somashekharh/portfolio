/* Application chrome and launch order live here; personal content lives in data.js. */
const portfolioData = window.PORTFOLIO_DATA;
const appWindow = (title, icon, defaultWidth, defaultHeight, minWidth, minHeight, status = 'Ready', extra = {}) => ({
  title, icon, defaultWidth, defaultHeight, minWidth, minHeight, status, ...extra
});

window.PORTFOLIO_APPS = {
  registry: {
    computer: appWindow('My Computer', 'computer.svg', 600, 390, 420, 300, '4 objects'),
    system: appWindow('System Properties', 'system.svg', 590, 450, 420, 330, 'Portfolio 95'),
    projects: appWindow('C:\\Projects', 'folder.svg', 720, 520, 440, 340, `${portfolioData.projects.length} objects`),
    experience: appWindow('C:\\Experience', 'document.svg', 690, 520, 430, 340, `${(portfolioData.projectExperience || []).length + portfolioData.experience.length} entries`),
    skills: appWindow('Control Panel — Skills', 'control.svg', 620, 470, 400, 320, `${portfolioData.skills.length} categories`),
    education: appWindow('Control Panel — Education', 'education.svg', 560, 410, 380, 300, `${portfolioData.education.length} objects`),
    certificates: appWindow('C:\\Certificates', 'certificate.svg', 710, 520, 440, 340, `${(portfolioData.training || []).length + (portfolioData.learningInProgress || []).length + portfolioData.certifications.length} items`),
    resume: appWindow('Resume.pdf — Résumé Viewer', 'document.svg', 740, 560, 430, 320, 'Ready'),
    feedback: appWindow('A Quick Question...', 'feedback.svg', 420, 260, 310, 210, 'Portfolio feedback', { dialog: true, modal: true, resizable: false }),
    contact: appWindow('Contact Me', 'mail.svg', 520, 440, 360, 340, 'Ready'),
    contactNotice: appWindow('Contact Me', 'mail.svg', 370, 190, 300, 160, 'Action required', { dialog: true, modal: true, resizable: false }),
    terminal: appWindow('MS-DOS Prompt', 'terminal.svg', 660, 420, 420, 300, 'MS-DOS'),
    oracle: appWindow('Oracle DBA', 'database.svg', 620, 440, 400, 300, 'Database administration'),
    browser: appWindow('Internet Explorer', 'browser.svg', 680, 480, 420, 300, 'Done'),
    githubExplorer: appWindow('GitHub Explorer', 'github.svg', 640, 470, 400, 300, `${portfolioData.repositories.length} repositories`),
    notepad: appWindow('README.txt — Notepad', 'notepad.svg', 560, 420, 360, 280, 'Ready'),
    control: appWindow('Control Panel', 'control.svg', 500, 360, 340, 270, '8 objects'),
    display: appWindow('Display Properties', 'display.svg', 440, 350, 320, 270, 'Settings saved locally'),
    recycle: appWindow('Recycle Bin', 'recycle.svg', 510, 350, 340, 270, `${portfolioData.recycleBin.length} objects`),
    projectDetail: appWindow('Project Properties', 'document.svg', 600, 470, 390, 320, 'Ready'),
    certificateDetail: appWindow('Certificate Details', 'certificate.svg', 480, 350, 320, 260, 'Credential details'),
    error: appWindow('Error', 'error.svg', 390, 210, 300, 180, 'Action required', { dialog: true, modal: true, resizable: false }),
    confirm: appWindow('Confirm Delete', 'recycle.svg', 410, 225, 300, 185, 'Confirm action', { dialog: true, modal: true, resizable: false }),
    newFolder: appWindow('New Folder', 'folder.svg', 390, 200, 300, 165, 'Create folder', { dialog: true, modal: true, resizable: false }),
    properties: appWindow('Properties', 'computer.svg', 460, 390, 340, 270, 'Application information', { dialog: true, modal: true, resizable: false }),
    shutdown: appWindow('Shut Down Windows', 'computer.svg', 420, 245, 340, 210, 'Ready', { dialog: true, modal: true, resizable: false }),
    run: appWindow('Run', 'computer.svg', 410, 205, 330, 180, 'Ready', { dialog: true, modal: true, resizable: false })
  },
  desktop: [
    { app: 'computer', label: 'My Computer' },
    { app: 'system', label: 'System Properties' },
    { app: 'projects', label: 'Projects' },
    { app: 'experience', label: 'Experience' },
    { app: 'skills', label: 'Skills' },
    { app: 'resume', label: 'Resume.pdf' },
    { external: 'textResume', label: 'Text Resume', icon: 'document.svg' },
    { app: 'certificates', label: 'Certificates' },
    { app: 'contact', label: 'Contact Me' },
    { external: 'github', label: 'GitHub', icon: 'github.svg' },
    { external: 'linkedin', label: 'LinkedIn', icon: 'linkedin.svg' },
    { app: 'terminal', label: 'MS-DOS Prompt' },
    { app: 'recycle', label: 'Recycle Bin' },
    { app: 'feedback', label: 'Rate My Setup' }
  ],
  start: [
    { label: 'Programs', children: [
      { app: 'browser', label: 'Internet Explorer' },
      { app: 'terminal', label: 'MS-DOS Prompt' },
      { app: 'notepad', label: 'Notepad' },
      { app: 'oracle', label: 'Oracle DBA' },
      { app: 'githubExplorer', label: 'GitHub Explorer' },
      { app: 'computer', label: 'My Computer' }
    ] },
    { label: 'Documents', children: [
      { app: 'resume', label: 'Resume.pdf' },
      { external: 'textResume', label: 'Text Resume', icon: 'document.svg' },
      { app: 'projects', label: 'Projects' },
      { app: 'certificates', label: 'Certificates' }
    ] },
    { label: 'Portfolio', children: [
      { app: 'system', label: 'About Me' },
      { app: 'experience', label: 'Experience' },
      { app: 'education', label: 'Education' },
      { app: 'skills', label: 'Skills' },
      { app: 'projects', label: 'Projects' },
      { app: 'contact', label: 'Contact Me' }
    ] },
    { label: 'Favorites', children: [
      { external: 'github', label: 'GitHub' },
      { external: 'linkedin', label: 'LinkedIn' }
    ] },
    { label: 'Settings', children: [
      { app: 'control', label: 'Control Panel' },
      { app: 'system', label: 'System Properties' },
      { app: 'display', label: 'Display Properties' }
    ] },
    { label: 'Help', children: [
      { app: 'notepad', label: 'Portfolio Help' }
    ] }
  ]
};

/* Properties metadata for the genuine portfolio apps. The dialog renderer reads
   these descriptors from the registry so shortcuts, windows, and taskbar items
   all show the same source of information. */
const appProperties = {
  computer: {
    name: 'My Computer',
    type: 'Portfolio environment', description: 'A Windows 95-style explorer for the portfolio and its professional content.',
    details: () => [['Owner', portfolioData.personal.name], ['Environment', 'Portfolio 95 simulation'], ['Folders', 'Projects, Experience, Skills, Certificates, Education']],
    actions: ['Browse portfolio folders', 'Open a document']
  },
  system: {
    name: 'System Properties',
    type: 'Profile application', description: 'Profile, work history, skills, education, and professional links.',
    details: () => [['Profile', portfolioData.personal.name], ['Experience records', String(portfolioData.experience.length + (portfolioData.projectExperience || []).length)], ['Sections', 'General, Professional, Skills, Education, Links']],
    actions: ['View profile sections', 'Open linked profiles']
  },
  projects: {
    name: 'Projects',
    type: 'Portfolio folder', description: 'Project summaries with descriptions, technologies, features, and source links.',
    details: () => [['Projects', String(portfolioData.projects.length)], ['Project names', portfolioData.projects.map(item => item.name).join(', ')], ['Technologies', [...new Set(portfolioData.projects.flatMap(item => item.technologies || []))].join(', ') || 'Listed per project']],
    actions: ['Open a project', 'View technologies', 'Visit a source repository']
  },
  experience: {
    name: 'Experience',
    type: 'Career information', description: 'Professional roles and project assignments supplied for this portfolio.',
    details: () => [['Work and experience records', String(portfolioData.experience.length)], ['Project assignments', String((portfolioData.projectExperience || []).length)], ['Current role', portfolioData.experience.find(item => item.period === 'Current')?.role || 'See experience records']],
    actions: ['Review roles', 'Review project assignments']
  },
  skills: {
    name: 'Skills',
    type: 'Skills overview', description: 'Technical skills grouped into the categories in the portfolio data.',
    details: () => [['Categories', String(portfolioData.skills.length)], ['Skill count', String(portfolioData.skills.reduce((sum, category) => sum + category.items.length, 0))], ['Categories listed', portfolioData.skills.map(item => item.category).join(', ')], ['Ratings', 'No proficiency percentages']],
    actions: ['Browse skill categories']
  },
  education: {
    name: 'Education',
    type: 'Education records', description: 'Education history and qualifications from the supplied résumé.',
    details: () => [['Qualifications', String(portfolioData.education.length)], ['Institutions', portfolioData.education.map(item => item.institution).join('; ')], ['Records', portfolioData.education.map(item => `${item.qualification} (${item.period})`).join('; ') ]],
    actions: ['Review education history']
  },
  certificates: {
    name: 'Certificates',
    type: 'Training and credentials folder', description: 'Completed training, learning in progress, and listed credentials.',
    details: () => [['Completed training', String((portfolioData.training || []).length)], ['Learning in progress', String((portfolioData.learningInProgress || []).length)], ['Other credentials', String(portfolioData.certifications.length)]],
    actions: ['Review training', 'Open credential details', 'Verify a credential when a link is available']
  },
  resume: {
    name: 'Resume.pdf',
    type: 'Résumé viewer', description: 'Provides the PDF résumé and an ATS-friendly text résumé.',
    details: () => [['PDF file', portfolioData.resume.file], ['Text résumé', portfolioData.resume.htmlFile], ['PDF availability', 'Configured']],
    actions: ['Open PDF', 'Open text résumé', 'Download PDF']
  },
  feedback: {
    name: 'Rate My Setup',
    type: 'Portfolio feedback dialog', description: 'Sends one optional portfolio rating to Formspree.',
    details: () => [['Submission endpoint', portfolioData.contact.formspreeEndpoint], ['Timed prompt', 'After 45 seconds of active viewing'], ['Submission status', 'Available in this browser session']],
    actions: ['Submit a positive or negative rating']
  },
  contact: {
    name: 'Contact Me',
    type: 'Contact form', description: 'A Formspree contact form with direct email and profile links.',
    details: () => [['Form endpoint', portfolioData.contact.formspreeEndpoint], ['Email', portfolioData.personal.email], ['Links', 'GitHub, LinkedIn']],
    actions: ['Send a message', 'Open email', 'Visit professional profiles']
  },
  terminal: {
    name: 'MS-DOS Prompt',
    type: 'Portfolio simulation', description: 'A simulated MS-DOS prompt for exploring portfolio commands; it does not access the visitor’s operating system.',
    details: () => [['Environment', 'Browser-based simulation'], ['Data access', 'Portfolio content only'], ['Commands', 'HELP lists available commands']],
    actions: ['Run a portfolio command', 'Open listed portfolio apps']
  },
  oracle: {
    name: 'Oracle DBA',
    type: 'Technical information app', description: 'An overview of Oracle database topics and experience represented in the portfolio.',
    details: () => [['Sections', String((portfolioData.oracle.sections || []).length)], ['Topics', String((portfolioData.oracle.sections || []).reduce((sum, section) => sum + section.items.length, 0))], ['Database projects', String((portfolioData.oracle.projects || []).length)]],
    actions: ['Review Oracle DBA topics', 'Open related portfolio projects']
  },
  browser: {
    name: 'Internet Explorer',
    type: 'Portfolio browser simulation', description: 'A browser-style window that launches the portfolio’s working local and external links.',
    details: () => [['Environment', 'Browser-based simulation'], ['External links', ['GitHub', 'LinkedIn'].filter(key => portfolioData.personal.links[key]).join(', ')], ['Local pages', 'Projects, résumé']],
    actions: ['Open a portfolio destination', 'Open an external profile']
  },
  githubExplorer: {
    name: 'GitHub Explorer',
    type: 'Repository browser', description: 'Lists public repositories configured in the portfolio data.',
    details: () => [['Repositories', String(portfolioData.repositories.length)], ['Profile', portfolioData.personal.links.github]],
    actions: ['Open a public repository']
  },
  notepad: {
    name: 'Notepad',
    type: 'Read-only portfolio notes', description: 'A built-in Notepad-style summary of the portfolio and its navigation.',
    details: () => [['Content', 'Portfolio README'], ['Editing', 'Read-only']],
    actions: ['Read the portfolio overview', 'Use HELP in the simulated terminal']
  },
  control: {
    name: 'Control Panel',
    type: 'Portfolio control panel', description: 'Shortcuts to portfolio information and browser-based display preferences.',
    details: () => [['Shortcuts', 'Display, System, Education, Skills, Oracle DBA, Browser, Recycle Bin'], ['Configuration', 'Stored locally in this browser']],
    actions: ['Open a control panel shortcut', 'Change display preferences']
  },
  display: {
    name: 'Display Properties',
    type: 'Display preferences', description: 'Changes visual preferences for this portfolio and stores them in this browser.',
    details: () => [['Options', 'Theme, clock format, scanlines, pixel texture, sound'], ['Storage', 'Browser local storage']],
    actions: ['Adjust preferences', 'Apply changes']
  },
  recycle: {
    name: 'Recycle Bin',
    type: 'Portfolio recycle bin', description: 'A browser-only list for project folders removed from the Projects view.',
    details: () => [['Items', String(portfolioData.recycleBin.length)], ['Storage', 'Current portfolio session']],
    actions: ['Restore an item', 'Permanently delete an item']
  },
  projectDetail: {
    type: 'Project details', description: 'Project description, technologies, features, and available repository links.',
    details: () => [['Source', 'Projects in portfolio data'], ['Status', 'Details open in this window']],
    actions: ['Review project details', 'Visit its repository when available']
  },
  certificateDetail: {
    type: 'Credential details', description: 'Credential issuer, date, details, and verification link when supplied.',
    details: () => [['Source', 'Certificates in portfolio data'], ['Verification', 'Only shown when a URL is provided']],
    actions: ['Review credential details', 'Verify when a link is available']
  }
};

Object.entries(appProperties).forEach(([id, properties]) => {
  const app = window.PORTFOLIO_APPS.registry[id];
  if (app) Object.assign(app, { id, name: app.title, ...properties });
});
