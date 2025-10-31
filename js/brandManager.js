// Brand & Layout Manager
// Centralized management for brand colors, menu, header, and footer

(function() {
  const BrandManager = {
    currentBrand: null,
    activeMenu: null,
    activeFooter: null,
    
    init() {
      this.loadBrandSettings();
      this.createUI();
      this.attachEventListeners();
    },
    
    createUI() {
      // Check if UI already exists
      if (document.getElementById('brandManagerPanel')) return;
      
      const panel = document.createElement('div');
      panel.id = 'brandManagerPanel';
      panel.innerHTML = `
        <div class="brand-manager-overlay" id="brandManagerOverlay" style="display: none;">
          <div class="brand-manager-modal">
            <!-- Header -->
            <div class="brand-manager-header">
              <h2>🎨 Brand & Layout Manager</h2>
              <button class="close-btn" id="closeBrandManager">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Tabs -->
            <div class="brand-manager-tabs">
              <button class="tab-btn active" data-tab="brand">
                <i class="fas fa-palette"></i> Brand
              </button>
              <button class="tab-btn" data-tab="menu">
                <i class="fas fa-bars"></i> Menu/Header
              </button>
              <button class="tab-btn" data-tab="footer">
                <i class="fas fa-shoe-prints"></i> Footer
              </button>
            </div>
            
            <!-- Tab Content -->
            <div class="brand-manager-content">
              <!-- Brand Tab -->
              <div class="tab-content active" data-tab-content="brand">
                <div class="brand-section">
                  <h3>Brand Instellingen</h3>
                  
                  <div class="form-group">
                    <label>Brand Naam</label>
                    <input type="text" id="brandName" class="form-control" placeholder="Bijv: TravelBro">
                  </div>
                  
                  <div class="form-group">
                    <label>Primaire Kleur</label>
                    <div class="color-input-group">
                      <input type="color" id="brandColorPrimary" value="#4CAF50">
                      <input type="text" id="brandColorPrimaryHex" value="#4CAF50" class="form-control">
                      <div class="color-preview" style="background: #4CAF50;"></div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Secundaire Kleur</label>
                    <div class="color-input-group">
                      <input type="color" id="brandColorSecondary" value="#2196F3">
                      <input type="text" id="brandColorSecondaryHex" value="#2196F3" class="form-control">
                      <div class="color-preview" style="background: #2196F3;"></div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Accent Kleur</label>
                    <div class="color-input-group">
                      <input type="color" id="brandColorAccent" value="#FF9800">
                      <input type="text" id="brandColorAccentHex" value="#FF9800" class="form-control">
                      <div class="color-preview" style="background: #FF9800;"></div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Logo URL</label>
                    <input type="text" id="brandLogo" class="form-control" placeholder="https://...">
                    <div id="logoPreview" class="logo-preview"></div>
                  </div>
                  
                  <button class="btn btn-primary" id="saveBrandSettings">
                    <i class="fas fa-save"></i> Opslaan & Toepassen
                  </button>
                </div>
              </div>
              
              <!-- Menu Tab -->
              <div class="tab-content" data-tab-content="menu">
                <div class="menu-section">
                  <h3>Menu & Header Layouts</h3>
                  <div id="menuList" class="layout-list"></div>
                  <button class="btn btn-secondary" id="createNewMenu">
                    <i class="fas fa-plus"></i> Nieuw Menu Maken
                  </button>
                </div>
              </div>
              
              <!-- Footer Tab -->
              <div class="tab-content" data-tab-content="footer">
                <div class="footer-section">
                  <h3>Footer Layouts</h3>
                  <div id="footerList" class="layout-list"></div>
                  <button class="btn btn-secondary" id="createNewFooter">
                    <i class="fas fa-plus"></i> Nieuwe Footer Maken
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(panel);
      this.addStyles();
      this.renderMenuList();
      this.renderFooterList();
    },
    
    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .brand-manager-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .brand-manager-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .brand-manager-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .brand-manager-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .brand-manager-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 24px;
        }
        
        .tab-btn {
          padding: 16px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: #111827;
        }
        
        .tab-btn.active {
          color: #4CAF50;
          border-bottom-color: #4CAF50;
        }
        
        .brand-manager-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .tab-content {
          display: none;
        }
        
        .tab-content.active {
          display: block;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }
        
        .color-input-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .color-input-group input[type="color"] {
          width: 60px;
          height: 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .color-input-group input[type="text"] {
          flex: 1;
        }
        
        .color-preview {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
        }
        
        .logo-preview {
          margin-top: 12px;
          padding: 20px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          text-align: center;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-preview img {
          max-width: 200px;
          max-height: 80px;
        }
        
        .layout-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .layout-item {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: all 0.2s;
        }
        
        .layout-item.active {
          border-color: #4CAF50;
          background: #f0fdf4;
        }
        
        .layout-item:hover {
          border-color: #9ca3af;
        }
        
        .layout-status {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .layout-item.active .layout-status {
          border-color: #4CAF50;
          background: #4CAF50;
          color: white;
        }
        
        .layout-info {
          flex: 1;
        }
        
        .layout-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .layout-description {
          font-size: 13px;
          color: #6b7280;
        }
        
        .layout-actions {
          display: flex;
          gap: 8px;
        }
        
        .layout-actions button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .layout-actions button:hover {
          background: #f3f4f6;
        }
        
        .layout-actions button.primary {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }
        
        .layout-actions button.primary:hover {
          background: #45a049;
        }
      `;
      document.head.appendChild(style);
    },
    
    attachEventListeners() {
      // Close button
      document.getElementById('closeBrandManager')?.addEventListener('click', () => this.close());
      
      // Click outside to close
      document.getElementById('brandManagerOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'brandManagerOverlay') this.close();
      });
      
      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
      });
      
      // Color inputs sync
      this.syncColorInputs('brandColorPrimary', 'brandColorPrimaryHex');
      this.syncColorInputs('brandColorSecondary', 'brandColorSecondaryHex');
      this.syncColorInputs('brandColorAccent', 'brandColorAccentHex');
      
      // Logo preview
      document.getElementById('brandLogo')?.addEventListener('input', (e) => {
        this.updateLogoPreview(e.target.value);
      });
      
      // Save brand settings
      document.getElementById('saveBrandSettings')?.addEventListener('click', () => {
        this.saveBrandSettings();
      });
      
      // Create new menu/footer
      document.getElementById('createNewMenu')?.addEventListener('click', () => {
        this.createNewMenu();
      });
      
      document.getElementById('createNewFooter')?.addEventListener('click', () => {
        this.createNewFooter();
      });
    },
    
    syncColorInputs(colorId, hexId) {
      const colorInput = document.getElementById(colorId);
      const hexInput = document.getElementById(hexId);
      
      if (!colorInput || !hexInput) return;
      
      colorInput.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        hexInput.nextElementSibling.style.background = e.target.value;
      });
      
      hexInput.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
          colorInput.value = e.target.value;
          hexInput.nextElementSibling.style.background = e.target.value;
        }
      });
    },
    
    updateLogoPreview(url) {
      const preview = document.getElementById('logoPreview');
      if (!preview) return;
      
      if (url) {
        preview.innerHTML = `<img src="${url}" alt="Logo Preview">`;
      } else {
        preview.innerHTML = '<p style="color: #9ca3af;">Geen logo ingesteld</p>';
      }
    },
    
    switchTab(tabName) {
      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
      });
      
      // Update tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tabContent === tabName);
      });
    },
    
    open() {
      const overlay = document.getElementById('brandManagerOverlay');
      if (overlay) overlay.style.display = 'flex';
    },
    
    close() {
      const overlay = document.getElementById('brandManagerOverlay');
      if (overlay) overlay.style.display = 'none';
    },
    
    loadBrandSettings() {
      const saved = localStorage.getItem('brandSettings');
      if (saved) {
        this.currentBrand = JSON.parse(saved);
        this.applyBrandSettings();
        this.populateForm();
      }
    },
    
    populateForm() {
      if (!this.currentBrand) return;
      
      // Populate form fields with saved values
      const nameInput = document.getElementById('brandName');
      const primaryColor = document.getElementById('brandColorPrimary');
      const primaryHex = document.getElementById('brandColorPrimaryHex');
      const secondaryColor = document.getElementById('brandColorSecondary');
      const secondaryHex = document.getElementById('brandColorSecondaryHex');
      const accentColor = document.getElementById('brandColorAccent');
      const accentHex = document.getElementById('brandColorAccentHex');
      const logoInput = document.getElementById('brandLogo');
      
      if (nameInput) nameInput.value = this.currentBrand.name || '';
      
      if (primaryColor && this.currentBrand.colors.primary) {
        primaryColor.value = this.currentBrand.colors.primary;
        if (primaryHex) primaryHex.value = this.currentBrand.colors.primary;
        const preview = primaryHex?.nextElementSibling;
        if (preview) preview.style.background = this.currentBrand.colors.primary;
      }
      
      if (secondaryColor && this.currentBrand.colors.secondary) {
        secondaryColor.value = this.currentBrand.colors.secondary;
        if (secondaryHex) secondaryHex.value = this.currentBrand.colors.secondary;
        const preview = secondaryHex?.nextElementSibling;
        if (preview) preview.style.background = this.currentBrand.colors.secondary;
      }
      
      if (accentColor && this.currentBrand.colors.accent) {
        accentColor.value = this.currentBrand.colors.accent;
        if (accentHex) accentHex.value = this.currentBrand.colors.accent;
        const preview = accentHex?.nextElementSibling;
        if (preview) preview.style.background = this.currentBrand.colors.accent;
      }
      
      if (logoInput && this.currentBrand.logo) {
        logoInput.value = this.currentBrand.logo;
        this.updateLogoPreview(this.currentBrand.logo);
      }
    },
    
    saveBrandSettings() {
      const settings = {
        name: document.getElementById('brandName')?.value || '',
        colors: {
          primary: document.getElementById('brandColorPrimary')?.value || '#4CAF50',
          secondary: document.getElementById('brandColorSecondary')?.value || '#2196F3',
          accent: document.getElementById('brandColorAccent')?.value || '#FF9800'
        },
        logo: document.getElementById('brandLogo')?.value || ''
      };
      
      localStorage.setItem('brandSettings', JSON.stringify(settings));
      this.currentBrand = settings;
      this.applyBrandSettings();
      
      alert('✅ Brand instellingen opgeslagen en toegepast!');
    },
    
    applyBrandSettings() {
      if (!this.currentBrand) return;
      
      // Apply CSS variables
      document.documentElement.style.setProperty('--brand-primary', this.currentBrand.colors.primary);
      document.documentElement.style.setProperty('--brand-secondary', this.currentBrand.colors.secondary);
      document.documentElement.style.setProperty('--brand-accent', this.currentBrand.colors.accent);
      
      // Update all components with brand colors
      this.updateComponentColors();
      
      // Show notification
      if (window.websiteBuilder?.showNotification) {
        window.websiteBuilder.showNotification('Brand kleuren toegepast op alle componenten!', 'success');
      }
    },
    
    updateComponentColors() {
      console.log('[BrandManager] Updating component colors...');
      
      const canvas = document.getElementById('canvas');
      if (!canvas) return;
      
      const { primary, secondary, accent } = this.currentBrand.colors;
      
      // Update all buttons
      canvas.querySelectorAll('.wb-button, .btn-primary').forEach(btn => {
        btn.style.background = primary;
        btn.style.borderColor = primary;
      });
      
      // Update all secondary buttons
      canvas.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.style.borderColor = primary;
        btn.style.color = primary;
      });
      
      // Update hero overlays
      canvas.querySelectorAll('.wb-hero-banner, .wb-travel-hero').forEach(hero => {
        const overlay = hero.querySelector('.hero-overlay');
        if (overlay) {
          // Keep opacity, just update color
          const currentBg = overlay.style.background || '';
          if (currentBg.includes('linear-gradient')) {
            overlay.style.background = `linear-gradient(135deg, ${primary}dd 0%, ${secondary}dd 100%)`;
          }
        }
      });
      
      // Update CTA sections
      canvas.querySelectorAll('.wb-hero-cta').forEach(cta => {
        cta.style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
      });
      
      // Update accent elements
      canvas.querySelectorAll('.accent-color').forEach(el => {
        el.style.color = accent;
      });
      
      // Update links
      canvas.querySelectorAll('a:not(.btn)').forEach(link => {
        link.style.color = primary;
      });
      
      // Update travel timeline elements
      canvas.querySelectorAll('.wb-travel-day-number').forEach(dayNum => {
        dayNum.style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
      });
      
      // Update feature media icons
      canvas.querySelectorAll('.feature-icon').forEach(icon => {
        icon.style.background = primary;
      });
      
      // Update any element with data-brand-color attribute
      canvas.querySelectorAll('[data-brand-color="primary"]').forEach(el => {
        el.style.background = primary;
      });
      
      canvas.querySelectorAll('[data-brand-color="secondary"]').forEach(el => {
        el.style.background = secondary;
      });
      
      canvas.querySelectorAll('[data-brand-color="accent"]').forEach(el => {
        el.style.background = accent;
      });
      
      console.log('[BrandManager] ✅ Component colors updated!');
    },
    
    renderMenuList() {
      const container = document.getElementById('menuList');
      if (!container) return;
      
      const menus = this.getMenuLayouts();
      container.innerHTML = menus.map(menu => `
        <div class="layout-item ${menu.active ? 'active' : ''}" data-menu-id="${menu.id}">
          <div class="layout-status">
            ${menu.active ? '<i class="fas fa-check"></i>' : ''}
          </div>
          <div class="layout-info">
            <div class="layout-name">${menu.name}</div>
            <div class="layout-description">${menu.description}</div>
          </div>
          <div class="layout-actions">
            <button onclick="BrandManager.previewMenu('${menu.id}')">
              <i class="fas fa-eye"></i> Preview
            </button>
            ${!menu.active ? `
              <button class="primary" onclick="BrandManager.activateMenu('${menu.id}')">
                Activeren
              </button>
            ` : '<span style="color: #4CAF50; font-weight: 600;">✓ ACTIEF</span>'}
          </div>
        </div>
      `).join('');
    },
    
    renderFooterList() {
      const container = document.getElementById('footerList');
      if (!container) return;
      
      const footers = this.getFooterLayouts();
      container.innerHTML = footers.map(footer => `
        <div class="layout-item ${footer.active ? 'active' : ''}" data-footer-id="${footer.id}">
          <div class="layout-status">
            ${footer.active ? '<i class="fas fa-check"></i>' : ''}
          </div>
          <div class="layout-info">
            <div class="layout-name">${footer.name}</div>
            <div class="layout-description">${footer.description}</div>
          </div>
          <div class="layout-actions">
            <button onclick="BrandManager.previewFooter('${footer.id}')">
              <i class="fas fa-eye"></i> Preview
            </button>
            ${!footer.active ? `
              <button class="primary" onclick="BrandManager.activateFooter('${footer.id}')">
                Activeren
              </button>
            ` : '<span style="color: #4CAF50; font-weight: 600;">✓ ACTIEF</span>'}
          </div>
        </div>
      `).join('');
    },
    
    getMenuLayouts() {
      // Get from localStorage or return defaults
      const saved = localStorage.getItem('menuLayouts');
      if (saved) return JSON.parse(saved);
      
      return [
        {
          id: 'modern',
          name: 'Modern Header',
          description: 'Logo links, menu rechts, sticky navigation',
          active: true
        },
        {
          id: 'centered',
          name: 'Centered Header',
          description: 'Logo gecentreerd, menu eronder',
          active: false
        },
        {
          id: 'minimal',
          name: 'Minimal Header',
          description: 'Alleen logo + hamburger menu',
          active: false
        }
      ];
    },
    
    getFooterLayouts() {
      const saved = localStorage.getItem('footerLayouts');
      if (saved) return JSON.parse(saved);
      
      return [
        {
          id: '3-column',
          name: '3-Column Footer',
          description: 'Over ons | Links | Contact',
          active: true
        },
        {
          id: 'simple',
          name: 'Simple Footer',
          description: 'Copyright + social icons',
          active: false
        }
      ];
    },
    
    activateMenu(menuId) {
      const menus = this.getMenuLayouts();
      menus.forEach(m => m.active = m.id === menuId);
      localStorage.setItem('menuLayouts', JSON.stringify(menus));
      this.renderMenuList();
      alert(`✅ Menu "${menuId}" geactiveerd!`);
    },
    
    activateFooter(footerId) {
      const footers = this.getFooterLayouts();
      footers.forEach(f => f.active = f.id === footerId);
      localStorage.setItem('footerLayouts', JSON.stringify(footers));
      this.renderFooterList();
      alert(`✅ Footer "${footerId}" geactiveerd!`);
    },
    
    previewMenu(menuId) {
      alert(`Preview van menu: ${menuId}`);
      // TODO: Show preview modal
    },
    
    previewFooter(footerId) {
      alert(`Preview van footer: ${footerId}`);
      // TODO: Show preview modal
    },
    
    createNewMenu() {
      alert('Nieuwe menu maken - TODO');
      // TODO: Open menu builder
    },
    
    createNewFooter() {
      alert('Nieuwe footer maken - TODO');
      // TODO: Open footer builder
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BrandManager.init());
  } else {
    BrandManager.init();
  }
  
  // Expose globally
  window.BrandManager = BrandManager;
})();
