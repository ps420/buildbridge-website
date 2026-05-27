/**
 * BuildBridge v15.0 - Smart Tooltip System
 * Fortune 500 contextual help with intelligence
 */

(function() {
  'use strict';

  class SmartTooltip {
    constructor(options = {}) {
      this.options = {
        delay: 300,
        hideDelay: 100,
        placement: 'top',
        offset: 10,
        maxWidth: 320,
        enableTouch: true,
        ...options
      };

      this.tooltip = null;
      this.currentTarget = null;
      this.showTimeout = null;
      this.hideTimeout = null;

      this.init();
    }

    init() {
      this.createTooltipElement();
      this.bindEvents();
    }

    createTooltipElement() {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'smart-tooltip';
      this.tooltip.setAttribute('role', 'tooltip');
      this.tooltip.innerHTML = `
        <div class="smart-tooltip-content">
          <div class="smart-tooltip-arrow"></div>
          <div class="smart-tooltip-inner"></div>
        </div>
      `;
      document.body.appendChild(this.tooltip);
    }

    bindEvents() {
      // Mouse events
      document.addEventListener('mouseenter', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          this.handleMouseEnter(target);
        }
      }, true);

      document.addEventListener('mouseleave', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          this.handleMouseLeave();
        }
      }, true);

      // Focus events for accessibility
      document.addEventListener('focus', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          this.show(target);
        }
      }, true);

      document.addEventListener('blur', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          this.hide();
        }
      }, true);

      // Touch events for mobile
      if (this.options.enableTouch) {
        document.addEventListener('touchstart', (e) => {
          const target = e.target.closest('[data-tooltip]');
          if (target) {
            this.handleTouch(target, e);
          }
        }, { passive: true });
      }

      // Scroll and resize handlers
      window.addEventListener('scroll', () => this.updatePosition(), { passive: true });
      window.addEventListener('resize', () => this.updatePosition());

      // Hide on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hide();
        }
      });
    }

    handleMouseEnter(target) {
      this.clearTimeouts();
      this.currentTarget = target;
      
      const delay = parseInt(target.dataset.tooltipDelay) || this.options.delay;
      this.showTimeout = setTimeout(() => {
        this.show(target);
      }, delay);
    }

    handleMouseLeave() {
      this.clearTimeouts();
      this.hideTimeout = setTimeout(() => {
        this.hide();
      }, this.options.hideDelay);
    }

    handleTouch(target, event) {
      event.preventDefault();
      
      if (this.currentTarget === target && this.tooltip.classList.contains('visible')) {
        this.hide();
      } else {
        this.show(target);
        
        // Auto hide after 3 seconds on mobile
        setTimeout(() => this.hide(), 3000);
      }
    }

    show(target) {
      this.clearTimeouts();
      this.currentTarget = target;

      const content = this.parseContent(target);
      this.render(content, target);
      
      this.updatePosition();
      
      requestAnimationFrame(() => {
        this.tooltip.classList.add('visible');
        target.setAttribute('aria-describedby', 'smart-tooltip');
      });

      // Track analytics
      this.trackShow(target);
    }

    hide() {
      this.clearTimeouts();
      
      if (this.currentTarget) {
        this.currentTarget.removeAttribute('aria-describedby');
        this.currentTarget = null;
      }
      
      this.tooltip.classList.remove('visible');
    }

    parseContent(target) {
      const data = target.dataset;
      
      // Parse tooltip data
      const content = {
        title: data.tooltipTitle || '',
        text: data.tooltip || '',
        icon: data.tooltipIcon || '',
        type: data.tooltipType || 'default',
        placement: data.tooltipPlacement || this.options.placement,
        shortcut: data.tooltipShortcut || '',
        action: data.tooltipAction || '',
        actionText: data.tooltipActionText || 'Learn more',
        image: data.tooltipImage || '',
        stat: data.tooltipStat || '',
        statLabel: data.tooltipStatLabel || '',
        progress: data.tooltipProgress || '',
        rich: data.tooltipRich === 'true'
      };

      return content;
    }

    render(content, target) {
      const inner = this.tooltip.querySelector('.smart-tooltip-inner');
      
      // Set tooltip type class
      this.tooltip.className = `smart-tooltip ${content.type}`;
      if (content.rich || content.image) this.tooltip.classList.add('rich');
      if (content.stat) this.tooltip.classList.add('stat');
      if (content.progress) this.tooltip.classList.add('progress');
      if (content.icon) this.tooltip.classList.add('feature');

      // Build HTML
      let html = '';

      // Image preview for rich tooltips
      if (content.image && content.rich) {
        html += `
          <div class="smart-tooltip-preview">
            <img src="${content.image}" alt="${content.title}">
          </div>
        `;
      }

      // Header with icon and title
      if (content.title || content.icon) {
        html += '<div class="smart-tooltip-header">';
        if (content.icon) {
          html += `<div class="smart-tooltip-icon">${content.icon}</div>`;
        }
        if (content.title) {
          html += `<h4 class="smart-tooltip-title">${content.title}</h4>`;
        }
        html += '</div>';
      }

      // Stat display
      if (content.stat) {
        html += `
          <div class="stat-number">${content.stat}</div>
          <div class="stat-label">${content.statLabel}</div>
        `;
      }

      // Body text
      if (content.text) {
        html += `<div class="smart-tooltip-body">${content.text}</div>`;
      }

      // Progress bar
      if (content.progress) {
        const progress = parseInt(content.progress);
        html += `
          <div class="smart-tooltip-progress-bar">
            <div class="smart-tooltip-progress-fill" style="width: ${progress}%"></div>
          </div>
        `;
      }

      // Footer with shortcut and action
      if (content.shortcut || content.action) {
        html += '<div class="smart-tooltip-footer">';
        
        if (content.shortcut) {
          const keys = content.shortcut.split('+');
          html += '<span class="smart-tooltip-shortcut">'; 
          keys.forEach((key, i) => {
            html += `<kbd>${key.trim()}</kbd>`;
            if (i < keys.length - 1) html += '+';
          });
          html += '</span>';
        }
        
        if (content.action) {
          html += `
            <a href="${content.action}" class="smart-tooltip-action" target="_blank">
              ${content.actionText}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          `;
        }
        
        html += '</div>';
      }

      inner.innerHTML = html;
      this.tooltip.setAttribute('data-placement', content.placement);
    }

    updatePosition() {
      if (!this.currentTarget || !this.tooltip.classList.contains('visible')) return;

      const targetRect = this.currentTarget.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();
      const placement = this.tooltip.getAttribute('data-placement') || 'top';
      const offset = this.options.offset;

      let top, left;

      switch (placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + offset;
          break;
      }

      // Boundary checks
      const padding = 10;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) {
        // Flip to bottom if too close to top
        top = targetRect.bottom + offset;
        this.tooltip.setAttribute('data-placement', 'bottom');
      }

      this.tooltip.style.top = `${top + window.scrollY}px`;
      this.tooltip.style.left = `${left}px`;
    }

    clearTimeouts() {
      clearTimeout(this.showTimeout);
      clearTimeout(this.hideTimeout);
    }

    trackShow(target) {
      // Could send to analytics
      if (window.gtag) {
        window.gtag('event', 'tooltip_show', {
          content: target.dataset.tooltip?.substring(0, 50),
          page: window.location.pathname
        });
      }
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smartTooltip = new SmartTooltip();
    });
  } else {
    window.smartTooltip = new SmartTooltip();
  }
})();
