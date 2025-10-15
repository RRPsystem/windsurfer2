// Main JavaScript file voor Website Builder

// Heuristic: find nested builder JSON (looks for pages array + currentPageId)
function __WB_findBuilderJson(any){
    try {
        const seen = new Set();
        const stack = [any];
        let depth = 0;
        while (stack.length && depth < 1e5){
            const cur = stack.pop(); depth++;
            if (!cur || typeof cur !== 'object') continue;
            if (seen.has(cur)) continue; seen.add(cur);
            // Candidate signature
            if (Array.isArray(cur.pages) && cur.pages.length >= 0 && ('currentPageId' in cur || 'layout' in cur)) {
                return cur;
            }
            // Push children
            for (const k in cur){
                try { stack.push(cur[k]); } catch (e) {}
            }
        }
    } catch (e) {}
    return null;
}

class WebsiteBuilder {
    constructor() {
        this.currentDevice = 'desktop';
        this.isInitialized = false;
        // Multi-page state
        this.pages = [];
        this.currentPageId = null;
        // Layout state (header/footer presets)
        this.projectLayout = null;
        // Auto-publish throttle state
        this._lastAutoPublishAt = 0;
        this._autoPublishTimer = null;
        this._edgeDisabled = false; // disable Edge calls if ctx invalid/used
        // Typing + autosave throttle state
        this._typingUntil = 0;
        this._saveDebTimer = null;
        // Edge (Supabase) context
        this.init();
    }

    init() {
        try {
            if (this.isInitialized) return;
            const run = () => {
                try { this.setupFileSaveLoad && this.setupFileSaveLoad(); } catch (e) {}
                try { this.interceptCanvasLinks && this.interceptCanvasLinks(); } catch (e) {}
                this.isInitialized = true;
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', run, { once: true });
            } else {
                run();
            }
        } catch (e) { this.isInitialized = true; }
    }

