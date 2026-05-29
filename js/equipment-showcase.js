/**
 * BuildBridge Equipment Showcase
 * v74.0: Interactive Fleet Display System
 * Fortune 500 Quality Equipment Gallery
 */

class EquipmentShowcase {
  constructor() {
    this.equipment = [
      {
        id: 1,
        name: 'CAT 336E Excavator',
        category: 'excavation',
        categoryLabel: 'Excavation',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        status: 'available',
        specs: {
          power: '311 HP',
          weight: '36 Tons',
          reach: '11.5m',
          bucket: '2.1m³'
        },
        rate: 'R 2,850',
        description: 'Heavy-duty hydraulic excavator equipped with advanced GPS grading technology. Ideal for large-scale earthmoving, trenching, and foundation work with precision control.',
        features: ['GPS Grade Control', '360° Camera System', 'Climate Cab', 'Fuel Efficient']
      },
      {
        id: 2,
        name: 'Komatsu D155 Bulldozer',
        category: 'earthmoving',
        categoryLabel: 'Earthmoving',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        status: 'available',
        specs: {
          power: '354 HP',
          weight: '41 Tons',
          blade: '4.5m³',
          speed: '11.5 km/h'
        },n        rate: 'R 3,200',
        description: 'Crawler dozer with SIGMADOZER blade for maximum productivity. Features advanced hydraulic system for precise grading and land clearing operations.',
        features: ['SIGMADOZER Blade', 'Ripper Attachment', 'Auto-Shift Transmission', 'Rear Camera']
      },
      {
        id: 3,
        name: 'Liebherr LTM 1090',
        category: 'lifting',
        categoryLabel: 'Lifting',
        image: 'assets/02_Website_Heroes/Hero_3.png',
        status: 'available',
        specs: {
          capacity: '90 Tons',
          reach: '52m',
          boom: '4-Section',
          engine: '500 HP'
        },
        rate: 'R 5,500',
        description: 'All-terrain mobile crane with telescopic boom. Lichee上级 alloy steel construction provides superior strength-to-weight ratio for heavy lifting operations.',
        features: ['All-Wheel Steering', 'Telescopic Boom', 'Load Moment Limiter', 'Self-Assembly']
      },
      {
        id: 4,
        name: 'Volvo A40G Articulated Hauler',
        category: 'hauling',
        categoryLabel: 'Hauling',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        status: 'available',
        specs: {
          capacity: '39 Tons',
          volume: '24m³',
          power: '465 HP',
          speed: '57 km/h'
        },
        rate: 'R 2,400',
        description: 'High-capacity articulated hauler designed for tough terrains. Features automatic traction control and hydraulic suspension for maximum uptime.',
        features: ['Auto Traction Control', 'Hydraulic Suspension', 'On-Board Weighing', 'LED Lighting']
      },
      {
        id: 5,
        name: 'Sany STC500 Tower Crane',
        category: 'lifting',
        categoryLabel: 'Lifting',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        status: 'maintenance',
        specs: {
          capacity: '20 Tons',
          height: '80m',
          jib: '65m',
          tipLoad: '2.5 Tons'
        },
        rate: 'R 8,900',
        description: 'Self-erecting tower crane perfect for high-rise construction. Features frequency-controlled mechanisms for smooth operation and precise load placement.',
        features: ['Self-Erecting', 'Frequency Control', 'Remote Monitoring', 'Anti-Collision']
      },
      {
        id: 6,
        name: 'Bobcat S850 Skid Steer',
        category: 'earthmoving',
        categoryLabel: 'Earthmoving',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        status: 'available',
        specs: {
          power: '92 HP',
          capacity: '1.7 Tons',
          reach: '3.3m',
          width: '1.8m'
        },
        rate: 'R 850',
        description: 'Compact skid steer loader with vertical lift path. Versatile machine for tight spaces, demolition cleanup, and material handling operations.',
        features: ['Vertical Lift', 'Joystick Controls', 'Quick-Attach System', 'Cab Suspension']
      },
      {
        id: 7,
        name: 'Putzmeister BSF 47',
        category: 'concrete',
        categoryLabel: 'Concrete',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        status: 'available',
        specs: {
          output: '150m³/h',
          pressure: '85 bar',
          reach: '47m',
          boom: '5-Section RZ'
        },
        rate: 'R 4,200',
        description: 'Truck-mounted concrete pump with multi-fold boom system. High-output pumping capability for major commercial and infrastructure projects.',
        features: ['RZ Boom Design', 'Wireless Remote', 'Automated Lubrication', 'Energy Recovery']
      },
      {
        id: 8,
        name: 'Wirtgen W 200i Cold Mill',
        category: 'paving',
        categoryLabel: 'Paving',
        image: 'assets/02_Website_Heroes/Hero_3.png',
        status: 'available',
        specs: {
          power: '455 HP',
          width: '2.2m',
          depth: '330mm',
          weight: '28 Tons'
        },
        rate: 'R 3,800',
        description: 'High-performance cold milling machine for asphalt and concrete removal. Features Level Pro Plus automatic leveling system for precise depth control.',
        features: ['Level Pro Plus', 'DUAL SHIFT System', 'Hydraulic Folding', 'Dust Suppression']
      },
      {
        id: 9,
        name: 'Dynapac CA6000 Roller',
        category: 'compaction',
        categoryLabel: 'Compaction',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        status: 'available',
        specs: {
          weight: '17 Tons',
          width: '2.1m',
          force: '320 kN',
          engine: '154 HP'
        },
        rate: 'R 1,650',
        description: 'Heavy-duty soil compactor with high centrifugal force. Features Dynapac Compaction Quality System for real-time density monitoring.',
        features: ['Compaction Meter', 'Traction Control', 'Drum Offset', 'ROPS Cab']
      }
    ];
    
    this.currentFilter = 'all';
    this.modalOpen = false;
    this.init();
  }
  
