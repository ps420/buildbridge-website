/**
 * SVG Icon Animations
 * Animated construction and business icons
 */

class SVGIconAnimations {
  constructor() {
    this.icons = {
      construction: this.getConstructionIcon(),
      blueprint: this.getBlueprintIcon(),
      crane: this.getCraneIcon(),
      helmet: this.getHelmetIcon(),
      building: this.getBuildingIcon(),
      tools: this.getToolsIcon()
    };
  }
  
  getConstructionIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon construction-icon">
        <defs>
          <linearGradient id="constructionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <path class="icon-path" d="M8 56 L56 56" stroke="url(#constructionGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path class="icon-path" d="M16 56 L16 24 L32 8 L48 24 L48 56" stroke="url(#constructionGrad)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="icon-path" d="M24 56 L24 36 L40 36 L40 56" stroke="url(#constructionGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle class="icon-dot" cx="32" cy="20" r="4" fill="url(#constructionGrad)"/>
      </svg>
    `;
  }
  
  getBlueprintIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon blueprint-icon">
        <defs>
          <linearGradient id="blueprintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <rect class="icon-path" x="8" y="8" width="48" height="48" rx="4" stroke="url(#blueprintGrad)" stroke-width="3" fill="none"/>
        <path class="icon-path" d="M16 24 L48 24" stroke="url(#blueprintGrad)" stroke-width="2"/>
        <path class="icon-path" d="M16 32 L40 32" stroke="url(#blueprintGrad)" stroke-width="2"/>
        <path class="icon-path" d="M16 40 L44 40" stroke="url(#blueprintGrad)" stroke-width="2"/>
        <circle class="icon-dot" cx="48" cy="32" r="3" fill="url(#blueprintGrad)"/>
      </svg>
    `;
  }
  
  getCraneIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon crane-icon">
        <defs>
          <linearGradient id="craneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <path class="icon-path" d="M8 56 L20 56 L20 20 L44 8 L44 56 L56 56" stroke="url(#craneGrad)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="icon-path" d="M20 20 L44 20" stroke="url(#craneGrad)" stroke-width="2"/>
        <circle class="icon-pulley" cx="44" cy="26" r="4" stroke="url(#craneGrad)" stroke-width="2" fill="none"/>
        <path class="icon-cable" d="M44 30 L44 44" stroke="url(#craneGrad)" stroke-width="1.5"/>
        <rect class="icon-load" x="38" y="44" width="12" height="8" rx="1" stroke="url(#craneGrad)" stroke-width="2" fill="none"/>
      </svg>
    `;
  }
  
  getHelmetIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon helmet-icon">
        <defs>
          <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <path class="icon-path" d="M12 36 Q12 16 32 16 Q52 16 52 36" stroke="url(#helmetGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path class="icon-path" d="M8 36 L56 36" stroke="url(#helmetGrad)" stroke-width="3" stroke-linecap="round"/>
        <path class="icon-path" d="M16 36 L16 44 Q16 52 32 52 Q48 52 48 44 L48 36" stroke="url(#helmetGrad)" stroke-width="3" fill="none"/>
        <path class="icon-path" d="M24 44 L40 44" stroke="url(#helmetGrad)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  
  getBuildingIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon building-icon">
        <defs>
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <path class="icon-path" d="M16 56 L16 12 L32 4 L48 12 L48 56" stroke="url(#buildingGrad)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="icon-path" d="M24 56 L24 28 L40 28 L40 56" stroke="url(#buildingGrad)" stroke-width="3" fill="none"/>
        <rect class="icon-window" x="28" y="36" width="8" height="8" rx="1" stroke="url(#buildingGrad)" stroke-width="2" fill="none"/>
        <rect class="icon-window" x="28" y="20" width="8" height="6" rx="1" stroke="url(#buildingGrad)" stroke-width="2" fill="none"/>
        <path class="icon-path" d="M8 56 L56 56" stroke="url(#buildingGrad)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  }
  
  getToolsIcon() {
    return `
      <svg viewBox="0 0 64 64" class="animated-icon tools-icon">
        <defs>
          <linearGradient id="toolsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#c9ced6"/>
            <stop offset="100%" style="stop-color:#fff"/>
          </linearGradient>
        </defs>
        <path class="icon-path" d="M20 16 L20 48" stroke="url(#toolsGrad)" stroke-width="3" stroke-linecap="round"/>
        <path class="icon-path" d="M12 24 L28 24" stroke="url(#toolsGrad)" stroke-width="3" stroke-linecap="round"/>
        <path class="icon-path" d="M44 16 L44 48" stroke="url(#toolsGrad)" stroke-width="3" stroke-linecap="round"/>
        <path class="icon-path" d="M36 40 L52 40" stroke="url(#toolsGrad)" stroke-width="3" stroke-linecap="round"/>
        <circle class="icon-dot" cx="44" cy="32" r="4" fill="url(#toolsGrad)"/>
      </svg>
    `;
  }
  
  injectIcon(container, iconName) {
    if (this.icons[iconName]) {
      container.innerHTML = this.icons[iconName];
      this.animateIcon(container.querySelector('svg'));
    }
  }
  
  animateIcon(svg) {
    const paths = svg.querySelectorAll('.icon-path');
    const dots = svg.querySelectorAll('.icon-dot');
    
    paths.forEach((path, index) => {
      const length = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      
      setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 1s ease';
        path.style.strokeDashoffset = '0';
      }, index * 150);
    });
    
    dots.forEach((dot, index) => {
      dot.style.opacity = '0';
      dot.style.transform = 'scale(0)';
      
      setTimeout(() => {
        dot.style.transition = 'all 0.4s ease';
        dot.style.opacity = '1';
        dot.style.transform = 'scale(1)';
      }, 500 + index * 100);
    });
  }
}

// Initialize
const iconAnimations = new SVGIconAnimations();

// Auto-inject icons for elements with data-icon attribute
document.querySelectorAll('[data-animated-icon]').forEach(el => {
  const iconName = el.dataset.animatedIcon;
  iconAnimations.injectIcon(el, iconName);
});
