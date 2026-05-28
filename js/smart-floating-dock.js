/**
 * v47.0: SMART FLOATING DOCK - Fortune 500 Professional
 * Dynamic navigation dock with scroll awareness and smart positioning
 */

class SmartFloatingDock {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'bottom', // bottom, left, right
      showThreshold: options.showThreshold || 300,
      hideOnScrollDown: options.hideOnScrollDown !== false,
      enableProgress: options.enableProgress !== false,
      enableTooltips: options.enableTooltips !== false,
      items: options.items || [],
      ...options
    };

    this.dock = null;
    this.items = [];
    this.sections = [];
    this.currentSection = 0;
    this.scrollProgress = 0;
    this.lastScrollY = 0;
    this.scrollDirection = 'up';
    this.isVisible = false;
    this.progressRing = null;

    this.init();
  }

  init() {
    this.collectSections();
    this.createDock();
    this.bindEvents();
    this.updateActiveSection();
  }

  collectSections() {
    // Find all sections with data-section attribute
    this.sections = Array.from(document.querySelectorAll('[data-section]')).map((section, index) => ({
      element: section,
      id: section.getAttribute('data-section'),
      label: section.getAttribute('data-nav-label') || section.getAttribute('data-section'),
      index
    }));
  }

  createDock() {
    // Remove existing dock
    const existingDock = document.querySelector('.smart-floating-dock');
    if (existingDock) existingDock.remove();

    // Create dock container
    this.dock = document.createElement('nav');
    this.dock.className = `smart-floating-dock position-${this.options.position}`;
    this.dock.setAttribute('aria-label', 'Quick navigation');

    // Add home link
    if (this.options.items.length === 0 || this.options.items.find(i => i.id === 'home')) {
      this.dock.appendChild(this.createDockItem({
        id: 'home',
        icon: this.getHomeIcon(),
        label: 'Home',
        href: '#',
        active: this.currentSection === 0
      }));
    }

    // Add divider
    this.dock.appendChild(this.createDivider());

    // Add sections as dots
    if (this.sections.length > 0 && this.options.enableProgress) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'dock-section-dots';
      
      this.sections.forEach((section, index) => {
        const dot = document.createElement('button');
        dot.className = `dock-section-dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to ${section.label}`);
        dot.addEventListener('click', () => this.scrollToSection(index));
        dotsContainer.appendChild(dot);
      });
      
      this.dock.appendChild(dotsContainer);
      this.dock.appendChild(this.createDivider());
    }

    // Add custom items
    this.options.items.forEach(item => {
      if (item.id !== 'home') {
        this.dock.appendChild(this.createDockItem(item));
      }
    });

    // Add back to top
    this.dock.appendChild(this.createDockItem({
      id: 'top',
      icon: this.getArrowUpIcon(),
      label: 'Back to top',
      action: () => this.scrollToTop()
    }));

    // Add progress ring if enabled
    if (this.options.enableProgress) {
      this.addProgressRing();
    }

    document.body.appendChild(this.dock);
  }

  createDockItem(item) {
    const button = document.createElement(item.href ? 'a' : 'button');
    button.className = `dock-item ${item.active ? 'active' : ''}`;
    button.innerHTML = item.icon;
    button.setAttribute('data-label', item.label);
    button.setAttribute('aria-label', item.label);
    
    if (item.href) {
      button.href = item.href;
    }
    
    if (item.action) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        item.action();
      });
    }

    // Add ripple effect
    button.addEventListener('click', (e) => this.createRipple(e, button));

    return button;
  }

  createDivider() {
    const divider = document.createElement('div');
    divider.className = 'dock-divider';
    return divider;
  }

  addProgressRing() {
    const items = this.dock.querySelectorAll('.dock-item, .dock-section-dot');
    items.forEach(item => {
      const ring = document.createElement('div');
      ring.className = 'dock-progress-ring';
      ring.innerHTML = `
        <svg viewBox="0 0 44 44">
          <circle class="bg" cx="22" cy="22" r="20"></circle>
          <circle class="progress" cx="22" cy="22" r="20"></circle>
        </svg>
      `;
      item.appendChild(ring);
    });

    this.progressRing = this.dock.querySelector('.dock-progress-ring .progress');
  }

  createRipple(e, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(201, 206, 214, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: dock-ripple 0.6s ease-out;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    // Add keyframe if not exists
    if (!document.getElementById('dock-ripple-style')) {
      const style = document.createElement('style');
      style.id = 'dock-ripple-style';
      style.textContent = `
        @keyframes dock-ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  bindEvents() {
    // Scroll handling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Section observer for active state
    if (this.sections.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => this.handleSectionIntersection(entries),
        { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
      );

      this.sections.forEach(section => {
        observer.observe(section.element);
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Update scroll direction
    this.scrollDirection = scrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = scrollY;

    // Calculate progress
    this.scrollProgress = scrollY / docHeight;

    // Update progress ring
    if (this.progressRing) {
      const circumference = 2 * Math.PI * 20;
      const offset = circumference - (this.scrollProgress * circumference);
      this.progressRing.style.strokeDashoffset = offset;
    }

    // Show/hide dock based on scroll position
    if (scrollY > this.options.showThreshold) {
      if (!this.isVisible) {
        this.show();
      }
    } else {
      if (this.isVisible) {
        this.hide();
      }
    }

    // Hide on scroll down if enabled
    if (this.options.hideOnScrollDown && this.scrollDirection === 'down' && scrollY > this.options.showThreshold + 100) {
      this.dock.classList.add('compact');
    } else if (this.scrollDirection === 'up') {
      this.dock.classList.remove('compact');
    }
  }

  handleSectionIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionIndex = this.sections.findIndex(s => s.element === entry.target);
        if (sectionIndex !== -1) {
          this.setActiveSection(sectionIndex);
        }
      }
    });
  }

  setActiveSection(index) {
    this.currentSection = index;
    
    // Update dots
    const dots = this.dock.querySelectorAll('.dock-section-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update home button
    const homeBtn = this.dock.querySelector('[data-label="Home"]');
    if (homeBtn) {
      homeBtn.classList.toggle('active', index === 0);
    }
  }

  updateActiveSection() {
    // Find which section is currently in view
    const scrollY = window.scrollY + window.innerHeight / 2;
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      const rect = section.element.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        this.setActiveSection(i);
        break;
      }
    }
  }

  scrollToSection(index) {
    const section = this.sections[index];
    if (section) {
      section.element.scrollIntoView({ behavior: 'smooth' });
      this.setActiveSection(index);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  show() {
    this.dock.classList.add('visible');
    this.isVisible = true;
  }

  hide() {
    this.dock.classList.remove('visible');
    this.isVisible = false;
  }

  toggleVisibility() {
    this.dock.classList.toggle('visible');
    this.isVisible = !this.isVisible;
  }

  // Icon helpers
  getHomeIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`;
  }

  getArrowUpIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>`;
  }

  getMenuIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>`;
  }

  // Public API
  refresh() {
    this.collectSections();
    this.createDock();
  }

  addItem(item) {
    this.options.items.push(item);
    this.refresh();
  }

  removeItem(id) {
    this.options.items = this.options.items.filter(i => i.id !== id);
    this.refresh();
  }

  showNotification(options) {
    const notification = document.createElement('div');
    notification.className = 'dock-notification';
    notification.innerHTML = `
      <div class="dock-notification-icon">${options.icon || '🔔'}</div>
      <div class="dock-notification-content">
        <div class="dock-notification-title">${options.title}</div>
        <div class="dock-notification-text">${options.text}</div>
      </div>
    `;

    this.dock.appendChild(notification);

    // Show
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto hide
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 400);
    }, options.duration || 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.floatingDock = new SmartFloatingDock({
      position: 'bottom',
      showThreshold: 400,
      hideOnScrollDown: true,
      enableProgress: true,
      enableTooltips: true
    });
  });
} else {
  window.floatingDock = new SmartFloatingDock({
    position: 'bottom',
    showThreshold: 400,
    hideOnScrollDown: true,
    enableProgress: true,
    enableTooltips: true
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartFloatingDock;
}