    // Prevent navigation inside the builder canvas (anchors inside content)
    interceptCanvasLinks() {
        try {
            const canvas = document.getElementById('canvas');
            if (!canvas || canvas.__wb_linkIntercept) return;
            canvas.__wb_linkIntercept = true;
            canvas.addEventListener('click', (e) => {
                try {
                    const a = e.target && e.target.closest ? e.target.closest('a') : null;
                    if (!a) return;
                    // Skip interception for components that implement their own handlers
                    if (a.closest('.wb-travel-types') || a.closest('.wb-media-row') || a.closest('.wb-gallery')) {
                        return; // let component-level listeners handle it (they call preventDefault themselves)
                    }
                    // Allow if explicitly data-allow-nav
                    if (a.hasAttribute('data-allow-nav')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    // Optional: small hint once
                    if (!canvas.__wb_linkHintShown) {
                        canvas.__wb_linkHintShown = true;
                        this.showNotification('Ã°Å¸””” Navigeren is uitgeschakeld in de editor (gebruik Preview).', 'info');
                        
}
} catch (e) {}

if (!isTemplate) {
  if (window.BuilderPublishAPI && typeof window.BuilderPublishAPI.saveDraft === 'function') {
    await window.BuilderPublishAPI.saveDraft({
      brand_id,
      title: safeTitle,
      slug: safeSlug,
      content_json: contentJson
    });
  }
}

try {
  if (saveBtn) {
    saveBtn.disabled = !!prevDisabled;
    if (prevHTML != null) saveBtn.innerHTML = prevHTML;
  }
} catch (e) {}

};
}

setupVisibilityGuards() {
    try {
        if (this._visGuardsInstalled) return;
        this._visGuardsInstalled = true;

    const resume = () => {
      try {
        clearTimeout(this._resumeTimer);
      } catch (e) {}
      this._resumeTimer = setTimeout(() => {
        try {
          this._suspendHeaderMO = false;
        } catch (e) {}
        try {
          this.applyBoltHeaderVisibilityLite && this.applyBoltHeaderVisibilityLite();
        } catch (e) {}
        try {
          if (this._headerMO && this._headerTarget) {
            this._headerMO.observe(this._headerTarget, {
              childList: true,
              subtree: true,
              attributes: false
            });
          }
        } catch (e) {}
        try {
          this.setupBoltDeeplinkSave && this.setupBoltDeeplinkSave();
        } catch (e) {}
        try {
          const s = document.getElementById('pageSaveStatus');
          if (s) s.textContent = 'Opgeslagen';
        } catch (e) {}
      }, 300);
    };

    const suspend = () => {
      try {
        this._suspendHeaderMO = true;
      } catch (e) {}
      try {
        if (this._headerMO) this._headerMO.disconnect();
      } catch (e) {}
      try {
        clearTimeout(this._saveTimer);
      } catch (e) {}
      try {
        clearTimeout(this._headerDebounceTimer);
      } catch (e) {}
    };

    document.addEventListener('visibilitychange', () => {
      try {
        if (document.hidden) {
          suspend();
        } else {
          resume();
        }
      } catch (e) {}
    });

    window.addEventListener('beforeunload', () => {
      try {
        if (this._headerMO) this._headerMO.disconnect();
      } catch (e) {}
    });
  } catch (e) {}
}

    setupFileSaveLoad() {
        const saveBtn = document.getElementById('saveProjectBtn');
        const openBtn = document.getElementById('openProjectBtn');
        const fileInput = document.getElementById('projectFileInput');
        const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl);

        // In Bolt context, Save is handled via Edge/publish helpers; keep local download only for standalone use
        if (saveBtn && !isBolt) {
            saveBtn.addEventListener('click', () => {
                try {
                    const data = this.getProjectData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    const dt = new Date();
                    const y = dt.getFullYear();
                    const m = String(dt.getMonth()+1).padStart(2,'0');
                    const d = String(dt.getDate()).padStart(2,'0');
                    a.download = `website_project_${y}${m}${d}.wbproj`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    this.showNotification('Ã°Å¸’Â¾ Project gedownload (.wbproj)', 'success');
                } catch (err) {
                    console.error('Save error', err);
                    this.showErrorMessage('Opslaan mislukt');
                }
            });
        }

        if (openBtn && fileInput) {
            openBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    this.loadProjectData(data);
                    this.saveProject(true);
                    this.showNotification('Ã°Å¸“”š Project geladen uit bestand', 'success');
                } catch (err) {
                    console.error('Load error', err);
                    this.showErrorMessage('Bestand kon niet worden geladen');
                } finally {
                    e.target.value = '';
                }
            });
        }
    }

    // ---------- Notifications (minimal helpers) ----------
    showNotification(message, type = 'info') {
        try {
            if (window.ExportManager && typeof window.ExportManager.showNotification === 'function') {
                window.ExportManager.showNotification(message, type);
                return;
            }
        } catch (e) {}
        try { console[type === 'error' ? 'error' : (type === 'success' ? 'log' : 'info')](message); } catch (e) {}
    }
    showErrorMessage(message) {
        try { this.showNotification(`Ã¢ÂÅ’ ${message}`, 'error'); } catch (e) { try { console.error(message); } catch (e) {} }
    }

    // Public API methods
    getProjectData() {
        // Sync current canvas to current page before export (safe)
        if (typeof this.captureCurrentCanvasToPage === 'function') {
            this.captureCurrentCanvasToPage();
        } else {
            const canvas = document.getElementById('canvas');
            if (this.pages && this.pages.length) {
                const cur = this.pages.find(p => p.id === this.currentPageId) || this.pages[0];
                if (cur) cur.html = canvas?.innerHTML || cur.html || '';
            }
        }
        return {
            pages: this.pages,
            currentPageId: this.currentPageId,
            device: this.currentDevice,
            layout: this.projectLayout || this.defaultLayout(),
            timestamp: new Date().toISOString()
        };
    }

    // ---------- Layout Picker ----------
    defaultLayout() {
        return { headerPreset: 'minimal', footerPreset: 'compact', brandName: 'Brand', accent: '#16a34a', logoUrl: '' };
    }

    setupLayoutButton() {
        const btn = document.getElementById('layoutBtn');
        if (!btn) return;
        btn.addEventListener('click', () => this.openLayoutModal());
    }

    openLayoutModal() {
        // Ensure current is set
        if (!this.projectLayout) this.projectLayout = this.defaultLayout();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.maxWidth = '760px';
        content.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-layer-group"></i> Layout kiezen</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <div style="font-weight:600; margin-bottom:6px; color:#374151;">Header</div>
                    <div id="lpHeader" style="display:grid; gap:8px;">
                        ${this.renderPresetOption('header', 'minimal', 'Minimal')}
                        ${this.renderPresetOption('header', 'centered', 'Centered')}
                        ${this.renderPresetOption('header', 'transparent', 'Transparent')}
                    </div>
                    <div style="font-weight:600; margin:12px 0 6px; color:#374151;">Footer</div>
                    <div id="lpFooter" style="display:grid; gap:8px;">
                        ${this.renderPresetOption('footer', 'compact', 'Compact')}
                        ${this.renderPresetOption('footer', 'three_cols', '3 kolommen')}
                        ${this.renderPresetOption('footer', 'dark', 'Donker')}
                    </div>
                </div>
                <div>
                    <div style="font-weight:600; margin-bottom:6px; color:#374151;">Instellingen</div>
                    <div style="display:grid; grid-template-columns: 110px 1fr; gap:8px; align-items:center;">
                        <label>Brand</label><input id="lpBrand" class="form-control" type="text" placeholder="Brand" />
                        <label>Accent</label><input id="lpAccent" class="form-control" type="color" />
                        <label>Logo URL</label><input id="lpLogo" class="form-control" type="text" placeholder="https://..." />
                    </div>
                    <button id="lpApply" class="btn btn-primary" style="margin-top:10px;">Toepassen</button>
                    <button id="lpPreview" class="btn btn-secondary" style="margin-top:10px; margin-left:8px;">Preview</button>
                </div>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const close = () => { document.body.removeChild(modal); };
        content.querySelector('.modal-close').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };

        // Prefill
        const lp = this.projectLayout || this.defaultLayout();
        const brandInput = content.querySelector('#lpBrand');
        const accentInput = content.querySelector('#lpAccent');
        const logoInput = content.querySelector('#lpLogo');
        if (brandInput) brandInput.value = lp.brandName || 'Brand';
        if (accentInput) accentInput.value = lp.accent || '#16a34a';
        if (logoInput) logoInput.value = lp.logoUrl || '';
        // Mark selected presets
        this.markPresetSelected(content, 'header', lp.headerPreset || 'minimal');
        this.markPresetSelected(content, 'footer', lp.footerPreset || 'compact');

        const apply = () => {
            const headerPreset = content.querySelector('[data-kind="header"].selected')?.getAttribute('data-preset') || 'minimal';
            const footerPreset = content.querySelector('[data-kind="footer"].selected')?.getAttribute('data-preset') || 'compact';
            this.projectLayout = {
                headerPreset,
                footerPreset,
                brandName: brandInput?.value || 'Brand',
                accent: accentInput?.value || '#16a34a',
                logoUrl: logoInput?.value || ''
            };
            this.persistPagesToLocalStorage(true);
            this.showNotification('Ã°Å¸Å½Â¨ Layout bijgewerkt', 'success');
        };

        content.querySelector('#lpApply').onclick = () => { apply(); close(); };
        content.querySelector('#lpPreview').onclick = () => { apply(); try { window.ExportManager?.showPreview(); } catch (e) {} };

        // click handlers for preset boxes
        content.querySelectorAll('[data-role="preset"]').forEach(el => {
            el.addEventListener('click', () => {
                const kind = el.getAttribute('data-kind');
                content.querySelectorAll(`[data-kind="${kind}"]`).forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
            });
        });
    }

    renderPresetOption(kind, key, label) {
        const selected = (this.projectLayout?.[kind === 'header' ? 'headerPreset' : 'footerPreset'] || (kind==='header'?'minimal':'compact')) === key;
        return `
            <div data-role="preset" data-kind="${kind}" data-preset="${key}" style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;cursor:pointer;${selected?'outline:2px solid #16a34a;':''}">
                <div style="font-weight:600;color:#374151;">${label}</div>
                <div style="color:#6b7280;font-size:12px;">${key}</div>
            </div>
        `;
    }

    markPresetSelected(root, kind, key) {
        root.querySelectorAll(`[data-kind="${kind}"]`).forEach(x => x.classList.remove('selected'));
        const el = root.querySelector(`[data-kind="${kind}"][data-preset="${key}"]`);
        if (el) el.classList.add('selected');
    }

    // ---------- Header/Footer/Menu Builder buttons ----------
    setupHeaderFooterBuilderLinks() {
        const headerBtn = document.getElementById('headerBuilderBtn');
        const footerBtn = document.getElementById('footerBuilderBtn');
        const menuBtn = document.getElementById('menuBuilderBtn');
        const brandId = window.CURRENT_BRAND_ID || '';
        const token = window.CURRENT_TOKEN || '';
        const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || '';

        const openDeeplink = (path) => {
            const qs = new URLSearchParams();
            if (brandId) qs.set('brand_id', brandId);
            if (token) qs.set('token', token);
            qs.set('api', apiBase || '');
            if (apiBase) {
                window.open(`${apiBase.replace(/\/$/, '')}${path}?${qs.toString()}`, '_blank');
            } else {
                this.showNotification('Geen API baseUrl. Gebruik interne builder-modals.', 'info');
            }
        };

        const wire = (btn, openModalFn, deeplinkPath) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (window.LayoutsBuilder && typeof openModalFn === 'function') {
                    openModalFn();
                } else {
                    openDeeplink(deeplinkPath);
                }
            });
        };

        wire(headerBtn, window.LayoutsBuilder?.openHeaderBuilder, '/builder/header');
        wire(footerBtn, window.LayoutsBuilder?.openFooterBuilder, '/builder/footer');
        wire(menuBtn, window.LayoutsBuilder?.openMenuBuilder, '/builder/menu');
    }

    // ---------- Git Push Button ----------
    setupGitPushButton() {
        const btn = document.getElementById('gitPushBtn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            // Ensure latest project is saved
            this.saveProject(true);
            const message = prompt('Commit bericht:', 'chore: update') || 'chore: update';
            try {
                const res = await fetch('http://localhost:8080/api/git/push', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                if (!res.ok) throw new Error(await res.text());
                this.showNotification('Ã¢Å“… Wijzigingen naar GitHub gepusht', 'success');
            } catch (err) {
                console.warn('Git push via API mislukt', err);
                // Fallback modal with PowerShell command
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.display = 'block';
                const content = document.createElement('div');
                content.className = 'modal-content';
                content.style.maxWidth = '640px';
                const cmd = `./publish.ps1 -Message "${message.replace(/"/g,'\"')}"`;
                content.innerHTML = `
                    <div class="modal-header">
                        <h3><i class="fas fa-upload"></i> Stuur naar GitHub</h3>
                        <button class="modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <p>Start de server (npm run dev) voor 1-klik push, of voer dit uit in PowerShell:</p>
                        <div style="display:flex; gap:8px; align-items:flex-start;">
                            <textarea class="form-control" style="height:90px; flex:1; font-family: Consolas, monospace;">${cmd}</textarea>
                            <button class="btn btn-primary" id="copyGitCmd"><i class="fas fa-copy"></i> Kopieer</button>
                        </div>
                    </div>`;
                modal.appendChild(content);
                document.body.appendChild(modal);
                const close = () => { document.body.removeChild(modal); };
                content.querySelector('.modal-close').onclick = close;
                modal.onclick = (e) => { if (e.target === modal) close(); };
                content.querySelector('#copyGitCmd').onclick = () => {
                    const ta = content.querySelector('textarea');
                    ta.select(); document.execCommand('copy');
                    this.showNotification('Ã°Å¸“”¹ Commando gekopieerd', 'success');
                };
            }
        });
    }

    loadProjectData(data) {
        if (!data) return;
        const canvas = document.getElementById('canvas');
        if (data.pages && Array.isArray(data.pages)) {
            this.pages = data.pages;
            this.currentPageId = data.currentPageId || (this.pages[0] && this.pages[0].id);
            const cur = this.pages.find(p => p.id === this.currentPageId) || this.pages[0];
            canvas.innerHTML = cur?.html || this.blankCanvasHtml();
        } else if (data.html) {
            // Backwards compatible import
            const id = this.generateId('page');
            this.pages = [{ id, name: 'Home', slug: 'home', html: data.html }];
            this.currentPageId = id;
            canvas.innerHTML = data.html;
        }
        this.interceptCanvasLinks();
        if (data.device) {
            this.currentDevice = data.device;
            const deviceBtn = document.querySelector(`[data-device="${data.device}"]`);
            if (deviceBtn) deviceBtn.click();
        }
        this.reattachEventListeners();
        this.persistPagesToLocalStorage(true);
        this.showNotification('Ã°Å¸“”š Project geladen', 'success');
    }
}

