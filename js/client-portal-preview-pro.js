/**
 * BuildBridge Client Portal Preview - Pro Version
 * Fortune 500 Quality Interactive Dashboard Demonstration
 * Version: v77.0
 * Author: Godzai
 */

class ClientPortalPreview {
  constructor(containerId = 'portal-preview') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.createContainer();
    }
    this.currentView = 'dashboard';
    this.isDemoMode = true;
    this.charts = {};
    this.interactions = [];
    
    this.init();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'portal-preview';
    this.container.className = 'portal-preview-container';
    
    // Insert before footer or at end of body
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(this.container, footer);
    } else {
      document.body.appendChild(this.container);
    }
  }

  init() {
    this.render();
    this.bindEvents();
    this.startDemoSimulation();
    
    console.log('🔐 BuildBridge v77.0: Client Portal Preview Pro initialized');
  }

  render() {
    this.container.innerHTML = `
      <section class="portal-preview-section" data-version="77.0">
        <div class="portal-preview-header">
          <div class="portal-badge">
            <span class="badge-icon">🔐</span>
            <span class="badge-text">Client Portal Preview</span>
          </div>
          <h2>Your Project Dashboard</h2>
          <p>Real-time project tracking, budget monitoring, and contractor coordination at your fingertips.</p>
        </div>

        <div class="portal-interface">
          <!-- Sidebar Navigation -->
          <aside class="portal-sidebar">
            <div class="portal-brand">
              <div class="portal-logo">
                <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge">
                <span>Client Portal</span>
              </div>
            </div>
            
            <nav class="portal-nav">
              <button class="nav-item active" data-view="dashboard">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Dashboard</span>
                <span class="nav-badge">3</span>
              </button>
              <button class="nav-item" data-view="projects">
                <span class="nav-icon">🏗️</span>
                <span class="nav-label">My Projects</span>
              </button>
              <button class="nav-item" data-view="budget">
                <span class="nav-icon">💰</span>
                <span class="nav-label">Budget</span>
                <span class="nav-badge new">Live</span>
              </button>
              <button class="nav-item" data-view="documents">
                <span class="nav-icon">📁</span>
                <span class="nav-label">Documents</span>
              </button>
              <button class="nav-item" data-view="messages">
                <span class="nav-icon">💬</span>
                <span class="nav-label">Messages</span>
                <span class="nav-badge">5</span>
              </button>
              <button class="nav-item" data-view="schedule">
                <span class="nav-icon">📅</span>
                <span class="nav-label">Schedule</span>
              </button>
            </nav>

            <div class="portal-user">
              <div class="user-avatar">JD</div>
              <div class="user-info">
                <span class="user-name">John Doe</span>
                <span class="user-role">Project Owner</span>
              </div>
            </div>
          </aside>

          <!-- Main Content Area -->
          <main class="portal-main">
            <!-- Dashboard View -->
            <div class="portal-view dashboard-view active" data-view="dashboard">
              <div class="view-header">
                <h3>Project Overview</h3>
                <div class="view-actions">
                  <button class="action-btn secondary">
                    <span>📥</span> Export Report
                  </button>
                  <button class="action-btn primary">
                    <span>📅</span> Schedule Meeting
                  </button>
                </div>
              </div>

              <div class="dashboard-grid">
                <!-- Status Cards -->
                <div class="dashboard-cards">
                  <div class="dash-card status-active">
                    <div class="dash-card-icon">🚧</div>
                    <div class="dash-card-content">
                      <span class="dash-card-label">Active Project</span>
                      <span class="dash-card-value">Cape Town Luxury Estate</span>
                      <span class="dash-card-meta">Phase 3 of 5</span>
                    </div>
                    <div class="dash-card-progress">
                      <div class="progress-ring" data-progress="62">
                        <svg viewBox="0 0 36 36">
                          <path class="progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                          <path class="progress-fill" stroke-dasharray="62, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        </svg>
                        <span class="progress-text">62%</span>
                      </div>
                    </div>
                  </div>

                  <div class="dash-card">
                    <div class="dash-card-icon">💰</div>
                    <div class="dash-card-content">
                      <span class="dash-card-label">Budget Status</span>
                      <span class="dash-card-value">R 7.4M / R 12M</span>
                      <span class="dash-card-meta">Under budget by 4%</span>
                    </div>
                    <div class="budget-indicator on-track">
                      <span class="indicator-dot"></span>
                      On Track
                    </div>
                  </div>

                  <div class="dash-card">
                    <div class="dash-card-icon">⏱️</div>
                    <div class="dash-card-content">
                      <span class="dash-card-label">Timeline</span>
                      <span class="dash-card-value">124 Days</span>
                      <span class="dash-card-meta">Remaining: 76 days</span>
                    </div>
                    <div class="timeline-bar">
                      <div class="timeline-fill" style="width: 62%"></div>
                    </div>
                  </div>

                  <div class="dash-card">
                    <div class="dash-card-icon">👷</div>
                    <div class="dash-card-content">
                      <span class="dash-card-label">Team on Site</span>
                      <span class="dash-card-value">12 Workers</span>
                      <span class="dash-card-meta">3 specialists active</span>
                    </div>
                    <div class="team-avatars">
                      <span class="avatar" title="Site Manager">SM</span>
                      <span class="avatar" title="Foreman">FN</span>
                      <span class="avatar" title="Engineer">EN</span>
                      <span class="avatar more">+9</span>
                    </div>
                  </div>
                </div>

                <!-- Activity Feed -->
                <div class="activity-section">
                  <div class="section-header">
                    <h4>Recent Activity</h4>
                    <button class="view-all-btn">View All →</button>
                  </div>
                  <div class="activity-feed" id="activity-feed">
                    ${this.renderActivityItems()}
                  </div>
                </div>

                <!-- Budget Chart -->
                <div class="chart-section">
                  <div class="section-header">
                    <h4>Budget Allocation</h4>
                    <div class="chart-legend">
                      <span class="legend-item"><span class="dot materials"></span> Materials</span>
                      <span class="legend-item"><span class="dot labor"></span> Labor</span>
                      <span class="legend-item"><span class="dot overhead"></span> Overhead</span>
                    </div>
                  </div>
                  <div class="budget-chart-container">
                    <canvas id="budgetChart" width="400" height="200"></canvas>
                  </div>
                </div>

                <!-- Milestones -->
                <div class="milestones-section">
                  <div class="section-header">
                    <h4>Project Milestones</h4>
                  </div>
                  <div class="milestones-timeline">
                    <div class="milestone completed">
                      <div class="milestone-marker">✓</div>
                      <div class="milestone-content">
                        <span class="milestone-title">Foundation Complete</span>
                        <span class="milestone-date">Jan 15, 2026</span>
                      </div>
                    </div>
                    <div class="milestone completed">
                      <div class="milestone-marker">✓</div>
                      <div class="milestone-content">
                        <span class="milestone-title">Framing Done</span>
                        <span class="milestone-date">Feb 28, 2026</span>
                      </div>
                    </div>
                    <div class="milestone active">
                      <div class="milestone-marker">●</div>
                      <div class="milestone-content">
                        <span class="milestone-title">Roof Installation</span>
                        <span class="milestone-date">In Progress</span>
                      </div>
                    </div>
                    <div class="milestone upcoming">
                      <div class="milestone-marker">○</div>
                      <div class="milestone-content">
                        <span class="milestone-title">Interior Finishing</span>
                        <span class="milestone-date">Jun 20, 2026</span>
                      </div>
                    </div>
                    <div class="milestone upcoming">
                      <div class="milestone-marker">○</div>
                      <div class="milestone-content">
                        <span class="milestone-title">Final Handover</span>
                        <span class="milestone-date">Aug 15, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Other Views (placeholder) -->
            <div class="portal-view projects-view" data-view="projects">
              <div class="view-placeholder">
                <div class="placeholder-icon">🏗️</div>
                <h4>Projects View</h4>
                <p>Full project listing with detailed status tracking.</p>
                <button class="action-btn primary demo-btn" data-view="dashboard">Return to Dashboard</button>
              </div>
            </div>

            <div class="portal-view budget-view" data-view="budget">
              <div class="view-placeholder">
                <div class="placeholder-icon">💰</div>
                <h4>Budget Management</h4>
                <p>Detailed budget breakdown and expense tracking.</p>
                <button class="action-btn primary demo-btn" data-view="dashboard">Return to Dashboard</button>
              </div>
            </div>

            <div class="portal-view documents-view" data-view="documents">
              <div class="view-placeholder">
                <div class="placeholder-icon">📁</div>
                <h4>Document Center</h4>
                <p>Access permits, contracts, and project files.</p>
                <button class="action-btn primary demo-btn" data-view="dashboard">Return to Dashboard</button>
              </div>
            </div>

            <div class="portal-view messages-view" data-view="messages">
              <div class="view-placeholder">
                <div class="placeholder-icon">💬</div>
                <h4>Message Center</h4>
                <p>Communicate with your project team.</p>
                <button class="action-btn primary demo-btn" data-view="dashboard">Return to Dashboard</button>
              </div>
            </div>

            <div class="portal-view schedule-view" data-view="schedule">
              <div class="view-placeholder">
                <div class="placeholder-icon">📅</div>
                <h4>Schedule</h4>
                <p>View timeline and upcoming milestones.</p>
                <button class="action-btn primary demo-btn" data-view="dashboard">Return to Dashboard</button>
              </div>
            </div>
          </main>
        </div>

        <!-- Feature Highlights -->
        <div class="portal-features">
          <div class="feature-highlight">
            <span class="feature-icon">📱</span>
            <h4>Mobile Access</h4>
            <p>Track your project anywhere with our responsive mobile app.</p>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">🔔</span>
            <h4>Real-time Alerts</h4>
            <p>Instant notifications for milestones, delays, or updates.</p>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">📊</span>
            <h4>Live Analytics</h4>
            <p>Visual dashboards showing project health and progress.</p>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">🔒</span>
            <h4>Secure Access</h4>
            <p>Enterprise-grade security for your project data.</p>
          </div>
        </div>

        <!-- CTA -->
        <div class="portal-cta">
          <div class="cta-content">
            <h3>Ready to Experience the Future of Project Management?</h3>
            <p>Get exclusive access to our client portal when you start your project with BuildBridge.</p>
            <div class="cta-actions">
              <a href="contact.html" class="action-btn primary large">
                <span>🚀</span> Start Your Project
              </a>
              <button class="action-btn secondary large" id="request-demo">
                <span>🎮</span> Request Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    this.initChart();
    this.animateProgressRings();
  }

  renderActivityItems() {
    const activities = [
      { icon: '📸', title: 'Site Photo Update', desc: '15 new photos from today\'s work', time: '2 hours ago', type: 'photo' },
      { icon: '✅', title: 'Milestone Reached', desc: 'Roof trusses installed successfully', time: '5 hours ago', type: 'milestone' },
      { icon: '💰', title: 'Payment Processed', desc: 'Phase 3 invoice approved: R1.2M', time: '1 day ago', type: 'payment' },
      { icon: '📋', title: 'Inspection Passed', desc: 'Electrical inspection completed', time: '2 days ago', type: 'inspection' },
      { icon: '💬', title: 'New Message', desc: 'Site Manager: "Weekend work scheduled"', time: '3 days ago', type: 'message' }
    ];

    return activities.map(item => `
      <div class="activity-item ${item.type}">
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-content">
          <span class="activity-title">${item.title}</span>
          <span class="activity-desc">${item.desc}</span>
        </div>
        <span class="activity-time">${item.time}</span>
      </div>
    `).join('');
  }

  initChart() {
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Budget data
    const data = [
      { label: 'Materials', value: 42, color: '#C9CED6' },
      { label: 'Labor', value: 35, color: '#F5F7FA' },
      { label: 'Overhead', value: 15, color: '#6B7077' },
      { label: 'Contingency', value: 8, color: '#2A2D34' }
    ];

    this.drawBarChart(ctx, data, rect.width, rect.height);
  }

  drawBarChart(ctx, data, width, height) {
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length - 20;
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = height - padding * 2;

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + 20);
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = height - padding - barHeight;

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, this.hexToRgba(item.color, 0.3));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = '#C9CED6';
      ctx.font = '12px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);

      // Draw value
      ctx.fillStyle = '#F5F7FA';
      ctx.font = 'bold 14px Montserrat, sans-serif';
      ctx.fillText(item.value + '%', x + barWidth / 2, y - 10);
    });
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  animateProgressRings() {
    const rings = document.querySelectorAll('.progress-ring');
    rings.forEach(ring => {
      const progress = ring.dataset.progress;
      const fill = ring.querySelector('.progress-fill');
      if (fill) {
        setTimeout(() => {
          fill.style.strokeDasharray = `${progress}, 100`;
        }, 500);
      }
    });
  }

  bindEvents() {
    // Navigation switching
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = item.dataset.view;
        this.switchView(view);
      });
    });

    // Demo buttons
    this.container.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Request demo button
    const demoBtn = this.container.querySelector('#request-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (window.Toast) {
          Toast.info('Demo request submitted! Our team will contact you shortly.', {
            title: '🎮 Demo Request',
            duration: 5000
          });
        }
        this.showConfetti();
      });
    }

    // Window resize for chart
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.initChart(), 250);
    });
  }

  switchView(viewName) {
    // Update nav
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update view
    this.container.querySelectorAll('.portal-view').forEach(view => {
      view.classList.toggle('active', view.dataset.view === viewName);
    });

    this.currentView = viewName;

    // Trigger animation
    const activeView = this.container.querySelector(`.portal-view[data-view="${viewName}"]`);
    if (activeView) {
      activeView.style.animation = 'none';
      activeView.offsetHeight; // Trigger reflow
      activeView.style.animation = 'viewFadeIn 0.3s ease forwards';
    }

    console.log(`🔐 Portal switched to: ${viewName}`);
  }

  startDemoSimulation() {
    // Simulate real-time updates
    this.simulationInterval = setInterval(() => {
      this.addRandomActivity();
    }, 15000); // Every 15 seconds
  }

  addRandomActivity() {
    const activityTypes = [
      { icon: '📸', title: 'Site Photo Update', desc: 'New photos uploaded', type: 'photo' },
      { icon: '📊', title: 'Progress Update', desc: 'Daily progress report available', type: 'update' },
      { icon: '👷', title: 'Team Check-in', desc: 'Morning roll call completed', type: 'team' },
      { icon: '💰', title: 'Budget Alert', desc: 'Phase completion payment due', type: 'alert' }
    ];

    const random = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const activityItem = document.createElement('div');
    activityItem.className = `activity-item ${random.type} highlight-new`;
    activityItem.innerHTML = `
      <div class="activity-icon">${random.icon}</div>
      <div class="activity-content">
        <span class="activity-title">${random.title}</span>
        <span class="activity-desc">${random.desc}</span>
      </div>
      <span class="activity-time">Just now</span>
    `;

    const feed = this.container.querySelector('#activity-feed');
    if (feed) {
      feed.insertBefore(activityItem, feed.firstChild);
      
      // Keep only 6 items
      while (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
      }

      // Flash notification badge
      const badge = this.container.querySelector('.nav-item[data-view="dashboard"] .nav-badge');
      if (badge) {
        badge.textContent = parseInt(badge.textContent) + 1;
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 1000);
      }

      // Remove highlight after animation
      setTimeout(() => activityItem.classList.remove('highlight-new'), 3000);
    }
  }

  showConfetti() {
    if (window.ConfettiCelebration) {
      window.ConfettiCelebration.celebrate({
        duration: 2000,
        particleCount: 50
      });
    }
  }

  destroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.ClientPortalPreview = new ClientPortalPreview();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClientPortalPreview;
}
