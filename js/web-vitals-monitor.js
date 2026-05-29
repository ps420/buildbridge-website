/**
 * v71.0: WEB VITALS REAL-TIME MONITOR
 * Fortune 500 Performance Dashboard
 * 
 * Monitors Core Web Vitals in real-time:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      lcp: { value: 0, rating: 'good', label: 'LCP' },
      fid: { value: 0, rating: 'good', label: 'FID' },
      cls: { value: 0, rating: 'good', label: 'CLS' },
      fcp: { value: 0, rating: 'good', label: 'FCP' },
      ttfb: { value: 0, rating: 'good', label: 'TTFB' },
      inp: { value: 0, rating: 'good', label: 'INP' }
    };
    
    this.isVisible = false;
    this.hasIssues = false;
    this.init();
  }
  
  init() {
    this.createWidget();
    this.setupObservers();
    this.attachEventListeners();
    
    // Start monitoring after page load
    if (document.readyState === 'complete') {
      this.startMonitoring();
    } else {
      window.addEventListener('load', () => this.startMonitoring());
    }
  }
  
  createWidget() {
    // Check if already exists
    if (document.querySelector('.web-vitals-widget')) return;
    
    const widget = document.createElement('div');
    widget.className = 'web-vitals-widget';
    widget.innerHTML = `
      <div class="web-vitals-header">
        <div class="web-vitals-title">Performance Monitor</div>
        <button class="web-vitals-close" aria-label="Close performance monitor">×</button>
      </div>
      <div class="web-vitals-metrics">
        ${this.createMetricHTML('lcp', 'LCP', 'Largest Contentful Paint')}
        ${this.createMetricHTML('cls', 'CLS', 'Cumulative Layout Shift')}
        ${this.createMetricHTML('inp', 'INP', 'Interaction to Next Paint')}
        ${this.createMetricHTML('fcp', 'FCP', 'First Contentful Paint')}
        ${this.createMetricHTML('ttfb', 'TTFB', 'Time to First Byte')}
      </div>
      <div class="web-vitals-footer">
        <div class="web-vitals-status">
          <span class="web-vitals-status-dot"></span>
          <span>Monitoring Active</span>
        </div>
        <button class="web-vitals-toggle">Details →</button>
      </div>
    `;
    
    const trigger = document.createElement('button');
    trigger.className = 'web-vitals-trigger';
    trigger.setAttribute('aria-label', 'Open performance monitor');
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    `;
    
    document.body.appendChild(widget);
    document.body.appendChild(trigger);
    
    this.widget = widget;
    this.trigger = trigger;
  }
  
  createMetricHTML(id, label, description) {
    return `
      <div class="vital-metric" data-metric="${id}">
        <div class="vital-indicator good">
          <span class="vital-ring"></span>
          <span class="vital-score">--</span>
        </div>
        <div class="vital-info">
          <div class="vital-name">${label}</div>
          <div class="vital-value"><span>--</span> ${description}</div>
        </div>
      </div>
    `;
  }
  
  setupObservers() {
    // LCP Observer
    this.observeLCP();
    
    // CLS Observer
    this.observeCLS();
    
    // FID/INP Observer
    this.observeFID();
    
    // FCP Observer
    this.observeFCP();
    
    // TTFB
    this.measureTTFB();
  }
  
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.lcp.value = Math.round(lastEntry.startTime);
        this.metrics.lcp.rating = this.getLCPRating(this.metrics.lcp.value);
        this.updateMetricDisplay('lcp');
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('LCP monitoring not supported');
    }
  }
  
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    let clsValue = 0;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        this.metrics.cls.value = parseFloat(clsValue.toFixed(3));
        this.metrics.cls.rating = this.getCLSRating(this.metrics.cls.value);
        this.updateMetricDisplay('cls');
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('CLS monitoring not supported');
    }
  }
  
  observeFID() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const delay = entry.processingStart - entry.startTime;
          this.metrics.fid.value = Math.round(delay);
          this.metrics.fid.rating = this.getFIDRating(this.metrics.fid.value);
          this.updateMetricDisplay('fid');
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.log('FID monitoring not supported');
    }
    
    // INP monitoring (newer metric)
    this.observeINP();
  }
  
  observeINP() {
    if (!('PerformanceObserver' in window)) return;
    
    let inpValue = 0;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId > 0) {
            const duration = entry.processingEnd - entry.startTime;
            inpValue = Math.max(inpValue, duration);
          }
        }
        
        this.metrics.inp.value = Math.round(inpValue);
        this.metrics.inp.rating = this.getINPRating(this.metrics.inp.value);
        this.updateMetricDisplay('inp');
      });
      
      observer.observe({ entryTypes: ['event'] });
    } catch (e) {
      console.log('INP monitoring not supported');
    }
  }
  
  observeFCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp.value = Math.round(entry.startTime);
            this.metrics.fcp.rating = this.getFCPRating(this.metrics.fcp.value);
            this.updateMetricDisplay('fcp');
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.log('FCP monitoring not supported');
    }
  }
  
  measureTTFB() {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      this.metrics.ttfb.value = Math.round(navEntry.responseStart);
      this.metrics.ttfb.rating = this.getTTFBRating(this.metrics.ttfb.value);
      this.updateMetricDisplay('ttfb');
    }
  }
  
  // Rating thresholds based on Google Core Web Vitals
  getLCPRating(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }
  
  getCLSRating(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  
  getFIDRating(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }
  
  getINPRating(value) {
    if (value <= 200) return 'good';
    if (value <= 500) return 'needs-improvement';
    return 'poor';
  }
  
  getFCPRating(value) {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }
  
  getTTFBRating(value) {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
  
  updateMetricDisplay(metricId) {
    const metric = this.metrics[metricId];
    const element = document.querySelector(`[data-metric="${metricId}"]`);
    if (!element) return;
    
    const indicator = element.querySelector('.vital-indicator');
    const score = element.querySelector('.vital-score');
    const value = element.querySelector('.vital-value span');
    
    // Update rating class
    indicator.className = `vital-indicator ${metric.rating}`;
    
    // Update value display
    let displayValue = metric.value;
    if (metricId === 'cls') {
      displayValue = metric.value.toFixed(3);
    } else if (metricId !== 'cls') {
      displayValue = `${metric.value}ms`;
    }
    
    score.textContent = metricId === 'cls' ? metric.value.toFixed(2) : metric.value;
    value.textContent = displayValue;
    
    // Check for issues
    this.checkForIssues();
  }
  
  checkForIssues() {
    const hasPoorMetrics = Object.values(this.metrics).some(
      m => m.rating === 'poor' || m.rating === 'needs-improvement'
    );
    
    if (hasPoorMetrics && !this.hasIssues) {
      this.hasIssues = true;
      this.trigger.classList.add('has-issues');
      
      // Add badge
      if (!this.trigger.querySelector('.web-vitals-badge')) {
        const badge = document.createElement('span');
        badge.className = 'web-vitals-badge';
        badge.textContent = '!';
        this.trigger.appendChild(badge);
      }
    }
  }
  
  attachEventListeners() {
    // Toggle widget
    this.trigger.addEventListener('click', () => this.toggle());
    
    // Close button
    this.widget.querySelector('.web-vitals-close').addEventListener('click', () => {
      this.hide();
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isVisible && 
          !this.widget.contains(e.target) && 
          !this.trigger.contains(e.target)) {
        this.hide();
      }
    });
  }
  
  toggle() {
    this.isVisible ? this.hide() : this.show();
  }
  
  show() {
    this.widget.classList.add('active');
    this.isVisible = true;
    
    // Remove alert animation after viewing
    if (this.hasIssues) {
      this.trigger.classList.remove('has-issues');
      const badge = this.trigger.querySelector('.web-vitals-badge');
      if (badge) badge.remove();
    }
  }
  
  hide() {
    this.widget.classList.remove('active');
    this.isVisible = false;
  }
  
  startMonitoring() {
    // Initial measurement
    this.measureTTFB();
    
    // Log metrics to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔍 Web Vitals Monitor initialized');
      
      // Report to console periodically
      setInterval(() => {
        console.table(this.metrics);
      }, 10000);
    }
  }
  
  // Public API for custom integrations
  getMetrics() {
    return { ...this.metrics };
  }
  
  getOverallRating() {
    const ratings = Object.values(this.metrics).map(m => m.rating);
    if (ratings.includes('poor')) return 'poor';
    if (ratings.includes('needs-improvement')) return 'needs-improvement';
    return 'good';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webVitalsMonitor = new WebVitalsMonitor();
  });
} else {
  window.webVitalsMonitor = new WebVitalsMonitor();
}