// Initialize Website Builder when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.websiteBuilder = new WebsiteBuilder();
    // Apply header visibility and attach save handler for Bolt/deeplink context
    try { window.websiteBuilder.applyBoltHeaderVisibilityLite(); } catch (e) {}
    try { window.websiteBuilder.setupBoltDeeplinkSave(); } catch (e) {}
    try { window.websiteBuilder.setupVisibilityGuards(); } catch (e) {}
    // Re-apply shortly after in case header renders late
    setTimeout(() => { try { window.websiteBuilder.applyBoltHeaderVisibilityLite(); } catch (e) {} }, 150);
});

// Add global error handler
window.addEventListener('error', (event) => {
    console.error('Ã°Å¸’Â¥ JavaScript fout:', event.error);
    if (window.websiteBuilder) {
        window.websiteBuilder.showErrorMessage('Er is een onverwachte fout opgetreden.');
    }
});

// Add some helpful global functions
window.wb = {
    save: () => window.websiteBuilder?.saveProject(),
    load: () => window.websiteBuilder?.loadSavedProject(),
    clear: () => window.websiteBuilder?.clearProject(),
    export: () => window.ExportManager?.showExportModal(),
    preview: () => window.ExportManager?.showPreview(),
    getData: () => window.websiteBuilder?.getProjectData(),
    loadData: (data) => window.websiteBuilder?.loadProjectData(data)
};

console.log('Ã°Å¸Å½Â¯ Website Builder geladen! Gebruik wb.save(), wb.export(), etc. in de console.');
