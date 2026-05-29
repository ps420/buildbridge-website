/**
 * v71.2: MULTI-LANGUAGE SUPPORT SYSTEM
 * Fortune 500 i18n Capabilities
 * 
 * Features:
 * - 12 languages support
 * - Auto-detect user language
 * - Persist selection
 * - RTL support
 * - Smooth transitions
 */

class MultiLanguageSwitcher {
  constructor() {
    this.currentLang = localStorage.getItem('buildbridge-language') || 'en';
    this.detectedLang = null;
    
    this.languages = {
      en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Connecting Clients.',
          'Delivering Projects.': 'Delivering Projects.',
          'Building Trust.': 'Building Trust.',
          'Construction Management': 'Construction Management',
          'Our Services': 'Our Services',
          'About Us': 'About Us',
          'Contact': 'Contact',
          'Projects': 'Projects',
          'Get Quote': 'Get Quote',
          'Learn More': 'Learn More',
          'Trusted Intermediary': 'Trusted Intermediary',
          'Industry Experience': 'Industry Experience',
          'Client Focused': 'Client Focused',
          'Risk Reduction': 'Risk Reduction',
          'Value Delivery': 'Value Delivery'
        }
      },
      af: {
        code: 'af',
        name: 'Afrikaans',
        nativeName: 'Afrikaans',
        flag: '🇿🇦',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Kliënte Koppel.',
          'Delivering Projects.': 'Projekte Lewer.',
          'Building Trust.': 'Vertoue Bou.',
          'Construction Management': 'Konstruksie Bestuur',
          'Our Services': 'Ons Dienste',
          'About Us': 'Oor Ons',
          'Contact': 'Kontak',
          'Projects': 'Projekte',
          'Get Quote': 'Kry Kwotasie',
          'Learn More': 'Leer Meer',
          'Trusted Intermediary': 'Betroubare Tussenganger',
          'Industry Experience': 'Bedryfservaring',
          'Client Focused': 'Kliëntgefokus',
          'Risk Reduction': 'Risikovermindering',
          'Value Delivery': 'Waardelewering'
        }
      },
      zu: {
        code: 'zu',
        name: 'isiZulu',
        nativeName: 'isiZulu',
        flag: '🇿🇦',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Uxhumana Nezikhasi.',
          'Delivering Projects.': 'Ukuletha Amaprojekthi.',
          'Building Trust.': 'Ukwakha Ukuethemba.',
          'Construction Management': 'Ukuphathwa Kokwakha',
          'Our Services': 'Imisebenzi Yethu',
          'About Us': 'Mayelana Nathi',
          'Contact': 'Xhumana',
          'Projects': 'Amaprojekthi',
          'Get Quote': 'Thola Isilinganiso',
          'Learn More': 'Funda Kabanzi',
          'Trusted Intermediary': 'Ummeli Othembekile',
          'Industry Experience': 'Amava Kwezomnotho',
          'Client Focused': 'Kugxilwe Ekhasini',
          'Risk Reduction': 'Ukuncishiswa Kwerisiki',
          'Value Delivery': 'Ukuletha Inani'
        }
      },
      de: {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Kunden Verbinden.',
          'Delivering Projects.': 'Projekte Liefern.',
          'Building Trust.': 'Vertrauen Aufbauen.',
          'Construction Management': 'Bauleitung',
          'Our Services': 'Unsere Leistungen',
          'About Us': 'Über Uns',
          'Contact': 'Kontakt',
          'Projects': 'Projekte',
          'Get Quote': 'Angebot Einholen',
          'Learn More': 'Mehr Erfahren',
          'Trusted Intermediary': 'Vertrauenswürdiger Vermittler',
          'Industry Experience': 'Branchenerfahrung',
          'Client Focused': 'Kundenorientiert',
          'Risk Reduction': 'Risikominderung',
          'Value Delivery': 'Wertlieferung'
        }
      },
      fr: {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Connecter les Clients.',
          'Delivering Projects.': 'Livrer les Projets.',
          'Building Trust.': 'Construire la Confiance.',
          'Construction Management': 'Gestion de Construction',
          'Our Services': 'Nos Services',
          'About Us': 'À Propos',
          'Contact': 'Contact',
          'Projects': 'Projets',
          'Get Quote': 'Obtenir un Devis',
          'Learn More': 'En Savoir Plus',
          'Trusted Intermediary': 'Intermédiaire de Confiance',
          'Industry Experience': 'Expérience Industrielle',
          'Client Focused': 'Orienté Client',
          'Risk Reduction': 'Réduction des Risques',
          'Value Delivery': 'Livraison de Valeur'
        }
      },
      es: {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Conectando Clientes.',
          'Delivering Projects.': 'Entregando Proyectos.',
          'Building Trust.': 'Construyendo Confianza.',
          'Construction Management': 'Gestión de Construcción',
          'Our Services': 'Nuestros Servicios',
          'About Us': 'Sobre Nosotros',
          'Contact': 'Contacto',
          'Projects': 'Proyectos',
          'Get Quote': 'Obtener Presupuesto',
          'Learn More': 'Saber Más',
          'Trusted Intermediary': 'Intermediario Confiable',
          'Industry Experience': 'Experiencia Industrial',
          'Client Focused': 'Enfocado en el Cliente',
          'Risk Reduction': 'Reducción de Riesgos',
          'Value Delivery': 'Entrega de Valor'
        }
      },
      pt: {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇵🇹',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Conectando Clientes.',
          'Delivering Projects.': 'Entregando Projetos.',
          'Building Trust.': 'Construindo Confiança.',
          'Construction Management': 'Gestão de Construção',
          'Our Services': 'Nossos Serviços',
          'About Us': 'Sobre Nós',
          'Contact': 'Contato',
          'Projects': 'Projetos',
          'Get Quote': 'Solicitar Orçamento',
          'Learn More': 'Saiba Mais',
          'Trusted Intermediary': 'Intermediário Confiável',
          'Industry Experience': 'Experiência Industrial',
          'Client Focused': 'Foco no Cliente',
          'Risk Reduction': 'Redução de Riscos',
          'Value Delivery': 'Entrega de Valor'
        }
      },
      ar: {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        dir: 'rtl',
        translations: {
          'Connecting Clients.': 'ربط العملاء.',
          'Delivering Projects.': 'تسليم المشاريع.',
          'Building Trust.': 'بناء الثقة.',
          'Construction Management': 'إدارة البناء',
          'Our Services': 'خدماتنا',
          'About Us': 'من نحن',
          'Contact': 'اتصل',
          'Projects': 'المشاريع',
          'Get Quote': 'احصل على عرض',
          'Learn More': 'اعرف المزيد',
          'Trusted Intermediary': 'وسيط موثوق',
          'Industry Experience': 'خبرة صناعية',
          'Client Focused': 'تركيز على العميل',
          'Risk Reduction': 'تقليل المخاطر',
          'Value Delivery': 'تسليم القيمة'
        }
      },
      zh: {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': '连接客户。',
          'Delivering Projects.': '交付项目。',
          'Building Trust.': '建立信任。',
          'Construction Management': '建筑管理',
          'Our Services': '我们的服务',
          'About Us': '关于我们',
          'Contact': '联系',
          'Projects': '项目',
          'Get Quote': '获取报价',
          'Learn More': '了解更多',
          'Trusted Intermediary': '可信中介',
          'Industry Experience': '行业经验',
          'Client Focused': '以客户为中心',
          'Risk Reduction': '降低风险',
          'Value Delivery': '价值交付'
        }
      },
      hi: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'ग्राहकों को जोड़ना।',
          'Delivering Projects.': 'परियोजनाएं देना।',
          'Building Trust.': 'विश्वास बनाना।',
          'Construction Management': 'निर्माण प्रबंधन',
          'Our Services': 'हमारी सेवाएं',
          'About Us': 'हमारे बारे में',
          'Contact': 'संपर्क',
          'Projects': 'परियोजनाएं',
          'Get Quote': 'कोट प्राप्त करें',
          'Learn More': 'और जानें',
          'Trusted Intermediary': 'विश्वसनीय मध्यस्थ',
          'Industry Experience': 'उद्योग अनुभव',
          'Client Focused': 'ग्राहक केंद्रित',
          'Risk Reduction': 'जोखिम कमी',
          'Value Delivery': 'मूल्य वितरण'
        }
      },
      nl: {
        code: 'nl',
        name: 'Dutch',
        nativeName: 'Nederlands',
        flag: '🇳🇱',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Klanten Verbinden.',
          'Delivering Projects.': 'Projecten Leveren.',
          'Building Trust.': 'Vertrouwen Opbouwen.',
          'Construction Management': 'Bouwbeheer',
          'Our Services': 'Onze Diensten',
          'About Us': 'Over Ons',
          'Contact': 'Contact',
          'Projects': 'Projecten',
          'Get Quote': 'Offerte Aanvragen',
          'Learn More': 'Meer Weten',
          'Trusted Intermediary': 'Betrouwbare Tussenpersoon',
          'Industry Experience': 'Industrieële Ervaring',
          'Client Focused': 'Klantgericht',
          'Risk Reduction': 'Risicovermindering',
          'Value Delivery': 'Waarde Levering'
        }
      },
      it: {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        dir: 'ltr',
        translations: {
          'Connecting Clients.': 'Collegare i Clienti.',
          'Delivering Projects.': 'Consegnare Progetti.',
          'Building Trust.': 'Costruire Fiducia.',
          'Construction Management': 'Gestione delle Costruzioni',
          'Our Services': 'I Nostri Servizi',
          'About Us': 'Chi Siamo',
          'Contact': 'Contatto',
          'Projects': 'Progetti',
          'Get Quote': 'Richiedi Preventivo',
          'Learn More': 'Scopri di Più',
          'Trusted Intermediary': 'Intermediario Affidabile',
          'Industry Experience': 'Esperienza Industriale',
          'Client Focused': 'Orientato al Cliente',
          'Risk Reduction': 'Riduzione del Rischio',
          'Value Delivery': 'Consegna di Valore'
        }
      }
    };
    
    this.init();
  }
  
  init() {
    this.createSwitcher();
    this.detectLanguage();
    this.applyLanguage(this.currentLang, false);
    this.attachEventListeners();
  }
  
  createSwitcher() {
    if (document.querySelector('.language-switcher')) return;
    
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <button class="language-switcher-trigger" aria-label="Change language">
        <span class="language-switcher-flag">${this.languages[this.currentLang].flag}</span>
        <span class="language-switcher-code">${this.currentLang.toUpperCase()}</span>
        <svg class="language-switcher-arrow" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="language-switcher-dropdown">
        ${Object.values(this.languages).map(lang => `
          <div class="language-option ${lang.code === this.currentLang ? 'active' : ''}" data-lang="${lang.code}">
            <span class="language-option-flag">${lang.flag}</span>
            <div class="language-option-info">
              <div class="language-option-name">${lang.name}</div>
              <div class="language-option-native">${lang.nativeName}</div>
            </div>
            <svg class="language-option-check" viewBox="0 0 18 18" fill="none">
              <path d="M3 9L7 13L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        `).join('')}
      </div>
    `;
    
    // Insert into navigation
    const nav = document.querySelector('.nav-links');
    if (nav) {
      nav.appendChild(switcher);
    } else {
      document.body.appendChild(switcher);
    }
    
    this.switcher = switcher;
  }
  
  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    if (this.languages[langCode] && langCode !== this.currentLang) {
      this.detectedLang = langCode;
      this.showLanguageSuggestion(langCode);
    }
  }
  
  showLanguageSuggestion(langCode) {
    const lang = this.languages[langCode];
    
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    notification.innerHTML = `
      <div class="language-notification-content">
        <div class="language-notification-icon">🌐</div>
        <div class="language-notification-text">
          Switch to ${lang.name} (${lang.nativeName})?
        </div>
      </div>
      <div class="language-notification-actions">
        <button class="language-notification-btn primary" data-action="switch">Switch</button>
        <button class="language-notification-btn secondary" data-action="dismiss">No thanks</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show after a delay
    setTimeout(() => {
      notification.classList.add('active');
    }, 2000);
    
    // Handle actions
    notification.querySelector('[data-action="switch"]').addEventListener('click', () => {
      this.switchLanguage(langCode);
      notification.remove();
    });
    
    notification.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
      notification.classList.remove('active');
      setTimeout(() => notification.remove(), 400);
    });
    
    // Auto dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 400);
      }
    }, 10000);
  }
  
  attachEventListeners() {
    const trigger = this.switcher.querySelector('.language-switcher-trigger');
    const dropdown = this.switcher.querySelector('.language-switcher-dropdown');
    const options = this.switcher.querySelectorAll('.language-option');
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switcher.classList.toggle('active');
    });
    
    // Close on outside click
    document.addEventListener('click', () => {
      this.switcher.classList.remove('active');
    });
    
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Language selection
    options.forEach(option => {
      option.addEventListener('click', () => {
        const langCode = option.dataset.lang;
        if (langCode !== this.currentLang) {
          this.switchLanguage(langCode);
        }
        this.switcher.classList.remove('active');
      });
    });
  }
  
  switchLanguage(langCode) {
    const overlay = document.createElement('div');
    overlay.className = 'language-translation-overlay';
    overlay.innerHTML = `
      <div class="translation-spinner"></div>
      <div class="translation-text">Translating...</div>
      <div class="translation-subtext">Please wait while we update the content</div>
    `;
    
    document.body.appendChild(overlay);
    
    // Show overlay
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
    
    // Apply translation after short delay for visual effect
    setTimeout(() => {
      this.applyLanguage(langCode, true);
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 400);
    }, 800);
  }
  
  applyLanguage(langCode, animate = true) {
    const lang = this.languages[langCode];
    if (!lang) return;
    
    this.currentLang = langCode;
    localStorage.setItem('buildbridge-language', langCode);
    
    // Update switcher display
    const flag = this.switcher.querySelector('.language-switcher-flag');
    const code = this.switcher.querySelector('.language-switcher-code');
    
    if (flag) flag.textContent = lang.flag;
    if (code) code.textContent = langCode.toUpperCase();
    
    // Update active state in dropdown
    this.switcher.querySelectorAll('.language-option').forEach(option => {
      option.classList.toggle('active', option.dataset.lang === langCode);
    });
    
    // Set document direction for RTL support
    document.documentElement.setAttribute('dir', lang.dir);
    document.documentElement.setAttribute('lang', langCode);
    
    // Apply translations
    this.translatePage(lang.translations, animate);
  }
  
  translatePage(translations, animate) {
    // Find all elements with translatable text
    const elements = document.querySelectorAll('h1, h2, h3, .btn, .nav-links a, .service-card h3, .service-card p');
    
    elements.forEach(el => {
      const originalText = el.textContent.trim();
      
      // Check for exact match
      if (translations[originalText]) {
        this.setTextWithAnimation(el, translations[originalText], animate);
        return;
      }
      
      // Check for partial matches in text content
      Object.entries(translations).forEach(([key, value]) => {
        if (originalText.includes(key)) {
          const newText = originalText.replace(key, value);
          this.setTextWithAnimation(el, newText, animate);
        }
      });
    });
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languagechange', { 
      detail: { language: this.currentLang } 
    }));
  }
  
  setTextWithAnimation(element, text, animate) {
    if (!animate) {
      element.textContent = text;
      return;
    }
    
    // Fade out, change text, fade in
    element.style.transition = 'opacity 0.2s ease';
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.textContent = text;
      element.style.opacity = '1';
    }, 200);
  }
  
  // Public API
  getCurrentLanguage() {
    return this.currentLang;
  }
  
  getSupportedLanguages() {
    return Object.keys(this.languages);
  }
  
  translate(key) {
    const lang = this.languages[this.currentLang];
    return lang.translations[key] || key;
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new MultiLanguageSwitcher();
  });
} else {
  window.languageSwitcher = new MultiLanguageSwitcher();
}
