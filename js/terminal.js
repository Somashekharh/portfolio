(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  const output = document.querySelector('[data-app="terminal"] [data-terminal-output]');
  const form = document.querySelector('[data-app="terminal"] [data-terminal-form]');
  const input = document.querySelector('[data-app="terminal"] [data-terminal-input]');
  if (!output || !form || !input) return;

  let greeted = false;
  let currentPath = 'C:\\PORTFOLIO';
  const profile = data.personal;

  function line(text = '', className = '') {
    const row = document.createElement('div');
    row.className = `terminal-line ${className}`.trim();
    row.textContent = String(text);
    output.append(row);
    output.scrollTop = output.scrollHeight;
  }

  function printGreeting() {
    if (greeted) return;
    greeted = true;
    line('Microsoft(R) Windows 95', 'accent');
    line('(C) Copyright Microsoft Corp. 1981-1995.', 'dim');
    line('Portfolio command shell — simulated commands only.', 'dim');
    line('Type HELP to see available commands.');
    line('');
  }

  function printProjects() {
    data.projects.forEach((project, index) => line(`${String(index + 1).padStart(2, '0')}  ${project.name} — ${project.subtitle}`));
  }

  function printSkills() {
    data.skills.forEach(group => line(`${group.category}: ${group.items.map(item => typeof item === 'string' ? item : `${item.name} (${item.level})`).join(', ')}`));
  }

  function printExperience() {
    (data.projectExperience || []).forEach(project => {
      const endNote = project.endDateNote ? ` (${project.endDateNote.toLowerCase()})` : '';
      line(`${project.name} (${project.startDate} – ${project.endDate}${endNote})`);
      line(`  ${project.description}`);
    });
    data.experience.forEach(entry => line(`${entry.company} — ${entry.role} (${entry.period})`));
  }

  function printEducation() {
    data.education.forEach(entry => line(`${entry.qualification} — ${entry.institution}, ${entry.period}, ${entry.result}`));
  }

  function printCertificates() {
    (data.training || []).forEach(item => line(`${item.name} — ${item.status || 'Completed training'}${item.issuer ? ` · ${item.issuer}` : ''}${item.date ? ` · ${item.date}` : ''}`));
    (data.learningInProgress || []).forEach(item => line(`${item.name} — ${item.provider ? `${item.provider} · ` : ''}${item.status || 'In progress'}`));
    data.certifications.forEach(cert => line(`${cert.name} — ${cert.issuer}, ${cert.date}`));
  }

  function printOracleTopics() {
    const sections = data.oracle.sections || [{ category: 'Topics', items: data.oracle.topics || [] }];
    sections.forEach(section => {
      line(`${section.category}:`, 'accent');
      section.items.forEach(topic => line(`  ${topic}`));
    });
  }

  function openLink(key) {
    const url = profile.links[key];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else line(`No ${key} URL is configured.`);
  }

  function showHelp() {
    [
      'Available commands:',
      '  help           show this command list',
      '  whoami         print the profile name and current focus',
      '  about          show the professional summary',
      '  projects       list selected projects',
      '  skills         list technical skills by category',
      '  experience     list experience entries',
      '  education      list education',
      '  certifications list training, learning in progress and credentials',
      '  oracle         show database administration topics',
      '  cybersecurity  show security focus areas',
      '  resume         open the résumé viewer',
      '  github         open the GitHub profile',
      '  linkedin       open the LinkedIn profile',
      '  contact        show professional contact links',
      '  dir            list items in the current portfolio folder',
      '  cd projects    change the simulated folder',
      '  open NAME      open a portfolio application',
      '  date / time    show local date or time',
      '  ver / version  show Portfolio 95 version',
      '  echo TEXT      print text',
      '  cls / clear    clear the screen',
      '  exit           minimize this window'
    ].forEach(item => line(item));
  }

  function run(raw) {
    const value = raw.trim();
    if (!value) return;
    line(`${currentPath}> ${value}`, 'accent');
    const parts = value.split(/\s+/);
    const command = parts.shift().toLowerCase();
    const argument = parts.join(' ');

    switch (command) {
      case 'help': showHelp(); break;
      case 'whoami':
        line(profile.name);
        line(profile.title);
        break;
      case 'about':
        line(data.experienceSummary.exposure);
        line(data.experienceSummary.interests);
        break;
      case 'projects': printProjects(); break;
      case 'skills': printSkills(); break;
      case 'experience': printExperience(); break;
      case 'education': printEducation(); break;
      case 'certifications':
      case 'certificates': printCertificates(); break;
      case 'oracle':
        line('Oracle DBA');
        printOracleTopics();
        break;
      case 'cybersecurity':
        line('Cybersecurity');
        line(data.skills.find(group => group.category === 'Cybersecurity')?.items.join(', ') || 'See the Skills application.');
        break;
      case 'resume':
        window.portfolioWindows?.open('resume');
        line('Opening Resume.pdf...');
        break;
      case 'github': openLink('github'); line('Opening GitHub...'); break;
      case 'linkedin': openLink('linkedin'); line('Opening LinkedIn...'); break;
      case 'contact':
        line(profile.location);
        line(`GitHub: ${profile.links.github}`);
        line(`LinkedIn: ${profile.links.linkedin}`);
        if (profile.email) line(`Email: ${profile.email}`);
        break;
      case 'dir':
      case 'ls':
        if (currentPath.endsWith('\\Projects')) printProjects();
        else ['Users', 'Projects', 'Resume.pdf', 'Certificates', 'Experience', 'Skills'].forEach(item => line(item));
        break;
      case 'cd': {
        const target = argument.trim().toLowerCase();
        if (!target || target === '\\' || target === '..' || target === '/') currentPath = 'C:\\PORTFOLIO';
        else if (target === 'projects' || target === 'projects\\') currentPath = 'C:\\PORTFOLIO\\Projects';
        else if (target === 'certificates') currentPath = 'C:\\PORTFOLIO\\Certificates';
        else if (target === 'experience') currentPath = 'C:\\PORTFOLIO\\Experience';
        else line(`The system cannot find the path specified: ${argument}`);
        updatePrompt();
        break;
      }
      case 'open': {
        const aliases = {
          'my computer': 'computer', explorer: 'computer', projects: 'projects', experience: 'experience', skills: 'skills',
          certificates: 'certificates', resume: 'resume', 'resume.pdf': 'resume', terminal: 'terminal', oracle: 'oracle',
          contact: 'contact', about: 'system', 'system properties': 'system', 'control panel': 'control', browser: 'browser'
        };
        const app = aliases[argument.toLowerCase()];
        if (app) { window.portfolioWindows?.open(app); line(`Opening ${argument}...`); }
        else line('Try OPEN ABOUT, PROJECTS, EXPERIENCE, SKILLS, CERTIFICATES, RESUME, ORACLE, CONTACT, or COMPUTER.');
        break;
      }
      case 'date': line(new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date())); break;
      case 'time': line(new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' }).format(new Date())); break;
      case 'ver':
      case 'version': line('Portfolio 95 [Version 2.0]'); break;
      case 'echo': line(argument); break;
      case 'cls':
      case 'clear':
        output.replaceChildren();
        return;
      case 'exit': window.portfolioWindows?.minimize('terminal'); break;
      case 'coffee.exe': line('Coffee service is not installed. Please hydrate responsibly.', 'dim'); break;
      case 'winver': line('Portfolio 95 — static browser experience, inspired by Microsoft Windows 95.'); break;
      default: line(`'${value.split(/\s+/)[0]}' is not recognized as an internal or external command. Type HELP for a list of commands.`, 'dim');
    }
    line('');
  }

  function updatePrompt() {
    const label = form.querySelector('label');
    if (label) label.textContent = `${currentPath}>`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    run(input.value);
    input.value = '';
    input.focus();
  });
  output.addEventListener('click', () => input.focus());
  window.addEventListener('portfolio:window-open', event => {
    if (event.detail?.id === 'terminal') {
      printGreeting();
      window.setTimeout(() => input.focus(), 0);
    }
  });
})();
