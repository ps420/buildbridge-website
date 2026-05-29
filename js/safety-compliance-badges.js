/**
 * BuildBridge Safety & Compliance Badge System
 * v74.0: Fortune 500 Trust Indicators
 * Interactive certification display and verification
 */

class ComplianceBadgeSystem {
  constructor() {
    this.badges = [
      {
        id: 'nhrbc',
        name: 'NHBRC',
        fullName: 'National Home Builders Registration Council',
        icon: '🏠',
        description: 'Registered home builder with NHBRC certification ensuring quality standards and warranty protection for residential projects.',
        verified: true,
        validUntil: '2026-12-31',
        category: 'registration'
      },
      {
        id: 'cidb',
        name: 'CIDB',
        fullName: 'Construction Industry Development Board',
        icon: '🏗️',
        description: 'CIDB registered contractor with Grade 9GB PE rating for general building and civil engineering works.',
        verified: true,
        validUntil: '2026-06-30',
        category: 'registration'
      },
      {
        id: 'sabs',
        name: 'SABS',
        fullName: 'South African Bureau of Standards',
        icon: '✓',
        description: 'ISO 9001:2015 certified for quality management systems, ensuring consistent delivery of high-quality construction services.',
        verified: true,
        validUntil: '2027-03-15',
        category: 'quality'
      },
      {
        id: 'osha',
        name: 'OSHA',
        fullName: 'Occupational Safety & Health Compliance',
        icon: '🛡️',
        description: 'Full compliance with OSHA regulations and Construction Regulations 2014. Zero serious incidents in 3+ years.',
        verified: true,
        validUntil: 'Continuous',
        category: 'safety'
      },
      {
        id: 'saiosh',
        name: 'SAIOSH',
        fullName: 'South African Institute of Occupational Safety & Health',
        icon: '👷',
        description: 'Professional membership with certified safety officers on every project site ensuring best practice safety protocols.',
        verified: true,
        validUntil: '2026-08-20',
        category: 'safety'
      },
      {
        id: 'green',
        name: 'GBCSA',
        fullName: 'Green Building Council SA Member',
        icon: '🌿',
        description: 'Committed to sustainable building practices and Green Star SA certification support for environmentally conscious projects.',
        verified: true,
        validUntil: '2026-11-30',
        category: 'environmental'
      },
      {
        id: 'bee',
        name: 'B-BBEE',
        fullName: 'Level 1 B-BBEE Contributor',
        icon: '🤝',
        description: 'Level 1 B-BBEE rated company, demonstrating commitment to economic transformation and local community development.',
        verified: true,
        validUntil: '2026-05-31',
        category: 'transformation'
      },
      {
        id: 'coida',
        name: 'COIDA',
        fullName: 'Compensation for Occupational Injuries & Diseases',
        icon: '🏥',
        description: 'Fully compliant with COIDA regulations. All workers covered with comprehensive injury and disease compensation.',
        verified: true,
        validUntil: 'Annual',
        category: 'safety'
      },
      {
        id: 'sars',
        name: 'SARS',
        fullName: 'Tax Compliance Status',
        icon: '📋',
        description: 'Full tax compliance with South African Revenue Service. Valid tax clearance certificate for government and corporate tenders.',
        verified: true,
        validUntil: '2026-12-31',
        category: 'financial'
      },
      {
        id: 'iwsci',
        name: 'IWSC',
        fullName: 'Institute of Workmanship SA',
        icon: '⭐',
        description: 'Accredited training provider ensuring all contractors meet the highest workmanship standards and skill requirements.',
        verified: true,
        validUntil: '2026-09-15',
        category: 'quality'
      }
    ];
    
    this.stats = {
      safetyRecord: '1,460', // Days without incident
      complianceRate: '100',
      certifications: '15+',
      inspections: '52'
    };
    
    this.timeline = [
      {
        date: '2024',
        title: 'ISO 9001:2015 Recertification',
        description: 'Successfully renewed ISO 9001:2015 certification with zero non-conformances.'
      },
      {
        date: '2024',
        title: 'CIDB Grade 9 Upgrade',
        description: 'Upgraded to CIDB Grade 9GB PE, enabling larger project value capacity.'
      },
      {
        date: '2023',
        title: 'B-BBEE Level 1 Achievement',
        description: 'Achieved Level 1 B-BBEE contributor status through enhanced ownership and skills development.'
      },
      {
        date: '2023',
        title: 'OSHA 1000-Day Safety Milestone',
        description: 'Celebrated 1,000 days without a lost-time incident across all project sites.'
      },
      {
        date: '2022',
        title: 'Green Building Council Membership',
        description: 'Joined GBCSA to support sustainable construction practices and Green Star certification.'
      }
    ];
    
    this.tooltip = null;
    this.init();
  }
  
