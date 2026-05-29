/**
 * BuildBridge Parallax Text Sections
 * Premium Typography Parallax Effects - v79.2
 * Fortune 500 Visual Enhancement
 */

(function() {
  'use strict';
  
  class ParallaxTextController {
    constructor() {
      this.sections = [];
      this ticking = false;
      this.mouseX = 0;
      this.mouseY = 0;
      this.init();
    }
    
    init() {
      this.findSections();
      this.bindEvents();
      this.initIntersectionObserver();
      this.splitHeadings();
      console.log('🎭 Parallax Text Controller initialized');
    }
    
    findSections() {
      this.sections = Array.from(document.querySelectorAll('.parallax-text-section'));
      
      this.sections.forEach(section => {
        // Find parallax elements
        section._parallaxElements = {
          bgText: section.querySelectorAll('.parallax-bg-text'),
          floatingWords: section.querySelectorAll('.parallax-floating-word'),
          decoCircles: section.querySelectorAll('.parallax-deco-circle'),
          decoLines: section.querySelectorAll('.parallax-deco-line'),
          media: section.querySelector('.parallax-split-media img')
        };
        
        // Store initial positions
        section._parallaxElements.floatingWords.forEach((word, i) => {
          word._initialX = parseFloat(word.style.left) || (i % 2 === 0 ? -5 : 5);
          word._initialY = parseFloat(word.style.top) || (i * 10);
          word._speed = 0.02 + (i * 0.01);
        });
      });
    }
    
    bindEvents() {
      // Scroll parallax
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.updateParallax();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });
      
      // Mouse parallax for floating words
      document.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
      
      // Smooth mouse parallax update
      const updateMouseParallax = () => {
        this.updateMouseParallax();
        requestAnimationFrame(updateMouseParallax);
      };
      requestAnimationFrame(updateMouseParallax);
    }
    
    initIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target._isVisible = true;
          } else {
            entry.target._isVisible = false;
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '-10% 0px -10% 0px'
      });
      
      this.sections.forEach(section => observer.observe(section));
    }
    
    updateParallax() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      this.sections.forEach(section => {
        if (!section._isVisible) return;
        
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = (sectionCenter - viewportCenter) / windowHeight;
        
        const elements = section._parallaxElements;
        
        // Background text parallax
        elements.bgText.forEach((text, i) => {
          const speed = 0.1 + (i * 0.05);
          const y = distanceFromCenter * 100 * speed;
          const rotate = distanceFromCenter * 5 * (i % 2 === 0 ? 1 : -1);
          text.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
        });
        
        // Decorative circles
        elements.decoCircles.forEach((circle, i) => {
          const speed = 0.05 + (i * 0.03);
          const y = distanceFromCenter * 50 * speed;
          const scale = 1 + (distanceFromCenter * 0.1 * (i % 2 === 0 ? 1 : -1));
          circle.style.transform = `translateY(${y}px) scale(${scale})`;
        });
        
        // Decorative lines
        elements.decoLines.forEach((line, i) => {
          const speed = 0.08;
          const y = distanceFromCenter * 30 * speed;
          const opacity = 0.2 + (distanceFromCenter * 0.1);
          line.style.transform = `translateY(${y}px)`;
          line.style.opacity = Math.max(0.1, Math.min(0.4, opacity));
        });
        
        // Media parallax
        if (elements.media) {
          const mediaSpeed = 0.15;
          const y = distanceFromCenter * 80 * mediaSpeed;
          elements.media.style.transform = `translateY(${y}px) scale(1.1)`;
        }
      });
    }
    
    updateMouseParallax() {
      this.sections.forEach(section => {
        if (!section._isVisible) return;
        
        const elements = section._parallaxElements;
        
        elements.floatingWords.forEach(word => {
          if (!word._speed) return;
          
          const x = word._initialX + (this.mouseX * 30 * word._speed);
          const y = word._initialY + (this.mouseY * 20 * word._speed);
          
          word.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
    }
    
    splitHeadings() {
      const headings = document.querySelectorAll('.parallax-heading[data-split]');
      
      headings.forEach(heading => {
        const text = heading.textContent.trim();
        const words = text.split(' ');
        
        heading.innerHTML = words.map(word => {
          if (word.includes('<')) return word; // Skip HTML tags
          
          // Check if word should be gradient
          const isGradient = word.toLowerCase().includes('build') || 
                           word.toLowerCase().includes('bridge') ||
                           word.toLowerCase().includes('future');
          
          const className = isGradient ? 'word gradient-text' : 'word';
          return `<span class="${className}">${word}</span>`;
        }).join(' ');
      });
    }
  }
  
  // Parallax Stats Counter Animation
  class ParallaxStatsCounter {
    constructor() {
      this.stats = [];
      this.init();
    }
    
    init() {
      this.stats = Array.from(document.querySelectorAll('.parallax-stat-number[data-count]'));
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target._counted) {
            entry.target._counted = true;
            this.animateCounter(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      this.stats.forEach(stat => observer.observe(stat));
    }
    
    animateCounter(element) {
      const target = parseInt(element.dataset.count);
      const suffix = element.dataset.suffix || '';
      const prefix = element.dataset.prefix || '';
      const duration = parseInt(element.dataset.duration) || 2000;
      
      let start = 0;
      const startTime = performance.now();
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = prefix + current.toLocaleString() + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ParallaxTextController();
      new ParallaxStatsCounter();
    });
  } else {
    new ParallaxTextController();
    new ParallaxStatsCounter();
  }
  
})();
