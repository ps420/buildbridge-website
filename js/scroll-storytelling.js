/**
 * v96.0: Scroll-Linked Storytelling Section
 * Fortune 500 Quality - Parallax Typography, Scroll-Triggered Narratives
 * Creates immersive storytelling experiences tied to scroll position
 */
(function() {
  'use strict';

  class ScrollStorytelling {
    constructor() {
      this.sections = [];
      this.isActive = false;
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.viewportHeight = window.innerHeight;
      this.scrollProgress = 0;
      this.currentSection = 0;
      
      this.init();
    }

    init() {
      if (this.prefersReducedMotion) return;
      
      this.discoverSections();
      this.initScrollListener();
      this.initParallaxText();
      this.initMorphingHeadlines();
      this.initProgressiveReveal();
      this.initStickyNarratives();
      this.initSplitTextAnimations();
      this.initKineticTypography();
      
      console.log('📖 BuildBridge v96.0: Scroll Storytelling initialized');
    }

    discoverSections() {
      // Find all storytelling sections
      document.querySelectorAll('[data-story-section]').forEach((section, index) => {
        this.sections.push({
          element: section,
          index: index,
          type: section.dataset.storySection,
          triggers: section.querySelectorAll('[data-story-trigger]')
        });
      });
    }

    // ========== SCROLL PROGRESS ==========
    initScrollListener() {
      let ticking = false;
      
      const updateScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', updateScroll, { passive: true });
      this.updateProgress();
    }

    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - this.viewportHeight;
      this.scrollProgress = Math.min(scrollTop / docHeight, 1);

      // Update each section
      this.sections.forEach(section => {
        this.updateSectionProgress(section, scrollTop);
      });
    }

    updateSectionProgress(section, scrollTop) {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate section progress (0 to 1)
      const progress = Math.max(0, Math.min(1, 
        (this.viewportHeight - sectionTop) / (this.viewportHeight + sectionHeight)
      ));

      section.progress = progress;

      // Apply type-specific animations
      switch(section.type) {
        case 'parallax-text':
          this.updateParallaxText(section, progress);
          break;
        case 'morphing-headline':
          this.updateMorphingHeadline(section, progress);
          break;
        case 'progressive-reveal':
          this.updateProgressiveReveal(section, progress);
          break;
        case 'sticky-narrative':
          this.updateStickyNarrative(section, progress);
          break;
        case 'split-text':
          this.updateSplitText(section, progress);
          break;
      }
    }

    // ========== PARALLAX TEXT ==========
    initParallaxText() {
      const style = document.createElement('style');
      style.textContent = `
        .parallax-text-section {
          min-height: 200vh;
          position: relative;
        }
        
        .parallax-text-container {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .parallax-text-layer {
          position: absolute;
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(3rem, 15vw, 12rem);
          line-height: 1;
          white-space: nowrap;
          will-change: transform, opacity;
        }
        
        .parallax-text-layer.back {
          color: rgba(201, 206, 214, 0.05);
          font-size: clamp(4rem, 20vw, 16rem);
        }
        
        .parallax-text-layer.mid {
          color: rgba(201, 206, 214, 0.1);
          font-size: clamp(3.5rem, 17vw, 14rem);
        }
        
        .parallax-text-layer.front {
          color: #F5F7FA;
          text-shadow: 0 0 80px rgba(201, 206, 214, 0.3);
        }
        
        .parallax-text-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          padding: 0 40px;
        }
        
        .parallax-text-content h2 {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #F5F7FA 0%, #C9CED6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .parallax-text-content p {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          color: rgba(201, 206, 214, 0.8);
          line-height: 1.8;
        }
      `;
      document.head.appendChild(style);
    }

    updateParallaxText(section, progress) {
      const layers = section.element.querySelectorAll('.parallax-text-layer');
      const content = section.element.querySelector('.parallax-text-content');

      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.3;
        const translateY = (progress - 0.5) * 200 * speed;
        const translateX = (progress - 0.5) * 100 * speed;
        const opacity = 1 - Math.abs(progress - 0.5) * 2;
        
        layer.style.transform = `translate(${translateX}px, ${translateY}px)`;
        layer.style.opacity = Math.max(0.2, opacity);
      });

      if (content) {
        const contentProgress = Math.sin(progress * Math.PI);
        content.style.opacity = contentProgress;
        content.style.transform = `translateY(${(1 - contentProgress) * 50}px)`;
      }
    }

    // ========== MORPHING HEADLINES ==========
    initMorphingHeadlines() {
      const style = document.createElement('style');
      style.textContent = `
        .morphing-headline-section {
          min-height: 150vh;
          padding: 100px 0;
        }
        
        .morphing-headline-container {
          position: sticky;
          top: 20%;
          text-align: center;
        }
        
        .morphing-word {
          display: inline-block;
          position: relative;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: clamp(2.5rem, 8vw, 6rem);
          color: #F5F7FA;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .morphing-word.morphing {
          animation: wordMorph 0.8s ease forwards;
        }
        
        @keyframes wordMorph {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
          50% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        
        .morphing-headline-line {
          display: block;
          overflow: hidden;
        }
        
        .morphing-headline-line .word-wrapper {
          display: inline-block;
          transform: translateY(100%);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .morphing-headline-line.revealed .word-wrapper {
          transform: translateY(0);
          opacity: 1;
        }
        
        .morphing-headline-line:nth-child(1) .word-wrapper { transition-delay: 0s; }
        .morphing-headline-line:nth-child(2) .word-wrapper { transition-delay: 0.1s; }
        .morphing-headline-line:nth-child(3) .word-wrapper { transition-delay: 0.2s; }
      `;
      document.head.appendChild(style);
    }

    updateMorphingHeadline(section, progress) {
      const words = section.element.querySelectorAll('[data-morph-word]');
      const lines = section.element.querySelectorAll('.morphing-headline-line');

      // Trigger morphing at specific progress points
      words.forEach(word => {
        const morphAt = parseFloat(word.dataset.morphAt) || 0.5;
        const morphProgress = (progress - morphAt) * 4;
        
        if (morphProgress > 0 && morphProgress < 1) {
          word.style.transform = `scale(${1 + morphProgress * 0.1})`;
          word.style.opacity = 1 - morphProgress * 0.5;
        } else if (morphProgress >= 1) {
          const newWord = word.dataset.morphTo;
          if (newWord && word.textContent !== newWord) {
            word.textContent = newWord;
            word.style.animation = 'wordMorph 0.6s ease';
          }
        }
      });

      // Reveal lines progressively
      lines.forEach((line, index) => {
        const revealAt = index * 0.15;
        if (progress > revealAt) {
          line.classList.add('revealed');
        }
      });
    }

    // ========== PROGRESSIVE REVEAL ==========
    initProgressiveReveal() {
      const style = document.createElement('style');
      style.textContent = `
        .progressive-reveal-section {
          min-height: 250vh;
        }
        
        .progressive-reveal-container {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        
        .reveal-stage {
          position: absolute;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 40px;
          opacity: 0;
          transform: translateY(100px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reveal-stage.active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .reveal-stage.exit {
          opacity: 0;
          transform: translateY(-100px) scale(0.9);
        }
        
        .reveal-number {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(6rem, 15vw, 12rem);
          font-weight: 900;
          color: rgba(201, 206, 214, 0.1);
          line-height: 1;
          position: absolute;
          top: -40px;
          left: 0;
          z-index: -1;
        }
        
        .reveal-stage h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 20px;
          color: #F5F7FA;
        }
        
        .reveal-stage p {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1rem, 1.2vw, 1.125rem);
          color: rgba(201, 206, 214, 0.8);
          line-height: 1.8;
        }
        
        .reveal-progress-bar {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 2px;
          background: rgba(201, 206, 214, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .reveal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #C9CED6, #F5F7FA);
          transition: width 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }

    updateProgressiveReveal(section, progress) {
      const stages = section.element.querySelectorAll('.reveal-stage');
      const progressBar = section.element.querySelector('.reveal-progress-fill');
      
      const stageCount = stages.length;
      const stageProgress = progress * stageCount;
      const currentStageIndex = Math.floor(stageProgress);
      const stageFraction = stageProgress - currentStageIndex;

      stages.forEach((stage, index) => {
        stage.classList.remove('active', 'exit');
        
        if (index === currentStageIndex) {
          stage.classList.add('active');
          stage.style.opacity = 1 - stageFraction;
          stage.style.transform = `translateY(${-stageFraction * 50}px)`;
        } else if (index === currentStageIndex + 1) {
          stage.classList.add('active');
          stage.style.opacity = stageFraction;
          stage.style.transform = `translateY(${(1 - stageFraction) * 50}px)`;
        } else if (index < currentStageIndex) {
          stage.classList.add('exit');
        }
      });

      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }
    }

    // ========== STICKY NARRATIVES ==========
    initStickyNarratives() {
      const style = document.createElement('style');
      style.textContent = `
        .sticky-narrative-section {
          position: relative;
        }
        
        .sticky-narrative-wrapper {
          display: flex;
          min-height: 300vh;
        }
        
        .sticky-visual {
          position: sticky;
          top: 0;
          width: 50%;
          height: 100vh;
          overflow: hidden;
        }
        
        .sticky-visual-image {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.1);
          transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sticky-visual-image.active {
          opacity: 1;
          transform: scale(1);
        }
        
        .sticky-visual-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .sticky-content {
          width: 50%;
          padding: 100px 60px;
        }
        
        .narrative-item {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          opacity: 0.3;
          transform: translateY(50px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .narrative-item.active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .narrative-item h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 20px;
          color: #F5F7FA;
        }
        
        .narrative-item p {
          font-family: 'Poppins', sans-serif;
          font-size: 1.1rem;
          color: rgba(201, 206, 214, 0.8);
          line-height: 1.8;
        }
        
        .narrative-number {
          font-family: 'Montserrat', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          color: rgba(201, 206, 214, 0.1);
          margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
          .sticky-narrative-wrapper {
            flex-direction: column;
          }
          
          .sticky-visual,
          .sticky-content {
            width: 100%;
          }
          
          .sticky-visual {
            height: 50vh;
            position: relative;
          }
        }
      `;
      document.head.appendChild(style);
    }

    updateStickyNarrative(section, progress) {
      const items = section.element.querySelectorAll('.narrative-item');
      const images = section.element.querySelectorAll('.sticky-visual-image');
      
      const itemProgress = progress * items.length;
      const activeIndex = Math.floor(itemProgress);

      items.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
      });

      images.forEach((img, index) => {
        img.classList.toggle('active', index === activeIndex);
      });
    }

    // ========== SPLIT TEXT ANIMATIONS ==========
    initSplitTextAnimations() {
      const style = document.createElement('style');
      style.textContent = `
        .split-text span.char {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%) rotateX(-90deg);
          transform-origin: center bottom;
        }
        
        .split-text.animated span.char {
          animation: charReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes charReveal {
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        
        .split-text span.word {
          display: inline-block;
          overflow: hidden;
          margin-right: 0.3em;
        }
        
        .split-text span.word-inner {
          display: inline-block;
          transform: translateY(100%);
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .split-text.animated span.word-inner {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);

      // Auto-split text elements
      document.querySelectorAll('[data-split-text]').forEach(el => {
        const type = el.dataset.splitText || 'chars';
        const text = el.textContent;
        el.innerHTML = '';
        
        if (type === 'chars') {
          text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${i * 0.03}s`;
            el.appendChild(span);
          });
        } else if (type === 'words') {
          text.split(' ').forEach((word, i) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.textContent = word;
            inner.style.transitionDelay = `${i * 0.1}s`;
            
            wordSpan.appendChild(inner);
            el.appendChild(wordSpan);
          });
        }
        
        el.classList.add('split-text');
      });
    }

    updateSplitText(section, progress) {
      const splitElements = section.element.querySelectorAll('.split-text');
      
      if (progress > 0.2 && progress < 0.8) {
        splitElements.forEach(el => {
          el.classList.add('animated');
        });
      }
    }

    // ========== KINETIC TYPOGRAPHY ==========
    initKineticTypography() {
      const style = document.createElement('style');
      style.textContent = `
        .kinetic-text-scroll {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(4rem, 12vw, 10rem);
          line-height: 1;
          white-space: nowrap;
          color: transparent;
          -webkit-text-stroke: 1px rgba(201, 206, 214, 0.3);
          transition: all 0.3s ease;
        }
        
        .kinetic-text-scroll.filled {
          color: #F5F7FA;
          -webkit-text-stroke: 0;
        }
        
        .kinetic-text-container {
          overflow: hidden;
          padding: 50px 0;
        }
        
        .kinetic-scrolling-text {
          display: flex;
          gap: 50px;
          animation: kineticScroll 20s linear infinite;
        }
        
        .kinetic-scrolling-text:hover {
          animation-play-state: paused;
        }
        
        @keyframes kineticScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .kinetic-text-item {
          flex-shrink: 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 8vw, 6rem);
          color: rgba(201, 206, 214, 0.1);
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .kinetic-text-item:hover {
          color: #F5F7FA;
        }
      `;
      document.head.appendChild(style);
    }

    // ========== PUBLIC API ==========
    scrollToSection(index) {
      if (this.sections[index]) {
        this.sections[index].element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    refresh() {
      this.sections = [];
      this.discoverSections();
      this.updateProgress();
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ScrollStorytelling());
  } else {
    new ScrollStorytelling();
  }

  // Expose to global scope
  window.ScrollStorytelling = ScrollStorytelling;
})();