  init() {
    this.renderBadges();
    this.renderStats();
    this.renderTimeline();
    this.createTooltip();
    this.bindEvents();
    this.animateCounters();
  }
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'badge-tooltip';
    document.body.appendChild(this.tooltip);
  }
  
  renderStats() {
    const container = document.querySelector('.compliance-stats');
    if (!container) return;
    
    const statsData = [
      { key: 'safetyRecord', icon: '🛡️', label: 'Days Without Incident', suffix: '' },
      { key: 'complianceRate', icon: '✓', label: 'Compliance Rate', suffix: '%' },
      { key: 'certifications', icon: '🏆', label: 'Active Certifications', suffix: '' },
      { key: 'inspections', icon: '🔍', label: 'Annual Inspections', suffix: '' }
    ];
    
    container.innerHTML = statsData.map(stat => `
      <div class="compliance-stat-card">
        <div class="compliance-stat-icon">${stat.icon}</div>
        <div class="compliance-stat-number" data-count="${this.stats[stat.key].replace(/\D/g, '')}" data-suffix="${stat.suffix}">0${stat.suffix}</div>
        <div class="compliance-stat-label">${stat.label}</div>
      </div>
    `).join('');
  }
  
  renderBadges() {
    const container = document.querySelector('.compliance-badges');
    if (!container) return;
    
    container.innerHTML = this.badges.map(badge => `
      <div class="compliance-badge" data-badge="${badge.id}">
        <span class="badge-verified">✓</span>
        <div class="badge-icon">${badge.icon}</div>
        <h4 class="badge-name">${badge.name}</h4>
        <p class="badge-issuer">${badge.fullName}</p>
      </div>
    `).join('');
  }
  
  renderTimeline() {
    const container = document.querySelector('.timeline-items');
    if (!container) return;
    
    container.innerHTML = this.timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-content">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  }
  
  bindEvents() {
    // Badge hover for tooltip
    document.querySelectorAll('.compliance-badge').forEach(badge => {
      badge.addEventListener('mouseenter', (e) => this.showTooltip(e));
      badge.addEventListener('mouseleave', () => this.hideTooltip());
      badge.addEventListener('mousemove', (e) => this.moveTooltip(e));
      
      // Click to show detailed modal
      badge.addEventListener('click', (e) => this.showBadgeDetails(e.currentTarget.dataset.badge));
    });
    
    // Timeline item hover
    document.querySelectorAll('.timeline-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.borderLeftWidth = '5px';
      });
      item.addEventListener('mouseleave', () => {
        item.style.borderLeftWidth = '3px';
      });
    });
  }
  
  showTooltip(e) {
    const badgeId = e.currentTarget.dataset.badge;
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge) return;
    
    this.tooltip.innerHTML = `
      <strong style="color: var(--white); display: block; margin-bottom: 4px;">${badge.name}</strong>
      ${badge.description}
      <div style="margin-top: 8px; font-size: 11px; color: #22c55e;">
        ✓ Valid until ${badge.validUntil}
      </div>
    `;
    
    this.tooltip.classList.add('visible');
    this.moveTooltip(e);
  }
  
  hideTooltip() {
    this.tooltip.classList.remove('visible');
  }
  
  moveTooltip(e) {
    const x = e.clientX + 15;
    const y = e.clientY + 15;
    
    // Keep tooltip within viewport
    const rect = this.tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let finalX = x;
    let finalY = y;
    
    if (x + rect.width > viewportWidth) {
      finalX = e.clientX - rect.width - 15;
    }
    if (y + rect.height > viewportHeight) {
      finalY = e.clientY - rect.height - 15;
    }
    
    this.tooltip.style.left = `${finalX}px`;
    this.tooltip.style.top = `${finalY}px`;
  }
  
  showBadgeDetails(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge) return;
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'equipment-modal active';
    modal.innerHTML = `
      <div class="equipment-modal-backdrop"></div>
      <div class="equipment-modal-content" style="max-width: 600px;">
        <button class="equipment-modal-close">&times;</button>
        <div style="padding: 40px; text-align: center;">
          <div style="width: 100px; height: 100px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05)); border: 2px solid rgba(34, 197, 94, 0.5); border-radius: 50%; font-size: 48px;">
            ${badge.icon}
          </div>
          <h2 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: var(--white); margin-bottom: 8px;">${badge.name}</h2>
          <p style="color: var(--slate); margin-bottom: 24px;">${badge.fullName}</p>
          
          <div style="padding: 24px; background: rgba(201, 206, 214, 0.05); border-radius: 8px; margin-bottom: 24px; text-align: left;">
            <p style="color: var(--chrome); line-height: 1.8; margin: 0;">${badge.description}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="padding: 16px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Status</div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #22c55e;">✓ Verified Active</div>
            </div>
            <div style="padding: 16px; background: rgba(201, 206, 214, 0.05); border: 1px solid rgba(201, 206, 214, 0.1); border-radius: 8px;">
              <div style="font-size: 11px; color: var(--slate); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Valid Until</div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: var(--white);">${badge.validUntil}</div>
            </div>
          </div>
          
          <a href="contact.html" class="btn">Request Verification Document</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    modal.querySelector('.equipment-modal-close').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
    
    modal.querySelector('.equipment-modal-backdrop').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
  }
  
  animateCounters() {
    const counters = document.querySelectorAll('.compliance-stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.count) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.compliance-section')) {
    new ComplianceBadgeSystem();
  }
});

export default ComplianceBadgeSystem;
