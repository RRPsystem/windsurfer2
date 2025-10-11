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
                try { stack.push(cur[k]); } catch {}
            }
        }
    } catch {}
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
                        this.showNotification('🔗 Navigeren is uitgeschakeld in de editor (gebruik Preview).', 'info');
                        setTimeout(() => { canvas.__wb_linkHintShown = false; }, 4000);
                    }
                } catch {}
            }, true);
        } catch {}
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
                        btn.disabled = true; const prev = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publiceren…';
                        try {
                            const res = await window.BuilderPublishAPI.news.publish({ brand_id, id: id || undefined, slug: id ? undefined : (slug || undefined) });
                            // Compact messaging per requirement
                            let msg = '📣 Nieuws gepubliceerd';
                            const isAdmin = (res && (res.kind === 'admin' || res.author_type === 'admin'));
                            if (isAdmin && res && res.assignment_updated === true) {
                                msg = '📣 Gepubliceerd en toegewezen aan brand';
                            } else if (res && typeof res.message === 'string' && res.message.trim()) {
                                msg = `📣 ${res.message.trim()}`;
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
        } catch {}
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
            } catch {}
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
                            if (t === 'importeer tc' || t === "pagina's" || t === 'paginas' || t === 'nieuwe pagina' || t === 'pagina’s') {
                                el.style.display = 'none';
                            }
                        });
                    } catch {}

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
                            try { localStorage.setItem('wb_mode', mode); } catch {}
                            try { if (!hashMode) location.hash = '#/mode/' + mode; } catch {}
                            // Ensure publish button visibility according to mode
                            try { this.ensureNewsPublishButton(mode); } catch {}
                        } catch {}
                        sel.onchange = () => {
                            try {
                                localStorage.setItem('wb_mode', sel.value);
                                location.hash = '#/mode/' + sel.value;
                                // If user selects Destination in the mini menu, scaffold immediately
                                if (sel.value === 'destination' && window.websiteBuilder && typeof window.websiteBuilder.startDestinationScaffold === 'function') {
                                    // Slight delay to let hash update propagate
                                    setTimeout(() => { try { window.websiteBuilder.startDestinationScaffold(); } catch {} }, 50);
                                }
                                // Toggle publish button based on current mode
                                try { this.ensureNewsPublishButton(sel.value); } catch {}
                            } catch {}
                        };
                    }

                    // Ensure save handler is bound correctly each time
                    try { this.setupBoltDeeplinkSave(); } catch {}
                    // Ensure publish button exists/visibility updated
                    try {
                        const curMode = (document.getElementById('topModeSelect')||{}).value || this.getCurrentMode();
                        this.ensureNewsPublishButton(curMode);
                    } catch {}
                    // Diagnostics: validate runtime and surface missing params
                    try { this.showDiagnosticsBanner(); } catch {}
                } catch {}
            };

            apply();
            // Observe header for changes and re-apply (debounced to prevent loops while typing)
            try {
                const header = document.querySelector('.app-header');
                if (header) {
                    if (this._headerMO) { try { this._headerMO.disconnect(); } catch {} }
                    let t = null;
                    this._headerMO = new MutationObserver(() => {
                        try { if (t) clearTimeout(t); } catch {}
                        t = setTimeout(() => { try { apply(); } catch {} }, 150);
                    });
                    // Keep subtree true but avoid attribute storm; childList changes are enough
                    this._headerMO.observe(header, { childList: true, subtree: true, attributes: false });
                }
            } catch {}
        } catch {}
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
        } catch {
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
            try { if (btn) btn.disabled = false; } catch {}
            let bar = document.getElementById(diagId);
            if (!bar) {
                bar = document.createElement('div');
                bar.id = diagId;
                bar.style.cssText = 'margin:10px 16px;padding:8px 12px;border:1px dashed #ef4444;background:#fef2f2;color:#991b1b;border-radius:8px;';
                const cont = document.querySelector('#canvas')?.parentElement || document.body;
                cont.insertBefore(bar, cont.firstChild);
            }
            bar.innerHTML = `⚠️ Opslaan naar server uitgeschakeld. Ontbrekende parameters: <strong>${res.missing.join(', ')}</strong>. Open de builder via een deeplink met deze query parameters.`;
        } else {
            try { if (btn) btn.disabled = false; } catch {}
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
            } catch {}

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

            try { this.reattachEventListeners(); } catch {}
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch {}
            this.persistPagesToLocalStorage();
            try { this.saveProject(true); } catch {}

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
            } catch {}

            this.showNotification('🗺️ Bestemmingspagina template toegevoegd. Vul het land en klik op AI-landen teksten voor automatische vulling.', 'success');
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
            try { this.reattachEventListeners(); } catch {}

            // Sync meta inputs in header and save
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch {}
            this.persistPagesToLocalStorage();
            try { this.saveProject(true); } catch {}

            this.showNotification('📰 Nieuwsartikel template toegevoegd. Je kunt nu verder bewerken.', 'success');
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
                this.showNotification('✅ TC-content geïmporteerd', 'success');
                this.saveProject(true);
            } catch (e) {
                console.warn('TC import failed', e);
                this.showNotification('❌ Importeren mislukt', 'error');
            }
        });
    }

    // Attach a robust save handler that respects deeplink context
    setupBoltDeeplinkSave() {
        try {
            const saveBtn = document.getElementById('saveProjectBtn');
            if (!saveBtn) return;
            saveBtn.onclick = async () => {
                try {
                    // Preflight: ensure required params are present
                    const check = this.validateRuntimeParams();
                    if (!check.ok) {
                        this.showDiagnosticsBanner();
                        this.showNotification(`❌ Opslaan geblokkeerd. Ontbrekende parameters: ${check.missing.join(', ')}`, 'error');
                        return;
                    }
                    const u = new URL(window.location.href);
                    const brand_id = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID;
                    if (!brand_id) throw new Error('brand_id ontbreekt');

                    // Build content
                    const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : (this.getProjectData() || {});
                    const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '';
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
                    } catch {}

                    const defaultTitle = (mode === 'page') ? 'Pagina' : (mode === 'destination' ? 'Bestemming' : 'Nieuws');
                    let safeTitle = (contentJson.title || titleInput?.value || defaultTitle).toString();
                    // Prefer the H1 from the news-article block when in news mode
                    if (mode === 'news') {
                        try {
                            const h1 = document.querySelector('.na-title');
                            const t = (h1 && h1.textContent) ? h1.textContent.trim() : '';
                            if (t) safeTitle = t;
                        } catch {}
                    }
                    const safeSlug = slugify(contentJson.slug || slugInput?.value || safeTitle);
                    contentJson.title = safeTitle;
                    contentJson.slug = safeSlug;
                    // Always save locally as baseline (even when remote is available)
                    try { this.saveProject(true); } catch {}
                    // If remote helper is missing, fallback to local save.
                    // Note: Edge may be disabled for auto-sync in deeplink, but manual Save should still publish via BuilderPublishAPI.
                    if (!window.BuilderPublishAPI) {
                        this.saveProject(true);
                        this.showNotification('💾 Lokaal opgeslagen (remote helper niet geladen)', 'info');
                        return;
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
                        this.showNotification('📰 Concept opgeslagen (Nieuws)', 'success');
                    } else if ((mode === 'destination' || mode === 'destinations') && window.BuilderPublishAPI.destinations) {
                        await window.BuilderPublishAPI.destinations.saveDraft({
                            brand_id,
                            title: safeTitle,
                            slug: safeSlug,
                            content: { json: contentJson, html: htmlString },
                            status: 'draft'
                        });
                        this.showNotification('🗺️ Concept opgeslagen (Bestemming)', 'success');
                    } else if (mode === 'page' && window.BuilderPublishAPI.saveDraft) {
                        // Pages: save draft JSON, then publish HTML so edit opens with content
                        const page = await window.BuilderPublishAPI.saveDraft({ brand_id, title: safeTitle, slug: safeSlug, content_json: contentJson });
                        try { await window.BuilderPublishAPI.publishPage(page.id, htmlString); } catch {}
                        this.showNotification('📝 Pagina opgeslagen en gepubliceerd', 'success');
                    } else {
                        // Fallback: if pages helper exists use it; otherwise local save
                        if (window.BuilderPublishAPI && typeof window.BuilderPublishAPI.saveDraft === 'function') {
                            await window.BuilderPublishAPI.saveDraft({ brand_id, title: safeTitle, slug: safeSlug, content_json: contentJson });
                            this.showNotification('💾 Concept opgeslagen (Bolt-draft)', 'success');
                        } else {
                            this.saveProject(true);
                            this.showNotification('💾 Lokaal opgeslagen (geen remote helper)', 'info');
                        }
                    }
                } catch (e) {
                    console.warn('Draft opslaan mislukt:', e?.message||e);
                    // Fallbacks: try direct POST; if that fails, ensure local save
                    try {
                        const url = new URL(window.location.href);
                        const api = (url.searchParams.get('api') || '').replace(/\/$/, '');
                        const token = url.searchParams.get('token') || '';
                        const apiKeyHeader = url.searchParams.get('apikey') || url.searchParams.get('api_key') || '';
                        if (api && token) {
                            const qs = new URLSearchParams();
                            qs.set('type', (url.searchParams.get('content_type')||'news_items'));
                            const apiUrl = `${api}/functions/v1/content-api/save?${qs.toString()}`;
                            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                            if (apiKeyHeader) headers['apikey'] = apiKeyHeader;
                            const body = {
                                brand_id: (url.searchParams.get('brand_id') || window.CURRENT_BRAND_ID),
                                title: (contentJson.title),
                                slug: (contentJson.slug),
                                content: { json: contentJson, html: (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '' },
                                status: 'draft'
                            };
                            await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
                            this.showNotification('💾 Concept opgeslagen (Edge fallback)', 'success');
                            return;
                        }
                    } catch {}
                    // Final fallback: local save
                    try { this.saveProject(true); } catch {}
                    this.showNotification('💾 Lokaal opgeslagen (remote opslaan mislukt)', 'warning');
                }
            };
        } catch {}
    }

    insertTcBlocks(tc) {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const safe = (s) => (s || '').toString();
        const title = safe(tc.title || tc.name || 'Reis');
        const desc = safe(tc.description || '');
        const gallery = Array.isArray(tc.gallery) ? tc.gallery : (Array.isArray(tc.images) ? tc.images : []);
        const days = Array.isArray(tc.itinerary) ? tc.itinerary : (Array.isArray(tc.days) ? tc.days : []);
        const images = Array.isArray(tc.images) ? tc.images : [];
        const cover = (tc.thumb || images[0] || '');

        // Hero block (simple)
        const heroHtml = `
          <section class="wb-block hero" style="padding:48px 16px;background:linear-gradient(135deg,#eef2ff,#ecfeff);border-radius:14px;">
            <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.2fr 1fr;gap:18px;align-items:center;">
              <div>
                <h1 style="font-size:36px;margin:0 0 10px;">${title}</h1>
                <p style="color:#4b5563;font-size:16px;">${desc}</p>
              </div>
              ${cover?`<img src="${cover}" alt="${title}" style="width:100%;height:260px;object-fit:cover;border-radius:12px;"/>`:''}
            </div>
          </section>`;

        // Gallery block (up to 6)
        const gal = (gallery || images).slice(0, 6);
        const galleryHtml = gal.length ? `
          <section class="wb-block gallery">
            <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
              ${gal.map(u=>`<img src="${u}" style="width:100%;height:180px;object-fit:cover;border-radius:10px;"/>`).join('')}
            </div>
          </section>` : '';

        // Itinerary block (accordion)
        const itHtml = days.length ? `
          <section class="wb-block itinerary">
            <div style="max-width:900px;margin:0 auto;">
              <h2 style="font-size:24px;">Dag-tot-dag</h2>
              <div class="wb-accordion">
                ${days.map((d,idx)=>{
                    const t = safe(d.title || d.name || `Dag ${idx+1}`);
                    const txt = safe(d.text || d.description || '');
                    return `
                    <details ${idx===0?'open':''} style="border:1px solid #e5e7eb;border-radius:10px;padding:10px;margin:10px 0;background:#fff;">
                      <summary style="font-weight:600;cursor:pointer;">Dag ${d.day||idx+1}: ${t}</summary>
                      <div style="color:#374151;margin-top:8px;">${txt}</div>
                    </details>`;
                }).join('')}
              </div>
            </div>
          </section>` : '';

        // Append blocks
        canvas.insertAdjacentHTML('beforeend', heroHtml + galleryHtml + itHtml);
    }

    // ---------- Page Title/Slug inputs ----------
    setupPageMetaInputs() {
        const titleEl = document.getElementById('pageTitleInput');
        const slugEl = document.getElementById('pageSlugInput');
        if (!titleEl || !slugEl) return;

        this._slugTouched = false;
        this._metaApplying = false; // guard against feedback loops
        const slugify = (s) => {
            try {
                return String(s || '')
                    .toLowerCase()
                    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .slice(0, 80);
            } catch {
                // Fallback without Unicode property escapes
                return String(s || '')
                    .toLowerCase()
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .slice(0, 80);
            }
        };

        // Change handlers (no live slug updates; only on blur)
        titleEl.addEventListener('input', (e) => {
            if (this._metaApplying) return;
            try { e.stopPropagation(); } catch {}
            try { this.markTyping && this.markTyping(900); } catch {}
            const s = document.getElementById('pageSaveStatus');
            if (s) s.textContent = 'Wijzigingen…';
        }, { passive: true });
        slugEl.addEventListener('input', (e) => {
            this._slugTouched = true;
            try { e.stopPropagation(); } catch {}
            try { this.markTyping && this.markTyping(900); } catch {}
            const s = document.getElementById('pageSaveStatus');
            if (s) s.textContent = 'Wijzigingen…';
        }, { passive: true });

        const persistMeta = () => {
            try {
                const title = titleEl.value && titleEl.value.trim() ? titleEl.value.trim() : 'Nieuwe pagina';
                const slug = slugEl.value && slugEl.value.trim() ? slugEl.value.trim() : slugify(title);
                // Update current page record
                if (this.pages && this.pages.length) {
                    const cur = this.pages.find(p => p.id === this.currentPageId) || this.pages[0];
                    if (cur) { cur.name = title; cur.slug = slug; }
                }
                // Schedule a throttled, idle-friendly save
                this.scheduleSaveSilent(700);
            } catch (e) { console.warn('persistMeta failed', e); }
        };
        titleEl.addEventListener('blur', () => {
            try {
                if (!this._slugTouched) {
                    slugEl.value = slugify(titleEl.value);
                }
            } catch {}
            persistMeta();
        });
        slugEl.addEventListener('blur', () => {
            try { slugEl.value = slugify(slugEl.value); } catch {}
            persistMeta();
        });

        // Populate on init or after page switch
        this._applyPageMetaToInputs = () => {
            try {
                this._metaApplying = true;
                const cur = (this.pages || []).find(p => p.id === this.currentPageId) || (this.pages || [])[0] || {};
                const title = cur.name || 'Nieuwe pagina';
                const slug = cur.slug || slugify(title);
                titleEl.value = title;
                slugEl.value = slug;
                this._slugTouched = false;
                const s = document.getElementById('pageSaveStatus');
                if (s) s.textContent = 'Opgeslagen';
            } catch {}
            finally { this._metaApplying = false; }
        };
    }

    // ---------- Back to Dashboard ----------
    setupBackToDashboardLink() {
        const btn = document.getElementById('backToDashboardBtn');
        if (!btn) return;
        const brandId = window.CURRENT_BRAND_ID || '';
        const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || '';
        btn.addEventListener('click', () => {
            if (apiBase) {
                const pagesUrl = `${apiBase.replace(/\/$/, '')}/admin/website/pages${brandId?`?brand_id=${encodeURIComponent(brandId)}`:''}`;
                window.location.href = pagesUrl;
            } else {
                this.showNotification('Geen Bolt API baseUrl gevonden. Stel ?api= in de URL om terug te keren naar het dashboard.', 'info');
            }
        });
    }

    // ---------- Toolbar simplification when launched from Bolt ----------
    adjustToolbarForBoltContext() {
        const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl);
        if (!isBolt) return;
        try { document.body.classList.add('bolt-context'); } catch {}
        const hideIds = [
            'openProjectBtn',
            'exportBtn',
            'gitPushBtn',
            'pagesBtn',
            'layoutBtn',
            'headerBuilderBtn',
            'footerBuilderBtn',
            // Keep preview/save visible in Bolt context
        ];
        hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        // Ensure Save/Preview are visible and inputs are interactive
        ['saveProjectBtn','previewBtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
        ['pageTitleInput','pageSlugInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.disabled = false; el.style.pointerEvents = 'auto'; el.style.opacity = '1'; }
        });
    }

    setupPublishButton() {
        const btn = document.getElementById('publishBtn');
        if (!btn) return;
        // In Bolt/deeplink context do not show the Publish modal; drafts are handled via saveDraft
        try {
            const href = new URL(window.location.href);
            const boltLike = !!(window.BOLT_API && window.BOLT_API.baseUrl) || (!!href.searchParams.get('api') && !!href.searchParams.get('brand_id'));
            if (boltLike) {
                try { btn.style.display = 'none'; } catch {}
                return;
            }
        } catch {}
        btn.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.maxWidth = '640px';
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h3><i class="fas fa-cloud-upload-alt"></i> Publish</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div id="gitSection">
                      <p style="color:#555; margin-bottom:10px;">Gebruik onderstaand PowerShell-commando om alle wijzigingen te committen en te pushen naar <code>origin main</code>:</p>
                      <div style="display:flex; gap:8px; align-items:flex-start;">
                          <textarea id="publishCmd" class="form-control" style="height:90px; flex:1; font-family: Consolas, monospace;">
./publish.ps1 -Message "chore: update"
                          </textarea>
                          <button id="copyPublish" class="btn btn-primary" style="white-space:nowrap;">
                              <i class="fas fa-copy"></i> Kopieer
                          </button>
                      </div>
                      <div style="font-size:12px; color:#6b7280; margin-top:10px;">
                          Tip: Voer dit uit in PowerShell in de map <code>C:\\Users\\info\\CascadeProjects\\website-builder</code>. Zorg dat de remote <code>origin</code> staat op jouw repo.
                      </div>
                      <div style="margin-top:12px; background:#f8fafc; padding:10px; border-radius:8px; font-size:12px; color:#374151;">
                          Als pushen faalt door ontbrekende remote, voer eerst uit:<br/>
                          <code>git remote add origin https://github.com/RRPsystem/windsurfer.git</code>
                      </div>
                    </div>
                </div>
            `;
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            const closeBtn = modalContent.querySelector('.modal-close');
            const copyBtn = modalContent.querySelector('#copyPublish');
            const textarea = modalContent.querySelector('#publishCmd');

            // --- Inject "Publiceer naar Bolt Database" UI bovenaan de modal body ---
            try {
                const bodyEl = modalContent.querySelector('.modal-body');
                if (bodyEl && !bodyEl.querySelector('#pubToDb')) {
                    const dbBox = document.createElement('div');
                    dbBox.style.border = '1px solid #e5e7eb';
                    dbBox.style.borderRadius = '8px';
                    dbBox.style.padding = '12px';
                    dbBox.style.marginBottom = '16px';
                    dbBox.innerHTML = `
                        <div style="font-weight:600; margin-bottom:8px;">Publiceer naar Bolt Database</div>
                        <div style="display:grid; grid-template-columns: 100px 1fr; gap:8px; align-items:center;">
                          <label for="pubTitle">Titel</label><input id="pubTitle" class="form-control" type="text" placeholder="Pagina titel" />
                          <label for="pubSlug">Slug</label><input id="pubSlug" class="form-control" type="text" placeholder="pagina-slug" />
                        </div>
                        <div style="display:flex; gap:8px; margin-top:10px;">
                          <button id="pubToDb" class="btn btn-primary"><i class="fas fa-cloud-upload-alt"></i> Publiceer</button>
                          <button id="pubAndReturn" class="btn btn-secondary"><i class="fas fa-check"></i> Opslaan & Terug</button>
                          <div id="pubStatus" style="font-size:12px; color:#6b7280; align-self:center;"></div>
                        </div>`;
                    bodyEl.insertBefore(dbBox, bodyEl.firstChild);

                    // Prefill title/slug uit huidige page meta
                    try {
                        const meta = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : { title: 'Pagina', slug: `pagina-${Date.now()}` };
                        const pubTitle = dbBox.querySelector('#pubTitle');
                        const pubSlug = dbBox.querySelector('#pubSlug');
                        if (pubTitle && !pubTitle.value) pubTitle.value = meta.title || 'Pagina';
                        if (pubSlug && !pubSlug.value) pubSlug.value = meta.slug || `pagina-${Date.now()}`;
                    } catch (_) {}

                    // Publish handler
                    const pubBtn = dbBox.querySelector('#pubToDb');
                    const pubAndReturnBtn = dbBox.querySelector('#pubAndReturn');
                    const pubStatus = dbBox.querySelector('#pubStatus');
                    pubBtn && (pubBtn.onclick = async () => {
                        try {
                            pubStatus.textContent = 'Bezig met publiceren…';
                            pubBtn.disabled = true; if (pubAndReturnBtn) pubAndReturnBtn.disabled = true;
                            // Sync huidige canvas naar state
                            if (typeof this.captureCurrentCanvasToPage === 'function') this.captureCurrentCanvasToPage();

                            const pubTitle = dbBox.querySelector('#pubTitle');
                            const pubSlug = dbBox.querySelector('#pubSlug');

                            const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : { title: pubTitle?.value || 'Pagina', slug: pubSlug?.value || `pagina-${Date.now()}` };
                            // Overschrijf met UI waarden en normaliseer slug
                            if (pubTitle) contentJson.title = pubTitle.value || contentJson.title;
                            if (pubSlug) contentJson.slug = (pubSlug.value || contentJson.slug).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

                            const brand_id = window.CURRENT_BRAND_ID;
                            if (!brand_id) {
                                pubStatus.textContent = '';
                                this.showErrorMessage('Geen brand_id ingesteld. Vul CURRENT_BRAND_ID in js/config.local.js');
                                return;
                            }

                            if (!window.BuilderPublishAPI) {
                                pubStatus.textContent = '';
                                this.showErrorMessage('Publish helpers niet geladen (js/publish.js)');
                                return;
                            }

                            const page = await window.BuilderPublishAPI.saveDraft({
                                brand_id,
                                title: contentJson.title,
                                slug: contentJson.slug,
                                content_json: contentJson
                            });

                            const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '<h1>Pagina</h1>';
                            const pubRes = await window.BuilderPublishAPI.publishPage(page.id, htmlString);
                            pubStatus.textContent = '';
                            this.showNotification('✅ Gepubliceerd naar Bolt Database', 'success');
                            // Toon duidelijke succes-UI met links
                            const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || '';
                            const brandId = window.CURRENT_BRAND_ID || '';
                            const beheerUrl = apiBase ? `${apiBase.replace(/\/$/, '')}/admin/website/pages?brand_id=${encodeURIComponent(brandId)}` : '';
                            const previewUrl = pubRes && pubRes.url ? pubRes.url : '';
                            const successHtml = `
                              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:10px;background:#f8fafc;">
                                <div style="font-weight:700;color:#16a34a;margin-bottom:8px;">✅ Publicatie geslaagd</div>
                                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                  ${beheerUrl?`<a class="btn btn-secondary" href="${beheerUrl}">↩️ Terug naar Pagina Beheer</a>`:''}
                                  ${previewUrl?`<a class="btn btn-primary" target="_blank" rel="noopener" href="${previewUrl}">👁️ Bekijk Pagina</a>`:''}
                                  <button id="stayEditing" class="btn">Blijf bewerken</button>
                                </div>
                              </div>`;
                            bodyEl.insertAdjacentHTML('afterbegin', successHtml);
                            const stayBtn = bodyEl.querySelector('#stayEditing');
                            if (stayBtn) stayBtn.onclick = () => { try { closeModal(); } catch {} };
                        } catch (err) {
                            console.error(err);
                            pubStatus.textContent = '';
                            this.showErrorMessage('Publiceren mislukt (zie console)');
                        }
                        finally {
                            pubBtn.disabled = false; if (pubAndReturnBtn) pubAndReturnBtn.disabled = false;
                        }
                    });

                    // Opslaan & Terug: zelfde flow, daarna redirect naar Bolt dashboard
                    pubAndReturnBtn && (pubAndReturnBtn.onclick = async () => {
                        try {
                            pubStatus.textContent = 'Bezig met publiceren…';
                            if (typeof this.captureCurrentCanvasToPage === 'function') this.captureCurrentCanvasToPage();

                            const pubTitle = dbBox.querySelector('#pubTitle');
                            const pubSlug = dbBox.querySelector('#pubSlug');
                            const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : { title: pubTitle?.value || 'Pagina', slug: pubSlug?.value || `pagina-${Date.now()}` };
                            if (pubTitle) contentJson.title = pubTitle.value || contentJson.title;
                            if (pubSlug) contentJson.slug = (pubSlug.value || contentJson.slug).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

                            const brand_id = window.CURRENT_BRAND_ID;
                            if (!brand_id) { pubStatus.textContent=''; this.showErrorMessage('Geen brand_id ingesteld.'); return; }
                            if (!window.BuilderPublishAPI) { pubStatus.textContent=''; this.showErrorMessage('Publish helpers niet geladen'); return; }

                            const page = await window.BuilderPublishAPI.saveDraft({ brand_id, title: contentJson.title, slug: contentJson.slug, content_json: contentJson });
                            const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '<h1>Pagina</h1>';
                            await window.BuilderPublishAPI.publishPage(page.id, htmlString);

                            // Redirect
                            const apiBase = (window.BOLT_API && window.BOLT_API.baseUrl) || '';
                            if (apiBase) {
                                const url = `${apiBase.replace(/\/$/, '')}/admin/website/pages?brand_id=${encodeURIComponent(brand_id)}`;
                                window.location.href = url;
                            } else {
                                this.showNotification('✅ Gepubliceerd. Geen API-base gevonden voor redirect.', 'success');
                            }
                        } catch (err) {
                            console.error(err);
                            pubStatus.textContent = '';
                            this.showErrorMessage('Opslaan & Terug mislukt (zie console)');
                        }
                    });
                }
            } catch (e) { /* stil */ }

            // In Bolt-context: verberg GitHub/PowerShell sectie en zet header
            try {
                const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl);
                if (isBolt) {
                    const gitSection = modalContent.querySelector('#gitSection');
                    if (gitSection) gitSection.style.display = 'none';
                    const h3 = modalContent.querySelector('.modal-header h3');
                    if (h3) h3.textContent = 'Publiceren';
                }
            } catch (_) {}

            const closeModal = () => { document.body.removeChild(modal); };
            closeBtn.onclick = closeModal;
            modal.onclick = (e) => { if (e.target === modal) closeModal(); };
            copyBtn.onclick = () => {
                textarea.select();
                document.execCommand('copy');
                this.showNotification('📋 Publish-commando gekopieerd', 'success');
            };
        });
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Website Builder wordt geïnitialiseerd...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    // ---------- Helpers ----------
    getCurrentMode() {
        try {
            const m = (location.hash.match(/#\/mode\/([a-z]+)/i) || [])[1];
            if (m) return m;
        } catch {}
        try { return localStorage.getItem('wb_mode') || 'page'; } catch { return 'page'; }
    }

    // ---------- Typing + Autosave helpers (class methods) ----------
    markTyping(ms = 600) {
        try { this._typingUntil = performance.now() + Math.max(0, ms|0); }
        catch { this._typingUntil = Date.now() + Math.max(0, ms|0); }
    }
    isTyping() {
        try { return performance.now() < (this._typingUntil || 0); }
        catch { return Date.now() < (this._typingUntil || 0); }
    }
    scheduleSaveSilent(delay = 800) {
        try { clearTimeout(this._saveDebTimer); } catch {}
        this._saveDebTimer = setTimeout(() => {
            if (this.isTyping()) { this.scheduleSaveSilent(400); return; }
            try {
                if (typeof window.requestIdleCallback === 'function') {
                    window.requestIdleCallback(() => this.saveProject(true), { timeout: 1000 });
                } else {
                    setTimeout(() => this.saveProject(true), 0);
                }
            } catch { this.saveProject(true); }
        }, Math.max(0, delay|0));
    }

    // ---------- Performance Debugging ----------
    setupPerfDebug() {
        let enabled = false;
        try {
            const u = new URL(window.location.href);
            enabled = (u.searchParams.get('debug') === '1');
        } catch {}
        try { if (!enabled) enabled = (localStorage.getItem('wb_debug') === '1'); } catch {}
        if (!enabled) return;

        console.info('[WB][debug] Performance debug enabled');
        window.__WB_DEBUG = true;

        // 1) Long task observer
        try {
            if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
                const po = new PerformanceObserver((list) => {
                    list.getEntries().forEach((e) => {
                        console.warn('[WB][longtask]', { duration: Math.round(e.duration), name: e.name || 'task', start: Math.round(e.startTime) });
                    });
                });
                po.observe({ entryTypes: ['longtask'] });
            }
        } catch {}

        // 2) Wrap saveProject to measure duration
        try {
            const origSave = this.saveProject.bind(this);
            this.saveProject = (silent=false) => {
                const t0 = performance.now();
                const res = origSave(silent);
                const done = () => {
                    const dt = Math.round(performance.now() - t0);
                    if (dt > 50) console.debug('[WB][perf] saveProject ms=', dt, 'silent=', silent, 'typing=', (this.isTyping && this.isTyping()));
                };
                try { Promise.resolve(res).finally(done); } catch { done(); }
                return res;
            };
        } catch {}

        // 3) Input/keydown timeline
        try {
            const logEvt = (type, e) => {
                const tgt = e.target && (e.target.className || e.target.id || e.target.tagName);
                console.debug('[WB][evt]', type, { tgt: String(tgt).slice(0,80) });
            };
            document.addEventListener('keydown', (e) => logEvt('keydown', e), true);
            document.addEventListener('input', (e) => logEvt('input', e), true);
        } catch {}

        // 4) Canvas mutation rate monitor
        try {
            const canvas = document.getElementById('canvas');
            if (canvas && window.MutationObserver) {
                let count = 0; let last = performance.now();
                const mo = new MutationObserver(() => {
                    count++;
                    const now = performance.now();
                    if (now - last > 1000) { console.debug('[WB][mut]', count, '/s'); count = 0; last = now; }
                });
                mo.observe(canvas, { childList: true, subtree: true, attributes: true });
            }
        } catch {}

        // 5) MediaPicker activity logs (if present)
        try {
            if (window.MediaPicker && !window.MediaPicker.__wb_debugWrapped) {
                const origOpen = window.MediaPicker.openImage?.bind(window.MediaPicker);
                if (origOpen) {
                    window.MediaPicker.openImage = async (...args) => {
                        console.debug('[WB][mp] openImage', args[0] || {});
                        try { const r = await origOpen(...args); console.debug('[WB][mp] result', !!r); return r; }
                        catch (e) { console.warn('[WB][mp] error', e); throw e; }
                    };
                }
                window.MediaPicker.__wb_debugWrapped = true;
            }
        } catch {}
    }

    // ---------- Preview button binding ----------
    setupPreviewButton() {
        const btn = document.getElementById('previewBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            try {
                // Sync canvas to page state before preview
                if (typeof this.captureCurrentCanvasToPage === 'function') this.captureCurrentCanvasToPage();
                if (window.ExportManager && typeof window.ExportManager.showPreview === 'function') {
                    window.ExportManager.showPreview();
                } else {
                    this.showNotification('Preview module niet geladen', 'error');
                }
            } catch (e) {
                console.error('Preview error', e);
                this.showErrorMessage('Kon preview niet openen');
            }
        });
    }

    setup() {
        try {
            this.setupDeviceSelector();
            this.setupKeyboardShortcuts();
            this.setupAutoSave();
            this.setupWelcomeMessage();
            this.interceptCanvasLinks();
            this.setupPreviewButton();
            this.setupPublishButton();
            this.setupPagesButton();
            this.setupNewPageQuickButton();
            this.setupLayoutButton();
            this.setupHeaderFooterBuilderLinks();
            this.setupBackToDashboardLink();
            this.adjustToolbarForBoltContext();
            this.setupPageMetaInputs();
            this.setupImportTcButton();
            this.setupGitPushButton();
            this.setupFileSaveLoad();
            // Optional performance debugging (enable with ?debug=1 or localStorage wb_debug=1)
            try { this.setupPerfDebug(); } catch {}
            // Force local-only saves in deeplink or when ?safe=1
            try {
                const u = new URL(window.location.href);
                const isDeeplink = !!(u.searchParams.get('api') && u.searchParams.get('brand_id'));
                const forceSafe = (u.searchParams.get('safe') === '1');
                if (isDeeplink || forceSafe) {
                    this._edgeDisabled = true;
                    console.info('[WB] Edge disabled (safe/deeplink: local-only opslaan)');
                }
            } catch {}
            // Global typing detector to ease saves while user is editing
            try {
                const typingHandler = (e) => {
                    const t = e.target;
                    const inCanvas = !!(t && t.closest && t.closest('#canvas'));
                    const inProps = !!(t && t.closest && t.closest('.properties-panel'));
                    const inHeaderMeta = !!(t && t.closest && t.closest('.page-meta')) || (t && (t.id === 'pageTitleInput' || t.id === 'pageSlugInput'));
                    if (inCanvas || inProps || inHeaderMeta) this.markTyping(800);
                };
                document.addEventListener('input', typingHandler, { passive: true });
            } catch {}
            // Load from Supabase Edge first; only fallback to local if no Edge ctx
            (async () => {
                try { await this.loadFromEdgeIfPresent(); } catch {}
                if (!this._edgeCtx) {
                    this.loadSavedProject();
                }
                this.ensurePagesInitialized();
                this.updateEdgeBadge();
            })();
            
            this.isInitialized = true;
            console.log('✅ Website Builder succesvol geïnitialiseerd!');
            
            // Show welcome message for new users
            if (!localStorage.getItem('wb_visited')) {
                setTimeout(() => this.showWelcomeModal(), 1000);
                localStorage.setItem('wb_visited', 'true');
            }
            
        } catch (error) {
            console.error('❌ Fout bij initialiseren van Website Builder:', error);
            this.showErrorMessage('Er is een fout opgetreden bij het laden van de Website Builder.');
        }
    }

    // ---------- Page Manager ----------
    ensurePagesInitialized() {
        const canvas = document.getElementById('canvas');
        if (!this.pages || this.pages.length === 0) {
            const initialHtml = canvas.innerHTML;
            const id = this.generateId('page');
            this.pages = [{ id, name: 'Home', slug: 'home', html: initialHtml }];
            this.currentPageId = id;
            this.persistPagesToLocalStorage(true);
        } else if (!this.currentPageId) {
            this.currentPageId = this.pages[0].id;
        }
    }

    setupPagesButton() {
        const btn = document.getElementById('pagesBtn');
        if (!btn) return;
        btn.addEventListener('click', () => this.openPagesModal());
    }

    // ---------- Quick New Page button in header ----------
    setupNewPageQuickButton() {
        const btn = document.getElementById('newPageQuickBtn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const id = this.generateId('page');
            const headerTitle = document.getElementById('pageTitleInput')?.value || '';
            const defaultName = headerTitle.trim() || 'Nieuwe pagina';
            const name = (prompt('Naam van nieuwe pagina:', defaultName) || defaultName).trim() || defaultName;
            const slugify = (s) => String(s || '')
                .toLowerCase()
                .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80);
            const slug = slugify(name) || 'nieuwe-pagina';

            const newPage = { id, name, slug, html: this.blankCanvasHtml() };
            this.pages.push(newPage);
            this.currentPageId = id;
            this.persistPagesToLocalStorage();
            await this.switchToPage(id);
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch {}
            this.showNotification('🆕 Nieuwe pagina aangemaakt', 'success');
        });
    }

    openPagesModal() {
        // Save current canvas to current page before opening
        this.captureCurrentCanvasToPage();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.maxWidth = '800px';
        content.innerHTML = `
            <div class="modal-header">
                <h3><i class=\"fas fa-file-alt\"></i> Pagina's</h3>
                <div style=\"display:flex; gap:8px;\">
                    <button class=\"btn btn-secondary\" id=\"pmNew\"><i class=\"fas fa-plus\"></i> Nieuw</button>
                    <button class=\"btn btn-secondary\" id=\"pmRename\"><i class=\"fas fa-i-cursor\"></i> Hernoemen</button>
                    <button class=\"btn btn-secondary\" id=\"pmDelete\"><i class=\"fas fa-trash\"></i> Verwijderen</button>
                    <button class=\"modal-close\"><i class=\"fas fa-times\"></i></button>
                </div>
            </div>
            <div class=\"modal-body\" style=\"display:grid; grid-template-columns: 1fr 1fr; gap: 16px;\">
                <div>
                    <div style=\"font-weight:600; margin-bottom:6px; color:#374151;\">Lijst</div>
                    <div id=\"pmList\" style=\"border:1px solid #e5e7eb; border-radius:8px; overflow:auto; max-height:55vh;\"></div>
                </div>
                <div>
                    <div style=\"font-weight:600; margin-bottom:6px; color:#374151;\">Details</div>
                    <div id=\"pmDetails\" style=\"border:1px solid #e5e7eb; border-radius:8px; padding:10px;\">
                        <div style=\"display:grid; grid-template-columns: 110px 1fr; gap:8px; align-items:center;\">
                            <label>Naam</label><input id=\"pmName\" class=\"form-control\" type=\"text\" />
                            <label>Slug</label><input id=\"pmSlug\" class=\"form-control\" type=\"text\" />
                        </div>
                        <button id=\"pmApply\" class=\"btn btn-primary\" style=\"margin-top:10px;\">Toepassen</button>
                        <button id=\"pmOpen\" class=\"btn btn-secondary\" style=\"margin-top:10px;\">Openen</button>
                    </div>
                </div>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const close = () => { document.body.removeChild(modal); };
        content.querySelector('.modal-close').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };

        const listEl = content.querySelector('#pmList');
        const nameInput = content.querySelector('#pmName');
        const slugInput = content.querySelector('#pmSlug');
        const applyBtn = content.querySelector('#pmApply');
        const openBtn = content.querySelector('#pmOpen');

        let selectedId = this.currentPageId;

        const renderList = () => {
            listEl.innerHTML = '';
            this.pages.forEach(p => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';
                row.style.padding = '10px 12px';
                row.style.borderBottom = '1px solid #f3f4f6';
                row.style.cursor = 'pointer';
                row.style.background = p.id === selectedId ? '#e8f5e9' : '#fff';
                row.innerHTML = `<div><strong>${p.name}</strong><div style=\"font-size:12px; color:#6b7280;\">/${p.slug}</div></div><div>${p.id===this.currentPageId?'<span style=\"font-size:12px; color:#16a34a; font-weight:700;\">actief</span>':''}</div>`;
                row.onclick = () => { selectedId = p.id; fillDetails(); renderList(); };
                listEl.appendChild(row);
            });
        };

        const fillDetails = () => {
            const p = this.pages.find(x => x.id === selectedId);
            if (!p) return;
            nameInput.value = p.name;
            slugInput.value = p.slug;
        };

        renderList();
        fillDetails();

        applyBtn.onclick = () => {
            const p = this.pages.find(x => x.id === selectedId);
            if (!p) return;
            p.name = (nameInput.value || 'Pagina').trim();
            p.slug = (slugInput.value || p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')).trim();
            this.persistPagesToLocalStorage();
            renderList();
            this.showNotification('✅ Pagina bijgewerkt', 'success');
        };

        openBtn.onclick = async () => {
            await this.switchToPage(selectedId);
            close();
        };

        content.querySelector('#pmNew').onclick = async () => {
            const id = this.generateId('page');
            const headerTitle = document.getElementById('pageTitleInput')?.value || '';
            const defaultName = headerTitle.trim() || 'Nieuwe pagina';
            const name = (prompt('Naam van nieuwe pagina:', defaultName) || defaultName).trim() || defaultName;
            const slugify = (s) => String(s || '')
                .toLowerCase()
                .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80);
            const slug = slugify(name) || 'nieuwe-pagina';

            const newPage = { id, name, slug, html: this.blankCanvasHtml() };
            this.pages.push(newPage);
            selectedId = id;
            this.persistPagesToLocalStorage();
            renderList();
            fillDetails();
            // Open the new page immediately with an empty canvas and sync meta inputs
            await this.switchToPage(id);
            try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch {}
            this.showNotification('🆕 Nieuwe pagina aangemaakt', 'success');
        };
    };

    async switchToPage(pageId) {
        if (pageId === this.currentPageId) return;
        // Save current canvas to current page
        this.captureCurrentCanvasToPage();
        // Load target page
        const target = this.pages.find(p => p.id === pageId);
        if (!target) return;
        const canvas = document.getElementById('canvas');
        const html = target.html || this.blankCanvasHtml();
        canvas.innerHTML = html;
        this.currentPageId = pageId;
        this.reattachEventListeners();
        this.interceptCanvasLinks();
        this.persistPagesToLocalStorage();
        // Sync page title/slug inputs with the newly active page
        try { if (typeof this._applyPageMetaToInputs === 'function') this._applyPageMetaToInputs(); } catch {}
        this.showNotification(`📄 Gewisseld naar: ${target.name}`, 'success');

        // If this is a blank page, make sure the editor shows a clean slate (only drop-zone)
        try {
            const isBlank = /class=["']drop-zone["']/.test(html);
            if (isBlank) {
                // Ensure drop-zone is visible and no stray selections remain
                const dz = canvas.querySelector('.drop-zone');
                if (dz) dz.style.display = '';
                document.querySelectorAll('.wb-component.selected').forEach(el => el.classList.remove('selected'));
                if (window.PropertiesPanel && typeof window.PropertiesPanel.clearProperties === 'function') {
                    window.PropertiesPanel.clearProperties();
                }
            }
        } catch {}
    }

    captureCurrentCanvasToPage() {
        const canvas = document.getElementById('canvas');
        const current = this.pages.find(p => p.id === this.currentPageId);
        if (current && canvas) current.html = canvas.innerHTML;
    }

    persistPagesToLocalStorage(silent = false) {
        const projectData = {
            pages: this.pages,
            currentPageId: this.currentPageId,
            device: this.currentDevice,
            layout: this.projectLayout || this.defaultLayout(),
            timestamp: new Date().toISOString(),
            version: '1.1'
        };
        localStorage.setItem('wb_project', JSON.stringify(projectData));
        if (!silent) console.log('💾 Pages opgeslagen', projectData);
    }

    blankCanvasHtml() {
        return `
            <div class=\"drop-zone\">
                <div class=\"drop-zone-content\">
                    <i class=\"fas fa-plus-circle\"></i>
                    <p>Sleep componenten hierheen om te beginnen</p>
                </div>
            </div>
        `;
    }

    generateId(prefix) {
        return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36).slice(-4)}`;
    }

    setupDeviceSelector() {
        const deviceButtons = document.querySelectorAll('.device-btn');
        const canvas = document.getElementById('canvas');
        
        deviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                deviceButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Get device type
                const device = btn.getAttribute('data-device');
                this.currentDevice = device;
                
                // Update canvas size
                canvas.className = `canvas ${device}`;
                
                // Update canvas wrapper for different devices
                this.updateCanvasForDevice(device);
                
                console.log(`📱 Apparaat gewijzigd naar: ${device}`);
            });
        });
    }

    updateCanvasForDevice(device) {
        const canvas = document.getElementById('canvas');
        const canvasWrapper = canvas.parentElement;
        
        // Remove existing device classes
        canvas.classList.remove('desktop', 'tablet', 'mobile');
        
        // Add new device class
        canvas.classList.add(device);
        
        // Update canvas dimensions based on device
        switch (device) {
            case 'desktop':
                canvas.style.maxWidth = '1200px';
                canvas.style.minHeight = '600px';
                break;
            case 'tablet':
                canvas.style.maxWidth = '768px';
                canvas.style.minHeight = '500px';
                break;
            case 'mobile':
                canvas.style.maxWidth = '375px';
                canvas.style.minHeight = '400px';
                break;
        }
        
        // Trigger responsive updates for components
        this.updateComponentsForDevice(device);
    }

    updateComponentsForDevice(device) {
        const components = document.querySelectorAll('.wb-component');
        
        components.forEach(component => {
            // Update component styling based on device
            if (device === 'mobile') {
                // Make rows stack vertically on mobile
                if (component.classList.contains('wb-row')) {
                    component.style.flexDirection = 'column';
                }
                
                // Reduce font sizes on mobile
                if (component.classList.contains('wb-heading')) {
                    const currentSize = parseFloat(getComputedStyle(component).fontSize);
                    component.style.fontSize = Math.max(currentSize * 0.8, 14) + 'px';
                }
            } else {
                // Reset to default for larger screens
                if (component.classList.contains('wb-row')) {
                    component.style.flexDirection = 'row';
                }
                
                if (component.classList.contains('wb-heading')) {
                    component.style.fontSize = '';
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S - Save project
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveProject();
                this.showNotification('💾 Project opgeslagen!', 'success');
            }
            
            // Ctrl/Cmd + Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (window.dragDropManager) {
                    window.dragDropManager.undo();
                    this.showNotification('↶ Ongedaan gemaakt', 'info');
                }
            }
            
            // Ctrl/Cmd + Shift + Z - Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                if (window.dragDropManager) {
                    window.dragDropManager.redo();
                    this.showNotification('↷ Opnieuw uitgevoerd', 'info');
                }
            }
            
            // Ctrl/Cmd + E - Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (window.ExportManager) {
                    window.ExportManager.showExportModal();
                }
            }
            
            // Ctrl/Cmd + P - Preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (window.ExportManager) {
                    window.ExportManager.showPreview();
                }
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            // Respect typing; schedule throttled idle save
            this.scheduleSaveSilent(800);
        }, 30000);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveProject(true);
        });
    }

    setupWelcomeMessage() {
        // Show helpful tips in console
        console.log(`
