/**
 * Command Palette (Cmd+K)
 * Fortune 500 style quick navigation
 */

(function() {
  'use strict';

  // Command palette data
  const commands = [
    // Pages
    { id: 'home', title: 'Home', desc: 'Return to homepage', icon: '🏠', href: 'index.html', section: 'Pages', shortcut: 'G H' },
    { id: 'about', title: 'About Us', desc: 'Learn about our company', icon: '🏢', href: 'about.html', section: 'Pages', shortcut: 'G A' },
    { id: 'services', title: 'Services', desc: 'View our construction services', icon: '🛠️', href: 'services.html', section: 'Pages', shortcut: 'G S' },
    { id: 'projects', title: 'Projects', desc: 'Explore our portfolio', icon: '📁', href: 'projects.html', section: 'Pages', shortcut: 'G P' },
    { id: 'contact', title: 'Contact', desc: 'Get in touch with us', icon: '📞', href: 'contact.html', section: 'Pages', shortcut: 'G C' },
    
    // Quick Actions
    { id: 'whatsapp', title: 'Chat on WhatsApp', desc: 'Start a conversation', icon: '💬', href: 'https://wa.me/27661200064', section: 'Quick Actions', external: true, shortcut: 'W' },
    { id: 'call', title: 'Call Now', desc: '+27 66 120 0064', icon: '📱', href: 'tel:+27661200064', section: 'Quick Actions', shortcut: 'C' },
    { id: 'calculator', title: 'Cost Calculator', desc: 'Estimate your project cost', icon: '🧮', href: 'index.html#calculator', section: 'Quick Actions', shortcut: 'E' },
    { id: 'projects-filter', title: 'Filter Projects', desc: 'Browse by category', icon: '🔍', href: 'projects.html', section: 'Quick Actions', shortcut: 'F' },
    
    // Sections
    { id: 'services-section', title: 'Our Services', desc: 'Jump to services section', icon: '⚙️', href: 'index.html#services', section: 'Jump to Section', shortcut: 'J S' },
    { id: 'projects-section', title: 'Featured Projects', desc: 'Jump to projects section', icon: '🏗️', href: 'index.html#projects', section: 'Jump to Section', shortcut: 'J P' },
    { id: 'process-section', title: 'Our Process', desc: 'How we work', icon: '📋', href: 'index.html#process', section: 'Jump to Section', shortcut: 'J W' },
    { id: 'testimonials-section', title: 'Testimonials', desc: 'What clients say', icon: '💬', href: 'index.html#testimonials', section: 'Jump to Section', shortcut: 'J T' },
    { id: 'faq-section', title: 'FAQ', desc: 'Common questions', icon: '❓', href: 'index.html#faq', section: 'Jump to Section', shortcut: 'J F' },
    
    // Theme
    { id: 'theme-dark', title: 'Dark Mode', desc: 'Switch to dark theme', icon: '🌙', action: 'theme:dark', section: 'Preferences', shortcut: 'T D' },
    { id: 'theme-light', title: 'Light Mode', desc: 'Switch to light theme', icon: '☀️', action: 'theme:light', section: 'Preferences', shortcut: 'T L' },
    
    // Navigation
    { id: 'scroll-top', title: 'Scroll to Top', desc: 'Jump to page top', icon: '⬆️', action: 'scroll:top', section: 'Navigation', shortcut: '↑' },
    { id: 'scroll-bottom', title: 'Scroll to Bottom', desc: 'Jump to page bottom', icon: '⬇️', action: 'scroll:bottom', section: 'Navigation', shortcut: '↓' },
  ];

  let paletteOpen = false;
  let selectedIndex = 0;
  let filteredCommands = [];
  let paletteEl = null;
  let inputEl = null;
  let contentEl = null;

  // Initialize
  function init() {
    createPalette();
    createTrigger();
    bindEvents();
    bindShortcuts();
  }

  // Create palette DOM
  function createPalette() {
    const overlay = document.createElement('div');
    overlay.className = 'cmd-palette-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.innerHTML = `
      <div class="cmd-palette">
        <div class="cmd-palette-header">
          <svg class="cmd-palette-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" class="cmd-palette-input" placeholder="Search commands..." autocomplete="off" spellcheck="false">
          <div class="cmd-palette-kbd">
            <span>ESC</span>
            <span>to close</span>
          </div>
        </div>
        <div class="cmd-palette-content"></div>
        <div class="cmd-palette-footer">
          <div class="cmd-palette-footer-hints">
            <div class="cmd-palette-footer-hint">
              <span class="cmd-palette-footer-kbd">↑↓</span>
              <span>navigate</span>
            </div>
            <div class="cmd-palette-footer-hint">
              <span class="cmd-palette-footer-kbd">↵</span>
              <span>select</span>
            </div>
          </div>
          <span>${commands.length} commands available</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    paletteEl = overlay;
    inputEl = overlay.querySelector('.cmd-palette-input');
    contentEl = overlay.querySelector('.cmd-palette-content');
  }

  // Create navbar trigger
  function createTrigger() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const trigger = document.createElement('button');
    trigger.className = 'cmd-palette-trigger';
    trigger.setAttribute('aria-label', 'Open command palette');
    trigger.innerHTML = `
      <svg class="cmd-palette-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <span>Search</span>
      <div class="cmd-palette-trigger-kbd">
        <span>⌘</span>
        <span>K</span>
      </div>
    `;
    
    trigger.addEventListener('click', openPalette);
    
    // Insert after nav-links
    const quoteBtn = nav.querySelector('.quote-btn');
    if (quoteBtn) {
      nav.insertBefore(trigger, quoteBtn);
    } else {
      nav.appendChild(trigger);
    }
  }

  // Bind events
  function bindEvents() {
    // Close on overlay click
    paletteEl.addEventListener('click', (e) => {
      if (e.target === paletteEl) closePalette();
    });

    // Input handling
    inputEl.addEventListener('input', (e) => {
      filterCommands(e.target.value);
    });

    // Keyboard navigation
    paletteEl.addEventListener('keydown', (e) => {
      if (!paletteOpen) return;

      switch(e.key) {
        case 'Escape':
          e.preventDefault();
          closePalette();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateSelection(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateSelection(-1);
          break;
        case 'Enter':
          e.preventDefault();
          executeSelection();
          break;
        case 'Tab':
          e.preventDefault();
          navigateSelection(e.shiftKey ? -1 : 1);
          break;
      }
    });
  }

  // Bind global shortcuts
  function bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }

      // / to open (if not in input)
      if (e.key === '/' && !isInputActive()) {
        e.preventDefault();
        openPalette();
        return;
      }

      // Quick shortcuts when palette is closed
      if (!paletteOpen && !isInputActive()) {
        handleQuickShortcuts(e);
      }
    });
  }

  function isInputActive() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }

  function handleQuickShortcuts(e) {
    // G + letter for page navigation
    if (e.key === 'g' && !e.repeat) {
      document.addEventListener('keydown', function gNav(ev) {
        if (ev.key === 'h') window.location.href = 'index.html';
        if (ev.key === 'a') window.location.href = 'about.html';
        if (ev.key === 's') window.location.href = 'services.html';
        if (ev.key === 'p') window.location.href = 'projects.html';
        if (ev.key === 'c') window.location.href = 'contact.html';
        document.removeEventListener('keydown', gNav);
      }, { once: true });
      
      setTimeout(() => {
        document.removeEventListener('keydown', gNav);
      }, 500);
      return;
    }
  }

  function togglePalette() {
    paletteOpen ? closePalette() : openPalette();
  }

  function openPalette() {
    paletteOpen = true;
    paletteEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset
    inputEl.value = '';
    filterCommands('');
    selectedIndex = 0;
    
    // Focus input after animation
    setTimeout(() => inputEl.focus(), 100);
    
    // Announce to screen readers
    announce('Command palette opened. Type to search commands.');
  }

  function closePalette() {
    paletteOpen = false;
    paletteEl.classList.remove('active');
    document.body.style.overflow = '';
    inputEl.blur();
    
    // Return focus to trigger
    const trigger = document.querySelector('.cmd-palette-trigger');
    if (trigger) trigger.focus();
  }

  function filterCommands(query) {
    const q = query.toLowerCase().trim();
    
    if (!q) {
      // Show recent/frequent when empty
      filteredCommands = commands.filter(c => 
        ['home', 'services', 'projects', 'whatsapp', 'contact'].includes(c.id)
      );
    } else {
      filteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(q) ||
        cmd.desc.toLowerCase().includes(q) ||
        cmd.section.toLowerCase().includes(q)
      );
      
      // Sort by relevance
      filteredCommands.sort((a, b) => {
        const aTitle = a.title.toLowerCase().startsWith(q);
        const bTitle = b.title.toLowerCase().startsWith(q);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });
    }
    
    selectedIndex = 0;
    renderResults(q);
  }

  function renderResults(query) {
    if (filteredCommands.length === 0) {
      contentEl.innerHTML = `
        <div class="cmd-palette-empty">
          <div class="cmd-palette-empty-icon">🔍</div>
          <div class="cmd-palette-empty-text">No commands found</div>
          <div class="cmd-palette-empty-hint">Try a different search term</div>
        </div>
      `;
      return;
    }

    // Group by section
    const sections = {};
    filteredCommands.forEach(cmd => {
      if (!sections[cmd.section]) sections[cmd.section] = [];
      sections[cmd.section].push(cmd);
    });

    let html = '';
    Object.entries(sections).forEach(([section, items]) => {
      html += `<div class="cmd-palette-section">
        <h3 class="cmd-palette-section-title">${section}</h3>`;
      
      items.forEach((cmd, idx) => {
        const globalIdx = filteredCommands.indexOf(cmd);
        const selected = globalIdx === selectedIndex ? 'selected' : '';
        const title = highlightMatch(cmd.title, query);
        const desc = highlightMatch(cmd.desc, query);
        
        html += `
          <a href="${cmd.href || '#'}" 
             class="cmd-palette-item ${selected}" 
             data-index="${globalIdx}"
             ${cmd.external ? 'target="_blank" rel="noopener"' : ''}>
            <div class="cmd-palette-item-icon">${cmd.icon}</div>
            <div class="cmd-palette-item-content">
              <div class="cmd-palette-item-title">${title}</div>
              <div class="cmd-palette-item-desc">${desc}</div>
            </div>
            <span class="cmd-palette-item-shortcut">${cmd.shortcut || ''}</span>
          </a>
        `;
      });
      
      html += '</div>';
    });

    contentEl.innerHTML = html;

    // Add click handlers
    contentEl.querySelectorAll('.cmd-palette-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(item.dataset.index);
        selectedIndex = idx;
        executeSelection();
      });
    });
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="cmd-palette-match">$1</span>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function navigateSelection(direction) {
    selectedIndex += direction;
    
    if (selectedIndex < 0) {
      selectedIndex = filteredCommands.length - 1;
    } else if (selectedIndex >= filteredCommands.length) {
      selectedIndex = 0;
    }

    renderResults(inputEl.value.toLowerCase().trim());
    scrollSelectionIntoView();
  }

  function scrollSelectionIntoView() {
    const selected = contentEl.querySelector('.cmd-palette-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function executeSelection() {
    const cmd = filteredCommands[selectedIndex];
    if (!cmd) return;

    // Track action
    trackCommand(cmd.id);

    // Execute action
    if (cmd.action) {
      executeAction(cmd.action);
      closePalette();
    } else if (cmd.href) {
      closePalette();
      if (cmd.external) {
        window.open(cmd.href, '_blank', 'noopener');
      } else {
        window.location.href = cmd.href;
      }
    }
  }

  function executeAction(action) {
    const [type, value] = action.split(':');
    
    switch(type) {
      case 'theme':
        document.body.classList.toggle('light-mode', value === 'light');
        localStorage.setItem('theme', value);
        break;
      case 'scroll':
        if (value === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
        if (value === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
    }
  }

  function trackCommand(commandId) {
    // Simple local tracking
    const recent = JSON.parse(localStorage.getItem('cmd-recent') || '[]');
    recent.unshift(commandId);
    localStorage.setItem('cmd-recent', JSON.stringify(recent.slice(0, 10)));
  }

  function announce(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    announcer.textContent = message;
    document.body.appendChild(announcer);
    setTimeout(() => announcer.remove(), 1000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
