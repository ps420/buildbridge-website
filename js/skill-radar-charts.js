/**
 * Skill Radar Charts - v67.0
 * Fortune 500 Professional Team Skills Visualization
 * Interactive radar charts with smooth animations
 */

(function() {
  'use strict';

  const SkillRadar = {
    // Team members data with their skills
    teamData: [
      {
        id: 'john-anderson',
        name: 'John Anderson',
        role: 'CEO & Founder',
        avatar: 'assets/02_Website_Heroes/Hero_2.png',
        skills: {
          'Strategic Planning': 95,
          'Risk Management': 92,
          'Team Leadership': 88,
          'Project Oversight': 96,
          'Client Relations': 90,
          'Financial Acumen': 85
        }
      },
      {
        id: 'sarah-mitchell',
        name: 'Sarah Mitchell',
        role: 'Operations Director',
        skills: {
          'Operations': 96,
          'Quality Control': 94,
          'Process Optimization': 91,
          'Team Management': 89,
          'Vendor Relations': 87,
          'Compliance': 93
        }
      },
      {
        id: 'michael-okonkwo',
        name: 'Michael Okonkwo',
        role: 'Head of Contractor Relations',
        skills: {
          'Contractor Vetting': 97,
          'Negotiation': 93,
          'Network Building': 95,
          'Contract Management': 90,
          'Risk Assessment': 88,
          'Procurement': 86
        }
      },
      {
        id: 'lisa-van-der-berg',
        name: 'Lisa van der Berg',
        role: 'Quality Assurance Manager',
        skills: {
          'Quality Control': 98,
          'Structural Analysis': 94,
          'Compliance': 96,
          'Safety Standards': 95,
          'Documentation': 91,
          'Inspection': 93
        }
      }
    ],

    // Configuration
    config: {
      size: 280,
      padding: 40,
      levels: 5,
      maxValue: 100,
      animationDuration: 1200,
      colors: {
        stroke: '#C9CED6',
        fill: 'rgba(201, 206, 214, 0.3)',
        grid: 'rgba(201, 206, 214, 0.1)',
        point: '#C9CED6'
      }
    },

    init() {
      this.createSkillSection();
      this.createRadarCharts();
      this.bindEvents();
      this.initIntersectionObserver();
    },

    createSkillSection() {
      // Check if section already exists
      if (document.getElementById('team-skills')) return;

      const section = document.createElement('section');
      section.id = 'team-skills';
      section.className = 'team-skills-section';
      section.setAttribute('data-section', 'TeamSkills');
      section.setAttribute('data-nav-label', 'Team Skills');

      section.innerHTML = `
        <div class="skills-section-header">
          <span class="eyebrow">Expertise</span>
          <h2>Team <span>Capabilities</span></h2>
          <p>Explore the diverse skill sets our leadership team brings to every project. Interactive radar charts show proficiency across key construction management competencies.</p>
        </div>
        <div class="team-skills-grid" id="teamSkillsGrid"></div>
      `;

      // Insert after team section
      const teamSection = document.getElementById('team');
      if (teamSection) {
        teamSection.after(section);
      } else {
        // Append to main content
        const main = document.querySelector('main') || document.body;
        main.appendChild(section);
      }
    },

    createRadarCharts() {
      const grid = document.getElementById('teamSkillsGrid');
      if (!grid) return;

      this.teamData.forEach((member, index) => {
        const card = this.createSkillCard(member, index);
        grid.appendChild(card);
      });

      // Add mouse tracking for spotlight effect
      this.initSpotlightEffect();
    },

    createSkillCard(member, index) {
      const card = document.createElement('div');
      card.className = 'team-skill-card';
      card.style.transitionDelay = `${index * 100}ms`;
      card.dataset.memberId = member.id;

      const skillEntries = Object.entries(member.skills);
      const skillCount = skillEntries.length;
      const angleStep = (Math.PI * 2) / skillCount;
      const radius = (this.config.size - this.config.padding * 2) / 2;
      const center = this.config.size / 2;

      // Create SVG paths
      let dataPoints = '';
      let pointElements = '';
      let labelElements = '';
      let valueLabels = '';
      let legendItems = '';
      let dataPath = '';

      skillEntries.forEach(([skill, value], i) => {
        const angle = i * angleStep - Math.PI / 2;
        const valueRadius = (value / this.config.maxValue) * radius;
        const x = center + Math.cos(angle) * valueRadius;
        const y = center + Math.sin(angle) * valueRadius;
        const labelX = center + Math.cos(angle) * (radius + 25);
        const labelY = center + Math.sin(angle) * (radius + 25);
        const valueLabelX = center + Math.cos(angle) * (valueRadius - 15);
        const valueLabelY = center + Math.sin(angle) * (valueRadius - 15);

        dataPoints += `${x},${y} `;
        
        pointElements += `<circle class="radar-data-point" cx="${x}" cy="${y}" data-skill="${skill}" data-value="${value}" />`;
        
        labelElements += `<text class="radar-label" x="${labelX}" y="${labelY}">${skill}</text>`;
        
        valueLabels += `<text class="radar-value-label" x="${valueLabelX}" y="${valueLabelY}">${value}%</text>`;

        // Calculate CSS variable for progress bar
        legendItems += `
          <div class="skill-legend-item" style="--skill-value: ${value}%" data-skill="${skill}">
            <div class="skill-legend-dot"></div>
            <div class="skill-legend-info">
              <span class="skill-legend-name">${skill}</span>
            </div>
            <span class="skill-legend-value">${value}%</span>
          </div>
        `;
      });

      // Create grid polygons
      let gridPolygons = '';
      for (let level = 1; level <= this.config.levels; level++) {
        const levelRadius = (radius / this.config.levels) * level;
        let points = '';
        for (let i = 0; i < skillCount; i++) {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + Math.cos(angle) * levelRadius;
          const y = center + Math.sin(angle) * levelRadius;
          points += `${x},${y} `;
        }
        gridPolygons += `<polygon class="radar-grid-polygon" points="${points}" />`;
      }

      // Create axis lines
      let axisLines = '';
      for (let i = 0; i < skillCount; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        axisLines += `<line class="radar-axis-line" x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`;
      }

      card.innerHTML = `
        <div class="skill-member-header">
          <div class="skill-member-avatar">
            <img src="${member.avatar}" alt="${member.name}" loading="lazy">
          </div>
          <div class="skill-member-info">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
          </div>
        </div>
        
        <div class="radar-chart-container">
          <svg class="radar-chart-svg" viewBox="0 0 ${this.config.size} ${this.config.size}">
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#C9CED6;stop-opacity:0.4" />
                <stop offset="100%" style="stop-color:#C9CED6;stop-opacity:0.1" />
              </radialGradient>
            </defs>
            ${gridPolygons}
            ${axisLines}
            <polygon class="radar-data-area" points="${dataPoints}" />
            ${pointElements}
            ${labelElements}
            ${valueLabels}
          </svg>
        </div>
        
        <div class="skill-legend">
          ${legendItems}
        </div>
        
        <div class="skill-level-badge">
          Expert Level
        </div>
      `;

      return card;
    },

    initSpotlightEffect() {
      const cards = document.querySelectorAll('.team-skill-card');
      
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });
    },

    initIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('skill-visible');
            
            // Animate skill bars
            const bars = entry.target.querySelectorAll('.skill-bar-fill');
            bars.forEach((bar, i) => {
              setTimeout(() => {
                bar.style.width = bar.style.getPropertyValue('--skill-value') || '0%';
              }, i * 50);
            });
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.team-skill-card').forEach(card => {
        observer.observe(card);
      });
    },

    createTooltip() {
      const tooltip = document.createElement('div');
      tooltip.className = 'skill-tooltip';
      tooltip.id = 'skillTooltip';
      document.body.appendChild(tooltip);
      return tooltip;
    },

    bindEvents() {
      const tooltip = this.createTooltip();

      // Tooltip on hover for radar points
      document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('radar-data-point')) {
          const skill = e.target.dataset.skill;
          const value = e.target.dataset.value;
          const card = e.target.closest('.team-skill-card');
          const memberName = card.querySelector('.skill-member-info h3').textContent;

          tooltip.innerHTML = `
            <h4>${skill}</h4>
            <p>${memberName}'s proficiency in ${skill.toLowerCase()} across ${Math.floor(value / 10)}+ years of experience.</p>
            <span class="skill-tooltip-level">${value}% Proficiency</span>
          `;
          
          tooltip.classList.add('tooltip-visible');
        }
      });

      document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('radar-data-point')) {
          tooltip.classList.remove('tooltip-visible');
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('tooltip-visible')) {
          const x = e.clientX + 15;
          const y = e.clientY - 15;
          
          // Keep tooltip in viewport
          const rect = tooltip.getBoundingClientRect();
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          
          let finalX = x;
          let finalY = y;
          
          if (x + rect.width > winWidth) finalX = e.clientX - rect.width - 15;
          if (y + rect.height > winHeight) finalY = e.clientY - rect.height - 15;
          
          tooltip.style.left = `${finalX}px`;
          tooltip.style.top = `${finalY}px`;
        }
      });

      // Legend item hover effect
      document.addEventListener('mouseover', (e) => {
        const legendItem = e.target.closest('.skill-legend-item');
        if (legendItem) {
          const skill = legendItem.dataset.skill;
          const card = legendItem.closest('.team-skill-card');
          const point = card.querySelector(`.radar-data-point[data-skill="${skill}"]`);
          if (point) {
            point.style.r = '8';
            point.style.fill = '#F5F7FA';
          }
        }
      });

      document.addEventListener('mouseout', (e) => {
        const legendItem = e.target.closest('.skill-legend-item');
        if (legendItem) {
          const skill = legendItem.dataset.skill;
          const card = legendItem.closest('.team-skill-card');
          const point = card.querySelector(`.radar-data-point[data-skill="${skill}"]`);
          if (point) {
            point.style.r = '5';
            point.style.fill = '#C9CED6';
          }
        }
      });
    },

    // Public API to update skills
    updateSkills(memberId, newSkills) {
      const member = this.teamData.find(m => m.id === memberId);
      if (member) {
        member.skills = { ...member.skills, ...newSkills };
        this.refreshChart(memberId);
      }
    },

    refreshChart(memberId) {
      const card = document.querySelector(`.team-skill-card[data-member-id="${memberId}"]`);
      if (card) {
        const member = this.teamData.find(m => m.id === memberId);
        const newCard = this.createSkillCard(member, 0);
        card.innerHTML = newCard.innerHTML;
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SkillRadar.init());
  } else {
    SkillRadar.init();
  }

  // Expose to global scope
  window.BuildBridgeSkillRadar = SkillRadar;

})();