🎨 Website Builder - Sneltoetsen:
• Ctrl/Cmd + S: Project opslaan
• Ctrl/Cmd + Z: Ongedaan maken
• Ctrl/Cmd + Shift + Z: Opnieuw uitvoeren
• Ctrl/Cmd + E: Exporteren
• Ctrl/Cmd + P: Voorbeeld
• Delete: Geselecteerd element verwijderen
• Esc: Selectie opheffen
        `);
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '600px';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>🎉 Welkom bij Website Builder!</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
                    <h4>Maak prachtige websites zonder code!</h4>
                    <p style="color: #666; margin-bottom: 2rem;">Sleep componenten naar het canvas en pas ze aan naar je wensen.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <i class="fas fa-mouse-pointer" style="font-size: 2rem; color: #2196F3; margin-bottom: 0.5rem;"></i>
                        <h5>Drag & Drop</h5>
                        <p style="font-size: 0.9rem; color: #666;">Sleep componenten van de zijbalk naar het canvas</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <i class="fas fa-edit" style="font-size: 2rem; color: #4CAF50; margin-bottom: 0.5rem;"></i>
                        <h5>Live Editing</h5>
                        <p style="font-size: 0.9rem; color: #666;">Klik op elementen om ze direct te bewerken</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <i class="fas fa-mobile-alt" style="font-size: 2rem; color: #FF9800; margin-bottom: 0.5rem;"></i>
                        <h5>Responsive</h5>
                        <p style="font-size: 0.9rem; color: #666;">Test je website op verschillende apparaten</p>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <i class="fas fa-download" style="font-size: 2rem; color: #9C27B0; margin-bottom: 0.5rem;"></i>
                        <h5>Export</h5>
                        <p style="font-size: 0.9rem; color: #666;">Download je website als HTML bestand</p>
                    </div>
                </div>
                
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h5 style="margin-bottom: 0.5rem;">💡 Tips om te beginnen:</h5>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        <li>Begin met een Container component</li>
                        <li>Voeg een Rij toe voor layout</li>
                        <li>Sleep Kolommen in de rij</li>
                        <li>Voeg content toe aan de kolommen</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <button class="btn btn-primary" id="startBuilding" style="padding: 1rem 2rem; font-size: 1.1rem;">
                        <i class="fas fa-rocket"></i> Laten we beginnen!
                    </button>
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modalContent.querySelector('.modal-close');
        const startBtn = modalContent.querySelector('#startBuilding');
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeBtn.onclick = closeModal;
        startBtn.onclick = () => {
            closeModal();
            this.addSampleContent();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    addSampleContent() {
        // Add a sample container to get users started
        const canvas = document.getElementById('canvas');
        const dropZone = canvas.querySelector('.drop-zone');
        
        if (dropZone) {
            // Create sample container with content
            const container = ComponentFactory.createComponent('container');
            const heading = ComponentFactory.createComponent('heading', { 
                level: 'h1', 
                text: 'Welkom op mijn website!' 
            });
            const text = ComponentFactory.createComponent('text', { 
                text: 'Dit is een voorbeeld tekst. Klik om te bewerken en maak er je eigen verhaal van!' 
            });
            
            // Remove empty class and drop zone content
            container.classList.remove('empty');
            const containerDropZone = container.querySelector('.drop-zone-small');
            if (containerDropZone) {
                containerDropZone.remove();
            }
            
            container.appendChild(heading);
            container.appendChild(text);
            
            dropZone.style.display = 'none';
            canvas.appendChild(container);
            
            // Add animations
            container.classList.add('fade-in');
            
            this.showNotification('🎉 Voorbeeld content toegevoegd! Klik op elementen om ze te bewerken.', 'success');
        }
    }

    saveProject(silent = false) {
        try {
            // Throttle heavy silent saves during active editing sessions
            if (silent) {
                const now = Date.now();
                try {
                    if (this.isTyping && this.isTyping()) { this.scheduleSaveSilent(700); return false; }
                } catch {}
                try {
                    if ((now - (this._lastLocalSaveAt || 0)) < 1200) { this.scheduleSaveSilent(900); return false; }
                } catch {}
            }
            // Sync current canvas to current page (safe if method missing)
            if (typeof this.captureCurrentCanvasToPage === 'function') {
                this.captureCurrentCanvasToPage();
            } else {
                const canvas = document.getElementById('canvas');
                if (this.pages && this.pages.length) {
                    const cur = this.pages.find(p => p.id === this.currentPageId) || this.pages[0];
                    if (cur) cur.html = canvas?.innerHTML || cur.html || '';
                }
            }
            const projectData = {
                pages: this.pages,
                currentPageId: this.currentPageId,
                device: this.currentDevice,
                layout: this.projectLayout || this.defaultLayout(),
                timestamp: new Date().toISOString(),
                version: '1.1'
            };

            const persist = () => {
                try {
                    const payload = JSON.stringify(projectData);
                    localStorage.setItem('wb_project', payload);
                    this._lastLocalSaveAt = Date.now();
                    // Update UI save status
                    const s = document.getElementById('pageSaveStatus');
                    if (s) {
                        const d = new Date();
                        const hh = String(d.getHours()).padStart(2,'0');
                        const mm = String(d.getMinutes()).padStart(2,'0');
                        const ss = String(d.getSeconds()).padStart(2,'0');
                        s.textContent = `Opgeslagen • ${hh}:${mm}:${ss}`;
                    }
                    if (!silent) console.log('💾 Project opgeslagen:', projectData);
                } catch (e) {
                    console.error('Persist error', e);
                    if (!silent) this.showNotification('❌ Opslaan mislukt (localStorage)', 'error');
                }
            };

            try {
                if (typeof window.requestIdleCallback === 'function') {
                    window.requestIdleCallback(persist, { timeout: 800 });
                } else {
                    setTimeout(persist, 0);
                }
            } catch {
                persist();
            }
            
            // Auto-publish on save (simple for users), but skip while typing
            if (!this.isTyping || !this.isTyping()) {
                this.scheduleAutoPublish();
            }

            // If editing via Supabase Edge, avoid network work during typing; defer until idle
            try {
                if (!this.isTyping || !this.isTyping()) {
                    this.saveToEdgeIfPresent().catch(()=>{});
                } else {
                    setTimeout(() => { if (!this.isTyping || !this.isTyping()) this.saveToEdgeIfPresent().catch(()=>{}); }, 1000);
                }
            } catch {}

            return true;
        } catch (error) {
            console.error('❌ Fout bij opslaan project:', error);
            if (!silent) {
                this.showNotification('❌ Fout bij opslaan project', 'error');
            }
            return false;
        }
    }

    // --------- Supabase Edge integration ---------
    async loadFromEdgeIfPresent() {
        try {
            const url = new URL(window.location.href);
            // Resolve compact context if present (and bootstrap from network if missing)
            let ctx = {};
            let ctxId = '';
            try {
                ctxId = url.searchParams.get('ctx') || '';
                if (ctxId) ctx = JSON.parse(localStorage.getItem('wb_ctx_' + ctxId) || '{}');
                // Bootstrap: fetch context if not stored locally yet
                if (ctxId && (!ctx || !ctx.api || !ctx.token)) {
                    const candidates = [];
                    const base = (url.searchParams.get('ctx_base') || '').replace(/\/$/, '');
                    if (base) candidates.push(`${base}/wbctx/${encodeURIComponent(ctxId)}`);
                    candidates.push(`${location.origin}/wbctx/${encodeURIComponent(ctxId)}.json`);
                    candidates.push(`${location.origin}/wbctx/${encodeURIComponent(ctxId)}`);
                    for (const u of candidates) {
                        try {
                            const res = await fetch(u, { headers: { 'Content-Type': 'application/json' } });
                            if (!res.ok) continue;
                            const data = await res.json();
                            if (data && data.api && (data.token || data.news_slug)) {
                                ctx = data;
                                // defer persistence until after validation below
                                break;
                            }
                        } catch {}
                    }
                }
            } catch {}
            // Security: ephemeral (no localStorage), expiry, and optional signature verification
            const ephemeralParam = (url.searchParams.get('ctx_ephemeral') === '1');
            const isEphemeral = ephemeralParam || !!ctx.ephemeral;
            try {
                // 1) Expiry check
                if (ctx.exp && Number.isFinite(+ctx.exp)) {
                    const now = Math.floor(Date.now()/1000);
                    if (now >= +ctx.exp) {
                        this.showNotification('⚠️ Context verlopen. Vraag een nieuwe link aan.', 'error');
                        return; // abort early
                    }
                }
                // 2) Optional RS256 signature verification
                if (ctx.sig && (ctx.pub || window.WB_CTX_PUBLIC_KEY)) {
                    const pubPem = ctx.pub || window.WB_CTX_PUBLIC_KEY;
                    const canonical = (o) => {
                        const allow = ['api','token','apikey','brand_id','page_id','news_slug','slug','exp','ephemeral'];
                        const subset = {}; allow.forEach(k=>{ if (o[k]!==undefined) subset[k]=o[k]; });
                        return JSON.stringify(subset);
                    };
                    const importKey = async (pem) => {
                        const b64 = pem.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');
                        const raw = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
                        return await crypto.subtle.importKey('spki', raw.buffer, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['verify']);
                    };
                    const key = await importKey(pubPem).catch(()=>null);
                    const enc = new TextEncoder();
                    const data = enc.encode(canonical(ctx));
                    const sigRaw = Uint8Array.from(atob(String(ctx.sig).replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
                    const ok = key ? await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sigRaw, data).catch(()=>false) : false;
                    if (!ok) { this.showNotification('⚠️ Ongeldige context-handtekening', 'error'); return; }
                }
            } catch {}
            // Persist only when NOT ephemeral and when we actually bootstrapped from network
            try {
                if (ctxId && ctx && ctx.api && (ctx.token || ctx.news_slug) && !isEphemeral) {
                    localStorage.setItem('wb_ctx_' + ctxId, JSON.stringify(ctx));
                }
            } catch {}
            const from = (k, def='') => (url.searchParams.get(k) || ctx[k] || def);
            const api = (from('api', '') || '').replace(/\/$/, '');
            const token = from('token', '');
            const apiKeyHeader = from('apikey', from('api_key', ''));
            // News detection: explicit news_slug OR (content_type=news_items AND slug present AND no page_id)
            const content_type = from('content_type', 'news_items');
            let news_slug = from('news_slug', '');
            if (!news_slug) {
                const maybeSlug = from('slug', '');
                if ((content_type || '').toLowerCase() === 'news_items' && !from('page_id','') && maybeSlug) {
                    news_slug = maybeSlug;
                }
            }
            const author_type = from('author_type', ''); // reserved
            const author_id = from('author_id', '');     // reserved
            const page_id = from('page_id', '');
            const brand_id = from('brand_id', '');
            // content_type already resolved above
            if (!api || !token) return; // require both for edge

            // Early guard: no specific target -> skip remote load fully
            try {
                const hasSlug = !!from('slug','');
                const hasIdentifiers = !!(news_slug || page_id || hasSlug);
                if (!hasIdentifiers) {
                    console.info('[WB] Geen doel-id/slug in deeplink; Edge-load overslaan.');
                    return;
                }
            } catch {}

            if (news_slug) {
                // New shape: /content-api/{slug}?type={content_type}&brand_id={brand_id}
                try { window.__WB_LOADING_EDGE = 'news'; } catch {}
                const qs = new URLSearchParams();
                if (content_type) qs.set('type', content_type);
                if (brand_id) qs.set('brand_id', brand_id);
                const apiUrl = `${api}/functions/v1/content-api/${encodeURIComponent(news_slug)}?${qs.toString()}`;
                console.info('[WB] Fetch news content', { apiUrl });
                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                if (apiKeyHeader) headers['apikey'] = apiKeyHeader;
                const r = await fetch(apiUrl, { headers });
                if (!r.ok) throw new Error(await r.text());
                const newsData = await r.json();
                const d = newsData?.item || newsData;
                // Support multiple shapes on root or inside .item
                let content = d?.content?.json || d?.content_json?.json || d?.content || d?.content_json || null;
                // Heuristic fallback: traverse to find a builder-like JSON
                if (!content) {
                    const found = __WB_findBuilderJson(d);
                    if (found) content = found;
                }
                if (content && typeof content === 'string') {
                    try { content = JSON.parse(content); } catch {}
                }
                if (content) {
                    // Prefer global importer if present
                    try {
                        if (window.importBuilderFromJSON) {
                            window.importBuilderFromJSON(content);
                        } else {
                            this.loadProjectData(content);
                        }
                    } catch { this.loadProjectData(content); }
                    this._edgeCtx = { api, token, kind: 'news', key: news_slug };
                    // Switch UI to news mode
                    try { location.hash = '#/mode/news'; } catch {}
                    this.updateEdgeBadge();
                    // Try to ensure edit mode is visible
                    try { window.WB_setMode && window.WB_setMode('news'); } catch {}
                    // Update title/slug inputs if provided
                    if (newsData.title || newsData.slug) {
                        const t = document.getElementById('pageTitleInput');
                        const s = document.getElementById('pageSlugInput');
                        if (t && newsData.title) t.value = newsData.title;
                        if (s && newsData.slug) s.value = newsData.slug;
                    }
                    // Do NOT scaffold when content existed; give renderer time to mount
                    try {
                        setTimeout(() => {
                            const canvas = document.getElementById('canvas');
                            const hasComponents = !!(canvas && canvas.querySelector('.wb-component'));
                            // content is truthy here, so skip scaffolding even if slow to render
                            if (!hasComponents) {
                                // no-op; assume renderer will mount elements shortly
                            }
                        }, 600);
                    } catch {}
                    this.showNotification('📥 Nieuwsartikel geladen van Supabase', 'success');
                    try { window.__WB_LOADING_EDGE = false; } catch {}
                } else {
                    console.warn('[WB] No content found in news response. Keys:', Object.keys(newsData||{}));
                    // If no content, scaffold a fresh news template so user can start
                    try {
                        setTimeout(() => {
                            const canvas = document.getElementById('canvas');
                            const hasComponents = !!(canvas && canvas.querySelector('.wb-component'));
                            if (!hasComponents && window.websiteBuilder && typeof window.websiteBuilder.createNewsArticleTemplate === 'function') {
                                window.websiteBuilder.createNewsArticleTemplate();
                            }
                        }, 0);
                    } catch {}
                    try { window.__WB_LOADING_EDGE = false; } catch {}
                }
                return;
            }

            if (page_id) {
                // Correct endpoint: GET /functions/v1/pages-api?page_id=... (auth required)
                const qs = new URLSearchParams();
                qs.set('page_id', page_id);
                let apiUrl = `${api}/functions/v1/pages-api?${qs.toString()}`;
                console.info('[WB] Try load page by id (contract)', apiUrl);
                let r = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
                // If not found, attempt preview by slug (public) using URL param, cached mapping, or prompt
                if (!r.ok && r.status === 404) {
                    let pageMap = {}; try { pageMap = JSON.parse(localStorage.getItem('wb_page_map') || '{}'); } catch {}
                    let bySlug = (from('slug', '') || pageMap[page_id] || '').trim();
                    if (!bySlug) { try { bySlug = (prompt('Pagina niet gevonden via ID. Vul de pagina slug in om te openen:','') || '').trim(); } catch {} }
                    if (bySlug) {
                        const qs2 = new URLSearchParams();
                        if (brand_id) qs2.set('brand_id', brand_id);
                        qs2.set('slug', bySlug);
                        apiUrl = `${api}/functions/v1/pages-api/preview?${qs2.toString()}`;
                        console.info('[WB] Try load page by slug (preview)', apiUrl);
                        r = await fetch(apiUrl, { headers: { 'Content-Type': 'application/json' } }); // preview is public
                    }
                }
                if (!r.ok) throw new Error(await r.text());
                const res = await r.json();
                const pageData = res?.page || res?.item || res || {};
                let builderJson = pageData?.content_json?.json || pageData?.content_json || pageData?.content || null;
                if (typeof builderJson === 'string') { try { builderJson = JSON.parse(builderJson); } catch {} }
                if (!builderJson) { try { builderJson = __WB_findBuilderJson(pageData); } catch {} }
                if (builderJson) {
                    this.loadProjectData(builderJson);
                    this._edgeCtx = { api, token, kind: 'page', key: page_id };
                    this.updateEdgeBadge();
                    try { localStorage.setItem('wb_mode', 'page'); location.hash = '#/mode/page'; } catch {}
                    if (pageData.title || pageData.slug) {
                        const t = document.getElementById('pageTitleInput');
                        const s = document.getElementById('pageSlugInput');
                        if (t && pageData.title) t.value = pageData.title;
                        if (s && pageData.slug) s.value = pageData.slug;
                    }
                    // Persist mapping and update URL with slug to avoid future prompts
                    try {
                        const map = JSON.parse(localStorage.getItem('wb_page_map') || '{}');
                        if (pageData.slug) { map[page_id] = pageData.slug; localStorage.setItem('wb_page_map', JSON.stringify(map)); }
                        const cur = new URL(window.location.href);
                        if (pageData.slug && !cur.searchParams.get('slug')) { cur.searchParams.set('slug', pageData.slug); history.replaceState(null, '', cur.toString()); }
                    } catch {}
                    this.showNotification('📥 Pagina geladen van Supabase', 'success');
                }
                return;
            }
        } catch (err) {
            console.warn('Edge load failed', err);
            this.showNotification('⚠️ Laden van Supabase mislukt (zie console)', 'error');
        }
    }

    async saveToEdgeIfPresent() {
        if (!this._edgeCtx || this._edgeDisabled) return;
        const { api, token, kind, key } = this._edgeCtx;
        try {
            // Build content JSON of current state
            const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : this.getProjectData();
            if (!contentJson) return;
            let apiUrl = '';
            if (kind === 'news') {
                // Try Bolt content API helper first (preferred)
                try {
                    const currentUrl = new URL(window.location.href);
                    const brand_id = currentUrl.searchParams.get('brand_id') || '';
                    if (brand_id && window.BuilderPublishAPI?.news?.saveDraft) {
                        const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson) : '';
                        await window.BuilderPublishAPI.news.saveDraft({
                            brand_id,
                            title: contentJson.title,
                            slug: contentJson.slug || key,
                            content: { json: contentJson, html: htmlString },
                            status: 'draft'
                        });
                        this.showNotification('📰 Nieuws opgeslagen naar Bolt', 'success');
                        return;
                    }
                } catch (_) { /* fallback to direct PUT */ }

                // Fallback: direct PUT to slug endpoint
                const currentUrl = new URL(window.location.href);
                const brand_id = currentUrl.searchParams.get('brand_id') || '';
                const content_type = currentUrl.searchParams.get('content_type') || 'news_items';
                const qs = new URLSearchParams();
                if (content_type) qs.set('type', content_type);
                if (brand_id) qs.set('brand_id', brand_id);
                apiUrl = `${api}/functions/v1/content-api/${encodeURIComponent(key)}?${qs.toString()}`;
            }
            if (kind === 'page') apiUrl = `${api}/functions/v1/pages-api/pages/${encodeURIComponent(key)}`;
            if (!apiUrl) return;
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            try {
                const u = new URL(window.location.href);
                const k = u.searchParams.get('apikey') || u.searchParams.get('api_key');
                if (k) headers['apikey'] = k;
            } catch {}
            const r = await fetch(apiUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    title: contentJson.title,
                    slug: contentJson.slug || key,
                    content: contentJson,
                    content_json: contentJson
                })
            });
            if (!r.ok) {
                const txt = await r.text().catch(()=>String(r.status||'fail'));
                throw new Error(txt || ('HTTP '+r.status));
            }
            // Optional: read response
            await r.json().catch(()=>null);
            this.showNotification(kind === 'news' ? '📰 Nieuws opgeslagen (Edge)' : '📝 Pagina opgeslagen (Edge)', 'success');
        } catch (err) {
            console.warn('Edge save failed', err);
            try {
                const msg = String(err && (err.message||err)).toLowerCase();
                if (msg.includes('context already used') || msg.includes('used') || msg.includes('401')) {
                    this._edgeDisabled = true;
                    console.warn('[WB] Edge disabled for this session due to context issue. Working locally only.');
                }
            } catch {}
        }
    }

    updateEdgeBadge() {
        try {
            // Allow hiding the badge via URL or localStorage
            try {
                const u = new URL(window.location.href);
                const p = u.searchParams.get('edge_badge');
                if (p === '0') localStorage.setItem('wb_hide_edge_badge', '1');
            } catch {}
            const hidden = (()=>{ try { return localStorage.getItem('wb_hide_edge_badge') === '1'; } catch { return false; } })();
            const headerRight = document.querySelector('.app-header .header-right');
            if (!headerRight) return;
            let badge = document.getElementById('edgeStatusBadge');
            if (hidden) { if (badge) badge.remove(); return; }
            if (!this._edgeCtx) { if (badge) badge.remove(); return; }
            const { api, kind, key } = this._edgeCtx;
            const host = (()=>{ try { return new URL(api).host; } catch { return api; } })();
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'edgeStatusBadge';
                badge.style.cssText = 'display:flex;align-items:center;gap:8px;background:#0f766e;color:#e7fff9;border:1px solid #0d9488;border-radius:8px;padding:4px 8px;margin-left:8px;font-size:12px;';
                headerRight.insertBefore(badge, headerRight.firstChild);
            }
            badge.innerHTML = `
                <i class="fas fa-link"></i>
                <span style="white-space:nowrap;">Supabase: ${host}</span>
                <span style="opacity:.9;">(${kind}: ${key})</span>
                <button id="edgeSyncBtn" class="btn btn-secondary" style="height:22px;line-height:20px;padding:0 8px;">Sync</button>
                <button id="edgeHideBtn" class="btn btn-secondary" title="Verberg" style="height:22px;line-height:20px;padding:0 8px;">×</button>
            `;
            const btn = badge.querySelector('#edgeSyncBtn');
            if (btn) btn.onclick = () => this.saveToEdgeIfPresent();
            const hideBtn = badge.querySelector('#edgeHideBtn');
            if (hideBtn) hideBtn.onclick = () => { try { localStorage.setItem('wb_hide_edge_badge','1'); } catch {}; badge.remove(); };
        } catch {}
    }

    scheduleAutoPublish() {
        try {
            const brand_id = window.CURRENT_BRAND_ID;
            if (this._edgeDisabled) return;
            if (!brand_id || !window.BuilderPublishAPI) return; // no-op if not configured
            const now = Date.now();
            const since = now - (this._lastAutoPublishAt || 0);
            const delay = since > 2500 ? 300 : 2000 - since; // quick after manual save, slower after recent
            clearTimeout(this._autoPublishTimer);
            this._autoPublishTimer = setTimeout(() => this.autoPublishCurrentPage().catch(()=>{}), Math.max(300, delay));
        } catch {}
    }

    async autoPublishCurrentPage() {
        if (this._edgeDisabled) return;
        const brand_id = window.CURRENT_BRAND_ID;
        if (!brand_id || !window.BuilderPublishAPI) return;
        // Build content JSON and HTML (with layout)
        const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : null;
        const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson || undefined) : null;
        if (!contentJson || !htmlString) return;
        try {
            // Determine effective mode robustly
            // 1) If Edge context loaded, trust its kind
            let mode = (this._edgeCtx && this._edgeCtx.kind) ? this._edgeCtx.kind : ((typeof this.getCurrentMode === 'function') ? this.getCurrentMode() : 'page');
            // 2) Use URL hints to UPGRADE to news/destination, but never downgrade to page
            try {
                const u = new URL(window.location.href);
                const ct = (u.searchParams.get('content_type')||'').toLowerCase();
                const hasNewsSlug = !!(u.searchParams.get('news_slug') || u.searchParams.get('slug'));
                const hasPageId = !!u.searchParams.get('page_id');
                if (mode !== 'news' && (ct === 'news_items' || (hasNewsSlug && !hasPageId))) mode = 'news';
                if (mode !== 'destination' && (ct === 'destinations')) mode = 'destination';
            } catch {}
            if (mode === 'news' && window.BuilderPublishAPI.news) {
                // Save only as draft to content-api; do not publish automatically
                await window.BuilderPublishAPI.news.saveDraft({
                    brand_id,
                    title: contentJson.title,
                    slug: contentJson.slug,
                    content: { json: contentJson, html: htmlString },
                    status: 'draft'
                });
                this._lastAutoPublishAt = Date.now();
                this.showNotification('📰 Concept opgeslagen (Nieuws)', 'success');
            } else if ((mode === 'destination' || mode === 'destinations') && window.BuilderPublishAPI.destinations) {
                await window.BuilderPublishAPI.destinations.saveDraft({
                    brand_id,
                    title: contentJson.title,
                    slug: contentJson.slug,
                    content: { json: contentJson, html: htmlString },
                    status: 'draft'
                });
                this._lastAutoPublishAt = Date.now();
                this.showNotification('🗺️ Concept opgeslagen (Bestemming)', 'success');
            } else {
                // Default: pages flow (save draft + publish)
                const page = await window.BuilderPublishAPI.saveDraft({
                    brand_id,
                    title: contentJson.title,
                    slug: contentJson.slug,
                    content_json: contentJson
                });
                await window.BuilderPublishAPI.publishPage(page.id, htmlString);
                this._lastAutoPublishAt = Date.now();
                this.showNotification('✅ Wijzigingen gepubliceerd', 'success');
            }
        } catch (err) {
            console.warn('Auto-publish failed', err);
            // Keep silent to avoid noisy UX; consider a single toast if persistent
        }
    }

    loadSavedProject() {
        try {
            // If explicitly a new page (no identifiers) or forced via new=1, start with a blank page
            try {
                const u = new URL(window.location.href);
                const hash = String(location.hash || '');
                const isPageMode = /#\/mode\/page/i.test(hash);
                const forceNew = u.searchParams.get('new') === '1';
                const hasPageId = !!u.searchParams.get('page_id');
                const ct = (u.searchParams.get('content_type')||'').toLowerCase();
                const hasNewsSlug = !!(u.searchParams.get('news_slug') || (ct==='news_items' && u.searchParams.get('slug')));
                const hasGenericSlug = !!u.searchParams.get('slug');
                if (isPageMode && (forceNew || (!hasPageId && !hasNewsSlug && !hasGenericSlug))) {
                    const canvas = document.getElementById('canvas');
                    const id = this.generateId('page');
                    const name = 'Nieuwe pagina';
                    const slug = 'nieuwe-pagina';
                    const html = this.blankCanvasHtml();
                    this.pages = [{ id, name, slug, html }];
                    this.currentPageId = id;
                    if (canvas) canvas.innerHTML = html;
                    try { const t = document.getElementById('pageTitleInput'); if (t) t.value = name; } catch {}
                    try { const s = document.getElementById('pageSlugInput'); if (s) s.value = slug; } catch {}
                    try { localStorage.setItem('wb_mode','page'); } catch {}
                    this.persistPagesToLocalStorage(true);
                    this.reattachEventListeners();
                    this.showNotification('🆕 Nieuwe lege pagina', 'info');
                    return;
                }
            } catch {}
            // If destination mode and explicitly new or no identifiers, scaffold destination template
            try {
                const u = new URL(window.location.href);
                const hash = String(location.hash || '');
                const isDest = /#\/mode\/destination/i.test(hash);
                const forceNew = u.searchParams.get('new') === '1';
                const hasPageId = !!u.searchParams.get('page_id');
                const ct = (u.searchParams.get('content_type')||'').toLowerCase();
                const hasNewsSlug = !!(u.searchParams.get('news_slug') || (ct==='news_items' && u.searchParams.get('slug')));
                const hasGenericSlug = !!u.searchParams.get('slug');
                const hasDestSlug = (ct === 'destinations') && !!u.searchParams.get('slug');
                if (isDest && (forceNew || (!hasPageId && !hasNewsSlug && !hasGenericSlug && !hasDestSlug))) {
                    // Use prompt flow to pick country and scaffold
                    if (typeof this.startDestinationScaffold === 'function') {
                        this.startDestinationScaffold();
                        return;
                    }
                }
            } catch {}
            // If running from News mode, start fresh. In Bolt context without Edge content, DO NOT early-return; allow local fallback.
            try {
                const hash = String(location.hash || '');
                const isNews = /#\/mode\/news/i.test(hash);
                const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl);
                const hasEdge = !!this._edgeCtx;
                if (isNews || (isBolt && hasEdge)) {
                    // Ensure there is at least one blank page and skip restoring wb_project
                    const canvas = document.getElementById('canvas');
                    if (canvas) canvas.innerHTML = this.blankCanvasHtml();
                    this.pages = [];
                    this.currentPageId = null;
                    this.ensurePagesInitialized();
                    this.reattachEventListeners();
                    return;
                }
            } catch {}

            const saved = localStorage.getItem('wb_project');
            if (saved) {
                const projectData = JSON.parse(saved);
                const canvas = document.getElementById('canvas');

                if (projectData.pages && Array.isArray(projectData.pages)) {
                    this.pages = projectData.pages;
                    this.currentPageId = projectData.currentPageId || (this.pages[0] && this.pages[0].id);
                    const cur = this.pages.find(p => p.id === this.currentPageId) || this.pages[0];
                    if (cur) canvas.innerHTML = cur.html || this.blankCanvasHtml();
                } else if (projectData.html) {
                    // Backwards compatibility with v1.0
                    const id = this.generateId('page');
                    this.pages = [{ id, name: 'Home', slug: 'home', html: projectData.html }];
                    this.currentPageId = id;
                    canvas.innerHTML = projectData.html;
                }
                
                // Hide drop zone if content exists
                const dropZone = canvas.querySelector('.drop-zone');
                if (dropZone && canvas.children.length > 1) {
                    dropZone.style.display = 'none';
                }
                
                // Restore device setting
                if (projectData.device) {
                    this.currentDevice = projectData.device;
                    const deviceBtn = document.querySelector(`[data-device="${projectData.device}"]`);
                    if (deviceBtn) deviceBtn.click();
                }
                // Restore layout
                this.projectLayout = projectData.layout || this.defaultLayout();
                
                // Re-attach event listeners
                this.reattachEventListeners();
                
                console.log('📂 Project geladen:', projectData);
                this.showNotification('📂 Vorig project geladen', 'info');
            }
        } catch (error) {
            console.error('❌ Fout bij laden project:', error);
        }
    }

    reattachEventListeners() {
        // Re-attach event listeners to loaded components
        const components = document.querySelectorAll('.wb-component');
        components.forEach(component => {
            ComponentFactory.makeSelectable(component);
            
            if (window.dragDropManager) {
                window.dragDropManager.makeSortable(component);
            }
            
            // Re-attach editable functionality
            if (component.contentEditable === 'true') {
                ComponentFactory.makeEditable(component);
            }
        });
    }

    clearProject() {
        if (confirm('Weet je zeker dat je het huidige project wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = `
                <div class="drop-zone">
                    <div class="drop-zone-content">
                        <i class="fas fa-plus-circle"></i>
                        <p>Sleep componenten hierheen om te beginnen</p>
                    </div>
                </div>
            `;
            
            localStorage.removeItem('wb_project');
            
            if (window.PropertiesPanel) {
                window.PropertiesPanel.clearProperties();
            }
            
            this.showNotification('🗑️ Project gewist', 'info');
        }
    }

    showNotification(message, type = 'info') {
        if (window.ExportManager) {
            window.ExportManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showErrorMessage(message) {
        this.showNotification(`❌ ${message}`, 'error');
    }

    // Add Save/Open buttons behavior
    setupFileSaveLoad() {
        const saveBtn = document.getElementById('saveProjectBtn');
        const openBtn = document.getElementById('openProjectBtn');
        const fileInput = document.getElementById('projectFileInput');
        const isBolt = !!(window.BOLT_API && window.BOLT_API.baseUrl);

        // In Bolt context we don't want .wbproj download; Save is handled elsewhere (prompt + saveDraft)
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
                    this.showNotification('💾 Project gedownload (.wbproj)', 'success');
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
                    this.saveProject(true); // also update localStorage
                    this.showNotification('📂 Project geladen uit bestand', 'success');
                } catch (err) {
                    console.error('Load error', err);
                    this.showErrorMessage('Bestand kon niet worden geladen');
                } finally {
                    e.target.value = '';
                }
            });
        }
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
            this.showNotification('🎨 Layout bijgewerkt', 'success');
        };

        content.querySelector('#lpApply').onclick = () => { apply(); close(); };
        content.querySelector('#lpPreview').onclick = () => { apply(); try { window.ExportManager?.showPreview(); } catch {} };

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
                this.showNotification('✅ Wijzigingen naar GitHub gepusht', 'success');
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
                    this.showNotification('📋 Commando gekopieerd', 'success');
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
        this.showNotification('📂 Project geladen', 'success');
    }
}

// Initialize Website Builder when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.websiteBuilder = new WebsiteBuilder();
    // Apply header visibility and attach save handler for Bolt/deeplink context
    try { window.websiteBuilder.applyBoltHeaderVisibilityLite(); } catch {}
    try { window.websiteBuilder.setupBoltDeeplinkSave(); } catch {}
    // Re-apply shortly after in case header renders late
    setTimeout(() => { try { window.websiteBuilder.applyBoltHeaderVisibilityLite(); } catch {} }, 150);
});

// Add global error handler
window.addEventListener('error', (event) => {
    console.error('💥 JavaScript fout:', event.error);
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
