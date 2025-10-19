// Component factory voor website builder

// Global helper: apply responsive src/srcset for known CDNs (e.g., Unsplash)
function __WB_applyResponsiveSrc(imageEl, url, opts = {}) {
    try {
        // Basic perf hints
        try { imageEl.decoding = 'async'; } catch (e) {}
        try { if (!imageEl.loading) imageEl.loading = 'lazy'; } catch (e) {}

        const u = new URL(url);
        const widths = opts.widths || [1280, 1920, 2560, 3200];
        const quality = String(opts.quality || 80);
        const fm = opts.format || 'webp';
        const currentSrc = imageEl.currentSrc || imageEl.src || '';
        const currentHost = (()=>{ try { return new URL(currentSrc).host; } catch (e) { return ''; } })();

        if (u.hostname.includes('images.unsplash.com')) {
            const base = `${u.origin}${u.pathname}`;
            const params = u.searchParams;
            const fit = params.get('fit') || 'crop';
            const auto = params.get('auto') || 'format';
            const srcs = widths.map(w => `${base}?q=${quality}&w=${w}&auto=${auto}&fit=${fit}&fm=${fm}`);
            const defaultSrc = srcs[1] || srcs[0];
            // Avoid unnecessary work if defaultSrc already set
            if (currentSrc === defaultSrc) return;
            const apply = () => {
                imageEl.src = defaultSrc;
                imageEl.srcset = srcs.map((s, i) => `${s} ${widths[i]}w`).join(', ');
                imageEl.sizes = opts.sizes || '100vw';
            };
            return (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(apply) : apply();
        }

        // If switching CDN/host, drop previous srcset/sizes to prevent the browser from sticking to cached candidates
        if (currentHost && currentHost !== u.host) {
            try { imageEl.removeAttribute('srcset'); imageEl.removeAttribute('sizes'); } catch (e) {}
        }
    } catch (e) {}
    // Fallback: single src (batched)
    const setSingle = () => { imageEl.src = url; };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(setSingle); else setSingle();
}
class ComponentFactory {
    static createComponent(type, options = {}) {
        const components = {
            container: this.createContainer,
            row: this.createRow,
            column: this.createColumn,
            heading: this.createHeading,
            text: this.createText,
            image: this.createImage,
            button: this.createButton,
            'hero-travel': this.createHeroTravel,
            'hero-page': this.createHeroPage,
            'hero-banner-cta': this.createHeroBannerCta,
            'hero-travel-video': this.createHeroTravelVideo,
            'feature-media': this.createFeatureMedia,
            'feature-highlight': this.createFeatureHighlight,
            'content-flex': this.createContentFlex,
            'travel-types': this.createTravelTypes,
            'contact-info': this.createContactInfo,
            'contact-map-cta': this.createContactMapCta,
            'media-row': this.createMediaRow,
            'dest-tabs': this.createDestTabs,
            'news-article': this.createNewsArticle,
            'jotform-embed': this.createJotformEmbed,
            'travel-card-transport': this.createTravelCardTransport,
            'travel-card-hotel': this.createTravelCardHotel,
            'travel-card-destination': this.createTravelCardDestination,
            'travel-card-transfer': this.createTravelCardTransfer,
            'travel-day-header': this.createTravelDayHeader,
            'travel-timeline': this.createTravelTimeline,
            'travel-hero': this.createTravelHero
        };

        

        if (components[type]) {
            return components[type].call(this, options);
        } else {
            console.error(`Component type "${type}" not found`);
            return null;
        }

    }

    // DESTINATIONS: Tabs for Cities / Regions / UNESCO (cards grid)
    static createDestTabs(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-dest-tabs';
        section.setAttribute('data-component', 'dest-tabs');
        section.id = this.generateId('dest_tabs');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // State
        const defaults = (labelBase) => Array.from({ length: 5 }).map((_, i) => ({
            img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            title: `${labelBase} ${i + 1}`,
            summary: 'Korte beschrijving (2Ã¢â‚¬“3 regels) over deze plek.',
            href: '#'
        }));
        section._tabs = {
            cities: options.cities || defaults('Stad'),
            regions: options.regions || defaults('Regio'),
            unesco: options.unesco || defaults('UNESCO')
        };
        section._activeTab = options.activeTab || 'cities';
        section._mobileSlider = options.mobileSlider !== false; // true by default

        // Header (tabs)
        const header = document.createElement('div');
        header.className = 'dt-header';
        header.style.cssText = 'max-width:1100px;margin:0 auto 8px;display:flex;gap:8px;align-items:center;padding:0 16px;';
        const mkTabBtn = (key, label) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-secondary';
            b.textContent = label;
            b.setAttribute('data-tab', key);
            b.onclick = (e) => { e.stopPropagation(); section._activeTab = key; renderCards(); highlightActive(); };
            return b;
        };
        const tabCities = mkTabBtn('cities', 'Steden');
        const tabRegions = mkTabBtn('regions', 'Regio\'s');
        const tabUnesco = mkTabBtn('unesco', 'UNESCO');
        header.appendChild(tabCities);
        header.appendChild(tabRegions);
        header.appendChild(tabUnesco);

        // Body (cards container)
        const body = document.createElement('div');
        body.className = 'dt-body';
        body.style.cssText = 'max-width:1100px;margin:0 auto;padding:4px 16px;';

        const grid = document.createElement('div');
        grid.className = 'dt-grid';
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:stretch;';
        body.appendChild(grid);

        const applyMobileBehavior = () => {
            try {
                const isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
                if (isMobile && section._mobileSlider) {
                    grid.style.display = 'flex';
                    grid.style.overflowX = 'auto';
                    grid.style.scrollSnapType = 'x mandatory';
                    grid.style.gap = '10px';
                } else {
                    grid.style.display = 'grid';
                    grid.style.overflowX = 'hidden';
                    grid.style.scrollSnapType = 'none';
                    grid.style.gridTemplateColumns = 'repeat(3,1fr)';
                    grid.style.gap = '12px';
                }
            } catch (e) {}
        };

        const renderCards = () => {
            grid.innerHTML = '';
            const list = section._tabs[section._activeTab] || [];
            list.forEach((item, idx) => {
                const card = document.createElement('a');
                card.className = 'dt-card';
                card.href = item.href || '#';
                card.style.cssText = 'display:block;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.05);text-decoration:none;color:#111827;min-width:68%;scroll-snap-align:start;';
                const img = document.createElement('img');
                __WB_applyResponsiveSrc(img, item.img);
                img.alt = item.title || '';
                img.style.cssText = 'width:100%;height:160px;object-fit:cover;display:block;';
                const wrap = document.createElement('div');
                wrap.style.cssText = 'padding:10px;';
                const h = document.createElement('div'); h.textContent = item.title || ''; h.style.cssText='font-weight:700;margin:0 0 4px;';
                const p = document.createElement('div'); p.textContent = item.summary || ''; p.style.cssText='color:#475569;font-size:14px;min-height:38px;';
                const more = document.createElement('div'); more.innerHTML = '<span style="color:#0ea5e9;font-weight:600;">Bekijk</span>'; more.style.marginTop='6px';
                wrap.appendChild(h); wrap.appendChild(p); wrap.appendChild(more);
                card.appendChild(img);
                card.appendChild(wrap);
                grid.appendChild(card);
            });
            applyMobileBehavior();
        };

        const highlightActive = () => {
            [tabCities, tabRegions, tabUnesco].forEach(b => {
                const on = b.getAttribute('data-tab') === section._activeTab;
                b.classList.toggle('btn-primary', on);
                b.classList.toggle('btn-secondary', !on);
            });
        };

        renderCards();
        highlightActive();

        // Responsive re-check on resize
        try { window.addEventListener('resize', () => applyMobileBehavior()); } catch (e) {}

        section.appendChild(header);
        section.appendChild(body);

        // Interactions
        this.makeSelectable(section);

        // API for PropertiesPanel
        section.__destTabsApi = {
            setActiveTab: (key) => { if (['cities','regions','unesco'].includes(key)) { section._activeTab = key; renderCards(); highlightActive(); } },
            getActiveTab: () => section._activeTab,
            getItems: (key) => (section._tabs[key] || []).slice(),
            setItems: (key, items) => { if (section._tabs[key]) { section._tabs[key] = (items || []).slice(0, 12); renderCards(); } },
            updateItem: (key, index, data) => {
                const arr = section._tabs[key];
                if (!arr) return;
                const it = arr[index];
                if (!it) return;
                section._tabs[key][index] = { ...it, ...data };
                renderCards();
            },
            reorder: (key, from, to) => {
                const arr = section._tabs[key];
                if (!arr) return;
                const f = Math.max(0, Math.min(from, arr.length-1));
                const t = Math.max(0, Math.min(to, arr.length-1));
                if (f === t) return;
                const moved = arr.splice(f,1)[0];
                arr.splice(t,0,moved);
                renderCards();
            },
            setMobileSlider: (on) => { section._mobileSlider = !!on; renderCards(); }
        };

        return section;
    }

    // NEWS: Article block with title, meta (date, author, tags) and body
    static createNewsArticle(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-news-article';
        section.setAttribute('data-component', 'news-article');
        section.id = this.generateId('news_article');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const title = options.title || 'Titel van het nieuwsartikel';
        const dateStr = options.date || new Date().toISOString().slice(0,10);
        const author = options.author || 'Auteur';
        const tags = Array.isArray(options.tags) ? options.tags : ['nieuws'];
        const bodyHtml = options.bodyHtml || '<p>Schrijf hier de inhoud van je nieuwsartikel. Deze tekst is bewerkbaar.</p>';

        // Header
        const header = document.createElement('header');
        header.className = 'na-header';
        header.innerHTML = `
            <h1 class="na-title" contenteditable="true">${title}</h1>
            <div class="na-meta" style="display:flex;gap:12px;align-items:center;color:#6b7280;font-size:14px;">
                <span class="na-date" contenteditable="true">${dateStr}</span>
                <span class="na-dot" aria-hidden="true">&bull;</span>
                <span class="na-author" contenteditable="true">${author}</span>
            </div>
            <ul class="na-tags" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px;padding:0;list-style:none;"></ul>
        `;

        const tagsUl = header.querySelector('.na-tags');
        (tags || []).forEach(t => {
            const li = document.createElement('li');
            li.className = 'na-tag';
            li.textContent = String(t);
            li.style.cssText = 'background:#eef2ff;color:#3730a3;border:1px solid #e5e7eb;border-radius:20px;padding:4px 10px;font-size:12px;';
            tagsUl.appendChild(li);
        });

        // Body
        const body = document.createElement('div');
        body.className = 'na-body';
        body.contentEditable = true;
        body.innerHTML = bodyHtml;

        // Align like Content Flex: wrap inner content to limit width and add side padding
        const wrap = document.createElement('div');
        wrap.className = 'na-wrap';
        wrap.style.cssText = 'max-width:1100px;margin:0 auto;padding:8px 16px;';
        wrap.appendChild(header);
        wrap.appendChild(body);

        section.appendChild(wrap);

        this.makeSelectable(section);
        this.makeEditable(header.querySelector('.na-title'));
        return section;
    }

    // CONTENT: Flexible content block with optional side images
    static createContentFlex(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-content-flex';
        section.setAttribute('data-component', 'content-flex');
        section.id = this.generateId('content_flex');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const titleTxt = options.title || 'Titel van de sectie';
        const subTxt = options.subtitle || 'Korte subtitel of inleiding';
        const bodyTxt = options.body || 'Dit is een standaard content blok. Voeg hier je tekst toe.';
        const layout = options.layout || 'none'; // none|left|right|both
        const edge = !!options.edgeToEdge; // blocked by default
        const imgHeight = Number(options.imageHeight || 260) || 260;
        const radius = Number(options.radius || 14) || 14;
        const shadow = options.shadow !== false; // true by default

        // Structure
        const wrap = document.createElement('div');
        wrap.className = 'cf-wrap';

        const header = document.createElement('div');
        header.className = 'cf-header';
        const h1 = document.createElement('h2'); h1.className='cf-title'; h1.textContent = titleTxt; h1.contentEditable = true;
        const h2 = document.createElement('p'); h2.className='cf-subtitle'; h2.textContent = subTxt; h2.contentEditable = true;
        header.appendChild(h1); header.appendChild(h2);

        const content = document.createElement('div');
        content.className = 'cf-content';

        const left = document.createElement('div'); left.className='cf-media left';
        const leftImg = document.createElement('img'); leftImg.alt=''; left.appendChild(leftImg);
        const right = document.createElement('div'); right.className='cf-media right';
        const rightImg = document.createElement('img'); rightImg.alt=''; right.appendChild(rightImg);

        const text = document.createElement('div');
        text.className = 'cf-text';
        const p = document.createElement('div'); p.className='cf-body'; p.contentEditable = true; p.innerHTML = bodyTxt;
        text.appendChild(p);

        content.appendChild(left);
        content.appendChild(text);
        content.appendChild(right);

        wrap.appendChild(header);
        wrap.appendChild(content);
        section.appendChild(wrap);

        // Apply runtime settings
        section._layout = layout;
        section._imgHeight = imgHeight;
        section._radius = radius;
        section._shadow = shadow;
        if (edge) section.classList.add('edge-to-edge');

        const applyLayout = () => {
            section.classList.toggle('layout-none', section._layout==='none');
            section.classList.toggle('layout-left', section._layout==='left');
            section.classList.toggle('layout-right', section._layout==='right');
            section.classList.toggle('layout-both', section._layout==='both');
        };
        const applyStyles = () => {
            section.style.setProperty('--cf-img-height', section._imgHeight+'px');
            section.style.setProperty('--cf-radius', section._radius+'px');
            section.classList.toggle('cf-shadow', !!section._shadow);
        };

        applyLayout();
        applyStyles();

        // Media pickers
        left.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if (!leftImg) return;
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(leftImg, u); } } catch (e) {}
        });
        right.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if (!rightImg) return;
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(rightImg, u); } } catch (e) {}
        });

        // Interactions
        this.makeSelectable(section);

        // API for properties
        section.__contentFlexApi = {
            setTitle: (t)=>{ h1.textContent = t || ''; },
            setSubtitle: (t)=>{ h2.textContent = t || ''; },
            setBodyHtml: (html)=>{ p.innerHTML = html || ''; },
            setLayout: (mode)=>{ section._layout = ['none','left','right','both'].includes(mode)?mode:'none'; applyLayout(); },
            setEdgeToEdge: (on)=>{ section.classList.toggle('edge-to-edge', !!on); },
            setImageHeight: (px)=>{ section._imgHeight = Math.max(120, parseInt(px,10)||260); applyStyles(); },
            setRadius: (px)=>{ section._radius = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setShadow: (on)=>{ section._shadow = !!on; applyStyles(); },
            pickLeft: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(leftImg, u); }catch (e) {} },
            pickRight: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(rightImg, u); }catch (e) {} },
        };

        return section;
    }

    // FORMS: Jotform Embed (inline iframe or popup later)
    static createJotformEmbed(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-jotform';
        section.setAttribute('data-component', 'jotform-embed');
        section.id = this.generateId('jotform');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        section._formId = String(options.formId || '233194240465353');
        section._height = parseInt(options.height, 10) || 1200;
        section._borderRadius = parseInt(options.radius, 10) || 12;
        section._shadow = options.shadow !== false; // true by default

        // Wrapper
        const wrap = document.createElement('div');
        wrap.style.maxWidth = '1100px';
        wrap.style.margin = '0 auto';
        wrap.style.background = '#ffffff';
        wrap.style.border = '1px solid #e5e7eb';
        wrap.style.borderRadius = section._borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.boxShadow = section._shadow ? '0 6px 20px rgba(0,0,0,0.06)' : 'none';

        const iframe = document.createElement('iframe');
        iframe.title = 'Jotform';
        iframe.style.width = '100%';
        iframe.style.height = section._height + 'px';
        iframe.style.border = '0';
        // Use generic domain; Jotform will route as needed
        iframe.src = `https://form.jotform.com/${encodeURIComponent(section._formId)}`;

        wrap.appendChild(iframe);
        section.appendChild(wrap);

        // Interactions
        this.makeSelectable(section);

        // API for properties panel
        section.__jotformApi = {
            setFormId: (id) => {
                const val = String(id || '').trim();
                if (!val) return;
                section._formId = val;
                iframe.src = `https://form.jotform.com/${encodeURIComponent(val)}`;
            },
            setHeight: (px) => {
                const h = Math.max(400, parseInt(px, 10) || section._height);
                section._height = h;
                iframe.style.height = h + 'px';
            },
            setRadius: (px) => {
                const r = Math.max(0, parseInt(px,10) || 0);
                section._borderRadius = r;
                wrap.style.borderRadius = r + 'px';
            },
            setShadow: (on) => {
                section._shadow = !!on;
                wrap.style.boxShadow = on ? '0 6px 20px rgba(0,0,0,0.06)' : 'none';
            }
        };

        return section;
    }

    // MEDIA: Horizontal row of photos with optional carousel
    static createMediaRow(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-media-row';
        section.setAttribute('data-component', 'media-row');
        section.id = this.generateId('media_row');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const urls = options.images || [
            'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493550495486-2e3c0c6f5083?q=80&w=1200&auto=format&fit=crop'
        ];
        section._gap = options.gap ?? 16;          // px, 0 for no spacing
        section._height = options.height ?? 200;   // px
        section._radius = options.radius ?? 14;    // px
        section._shadow = options.shadow ?? true;  // boolean
        section._carousel = options.carousel ?? true; // boolean
        section._layout = options.layout || 'uniform'; // 'uniform' | 'spotlight'
        section._layoutPattern = options.layoutPattern || 'first'; // for spotlight: 'first' | 'center' | 'last'

        // Per-item meta (label, href) preserved across renders
        const meta = Array.from({ length: urls.length }, () => ({ label: '', href: '' }));

        // Track container
        const track = document.createElement('div');
        track.className = 'mr-track';
        section.appendChild(track);

        // Arrows for carousel
        const left = document.createElement('button');
        left.className = 'mr-arrow left'; left.type = 'button'; left.innerHTML = '<i class="fas fa-chevron-left"></i>';
        const right = document.createElement('button');
        right.className = 'mr-arrow right'; right.type = 'button'; right.innerHTML = '<i class="fas fa-chevron-right"></i>';
        section.appendChild(left); section.appendChild(right);

        // Autoplay timer (edge-to-edge)
        let autoTimer = null;
        const stopAutoplay = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
        const startAutoplay = () => {
            stopAutoplay();
            const isEdge = section.classList.contains('edge-to-edge');
            if (!isEdge || !section._carousel) return;
            const interval = Number(section._autoPlayMs || 3500) || 3500;
            autoTimer = setInterval(() => {
                const amt = scrollAmount()*2 || 0;
                if (!amt) return;
                // if near end, go back to start
                const nearEnd = (track.scrollLeft + track.clientWidth) >= (track.scrollWidth - 4);
                if (nearEnd) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: amt, behavior: 'smooth' });
                }
            }, interval);
        };

        const applyStyles = () => {
            track.style.gap = section._gap + 'px';
            track.style.setProperty('--mr-item-height', section._height + 'px');
            track.style.setProperty('--mr-item-radius', section._radius + 'px');
            track.classList.toggle('shadow-on', !!section._shadow);
            section.classList.toggle('carousel-on', !!section._carousel);
            section.classList.toggle('layout-spotlight', section._layout === 'spotlight');
            // Layout behavior
            if (section._carousel) {
                track.style.gridAutoColumns = 'minmax(220px, 1fr)';
                track.style.overflowX = 'auto';
                track.style.scrollSnapType = 'x mandatory';
            } else {
                track.style.gridAutoColumns = '1fr';
                track.style.overflowX = 'hidden';
                track.style.scrollSnapType = 'none';
            }
            // Edge-to-edge: enable autoplay, hide arrows handled by CSS
            if (section.classList.contains('edge-to-edge')) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        };

        const applyLayout = () => {
            // Reset spans
            Array.from(track.children).forEach(it => { it.style.gridColumn = ''; });
            if (!section._carousel && section._layout === 'spotlight') {
                const items = track.querySelectorAll('.mr-item');
                if (items.length >= 3) {
                    let idx = 0;
                    if (section._layoutPattern === 'center') idx = 1; // second item
                    else if (section._layoutPattern === 'last') idx = 2; // third item
                    const el = items[idx];
                    if (el) el.style.gridColumn = 'span 2';
                }
            }
        };

        const renderItems = (arr) => {
            track.innerHTML = '';
            (arr || []).forEach((src, i) => {
                const item = document.createElement('div');
                item.className = 'mr-item';
                item.setAttribute('draggable', 'true');
                item.dataset.index = String(i);
                const img = document.createElement('img');
                img.alt = 'Media row image';
                img.decoding = 'async'; img.loading = 'lazy';
                __WB_applyResponsiveSrc(img, src);
                item.appendChild(img);
                // Optional meta placeholders
                const m = meta[i] || { label: '', href: '' };
                item._label = m.label || '';
                item._href = m.href || '';
                // Overlay with label (visual only in editor)
                const overlay = document.createElement('div');
                overlay.className = 'mr-info';
                overlay.innerHTML = `<span class="mr-label">${(m.label||'').replace(/</g,'&lt;')}</span>`;
                item.appendChild(overlay);
                // Replace button (explicit trigger avoids drag conflicts)
                const rep = document.createElement('button');
                rep.type = 'button';
                rep.className = 'mr-replace';
                rep.innerHTML = '<i class="fas fa-photo-film"></i>';
                rep.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                        const res = await window.MediaPicker.openImage();
                        const newSrc = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (!newSrc) return;
                        const list = Array.from(track.querySelectorAll('img')).map(n=>n.currentSrc || n.src);
                        list[i] = newSrc;
                        renderItems(list);
                    } catch(err) { console.warn('Media select canceled/failed', err); }
                });
                item.appendChild(rep);
                // Click to replace via MediaPicker
                item.style.cursor = 'pointer';
                item.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const newSrc = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (!newSrc) return;
                        const list = Array.from(track.querySelectorAll('img')).map(n=>n.src);
                        list[i] = newSrc;
                        renderItems(list);
                    } catch(err) { console.warn('Media select canceled/failed', err); }
                });
                track.appendChild(item);
            });
            attachDnD();
            applyLayout();
        };

        renderItems(urls);
        applyStyles();

        // Carousel behavior
        const scrollAmount = () => {
            const first = track.querySelector('.mr-item');
            if (!first) return 0;
            const gap = section._gap || 0;
            return first.clientWidth + gap;
        };
        left.addEventListener('click', (e)=>{ e.stopPropagation(); stopAutoplay(); track.scrollBy({left: -scrollAmount()*2, behavior:'smooth'}); });
        right.addEventListener('click', (e)=>{ e.stopPropagation(); stopAutoplay(); track.scrollBy({left: scrollAmount()*2, behavior:'smooth'}); });

        // Selection
        this.makeSelectable(section);

        // API for properties panel
        section.__mediaRowApi = {
            setImages: (arr) => { renderItems(arr || []); },
            addImages: (arr) => {
                const current = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                const next = current.concat(arr||[]);
                while (meta.length < next.length) meta.push({ label: '', href: '' });
                renderItems(next);
            },
            reorder: (fromIdx, toIdx) => {
                const imgs = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                const from = Math.max(0, Math.min(fromIdx, imgs.length-1));
                const to = Math.max(0, Math.min(toIdx, imgs.length-1));
                if (from === to) return;
                const movedImg = imgs.splice(from, 1)[0];
                const movedMeta = meta.splice(from, 1)[0] || { label: '', href: '' };
                imgs.splice(to, 0, movedImg);
                meta.splice(to, 0, movedMeta);
                renderItems(imgs);
            },
            setGap: (px) => { section._gap = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setHeight: (px) => { section._height = Math.max(80, parseInt(px,10)||200); applyStyles(); },
            setRadius: (px) => { section._radius = Math.max(0, parseInt(px,10)||0); applyStyles(); },
            setShadow: (on) => { section._shadow = !!on; applyStyles(); },
            setCarousel: (on) => { section._carousel = !!on; applyStyles(); },
            setLayout: (mode) => { section._layout = (mode === 'spotlight') ? 'spotlight' : 'uniform'; applyStyles(); applyLayout(); },
            setLayoutPattern: (pat) => { section._layoutPattern = (pat==='center'||pat==='last')?pat:'first'; applyLayout(); },
            setItemMeta: (index, {label, href}={}) => {
                meta[index] = { label: label || '', href: href || '' };
                const it = track.children[index];
                if (it) {
                    it._label = meta[index].label;
                    it._href = meta[index].href;
                    const ol = it.querySelector('.mr-info .mr-label');
                    if (ol) ol.textContent = meta[index].label || '';
                }
            },
            getImages: () => Array.from(track.querySelectorAll('img')).map(i=>i.src)
        };

        function attachDnD() {
            let dragIndex = -1;
            track.querySelectorAll('.mr-item').forEach((el, idx) => {
                el.addEventListener('dragstart', (e) => {
                    dragIndex = idx;
                    el.classList.add('dragging');
                    e.dataTransfer?.setData('text/plain', String(idx));
                });
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    dragIndex = -1;
                });
                el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drop-target'); });
                el.addEventListener('dragleave', () => { el.classList.remove('drop-target'); });
                el.addEventListener('drop', (e) => {
                    e.preventDefault();
                    el.classList.remove('drop-target');
                    const toIdx = Array.from(track.children).indexOf(el);
                    if (dragIndex < 0 || toIdx < 0 || toIdx === dragIndex) return;
                    const imgs = Array.from(track.querySelectorAll('img')).map(i=>i.src);
                    const moved = imgs.splice(dragIndex, 1)[0];
                    imgs.splice(toIdx, 0, moved);
                    renderItems(imgs);
                });
            });
        }

        return section;
    }

    // Simple Hero for internal pages with big word overlay
    static createHeroPage(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-page edge-to-edge';
        section.setAttribute('data-component', 'hero-page');
        section.id = this.generateId('hero_page');

        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const bgUrl = options.background || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop';
        const height = options.height || '600px';
        const overlayOpacity = options.overlayOpacity ?? 0.45;
        const wordText = options.wordText ?? 'NIEUWS';
        const wordColor = options.wordColor || '#ffffff';
        const wordSize = options.wordSize || '200px';
        const wordOpacity = options.wordOpacity ?? 1;
        const wordLeft = options.wordLeft || '5%';
        const wordBottom = options.wordBottom || '-6px';

        // Background
        const bg = document.createElement('div');
        bg.className = 'hp-bg';
        const img = document.createElement('img');
        __WB_applyResponsiveSrc(img, bgUrl);
        img.alt = 'Hero background';
        img.decoding = 'async';
        img.loading = 'eager';
        bg.appendChild(img);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hp-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Word layer (optional)
        const word = document.createElement('div');
        word.className = 'hp-word';
        word.textContent = wordText;
        word.contentEditable = true;
        word.style.color = wordColor;
        word.style.fontSize = wordSize;
        word.style.opacity = String(wordOpacity);
        word.style.left = wordLeft;
        word.style.bottom = wordBottom;

        section.style.minHeight = height;

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(word);

        this.makeSelectable(section);
        this.makeEditable(word);

        // --- Media chooser: behave like other media components ---
        const mediaBtn = document.createElement('button');
        mediaBtn.type = 'button';
        mediaBtn.className = 'hero-media-chooser';
        mediaBtn.title = 'Achtergrond wijzigen (afbeelding)';
        mediaBtn.innerHTML = '<i class="fas fa-photo-video"></i>';
        section.appendChild(mediaBtn);

        const openImagePicker = async () => {
            try {
                let src = '';
                if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                    const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    src = (result && (
                        result.fullUrl || result.regularUrl || result.url || result.dataUrl ||
                        result.src || result.imageUrl || result.downloadUrl || ''
                    )) || '';
                    try { console.debug('[hero-page] media chosen src', src, result); } catch (e) {}
                }
                if (!src) return;
                if (typeof window.__WB_applyResponsiveSrc === 'function') {
                    window.__WB_applyResponsiveSrc(img, src);
                } else if (typeof __WB_applyResponsiveSrc === 'function') {
                    __WB_applyResponsiveSrc(img, src);
                } else {
                    img.src = src;
                }
            } catch (e) { console.warn('Hero image select canceled/failed', e); }
        };

        mediaBtn.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });
        // Also allow clicking background to change when selected
        bg.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });

        return section;
    }

    // HERO: Full-bleed banner with gradient overlay + CTA buttons
    static createHeroBannerCta(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-banner edge-to-edge';
        section.setAttribute('data-component', 'hero-banner-cta');
        section.id = this.generateId('hero_banner');
        // Default crossfade transition variables
        section.style.setProperty('--hero-xfade-duration', '.35s');
        section.style.setProperty('--hero-xfade-easing', 'ease');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        // Defaults
        const bgUrl = options.background || 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop';
        const title = options.title || 'Build your next great website';
        const subtitle = options.subtitle || 'Beautiful, responsive and fast. Designed for modern teams.';
        const overlayOpacity = options.overlayOpacity ?? 0.45;
        const primaryText = options.primaryText || 'Get Started';
        const primaryHref = options.primaryHref || '#';
        const secondaryText = options.secondaryText || 'Learn More';
        const secondaryHref = options.secondaryHref || '#';
        const height = options.height || '560px';

        // Background (image mode by default)
        const bg = document.createElement('div');
        bg.className = 'hero-bg';
        const imgA = document.createElement('img');
        const imgB = document.createElement('img');
        // Ensure images receive the current transition variables and hint for smoother fades
        try {
            const cs = getComputedStyle(section);
            const dur = cs.getPropertyValue('--hero-xfade-duration').trim() || '.35s';
            const easing = cs.getPropertyValue('--hero-xfade-easing').trim() || 'ease';
            imgA.style.setProperty('--hero-xfade-duration', dur);
            imgA.style.setProperty('--hero-xfade-easing', easing);
            imgB.style.setProperty('--hero-xfade-duration', dur);
            imgB.style.setProperty('--hero-xfade-easing', easing);
        } catch (e) {}
        imgA.style.willChange = 'opacity';
        imgB.style.willChange = 'opacity';
        __WB_applyResponsiveSrc(imgA, bgUrl);
        imgA.alt = 'Hero background';
        imgA.decoding = 'async';
        imgA.loading = 'eager';
        imgA.setAttribute('fetchpriority', 'high');
        imgB.alt = 'Hero background';
        imgB.decoding = 'async';
        imgB.loading = 'eager';
        imgA.style.opacity = '1';
        imgB.style.opacity = '0';
        bg.appendChild(imgA);
        bg.appendChild(imgB);
        // Track active layer and transition type
        section._activeImg = 'A';
        section._imgA = imgA;
        section._imgB = imgB;
        section._transitionType = section._transitionType || 'fade'; // 'fade' | 'slide'

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Content
        const content = document.createElement('div');
        content.className = 'hero-content';

        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.textContent = title;
        h1.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'hero-subtitle';
        p.textContent = subtitle;
        p.contentEditable = true;

        const ctas = document.createElement('div');
        ctas.className = 'hero-cta';
        ctas.innerHTML = `
            <a class="btn btn-primary" href="${primaryHref}" target="_self"><span contenteditable="true">${primaryText}</span></a>
            <a class="btn outline" href="${secondaryHref}" target="_self"><span contenteditable="true">${secondaryText}</span></a>
        `;

        section.style.minHeight = height;

        // Widget mount point (hidden until used)
        const widgetWrap = document.createElement('div');
        widgetWrap.className = 'hero-widget-wrap';
        widgetWrap.style.display = 'none';
        widgetWrap.style.width = '100%';
        widgetWrap.style.maxWidth = '1100px';
        widgetWrap.style.margin = '0 auto';
        widgetWrap.style.borderRadius = '10px';
        widgetWrap.style.overflow = 'hidden';

        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(widgetWrap);
        content.appendChild(ctas);

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(content);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h1);
        this.makeEditable(p);

        // --- Media chooser button (top-right) ---
        const mediaBtn = document.createElement('button');
        mediaBtn.type = 'button';
        mediaBtn.className = 'hero-media-chooser';
        mediaBtn.title = 'Achtergrond wijzigen (afbeelding, slideshow of YouTube)';
        mediaBtn.innerHTML = '<i class="fas fa-photo-video"></i>';
        section.appendChild(mediaBtn);

        // Helper: clear any video layer
        const removeVideoLayer = () => {
            const video = section.querySelector('.hero-video');
            if (video) video.remove();
        };

        // Helper: stop slideshow if running
        const stopSlideshow = () => {
            if (section._slideshowTimer) {
                clearInterval(section._slideshowTimer);
                section._slideshowTimer = null;
            }
            section._slides = null;
            section._slideIndex = 0;
        };

        // Apply single image background
        const setImageBg = (url) => {
            removeVideoLayer();
            stopSlideshow();
            const current = section._activeImg === 'A' ? section._imgA : section._imgB;
            const next = section._activeImg === 'A' ? section._imgB : section._imgA;
            // prepare next based on transition
            if (section._transitionType === 'slide') {
                next.style.transform = 'translateX(10%)';
            }
            next.style.opacity = '0';
            next.onload = () => {
                // Fade in next, fade out current
                requestAnimationFrame(() => {
                    if (section._transitionType === 'slide') {
                        next.style.transform = 'translateX(0)';
                        current.style.transform = 'translateX(-6%)';
                    }
                    next.style.opacity = '1';
                    current.style.opacity = '0';
                });
                section._activeImg = section._activeImg === 'A' ? 'B' : 'A';
            };
            __WB_applyResponsiveSrc(next, url);
        };

        // Apply slideshow from array of urls
        const setSlideshow = (urls, intervalMs = 3500) => {
            removeVideoLayer();
            stopSlideshow();
            if (!urls || urls.length === 0) return;
            section._slides = urls.slice();
            section._slideIndex = 0;
            section._slideshowInterval = intervalMs;
            // Initialize on current active layer without fade
            const current = section._activeImg === 'A' ? section._imgA : section._imgB;
            const nextImg = section._activeImg === 'A' ? section._imgB : section._imgA;
            current.style.opacity = '1';
            current.style.transform = 'translateX(0)';
            nextImg.style.opacity = '0';
            nextImg.style.transform = section._transitionType === 'slide' ? 'translateX(10%)' : 'translateX(0)';
            __WB_applyResponsiveSrc(current, section._slides[0]);
            // Skip slideshow animations during edit to avoid jank
            if (document.body && document.body.dataset && document.body.dataset.wbMode === 'edit') {
                return;
            }
            section._slideshowTimer = setInterval(() => {
                if (!section._slides || section._slides.length === 0) return;
                section._slideIndex = (section._slideIndex + 1) % section._slides.length;
                const url = section._slides[section._slideIndex];
                const showing = section._activeImg === 'A' ? section._imgA : section._imgB;
                const hidden = section._activeImg === 'A' ? section._imgB : section._imgA;
                // prepare hidden for entry
                if (section._transitionType === 'slide') {
                    hidden.style.transform = 'translateX(10%)';
                }
                hidden.style.opacity = '0';
                hidden.onload = () => {
                    requestAnimationFrame(() => {
                        if (section._transitionType === 'slide') {
                            hidden.style.transform = 'translateX(0)';
                            showing.style.transform = 'translateX(-6%)';
                        }
                        hidden.style.opacity = '1';
                        showing.style.opacity = '0';
                    });
                    section._activeImg = section._activeImg === 'A' ? 'B' : 'A';
                };
                __WB_applyResponsiveSrc(hidden, url);
            }, intervalMs);
        };

        // Apply YouTube video background
        const setYouTubeBg = (embedUrl) => {
            const isEdit = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
            stopSlideshow();
            if (isEdit) {
                removeVideoLayer && removeVideoLayer();
                let ph = section.querySelector('.hero-video-ph');
                if (!ph) {
                    ph = document.createElement('div');
                    ph.className = 'hero-video-ph';
                    ph.style.position = 'absolute';
                    ph.style.top = '0';
                    ph.style.left = '0';
                    ph.style.right = '0';
                    ph.style.bottom = '0';
                    ph.style.backgroundSize = 'cover';
                    ph.style.backgroundPosition = 'center';
                    ph.style.cursor = 'pointer';
                    const btn = document.createElement('div');
                    btn.className = 'hero-video-play';
                    btn.style.position = 'absolute';
                    btn.style.top = '50%';
                    btn.style.left = '50%';
                    btn.style.transform = 'translate(-50%, -50%)';
                    btn.style.width = '68px';
                    btn.style.height = '48px';
                    btn.style.borderRadius = '8px';
                    btn.style.background = 'rgba(0,0,0,.45)';
                    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)';
                    btn.style.pointerEvents = 'none';
                    btn.innerHTML = '<svg viewBox="0 0 68 48" style="width:100%;height:100%"><path d="M66.52 7.74a8 8 0 0 0-5.65-5.66C56.5 1 34 1 34 1S11.5 1 7.13 2.08A8 8 0 0 0 1.48 7.74 83.3 83.3 0 0 0 0 24a83.3 83.3 0 0 0 1.48 16.26 8 8 0 0 0 5.65 5.66C11.5 47 34 47 34 47s22.5 0 26.87-1.08a8 8 0 0 0 5.65-5.66A83.3 83.3 0 0 0 68 24a83.3 83.3 0 0 0-1.48-16.26Z" fill="#212121" fill-opacity=".8"/><path d="M45 24 27 14v20" fill="#fff"/></svg>';
                    ph.appendChild(btn);
                    section.insertBefore(ph, overlay);
                }
                try {
                    const url = new URL(embedUrl);
                    const m = url.pathname.match(/\/embed\/([^\/?#]+)/);
                    const vid = m ? m[1] : '';
                    if (vid) ph.style.backgroundImage = `url(https://img.youtube.com/vi/${vid}/hqdefault.jpg)`;
                } catch (e) {}
                ph.onclick = () => {
                    const overlayBg = document.createElement('div');
                    overlayBg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center';
                    const box = document.createElement('div');
                    box.style.cssText = 'position:relative;width:min(90vw,960px);aspect-ratio:16/9;background:#000;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.4);overflow:hidden';
                    const close = document.createElement('button');
                    close.textContent = 'Ãƒ””';
                    close.setAttribute('aria-label','Sluiten');
                    close.style.cssText = 'position:absolute;top:8px;right:12px;width:32px;height:32px;border:none;border-radius:6px;background:rgba(0,0,0,.5);color:#fff;font-size:20px;line-height:1;cursor:pointer;z-index:2';
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('title', 'Video preview');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
                    const url = new URL(embedUrl);
                    const params = url.searchParams;
                    if (!params.has('autoplay')) params.set('autoplay', '1');
                    const opts = section._ytOptions || { mute: true, start: 0 };
                    if (opts.mute === false) { params.delete('mute'); } else { params.set('mute', '1'); }
                    if (!params.has('controls')) params.set('controls', '1');
                    if (!params.has('loop')) params.set('loop', '0');
                    const vidIdMatch = url.pathname.match(/\/embed\/([^\/?#]+)/);
                    if (vidIdMatch && !params.has('playlist')) params.set('playlist', vidIdMatch[1]);
                    const startSec = Math.max(0, parseInt(opts.start, 10) || 0);
                    if (startSec > 0) params.set('start', String(startSec)); else params.delete('start');
                    url.search = params.toString();
                    iframe.src = url.toString();
                    const cleanup = () => { try { document.body.removeChild(overlayBg); } catch (e) {} };
                    close.onclick = cleanup;
                    overlayBg.onclick = (e) => { if (e.target === overlayBg) cleanup(); };
                    box.appendChild(iframe);
                    box.appendChild(close);
                    overlayBg.appendChild(box);
                    document.body.appendChild(overlayBg);
                };
                return;
            }
            let videoWrap = section.querySelector('.hero-video');
            if (!videoWrap) {
                videoWrap = document.createElement('div');
                videoWrap.className = 'hero-video';
                const iframe = document.createElement('iframe');
                iframe.setAttribute('title', 'Hero Background Video');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.style.position = 'absolute';
                iframe.style.top = '50%';
                iframe.style.left = '50%';
            const url = new URL(embedUrl);
            const params = url.searchParams;
            if (!params.has('autoplay')) params.set('autoplay', '1');
            const opts = section._ytOptions || { mute: true, start: 0 };
            if (opts.mute === false) { params.delete('mute'); } else { params.set('mute', '1'); }
            if (!params.has('controls')) params.set('controls', '1');
            if (!params.has('loop')) params.set('loop', '0');
            const vidIdMatch = url.pathname.match(/\/embed\/([^\/?#]+)/);
            if (vidIdMatch && !params.has('playlist')) params.set('playlist', vidIdMatch[1]);
            const startSec = Math.max(0, parseInt(opts.start, 10) || 0);
            if (startSec > 0) params.set('start', String(startSec)); else params.delete('start');
            url.search = params.toString();
            iframe.src = url.toString();
            const cleanup = () => { try { document.body.removeChild(overlayBg); } catch (e) {} };
            close.onclick = cleanup;
            overlayBg.onclick = (e) => { if (e.target === overlayBg) cleanup(); };
            box.appendChild(iframe);
            box.appendChild(close);
            overlayBg.appendChild(box);
            document.body.appendChild(overlayBg);
                if (!w || !h) return;
                const containerRatio = w / h;
                const videoRatio = 16 / 9;
                if (containerRatio < videoRatio) {
                    // container is taller -> match height, expand width
                    iframe.style.height = '100%';
                    iframe.style.width = `${Math.ceil(h * videoRatio)}px`;
                } else {
                    // container is wider -> match width, expand height
                    iframe.style.width = '100%';
                    iframe.style.height = `${Math.ceil(w / videoRatio)}px`;
                }
            };
            fitVideo();
            // Avoid multiple listeners
            if (!section._ytResizeHandler) {
                section._ytRafId = null;
                section._ytResizeHandler = () => {
                    if (section._ytRafId) cancelAnimationFrame(section._ytRafId);
                    section._ytRafId = requestAnimationFrame(() => { section._ytRafId = null; fitVideo(); });
                };
                try { window.addEventListener('resize', section._ytResizeHandler, { passive: true }); }
                catch (e) { window.addEventListener('resize', section._ytResizeHandler); }
            }
        };

        // Helper: clear any widget
        const removeWidgetLayer = () => {
            if (widgetWrap.firstChild) widgetWrap.innerHTML = '';
            widgetWrap.style.display = 'none';
            // Restore title/subtitle/ctas visibility
            h1.style.display = '';
            p.style.display = '';
            ctas.style.display = '';
        };

        // Add a widget via iframe inside content
        const setWidget = (url, heightPx = 560) => {
            stopSlideshow();
            removeVideoLayer();
            removeWidgetLayer();
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = `${Math.max(320, parseInt(heightPx, 10) || 560)}px`;
            iframe.style.border = '0';
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('allow', 'clipboard-write; fullscreen');
            widgetWrap.appendChild(iframe);
            // Apply style preferences
            section._widgetStyle = section._widgetStyle || 'card';
            section._widgetMax = section._widgetMax || 1100;
            widgetWrap.classList.remove('card','edge');
            widgetWrap.classList.add(section._widgetStyle);
            widgetWrap.style.setProperty('--wb-widget-max', section._widgetMax + 'px');
            widgetWrap.style.display = 'block';
            // Optionally hide title/subtitle/ctas if widget should dominate
            h1.style.display = 'none';
            p.style.display = 'none';
            ctas.style.display = 'none';
        };

        const updateWidgetStyle = (style = 'card', maxWidthPx = 1100) => {
            section._widgetStyle = style;
            section._widgetMax = maxWidthPx;
            widgetWrap.classList.remove('card','edge');
            widgetWrap.classList.add(style);
            widgetWrap.style.setProperty('--wb-widget-max', maxWidthPx + 'px');
        };

        // Click handler: open image picker (single image). Slideshow/YouTube via Properties panel.
        mediaBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = result && (result.dataUrl || result.url || result.regularUrl || result.fullUrl);
                if (src) setImageBg(src);
            } catch (err) {
                console.warn('Media kiezen geannuleerd/mislukt', err);
            }
        });

        // Expose minimal API for Properties panel
        section.__heroBannerApi = {
            setImage: (url) => setImageBg(url),
            setSlideshow: (urls, ms) => setSlideshow(urls, ms || section._slideshowInterval || 3500),
            setYouTube: (embed) => { section._ytEmbedBase = embed; setYouTubeBg(embed); },
            setWidget: (url, height) => setWidget(url, height),
            clearWidget: () => removeWidgetLayer(),
            updateWidgetStyle: (style, maxPx) => updateWidgetStyle(style, maxPx),
            stopSlideshow: () => stopSlideshow(),
            isSlideshow: () => Array.isArray(section._slides) && section._slides.length > 1,
            updateYouTubeOptions: (updates = {}) => {
                const prev = Object.assign({}, section._ytOptions || { mute: true, start: 0 });
                section._ytOptions = Object.assign({}, prev, updates);
                const onlyStartChanged = ('start' in updates) && Object.keys(updates).every(k => k === 'start' || k === 'apply');
                const explicitApply = updates && updates.apply === true;
                if (onlyStartChanged && !explicitApply) {
                    // Do not reload iframe for start typing; wait for explicit apply or other option changes
                    clearTimeout(section._ytOptTimer);
                    section._ytOptTimer = setTimeout(() => {
                        // If user stops typing for a while, still avoid reload unless apply:true later
                    }, 500);
                    return;
                }
                // Apply strategy: if caller sets apply:true, apply quickly; otherwise debounce.
                clearTimeout(section._ytOptTimer);
                const delay = explicitApply ? 60 : 350;
                section._ytOptTimer = setTimeout(() => {
                    if (section._ytEmbedBase) setYouTubeBg(section._ytEmbedBase);
                }, delay);
            },
            applyYouTube: () => { if (section._ytEmbedBase) setYouTubeBg(section._ytEmbedBase); },
            getYouTubeOptions: () => Object.assign({}, section._ytOptions || { mute: true, start: 0 })
        };

        return section;
    }

    // CONTENT: Feature Highlight (big photo with inset, badge, metric; right side list)
    static createFeatureHighlight(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-feature-highlight';
        section.setAttribute('data-component', 'feature-highlight');
        section.id = this.generateId('feature_highlight');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const position = options.position === 'right' ? 'right' : 'left';
        if (position === 'right') section.classList.add('right');

        // Defaults
        const mainImg = options.mainImg || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';
        const insetImg = options.insetImg || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop';
        const badgeIcon = options.badgeIcon || 'fa-map-marker-alt';
        const metricNumber = options.metricNumber || '28';
        const metricLabel = options.metricLabel || 'Years of experience';
        const label = options.label || 'About Company';
        const title = options.title || 'Great opportunity for adventure & travels';
        const items = options.items || [
            { icon: 'fa-shield-alt', title: 'Safety first always', text: 'Set perspiciatis unde omnis estenatus voluptatem totarem aperiae.' },
            { icon: 'fa-hand-holding-usd', title: 'Low price & friendly', text: 'Quis autem vel eum iure voluptate velit esse nihilie consequat.' },
            { icon: 'fa-compass', title: 'Trusted travel guide', text: 'At vero accusamus dignissimos ducimus blanditiis deleniti atque quos.' }
        ];

        // Layout
        const wrap = document.createElement('div');
        wrap.className = 'fh-wrap';

        // Media column
        const media = document.createElement('div');
        media.className = 'fh-media';
        media.innerHTML = `
            <div class="fh-main">
                <img src="${mainImg}" alt="Feature image" />
                <div class="fh-badge"><i class="fas ${badgeIcon}"></i></div>
                <div class="fh-metric">
                    <div class="num" contenteditable="true">${metricNumber}</div>
                    <div class="lbl" contenteditable="true">${metricLabel}</div>
                </div>
            </div>
            <div class="fh-inset"><img src="${insetImg}" alt="Inset image" /></div>
        `;

        // Content column
        const content = document.createElement('div');
        content.className = 'fh-content';
        content.innerHTML = `
            <div class="fh-label" contenteditable="true">${label}</div>
            <h2 class="fh-title" contenteditable="true">${title}</h2>
            <div class="fh-list"></div>
        `;
        const list = content.querySelector('.fh-list');
        items.forEach(it => {
            const row = document.createElement('div');
            row.className = 'fh-item';
            row.innerHTML = `
                <div class="fh-bullet"><span></span></div>
                <div class="fh-ic"><i class="fas ${it.icon}"></i></div>
                <div class="fh-text">
                    <div class="fh-item-title" contenteditable="true">${it.title}</div>
                    <div class="fh-item-sub" contenteditable="true">${it.text}</div>
                </div>
            `;
            list.appendChild(row);
        });

        // Assemble
        if (position === 'left') {
            wrap.appendChild(media);
            wrap.appendChild(content);
        } else {
            wrap.appendChild(content);
            wrap.appendChild(media);
        }
        section.appendChild(wrap);

        // Interactions
        this.makeSelectable(section);

        return section;
    }

    // CONTACT: Label + Title + 3 Icon Cards (address/email/hotline)
    static createContactInfo(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-contact-info';
        section.setAttribute('data-component', 'contact-info');
        section.id = this.generateId('contact_info');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const labelTxt = options.label || 'Contact us';
        const titleTxt = options.title || 'Ready to Get our best Services!\nFeel free to contact with us';

        const defaults = options.cards || [
            { icon: 'fa-location-dot', title: 'Office Location', lines: ['55 Main Street', '2nd Floor New York'] },
            { icon: 'fa-envelope', title: 'Email Address', lines: ['contact@example.com', 'info@example.com'] },
            { icon: 'fa-phone', title: 'Hotline', lines: ['+1(307) 776Ã¢â‚¬“0608', '666 8888 000'] }
        ];

        // Header
        const header = document.createElement('div');
        header.className = 'ci-header';
        header.innerHTML = `
            <span class="ci-label" contenteditable="true">${labelTxt}</span>
            <h2 class="ci-title" contenteditable="true">${titleTxt}</h2>
        `;

        // Grid
        const grid = document.createElement('div');
        grid.className = 'ci-grid';
        defaults.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'ci-card';
            card.innerHTML = `
                <div class="ci-icon"><i class="fas ${c.icon}"></i></div>
                <h4 class="ci-card-title" contenteditable="true">${c.title}</h4>
                <p class="ci-line" contenteditable="true">${c.lines[0] || ''}</p>
                <p class="ci-line" contenteditable="true">${c.lines[1] || ''}</p>
            `;
            grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);

        // Interactions
        this.makeSelectable(section);
        // inline edits already contentEditable

        return section;
    }

    // CONTACT: Map with overlay CTA banner
    static createContactMapCta(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-contact-mapcta';
        section.setAttribute('data-component', 'contact-map-cta');
        section.id = this.generateId('contact_map_cta');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const mapUrl = options.mapUrl || 'https://www.openstreetmap.org/export/embed.html?bbox=-0.489%2C51.28%2C0.236%2C51.686&layer=mapnik&marker=51.507%2C-0.127';
        const title = options.title || 'Ready to adventure and enjoy natural';
        const subtitle = options.subtitle || 'Feel free to explore';
        const ctaText = options.ctaText || 'Explore More';
        const ctaHref = options.ctaHref || '#';
        const height = options.height || '420px';

        const mapWrap = document.createElement('div');
        mapWrap.className = 'cmc-map';
        mapWrap.style.height = height;
        mapWrap.innerHTML = `<iframe src="${mapUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" aria-label="Map"></iframe>`;

        const banner = document.createElement('div');
        banner.className = 'cmc-banner';
        banner.innerHTML = `
            <div class="cmc-left">
                <div class="cmc-icon"><i class="fas fa-map"></i></div>
                <div class="cmc-text">
                    <h3 class="cmc-title" contenteditable="true">${title}</h3>
                    <p class="cmc-subtitle" contenteditable="true">${subtitle}</p>
                </div>
            </div>
            <a class="btn cmc-cta cmc-cta-white" href="${ctaHref}" target="_self"><span>${ctaText}</span></a>
        `;

        section.appendChild(mapWrap);
        section.appendChild(banner);

        this.makeSelectable(section);
        return section;
    }

    static createHeroTravel(options = {}) {
        const section = document.createElement('section');
        // Default fullwidth for hero
        section.className = 'wb-component wb-hero-travel edge-to-edge';
        section.setAttribute('data-component', 'hero-travel');
        section.id = this.generateId('hero_travel');

        // Defaults
        const bgUrl = options.background || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop';
        const title = options.title || 'Where Would You Like To Go?';
        const subtitle = options.subtitle || 'Checkout Beautiful Places Around the World.';
        const overlayOpacity = options.overlayOpacity ?? 0.45;

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(section);

        // Force-Remove control (safety remove button for stubborn cases)
        const kill = document.createElement('button');
        kill.className = 'wb-dev-remove';
        kill.type = 'button';
        kill.title = 'Sectie verwijderen';
        kill.innerHTML = '<i class="fas fa-trash"></i>';
        kill.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                section.remove();
            }
        });
        section.appendChild(kill);

        // Background image (use <img> for better sharpness)
        const bg = document.createElement('div');
        bg.className = 'hero-bg';
        const bgImg = document.createElement('img');
        bgImg.className = 'hero-bg-img';
        bgImg.src = bgUrl;
        bgImg.alt = 'Hero background';
        bgImg.decoding = 'async';
        bgImg.loading = 'eager';
        bg.appendChild(bgImg);

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.setProperty('--overlay-opacity', overlayOpacity);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'hero-content';

        // Badge
        const badge = document.createElement('div');
        badge.className = 'hero-badge';
        badge.textContent = "Let's Explore";

        // Headings
        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.textContent = title;
        h1.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'hero-subtitle';
        p.textContent = subtitle;
        p.contentEditable = true;

        // Search bar
        const search = document.createElement('div');
        search.className = 'hero-search';
        search.innerHTML = `
            <div class="search-item">
                <label><i class="fas fa-location-dot"></i> Location</label>
                <div class="value" contenteditable="true">Where to Next?</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-shapes"></i> Type</label>
                <div class="value" contenteditable="true">Trip Types</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-clock"></i> Duration</label>
                <div class="value" contenteditable="true">3 Days - 3 Days</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-dollar-sign"></i> Price</label>
                <div class="value" contenteditable="true">$189 - $659</div>
            </div>
            <button class="btn btn-primary search-btn"><i class="fas fa-search"></i> Search</button>
        `;

        // Bridge search to app via CustomEvent
        const searchBtn = search.querySelector('.search-btn');
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const values = search.querySelectorAll('.search-item .value');
            const getVal = (i) => (values[i]?.textContent || '').trim();
            const payload = {
                location: getVal(0),
                type: getVal(1),
                duration: getVal(2),
                price: getVal(3),
                sectionId: section.id
            };
            const evt = new CustomEvent('heroSearch', { bubbles: true, detail: payload });
            section.dispatchEvent(evt);
        });

        // Decorative arrow
        const deco = document.createElement('div');
        deco.className = 'hero-deco';
        deco.innerHTML = '<i class="fas fa-angles-down"></i>';

        // Cards overlap
        const cardsWrap = document.createElement('div');
        cardsWrap.className = 'hero-cards-wrap';
        const cards = document.createElement('div');
        cards.className = 'hero-cards';

        const defaultCards = options.cards || [
            { icon: 'fa-campground', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-umbrella-beach', title: 'Beach', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-compass', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-globe', title: 'Discovery', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-person-biking', title: 'Mountain Biking', text: 'Lorem ipsum is simply sit of free text dolor.' }
        ];

        defaultCards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.innerHTML = `
                <div class="icon"><i class="fas ${c.icon}"></i></div>
                <h4 contenteditable="true">${c.title}</h4>
                <div class="sep"></div>
                <p contenteditable="true">${c.text}</p>
            `;
            cards.appendChild(card);
        });

        cardsWrap.appendChild(cards);

        // Assemble
        content.appendChild(badge);
        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(search);
        content.appendChild(deco);

        section.appendChild(bg);
        section.appendChild(overlay);
        section.appendChild(content);
        section.appendChild(cardsWrap);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h1);
        this.makeEditable(p);

        return section;
    }

    // MEDIA: Soorten Reizen grid (8 cards)
    static createTravelTypes(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-travel-types';
        section.setAttribute('data-component', 'travel-types');
        section.id = this.generateId('travel_types');

        // Toolbar + badge
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        this.addTypeBadge(section);

        const title = options.title || 'Soorten Reizen';
        const subtitle = options.subtitle || 'Kies jouw perfecte reistype';

        const defaults = options.cards || [
            { label: 'Zonvakanties', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Stedentrips', img: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Rondreizen', img: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Huwelijksreizen', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Luxe Vakanties', img: 'https://images.unsplash.com/photo-1519821172141-b5d8b5d0fa4f?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Wintersport', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'Cruises', img: 'https://images.unsplash.com/photo-1544551763-7ef42032a8d1?q=80&w=1200&auto=format&fit=crop', href: '#' },
            { label: 'All Inclusive', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop', href: '#' }
        ];

        // Content
        const header = document.createElement('div');
        header.className = 'tt-header';
        header.innerHTML = `
            <h2 class="tt-title" contenteditable="true">${title}</h2>
            <p class="tt-subtitle" contenteditable="true">${subtitle}</p>
        `;
        // Isolate header layout/paint to avoid impacting grid while typing
        try { header.style.contain = 'layout paint style'; } catch (e) {}
        try { header.style.contentVisibility = 'auto'; header.style.containIntrinsicSize = '600px 120px'; } catch (e) {}
        // Batch inline title typing to once-per-frame and signal builder to pause saves
        try {
            const titleEl = header.querySelector('.tt-title');
            let _raf = null;
            if (titleEl) {
                titleEl.addEventListener('input', (e) => {
                    // Prevent any global input listeners doing heavy work per keystroke
                    try { e.stopPropagation(); } catch (e) {}
                    if (_raf) return;
                    _raf = requestAnimationFrame(() => {
                        _raf = null;
                        try { window.websiteBuilder && typeof window.websiteBuilder.markTyping === 'function' && window.websiteBuilder.markTyping(800); } catch (e) {}
                    });
                });
            }
        } catch (e) {}

        const grid = document.createElement('div');
        grid.className = 'tt-grid';
        // Contain grid to limit reflow scope when text above changes
        try { grid.style.contain = 'layout paint style'; } catch (e) {}

        // Simple guard to avoid overlapping pickers/updates
        section._ttPickLock = false;

        // Shared replacer using card element (event delegation compatible)
        const pickAndReplaceSafe = async (cardEl) => {
            if (!cardEl) return;
            if (section._ttPickLock) return;
            section._ttPickLock = true;
            try {
                if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl;
                if (!u) return;
                const targetImg = cardEl.querySelector('img');
                if (!targetImg) return;
                try { targetImg.decoding = 'async'; targetImg.loading = 'lazy'; } catch (e) {}
                if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(targetImg, u);
                else if (typeof __WB_applyResponsiveSrc === 'function') __WB_applyResponsiveSrc(targetImg, u);
                else targetImg.src = u;
                try { targetImg.src = u; targetImg.removeAttribute('srcset'); targetImg.removeAttribute('sizes'); } catch (e) {}
                try { await new Promise(requestAnimationFrame); } catch (e) {}
            } catch (e) {}
            finally { section._ttPickLock = false; }
        };

        defaults.forEach((c, i) => {
            const card = document.createElement('a');
            card.className = 'tt-card';
            card.href = c.href || '#';
            card.target = '_self';
            card.setAttribute('data-index', String(i));

            const img = document.createElement('img');
            __WB_applyResponsiveSrc(img, c.img);
            img.alt = c.label;
            img.decoding = 'async';
            img.loading = 'lazy';
            // Avoid layout thrash during decode
            try { img.style.contentVisibility = 'auto'; img.style.containIntrinsicSize = '320px 200px'; } catch (e) {}
            // Helper to open picker and replace image
            const pickAndReplace = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (section._ttPickLock) return;
                section._ttPickLock = true;
                try {
                    if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl;
                    if (!u) return;
                    // Hint the browser to decode off main thread and avoid eager work
                    try { img.decoding = 'async'; img.loading = 'lazy'; } catch (e) {}
                    // Apply responsively; avoid double-setting where possible
                    if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u);
                    else if (typeof __WB_applyResponsiveSrc === 'function') __WB_applyResponsiveSrc(img, u);
                    else img.src = u;
                    // Ensure immediate visual if browser keeps old srcset
                    try { img.src = u; img.removeAttribute('srcset'); img.removeAttribute('sizes'); } catch (e) {}
                    // Yield a frame to keep UI responsive after heavy image decode
                    try { await new Promise(requestAnimationFrame); } catch (e) {}
                } catch (e) {}
                finally { section._ttPickLock = false; }
            };
            // Allow clicking image to replace
            img.style.cursor = 'pointer';
            img.addEventListener('click', pickAndReplace);

            const overlay = document.createElement('div');
            overlay.className = 'tt-overlay';
            overlay.innerHTML = `<span class="tt-label" contenteditable="true">${c.label}</span>`;
            // Clicking overlay opens picker unless label text is targeted
            overlay.addEventListener('click', (e) => {
                const onLabel = e.target && (e.target.closest && e.target.closest('.tt-label'));
                if (onLabel) return; // allow editing label
                return pickAndReplace(e);
            });
            card.appendChild(img);
            card.appendChild(overlay);
            // Fallback: clicking card opens picker (except label)
            card.addEventListener('click', (e) => {
                const onLabel = e.target && (e.target.closest && e.target.closest('.tt-label'));
                if (onLabel) return;
                return pickAndReplace(e);
            });
            grid.appendChild(card);
        });

        // Event delegation: one handler for the whole grid
        try {
            grid.addEventListener('click', (e) => {
                const label = e.target && e.target.closest && e.target.closest('.tt-label');
                if (label) return; // allow label editing
                const card = e.target && e.target.closest && e.target.closest('.tt-card');
                if (!card) return;
                e.preventDefault();
                e.stopPropagation();
                pickAndReplaceSafe(card);
            }, { passive: true });
        } catch (e) {
            grid.addEventListener('click', (e) => {
                const label = e.target && e.target.closest && e.target.closest('.tt-label');
                if (label) return;
                const card = e.target && e.target.closest && e.target.closest('.tt-card');
                if (!card) return;
                e.preventDefault();
                e.stopPropagation();
                pickAndReplaceSafe(card);
            });
        }

        section.appendChild(header);
        section.appendChild(grid);

        // Interactions
        this.makeSelectable(section);

        return section;
    }

    // Hero Travel Video - like hero-travel but with a video background (YouTube iframe)
    static createHeroTravelVideo(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-travel wb-hero-travel-video';
        section.setAttribute('data-component', 'hero-travel-video');
        section.id = this.generateId('hero_travel_video');

        const titleTxt = options.title || 'Waar gaan we heen dit jaar?';
        const subtitleTxt = options.subtitle || 'Ontdek mooie plekken';
        const start = Number(options.start || 0) || 0;
        const videoId = options.videoId || '';

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);

        // Video layer
        const videoWrap = document.createElement('div');
        videoWrap.className = 'hero-video';
        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', 'Hero Background Video');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        // Editor-safe autoplay: disable in edit mode, enable in preview; lazy-load when visible
        const isEditMode = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
        const baseUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        const common = `${start>0?`&start=${start}`:''}&mute=1&controls=0&playsinline=1`;
        const paramsEdit = `autoplay=0&loop=0${common}`;
        const paramsView = `autoplay=1&loop=1&playlist=${videoId}${common}`;
        const targetSrc = videoId ? `${baseUrl}?${isEditMode ? paramsEdit : paramsView}` : 'about:blank';
        try { iframe.dataset.src = targetSrc; } catch (e) { /* older browsers */ }
        
        // In edit mode: show preview button instead of loading iframe
        if (isEditMode && videoId) {
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.className = 'video-preview-btn';
            previewBtn.innerHTML = '<i class="fas fa-play-circle"></i> Preview Video';
            previewBtn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;background:rgba(139,92,246,0.95);color:#fff;border:none;padding:16px 32px;border-radius:50px;font-size:18px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.3);transition:all 0.2s;';
            previewBtn.onmouseover = () => { previewBtn.style.background = 'rgba(139,92,246,1)'; previewBtn.style.transform = 'translate(-50%,-50%) scale(1.05)'; };
            previewBtn.onmouseout = () => { previewBtn.style.background = 'rgba(139,92,246,0.95)'; previewBtn.style.transform = 'translate(-50%,-50%) scale(1)'; };
            previewBtn.onclick = (e) => {
                e.stopPropagation();
                // Create modal
                const modal = document.createElement('div');
                modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
                const modalContent = document.createElement('div');
                modalContent.style.cssText = 'position:relative;width:90%;max-width:1200px;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);';
                const modalIframe = document.createElement('iframe');
                modalIframe.setAttribute('title', 'Video Preview');
                modalIframe.setAttribute('frameborder', '0');
                modalIframe.setAttribute('allow', 'autoplay; fullscreen');
                modalIframe.setAttribute('allowfullscreen', '');
                modalIframe.style.cssText = 'width:100%;height:100%;';
                modalIframe.src = `${baseUrl}?autoplay=1&controls=1&mute=0${start>0?`&start=${start}`:''}`;
                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.style.cssText = 'position:absolute;top:-50px;right:0;background:rgba(255,255,255,0.2);color:#fff;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:20px;transition:all 0.2s;';
                closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(255,255,255,0.3)'; };
                closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(255,255,255,0.2)'; };
                closeBtn.onclick = () => modal.remove();
                modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                modalContent.appendChild(modalIframe);
                modalContent.appendChild(closeBtn);
                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            };
            videoWrap.appendChild(previewBtn);
            // Don't load iframe in edit mode
        } else {
            // Preview/published mode: load iframe normally
            videoWrap.appendChild(iframe);
        }
        try {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach(en => {
                    if (en.isIntersecting) {
                        try {
                            if (iframe.dataset && iframe.dataset.src && iframe.src !== iframe.dataset.src) {
                                iframe.src = iframe.dataset.src;
                            } else if (!iframe.src) {
                                iframe.src = targetSrc;
                            }
                        } catch (e) { try { iframe.src = targetSrc; } catch (e) {} }
                        try { obs.disconnect(); } catch (e) {}
                    }
                });
            }, { root: null, threshold: 0.1 });
            io.observe(videoWrap);
        } catch (e) {
            // Fallback: set src soon
            setTimeout(() => { try { if (iframe.dataset && iframe.dataset.src) iframe.src = iframe.dataset.src; else iframe.src = targetSrc; } catch (e) {} }, 0);
        }

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.setProperty('--overlay-opacity', options.overlayOpacity ?? 0.45);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'hero-content';

        // Badge
        const badge = document.createElement('div');
        badge.className = 'hero-badge';
        badge.textContent = "Let's Explore";

        const h1 = document.createElement('h1');
        h1.className = 'hero-title';
        h1.textContent = titleTxt;
        h1.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'hero-subtitle';
        p.textContent = subtitleTxt;
        p.contentEditable = true;

        // Search bar (reuse same UI)
        const search = document.createElement('div');
        search.className = 'hero-search';
        search.innerHTML = `
            <div class="search-item">
                <label><i class="fas fa-location-dot"></i> Locatie</label>
                <div class="value" contenteditable="true">Where to Next?</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-shapes"></i> Type</label>
                <div class="value" contenteditable="true">Trip Types</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-clock"></i> Duur</label>
                <div class="value" contenteditable="true">3 Days - 3 Days</div>
            </div>
            <div class="divider"></div>
            <div class="search-item">
                <label><i class="fas fa-dollar-sign"></i> Prijs</label>
                <div class="value" contenteditable="true">$189 - $659</div>
            </div>
            <button class="btn btn-primary search-btn"><i class="fas fa-search"></i> Search</button>
        `;

        // Cards overlap (reuse)
        const cardsWrap = document.createElement('div');
        cardsWrap.className = 'hero-cards-wrap';
        const cards = document.createElement('div');
        cards.className = 'hero-cards';
        const defaultCards = options.cards || [
            { icon: 'fa-campground', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-umbrella-beach', title: 'Beach', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-compass', title: 'Adventure', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-globe', title: 'Discovery', text: 'Lorem ipsum is simply sit of free text dolor.' },
            { icon: 'fa-person-biking', title: 'Mountain Biking', text: 'Lorem ipsum is simply sit of free text dolor.' }
        ];
        defaultCards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.innerHTML = `
                <div class="icon"><i class="fas ${c.icon}"></i></div>
                <h4 contenteditable="true">${c.title}</h4>
                <div class="sep"></div>
                <p contenteditable="true">${c.text}</p>
            `;
            cards.appendChild(card);
        });
        cardsWrap.appendChild(cards);

        // Assemble
        content.appendChild(badge);
        content.appendChild(h1);
        content.appendChild(p);
        content.appendChild(search);

        section.appendChild(videoWrap);
        section.appendChild(overlay);
        section.appendChild(content);
        section.appendChild(cardsWrap);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h1);
        this.makeEditable(p);

        return section;
    }

    // Travel Card: Transport
    static createTravelCardTransport(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card transport';
        card.setAttribute('data-component', 'travel-card-transport');
        card.id = this.generateId('travel_card_transport');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const departure = options.departure || 'Amsterdam';
        const arrival = options.arrival || 'Barcelona';
        const airline = options.airline || 'KLM';
        const flightNumber = options.flightNumber || 'KL1234';
        const departureTime = options.departureTime || '10:30';
        const arrivalTime = options.arrivalTime || '13:45';
        const duration = options.duration || '3u 15min';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-plane-departure"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Transport</h3>
                    <div class="subtitle" contenteditable="true">${departure} → ${arrival}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-plane"></i>
                    <span contenteditable="true">${airline} Flight ${flightNumber}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${departureTime} - ${arrivalTime} (${duration})</span>
                </div>
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Hotel
    static createTravelCardHotel(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card hotel';
        card.setAttribute('data-component', 'travel-card-hotel');
        card.id = this.generateId('travel_card_hotel');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const hotelName = options.hotelName || 'Hotel Barcelona Plaza';
        const stars = options.stars || 4;
        const nights = options.nights || 3;
        const persons = options.persons || 2;
        const roomType = options.roomType || 'Standaard kamer';
        const meals = options.meals || 'Ontbijt inbegrepen';
        const description = options.description || '';
        const facilities = options.facilities || [];
        const images = options.images || [];

        const starsHtml = '⭐'.repeat(stars);

        // Create image carousel HTML
        let carouselHtml = '';
        if (images.length > 0) {
            carouselHtml = `
                <div class="wb-travel-card-carousel">
                    <div class="carousel-images">
                        ${images.map((img, idx) => `
                            <div class="carousel-image ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}');"></div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="carousel-prev" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: -300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-next" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: 300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="carousel-dots">
                            ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const content = document.createElement('div');
        content.innerHTML = `
            ${carouselHtml}
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-hotel"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Hotel</h3>
                    <div class="subtitle" contenteditable="true">${hotelName} ${starsHtml}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-bed"></i>
                    <span contenteditable="true">${roomType}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-calendar-days"></i>
                    <span contenteditable="true">${nights} nachten, ${persons} personen</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-utensils"></i>
                    <span contenteditable="true">${meals}</span>
                </div>
                ${facilities.length > 0 ? `
                    <div class="wb-travel-card-facilities">
                        ${facilities.map(f => `<span class="facility"><i class="${f.icon}"></i> ${f.description}</span>`).join('')}
                    </div>
                ` : ''}
                ${description ? `
                    <div class="wb-travel-card-description" contenteditable="true">${description}</div>
                ` : ''}
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Destination
    static createTravelCardDestination(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card destination';
        card.setAttribute('data-component', 'travel-card-destination');
        card.id = this.generateId('travel_card_destination');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const activityName = options.activityName || 'Barcelona City Tour';
        const day = options.day || 'Dag 2';
        const location = options.location || 'Sagrada Familia';
        const duration = options.duration || '3 uur';
        const description = options.description || '';
        const images = options.images || [];

        // Create image carousel HTML
        let carouselHtml = '';
        if (images.length > 0) {
            carouselHtml = `
                <div class="wb-travel-card-carousel">
                    <div class="carousel-images">
                        ${images.map((img, idx) => `
                            <div class="carousel-image ${idx === 0 ? 'active' : ''}" style="background-image: url('${img}');"></div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="carousel-prev" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: -300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-next" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: 300, behavior: 'smooth'})">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="carousel-dots">
                            ${images.map((_, idx) => `<span class="dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const content = document.createElement('div');
        content.innerHTML = `
            ${carouselHtml}
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Bestemming</h3>
                    <div class="subtitle" contenteditable="true">${activityName}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-calendar"></i>
                    <span contenteditable="true">${day}: ${location}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${duration}</span>
                </div>
                ${description ? `
                    <div class="wb-travel-card-description" contenteditable="true">${description}</div>
                ` : ''}
            </div>
        `;
        card.appendChild(content);

        // Store destination data for map integration
        if (options.latitude && options.longitude) {
            card._destinationData = {
                name: activityName,
                latitude: options.latitude,
                longitude: options.longitude,
                fromDay: options.fromDay || 1,
                toDay: options.toDay || 1
            };
        }

        this.makeSelectable(card);
        return card;
    }

    // Travel Card: Transfer
    static createTravelCardTransfer(options = {}) {
        const card = document.createElement('div');
        card.className = 'wb-component wb-travel-card transfer';
        card.setAttribute('data-component', 'travel-card-transfer');
        card.id = this.generateId('travel_card_transfer');

        const toolbar = this.createToolbar();
        card.appendChild(toolbar);
        this.addTypeBadge(card);

        const from = options.from || 'Luchthaven';
        const to = options.to || 'Hotel';
        const transferType = options.transferType || 'Private transfer';
        const duration = options.duration || '30 minuten';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="wb-travel-card-header">
                <div class="wb-travel-card-icon">
                    <i class="fas fa-car"></i>
                </div>
                <div class="wb-travel-card-title">
                    <h3 contenteditable="true">Transfer</h3>
                    <div class="subtitle" contenteditable="true">${from} → ${to}</div>
                </div>
            </div>
            <div class="wb-travel-card-body">
                <div class="wb-travel-card-row">
                    <i class="fas fa-taxi"></i>
                    <span contenteditable="true">${transferType}</span>
                </div>
                <div class="wb-travel-card-row">
                    <i class="fas fa-clock"></i>
                    <span contenteditable="true">${duration}</span>
                </div>
            </div>
        `;
        card.appendChild(content);

        this.makeSelectable(card);
        return card;
    }

    // Travel Day Header
    static createTravelDayHeader(options = {}) {
        const header = document.createElement('div');
        header.className = 'wb-component wb-travel-day-header';
        header.setAttribute('data-component', 'travel-day-header');
        header.id = this.generateId('travel_day_header');

        const toolbar = this.createToolbar();
        header.appendChild(toolbar);
        this.addTypeBadge(header);

        const dayNumber = options.dayNumber || 1;
        const dayTitle = options.dayTitle || `Dag ${dayNumber}`;
        const dayDescription = options.dayDescription || 'Aankomst en check-in';
        const displayMode = options.displayMode || 'standard';
        const backgroundType = options.backgroundType || 'gradient'; // Default to gradient
        const destinations = options.destinations || [];

        // Store settings
        header._displayMode = displayMode;
        header._backgroundType = backgroundType;
        header._backgroundColor = options.backgroundColor || '#667eea';
        header._backgroundImage = options.backgroundImage || '';
        header._backgroundVideo = options.backgroundVideo || '';
        header._overlayOpacity = options.overlayOpacity || 0.5; // Higher default for better text readability
        header._textColor = options.textColor || '#ffffff'; // Default white text
        header._destinations = destinations;

        const content = document.createElement('div');
        content.className = 'day-header-content';
        
        // Get from/to locations from options
        const fromLocation = options.fromLocation || '';
        const toLocation = options.toLocation || '';
        const distance = options.distance || ''; // km for road trips
        const travelTime = options.travelTime || ''; // travel time
        
        // Extract just the description from title if it contains "Dag X"
        const titleText = dayTitle.replace(/^Dag\s+\d+\s*[-:]?\s*/i, '').trim() || dayTitle;
        
        // Check if we need split layout (map or video)
        const useSplitLayout = backgroundType === 'map' || backgroundType === 'video';
        
        if (useSplitLayout) {
            // Split layout: info left, map/video right
            content.innerHTML = `
                <div class="day-header-split">
                    <div class="day-header-left">
                        <div class="day-header-day-number">${dayNumber}</div>
                        <div class="day-header-info">
                            <h2 contenteditable="true">${titleText || 'Dag ' + dayNumber}</h2>
                            <p contenteditable="true">${dayDescription}</p>
                            ${fromLocation && toLocation ? `
                                <div class="day-header-route">
                                    <div class="route-locations">
                                        <span class="route-from"><i class="fas fa-map-marker-alt"></i> ${fromLocation}</span>
                                        <i class="fas fa-arrow-right"></i>
                                        <span class="route-to"><i class="fas fa-map-marker-alt"></i> ${toLocation}</span>
                                    </div>
                                    ${distance || travelTime ? `
                                        <div class="route-details">
                                            ${distance ? `<span class="route-distance"><i class="fas fa-road"></i> ${distance} km</span>` : ''}
                                            ${travelTime ? `<span class="route-time"><i class="fas fa-clock"></i> ${travelTime}</span>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="day-header-right">
                        <div class="day-header-bg-layer"></div>
                    </div>
                </div>
            `;
        } else {
            // Full card layout: background with overlay
            content.innerHTML = `
                <div class="day-header-background">
                    <div class="day-header-bg-layer"></div>
                    <div class="day-header-overlay"></div>
                </div>
                <div class="day-header-foreground">
                    <div class="day-header-info-full">
                        <div class="day-header-day-number">${dayNumber}</div>
                        <div class="day-header-text">
                            <h2 contenteditable="true">${titleText || 'Dag ' + dayNumber}</h2>
                            <p contenteditable="true">${dayDescription}</p>
                            ${fromLocation && toLocation ? `
                                <div class="day-header-route">
                                    <div class="route-locations">
                                        <span class="route-from"><i class="fas fa-map-marker-alt"></i> ${fromLocation}</span>
                                        <i class="fas fa-arrow-right"></i>
                                        <span class="route-to"><i class="fas fa-map-marker-alt"></i> ${toLocation}</span>
                                    </div>
                                    ${distance || travelTime ? `
                                        <div class="route-details">
                                            ${distance ? `<span class="route-distance"><i class="fas fa-road"></i> ${distance} km</span>` : ''}
                                            ${travelTime ? `<span class="route-time"><i class="fas fa-clock"></i> ${travelTime}</span>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        header.appendChild(content);

        // Auto-fetch destinations from Travel Hero if not provided
        if (destinations.length === 0) {
            const travelHero = document.querySelector('.wb-travel-hero');
            if (travelHero && travelHero._destinations && travelHero._destinations.length > 0) {
                header._destinations = travelHero._destinations;
                console.log('[Day Header] Auto-fetched destinations from Travel Hero:', travelHero._destinations.length);
            }
        }

        // Initialize background
        this.updateDayHeaderBackground(header);

        this.makeSelectable(header);
        return header;
    }

    static updateDayHeaderBackground(header) {
        const bgType = header._backgroundType || 'gradient';
        const currentLayout = header.querySelector('.day-header-split') ? 'split' : 'full';
        const needsSplitLayout = bgType === 'map' || bgType === 'video';
        const needsFullLayout = !needsSplitLayout;

        console.log('[Day Header BG]', {
            bgType,
            currentLayout,
            needsSplitLayout,
            needsFullLayout
        });

        // If layout type needs to change, rebuild the entire content
        if ((currentLayout === 'split' && needsFullLayout) || (currentLayout === 'full' && needsSplitLayout)) {
            console.log('[Day Header BG] Layout change needed, rebuilding...');
            
            // Get current values
            const dayNumberEl = header.querySelector('.day-header-day-number');
            const h2 = header.querySelector('h2');
            const p = header.querySelector('p');
            const routeDiv = header.querySelector('.day-header-route');
            
            const dayNumber = dayNumberEl ? dayNumberEl.textContent : '1';
            const titleText = h2 ? h2.textContent : 'Dag 1';
            const description = p ? p.textContent : '';
            const routeHTML = routeDiv ? routeDiv.outerHTML : '';
            
            // Remove old content
            const content = header.querySelector('.day-header-content');
            if (content) {
                content.remove();
            }
            
            // Rebuild with correct layout
            const newContent = document.createElement('div');
            newContent.className = 'day-header-content';
            
            if (needsSplitLayout) {
                // Split layout
                newContent.innerHTML = `
                    <div class="day-header-split">
                        <div class="day-header-left">
                            <div class="day-header-day-number">${dayNumber}</div>
                            <div class="day-header-info">
                                <h2 contenteditable="true">${titleText}</h2>
                                <p contenteditable="true">${description}</p>
                                ${routeHTML}
                            </div>
                        </div>
                        <div class="day-header-right">
                            <div class="day-header-bg-layer"></div>
                        </div>
                    </div>
                `;
            } else {
                // Full card layout
                newContent.innerHTML = `
                    <div class="day-header-background">
                        <div class="day-header-bg-layer"></div>
                        <div class="day-header-overlay"></div>
                    </div>
                    <div class="day-header-foreground">
                        <div class="day-header-info-full">
                            <div class="day-header-day-number">${dayNumber}</div>
                            <div class="day-header-text">
                                <h2 contenteditable="true">${titleText}</h2>
                                <p contenteditable="true">${description}</p>
                                ${routeHTML}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            header.appendChild(newContent);
        }

        // Now update the background
        const bgLayer = header.querySelector('.day-header-bg-layer');
        const overlay = header.querySelector('.day-header-overlay');

        if (!bgLayer) {
            console.warn('[Day Header BG] Missing bg layer!');
            return;
        }

        // Clear previous content
        bgLayer.innerHTML = '';
        bgLayer.style.background = '';
        bgLayer.style.backgroundImage = '';
        bgLayer.style.backgroundSize = '';
        bgLayer.style.backgroundPosition = '';

        // Set overlay opacity (only for full card layouts)
        if (overlay) {
            overlay.style.opacity = header._overlayOpacity || 0.3;
        }

        switch(bgType) {
            case 'color':
                const color = header._backgroundColor || '#667eea';
                bgLayer.style.background = color;
                console.log('[Day Header BG] Applied color:', color);
                break;
            
            case 'gradient':
                const gradStart = header._gradientStart || '#667eea';
                const gradEnd = header._gradientEnd || '#764ba2';
                const gradient = `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`;
                bgLayer.style.background = gradient;
                console.log('[Day Header BG] Applied gradient:', gradient);
                break;
            
            case 'image':
                if (header._backgroundImage) {
                    bgLayer.style.backgroundImage = `url('${header._backgroundImage}')`;
                    bgLayer.style.backgroundSize = 'cover';
                    bgLayer.style.backgroundPosition = 'center';
                    console.log('[Day Header BG] Applied image:', header._backgroundImage);
                } else {
                    console.warn('[Day Header BG] No image URL set!');
                }
                break;
            
            case 'map':
                bgLayer.innerHTML = '<div class="day-header-map" id="day-map-' + header.id + '"></div>';
                console.log('[Day Header BG] Creating map...');
                setTimeout(() => this.initializeDayHeaderMap(header), 100);
                break;
            
            case 'video':
                if (header._backgroundVideo) {
                    const videoId = header._backgroundVideo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/)?.[1] || header._backgroundVideo;
                    console.log('[Day Header BG] Creating video iframe for:', videoId);
                    bgLayer.style.position = 'absolute';
                    bgLayer.style.top = '0';
                    bgLayer.style.left = '0';
                    bgLayer.style.width = '100%';
                    bgLayer.style.height = '100%';
                    bgLayer.innerHTML = `
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        ></iframe>
                    `;
                    console.log('[Day Header BG] Video iframe created');
                } else {
                    console.warn('[Day Header BG] No video ID set!');
                    bgLayer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;background:#f3f4f6;font-size:14px;">🎬 Klik "Video Kiezen" om een achtergrond video te selecteren</div>';
                }
                break;
        }
    }

    static initializeDayHeaderMap(header) {
        const mapContainer = header.querySelector('.day-header-map');
        if (!mapContainer || !window.L) {
            console.warn('[Day Header Map] Missing container or Leaflet');
            return;
        }

        // Get current day number
        const dayNumberEl = header.querySelector('.day-header-day-number');
        const currentDay = dayNumberEl ? parseInt(dayNumberEl.textContent) : 1;

        // Try to get destinations from header, or from Travel Hero
        let allDestinations = header._destinations || [];
        
        if (allDestinations.length === 0) {
            // Try to find Travel Hero and get destinations from there
            const travelHero = document.querySelector('.wb-travel-hero');
            if (travelHero && travelHero._destinations) {
                allDestinations = travelHero._destinations;
                console.log('[Day Header Map] Using destinations from Travel Hero:', allDestinations.length);
            }
        }
        
        if (allDestinations.length === 0) {
            console.warn('[Day Header Map] No destinations found!');
            mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;text-align:center;padding:20px;background:rgba(0,0,0,0.3);font-size:14px;">🗺️ Kaart wordt automatisch geladen met bestemmingen uit Travel Compositor</div>';
            return;
        }

        // Filter destinations for this specific day
        // Find destinations that are active on this day (fromDay <= currentDay <= toDay)
        const dayDestinations = allDestinations.filter(d => 
            d.fromDay <= currentDay && d.toDay >= currentDay
        );
        
        // Also include previous day's destination as starting point
        const prevDayDest = allDestinations.find(d => d.toDay === currentDay - 1);
        
        let routePoints = [];
        if (prevDayDest && prevDayDest.latitude && prevDayDest.longitude) {
            routePoints.push(prevDayDest);
        }
        routePoints = routePoints.concat(dayDestinations);

        if (routePoints.length === 0) {
            console.warn('[Day Header Map] No destinations for day', currentDay);
            mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;text-align:center;padding:20px;font-size:14px;">🗺️ Geen route beschikbaar voor deze dag</div>';
            return;
        }

        // Create map with zoom controls enabled
        const map = L.map(mapContainer.id, {
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);

        // Add route line
        const routeCoords = routePoints.map(d => [d.latitude, d.longitude]);
        
        // Check if this is a car/road route by looking at transport type or distance
        const isCarRoute = header._fromLocation && header._toLocation && 
                          (header._distance || routePoints.some(p => p.transportType === 'car' || p.transportType === 'road'));
        
        if (routeCoords.length > 1) {
            if (isCarRoute) {
                // Try to get driving route from OpenRouteService
                console.log('[Day Header Map] Fetching driving route...');
                this.fetchDrivingRoute(routeCoords, map);
            } else {
                // Draw straight line for flights
                L.polyline(routeCoords, {
                    color: '#ff6b6b',
                    weight: 3,
                    opacity: 0.8,
                    dashArray: '10, 10' // Dashed for flights
                }).addTo(map);
            }
        }

        // Add markers for start and end
        if (routeCoords.length > 0) {
            // Start marker (green)
            L.circleMarker(routeCoords[0], {
                radius: 8,
                fillColor: '#10b981',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);
            
            // End marker (red) - only if different from start
            if (routeCoords.length > 1) {
                L.circleMarker(routeCoords[routeCoords.length - 1], {
                    radius: 8,
                    fillColor: '#ef4444',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);
            }
        }

        // Fit bounds
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [30, 30] });

        header._dayMap = map;
        console.log('[Day Header Map] Created map for day', currentDay, 'with', routePoints.length, 'points');
    }

    static async fetchDrivingRoute(routeCoords, map) {
        if (routeCoords.length < 2) return;
        
        try {
            // Use OpenRouteService for driving directions
            const start = routeCoords[0];
            const end = routeCoords[routeCoords.length - 1];
            
            // Format: longitude,latitude for ORS
            const coords = `${start[1]},${start[0]}|${end[1]},${end[0]}`;
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d5b0c7e3c3f04d6e9b5b3e3e3e3e3e3e&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;
            
            // For now, use a simpler approach with OSRM (no API key needed)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            
            const response = await fetch(osrmUrl);
            const data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Draw the driving route
                L.polyline(coordinates, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8
                }).addTo(map);
                
                // Calculate distance in km
                const distanceKm = (route.distance / 1000).toFixed(0);
                console.log('[Day Header Map] Driving route:', distanceKm, 'km');
                
            } else {
                // Fallback to straight line
                console.warn('[Day Header Map] Could not fetch driving route, using straight line');
                L.polyline(routeCoords, {
                    color: '#3b82f6',
                    weight: 3,
                    opacity: 0.8
                }).addTo(map);
            }
        } catch (error) {
            console.error('[Day Header Map] Error fetching driving route:', error);
            // Fallback to straight line
            L.polyline(routeCoords, {
                color: '#3b82f6',
                weight: 3,
                opacity: 0.8
            }).addTo(map);
        }
    }

    static updateMiniRoadmap(header, currentDay, destinations) {
        const roadmap = header.querySelector('.day-mini-roadmap');
        if (!roadmap || destinations.length === 0) return;

        let html = '<div class="roadmap-dots">';
        
        destinations.forEach((dest, idx) => {
            const isActive = currentDay >= dest.fromDay && currentDay <= dest.toDay;
            const isPast = currentDay > dest.toDay;
            const isFuture = currentDay < dest.fromDay;
            
            let dotClass = 'roadmap-dot';
            if (isActive) dotClass += ' active';
            if (isPast) dotClass += ' past';
            if (isFuture) dotClass += ' future';
            
            html += `
                <div class="roadmap-item">
                    <div class="${dotClass}">${idx + 1}</div>
                    <span class="roadmap-label">${dest.name}</span>
                </div>
            `;
            
            // Add connector line if not last
            if (idx < destinations.length - 1) {
                html += '<div class="roadmap-line"></div>';
            }
        });
        
        html += '</div>';
        roadmap.innerHTML = html;
    }

    static applyDayDisplayMode(dayHeader, mode) {
        // Find all cards between this day header and the next one
        const cards = [];
        let nextElement = dayHeader.nextElementSibling;
        
        while (nextElement && !nextElement.classList.contains('wb-travel-day-header')) {
            if (nextElement.classList.contains('wb-travel-card')) {
                cards.push(nextElement);
            }
            nextElement = nextElement.nextElementSibling;
        }

        // Apply mode to cards
        cards.forEach(card => {
            card.classList.remove('display-standard', 'display-accordion', 'display-compact');
            card.classList.add(`display-${mode}`);
            
            // Remove existing expand button if any
            const existingBtn = card.querySelector('.card-expand-btn');
            if (existingBtn) existingBtn.remove();
            
            // Add expand button for compact mode
            if (mode === 'compact') {
                const expandBtn = document.createElement('button');
                expandBtn.className = 'card-expand-btn';
                expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                expandBtn.title = 'Uitklappen';
                expandBtn.onclick = (e) => {
                    e.stopPropagation();
                    card.classList.toggle('expanded');
                    expandBtn.innerHTML = card.classList.contains('expanded') 
                        ? '<i class="fas fa-chevron-up"></i>' 
                        : '<i class="fas fa-chevron-down"></i>';
                };
                card.appendChild(expandBtn);
            }
        });

        // For accordion mode, add toggle functionality
        if (mode === 'accordion') {
            dayHeader.classList.add('accordion-mode');
            dayHeader.onclick = (e) => {
                if (e.target.closest('.toolbar-btn') || e.target.closest('.day-display-mode')) return;
                dayHeader.classList.toggle('expanded');
                cards.forEach(card => {
                    card.style.display = dayHeader.classList.contains('expanded') ? 'block' : 'none';
                });
            };
            // Start collapsed
            if (!dayHeader.classList.contains('expanded')) {
                cards.forEach(card => card.style.display = 'none');
            }
        } else {
            dayHeader.classList.remove('accordion-mode', 'expanded');
            dayHeader.onclick = null;
            cards.forEach(card => card.style.display = 'block');
        }
    }

    // Travel Timeline Container
    static createTravelTimeline(options = {}) {
        const timeline = document.createElement('section');
        timeline.className = 'wb-component wb-travel-timeline';
        timeline.setAttribute('data-component', 'travel-timeline');
        timeline.id = this.generateId('travel_timeline');

        const toolbar = this.createToolbar();
        timeline.appendChild(toolbar);
        this.addTypeBadge(timeline);

        // Add example content
        const day1 = this.createTravelDayHeader({ dayNumber: 1, dayTitle: 'Dag 1', dayDescription: 'Aankomst' });
        const transport1 = this.createTravelCardTransport({});
        const transfer1 = this.createTravelCardTransfer({});
        const hotel1 = this.createTravelCardHotel({});

        timeline.appendChild(day1);
        timeline.appendChild(transport1);
        timeline.appendChild(transfer1);
        timeline.appendChild(hotel1);

        this.makeSelectable(timeline);
        return timeline;
    }

    static createContainer(options = {}) {
        const container = document.createElement('div');
        container.className = 'wb-component wb-container empty';
        container.setAttribute('data-component', 'container');
        container.id = this.generateId('container');
        
        // Toolbar
        const toolbar = this.createToolbar();
        container.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(container);
        
        // Drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone-small';
        dropZone.innerHTML = '<i class="fas fa-plus"></i> Sleep componenten hier';
        container.appendChild(dropZone);
        
        this.makeDroppable(container);
        this.makeSelectable(container);
        
        return container;
    }

    static createRow(options = {}) {
        const row = document.createElement('div');
        row.className = 'wb-component wb-row empty';
        row.setAttribute('data-component', 'row');
        row.id = this.generateId('row');
        
        // Toolbar
        const toolbar = this.createToolbar();
        row.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(row);
        
        // Default columns
        const columnsCount = options.columns || 2;
        for (let i = 0; i < columnsCount; i++) {
            const column = this.createColumn();
            row.appendChild(column);
        }
        
        this.makeSelectable(row);
        
        return row;
    }

    static createColumn(options = {}) {
        const column = document.createElement('div');
        column.className = 'wb-component wb-column empty';
        column.setAttribute('data-component', 'column');
        column.id = this.generateId('column');
        
        // Toolbar
        const toolbar = this.createToolbar();
        column.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(column);
        
        // Drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone-small';
        dropZone.innerHTML = '<i class="fas fa-plus"></i> Voeg content toe';
        column.appendChild(dropZone);
        
        this.makeDroppable(column);
        this.makeSelectable(column);
        
        return column;
    }

    static createHeading(options = {}) {
        const level = options.level || 'h2';
        const text = options.text || 'Nieuwe titel';
        
        const heading = document.createElement(level);
        heading.className = `wb-component wb-heading ${level}`;
        heading.setAttribute('data-component', 'heading');
        heading.id = this.generateId('heading');
        heading.textContent = text;
        heading.contentEditable = true;
        
        // Toolbar
        const toolbar = this.createToolbar();
        heading.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(heading);
        
        this.makeSelectable(heading);
        this.makeEditable(heading);
        
        return heading;
    }

    static createText(options = {}) {
        const text = options.text || 'Klik om te bewerken. Dit is een tekst paragraaf die je kunt aanpassen naar je eigen wensen.';
        
        const paragraph = document.createElement('p');
        paragraph.className = 'wb-component wb-text editable';
        paragraph.setAttribute('data-component', 'text');
        paragraph.id = this.generateId('text');
        paragraph.textContent = text;
        paragraph.contentEditable = true;
        
        // Toolbar
        const toolbar = this.createToolbar();
        paragraph.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(paragraph);
        
        this.makeSelectable(paragraph);
        this.makeEditable(paragraph);
        
        return paragraph;
    }

    static createImage(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-image placeholder';
        wrapper.setAttribute('data-component', 'image');
        wrapper.id = this.generateId('image');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(wrapper);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-image';
        
        const text = document.createElement('p');
        text.textContent = 'Klik om een afbeelding toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to choose media via MediaPicker
        wrapper.addEventListener('click', async () => {
            try {
                const result = await window.MediaPicker.openImage();
                const src = result.dataUrl || result.url;
                if (!src) return;

                wrapper.className = 'wb-component wb-image';
                wrapper.innerHTML = '';
                wrapper.appendChild(toolbar);

                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Selected image';
                wrapper.appendChild(img);
            } catch (err) {
                console.warn('MediaPicker canceled or failed', err);
            }
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    // Feature + Media block: text with image/video on left or right
    static createFeatureMedia(options = {}) {
        const position = options.position === 'right' ? 'right' : 'left'; // default left
        const mediaType = options.mediaType === 'video' ? 'video' : 'image';
        const label = options.label || 'Onze expertise';
        const title = options.title || 'Waarom kiezen voor ons?';
        const subtitle = options.subtitle || 'Subtitel met een korte samenvatting om context te geven.';
        const text = options.text || 'Korte toelichting over deze feature sectie. Deze tekst is bewerkbaar.';
        const features = options.features || [
            { icon: 'fa-check', label: 'Betrouwbare service' },
            { icon: 'fa-check', label: 'Persoonlijke aanpak' },
            { icon: 'fa-check', label: 'Scherpe prijzen' }
        ];

        const section = document.createElement('section');
        section.className = `wb-component wb-feature-media ${position}`;
        section.setAttribute('data-component', 'feature-media');
        section.id = this.generateId('feature_media');

        // Toolbar
        const toolbar = this.createToolbar();
        section.appendChild(toolbar);
        // Type badge
        this.addTypeBadge(section);

        const inner = document.createElement('div');
        inner.className = 'fm-inner';

        const media = document.createElement('div');
        // Add a default depth class for subtle 3D effect; user can change via Properties
        media.className = 'fm-media depth-2';

        const content = document.createElement('div');
        content.className = 'fm-content';

        // Declare chooser reference early to avoid TDZ in helper functions
        let mediaChooser;

        // Helper to (re)open media picker
        // helper for responsive Unsplash images
        const applyResponsiveSrc = (imageEl, url) => {
            try {
                const u = new URL(url);
                if (u.hostname.includes('images.unsplash.com')) {
                    const base = `${u.origin}${u.pathname}`;
                    const params = u.searchParams;
                    const q = params.get('q') || '80';
                    const auto = params.get('auto') || 'format';
                    const fit = params.get('fit') || 'crop';
                    const src1200 = `${base}?q=${q}&w=1200&auto=${auto}&fit=${fit}`;
                    const src1800 = `${base}?q=${q}&w=1800&auto=${auto}&fit=${fit}`;
                    const src2400 = `${base}?q=${q}&w=2400&auto=${auto}&fit=${fit}`;
                    imageEl.src = src1200;
                    imageEl.srcset = `${src1200} 1200w, ${src1800} 1800w, ${src2400} 2400w`;
                    imageEl.sizes = '100vw';
                    return;
                }
            } catch (e) {}
            imageEl.src = url;
        };

        const openImagePicker = async () => {
            try {
                let src = '';
                if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                    const result = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    src = result.fullUrl || result.regularUrl || result.dataUrl || result.url || '';
                } else {
                    // Fallback: native file input
                    await new Promise((resolve) => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return resolve();
                            const reader = new FileReader();
                            reader.onload = (ev) => { src = ev.target.result; resolve(); };
                            reader.readAsDataURL(file);
                        };
                        input.click();
                    });
                }
                if (!src) return;
                media.innerHTML = '';
                const img = document.createElement('img');
                __WB_applyResponsiveSrc(img, src);
                img.alt = 'Feature media';
                media.appendChild(img);
                if (mediaChooser) media.appendChild(mediaChooser); // keep chooser overlay
            } catch(err) { console.warn('Image select canceled/failed', err); }
        };

        // Media placeholder according to type
        if (mediaType === 'video') {
            const ph = document.createElement('div');
            ph.className = 'fm-video placeholder';
            ph.innerHTML = '<i class="fas fa-video"></i><span> Klik om video te kiezen</span>';
            ph.addEventListener('click', (e) => { e.stopPropagation(); openVideoPicker(); });
            media.appendChild(ph);
        } else {
            const ph = document.createElement('div');
            ph.className = 'fm-image placeholder';
            ph.innerHTML = '<i class="fas fa-image"></i><span> Klik om afbeelding te kiezen</span>';
            ph.addEventListener('click', (e) => { e.stopPropagation(); openImagePicker(); });
            media.appendChild(ph);
        }

        // Also open pickers if clicking the media area while placeholder is present
        media.addEventListener('click', (e) => {
            const hasImagePh = !!media.querySelector('.fm-image.placeholder');
            const hasVideoPh = !!media.querySelector('.fm-video.placeholder');
            if (hasImagePh) { e.stopPropagation(); openImagePicker(); }
            else if (hasVideoPh) { e.stopPropagation(); openVideoPicker(); }
        });

        // Media chooser overlay button (always present)
        mediaChooser = document.createElement('button');
        mediaChooser.type = 'button';
        mediaChooser.className = 'fm-media-chooser';
        mediaChooser.innerHTML = `<i class="fas ${mediaType === 'video' ? 'fa-video' : 'fa-camera'}"></i>`;
        mediaChooser.title = mediaType === 'video' ? 'Video wijzigen' : 'Afbeelding wijzigen';
        mediaChooser.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mediaType === 'video') return openVideoPicker();
            return openImagePicker();
        });
        media.appendChild(mediaChooser);

        // Textual content
        const labelEl = document.createElement('div');
        labelEl.className = 'fm-label';
        labelEl.textContent = label;

        const h2 = document.createElement('h2');
        h2.className = 'fm-title';
        h2.textContent = title;
        h2.contentEditable = true;

        const sub = document.createElement('p');
        sub.className = 'fm-subtitle';
        sub.textContent = subtitle;
        sub.contentEditable = true;

        const p = document.createElement('p');
        p.className = 'fm-text';
        p.textContent = text;
        p.contentEditable = true;

        const list = document.createElement('ul');
        list.className = 'fm-features';
        features.forEach(f => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas ${f.icon}"></i><span contenteditable="true">${f.label}</span>`;
            list.appendChild(li);
        });

        // Order according to position
        if (position === 'right') {
            inner.appendChild(content);
            inner.appendChild(media);
        } else {
            inner.appendChild(media);
            inner.appendChild(content);
        }

        content.appendChild(labelEl);
        content.appendChild(h2);
        content.appendChild(sub);
        content.appendChild(p);
        content.appendChild(list);

        // CTA bar
        const cta = document.createElement('div');
        cta.className = 'fm-cta';
        cta.innerHTML = `
            <a class="btn btn-primary" href="#" target="_blank"><span contenteditable="true">Plan een gesprek</span></a>
            <a class="btn btn-secondary outline" href="#" target="_blank"><span contenteditable="true">Meer info</span></a>
        `;
        // Allow double-click to set link
        cta.querySelectorAll('a.btn').forEach(a => {
            a.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const current = a.getAttribute('href') || '';
                const url = prompt('Voer een link URL in (bijv. https://voorbeeld.nl):', current);
                if (url !== null) {
                    a.setAttribute('href', url || '#');
                }
            });
        });
        content.appendChild(cta);

        section.appendChild(inner);

        // Interactions
        this.makeSelectable(section);
        this.makeEditable(h2);
        this.makeEditable(sub);
        this.makeEditable(p);

        return section;
    }

    static createButton(options = {}) {
        const text = options.text || 'Klik hier';
        const style = options.style || 'primary';
        
        const wrapper = document.createElement('div');
        wrapper.className = `wb-component wb-button ${style}`;
        wrapper.setAttribute('data-component', 'button');
        wrapper.id = this.generateId('button');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        const button = document.createElement('button');
        button.textContent = text;
        button.contentEditable = true;
        
        wrapper.appendChild(button);
        
        this.makeSelectable(wrapper);
        this.makeEditable(button);
        
        return wrapper;
    }

    static createVideo(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-video placeholder';
        wrapper.setAttribute('data-component', 'video');
        wrapper.id = this.generateId('video');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-video';
        
        const text = document.createElement('span');
        text.textContent = 'Klik om video URL toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to add video via MediaPicker
        wrapper.addEventListener('click', async () => {
            try {
                const result = await window.MediaPicker.openVideo();
                let url = '';
                if (result.embedUrl) {
                    url = result.embedUrl;
                } else if (result.url) {
                    url = result.url;
                }
                if (!url) return;
                this.embedVideo(wrapper, url, toolbar);
            } catch (err) {
                console.warn('MediaPicker canceled or failed', err);
            }
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    static createGallery(options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wb-component wb-gallery placeholder';
        wrapper.setAttribute('data-component', 'gallery');
        wrapper.id = this.generateId('gallery');
        
        // Toolbar
        const toolbar = this.createToolbar();
        wrapper.appendChild(toolbar);
        
        // Placeholder content
        const icon = document.createElement('i');
        icon.className = 'fas fa-images';
        
        const text = document.createElement('p');
        text.textContent = 'Klik om afbeeldingen toe te voegen';
        
        wrapper.appendChild(icon);
        wrapper.appendChild(text);
        
        // Click to upload multiple images
        wrapper.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    this.createImageGallery(wrapper, files, toolbar);
                }
            };
            input.click();
        });
        
        this.makeSelectable(wrapper);
        
        return wrapper;
    }

    // Helper methods
    static createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'component-toolbar';

        const editBtn = document.createElement('button');
        editBtn.className = 'toolbar-btn';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Bewerken';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'toolbar-btn';
        copyBtn.setAttribute('data-action', 'copy');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'KopiÃƒÂ«ren';

        // Move Up/Down buttons
        const upBtn = document.createElement('button');
        upBtn.className = 'toolbar-btn';
        upBtn.setAttribute('data-action', 'move-up');
        upBtn.title = 'Omhoog verplaatsen';
        upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';

        const downBtn = document.createElement('button');
        downBtn.className = 'toolbar-btn';
        downBtn.setAttribute('data-action', 'move-down');
        downBtn.title = 'Omlaag verplaatsen';
        downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';

        // AI Fill button (for content blocks)
        const aiBtn = document.createElement('button');
        aiBtn.className = 'toolbar-btn toolbar-btn-ai';
        aiBtn.setAttribute('data-action', 'ai-fill');
        aiBtn.title = 'AI vullen';
        aiBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>';
        aiBtn.style.cssText = 'background:#8b5cf6;color:#fff;';

        // Copy handler
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            const clone = component.cloneNode(true);
            clone.id = ComponentFactory.generateId(clone.getAttribute('data-component'));
            component.parentElement.insertBefore(clone, component.nextSibling);
            // Rebind toolbar events on the clone
            ComponentFactory.rebindToolbar(clone);
            ComponentFactory.makeSelectable(clone);
        });

        // Move handlers
        const moveUp = (component) => {
            const parent = component?.parentElement; if (!parent) return;
            let prev = component.previousElementSibling;
            while (prev && !prev.classList.contains('wb-component')) prev = prev.previousElementSibling;
            if (prev) parent.insertBefore(component, prev);
            try { window.dragDropManager?.saveState?.(); } catch (e) {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
            component.classList.add('selected');
        };
        const moveDown = (component) => {
            const parent = component?.parentElement; if (!parent) return;
            let next = component.nextElementSibling;
            while (next && !next.classList.contains('wb-component')) next = next.nextElementSibling;
            if (next) parent.insertBefore(next, component);
            try { window.dragDropManager?.saveState?.(); } catch (e) {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
            component.classList.add('selected');
        };
        upBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveUp(comp); });
        downBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveDown(comp); });

        // AI handler
        aiBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            try {
                await ComponentFactory.fillWithAI(component);
            } catch (err) {
                console.warn('AI fill failed', err);
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('AI vullen mislukt', 'error');
                }
            }
        });

        toolbar.appendChild(editBtn);
        toolbar.appendChild(copyBtn);
        toolbar.appendChild(upBtn);
        toolbar.appendChild(downBtn);
        toolbar.appendChild(aiBtn);
        
        return toolbar;
    }

    static addTypeBadge(element) {
        try {
            const type = element.getAttribute('data-component') || '';
            const map = {
                'container': 'fa-square',
                'row': 'fa-grip-lines',
                'column': 'fa-columns',
                'heading': 'fa-heading',
                'text': 'fa-paragraph',
                'image': 'fa-image',
                'button': 'fa-mouse-pointer',
                'video': 'fa-video',
                'gallery': 'fa-images',
                'hero-travel': 'fa-mountain-sun',
                'feature-media': 'fa-square-split-horizontal',
                'feature-highlight': 'fa-image',
                'travel-types': 'fa-th-large',
                'contact-info': 'fa-address-card',
                'contact-map-cta': 'fa-map-location-dot',
                'media-row': 'fa-images',
                'news-article': 'fa-newspaper'
            };
            const icon = map[type];
            if (!icon) return;
            // Remove existing badge if any (e.g., on clone)
            element.querySelector('.wb-type-badge')?.remove();
            const badge = document.createElement('div');
            badge.className = 'wb-type-badge';
            badge.innerHTML = `<i class="fas ${icon}"></i>`;
            element.appendChild(badge);
        } catch (e) { /* noop */ }
    }

    static makeDroppable(element) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        
        element.addEventListener('dragleave', (e) => {
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
            }
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const componentType = e.dataTransfer.getData('text/plain');
            if (componentType) {
                const newComponent = this.createComponent(componentType);
                if (newComponent) {
                    // Remove empty class and drop zone
                    element.classList.remove('empty');
                    const dropZone = element.querySelector('.drop-zone-small');
                    if (dropZone) {
                        dropZone.remove();
                    }
                    
                    element.appendChild(newComponent);
                    newComponent.classList.add('fade-in');
                }
            }
        });
    }

    static makeSelectable(element) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove selection from other elements
            document.querySelectorAll('.wb-component.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Select this element
            element.classList.add('selected');
            
            // Update properties panel
            if (window.PropertiesPanel) {
                try { ComponentFactory.ensureApiFor(element); } catch (e) {}
                window.PropertiesPanel.showProperties(element);
            }
        });
    }

    static makeEditable(element) {
        element.addEventListener('blur', () => {
            // Save changes when element loses focus
            console.log('Content updated:', element.textContent);
        });
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        });
    }

    static embedVideo(wrapper, url, toolbar) {
        let embedUrl = '';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(url);
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com')) {
            const videoId = this.extractVimeoId(url);
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        
        if (embedUrl) {
            wrapper.className = 'wb-component wb-video';
            wrapper.innerHTML = '';
            wrapper.appendChild(toolbar);
            
            const isEditMode = !!(document.body && document.body.dataset && document.body.dataset.wbMode === 'edit');
            try {
                const u = new URL(embedUrl);
                const p = u.searchParams;
                const isYT = /youtube\.com|youtu\.be/.test(u.href);
                const isVimeo = /vimeo\.com/.test(u.href);
                // Controls: on in editor, minimal in view
                p.set('controls', isEditMode ? '1' : (isYT ? '0' : p.get('controls') || '0'));
                // Autoplay/loop/mute
                p.set('autoplay', isEditMode ? '0' : '1');
                p.set('loop', isEditMode ? '0' : '1');
                if (isYT) {
                    p.set('playsinline', '1');
                    if (!p.has('mute')) p.set('mute', '1');
                    // For YouTube loop to work reliably, playlist must equal video id
                    const m = u.pathname.match(/\/embed\/([^\/?#]+)/);
                    if (!isEditMode && m && !p.has('playlist')) p.set('playlist', m[1]);
                }
                if (isVimeo) {
                    // Vimeo-specific safe params
                    if (!p.has('muted')) p.set('muted', isEditMode ? '0' : '1');
                    if (!p.has('background')) p.set('background', isEditMode ? '0' : '1');
                }
                u.search = p.toString();
                embedUrl = u.toString();
            } catch (e) {}

            const iframe = document.createElement('iframe');
            iframe.setAttribute('title', 'Embedded Video');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            try { iframe.dataset.src = embedUrl; } catch (e) {}

            // Lazy-load when visible
            try {
                const io = new IntersectionObserver((entries, obs) => {
                    entries.forEach(en => {
                        if (en.isIntersecting) {
                            try {
                                if (iframe.dataset && iframe.dataset.src) iframe.src = iframe.dataset.src; else iframe.src = embedUrl;
                            } catch (e) { iframe.src = embedUrl; }
                            try { obs.disconnect(); } catch (e) {}
                        }
                    });
                }, { root: null, threshold: 0.1 });
                io.observe(wrapper);
            } catch (e) {
                setTimeout(() => { try { if (!iframe.src) iframe.src = embedUrl; } catch (e) {} }, 0);
            }

            wrapper.appendChild(iframe);
        }
    }

    static createImageGallery(wrapper, files, toolbar) {
        wrapper.className = 'wb-component wb-gallery';
        wrapper.innerHTML = '';
        wrapper.appendChild(toolbar);
        
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                
                item.appendChild(img);
                grid.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
        
        wrapper.appendChild(grid);
    }

    static extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }

    static extractVimeoId(url) {
        const regex = /vimeo\.com\/(\d+)/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }

    static generateId(type) {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Replace an element's toolbar with a fresh, wired toolbar
    static rebindToolbar(element) {
        const oldTb = element.querySelector('.component-toolbar');
        const newTb = this.createToolbar();
        if (oldTb) {
            oldTb.replaceWith(newTb);
        } else {
            element.insertBefore(newTb, element.firstChild);
        }
    }

    // Ensure legacy/loaded elements have their API attached for Properties panel
    static ensureApiFor(el) {
        try {
            if (!el || !el.getAttribute) return;
            const type = el.getAttribute('data-component');
            if (type === 'content-flex' && !el.__contentFlexApi) {
                const section = el;
                const h1 = section.querySelector('.cf-title') || section.querySelector('h1, .wb-heading, .cf-header h1');
                const h2 = section.querySelector('.cf-subtitle') || section.querySelector('h2, .cf-header h2');
                const body = section.querySelector('.cf-body') || section.querySelector('.cf-text, .cf-content');
                const applyLayout = () => {
                    section.classList.toggle('layout-none', section._layout === 'none');
                    section.classList.toggle('layout-left', section._layout === 'left');
                    section.classList.toggle('layout-right', section._layout === 'right');
                    section.classList.toggle('layout-both', section._layout === 'both');
                };
                const applyStyles = () => {
                    if (section._imgHeight != null) section.style.setProperty('--cf-img-height', section._imgHeight + 'px');
                    if (section._radius != null) section.style.setProperty('--cf-radius', section._radius + 'px');
                    section.classList.toggle('cf-shadow', !!section._shadow);
                };
                const findLeftImg = () => section.querySelector('.cf-left img') || section.querySelector('.cf-media-left img') || section.querySelector('img');
                const findRightImg = () => section.querySelector('.cf-right img') || section.querySelector('.cf-media-right img') || (section.querySelectorAll('img')[1] || section.querySelector('img'));
                el.__contentFlexApi = {
                    setTitle: (t) => { if (h1) h1.textContent = t || ''; },
                    setSubtitle: (t) => { if (h2) h2.textContent = t || ''; },
                    setBodyHtml: (html) => { if (body) body.innerHTML = html || ''; },
                    setLayout: (mode) => { section._layout = ['none','left','right','both'].includes(mode) ? mode : 'none'; applyLayout(); },
                    setEdgeToEdge: (on) => { section.classList.toggle('edge-to-edge', !!on); },
                    setImageHeight: (px) => { section._imgHeight = Math.max(120, parseInt(px,10) || 260); applyStyles(); },
                    setRadius: (px) => { section._radius = Math.max(0, parseInt(px,10) || 0); applyStyles(); },
                    setShadow: (on) => { section._shadow = !!on; applyStyles(); },
                    pickLeft: async () => {
                        try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' }); const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl; const img = findLeftImg(); if (u && img) { if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u); else img.src = u; } } catch (e) {}
                    },
                    pickRight: async () => {
                        try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' }); const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl; const img = findRightImg(); if (u && img) { if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u); else img.src = u; } } catch (e) {}
                    }
                };
                // Best effort: infer current state for layout/styles
                if (!section._layout) {
                    if (section.classList.contains('layout-left')) section._layout = 'left';
                    else if (section.classList.contains('layout-right')) section._layout = 'right';
                    else if (section.classList.contains('layout-both')) section._layout = 'both';
                    else section._layout = 'none';
                }
                try { applyLayout(); applyStyles(); } catch (e) {}
            }
        } catch (e) {}
    }

    // AI Fill: Generate content based on block context
    static async fillWithAI(component) {
        if (!component) return;
        
        const type = component.getAttribute('data-component');
        if (!type) return;

        // Check if AI module is available
        if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') {
            alert('AI module niet geladen');
            return;
        }

        // Get page context
        const pageTitle = (()=>{
            try {
                const input = document.getElementById('pageTitleInput');
                if (input && input.value) return input.value;
                const h1 = document.querySelector('.na-title');
                if (h1) return h1.textContent.trim();
                return 'Pagina';
            } catch (e) { return 'Pagina'; }
        })();

        // Handle different component types
        if (type === 'content-flex') {
            await this._fillContentFlex(component, pageTitle);
        } else if (type === 'feature-media') {
            await this._fillFeatureMedia(component, pageTitle);
        } else if (type === 'feature-highlight') {
            await this._fillFeatureHighlight(component, pageTitle);
        } else if (type === 'news-article') {
            await this._fillNewsArticle(component, pageTitle);
        } else {
            console.warn('AI fill not supported for', type);
        }
    }

    static async _fillContentFlex(component, pageTitle) {
        const titleEl = component.querySelector('.cf-title');
        const subtitleEl = component.querySelector('.cf-subtitle');
        const bodyEl = component.querySelector('.cf-body');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        let subtitle = (subtitleEl && subtitleEl.textContent) ? subtitleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je tekst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            // Update the title element with user input
            if (titleEl) titleEl.textContent = title;
        }
        
        // Show loading state
        const originalHtml = bodyEl.innerHTML;
        bodyEl.innerHTML = '<p style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI genereert tekst...</p>';
        
        try {
            const result = await window.BuilderAI.generate('content_block', {
                page_title: pageTitle,
                section_title: title,
                subtitle: subtitle,
                language: 'nl',
                tone: 'professional'
            });

            const text = result?.text || result?.content_block?.text || result?.content || '';
            if (text) {
                // Convert to paragraphs
                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                bodyEl.innerHTML = paragraphs || originalHtml;
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI tekst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillFeatureMedia(component, pageTitle) {
        const titleEl = component.querySelector('h2, h3, .fm-title');
        const bodyEl = component.querySelector('p, .fm-body, .fm-text');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je tekst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalText = bodyEl.textContent;
        bodyEl.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> AI genereert...';
        
        try {
            const result = await window.BuilderAI.generate('feature_description', {
                page_title: pageTitle,
                feature_title: title,
                language: 'nl',
                length: 'medium'
            });

            const text = result?.text || result?.feature_description?.text || '';
            if (text) {
                bodyEl.textContent = text;
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI tekst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.textContent = originalText;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillFeatureHighlight(component, pageTitle) {
        const titleEl = component.querySelector('h2, h3');
        const listEl = component.querySelector('ul');
        
        if (!listEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : '';
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title.length < 3) {
            const userTopic = prompt('Waarover wil je een lijst genereren?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalHtml = listEl.innerHTML;
        listEl.innerHTML = '<li style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI genereert...</li>';
        
        try {
            const result = await window.BuilderAI.generate('feature_list', {
                page_title: pageTitle,
                section_title: title,
                language: 'nl',
                count: 5
            });

            const items = result?.items || result?.feature_list || [];
            if (items.length) {
                listEl.innerHTML = items.map(item => {
                    const text = typeof item === 'string' ? item : (item.text || item.title || item.summary || '');
                    return `<li>${text}</li>`;
                }).join('');
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI lijst gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen items ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            listEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    static async _fillNewsArticle(component, pageTitle) {
        const titleEl = component.querySelector('.na-title');
        const bodyEl = component.querySelector('.na-body');
        
        if (!bodyEl) return;

        let title = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : pageTitle;
        
        // If title is empty or generic, ask user for topic
        if (!title || title === 'Titel' || title === 'Title' || title === 'Nieuw artikel' || title.length < 3) {
            const userTopic = prompt('Wat is het onderwerp van het nieuwsartikel?', title || '');
            if (!userTopic || !userTopic.trim()) {
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('Geannuleerd', 'info');
                }
                return;
            }
            title = userTopic.trim();
            if (titleEl) titleEl.textContent = title;
        }
        
        const originalHtml = bodyEl.innerHTML;
        bodyEl.innerHTML = '<p style="color:#8b5cf6;"><i class="fas fa-circle-notch fa-spin"></i> AI schrijft artikel...</p>';
        
        try {
            const result = await window.BuilderAI.generate('news_article', {
                title: title,
                language: 'nl',
                length: 'long'
            });

            const text = result?.text || result?.news_article?.text || result?.content || '';
            if (text) {
                const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                bodyEl.innerHTML = paragraphs || originalHtml;
                
                if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                    window.websiteBuilder.showNotification('✨ AI artikel gegenereerd', 'success');
                }
            } else {
                throw new Error('Geen tekst ontvangen');
            }
        } catch (err) {
            console.warn('AI fill failed', err);
            bodyEl.innerHTML = originalHtml;
            if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                window.websiteBuilder.showNotification('AI genereren mislukt', 'error');
            }
        }
    }

    // Travel Hero - with 5 style options
    static createTravelHero(options = {}) {
        const hero = document.createElement('div');
        hero.className = 'wb-component wb-travel-hero';
        hero.setAttribute('data-component', 'travel-hero');
        hero.id = this.generateId('travel_hero');

        const toolbar = this.createToolbar();
        
        // Add refresh button for interactive map
        if (options.style === 'interactive-map' || !options.style) {
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'toolbar-btn';
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.title = 'Ververs kaart';
            refreshBtn.onclick = (e) => {
                e.stopPropagation();
                this.refreshTravelHeroMap(hero);
                if (window.websiteBuilder?.showNotification) {
                    window.websiteBuilder.showNotification('Kaart ververst!', 'success');
                }
            };
            toolbar.insertBefore(refreshBtn, toolbar.firstChild);
        }
        
        hero.appendChild(toolbar);
        this.addTypeBadge(hero);

        const currentStyle = options.style || 'interactive-map';
        const title = options.title || 'Thailand Rondreis';
        const subtitle = options.subtitle || '20 dagen door het land van de glimlach';

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="travel-hero-container">
                <select class="travel-hero-style-select" style="display:none;">
                    <option value="interactive-map" ${currentStyle === 'interactive-map' ? 'selected' : ''}>🗺️ Interactive Map</option>
                    <option value="timeline-slider" ${currentStyle === 'timeline-slider' ? 'selected' : ''}>🎯 Timeline Slider</option>
                    <option value="video-overlay" ${currentStyle === 'video-overlay' ? 'selected' : ''}>🎬 Video Overlay</option>
                    <option value="parallax-photos" ${currentStyle === 'parallax-photos' ? 'selected' : ''}>📸 Parallax Photos</option>
                    <option value="airplane-window" ${currentStyle === 'airplane-window' ? 'selected' : ''}>✈️ Airplane Window</option>
                    <option value="split-hero" ${currentStyle === 'split-hero' ? 'selected' : ''}>📍 Split Hero</option>
                </select>
                <div class="travel-hero-preview" data-style="${currentStyle}">
                    ${currentStyle === 'interactive-map' ? `
                        <div class="travel-hero-map-container" id="hero-map-${hero.id}"></div>
                        <div class="travel-hero-overlay"></div>
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                    ` : currentStyle === 'timeline-slider' ? `
                        <div class="timeline-slider-container">
                            <div class="timeline-slider-track" id="timeline-slider-${hero.id}">
                                <!-- Day cards will be added here -->
                            </div>
                            <button class="timeline-slider-prev">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="timeline-slider-next">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="travel-hero-content timeline-slider-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                    ` : currentStyle === 'video-overlay' ? `
                        <div class="video-overlay-container">
                            <div class="video-background" id="video-bg-${hero.id}">
                                <iframe 
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&showinfo=0&rel=0&modestbranding=1"
                                    frameborder="0"
                                    allow="autoplay; encrypted-media"
                                ></iframe>
                            </div>
                            <div class="video-overlay-dark"></div>
                            <div class="travel-hero-content video-overlay-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                                <button class="hero-cta-button">
                                    <i class="fas fa-play-circle"></i> Bekijk Video
                                </button>
                            </div>
                        </div>
                    ` : currentStyle === 'parallax-photos' ? `
                        <div class="parallax-photos-container" id="parallax-${hero.id}">
                            <div class="parallax-layer parallax-bg"></div>
                            <div class="parallax-layer parallax-mid"></div>
                            <div class="parallax-layer parallax-front"></div>
                            <div class="travel-hero-content parallax-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                        </div>
                    ` : currentStyle === 'airplane-window' ? `
                        <div class="airplane-window-container">
                            <div class="airplane-window-frame">
                                <svg class="window-shape" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <clipPath id="window-clip-${hero.id}">
                                            <rect x="50" y="50" width="300" height="400" rx="150" />
                                        </clipPath>
                                    </defs>
                                    <rect x="40" y="40" width="320" height="420" rx="160" fill="#e5e7eb" stroke="#9ca3af" stroke-width="8"/>
                                    <rect x="50" y="50" width="300" height="400" rx="150" fill="#fff" stroke="#d1d5db" stroke-width="4"/>
                                </svg>
                                <div class="window-photos" id="window-photos-${hero.id}" style="clip-path: url(#window-clip-${hero.id});"></div>
                            </div>
                            <div class="travel-hero-content airplane-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                            <div class="airplane-features">
                                <div class="feature-item">
                                    <i class="fas fa-map-marked-alt"></i>
                                    <span>8 Bestemmingen</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>20 Dagen</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-hotel"></i>
                                    <span>Hotels Inclusief</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-utensils"></i>
                                    <span>Ontbijt Dagelijks</span>
                                </div>
                            </div>
                        </div>
                    ` : currentStyle === 'split-hero' ? `
                        <div class="split-hero-container">
                            <div class="split-hero-map" id="split-map-${hero.id}"></div>
                            <div class="split-hero-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p class="split-subtitle" contenteditable="true">${subtitle}</p>
                                <div class="split-destinations"></div>
                                <div class="split-highlights">
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>8 Bestemmingen</span>
                                    </div>
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>Alle hotels inclusief</span>
                                    </div>
                                    <div class="highlight-item" contenteditable="true">
                                        <i class="fas fa-check"></i>
                                        <span>Ontbijt dagelijks</span>
                                    </div>
                                </div>
                            </div>
                            <div class="split-hero-photos" id="split-photos-${hero.id}"></div>
                        </div>
                    ` : `
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                            <div class="travel-hero-placeholder">
                                <i class="fas fa-image"></i>
                                <p>Hero Style: <strong>${this.getStyleName(currentStyle)}</strong></p>
                                <small>Bewerk in eigenschappen panel →</small>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
        hero.appendChild(content);

        // Initialize map for interactive-map style
        if (currentStyle === 'interactive-map') {
            setTimeout(() => this.initializeTravelHeroMap(hero, options.destinations || []), 100);
        }
        
        // Initialize timeline slider for timeline-slider style
        if (currentStyle === 'timeline-slider') {
            setTimeout(() => this.initializeTimelineSlider(hero, options.destinations || []), 100);
        }
        
        // Initialize parallax for parallax-photos style
        if (currentStyle === 'parallax-photos') {
            setTimeout(() => this.initializeParallaxPhotos(hero, options.destinations || []), 100);
        }
        
        // Initialize airplane window for airplane-window style
        if (currentStyle === 'airplane-window') {
            setTimeout(() => this.initializeAirplaneWindow(hero, options.destinations || []), 100);
        }
        
        // Initialize split hero for split-hero style
        if (currentStyle === 'split-hero') {
            setTimeout(() => this.initializeSplitHero(hero, options.destinations || []), 100);
        }

        this.makeSelectable(hero);
        return hero;
    }

    static initializeParallaxPhotos(hero, destinations) {
        const container = hero.querySelector('.parallax-photos-container');
        if (!container) return;

        const bgLayer = container.querySelector('.parallax-bg');
        const midLayer = container.querySelector('.parallax-mid');
        const frontLayer = container.querySelector('.parallax-front');

        // Set background images from destinations
        if (destinations && destinations.length > 0) {
            if (destinations[0]?.images?.[0]) bgLayer.style.backgroundImage = `url('${destinations[0].images[0]}')`;
            if (destinations[1]?.images?.[0]) midLayer.style.backgroundImage = `url('${destinations[1].images[0]}')`;
            if (destinations[2]?.images?.[0]) frontLayer.style.backgroundImage = `url('${destinations[2].images[0]}')`;
        }

        // Parallax scroll effect
        let ticking = false;
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const heroRect = hero.getBoundingClientRect();
            
            if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
                const offset = scrolled * 0.5;
                bgLayer.style.transform = `translateY(${offset * 0.3}px)`;
                midLayer.style.transform = `translateY(${offset * 0.6}px)`;
                frontLayer.style.transform = `translateY(${offset * 0.9}px)`;
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });
    }

    static initializeSplitHero(hero, destinations) {
        const mapContainer = hero.querySelector('.split-hero-map');
        const destinationsDiv = hero.querySelector('.split-destinations');
        const photosContainer = hero.querySelector('.split-hero-photos');
        
        if (!mapContainer) return;

        // Get destinations from timeline if not provided
        if (!destinations || destinations.length === 0) {
            const timeline = document.querySelector('.wb-travel-timeline');
            if (timeline) {
                const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
                destinations = Array.from(destinationCards).map((card, idx) => ({
                    name: card.querySelector('.travel-card-title h3')?.textContent || `Bestemming ${idx + 1}`,
                    images: Array.from(card.querySelectorAll('.carousel-image')).map(img => 
                        img.style.backgroundImage?.replace(/url\(['"](.+)['"]\)/, '$1')
                    ).filter(Boolean)
                }));
            }
        }

        // Build destinations list
        if (destinationsDiv && destinations.length > 0) {
            const destNames = destinations.map(d => d.name).join(' | ');
            destinationsDiv.textContent = destNames;
        }

        // Build mini map with Leaflet
        if (typeof L !== 'undefined' && destinations.length > 0) {
            const map = L.map(mapContainer.id, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false
            }).setView([13.7563, 100.5018], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);

            // Add route line (mock coordinates for now)
            const routeCoords = [
                [13.7563, 100.5018], // Bangkok
                [18.7883, 98.9853],  // Chiang Mai
                [7.8804, 98.3923]    // Phuket
            ];
            
            L.polyline(routeCoords, {
                color: '#667eea',
                weight: 3,
                opacity: 0.8
            }).addTo(map);

            // Add markers
            routeCoords.forEach((coord, idx) => {
                L.circleMarker(coord, {
                    radius: 6,
                    fillColor: '#667eea',
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 1
                }).addTo(map);
            });
        }

        // Build photo collage
        if (photosContainer && destinations.length > 0) {
            const allPhotos = [];
            destinations.forEach(dest => {
                if (dest.images && dest.images.length > 0) {
                    allPhotos.push(...dest.images);
                }
            });

            // Use first 3 photos
            const photos = allPhotos.slice(0, 3);
            if (photos.length === 0) {
                photos.push(
                    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
                    'https://images.unsplash.com/photo-1563492065213-f0e6c0a19e1f?w=600',
                    'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600'
                );
            }

            photos.forEach((photo, idx) => {
                const img = document.createElement('div');
                img.className = 'split-photo';
                img.style.backgroundImage = `url('${photo}')`;
                photosContainer.appendChild(img);
            });
        }
    }

    static initializeAirplaneWindow(hero, destinations) {
        const photosContainer = hero.querySelector('.window-photos');
        if (!photosContainer) return;

        // Get photos from destinations
        const photos = [];
        if (destinations && destinations.length > 0) {
            destinations.forEach(dest => {
                if (dest.images && dest.images.length > 0) {
                    photos.push(...dest.images);
                } else if (dest.image) {
                    photos.push(dest.image);
                }
            });
        }

        // Default photos if none provided
        if (photos.length === 0) {
            photos.push(
                'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
                'https://images.unsplash.com/photo-1563492065213-f0e6c0a19e1f?w=800',
                'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'
            );
        }

        // Create photo slides
        photos.forEach((photo, idx) => {
            const slide = document.createElement('div');
            slide.className = 'window-slide';
            slide.style.backgroundImage = `url('${photo}')`;
            if (idx === 0) slide.classList.add('active');
            photosContainer.appendChild(slide);
        });

        // Auto-slide animation
        let currentSlide = 0;
        setInterval(() => {
            const slides = photosContainer.querySelectorAll('.window-slide');
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    static initializeTimelineSlider(hero, destinations) {
        const track = hero.querySelector('.timeline-slider-track');
        const prevBtn = hero.querySelector('.timeline-slider-prev');
        const nextBtn = hero.querySelector('.timeline-slider-next');
        
        if (!track) return;

        // Get destinations from timeline if not provided
        if (!destinations || destinations.length === 0) {
            const timeline = document.querySelector('.wb-travel-timeline');
            if (timeline) {
                const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
                destinations = Array.from(destinationCards).map((card, idx) => ({
                    name: card.querySelector('.travel-card-title h3')?.textContent || `Dag ${idx + 1}`,
                    day: idx + 1,
                    image: card.querySelector('.carousel-image')?.style.backgroundImage?.replace(/url\(['"](.+)['"]\)/, '$1') || 
                           'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'
                }));
            }
        }

        // Create day cards
        track.innerHTML = '';
        destinations.forEach((dest, idx) => {
            const card = document.createElement('div');
            card.className = 'timeline-day-card';
            card.innerHTML = `
                <div class="timeline-day-image" style="background-image: url('${dest.image || dest.images?.[0] || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'}')"></div>
                <div class="timeline-day-info">
                    <div class="timeline-day-number">Dag ${dest.fromDay || dest.day || idx + 1}</div>
                    <div class="timeline-day-name">${dest.name}</div>
                </div>
            `;
            
            // Click to scroll to timeline
            card.onclick = () => {
                const timeline = document.querySelector('.wb-travel-timeline');
                if (timeline) {
                    const dayHeaders = timeline.querySelectorAll('.wb-travel-day-header');
                    const targetDay = dayHeaders[idx];
                    if (targetDay) {
                        targetDay.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            };
            
            track.appendChild(card);
        });

        // Scroll functionality
        let currentScroll = 0;
        const cardWidth = 280; // card width + gap
        
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                currentScroll = Math.max(0, currentScroll - cardWidth * 2);
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                const maxScroll = track.scrollWidth - track.clientWidth;
                currentScroll = Math.min(maxScroll, currentScroll + cardWidth * 2);
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            };
        }

        // Auto-scroll animation
        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (currentScroll >= maxScroll) {
                    currentScroll = 0;
                } else {
                    currentScroll += cardWidth;
                }
                track.scrollTo({ left: currentScroll, behavior: 'smooth' });
            }, 3000);
        };

        // Start auto-scroll
        startAutoScroll();

        // Pause on hover
        track.onmouseenter = () => clearInterval(autoScrollInterval);
        track.onmouseleave = () => startAutoScroll();

        // Store reference
        hero._timelineSlider = { track, prevBtn, nextBtn, autoScrollInterval };
    }

    static initializeTravelHeroMap(hero, destinations) {
        const mapContainer = hero.querySelector('.travel-hero-map-container');
        if (!mapContainer || typeof L === 'undefined') return;

        const mapId = mapContainer.id;
        
        // If no destinations, show default view of Thailand
        if (!destinations || destinations.length === 0) {
            const map = L.map(mapId, {
                zoomControl: false,
                attributionControl: false
            }).setView([13.7563, 100.5018], 6); // Bangkok center
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);
            
            hero._heroMap = map;
            return;
        }

        // Calculate center and bounds from destinations
        const lats = destinations.map(d => d.latitude);
        const lngs = destinations.map(d => d.longitude);
        const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
        const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
        
        // Create map
        const map = L.map(mapId, {
            zoomControl: false,
            attributionControl: false
        }).setView([centerLat, centerLng], 6);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);
        
        // Create route line
        const routeCoords = destinations.map(d => [d.latitude, d.longitude]);
        L.polyline(routeCoords, {
            color: '#ff6b6b',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(map);
        
        // Add numbered markers
        destinations.forEach((dest, idx) => {
            const icon = L.divIcon({
                className: 'hero-route-marker',
                html: `<div class="hero-route-marker-inner">${idx + 1}</div>`,
                iconSize: [40, 40]
            });
            
            const marker = L.marker([dest.latitude, dest.longitude], { icon })
                .addTo(map);
            
            // Click handler to show detail panel
            marker.on('click', () => {
                if (window.ComponentFactory?.showDestinationDetail) {
                    window.ComponentFactory.showDestinationDetail(dest, idx + 1);
                }
            });
        });
        
        // Fit bounds
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
        
        // Store map reference and destinations
        hero._heroMap = map;
        hero._heroDestinations = destinations;
    }

    static refreshTravelHeroMap(hero) {
        if (!hero._heroMap) return;

        // Get current destinations from timeline
        const timeline = document.querySelector('.wb-travel-timeline');
        if (!timeline) return;

        const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
        const newDestinations = [];

        destinationCards.forEach((card, idx) => {
            if (card._destinationData) {
                newDestinations.push({
                    ...card._destinationData,
                    markerNumber: idx + 1
                });
            }
        });

        if (newDestinations.length === 0) return;

        // Clear existing layers
        hero._heroMap.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                hero._heroMap.removeLayer(layer);
            }
        });

        // Redraw route line
        const routeCoords = newDestinations.map(d => [d.latitude, d.longitude]);
        L.polyline(routeCoords, {
            color: '#ff6b6b',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(hero._heroMap);

        // Redraw markers
        newDestinations.forEach((dest, idx) => {
            const icon = L.divIcon({
                className: 'hero-route-marker',
                html: `<div class="hero-route-marker-inner">${idx + 1}</div>`,
                iconSize: [40, 40]
            });

            const marker = L.marker([dest.latitude, dest.longitude], { icon })
                .addTo(hero._heroMap);

            marker.on('click', () => {
                if (window.ComponentFactory?.showDestinationDetail) {
                    window.ComponentFactory.showDestinationDetail(dest, idx + 1);
                }
            });
        });

        // Refit bounds
        const bounds = L.latLngBounds(routeCoords);
        hero._heroMap.fitBounds(bounds, { padding: [50, 50] });

        // Update stored destinations
        hero._heroDestinations = newDestinations;
    }

    static getStyleName(style) {
        const names = {
            'interactive-map': '🗺️ Interactive Map',
            'timeline-slider': '🎯 Timeline Slider',
            'video-overlay': '🎬 Video Overlay',
            'parallax-photos': '📸 Parallax Photos',
            'airplane-window': '✈️ Airplane Window',
            'split-hero': '📍 Split Hero'
        };
        return names[style] || style;
    }

    static showDestinationDetail(destination, markerNumber) {
        // Remove existing panel if any
        const existing = document.querySelector('.wb-destination-detail-panel');
        if (existing) existing.remove();

        // Create panel
        const panel = document.createElement('div');
        panel.className = 'wb-destination-detail-panel';

        // Build images HTML
        let imagesHtml = '';
        if (destination.images && destination.images.length > 0) {
            imagesHtml = `
                <div class="destination-detail-images">
                    ${destination.images.slice(0, 5).map(img => `
                        <div class="destination-detail-image">
                            <img src="${img}" alt="${destination.name}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Build hotel section if available
        let hotelHtml = '';
        if (destination.hotel) {
            const hotel = destination.hotel;
            let hotelImagesHtml = '';
            if (hotel.images && hotel.images.length > 0) {
                hotelImagesHtml = `
                    <div class="destination-detail-images">
                        ${hotel.images.slice(0, 5).map(img => `
                            <div class="destination-detail-image">
                                <img src="${img}" alt="${hotel.name}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            let facilitiesHtml = '';
            if (hotel.facilities && hotel.facilities.length > 0) {
                facilitiesHtml = `
                    <div class="hotel-facilities">
                        ${hotel.facilities.map(f => `
                            <div class="hotel-facility">
                                <i class="${f.icon || 'fas fa-check'}"></i>
                                <span>${f.description}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            hotelHtml = `
                <div class="destination-detail-section">
                    <h3><i class="fas fa-hotel"></i> Hotel</h3>
                    ${hotelImagesHtml}
                    <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">${hotel.name}</h4>
                    ${hotel.description ? `<p class="destination-detail-description">${hotel.description}</p>` : ''}
                    <div class="destination-detail-info">
                        ${hotel.roomType ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-bed"></i>
                                <span>${hotel.roomType}</span>
                            </div>
                        ` : ''}
                        ${hotel.meals ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-utensils"></i>
                                <span>${hotel.meals}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${facilitiesHtml}
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="destination-detail-header">
                <h2><span style="opacity: 0.7; margin-right: 8px;">${markerNumber}</span> ${destination.name}</h2>
                <button class="destination-detail-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="destination-detail-content">
                <div class="destination-detail-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Bestemming</h3>
                    ${imagesHtml}
                    ${destination.description ? `<p class="destination-detail-description">${destination.description}</p>` : ''}
                    <div class="destination-detail-info">
                        <div class="destination-detail-info-row">
                            <i class="fas fa-calendar"></i>
                            <span>Dag ${destination.fromDay}${destination.toDay !== destination.fromDay ? ` - ${destination.toDay}` : ''}</span>
                        </div>
                        ${destination.duration ? `
                            <div class="destination-detail-info-row">
                                <i class="fas fa-clock"></i>
                                <span>${destination.duration}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${hotelHtml}
            </div>
        `;

        document.body.appendChild(panel);

        // Close button handler
        panel.querySelector('.destination-detail-close').onclick = () => {
            panel.classList.remove('active');
            setTimeout(() => panel.remove(), 300);
        };

        // Animate in
        setTimeout(() => panel.classList.add('active'), 10);
    }
}

// Export for use in other files
window.ComponentFactory = ComponentFactory;

// Ensure PropertiesPanel has a textarea helper regardless of script order
(function(){
    const patch = () => {
        try {
            // If instance exists, patch instance method
            const inst = window.PropertiesPanel;
            if (inst && typeof inst.createTextareaInput !== 'function' && typeof inst.createFormGroup === 'function') {
                inst.createTextareaInput = function(label, value, onChange) {
                    const group = this.createFormGroup(label);
                    const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
                    const ta = document.createElement('textarea');
                    ta.className = 'form-control';
                    ta.id = inputId;
                    ta.setAttribute('aria-label', label);
                    ta.rows = 6;
                    ta.value = value || '';
                    const lbl = group.querySelector('label');
                    if (lbl) lbl.setAttribute('for', inputId);
                    ta.addEventListener('input', (e) => onChange && onChange(e.target.value));
                    group.appendChild(ta);
                    this.panel.appendChild(group);
                    return group;
                };
                console.info('[WB] Polyfilled instance PropertiesPanel.createTextareaInput');
            }
            // If constructor is exposed separately, also patch prototype
            const Ctor = window.PropertiesPanel && window.PropertiesPanel.prototype ? window.PropertiesPanel : null;
            const Proto = Ctor && Ctor.prototype;
            if (Proto && typeof Proto.createTextareaInput !== 'function' && typeof Proto.createFormGroup === 'function') {
                Proto.createTextareaInput = function(label, value, onChange) {
                    const group = this.createFormGroup(label);
                    const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
                    const ta = document.createElement('textarea');
                    ta.className = 'form-control';
                    ta.id = inputId;
                    ta.setAttribute('aria-label', label);
                    ta.rows = 6;
                    ta.value = value || '';
                    const lbl = group.querySelector('label');
                    if (lbl) lbl.setAttribute('for', inputId);
                    ta.addEventListener('input', (e) => onChange && onChange(e.target.value));
                    group.appendChild(ta);
                    this.panel.appendChild(group);
                    return group;
                };
                console.info('[WB] Polyfilled prototype PropertiesPanel.createTextareaInput');
            }
        } catch (e) { /* noop */ }
    };
    if (document.readyState === 'complete') {
        patch();
    } else {
        window.addEventListener('load', patch);
    }
})();

// Attach remove-safety button to any existing hero-travel sections (migration)
document.addEventListener('DOMContentLoaded', () => {
    // Upgrade existing hero-banner sections to two-image crossfade if needed
    try {
        document.querySelectorAll('.wb-hero-banner').forEach((section) => {
            const bg = section.querySelector('.hero-bg');
            if (!bg) return;
            const imgs = bg.querySelectorAll('img');
            if (imgs.length === 1) {
                const imgA = imgs[0];
                const imgB = document.createElement('img');
                imgB.alt = imgA.alt || 'Hero background';
                imgB.decoding = 'async';
                imgB.loading = 'eager';
                // Carry over current CSS vars
                const cs = getComputedStyle(section);
                const dur = cs.getPropertyValue('--hero-xfade-duration').trim() || '.35s';
                const easing = cs.getPropertyValue('--hero-xfade-easing').trim() || 'ease';
                imgA.style.setProperty('--hero-xfade-duration', dur);
                imgA.style.setProperty('--hero-xfade-easing', easing);
                imgB.style.setProperty('--hero-xfade-duration', dur);
                imgB.style.setProperty('--hero-xfade-easing', easing);
                imgA.style.willChange = 'opacity';
                imgB.style.willChange = 'opacity';
                // Set initial opacities and transforms
                imgA.style.opacity = imgA.style.opacity || '1';
                imgA.style.transform = 'translateX(0)';
                imgB.style.opacity = '0';
                imgB.style.transform = 'translateX(0)';
                bg.appendChild(imgB);
                // Runtime flags on section
                section._imgA = imgA;
                section._imgB = imgB;
                section._activeImg = 'A';
                section._transitionType = section._transitionType || 'fade';
            } else if (imgs.length >= 2) {
                // Ensure runtime fields exist
                section._imgA = imgs[0];
                section._imgB = imgs[1];
                section._activeImg = section._activeImg || 'A';
                section._transitionType = section._transitionType || 'fade';
            }
        });
    } catch (e) { /* noop */ }

    document.querySelectorAll('.wb-hero-travel, .wb-hero-travel-video').forEach(sec => {
        if (!sec.querySelector('.wb-dev-remove')) {
            const btn = document.createElement('button');
            btn.className = 'wb-dev-remove';
            btn.type = 'button';
            btn.title = 'Sectie verwijderen';
            btn.innerHTML = '<i class="fas fa-trash"></i>';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                    sec.remove();
                }
            });
            sec.appendChild(btn);
        }
    });
});

// Safety net: delegated handler so the trash always works, even on cloned nodes
document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.toolbar-btn[data-action="delete"]');
    if (delBtn) {
        e.stopPropagation();
        e.preventDefault();
        const comp = delBtn.closest('.wb-component');
        if (comp && confirm('Weet je zeker dat je dit component wilt verwijderen?')) {
            comp.remove();
            if (window.dragDropManager) {
                // Update selection and history if available
                window.dragDropManager.deselectAll?.();
                window.dragDropManager.saveState?.();
            }
        }
    }
});

// Global Delete key to remove the currently selected component
document.addEventListener('keydown', (e) => {
    const isDelete = e.key === 'Delete' || e.key === 'Backspace';
    const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (!isDelete || isInput) return;
    const sel = document.querySelector('.wb-component.selected');
    if (sel) {
        e.preventDefault();
        if (confirm('Geselecteerd component verwijderen?')) {
            sel.remove();
            if (window.dragDropManager) {
                window.dragDropManager.deselectAll?.();
                window.dragDropManager.saveState?.();
            }
        }
    }
});
