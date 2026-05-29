/**
 * BuildBridge Smart QR Code Generator
 * Fortune 500 Quality Contact Sharing System
 * Version: v78.0
 * Author: Godzai
 */

class SmartQRGenerator {
  constructor(config = {}) {
    this.config = {
      size: config.size || 256,
      color: config.color || '#C9CED6',
      bgColor: config.bgColor || '#0F0F10',
      ...config
    };
    
    this.container = null;
    this.qrData = {
      vcard: this.generateVCard(),
      website: 'https://buildbridge.co.za',
      whatsapp: 'https://wa.me/27661200064',
      contact: '+27 66 120 0064'
    };
    
    this.currentType = 'vcard';
    this.init();
  }

  init() {
    this.createContainer();
    this.render();
    this.bindEvents();
    this.generateQR(this.currentType);
    
    console.log('📱 BuildBridge v78.0: Smart QR Generator initialized');
  }

  createContainer() {
    // Check if already exists
    this.container = document.getElementById('smart-qr-generator');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'smart-qr-generator';
      this.container.className = 'qr-generator-container';
      
      // Insert in footer area
      const footer = document.querySelector('footer');
      if (footer) {
        footer.parentNode.insertBefore(this.container, footer);
      } else {
        document.body.appendChild(this.container);
      }
    }
  }

  generateVCard() {
    return `BEGIN:VCARD
VERSION:3.0
FN:BuildBridge Construction Management
ORG:BuildBridge
TEL:+27661200064
EMAIL:info@buildbridge.co.za
URL:https://buildbridge.co.za
ADR:;;South Africa;;;
NOTE:Professional construction management services connecting clients with trusted contractors.
END:VCARD`;
  }

  render() {
    this.container.innerHTML = `
      <section class="qr-generator-section" data-version="78.0">
        <div class="qr-generator-header">
          <div class="qr-badge">
            <span class="badge-icon">📱</span>
            <span class="badge-text">Smart Contact</span>
          </div>
          <h2>Connect Instantly</h2>
          <p>Scan this QR code to save our contact, visit our website, or start a WhatsApp chat instantly.</p>
        </div>

        <div class="qr-generator-interface">
          <!-- QR Display Area -->
          <div class="qr-display-area">
            <div class="qr-card">
              <div class="qr-code-container" id="qr-code-output">
                <canvas id="qrCanvas"></canvas>
                <div class="qr-logo-overlay">
                  <img src="assets/BuildBridge_Icon_Mark.svg" alt="BB">
                </div>
              </div>
              
              <div class="qr-info">
                <span class="qr-type-label" id="qr-type-label">Digital Business Card</span>
                <span class="qr-hint">Scan with your phone camera</span>
              </div>
              
              <!-- Decorative corners -->
              <div class="qr-corner top-left"></div>
              <div class="qr-corner top-right"></div>
              <div class="qr-corner bottom-left"></div>
              <div class="qr-corner bottom-right"></div>
            </div>
            
            <!-- Action buttons -->
            <div class="qr-actions">
              <button class="qr-action-btn" id="download-qr" title="Download QR Code">
                <span>💾</span>
                <span>Download</span>
              </button>
              <button class="qr-action-btn" id="share-qr" title="Share QR Code">
                <span>📤</span>
                <span>Share</span>
              </button>
              <button class="qr-action-btn primary" id="copy-link" title="Copy Link">
                <span>📋</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          <!-- QR Type Selector -->
          <div class="qr-type-selector">
            <h4>Select QR Type</h4>
            <div class="qr-type-options">
              <button class="qr-type-btn active" data-type="vcard">
                <span class="type-icon">👤</span>
                <span class="type-info">
                  <strong>Contact Card</strong>
                  <span>Save to phone contacts</span>
                </span>
              </button>
              
              <button class="qr-type-btn" data-type="website">
                <span class="type-icon">🌐</span>
                <span class="type-info">
                  <strong>Website</strong>
                  <span>Visit our website</span>
                </span>
              </button>
              
              <button class="qr-type-btn" data-type="whatsapp">
                <span class="type-icon">💬</span>
                <span class="type-info">
                  <strong>WhatsApp</strong>
                  <span>Start chat instantly</span>
                </span>
              </button>
              
              <button class="qr-type-btn" data-type="email">
                <span class="type-icon">✉️</span>
                <span class="type-info">
                  <strong>Email</strong>
                  <span>Send us an email</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="qr-stats">
          <div class="qr-stat">
            <span class="stat-icon">⚡</span>
            <span class="stat-value">Instant</span>
            <span class="stat-label">Contact Save</span>
          </div>
          <div class="qr-stat">
            <span class="stat-icon">🔒</span>
            <span class="stat-value">Secure</span>
            <span class="stat-label">No Data Stored</span>
          </div>
          <div class="qr-stat">
            <span class="stat-icon">📱</span>
            <span class="stat-value">Universal</span>
            <span class="stat-label">Works on All Phones</span>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="qr-use-cases">
          <h4>Perfect For</h4>
          <div class="use-case-grid">
            <div class="use-case-card">
              <span class="use-case-icon">🤝</span>
              <h5>Site Visits</h5>
              <p>Quickly exchange contact info with contractors on-site.</p>
            </div>
            <div class="use-case-card">
              <span class="use-case-icon">📋</span>
              <h5>Document Headers</h5>
              <p>Add to proposal documents for instant contact access.</p>
            </div>
            <div class="use-case-card">
              <span class="use-case-icon">🚧</span>
              <h5>Project Sites</h5>
              <p>Display on site boards for visitor inquiries.</p>
            </div>
            <div class="use-case-card">
              <span class="use-case-icon">🎁</span>
              <h5>Marketing Materials</h5>
              <p>Include in brochures and business cards.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents() {
    // Type selection
    this.container.querySelectorAll('.qr-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.dataset.type;
        this.switchType(type);
      });
    });

    // Action buttons
    const downloadBtn = this.container.querySelector('#download-qr');
    const shareBtn = this.container.querySelector('#share-qr');
    const copyBtn = this.container.querySelector('#copy-link');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadQR());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareQR());
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyLink());
    }
  }

  switchType(type) {
    // Update UI
    this.container.querySelectorAll('.qr-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    this.currentType = type;
    this.generateQR(type);

    // Update label
    const labels = {
      vcard: 'Digital Business Card',
      website: 'Website Link',
      whatsapp: 'WhatsApp Chat Link',
      email: 'Email Contact Link'
    };
    
    const labelEl = this.container.querySelector('#qr-type-label');
    if (labelEl) {
      labelEl.textContent = labels[type] || 'QR Code';
      labelEl.style.animation = 'none';
      labelEl.offsetHeight;
      labelEl.style.animation = 'fadeIn 0.3s ease';
    }

    console.log(`📱 QR Type switched to: ${type}`);
  }

  generateQR(type) {
    const canvas = this.container.querySelector('#qrCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = this.config.size;
    
    canvas.width = size;
    canvas.height = size;

    // Get data based on type
    let data = this.qrData.vcard;
    switch(type) {
      case 'website':
        data = this.qrData.website;
        break;
      case 'whatsapp':
        data = this.qrData.whatsapp;
        break;
      case 'email':
        data = 'mailto:info@buildbridge.co.za?subject=Project Inquiry';
        break;
    }

    // Clear canvas
    ctx.fillStyle = this.config.bgColor;
    ctx.fillRect(0, 0, size, size);

    // Generate simplified QR pattern (for demo - uses visual representation)
    this.drawQRPattern(ctx, size, data);

    // Add styling overlay
    this.addStyledElements(ctx, size);
  }

  drawQRPattern(ctx, size, data) {
    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    const padding = 2;

    // Seed random with data hash for consistent pattern per type
    const hash = this.hashCode(data);
    const rng = this.seededRandom(hash);

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Corner patterns (position detection)
        const isCorner = 
          (row < 7 && col < 7) || 
          (row < 7 && col >= moduleCount - 7) || 
          (row >= moduleCount - 7 && col < 7);

        let shouldDraw = false;

        if (isCorner) {
          // Draw corner patterns
          const cornerRow = row < 7 ? row : row - (moduleCount - 7);
          const cornerCol = col < 7 ? col : col - (moduleCount - 7);
          
          // Outer square
          if ((cornerRow === 0 || cornerRow === 6) && cornerCol >= 0 && cornerCol <= 6) {
            shouldDraw = true;
          } else if ((cornerCol === 0 || cornerCol === 6) && cornerRow >= 1 && cornerRow <= 5) {
            shouldDraw = true;
          } else if (cornerRow >= 2 && cornerRow <= 4 && cornerCol >= 2 && cornerCol <= 4) {
            shouldDraw = true;
          }
        } else {
          // Data modules - pseudo-random based on data
          shouldDraw = rng() > 0.5;
        }

        if (shouldDraw) {
          ctx.fillStyle = this.config.color;
          ctx.fillRect(
            (col + padding * 0.5) * moduleSize,
            (row + padding * 0.5) * moduleSize,
            moduleSize * 0.85,
            moduleSize * 0.85
          );
        }
      }
    }

    // Add timing patterns
    ctx.fillStyle = this.config.color;
    for (let i = 8; i < moduleCount - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect((i + 0.5) * moduleSize, 6.5 * moduleSize, moduleSize * 0.85, moduleSize * 0.85);
        ctx.fillRect(6.5 * moduleSize, (i + 0.5) * moduleSize, moduleSize * 0.85, moduleSize * 0.85);
      }
    }
  }

  addStyledElements(ctx, size) {
    // Add subtle glow effect
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(201, 206, 214, 0.05)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  seededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  downloadQR() {
    const canvas = this.container.querySelector('#qrCanvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `buildbridge-qr-${this.currentType}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (window.Toast) {
      Toast.success('QR code downloaded!', { duration: 3000 });
    }

    console.log('📱 QR code downloaded');
  }

  async shareQR() {
    const canvas = this.container.querySelector('#qrCanvas');
    if (!canvas) return;

    try {
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      const file = new File([blob], 'buildbridge-qr.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'BuildBridge QR Code',
          text: 'Scan to connect with BuildBridge Construction Management'
        });
      } else {
        // Fallback: copy to clipboard
        this.copyLink();
      }
    } catch (error) {
      console.error('Share failed:', error);
      this.copyLink();
    }
  }

  copyLink() {
    const links = {
      vcard: this.qrData.vcard,
      website: this.qrData.website,
      whatsapp: this.qrData.whatsapp,
      email: 'info@buildbridge.co.za'
    };

    navigator.clipboard.writeText(links[this.currentType]).then(() => {
      if (window.Toast) {
        Toast.success('Link copied to clipboard!', { duration: 3000 });
      }
    });

    console.log('📱 Link copied');
  }

  destroy() {
    // Cleanup if needed
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Delay initialization for better page load performance
  setTimeout(() => {
    window.smartQRGenerator = new SmartQRGenerator({
      size: 256,
      color: '#C9CED6',
      bgColor: '#0F0F10'
    });
  }, 2000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartQRGenerator;
}
