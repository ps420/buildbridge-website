/**
 * Social Share Component
 * Share projects on social media platforms
 */

class SocialShare {
  constructor(options = {}) {
    this.url = encodeURIComponent(options.url || window.location.href);
    this.title = encodeURIComponent(options.title || document.title);
    this.description = encodeURIComponent(options.description || '');
    this.image = encodeURIComponent(options.image || '');
    
    this.platforms = {
      whatsapp: {
        url: `https://wa.me/?text=${this.title}%20${this.url}`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>'
      },
      facebook: {
        url: `https://www.facebook.com/sharer/sharer.php?u=${this.url}`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>'
      },
      twitter: {
        url: `https://twitter.com/intent/tweet?text=${this.title}&url=${this.url}`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>'
      },
      linkedin: {
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${this.url}`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>'
      },
      email: {
        url: `mailto:?subject=${this.title}&body=${this.description}%0A%0A${this.url}`,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/></svg>'
      },
      copy: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zM4.5 10.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"/></svg>'
      }
    };
  }
  
  generateButtons(platforms = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'email', 'copy']) {
    let html = '<div class="social-share">';
    
    platforms.forEach(platform => {
      if (this.platforms[platform]) {
        const { url, icon } = this.platforms[platform];
        const isCopy = platform === 'copy';
        
        html += `
          <a href="${isCopy ? '#' : url}"
             class="social-share-btn"
             data-platform="${platform}"
             data-tooltip="${this.getTooltip(platform)}"
             ${isCopy ? 'onclick="return false;"' : 'target="_blank" rel="noopener noreferrer"'}>
            ${icon}
          </a>
        `;
      }
    });
    
    html += '</div>';
    return html;
  }
  
  getTooltip(platform) {
    const tooltips = {
      whatsapp: 'Share on WhatsApp',
      facebook: 'Share on Facebook',
      twitter: 'Share on Twitter',
      linkedin: 'Share on LinkedIn',
      email: 'Share via Email',
      copy: 'Copy Link'
    };
    return tooltips[platform] || 'Share';
  }
  
  static bindCopyButtons() {
    document.querySelectorAll('.social-share-btn[data-platform="copy"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
          await navigator.clipboard.writeText(window.location.href);
          btn.classList.add('copied');
          
          if (window.Toast) {
            window.Toast.success('Link copied to clipboard!', { duration: 2000 });
          }
          
          setTimeout(() => btn.classList.remove('copied'), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  }
  
  static openShareModal(options = {}) {
    const existingModal = document.querySelector('.share-modal');
    if (existingModal) existingModal.remove();
    
    const share = new SocialShare(options);
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="share-modal-backdrop"></div>
      <div class="share-modal-content">
        <button class="share-modal-close">&times;</button>
        <h3>Share This Project</h3>
        <p>${options.description || 'Share this project with your network'}</p>
        ${share.generateButtons()}
        <div class="share-url-section">
          <div class="share-url-input">
            <input type="text" value="${decodeURIComponent(share.url)}" readonly>
            <button class="copy-url-btn">Copy</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    requestAnimationFrame(() => modal.classList.add('active'));
    
    // Close handlers
    const closeModal = () => modal.remove();
    modal.querySelector('.share-modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.share-modal-close').addEventListener('click', closeModal);
    
    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Copy URL button
    modal.querySelector('.copy-url-btn').addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(decodeURIComponent(share.url));
        this.textContent = 'Copied!';
        this.classList.add('copied');
        setTimeout(() => {
          this.textContent = 'Copy';
          this.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
    
    SocialShare.bindCopyButtons();
  }
}

// Initialize share buttons on project cards
document.addEventListener('DOMContentLoaded', () => {
  // Add share buttons to project cards
  document.querySelectorAll('.project-card').forEach((card, index) => {
    const title = card.querySelector('h3')?.textContent || 'BuildBridge Project';
    const shareHtml = new SocialShare({
      title: title,
      url: window.location.href,
      description: 'Check out this amazing construction project'
    }).generateButtons(['whatsapp', 'twitter', 'copy']);
    
    // Create share container
    const shareContainer = document.createElement('div');
    shareContainer.innerHTML = shareHtml;
    card.appendChild(shareContainer.firstElementChild);
  });
  
  SocialShare.bindCopyButtons();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialShare;
}
