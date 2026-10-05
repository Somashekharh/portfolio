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
    experience: appWindow('C:\\Experience', 'document.svg', 690, 520, 430, 340, `${portfolioData.experience.length} objects`),
    skills: appWindow('Control Panel — Skills', 'control.svg', 620, 470, 400, 320, `${portfolioData.skills.length} categories`),
    education: appWindow('Control Panel — Education', 'education.svg', 560, 410, 380, 300, `${portfolioData.education.length} objects`),
    certificates: appWindow('C:\\Certificates', 'certificate.svg', 710, 520, 440, 340, `${portfolioData.certifications.length} objects`),
    resume: appWindow('Resume.pdf — Acrobat Reader', 'document.svg', 740, 560, 430, 320, 'Ready'),
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
    error: appWindow('Error', 'computer.svg', 390, 210, 300, 180, 'Action required', { dialog: true, modal: true, resizable: false }),
    confirm: appWindow('Confirm Delete', 'recycle.svg', 410, 225, 300, 185, 'Confirm action', { dialog: true, modal: true, resizable: false }),
    newFolder: appWindow('New Folder', 'folder.svg', 390, 200, 300, 165, 'Create folder', { dialog: true, modal: true, resizable: false }),
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
    { app: 'certificates', label: 'Certificates' },
    { app: 'contact', label: 'Contact Me' },
    { external: 'github', label: 'GitHub', icon: 'github.svg' },
    { external: 'linkedin', label: 'LinkedIn', icon: 'linkedin.svg' },
    { app: 'terminal', label: 'MS-DOS Prompt' },
    { app: 'recycle', label: 'Recycle Bin' }
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