  init() {
    this.renderEquipment();
    this.bindEvents();
    this.animateCounters();
  }
  
  bindEvents() {
    // Filter buttons
    document.querySelectorAll('.equipment-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.setFilter(filter);
      });
    });
    
    // Modal close
    const modal = document.querySelector('.equipment-modal');
    if (modal) {
      modal.querySelector('.equipment-modal-close').addEventListener('click', () => this.closeModal());
      modal.querySelector('.equipment-modal-backdrop').addEventListener('click', () => this.closeModal());
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalOpen) {
        this.closeModal();
      }
    });
    
    // 3D tilt effect on cards
    this.initTiltEffect();
  }
  
  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.equipment-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Filter cards with animation
    const cards = document.querySelectorAll('.equipment-card');
    cards.forEach((card, index) => {
      const category = card.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      if (shouldShow) {
        card.classList.remove('hidden');
        card.style.animationDelay = `${index * 0.05}s`;
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = 'equipment-fade-in 0.5s ease forwards';
        }, 10);
      } else {
        card.classList.add('hidden');
      }
    });
  }
  
  renderEquipment() {
    const grid = document.querySelector('.equipment-grid');
    if (!grid) return;
    
    grid.innerHTML = this.equipment.map(item => this.createEquipmentCard(item)).join('');
    
    // Bind click events
    grid.querySelectorAll('.equipment-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.openModal(id);
      });
    });
  }
  
  createEquipmentCard(item) {
    const statusClass = item.status === 'maintenance' ? 'maintenance' : '';
    const statusText = item.status === 'maintenance' ? 'Maintenance' : 'Available';
    
    return `
      <article class="equipment-card" data-id="${item.id}" data-category="${item.category}">
        <div class="equipment-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="equipment-card-badge">${item.categoryLabel}</span>
          <span class="equipment-card-status ${statusClass}" title="${statusText}"></span>
        </div>
        <div class="equipment-card-content">
          <p class="equipment-card-category">${item.categoryLabel}</p>
          <h3 class="equipment-card-title">${item.name}</h3>
          <div class="equipment-card-specs">
            ${Object.entries(item.specs).slice(0, 4).map(([key, value]) => `
              <div class="equipment-spec">
                <span class="equipment-spec-icon">${this.getSpecIcon(key)}</span>
                <span>${value}</span>
              </div>
            `).join('')}
          </div>
          <div class="equipment-card-footer">
            <div class="equipment-card-rate">${item.rate}<span>/day</span></div>
            <button class="equipment-card-action" aria-label="View details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }
  
  getSpecIcon(key) {
    const icons = {
      power: '⚡',
      weight: '⚖️',
      reach: '📏',
      bucket: '🪣',
      blade: '⬜',
      speed: '💨',
      capacity: '💪',
      boom: '🏗️',
      volume: '📦',
      height: '↕️',
      jib: '🔄',
      tipLoad: '⚓',
      width: '↔️',
      output: '🌊',
      pressure: '💢',
      depth: '⬇️',
      force: '🎯',
      engine: '🔧'
    };
    return icons[key] || '⚙️';
  }
  
  openModal(id) {
    const item = this.equipment.find(e => e.id === id);
    if (!item) return;
    
    const modal = document.querySelector('.equipment-modal');
    const modalContent = modal.querySelector('.equipment-modal-body');
    
    modalContent.innerHTML = `
      <div class="equipment-modal-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="equipment-modal-info">
        <p class="equipment-modal-category">${item.categoryLabel}</p>
        <h2 class="equipment-modal-title">${item.name}</h2>
        <p class="equipment-modal-description">${item.description}</p>
        
        <div class="equipment-modal-specs-grid">
          ${Object.entries(item.specs).map(([key, value]) => `
            <div class="equipment-modal-spec-item">
              <div class="equipment-modal-spec-label">${this.formatLabel(key)}</div>
              <div class="equipment-modal-spec-value">${value}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h4 style="font-family: 'Montserrat', sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; color: var(--white);">Key Features</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${item.features.map(f => `
              <span style="padding: 8px 16px; background: rgba(201, 206, 214, 0.1); border: 1px solid rgba(201, 206, 214, 0.2); border-radius: 4px; font-size: 13px; color: var(--chrome);">${f}</span>
            `).join('')}
          </div>
        </div>
        
        <div style="padding: 20px; background: linear-gradient(135deg, rgba(201, 206, 214, 0.1), rgba(201, 206, 214, 0.05)); border-radius: 8px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: var(--slate);">Daily Rate</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: var(--white);">${item.rate}</span>
          </div>
        </div>
        
        <div class="equipment-modal-actions">
          <a href="https://wa.me/27661200064?text=I'm%20interested%20in%20renting%20the%20${encodeURIComponent(item.name)}" class="btn" target="_blank">Enquire Now</a>
          <a href="contact.html" class="btn ghost">View All Equipment</a>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  closeModal() {
    const modal = document.querySelector('.equipment-modal');
    modal.classList.remove('active');
    this.modalOpen = false;
    document.body.style.overflow = '';
  }
  
  formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  
  initTiltEffect() {
    const cards = document.querySelectorAll('.equipment-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  
  animateCounters() {
    const counters = document.querySelectorAll('.equipment-stat-number');
    
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
  if (document.querySelector('.equipment-showcase')) {
    new EquipmentShowcase();
  }
});

export default EquipmentShowcase;
