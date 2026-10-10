(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  const appConfig = window.PORTFOLIO_APPS;
  const desktop = document.querySelector('#desktop');
  const iconRoot = document.querySelector('[data-desktop-icons]');
  const menuRoot = document.querySelector('[data-start-items]');
  const contextMenu = document.querySelector('[data-context-menu]');
  const profile = data.personal;
  const sourceLinks = profile.links;
  const feedbackStorageKey = 'portfolio95-feedback-submitted';
  const initials = profile.initials || profile.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const currentExperience = data.experience.find(entry => entry.period === 'Current') || data.experience[0] || null;
  const userDirectory = profile.username || profile.name.split(/\s+/)[0];
  const userFolderPath = `C:\\Users\\${userDirectory}`;
  const githubHandle = (() => {
    try { return new URL(sourceLinks.github).pathname.split('/').filter(Boolean)[0] || userDirectory; }
    catch (_) { return userDirectory; }
  })();
  const githubLabel = `github.com/${githubHandle}`;

  document.title = data.seo?.title || `${profile.name} | Portfolio 95`;
  document.querySelector('meta[name="author"]')?.setAttribute('content', profile.name);
  document.querySelector('meta[name="description"]')?.setAttribute('content', data.seo?.description || data.experienceSummary.exposure);
  document.querySelector('meta[name="keywords"]')?.setAttribute('content', data.seo?.keywords || 'portfolio');
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', data.seo?.description || data.experienceSummary.exposure);
  document.querySelector('[data-boot-credit]').textContent = profile.name;
  const timers = [];
  let contextTarget = null;
  let propertiesTarget = null;
  let explorerPath = 'My Computer';
  let explorerHistory = ['My Computer'];
  let deletedProjectIds = new Set();
  let recycleItems = [...data.recycleBin];
  let virtualFolders = [];
  let selectedCertificateIndex = 0;
  let errorMessage = 'The requested item could not be opened.';
  let errorTitle = 'Error';
  let unavailableErrorIndex = 0;
  let lastUnavailableErrorAt = 0;
  let contactNotice = { title: 'Contact Me', message: '', symbol: '!' };
  let contactInvalidControl = null;
  let resumeCheckPending = false;
  let pendingDelete = null;
  let feedbackSubmitted = (() => {
    try { return sessionStorage.getItem(feedbackStorageKey) === 'yes'; }
    catch (_) { return false; }
  })();
  let feedbackPromptSeen = false;
  let feedbackTimer = null;
  let feedbackActiveMs = 0;
  let feedbackLastTick = Date.now();
  let feedbackRequestInFlight = false;

  function node(tag, className = '', text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined && text !== null) item.textContent = String(text);
    return item;
  }

  function icon(name, className = '') {
    const image = node('img', className);
    image.src = `assets/icons/${name}`;
    image.alt = '';
    return image;
  }

  function button(label, className = 'classic-button', attrs = {}) {
    const item = node('button', className, label);
    item.type = 'button';
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'dataset') Object.entries(value).forEach(([dataKey, dataValue]) => { item.dataset[dataKey] = dataValue; });
      else if (key === 'disabled') item.disabled = Boolean(value);
      else item.setAttribute(key, value);
    });
    return item;
  }

  function externalLink(label, key, className = 'contact-link') {
    const url = sourceLinks[key];
    if (!url) return null;
    const link = node('a', className);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(icon(`${key}.svg`), node('span', '', label));
    return link;
  }

  function explorerToolbar(address, includeNavigation = false) {
    const root = node('div', 'window-toolbar explorer-toolbar');
    if (includeNavigation) root.append(
      button('Back', 'toolbar-button', { dataset: { explorerAction: 'back' }, 'aria-label': 'Go back' }),
      button('Up', 'toolbar-button', { dataset: { explorerAction: 'up' }, 'aria-label': 'Go up one folder' }),
      button('Home', 'toolbar-button', { dataset: { explorerAction: 'home' }, 'aria-label': 'Go to My Computer' })
    );
    const addressRow = node('div', 'address-row');
    addressRow.append(node('label', '', 'Address'), icon('folder.svg'));
    const field = node('div', 'address-field', address);
    field.dataset.explorerAddress = '';
    addressRow.append(field);
    root.append(addressRow);
    return root;
  }

  function explorerPane(path) {
    const pane = node('div', 'window-body explorer-pane');
    pane.dataset.explorerItems = '';
    pane.dataset.explorerPath = path;
    return pane;
  }

  function explorerAppRoot(path, includeNavigation = false) {
    const root = node('div', 'app-root explorer-app');
    root.append(explorerToolbar(path, includeNavigation));
    return root;
  }

  function makeExplorerWindow(path, status) {
    const root = explorerAppRoot(path, true);
    root.append(explorerPane(path));
    const statusBar = node('div', 'window-status');
    statusBar.append(node('span', '', status), node('span', '', path));
    root.append(statusBar);
    return root;
  }

  function addIconItem(container, item) {
    const itemNode = button('', 'explorer-item');
    itemNode.dataset.explorerItem = '';
    itemNode.append(icon(item.icon));
    itemNode.append(node('span', '', item.name));
    if (item.detail) itemNode.append(node('small', '', item.detail));
    if (item.route) itemNode.dataset.explorerRoute = item.route;
    if (item.app) itemNode.dataset.explorerApp = item.app;
    if (item.external) itemNode.dataset.explorerExternal = item.external;
    if (item.project) itemNode.dataset.openProject = item.project;
    if (item.certificate !== undefined) itemNode.dataset.openCertificate = String(item.certificate);
    if (item.context) {
      itemNode.dataset.contextFile = '';
      itemNode.dataset.contextType = item.context.type;
      itemNode.dataset.contextId = item.context.id || '';
      itemNode.dataset.contextLabel = item.name;
    }
    container.append(itemNode);
  }

  const projectById = id => data.projects.find(project => project.id === id);

  function explorerItems(path) {
    const appItem = (name, iconName, app) => ({ name, icon: iconName, app });
    const routeItem = (name, iconName, route, detail = '') => ({ name, icon: iconName, route, detail });
    const externalItem = (name, iconName, external) => ({ name, icon: iconName, external });
    if (path === 'My Computer') return [
      routeItem('Local Disk (C:)', 'drive.svg', 'C:\\'),
      routeItem('Data (D:)', 'drive.svg', 'D:\\'),
      routeItem('Network Neighborhood', 'network.svg', 'Network'),
      appItem('Control Panel', 'control.svg', 'control')
    ];
    if (path === 'C:\\') return [
      routeItem('Users', 'folder.svg', 'C:\\Users'),
      routeItem('Projects', 'folder.svg', 'C:\\Projects', `${data.projects.length} project folders`),
      appItem('Resume.pdf', 'document.svg', 'resume'),
      routeItem('Certificates', 'folder.svg', 'C:\\Certificates', `${(data.training || []).length + (data.learningInProgress || []).length + data.certifications.length} items`),
      routeItem('Experience', 'folder.svg', 'C:\\Experience', `${(data.projectExperience || []).length + data.experience.length} entries`),
      routeItem('Skills', 'folder.svg', 'C:\\Skills', `${data.skills.length} categories`),
      ...virtualFolders.map(folder => routeItem(folder, 'folder.svg', `C:\\${folder}`))
    ];
    if (path === 'C:\\Users') return [routeItem(userDirectory, 'person.svg', userFolderPath)];
    if (path === userFolderPath) return [
      appItem('About Me', 'person.svg', 'system'),
      appItem('Career', 'document.svg', 'experience'),
      routeItem('Projects', 'folder.svg', 'C:\\Projects'),
      appItem('Skills', 'control.svg', 'skills'),
      appItem('Experience', 'document.svg', 'experience'),
      routeItem('Certificates', 'folder.svg', 'C:\\Certificates'),
      appItem('Resume.pdf', 'document.svg', 'resume')
    ];
    if (path === 'C:\\Projects') return data.projects.filter(project => !deletedProjectIds.has(project.id)).map(project => ({
      name: project.name,
      icon: 'folder.svg',
      project: project.id,
      context: { type: 'project', id: project.id }
    }));
    if (path === 'C:\\Certificates') return [
      ...(data.training || []).map(item => ({ name: item.name, icon: 'document.svg', detail: 'Completed training', app: 'certificates' })),
      ...(data.learningInProgress || []).map(item => ({ name: item.name, icon: 'notepad.svg', detail: item.status || 'In progress', app: 'certificates' })),
      ...data.certifications.map((cert, index) => ({
        name: cert.name,
        icon: 'certificate.svg',
        detail: [cert.issuer, cert.date].filter(Boolean).join(' · '),
        certificate: index,
        context: { type: 'certificate', id: String(index) }
      }))
    ];
    if (path === 'C:\\Experience') return [
      ...(data.projectExperience || []).map(project => ({ name: project.name, icon: 'document.svg', detail: `${project.startDate} — ${project.endDate}`, app: 'experience' })),
      ...data.experience.map(entry => ({
      name: entry.company,
      icon: 'document.svg',
      detail: entry.role,
      app: 'experience',
      context: { type: 'experience', id: entry.id }
      }))
    ];
    if (path === 'C:\\Skills') return data.skills.map(category => ({ name: category.category, icon: 'control.svg', app: 'skills' }));
    if (path.startsWith('C:\\') && virtualFolders.includes(path.slice(3))) return [];
    if (path === 'D:\\') return [
      externalItem('GitHub', 'github.svg', 'github'),
      externalItem('LinkedIn', 'linkedin.svg', 'linkedin'),
      appItem('Internet Explorer', 'browser.svg', 'browser')
    ];
    if (path === 'Network') return [
      externalItem('GitHub profile', 'github.svg', 'github'),
      externalItem('LinkedIn profile', 'linkedin.svg', 'linkedin'),
      appItem(`Current professional profile · ${currentExperience?.company || profile.name}`, 'system.svg', 'system')
    ];
    return [];
  }

  function renderExplorer(path, pushHistory = true) {
    explorerPath = path;
    if (pushHistory && explorerHistory.at(-1) !== path) explorerHistory.push(path);
    const pane = document.querySelector('[data-explorer-items]');
    if (!pane) return;
    pane.dataset.explorerPath = path;
    pane.replaceChildren();
    const heading = node('h2', 'explorer-heading', path === 'My Computer' ? 'My Computer' : path);
    pane.append(heading);
    const grid = node('div', 'explorer-icons');
    const items = explorerItems(path);
    items.forEach(item => addIconItem(grid, item));
    if (!items.length) grid.append(node('p', 'empty-copy', 'This folder is empty.'));
    pane.append(grid);
    const address = document.querySelector('[data-explorer-address]');
    if (address) address.textContent = path;
    const status = document.querySelector('[data-app="computer"] .window-status span:first-child');
    if (status) status.textContent = `${items.length} object${items.length === 1 ? '' : 's'}`;
    const trailing = document.querySelector('[data-app="computer"] .window-status span:last-child');
    if (trailing) trailing.textContent = path;
    const back = document.querySelector('[data-app="computer"] [data-explorer-action="back"]');
    const up = document.querySelector('[data-app="computer"] [data-explorer-action="up"]');
    if (back) back.disabled = explorerHistory.length <= 1;
    if (up) up.disabled = path === 'My Computer';
  }

  function renderDesktopIcons() {
    iconRoot.replaceChildren();
    appConfig.desktop.forEach(shortcut => {
      const wrapper = node('div', 'desktop-shortcut');
      wrapper.dataset.shortcutLabel = shortcut.label;
      const item = button('', 'desktop-icon');
      item.dataset.shortcut = '';
      item.dataset.shortcutType = shortcut.app ? 'app' : 'external';
      if (shortcut.app) item.dataset.shortcutApp = shortcut.app;
      if (shortcut.external) item.dataset.shortcutExternal = shortcut.external;
      const app = shortcut.app && appConfig.registry[shortcut.app];
      item.append(icon(shortcut.icon || app?.icon || 'folder.svg'));
      item.append(node('span', '', shortcut.label));
      const menu = button('⋮', 'shortcut-menu-button', {
        dataset: { shortcutMenu: '' },
        'aria-label': `More options for ${shortcut.label}`,
        'aria-haspopup': 'menu',
        title: 'Shortcut options'
      });
      wrapper.append(item, menu);
      iconRoot.append(wrapper);
    });
  }

  function renderStartMenu() {
    menuRoot.replaceChildren();
    menuRoot.setAttribute('role', 'menu');
    appConfig.start.forEach((group, index) => {
      const row = node('div', 'start-group');
      const parent = button('', 'start-row');
      parent.dataset.startParent = '';
      parent.setAttribute('role', 'menuitem');
      parent.setAttribute('aria-haspopup', 'menu');
      parent.setAttribute('aria-expanded', 'false');
      parent.append(icon(index === 0 ? 'computer.svg' : index === 3 ? 'network.svg' : index === 4 ? 'control.svg' : 'folder.svg'));
      parent.append(node('span', '', group.label));
      parent.append(node('span', 'menu-chevron', '▶'));
      const submenu = node('div', 'start-submenu');
      submenu.hidden = true;
      submenu.setAttribute('role', 'menu');
      group.children.forEach(child => {
        const action = button('', 'start-row start-child');
        action.setAttribute('role', 'menuitem');
        if (child.app) action.dataset.openWindow = child.app;
        if (child.external) action.dataset.openExternal = child.external;
        const app = child.app && appConfig.registry[child.app];
        action.append(icon(child.icon || app?.icon || (child.external ? `${child.external}.svg` : 'folder.svg')));
        action.append(node('span', '', child.label));
        submenu.append(action);
      });
      row.append(parent, submenu);
      menuRoot.append(row);
    });
    const rule = node('div', 'start-menu-rule');
    menuRoot.append(rule);
    const run = button('', 'start-row');
    run.dataset.openWindow = 'run';
    run.setAttribute('role', 'menuitem');
    run.append(icon('computer.svg'), node('span', '', 'Run...'));
    menuRoot.append(run);
    const separator = node('div', 'start-menu-rule');
    menuRoot.append(separator);
    const shutdown = button('', 'start-row');
    shutdown.dataset.openWindow = 'shutdown';
    shutdown.setAttribute('role', 'menuitem');
    shutdown.append(icon('computer.svg'), node('span', '', 'Shut Down...'));
    menuRoot.append(shutdown);
  }

  function closeStartSubmenus(except = null) {
    menuRoot.querySelectorAll('[data-start-parent]').forEach(parent => {
      if (parent === except) return;
      parent.setAttribute('aria-expanded', 'false');
      const submenu = parent.parentElement.querySelector('.start-submenu');
      if (submenu) {
        submenu.hidden = true;
        submenu.classList.remove('is-open');
      }
    });
  }

  function positionStartSubmenu(parent, submenu) {
    if (window.matchMedia('(max-width: 650px)').matches) {
      submenu.style.removeProperty('left');
      submenu.style.removeProperty('top');
      return;
    }
    submenu.style.left = '0px';
    submenu.style.top = '0px';
    const anchor = parent.getBoundingClientRect();
    const bounds = submenu.getBoundingClientRect();
    const edge = 5;
    const taskbarHeight = document.querySelector('.taskbar')?.getBoundingClientRect().height || 30;
    const rightSpace = window.innerWidth - anchor.right - edge;
    const left = rightSpace >= bounds.width
      ? anchor.right - 1
      : Math.max(edge, anchor.left - bounds.width + 1);
    const maxTop = Math.max(edge, window.innerHeight - taskbarHeight - bounds.height - edge);
    const top = Math.max(edge, Math.min(anchor.top - 3, maxTop));
    submenu.style.left = `${left}px`;
    submenu.style.top = `${top}px`;
  }

  function repositionOpenStartSubmenus() {
    menuRoot.querySelectorAll('[data-start-parent][aria-expanded="true"]').forEach(parent => {
      positionStartSubmenu(parent, parent.parentElement.querySelector('.start-submenu'));
    });
  }

  function closeStartMenu() {
    document.querySelector('[data-start-menu]').hidden = true;
    document.querySelector('[data-start]').setAttribute('aria-expanded', 'false');
    closeStartSubmenus();
  }

  function appToolbar(labels) {
    const toolbar = node('div', 'window-toolbar');
    labels.forEach(label => {
      const item = button(label, 'toolbar-label toolbar-menu-item', {
        dataset: { unavailable: '', unavailableLabel: label },
        title: `${label} menu is decorative in this portfolio`
      });
      toolbar.append(item);
    });
    return toolbar;
  }

  function renderAppContent(id) {
    switch (id) {
      case 'computer': return makeExplorerWindow('My Computer', '4 objects');
      case 'projects': return renderProjectsApp();
      case 'experience': return renderExperienceApp();
      case 'system': return renderSystemApp();
      case 'skills': return renderSkillsApp();
      case 'education': return renderEducationApp();
      case 'certificates': return renderCertificatesApp();
      case 'certificateDetail': return renderCertificateDetailApp();
      case 'resume': return renderResumeApp();
      case 'contact': return renderContactApp();
      case 'contactNotice': return renderContactNotice();
      case 'feedback': return renderFeedbackApp();
      case 'properties': return renderPropertiesApp();
      case 'terminal': return renderTerminalApp();
      case 'oracle': return renderOracleApp();
      case 'browser': return renderBrowserApp();
      case 'githubExplorer': return renderGithubExplorerApp();
      case 'notepad': return renderNotepadApp();
      case 'control': return renderControlPanelApp();
      case 'display': return renderDisplayApp();
      case 'recycle': return renderRecycleApp();
      case 'projectDetail': return renderProjectDetailApp();
      case 'shutdown': return renderShutdownApp();
      case 'run': return renderRunApp();
      case 'error': return renderErrorApp();
      case 'confirm': return renderConfirmApp();
      case 'newFolder': return renderNewFolderApp();
      default: return node('div', 'window-body', 'Application not found.');
    }
  }

  function renderProjectsApp() {
    const root = explorerAppRoot('C:\\Projects');
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Project folders'));
    const list = node('div', 'project-file-list');
    list.dataset.projectList = '';
    data.projects.filter(project => !deletedProjectIds.has(project.id)).forEach(project => {
      const file = button('', 'project-file');
      file.dataset.explorerItem = '';
      file.dataset.openProject = project.id;
      file.dataset.contextFile = '';
      file.dataset.contextType = 'project';
      file.dataset.contextId = project.id;
      file.dataset.contextLabel = project.name;
      file.append(icon('folder.svg'));
      const copy = node('span', 'project-file-copy');
      copy.append(node('strong', '', project.name), node('small', '', project.description));
      file.append(copy);
      list.append(file);
    });
    pane.append(list);
    root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${list.children.length} project folders`), node('span', '', 'C:\\Projects'));
    root.append(status);
    return root;
  }

  function renderExperienceApp() {
    const root = explorerAppRoot('C:\\Experience');
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Career & professional experience'));
    if (data.projectExperience?.length) {
      pane.append(node('h3', 'experience-section-heading', 'Project experience'));
      const projectRecords = node('div', 'records project-experience-records');
      data.projectExperience.forEach(project => {
        const card = node('article', 'record-row experience-project');
        card.append(node('h3', '', project.name));
        const dates = [project.startDate && `Start date: ${project.startDate}`, project.endDate && `End date: ${project.endDate}${project.endDateNote ? ` (${project.endDateNote.toLowerCase()})` : ''}`].filter(Boolean);
        card.append(node('p', 'record-meta experience-dates', dates.join(' · ')));
        card.append(node('p', '', project.description));
        if (project.contributions?.length) {
          card.append(node('p', 'record-section-label', 'Role and contributions'));
          const list = node('ul', 'experience-contributions');
          project.contributions.forEach(contribution => list.append(node('li', '', contribution)));
          card.append(list);
        }
        projectRecords.append(card);
      });
      pane.append(projectRecords);
    }
    pane.append(node('h3', 'experience-section-heading', 'Employment and virtual experience'));
    const records = node('div', 'records');
    data.experience.forEach(entry => {
      const card = node('article', 'record-row');
      card.append(node('h3', '', `${entry.company} — ${entry.role}`));
      card.append(node('p', 'record-meta', [entry.period, entry.location].filter(Boolean).join(' · ')));
      if (entry.description) card.append(node('p', '', entry.description));
      if (entry.technologies?.length) {
        card.append(node('p', 'record-section-label', 'Tools and technologies'));
        const tags = node('div', 'tag-row');
        entry.technologies.forEach(item => tags.append(node('span', 'classic-tag', item)));
        card.append(tags);
      }
      const achievements = entry.achievements || entry.highlights || [];
      if (achievements.length) {
        card.append(node('p', 'record-section-label', 'Responsibilities and achievements'));
        const list = node('ul');
        achievements.forEach(text => list.append(node('li', '', text)));
        card.append(list);
      }
      records.append(card);
    });
    pane.append(records);
    root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${data.projectExperience?.length || 0} projects · ${data.experience.length} roles`), node('span', '', 'Career file'));
    root.append(status);
    return root;
  }

  function renderSystemApp() {
    const root = node('div', 'app-root system-content');
    const top = node('div', 'system-top');
    top.append(node('div', 'system-logo', initials));
    const identity = node('div');
    identity.append(node('h2', '', profile.name), node('p', '', profile.title));
    top.append(identity);
    root.append(top);
    const tabList = node('div', 'tab-list');
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'System Properties sections');
    tabList.setAttribute('aria-orientation', 'horizontal');
    const tabData = [
      ['general', 'General'], ['professional', 'Professional'], ['skills', 'Skills'], ['education', 'Education'], ['contact', 'Links']
    ];
    tabData.forEach(([id, label], index) => {
      const tab = button(label, 'tab-button');
      tab.dataset.systemTab = id;
      tab.id = `system-tab-${id}`;
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(index === 0));
      tab.setAttribute('aria-controls', `system-panel-${id}`);
      tabList.append(tab);
    });
    root.append(tabList);
    const panels = node('div', 'tab-panels');
    panels.append(systemGeneralPanel());
    panels.append(systemProfessionalPanel());
    panels.append(systemSkillsPanel());
    panels.append(systemEducationPanel());
    panels.append(systemContactPanel());
    root.append(panels);
    return root;
  }

  function systemPanel(id, label, active = false) {
    const panel = node('section', 'tab-panel');
    panel.id = `system-panel-${id}`;
    panel.dataset.systemPanel = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', label);
    panel.setAttribute('aria-labelledby', `system-tab-${id}`);
    panel.tabIndex = 0;
    panel.hidden = !active;
    return panel;
  }

  function systemGeneralPanel() {
    const panel = systemPanel('general', 'General', true);
    const wrap = node('div', 'system-general');
    const photoFrame = node('div', 'system-photo-frame');
    const photo = node('img', 'system-photo');
    photo.alt = `Photo of ${profile.name}`;
    photo.hidden = !profile.profileImage;
    const placeholder = node('span', 'system-photo-placeholder', initials);
    placeholder.hidden = Boolean(profile.profileImage);
    photo.onerror = () => {
      photo.remove();
      placeholder.hidden = false;
    };
    if (profile.profileImage) {
      photoFrame.append(photo, placeholder);
      photo.src = profile.profileImage;
    } else photoFrame.append(placeholder);
    wrap.append(photoFrame);
    const facts = node('dl', 'system-facts');
    const rows = [
      ['Name', profile.name],
      ['System', profile.title],
      ['Location', profile.location],
      ...(currentExperience ? [['Company', currentExperience.company]] : [])
    ];
    rows.forEach(([term, value]) => facts.append(node('dt', '', term), node('dd', '', value)));
    wrap.append(facts);
    panel.append(wrap);
    const copy = node('div', 'system-copy');
    copy.append(node('h3', '', 'Portfolio Overview'));
    copy.append(node('p', '', 'This desktop organizes professional experience, projects, skills, education and credentials as folders and applications.'));
    panel.append(copy);
    return panel;
  }

  function systemProfessionalPanel() {
    const panel = systemPanel('professional', 'Professional');
    appendExperienceSummary(panel);
    const shortcuts = node('div', 'experience-shortcuts');
    shortcuts.append(button('Open Experience', 'classic-button', { dataset: { openWindow: 'experience' } }));
    shortcuts.append(button('Open Skills', 'classic-button', { dataset: { openWindow: 'skills' } }));
    panel.append(shortcuts);
    if (data.projectExperience?.length) {
      panel.append(node('h3', 'system-section-heading', 'Current project assignments'));
      data.projectExperience.forEach(project => {
        const card = node('article', 'record-row compact-project-record');
        card.append(node('h3', '', project.name));
        card.append(node('p', 'record-meta', `${project.startDate} — ${project.endDate}${project.endDateNote ? ` (${project.endDateNote.toLowerCase()})` : ''}`));
        panel.append(card);
      });
    }
    if (currentExperience) {
      panel.append(node('h3', 'system-section-heading', 'Current Role'));
      const current = node('article', 'record-row');
      current.append(node('h3', '', `${currentExperience.company} · ${currentExperience.role}`), node('p', 'record-meta', [currentExperience.period, currentExperience.location].filter(Boolean).join(' · ')));
      if (currentExperience.description) current.append(node('p', '', currentExperience.description));
      panel.append(current);
    }
    const previousExperience = data.experience.filter(entry => entry !== currentExperience);
    if (previousExperience.length) {
      panel.append(node('h3', 'system-section-heading', 'Experience & Simulations'));
      previousExperience.forEach(entry => {
        const card = node('article', 'record-row');
        card.append(node('h3', '', `${entry.company} · ${entry.role}`));
        card.append(node('p', 'record-meta', [entry.period, entry.location].filter(Boolean).join(' · ')));
        card.append(node('p', '', entry.description));
        if (entry.highlights?.length) {
          const list = node('ul');
          entry.highlights.forEach(highlight => list.append(node('li', '', highlight)));
          card.append(list);
        }
        panel.append(card);
      });
    }
    if (data.awards?.length) {
      panel.append(node('h3', 'system-section-heading', 'Recognition'));
      data.awards.forEach(award => panel.append(node('p', 'record-meta', award.name)));
    }
    return panel;
  }

  function appendExperienceSummary(container) {
    const summary = node('section', 'experience-summary');
    summary.append(node('h3', '', 'Experience Summary'));
    summary.append(node('p', '', data.experienceSummary.exposure));
    const tags = node('div', 'tag-row experience-summary-tags');
    data.experienceSummary.technologies.forEach(technology => tags.append(node('span', 'classic-tag', technology)));
    summary.append(tags);
    summary.append(node('p', 'experience-interest', data.experienceSummary.interests));
    container.append(summary);
  }

  function renderSkillCategories(container, categories = data.skills) {
    const grid = node('div', 'category-list');
    categories.forEach(category => {
      const box = node('section', 'category-box');
      box.append(node('h3', '', category.category));
      const list = node('ul', 'skill-tree');
      category.items.forEach(skill => {
        const item = typeof skill === 'string' ? { name: skill } : skill;
        const row = node('li', '');
        row.append(node('span', 'skill-name', item.name));
        if (item.level) row.append(node('span', `skill-level ${item.level.toLowerCase().replace(/[^a-z]+/g, '-')}`, item.level));
        list.append(row);
      });
      box.append(list);
      grid.append(box);
    });
    container.append(grid);
  }

  function systemSkillsPanel() {
    const panel = systemPanel('skills', 'Skills');
    renderSkillCategories(panel);
    return panel;
  }

  function renderEducationRecords(container) {
    const records = node('div', 'records');
    data.education.forEach(item => {
      const card = node('article', 'record-row');
      card.append(node('h3', '', item.qualification), node('p', 'record-meta', item.institution));
      const line = node('div', 'resume-line');
      line.append(node('span', '', item.period));
      if (item.result) line.append(node('span', 'education-score', item.result));
      card.append(line);
      if (item.resultNote) card.append(node('p', 'conflict-note', item.resultNote));
      records.append(card);
    });
    container.append(records);
  }

  function systemEducationPanel() {
    const panel = systemPanel('education', 'Education');
    renderEducationRecords(panel);
    return panel;
  }

  function systemContactPanel() {
    const panel = systemPanel('contact', 'Links');
    panel.append(node('p', 'system-copy', `Professional links for ${profile.name}.`));
    const links = node('div', 'contact-links');
    const github = externalLink('GitHub profile', 'github');
    const linkedin = externalLink('LinkedIn profile', 'linkedin');
    if (github) links.append(github);
    if (linkedin) links.append(linkedin);
    if (profile.email) links.append(contactEmailLink());
    panel.append(links);
    return panel;
  }

  function renderSkillsApp() {
    const root = node('div', 'app-root');
    root.append(appToolbar(['View', 'Arrange Icons', 'Help']));
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Technical skills'));
    renderSkillCategories(pane);
    root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${data.skills.reduce((n, category) => n + category.items.length, 0)} skills`), node('span', '', 'No proficiency percentages'));
    root.append(status);
    return root;
  }

  function renderEducationApp() {
    const root = node('div', 'app-root');
    root.append(appToolbar(['File', 'View', 'Help']));
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Education history'));
    renderEducationRecords(pane);
    root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${data.education.length} records`), node('span', '', 'Control Panel'));
    root.append(status);
    return root;
  }

  function renderCertificatesApp() {
    const root = explorerAppRoot('C:\\Certificates');
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Certificates and learning'));
    const note = node('div', 'empty-copy');
    note.append(node('span', '', 'Training and learning details are listed as supplied. Certificate IDs and verification links are not claimed unless provided.'));
    pane.append(note);
    pane.append(node('h3', 'experience-section-heading', 'Completed Training'));
    const trainingList = node('div', 'training-list');
    (data.training || []).forEach(item => {
      const row = node('article', 'training-record');
      row.append(icon('document.svg'));
      const details = node('div', 'training-copy');
      details.append(node('strong', '', item.name));
      if (item.issuer || item.date) details.append(node('small', '', [item.issuer, item.date].filter(Boolean).join(' · ')));
      row.append(details, node('span', 'learning-badge completed', 'Completed training'));
      trainingList.append(row);
    });
    pane.append(trainingList);
    pane.append(node('h3', 'experience-section-heading', 'Learning in Progress'));
    const learningList = node('div', 'training-list learning-list');
    (data.learningInProgress || []).forEach(item => {
      const row = node('article', 'training-record');
      row.append(icon('notepad.svg'));
      const details = node('div', 'training-copy');
      details.append(node('strong', '', item.name));
      if (item.provider) details.append(node('small', '', item.provider));
      row.append(details, node('span', 'learning-badge in-progress', item.status || 'In progress'));
      learningList.append(row);
    });
    pane.append(learningList);
    pane.append(node('h3', 'experience-section-heading', 'Other Credentials'));
    pane.append(node('p', 'empty-copy credential-note', 'These entries are retained from the existing portfolio. Individual verification URLs are only shown when available.'));
    const grid = node('div', 'cert-grid');
    data.certifications.forEach((cert, index) => {
      const item = button('', 'certificate-file');
      item.dataset.explorerItem = '';
      item.dataset.openCertificate = String(index);
      item.dataset.contextFile = '';
      item.dataset.contextType = 'certificate';
      item.dataset.contextId = String(index);
      item.dataset.contextLabel = cert.name;
      item.append(icon('certificate.svg'));
      const label = node('span');
      label.append(node('strong', '', cert.name), node('small', '', `${cert.issuer} · ${cert.date}`));
      item.append(label);
      grid.append(item);
    });
    pane.append(grid);
    root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${(data.training || []).length} training · ${(data.learningInProgress || []).length} in progress · ${data.certifications.length} credentials`), node('span', '', 'C:\\Certificates'));
    root.append(status);
    return root;
  }

  function renderCertificateDetailApp() {
    const root = node('div', 'app-root certificate-detail');
    const cert = data.certifications[selectedCertificateIndex];
    if (!cert) {
      root.append(node('p', 'empty-copy', 'No certificate is selected.'));
      return root;
    }
    root.append(node('h2', '', cert.name));
    const facts = node('dl', 'property-grid');
    facts.append(node('dt', '', 'Issuer'), node('dd', '', cert.issuer));
    facts.append(node('dt', '', 'Date'), node('dd', '', cert.date));
    if (cert.description) facts.append(node('dt', '', 'Details'), node('dd', '', cert.description));
    root.append(facts);
    if (cert.url) {
      const verify = node('a', 'classic-button', 'Verify credential');
      verify.href = cert.url;
      verify.target = '_blank';
      verify.rel = 'noopener noreferrer';
      root.append(verify);
    } else {
      root.append(node('p', 'empty-copy', 'No individual credential URL was provided. Open the public profile to see the listed credential.'));
      const source = node('a', 'classic-button', 'Open LinkedIn profile');
      source.href = sourceLinks.linkedin;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      root.append(source);
    }
    return root;
  }

  function renderErrorApp() {
    const root = node('div', 'app-root error-dialog');
    const message = node('div', 'error-message');
    message.append(icon('error.svg', 'error-dialog-icon'), node('p', '', errorMessage));
    const actions = node('div', 'shutdown-actions');
    actions.append(button('OK', 'classic-button', { dataset: { errorOk: '' }, autofocus: '' }));
    root.append(message, actions);
    return root;
  }

  function renderPropertiesApp() {
    const root = node('div', 'app-root properties-dialog');
    const target = propertiesTarget || { appId: 'computer' };
    const app = target.appId ? appConfig.registry[target.appId] : null;
    const external = target.externalKey ? sourceLinks[target.externalKey] : '';
    const descriptor = app || {
      name: target.label || target.externalKey || 'Shortcut',
      icon: target.icon || 'document.svg',
      type: 'External shortcut',
      description: 'Opens a configured portfolio resource in a new browser tab.',
      details: () => [['Destination', external || 'Not configured'], ['Open behavior', 'New browser tab']],
      actions: ['Open destination']
    };
    const heading = node('div', 'properties-heading');
    heading.append(icon(descriptor.icon || 'computer.svg'), node('div', '', descriptor.name || descriptor.title));
    root.append(heading);
    const details = node('dl', 'property-grid properties-grid');
    const status = app ? getPropertiesStatus(target.appId, app) : (external ? 'Configured' : 'Not configured');
    const metadata = typeof descriptor.details === 'function' ? descriptor.details() : (descriptor.details || []);
    const rows = [
      ['Application', descriptor.name || descriptor.title],
      ['Type', descriptor.type || 'Portfolio application'],
      ['Description', descriptor.description || 'Portfolio application.'],
      ['Current status', status],
      ...metadata
    ];
    rows.forEach(([term, value]) => details.append(node('dt', '', term), node('dd', '', value)));
    root.append(details);
    const actions = node('section', 'properties-actions');
    actions.append(node('strong', '', 'Available actions'));
    const list = node('ul', 'list-bullets');
    (descriptor.actions || []).forEach(action => list.append(node('li', '', action)));
    if (!descriptor.actions?.length) list.append(node('li', '', 'Open the shortcut'));
    actions.append(list);
    root.append(actions);
    const footer = node('div', 'properties-footer');
    footer.append(node('small', '', 'Portfolio 95 application information'), button('Close', 'classic-button', { dataset: { closeWindow: 'properties', autofocus: '' } }));
    root.append(footer);
    return root;
  }

  function getPropertiesStatus(id, app) {
    if (id === 'feedback') return feedbackSubmitted ? 'Submitted in this browser session' : 'Available';
    const win = document.querySelector(`[data-app="${id}"]`);
    const message = win?.querySelector('.window-status span:first-child')?.textContent.trim();
    return message || app.status || 'Ready';
  }

  function renderConfirmApp() {
    const root = node('div', 'app-root error-dialog');
    const action = pendingDelete;
    const message = action?.type === 'project'
      ? `Move ${projectById(action.id)?.name || 'this project'} to the Recycle Bin?`
      : action?.type === 'recycle'
        ? `Permanently delete ${action.item?.name || 'this item'}?`
        : 'Permanently delete all items in the Recycle Bin?';
    const copy = node('div', 'error-message');
    copy.append(node('span', 'error-symbol', '?'), node('p', '', message));
    const buttons = node('div', 'shutdown-actions');
    const confirm = button(action?.type === 'empty-recycle' ? 'Empty' : 'Delete', 'classic-button', { dataset: { confirmDelete: 'confirm' } });
    const cancel = button('Cancel', 'classic-button', { dataset: { confirmDelete: 'cancel', autofocus: '' } });
    buttons.append(confirm, cancel);
    root.append(copy, buttons);
    return root;
  }

  function renderNewFolderApp() {
    const form = node('form', 'app-root shutdown-body new-folder-dialog');
    form.dataset.newFolderForm = '';
    form.append(node('p', '', 'Create a new folder in C:\\'));
    const row = node('div', 'setting-row');
    const label = node('label', '', 'Name:');
    const input = node('input', 'new-folder-input');
    input.name = 'folderName'; input.maxLength = 60; input.autocomplete = 'off'; input.setAttribute('autofocus', '');
    label.htmlFor = 'new-folder-name'; input.id = 'new-folder-name';
    row.append(label, input);
    const actions = node('div', 'shutdown-actions');
    const create = button('Create', 'classic-button'); create.type = 'submit';
    const cancel = button('Cancel', 'classic-button', { dataset: { closeWindow: 'newFolder' } });
    actions.append(create, cancel);
    form.append(row, actions);
    return form;
  }

  function renderResumeApp() {
    const root = node('div', 'app-root resume-viewer');
    const toolbar = node('div', 'resume-toolbar');
    const open = button('Open PDF', 'classic-button');
    open.addEventListener('click', () => window.open(data.resume.file, '_blank', 'noopener,noreferrer'));
    const textVersion = node('a', 'classic-button', 'Open text résumé');
    textVersion.href = data.resume.htmlFile;
    textVersion.target = '_blank';
    textVersion.rel = 'noopener noreferrer';
    const download = node('a', 'classic-button', 'Download PDF résumé');
    download.href = data.resume.file;
    download.download = '';
    toolbar.append(open, textVersion, download);
    root.append(toolbar);
    const object = node('object', 'resume-object');
    object.dataset.resumeFile = data.resume.file;
    object.type = 'application/pdf';
    const fallback = node('div', 'resume-page');
    fallback.append(node('h2', '', profile.name), node('p', 'resume-headline', profile.title), node('p', '', data.experienceSummary.exposure), node('p', '', data.experienceSummary.interests));
    fallback.append(node('p', '', data.resume.note));
    const fallbackLink = node('a', '', 'Open the text résumé');
    fallbackLink.href = data.resume.htmlFile;
    fallback.append(fallbackLink);
    object.append(fallback);
    root.append(object, node('p', 'resume-warning', 'For screen readers and applicant tracking systems, use Open text résumé.'));
    return root;
  }

  function contactEmailLink() {
    const link = node('a', 'contact-link');
    link.href = `mailto:${profile.email}`;
    link.append(icon('mail.svg'), node('span', '', profile.email));
    return link;
  }

  function renderContactApp() {
    const root = node('div', 'app-root contact-app');
    root.append(node('h2', 'contact-heading', `Contact ${profile.name}`));
    root.append(node('p', 'contact-intro', 'Send a message or use one of these links.'));

    const form = node('form', 'contact-form');
    form.dataset.contactForm = '';
    form.noValidate = true;

    const fields = [
      ['name', 'Name', 'text'],
      ['email', 'Email', 'email'],
      ['subject', 'Subject', 'text']
    ];
    fields.forEach(([name, labelText, type]) => {
      const row = node('div', 'contact-field');
      const id = `contact-${name}`;
      const label = node('label', '', labelText);
      label.htmlFor = id;
      const input = node('input');
      input.id = id;
      input.type = type;
      input.name = name;
      input.required = true;
      if (name === 'email') input.autocomplete = 'email';
      if (name === 'name') input.autocomplete = 'name';
      row.append(label, input);
      form.append(row);
    });

    const messageRow = node('div', 'contact-field contact-field-message');
    const messageLabel = node('label', '', 'Message');
    messageLabel.htmlFor = 'contact-message';
    const message = node('textarea');
    message.id = 'contact-message';
    message.name = 'message';
    message.rows = 4;
    message.required = true;
    messageRow.append(messageLabel, message);
    form.append(messageRow);

    const actions = node('div', 'contact-actions');
    const send = node('button', 'classic-button', 'Send Message');
    send.type = 'submit';
    send.dataset.contactSend = '';
    const clear = node('button', 'classic-button', 'Clear');
    clear.type = 'reset';
    actions.append(send, clear);
    form.append(actions);
    root.append(form);

    const links = node('nav', 'contact-shortcuts');
    links.setAttribute('aria-label', 'Contact links');
    if (profile.email) {
      const email = node('a', 'contact-shortcut', 'Email');
      email.href = `mailto:${profile.email}`;
      email.replaceChildren(icon('mail.svg'), node('span', '', 'Email'));
      links.append(email);
    } else {
      links.append(node('span', 'contact-unavailable', 'Email address not configured in js/data.js.'));
    }
    [['GitHub', 'github'], ['LinkedIn', 'linkedin']].forEach(([label, key]) => {
      const url = sourceLinks[key];
      if (!url) return;
      const link = node('a', 'contact-shortcut');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(icon(`${key}.svg`), node('span', '', label));
      links.append(link);
    });
    root.append(links);
    return root;
  }

  function renderContactNotice() {
    const root = node('div', 'app-root contact-notice');
    const copy = node('div', 'contact-notice-copy');
    copy.append(node('span', 'contact-notice-icon', contactNotice.symbol), node('p', '', contactNotice.message));
    const actions = node('div', 'contact-notice-actions');
    actions.append(button('OK', 'classic-button', { dataset: { contactNoticeOk: '' }, autofocus: '' }));
    root.append(copy, actions);
    return root;
  }

  function renderFeedbackApp() {
    const root = node('div', 'app-root feedback-dialog');
    root.append(node('p', 'feedback-message', "You've been here for 45 seconds. Either you're exploring or this setup is growing on you. 😄"));
    root.append(node('p', 'feedback-question', "What's the verdict?"));
    const actions = node('div', 'feedback-actions');
    [
      ['yes', '👍 Pretty cool!'],
      ['no', '👎 Needs a reboot']
    ].forEach(([value, label]) => {
      const choice = button(label, 'classic-button feedback-choice', { dataset: { feedbackChoice: value } });
      actions.append(choice);
    });
    root.append(actions);
    const status = node('p', 'feedback-status');
    status.dataset.feedbackStatus = '';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    root.append(status);
    root.append(node('small', 'feedback-footnote', "No pressure. I won't take it personally."));
    return root;
  }

  function setFeedbackStatus(message, state = '') {
    const status = document.querySelector('[data-app="feedback"] [data-feedback-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', state === 'error');
  }

  async function submitPortfolioFeedback(choice) {
    if (!['yes', 'no'].includes(choice) || feedbackRequestInFlight) return;
    const dialog = document.querySelector('[data-app="feedback"]');
    const buttons = [...(dialog?.querySelectorAll('[data-feedback-choice]') || [])];
    const endpoint = data.contact?.formspreeEndpoint || '';
    if (!endpoint) {
      setFeedbackStatus('Feedback is unavailable right now. Please try again later.', 'error');
      return;
    }

    feedbackRequestInFlight = true;
    buttons.forEach(item => { item.disabled = true; });
    setFeedbackStatus('Sending your response...');
    const payload = new FormData();
    payload.set('liked_portfolio', choice);
    payload.set('feedback_type', 'portfolio_feedback');
    payload.set('page_url', window.location.href);
    payload.set('timestamp', new Date().toISOString());
    payload.set('submission_status', 'submitted');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload
      });
      if (!response.ok) throw new Error('Feedback submission failed');
      feedbackSubmitted = true;
      try { sessionStorage.setItem(feedbackStorageKey, 'yes'); }
      catch (_) { /* The successful response still suppresses the prompt in this page. */ }
      const successMessage = choice === 'yes'
        ? "Thanks! You're officially part of the cool people club."
        : 'Fair enough. Back to the command line I go.';
      setFeedbackStatus('');
      window.portfolioWindows?.close('feedback');
      showToast(successMessage);
    } catch (_) {
      setFeedbackStatus('Could not send your response. Please try again.', 'error');
    } finally {
      feedbackRequestInFlight = false;
      buttons.forEach(item => { item.disabled = false; });
    }
  }

  function showContactNotice(title, message, symbol = '!', focusControl = null) {
    contactNotice = { title, message, symbol };
    contactInvalidControl = focusControl;
    window.portfolioWindows?.rerender('contactNotice');
    window.portfolioWindows?.setTitle('contactNotice', title);
    window.portfolioWindows?.open('contactNotice');
  }

  async function submitContactForm(form) {
    if (form.dataset.sending === 'true') return;
    contactInvalidControl = null;
    const fields = [
      [form.elements.namedItem('name'), 'Please enter your name.'],
      [form.elements.namedItem('email'), 'Please enter your email address.'],
      [form.elements.namedItem('subject'), 'Please enter a subject.'],
      [form.elements.namedItem('message'), 'Please enter a message.']
    ];
    for (const [field, errorText] of fields) {
      if (!field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        showContactNotice('Contact Me', errorText, '!', field);
        return;
      }
      if (field.type === 'email' && field.validity.typeMismatch) {
        field.setAttribute('aria-invalid', 'true');
        showContactNotice('Contact Me', 'Please enter a valid email address.', '!', field);
        return;
      }
    }
    fields.forEach(([field]) => {
      field.removeAttribute('aria-invalid');
      field.value = field.value.trim();
    });

    const endpoint = data.contact?.formspreeEndpoint || '';
    if (!endpoint) {
      window.portfolioWindows?.setStatus('contact', 'Unable to send message.', '');
      showContactNotice('Contact Me', 'Unable to send your message. Please try again later.');
      return;
    }

    const send = form.querySelector('[data-contact-send]');
    const clear = form.querySelector('button[type="reset"]');
    form.dataset.sending = 'true';
    send.disabled = true;
    clear.disabled = true;
    send.textContent = 'Sending...';
    window.portfolioWindows?.setStatus('contact', 'Sending message...', '');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      window.portfolioWindows?.setStatus('contact', 'Message sent successfully.', '');
      showContactNotice('Message Sent', 'Your message has been sent successfully.', '✓');
    } catch (_) {
      window.portfolioWindows?.setStatus('contact', 'Unable to send message.', '');
      showContactNotice('Contact Me', 'Unable to send your message. Please try again later.');
    } finally {
      form.dataset.sending = 'false';
      send.disabled = false;
      clear.disabled = false;
      send.textContent = 'Send Message';
    }
  }

  function renderTerminalApp() {
    const root = node('div', 'app-root terminal-root');
    const output = node('div', 'terminal-output');
    output.dataset.terminalOutput = '';
    output.setAttribute('aria-live', 'polite');
    const form = node('form', 'terminal-form');
    form.dataset.terminalForm = '';
    const label = node('label', '', 'C:\\PORTFOLIO>');
    label.htmlFor = 'terminal-input';
    const input = node('input');
    input.id = 'terminal-input';
    input.dataset.terminalInput = '';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'Terminal command');
    form.append(label, input);
    root.append(output, form);
    return root;
  }

  function renderOracleApp() {
    const root = node('div', 'app-root');
    root.append(appToolbar(['Database', 'View', 'Help']));
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Oracle DBA'));
    pane.append(node('p', '', data.oracle.overview));
    const sections = data.oracle.sections || [{ category: 'Topics', items: data.oracle.topics || [] }];
    const sectionGrid = node('div', 'oracle-sections');
    sections.forEach(section => {
      const group = node('fieldset', 'property-group');
      group.append(node('legend', '', section.category));
      const tags = node('div', 'tag-row');
      section.items.forEach(topic => tags.append(node('span', 'classic-tag', topic)));
      group.append(tags);
      sectionGrid.append(group);
    });
    pane.append(sectionGrid);
    pane.append(node('h3', '', 'Database projects'));
    pane.append(node('p', 'empty-copy', data.oracle.projects.length ? 'See projects below.' : 'No Oracle database project write-ups were included in the supplied sources.'));
    root.append(pane);
    const status = node('div', 'window-status');
    const topicCount = sections.reduce((count, section) => count + section.items.length, 0);
    status.append(node('span', '', `${topicCount} topics`), node('span', '', 'Oracle DBA'));
    root.append(status);
    return root;
  }

  function renderBrowserApp() {
    const root = node('div', 'app-root browser-shell');
    const address = node('div', 'browser-address');
    address.append(node('label', '', 'Address'), node('input'));
    address.lastChild.value = sourceLinks.portfolio || sourceLinks.github || '';
    address.lastChild.readOnly = true;
    address.append(button('Go', 'classic-button', { dataset: { openExternal: 'portfolio' } }));
    root.append(address);
    const page = node('div', 'browser-page');
    page.append(node('h2', '', `Welcome to ${profile.name}'s Internet`));
    page.append(node('p', '', 'Choose a destination. External pages open in a new tab.'));
    const links = node('div', 'browser-links');
    [
      ['Projects', 'folder.svg', 'projects'],
      ['Resume', 'document.svg', 'resume'],
      ['Text Resume', 'document.svg', 'textResume'],
      ['GitHub', 'github.svg', 'github'],
      ['LinkedIn', 'linkedin.svg', 'linkedin']
    ].forEach(([label, iconName, target]) => {
      const item = button('', 'browser-link');
      item.append(icon(iconName), node('span', '', label));
      if (appConfig.registry[target]) item.dataset.openWindow = target;
      else item.dataset.openExternal = target;
      links.append(item);
    });
    page.append(links);
    root.append(page);
    return root;
  }

  function renderGithubExplorerApp() {
    const root = node('div', 'app-root');
    root.append(explorerToolbar(sourceLinks.github || 'GitHub'));
    const pane = node('div', 'window-body explorer-pane');
    pane.append(node('h2', 'explorer-heading', 'Public repositories'));
    const list = node('div', 'project-file-list');
    data.repositories.forEach(repository => {
      const item = node('a', 'project-file');
      item.href = repository.url;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.append(icon('github.svg'));
      const copy = node('span', 'project-file-copy');
      copy.append(node('strong', '', repository.name), node('small', '', repository.description));
      item.append(copy);
      list.append(item);
    });
    pane.append(list); root.append(pane);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${data.repositories.length} repositories`), node('span', '', githubLabel));
    root.append(status);
    return root;
  }

  function renderNotepadApp() {
    const root = node('div', 'app-root notepad-root');
    root.append(appToolbar(['File', 'Edit', 'Search', 'Help']));
    const text = node('textarea', 'notepad-area');
    text.readOnly = true;
    text.setAttribute('aria-label', 'Portfolio README');
    text.value = [
      `${profile.name} — Portfolio 95`,
      '',
      profile.title,
      profile.location,
      '',
      data.experienceSummary.exposure,
      data.experienceSummary.interests,
      '',
      'Explore this desktop:',
      '  My Computer   career files and portfolio folders',
      '  Projects      PhishNet, StudyBot AI, home lab and more',
      '  Skills        database, cybersecurity, Linux, cloud and tools',
      '  MS-DOS Prompt type HELP for the command list',
      '',
      `GitHub: ${sourceLinks.github}`,
      `LinkedIn: ${sourceLinks.linkedin}`
    ].join('\n');
    root.append(text);
    return root;
  }

  function renderControlPanelApp() {
    const root = node('div', 'app-root');
    root.append(appToolbar(['File', 'Edit', 'View', 'Help']));
    const grid = node('div', 'window-body control-panel-grid');
    [
      ['Display Properties', 'display.svg', 'display'], ['System Properties', 'system.svg', 'system'],
      ['Education', 'education.svg', 'education'], ['Portfolio Settings', 'control.svg', 'display'],
      ['Technical Skills', 'control.svg', 'skills'], ['Oracle DBA', 'database.svg', 'oracle'],
      ['Internet Explorer', 'browser.svg', 'browser'], ['Recycle Bin', 'recycle.svg', 'recycle']
    ].forEach(([label, iconName, app]) => {
      const item = button('', 'control-item');
      item.dataset.openWindow = app;
      item.append(icon(iconName), node('span', '', label));
      grid.append(item);
    });
    root.append(grid);
    const status = node('div', 'window-status');
    status.append(node('span', '', '8 objects'), node('span', '', 'Control Panel'));
    root.append(status);
    return root;
  }

  function loadSettings() {
    const defaults = { theme: 'classic', scanlines: false, pixel: false, sound: false, clockFormat: '12' };
    try {
      const saved = JSON.parse(localStorage.getItem('portfolio95-settings') || '{}');
      return { ...defaults, ...saved, clockFormat: saved.clockFormat === '24' ? '24' : '12' };
    } catch (_) { return defaults; }
  }

  let settings = loadSettings();

  function applySettings() {
    desktop.classList.toggle('theme-night', settings.theme === 'night');
    desktop.classList.toggle('theme-classic', settings.theme !== 'night');
    desktop.classList.toggle('scanlines', Boolean(settings.scanlines));
    desktop.classList.toggle('pixel-mode', Boolean(settings.pixel));
    const soundIcon = document.querySelector('.tray-volume');
    soundIcon.textContent = settings.sound ? '◖))' : '◖';
    soundIcon.setAttribute('aria-label', settings.sound ? 'Sound on' : 'Sound off');
    document.querySelectorAll('[data-setting]').forEach(control => {
      const name = control.dataset.setting;
      if (control.type === 'checkbox') control.checked = Boolean(settings[name]);
      else control.value = settings[name] || (name === 'clockFormat' ? '12' : 'classic');
    });
  }

  function saveSettings() {
    try { localStorage.setItem('portfolio95-settings', JSON.stringify(settings)); } catch (_) { /* Private browsing can disable local storage. */ }
    applySettings();
    updateClock();
    if (settings.sound) playUiSound();
  }

  function playUiSound() {
    if (!settings.sound) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(540, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(330, audio.currentTime + 0.035);
      gain.gain.setValueAtTime(0.014, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.04);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + 0.045);
      oscillator.onended = () => audio.close();
    } catch (_) { /* Audio is an optional enhancement. */ }
  }

  function renderDisplayApp() {
    const root = node('div', 'app-root window-body');
    const panel = node('div', 'display-settings');
    panel.append(node('h2', '', 'Display properties'));
    const themeRow = node('div', 'setting-row');
    const themeLabel = node('label', '', 'Desktop color');
    const select = node('select', 'theme-select');
    select.dataset.setting = 'theme';
    select.append(new Option('Classic teal', 'classic'), new Option('Slate', 'night'));
    themeRow.append(themeLabel, select);
    panel.append(themeRow);
    const clockRow = node('div', 'setting-row');
    const clockLabel = node('label', '', 'Clock format');
    const clockSelect = node('select', 'theme-select');
    clockSelect.id = 'clock-format';
    clockSelect.dataset.setting = 'clockFormat';
    clockSelect.append(new Option('12-hour', '12'), new Option('24-hour', '24'));
    clockLabel.htmlFor = clockSelect.id;
    clockRow.append(clockLabel, clockSelect);
    panel.append(clockRow);
    [
      ['scanlines', 'CRT scanlines', 'Subtle scanlines across the desktop.'],
      ['pixel', 'Pixel texture', 'Increase the desktop pattern contrast.'],
      ['sound', 'Sound', 'Play a short original tone for UI actions. Off by default.']
    ].forEach(([key, label, description]) => {
      const row = node('div', 'setting-row');
      const title = node('label');
      const input = node('input'); input.type = 'checkbox'; input.dataset.setting = key;
      const copy = node('span'); copy.append(node('strong', '', label), node('small', '', description));
      title.append(input, copy); row.append(title); panel.append(row);
    });
    const buttons = node('div', 'shutdown-actions');
    buttons.append(button('Apply', 'classic-button', { dataset: { settingsApply: '' } }));
    panel.append(buttons);
    root.append(panel);
    window.setTimeout(applySettings, 0);
    return root;
  }

  function renderRecycleApp() {
    const root = node('div', 'app-root');
    root.append(appToolbar(['File', 'Edit', 'View', 'Help']));
    const toolbar = node('div', 'window-toolbar');
    toolbar.append(button('Empty Recycle Bin', 'toolbar-button', { dataset: { recycleEmpty: '' } }));
    root.append(toolbar);
    const list = node('div', 'window-body recycle-list');
    list.dataset.recycleList = '';
    recycleItems.forEach((item, index) => {
      const row = button('', 'recycle-item');
      row.dataset.recycleIndex = String(index);
      row.dataset.contextFile = '';
      row.dataset.contextType = 'recycle';
      row.dataset.contextId = String(index);
      row.dataset.contextLabel = item.name;
      row.append(icon(item.kind === 'archive' ? 'folder.svg' : item.kind === 'program' ? 'computer.svg' : 'document.svg'), node('span', '', item.name));
      list.append(row);
    });
    if (!recycleItems.length) list.append(node('p', 'empty-copy', 'The Recycle Bin is empty.'));
    root.append(list);
    const status = node('div', 'window-status');
    status.append(node('span', '', `${recycleItems.length} objects`), node('span', '', 'Recycle Bin'));
    root.append(status);
    return root;
  }

  function renderProjectDetailApp() {
    const root = node('div', 'app-root project-detail');
    root.dataset.projectDetailContent = '';
    root.append(node('p', 'empty-copy', 'Select a project folder to view its details.'));
    return root;
  }

  function renderProjectDetail(project) {
    const root = node('div', 'project-detail');
    const heading = node('div', 'project-detail-heading');
    heading.append(icon('folder.svg'));
    const title = node('div');
    title.append(node('h2', '', project.name), node('p', '', project.subtitle));
    heading.append(title);
    root.append(heading);
    const facts = node('dl', 'property-grid');
    facts.append(node('dt', '', 'Project'), node('dd', '', project.name));
    if (project.category) facts.append(node('dt', '', 'Category'), node('dd', '', project.category));
    facts.append(node('dt', '', 'Status'), node('dd', '', project.status || 'Not provided in portfolio data.'));
    facts.append(node('dt', '', 'Description'), node('dd', '', project.description));
    root.append(facts);
    const technologies = node('fieldset', 'property-group');
    technologies.append(node('legend', '', 'Technology'));
    const tagRow = node('div', 'tag-row');
    (project.technologies || []).forEach(item => tagRow.append(node('span', 'classic-tag', item)));
    if (tagRow.childElementCount) { technologies.append(tagRow); root.append(technologies); }
    const features = node('fieldset', 'property-group');
    features.append(node('legend', '', 'Features'));
    const featureList = node('ul', 'list-bullets');
    (project.features || []).forEach(item => featureList.append(node('li', '', item)));
    if (featureList.childElementCount) { features.append(featureList); root.append(features); }
    if (project.metric) {
      const metric = node('fieldset', 'property-group');
      metric.append(node('legend', '', 'Performance'));
      metric.append(node('p', '', project.metric));
      root.append(metric);
    }
    if (project.github) {
      const links = node('div', 'link-row');
      const repo = node('a', 'classic-button', 'View GitHub repository');
      repo.href = project.github; repo.target = '_blank'; repo.rel = 'noopener noreferrer';
      links.append(repo); root.append(links);
    }
    if (project.demo) {
      const demo = node('a', 'classic-button', 'Open live demo');
      demo.href = project.demo; demo.target = '_blank'; demo.rel = 'noopener noreferrer';
      root.append(demo);
    }
    if (project.screenshots?.length) {
      const gallery = node('div', 'project-screenshots');
      project.screenshots.forEach((source, index) => {
        const image = node('img'); image.src = source; image.alt = `${project.name} screenshot ${index + 1}`; image.loading = 'lazy';
        gallery.append(image);
      });
      root.append(gallery);
    }
    return root;
  }

  function renderShutdownApp() {
    const root = node('div', 'app-root shutdown-body');
    root.append(node('p', '', 'What do you want the computer to do?'));
    const options = node('div', 'shutdown-options');
    [
      ['shutdown', 'Shut down'], ['restart', 'Restart'], ['dos', 'Restart in MS-DOS mode']
    ].forEach(([value, label], index) => {
      const row = node('label');
      const radio = node('input'); radio.type = 'radio'; radio.name = 'shutdown-choice'; radio.value = value; radio.checked = index === 0;
      row.append(radio, node('span', '', label)); options.append(row);
    });
    root.append(options);
    const actions = node('div', 'shutdown-actions');
    actions.append(button('OK', 'classic-button', { dataset: { shutdownAction: 'confirm' } }), button('Cancel', 'classic-button', { dataset: { shutdownAction: 'cancel' } }), button('Help', 'classic-button', { dataset: { shutdownAction: 'help' } }));
    root.append(actions);
    return root;
  }

  function renderRunApp() {
    const root = node('form', 'app-root shutdown-body');
    root.dataset.runForm = '';
    root.append(node('p', '', 'Type the name of a program, folder, document, or Internet resource.'));
    const row = node('div', 'setting-row');
    const label = node('label', '', 'Open:');
    const input = node('input', 'run-input');
    input.id = 'run-command'; input.name = 'command'; input.autocomplete = 'off';
    label.htmlFor = input.id;
    row.append(label, input);
    root.append(row);
    const actions = node('div', 'shutdown-actions');
    const submit = node('button', 'classic-button', 'OK');
    submit.type = 'submit';
    const cancel = button('Cancel', 'classic-button', { dataset: { closeWindow: 'run' } });
    actions.append(submit, cancel);
    root.append(actions);
    return root;
  }

  window.PORTFOLIO_APP_RENDERER = renderAppContent;
  window.addEventListener('portfolio:windows-ready', () => renderExplorer('My Computer', false));
  window.addEventListener('portfolio:window-open', event => {
    if (event.detail?.id === 'feedback') {
      feedbackPromptSeen = true;
      stopFeedbackTimer();
    }
    if (event.detail?.id !== 'resume') return;
    const object = window.portfolioWindows?.getWindow('resume')?.querySelector('.resume-object');
    if (object && object.dataset.loaded !== 'true') {
      object.dataset.loaded = 'true';
      object.addEventListener('error', () => showErrorDialog('Resume.pdf could not be loaded. Check that the file exists at the configured resume path.'), { once: true });
      object.data = object.dataset.resumeFile;
    }
  });
  window.addEventListener('portfolio:window-close', event => {
    if (event.detail?.id === 'confirm') pendingDelete = null;
    if (event.detail?.id === 'contactNotice') {
      const target = contactInvalidControl;
      contactInvalidControl = null;
      if (target?.isConnected) target.focus();
      else document.querySelector('[data-app="contact"] [data-contact-send]')?.focus();
    }
  });
  renderDesktopIcons();
  renderStartMenu();
  menuRoot.addEventListener('scroll', repositionOpenStartSubmenus);
  window.addEventListener('resize', repositionOpenStartSubmenus);
  applySettings();

  function openApp(id) {
    if (!appConfig.registry[id]) return;
    if (id === 'projectDetail' && !document.querySelector('[data-project-detail-content]')?.dataset.projectId) {
      showToast('Choose a project folder first.');
      return;
    }
    if (id === 'resume') { closeStartMenu(); openResume(); return; }
    window.portfolioWindows?.open(id);
    closeStartMenu();
  }

  function openResume() {
    if (resumeCheckPending) return;
    if (window.location.protocol === 'file:') {
      window.portfolioWindows?.open('resume');
      return;
    }
    resumeCheckPending = true;
    fetch(data.resume.file, { method: 'HEAD', cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      window.portfolioWindows?.open('resume');
      closeStartMenu();
    }).catch(error => {
      showErrorDialog(`Resume.pdf could not be opened (${error.message}). Check the configured file path.`);
    }).finally(() => { resumeCheckPending = false; });
  }

  function showErrorDialog(message, title = 'Error') {
    if (!window.portfolioWindows?.getWindow('error')?.hidden) return;
    errorMessage = message;
    errorTitle = title;
    closeStartMenu();
    window.portfolioWindows?.rerender('error');
    window.portfolioWindows?.setTitle('error', errorTitle);
    window.portfolioWindows?.open('error');
  }

  function showUnavailableError(label = '') {
    const now = Date.now();
    if (now - lastUnavailableErrorAt < 1100 || !window.portfolioWindows?.getWindow('error')?.hidden) return;
    lastUnavailableErrorAt = now;
    const messages = [
      { title: 'System Error', message: "Well, that wasn't supposed to happen. Try another icon." },
      { title: 'Error 404: Motivation Not Found', message: 'This feature is still looking for its floppy disk.' },
      { title: 'Windows 95 Says...', message: 'I tried my best. My best was apparently not enough.' },
      { title: 'Access Denied', message: "Nice try. This button doesn't have a job yet." },
      { title: 'Unexpected Behaviour', message: 'The computer has entered a brief period of self-reflection.' }
    ];
    const variant = messages[unavailableErrorIndex++ % messages.length];
    showErrorDialog(variant.message, variant.title);
  }

  function showProperties(target) {
    if (!target) return;
    propertiesTarget = target;
    const app = target.appId && appConfig.registry[target.appId];
    window.portfolioWindows?.rerender('properties');
    window.portfolioWindows?.setTitle('properties', `${app?.name || target.label || 'Shortcut'} Properties`);
    window.portfolioWindows?.open('properties');
  }

  function openCertificate(index) {
    const parsed = Number(index);
    if (!Number.isInteger(parsed) || !data.certifications[parsed]) return;
    selectedCertificateIndex = parsed;
    window.portfolioWindows?.rerender('certificateDetail');
    window.portfolioWindows?.open('certificateDetail');
  }

  function createVirtualFolder() {
    const input = document.querySelector('[data-app="newFolder"] input[name="folderName"]');
    if (input) input.value = '';
    window.portfolioWindows?.rerender('newFolder');
    window.portfolioWindows?.open('newFolder');
  }

  function commitVirtualFolder() {
    const name = document.querySelector('[data-app="newFolder"] input[name="folderName"]')?.value.trim();
    if (!name) return;
    const invalid = /[\\/:*?"<>|]/.test(name);
    const reserved = ['Users', 'Projects', 'Resume.pdf', 'Certificates', 'Experience', 'Skills', ...virtualFolders].some(item => item.toLowerCase() === name.toLowerCase());
    if (invalid || reserved) {
      window.portfolioWindows?.close('newFolder');
      showErrorDialog(invalid ? 'Folder names cannot contain \\/:*?"<>| characters.' : 'A folder with that name already exists.');
      return;
    }
    virtualFolders.push(name);
    window.portfolioWindows?.close('newFolder');
    renderExplorer('C:\\', false);
    openApp('computer');
    showToast(`${name} folder created.`);
  }

  function openExternal(key) {
    const url = sourceLinks[key];
    if (!url) { showToast(`No ${key} link is listed in js/data.js.`); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openProject(id) {
    const project = projectById(id);
    if (!project) return;
    const target = document.querySelector('[data-project-detail-content]');
    target.replaceChildren(renderProjectDetail(project));
    target.dataset.projectId = id;
    const title = `${project.name} — Properties`;
    window.portfolioWindows?.setTitle('projectDetail', title);
    window.portfolioWindows?.setStatus('projectDetail', 'Project information', 'GitHub repository');
    openApp('projectDetail');
  }

  function goToExplorer(path, history = true) {
    renderExplorer(path, history);
  }

  function selectTab(id) {
    const app = document.querySelector('[data-app="system"]');
    if (!app) return;
    app.querySelectorAll('[data-system-tab]').forEach(tab => {
      const selected = tab.dataset.systemTab === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    app.querySelectorAll('[data-system-panel]').forEach(panel => { panel.hidden = panel.dataset.systemPanel !== id; });
  }

  function refreshDesktop() {
    document.querySelectorAll('.desktop-icon').forEach(item => item.classList.remove('is-selected'));
    renderDesktopIcons();
    showToast('Desktop refreshed.');
  }

  function showToast(message) {
    const toast = document.querySelector('[data-toast]');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3000);
  }

  function stopFeedbackTimer() {
    if (feedbackTimer === null) return;
    window.clearInterval(feedbackTimer);
    feedbackTimer = null;
  }

  function startFeedbackTimer() {
    if (feedbackSubmitted || feedbackPromptSeen || feedbackTimer !== null) return;
    feedbackLastTick = Date.now();
    feedbackTimer = window.setInterval(() => {
      const now = Date.now();
      if (!document.hidden) feedbackActiveMs += Math.max(0, now - feedbackLastTick);
      feedbackLastTick = now;
      if (feedbackActiveMs < 45000 || feedbackSubmitted || feedbackPromptSeen) return;
      if (document.querySelector('.window.is-modal:not([hidden])')) return;
      feedbackPromptSeen = true;
      stopFeedbackTimer();
      window.portfolioWindows?.open('feedback');
    }, 1000);
  }

  document.addEventListener('visibilitychange', () => { feedbackLastTick = Date.now(); });

  function showContextMenu(x, y, items, target = null) {
    contextTarget = target;
    contextMenu.replaceChildren();
    items.forEach(item => {
      if (item.separator) { contextMenu.append(node('div', 'context-separator')); return; }
      const action = button(item.label, '');
      action.setAttribute('role', 'menuitem');
      if (item.disabled) action.disabled = true;
      action.dataset.contextAction = item.action || '';
      if (item.arrow) action.append(node('span', 'context-arrow', '▶'));
      contextMenu.append(action);
    });
    contextMenu.hidden = false;
    const rect = desktop.getBoundingClientRect();
    contextMenu.style.left = '4px';
    contextMenu.style.top = '4px';
    const menuRect = contextMenu.getBoundingClientRect();
    const left = Math.max(4, Math.min(x - rect.left, rect.width - menuRect.width - 4));
    const top = Math.max(4, Math.min(y - rect.top, rect.height - menuRect.height - 4));
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    contextMenu.querySelector('button:not(:disabled)')?.focus();
  }

  function hideContextMenu() { contextMenu.hidden = true; contextTarget = null; }

  function arrangeIcons() {
    const items = [...iconRoot.children].sort((a, b) => a.dataset.shortcutLabel.localeCompare(b.dataset.shortcutLabel));
    items.forEach(item => iconRoot.append(item));
    showToast('Icons arranged by name.');
  }

  function copyContextItem() {
    const text = contextTarget?.label || contextTarget?.id || '';
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => showToast(`Copied ${text}.`)).catch(() => showToast('Clipboard access is unavailable.'));
    else showToast(`Selected: ${text}`);
  }

  function showShortcutContextMenu(shortcut, x, y) {
    if (!shortcut) return;
    showContextMenu(x, y, [
      { label: 'Open', action: 'open' },
      { separator: true },
      { label: 'Copy Shortcut', action: 'copy' },
      { label: 'Properties', action: 'shortcut-properties' }
    ], {
      type: 'shortcut',
      appId: shortcut.dataset.shortcutApp || '',
      externalKey: shortcut.dataset.shortcutExternal || '',
      label: shortcut.dataset.shortcutLabel || shortcut.textContent.trim(),
      icon: shortcut.querySelector('img')?.getAttribute('src')?.split('/').pop()
    });
  }

  function showWindowContextMenu(win, x, y, fromTaskbar = false) {
    if (!win) return;
    const id = win.dataset.app;
    const minimized = win.classList.contains('is-minimized');
    const maximized = win.classList.contains('is-maximized');
    const active = win.classList.contains('is-active');
    const isDialog = Boolean(appConfig.registry[id]?.dialog);
    const items = [];
    if (!isDialog) {
      items.push({ label: minimized ? 'Restore' : active ? 'Minimize' : 'Switch to', action: minimized ? 'window-restore' : active ? 'window-minimize' : 'window-focus' });
      items.push({ label: maximized ? 'Restore' : 'Maximize', action: 'window-maximize' });
      items.push({ label: 'Close', action: 'window-close' });
      items.push({ separator: true });
      items.push({ label: 'Properties', action: 'window-properties' });
    } else {
      items.push({ label: 'Close', action: 'window-close' });
    }
    showContextMenu(x, y, items, { type: fromTaskbar ? 'taskbar-window' : 'window', id, label: appConfig.registry[id]?.name || id });
  }

  function deleteContextItem() {
    if (contextTarget?.type === 'recycle') {
      const index = Number(contextTarget.id);
      const item = recycleItems[index];
      if (!item) return;
      pendingDelete = { type: 'recycle', index, item };
      window.portfolioWindows?.rerender('confirm');
      window.portfolioWindows?.open('confirm');
      return;
    }
    if (!contextTarget || contextTarget.type !== 'project') return;
    const project = projectById(contextTarget.id);
    if (!project) return;
    pendingDelete = { type: 'project', id: project.id };
    window.portfolioWindows?.rerender('confirm');
    window.portfolioWindows?.open('confirm');
  }

  function completeDelete() {
    const action = pendingDelete;
    pendingDelete = null;
    window.portfolioWindows?.close('confirm');
    if (!action) return;
    if (action.type === 'project') {
      const project = projectById(action.id);
      if (!project) return;
      deletedProjectIds.add(project.id);
      recycleItems.push({ name: `${project.name}.folder`, kind: 'archive', note: `Moved from C:\\Projects. ${project.description}`, projectId: project.id });
      window.portfolioWindows?.rerender('projects');
      window.portfolioWindows?.rerender('recycle');
      const pane = document.querySelector('[data-app="computer"] [data-explorer-items]');
      if (pane?.dataset.explorerPath === 'C:\\Projects') renderExplorer('C:\\Projects', false);
      showToast(`${project.name} moved to the Recycle Bin.`);
    } else if (action.type === 'recycle') {
      recycleItems.splice(action.index, 1);
      window.portfolioWindows?.rerender('recycle');
      showToast(`${action.item.name} permanently deleted.`);
    } else if (action.type === 'empty-recycle') {
      recycleItems = [];
      window.portfolioWindows?.rerender('recycle');
      showToast('Recycle Bin emptied.');
    }
  }

  function openRecycleItem(item) {
    if (!item) return;
    const notepad = document.querySelector('[data-app="notepad"] textarea');
    if (notepad) notepad.value = `${item.name}\n\n${item.note}`;
    openApp('notepad');
  }

  document.addEventListener('click', event => {
    const unavailable = event.target.closest('[data-unavailable]');
    if (unavailable) {
      hideContextMenu();
      showUnavailableError(unavailable.dataset.unavailableLabel || unavailable.textContent.trim());
      return;
    }

    const feedbackChoice = event.target.closest('[data-feedback-choice]');
    if (feedbackChoice) {
      void submitPortfolioFeedback(feedbackChoice.dataset.feedbackChoice);
      return;
    }

    if (event.target.closest('[data-contact-notice-ok]')) {
      window.portfolioWindows?.close('contactNotice');
      return;
    }
    const shortcutMenu = event.target.closest('[data-shortcut-menu]');
    if (shortcutMenu) {
      const shortcut = shortcutMenu.closest('.desktop-shortcut')?.querySelector('[data-shortcut]');
      if (shortcut) {
        const rect = shortcutMenu.getBoundingClientRect();
        showShortcutContextMenu(shortcut, rect.left, rect.bottom + 2);
      }
      return;
    }
    const shortcut = event.target.closest('[data-shortcut]');
    if (shortcut) {
      document.querySelectorAll('.desktop-icon').forEach(item => item.classList.toggle('is-selected', item === shortcut));
      const touch = window.matchMedia('(pointer: coarse)').matches;
      if (touch || event.detail === 0 || event.detail >= 2) {
        if (shortcut.dataset.shortcutType === 'external') openExternal(shortcut.dataset.shortcutExternal);
        else openApp(shortcut.dataset.shortcutApp);
      }
      return;
    }

    const launcher = event.target.closest('[data-open-window]');
    if (launcher) { openApp(launcher.dataset.openWindow); return; }
    const external = event.target.closest('[data-open-external]');
    if (external) {
      openExternal(external.dataset.openExternal);
      closeStartMenu();
      return;
    }
    const project = event.target.closest('[data-open-project]');
    if (project) { openProject(project.dataset.openProject); return; }
    const certificate = event.target.closest('[data-open-certificate]');
    if (certificate) { openCertificate(certificate.dataset.openCertificate); return; }
    const appLink = event.target.closest('[data-explorer-app]');
    if (appLink) { openApp(appLink.dataset.explorerApp); return; }
    const externalExplorer = event.target.closest('[data-explorer-external]');
    if (externalExplorer) { openExternal(externalExplorer.dataset.explorerExternal); return; }
    const route = event.target.closest('[data-explorer-route]');
    if (route) { goToExplorer(route.dataset.explorerRoute); return; }

    const explorerAction = event.target.closest('[data-explorer-action]');
    if (explorerAction) {
      const action = explorerAction.dataset.explorerAction;
      if (action === 'home') { explorerHistory = ['My Computer']; goToExplorer('My Computer', false); }
      else if (action === 'back' && explorerHistory.length > 1) { explorerHistory.pop(); goToExplorer(explorerHistory.at(-1), false); }
      else if (action === 'up') {
        const parents = { 'C:\\': 'My Computer', 'D:\\': 'My Computer', 'Network': 'My Computer', 'C:\\Users': 'C:\\', [userFolderPath]: 'C:\\Users', 'C:\\Projects': 'C:\\', 'C:\\Certificates': 'C:\\', 'C:\\Experience': 'C:\\', 'C:\\Skills': 'C:\\' };
        goToExplorer(parents[explorerPath] || (explorerPath.startsWith('C:\\') ? 'C:\\' : 'My Computer'));
      }
      return;
    }

    const tab = event.target.closest('[data-system-tab]');
    if (tab) { selectTab(tab.dataset.systemTab); return; }

    const contextAction = event.target.closest('[data-context-action]');
    if (contextAction) {
      const action = contextAction.dataset.contextAction;
      if (action === 'arrange') arrangeIcons();
      if (action === 'refresh') refreshDesktop();
      if (action === 'properties') openApp('display');
      if (action === 'open') {
        if (contextTarget?.type === 'project') openProject(contextTarget.id);
        else if (contextTarget?.type === 'recycle') openRecycleItem(recycleItems[Number(contextTarget.id)]);
        else if (contextTarget?.type === 'certificate') openCertificate(contextTarget.id);
        else if (contextTarget?.type === 'experience') openApp('experience');
        else if (contextTarget?.type === 'shortcut') contextTarget.externalKey ? openExternal(contextTarget.externalKey) : openApp(contextTarget.appId);
      }
      if (action === 'shortcut-properties') showProperties(contextTarget);
      if (action === 'window-properties') showProperties({ appId: contextTarget?.id, label: contextTarget?.label });
      if (action === 'window-restore') window.portfolioWindows?.restore(contextTarget?.id);
      if (action === 'window-focus') window.portfolioWindows?.focus(contextTarget?.id);
      if (action === 'window-minimize') window.portfolioWindows?.minimize(contextTarget?.id);
      if (action === 'window-maximize') window.portfolioWindows?.maximize(contextTarget?.id);
      if (action === 'window-close') window.portfolioWindows?.close(contextTarget?.id);
      if (action === 'copy') copyContextItem();
      if (action === 'delete') deleteContextItem();
      if (action === 'file-properties') {
        if (contextTarget?.type === 'project') openProject(contextTarget.id);
        else if (contextTarget?.type === 'certificate') openCertificate(contextTarget.id);
        else if (contextTarget?.type === 'experience') openApp('experience');
      }
      if (action === 'new-folder') createVirtualFolder();
      if (action === 'restore') {
        const item = recycleItems[Number(contextTarget?.id)];
        if (item?.projectId) deletedProjectIds.delete(item.projectId);
        recycleItems.splice(Number(contextTarget?.id), 1);
        window.portfolioWindows?.rerender('recycle');
        window.portfolioWindows?.rerender('projects');
        const pane = document.querySelector('[data-app="computer"] [data-explorer-items]');
        if (pane?.dataset.explorerPath === 'C:\\Projects') renderExplorer('C:\\Projects', false);
        showToast('Item restored.');
      }
      hideContextMenu();
      return;
    }

    const parent = event.target.closest('[data-start-parent]');
    if (parent) {
      const submenu = parent.parentElement.querySelector('.start-submenu');
      const expanded = parent.getAttribute('aria-expanded') === 'true';
      if (!expanded) closeStartSubmenus(parent);
      parent.setAttribute('aria-expanded', String(!expanded));
      submenu.hidden = expanded;
      submenu.classList.toggle('is-open', !expanded);
      if (!expanded) positionStartSubmenu(parent, submenu);
      return;
    }

    if (event.target.closest('[data-settings-apply]')) { saveSettings(); showToast('Display settings applied.'); return; }
    if (event.target.closest('[data-error-ok]')) { window.portfolioWindows?.close('error'); return; }
    if (event.target.closest('[data-confirm-delete]')) {
      const action = event.target.closest('[data-confirm-delete]').dataset.confirmDelete;
      if (action === 'confirm') completeDelete();
      else { pendingDelete = null; window.portfolioWindows?.close('confirm'); }
      return;
    }
    if (event.target.closest('[data-recycle-empty]')) {
      if (!recycleItems.length) { showToast('Recycle Bin is already empty.'); return; }
      pendingDelete = { type: 'empty-recycle' };
      window.portfolioWindows?.rerender('confirm');
      window.portfolioWindows?.open('confirm');
      return;
    }

    const recycleOpen = event.target.closest('[data-recycle-index]');
    if (recycleOpen) {
      openRecycleItem(recycleItems[Number(recycleOpen.dataset.recycleIndex)]);
      return;
    }

    if (event.target.closest('[data-shutdown-action]')) {
      const action = event.target.closest('[data-shutdown-action]').dataset.shutdownAction;
      const choice = document.querySelector('[data-app="shutdown"] input[name="shutdown-choice"]:checked')?.value || 'shutdown';
      if (action === 'cancel') window.portfolioWindows?.close('shutdown');
      else if (action === 'help') showToast('This only closes or restarts the portfolio page.');
      else if (choice === 'shutdown') {
        window.portfolioWindows?.reset();
        document.querySelector('[data-safe-screen]').hidden = false;
      } else if (choice === 'restart') restartPortfolio();
      else { window.portfolioWindows?.close('shutdown'); openApp('terminal'); }
      return;
    }

    if (event.target.closest('[data-restart]')) { restartPortfolio(); return; }
    if (event.target.closest('[data-skip-boot]')) { finishBoot(); return; }
    if (event.target.closest('[data-close-window]')) { window.portfolioWindows?.close(event.target.closest('[data-close-window]').dataset.closeWindow); return; }

    const runForm = event.target.closest('[data-run-form]');
    if (runForm && event.target.type === 'submit') return;
    if (event.target.closest('[data-start]')) {
      const startMenu = document.querySelector('[data-start-menu]');
      const expanded = event.target.closest('[data-start]').getAttribute('aria-expanded') === 'true';
      hideContextMenu();
      if (expanded) closeStartMenu();
      else {
        closeStartSubmenus();
        startMenu.hidden = false;
        event.target.closest('[data-start]').setAttribute('aria-expanded', 'true');
        startMenu.querySelector('.start-row')?.focus();
      }
      return;
    }

    const inMenu = event.target.closest('[data-start-menu]');
    if (!inMenu) closeStartMenu();
    if (!event.target.closest('[data-context-menu]')) hideContextMenu();
  });

  document.addEventListener('submit', event => {
    if (event.target.matches('[data-contact-form]')) {
      event.preventDefault();
      void submitContactForm(event.target);
      return;
    }
    if (event.target.matches('[data-new-folder-form]')) {
      event.preventDefault();
      commitVirtualFolder();
      return;
    }
    if (event.target.matches('[data-run-form]')) {
      event.preventDefault();
      const input = event.target.querySelector('input[name="command"]');
      const command = input.value.trim().toLowerCase();
      const aliases = {
        'my computer': 'computer', explorer: 'computer', cmd: 'terminal', 'ms-dos prompt': 'terminal',
        about: 'system', linkedin: 'linkedin', github: 'github', projects: 'projects', resume: 'resume', 'resume.pdf': 'resume',
        oracle: 'oracle', contact: 'contact', certificates: 'certificates', skills: 'skills', experience: 'experience',
        education: 'education', notepad: 'notepad', 'control panel': 'control', 'github explorer': 'githubExplorer'
      };
      const target = aliases[command];
      if (!target && /^https?:\/\//i.test(input.value.trim())) {
        window.portfolioWindows?.close('run');
        window.open(input.value.trim(), '_blank', 'noopener,noreferrer');
        return;
      }
      if (!target) {
        window.portfolioWindows?.close('run');
        showErrorDialog(command ? `Portfolio 95 could not find “${command}”.` : 'Enter a program, folder, or portfolio application name.');
        return;
      }
      window.portfolioWindows?.close('run');
      if (target === 'linkedin' || target === 'github') openExternal(target); else openApp(target);
      return;
    }
  });

  document.addEventListener('contextmenu', event => {
    const taskbarApp = event.target.closest('.taskbar-app');
    if (taskbarApp) {
      event.preventDefault();
      showWindowContextMenu(window.portfolioWindows?.getWindow(taskbarApp.dataset.taskbarApp), event.clientX, event.clientY, true);
      return;
    }
    const titleBar = event.target.closest('.title-bar');
    if (titleBar) {
      event.preventDefault();
      showWindowContextMenu(titleBar.closest('.window'), event.clientX, event.clientY);
      return;
    }
    const file = event.target.closest('[data-context-file]');
    if (file) {
      event.preventDefault();
      const type = file.dataset.contextType;
      showContextMenu(event.clientX, event.clientY, [
        { label: 'Open', action: 'open' }, { separator: true },
        { label: 'Copy', action: 'copy' }, { label: 'Delete', action: 'delete', disabled: !['project', 'recycle'].includes(type) }, { label: 'Properties', action: 'file-properties', disabled: !['project', 'certificate', 'experience'].includes(type) },
        ...(file.dataset.contextType === 'recycle' ? [{ label: 'Restore', action: 'restore' }] : [])
      ], { type: file.dataset.contextType, id: file.dataset.contextId, label: file.dataset.contextLabel });
      return;
    }
    const explorer = event.target.closest('[data-explorer-items]');
    if (explorer && explorer.dataset.explorerPath === 'C:\\') {
      event.preventDefault();
      showContextMenu(event.clientX, event.clientY, [
        { label: 'New Folder...', action: 'new-folder' }, { separator: true },
        { label: 'Properties', action: 'properties' }
      ], { type: 'explorer-background', path: explorer.dataset.explorerPath });
      return;
    }
    if (event.target.closest('#desktop') && !event.target.closest('.window, .modal-shield, .taskbar, .start-menu')) {
      event.preventDefault();
      const shortcut = event.target.closest('[data-shortcut]');
      if (shortcut) {
        showShortcutContextMenu(shortcut, event.clientX, event.clientY);
      } else {
        showContextMenu(event.clientX, event.clientY, [
          { label: 'Arrange Icons by Name', action: 'arrange' }, { label: 'Refresh', action: 'refresh' },
          { label: 'New Folder on C:...', action: 'new-folder' }, { label: 'Paste', disabled: true }, { label: 'Paste Shortcut', disabled: true }, { separator: true }, { label: 'Properties', action: 'properties' }
        ]);
      }
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-terminal-form]');
    if (form) event.preventDefault();
  });

  document.addEventListener('change', event => {
    const control = event.target.closest('[data-setting]');
    if (!control) return;
    settings[control.dataset.setting] = control.type === 'checkbox' ? control.checked : control.value;
    saveSettings();
  });

  document.addEventListener('reset', event => {
    if (!event.target.matches('[data-contact-form]')) return;
    event.target.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
    window.portfolioWindows?.setStatus('contact', 'Ready', '');
    contactInvalidControl = null;
  });

  document.addEventListener('input', event => {
    const field = event.target.closest('[data-contact-form] [name]');
    if (field) field.removeAttribute('aria-invalid');
  });

  document.addEventListener('keydown', event => {
    const target = event.target instanceof Element ? event.target : null;
    const systemTab = target?.closest('[data-system-tab]');
    if (systemTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      const tabs = [...systemTab.closest('[data-app="system"]').querySelectorAll('[data-system-tab]')];
      const currentIndex = tabs.indexOf(systemTab);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      event.preventDefault();
      selectTab(tabs[nextIndex].dataset.systemTab);
      tabs[nextIndex].focus();
      return;
    }
    if (event.key === 'Escape') {
      hideContextMenu();
      closeStartMenu();
    }
    if ((event.key === 'Enter' || event.key === ' ') && target?.matches('[data-shortcut]')) {
      event.preventDefault();
      if (target.dataset.shortcutType === 'external') openExternal(target.dataset.shortcutExternal);
      else openApp(target.dataset.shortcutApp);
    }
    const menuItem = target?.closest('[role="menuitem"]');
    const menu = menuItem?.closest('[role="menu"]');
    if (menuItem && menu && ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
      const submenu = menuItem.closest('.start-submenu');
      if (event.key === 'ArrowRight' && menuItem.hasAttribute('data-start-parent')) {
        const childMenu = menuItem.parentElement.querySelector('.start-submenu');
        if (childMenu) {
          event.preventDefault();
          closeStartSubmenus(menuItem);
          childMenu.hidden = false;
          childMenu.classList.add('is-open');
          menuItem.setAttribute('aria-expanded', 'true');
          positionStartSubmenu(menuItem, childMenu);
          childMenu.querySelector('[role="menuitem"]')?.focus();
        }
      } else if (event.key === 'ArrowLeft' && submenu) {
        event.preventDefault();
        const parent = submenu.parentElement.querySelector('[data-start-parent]');
        if (parent) {
          parent.setAttribute('aria-expanded', 'false');
          submenu.hidden = true;
          submenu.classList.remove('is-open');
        }
        parent?.focus();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        const focusable = [...menu.querySelectorAll('[role="menuitem"]')].filter(item => !item.disabled && item.getClientRects().length);
        if (focusable.length) {
          event.preventDefault();
          const current = focusable.indexOf(menuItem);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? focusable.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + focusable.length) % focusable.length;
          focusable[next].focus();
        }
      }
    }
    const keyboardContextTarget = target?.closest('[data-context-file], [data-shortcut], .taskbar-app, .title-bar');
    if (event.shiftKey && event.key === 'F10' && keyboardContextTarget) {
      const box = keyboardContextTarget.getBoundingClientRect();
      event.preventDefault();
      keyboardContextTarget.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: box.left + 10, clientY: box.top + 10 }));
    }
  });

  function bootSequence() {
    const screen = document.querySelector('[data-boot-screen]');
    const lines = document.querySelector('[data-boot-lines]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const steps = [
      'Checking system memory ........ OK',
      'Loading profile .............. OK',
      'Loading projects ............. OK',
      'Loading certificates ......... OK',
      'Loading Oracle DBA ........... OK',
      'Loading cybersecurity ........ OK',
      'Starting Windows 95...'
    ];
    lines.replaceChildren();
    if (reducedMotion) { finishBoot(); return; }
    steps.forEach((step, index) => {
      timers.push(window.setTimeout(() => {
        lines.append(node('div', '', step));
        if (index === steps.length - 1) finishBoot();
      }, 110 * (index + 1)));
    });
    screen.hidden = false;
  }

  function finishBoot() {
    timers.splice(0).forEach(timer => window.clearTimeout(timer));
    document.querySelector('[data-boot-screen]').hidden = true;
    if (document.querySelector('[data-safe-screen]').hidden) {
      window.portfolioWindows?.open('system');
      showToast(`Welcome, ${profile.name}.`);
      startFeedbackTimer();
    }
  }

  function restartPortfolio() {
    document.querySelector('[data-safe-screen]').hidden = true;
    window.portfolioWindows?.reset();
    bootSequence();
  }

  function updateClock() {
    const clock = document.querySelector('[data-clock]');
    const current = new Date();
    clock.dateTime = current.toISOString();
    const is24Hour = settings.clockFormat === '24';
    const options = { hour: is24Hour ? '2-digit' : 'numeric', minute: '2-digit' };
    if (is24Hour) options.hourCycle = 'h23';
    else options.hour12 = true;
    clock.textContent = new Intl.DateTimeFormat(undefined, options).format(current);
  }

  updateClock();
  window.setInterval(updateClock, 1000);
  bootSequence();
})();
