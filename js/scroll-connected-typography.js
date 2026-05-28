/**
 * v36.0: Scroll-Connected Typography
 * Fortune 500 Text Transformation System
 * Text that evolves, morphs, and transforms as users scroll
 */

class ScrollTypographySystem {
  constructor() {
    this.sections = [];
    this.currentSection = 0;
    this.scrollProgress = 0;
    this.isActive = true;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.findSections();
    if (this.sections.length === 0) return;
    
    this.wrapCharacters();
    this.bindEvents();
    this.update();
  }
  
  findSections() {
    document.querySelectorAll('.scroll-typography-section').forEach((section, index) => {
      const container = section.querySelector('.scroll-typography-container');
      const headline = section.querySelector('.scroll-typography-headline');
      
      if (container && headline) {
        this.sections.push({
          element: section,
          container: container,
          headline: headline,
          words: [],
          state: 'initial',
          progress: 0
        });
      }
    });
  }
  
  wrapCharacters() {
    this.sections.forEach(section => {
      const text = section.headline.textContent;
      section.headline.innerHTML = '';
      
      let charIndex = 0;
      const words = text.split(' ');
      
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.display = 'inline-block';
        
        word.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          charSpan.style.setProperty('--char-index', charIndex);
          
          // Add scatter randomization
          const scatterY = (Math.random() - 0.5) * 100;
          const scatterRot = (Math.random() - 0.5) * 30;
          charSpan.style.setProperty('--scatter-y', `${scatterY}px`);
          charSpan.style.setProperty('--scatter-rot', `${scatterRot}deg`);
          
          wordSpan.appendChild(charSpan);
          charIndex++;
        });
        
        section.headline.appendChild(wordSpan);
        
        // Add space
        if (wordIndex < words.length - 1) {
          section.headline.appendChild(document.createTextNode(' '));
        }
      });
      
      // Create progress indicator
      this.createProgressIndicator(section);
    });
  }
  
  createProgressIndicator(section) {
    const existing = section.element.querySelector('.scroll-typography-progress');
    if (existing) return;
    
    const progress = document.createElement('div');
    progress.className = 'scroll-typography-progress';
    progress.innerHTML = `
      <div class="scroll-typography-dots">
        <div class="scroll-typography-dot active" data-phase="0"></div>
        <div class="scroll-typography-dot" data-phase="1"></div>
        <div class="scroll-typography-dot" data-phase="2"></div>
      </div>
      <span class="scroll-typography-label">Phase 1</span>
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-typography-bar';
    progressBar.innerHTML = '<div class="scroll-typography-bar-fill"></div>';
    
    section.container.appendChild(progress);
    section.container.appendChild(progressBar);
    
    // Create scroll direction indicator
    const direction = document.createElement('div');
    direction.className = 'scroll-typography-direction';
    direction.innerHTML = `
      <span class="scroll-typography-arrow">↓</span>
    `;
    section.container.appendChild(direction);
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => this.update());
      }
    }, { passive: true });
    
    window.addEventListener('resize', () => {
      this.update();
    }, { passive: true });
  }
  
  update() {
    this.rafId = null;
    
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + scrollY;
      const sectionHeight = rect.height;
      
      // Calculate section progress (0 to 1)
      const scrollStart = sectionTop - viewportHeight;
      const scrollEnd = sectionTop + sectionHeight;
      const totalScroll = scrollEnd - scrollStart;
      const currentScroll = scrollY - scrollStart;
      section.progress = Math.max(0, Math.min(1, currentScroll / totalScroll));
      
      // Update based on progress phases
      this.updatePhase(section);
      this.updateTextEffects(section);
      this.updateProgressUI(section);
    });
  }
  
  updatePhase(section) {
    const p = section.progress;
    let phase = 0;
    let state = 'compressed';
    
    // Phase transitions
    if (p < 0.25) {
      phase = 0;
      state = 'compressed';
    } else if (p < 0.5) {
      phase = 1;
      state = 'expanded';
    } else if (p < 0.75) {
      phase = 2;
      state = 'scattered';
    } else {
      phase = 3;
      state = 'focused';
    }
    
    if (section.state !== state) {
      section.state = state;
      section.headline.setAttribute('data-state', state);
    }
    
    section.phase = phase;
  }
  
  updateTextEffects(section) {
    const p = section.progress;
    const chars = section.headline.querySelectorAll('.char');
    const totalChars = chars.length;
    
    chars.forEach((char, index) => {
      const charProgress = (p * totalChars - index) / totalChars;
      const normalizedProgress = Math.max(0, Math.min(1, charProgress));
      
      // Apply different effects based on phase
      let transform = '';
      let opacity = 1;
      let filter = 'none';
      
      if (section.state === 'compressed') {
        // Letters compress together
        const compress = 1 - (p * 4);
        transform = `scale(${0.8 + compress * 0.2})`;
        opacity = 0.5 + p * 2;
      } else if (section.state === 'expanded') {
        // Letters expand with tracking
        const expand = (p - 0.25) * 4;
        const letterSpacing = expand * 0.5;
        transform = `scale(${1 + expand * 0.1})`;
        opacity = 1;
      } else if (section.state === 'scattered') {
        // Letters scatter randomly
        const scatterPhase = (p - 0.5) * 4;
        const scatterY = parseFloat(char.style.getPropertyValue('--scatter-y') || 0);
        const scatterRot = parseFloat(char.style.getPropertyValue('--scatter-rot') || 0);
        
        if (scatterPhase < 0.5) {
          transform = `translateY(${scatterY * scatterPhase * 2}px) rotate(${scatterRot * scatterPhase * 2}deg)`;
          opacity = 1 - scatterPhase * 0.5;
        } else {
          // Regather
          const regather = (scatterPhase - 0.5) * 2;
          transform = `translateY(${scatterY * (1 - regather)}px) rotate(${scatterRot * (1 - regather)}deg)`;
          opacity = 0.5 + regather * 0.5;
        }
      } else {
        // Focused - sharp and clear
        transform = 'translateY(0) rotate(0) scale(1)';
        opacity = 1;
        
        // Add wave effect in final phase
        const wavePhase = (p - 0.75) * 4;
        if (wavePhase > 0.5) {
          const wave = Math.sin(Date.now() * 0.003 + index * 0.2) * 5;
          transform += ` translateY(${wave * (wavePhase - 0.5) * 2}px)`;
        }
      }
      
      char.style.transform = transform;
      char.style.opacity = opacity;
      char.style.filter = filter;
    });
  }
  
  updateProgressUI(section) {
    // Update dots
    const dots = section.element.querySelectorAll('.scroll-typography-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index <= section.phase);
    });
    
    // Update label
    const label = section.element.querySelector('.scroll-typography-label');
    if (label) {
      label.textContent = `Phase ${section.phase + 1}`;
    }
    
    // Update progress bar
    const barFill = section.element.querySelector('.scroll-typography-bar-fill');
    if (barFill) {
      barFill.style.width = `${section.progress * 100}%`;
    }
    
    // Hide direction indicator after starting
    const direction = section.element.querySelector('.scroll-typography-direction');
    if (direction) {
      direction.style.opacity = section.progress > 0.1 ? '0' : '1';
    }
  }
  
  // Morph between different text phrases
  morphText(newText, duration = 800) {
    this.sections.forEach(section => {
      const chars = section.headline.querySelectorAll('.char');
      
      // Scramble out
      chars.forEach(char => {
        char.style.transition = `all ${duration * 0.3}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        char.style.opacity = '0';
        char.style.transform = 'translateY(-20px) rotateX(90deg)';
      });
      
      // Update text after scramble
      setTimeout(() => {
        const oldWords = section.headline.querySelectorAll('.word');
        oldWords.forEach(w => w.remove());
        
        // Create new text
        let charIndex = 0;
        newText.split(' ').forEach((word, wordIndex, arr) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word';
          
          word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char;
            charSpan.style.setProperty('--char-index', charIndex);
            charSpan.style.opacity = '0';
            charSpan.style.transform = 'translateY(20px) rotateX(-90deg)';
            wordSpan.appendChild(charSpan);
            charIndex++;
          });
          
          section.headline.appendChild(wordSpan);
          if (wordIndex < arr.length - 1) {
            section.headline.appendChild(document.createTextNode(' '));
          }
        });
        
        // Reveal new text
        requestAnimationFrame(() => {
          const newChars = section.headline.querySelectorAll('.char');
          newChars.forEach((char, index) => {
            setTimeout(() => {
              char.style.transition = `all ${duration * 0.5}ms cubic-bezier(0.16, 1, 0.3, 1)`;
              char.style.opacity = '1';
              char.style.transform = 'translateY(0) rotateX(0)';
            }, index * 30);
          });
        });
      }, duration * 0.3);
    });
  }
  
  // Animate wave effect
  startWaveAnimation() {
    this.sections.forEach(section => {
      section.headline.classList.add('scroll-typography-wave');
    });
  }
  
  stopWaveAnimation() {
    this.sections.forEach(section => {
      section.headline.classList.remove('scroll-typography-wave');
    });
  }
  
  destroy() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTypography = new ScrollTypographySystem();
  });
} else {
  window.scrollTypography = new ScrollTypographySystem();
}
