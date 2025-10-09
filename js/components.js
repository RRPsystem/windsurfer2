// Component factory voor website builder

// Global helper: apply responsive src/srcset for known CDNs (e.g., Unsplash)
function __WB_applyResponsiveSrc(imageEl, url, opts = {}) {
    try {
        const u = new URL(url);
        const widths = opts.widths || [1280, 1920, 2560, 3200];
        const quality = String(opts.quality || 80);
        const fm = opts.format || 'webp';
        if (u.hostname.includes('images.unsplash.com')) {
            const base = `${u.origin}${u.pathname}`;
            const params = u.searchParams;
            const fit = params.get('fit') || 'crop';
            const auto = params.get('auto') || 'format';
            const srcs = widths.map(w => `${base}?q=${quality}&w=${w}&auto=${auto}&fit=${fit}&fm=${fm}`);
            const defaultSrc = srcs[1] || srcs[0];
            imageEl.src = defaultSrc;
            imageEl.srcset = srcs.map((s, i) => `${s} ${widths[i]}w`).join(', ');
            imageEl.sizes = opts.sizes || '100vw';
            return;
        }
    } catch {}
    // Fallback: single src
    imageEl.src = url;
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
            'feature-media': this.createFeatureMedia,
            'feature-highlight': this.createFeatureHighlight,
            'content-flex': this.createContentFlex,
            'travel-types': this.createTravelTypes,
            'contact-info': this.createContactInfo,
            'contact-map-cta': this.createContactMapCta,
            'media-row': this.createMediaRow,
            'dest-tabs': this.createDestTabs,
            'news-article': this.createNewsArticle,
            'jotform-embed': this.createJotformEmbed
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
            summary: 'Korte beschrijving (2–3 regels) over deze plek.',
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
            } catch {}
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
        try { window.addEventListener('resize', () => applyMobileBehavior()); } catch {}

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
                <span class="na-dot">•</span>
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
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(leftImg, u); } } catch {}
        });
        right.addEventListener('click', async (e)=>{
            e.stopPropagation();
            if (!rightImg) return;
            try { if (!window.MediaPicker) return; const r = await window.MediaPicker.openImage(); const u = r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if (u){ __WB_applyResponsiveSrc(rightImg, u); } } catch {}
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
            pickLeft: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(leftImg, u); }catch{} },
            pickRight: async ()=>{ try{ if(!window.MediaPicker) return; const r=await window.MediaPicker.openImage(); const u=r?.fullUrl||r?.regularUrl||r?.url||r?.dataUrl; if(u) __WB_applyResponsiveSrc(rightImg, u); }catch{} },
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
                    try { console.debug('[hero-page] media chosen src', src, result); } catch {}
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
        } catch {}
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
            stopSlideshow();
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
                iframe.style.transform = 'translate(-50%, -50%)';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                videoWrap.appendChild(iframe);
                // place behind overlay/content but above bg
                section.insertBefore(videoWrap, overlay);
            }
            const iframe = videoWrap.querySelector('iframe');
            // ensure autoplay muted looping
            const url = new URL(embedUrl);
            const params = url.searchParams;
            if (!params.has('autoplay')) params.set('autoplay', '1');
            if (!params.has('mute')) params.set('mute', '1');
            if (!params.has('controls')) params.set('controls', '0');
            if (!params.has('loop')) params.set('loop', '1');
            // playlist param needed for loop
            const vidIdMatch = url.pathname.match(/\/embed\/([^/?#]+)/);
            if (vidIdMatch && !params.has('playlist')) params.set('playlist', vidIdMatch[1]);
            url.search = params.toString();
            iframe.src = url.toString();

            // Fit the iframe to cover the section (16:9) without letterboxing
            const fitVideo = () => {
                const w = section.clientWidth || section.offsetWidth || 0;
                const h = section.clientHeight || parseFloat(getComputedStyle(section).minHeight) || 0;
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
                section._ytResizeHandler = () => fitVideo();
                window.addEventListener('resize', section._ytResizeHandler);
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
            setYouTube: (embed) => setYouTubeBg(embed),
            setWidget: (url, height) => setWidget(url, height),
            clearWidget: () => removeWidgetLayer(),
            updateWidgetStyle: (style, maxPx) => updateWidgetStyle(style, maxPx),
            stopSlideshow: () => stopSlideshow(),
            isSlideshow: () => Array.isArray(section._slides) && section._slides.length > 1,
            updateYouTubeOptions: (updates = {}) => {
                section._ytOptions = Object.assign({}, section._ytOptions || { mute: true, start: 0 }, updates);
                if (section._ytEmbedBase) setYouTubeBg(section._ytEmbedBase);
            },
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
            { icon: 'fa-phone', title: 'Hotline', lines: ['+1(307) 776–0608', '666 8888 000'] }
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

        const grid = document.createElement('div');
        grid.className = 'tt-grid';

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
            // Helper to open picker and replace image
            const pickAndReplace = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (!window.MediaPicker || typeof window.MediaPicker.openImage !== 'function') return;
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const u = r?.fullUrl || r?.regularUrl || r?.url || r?.dataUrl;
                    if (!u) return;
                    if (typeof window.__WB_applyResponsiveSrc === 'function') window.__WB_applyResponsiveSrc(img, u);
                    else if (typeof __WB_applyResponsiveSrc === 'function') __WB_applyResponsiveSrc(img, u);
                    else img.src = u;
                    // Ensure immediate visual if browser keeps old srcset
                    try { img.src = u; img.removeAttribute('srcset'); img.removeAttribute('sizes'); } catch {}
                } catch {}
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
        iframe.src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}${start>0?`&start=${start}`:''}` : 'about:blank';
        videoWrap.appendChild(iframe);

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
            } catch {}
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
        copyBtn.title = 'Kopiëren';

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
            try { window.dragDropManager?.saveState?.(); } catch {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch {}
            component.classList.add('selected');
        };
        const moveDown = (component) => {
            const parent = component?.parentElement; if (!parent) return;
            let next = component.nextElementSibling;
            while (next && !next.classList.contains('wb-component')) next = next.nextElementSibling;
            if (next) parent.insertBefore(next, component);
            try { window.dragDropManager?.saveState?.(); } catch {}
            try { component.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch {}
            component.classList.add('selected');
        };
        upBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveUp(comp); });
        downBtn.addEventListener('click', (e) => { e.stopPropagation(); const comp = toolbar.parentElement; moveDown(comp); });

        toolbar.appendChild(editBtn);
        toolbar.appendChild(copyBtn);
        toolbar.appendChild(upBtn);
        toolbar.appendChild(downBtn);
        
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
            
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.allowFullscreen = true;
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
