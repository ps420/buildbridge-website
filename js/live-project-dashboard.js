// BuildBridge - Fortune 500 Live Project Dashboard
// Real-time project status widget with animated progress indicators
// Version 1.0

class LiveProjectDashboard {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.options = {
      refreshInterval: 30000, // 30 seconds
      animationDuration: 1500,
      projects: [],
      showChart: true,
      ...options
    };
    
    this.dashboardEl = null;
    this.chartCanvas = null;
    this.animationFrame = null;
    this.refreshTimer = null;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.createDashboard();
    this.createStyles();
    this.render();
    this.startAnimations();
    this.bindEvents();
    
    // Auto-refresh simulation
    if (this.options.refreshInterval > 0) {
      this.startAutoRefresh();
    }
  }
  
  createDashboard() {
    this.dashboardEl = document.createElement('div');
    this.dashboardEl.className = 'project-dashboard';
    
    this.dashboardEl.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title">
          <span class="live-indicator"></span>
          <h3>Live Project Status</h3>
        </div>
        <span class="last-updated">Updated just now</span>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-box">
          <span class="stat-value" data-count="12">0</span>
          <span class="stat-label">Active Projects</span>
        </div>
        <div class="stat-box">
          <span class="stat-value" data-count="94">0</span>
          <span class="stat-label">% On Track</span>
        </div>
        <div class="stat-box">
          <span class="stat-value" data-count="2">0</span>
          <span class="stat-label">Completed This Month</span>
        </div>
      </div>
      
      <div class="dashboard-chart">
        <canvas id="projectChart"></canvas>
      </div>
      
      <div class="project-list">
        <div class="project-item" data-status="on-track">
          <div class="project-info">
            <div class="project-icon">🏢</div>
            <div class="project-details">
              <h4>Cape Town Office Complex</h4>
              <span class="project-meta">Commercial • Due Dec 2026</span>
            </div>
          </div>
          <div class="project-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 36 36">
                <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="progress-ring-fill" data-progress="78" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="progress-text">78%</span>
            </div>
          </div>
        </div>
        
        <div class="project-item" data-status="on-track">
          <div class="project-info">
            <div class="project-icon">🏠</div>
            <div class="project-details">
              <h4>Durban Residential Estate</h4>
              <span class="project-meta">Residential • Due Jan 2027</span>
            </div>
          </div>
          <div class="project-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 36 36">
                <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="progress-ring-fill" data-progress="45" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="progress-text">45%</span>
            </div>
          </div>
        </div>
        
        <div class="project-item" data-status="attention">
          <div class="project-info">
            <div class="project-icon">🏭</div>
            <div class="project-details">
              <h4>Johannesburg Industrial Park</h4>
              <span class="project-meta">Industrial • Due Nov 2026</span>
            </div>
          </div>
          <div class="project-progress">
            <div class="progress-ring attention">
              <svg viewBox="0 0 36 36">
                <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="progress-ring-fill" data-progress="62" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="progress-text">62%</span>
            </div>
          </div>
        </div>
        
        <div class="project-item" data-status="completed">
          <div class="project-info">
            <div class="project-icon">✓</div>
            <div class="project-details">
              <h4>Pretoria Shopping Center</h4>
              <span class="project-meta">Commercial • Completed</span>
            </div>
          </div>
          <div class="project-progress">
            <div class="progress-ring completed">
              <svg viewBox="0 0 36 36">
                <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="progress-ring-fill" data-progress="100" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="progress-text">100%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-footer">
        <a href="projects.html" class="view-all-link">
          View All Projects <span>→</span>
        </a>
      </div>
    `;
    
    this.container.appendChild(this.dashboardEl);
  }
  
  createStyles() {
    if (document.getElementById('dashboard-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
      .project-dashboard {
        background: linear-gradient(145deg, #17191d, #1a1c21);
        border: 1px solid rgba(201, 206, 214, 0.12);
        border-radius: 8px;
        padding: 30px;
        max-width: 480px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(201, 206, 214, 0.08);
      }
      
      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .dashboard-title h3 {
        font-family: 'Montserrat', sans-serif;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0;
        color: #F5F7FA;
      }
      
      .live-indicator {
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        position: relative;
        animation: live-pulse 2s ease-in-out infinite;
      }
      
      @keyframes live-pulse {
        0%, 100% { 
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
        }
        50% { 
          box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
        }
      }
      
      .last-updated {
        font-size: 11px;
        color: #525862;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .stat-box {
        text-align: center;
        padding: 16px 8px;
        background: rgba(15, 15, 16, 0.5);
        border-radius: 6px;
        border: 1px solid rgba(201, 206, 214, 0.06);
      }
      
      .stat-value {
        display: block;
        font-family: 'Montserrat', sans-serif;
        font-size: 24px;
        font-weight: 700;
        color: #F5F7FA;
        line-height: 1;
        margin-bottom: 6px;
      }
      
      .stat-label {
        display: block;
        font-size: 10px;
        color: #525862;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        line-height: 1.3;
      }
      
      .dashboard-chart {
        height: 120px;
        margin-bottom: 24px;
        position: relative;
      }
      
      .dashboard-chart canvas {
        width: 100%;
        height: 100%;
      }
      
      .project-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: rgba(15, 15, 16, 0.4);
        border-radius: 6px;
        border: 1px solid rgba(201, 206, 214, 0.06);
        transition: all 0.3s ease;
      }
      
      .project-item:hover {
        background: rgba(201, 206, 214, 0.05);
        border-color: rgba(201, 206, 214, 0.12);
        transform: translateX(4px);
      }
      
      .project-item[data-status="completed"] {
        border-left: 3px solid #22c55e;
      }
      
      .project-item[data-status="on-track"] {
        border-left: 3px solid #3B82F6;
      }
      
      .project-item[data-status="attention"] {
        border-left: 3px solid #f59e0b;
      }
      
      .project-info {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      
      .project-icon {
        width: 44px;
        height: 44px;
        background: rgba(201, 206, 214, 0.08);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      .project-details h4 {
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #F5F7FA;
        margin: 0 0 4px 0;
      }
      
      .project-meta {
        font-size: 11px;
        color: #525862;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .progress-ring {
        width: 44px;
        height: 44px;
        position: relative;
      }
      
      .progress-ring svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }
      
      .progress-ring-bg {
        fill: none;
        stroke: rgba(201, 206, 214, 0.1);
        stroke-width: 2.5;
      }
      
      .progress-ring-fill {
        fill: none;
        stroke: #C9CED6;
        stroke-width: 2.5;
        stroke-linecap: round;
        transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .progress-ring.attention .progress-ring-fill {
        stroke: #f59e0b;
      }
      
      .progress-ring.completed .progress-ring-fill {
        stroke: #22c55e;
      }
      
      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Montserrat', sans-serif;
        font-size: 10px;
        font-weight: 600;
        color: #C9CED6;
      }
      
      .progress-ring.completed .progress-text {
        color: #22c55e;
      }
      
      .progress-ring.attention .progress-text {
        color: #f59e0b;
      }
      
      .dashboard-footer {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(201, 206, 214, 0.08);
        display: flex;
        justify-content: center;
      }
      
      .view-all-link {
        color: #C9CED6;
        text-decoration: none;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }
      
      .view-all-link:hover {
        color: #F5F7FA;
        gap: 12px;
      }
      
      .view-all-link span {
        transition: transform 0.3s ease;
      }
      
      .view-all-link:hover span {
        transform: translateX(4px);
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .project-dashboard {
          max-width: 100%;
          padding: 20px;
        }
        
        .dashboard-stats {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        
        .stat-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }
        
        .stat-value {
          margin-bottom: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  render() {
    this.animateStats();
    this.animateProgressRings();
    this.drawChart();
  }
  
  animateStats() {
    const statValues = this.dashboardEl.querySelectorAll('.stat-value[data-count]');
    
    statValues.forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 1500;
      const startTime = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);
        
        el.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      };
      
      requestAnimationFrame(update);
    });
  }
  
  animateProgressRings() {
    const rings = this.dashboardEl.querySelectorAll('.progress-ring-fill');
    
    rings.forEach((ring, index) => {
      const progress = parseInt(ring.dataset.progress);
      
      setTimeout(() => {
        ring.style.strokeDasharray = `${progress}, 100`;
      }, index * 200);
    });
  }
  
  drawChart() {
    const canvas = this.dashboardEl.querySelector('#projectChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // Sample data - project activity over time
    const data = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85];
    const maxValue = Math.max(...data);
    const stepX = width / (data.length - 1);
    
    // Draw gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(201, 206, 214, 0.3)');
    gradient.addColorStop(1, 'rgba(201, 206, 214, 0)');
    
    // Draw area
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / maxValue) * height * 0.8 - 10;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * stepX;
        const prevY = height - (data[i - 1] / maxValue) * height * 0.8 - 10;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / maxValue) * height * 0.8 - 10;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * stepX;
        const prevY = height - (data[i - 1] / maxValue) * height * 0.8 - 10;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    
    ctx.strokeStyle = '#C9CED6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / maxValue) * height * 0.8 - 10;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0F0F10';
      ctx.fill();
      ctx.strokeStyle = '#C9CED6';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
  
  startAnimations() {
    // Animate last updated text
    const lastUpdated = this.dashboardEl.querySelector('.last-updated');
    let seconds = 0;
    
    setInterval(() => {
      seconds++;
      if (seconds < 60) {
        lastUpdated.textContent = `Updated ${seconds}s ago`;
      } else {
        lastUpdated.textContent = `Updated ${Math.floor(seconds / 60)}m ago`;
      }
    }, 1000);
  }
  
  bindEvents() {
    // Redraw chart on resize
    window.addEventListener('resize', () => {
      this.drawChart();
    });
  }
  
  startAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      this.simulateUpdate();
    }, this.options.refreshInterval);
  }
  
  simulateUpdate() {
    // Simulate random progress updates
    const rings = this.dashboardEl.querySelectorAll('.progress-ring-fill');
    rings.forEach(ring => {
      if (Math.random() > 0.7) {
        const currentProgress = parseInt(ring.dataset.progress);
        const newProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 3));
        ring.dataset.progress = newProgress;
        ring.style.strokeDasharray = `${newProgress}, 100`;
        
        const textEl = ring.parentElement.querySelector('.progress-text');
        if (textEl) {
          textEl.textContent = `${newProgress}%`;
        }
      }
    });
    
    // Update timestamp
    const lastUpdated = this.dashboardEl.querySelector('.last-updated');
    lastUpdated.textContent = 'Updated just now';
  }
  
  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.dashboardEl) {
      this.dashboardEl.remove();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Create dashboard in hero section
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    // Add dashboard alongside the hero image
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'hero-dashboard-wrapper';
    dashboardContainer.style.cssText = `
      position: absolute;
      bottom: -40px;
      right: -20px;
      z-index: 10;
      transform: scale(0.85);
      transform-origin: bottom right;
    `;
    
    heroVisual.style.position = 'relative';
    heroVisual.appendChild(dashboardContainer);
    
    new LiveProjectDashboard(dashboardContainer);
  }
  
  // Also add to stats section
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const container = document.createElement('div');
    container.className = 'stats-dashboard-container';
    container.style.cssText = `
      max-width: 480px;
      margin: 40px auto 0;
    `;
    statsSection.appendChild(container);
    
    new LiveProjectDashboard(container);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveProjectDashboard;
}
