/**
 * Scroll-Triggered SVG Animations
 * Line drawing and path animations
 */

(function() {
  'use strict';

  // Intersection Observer for SVG animations
  const svgObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  };

  // Animate paths when in view
  const pathObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        entry.target.classList.add('draw');
        pathObserver.unobserve(entry.target);
      }
    });
  }, svgObserverOptions);

  // Animate checkmarks
  const checkmarkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger animation
        const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, delay);
        checkmarkObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  // Animate circular progress
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, 200);
        progressObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  // Timeline progress animation
  function initTimelineProgress() {
    const timelines = document.querySelectorAll('.process-timeline, .timeline-container');
    
    timelines.forEach(timeline => {
      const svg = timeline.querySelector('.timeline-svg-progress');
      const items = timeline.querySelectorAll('.timeline-item');
      
      if (!svg || items.length === 0) return;
      
      const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Array.from(items).indexOf(entry.target);
            const progress = ((index + 1) / items.length) * 1000;
            svg.style.strokeDashoffset = 1000 - progress;
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.5 });
      
      items.forEach(item => itemObserver.observe(item));
    });
  }

  // Connection lines between elements
  function initConnectionLines() {
    const containers = document.querySelectorAll('.connection-container');
    
    containers.forEach(container => {
      const items = container.querySelectorAll('.connection-item');
      if (items.length < 2) return;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('svg-line-container');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '0';
      
      container.style.position = 'relative';
      container.insertBefore(svg, container.firstChild);
      
      function drawConnections() {
        svg.innerHTML = '';
        
        for (let i = 0; i < items.length - 1; i++) {
          const start = items[i].getBoundingClientRect();
          const end = items[i + 1].getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          const x1 = start.left + start.width / 2 - containerRect.left;
          const y1 = start.top + start.height / 2 - containerRect.top;
          const x2 = end.left + end.width / 2 - containerRect.left;
          const y2 = end.top + end.height / 2 - containerRect.top;
          
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.classList.add('connection-line');
          
          // Curved line
          const midY = (y1 + y2) / 2;
          const d = `M${x1},${y1} Q${x1},${midY} ${(x1 + x2) / 2},${midY} T${x2},${y2}`;
          path.setAttribute('d', d);
          
          svg.appendChild(path);
        }
      }
      
      drawConnections();
      window.addEventListener('resize', drawConnections, { passive: true });
      
      // Animate on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            svg.querySelectorAll('path').forEach((path, index) => {
              path.style.animationDelay = `${index * 0.3}s`;
            });
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(container);
    });
  }

  // Initialize all SVG animations
  function init() {
    // Observe SVG paths
    document.querySelectorAll('.svg-draw-path, .svg-line-animated').forEach(path => {
      pathObserver.observe(path);
    });
    
    // Observe checkmarks
    document.querySelectorAll('.svg-checkmark').forEach(check => {
      checkmarkObserver.observe(check);
    });
    
    // Observe circular progress
    document.querySelectorAll('.svg-circle-bar').forEach(progress => {
      progressObserver.observe(progress);
    });
    
    // Timeline progress
    initTimelineProgress();
    
    // Connection lines
    initConnectionLines();
    
    console.log('✏️ SVG Animations initialized');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
