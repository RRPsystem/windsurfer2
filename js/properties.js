// Properties panel voor component editing
class PropertiesPanel {
    constructor() {
        this.panel = document.getElementById('propertiesContent');
        this.currentComponent = null;
    }

    createJotformEmbedProperties(component) {
        const api = component.__jotformApi || {};

        // Provider info
        const help = document.createElement('div');
        help.style.fontSize = '12px';
        help.style.color = '#475569';
        help.style.margin = '0 0 8px';
        help.innerHTML = '<strong>Jotform</strong> wordt inline ingesloten. Beheer velden/e-mails in Jotform.';
        this.panel.appendChild(help);

        // Form ID
        const idGroup = this.createTextInput('Jotform Form ID', component._formId || '', (v)=> api.setFormId && api.setFormId(v));
        const idHint = document.createElement('div'); idHint.style.fontSize='12px'; idHint.style.color='#6b7280'; idHint.textContent = 'Voorbeeld: 233194240465353';
        idGroup.appendChild(idHint);

        // Height
        this.createRangeInput('Iframe hoogte (px)', String(component._height || 1200), '400', '2000', '10', (v)=> api.setHeight && api.setHeight(v));

        // Radius
        this.createRangeInput('Afronding (px)', String(component._borderRadius || 12), '0', '30', '1', (v)=> api.setRadius && api.setRadius(v));

        // Shadow
        this.createSelectInput('Schaduw', (component._shadow !== false) ? 'on' : 'off', [
            { value:'on', label:'Aan' },
            { value:'off', label:'Uit' }
        ], (v)=> api.setShadow && api.setShadow(v==='on'));

        // Danger
        const del = this.createButton('Blok verwijderen', ()=>{ if(confirm('Verwijderen?')){ component.remove(); this.clearProperties(); } });
        del.style.background = '#dc2626'; del.style.borderColor = '#dc2626'; del.style.color = '#fff'; del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createContentFlexProperties(component) {
        const api = component.__contentFlexApi || {};
        // Title & Subtitle
        this.createTextInput('Titel', component.querySelector('.cf-title')?.textContent || '', (v)=> api.setTitle && api.setTitle(v));
        this.createTextInput('Subtitel', component.querySelector('.cf-subtitle')?.textContent || '', (v)=> api.setSubtitle && api.setSubtitle(v));
        // AI: Extra tekst generator (plaatst in body)
        try {
            const aiRowExtra = document.createElement('div');
            aiRowExtra.style.display='flex'; aiRowExtra.style.gap='8px'; aiRowExtra.style.margin='6px 0 8px';
            const aiBtnExtra = this.createButton('Vul met AI (Extra tekst)', async () => {
                try {
                    if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') { alert('AI module niet geladen.'); return; }
                    const country = (window.BuilderAI.guessCountry && window.BuilderAI.guessCountry()) || '';
                    const r = await window.BuilderAI.generate('extra', { country, language: 'nl' });
                    const text = r?.extra?.text || '';
                    if (text) api.setBodyHtml && api.setBodyHtml(`<p>${text.replace(/\n+/g,'</p><p>')}</p>`);
                } catch { alert('AI genereren mislukt.'); }
            });
            aiBtnExtra.style.background = '#0ea5e9'; aiBtnExtra.style.borderColor = '#0ea5e9'; aiBtnExtra.style.color = '#fff';
            aiRowExtra.appendChild(aiBtnExtra);
            this.panel.appendChild(aiRowExtra);
        } catch {}
        // Header alignment (left/center)
        const headerCentered = component.classList.contains('center-header') ? 'center' : 'left';
        this.createSelectInput('Titel uitlijning', headerCentered, [
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Midden' }
        ], (v) => {
            component.classList.toggle('center-header', v === 'center');
        });

        // Body (simple textarea -> innerHTML)
        const bodyEl = component.querySelector('.cf-body');
        this.createTextareaInput('Tekst', bodyEl?.innerHTML || '', (v)=> api.setBodyHtml && api.setBodyHtml(v));

        // Layout
        const curLayout = component._layout || 'none';
        this.createSelectInput('Layout', curLayout, [
            { value: 'none', label: 'Alleen tekst' },
            { value: 'left', label: 'Afbeelding links' },
            { value: 'right', label: 'Afbeelding rechts' },
            { value: 'both', label: 'Afbeelding links en rechts' }
        ], (v)=>{ component._layout = v; api.setLayout && api.setLayout(v); });

        // Width
        this.createSelectInput('Volle breedte (edge-to-edge)', component.classList.contains('edge-to-edge') ? 'on' : 'off', [
            { value: 'on', label: 'Ja' },
            { value: 'off', label: 'Nee' }
        ], (v)=> api.setEdgeToEdge && api.setEdgeToEdge(v==='on'));

        // Images shared settings
        const hCur = String(component._imgHeight || 260);
        this.createRangeInput('Afbeelding hoogte (px)', hCur, '120', '460', '2', (v)=> api.setImageHeight && api.setImageHeight(v));
        const rCur = String(component._radius ?? 14);
        this.createRangeInput('Afronding (px)', rCur, '0', '40', '1', (v)=> api.setRadius && api.setRadius(v));
        this.createSelectInput('Schaduw', (component._shadow ?? true) ? 'on' : 'off', [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v)=> api.setShadow && api.setShadow(v==='on'));

        // Media pickers
        const picks = document.createElement('div'); picks.style.display='flex'; picks.style.gap='8px'; picks.style.marginTop='8px';
        const btnLeft = this.createButton('Kies links', ()=> api.pickLeft && api.pickLeft());
        const btnRight = this.createButton('Kies rechts', ()=> api.pickRight && api.pickRight());
        picks.appendChild(btnLeft); picks.appendChild(btnRight);
        this.panel.appendChild(picks);

        // CTAs (default off)
        // Simple two CTA config stored in dataset on component for now
        component._ctaEnabled = component._ctaEnabled || false;
        const ctaOn = component._ctaEnabled ? 'on' : 'off';
        this.createSelectInput('CTA\'s tonen', ctaOn, [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v)=>{
            component._ctaEnabled = (v==='on');
            renderCtasBox();
        });

        const renderCtasBox = () => {
            // remove old
            this.panel.querySelector('[data-prop="cf-ctas"]')?.remove();
            if (!component._ctaEnabled) return;
            const wrap = document.createElement('div'); wrap.setAttribute('data-prop','cf-ctas'); wrap.style.border='1px solid #e5e7eb'; wrap.style.borderRadius='8px'; wrap.style.padding='10px'; wrap.style.marginTop='8px'; wrap.style.background='#fafafa';
            const t1 = this.createTextInput('CTA 1: tekst', component._cta1Text||'', (v)=>{ component._cta1Text=v; updateCtas(); });
            const l1 = this.createTextInput('CTA 1: link', component._cta1Href||'', (v)=>{ component._cta1Href=v; updateCtas(); });
            const tg1 = this.createSelectInput('CTA 1: target', component._cta1Target||'_self', [ {value:'_self',label:'Zelfde tab'}, {value:'_blank',label:'Nieuwe tab'} ], (v)=>{ component._cta1Target=v; updateCtas(); });
            const t2 = this.createTextInput('CTA 2: tekst', component._cta2Text||'', (v)=>{ component._cta2Text=v; updateCtas(); });
            const l2 = this.createTextInput('CTA 2: link', component._cta2Href||'', (v)=>{ component._cta2Href=v; updateCtas(); });
            const tg2 = this.createSelectInput('CTA 2: target', component._cta2Target||'_self', [ {value:'_self',label:'Zelfde tab'}, {value:'_blank',label:'Nieuwe tab'} ], (v)=>{ component._cta2Target=v; updateCtas(); });
            wrap.appendChild(t1); wrap.appendChild(l1); wrap.appendChild(tg1); wrap.appendChild(t2); wrap.appendChild(l2); wrap.appendChild(tg2);

            // CTA color (accent)
            let curAccent = component._ctaColor || '';
            if (!curAccent) {
                try {
                    const cs = getComputedStyle(component);
                    const v = cs.getPropertyValue('--cf-accent').trim();
                    if (v) curAccent = v;
                } catch {}
                if (!curAccent) curAccent = '#16a34a';
            }
            const colorEl = this.createColorInput('CTA kleur', curAccent, (v)=>{
                component._ctaColor = v;
                try { component.style.setProperty('--cf-accent', v); } catch {}
                updateCtas();
            });
            wrap.appendChild(colorEl);
            this.panel.appendChild(wrap);
        };

        const updateCtas = () => {
            // Render/refresh CTAs below body
            let bar = component.querySelector('.cf-cta');
            if (!component._ctaEnabled) { if (bar) bar.remove(); return; }
            if (!bar) { bar = document.createElement('div'); bar.className='cf-cta'; component.querySelector('.cf-wrap')?.appendChild(bar); }
            bar.innerHTML = '';
            const addBtn = (txt,href,target,style)=>{
                if (!txt) return;
                const a = document.createElement('a'); a.href=href||'#'; a.target=target||'_self'; a.className = `btn ${style}`; a.textContent = txt; bar.appendChild(a);
            };
            addBtn(component._cta1Text, component._cta1Href, component._cta1Target, 'btn-primary');
            addBtn(component._cta2Text, component._cta2Href, component._cta2Target, 'outline');
        };

        renderCtasBox();
        updateCtas();
    }

    createMediaRowProperties(component) {
        const api = component.__mediaRowApi || {};

        // Gap toggle + slider
        const gapCurrent = String(component._gap ?? 16);
        this.createSelectInput('Ruimte tussen foto\'s', (component._gap ?? 16) > 0 ? 'on' : 'off', [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v) => {
            const g = v === 'off' ? 0 : (component._gap || 16);
            component._gap = g; api.setGap && api.setGap(g);
        });
        this.createRangeInput('Gap (px)', gapCurrent, '0', '40', '1', (v) => {
            const g = Math.max(0, parseInt(v,10)||0); component._gap = g; api.setGap && api.setGap(g);
        });

        // Size controls
        const hCur = String(component._height ?? 200);
        this.createRangeInput('Fotohoogte (px)', hCur, '120', '360', '2', (v) => {
            const h = Math.max(80, parseInt(v,10)||200); component._height = h; api.setHeight && api.setHeight(h);
        });
        const rCur = String(component._radius ?? 14);
        this.createRangeInput('Afronding (px)', rCur, '0', '40', '1', (v) => {
            const r = Math.max(0, parseInt(v,10)||0); component._radius = r; api.setRadius && api.setRadius(r);
        });
        this.createSelectInput('Schaduw', (component._shadow ?? true) ? 'on' : 'off', [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v) => { const on = v==='on'; component._shadow = on; api.setShadow && api.setShadow(on); });

        // Carousel
        this.createSelectInput('Carrousel', (component._carousel ?? true) ? 'on' : 'off', [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v) => { const on = v==='on'; component._carousel = on; api.setCarousel && api.setCarousel(on); });

        // Layout mode
        this.createSelectInput('Layout', (component._layout || 'uniform'), [
            { value: 'uniform', label: 'Uniform' },
            { value: 'spotlight', label: 'Spotlight (1 groot + rest)' }
        ], (v) => { api.setLayout && api.setLayout(v); component._layout = v; });

        // Spotlight pattern (shown only when spotlight is active)
        const renderSpotlightPattern = () => {
            // Remove previous if re-rendering
            const old = this.panel.querySelector('[data-prop="mr-spotlight-pattern"]');
            if (old) old.remove();
            if ((component._layout || 'uniform') !== 'spotlight') return;
            const wrap = document.createElement('div');
            wrap.setAttribute('data-prop', 'mr-spotlight-pattern');
            const label = document.createElement('label'); label.textContent = 'Spotlight patroon'; label.style.display='block'; label.style.margin='8px 0 4px';
            const select = document.createElement('select'); select.className='form-control';
            const opts = [
                {v:'first', t:'Eerste groot'},
                {v:'center', t:'Midden groot'},
                {v:'last', t:'Derde groot'}
            ];
            const cur = component._layoutPattern || 'first';
            opts.forEach(o=>{ const op=document.createElement('option'); op.value=o.v; op.textContent=o.t; if(o.v===cur) op.selected=true; select.appendChild(op); });
            select.onchange = ()=>{ const val = select.value; component._layoutPattern = val; api.setLayoutPattern && api.setLayoutPattern(val); };
            wrap.appendChild(label); wrap.appendChild(select);
            this.panel.appendChild(wrap);
        };
        renderSpotlightPattern();

        // Edge-to-edge toggle
        this.createSelectInput('Volle breedte (edge-to-edge)', component.classList.contains('edge-to-edge') ? 'on' : 'off', [
            { value: 'on', label: 'Ja' },
            { value: 'off', label: 'Nee' }
        ], (v) => { component.classList.toggle('edge-to-edge', v==='on'); });

        // Labels overlay toggle
        const labelsOn = component.classList.contains('mr-labels-off') ? 'off' : 'on';
        this.createSelectInput('Labels tonen (overlay)', labelsOn, [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v) => {
            if (v === 'on') { component.classList.remove('mr-labels-off'); }
            else { component.classList.add('mr-labels-off'); }
        });

        // Image management
        const actions = document.createElement('div');
        actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.marginTop = '8px';
        const btnUpload = this.createButton('Upload meerdere', () => {
            const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
            input.onchange = (e)=>{
                const files = Array.from(e.target.files||[]);
                const readers = files.map(f=> new Promise((res)=>{ const rd = new FileReader(); rd.onload = ev=>res(ev.target.result); rd.readAsDataURL(f); }));
                Promise.all(readers).then(urls=>{ api.addImages && api.addImages(urls); renderList(); });
            };
            input.click();
        });
        const btnMediaMulti = this.createButton('Media meerdere', async () => {
            if (!window.MediaPicker) return;
            const collected = [];
            for (let i = 0; i < 24; i++) {
                try {
                    const r = await window.MediaPicker.openImage();
                    const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (!u) break; collected.push(u);
                } catch { break; }
            }
            if (collected.length) { api.addImages && api.addImages(collected); renderList(); }
        });
        const btnUnsplash = this.createButton('Unsplash meerdere', async () => {
            if (!window.MediaPicker) return;
            const collected = [];
            while (true) {
                try {
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (!u) break; collected.push(u);
                } catch { break; }
                if (collected.length > 20) break;
            }
            if (collected.length) { api.addImages && api.addImages(collected); renderList(); }
        });
        const btnClear = this.createButton('Verwijder alles', () => { api.setImages && api.setImages([]); renderList(); });
        actions.appendChild(btnUpload); actions.appendChild(btnMediaMulti); actions.appendChild(btnUnsplash); actions.appendChild(btnClear);
        this.panel.appendChild(actions);

        // Optional labels/links per item
        const listWrap = document.createElement('div');
        listWrap.className = 'mr-list'; listWrap.style.marginTop = '10px';
        const renderList = () => {
            listWrap.innerHTML = '';
            const imgs = (api.getImages && api.getImages()) || [];
            imgs.forEach((src, i)=>{
                const row = document.createElement('div');
                row.style.display='grid'; row.style.gridTemplateColumns='80px auto 1fr 1fr auto'; row.style.alignItems='center'; row.style.gap='8px'; row.style.margin='6px 0';
                const thumb = document.createElement('img'); thumb.src = src; thumb.style.width='80px'; thumb.style.height='50px'; thumb.style.objectFit='cover'; thumb.style.borderRadius='6px';
                thumb.style.cursor = 'pointer';
                thumb.title = 'Klik om afbeelding te wijzigen (Media)';
                thumb.onclick = async ()=>{
                    try {
                        if (!window.MediaPicker) return;
                        const r = await window.MediaPicker.openImage();
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (!u) return;
                        const next = imgs.slice(); next[i] = u; api.setImages && api.setImages(next); renderList();
                    } catch {}
                };
                const pick = document.createElement('button'); pick.className='btn btn-secondary btn-small'; pick.textContent='Kies'; pick.onclick = async ()=>{
                    try {
                        if (!window.MediaPicker) return;
                        const r = await window.MediaPicker.openImage();
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (!u) return;
                        const next = imgs.slice(); next[i] = u; api.setImages && api.setImages(next); renderList();
                    } catch {}
                };
                const label = document.createElement('input'); label.type='text'; label.placeholder='Label (optioneel)'; label.onchange=()=> api.setItemMeta && api.setItemMeta(i,{label: label.value});
                const href = document.createElement('input'); href.type='text'; href.placeholder='URL (optioneel)'; href.onchange=()=> api.setItemMeta && api.setItemMeta(i,{href: href.value});
                const del = document.createElement('button'); del.className='btn btn-secondary btn-small'; del.textContent='Verwijder'; del.onclick=()=>{
                    const next = imgs.filter((_,idx)=>idx!==i); api.setImages && api.setImages(next); renderList();
                };
                row.appendChild(thumb); row.appendChild(pick); row.appendChild(label); row.appendChild(href); row.appendChild(del);
                listWrap.appendChild(row);
            });
        };
        this.panel.appendChild(listWrap);
        renderList();

        // AI: Generate captions for images
        const aiCap = this.createButton('Genereer captions met AI', async () => {
            try {
                const imgs = (api.getImages && api.getImages()) || [];
                if (!imgs.length) { alert('Geen afbeeldingen gevonden.'); return; }
                const country = (window.BuilderAI && window.BuilderAI.guessCountry && window.BuilderAI.guessCountry()) || '';
                const r = await window.BuilderAI.generate('gallery_captions', { country, language: 'nl', images: imgs });
                const caps = Array.isArray(r?.gallery_captions) ? r.gallery_captions : [];
                if (!caps.length) { alert('Geen captions ontvangen.'); return; }
                imgs.forEach((_, i) => {
                    const cap = caps[i] && (caps[i].caption || '');
                    if (cap) api.setItemMeta && api.setItemMeta(i, { label: cap });
                });
                renderList();
            } catch(err) {
                alert('AI captions genereren mislukt.');
            }
        });
        aiCap.style.background = '#0ea5e9'; aiCap.style.borderColor = '#0ea5e9'; aiCap.style.color = '#fff';
        this.panel.appendChild(aiCap);

        // Count control – aantal foto's bepalen
        const getCount = () => ((api.getImages && api.getImages()) || []).length;
        const initialCount = String(getCount() || 4);
        this.createRangeInput('Aantal foto\'s', initialCount, '1', '24', '1', async (v) => {
            const desired = Math.max(1, parseInt(v,10)||1);
            const current = (api.getImages && api.getImages()) || [];
            if (desired === current.length) return;
            if (desired < current.length) {
                api.setImages && api.setImages(current.slice(0, desired));
                renderList();
                return;
            }
            // desired > current.length → vul aan via MediaPicker (sequentieel)
            const missing = desired - current.length;
            const added = [];
            for (let i = 0; i < missing; i++) {
                try {
                    if (!window.MediaPicker) break;
                    const r = await window.MediaPicker.openImage();
                    const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (!u) break;
                    added.push(u);
                } catch { break; }
            }
            if (added.length) { api.addImages && api.addImages(added); }
            renderList();
        });
    }

    createFeatureHighlightProperties(component) {
        // Orientation
        const isRight = component.classList.contains('right');
        this.createSelectInput('Afbeelding positie', isRight ? 'right' : 'left', [
            { value: 'left', label: 'Links' },
            { value: 'right', label: 'Rechts' }
        ], (v) => {
            component.classList.toggle('right', v === 'right');
        });

        // Elements
        const labelEl = component.querySelector('.fh-label');
        const titleEl = component.querySelector('.fh-title');
        const mainImg = component.querySelector('.fh-main img');
        const insetImg = component.querySelector('.fh-inset img');
        const badgeIcon = component.querySelector('.fh-badge i');
        const metricNum = component.querySelector('.fh-metric .num');
        const metricLbl = component.querySelector('.fh-metric .lbl');

        // AI: Highlights generator (6 items -> vult lijsttitels/ondertitels)
        try {
            const aiBtnHl = this.createButton('Genereer highlights (6) met AI', async () => {
                try {
                    if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') { alert('AI module niet geladen.'); return; }
                    const country = (window.BuilderAI.guessCountry && window.BuilderAI.guessCountry()) || '';
                    const r = await window.BuilderAI.generate('highlights', { country, language: 'nl', count: 6 });
                    const items = Array.isArray(r?.highlights) ? r.highlights : [];
                    if (!items.length) { alert('Geen highlights ontvangen.'); return; }
                    const nodes = component.querySelectorAll('.fh-list .fh-item');
                    nodes.forEach((node, i) => {
                        const d = items[i]; if (!d) return;
                        const tEl = node.querySelector('.fh-item-title');
                        const sEl = node.querySelector('.fh-item-sub');
                        if (tEl) tEl.textContent = d.title || tEl.textContent;
                        if (sEl) sEl.textContent = d.summary || sEl.textContent;
                    });
                } catch { alert('AI highlights genereren mislukt.'); }
            });
            aiBtnHl.style.background = '#0ea5e9'; aiBtnHl.style.borderColor = '#0ea5e9'; aiBtnHl.style.color = '#fff';
            this.panel.appendChild(aiBtnHl);
        } catch {}

        if (labelEl) this.createTextInput('Label', labelEl.textContent, (v) => { labelEl.textContent = v; });
        if (titleEl) this.createTextInput('Titel', titleEl.textContent, (v) => { titleEl.textContent = v; });
        if (metricNum) this.createTextInput('Metric nummer', metricNum.textContent, (v) => { metricNum.textContent = v; });
        if (metricLbl) this.createTextInput('Metric label', metricLbl.textContent, (v) => { metricLbl.textContent = v; });

        // Colors
        if (titleEl) this.createColorInput('Titel kleur', titleEl.style.color || '#111827', (v) => { titleEl.style.color = v; });
        const bullet = component.querySelector('.fh-bullet span');
        if (bullet) this.createColorInput('Bullet kleur', bullet.style.backgroundColor || '#ff7700', (v) => {
            component.querySelectorAll('.fh-bullet span').forEach(b => b.style.backgroundColor = v);
        });
        const ic = component.querySelector('.fh-ic i');
        if (ic) this.createColorInput('Icoon kleur (lijst)', ic.style.color || '#16a34a', (v) => {
            component.querySelectorAll('.fh-ic').forEach(el => el.style.color = v);
        });
        const badge = component.querySelector('.fh-badge');
        if (badge) this.createColorInput('Badge achtergrond', badge.style.backgroundColor || '#16a34a', (v) => { badge.style.backgroundColor = v; });

        // Badge icon
        if (badgeIcon) {
            const currentIcon = Array.from(badgeIcon.classList).find(c => c.startsWith('fa-') && c !== 'fas') || 'fa-map-marker-alt';
            this.createIconPickerInput('Badge icoon', currentIcon, (val) => { badgeIcon.className = `fas ${val}`; });
        }

        // Image pickers
        const pickImage = async (imgEl) => {
            try {
                let src = '';
                if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                    const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    src = res.fullUrl || res.regularUrl || res.url || res.dataUrl || '';
                } else {
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
                if (src && imgEl) imgEl.src = src;
            } catch(err) { console.warn('Image select canceled/failed', err); }
        };

        if (mainImg) {
            const btn = this.createButton('Hoofdafbeelding kiezen', () => pickImage(mainImg));
            btn.style.background = '#ff7700'; btn.style.borderColor = '#ff7700'; btn.style.color = '#fff';
            this.panel.appendChild(btn);
        }
        if (insetImg) {
            const btn = this.createButton('Inset-afbeelding kiezen', () => pickImage(insetImg));
            btn.style.background = '#ff7700'; btn.style.borderColor = '#ff7700'; btn.style.color = '#fff';
            this.panel.appendChild(btn);
        }

        // List items
        const items = component.querySelectorAll('.fh-item');
        items.forEach((it, idx) => {
            const iconEl = it.querySelector('.fh-ic i');
            const tEl = it.querySelector('.fh-item-title');
            const sEl = it.querySelector('.fh-item-sub');
            const box = document.createElement('div');
            box.style.border = '1px solid #e5e7eb';
            box.style.borderRadius = '8px';
            box.style.padding = '12px';
            box.style.margin = '10px 0';
            box.style.background = '#fafafa';
            const heading = document.createElement('div');
            heading.textContent = `Lijstitem ${idx+1}`;
            heading.style.fontWeight = '600'; heading.style.marginBottom = '8px'; heading.style.color = '#374151';
            box.appendChild(heading);

            // Icon
            if (iconEl) this.createIconPickerInput('Icoon', Array.from(iconEl.classList).find(c=>c.startsWith('fa-') && c!=='fas') || 'fa-shield-heart', (val)=>{ iconEl.className = `fas ${val}`; });
            // Texts
            this.createTextInput('Titel', tEl?.textContent || '', (v)=>{ if (tEl) tEl.textContent = v; });
            this.createTextInput('Omschrijving', sEl?.textContent || '', (v)=>{ if (sEl) sEl.textContent = v; });

            this.panel.appendChild(box);
        });

        // Danger zone
        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) { component.remove(); this.clearProperties(); }
        });
        del.style.background = '#dc2626'; del.style.borderColor = '#dc2626'; del.style.color = '#fff'; del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createHeroPageProperties(component) {
        // Elements
        const bgImg = component.querySelector('.hp-bg img');
        const overlay = component.querySelector('.hp-overlay');
        let word = component.querySelector('.hp-word');

        // Background image chooser
        const pickBg = this.createButton('Achtergrond kiezen (Media)', async () => {
            try {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && bgImg) bgImg.src = src;
            } catch(err) { console.warn('Media select canceled/failed', err); }
        });
        pickBg.style.background = '#ff7700'; pickBg.style.borderColor = '#ff7700'; pickBg.style.color = '#fff';
        this.panel.appendChild(pickBg);

        // Height (min-height on section) — use numeric slider and add 'px' via callback
        const currentH = parseInt(component.style.minHeight || '600', 10).toString();
        this.createRangeInput('Hoogte (px)', currentH, '120', '1000', '1', (v) => {
            const num = parseInt(v, 10) || 0;
            component.style.minHeight = `${num}px`;
        });

        // Overlay opacity
        const curOverlay = getComputedStyle(overlay).getPropertyValue('--overlay-opacity').trim() || '0.45';
        this.createRangeInput('Overlay transparantie', curOverlay, '0', '1', '0.01', (v) => { overlay?.style.setProperty('--overlay-opacity', parseFloat(v)); });

        // Word visibility (optional)
        const visible = word ? window.getComputedStyle(word).display !== 'none' : false;
        this.createSelectInput('Toon woord', visible ? 'ja' : 'nee', [
            { value: 'ja', label: 'Ja' },
            { value: 'nee', label: 'Nee' }
        ], (val) => {
            if (!word && val === 'ja') {
                word = document.createElement('div');
                word.className = 'hp-word';
                word.textContent = 'NIEUWS';
                component.appendChild(word);
            }
            if (word) word.style.display = (val === 'ja') ? 'block' : 'none';
        });

        // Word text
        const curText = word?.textContent || '';
        this.createTextInput('Woord', curText, (v) => { if (word) word.textContent = v; });

        // Word color
        const curColor = word?.style.color || '#ffffff';
        this.createColorInput('Woord kleur', curColor, (v) => { if (word) word.style.color = v; });

        // Word font size — numeric slider, add 'px' in callback
        const curSize = parseInt(word?.style.fontSize || '200', 10).toString();
        this.createRangeInput('Woord grootte (px)', curSize, '18', '300', '1', (v) => {
            if (word) {
                const num = parseInt(v, 10) || 0;
                word.style.fontSize = `${num}px`;
            }
        });

        // Word opacity
        const curOp = word?.style.opacity || '1';
        this.createRangeInput('Woord transparantie', curOp, '0', '1', '0.01', (v) => { if (word) word.style.opacity = String(parseFloat(v)); });

        // Position X (left) as percentage to move across full width — numeric slider 0–95
        const curLeft = (word?.style.left || '5%').replace('%','');
        this.createRangeInput('Positie X (%)', curLeft, '0', '95', '1', (v) => { if (word) word.style.left = `${parseInt(v,10)||0}%`; });

        // Position Y (bottom) in px with wider range and a quick snap button — numeric slider
        const curBottom = parseInt(word?.style.bottom || '-6', 10).toString();
        this.createRangeInput('Positie Y (px)', curBottom, '-300', '300', '1', (v) => { if (word) word.style.bottom = `${parseInt(v,10)||0}px`; });
        const snapBtn = this.createButton('Zet woord op bodem (0px)', () => { if (word) word.style.bottom = '0px'; });
        this.panel.appendChild(snapBtn);

        // Danger zone
        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        });
        del.style.background = '#dc2626'; del.style.borderColor = '#dc2626'; del.style.color = '#fff'; del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createHeroTravelProperties(component) {
        // Ensure toolbar exists so users can access actions as well
        if (!component.querySelector('.component-toolbar') && window.ComponentFactory?.createToolbar) {
            const tb = window.ComponentFactory.createToolbar();
            component.insertBefore(tb, component.firstChild);
        }

        // Background image
        const bg = component.querySelector('.hero-bg');
        let bgImg = component.querySelector('.hero-bg img');
        // Robustness: if img is missing (older markup), create it and migrate CSS background-image
        if (bg && !bgImg) {
            bgImg = document.createElement('img');
            bgImg.className = 'hero-bg-img';
            // Try to migrate existing CSS background
            try {
                const cssBg = bg.style.backgroundImage || getComputedStyle(bg).backgroundImage || '';
                const m = cssBg.match(/^url\("?(.+?)"?\)$/);
                if (m && m[1]) bgImg.src = m[1];
            } catch {}
            bgImg.alt = 'Hero background';
            bgImg.decoding = 'async';
            bgImg.loading = 'eager';
            bg.insertBefore(bgImg, bg.firstChild || null);
            try { bg.style.backgroundImage = ''; } catch {}
        }
        const overlay = component.querySelector('.hero-overlay');
        const badge = component.querySelector('.hero-badge');
        const title = component.querySelector('.hero-title');
        const subtitle = component.querySelector('.hero-subtitle');
        const search = component.querySelector('.hero-search');

        // Background URL + inline Media button
        const currentBg = (bgImg && bgImg.src) ? bgImg.src : '';
        const bgGroup = this.createTextInput('Achtergrond URL', currentBg, (value) => {
            if (bgImg) bgImg.src = value;
        });
        const inputEl = bgGroup.querySelector('input.form-control');
        if (inputEl) {
            // Wrap input and add inline button
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.gap = '8px';
            row.style.alignItems = 'center';
            inputEl.parentNode.replaceChild(row, inputEl);
            row.appendChild(inputEl);

            const inlineBtn = document.createElement('button');
            inlineBtn.type = 'button';
            inlineBtn.className = 'btn btn-secondary btn-small';
            inlineBtn.innerHTML = '<i class="fas fa-photo-film"></i> Media';
            inlineBtn.style.backgroundColor = '#ff7700';
            inlineBtn.style.borderColor = '#ff7700';
            inlineBtn.style.color = '#fff';
            inlineBtn.style.fontWeight = '600';
            inlineBtn.title = 'Achtergrond kiezen (Media)';
            inlineBtn.onclick = async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage();
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && bgImg) {
                    bgImg.src = src;
                    inputEl.value = src;
                }
            };
            row.appendChild(inlineBtn);
        }

        // Media Picker button for background
        const pickBgBtn = this.createButton('Achtergrond kiezen (Media)', async () => {
            if (!window.MediaPicker) return;
            const res = await window.MediaPicker.openImage();
            const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
            if (src && bgImg) {
                bgImg.src = src;
            }
        });
        this.panel.appendChild(pickBgBtn);

        // Overlay opacity
        const currentOpacity = getComputedStyle(overlay).getPropertyValue('--overlay-opacity').trim() || '0.45';
        this.createRangeInput('Overlay Transparantie', currentOpacity, '0', '1', '0.05', (value) => {
            // value komt als string terug; geen eenheid toevoegen
            if (overlay) overlay.style.setProperty('--overlay-opacity', parseFloat(value));
        });

        // Badge text
        if (badge) {
            this.createTextInput('Badge tekst', badge.textContent, (value) => { badge.textContent = value; });
        }

        // Title & subtitle
        if (title) {
            this.createTextInput('Titel', title.textContent, (value) => { title.textContent = value; });
        }
        if (subtitle) {
            this.createTextInput('Subtitel', subtitle.textContent, (value) => { subtitle.textContent = value; });
        }

        // Search fields
        if (search) {
            const values = search.querySelectorAll('.search-item .value');
            const labels = ['Locatie', 'Type', 'Duur', 'Prijs'];
            values.forEach((el, idx) => {
                this.createTextInput(`Zoekveld ${labels[idx]}`, el.textContent, (value) => { el.textContent = value; });
            });
        }

        // Cards basic editing
        const cards = component.querySelectorAll('.hero-card');
        const faOptions = [
            { value: 'fa-campground', label: 'Campground' },
            { value: 'fa-umbrella-beach', label: 'Beach' },
            { value: 'fa-compass', label: 'Compass' },
            { value: 'fa-globe', label: 'Globe' },
            { value: 'fa-person-biking', label: 'Mountain Biking' },
            { value: 'fa-hiking', label: 'Hiking' },
            { value: 'fa-ship', label: 'Cruise/Ship' },
            { value: 'fa-plane', label: 'Plane/Flights' },
            { value: 'fa-city', label: 'City' },
            { value: 'fa-water', label: 'Water' },
            { value: 'fa-tree', label: 'Nature' },
            { value: 'fa-snowflake', label: 'Winter' }
        ];

        cards.forEach((card, idx) => {
            const h4 = card.querySelector('h4');
            const p = card.querySelector('p');
            const iconEl = card.querySelector('.icon i');
            const currentIconClass = Array.from(iconEl?.classList || []).find(c => c.startsWith('fa-') && c !== 'fa' && c !== 'fas') || '';

            this.createTextInput(`Kaart ${idx+1} titel`, h4?.textContent || '', (value) => { if (h4) h4.textContent = value; });
            this.createTextInput(`Kaart ${idx+1} tekst`, p?.textContent || '', (value) => { if (p) p.textContent = value; });

            // Icon select
            this.createSelectInput(`Kaart ${idx+1} icoon`, currentIconClass, faOptions, (value) => {
                if (iconEl) {
                    // remove previous fa-* class
                    iconEl.className = `fas ${value}`;
                }
            });

            // Custom icon class override
            this.createTextInput(`Kaart ${idx+1} custom icon (Font Awesome class)`, currentIconClass, (value) => {
                if (iconEl) iconEl.className = `fas ${value}`;
            });

            // Icon Picker button with live preview
            this.createIconPickerInput(`Kaart ${idx+1} kies icoon`, currentIconClass || 'fa-star', async (faClass) => {
                if (iconEl) iconEl.className = `fas ${faClass}`;
            });

            // Icon color
            const currentColor = iconEl?.style.color || '#16a34a';
            this.createColorInput(`Kaart ${idx+1} icoon kleur`, currentColor, (value) => {
                if (iconEl) iconEl.style.color = value;
            });

            // Icon size
            const currentSize = iconEl?.style.fontSize || '26px';
            this.createRangeInput(`Kaart ${idx+1} icoon grootte`, currentSize, '12px', '64px', '1px', (value) => {
                if (iconEl) iconEl.style.fontSize = value;
            });
        });

        // Danger zone: guaranteed delete for this section
        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze Hero sectie wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        });
        del.style.background = '#dc2626';
        del.style.borderColor = '#dc2626';
        del.style.color = '#fff';
        del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createContactInfoProperties(component) {
        // Label & title
        const labelEl = component.querySelector('.ci-label');
        const titleEl = component.querySelector('.ci-title');
        if (labelEl) this.createTextInput('Label', labelEl.textContent, (v) => { labelEl.textContent = v; });
        if (titleEl) this.createTextInput('Titel', titleEl.textContent, (v) => { titleEl.textContent = v; });

        // Colors (apply to section elements)
        if (labelEl) {
            this.createColorInput('Label achtergrondkleur', labelEl.style.backgroundColor || '#e8f5e9', (val) => { labelEl.style.backgroundColor = val; });
            this.createColorInput('Label tekstkleur', labelEl.style.color || '#16a34a', (val) => { labelEl.style.color = val; });
        }
        if (titleEl) {
            this.createColorInput('Titel kleur', titleEl.style.color || '#111827', (val) => { titleEl.style.color = val; });
        }
        // Icons and card colors (affect all cards)
        const iconEls = component.querySelectorAll('.ci-icon i');
        const cardEls = component.querySelectorAll('.ci-card');
        const lineEls = component.querySelectorAll('.ci-line');
        this.createColorInput('Pictogram kleur', iconEls[0]?.style.color || '#16a34a', (val) => { iconEls.forEach(i => { i.style.color = val; }); });
        this.createColorInput('Kaart achtergrondkleur', cardEls[0]?.style.backgroundColor || '#f8fafc', (val) => { cardEls.forEach(c => { c.style.backgroundColor = val; }); });
        this.createColorInput('Tekstkleur (regels)', lineEls[0]?.style.color || '#6b7280', (val) => { lineEls.forEach(t => { t.style.color = val; }); });

        // Cards (3)
        const cards = component.querySelectorAll('.ci-card');
        cards.forEach((card, idx) => {
            const iconEl = card.querySelector('.ci-icon i');
            const tEl = card.querySelector('.ci-card-title');
            const lines = card.querySelectorAll('.ci-line');

            const box = document.createElement('div');
            box.style.border = '1px solid #e5e7eb';
            box.style.borderRadius = '8px';
            box.style.padding = '12px';
            box.style.margin = '10px 0';
            box.style.background = '#fafafa';
            const heading = document.createElement('div');
            heading.textContent = `Kaart ${idx+1}`;
            heading.style.fontWeight = '600';
            heading.style.marginBottom = '8px';
            heading.style.color = '#374151';
            box.appendChild(heading);

            // Icon picker
            const currentIcon = iconEl ? Array.from(iconEl.classList).find(c => c.startsWith('fa-') && c !== 'fas') || 'fa-location-dot' : 'fa-location-dot';
            this.createIconPickerInput('Icoon', currentIcon, (val) => { if (iconEl) iconEl.className = `fas ${val}`; });

            // Title and lines
            const titleInput = this.createTextInput('Titel', tEl?.textContent || '', (v) => { if (tEl) tEl.textContent = v; });
            const line1Input = this.createTextInput('Regel 1', lines[0]?.textContent || '', (v) => { if (lines[0]) lines[0].textContent = v; });
            const line2Input = this.createTextInput('Regel 2', lines[1]?.textContent || '', (v) => { if (lines[1]) lines[1].textContent = v; });
            box.appendChild(titleInput);
            box.appendChild(line1Input);
            box.appendChild(line2Input);

            this.panel.appendChild(box);
        });

        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        });
        del.style.background = '#dc2626';
        del.style.borderColor = '#dc2626';
        del.style.color = '#fff';
        del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createContactMapCtaProperties(component) {
        const mapFrame = component.querySelector('.cmc-map iframe');
        const banner = component.querySelector('.cmc-banner');
        const badge = component.querySelector('.cmc-badge');
        const title = component.querySelector('.cmc-title');
        const subtitle = component.querySelector('.cmc-subtitle');
        const cta = component.querySelector('.cmc-cta');
        const iconEl = component.querySelector('.cmc-icon i');

        // Map URL and height
        if (mapFrame) this.createTextInput('Kaart URL (iframe src)', mapFrame.src, (v) => { mapFrame.src = v; });
        const currentH = component.querySelector('.cmc-map')?.style.height || '420px';
        this.createTextInput('Kaart hoogte (px)', currentH.replace('px',''), (v) => { const wrap = component.querySelector('.cmc-map'); if (wrap) wrap.style.height = `${parseInt(v||'420',10)}px`; });

        // Banner content
        if (badge) this.createTextInput('Banner label', badge.textContent, (v) => { badge.textContent = v; });
        if (title) this.createTextInput('Banner titel', title.textContent, (v) => { title.textContent = v; });
        if (subtitle) this.createTextInput('Banner subtitel', subtitle.textContent, (v) => { subtitle.textContent = v; });
        if (cta) {
            const span = cta.querySelector('span');
            this.createTextInput('CTA tekst', span ? span.textContent : cta.textContent, (v) => { if (span) span.textContent = v; else cta.textContent = v; });
            this.createTextInput('CTA link', cta.getAttribute('href') || '#', (v) => { cta.setAttribute('href', v || '#'); });
            this.createSelectInput('CTA target', cta.getAttribute('target') || '_self', [
                { value: '_self', label: 'Zelfde tab' },
                { value: '_blank', label: 'Nieuwe tab' }
            ], (val) => { cta.setAttribute('target', val); });
        }

        // Icon picker (left icon)
        if (iconEl) {
            const currentIcon = Array.from(iconEl.classList).find(c => c.startsWith('fa-') && c !== 'fas') || 'fa-brain';
            this.createIconPickerInput('Banner icoon', currentIcon, (val) => { iconEl.className = `fas ${val}`; });
        }

        // Colors & styling
        if (banner) {
            // Helpers to work with rgba and hex
            const toRgba = (hex, a) => {
                const clean = hex.replace('#','');
                const bigint = parseInt(clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean, 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${r},${g},${b},${a})`;
            };
            const parseAlpha = (rgbaStr) => {
                const m = String(rgbaStr||'').match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/i);
                return m ? parseFloat(m[1]) : 0.92;
            };
            const defaultHex = '#10b981';
            // Try to infer current base color from style (fallback to default)
            const currentBg = banner.style.backgroundColor || '';
            let currentAlpha = parseAlpha(currentBg);
            if (Number.isNaN(currentAlpha)) currentAlpha = 0.92;

            // Store chosen hex in dataset so subsequent updates preserve the color while user moves opacity
            if (!banner.dataset.baseColor) banner.dataset.baseColor = defaultHex;

            this.createColorInput('Banner kleur', banner.dataset.baseColor, (hex) => {
                banner.dataset.baseColor = hex;
                banner.style.backgroundColor = toRgba(hex, currentAlpha);
            });
            this.createRangeInput('Banner dekking (opacity)', String(currentAlpha), '0', '1', '0.01', (val) => {
                const a = parseFloat(val);
                currentAlpha = a;
                const hex = banner.dataset.baseColor || defaultHex;
                banner.style.backgroundColor = toRgba(hex, a);
            });

            this.createRangeInput('Banner afronding', banner.style.borderRadius || '14px', '0px', '40px', '1px', (v) => { banner.style.borderRadius = v; });
            // Vertical offset via transform translateY part (we adjust using margin-top for simplicity)
            const currentOffset = banner.style.marginTop || '';
            this.createTextInput('Banner offset Y (px, neg = hoger)', currentOffset.replace('px','') || '-40', (val) => {
                const px = parseInt(val || '-40', 10);
                banner.style.marginTop = `${px}px`;
            });
        }

        if (badge) {
            this.createColorInput('Badge achtergrond', badge.style.backgroundColor || 'rgba(255,255,255,0.2)', (v) => { badge.style.backgroundColor = v; });
            this.createColorInput('Badge tekstkleur', badge.style.color || '#ffffff', (v) => { badge.style.color = v; });
        }
        if (title) {
            this.createColorInput('Titel kleur', title.style.color || '#ffffff', (v) => { title.style.color = v; });
        }
        if (subtitle) {
            this.createColorInput('Subtitel kleur', subtitle.style.color || 'rgba(255,255,255,0.9)', (v) => { subtitle.style.color = v; });
        }
        if (cta) {
            const btn = cta;
            this.createColorInput('CTA achtergrond', btn.style.backgroundColor || '#ffffff', (v) => { btn.style.backgroundColor = v; btn.style.borderColor = v; });
            this.createColorInput('CTA tekstkleur', btn.style.color || '#111827', (v) => { btn.style.color = v; });
            this.createRangeInput('CTA afronding', btn.style.borderRadius || '999px', '0px', '40px', '1px', (v) => { btn.style.borderRadius = v; });
        }

        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        });
        del.style.background = '#dc2626';
        del.style.borderColor = '#dc2626';
        del.style.color = '#fff';
        del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    // Icon Picker helper (uses global IconPicker); falls back to <select> when not available
    createIconPickerInput(label, current, onChange) {
        const group = this.createFormGroup(label);
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';

        const preview = document.createElement('div');
        preview.innerHTML = `<i class="fas ${current}"></i>`;
        preview.style.fontSize = '20px';
        preview.style.width = '28px';
        preview.style.textAlign = 'center';
        preview.style.color = '#16a34a';

        // Fallback select with common FA5 icons (always shown)
        const fallbackSelect = document.createElement('select');
        fallbackSelect.className = 'form-control';
        fallbackSelect.style.maxWidth = '220px';
        // Travel-centric icon categories (Font Awesome 5)
        const categories = {
            'Alle': [
                'fa-map-marker-alt','fa-compass','fa-globe','fa-route','fa-binoculars','fa-camera','fa-star','fa-heart','fa-check-circle','fa-bolt','fa-leaf'
            ],
            'Reizen': [
                'fa-hiking','fa-campground','fa-umbrella-beach','fa-mountain','fa-compass','fa-globe','fa-map-marker-alt','fa-route','fa-camera','fa-binoculars'
            ],
            'Accommodatie': [
                'fa-hotel','fa-bed','fa-home','fa-cocktail','fa-swimming-pool','fa-hot-tub'
            ],
            'Transport': [
                'fa-plane','fa-ship','fa-bus','fa-car-side','fa-subway','fa-train','fa-bicycle'
            ],
            'Natuur': [
                'fa-leaf','fa-tree','fa-water','fa-seedling','fa-sun','fa-cloud-sun'
            ],
            'Algemeen': [
                'fa-shield-alt','fa-hand-holding-usd','fa-compass','fa-star','fa-heart','fa-check-circle'
            ]
        };
        // Flatten and unique
        const uniq = (arr) => Array.from(new Set(arr));
        const iconOptions = uniq(Object.values(categories).flat());
        const fillSelect = (list) => {
            fallbackSelect.innerHTML = '';
            list.forEach((ic) => {
                const opt = document.createElement('option');
                opt.value = ic;
                opt.textContent = ic.replace('fa-','');
                if (ic === current) opt.selected = true;
                fallbackSelect.appendChild(opt);
            });
        };
        fillSelect(iconOptions);
        fallbackSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            preview.innerHTML = `<i class=\"fas ${val}\"></i>`;
            onChange(val);
        });

        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-small';
        btn.type = 'button';
        btn.textContent = 'Kies icoon';
        btn.onclick = async () => {
            if (!window.IconPicker) { fallbackSelect.focus(); return; }
            const res = await window.IconPicker.open({ current, compact: true });
            if (res?.icon) {
                preview.innerHTML = `<i class=\"fas ${res.icon}\"></i>`;
                onChange(res.icon);
            }
        };

        wrapper.appendChild(preview);
        wrapper.appendChild(btn);
        wrapper.appendChild(fallbackSelect);
        group.appendChild(wrapper);

        // Visual icon grid fallback (renders icon previews as buttons)
        const grid = document.createElement('div');
        grid.className = 'icon-grid';
        iconOptions.forEach((ic) => {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'icon-cell';
            cell.innerHTML = `<i class="fas ${ic}"></i>`;
            if (ic === current) cell.classList.add('active');
            cell.onclick = () => {
                preview.innerHTML = `<i class=\"fas ${ic}\"></i>`;
                onChange(ic);
                grid.querySelectorAll('.icon-cell').forEach(el => el.classList.remove('active'));
                cell.classList.add('active');
            };
            grid.appendChild(cell);
        });
        group.appendChild(grid);
        this.panel.appendChild(group);
        return group;
    }

    showProperties(component) {
        this.currentComponent = component;
        const componentType = component.getAttribute('data-component');
        
        this.panel.innerHTML = '';
        
        // Component title
        const title = document.createElement('h4');
        title.textContent = this.getComponentTitle(componentType);
        title.style.marginBottom = '1rem';
        title.style.color = '#333';
        this.panel.appendChild(title);

        // Global actions (consistent UI): Duplicate + Delete
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        actions.style.marginBottom = '12px';

        const dupBtn = document.createElement('button');
        dupBtn.className = 'btn btn-secondary btn-small';
        dupBtn.type = 'button';
        dupBtn.textContent = 'Dupliceren';
        dupBtn.setAttribute('aria-label', 'Component dupliceren');
        dupBtn.onclick = () => {
            if (!component.parentElement) return;
            const clone = component.cloneNode(true);
            clone.id = window.ComponentFactory?.generateId(componentType) || `${componentType}_${Date.now()}`;
            component.parentElement.insertBefore(clone, component.nextSibling);
            // Rebind toolbar/events for clone
            window.ComponentFactory?.rebindToolbar?.(clone);
            window.ComponentFactory?.makeSelectable?.(clone);
            // Select the clone
            document.querySelectorAll('.wb-component.selected').forEach(el => el.classList.remove('selected'));
            clone.classList.add('selected');
            this.showProperties(clone);
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-secondary btn-small';
        delBtn.type = 'button';
        delBtn.textContent = 'Verwijderen';
        delBtn.style.background = '#dc2626';
        delBtn.style.borderColor = '#dc2626';
        delBtn.style.color = '#fff';
        delBtn.setAttribute('aria-label', 'Component verwijderen');
        delBtn.onclick = () => {
            if (confirm('Weet je zeker dat je dit component wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        };

        actions.appendChild(dupBtn);
        actions.appendChild(delBtn);
        this.panel.appendChild(actions);
        
        // Generate properties based on component type
        switch (componentType) {
            case 'container':
                this.createContainerProperties(component);
                break;
            case 'row':
                this.createRowProperties(component);
                break;
            case 'column':
                this.createColumnProperties(component);
                break;
            case 'heading':
                this.createHeadingProperties(component);
                break;
            case 'text':
                this.createTextProperties(component);
                break;
            case 'image':
                this.createImageProperties(component);
                break;
            case 'button':
                this.createButtonProperties(component);
                break;
            case 'video':
                this.createVideoProperties(component);
                break;
            case 'gallery':
                this.createGalleryProperties(component);
                break;
            case 'hero-travel':
                // Add a prominent top-level media button for Hero background
                (function addTopHeroMediaButton(self, comp){
                    const btn = self.createButton('Achtergrond kiezen (Media)', async () => {
                        if (!window.MediaPicker) return;
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const src = res?.dataUrl || res?.url;
                        const bg = comp.querySelector('.hero-bg');
                        if (src && bg) bg.style.backgroundImage = `url("${src}")`;
                    });
                    // Emphasize button visually
                    btn.style.backgroundColor = '#ff7700';
                    btn.style.borderColor = '#ff7700';
                    btn.style.color = '#fff';
                    btn.style.fontWeight = '700';
                    self.panel.appendChild(btn);
                })(this, component);
                this.createHeroTravelProperties(component);
                break;
            case 'hero-page':
                this.createHeroPageProperties(component);
                break;
            case 'hero-banner-cta':
                this.createHeroBannerCtaProperties(component);
                break;
            case 'feature-media':
                this.createFeatureMediaProperties(component);
                break;
            case 'feature-highlight':
                this.createFeatureHighlightProperties(component);
                break;
            case 'content-flex':
                this.createContentFlexProperties(component);
                break;
            case 'travel-types':
                this.createTravelTypesProperties(component);
                break;
            case 'contact-info':
                this.createContactInfoProperties(component);
                break;
            case 'jotform-embed':
                this.createJotformEmbedProperties(component);
                break;
            case 'contact-map-cta':
                this.createContactMapCtaProperties(component);
                break;
            case 'media-row':
                this.createMediaRowProperties(component);
                break;
            case 'dest-tabs':
                this.createDestTabsProperties(component);
                break;
        }
        
        // Common properties for all components
        this.createCommonProperties(component);
    }

    clearProperties() {
        this.currentComponent = null;
        this.panel.innerHTML = '<p class="no-selection">Selecteer een element om eigenschappen te bewerken</p>';
    }

    getComponentTitle(type) {
        const titles = {
            container: 'Container',
            row: 'Rij',
            column: 'Kolom',
            heading: 'Titel',
            text: 'Tekst',
            image: 'Afbeelding',
            button: 'Knop',
            video: 'Video',
            gallery: 'Galerij',
            'hero-travel': 'Hero Travel',
            'hero-page': 'Hero (Pagina)',
            'hero-banner-cta': 'Hero Banner + CTA',
            'feature-media': 'Feature + Media',
            'feature-highlight': 'Feature Highlight',
            'travel-types': 'Soorten Reizen',
            'contact-info': 'Contact Info',
            'contact-map-cta': 'Contact Map + CTA',
            'media-row': 'Media Rij',
            'dest-tabs': 'Bestemmingen Tabs'
        };
        return titles[type] || 'Component';
    }

    // Properties for Destinations Tabs (Cities/Regions/UNESCO)
    createDestTabsProperties(component) {
        const api = component.__destTabsApi || {};
        const tabs = ['cities','regions','unesco'];
        const labels = { cities: 'Steden', regions: 'Regio\'s', unesco: 'UNESCO' };

        // Active tab select
        const current = (api.getActiveTab && api.getActiveTab()) || component._activeTab || 'cities';
        this.createSelectInput('Actieve tab', current, tabs.map(k=>({value:k,label:labels[k]})), (val)=>{
            api.setActiveTab && api.setActiveTab(val);
            renderList();
        });

        // Mobile slider toggle
        const mobileOn = component._mobileSlider !== false ? 'on' : 'off';
        this.createSelectInput('Mobiele slider', mobileOn, [
            { value: 'on', label: 'Aan' },
            { value: 'off', label: 'Uit' }
        ], (v)=> api.setMobileSlider && api.setMobileSlider(v==='on'));

        // Tab selector buttons for quick switch
        const tabRow = document.createElement('div');
        tabRow.style.display = 'flex'; tabRow.style.gap = '6px'; tabRow.style.margin = '6px 0 10px';
        tabs.forEach(k=>{
            const b = document.createElement('button');
            b.className = 'btn btn-secondary btn-small';
            b.type = 'button';
            b.textContent = labels[k];
            b.onclick = () => { api.setActiveTab && api.setActiveTab(k); renderList(); };
            tabRow.appendChild(b);
        });
        this.panel.appendChild(tabRow);

        // Items editor
        const listWrap = document.createElement('div');
        listWrap.style.border = '1px solid #e5e7eb';
        listWrap.style.borderRadius = '8px';
        listWrap.style.padding = '10px';
        listWrap.style.background = '#fafafa';
        this.panel.appendChild(listWrap);

        const renderList = () => {
            const active = (api.getActiveTab && api.getActiveTab()) || 'cities';
            const items = (api.getItems && api.getItems(active)) || [];
            listWrap.innerHTML = '';

            // Header
            const h = document.createElement('div');
            h.style.display = 'grid'; h.style.gridTemplateColumns = '80px 1.2fr 1.8fr 1.4fr auto'; h.style.gap = '8px'; h.style.marginBottom = '6px'; h.style.color = '#6b7280'; h.style.fontSize = '12px';
            h.innerHTML = '<div>Foto</div><div>Titel</div><div>Samenvatting</div><div>Link</div><div>Acties</div>';
            listWrap.appendChild(h);

            items.forEach((it, idx) => {
                const row = document.createElement('div');
                row.style.display = 'grid';
                row.style.gridTemplateColumns = '80px 1.2fr 1.8fr 1.4fr auto';
                row.style.gap = '8px';
                row.style.alignItems = 'center';
                row.style.margin = '6px 0';

                // Thumb
                const thumb = document.createElement('img');
                thumb.src = it.img || ''; thumb.alt = it.title || ''; thumb.style.width='80px'; thumb.style.height='50px'; thumb.style.objectFit='cover'; thumb.style.borderRadius='6px';
                thumb.style.cursor='pointer';
                thumb.title = 'Wijzig afbeelding';
                thumb.onclick = async () => {
                    try {
                        if (!window.MediaPicker) return;
                        const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (!u) return;
                        api.updateItem && api.updateItem(active, idx, { img: u });
                        renderList();
                    } catch {}
                };

                // Title
                const title = document.createElement('input');
                title.type = 'text'; title.className = 'form-control'; title.value = it.title || '';
                title.onchange = () => { api.updateItem && api.updateItem(active, idx, { title: title.value }); };

                // Summary
                const sum = document.createElement('input');
                sum.type = 'text'; sum.className = 'form-control'; sum.value = it.summary || '';
                sum.placeholder = '2–3 regels';
                sum.onchange = () => { api.updateItem && api.updateItem(active, idx, { summary: sum.value }); };

                // Link
                const href = document.createElement('input');
                href.type = 'text'; href.className = 'form-control'; href.value = it.href || '';
                href.placeholder = '/bestemmingen/land/stad/tokio';
                href.onchange = () => { api.updateItem && api.updateItem(active, idx, { href: href.value }); };

                // Actions
                const act = document.createElement('div'); act.style.display='flex'; act.style.gap='6px';
                const up = document.createElement('button'); up.className='btn btn-secondary btn-small'; up.textContent='Omhoog'; up.onclick=()=>{ api.reorder && api.reorder(active, idx, Math.max(0, idx-1)); renderList(); };
                const dn = document.createElement('button'); dn.className='btn btn-secondary btn-small'; dn.textContent='Omlaag'; dn.onclick=()=>{ api.reorder && api.reorder(active, idx, Math.min(items.length-1, idx+1)); renderList(); };
                const rm = document.createElement('button'); rm.className='btn btn-secondary btn-small'; rm.textContent='Verwijder'; rm.onclick=()=>{
                    const next = items.filter((_,i)=>i!==idx);
                    api.setItems && api.setItems(active, next);
                    renderList();
                };
                act.appendChild(up); act.appendChild(dn); act.appendChild(rm);

                row.appendChild(thumb);
                row.appendChild(title);
                row.appendChild(sum);
                row.appendChild(href);
                row.appendChild(act);
                listWrap.appendChild(row);
            });

            // Add button (max 12)
            const addWrap = document.createElement('div'); addWrap.style.marginTop='10px';
            const add = this.createButton('Item toevoegen', () => {
                const activeTab = (api.getActiveTab && api.getActiveTab()) || 'cities';
                const cur = (api.getItems && api.getItems(activeTab)) || [];
                if (cur.length >= 12) { alert('Maximaal 12 items per tab.'); return; }
                const next = cur.concat([{ img: '', title: 'Nieuw', summary: '', href: '#' }]);
                api.setItems && api.setItems(activeTab, next);
                renderList();
            });
            addWrap.appendChild(add);
            const hint = document.createElement('div'); hint.style.fontSize='12px'; hint.style.color='#6b7280'; hint.style.marginTop='6px';
            hint.textContent = 'Tip: Links worden later SEO-vriendelijk gegenereerd per item; je kunt ze hier overschrijven.';
            addWrap.appendChild(hint);
            listWrap.appendChild(addWrap);
        };

        renderList();
    }

    // Properties for the new Hero Banner + CTA variant
    createHeroBannerCtaProperties(component) {
        // Ensure toolbar exists so users can access actions
        if (!component.querySelector('.component-toolbar') && window.ComponentFactory?.createToolbar) {
            const tb = window.ComponentFactory.createToolbar();
            component.insertBefore(tb, component.firstChild);
        }

        const overlay = component.querySelector('.hero-overlay');
        const titleEl = component.querySelector('.hero-title');
        const subEl = component.querySelector('.hero-subtitle');
        const ctas = component.querySelectorAll('.hero-cta a');
        const bgImg = component.querySelector('.hero-bg img');

        // Background mode selector
        const api = component.__heroBannerApi || {};
        // Track mode explicitly to avoid relying on slide count
        const detectMode = () => {
            if (component._heroMode) return component._heroMode;
            if (component.querySelector('.hero-video')) return 'youtube';
            if (component._slides && component._slides.length >= 1) return 'slideshow';
            return 'image';
        };
        let currentMode = detectMode();
        // Anchor to place slideshow manager directly under the mode selector
        const slideAnchor = document.createElement('div');
        slideAnchor.className = 'wb-slideshow-anchor';

        this.createSelectInput('Achtergrond modus', currentMode, [
            { value: 'image', label: 'Afbeelding' },
            { value: 'slideshow', label: 'Slideshow (meerdere afbeeldingen)' },
            { value: 'youtube', label: 'YouTube video' },
            { value: 'widget', label: 'Widget (Travel Compositor)' }
        ], async (mode) => {
            try {
                if (mode === 'image') {
                    component._heroMode = 'image';
                    if (window.MediaPicker) {
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (src && api.setImage) api.setImage(src);
                    }
                    renderSlideshowManager(); // hide if was visible
                    renderYouTubeOptions();
                    renderWidgetOptions(true);
                } else if (mode === 'slideshow') {
                    component._heroMode = 'slideshow';
                    // If switching to slideshow and no slides yet, use MediaPicker once to seed the list
                    if ((!component._slides || !Array.isArray(component._slides) || component._slides.length === 0) && window.MediaPicker) {
                        const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (u && api.setSlideshow) api.setSlideshow([u], component._slideshowInterval || 3500);
                    }
                    // (Re)render the manager for further additions
                    renderSlideshowManager();
                    renderYouTubeOptions();
                    renderWidgetOptions(true);
                } else if (mode === 'youtube') {
                    component._heroMode = 'youtube';
                    const r = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                    const embed = r && (r.embedUrl || r.url);
                    if (embed && api.setYouTube) api.setYouTube(embed);
                    renderSlideshowManager(); // hide if was visible
                    renderYouTubeOptions();
                    renderWidgetOptions(true);
                } else if (mode === 'widget') {
                    component._heroMode = 'widget';
                    const defaultUrl = '/public/widgets/tc-searchbox/index.html';
                    const defaultH = component._widgetHeight || 620;
                    if (api.setWidget) api.setWidget(defaultUrl, defaultH);
                    component._widgetUrl = defaultUrl;
                    component._widgetHeight = defaultH;
                    renderSlideshowManager();
                    renderYouTubeOptions(true);
                    renderWidgetOptions();
                }
            } catch (err) {
                console.warn('Mode wisselen geannuleerd/mislukt', err);
            }
        });

        // Insert anchor right after the mode selector controls
        this.panel.appendChild(slideAnchor);

        // Prominent helper button to quickly add one more slide
        const manageSlidesBtn = this.createButton('Voeg nog een foto toe', async () => {
            try {
                // Ensure slideshow mode
                if (component._heroMode !== 'slideshow') {
                    component._heroMode = 'slideshow';
                }
                // Open MediaPicker once and append result
                if (window.MediaPicker) {
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (u) {
                        const next = (component._slides && Array.isArray(component._slides) ? component._slides.slice() : []);
                        next.push(u);
                        component._slides = next;
                        api.setSlideshow && api.setSlideshow(next, component._slideshowInterval || 3500);
                    }
                }
                // Render manager and scroll into view
                renderSlideshowManager();
                const anchor = this.panel.querySelector('.wb-slideshow-anchor');
                if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) { console.warn('Slideshow beheren mislukt', e); }
        });
        manageSlidesBtn.style.backgroundColor = '#2563eb';
        manageSlidesBtn.style.borderColor = '#2563eb';
        manageSlidesBtn.style.color = '#fff';
        manageSlidesBtn.style.fontWeight = '700';
        this.panel.appendChild(manageSlidesBtn);

        // Prominent media button to open the built-in chooser
        const mediaBtn = this.createButton('Achtergrond wijzigen (Media)', () => {
            const trigger = component.querySelector('.hero-media-chooser');
            if (trigger) trigger.click();
        });
        mediaBtn.style.backgroundColor = '#ff7700';
        mediaBtn.style.borderColor = '#ff7700';
        mediaBtn.style.color = '#fff';
        mediaBtn.style.fontWeight = '700';
        this.panel.insertBefore(mediaBtn, manageSlidesBtn);

        // Height control (min-height on section)
        const currentH = parseInt(component.style.minHeight || '560', 10).toString();
        this.createRangeInput('Hoogte (px)', currentH, '320', '1000', '1', (v) => {
            const num = parseInt(v, 10) || 0;
            component.style.minHeight = `${num}px`;
        });

        // Overlay opacity (CSS var on .hero-overlay)
        if (overlay) {
            const cur = getComputedStyle(overlay).getPropertyValue('--overlay-opacity').trim() || '0.45';
            this.createRangeInput('Overlay transparantie', cur, '0', '1', '0.01', (val) => {
                overlay.style.setProperty('--overlay-opacity', parseFloat(val));
            });
        }

        // Title & subtitle quick edits
        if (titleEl) this.createTextInput('Titel', titleEl.textContent, (v) => { titleEl.textContent = v; });
        if (subEl) this.createTextInput('Subtitel', subEl.textContent, (v) => { subEl.textContent = v; });

        // CTA edits (text and link)
        ctas.forEach((a, i) => {
            const span = a.querySelector('span');
            this.createTextInput(`CTA ${i+1} tekst`, span ? span.textContent : a.textContent, (val) => {
                if (span) span.textContent = val; else a.textContent = val;
            });
            this.createTextInput(`CTA ${i+1} link`, a.getAttribute('href') || '#', (val) => { a.setAttribute('href', val || '#'); });
            this.createSelectInput(`CTA ${i+1} target`, a.getAttribute('target') || '_self', [
                { value: '_self', label: 'Zelfde tab' },
                { value: '_blank', label: 'Nieuwe tab' }
            ], (t) => { a.setAttribute('target', t); });
        });

        // Ensure two-layer background present (upgrade in properties view)
        try {
            const bgEl = component.querySelector('.hero-bg');
            if (bgEl) {
                const imgs = bgEl.querySelectorAll('img');
                if (imgs.length === 1) {
                    const imgA = imgs[0];
                    const imgB = document.createElement('img');
                    imgB.alt = imgA.alt || 'Hero background';
                    imgB.decoding = 'async';
                    imgB.loading = 'eager';
                    imgA.style.opacity = imgA.style.opacity || '1';
                    imgA.style.transform = 'translateX(0)';
                    imgB.style.opacity = '0';
                    imgB.style.transform = 'translateX(0)';
                    const cs = getComputedStyle(component);
                    const dur = cs.getPropertyValue('--hero-xfade-duration').trim() || '.35s';
                    const easing = cs.getPropertyValue('--hero-xfade-easing').trim() || 'ease';
                    imgA.style.setProperty('--hero-xfade-duration', dur);
                    imgA.style.setProperty('--hero-xfade-easing', easing);
                    imgB.style.setProperty('--hero-xfade-duration', dur);
                    imgB.style.setProperty('--hero-xfade-easing', easing);
                    bgEl.appendChild(imgB);
                    component._imgA = imgA;
                    component._imgB = imgB;
                    component._activeImg = component._activeImg || 'A';
                    component._transitionType = component._transitionType || 'fade';
                }
            }
        } catch {}

        // Slideshow interval (visible also when user selects slideshow mode)
        const defaultMs = component._slideshowInterval || 3500;
        this.createRangeInput('Slideshow interval (ms)', String(defaultMs), '1000', '10000', '100', (val) => {
            const ms = parseInt(val, 10) || 3500;
            component._slideshowInterval = ms;
            if (api.isSlideshow && api.isSlideshow()) {
                api.setSlideshow && api.setSlideshow(component._slides || [], ms);
            }
        });

        // Crossfade transition controls (duration + easing)
        const getXfadeMs = () => {
            const raw = getComputedStyle(component).getPropertyValue('--hero-xfade-duration').trim() || '.35s';
            if (raw.endsWith('ms')) return Math.max(0, parseInt(raw, 10) || 350);
            if (raw.endsWith('s')) return Math.max(0, Math.round(parseFloat(raw) * 1000) || 350);
            return 350;
        };
        const curMs = getXfadeMs();
        this.createRangeInput('Overgangsduur (ms)', String(curMs), '0', '2000', '50', (val) => {
            const v = Math.max(0, parseInt(val, 10) || 0);
            component.style.setProperty('--hero-xfade-duration', `${v}ms`);
            const imgs = component.querySelectorAll('.hero-bg img');
            imgs.forEach(el => el.style.setProperty('--hero-xfade-duration', `${v}ms`));
        });

        const easingMap = [
            { value: 'ease', label: 'ease' },
            { value: 'ease-in', label: 'ease-in' },
            { value: 'ease-out', label: 'ease-out' },
            { value: 'ease-in-out', label: 'ease-in-out' },
            { value: 'linear', label: 'linear' },
            { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'material (0.4,0,0.2,1)' }
        ];
        const curEasing = (getComputedStyle(component).getPropertyValue('--hero-xfade-easing').trim() || 'ease') || 'ease';
        this.createSelectInput('Overgang easing', curEasing, easingMap, (val) => {
            component.style.setProperty('--hero-xfade-easing', val);
            const imgs = component.querySelectorAll('.hero-bg img');
            imgs.forEach(el => el.style.setProperty('--hero-xfade-easing', val));
        });

        // Transition type selector (fade or slide)
        const curType = component._transitionType || 'fade';
        this.createSelectInput('Overgang type', curType, [
            { value: 'fade', label: 'Crossfade' },
            { value: 'slide', label: 'Slide-in' }
        ], (val) => {
            component._transitionType = val;
            // Apply to the component API/instance
            if (component.__heroBannerApi) {
                // store on section
                component._transitionType = val;
                // restart slideshow to apply immediately
                if (component._slides && component._slides.length) {
                    const api = component.__heroBannerApi;
                    api.setSlideshow && api.setSlideshow(component._slides, component._slideshowInterval || 3500);
                }
            }
        });

        // Preset buttons for quick transition styles
        const presetWrap = document.createElement('div');
        presetWrap.style.display = 'flex';
        presetWrap.style.gap = '8px';
        presetWrap.style.margin = '8px 0 12px';
        const presetLabel = document.createElement('div');
        presetLabel.textContent = 'Presets:';
        presetLabel.style.fontWeight = '700';
        presetLabel.style.margin = '6px 0 4px';
        presetLabel.style.color = '#374151';
        this.panel.appendChild(presetLabel);
        const makePresetBtn = (label, ms, easing) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.className = 'btn btn-secondary btn-small';
            b.style.border = '1px solid #cbd5e1';
            b.style.background = '#f8fafc';
            b.style.color = '#111827';
            b.style.padding = '6px 10px';
            b.style.borderRadius = '6px';
            b.onclick = () => {
                component.style.setProperty('--hero-xfade-duration', `${ms}ms`);
                component.style.setProperty('--hero-xfade-easing', easing);
                const imgs = component.querySelectorAll('.hero-bg img');
                imgs.forEach(el => {
                    el.style.setProperty('--hero-xfade-duration', `${ms}ms`);
                    el.style.setProperty('--hero-xfade-easing', easing);
                });
                // If slideshow active, restart to apply immediately
                const api = component.__heroBannerApi;
                if (component._slides && component._slides.length && api && api.setSlideshow) {
                    api.setSlideshow(component._slides, component._slideshowInterval || 3500);
                }
            };
            return b;
        };
        presetWrap.appendChild(makePresetBtn('Zacht', 800, 'ease-in-out'));
        presetWrap.appendChild(makePresetBtn('Snel', 250, 'ease-out'));
        presetWrap.appendChild(makePresetBtn('Filmisch', 1200, 'cubic-bezier(0.4, 0, 0.2, 1)'));
        this.panel.appendChild(presetWrap);

        // Quick preset: AI Planner (mooi)
        const aiPreset = this.createButton('AI Planner (mooi)', () => {
            try {
                const api = component.__heroBannerApi || {};
                const url = '/public/widgets/tc-searchbox/ai.html';
                const height = 980;
                const style = 'card';
                const maxW = 1100;
                // Apply mode + widget
                component._heroMode = 'widget';
                component._widgetUrl = url;
                component._widgetHeight = height;
                component._widgetStyle = style;
                component._widgetMax = maxW;
                api.setWidget && api.setWidget(url, height);
                api.updateWidgetStyle && api.updateWidgetStyle(style, maxW);
                // Show title/subtitle/CTA for balance
                const titleEl = component.querySelector('.hero-title');
                const subEl = component.querySelector('.hero-subtitle');
                const ctaWrap = component.querySelector('.hero-cta');
                if (titleEl) titleEl.style.display = '';
                if (subEl) subEl.style.display = '';
                if (ctaWrap) ctaWrap.style.display = '';
                // Overlay translucency
                const overlay = component.querySelector('.hero-overlay');
                if (overlay) overlay.style.setProperty('--overlay-opacity', 0.45);
                // Refresh panels
                renderWidgetOptions();
                renderSlideshowManager();
                const anchor = this.panel.querySelector('.wb-slideshow-anchor');
                if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) { console.warn('Preset toepassen mislukt', e); }
        });
        aiPreset.style.backgroundColor = '#0ea5e9';
        aiPreset.style.borderColor = '#0ea5e9';
        aiPreset.style.color = '#fff';
        aiPreset.style.fontWeight = '700';
        this.panel.appendChild(aiPreset);

        // Widget options UI
        const renderWidgetOptions = (hideOnly = false) => {
            // clean previous
            const old = this.panel.querySelector('.wb-widget-options');
            if (old) old.remove();
            if (hideOnly || component._heroMode !== 'widget') return;
            const box = document.createElement('div');
            box.className = 'wb-widget-options';
            box.style.border = '1px solid #e5e7eb';
            box.style.borderRadius = '8px';
            box.style.padding = '10px';
            box.style.marginTop = '10px';
            const hdr = document.createElement('div');
            hdr.textContent = 'Widget (Travel Compositor)';
            hdr.style.fontWeight = '700';
            hdr.style.marginBottom = '8px';
            hdr.style.color = '#374151';
            box.appendChild(hdr);
            const urlVal = component._widgetUrl || '/public/widgets/tc-searchbox/index.html';
            const hVal = String(component._widgetHeight || 620);
            this.createTextInput('Widget URL', urlVal, (v) => {
                component._widgetUrl = v || '/public/widgets/tc-searchbox/index.html';
                api.setWidget && api.setWidget(component._widgetUrl, component._widgetHeight || 620);
            }, box);
            this.createRangeInput('Widget hoogte (px)', hVal, '360', '1200', '10', (v) => {
                const hv = Math.max(360, parseInt(v, 10) || 620);
                component._widgetHeight = hv;
                api.setWidget && api.setWidget(component._widgetUrl || '/public/widgets/tc-searchbox/index.html', hv);
            }, box);
            const styleVal = component._widgetStyle || 'card';
            this.createSelectInput('Widget stijl', styleVal, [
                { value: 'card', label: 'Card (met schaduw en radius)' },
                { value: 'edge', label: 'Edge-to-edge (volledige breedte)' }
            ], (v) => {
                component._widgetStyle = v;
                api.updateWidgetStyle && api.updateWidgetStyle(v, component._widgetMax || 1100);
            }, box);
            const maxWVal = String(component._widgetMax || 1100);
            this.createRangeInput('Max breedte (px)', maxWVal, '800', '1400', '10', (v) => {
                const mw = Math.max(600, parseInt(v, 10) || 1100);
                component._widgetMax = mw;
                api.updateWidgetStyle && api.updateWidgetStyle(component._widgetStyle || 'card', mw);
            }, box);
            // Toggle title/subtitle/CTAs visibility
            const titleEl = component.querySelector('.hero-title');
            const subEl = component.querySelector('.hero-subtitle');
            const ctaWrap = component.querySelector('.hero-cta');
            const hiddenNow = (titleEl?.style.display === 'none');
            this.createSelectInput('Titel/CTA tonen', hiddenNow ? 'hide' : 'show', [
                { value: 'show', label: 'Tonen' },
                { value: 'hide', label: 'Verbergen' }
            ], (v) => {
                const disp = v === 'hide' ? 'none' : '';
                if (titleEl) titleEl.style.display = disp;
                if (subEl) subEl.style.display = disp;
                if (ctaWrap) ctaWrap.style.display = disp;
            }, box);
            // Append to panel
            this.panel.appendChild(box);
        };

        // Slideshow manager UI
        const renderSlideshowManager = () => {
            const isSlideMode = (component._heroMode === 'slideshow') || (component._slides && component._slides.length >= 1);
            // Clean previous manager
            const old = this.panel.querySelector('.wb-slideshow-manager');
            if (old) old.remove();
            if (!isSlideMode) return;

            const wrap = document.createElement('div');
            wrap.className = 'wb-slideshow-manager';
            wrap.style.border = '1px solid #e5e7eb';
            wrap.style.borderRadius = '8px';
            wrap.style.padding = '10px';
            wrap.style.marginTop = '10px';
            const hdr = document.createElement('div');
            hdr.textContent = 'Slideshow beheren';
            hdr.style.fontWeight = '700';
            hdr.style.marginBottom = '8px';
            hdr.style.color = '#374151';
            wrap.appendChild(hdr);

            // Thumbs grid
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
            grid.style.gap = '8px';
            const slides = Array.isArray(component._slides) ? component._slides.slice() : [];
            slides.forEach((url, i) => {
                const cell = document.createElement('div');
                cell.style.position = 'relative';
                cell.style.border = '1px solid #e5e7eb';
                cell.style.borderRadius = '6px';
                cell.style.overflow = 'hidden';
                cell.draggable = true;
                cell.dataset.index = String(i);
                const img = document.createElement('img');
                img.src = url;
                img.alt = `slide ${i+1}`;
                img.style.width = '100%';
                img.style.height = '64px';
                img.style.objectFit = 'cover';
                const del = document.createElement('button');
                del.textContent = '×';
                del.title = 'Verwijderen';
                del.style.position = 'absolute';
                del.style.top = '2px';
                del.style.right = '2px';
                del.style.width = '22px';
                del.style.height = '22px';
                del.style.border = 'none';
                del.style.borderRadius = '50%';
                del.style.background = 'rgba(0,0,0,0.6)';
                del.style.color = '#fff';
                del.style.cursor = 'pointer';
                del.onclick = () => {
                    const next = slides.filter((_, idx) => idx !== i);
                    component._slides = next;
                    api.setSlideshow && api.setSlideshow(next, component._slideshowInterval || 3500);
                    renderSlideshowManager();
                };
                // Drag & drop reorder handlers
                cell.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', String(i));
                    cell.style.opacity = '0.6';
                });
                cell.addEventListener('dragend', () => { cell.style.opacity = '1'; });
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    cell.style.outline = '2px dashed #60a5fa';
                });
                cell.addEventListener('dragleave', () => { cell.style.outline = 'none'; });
                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.style.outline = 'none';
                    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    const to = i;
                    if (Number.isNaN(from) || from === to) return;
                    const arr = slides.slice();
                    const [moved] = arr.splice(from, 1);
                    arr.splice(to, 0, moved);
                    component._slides = arr;
                    api.setSlideshow && api.setSlideshow(arr, component._slideshowInterval || 3500);
                    renderSlideshowManager();
                });
                cell.appendChild(img);
                cell.appendChild(del);
                grid.appendChild(cell);
            });
            wrap.appendChild(grid);

            // Actions: Upload multiple, Add single from Unsplash
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';
            actions.style.marginTop = '8px';

            const addUpload = document.createElement('button');
            addUpload.className = 'btn btn-secondary btn-small';
            addUpload.textContent = 'Upload (meerdere)';
            addUpload.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                    const files = Array.from(e.target.files || []);
                    const readers = files.map(f => new Promise((resolve) => { const rd = new FileReader(); rd.onload = ev => resolve(ev.target.result); rd.readAsDataURL(f); }));
                    Promise.all(readers).then((urls) => {
                        const next = (component._slides || []).concat(urls);
                        component._slides = next;
                        api.setSlideshow && api.setSlideshow(next, component._slideshowInterval || 3500);
                        renderSlideshowManager();
                    });
                };
                input.click();
            };

            const addUnsplash = document.createElement('button');
            addUnsplash.className = 'btn btn-secondary btn-small';
            addUnsplash.textContent = 'Voeg toe (Unsplash)';
            addUnsplash.onclick = async () => {
                if (!window.MediaPicker) return;
                const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                if (!u) return;
                const next = (component._slides || []).concat([u]);
                component._slides = next;
                api.setSlideshow && api.setSlideshow(next, component._slideshowInterval || 3500);
                renderSlideshowManager();
            };

            const addUnsplashMulti = document.createElement('button');
            addUnsplashMulti.className = 'btn btn-secondary btn-small';
            addUnsplashMulti.textContent = 'Meerdere (MediaPicker)';
            addUnsplashMulti.onclick = async () => {
                if (!window.MediaPicker) return;
                const collected = [];
                while (true) {
                    try {
                        const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (!u) break;
                        collected.push(u);
                    } catch (err) {
                        break; // user canceled
                    }
                    // Heuristic: stop if > 20 to avoid infinite loops
                    if (collected.length > 20) break;
                }
                if (collected.length) {
                    const next = (component._slides || []).concat(collected);
                    component._slides = next;
                    api.setSlideshow && api.setSlideshow(next, component._slideshowInterval || 3500);
                    renderSlideshowManager();
                }
            };

            actions.appendChild(addUpload);
            actions.appendChild(addUnsplash);
            actions.appendChild(addUnsplashMulti);
            wrap.appendChild(actions);

            const anchor = this.panel.querySelector('.wb-slideshow-anchor');
            if (anchor && anchor.parentElement === this.panel) {
                this.panel.insertBefore(wrap, manageSlidesBtn.nextSibling);
            } else {
                this.panel.appendChild(wrap);
            }
        };

        // Initial render if slideshow already active
        renderSlideshowManager();

        // YouTube options UI
        const renderYouTubeOptions = () => {
            const hasVideo = !!component.querySelector('.hero-video iframe');
            const apiOk = api.getYouTubeOptions && api.updateYouTubeOptions;
            const old = this.panel.querySelector('.wb-youtube-options');
            if (old) old.remove();
            if (!hasVideo || !apiOk) return;
            const opts = api.getYouTubeOptions();
            const wrap = document.createElement('div');
            wrap.className = 'wb-youtube-options';
            wrap.style.border = '1px solid #e5e7eb';
            wrap.style.borderRadius = '8px';
            wrap.style.padding = '10px';
            wrap.style.marginTop = '10px';

            const hdr = document.createElement('div');
            hdr.textContent = 'YouTube opties';
            hdr.style.fontWeight = '700';
            hdr.style.marginBottom = '8px';
            hdr.style.color = '#374151';
            wrap.appendChild(hdr);

            // Mute toggle
            const muteLbl = document.createElement('label');
            muteLbl.style.display = 'flex';
            muteLbl.style.alignItems = 'center';
            muteLbl.style.gap = '8px';
            const mute = document.createElement('input');
            mute.type = 'checkbox';
            mute.checked = !!opts.mute;
            mute.onchange = () => api.updateYouTubeOptions({ mute: !!mute.checked });
            muteLbl.appendChild(mute);
            const muteTxt = document.createElement('span');
            muteTxt.textContent = 'Mute';
            muteLbl.appendChild(muteTxt);
            wrap.appendChild(muteLbl);

            // Start time
            const startLbl = document.createElement('label');
            startLbl.textContent = 'Start (seconden)';
            startLbl.style.display = 'block';
            startLbl.style.marginTop = '8px';
            const start = document.createElement('input');
            start.type = 'number';
            start.min = '0';
            start.step = '1';
            start.value = String(Number(opts.start || 0));
            start.style.width = '100%';
            start.onchange = () => api.updateYouTubeOptions({ start: Math.max(0, parseInt(start.value || '0', 10) || 0) });
            wrap.appendChild(startLbl);
            wrap.appendChild(start);

            this.panel.appendChild(wrap);
        };
        renderYouTubeOptions();

        // Quick color controls
        if (titleEl) this.createColorInput('Titel kleur', titleEl.style.color || '#ffffff', (v) => { titleEl.style.color = v; });
        if (subEl) this.createColorInput('Subtitel kleur', subEl.style.color || 'rgba(255,255,255,0.95)', (v) => { subEl.style.color = v; });
    }

    createFeatureMediaProperties(component) {
        // Single orange media button (image or video)
        const mediaEl = component.querySelector('.fm-media');
        const pickAnyBtn = this.createButton('Media kiezen', async () => {
            if (!window.MediaPicker) {
                alert('Media Picker is niet geladen. Ververs de pagina (Ctrl+F5) en probeer opnieuw.');
                return;
            }
            console.log('[FeatureMedia] Media kiezen clicked, opening drawer...');
            // Open with Unsplash by default; user can switch to YouTube tab
            const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
            if (!mediaEl || !res) return;
            // If user selected a video in the drawer
            if (res.type === 'video') {
                const embedUrl = res.embedUrl || res.url || '';
                if (!embedUrl) return;
                mediaEl.innerHTML = '';
                const wrap = document.createElement('div');
                wrap.className = 'fm-video';
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.setAttribute('title', 'Ingesloten video');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                wrap.appendChild(iframe);
                mediaEl.appendChild(wrap);
                const chooser = document.createElement('button');
                chooser.type = 'button';
                chooser.className = 'fm-media-chooser';
                chooser.innerHTML = '<i class="fas fa-video"></i>';
                chooser.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const r = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                    const u = r && (r.embedUrl || r.url);
                    if (u) { iframe.src = u; }
                });
                mediaEl.appendChild(chooser);
            } else {
                // Image selection
                const src = res.fullUrl || res.regularUrl || res.url || res.dataUrl || '';
                if (!src) return;
                mediaEl.innerHTML = '';
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Feature media';
                mediaEl.appendChild(img);
                const chooser = document.createElement('button');
                chooser.type = 'button';
                chooser.className = 'fm-media-chooser';
                chooser.innerHTML = '<i class="fas fa-camera"></i>';
                chooser.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const r = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const s = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (s) { img.src = s; }
                });
                mediaEl.appendChild(chooser);
            }
        });
        // Style like the Hero Travel orange media button
        pickAnyBtn.style.backgroundColor = '#ff7700';
        pickAnyBtn.style.borderColor = '#ff7700';
        pickAnyBtn.style.color = '#fff';
        pickAnyBtn.style.fontWeight = '700';
        this.panel.appendChild(pickAnyBtn);

        // Position toggle
        const currentPos = component.classList.contains('right') ? 'right' : 'left';
        this.createSelectInput('Media positie', currentPos, [
            { value: 'left', label: 'Links (media links)' },
            { value: 'right', label: 'Rechts (media rechts)' }
        ], (val) => {
            component.classList.toggle('right', val === 'right');
            component.classList.toggle('left', val === 'left');
            // Also reorder DOM so layout reflects change across all browsers
            const inner = component.querySelector('.fm-inner');
            const media = component.querySelector('.fm-media');
            const content = component.querySelector('.fm-content');
            if (inner && media && content) {
                if (val === 'right') {
                    // content first, then media
                    if (inner.firstElementChild !== content) {
                        inner.insertBefore(content, inner.firstElementChild);
                    }
                    if (inner.lastElementChild !== media) {
                        inner.appendChild(media);
                    }
                } else {
                    // media first, then content
                    if (inner.firstElementChild !== media) {
                        inner.insertBefore(media, inner.firstElementChild);
                    }
                    if (inner.lastElementChild !== content) {
                        inner.appendChild(content);
                    }
                }
            }
        });

        // 3D depth intensity
        const mediaBox = component.querySelector('.fm-media');
        const currentDepth = mediaBox?.classList.contains('depth-3') ? '3'
            : mediaBox?.classList.contains('depth-2') ? '2'
            : mediaBox?.classList.contains('depth-1') ? '1' : '0';
        this.createSelectInput('3D diepte', currentDepth, [
            { value: '0', label: 'Uit' },
            { value: '1', label: 'Licht' },
            { value: '2', label: 'Middel' },
            { value: '3', label: 'Sterk' }
        ], (v) => {
            if (!mediaBox) return;
            mediaBox.classList.remove('depth-1','depth-2','depth-3');
            if (v !== '0') mediaBox.classList.add(`depth-${v}`);
        });

        // Label/Title/Subtitle/Text
        const labelEl = component.querySelector('.fm-label');
        const titleEl = component.querySelector('.fm-title');
        const subEl   = component.querySelector('.fm-subtitle');
        const textEl  = component.querySelector('.fm-text');
        if (labelEl) this.createTextInput('Label', labelEl.textContent, v => labelEl.textContent = v);
        if (titleEl) this.createTextInput('Titel', titleEl.textContent, v => titleEl.textContent = v);
        if (subEl)   this.createTextInput('Subtitel', subEl.textContent, v => subEl.textContent = v);
        if (textEl)  this.createTextInput('Tekst', textEl.textContent, v => textEl.textContent = v);

        // Feature items quick editor (labels only)
        const items = component.querySelectorAll('.fm-features li span');
        items.forEach((span, i) => {
            this.createTextInput(`Feature ${i+1}`, span.textContent, (val) => { span.textContent = val; });
        });

        // CTA links
        const ctas = component.querySelectorAll('.fm-cta a');
        ctas.forEach((a, i) => {
            this.createTextInput(`CTA ${i+1} tekst`, a.textContent.trim(), (val) => { a.querySelector('span') ? a.querySelector('span').textContent = val : a.textContent = val; });
            this.createTextInput(`CTA ${i+1} link`, a.getAttribute('href') || '#', (val) => { a.setAttribute('href', val || '#'); });
        });
    }

    createTravelTypesProperties(component) {
        // Title & subtitle
        const header = document.createElement('h5');
        header.textContent = 'Soorten Reizen';
        header.style.margin = '0.5rem 0 0.75rem';
        header.style.color = '#374151';
        this.panel.appendChild(header);

        const titleEl = component.querySelector('.tt-title');
        const subEl = component.querySelector('.tt-subtitle');
        if (titleEl) this.createTextInput('Sectietitel', titleEl.textContent, (v) => { titleEl.textContent = v; });
        if (subEl) this.createTextInput('Subtitel', subEl.textContent, (v) => { subEl.textContent = v; });
        // AI: Activiteiten generator (6 kaarten -> titel, samenvatting, icoon)
        try {
            const aiBtnAct = this.createButton('Genereer activiteiten (6) met AI', async () => {
                try {
                    if (!window.BuilderAI || typeof window.BuilderAI.generate !== 'function') { alert('AI module niet geladen.'); return; }
                    const country = (window.BuilderAI.guessCountry && window.BuilderAI.guessCountry()) || '';
                    const r = await window.BuilderAI.generate('activities', { country, language: 'nl', count: 6 });
                    const items = Array.isArray(r?.activities) ? r.activities : [];
                    if (!items.length) { alert('Geen activiteiten ontvangen.'); return; }
                    const cards = component.querySelectorAll('.tt-card');
                    cards.forEach((card, i) => {
                        const d = items[i]; if (!d) return;
                        const h4 = card.querySelector('h4');
                        const p = card.querySelector('p');
                        const iconEl = card.querySelector('.icon i');
                        if (h4) h4.textContent = d.title || h4.textContent;
                        if (p) p.textContent = d.summary || p.textContent;
                        if (iconEl && d.icon) { iconEl.className = `fas ${d.icon}`; }
                    });
                } catch { alert('AI activiteiten genereren mislukt.'); }
            });
            aiBtnAct.style.background = '#0ea5e9'; aiBtnAct.style.borderColor = '#0ea5e9'; aiBtnAct.style.color = '#fff';
            this.panel.appendChild(aiBtnAct);
        } catch {}

        // Colors: title, subtitle, and labels on cards
        if (titleEl) {
            this.createColorInput('Sectietitel kleur', titleEl.style.color || '#1e3a8a', (val) => { titleEl.style.color = val; });
        }
        if (subEl) {
            this.createColorInput('Subtitel kleur', subEl.style.color || '#6b7280', (val) => { subEl.style.color = val; });
        }
        const allLabels = component.querySelectorAll('.tt-label');
        if (allLabels.length) {
            const first = allLabels[0];
            this.createColorInput('Kaart label kleur', first.style.color || '#ffffff', (val) => {
                allLabels.forEach(el => { el.style.color = val; });
            });
        }

        // Overlay opacity (gradient)
        const overlays = component.querySelectorAll('.tt-overlay');
        if (overlays.length) {
            let currentAlpha = 0.45;
            this.createRangeInput('Overlay dekking (gradient)', String(currentAlpha), '0', '1', '0.01', (val) => {
                const a = parseFloat(val);
                overlays.forEach(ov => {
                    ov.style.background = `linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,${a}))`;
                });
            });
        }

        // Hover tint (section-level)
        const sectionEl = component.closest('.wb-travel-types') || component; // component is the section itself
        if (sectionEl) {
            if (!sectionEl.dataset.ttHoverHex) sectionEl.dataset.ttHoverHex = '#1e3a8a';
            let hoverAlpha = 0.15;
            const toRgba = (hex, a) => {
                const clean = hex.replace('#','');
                const bigint = parseInt(clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean, 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${r},${g},${b},${a})`;
            };
            this.createColorInput('Hover tint kleur', sectionEl.dataset.ttHoverHex, (hex) => {
                sectionEl.dataset.ttHoverHex = hex;
                sectionEl.style.setProperty('--tt-hover', toRgba(hex, hoverAlpha));
            });
            this.createRangeInput('Hover tint dekking', String(hoverAlpha), '0', '1', '0.01', (val) => {
                hoverAlpha = parseFloat(val);
                const hex = sectionEl.dataset.ttHoverHex || '#1e3a8a';
                sectionEl.style.setProperty('--tt-hover', toRgba(hex, hoverAlpha));
            });
        }

        // Cards (8)
        const cards = component.querySelectorAll('.tt-card');
        cards.forEach((card, idx) => {
            const labelEl = card.querySelector('.tt-label');
            const imgEl = card.querySelector('img');
            const href = card.getAttribute('href') || '#';
            const overlayEl = card.querySelector('.tt-overlay');

            // Visual group for each card's controls
            const box = document.createElement('div');
            box.style.border = '1px solid #e5e7eb';
            box.style.borderRadius = '8px';
            box.style.padding = '12px';
            box.style.margin = '10px 0';
            box.style.background = '#fafafa';

            const heading = document.createElement('div');
            heading.textContent = `Kaart ${idx+1}`;
            heading.style.fontWeight = '600';
            heading.style.marginBottom = '8px';
            heading.style.color = '#374151';
            box.appendChild(heading);

            // Inputs inside the box
            const labelInput = this.createTextInput(`Label`, labelEl?.textContent || '', (v) => { if (labelEl) labelEl.textContent = v; });
            const linkInput = this.createTextInput(`Link`, href, (v) => { card.setAttribute('href', v || '#'); });
            box.appendChild(labelInput);
            box.appendChild(linkInput);

            // Per-card label color
            if (labelEl) {
                const colorGroup = this.createColorInput('Label kleur (deze kaart)', labelEl.style.color || '', (val) => { labelEl.style.color = val; });
                box.appendChild(colorGroup);
            }

            // Per-card overlay opacity
            if (overlayEl) {
                this.createRangeInput('Overlay dekking (deze kaart)', '0.45', '0', '1', '0.01', (v) => {
                    const a = parseFloat(v);
                    overlayEl.style.background = `linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,${a}))`;
                });
            }

            // Image picker button
            const btn = this.createButton(`Kies afbeelding (kaart ${idx+1})`, async () => {
                try {
                    let src = '';
                    if (window.MediaPicker && typeof window.MediaPicker.openImage === 'function') {
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        src = res.fullUrl || res.regularUrl || res.url || res.dataUrl || '';
                    } else {
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
                    if (src && imgEl) imgEl.src = src;
                } catch(err) { console.warn('Image change canceled/failed', err); }
            });
            btn.style.background = '#ff7700';
            btn.style.borderColor = '#ff7700';
            btn.style.color = '#fff';
            box.appendChild(btn);

            this.panel.appendChild(box);
        });

        // Danger zone: delete section
        const del = this.createButton('Sectie verwijderen', () => {
            if (confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) {
                component.remove();
                this.clearProperties();
            }
        });
        del.style.background = '#dc2626';
        del.style.borderColor = '#dc2626';
        del.style.color = '#fff';
        del.style.marginTop = '1rem';
        this.panel.appendChild(del);
    }

    createContainerProperties(component) {
        // Background color
        this.createColorInput('Achtergrondkleur', component.style.backgroundColor || '#ffffff', (value) => {
            component.style.backgroundColor = value;
        });
        
        // Padding
        this.createRangeInput('Padding', component.style.padding || '2rem', '0', '5rem', '0.5rem', (value) => {
            component.style.padding = value;
        });
        
        // Border radius
        this.createRangeInput('Afronding', component.style.borderRadius || '8px', '0px', '50px', '1px', (value) => {
            component.style.borderRadius = value;
        });
    }

    createRowProperties(component) {
        // Gap between columns
        this.createRangeInput('Ruimte tussen kolommen', component.style.gap || '1rem', '0rem', '3rem', '0.25rem', (value) => {
            component.style.gap = value;
        });
        
        // Alignment
        this.createSelectInput('Uitlijning', component.style.alignItems || 'stretch', [
            { value: 'stretch', label: 'Uitrekken' },
            { value: 'flex-start', label: 'Boven' },
            { value: 'center', label: 'Midden' },
            { value: 'flex-end', label: 'Onder' }
        ], (value) => {
            component.style.alignItems = value;
        });
        
        // Add column button
        const addColumnBtn = this.createButton('Kolom toevoegen', () => {
            const newColumn = ComponentFactory.createColumn();
            component.appendChild(newColumn);
        });
        this.panel.appendChild(addColumnBtn);
    }

    createColumnProperties(component) {
        // Width
        this.createSelectInput('Breedte', component.style.flex || '1', [
            { value: '1', label: 'Automatisch' },
            { value: '0 0 25%', label: '25%' },
            { value: '0 0 33.333%', label: '33%' },
            { value: '0 0 50%', label: '50%' },
            { value: '0 0 66.666%', label: '66%' },
            { value: '0 0 75%', label: '75%' },
            { value: '0 0 100%', label: '100%' }
        ], (value) => {
            component.style.flex = value;
        });
    }

    createHeadingProperties(component) {
        // Heading level
        const currentLevel = component.tagName.toLowerCase();
        this.createSelectInput('Type', currentLevel, [
            { value: 'h1', label: 'Titel 1 (H1)' },
            { value: 'h2', label: 'Titel 2 (H2)' },
            { value: 'h3', label: 'Titel 3 (H3)' },
            { value: 'h4', label: 'Titel 4 (H4)' },
            { value: 'h5', label: 'Titel 5 (H5)' },
            { value: 'h6', label: 'Titel 6 (H6)' }
        ], (value) => {
            const newHeading = document.createElement(value);
            newHeading.className = component.className.replace(/h[1-6]/, value);
            newHeading.textContent = component.textContent;
            newHeading.id = component.id;
            newHeading.setAttribute('data-component', 'heading');
            newHeading.contentEditable = true;
            
            // Copy toolbar
            const toolbar = component.querySelector('.component-toolbar');
            if (toolbar) {
                newHeading.appendChild(toolbar.cloneNode(true));
            }
            
            component.parentNode.replaceChild(newHeading, component);
            ComponentFactory.makeSelectable(newHeading);
            ComponentFactory.makeEditable(newHeading);
            this.currentComponent = newHeading;
        });
        
        // Text align
        this.createSelectInput('Uitlijning', component.style.textAlign || 'left', [
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Midden' },
            { value: 'right', label: 'Rechts' }
        ], (value) => {
            component.style.textAlign = value;
        });
        
        // Color
        this.createColorInput('Tekstkleur', component.style.color || '#333333', (value) => {
            component.style.color = value;
        });
    }

    createTextProperties(component) {
        // Font size
        this.createRangeInput('Lettergrootte', component.style.fontSize || '1rem', '0.5rem', '3rem', '0.1rem', (value) => {
            component.style.fontSize = value;
        });
        
        // Text align
        this.createSelectInput('Uitlijning', component.style.textAlign || 'left', [
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Midden' },
            { value: 'right', label: 'Rechts' },
            { value: 'justify', label: 'Uitvullen' }
        ], (value) => {
            component.style.textAlign = value;
        });
        
        // Color
        this.createColorInput('Tekstkleur', component.style.color || '#333333', (value) => {
            component.style.color = value;
        });
        
        // Line height
        this.createRangeInput('Regelafstand', component.style.lineHeight || '1.6', '1', '3', '0.1', (value) => {
            component.style.lineHeight = value;
        });
    }

    createImageProperties(component) {
        // Image URL input
        const img = component.querySelector('img');
        if (img) {
            this.createTextInput('Afbeelding URL', img.src, (value) => {
                img.src = value;
            });
            
            this.createTextInput('Alt tekst', img.alt, (value) => {
                img.alt = value;
            });

            // Media Picker button
            const pickBtn = this.createButton('Media kiezen', async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage();
                const src = res?.dataUrl || res?.url;
                if (src) img.src = src;
            });
            this.panel.appendChild(pickBtn);
        }
        
        // Alignment
        this.createSelectInput('Uitlijning', component.style.textAlign || 'center', [
            { value: 'left', label: 'Links' },
            { value: 'center', label: 'Midden' },
            { value: 'right', label: 'Rechts' }
        ], (value) => {
            component.style.textAlign = value;
        });
        
        // Border radius
        this.createRangeInput('Afronding', img ? (img.style.borderRadius || '8px') : '8px', '0px', '50px', '1px', (value) => {
            if (img) img.style.borderRadius = value;
        });
    }

    createButtonProperties(component) {
        const button = component.querySelector('button');
        
        // Button style
        const currentStyle = component.classList.contains('primary') ? 'primary' : 
                           component.classList.contains('secondary') ? 'secondary' : 'outline';
        
        this.createSelectInput('Stijl', currentStyle, [
            { value: 'primary', label: 'Primair' },
            { value: 'secondary', label: 'Secundair' },
            { value: 'outline', label: 'Omlijnd' }
        ], (value) => {
            component.className = component.className.replace(/(primary|secondary|outline)/, value);
        });
        
        // Button text
        if (button) {
            this.createTextInput('Tekst', button.textContent, (value) => {
                button.textContent = value;
            });
            
            this.createTextInput('Link URL', button.getAttribute('data-href') || '', (value) => {
                button.setAttribute('data-href', value);
                button.onclick = value ? () => window.open(value, '_blank') : null;
            });
        }
        
        // Size
        this.createSelectInput('Grootte', button ? (button.style.padding || '0.75rem 2rem') : '0.75rem 2rem', [
            { value: '0.5rem 1rem', label: 'Klein' },
            { value: '0.75rem 2rem', label: 'Normaal' },
            { value: '1rem 3rem', label: 'Groot' }
        ], (value) => {
            if (button) button.style.padding = value;
        });
    }

    createVideoProperties(component) {
        const iframe = component.querySelector('iframe');
        
        if (iframe) {
            this.createTextInput('Video URL', iframe.src, (value) => {
                iframe.src = value;
            });
        }
        
        // Media Picker (YouTube) button
        const mediaBtn = this.createButton('Media kiezen (Video)', async () => {
            if (!window.MediaPicker) return;
            const res = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
            let url = '';
            if (res?.embedUrl) url = res.embedUrl;
            else if (res?.url) url = res.url;
            if (!url) return;
            ComponentFactory.embedVideo(component, url, component.querySelector('.component-toolbar'));
        });
        this.panel.appendChild(mediaBtn);
    }

    createGalleryProperties(component) {
        const grid = component.querySelector('.gallery-grid');
        
        if (grid) {
            // Columns
            this.createRangeInput('Kolommen', '3', '1', '6', '1', (value) => {
                grid.style.gridTemplateColumns = `repeat(${value}, 1fr)`;
            });
            
            // Gap
            this.createRangeInput('Ruimte', grid.style.gap || '1rem', '0rem', '2rem', '0.25rem', (value) => {
                grid.style.gap = value;
            });
        }
        
        // Add images button
        const addBtn = this.createButton('Afbeeldingen toevoegen', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    ComponentFactory.createImageGallery(component, files, component.querySelector('.component-toolbar'));
                }
            };
            input.click();
        });
        this.panel.appendChild(addBtn);
    }

    createCommonProperties(component) {
        // Divider
        const divider = document.createElement('hr');
        divider.style.margin = '1.5rem 0';
        divider.style.border = 'none';
        divider.style.borderTop = '1px solid #e0e0e0';
        this.panel.appendChild(divider);
        
        const commonTitle = document.createElement('h5');
        commonTitle.textContent = 'Algemene eigenschappen';
        commonTitle.style.marginBottom = '1rem';
        commonTitle.style.color = '#666';
        this.panel.appendChild(commonTitle);

        // Fullwidth (edge-to-edge) toggle
        const isEdge = component.classList.contains('edge-to-edge');
        const edgeGroup = document.createElement('div');
        edgeGroup.className = 'form-group';
        const edgeLabel = document.createElement('label');
        edgeLabel.className = 'form-label';
        edgeLabel.textContent = 'Volledige breedte (edge-to-edge)';
        const edgeWrap = document.createElement('div');
        edgeWrap.style.display = 'flex';
        edgeWrap.style.alignItems = 'center';
        edgeWrap.style.gap = '8px';
        const edgeInput = document.createElement('input');
        edgeInput.type = 'checkbox';
        edgeInput.checked = isEdge;
        edgeInput.addEventListener('change', () => {
            component.classList.toggle('edge-to-edge', edgeInput.checked);
        });
        const edgeNote = document.createElement('span');
        edgeNote.style.fontSize = '12px';
        edgeNote.style.color = '#666';
        edgeNote.textContent = 'Toont in preview/export als fullwidth sectie';
        edgeWrap.appendChild(edgeInput);
        edgeWrap.appendChild(edgeNote);
        edgeGroup.appendChild(edgeLabel);
        edgeGroup.appendChild(edgeWrap);
        this.panel.appendChild(edgeGroup);

        // Spacing presets
        this.createSelectInput('Ruimte preset', 'normaal', [
            { value: 'compact', label: 'Compact' },
            { value: 'normaal', label: 'Normaal' },
            { value: 'ruim', label: 'Ruim' }
        ], (v) => {
            if (v === 'compact') {
                component.style.marginTop = '0.75rem';
                component.style.marginBottom = '0.75rem';
                component.style.paddingTop = '1rem';
                component.style.paddingBottom = '1rem';
                component.style.setProperty('--preset', 'compact');
            } else if (v === 'ruim') {
                component.style.marginTop = '3rem';
                component.style.marginBottom = '3rem';
                component.style.paddingTop = '3rem';
                component.style.paddingBottom = '3rem';
                component.style.setProperty('--preset', 'ruim');
            } else {
                component.style.marginTop = '1.5rem';
                component.style.marginBottom = '1.5rem';
                component.style.paddingTop = '2rem';
                component.style.paddingBottom = '2rem';
                component.style.setProperty('--preset', 'normaal');
            }
        });

        // Section width: standard vs edge-to-edge within canvas
        const widthMode = component.classList.contains('edge-to-edge') ? 'edge' : 'standard';
        this.createSelectInput('Sectie breedte', widthMode, [
            { value: 'standard', label: 'Standaard' },
            { value: 'edge', label: 'Rand-tot-rand' }
        ], (v) => {
            component.classList.toggle('edge-to-edge', v === 'edge');
        });

        // Vertical margins
        this.createRangeInput('Buitenruimte boven', component.style.marginTop || '1rem', '0rem', '8rem', '0.25rem', (value) => {
            component.style.marginTop = value;
        });
        this.createRangeInput('Buitenruimte onder', component.style.marginBottom || '1rem', '0rem', '8rem', '0.25rem', (value) => {
            component.style.marginBottom = value;
        });

        // Hint: buitenruimte uitleg
        const hintOuter = document.createElement('div');
        hintOuter.style.fontSize = '12px';
        hintOuter.style.color = '#6b7280';
        hintOuter.style.margin = '6px 0 10px';
        hintOuter.textContent = 'Buitenruimte = ruimte buiten het blok (afstand tot andere blokken).';
        this.panel.appendChild(hintOuter);

        // Inner padding for section band look
        this.createRangeInput('Binnenruimte boven (padding)', component.style.paddingTop || '2rem', '0rem', '10rem', '0.25rem', (value) => {
            component.style.paddingTop = value;
        });
        this.createRangeInput('Binnenruimte onder (padding)', component.style.paddingBottom || '2rem', '0rem', '10rem', '0.25rem', (value) => {
            component.style.paddingBottom = value;
        });

        // Hint: binnenruimte uitleg
        const hintInner = document.createElement('div');
        hintInner.style.fontSize = '12px';
        hintInner.style.color = '#6b7280';
        hintInner.style.margin = '6px 0 10px';
        hintInner.textContent = 'Binnenruimte = ruimte in het blok (ruimte rond de inhoud).';
        this.panel.appendChild(hintInner);

        // Overlap with previous section (negative moves upward)
        this.createRangeInput('Overlap met vorige (negatief omhoog)', component.style.marginTop || '0px', '-120px', '120px', '2px', (value) => {
            component.style.marginTop = value;
        });

        const hintOverlap = document.createElement('div');
        hintOverlap.style.fontSize = '12px';
        hintOverlap.style.color = '#6b7280';
        hintOverlap.style.margin = '6px 0 10px';
        hintOverlap.textContent = 'Overlap: schuif dit blok iets onder het vorige (negatieve waarde = omhoog).';
        this.panel.appendChild(hintOverlap);

        // Background color (section)
        this.createColorInput('Achtergrondkleur sectie', component.style.backgroundColor || '#ffffff', (value) => {
            component.style.backgroundColor = value;
        });

        // Background image (section)
        const bgMediaBtn = this.createButton('Sectie achtergrond (Media)', async () => {
            if (!window.MediaPicker) { alert('Media Picker niet geladen. Ververs de pagina.'); return; }
            const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
            const src = (res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl)) || '';
            if (!src) return;
            component.style.backgroundImage = `url("${src}")`;
            component.style.backgroundSize = 'cover';
            component.style.backgroundPosition = 'center';
        });
        bgMediaBtn.style.backgroundColor = '#ff7700';
        bgMediaBtn.style.borderColor = '#ff7700';
        bgMediaBtn.style.color = '#fff';
        bgMediaBtn.style.fontWeight = '700';
        this.panel.appendChild(bgMediaBtn);

        // Reset to defaults
        const resetBtn = this.createButton('Herstel standaard', () => {
            component.classList.remove('edge-to-edge');
            component.style.marginTop = '1.5rem';
            component.style.marginBottom = '1.5rem';
            component.style.paddingTop = '2rem';
            component.style.paddingBottom = '2rem';
            component.style.backgroundImage = '';
            component.style.backgroundColor = '';
            component.style.setProperty('--preset', 'normaal');
        });
        resetBtn.classList.add('btn', 'btn-secondary');
        resetBtn.style.marginTop = '6px';
        this.panel.appendChild(resetBtn);

        // Custom CSS class
        this.createTextInput('CSS Class', component.getAttribute('data-custom-class') || '', (value) => {
            if (component.getAttribute('data-custom-class')) {
                component.classList.remove(component.getAttribute('data-custom-class'));
            }
            if (value) {
                component.classList.add(value);
                component.setAttribute('data-custom-class', value);
            } else {
                component.removeAttribute('data-custom-class');
            }
        });
    }

    // Helper methods for creating form inputs
    createTextInput(label, value, onChange) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.className = 'form-control';
        input.id = inputId;
        input.setAttribute('aria-label', label);
        const lbl = group.querySelector('label');
        if (lbl) lbl.setAttribute('for', inputId);
        input.addEventListener('input', (e) => onChange(e.target.value));
        group.appendChild(input);
        this.panel.appendChild(group);
        return group;
    }

    createColorInput(label, value, onChange) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        input.className = 'form-control color-input';
        input.id = inputId;
        input.setAttribute('aria-label', label);
        const lbl = group.querySelector('label');
        if (lbl) lbl.setAttribute('for', inputId);
        input.addEventListener('change', (e) => onChange(e.target.value));
        group.appendChild(input);
        this.panel.appendChild(group);
        return group;
    }

    createRangeInput(label, value, min, max, step, onChange) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'range-wrapper';
        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.className = 'form-control range-input';
        input.id = inputId;
        input.setAttribute('aria-label', label);
        const lbl = group.querySelector('label');
        if (lbl) lbl.setAttribute('for', inputId);
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'range-value';
        valueDisplay.textContent = value;
        input.addEventListener('input', (e) => {
            const newValue = e.target.value + (step.includes('rem') ? 'rem' : step.includes('px') ? 'px' : '');
            valueDisplay.textContent = newValue;
            onChange(newValue);
        });
        
        wrapper.appendChild(input);
        wrapper.appendChild(valueDisplay);
        group.appendChild(wrapper);
        this.panel.appendChild(group);
        return group;
    }

    createSelectInput(label, value, options, onChange) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const select = document.createElement('select');
        select.className = 'form-control';
        select.id = inputId;
        select.setAttribute('aria-label', label);
        const lbl = group.querySelector('label');
        if (lbl) lbl.setAttribute('for', inputId);
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            optionEl.selected = option.value === value;
            select.appendChild(optionEl);
        });
        select.addEventListener('change', (e) => onChange(e.target.value));
        group.appendChild(select);
        this.panel.appendChild(group);
        return group;
    }

    createButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = 'btn btn-secondary btn-small';
        btn.style.width = '100%';
        btn.style.marginTop = '0.5rem';
        btn.setAttribute('aria-label', text);
        btn.setAttribute('role', 'button');
        btn.addEventListener('click', onClick);
        return btn;
    }

    createFormGroup(label) {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'form-label';
        
        group.appendChild(labelEl);
        return group;
    }
}

// Add CSS for form controls
const style = document.createElement('style');
style.textContent = `
.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
}

.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.color-input {
    height: 40px;
    padding: 2px;
    cursor: pointer;
}

.range-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.range-input {
    flex: 1;
}

.range-value {
    min-width: 60px;
    text-align: right;
    font-size: 0.8rem;
    color: #666;
    background: #f5f5f5;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}

.btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

/* Icon grid fallback styling */
.icon-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 6px;
    margin-top: 8px;
}
.icon-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
}
.icon-cell i { color: #16a34a; }
.icon-cell.active, .icon-cell:hover {
    border-color: #16a34a;
    box-shadow: 0 0 0 2px rgba(22,163,74,0.12);
}
`;
document.head.appendChild(style);

// Initialize properties panel
window.PropertiesPanel = new PropertiesPanel();
