/**
 * SMART COMMAND PALETTE v55.0
 * VS Code-style Quick Navigation System
 */

(function() {
  'use strict';

  // Command Palette State
  let isOpen = false;
  let selectedIndex = 0;
  let filteredCommands = [];
  let allCommands = [];

  // Command definitions
  const commandDefinitions = [
    {
      id: 'nav-home',
      title: 'Home',
      description: 'Go to homepage',
      icon: '🏠',
      shortcut: 'G H',
      action: () => navigateTo('index.html'),
      category: 'Navigation'
    },
    {
      id: 'nav-about',
      title: 'About Us',
      description: 'Learn about BuildBridge',
      icon: 'ℹ️',
      shortcut: 'G A',
      action: () => navigateTo('about.html'),
      category: 'Navigation'
    },
    {
      id: 'nav-services',
      title: 'Services',
      description: 'View our services',
      icon: '🛠️',
      shortcut: 'G S',
      action: () => navigateTo('services.html'),
      category: 'Navigation'
    },
    {
      id: 'nav-projects',
      title: 'Projects',
      description: 'Browse our portfolio',
      icon: '🏗️',
      shortcut: 'G P',
      action: () => navigateTo('projects.html'),
      category: 'Navigation'
    },
    {
      id: 'nav-contact',
      title: 'Contact',
      description: 'Get in touch with us',
      icon: '📧',
      shortcut: 'G C',
      action: () => navigateTo('contact.html'),
      category: 'Navigation'
    },
    {
      id: 'action-whatsapp',
      title: 'Chat on WhatsApp',
      description: 'Start a WhatsApp conversation',
      icon: '💬',
      shortcut: 'W',
      action: () => window.open('https://wa.me/27661200064', '_blank'),
      category: 'Actions'
    },
    {
      id: 'action-call',
      title: 'Call Us',
      description: 'Call BuildBridge directly',
      icon: '📞',
      shortcut: '',
      action: () => window.location.href = 'tel:+27661200064',
      category: 'Actions'
    },
    {
      id: 'action-email',
      title: 'Send Email',
      description: 'Email us directly',
      icon: '✉️',
      shortcut: 'E',
      action: () => window.location.href = 'mailto:info@buildbridge.co.za',
      category: 'Actions'
    },
    {
      id: 'scroll-top',
      title: 'Scroll to Top',
      description: 'Jump to top of page',
      icon: '⬆️',
      shortcut: '↑',
      action: () => scrollToSection(0),
      category: 'Page'
    },
    {
      id: 'scroll-services',
      title: 'Services Section',
      description: 'Jump to services',
      icon: '🎯',
      shortcut: '',
      action: () => scrollToSection('services'),
      category: 'Page'
    },
    {
      id: 'scroll-projects',
      title: 'Projects Section',
      description: 'Jump to projects',
      icon: '📁',
      shortcut: '',
      action: () => scrollToSection('projects'),
      category: 'Page'
    },
    {
      id: 'scroll-contact',
      title: 'Contact Section',
      description: 'Jump to contact',
      icon: '📍',
      shortcut: '',
      action: () => scrollToSection('contact'),
      category: 'Page'
    },
    {
      id: 'theme-dark',
      title: 'Dark Mode',
      description: 'Switch to dark theme',
      icon: '🌙',
      shortcut: '',
      action: () => setTheme('dark'),
      category: 'Preferences'
    },
    {
      id: 'theme-light',
      title: 'Light Mode',
      description: 'Switch to light theme',
      icon: '☀️',
      shortcut: '',
      action: () => setTheme('light'),
      category: 'Preferences'
    },
    {
      id: 'pref-reduce-motion',
      title: 'Reduce Motion',
      description: 'Disable animations',
      icon: '🎬',
      shortcut: '',
      action: () => toggleReducedMotion(),
      category: 'Preferences'
    },
    {
      id: 'tool-cost-estimator',
      title: 'Cost Estimator',
      description: 'Calculate project costs',
      icon: '💰',
      shortcut: '',
      action: () => openCostEstimator(),
      category: 'Tools'
    },
    {
      id: 'tool-booking',
      title: 'Book Consultation',
      description: 'Schedule a meeting',
      icon: '📅',
      shortcut: 'B',
      action: () => openBookingSystem(),
      category: 'Tools'
    },
    {
      id: 'tool-share',
      title: 'Share Page',
      description: 'Share this website',
      icon: '🔗',
      shortcut: '',
      action: () => sharePage(),
      category: 'Tools'
    }
  ];

  // Initialize
  function init() {
    allCommands = [...commandDefinitions];
    createPalette();
    bindEvents();
  }

  // Create palette DOM
  function createPalette() {
    if (document.getElementById('command-palette')) return;

    const paletteHTML = `
      <div class="command-palette-overlay" id="command-palette-overlay">
        <div class="command-palette" id="command-palette">
          <div class="command-palette-header">
            <div class="command-palette-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input type="text" class="command-palette-input" id="command-input" 
                   placeholder="Type a command or search..." autocomplete="off">
            <span class="command-palette-shortcut">⌘K</span>
          </div>
          <div class="command-palette-content" id="command-palette-content">
            <div class="command-palette-list" id="command-list"></div>
          </div>
          <div class="command-palette-footer">
            <div class="command-palette-footer-hint">
              <span class="command-palette-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
              <span class="command-palette-hint"><kbd>↵</kbd> to select</span>
            </div>
            <div class="command-palette-footer-hint">
              <span class="command-palette-hint"><kbd>esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
      <button class="command-palette-trigger" id="command-palette-trigger" aria-label="Open command palette">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span class="command-palette-trigger-tooltip">Quick search (⌘K)</span>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', paletteHTML);
  }

  // Bind events
  function bindEvents() {
    // Keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      
      if (e.key === 'Escape' && isOpen) {
        close();
      }

      if (isOpen) {
        handleNavigationKeys(e);
      }
    });

    // Trigger button
    setTimeout(() => {
      const trigger = document.getElementById('command-palette-trigger');
      if (trigger) {
        trigger.addEventListener('click', open);
      }

      // Input events
      const input = document.getElementById('command-input');
      if (input) {
        input.addEventListener('input', handleInput);
      }

      // Click outside to close
      const overlay = document.getElementById('command-palette-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) close();
        });
      }
    }, 100);
  }

  // Handle navigation keys
  function handleNavigationKeys(e) {
    if (!filteredCommands.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        renderResults();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderResults();
        break;
      case 'Enter':
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
        break;
    }
  }

  // Handle input
  function handleInput(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      filteredCommands = [...allCommands];
    } else {
      filteredCommands = allCommands.filter(cmd => {
        const searchText = `${cmd.title} ${cmd.description} ${cmd.category}`.toLowerCase();
        return searchText.includes(query);
      });
    }
    
    selectedIndex = 0;
    renderResults(query);
  }

  // Render results
  function renderResults(query = '') {
    const listEl = document.getElementById('command-list');
    if (!listEl) return;

    if (!filteredCommands.length) {
      listEl.innerHTML = `
        <div class="command-palette-empty">
          <div class="command-palette-empty-icon">🔍</div>
          <div class="command-palette-empty-title">No commands found</div>
          <div class="command-palette-empty-description">Try a different search term</div>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {});

    let html = '';
    for (const [category, commands] of Object.entries(grouped)) {
      html += `<div class="command-palette-section">`;
      html += `<div class="command-palette-section-title">${category}</div>`;
      
      commands.forEach((cmd, idx) => {
        const globalIndex = filteredCommands.indexOf(cmd);
        const isSelected = globalIndex === selectedIndex;
        const highlightedTitle = query ? highlightMatch(cmd.title, query) : cmd.title;
        const highlightedDesc = query ? highlightMatch(cmd.description, query) : cmd.description;
        
        html += `
          <div class="command-palette-item ${isSelected ? 'selected' : ''}" 
               data-index="${globalIndex}" data-id="${cmd.id}">
            <div class="command-palette-item-icon">${cmd.icon}</div>
            <div class="command-palette-item-content">
              <div class="command-palette-item-title">${highlightedTitle}</div>
              <div class="command-palette-item-description">${highlightedDesc}</div>
            </div>
            ${cmd.shortcut ? `<span class="command-palette-item-shortcut">${cmd.shortcut}</span>` : ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }

    listEl.innerHTML = html;

    // Add click handlers
    listEl.querySelectorAll('.command-palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const cmd = allCommands.find(c => c.id === id);
        if (cmd) executeCommand(cmd);
      });
      
      item.addEventListener('mouseenter', () => {
        selectedIndex = parseInt(item.dataset.index);
        renderResults(query);
      });
    });

    // Scroll selected into view
    const selected = listEl.querySelector('.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="command-palette-match">$1</span>');
  }

  // Escape regex special chars
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Execute command
  function executeCommand(cmd) {
    if (!cmd) return;
    close();
    cmd.action();
  }

  // Navigation helpers
  function navigateTo(url) {
    window.location.href = url;
  }

  function scrollToSection(target) {
    if (target === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function toggleReducedMotion() {
    const prefersReduced = document.documentElement.classList.toggle('reduce-motion');
    localStorage.setItem('reduceMotion', prefersReduced);
  }

  function openCostEstimator() {
    const estimator = document.getElementById('cost-estimator-widget');
    if (estimator) estimator.classList.add('active');
  }

  function openBookingSystem() {
    const booking = document.getElementById('booking-widget');
    if (booking) booking.classList.add('active');
  }

  function sharePage() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  }

  // Toggle palette
  function toggle() {
    isOpen ? close() : open();
  }

  // Open palette
  function open() {
    isOpen = true;
    selectedIndex = 0;
    filteredCommands = [...allCommands];
    
    const overlay = document.getElementById('command-palette-overlay');
    if (overlay) overlay.classList.add('active');

    renderResults();

    setTimeout(() => {
      const input = document.getElementById('command-input');
      if (input) {
        input.focus();
        input.value = '';
      }
    }, 100);
  }

  // Close palette
  function close() {
    isOpen = false;
    const overlay = document.getElementById('command-palette-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // Toast helper
  function showToast(message) {
    if (window.showToastNotification) {
      window.showToastNotification(message, 'success');
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.CommandPalette = {
    open,
    close,
    toggle,
    addCommand: (cmd) => allCommands.push(cmd)
  };

})();
