(function () {
  'use strict';

  const registry = window.PORTFOLIO_APPS.registry;
  const layer = document.querySelector('[data-window-layer]');
  const taskbar = document.querySelector('.taskbar');
  const taskbarApps = document.querySelector('[data-taskbar-apps]');
  const startButton = document.querySelector('[data-start]');
  const windows = new Map();
  let zIndexCounter = 10;
  let windowOpenSequence = 0;
  let activeWindowId = null;
  let modalShield = null;
  let modalReturnId = null;

  function icon(name) {
    const image = document.createElement('img');
    image.src = `assets/icons/${name}`;
    image.alt = '';
    return image;
  }

  function button(label, className, attrs = {}) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = className;
    item.textContent = label;
    Object.entries(attrs).forEach(([key, value]) => item.setAttribute(key, value));
    return item;
  }

  function createWindow(id, app) {
    const win = document.createElement('section');
    win.className = `window${app.dialog ? ' is-dialog' : ''}${app.modal ? ' is-modal' : ''}${app.resizable === false ? ' is-fixed-size' : ''}${id === 'terminal' ? ' is-terminal' : ''}`;
    win.id = `window-${id}`;
    win.dataset.window = id;
    win.dataset.app = id;
    win.hidden = true;
    win.setAttribute('role', app.dialog ? 'dialog' : 'region');
    if (app.modal) win.setAttribute('aria-modal', 'true');
    win.setAttribute('aria-label', app.title);
    win.style.width = `${app.defaultWidth}px`;
    win.style.height = `${app.defaultHeight}px`;
    win.style.minWidth = `${app.minWidth}px`;
    win.style.minHeight = `${app.minHeight}px`;

    const titleBar = document.createElement('header');
    titleBar.className = 'title-bar';
    titleBar.dataset.dragHandle = '';
    const label = document.createElement('div');
    label.className = 'title-bar-label';
    label.append(icon(app.icon));
    const title = document.createElement('span');
    title.textContent = app.title;
    label.append(title);
    const controls = document.createElement('div');
    controls.className = 'title-bar-controls';
    if (!app.dialog) {
      controls.append(controlButton('minimize-button', 'Minimize', 'minimize'));
      if (app.resizable !== false) controls.append(controlButton('maximize-button', 'Maximize', 'maximize'));
    }
    controls.append(controlButton('close-button', 'Close', 'close'));
    titleBar.append(label, controls);
    win.append(titleBar);
    if (!app.dialog) win.append(makeMenuBar(id));

    const body = document.createElement('div');
    body.className = 'window-client';
    body.dataset.windowBody = '';
    const content = window.PORTFOLIO_APP_RENDERER?.(id);
    if (content) body.append(content);
    win.append(body);

    if (!body.querySelector('.window-status')) {
      const status = document.createElement('footer');
      status.className = 'window-status';
      const first = document.createElement('span');
      first.dataset.statusMain = '';
      first.textContent = app.status || 'Ready';
      const second = document.createElement('span');
      second.dataset.statusDetail = '';
      second.textContent = 'Portfolio 95';
      status.append(first, second);
      win.append(status);
    }

    if (id === 'contact') {
      const status = win.querySelector('.window-status');
      const detail = status?.querySelector('[data-status-detail]');
      if (detail) detail.textContent = '';
      status?.setAttribute('role', 'status');
      status?.setAttribute('aria-live', 'polite');
    }

    layer.append(win);
    windows.set(id, win);
    return win;
  }

  function controlButton(className, label, action) {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = `title-button ${className}`;
    control.dataset[action === 'close' ? 'close' : action] = '';
    control.setAttribute('aria-label', `${label} window`);
    const glyph = document.createElement('span');
    glyph.setAttribute('aria-hidden', 'true');
    control.append(glyph);
    return control;
  }

  function makeMenuBar(id) {
    const bar = document.createElement('nav');
    bar.className = 'window-menubar';
    bar.setAttribute('aria-label', 'Window menu');
    const menus = {
      File: [['Close Window', 'close']],
      Edit: [['Select All', 'select-all']],
      View: [['Maximize / Restore', 'maximize']],
      Help: [['About Portfolio 95', 'about']]
    };
    Object.entries(menus).forEach(([label, actions]) => {
      const group = document.createElement('div');
      group.className = 'window-menu-group';
      const trigger = button(label, 'menubar-item', { 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
      trigger.dataset.windowMenuToggle = '';
      const popup = document.createElement('div');
      popup.className = 'window-menu-popup';
      popup.setAttribute('role', 'menu');
      popup.hidden = true;
      actions.forEach(([actionLabel, action]) => {
        const item = button(actionLabel, 'window-menu-command', { role: 'menuitem' });
        item.dataset.windowMenuAction = action;
        item.dataset.windowMenuId = id;
        popup.append(item);
      });
      group.append(trigger, popup);
      bar.append(group);
    });
    return bar;
  }

  function getWindow(id) { return windows.get(id) || null; }
  function workArea() {
    const rect = layer.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
  }
  const lastGeometry = new Map();
  let previousWorkArea = null;
  function windowSize(win) {
    return {
      width: win.offsetWidth || parseFloat(win.style.width) || 420,
      height: win.offsetHeight || parseFloat(win.style.height) || 320
    };
  }
  function saveWindowGeometry(win, area = workArea()) {
    if (!win || win.classList.contains('is-maximized')) return;
    const rect = win.getBoundingClientRect();
    const size = windowSize(win);
    const left = Number.parseFloat(win.style.left);
    const top = Number.parseFloat(win.style.top);
    lastGeometry.set(win.dataset.window, {
      left: Number.isFinite(left) ? left : rect.left - area.left,
      top: Number.isFinite(top) ? top : rect.top - area.top,
      width: size.width,
      height: size.height,
      areaWidth: area.width,
      areaHeight: area.height
    });
  }
  function getOpenModal() {
    for (const [id, win] of windows) if (registry[id].modal && !win.hidden) return id;
    return null;
  }

  function fitWindowToWorkArea(id) {
    const win = getWindow(id);
    const app = registry[id];
    if (!win || !app) return;
    const area = workArea();
    const margin = window.matchMedia('(max-width: 650px)').matches ? 4 : 8;
    const maxWidth = Math.max(1, area.width - margin * 2);
    const maxHeight = Math.max(1, area.height - margin * 2);
    const width = win.dataset.userSized === 'true' ? parseFloat(win.style.width) || app.defaultWidth : app.defaultWidth;
    const height = win.dataset.userSized === 'true' ? parseFloat(win.style.height) || app.defaultHeight : app.defaultHeight;
    win.style.minWidth = `${Math.min(app.minWidth, maxWidth)}px`;
    win.style.minHeight = `${Math.min(app.minHeight, maxHeight)}px`;
    win.style.width = `${Math.min(width, maxWidth)}px`;
    win.style.height = `${Math.min(height, maxHeight)}px`;
  }

  function getCenteredWindowPosition(width, height, cascadeOffset = 0) {
    const area = workArea();
    const maxX = Math.max(0, area.width - width);
    const maxY = Math.max(0, area.height - height);
    const offset = Number(cascadeOffset) || 0;
    const centeredX = Math.round((area.width - width) / 2) + offset;
    const centeredY = Math.round((area.height - height) / 2) + offset;
    return {
      left: Math.max(0, Math.min(maxX, centeredX)),
      top: Math.max(0, Math.min(maxY, centeredY))
    };
  }

  function getBestWindowPosition(winOrId) {
    const win = typeof winOrId === 'string' ? getWindow(winOrId) : winOrId;
    const size = win ? windowSize(win) : { width: 420, height: 320 };
    return getCenteredWindowPosition(size.width, size.height);
  }

  function centerWindow(win, cascadeOffset = 0) {
    const size = windowSize(win);
    const position = getCenteredWindowPosition(size.width, size.height, cascadeOffset);
    win.style.left = `${position.left}px`;
    win.style.top = `${position.top}px`;
  }

  function arrangeCenteredWindows(area = workArea()) {
    const margin = window.matchMedia('(max-width: 650px)').matches ? 4 : 8;
    const open = [...windows.entries()]
      .filter(([id, win]) => !registry[id].dialog && !win.hidden && win.dataset.positionMode === 'centered' && !win.classList.contains('is-maximized'))
      .sort((a, b) => Number(a[1].dataset.openSequence) - Number(b[1].dataset.openSequence));
    if (!open.length) return;
    open.forEach(([id]) => fitWindowToWorkArea(id));

    let step = 30;
    let maxBase = Infinity;
    while (step >= 0) {
      maxBase = Math.min(...open.map(([, win], index) => area.height - windowSize(win).height - margin - index * step));
      if (maxBase >= margin || step === 0) break;
      step -= 1;
    }
    const desiredBase = open.reduce((sum, [, win], index) => (
      sum + (Math.round((area.height - windowSize(win).height) / 2) - index * step)
    ), 0) / open.length;
    const base = Math.round(Math.max(margin, Math.min(maxBase, desiredBase)));
    open.forEach(([, win], index) => {
      const size = windowSize(win);
      const maxX = Math.max(0, area.width - size.width);
      const centeredX = Math.round((area.width - size.width) / 2);
      const horizontalNudge = Math.min(index, 4) * 12;
      win.style.left = `${Math.max(0, Math.min(maxX, centeredX + horizontalNudge))}px`;
      win.style.top = `${Math.max(0, Math.min(area.height - size.height, base + index * step))}px`;
      saveWindowGeometry(win, area);
    });
  }

  function positionManuallyPlacedWindow(win, geometry, area = workArea()) {
    const size = windowSize(win);
    const maxX = Math.max(0, area.width - size.width);
    const maxY = Math.max(0, area.height - size.height);
    const oldMaxX = Math.max(0, geometry.areaWidth - geometry.width);
    const oldMaxY = Math.max(0, geometry.areaHeight - geometry.height);
    const relativeX = oldMaxX ? geometry.left / oldMaxX : 0.5;
    const relativeY = oldMaxY ? geometry.top / oldMaxY : 0.5;
    win.style.left = `${Math.round(Math.max(0, Math.min(maxX, relativeX * maxX)))}px`;
    win.style.top = `${Math.round(Math.max(0, Math.min(maxY, relativeY * maxY)))}px`;
  }

  function addModalShield() {
    if (!modalShield) {
      modalShield = document.createElement('div');
      modalShield.className = 'modal-shield';
      modalShield.setAttribute('aria-hidden', 'true');
      layer.append(modalShield);
    }
    modalShield.hidden = false;
    modalShield.style.zIndex = String(++zIndexCounter);
    if (startButton) startButton.disabled = true;
  }

  function removeModalShield() {
    modalShield?.remove();
    modalShield = null;
    if (startButton) startButton.disabled = false;
  }

  function updateTaskbar() {
    const previousScroll = taskbarApps.scrollLeft;
    taskbarApps.replaceChildren();
    const modalId = getOpenModal();
    let activeButton = null;
    windows.forEach((win, id) => {
      if (win.hidden || registry[id].dialog) return;
      const title = win.querySelector('.title-bar-label span')?.textContent || registry[id].title;
      const taskbarTitle = title.replace(/^C:\\/, '').replace(/\.pdf$/i, '');
      const buttonNode = document.createElement('button');
      buttonNode.type = 'button';
      buttonNode.className = 'taskbar-app';
      buttonNode.dataset.taskbarApp = id;
      if (win.classList.contains('is-active')) buttonNode.classList.add('is-active');
      if (win.classList.contains('is-minimized')) buttonNode.classList.add('is-minimized');
      buttonNode.title = taskbarTitle;
      const state = win.classList.contains('is-active') ? 'Minimize' : win.classList.contains('is-minimized') ? 'Restore' : 'Switch to';
      buttonNode.setAttribute('aria-label', `${state} ${taskbarTitle}`);
      buttonNode.setAttribute('aria-pressed', String(win.classList.contains('is-active')));
      buttonNode.disabled = Boolean(modalId && modalId !== id);
      buttonNode.append(icon(registry[id].icon));
      const text = document.createElement('span');
      text.textContent = taskbarTitle;
      buttonNode.append(text);
      if (win.classList.contains('is-active')) activeButton = buttonNode;
      taskbarApps.append(buttonNode);
    });
    taskbarApps.scrollLeft = previousScroll;
    if (activeButton) {
      const containerRect = taskbarApps.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const visibleLeft = taskbarApps.scrollLeft;
      const visibleRight = visibleLeft + taskbarApps.clientWidth;
      const buttonLeft = buttonRect.left - containerRect.left + taskbarApps.scrollLeft;
      const buttonRight = buttonLeft + activeButton.offsetWidth;
      if (buttonLeft < visibleLeft) taskbarApps.scrollLeft = buttonLeft;
      else if (buttonRight > visibleRight) taskbarApps.scrollLeft = buttonRight - taskbarApps.clientWidth;
    }
  }

  function focus(id) {
    const win = getWindow(id);
    const modalId = getOpenModal();
    if (!win || win.hidden || win.classList.contains('is-minimized') || (modalId && id !== modalId)) return false;
    windows.forEach(item => item.classList.remove('is-active'));
    win.classList.add('is-active');
    win.style.zIndex = String(++zIndexCounter);
    activeWindowId = id;
    updateTaskbar();
    window.dispatchEvent(new CustomEvent('portfolio:window-focus', { detail: { id } }));
    return true;
  }

  function focusModalContent(id) {
    const win = getWindow(id);
    const target = win?.querySelector('[autofocus]') || win?.querySelector('.window-client input:not([type=hidden]), .window-client button:not(:disabled), .window-client a[href], .window-client select, .window-client textarea, .window-client [tabindex]:not([tabindex="-1"])');
    (target || win)?.focus?.();
  }

  function open(id) {
    const win = getWindow(id);
    if (!win) return null;
    const currentModal = getOpenModal();
    if (currentModal && currentModal !== id) return getWindow(currentModal);
    const app = registry[id];
    const firstOpen = win.hidden && !win.dataset.positioned;
    const wasHidden = win.hidden;
    win.hidden = false;
    win.classList.remove('is-minimized');
    if (firstOpen) {
      fitWindowToWorkArea(id);
      centerWindow(win);
      win.style.transform = 'none';
      win.dataset.positioned = 'true';
      win.dataset.positionMode = 'centered';
      win.dataset.openSequence = String(++windowOpenSequence);
      saveWindowGeometry(win);
    }
    if (app.modal && !currentModal) {
      modalReturnId = activeWindowId && activeWindowId !== id ? activeWindowId : null;
      addModalShield();
    }
    focus(id);
    if (firstOpen && !app.dialog) arrangeCenteredWindows();
    if (app.modal && wasHidden) window.requestAnimationFrame(() => focusModalContent(id));
    window.dispatchEvent(new CustomEvent('portfolio:window-open', { detail: { id, window: win } }));
    return win;
  }

  function hideWindowMenus() {
    document.querySelectorAll('[data-window-menu-toggle]').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('.window-menu-popup').forEach(popup => { popup.hidden = true; });
  }

  function restoreDefaultSizeAndPosition(win) {
    const app = registry[win.dataset.window];
    win.style.width = `${app.defaultWidth}px`;
    win.style.height = `${app.defaultHeight}px`;
    win.style.minWidth = `${app.minWidth}px`;
    win.style.minHeight = `${app.minHeight}px`;
    win.style.removeProperty('left');
    win.style.removeProperty('top');
    win.style.transform = '';
    delete win.dataset.positioned;
    delete win.dataset.positionMode;
    delete win.dataset.openSequence;
    delete win.dataset.userSized;
    delete win.dataset.restoreStyle;
    lastGeometry.delete(win.dataset.window);
    const maximize = win.querySelector('[data-maximize]');
    maximize?.classList.remove('is-restored');
    maximize?.setAttribute('aria-label', 'Maximize window');
  }

  function close(id) {
    const win = typeof id === 'string' ? getWindow(id) : id;
    if (!win || win.hidden) return;
    const winId = win.dataset.window;
    const wasActive = activeWindowId === winId;
    const wasModal = Boolean(registry[winId].modal);
    win.hidden = true;
    win.classList.remove('is-active', 'is-minimized', 'is-maximized');
    hideWindowMenus();
    restoreDefaultSizeAndPosition(win);
    if (wasModal) removeModalShield();
    updateTaskbar();
    if (wasActive) activeWindowId = null;
    const returnId = wasModal ? modalReturnId : null;
    if (wasModal) modalReturnId = null;
    if (returnId && !getWindow(returnId)?.hidden) focus(returnId);
    else if (wasActive || wasModal) focusTopWindow();
    window.dispatchEvent(new CustomEvent('portfolio:window-close', { detail: { id: winId } }));
  }

  function focusTopWindow() {
    const next = [...windows.values()]
      .filter(win => !win.hidden && !win.classList.contains('is-minimized'))
      .sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];
    if (next) focus(next.dataset.window);
    else { activeWindowId = null; updateTaskbar(); }
  }

  function minimize(id) {
    const win = getWindow(id);
    if (!win || registry[id].dialog || win.hidden || win.classList.contains('is-minimized')) return;
    win.classList.add('is-minimized');
    win.classList.remove('is-active');
    if (activeWindowId === id) activeWindowId = null;
    updateTaskbar();
    focusTopWindow();
  }

  function restore(id) {
    const win = getWindow(id);
    if (!win || win.hidden) return null;
    if (win.classList.contains('is-maximized')) toggleMaximize(id);
    win.classList.remove('is-minimized');
    focus(id);
    return win;
  }

  function maximize(id) {
    const win = getWindow(id);
    if (!win || win.hidden) return win;
    win.classList.remove('is-minimized');
    if (!win.classList.contains('is-maximized')) toggleMaximize(id);
    else focus(id);
    return win;
  }

  function toggleMaximize(id) {
    const win = getWindow(id);
    if (!win || win.hidden || registry[id].resizable === false || getOpenModal() && getOpenModal() !== id) return;
    const maximize = win.querySelector('[data-maximize]');
    if (!win.classList.contains('is-maximized')) {
      saveWindowGeometry(win);
      win.dataset.restoreStyle = JSON.stringify({
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
        minWidth: win.style.minWidth,
        minHeight: win.style.minHeight,
        transform: win.style.transform
      });
      win.classList.add('is-maximized');
      maximize?.classList.add('is-restored');
      maximize?.setAttribute('aria-label', 'Restore window');
    } else {
      win.classList.remove('is-maximized');
      try {
        const saved = JSON.parse(win.dataset.restoreStyle || '{}');
        Object.entries(saved).forEach(([key, value]) => { win.style[key] = value; });
      } catch (_) { /* Keep the current size if no saved window geometry is available. */ }
      delete win.dataset.restoreStyle;
      fitWindowToWorkArea(id);
      if (win.dataset.positionMode === 'centered') {
        centerWindow(win, Number(win.dataset.cascadeOffset) || 0);
      } else {
        const geometry = lastGeometry.get(id);
        if (geometry) positionManuallyPlacedWindow(win, geometry);
        else clampToWorkArea(win);
      }
      saveWindowGeometry(win);
      maximize?.classList.remove('is-restored');
      maximize?.setAttribute('aria-label', 'Maximize window');
    }
    focus(id);
  }

  function clampToWorkArea(win) {
    if (!win || win.hidden || win.classList.contains('is-maximized') || win.classList.contains('is-minimized')) return;
    const id = win.dataset.window;
    fitWindowToWorkArea(id);
    const area = workArea();
    const rect = win.getBoundingClientRect();
    const size = windowSize(win);
    const leftValue = Number.parseFloat(win.style.left);
    const topValue = Number.parseFloat(win.style.top);
    const currentLeft = Number.isFinite(leftValue) ? leftValue : rect.left - area.left;
    const currentTop = Number.isFinite(topValue) ? topValue : rect.top - area.top;
    const left = Math.max(0, Math.min(area.width - size.width, currentLeft));
    const top = Math.max(0, Math.min(area.height - size.height, currentTop));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.style.transform = 'none';
  }

  function handleViewportResize() {
    const area = workArea();
    windows.forEach((win, id) => {
      if (win.hidden || !win.dataset.positioned || win.classList.contains('is-maximized')) return;
      const geometry = lastGeometry.get(id) || {
        left: Number.parseFloat(win.style.left) || 0,
        top: Number.parseFloat(win.style.top) || 0,
        ...windowSize(win),
        areaWidth: previousWorkArea?.width || area.width,
        areaHeight: previousWorkArea?.height || area.height
      };
      fitWindowToWorkArea(id);
      if (win.dataset.positionMode === 'centered') {
        centerWindow(win, Number(win.dataset.cascadeOffset) || 0);
      } else {
        positionManuallyPlacedWindow(win, geometry, area);
      }
      saveWindowGeometry(win, area);
    });
    previousWorkArea = area;
  }

  function setTitle(id, title) {
    const win = getWindow(id);
    if (!win) return;
    const label = win.querySelector('.title-bar-label span');
    if (label) label.textContent = title;
    win.setAttribute('aria-label', title);
    updateTaskbar();
  }

  function setStatus(id, message, detail = null) {
    const win = getWindow(id);
    const status = win?.querySelector('.window-status');
    if (!status) return;
    const parts = status.querySelectorAll('span');
    if (parts[0]) parts[0].textContent = message;
    if (parts[1] && detail !== null) parts[1].textContent = detail;
  }

  function rerender(id) {
    const win = getWindow(id);
    if (!win) return null;
    const body = win.querySelector('[data-window-body]');
    const content = window.PORTFOLIO_APP_RENDERER?.(id);
    if (body && content) body.replaceChildren(content);
    return win;
  }

  function reset() {
    windows.forEach(win => {
      win.hidden = true;
      win.classList.remove('is-active', 'is-minimized', 'is-maximized');
      restoreDefaultSizeAndPosition(win);
    });
    removeModalShield();
    modalReturnId = null;
    activeWindowId = null;
    lastGeometry.clear();
    previousWorkArea = workArea();
    hideWindowMenus();
    updateTaskbar();
    window.dispatchEvent(new CustomEvent('portfolio:windows-reset'));
  }

  function handleMenuClick(event) {
    const toggle = event.target.closest('[data-window-menu-toggle]');
    if (toggle) {
      const group = toggle.closest('.window-menu-group');
      const popup = group.querySelector('.window-menu-popup');
      const shouldOpen = popup.hidden;
      hideWindowMenus();
      popup.hidden = !shouldOpen;
      toggle.setAttribute('aria-expanded', String(shouldOpen));
      return true;
    }
    const action = event.target.closest('[data-window-menu-action]');
    if (action) {
      const id = action.dataset.windowMenuId;
      const kind = action.dataset.windowMenuAction;
      hideWindowMenus();
      if (kind === 'close') close(id);
      else if (kind === 'maximize') toggleMaximize(id);
      else if (kind === 'about') open('system');
      else if (kind === 'select-all') {
        const win = getWindow(id);
        const control = win?.querySelector('.window-client input:focus, .window-client textarea:focus, .window-client [contenteditable="true"]:focus');
        if (typeof control?.select === 'function') control.select();
        else if (win) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(win.querySelector('.window-client'));
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      return true;
    }
    if (!event.target.closest('.window-menu-popup')) hideWindowMenus();
    return false;
  }

  function handleWindowControls(event) {
    const closeButton = event.target.closest('[data-close]');
    const minimizeButton = event.target.closest('[data-minimize]');
    const maximizeButton = event.target.closest('[data-maximize]');
    if (closeButton) close(closeButton.closest('[data-window]')?.dataset.window);
    else if (minimizeButton) minimize(minimizeButton.closest('[data-window]')?.dataset.window);
    else if (maximizeButton) toggleMaximize(maximizeButton.closest('[data-window]')?.dataset.window);
  }

  function handleKeydown(event) {
    const modalId = getOpenModal();
    if (modalId && event.key === 'Escape') {
      event.preventDefault();
      close(modalId);
      return;
    }
    if (modalId && event.key === 'Tab') {
      const modal = getWindow(modalId);
      const focusable = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(item => item.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); modal.focus(); return; }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
      return;
    }
    if (event.altKey && event.key === 'F4') {
      const active = activeWindowId && getWindow(activeWindowId);
      if (active) { event.preventDefault(); close(active.dataset.window); }
    }
  }

  function startWindowDrag(win, titlebar, event) {
    if (event.button !== 0 || event.target.closest('button') || win.classList.contains('is-maximized') || registry[win.dataset.window].dialog) return;
    const area = workArea();
    const bounds = win.getBoundingClientRect();
    const grabX = event.clientX - bounds.left;
    const grabY = event.clientY - bounds.top;
    win.style.left = `${bounds.left - area.left}px`;
    win.style.top = `${bounds.top - area.top}px`;
    win.style.transform = 'none';
    titlebar.setPointerCapture(event.pointerId);
    const move = moveEvent => {
      const maxX = Math.max(0, area.width - win.offsetWidth);
      const maxY = Math.max(0, area.height - win.offsetHeight);
      const nextLeft = Math.max(0, Math.min(maxX, moveEvent.clientX - area.left - grabX));
      const nextTop = Math.max(0, Math.min(maxY, moveEvent.clientY - area.top - grabY));
      win.style.left = `${nextLeft}px`;
      win.style.top = `${nextTop}px`;
      win.dataset.positionMode = 'manual';
    };
    const stop = () => {
      titlebar.removeEventListener('pointermove', move);
      titlebar.removeEventListener('pointerup', stop);
      titlebar.removeEventListener('pointercancel', stop);
      if (win.dataset.positionMode === 'manual') saveWindowGeometry(win);
    };
    titlebar.addEventListener('pointermove', move);
    titlebar.addEventListener('pointerup', stop);
    titlebar.addEventListener('pointercancel', stop);
  }

  Object.entries(registry).forEach(([id, app]) => createWindow(id, app));
  window.portfolioWindows = {
    open, close, focus, minimize, maximize: toggleMaximize, restore, reset, setTitle, setStatus, rerender,
    openWindow: open, closeWindow: close, focusWindow: focus, minimizeWindow: minimize,
    maximizeWindow: maximize, restoreWindow: restore, calculateWindowPosition: getBestWindowPosition,
    getBestWindowPosition, getCenteredWindowPosition,
    getActiveWindow: () => activeWindowId,
    getWindow: id => getWindow(id)
  };
  window.windowManager = window.portfolioWindows;
  updateTaskbar();
  window.dispatchEvent(new CustomEvent('portfolio:windows-ready'));

  taskbarApps.addEventListener('click', event => {
    const item = event.target.closest('.taskbar-app');
    if (!item) return;
    const id = item.dataset.taskbarApp;
    if (!id) return;
    const win = getWindow(id);
    if (win.classList.contains('is-active')) minimize(id);
    else { win.classList.remove('is-minimized'); focus(id); }
  });
  document.addEventListener('click', event => {
    if (handleMenuClick(event)) return;
    handleWindowControls(event);
  });
  document.addEventListener('keydown', handleKeydown);
  windows.forEach((win, id) => {
    win.addEventListener('pointerdown', event => {
      focus(id);
      const bounds = win.getBoundingClientRect();
      if (registry[id].resizable !== false && event.clientX >= bounds.right - 18 && event.clientY >= bounds.bottom - 18) {
        win.dataset.userSized = 'true';
      }
    });
    win.addEventListener('pointerup', () => {
      if (win.dataset.userSized === 'true' && !win.classList.contains('is-maximized')) {
        clampToWorkArea(win);
        saveWindowGeometry(win);
      }
    });
    const titlebar = win.querySelector('[data-drag-handle]');
    titlebar.addEventListener('dblclick', event => {
      if (!event.target.closest('button')) toggleMaximize(id);
    });
    titlebar.addEventListener('pointerdown', event => startWindowDrag(win, titlebar, event));
  });
  previousWorkArea = workArea();
  window.addEventListener('resize', handleViewportResize);
})();
