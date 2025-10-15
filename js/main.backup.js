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
                        btn.disabled = true; const prev = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> PublicerenÃ¢â‚¬Â¦';
                        try {
                            const res = await window.BuilderPublishAPI.news.publish({ brand_id, id: id || undefined, slug: id ? undefined : (slug || undefined) });
                            // Compact messaging per requirement
                            let msg = 'Ã°Å¸“Â£ Nieuws gepubliceerd';
                            const isAdmin = (res && (res.kind === 'admin' || res.author_type === 'admin'));
                            if (isAdmin && res && res.assignment_updated === true) {
                                msg = 'Ã°Å¸“Â£ Gepubliceerd en toegewezen aan brand';
                            } else if (res && typeof res.message === 'string' && res.message.trim()) {
                                msg = `Ã°Å¸“Â£ ${res.message.trim()}`;
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
                            if (t === 'importeer tc' || t === "pagina's" || t === 'paginas' || t === 'nieuwe pagina' || t === 'paginaÃ¢â‚¬â„¢s') {
                                el.style.display = 'none';
                            }
                        });
                    } catch (e) {}

                    // Insert mini menu if missing
                    const headerRight = document.querySelector('.app-header .header-right');
                    if (headerRight && !document.getElementById('topModeSelect')){
                        const wrap = document.createElement('div');
                        wrap.style.cssText='display:flex;align-items:center;gap:8px';
                        const lbl = document.createElement('label'); lbl.textContent = 'Bouwtype'; lbl.style.cssText='color:#f8fafc;font-size:12px;opacity:.9;';
                        const sel = document.createElement('select'); sel.id='topModeSelect'; sel.className='form-control';
                        sel.innerHTML = '<option value="page">Web pagina</option><option value="travel">Reizen</option><option value="news">Nieuwsartikel</option><option value="destination">Bestemmingspagina</option><option value="menu">Menu & footer</option>';
                        wrap.appendChild(lbl); wrap.appendChild(sel);
                        headerRight.insertBefore(wrap, headerRight.firstChild);
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
            bar.innerHTML = `Ã¢Å¡Â Ã¯Â¸Â Opslaan naar server uitgeschakeld. Ontbrekende parameters: <strong>${res.missing.join(', ')}</strong>. Open de builder via een deeplink met deze query parameters.`;
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

            // Default gallery placeholders
            const images = Array.isArray(options.images) && options.images.length ? options.images : [
                'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1600&auto=format&fit=crop'
            ];

            // Clear canvas
            canvas.innerHTML = '';

            // 0) Agent notice: land-invoer + AI-knop
            let note = null;
            try {
                note = document.createElement('section');
                note.className = 'wb-admin-note';
                note.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:10px 14px;border:1px dashed #f59e0b;border-radius:10px;background:#fff7ed;color:#7c2d12;display:flex;gap:8px;align-items:center;">
                    <i class="fas fa-info-circle" style="color:#f59e0b;"></i>
                    <div style="font-weight:700;">Vul het land en genereer de teksten met AI</div>
                    <input id="destCountryInput" class="form-control" type="text" placeholder="Bijv. Japan" value="" style="max-width:220px; margin-left:8px;" />
                    <button id="aiCountryBtn" class="btn btn-primary"><i class="fas fa-wand-magic-sparkles"></i> AI-landen teksten</button>
                    <div style="margin-left:auto;font-size:12px;color:#9a3412;">De AI vult Intro, Hoogtepunten, Activiteiten en Extra tekst</div>
                  </div>`;
                canvas.appendChild(note);
            } catch (e) {}

            // 1) Hero
            try {
                const hero = ComponentFactory.createComponent('hero-page', {
                    wordText: country.toUpperCase(),
                    height: '380px',
                    overlayOpacity: 0.4
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

            // 3) Highlights (2x3) simple two-column lists scaffold
            try {
                highlights = document.createElement('section');
                highlights.className = 'wb-block';
                highlights.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:8px 16px;">
                    <h2 style="margin:0 0 8px;">Hoogtepunten</h2>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                      <ul style="margin:0;padding-left:20px;">
                        <li>Hoogtepunt 1</li>
                        <li>Hoogtepunt 2</li>
                        <li>Hoogtepunt 3</li>
                      </ul>
                      <ul style="margin:0;padding-left:20px;">
                        <li>Hoogtepunt 4</li>
                        <li>Hoogtepunt 5</li>
                        <li>Hoogtepunt 6</li>
                      </ul>
                    </div>
                  </div>`;
                highlights.dataset.role = 'highlights';
                canvas.appendChild(highlights);
            } catch (e) { console.warn('Destination highlights failed', e); }

            // 4) Activities (2x3) simple cards
            try {
                activities = document.createElement('section');
                activities.className = 'wb-block';
                activities.innerHTML = `
                  <div style="max-width:1100px;margin:0 auto;padding:8px 16px;">
                    <h2 style="margin:0 0 8px;">Activiteiten</h2>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                      ${[1,2,3,4,5,6].map(i=>`
                        <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;box-shadow:0 6px 16px rgba(0,0,0,.04);">
                          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><i class="fas fa-star" style="color:#f59e0b;"></i><strong>Activiteit ${i}</strong></div>
                          <div style="color:#475569;font-size:14px;">Korte beschrijving van de activiteit.</div>
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
            this.persistPagesToLocalStorage();
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
                        // Intro
                        if (content) {
                            const r = await window.BuilderAI.generate('intro', { country: c, language: 'nl' });
                            const text = r?.intro?.text || '';
                            const bodyEl = content.querySelector('.cf-body');
                            if (bodyEl && text) bodyEl.innerHTML = `<p>${text.replace(/\n+/g,'</p><p>')}</p>`;
                            const tEl = content.querySelector('.cf-title'); if (tEl) tEl.textContent = `Over ${c}`;
                        }
                        // Highlights (6)
                        if (highlights) {
                            const r = await window.BuilderAI.generate('highlights', { country: c, language: 'nl', count: 6 });
                            const arr = Array.isArray(r?.highlights) ? r.highlights : [];
                            const uls = highlights.querySelectorAll('ul');
                            const a = uls[0], b = uls[1];
                            if (a && b && arr.length) {
                                const left = arr.slice(0,3).map(x=>`<li>${x.title || x.summary || ''}</li>`).join('');
                                const right = arr.slice(3,6).map(x=>`<li>${x.title || x.summary || ''}</li>`).join('');
                                a.innerHTML = left || a.innerHTML;
                                b.innerHTML = right || b.innerHTML;
                            }
                        }
                        // Activities (6)
                        if (activities) {
                            const r = await window.BuilderAI.generate('activities', { country: c, language: 'nl', count: 6 });
                            const arr = Array.isArray(r?.activities) ? r.activities : [];
                            const cardsWrap = activities.querySelector('[style*="grid-template-columns"]');
                            if (cardsWrap && arr.length) {
                                cardsWrap.innerHTML = arr.slice(0,6).map(it=>`
                                  <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;box-shadow:0 6px 16px rgba(0,0,0,.04);">
                                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><i class="fas ${it.icon || 'fa-star'}" style="color:#f59e0b;"></i><strong>${it.title || ''}</strong></div>
                                    <div style="color:#475569;font-size:14px;">${it.summary || ''}</div>
                                  </div>`).join('');
                            }
                        }
                        // Extra text
                        if (extraBlock) {
                            const r = await window.BuilderAI.generate('extra', { country: c, language: 'nl' });
                            const text = r?.extra?.text || '';
                            const bodyEl = extraBlock.querySelector('.cf-body');
                            if (bodyEl && text) bodyEl.innerHTML = `<p>${text.replace(/\n+/g,'</p><p>')}</p>`;
                        }
                        // Gallery captions (best effort)
                        if (gallery) {
                            const imgs = gallery.querySelectorAll('img');
                            const arrImgs = Array.from(imgs);
                            if (arrImgs.length) {
                                const r = await window.BuilderAI.generate('gallery_captions', { country: c, language: 'nl', images: arrImgs.map(()=>({})) });
                                const caps = Array.isArray(r?.gallery_captions) ? r.gallery_captions : [];
                                arrImgs.forEach((im, i) => { const cap = caps[i]?.caption || ''; if (cap) { im.alt = cap; im.title = cap; } });
                            }
                        }
                    } catch (_) { alert('AI genereren mislukt.'); }
                    finally { btn.disabled = false; btn.innerHTML = oldTxt; }
                };
            } catch (e) {}

            this.showNotification('Ã°Å¸””ÂºÃ¯Â¸Â Bestemmingspagina template toegevoegd. Vul het land en klik op AI-landen teksten voor automatische vulling.', 'success');
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
            this.persistPagesToLocalStorage(true);
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
            this.persistPagesToLocalStorage();
            try { this.saveProject(true); } catch (e) {}

            this.showNotification('Ã°Å¸“Â° Nieuwsartikel template toegevoegd. Je kunt nu verder bewerken.', 'success');
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
                this.insertTcBlocks(data);
                this.showNotification('Ã¢Å“… TC-content geÃƒÂ¯mporteerd', 'success');
                this.saveProject(true);
            } catch (e) {
                console.warn('TC import failed', e);
                this.showNotification('Ã¢ÂÅ’ Importeren mislukt', 'error');
            }
        });
    }

    setupBoltDeeplinkSave() {
        try {
            const saveBtn = document.getElementById('saveProjectBtn');
            if (!saveBtn) return;
            saveBtn.onclick = saveBtn.__wbSaveHandler = async (ev) => {
                try { window.WB_lastSaveDebug = { t: Date.now(), phase: 'click_start' }; console.debug('WB/save click'); } catch (e) {}
                try { ev.preventDefault(); } catch (e) {}
                // Re-entrancy guard: if previous save still running, ignore
                if (this._savingInFlight) { try { this.showNotification && this.showNotification('Ã¢Â⏳ Bezig met opslaanÃ¢â‚¬Â¦', 'info'); } catch (e) {} return; }
                this._savingInFlight = true;
                try { this.markTyping && this.markTyping(600); } catch (e) {}
                const s = document.getElementById('pageSaveStatus'); if (s) s.textContent = 'OpslaanÃ¢â‚¬Â¦';
                // UI: disable button and show spinner so user sees progress
                let prevHTML = null; let prevDisabled = false;
                try { prevHTML = saveBtn.innerHTML; prevDisabled = saveBtn.disabled; saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> OpslaanÃ¢â‚¬Â¦'; } catch (e) {}
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
                        try { this.showNotification('Ã¢Å¡Â Ã¯Â¸Â Lokaal opgeslagen (ontbrekende parameters voor remote opslaan)', 'warning'); } catch (e) {}
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
                            if (t) safeTitle = t;
                        } catch (e) {}
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
                            this.showNotification('Ã°Å¸’Â¾ Lokaal opgeslagen (publish helper nog niet geladen)', 'info');
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
                        this.showNotification('Ã°Å¸“Â° Concept opgeslagen (Nieuws)', 'success');
                    } else if ((mode === 'destination' || mode === 'destinations') && window.BuilderPublishAPI.destinations) {
                        await window.BuilderPublishAPI.destinations.saveDraft({
                            brand_id,
                            title: safeTitle,
                            slug: safeSlug,
                            content: { json: contentJson, html: htmlString },
                            status: 'draft'
                        });
                        this.showNotification('Ã°Å¸””ÂºÃ¯Â¸Â Concept opgeslagen (Bestemming)', 'success');
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
  this.showNotification('⚠️ Concept opslaan duurde te lang of faalde; lokaal opgeslagen', 'warning');
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
      this.showNotification('⚠️ Publiceren niet toegestaan; concept opgeslagen.', 'warning');
    } else if (em.includes('timeout')) {
      this.showNotification('⚠️ Publiceren timeout; concept staat wel opgeslagen.', 'warning');
    } else {
      this.showNotification('⚠️ Publiceren mislukt; concept opgeslagen.', 'warning');
    }
  }
}

this.showNotification(
  isTemplate
    ? 'ðŸ§© Template opgeslagen'
    : (published ? 'ðŸ“£ Pagina opgeslagen en gepubliceerd' : 'ðŸ’¾ Concept opgeslagen (Pagina)'),
  'success'
);

// Close the big try that started around line 695
}
} catch (e) {}

// UI reset after save attempt
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
} catch (e) {}

};

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
