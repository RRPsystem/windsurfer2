// Component factory voor website builder
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
            video: this.createVideo,
            gallery: this.createGallery,
            'hero-travel': this.createHeroTravel,
            'feature-media': this.createFeatureMedia
        };

        if (components[type]) {
            return components[type].call(this, options);
        } else {
            console.error(`Component type "${type}" not found`);
            return null;
        }
    }

    static createHeroTravel(options = {}) {
        const section = document.createElement('section');
        section.className = 'wb-component wb-hero-travel';
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

        const inner = document.createElement('div');
        inner.className = 'fm-inner';

        const media = document.createElement('div');
        media.className = 'fm-media';

        const content = document.createElement('div');
        content.className = 'fm-content';

        // Declare chooser reference early to avoid TDZ in helper functions
        let mediaChooser;

        // Helper to (re)open media picker
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
                img.src = src;
                img.alt = 'Feature media';
                media.appendChild(img);
                if (mediaChooser) media.appendChild(mediaChooser); // keep chooser overlay
            } catch(err) { console.warn('Image select canceled/failed', err); }
        };
        const openVideoPicker = async () => {
            try {
                let embedUrl = '';
                if (window.MediaPicker && typeof window.MediaPicker.openVideo === 'function') {
                    const result = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                    embedUrl = result.embedUrl || result.url || '';
                } else {
                    // Fallback: prompt for YouTube URL and convert
                    const url = prompt('Plak YouTube URL (https://youtu.be/...)');
                    if (url) {
                        const idMatch = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
                        const id = idMatch ? idMatch[1] : '';
                        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
                    }
                }
                if (!embedUrl) return;
                media.innerHTML = '';
                const frameWrap = document.createElement('div');
                frameWrap.className = 'fm-video';
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.setAttribute('title', 'Ingesloten video');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                frameWrap.appendChild(iframe);
                media.appendChild(frameWrap);
                if (mediaChooser) media.appendChild(mediaChooser);
            } catch(err) { console.warn('Video select canceled/failed', err); }
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
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'toolbar-btn';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Verwijderen';
        
        // Event listeners
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            if (confirm('Weet je zeker dat je dit component wilt verwijderen?')) {
                component.remove();
            }
        });
        
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const component = toolbar.parentElement;
            const clone = component.cloneNode(true);
            clone.id = this.generateId(clone.getAttribute('data-component'));
            component.parentElement.insertBefore(clone, component.nextSibling);
            // Rebind toolbar events on the clone
            ComponentFactory.rebindToolbar(clone);
            ComponentFactory.makeSelectable(clone);
        });
        
        toolbar.appendChild(editBtn);
        toolbar.appendChild(copyBtn);
        toolbar.appendChild(deleteBtn);
        
        return toolbar;
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

// Attach remove-safety button to any existing hero-travel sections (migration)
document.addEventListener('DOMContentLoaded', () => {
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
