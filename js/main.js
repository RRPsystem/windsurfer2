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
            
            // Return URL: lees en bewaar bij opstarten (URL-decoded)
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrlRaw = urlParams.get('return_url');
                if (returnUrlRaw) {
                    // Decode de URL (# is geëncodeerd als %23)
                    const returnUrl = decodeURIComponent(returnUrlRaw);
                    localStorage.setItem('builder_return_url', returnUrl);
                    console.log('[ReturnURL] Opgeslagen (decoded):', returnUrl);
                }
            } catch (e) {
                console.warn('[ReturnURL] Kon niet opslaan:', e);
            }
            
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
                        this.showNotification('ðŸ”— Navigeren is uitgeschakeld in de editor (gebruik Preview).', 'info');
                        setTimeout(() => { canvas.__wb_linkHintShown = false; }, 4000);
                    }
                } catch (e) {}
            }, true);
        } catch (e) {}
    }

    // Ensure a 'Publiceer Nieuws' button exists in the header and is visible only in news mode
    ensureNewsPublishButton(mode) {
        try {
            const headerRight = document.querySelector('.app-header .header-right');
            if (!headerRight) return;
            let btn = document.getElementById('newsPublishBtn');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'newsPublishBtn';
                btn.className = 'btn btn-primary';
                btn.innerHTML = '<i class="fas fa-bullhorn"></i> Publiceer nieuws';
                btn.style.marginLeft = '8px';
                btn.onclick = async () => {
                    try {
                        const u = new URL(window.location.href);
                        const brand_id = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID || '';
                        const id = (u.searchParams.get('news_id') || u.searchParams.get('id') || '').trim();
                        const slug = (u.searchParams.get('news_slug') || u.searchParams.get('slug') || '').trim();
                        if (!brand_id) { this.showNotification('brand_id ontbreekt', 'error'); return; }
                        if (!window.BuilderPublishAPI || !window.BuilderPublishAPI.news || typeof window.BuilderPublishAPI.news.publish !== 'function') {
                            this.showNotification('Publish helper niet geladen', 'error'); return;
                        }
                        btn.disabled = true; const prev = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publicerenâ€¦';
                        try {
                            const res = await window.BuilderPublishAPI.news.publish({ brand_id, id: id || undefined, slug: id ? undefined : (slug || undefined) });
                            // Compact messaging per requirement
                            let msg = 'ðŸ“£ Nieuws gepubliceerd';
                            const isAdmin = (res && (res.kind === 'admin' || res.author_type === 'admin'));
                            if (isAdmin && res && res.assignment_updated === true) {
                                msg = 'ðŸ“£ Gepubliceerd en toegewezen aan brand';
                            } else if (res && typeof res.message === 'string' && res.message.trim()) {
                                msg = `ðŸ“£ ${res.message.trim()}`;
                            }
                            this.showNotification(msg, 'success');
                        } finally {
                            btn.disabled = false; btn.innerHTML = prev;
                        }
                    } catch (e) {
                        console.warn('Publish news failed', e);
                        this.showNotification('Publiceren mislukt', 'error');
                    }
                };
                // Insert near Save button if present
                const saveBtn = document.getElementById('saveProjectBtn');
                if (saveBtn && saveBtn.parentElement === headerRight) saveBtn.after(btn); else headerRight.appendChild(btn);
            }
            // Toggle visibility
            const isNews = (mode || this.getCurrentMode()) === 'news';
            btn.style.display = isNews ? '' : 'none';
        } catch (e) {}
    }

    // Minimal header visibility in Bolt/deeplink context (fallback if index.html fails)
    applyBoltHeaderVisibilityLite() {
        try {
            const href = new URL(window.location.href);
            // Bind auth globals from URL so downstream publish helpers always have headers
            try {
                const b = href.searchParams.get('brand_id');
                const t = href.searchParams.get('token');
                const k = href.searchParams.get('apikey') || href.searchParams.get('api_key');
                if (b) window.CURRENT_BRAND_ID = b;
                if (t) window.CURRENT_TOKEN = t;
                if (k) {
                    if (!window.BOLT_API) window.BOLT_API = { baseUrl: href.searchParams.get('api') || '' };
                    window.BOLT_API.apiKey = k;
                }
            } catch (e) {}
            const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl) || (!!href.searchParams.get('api') && !!href.searchParams.get('brand_id'));
            if (!isBolt) return;

            const apply = () => {
                try {
                    const hideIds = ['importTcBtn','pagesBtn','newPageQuickBtn','headerBuilderBtn','footerBuilderBtn','openProjectBtn','exportBtn','gitPushBtn','publishBtn','layoutBtn'];
                    hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
                    // Also hide by visible text for safety
                    try {
                        document.querySelectorAll('.app-header button, .app-header a').forEach(el => {
                            const t = (el.textContent || '').trim().toLowerCase();
                            if (t === 'importeer tc' || t === "pagina's" || t === 'paginas' || t === 'nieuwe pagina' || t === 'paginaâ€™s') {
                                el.style.display = 'none';
                            }
                        });
                    } catch (e) {}

                    // Old Bouwtype dropdown removed - using buildTypeSelect in header instead
                    const headerRight = document.querySelector('.app-header .header-right');
                    if (headerRight && !document.getElementById('topModeSelect')){
                        // Disabled - using new buildTypeSelect
                        const sel = { value: 'page' }; // Dummy for compatibility
                        // Determine initial mode from deeplink/hash/localStorage
                        try {
                            const ct = (href.searchParams.get('content_type')||'').toLowerCase();
                            const hasNewsSlug = !!(href.searchParams.get('news_slug') || href.searchParams.get('slug'));
                            const hasPageId = !!href.searchParams.get('page_id');
                            let mode = 'page';
                            if (ct === 'news_items' || (hasNewsSlug && !hasPageId)) mode = 'news';
                            if (ct === 'destinations') mode = 'destination';
                            // Prefer explicit hash if present
                            const hashMode = (location.hash.match(/#\/mode\/([a-z]+)/i)||[])[1];
                            if (hashMode) mode = hashMode;
                            sel.value = mode;
                            try { localStorage.setItem('wb_mode', mode); } catch (e) {}
                            try { if (!hashMode) location.hash = '#/mode/' + mode; } catch (e) {}
                            // Ensure publish button visibility according to mode
                            try { this.ensureNewsPublishButton(mode); } catch (e) {}
                        } catch (e) {}
                        sel.onchange = () => {
                            try {
                                localStorage.setItem('wb_mode', sel.value);
                                location.hash = '#/mode/' + sel.value;
                                // If user selects Destination in the mini menu, scaffold immediately
                                if (sel.value === 'destination' && window.websiteBuilder && typeof window.websiteBuilder.startDestinationScaffold === 'function') {
                                    // Slight delay to let hash update propagate
                                    setTimeout(() => { try { window.websiteBuilder.startDestinationScaffold(); } catch (e) {} }, 50);
                                }
                                // Toggle publish button based on current mode
                                try { this.ensureNewsPublishButton(sel.value); } catch (e) {}
                            } catch (e) {}
                        };
                    }

                    // Ensure save handler is bound correctly each time
                    try { this.setupBoltDeeplinkSave(); } catch (e) {}
                    // Ensure publish button exists/visibility updated
                    try {
                        const curMode = (document.getElementById('topModeSelect')||{}).value || this.getCurrentMode();
                        this.ensureNewsPublishButton(curMode);
                    } catch (e) {}
                    // Diagnostics: validate runtime and surface missing params
                    try { this.showDiagnosticsBanner(); } catch (e) {}
                } catch (e) {}
            };

            apply();
            // Observe header for changes and re-apply (debounced; suspended while typing)
            try {
                const header = document.querySelector('.app-header');
                if (header) {
                    if (this._headerMO) { try { this._headerMO.disconnect(); } catch (e) {} }
                    let t = null;
                    this._headerMO = new MutationObserver(() => {
                        // Skip while typing title/slug to avoid feedback loops
                        if (this._suspendHeaderMO) return;
                        try { if (t) clearTimeout(t); } catch (e) {}
                        t = setTimeout(() => { try { apply(); } catch (e) {} }, 150);
                    });
                    // Keep subtree true but avoid attribute storm; childList changes are enough
                    this._headerTarget = header;
                    this._headerMO.observe(header, { childList: true, subtree: true, attributes: false });
                }
            } catch (e) {}
        } catch (e) {}
    }

    // Validate that required runtime params are present for remote save/publish
    validateRuntimeParams() {
        const missing = [];
        try {
            const u = new URL(window.location.href);
            const brandId = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID;
            const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || u.searchParams.get('api') || '';
            const token = u.searchParams.get('token') || window.CURRENT_TOKEN || '';
            const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || u.searchParams.get('apikey') || u.searchParams.get('api_key') || '';
            if (!brandId) missing.push('brand_id');
            if (!apiBase) missing.push('api');
            if (!token) missing.push('token');
            if (!apiKey) missing.push('apikey');
        } catch (e) {
            missing.push('url');
        }
        return { ok: missing.length === 0, missing };
    }

    // Show a small banner in the UI when required params are missing; disable save button
    showDiagnosticsBanner() {
        const diagId = 'wb-diagnostics';
        const res = this.validateRuntimeParams();
        const btn = document.getElementById('saveProjectBtn');
        if (!res.ok) {
            // Keep Save button enabled; we'll fallback to local save in handler
            try { if (btn) btn.disabled = false; } catch (e) {}
            let bar = document.getElementById(diagId);
            if (!bar) {
                bar = document.createElement('div');
                bar.id = diagId;
                bar.style.cssText = 'margin:10px 16px;padding:8px 12px;border:1px dashed #ef4444;background:#fef2f2;color:#991b1b;border-radius:8px;';
                const cont = document.querySelector('#canvas')?.parentElement || document.body;
                cont.insertBefore(bar, cont.firstChild);
            }
            bar.innerHTML = `âš ï¸ Opslaan naar server uitgeschakeld. Ontbrekende parameters: <strong>${res.missing.join(', ')}</strong>. Open de builder via een deeplink met deze query parameters.`;
        } else {
            try { if (btn) btn.disabled = false; } catch (e) {}
            const bar = document.getElementById(diagId);
            if (bar) bar.remove();
        }
    }

    // ---------- Scaffold: Bestemmingspagina template ----------
    createDestinationTemplate(options = {}) {
        try {
            const canvas = document.getElementById('canvas');
            if (!canvas) return;

            const slugify = (s) => String(s || '')
              .toLowerCase()
              .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 80);

            const country = (options.title || 'Bestemming').toString();
            const subtitle = (options.subtitle || 'Ontdek de hoogtepunten, activiteiten en inspiratie.').toString();
            const intro = (options.intro || `Schrijf hier een introductie over ${country}.`).toString();
            const extra = (options.extraText || `Plaats hier extra tekst boven de fotogalerij.`).toString();

            // Gallery: Use generic travel photos (Unsplash Source is deprecated)
            // User can replace these with specific photos via the media picker
            const images = Array.isArray(options.images) && options.images.length ? options.images : [
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop'
            ];

            // Clear canvas
            canvas.innerHTML = '';

            // 0) Agent notice: land-invoer + AI-knop
            let note = null;
            try {
                note = document.createElement('section');
                note.className = 'wb-admin-note';
                note.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;color:#374151;display:flex;gap:8px;align-items:center;">
                    <i class="fas fa-wand-magic-sparkles" style="color:#8b5cf6;"></i>
                    <div style="font-weight:700;">Vul het land en genereer de teksten met AI</div>
                    <input id="destCountryInput" class="form-control" type="text" placeholder="Bijv. Japan" value="" style="max-width:220px; margin-left:8px;" />
                    <button id="aiCountryBtn" class="btn" style="background:#8b5cf6;border-color:#8b5cf6;color:#fff;font-weight:600;"><i class="fas fa-wand-magic-sparkles"></i> ✨ AI tekst genereren</button>
                    <div style="margin-left:auto;font-size:12px;color:#6b7280;">De AI vult Intro, Hoogtepunten, Activiteiten en Extra tekst</div>
                  </div>`;
                canvas.appendChild(note);
            } catch (e) {}

            // 1) Hero with country name and travel photo
            try {
                // Use a generic travel photo (user can change via media picker)
                const heroUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop';
                const hero = ComponentFactory.createComponent('hero-page', {
                    wordText: country.toUpperCase(),
                    height: '380px',
                    overlayOpacity: 0.4,
                    background: heroUrl
                });
                if (hero) canvas.appendChild(hero);
            } catch (e) { console.warn('Destination hero failed', e); }

            // Prepare refs so we can wire AI after creation
            let content = null, highlights = null, activities = null, extraBlock = null, gallery = null;

            // 2) Intro + right column placeholder (TC trips will be added later in a sidebar component)
            try {
                content = ComponentFactory.createComponent('content-flex', {
                    title: `Over ${country}`,
                    subtitle,
                    body: `<p>${intro}</p>`,
                    layout: 'none',
                    shadow: true,
                    radius: 12
                });
                if (content) { content.dataset.role = 'intro'; canvas.appendChild(content); }
            } catch (e) { console.warn('Destination intro failed', e); }

            // 3) Highlights (2x3) with green checkmarks
            try {
                highlights = document.createElement('section');
                highlights.className = 'wb-block';
                highlights.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:8px 16px;">
                    <h2 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#111827;">Hoogtepunten</h2>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                      <ul style="margin:0;padding:0;list-style:none;">
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 1</span></li>
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 2</span></li>
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 3</span></li>
                      </ul>
                      <ul style="margin:0;padding:0;list-style:none;">
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 4</span></li>
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 5</span></li>
                        <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">Hoogtepunt 6</span></li>
                      </ul>
                    </div>
                  </div>`;
                highlights.dataset.role = 'highlights';
                canvas.appendChild(highlights);
            } catch (e) { console.warn('Destination highlights failed', e); }

            // 4) Activities (2x3) simple cards - will be filled by AI
            try {
                const placeholderActivities = [
                    { title: 'Activiteit 1', desc: 'Klik op AI tekst genereren om te vullen' },
                    { title: 'Activiteit 2', desc: 'Klik op AI tekst genereren om te vullen' },
                    { title: 'Activiteit 3', desc: 'Klik op AI tekst genereren om te vullen' },
                    { title: 'Activiteit 4', desc: 'Klik op AI tekst genereren om te vullen' },
                    { title: 'Activiteit 5', desc: 'Klik op AI tekst genereren om te vullen' },
                    { title: 'Activiteit 6', desc: 'Klik op AI tekst genereren om te vullen' }
                ];
                const icons = ['fa-hiking','fa-camera','fa-utensils','fa-landmark','fa-water','fa-mountain'];
                
                activities = document.createElement('section');
                activities.className = 'wb-block';
                activities.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:8px 16px;">
                    <h2 style="margin:0 0 8px;">Activiteiten</h2>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                      ${placeholderActivities.map((act, i)=>`
                        <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;box-shadow:0 6px 16px rgba(0,0,0,.04);">
                          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><i class="fas ${icons[i]}" style="color:#f59e0b;font-size:20px;"></i><strong style="font-size:16px;color:#111827;">${act.title}</strong></div>
                          <div style="color:#64748b;font-size:14px;line-height:1.5;">${act.desc}</div>
                        </div>`).join('')}
                    </div>
                  </div>`;
                activities.dataset.role = 'activities';
                canvas.appendChild(activities);
            } catch (e) { console.warn('Destination activities failed', e); }

            // 5) Extra text block (above gallery)
            try {
                extraBlock = ComponentFactory.createComponent('content-flex', {
                    title: '',
                    subtitle: '',
                    body: `<p>${extra}</p>`,
                    layout: 'none',
                    shadow: false,
                    radius: 0
                });
                if (extraBlock) {
                    extraBlock.classList.add('cf-plain');
                    extraBlock.dataset.role = 'extra';
                    canvas.appendChild(extraBlock);
                }
            } catch (e) { console.warn('Destination extra text failed', e); }

            // 6) Gallery 2x3
            try {
                gallery = ComponentFactory.createComponent('media-row', {
                    images: images.slice(0,6),
                    height: 180,
                    gap: 10,
                    radius: 10,
                    carousel: false,
                    layout: 'uniform'
                });
                if (gallery) { gallery.dataset.role = 'gallery'; canvas.appendChild(gallery); }
            } catch (e) { console.warn('Destination gallery failed', e); }

            // 7) Sublibrary tabs (Cities / Regions / UNESCO)
            try {
                const tabs = ComponentFactory.createComponent('dest-tabs', {});
                if (tabs) canvas.appendChild(tabs);
            } catch (e) { console.warn('Destination tabs failed', e); }

            // Update current page meta + persist
            const cur = (this.pages || []).find(p => p.id === this.currentPageId) || (this.pages || [])[0] || null;
            if (cur) {
                cur.name = country;
                cur.slug = slugify(country);
                cur.html = canvas.innerHTML;
            }

            try { this.reattachEventListeners(); } catch (e) {}
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch (e) {}
            try { this.saveProject(true); } catch (e) {}

            // 8) Wire AI button after components exist
            try {
                const btn = note ? note.querySelector('#aiCountryBtn') : null;
                const input = note ? note.querySelector('#destCountryInput') : null;
                if (btn) btn.onclick = async () => {
                    const c = (input && input.value && input.value.trim()) ? input.value.trim() : country;
                    if (!c) { alert('Vul eerst een land in.'); return; }
                    if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') { alert('AI module niet geladen.'); return; }
                    btn.disabled = true; const oldTxt = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> AI bezig...';
                    try {
                        console.log('[Destination AI] Starting generation for:', c);
                        // Intro
                        if (content) {
                            console.log('[Destination AI] Generating intro...');
                            const r = await window.BuilderAI.generate('intro', { 
                                country: c, 
                                language: 'nl',
                                tone: 'inspiring'
                            });
                            console.log('[Destination AI] Intro response:', r);
                            let text = r?.intro?.text || r?.text || r?.content || '';
                            // Fallback als AI geen tekst geeft
                            if (!text || text.length < 20) {
                                console.warn('[Destination AI] No intro text received, using fallback');
                                text = `${c} is een fascinerend land met een rijke geschiedenis en cultuur. Van bruisende steden tot serene natuurlandschappen, ${c} biedt bezoekers een unieke ervaring die moderne voorzieningen combineert met eeuwenoude tradities.\n\nOf je nu geïnteresseerd bent in historische bezienswaardigheden, culinaire avonturen, of natuurlijke schoonheid, ${c} heeft voor elk wat wils. De gastvrijheid van de lokale bevolking en de diverse attracties maken het tot een onvergetelijke bestemming.`;
                            }
                            const bodyEl = content.querySelector('.cf-body');
                            if (bodyEl) {
                                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                                bodyEl.innerHTML = paragraphs;
                                console.log('[Destination AI] Intro updated');
                            }
                            const tEl = content.querySelector('.cf-title'); if (tEl) tEl.textContent = `Over ${c}`;
                        }
                        // Highlights (6) with green checkmarks
                        if (highlights) {
                            console.log('[Destination AI] Generating highlights...');
                            const r = await window.BuilderAI.generate('highlights', { 
                                country: c, 
                                language: 'nl', 
                                count: 6 
                            });
                            console.log('[Destination AI] Highlights response:', r);
                            console.log('[Destination AI] Response keys:', Object.keys(r || {}));
                            
                            // Parse highlights response - keep full objects
                            let arr = [];
                            if (Array.isArray(r?.highlights)) {
                                arr = r.highlights;
                            } else if (Array.isArray(r?.items)) {
                                arr = r.items;
                            } else if (r && typeof r === 'object') {
                                // Try to find any array in the response
                                const firstKey = Object.keys(r)[0];
                                if (firstKey && Array.isArray(r[firstKey])) {
                                    arr = r[firstKey];
                                    console.log(`[Destination AI] Found array in key: ${firstKey}`);
                                }
                            }
                            console.log('[Destination AI] Parsed highlights array:', arr);
                            
                            // Fallback als AI geen items geeft - land-specifiek
                            if (!arr || arr.length === 0) {
                                console.warn('[Destination AI] No highlights received, using country-specific fallback for:', c);
                                const country = c.toLowerCase();
                                
                                // Land-specifieke hoogtepunten
                                if (country.includes('japan')) {
                                    arr = ['Oude tempels en heiligdommen', 'Mount Fuji en natuurlijke schoonheid', 'Traditionele geisha cultuur', 'Moderne technologie en anime', 'Kersenbloesem seizoen', 'Authentieke sushi en ramen'];
                                } else if (country.includes('spanje') || country.includes('spain')) {
                                    arr = ['Sagrada Familia en Gaudí architectuur', 'Flamenco dans en muziek', 'Tapas en paella cultuur', 'Prachtige stranden aan de Costa', 'Historische Alhambra in Granada', 'Levendige festivals zoals La Tomatina'];
                                } else if (country.includes('frankrijk') || country.includes('france')) {
                                    arr = ['Eiffeltoren en Parijse charme', 'Lavendelvelden in de Provence', 'Wijnstreken van Bordeaux', 'Côte d\'Azur en Franse Rivièra', 'Historische kastelen in Loire', 'Franse gastronomie en patisserie'];
                                } else if (country.includes('italië') || country.includes('italy') || country.includes('italie')) {
                                    arr = ['Colosseum en Romeinse geschiedenis', 'Venetiaanse gondels en kanalen', 'Toscaanse heuvels en wijngaarden', 'Italiaanse pizza en pasta', 'Renaissance kunst in Florence', 'Amalfikust en Cinque Terre'];
                                } else if (country.includes('thailand')) {
                                    arr = ['Gouden tempels en Boeddhabeelden', 'Tropische stranden en eilanden', 'Authentieke Thaise massage', 'Drijvende markten', 'Pad Thai en street food', 'Olifantensanctuaria'];
                                } else if (country.includes('griekenland') || country.includes('greece')) {
                                    arr = ['Acropolis en Parthenon', 'Witte huisjes op Santorini', 'Griekse eilanden en stranden', 'Moussaka en Griekse mezze', 'Oude mythologie en ruïnes', 'Blauwe koepels van Oia'];
                                } else if (country.includes('portugal')) {
                                    arr = ['Pastéis de Nata en Portugese keuken', 'Kleurrijke azulejos tegels', 'Douro vallei wijnstreek', 'Historisch Lissabon en Porto', 'Algarve stranden', 'Fado muziek'];
                                } else if (country.includes('duitsland') || country.includes('germany')) {
                                    arr = ['Kasteel Neuschwanstein', 'Oktoberfest in München', 'Berlijnse Muur en geschiedenis', 'Romantische Rijn', 'Zwarte Woud', 'Duitse biercultuur'];
                                } else if (country.includes('turkije') || country.includes('turkey')) {
                                    arr = ['Hagia Sophia en Blauwe Moskee', 'Cappadocië luchtballonnen', 'Turkse bazaars', 'Turkse keuken en kebab', 'Pamukkale kalkterrassen', 'Bosporus cruise'];
                                } else {
                                    arr = [
                                        `Rijke culturele geschiedenis van ${c}`,
                                        'Prachtige natuurlijke landschappen',
                                        'Unieke culinaire ervaringen',
                                        'Moderne steden met historische wijken',
                                        'Vriendelijke en gastvrije bevolking',
                                        'Diverse activiteiten voor elk seizoen'
                                    ];
                                }
                            }
                            
                            const uls = highlights.querySelectorAll('ul');
                            const a = uls[0], b = uls[1];
                            if (a && b) {
                                const left = arr.slice(0,3).map(x=>{
                                    // Extract title and summary from object
                                    const txt = typeof x === 'string' ? x : (x.title || x.summary || x.text || '');
                                    return `<li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">${txt}</span></li>`;
                                }).join('');
                                const right = arr.slice(3,6).map(x=>{
                                    const txt = typeof x === 'string' ? x : (x.title || x.summary || x.text || '');
                                    return `<li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;"><span style="flex-shrink:0;width:24px;height:24px;background:#10b981;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">✓</span><span style="color:#374151;font-size:16px;line-height:24px;">${txt}</span></li>`;
                                }).join('');
                                if (left) a.innerHTML = left;
                                if (right) b.innerHTML = right;
                            }
                        }
                        // Activities (6)
                        if (activities) {
                            console.log('[Destination AI] Generating activities...');
                            const r = await window.BuilderAI.generate('activities', { 
                                country: c, 
                                language: 'nl', 
                                count: 6 
                            });
                            console.log('[Destination AI] Activities response:', r);
                            console.log('[Destination AI] Response keys:', Object.keys(r || {}));
                            
                            // Parse activities response - keep full objects
                            let arr = [];
                            if (Array.isArray(r?.activities)) {
                                arr = r.activities;
                            } else if (Array.isArray(r?.items)) {
                                arr = r.items;
                            } else if (r && typeof r === 'object') {
                                // Try to find any array in the response
                                const firstKey = Object.keys(r)[0];
                                if (firstKey && Array.isArray(r[firstKey])) {
                                    arr = r[firstKey];
                                    console.log(`[Destination AI] Found array in key: ${firstKey}`);
                                }
                            }
                            console.log('[Destination AI] Parsed activities array:', arr);
                            
                            // Fallback als AI geen items geeft - land-specifiek
                            if (!arr || arr.length === 0) {
                                console.warn('[Destination AI] No activities received, using country-specific fallback for:', c);
                                const country = c.toLowerCase();
                                
                                // Land-specifieke activiteiten
                                if (country.includes('japan')) {
                                    arr = ['Bezoek de Fushimi Inari tempel in Kyoto', 'Ervaar een traditionele theeceremonie', 'Wandel door bamboewoude van Arashiyama', 'Proef street food in Osaka', 'Bezoek het Ghibli Museum in Tokyo', 'Ontspan in een onsen (warmwaterbron)'];
                                } else if (country.includes('spanje') || country.includes('spain')) {
                                    arr = ['Proef tapas in Barcelona', 'Bezoek het Prado Museum in Madrid', 'Wandel door Park Güell', 'Ervaar een flamenco show', 'Ontdek de gotische wijk van Barcelona', 'Geniet van sangria op een terrasje'];
                                } else if (country.includes('frankrijk') || country.includes('france')) {
                                    arr = ['Bezoek het Louvre museum', 'Proef wijn in Bordeaux', 'Wandel langs de Seine', 'Ontdek de lavendelvelden', 'Geniet van croissants in een café', 'Bezoek het Paleis van Versailles'];
                                } else if (country.includes('italië') || country.includes('italy') || country.includes('italie')) {
                                    arr = ['Proef authentieke pizza in Napels', 'Bezoek het Vaticaan en Sixtijnse Kapel', 'Wandel door Venetië', 'Ontdek de Toscaanse wijngaarden', 'Bezoek de Toren van Pisa', 'Geniet van gelato in Rome'];
                                } else if (country.includes('thailand')) {
                                    arr = ['Bezoek de Wat Pho tempel in Bangkok', 'Neem een longtail boot tour', 'Proef Pad Thai op een nachtmarkt', 'Duik of snorkel bij de eilanden', 'Bezoek een olifantensanctuarium', 'Ervaar een Thaise kookcursus'];
                                } else if (country.includes('griekenland') || country.includes('greece')) {
                                    arr = ['Bezoek de Acropolis in Athene', 'Eilandhoppen in de Cycladen', 'Proef Griekse mezze en ouzo', 'Zwem in kristalhelder water', 'Bezoek oude ruïnes', 'Geniet van zonsondergang in Oia'];
                                } else if (country.includes('portugal')) {
                                    arr = ['Proef Pastéis de Nata in Belém', 'Rijd met tram 28 door Lissabon', 'Bezoek de Douro vallei', 'Wandel door Porto', 'Ontdek de Algarve grotten', 'Luister naar Fado muziek'];
                                } else if (country.includes('duitsland') || country.includes('germany')) {
                                    arr = ['Bezoek kasteel Neuschwanstein', 'Vier Oktoberfest in München', 'Wandel langs de Berlijnse Muur', 'Cruise over de Rijn', 'Ontdek het Zwarte Woud', 'Proef Duitse worsten en bier'];
                                } else if (country.includes('turkije') || country.includes('turkey')) {
                                    arr = ['Bezoek de Hagia Sophia', 'Vlieg in een luchtballon over Cappadocië', 'Shop op de Grand Bazaar', 'Proef Turkse kebab en baklava', 'Zwem in Pamukkale', 'Cruise over de Bosporus'];
                                } else {
                                    arr = [
                                        'Bezoek historische bezienswaardigheden en monumenten',
                                        'Proef de lokale keuken en culinaire specialiteiten',
                                        'Ontdek natuurparken en wandelroutes',
                                        'Ervaar de lokale cultuur en tradities',
                                        'Verken bruisende markten en winkelstraten',
                                        'Geniet van outdoor activiteiten en avonturen'
                                    ];
                                }
                            }
                            
                            const cardsWrap = activities.querySelector('[style*="grid-template-columns"]');
                            if (cardsWrap) {
                                cardsWrap.innerHTML = arr.slice(0,6).map((it, idx)=>{
                                    // Extract title and description
                                    let title = '';
                                    let description = '';
                                    
                                    if (typeof it === 'string') {
                                        // If it's a string, try to split on common patterns
                                        const parts = it.split(/[:-]/);
                                        if (parts.length > 1) {
                                            title = parts[0].trim();
                                            description = parts.slice(1).join(':').trim();
                                        } else {
                                            description = it;
                                            title = `Activiteit ${idx+1}`;
                                        }
                                    } else {
                                        title = it.title || `Activiteit ${idx+1}`;
                                        description = it.summary || it.text || it.description || '';
                                    }
                                    
                                    const icons = ['fa-hiking','fa-camera','fa-utensils','fa-landmark','fa-water','fa-mountain'];
                                    return `
                                      <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;box-shadow:0 6px 16px rgba(0,0,0,.04);">
                                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><i class="fas ${icons[idx] || 'fa-star'}" style="color:#f59e0b;font-size:20px;"></i><strong style="font-size:16px;color:#111827;">${title}</strong></div>
                                        <div style="color:#64748b;font-size:14px;line-height:1.5;">${description}</div>
                                      </div>`;
                                }).join('');
                            }
                        }
                        // Extra text (deel 2 van de content)
                        if (extraBlock) {
                            console.log('[Destination AI] Generating extra text (part 2)...');
                            const r = await window.BuilderAI.generate('extra', { 
                                country: c, 
                                language: 'nl',
                                tone: 'inspiring'
                            });
                            console.log('[Destination AI] Extra text response:', r);
                            const text = r?.extra?.text || r?.text || r?.content || '';
                            const bodyEl = extraBlock.querySelector('.cf-body');
                            if (bodyEl && text) {
                                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                                bodyEl.innerHTML = paragraphs;
                                console.log('[Destination AI] Extra text updated');
                            }
                            // Remove title and subtitle elements
                            const titleEl = extraBlock.querySelector('.cf-title');
                            const subtitleEl = extraBlock.querySelector('.cf-subtitle');
                            if (titleEl) titleEl.remove();
                            if (subtitleEl) subtitleEl.remove();
                        }
                        
                        // Fetch country-specific photos from Unsplash
                        console.log('[Destination AI] Fetching Unsplash photos for:', c);
                        try {
                            const key = (window.MEDIA_CONFIG && (window.MEDIA_CONFIG.unsplashAccessKey || window.MEDIA_CONFIG.unsplashKey)) || '';
                            if (key) {
                                // Fetch hero photo with better query
                                const heroQuery = `${c} landscape travel iconic`;
                                const heroResp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(heroQuery)}&per_page=3&orientation=landscape&order_by=popular`, {
                                    headers: { Authorization: `Client-ID ${key}` }
                                });
                                const heroData = await heroResp.json();
                                if (heroData.results && heroData.results.length > 0) {
                                    const heroImg = heroData.results[0];
                                    const heroUrl = heroImg.urls.regular || heroImg.urls.full;
                                    // Update hero background
                                    const heroBg = document.querySelector('.wb-hero-page .hp-bg img');
                                    if (heroBg && heroUrl) {
                                        if (typeof window.__WB_applyResponsiveSrc === 'function') {
                                            window.__WB_applyResponsiveSrc(heroBg, heroUrl);
                                        } else {
                                            heroBg.src = heroUrl;
                                        }
                                        console.log('[Destination AI] Hero photo updated');
                                    }
                                }
                                
                                // Fetch gallery photos (6 different searches) with better queries
                                const queries = [
                                    `${c} landmark architecture`,
                                    `${c} culture traditional`,
                                    `${c} food cuisine`,
                                    `${c} nature landscape`,
                                    `${c} city street`,
                                    `${c} iconic famous`
                                ];
                                const galleryUrls = [];
                                for (const query of queries) {
                                    const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&order_by=popular`, {
                                        headers: { Authorization: `Client-ID ${key}` }
                                    });
                                    const data = await resp.json();
                                    if (data.results && data.results.length > 0) {
                                        // Pick first result (most popular)
                                        galleryUrls.push(data.results[0].urls.regular || data.results[0].urls.full);
                                    }
                                }
                                
                                // Update gallery images
                                if (galleryUrls.length > 0 && gallery) {
                                    const galleryImgs = gallery.querySelectorAll('img');
                                    galleryImgs.forEach((img, idx) => {
                                        if (galleryUrls[idx]) {
                                            if (typeof window.__WB_applyResponsiveSrc === 'function') {
                                                window.__WB_applyResponsiveSrc(img, galleryUrls[idx]);
                                            } else {
                                                img.src = galleryUrls[idx];
                                            }
                                        }
                                    });
                                    console.log('[Destination AI] Gallery photos updated:', galleryUrls.length);
                                }
                            } else {
                                console.warn('[Destination AI] No Unsplash API key found - using placeholder photos');
                            }
                        } catch (err) {
                            console.warn('[Destination AI] Unsplash photo fetch failed:', err);
                        }
                        
                        // Success notification
                        if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                            window.websiteBuilder.showNotification('✨ AI teksten gegenereerd voor ' + c, 'success');
                        }
                    } catch (err) { 
                        console.error('[Destination AI] Error:', err);
                        const errMsg = err.message || 'Onbekende fout';
                        alert('AI genereren mislukt: ' + errMsg + '\n\nControleer de browser console (F12) voor details.\n\nMogelijke oorzaken:\n- AI endpoint niet beschikbaar\n- Geen internetverbinding\n- API key ontbreekt'); 
                        if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                            window.websiteBuilder.showNotification('AI genereren mislukt - check console', 'error');
                        }
                    }
                    finally { btn.disabled = false; btn.innerHTML = oldTxt; }
                };
            } catch (e) {}

            this.showNotification('ðŸ—ºï¸ Bestemmingspagina template toegevoegd. Vul het land en klik op AI-landen teksten voor automatische vulling.', 'success');
        } catch (e) {
            console.error('createDestinationTemplate failed', e);
            this.showErrorMessage('Kon bestemmingspagina template niet aanmaken.');
        }
    }

    // Quick action: ensure a blank page and scaffold destination with optional prompt
    startDestinationScaffold(initialCountry) {
        try {
            const canvas = document.getElementById('canvas');
            // Ensure fresh page
            const id = this.generateId('page');
            const html = this.blankCanvasHtml();
            const name = 'Bestemming';
            const slug = 'bestemming';
            this.pages = [{ id, name, slug, html }];
            this.currentPageId = id;
            if (canvas) canvas.innerHTML = html;
            try { this.saveProject(true); } catch (e) {}
            this.reattachEventListeners();

            // Ask for country if not provided
            let country = (initialCountry || '').trim();
            if (!country) {
                country = (prompt('Land / Bestemming:', '') || '').trim();
            }
            this.createDestinationTemplate({ title: country || 'Bestemming' });
        } catch (e) { console.warn('startDestinationScaffold failed', e); }
    }

    // ---------- Scaffold: Nieuwsartikel template ----------
    createNewsArticleTemplate(options = {}) {
        try {
            const canvas = document.getElementById('canvas');
            if (!canvas) return;

            // Helper: slugify
            const slugify = (s) => String(s || '')
              .toLowerCase()
              .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 80);

            const title = (options.title || 'Nieuw artikel').toString();
            const intro = (options.intro || 'Schrijf hier de inleiding van je nieuwsartikel.').toString();
            const date = options.date || new Date();
            const dateStr = (date instanceof Date)
              ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
              : String(date);

            // Default gallery
            const images = Array.isArray(options.images) && options.images.length ? options.images : [
                'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=1600&auto=format&fit=crop'
            ];

            // Clear canvas
            canvas.innerHTML = '';

            // 1) Hero met groot woord "NIEUWS"
            try {
                const hero = ComponentFactory.createComponent('hero-page', {
                    wordText: 'NIEUWS',
                    height: '420px',
                    overlayOpacity: 0.35
                });
                if (hero) canvas.appendChild(hero);
            } catch (e) { console.warn('Hero create failed', e); }

            // 2) Nieuwsartikel blok (titel, datum, auteur, tags, body)
            try {
                // Prefer author from deeplink/globals if present
                const url = new URL(window.location.href);
                const author_type = url.searchParams.get('author_type') || window.CURRENT_AUTHOR_TYPE || '';
                const author_id = url.searchParams.get('author_id') || url.searchParams.get('user_id') || window.CURRENT_USER_ID || '';
                const authorName = (author_type === 'brand' && author_id) ? 'Brand' : 'Auteur';
                const newsComp = ComponentFactory.createComponent('news-article', {
                    title,
                    date: dateStr,
                    author: authorName,
                    tags: Array.isArray(window.CURRENT_NEWS_TAGS) ? window.CURRENT_NEWS_TAGS : [],
                    bodyHtml: `<p>${intro}</p>`
                });
                if (newsComp) canvas.appendChild(newsComp);
            } catch (e) { console.warn('News-article create failed', e); }

            // 3) Gallery
            try {
                const gallery = ComponentFactory.createComponent('media-row', {
                    images,
                    height: 200,
                    gap: 10,
                    radius: 10,
                    carousel: true,
                    layout: 'uniform'
                });
                if (gallery) canvas.appendChild(gallery);
            } catch (e) { console.warn('Gallery create failed', e); }

            // Update current page meta + persist
            const cur = (this.pages || []).find(p => p.id === this.currentPageId) || (this.pages || [])[0] || null;
            if (cur) {
                cur.name = title;
                cur.slug = slugify(title);
                cur.html = canvas.innerHTML;
            }

            // Re-attach event listeners for new components
            try { this.reattachEventListeners(); } catch (e) {}

            // Sync meta inputs in header and save
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch (e) {}
            try { this.saveProject(true); } catch (e) {}

            this.showNotification('ðŸ“° Nieuwsartikel template toegevoegd. Je kunt nu verder bewerken.', 'success');
        } catch (e) {
            console.error('createNewsArticleTemplate failed', e);
            this.showErrorMessage('Kon nieuwsartikel template niet aanmaken.');
        }
    }

    // ---------- Importeer TC ID ----------
    setupImportTcButton() {
        const btn = document.getElementById('importTcBtn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const ideaId = prompt('Voer Travel Compositor ID in:');
            if (!ideaId) return;
            try {
                const base = (window.TC_API_BASE || '').replace(/\/$/, '');
                const url = `${base}/api/ideas/${encodeURIComponent(ideaId)}`;
                const resp = await fetch(base ? url : `/api/ideas/${encodeURIComponent(ideaId)}`);
                if (!resp.ok) throw new Error(await resp.text());
                const data = await resp.json();
                this.loadTravelIdea(data);
                this.showNotification('âœ… TC-content geÃ¯mporteerd', 'success');
                this.saveProject(true);
            } catch (e) {
                console.warn('TC import failed', e);
                this.showNotification('âŒ Importeren mislukt', 'error');
            }
        });
    }

    // Route Map functionality
    showRouteMap(destinations) {
        // Create slide-in panel
        const panel = document.createElement('div');
        panel.className = 'wb-route-map-panel';
        panel.innerHTML = `
            <div class="route-map-header">
                <h2><i class="fas fa-route"></i> Reisroute</h2>
                <button class="route-map-close"><i class="fas fa-times"></i></button>
            </div>
            <div id="routeMap" class="route-map-container"></div>
        `;
        document.body.appendChild(panel);
        
        // Close button
        panel.querySelector('.route-map-close').onclick = () => {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        };
        
        // Animate in
        setTimeout(() => panel.classList.add('active'), 10);
        
        // Initialize map after panel is visible
        setTimeout(() => {
            // Calculate center and bounds
            const lats = destinations.map(d => d.latitude);
            const lngs = destinations.map(d => d.longitude);
            const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            
            // Create map
            const map = L.map('routeMap').setView([centerLat, centerLng], 6);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(map);
            
            // Create route line coordinates
            const routeCoords = destinations.map(d => [d.latitude, d.longitude]);
            
            // Draw route line
            L.polyline(routeCoords, {
                color: '#3b82f6',
                weight: 3,
                opacity: 0.7,
                smoothFactor: 1
            }).addTo(map);
            
            // Add numbered markers
            destinations.forEach((dest, idx) => {
                const icon = L.divIcon({
                    className: 'route-marker',
                    html: `<div class="route-marker-inner">${idx + 1}</div>`,
                    iconSize: [32, 32]
                });
                
                L.marker([dest.latitude, dest.longitude], { icon })
                    .bindPopup(`<b>${dest.name}</b><br>Dag ${dest.fromDay}${dest.toDay !== dest.fromDay ? ` - ${dest.toDay}` : ''}`)
                    .addTo(map);
            });
            
            // Fit bounds to show all markers
            const bounds = L.latLngBounds(routeCoords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }, 350);
    }

    // Load Travel Compositor idea into the builder using Travel Cards
    loadTravelIdea(data) {
        try {
            console.log('[loadTravelIdea] Loading TC data:', data);
            const canvas = document.getElementById('canvas');
            if (!canvas) {
                console.error('[loadTravelIdea] Canvas not found!');
                return;
            }

            // Clear canvas
            canvas.innerHTML = '';

            // Extract TC data structure
            const title = data.name || data.title || 'Reis';
            const description = data.description || data.intro || '';
            const image = data.image || data.mainImage || data.headerImage || '';
            const price = data.price || data.totalPrice;
            const currency = data.currency || 'EUR';
            
            // TC uses these arrays instead of 'days'
            const destinations = data.destinations || [];
            const hotels = data.hotels || [];
            const transports = data.transports || [];
            const transfers = data.transfers || [];

            console.log('[loadTravelIdea] TC Data:', { 
                title, 
                description, 
                destinations: destinations.length,
                hotels: hotels.length,
                transports: transports.length,
                transfers: transfers.length,
                image, 
                price 
            });

            // 1. Add hero with travel image
            if (image) {
                try {
                    const hero = ComponentFactory.createComponent('hero-travel', {
                        title: title,
                        subtitle: description.substring(0, 150),
                        background: image,
                        height: '400px'
                    });
                    if (hero) canvas.appendChild(hero);
                } catch (e) {
                    console.warn('Failed to create hero', e);
                }
            }

            // 1.5. Add intro text block with optional "Bekijk Route" button
            try {
                const textBlock = ComponentFactory.createComponent('content-block', {});
                if (textBlock) {
                    // Add intro text
                    const textContent = textBlock.querySelector('.wb-content-text');
                    if (textContent) {
                        textContent.innerHTML = `
                            <h2 style="margin-bottom: 16px;">Over deze reis</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                                ${description || 'Ontdek de mooiste plekken en beleef een onvergetelijke reis vol avontuur en ontspanning.'}
                            </p>
                            <button id="showRouteBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
                                <i class="fas fa-route"></i> Bekijk Route
                            </button>
                        `;
                        
                        // Add event listener for route button
                        setTimeout(() => {
                            const routeBtn = document.getElementById('showRouteBtn');
                            if (routeBtn) {
                                routeBtn.addEventListener('click', () => {
                                    // Open route in sidebar or modal
                                    if (window.showRouteOverview) {
                                        window.showRouteOverview(data);
                                    } else {
                                        alert('Route overzicht functie wordt binnenkort toegevoegd!');
                                    }
                                });
                            }
                        }, 100);
                    }
                    canvas.appendChild(textBlock);
                }
            } catch (e) {
                console.warn('Failed to create intro text block', e);
            }

            // 2. Add Travel Hero with Interactive Map
            console.log('[DEBUG] Destinations:', destinations);
            console.log('[DEBUG] Hotels:', hotels);
            
            const destinationsWithCoords = destinations
                .filter(d => d.geolocation?.latitude && d.geolocation?.longitude)
                .map(d => {
                    // Find hotel for this destination (same days)
                    const destHotel = hotels.find(h => 
                        h.fromDay <= d.toDay && h.toDay >= d.fromDay
                    );
                    
                    console.log(`[DEBUG] Destination ${d.name} (Day ${d.fromDay}-${d.toDay}):`, {
                        images: d.images,
                        description: d.description,
                        hotel: destHotel ? destHotel.name : 'NO HOTEL FOUND'
                    });

                    // Translation mapping
                    const translations = {
                        'Free internet': 'Gratis internet',
                        'Swimming Pool': 'Zwembad',
                        'Coworking space': 'Coworking ruimte',
                        'Beach hotels': 'Strandhotels',
                        'Accessible parking': 'Toegankelijke parkeerplaats',
                        'Restaurant': 'Restaurant',
                        'Bar': 'Bar',
                        'Fitness center': 'Fitnesscentrum',
                        'Spa': 'Spa',
                        'Air conditioning': 'Airconditioning',
                        'Parking': 'Parkeren',
                        'WiFi': 'WiFi',
                        'Pool': 'Zwembad',
                        'Gym': 'Sportschool',
                        'Breakfast': 'Ontbijt',
                        'Room service': 'Roomservice',
                        'Concierge': 'Conciërge',
                        'Laundry': 'Wasservice',
                        'Safe': 'Kluis',
                        'Minibar': 'Minibar',
                        'Guest Room': 'Standaard kamer',
                        'Standard Room': 'Standaard kamer',
                        'Deluxe Room': 'Deluxe kamer',
                        'Suite': 'Suite',
                        'Double Room': 'Tweepersoonskamer',
                        'Twin Room': 'Kamer met 2 aparte bedden',
                        'Family Room': 'Familiekamer',
                        'BED AND BREAKFAST': 'Bed & Breakfast',
                        'HALF BOARD': 'Halfpension',
                        'FULL BOARD': 'Volpension',
                        'ALL INCLUSIVE': 'All-inclusive',
                        'ROOM ONLY': 'Alleen kamer'
                    };
                    const translate = (text) => translations[text] || text;

                    let hotelData = null;
                    if (destHotel) {
                        const facilities = destHotel.hotelData?.facilities?.otherFacilities
                            ?.filter(f => f.priority > 50)
                            .sort((a, b) => b.priority - a.priority)
                            .slice(0, 6)
                            .map(f => ({
                                icon: f.icon || 'fa-regular fa-check',
                                description: translate(f.description)
                            })) || [];

                        hotelData = {
                            name: destHotel.name,
                            description: destHotel.hotelData?.description || '',
                            images: destHotel.imageUrls || destHotel.images || [],
                            roomType: translate(destHotel.roomTypes?.split(',')[0] || 'Standaard kamer'),
                            meals: translate(destHotel.mealPlan || 'Ontbijt inbegrepen'),
                            facilities: facilities
                        };
                    }

                    return {
                        name: d.name,
                        latitude: d.geolocation.latitude,
                        longitude: d.geolocation.longitude,
                        fromDay: d.fromDay,
                        toDay: d.toDay,
                        description: d.description || '',
                        images: d.imageUrls || d.images || [],
                        hotel: hotelData
                    };
                });

            if (destinationsWithCoords.length > 0) {
                try {
                    const travelHero = ComponentFactory.createComponent('travel-hero', {
                        style: 'interactive-map',
                        title: title || 'Jouw Reis',
                        subtitle: `${destinations.length} bestemmingen • ${Math.max(...destinations.map(d => d.toDay))} dagen`,
                        destinations: destinationsWithCoords
                    });
                    if (travelHero) canvas.appendChild(travelHero);
                } catch (e) {
                    console.warn('Failed to create travel hero', e);
                }
            }

            // 3. Add intro text - centered, no title
            if (description) {
                try {
                    const intro = ComponentFactory.createComponent('text-block', {
                        content: `<p style="text-align: center; font-size: 18px; line-height: 1.8; max-width: 800px; margin: 0 auto; color: #374151;">${description}</p>`
                    });
                    if (intro) {
                        intro.style.padding = '40px 20px';
                        intro.style.textAlign = 'center';
                        canvas.appendChild(intro);
                    }
                } catch (e) {
                    console.warn('Failed to create intro', e);
                }
            }

            // 4. Create Travel Timeline with TC data
            if (destinations.length > 0 || hotels.length > 0 || transports.length > 0 || transfers.length > 0) {
                try {
                    // Only show route map button if NO interactive map hero was added
                    const hasDestinations = destinations.some(d => d.geolocation?.latitude && d.geolocation?.longitude);
                    const hasInteractiveMapHero = destinationsWithCoords.length > 0;
                    
                    if (hasDestinations && !hasInteractiveMapHero) {
                        const mapButton = document.createElement('button');
                        mapButton.className = 'wb-route-map-button';
                        mapButton.innerHTML = '<i class="fas fa-map-marked-alt"></i> Bekijk route op kaart';
                        mapButton.onclick = () => {
                            // Read destinations from timeline dynamically
                            const timelineDestinations = Array.from(canvas.querySelectorAll('.wb-travel-card.destination'))
                                .map(card => {
                                    const destData = destinations.find(d => 
                                        card.textContent.includes(d.name)
                                    );
                                    if (destData?.geolocation) {
                                        return {
                                            ...destData,
                                            latitude: destData.geolocation.latitude,
                                            longitude: destData.geolocation.longitude
                                        };
                                    }
                                    return null;
                                })
                                .filter(d => d !== null);
                            
                            if (timelineDestinations.length > 1) {
                                window.websiteBuilder.showRouteMap(timelineDestinations);
                            }
                        };
                        canvas.appendChild(mapButton);
                    }
                    
                    // Create timeline container
                    const timeline = document.createElement('section');
                    timeline.className = 'wb-component wb-travel-timeline';
                    timeline.setAttribute('data-component', 'travel-timeline');
                    
                    // Consolidate destinations by location (merge consecutive days)
                    const consolidatedDestinations = [];
                    destinations.forEach(dest => {
                        const existing = consolidatedDestinations.find(d => 
                            d.code === dest.code && d.toDay === dest.fromDay - 1
                        );
                        if (existing) {
                            // Extend existing destination
                            existing.toDay = dest.toDay;
                        } else {
                            // Add new destination
                            consolidatedDestinations.push({...dest});
                        }
                    });
                    
                    // Create timeline items with day property for sorting
                    const timelineItems = [];
                    
                    // Add transports
                    transports.forEach(transport => {
                        const firstSegment = transport.segment && transport.segment[0];
                        const departure = firstSegment?.departureAirportName || transport.originCode || '';
                        const arrival = firstSegment?.arrivalAirportName || transport.targetCode || '';
                        
                        timelineItems.push({
                            day: transport.day || 0,
                            type: 'transport',
                            data: {
                                departure,
                                arrival,
                                airline: transport.company || '',
                                flightNumber: transport.transportNumber || '',
                                departureTime: transport.departureTime || '',
                                arrivalTime: transport.arrivalTime || '',
                                duration: transport.duration || ''
                            }
                        });
                    });
                    
                    // Add transfers
                    transfers.forEach(transfer => {
                        const transferType = transfer.type === 'IN' ? 'Aankomst transfer' : 
                                           transfer.type === 'OUT' ? 'Vertrek transfer' : 
                                           transfer.productType || 'Transfer';
                        timelineItems.push({
                            day: transfer.day || 0,
                            type: 'transfer',
                            data: {
                                from: transfer.from?.name || 'Luchthaven',
                                to: transfer.to?.name || 'Hotel',
                                transferType: `${transferType} - ${transfer.vehicleType || 'Minibus'}`,
                                duration: transfer.duration || '30 minuten'
                            }
                        });
                    });
                    
                    // Translation mapping for common terms
                    const translations = {
                        // Facilities
                        'Free internet': 'Gratis internet',
                        'Swimming Pool': 'Zwembad',
                        'Coworking space': 'Coworking ruimte',
                        'Beach hotels': 'Strandhotels',
                        'Accessible parking': 'Toegankelijke parkeerplaats',
                        'Restaurant': 'Restaurant',
                        'Bar': 'Bar',
                        'Fitness center': 'Fitnesscentrum',
                        'Spa': 'Spa',
                        'Air conditioning': 'Airconditioning',
                        'Parking': 'Parkeren',
                        'WiFi': 'WiFi',
                        'Pool': 'Zwembad',
                        'Gym': 'Sportschool',
                        'Breakfast': 'Ontbijt',
                        'Room service': 'Roomservice',
                        'Concierge': 'Conciërge',
                        'Laundry': 'Wasservice',
                        'Safe': 'Kluis',
                        'Minibar': 'Minibar',
                        // Room types
                        'Guest Room': 'Standaard kamer',
                        'Standard Room': 'Standaard kamer',
                        'Deluxe Room': 'Deluxe kamer',
                        'Suite': 'Suite',
                        'Double Room': 'Tweepersoonskamer',
                        'Twin Room': 'Kamer met 2 aparte bedden',
                        'Family Room': 'Familiekamer',
                        // Meal plans
                        'BED AND BREAKFAST': 'Bed & Breakfast',
                        'HALF BOARD': 'Halfpension',
                        'FULL BOARD': 'Volpension',
                        'ALL INCLUSIVE': 'All-inclusive',
                        'ROOM ONLY': 'Alleen kamer'
                    };
                    
                    const translate = (text) => {
                        if (!text) return text;
                        return translations[text] || text;
                    };
                    
                    // Add hotels
                    hotels.forEach(hotel => {
                        // Get ALL hotel images (not just 5)
                        let hotelImages = [];
                        if (hotel.hotelData?.images?.length > 0) {
                            hotelImages = hotel.hotelData.images.map(img => img.url);
                        }
                        
                        // Get top facilities (max 6)
                        let facilities = [];
                        if (hotel.hotelData?.facilities?.otherFacilities) {
                            facilities = hotel.hotelData.facilities.otherFacilities
                                .filter(f => f.priority > 50)
                                .sort((a, b) => b.priority - a.priority)
                                .slice(0, 6)
                                .map(f => ({
                                    icon: f.icon || 'fa-regular fa-check',
                                    description: translate(f.description)
                                }));
                        }
                        
                        timelineItems.push({
                            day: hotel.day || 0,
                            type: 'hotel',
                            data: {
                                hotelName: hotel.hotelData?.name || hotel.name || 'Hotel',
                                stars: hotel.hotelData?.category?.replace('S', '') || hotel.stars || 3,
                                nights: hotel.nights || 1,
                                persons: hotel.pax || 2,
                                roomType: translate(hotel.roomTypes?.split(',')[0] || 'Standaard kamer'),
                                meals: translate(hotel.mealPlan || 'Ontbijt inbegrepen'),
                                description: hotel.hotelData?.description || '',
                                facilities: facilities,
                                images: hotelImages
                            }
                        });
                    });
                    
                    // Add consolidated destinations
                    consolidatedDestinations.forEach(destination => {
                        const days = destination.toDay - destination.fromDay + 1;
                        timelineItems.push({
                            day: destination.fromDay,
                            type: 'destination',
                            data: {
                                activityName: destination.name || 'Bestemming',
                                day: `Dag ${destination.fromDay}${destination.toDay !== destination.fromDay ? ` - ${destination.toDay}` : ''}`,
                                location: destination.country || '',
                                duration: days > 1 ? `${days} dagen` : '1 dag',
                                description: destination.description || '',
                                images: destination.imageUrls || []
                            }
                        });
                    });
                    
                    // Sort by day
                    timelineItems.sort((a, b) => a.day - b.day);
                    
                    // Add items to timeline with day headers
                    let currentDay = -1;
                    timelineItems.forEach((item, idx) => {
                        // Add day header if new day
                        if (item.day !== currentDay && item.day > 0) {
                            currentDay = item.day;
                            
                            // Find from/to locations for this day
                            let fromLocation = '';
                            let toLocation = '';
                            let distance = '';
                            let travelTime = '';
                            
                            // Get transport info for this day
                            const dayTransport = transports.find(t => t.day === currentDay);
                            if (dayTransport) {
                                const firstSegment = dayTransport.segment && dayTransport.segment[0];
                                fromLocation = firstSegment?.departureAirportName || dayTransport.originCode || '';
                                toLocation = firstSegment?.arrivalAirportName || dayTransport.targetCode || '';
                                travelTime = dayTransport.duration || '';
                            }
                            
                            // Get destination info for this day
                            const dayDestination = consolidatedDestinations.find(d => d.fromDay === currentDay);
                            if (dayDestination) {
                                if (!fromLocation && idx > 0) {
                                    // Use previous destination as from
                                    const prevDest = consolidatedDestinations.find(d => d.toDay === currentDay - 1);
                                    fromLocation = prevDest?.name || '';
                                }
                                toLocation = dayDestination.name || toLocation;
                                
                                // Check if there's distance/duration data (for road trips)
                                if (dayDestination.distance) {
                                    distance = dayDestination.distance;
                                }
                                if (dayDestination.duration && !travelTime) {
                                    travelTime = dayDestination.duration;
                                }
                            }
                            
                            const dayHeader = ComponentFactory.createComponent('travel-day-header', {
                                dayNumber: currentDay,
                                dayTitle: `Dag ${currentDay}`,
                                dayDescription: '',
                                fromLocation: fromLocation,
                                toLocation: toLocation,
                                distance: distance,
                                travelTime: travelTime,
                                destinations: destinationsWithCoords,
                                backgroundType: 'map'
                            });
                            if (dayHeader) timeline.appendChild(dayHeader);
                        }
                        
                        // Add item card
                        const card = ComponentFactory.createComponent(`travel-card-${item.type}`, item.data);
                        if (card) timeline.appendChild(card);
                    });

                    // OLD CODE BELOW - will be removed
                    const dummyDays = [];
                    dummyDays.forEach((day, dayIndex) => {
                        const dayNumber = dayIndex + 1;
                        const dayTitle = day.title || day.name || `Dag ${dayNumber}`;
                        const dayDesc = day.description || day.text || '';

                        // Add Day Header
                        const dayHeader = ComponentFactory.createComponent('travel-day-header', {
                            dayNumber: dayNumber,
                            dayTitle: dayTitle,
                            dayDescription: dayDesc
                        });
                        if (dayHeader) timeline.appendChild(dayHeader);

                        // Parse day items (transport, hotels, activities, transfers)
                        const items = day.items || [];
                        
                        // If no structured items, try to extract from day data
                        if (items.length === 0) {
                            // Check for transport
                            if (day.transport || day.flight) {
                                const transport = day.transport || day.flight;
                                const card = ComponentFactory.createComponent('travel-card-transport', {
                                    departure: transport.from || transport.departure || '',
                                    arrival: transport.to || transport.arrival || '',
                                    airline: transport.airline || transport.carrier || '',
                                    flightNumber: transport.flightNumber || transport.number || '',
                                    departureTime: transport.departureTime || '',
                                    arrivalTime: transport.arrivalTime || '',
                                    duration: transport.duration || '',
                                    price: transport.price ? `€ ${transport.price}` : '',
                                    priceLabel: 'per persoon'
                                });
                                if (card) timeline.appendChild(card);
                            }

                            // Check for transfer
                            if (day.transfer) {
                                const transfer = day.transfer;
                                const card = ComponentFactory.createComponent('travel-card-transfer', {
                                    from: transfer.from || 'Luchthaven',
                                    to: transfer.to || 'Hotel',
                                    transferType: transfer.type || 'Private transfer',
                                    duration: transfer.duration || '30 minuten',
                                    price: transfer.price ? `€ ${transfer.price}` : '',
                                    priceLabel: 'per rit'
                                });
                                if (card) timeline.appendChild(card);
                            }

                            // Check for hotel/accommodation
                            if (day.hotel || day.accommodation) {
                                const hotel = day.hotel || day.accommodation;
                                const card = ComponentFactory.createComponent('travel-card-hotel', {
                                    hotelName: hotel.name || 'Hotel',
                                    stars: hotel.stars || hotel.rating || 3,
                                    nights: hotel.nights || 1,
                                    persons: hotel.persons || 2,
                                    roomType: hotel.roomType || 'Standaard kamer',
                                    meals: hotel.meals || hotel.mealPlan || 'Ontbijt inbegrepen',
                                    price: hotel.price ? `€ ${hotel.price}` : '',
                                    priceLabel: 'totaal'
                                });
                                if (card) timeline.appendChild(card);
                            }

                            // Check for activities
                            if (day.activities && Array.isArray(day.activities)) {
                                day.activities.forEach(activity => {
                                    const card = ComponentFactory.createComponent('travel-card-destination', {
                                        activityName: activity.name || activity.title || 'Activiteit',
                                        day: `Dag ${dayNumber}`,
                                        location: activity.location || '',
                                        duration: activity.duration || '3 uur',
                                        includes: activity.includes || 'inclusief gids',
                                        price: activity.price ? `€ ${activity.price}` : '',
                                        priceLabel: 'per persoon'
                                    });
                                    if (card) timeline.appendChild(card);
                                });
                            }
                        } else {
                            // Process structured items
                            items.forEach(item => {
                                let card = null;
                                switch(item.type) {
                                    case 'transport':
                                    case 'flight':
                                        card = ComponentFactory.createComponent('travel-card-transport', {
                                            departure: item.data?.from || '',
                                            arrival: item.data?.to || '',
                                            airline: item.data?.airline || '',
                                            flightNumber: item.data?.flightNumber || '',
                                            departureTime: item.data?.departureTime || '',
                                            arrivalTime: item.data?.arrivalTime || '',
                                            duration: item.data?.duration || '',
                                            price: item.data?.price ? `€ ${item.data.price}` : '',
                                            priceLabel: 'per persoon'
                                        });
                                        break;
                                    case 'hotel':
                                    case 'accommodation':
                                        card = ComponentFactory.createComponent('travel-card-hotel', {
                                            hotelName: item.data?.name || 'Hotel',
                                            stars: item.data?.stars || 3,
                                            nights: item.data?.nights || 1,
                                            persons: item.data?.persons || 2,
                                            roomType: item.data?.roomType || 'Standaard kamer',
                                            meals: item.data?.meals || 'Ontbijt inbegrepen',
                                            price: item.data?.price ? `€ ${item.data.price}` : '',
                                            priceLabel: 'totaal'
                                        });
                                        break;
                                    case 'transfer':
                                        card = ComponentFactory.createComponent('travel-card-transfer', {
                                            from: item.data?.from || 'Luchthaven',
                                            to: item.data?.to || 'Hotel',
                                            transferType: item.data?.type || 'Private transfer',
                                            duration: item.data?.duration || '30 minuten',
                                            price: item.data?.price ? `€ ${item.data.price}` : '',
                                            priceLabel: 'per rit'
                                        });
                                        break;
                                    case 'activity':
                                    case 'destination':
                                        card = ComponentFactory.createComponent('travel-card-destination', {
                                            activityName: item.data?.name || 'Activiteit',
                                            day: `Dag ${dayNumber}`,
                                            location: item.data?.location || '',
                                            duration: item.data?.duration || '3 uur',
                                            includes: item.data?.includes || 'inclusief gids',
                                            price: item.data?.price ? `€ ${item.data.price}` : '',
                                            priceLabel: 'per persoon'
                                        });
                                        break;
                                }
                                if (card) timeline.appendChild(card);
                            });
                        }
                    });

                    canvas.appendChild(timeline);
                    console.log('[loadTravelIdea] Timeline added with TC data');
                } catch (e) {
                    console.error('Failed to create timeline', e);
                }
            } else {
                console.warn('[loadTravelIdea] No TC data found');
            }

            // 4. Add price/booking CTA if available
            if (price) {
                try {
                    const cta = ComponentFactory.createComponent('hero-banner-cta', {
                        title: 'Boek deze reis',
                        subtitle: `Vanaf ${price} ${currency}`,
                        buttonText: 'Boek nu',
                        buttonLink: '#contact'
                    });
                    if (cta) canvas.appendChild(cta);
                } catch (e) {
                    console.warn('Failed to create CTA', e);
                }
            }

            // Save to current page
            try {
                const cur = (this.pages || []).find(p => p.id === this.currentPageId) || (this.pages || [])[0] || null;
                if (cur) {
                    cur.html = canvas.innerHTML;
                    this.saveProject(true);
                }
            } catch (e) {
                console.warn('Failed to save', e);
            }

            // Show success message
            this.showNotification('✅ Reis geladen met Travel Cards!', 'success');

        } catch (e) {
            console.error('loadTravelIdea failed', e);
            this.showNotification('Fout bij laden van reis', 'error');
        }
    }

    setupBoltDeeplinkSave() {
        try {
            const saveBtn = document.getElementById('saveProjectBtn');
            if (!saveBtn) return;
            saveBtn.onclick = saveBtn.__wbSaveHandler = async (ev) => {
                try { window.WB_lastSaveDebug = { t: Date.now(), phase: 'click_start' }; console.debug('WB/save click'); } catch (e) {}
                try { ev.preventDefault(); } catch (e) {}
                // Re-entrancy guard: if previous save still running, ignore
                if (this._savingInFlight) { try { this.showNotification && this.showNotification('â³ Bezig met opslaanâ€¦', 'info'); } catch (e) {} return; }
                this._savingInFlight = true;
                try { this.markTyping && this.markTyping(600); } catch (e) {}
                const s = document.getElementById('pageSaveStatus'); if (s) s.textContent = 'Opslaanâ€¦';
                // UI: disable button and show spinner so user sees progress
                let prevHTML = null; let prevDisabled = false;
                try { prevHTML = saveBtn.innerHTML; prevDisabled = saveBtn.disabled; saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Opslaanâ€¦'; } catch (e) {}
                // Watchdog: if something hangs, auto-clear state after 12s
                let wd; try { wd = setTimeout(() => { try { this._savingInFlight = false; } catch (e) {} try { 
                    if (saveBtn) {
                        saveBtn.disabled = !!prevDisabled;
                        if (prevHTML != null) saveBtn.innerHTML = prevHTML;
                    }
                } catch (e) {} }, 12000); } catch (e) {}
                // Helper: enforce a hard timeout on any promise
                const withTimeout = (p, ms, label) => new Promise((resolve, reject) => {
                    let to = setTimeout(() => reject(new Error((label||'opdracht') + ' timeout')), ms);
                    Promise.resolve().then(() => p).then(v => { clearTimeout(to); resolve(v); }, e => { clearTimeout(to); reject(e); });
                });
                try {
                    const u = new URL(window.location.href);
                    // Template mode detection and fields from URL
                    const isTemplate = (u.searchParams.get('is_template') === 'true') || /template/i.test(u.searchParams.get('mode') || '');
                    const template_category = u.searchParams.get('template_category') || undefined;
                    const preview_image_url = u.searchParams.get('preview_image_url') || undefined;
                    const brand_id = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID;
                    const apiBase = (u.searchParams.get('api') || (window.BOLT_API && window.BOLT_API.baseUrl) || '');
                    const token = (u.searchParams.get('token') || window.CURRENT_TOKEN || '');
                    const apiKey = (u.searchParams.get('apikey') || u.searchParams.get('api_key') || (window.BOLT_API && window.BOLT_API.apiKey) || '');
                    try { window.WB_lastSaveDebug = Object.assign(window.WB_lastSaveDebug||{}, { creds: { brand: !!brand_id, api: !!apiBase, token: !!token, apikey: !!apiKey } }); console.debug('WB/save creds', window.WB_lastSaveDebug.creds); } catch (e) {}
                    if (!brand_id || !apiBase || !token || !apiKey) {
                        try { this.saveProject(true); } catch (e) {}
                        try { this.showNotification('âš ï¸ Lokaal opgeslagen (ontbrekende parameters voor remote opslaan)', 'warning'); } catch (e) {}
                        try { if (wd) clearTimeout(wd); } catch (e) {}
                        try { if (s) s.textContent = 'Opgeslagen'; } catch (e) {}
                        try { saveBtn.disabled = prevDisabled; if (prevHTML != null) saveBtn.innerHTML = prevHTML; } catch (e) {}
                        try { document.body.style.pointerEvents = 'auto'; const cvs=document.getElementById('canvas'); if (cvs) cvs.style.pointerEvents='auto'; } catch (e) {}
                        try { ['fatalOverlay','wbOverlay','errorOverlay'].forEach(id => { const el=document.getElementById(id); if (el){ el.style.display='none'; el.classList.remove('show'); el.style.pointerEvents='none'; } }); } catch (e) {}
                        try { this._savingInFlight = false; } catch (e) {}
                        try { this.setupBoltDeeplinkSave && this.setupBoltDeeplinkSave(); } catch (e) {}
                        return;
                    }

                    // Build content (on idle to avoid UI jank)
                    const awaitIdle = (cb, timeout=800) => new Promise((resolve) => {
                        try {
                            if (typeof window.requestIdleCallback === 'function') {
                                window.requestIdleCallback(() => resolve(cb()), { timeout });
                            } else {
                                setTimeout(() => resolve(cb()), 0);
                            }
                        } catch (e) { setTimeout(() => resolve(cb()), 0); }
                    });
                    const contentJson = await awaitIdle(() => (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : (this.getProjectData() || {}));
                    const htmlString = await awaitIdle(() => (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '');
                    // Ensure title/slug are present
                    const titleInput = document.getElementById('pageTitleInput');
                    const slugInput = document.getElementById('pageSlugInput');
                    const slugify = (s) => String(s || '')
                        .toLowerCase()
                        .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .slice(0, 80);
                    // Determine effective mode robustly: prefer Edge context kind, upgrade but never downgrade to page
                    let mode = (this._edgeCtx && this._edgeCtx.kind) ? this._edgeCtx.kind : ((typeof this.getCurrentMode === 'function') ? this.getCurrentMode() : 'page');
                    try {
                        const ct = (u.searchParams.get('content_type')||'').toLowerCase();
                        const hasNewsSlug = !!(u.searchParams.get('news_slug') || u.searchParams.get('slug'));
                        const hasPageId = !!u.searchParams.get('page_id');
                        if (mode !== 'news' && (ct === 'news_items' || (hasNewsSlug && !hasPageId))) mode = 'news';
                        if (mode !== 'destination' && (ct === 'destinations')) mode = 'destination';
                    } catch (e) {}

                    try { window.WB_lastSaveDebug = Object.assign(window.WB_lastSaveDebug||{}, { mode }); console.debug('WB/save mode/helpers', mode, { pages: !!(window.BuilderPublishAPI&&window.BuilderPublishAPI.saveDraft), news: !!(window.BuilderPublishAPI&&window.BuilderPublishAPI.news), dest: !!(window.BuilderPublishAPI&&window.BuilderPublishAPI.destinations) }); } catch (e) {}
                    const defaultTitle = (mode === 'page') ? 'Pagina' : (mode === 'destination' ? 'Bestemming' : 'Nieuws');
                    let safeTitle = (contentJson.title || titleInput?.value || defaultTitle).toString();
                    // Prefer the H1 from the news-article block when in news mode
                    if (mode === 'news') {
                        try {
                            const h1 = document.querySelector('.na-title');
                            const t = (h1 && h1.textContent) ? h1.textContent.trim() : '';
                            console.debug('[WB/save] News title detection', { h1Found: !!h1, h1Text: t, fallbackTitle: safeTitle });
                            if (t) safeTitle = t;
                        } catch (e) {
                            console.warn('[WB/save] Error detecting news title', e);
                        }
                    }
                    const safeSlug = slugify(contentJson.slug || slugInput?.value || safeTitle);
                    contentJson.title = safeTitle;
                    contentJson.slug = safeSlug;
                    // Always save locally as baseline (even when remote is available)
                    try { this.saveProject(true); } catch (e) {}
                    // If remote helper is not ready yet (publish.js still loading), wait briefly and retry
                    if (!window.BuilderPublishAPI) {
                        const waitFor = async (ms) => new Promise(r=>setTimeout(r, ms));
                        let ready = false;
                        for (let i=0;i<10;i++) { // up to ~2s
                            if (window.BuilderPublishAPI) { ready = true; break; }
                            await waitFor(200);
                        }
                        if (!ready) {
                            this.saveProject(true);
                            this.showNotification('ðŸ’¾ Lokaal opgeslagen (publish helper nog niet geladen)', 'info');
                            try { if (wd) clearTimeout(wd); } catch (e) {}
                            try { if (s) s.textContent = 'Opgeslagen'; } catch (e) {}
                            try { saveBtn.disabled = prevDisabled; if (prevHTML != null) saveBtn.innerHTML = prevHTML; } catch (e) {}
                            try { document.body.style.pointerEvents = 'auto'; } catch (e) {}
                            try { const cvs = document.getElementById('canvas'); if (cvs) cvs.style.pointerEvents = 'auto'; } catch (e) {}
                            try { ['fatalOverlay','wbOverlay','errorOverlay'].forEach(id => { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.classList.remove('show'); el.style.pointerEvents = 'none'; } }); } catch (e) {}
                            try { document.querySelectorAll('.wb-overlay,.wb-busy,.wb-blocker,.modal,.modal-backdrop').forEach(el => { el.style.pointerEvents = 'none'; el.classList.remove('show'); el.style.display = 'none'; }); } catch (e) {}
                            // Fallback: if header re-rendered the button, re-query and reset
                            try {
                                const curBtn = document.getElementById('saveProjectBtn');
                                if (curBtn) { curBtn.disabled = false; if (!prevHTML) curBtn.textContent = 'Opslaan'; }
                            } catch (e) {}
                            // Rebind save handler in case node was replaced
                            try { this.setupBoltDeeplinkSave && this.setupBoltDeeplinkSave(); } catch (e) {}
                            try { this._savingInFlight = false; } catch (e) {}
                            return;
                        }
                    }

                    if (mode === 'news' && window.BuilderPublishAPI.news) {
                        // Author attribution: required by content-api
                        const author_type = (u.searchParams.get('author_type') || window.CURRENT_AUTHOR_TYPE || '').trim();
                        const author_id = (u.searchParams.get('author_id') || u.searchParams.get('user_id') || window.CURRENT_USER_ID || '').toString();
                        // Preserve identity to UPDATE instead of INSERT
                        const existingId = (u.searchParams.get('news_id') || u.searchParams.get('id') || '').trim();
                        const existingSlug = (u.searchParams.get('news_slug') || u.searchParams.get('slug') || '').trim();
                        await window.BuilderPublishAPI.news.saveDraft({
                            brand_id,
                            id: existingId || undefined,
                            title: safeTitle,
                            // If we have an id, backend can match by id; otherwise prefer existingSlug>safeSlug to target the same item
                            slug: existingId ? undefined : (existingSlug || safeSlug),
                            content: { json: contentJson, html: htmlString },
                            status: 'draft',
                            author_type: author_type || undefined,
                            author_id: author_id || undefined
                        });
                        this.showNotification('ðŸ“° Concept opgeslagen (Nieuws)', 'success');
                        try { if (window.handleReturnUrl) window.handleReturnUrl(); } catch (e) {}
                    } else if ((mode === 'destination' || mode === 'destinations') && window.BuilderPublishAPI.destinations) {
                        await window.BuilderPublishAPI.destinations.saveDraft({
                            brand_id,
                            title: safeTitle,
                            slug: safeSlug,
                            content: { json: contentJson, html: htmlString },
                            status: 'draft'
                        });
                        this.showNotification('ðŸ—ºï¸ Concept opgeslagen (Bestemming)', 'success');
                        try { if (window.handleReturnUrl) window.handleReturnUrl(); } catch (e) {}
                    } else if (mode === 'page' && window.BuilderPublishAPI.saveDraft) {
                        // Pages & Templates: save draft JSON
                        let page = null;
                        try {
                            page = await withTimeout(
                                window.BuilderPublishAPI.saveDraft({
                                    brand_id,
                                    page_id: (u.searchParams.get('page_id') || this.currentPageId || undefined),
                                    title: safeTitle,
                                    slug: safeSlug,
                                    content_json: contentJson,
                                    is_template: isTemplate || undefined,
                                    template_category,
                                    preview_image_url
                                }),
                                8000,
                                'saveDraft'
                            );
                        } catch (eSD) {
  this.showNotification('⚠️ Concept opslaan duurde te lang of faalde; lokaal opgeslagen', 'warning');
  try { this.saveProject(true); } catch (e) {}
}

// Publish only for normal pages (not for templates)
const pageHtml = (typeof window.exportBuilderAsHTML === 'function')
  ? window.exportBuilderAsHTML(contentJson)
  : '';

let published = false;
if (!isTemplate && page && !this._disablePublish) {
  try {
    await withTimeout(
      window.BuilderPublishAPI.publishPage(page.id, pageHtml),
      8000,
      'publish'
    );
    published = true;
  } catch (ePublish) {
    const em = String((ePublish && ePublish.message) || ePublish || '').toLowerCase();
    if (em.includes('401') || em.includes('403')) {
      this.showNotification('⚠️ Publiceren niet toegestaan; concept opgeslagen.', 'warning');
    } else if (em.includes('timeout')) {
      this.showNotification('⚠️ Publiceren timeout; concept staat wel opgeslagen.', 'warning');
    } else {
      this.showNotification('⚠️ Publiceren mislukt; concept opgeslagen.', 'warning');
    }
  }
}

this.showNotification(
  isTemplate
    ? '🧩 Template opgeslagen'
    : (published ? '📣 Pagina opgeslagen en gepubliceerd' : '💾 Concept opgeslagen (Pagina)'),
  'success'
);
// Return URL: redirect na succesvol opslaan
try { if (window.handleReturnUrl) window.handleReturnUrl(); } catch (e) {}
}
} catch (e) {}


try {
  if (saveBtn) {
    saveBtn.disabled = !!prevDisabled;
    if (prevHTML != null) saveBtn.innerHTML = prevHTML;
  }
} catch (e) {}

};
} catch (e) {}

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
                    this.showNotification('ðŸ’¾ Project gedownload (.wbproj)', 'success');
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
                    this.showNotification('ðŸ“‚ Project geladen uit bestand', 'success');
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
        try { this.showNotification(`âŒ ${message}`, 'error'); } catch (e) { try { console.error(message); } catch (e) {} }
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
            try { this.saveProject(true); } catch (e) {}
            this.showNotification('ðŸŽ¨ Layout bijgewerkt', 'success');
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
                this.showNotification('âœ… Wijzigingen naar GitHub gepusht', 'success');
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
                    this.showNotification('ðŸ“‹ Commando gekopieerd', 'success');
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
        try { this.saveProject(true); } catch (e) {}
        this.showNotification('ðŸ“‚ Project geladen', 'success');
    }
}

// Initialize Website Builder when DOM is ready
// Return URL helpers
window.handleReturnUrl = function() {
    try {
        const returnUrlRaw = localStorage.getItem('builder_return_url');
        if (!returnUrlRaw) {
            console.log('[ReturnURL] Geen return URL gevonden');
            return false;
        }

        // Valideer return URL
        const isValidReturnUrl = (url) => {
            try {
                const parsedUrl = new URL(url);
                // Sta alle domains toe (BOLT kan op verschillende domains draaien)
                // Je kunt hier optioneel een whitelist toevoegen
                return true;
            } catch {
                return false;
            }
        };

        const returnUrl = decodeURIComponent(returnUrlRaw);
        if (isValidReturnUrl(returnUrl)) {
            console.log('[ReturnURL] Redirecting naar:', returnUrl);
            localStorage.removeItem('builder_return_url');
            
            // Kleine delay voor gebruiker om succes melding te zien
            setTimeout(() => {
                window.location.href = returnUrl;
            }, 800);
            
            return true;
        } else {
            console.warn('[ReturnURL] Ongeldige URL:', returnUrl);
            localStorage.removeItem('builder_return_url');
            return false;
        }
    } catch (e) {
        console.error('[ReturnURL] Fout bij redirect:', e);
        return false;
    }
};

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
    console.error('ðŸ’¥ JavaScript fout:', event.error);
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

console.log('🎯 Website Builder geladen! Gebruik wb.save(), wb.export(), etc. in de console.');
console.log('✨ OpenAI API integration fixed (v1.3 - Public repo)');
