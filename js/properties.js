// Properties panel voor component editing
class PropertiesPanel {
    constructor() {
        this.panel = document.getElementById('propertiesContent');
        this.currentComponent = null;
    }

    createHeroTravelProperties(component) {
        // Ensure toolbar exists so users can access actions as well
        if (!component.querySelector('.component-toolbar') && window.ComponentFactory?.createToolbar) {
            const tb = window.ComponentFactory.createToolbar();
            component.insertBefore(tb, component.firstChild);
        }

        // Background image
        const bg = component.querySelector('.hero-bg');
        const overlay = component.querySelector('.hero-overlay');
        const badge = component.querySelector('.hero-badge');
        const title = component.querySelector('.hero-title');
        const subtitle = component.querySelector('.hero-subtitle');
        const search = component.querySelector('.hero-search');

        // Background URL + inline Media button
        const currentBg = (bg && bg.style.backgroundImage) ? bg.style.backgroundImage.replace(/^url\("?|"?\)$/g, '').replace(/^url\("/, '').replace(/"\)$/, '') : '';
        const bgGroup = this.createTextInput('Achtergrond URL', currentBg, (value) => {
            if (bg) bg.style.backgroundImage = `url("${value}")`;
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
                if (src && bg) {
                    bg.style.backgroundImage = `url("${src}")`;
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
            if (src && bg) {
                bg.style.backgroundImage = `url("${src}")`;
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

    // Icon Picker helper (uses global IconPicker)
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

        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-small';
        btn.type = 'button';
        btn.textContent = 'Kies icoon';
        btn.onclick = async () => {
            if (!window.IconPicker) {
                alert('Icon Picker is niet geladen.');
                return;
            }
            const res = await window.IconPicker.open({ current, compact: true });
            if (res?.icon) {
                preview.innerHTML = `<i class=\"fas ${res.icon}\"></i>`;
                onChange(res.icon);
            }
        };

        wrapper.appendChild(preview);
        wrapper.appendChild(btn);
        group.appendChild(wrapper);
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
            case 'feature-media':
                this.createFeatureMediaProperties(component);
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
            'feature-media': 'Feature + Media'
        };
        return titles[type] || 'Component';
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
        const isEdge = component.classList.contains('edge-to-edge') ? 'edge' : 'standard';
        this.createSelectInput('Sectie breedte', isEdge, [
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
`;
document.head.appendChild(style);

// Initialize properties panel
window.PropertiesPanel = new PropertiesPanel();
