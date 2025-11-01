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

    createTravelDayHeaderProperties(component) {
        const h2 = component.querySelector('h2');
        const p = component.querySelector('p');
        const dayNumber = component.querySelector('.wb-travel-day-number')?.textContent || '1';

        // Day Title
        this.createTextInput('Dag Titel', h2?.textContent || '', (value) => {
            if (h2) h2.textContent = value;
        });

        // Day Description
        this.createTextInput('Beschrijving', p?.textContent || '', (value) => {
            if (p) p.textContent = value;
        });

        // Background Type Selector
        const currentBgType = component._backgroundType || 'gradient';
        this.createSelectInput('Achtergrond Type', currentBgType, [
            { value: 'gradient', label: '🎨 Gradient' },
            { value: 'color', label: '🎨 Kleur' },
            { value: 'image', label: '🖼️ Foto' },
            { value: 'map', label: '🗺️ Kaart' },
            { value: 'video', label: '🎬 YouTube Video' }
        ], (value) => {
            component._backgroundType = value;
            if (window.ComponentFactory?.updateDayHeaderBackground) {
                window.ComponentFactory.updateDayHeaderBackground(component);
            }
            // Refresh properties to show relevant controls
            this.showProperties(component);
        });

        // Background controls based on type
        if (currentBgType === 'gradient') {
            // Gradient color pickers
            this.createColorInput('Gradient Start', component._gradientStart || '#667eea', (value) => {
                component._gradientStart = value;
                window.ComponentFactory?.updateDayHeaderBackground(component);
            });
            this.createColorInput('Gradient Eind', component._gradientEnd || '#764ba2', (value) => {
                component._gradientEnd = value;
                window.ComponentFactory?.updateDayHeaderBackground(component);
            });
        }
        
        if (currentBgType === 'color') {
            // Single color picker
            this.createColorInput('Achtergrondkleur', component._backgroundColor || '#667eea', (value) => {
                component._backgroundColor = value;
                window.ComponentFactory?.updateDayHeaderBackground(component);
            });
        }
        
        if (currentBgType === 'image') {
            // Image picker button
            const imgBtn = this.createButton('📸 Foto Kiezen', async () => {
                if (!window.MediaPicker) {
                    alert('Media Picker niet beschikbaar');
                    return;
                }
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src) {
                    component._backgroundImage = src;
                    if (window.ComponentFactory?.updateDayHeaderBackground) {
                        window.ComponentFactory.updateDayHeaderBackground(component);
                    }
                }
            });
            imgBtn.style.background = '#667eea';
            imgBtn.style.color = 'white';
            imgBtn.style.marginBottom = '12px';
            this.panel.appendChild(imgBtn);
        }
        
        if (currentBgType === 'map') {
            // Map Zoom Level
            const currentZoom = component._mapZoom || 7;
            this.createRangeInput('Kaart Zoom Level', String(currentZoom), '3', '15', '1', (value) => {
                component._mapZoom = parseInt(value);
                // Update the map if it exists
                if (component._dayMap) {
                    const bounds = component._dayMap.getBounds();
                    const center = bounds.getCenter();
                    component._dayMap.setView(center, parseInt(value));
                }
            });
            
            // Map coordinates (optional)
            const mapInfo = document.createElement('div');
            mapInfo.style.fontSize = '12px';
            mapInfo.style.color = '#6b7280';
            mapInfo.style.padding = '8px';
            mapInfo.style.background = '#f0f9ff';
            mapInfo.style.borderRadius = '6px';
            mapInfo.style.marginBottom = '12px';
            mapInfo.innerHTML = '🗺️ De kaart toont automatisch de route met bestemmingen uit je dagkaarten!<br><small>Zoom: 3=wereld, 7=land, 10=regio, 15=stad</small>';
            this.panel.appendChild(mapInfo);
        }
        
        if (currentBgType === 'video') {
            // Video Media Selector button
            const videoBtn = this.createButton('🎬 Video Kiezen (Media)', async () => {
                if (!window.MediaPicker) {
                    alert('Media Picker niet beschikbaar');
                    return;
                }
                const res = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                if (!res || !res.videoId) return;
                
                component._backgroundVideo = res.videoId;
                console.log('[Properties] Video selected:', res.videoId);
                window.ComponentFactory?.updateDayHeaderBackground(component);
            });
            videoBtn.style.background = '#8b5cf6';
            videoBtn.style.color = 'white';
            videoBtn.style.marginBottom = '12px';
            this.panel.appendChild(videoBtn);
            
            // Show current video if set
            if (component._backgroundVideo) {
                const currentVideo = document.createElement('div');
                currentVideo.style.fontSize = '12px';
                currentVideo.style.color = '#059669';
                currentVideo.style.padding = '8px';
                currentVideo.style.background = '#d1fae5';
                currentVideo.style.borderRadius = '6px';
                currentVideo.style.marginBottom = '12px';
                currentVideo.innerHTML = `✅ Video geselecteerd: <code>${component._backgroundVideo}</code>`;
                this.panel.appendChild(currentVideo);
            }
            
            const videoInfo = document.createElement('div');
            videoInfo.style.fontSize = '12px';
            videoInfo.style.color = '#6b7280';
            videoInfo.style.padding = '8px';
            videoInfo.style.background = '#f0f9ff';
            videoInfo.style.borderRadius = '6px';
            videoInfo.style.marginBottom = '12px';
            videoInfo.innerHTML = '🎬 Klik op de knop om een YouTube video te selecteren uit de media bibliotheek';
            this.panel.appendChild(videoInfo);
        }

        // === OVERLAY INSTELLINGEN === (only for full card layouts)
        if (currentBgType !== 'map' && currentBgType !== 'video') {
            const overlayHeader = document.createElement('h5');
            overlayHeader.textContent = '🎨 Overlay';
            overlayHeader.style.marginTop = '20px';
            overlayHeader.style.marginBottom = '12px';
            overlayHeader.style.fontSize = '14px';
            overlayHeader.style.fontWeight = '600';
            this.panel.appendChild(overlayHeader);

            // Overlay Color
            this.createColorInput('Overlay Kleur', component._overlayColor || '#000000', (value) => {
                component._overlayColor = value;
                const overlay = component.querySelector('.day-header-overlay');
                if (overlay) {
                    const opacity = component._overlayOpacity || 0.5;
                    overlay.style.background = this.hexToRgba(value, opacity);
                }
            });

            // Overlay Opacity
            this.createRangeInput('Overlay Transparantie (%)', String(Math.round((component._overlayOpacity || 0.5) * 100)), '0', '100', '1', (value) => {
                const numValue = parseInt(value, 10) || 0;
                component._overlayOpacity = numValue / 100;
                const overlay = component.querySelector('.day-header-overlay');
                if (overlay) {
                    const color = component._overlayColor || '#000000';
                    overlay.style.background = this.hexToRgba(color, numValue / 100);
                }
            });
        }

        // === TEKST INSTELLINGEN ===
        const textHeader = document.createElement('h5');
        textHeader.textContent = '✏️ Tekst Styling';
        textHeader.style.marginTop = '20px';
        textHeader.style.marginBottom = '12px';
        textHeader.style.fontSize = '14px';
        textHeader.style.fontWeight = '600';
        this.panel.appendChild(textHeader);

        // Title Color
        this.createColorInput('Titel Kleur', component._titleColor || '#ffffff', (value) => {
            component._titleColor = value;
            const h2 = component.querySelector('.day-header-info h2') || component.querySelector('.day-header-text h2');
            if (h2) h2.style.color = value;
        });

        // Title Size
        const titleSizeValue = parseInt(component._titleSize) || 24;
        this.createRangeInput('Titel Grootte (px)', String(titleSizeValue), '16', '60', '1px', (value) => {
            component._titleSize = value;
            const h2 = component.querySelector('.day-header-info h2') || component.querySelector('.day-header-text h2');
            if (h2) {
                h2.style.fontSize = value;
                console.log('[Title Size]', value, h2);
            }
        });

        // Subtitle Color
        this.createColorInput('Subtitel Kleur', component._subtitleColor || '#ffffff', (value) => {
            component._subtitleColor = value;
            const p = component.querySelector('.day-header-info p') || component.querySelector('.day-header-text p');
            if (p) p.style.color = value;
        });

        // Subtitle Size
        const subtitleSizeValue = parseInt(component._subtitleSize) || 14;
        this.createRangeInput('Subtitel Grootte (px)', String(subtitleSizeValue), '12', '32', '1px', (value) => {
            component._subtitleSize = value;
            const p = component.querySelector('.day-header-info p') || component.querySelector('.day-header-text p');
            if (p) {
                p.style.fontSize = value;
                console.log('[Subtitle Size]', value, p);
            }
        });

        // Info text
        const info = document.createElement('div');
        info.style.fontSize = '12px';
        info.style.color = '#6b7280';
        info.style.padding = '12px';
        info.style.background = '#f8fafc';
        info.style.borderRadius = '6px';
        info.style.marginTop = '12px';
        info.innerHTML = `
            <strong>🗺️ Nieuwe Layout:</strong> Links zie je de dag info met van-naar locaties, rechts de route kaart!<br>
            <strong>🚗 Auto Rondreizen:</strong> Km en reistijd worden automatisch getoond als beschikbaar<br>
            <strong>📍 Route Kaart:</strong> Toont automatisch de route met bestemmingen uit Travel Compositor
        `;
        this.panel.appendChild(info);
    }

    createTravelCardProperties(component) {
        const carousel = component.querySelector('.wb-travel-card-carousel');
        const carouselImages = carousel?.querySelector('.carousel-images');
        
        // Image Management Section
        const imageSection = document.createElement('div');
        imageSection.style.marginBottom = '20px';
        
        const imageTitle = document.createElement('h5');
        imageTitle.textContent = '🖼️ Fotos Beheren';
        imageTitle.style.marginBottom = '12px';
        imageTitle.style.fontSize = '14px';
        imageTitle.style.fontWeight = '600';
        imageSection.appendChild(imageTitle);
        
        // Current images list
        const imagesList = document.createElement('div');
        imagesList.style.marginBottom = '12px';
        
        const updateImagesList = () => {
            imagesList.innerHTML = '';
            const images = carouselImages?.querySelectorAll('.carousel-image') || [];
            
            if (images.length === 0) {
                imagesList.innerHTML = '<p style="color: #6b7280; font-size: 13px;">Geen foto\'s toegevoegd</p>';
            } else {
                images.forEach((img, idx) => {
                    const imgRow = document.createElement('div');
                    imgRow.style.display = 'flex';
                    imgRow.style.alignItems = 'center';
                    imgRow.style.gap = '8px';
                    imgRow.style.padding = '8px';
                    imgRow.style.background = '#f9fafb';
                    imgRow.style.borderRadius = '6px';
                    imgRow.style.marginBottom = '8px';
                    
                    const thumb = document.createElement('div');
                    thumb.style.width = '40px';
                    thumb.style.height = '40px';
                    thumb.style.borderRadius = '4px';
                    thumb.style.backgroundImage = img.style.backgroundImage;
                    thumb.style.backgroundSize = 'cover';
                    thumb.style.backgroundPosition = 'center';
                    
                    const label = document.createElement('span');
                    label.textContent = `Foto ${idx + 1}`;
                    label.style.flex = '1';
                    label.style.fontSize = '13px';
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    deleteBtn.style.background = '#ef4444';
                    deleteBtn.style.color = 'white';
                    deleteBtn.style.border = 'none';
                    deleteBtn.style.padding = '6px 10px';
                    deleteBtn.style.borderRadius = '4px';
                    deleteBtn.style.cursor = 'pointer';
                    deleteBtn.onclick = () => {
                        img.remove();
                        updateImagesList();
                        // Update dots
                        const dots = carousel?.querySelectorAll('.dot');
                        if (dots && dots[idx]) dots[idx].remove();
                    };
                    
                    imgRow.appendChild(thumb);
                    imgRow.appendChild(label);
                    imgRow.appendChild(deleteBtn);
                    imagesList.appendChild(imgRow);
                });
            }
        };
        
        updateImagesList();
        imageSection.appendChild(imagesList);
        
        // Add image button
        const addImageBtn = this.createButton('➕ Foto Toevoegen', async () => {
            if (!window.MediaPicker) {
                alert('Media picker niet beschikbaar');
                return;
            }
            
            const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
            const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
            
            if (!src) return;
            
            // Create carousel if it doesn't exist
            if (!carousel) {
                const newCarousel = document.createElement('div');
                newCarousel.className = 'wb-travel-card-carousel';
                newCarousel.innerHTML = `
                    <div class="carousel-images"></div>
                    <button class="carousel-prev" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: -300, behavior: 'smooth'})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-next" onclick="event.stopPropagation(); this.closest('.wb-travel-card-carousel').querySelector('.carousel-images').scrollBy({left: 300, behavior: 'smooth'})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="carousel-dots"></div>
                `;
                component.insertBefore(newCarousel, component.firstChild.nextSibling);
            }
            
            // Add image
            const carouselImgs = component.querySelector('.carousel-images');
            const newImg = document.createElement('div');
            newImg.className = 'carousel-image';
            newImg.style.backgroundImage = `url('${src}')`;
            carouselImgs.appendChild(newImg);
            
            // Add dot
            const dots = component.querySelector('.carousel-dots');
            if (dots) {
                const dot = document.createElement('span');
                dot.className = 'dot';
                dots.appendChild(dot);
            }
            
            updateImagesList();
        });
        
        addImageBtn.style.background = '#667eea';
        addImageBtn.style.borderColor = '#667eea';
        addImageBtn.style.color = 'white';
        imageSection.appendChild(addImageBtn);
        
        this.panel.appendChild(imageSection);
        
        // Foto Hoogte Controle
        const heightSection = document.createElement('div');
        heightSection.style.marginBottom = '20px';
        
        const heightTitle = document.createElement('h5');
        heightTitle.textContent = '📏 Foto Hoogte';
        heightTitle.style.marginBottom = '12px';
        heightTitle.style.fontSize = '14px';
        heightTitle.style.fontWeight = '600';
        heightSection.appendChild(heightTitle);
        
        const currentHeight = carousel?.querySelector('.carousel-image')?.offsetHeight || 300;
        
        const heightSlider = document.createElement('input');
        heightSlider.type = 'range';
        heightSlider.min = '150';
        heightSlider.max = '600';
        heightSlider.value = currentHeight;
        heightSlider.step = '10';
        heightSlider.style.width = '100%';
        heightSlider.style.marginBottom = '8px';
        
        const heightValue = document.createElement('div');
        heightValue.textContent = `${currentHeight}px`;
        heightValue.style.textAlign = 'center';
        heightValue.style.fontSize = '13px';
        heightValue.style.color = '#6b7280';
        heightValue.style.marginBottom = '8px';
        
        heightSlider.addEventListener('input', (e) => {
            const newHeight = e.target.value;
            heightValue.textContent = `${newHeight}px`;
            
            // Update alle carousel images
            const allImages = component.querySelectorAll('.carousel-image');
            allImages.forEach(img => {
                img.style.height = `${newHeight}px`;
            });
            
            // Update carousel container
            if (carousel) {
                carousel.style.height = `${newHeight}px`;
            }
        });
        
        heightSection.appendChild(heightSlider);
        heightSection.appendChild(heightValue);
        
        const heightInfo = document.createElement('div');
        heightInfo.style.fontSize = '12px';
        heightInfo.style.color = '#6b7280';
        heightInfo.style.padding = '8px';
        heightInfo.style.background = '#f9fafb';
        heightInfo.style.borderRadius = '6px';
        heightInfo.textContent = 'Sleep de slider om de hoogte van de foto\'s aan te passen';
        heightSection.appendChild(heightInfo);
        
        this.panel.appendChild(heightSection);
        
        // Info
        const info = document.createElement('div');
        info.style.fontSize = '12px';
        info.style.color = '#6b7280';
        info.style.padding = '12px';
        info.style.background = '#f8fafc';
        info.style.borderRadius = '6px';
        info.innerHTML = '<strong>💡 Tip:</strong> Voeg meerdere foto\'s toe voor een mooie carousel!';
        this.panel.appendChild(info);
    }

    createTravelHeroProperties(component) {
        const select = component.querySelector('.travel-hero-style-select');
        const preview = component.querySelector('.travel-hero-preview');
        const h1 = component.querySelector('.travel-hero-content h1');
        const p = component.querySelector('.travel-hero-content p');

        // Hero Style Selector
        const currentStyle = select?.value || 'interactive-map';
        this.createSelectInput('Hero Style', currentStyle, [
            { value: 'interactive-map', label: '🗺️ Interactive Map' },
            { value: 'image-hero', label: '📸 Image Hero' },
            { value: 'video-hero', label: '🎬 Video Hero' }
        ], (value) => {
            if (select) select.value = value;
            if (preview) {
                preview.setAttribute('data-style', value);
                
                // Rebuild preview content based on style
                const title = h1?.textContent || 'Ierland Rondreis';
                const subtitle = p?.textContent || '8 dagen door het groene eiland';
                
                if (value === 'interactive-map') {
                    preview.innerHTML = `
                        <div class="travel-hero-map-container" id="hero-map-${component.id}"></div>
                        <div class="travel-hero-overlay"></div>
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                    `;
                    // Reinitialize map
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeTravelHeroMap) {
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeTravelHeroMap(component, destinations);
                        }
                    }, 100);
                } else if (value === 'image-hero') {
                    preview.innerHTML = `
                        <div class="image-hero-background" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');"></div>
                        <div class="image-hero-overlay"></div>
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                    `;
                } else if (value === 'video-hero') {
                    const defaultVideoId = 'Yocja_N5s1I';
                    preview.innerHTML = `
                        <div class="video-hero-container">
                            <div class="video-hero-background" id="video-bg-${component.id}">
                                <iframe 
                                    src="https://www.youtube.com/embed/${defaultVideoId}?autoplay=1&mute=1&loop=1&playlist=${defaultVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                                    frameborder="0"
                                    allow="autoplay; encrypted-media"
                                    style="position: absolute; top: 50%; left: 50%; width: 177.77777778vh; height: 100%; min-width: 100%; min-height: 56.25vw; transform: translate(-50%, -50%); pointer-events: none; border: none;"
                                ></iframe>
                            </div>
                            <div class="video-hero-overlay"></div>
                            <div class="travel-hero-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                        </div>
                    `;
                }
                
                // Refresh properties to show style-specific controls
                setTimeout(() => this.showProperties(component), 100);
            }
        });

        // Title
        this.createTextInput('Titel', h1?.textContent || '', (value) => {
            if (h1) h1.textContent = value;
        });

        // Subtitle
        this.createTextInput('Subtitel', p?.textContent || '', (value) => {
            if (p) p.textContent = value;
        });

        // Image selector for image-hero style
        if (currentStyle === 'image-hero') {
            const bgDiv = component.querySelector('.image-hero-background');
            
            const imgBtn = this.createButton('📸 Achtergrond Foto Kiezen', async () => {
                if (!window.MediaPicker) {
                    alert('Media Picker niet beschikbaar');
                    return;
                }
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && bgDiv) {
                    bgDiv.style.backgroundImage = `url('${src}')`;
                    if (window.websiteBuilder?.showNotification) {
                        window.websiteBuilder.showNotification('Foto toegevoegd!', 'success');
                    }
                }
            });
            imgBtn.style.background = '#667eea';
            imgBtn.style.color = 'white';
            imgBtn.style.marginBottom = '12px';
            this.panel.appendChild(imgBtn);

            // Height control for image-hero
            const heightHeader = document.createElement('h5');
            heightHeader.textContent = '📏 Hoogte';
            heightHeader.style.marginTop = '20px';
            heightHeader.style.marginBottom = '12px';
            heightHeader.style.fontSize = '14px';
            heightHeader.style.fontWeight = '600';
            this.panel.appendChild(heightHeader);

            // Full-screen toggle
            const isFullScreen = component.classList.contains('hero-fullscreen');
            this.createSelectInput('Hoogte Modus', isFullScreen ? 'fullscreen' : 'custom', [
                { value: 'custom', label: '📐 Aangepaste Hoogte' },
                { value: 'fullscreen', label: '🖥️ Full Screen (100vh)' }
            ], (value) => {
                if (value === 'fullscreen') {
                    component.classList.add('hero-fullscreen');
                    component.style.minHeight = '100vh';
                    preview.style.height = '100vh';
                } else {
                    component.classList.remove('hero-fullscreen');
                    const customHeight = component._heroHeight || 600;
                    component.style.minHeight = customHeight + 'px';
                    preview.style.height = customHeight + 'px';
                }
                setTimeout(() => this.showProperties(component), 100);
            });

            // Custom height slider (only show if not fullscreen)
            if (!isFullScreen) {
                const currentHeight = component._heroHeight || 600;
                this.createRangeInput('Hoogte (px)', String(currentHeight), '400', '1200', '50', (value) => {
                    component._heroHeight = parseInt(value, 10);
                    component.style.minHeight = value + 'px';
                    if (preview) preview.style.height = value + 'px';
                });
            }
        }

        // Video selector for video-hero style
        if (currentStyle === 'video-hero') {
            const videoContainer = component.querySelector('.video-hero-background');
            
            const videoBtn = this.createButton('🎬 Video Kiezen', async () => {
                if (!window.MediaPicker) {
                    alert('Media Picker niet beschikbaar');
                    return;
                }
                const res = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                if (!res || !res.videoId) return;
                
                // Create iframe with autoplay
                if (videoContainer) {
                    videoContainer.innerHTML = `
                        <iframe 
                            src="https://www.youtube.com/embed/${res.videoId}?autoplay=1&mute=1&loop=1&playlist=${res.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 50%; left: 50%; width: 177.77777778vh; height: 100%; min-width: 100%; min-height: 56.25vw; transform: translate(-50%, -50%); pointer-events: none; border: none;"
                        ></iframe>
                    `;
                }
                
                if (window.websiteBuilder?.showNotification) {
                    window.websiteBuilder.showNotification('Video toegevoegd!', 'success');
                }
            });
            videoBtn.style.background = '#8b5cf6';
            videoBtn.style.color = 'white';
            videoBtn.style.marginBottom = '12px';
            this.panel.appendChild(videoBtn);
            
            const videoInfo = document.createElement('div');
            videoInfo.style.fontSize = '12px';
            videoInfo.style.color = '#6b7280';
            videoInfo.style.padding = '8px';
            videoInfo.style.background = '#f0f9ff';
            videoInfo.style.borderRadius = '6px';
            videoInfo.style.marginBottom = '12px';
            videoInfo.innerHTML = '🎬 Selecteer een YouTube video die automatisch afspeelt als achtergrond';
            this.panel.appendChild(videoInfo);

            // Height control for video-hero
            const heightHeader = document.createElement('h5');
            heightHeader.textContent = '📏 Hoogte';
            heightHeader.style.marginTop = '20px';
            heightHeader.style.marginBottom = '12px';
            heightHeader.style.fontSize = '14px';
            heightHeader.style.fontWeight = '600';
            this.panel.appendChild(heightHeader);

            // Full-screen toggle
            const isFullScreen = component.classList.contains('hero-fullscreen');
            this.createSelectInput('Hoogte Modus', isFullScreen ? 'fullscreen' : 'custom', [
                { value: 'custom', label: '📐 Aangepaste Hoogte' },
                { value: 'fullscreen', label: '🖥️ Full Screen (100vh)' }
            ], (value) => {
                if (value === 'fullscreen') {
                    component.classList.add('hero-fullscreen');
                    component.style.minHeight = '100vh';
                    preview.style.height = '100vh';
                } else {
                    component.classList.remove('hero-fullscreen');
                    const customHeight = component._heroHeight || 600;
                    component.style.minHeight = customHeight + 'px';
                    preview.style.height = customHeight + 'px';
                }
                setTimeout(() => this.showProperties(component), 100);
            });

            // Custom height slider (only show if not fullscreen)
            if (!isFullScreen) {
                const currentHeight = component._heroHeight || 600;
                this.createRangeInput('Hoogte (px)', String(currentHeight), '400', '1200', '50', (value) => {
                    component._heroHeight = parseInt(value, 10);
                    component.style.minHeight = value + 'px';
                    if (preview) preview.style.height = value + 'px';
                });
            }
        }

        // === ACHTERGROND KLEUR (voor alle styles) ===
        const bgHeader = document.createElement('h5');
        bgHeader.textContent = '🎨 Achtergrond';
        bgHeader.style.marginTop = '20px';
        bgHeader.style.marginBottom = '12px';
        bgHeader.style.fontSize = '14px';
        bgHeader.style.fontWeight = '600';
        this.panel.appendChild(bgHeader);

        // Background color picker
        const currentBgColor = component._backgroundColor || '#667eea';
        this.createColorInput('Achtergrondkleur', currentBgColor, (value) => {
            component._backgroundColor = value;
            component.style.background = value;
        });

        // === OVERLAY INSTELLINGEN ===
        const overlayHeader = document.createElement('h5');
        overlayHeader.textContent = '🌫️ Overlay';
        overlayHeader.style.marginTop = '20px';
        overlayHeader.style.marginBottom = '12px';
        overlayHeader.style.fontSize = '14px';
        overlayHeader.style.fontWeight = '600';
        this.panel.appendChild(overlayHeader);

        const overlayDiv = component.querySelector('.image-hero-overlay, .video-hero-overlay, .travel-hero-overlay');
        
        // Overlay Color
        const currentOverlayColor = component._overlayColor || '#000000';
        this.createColorInput('Overlay Kleur', currentOverlayColor, (value) => {
            component._overlayColor = value;
            if (overlayDiv) {
                const opacity = component._overlayOpacity || 0.5;
                overlayDiv.style.background = this.hexToRgba(value, opacity);
            }
        });

        // Overlay Opacity
        const currentOverlayOpacity = Math.round((component._overlayOpacity || 0.5) * 100);
        this.createRangeInput('Overlay Transparantie (%)', String(currentOverlayOpacity), '0', '100', '1', (value) => {
            const numValue = parseInt(value, 10) || 0;
            component._overlayOpacity = numValue / 100;
            if (overlayDiv) {
                const color = component._overlayColor || '#000000';
                overlayDiv.style.background = this.hexToRgba(color, numValue / 100);
            }
        });

        // === BUTTONS ===
        const btnHeader = document.createElement('h5');
        btnHeader.textContent = '🔘 Call-to-Action Buttons';
        btnHeader.style.marginTop = '20px';
        btnHeader.style.marginBottom = '12px';
        btnHeader.style.fontSize = '14px';
        btnHeader.style.fontWeight = '600';
        this.panel.appendChild(btnHeader);

        const addButtonBtn = this.createButton('➕ Button Toevoegen', () => {
            const contentDiv = component.querySelector('.travel-hero-content');
            if (!contentDiv) return;

            // Check if button container exists
            let btnContainer = contentDiv.querySelector('.hero-buttons');
            if (!btnContainer) {
                btnContainer = document.createElement('div');
                btnContainer.className = 'hero-buttons';
                btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap;';
                contentDiv.appendChild(btnContainer);
            }

            // Add new button
            const newBtn = document.createElement('a');
            newBtn.href = '#';
            newBtn.className = 'btn btn-primary';
            newBtn.textContent = 'Nieuwe Button';
            newBtn.contentEditable = 'true';
            newBtn.style.cssText = 'padding: 12px 32px; font-size: 16px; font-weight: 600; pointer-events: auto;';
            btnContainer.appendChild(newBtn);

            if (window.websiteBuilder?.showNotification) {
                window.websiteBuilder.showNotification('Button toegevoegd!', 'success');
            }

            // Refresh properties
            setTimeout(() => this.showProperties(component), 100);
        });
        addButtonBtn.style.background = '#10b981';
        addButtonBtn.style.color = 'white';
        addButtonBtn.style.marginBottom = '12px';
        this.panel.appendChild(addButtonBtn);

        // Show existing buttons
        const existingButtons = component.querySelectorAll('.hero-buttons .btn');
        if (existingButtons.length > 0) {
            const btnList = document.createElement('div');
            btnList.style.marginTop = '12px';
            btnList.style.padding = '12px';
            btnList.style.background = '#f9fafb';
            btnList.style.borderRadius = '6px';
            
            const btnTitle = document.createElement('div');
            btnTitle.textContent = `${existingButtons.length} button(s) aanwezig`;
            btnTitle.style.fontWeight = '600';
            btnTitle.style.marginBottom = '8px';
            btnTitle.style.fontSize = '13px';
            btnList.appendChild(btnTitle);

            existingButtons.forEach((btn, idx) => {
                const btnRow = document.createElement('div');
                btnRow.style.display = 'flex';
                btnRow.style.alignItems = 'center';
                btnRow.style.gap = '8px';
                btnRow.style.marginBottom = '6px';

                const label = document.createElement('span');
                label.textContent = btn.textContent || `Button ${idx + 1}`;
                label.style.flex = '1';
                label.style.fontSize = '12px';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.style.background = '#ef4444';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.padding = '4px 8px';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.onclick = () => {
                    btn.remove();
                    this.showProperties(component);
                };

                btnRow.appendChild(label);
                btnRow.appendChild(deleteBtn);
                btnList.appendChild(btnRow);
            });

            this.panel.appendChild(btnList);
        }
    }

    createTravelHeroPropertiesOLD_BACKUP(component) {
        const select = component.querySelector('.travel-hero-style-select');
        const preview = component.querySelector('.travel-hero-preview');
        const h1 = component.querySelector('.travel-hero-content h1');
        const p = component.querySelector('.travel-hero-content p');

        // Refresh Hero Button - FORCE REBUILD - OUDE CODE
        const refreshBtn = this.createButton('🔄 Herbouw Hero (Huidige Style)', () => {
            const title = h1?.textContent || 'Ierland Rondreis';
            const subtitle = p?.textContent || '8 dagen door het groene eiland';
            const currentValue = select?.value || 'timeline-slider';
            
            console.log('[Herbouw Hero] Current style:', currentValue);
            
            if (preview) {
                // FORCE complete rebuild
                preview.innerHTML = '';
                
                setTimeout(() => {
                    if (currentValue === 'timeline-slider') {
                        preview.innerHTML = `
                            <div class="timeline-slider-background" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');"></div>
                            <div class="timeline-slider-overlay"></div>
                            <div class="travel-hero-content timeline-slider-header">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                            <div class="timeline-slider-container">
                                <div class="timeline-slider-track" id="timeline-slider-${component.id}"></div>
                                <button class="timeline-slider-prev"><i class="fas fa-chevron-left"></i></button>
                                <button class="timeline-slider-next"><i class="fas fa-chevron-right"></i></button>
                            </div>
                        `;
                        setTimeout(() => {
                            if (window.ComponentFactory?.initializeTimelineSlider) {
                                const destinations = this.getDestinationsFromTimeline();
                                window.ComponentFactory.initializeTimelineSlider(component, destinations);
                            }
                        }, 100);
                    } else if (currentValue === 'video-overlay') {
                        preview.innerHTML = `
                            <div class="video-overlay-container">
                                <div class="video-background" id="video-bg-${component.id}"></div>
                                <div class="video-overlay-dark"></div>
                            </div>
                        `;
                    }
                    
                    if (select) select.value = currentValue;
                    preview.setAttribute('data-style', currentValue);
                    
                    if (window.websiteBuilder?.showNotification) {
                        window.websiteBuilder.showNotification('Hero herbouwd!', 'success');
                    }
                    
                    // Refresh properties panel to show new controls
                    setTimeout(() => {
                        this.showProperties(component);
                    }, 200);
                }, 50);
            }
        });
        refreshBtn.style.background = '#10b981';
        refreshBtn.style.color = 'white';
        refreshBtn.style.marginBottom = '16px';
        this.panel.appendChild(refreshBtn);

        // Hero Style Selector
        const currentStyle = select?.value || 'interactive-map';
        this.createSelectInput('Hero Style', currentStyle, [
            { value: 'interactive-map', label: '🗺️ Interactive Map' },
            { value: 'timeline-slider', label: '🎯 Timeline Slider' },
            { value: 'video-overlay', label: '🎬 Video Overlay' },
            { value: 'parallax-photos', label: '📸 Parallax Photos' },
            { value: 'airplane-window', label: '✈️ Airplane Window' },
            { value: 'split-hero', label: '📍 Split Hero' }
        ], (value) => {
            if (select) select.value = value;
            if (preview) {
                preview.setAttribute('data-style', value);
                
                // Rebuild preview content based on style
                const title = h1?.textContent || 'Thailand Rondreis';
                const subtitle = p?.textContent || '20 dagen door het land van de glimlach';
                
                if (value === 'interactive-map') {
                    preview.innerHTML = `
                        <div class="travel-hero-map-container" id="hero-map-${component.id}"></div>
                        <div class="travel-hero-overlay"></div>
                        <div class="travel-hero-content">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                    `;
                    
                    // Reinitialize map
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeTravelHeroMap) {
                            // Get destinations from timeline if available
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeTravelHeroMap(component, destinations);
                        }
                    }, 100);
                } else if (value === 'timeline-slider') {
                    preview.innerHTML = `
                        <div class="timeline-slider-background" style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600');"></div>
                        <div class="timeline-slider-overlay"></div>
                        <div class="travel-hero-content timeline-slider-header">
                            <h1 contenteditable="true">${title}</h1>
                            <p contenteditable="true">${subtitle}</p>
                        </div>
                        <div class="timeline-slider-container">
                            <div class="timeline-slider-track" id="timeline-slider-${component.id}"></div>
                            <button class="timeline-slider-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="timeline-slider-next"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    `;
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeTimelineSlider) {
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeTimelineSlider(component, destinations);
                        }
                    }, 100);
                } else if (value === 'video-overlay') {
                    preview.innerHTML = `
                        <div class="video-overlay-container">
                            <div class="video-background" id="video-bg-${component.id}"></div>
                            <div class="video-overlay-dark"></div>
                        </div>
                    `;
                } else if (value === 'parallax-photos') {
                    preview.innerHTML = `
                        <div class="parallax-photos-container" id="parallax-${component.id}">
                            <div class="parallax-layer parallax-bg"></div>
                            <div class="parallax-layer parallax-mid"></div>
                            <div class="parallax-layer parallax-front"></div>
                            <div class="travel-hero-content parallax-content">
                                <h1 contenteditable="true">${title}</h1>
                                <p contenteditable="true">${subtitle}</p>
                            </div>
                        </div>
                    `;
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeParallaxPhotos) {
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeParallaxPhotos(component, destinations);
                        }
                    }, 100);
                } else if (value === 'airplane-window') {
                    preview.innerHTML = `
                        <div class="airplane-window-container">
                            <div class="airplane-window-frame">
                                <svg class="window-shape" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <clipPath id="window-clip-${component.id}">
                                            <rect x="50" y="50" width="300" height="400" rx="150" />
                                        </clipPath>
                                    </defs>
                                    <rect x="40" y="40" width="320" height="420" rx="160" fill="#e5e7eb" stroke="#9ca3af" stroke-width="8"/>
                                    <rect x="50" y="50" width="300" height="400" rx="150" fill="#fff" stroke="#d1d5db" stroke-width="4"/>
                                </svg>
                                <div class="window-photos" id="window-photos-${component.id}" style="clip-path: url(#window-clip-${component.id});"></div>
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
                    `;
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeAirplaneWindow) {
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeAirplaneWindow(component, destinations);
                        }
                    }, 100);
                } else if (value === 'split-hero') {
                    preview.innerHTML = `
                        <div class="split-hero-container">
                            <div class="split-hero-map" id="split-map-${component.id}"></div>
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
                            <div class="split-hero-photos" id="split-photos-${component.id}"></div>
                        </div>
                    `;
                    setTimeout(() => {
                        if (window.ComponentFactory?.initializeSplitHero) {
                            const destinations = this.getDestinationsFromTimeline();
                            window.ComponentFactory.initializeSplitHero(component, destinations);
                        }
                    }, 100);
                }
            }
        });

        // Title
        this.createTextInput('Titel', h1?.textContent || '', (value) => {
            if (h1) h1.textContent = value;
        });

        // Subtitle
        this.createTextInput('Subtitel', p?.textContent || '', (value) => {
            if (p) p.textContent = value;
        });

        // Video selector for video-overlay style
        if (currentStyle === 'video-overlay') {
            const videoContainer = component.querySelector('.video-background');
            
            // Video Media Selector button
            const videoBtn = this.createButton('🎬 Video Kiezen', async () => {
                if (!window.MediaPicker) {
                    alert('Media Picker niet beschikbaar');
                    return;
                }
                const res = await window.MediaPicker.openVideo({ defaultTab: 'youtube' });
                if (!res || !res.videoId) return;
                
                // Create iframe with autoplay
                if (videoContainer) {
                    videoContainer.innerHTML = `
                        <iframe 
                            src="https://www.youtube.com/embed/${res.videoId}?autoplay=1&mute=1&loop=1&playlist=${res.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        ></iframe>
                    `;
                }
                
                if (window.websiteBuilder?.showNotification) {
                    window.websiteBuilder.showNotification('Video toegevoegd!', 'success');
                }
            });
            videoBtn.style.background = '#8b5cf6';
            videoBtn.style.color = 'white';
            videoBtn.style.marginBottom = '12px';
            this.panel.appendChild(videoBtn);
            
            const videoInfo = document.createElement('div');
            videoInfo.style.fontSize = '12px';
            videoInfo.style.color = '#6b7280';
            videoInfo.style.padding = '8px';
            videoInfo.style.background = '#f0f9ff';
            videoInfo.style.borderRadius = '6px';
            videoInfo.style.marginBottom = '12px';
            videoInfo.innerHTML = '🎬 Selecteer een YouTube video die automatisch afspeelt als achtergrond';
            this.panel.appendChild(videoInfo);
        }
        
        // Photo selectors for parallax-photos style
        if (currentStyle === 'parallax-photos') {
            const bgLayer = component.querySelector('.parallax-bg');
            const midLayer = component.querySelector('.parallax-mid');
            const frontLayer = component.querySelector('.parallax-front');
            
            // Background layer photo
            const bgBtn = this.createButton('📸 Achtergrond Foto', async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && bgLayer) {
                    bgLayer.style.backgroundImage = `url('${src}')`;
                }
            });
            bgBtn.style.background = '#667eea';
            bgBtn.style.color = 'white';
            bgBtn.style.marginBottom = '8px';
            this.panel.appendChild(bgBtn);
            
            // Middle layer photo
            const midBtn = this.createButton('📸 Midden Foto', async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && midLayer) {
                    midLayer.style.backgroundImage = `url('${src}')`;
                }
            });
            midBtn.style.background = '#667eea';
            midBtn.style.color = 'white';
            midBtn.style.marginBottom = '8px';
            this.panel.appendChild(midBtn);
            
            // Front layer photo
            const frontBtn = this.createButton('📸 Voorgrond Foto', async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src && frontLayer) {
                    frontLayer.style.backgroundImage = `url('${src}')`;
                }
            });
            frontBtn.style.background = '#667eea';
            frontBtn.style.color = 'white';
            this.panel.appendChild(frontBtn);
        }
        
        // Photo selectors for airplane-window style
        if (currentStyle === 'airplane-window') {
            const addPhotoBtn = this.createButton('📸 Foto\'s Toevoegen', async () => {
                if (!window.MediaPicker) return;
                const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                if (src) {
                    const photosContainer = component.querySelector('.window-photos');
                    if (photosContainer) {
                        const slide = document.createElement('div');
                        slide.className = 'window-slide';
                        slide.style.backgroundImage = `url('${src}')`;
                        photosContainer.appendChild(slide);
                    }
                }
            });
            addPhotoBtn.style.background = '#667eea';
            addPhotoBtn.style.color = 'white';
            this.panel.appendChild(addPhotoBtn);
        }

        // Info text
        const info = document.createElement('div');
        info.style.fontSize = '12px';
        info.style.color = '#6b7280';
        info.style.padding = '12px';
        info.style.background = '#f8fafc';
        info.style.borderRadius = '6px';
        info.style.marginTop = '12px';
        info.innerHTML = '<strong>ℹ️ Info:</strong> Kies een hero style en pas de instellingen aan in dit panel.';
        this.panel.appendChild(info);
    }

    getDestinationsFromTimeline() {
        const timeline = document.querySelector('.wb-travel-timeline');
        if (!timeline) return [];

        const destinationCards = timeline.querySelectorAll('.wb-travel-card.destination');
        const destinations = [];

        destinationCards.forEach(card => {
            const nameEl = card.querySelector('.travel-card-title');
            const dayEl = card.querySelector('.travel-card-day');
            
            if (nameEl && card._destinationData) {
                destinations.push({
                    name: nameEl.textContent,
                    latitude: card._destinationData.latitude,
                    longitude: card._destinationData.longitude,
                    fromDay: card._destinationData.fromDay,
                    toDay: card._destinationData.toDay
                });
            }
        });

        return destinations;
    }

    createContentFlexProperties(component) {
        const api = component.__contentFlexApi || {};
        // Title & Subtitle
        this.createTextInput('Titel', component.querySelector('.cf-title')?.textContent || '', (v)=> api.setTitle && api.setTitle(v));
        this.createTextInput('Subtitel', component.querySelector('.cf-subtitle')?.textContent || '', (v)=> api.setSubtitle && api.setSubtitle(v));
        
        // AI: Smart fill button (uses ComponentFactory.fillWithAI)
        try {
            const aiRow = document.createElement('div');
            aiRow.style.display='flex'; aiRow.style.gap='8px'; aiRow.style.margin='6px 0 8px';
            const aiBtn = this.createButton('✨ AI tekst genereren', async () => {
                try {
                    if (window.ComponentFactory && typeof window.ComponentFactory.fillWithAI === 'function') {
                        await window.ComponentFactory.fillWithAI(component);
                    } else {
                        alert('AI module niet geladen.');
                    }
                } catch (e) { 
                    console.warn('AI fill failed', e);
                    if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                        window.websiteBuilder.showNotification('AI vullen mislukt', 'error');
                    }
                }
            });
            aiBtn.style.background = '#8b5cf6'; aiBtn.style.borderColor = '#8b5cf6'; aiBtn.style.color = '#fff'; aiBtn.style.fontWeight = '600';
            aiRow.appendChild(aiBtn);
            this.panel.appendChild(aiRow);
        } catch (e) {}
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

        // Vertical position: allow negative top offset using margin-top on the block
        try {
            const curTop = parseInt(component.style.marginTop || '0', 10).toString();
            this.createRangeInput('Top offset (px)', curTop, '-80', '120', '1', (v)=>{
                const num = parseInt(v, 10) || 0;
                component.style.marginTop = `${num}px`;
            });
        } catch (e) {}

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

        // Tags (for news filtering) ”” chips UI stored globally for publish fallback
        try {
            const grp = this.createFormGroup('Tags (nieuws)');
            const wrap = document.createElement('div');
            wrap.style.display = 'flex'; wrap.style.gap = '8px'; wrap.style.alignItems = 'center';
            const ul = document.createElement('ul'); ul.style.display='flex'; ul.style.flexWrap='wrap'; ul.style.gap='6px'; ul.style.listStyle='none'; ul.style.margin='6px 0 0'; ul.style.padding='0';
            const input = document.createElement('input'); input.type='text'; input.className='form-control'; input.placeholder='Voeg tag toe… (Enter of ,)'; input.style.maxWidth='220px';
            const read = ()=> Array.from(ul.querySelectorAll('li[data-tag]')).map(li=>li.getAttribute('data-tag')).filter(Boolean);
            const write = (arr)=>{
                ul.innerHTML='';
                (arr||[]).forEach(t=>{
                    const li=document.createElement('li'); li.setAttribute('data-tag', t);
                    li.style.cssText='background:#eef2ff;color:#3730a3;border:1px solid #e5e7eb;border-radius:20px;padding:4px 10px;font-size:12px;display:flex;gap:6px;align-items:center;';
                    const span=document.createElement('span'); span.textContent=t;
                    const x=document.createElement('button'); x.type='button'; x.className='btn btn-secondary btn-small'; x.textContent='×'; x.style.padding='0 6px';
                    x.onclick=()=>{ const next=read().filter(v=>v!==t); write(next); try{ window.CURRENT_NEWS_TAGS = next; }catch (e) {} };
                    li.appendChild(span); li.appendChild(x); ul.appendChild(li);
                });
            };
            const add=(raw)=>{ const base=read(); const parts=String(raw||'').split(',').map(s=>s.trim()).filter(Boolean); if(!parts.length) return; const next=Array.from(new Set(base.concat(parts))).slice(0,20); write(next); input.value=''; try{ window.CURRENT_NEWS_TAGS = next; }catch (e) {} };
            input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===','){ e.preventDefault(); add(input.value); }});
            const btn=document.createElement('button'); btn.type='button'; btn.className='btn btn-secondary'; btn.textContent='Toevoegen'; btn.onclick=()=>add(input.value);
            // init from globals if present
            let initial=[]; try{ const g=window.CURRENT_NEWS_TAGS; initial = Array.isArray(g)? g : (typeof g==='string'? g.split(',').map(s=>s.trim()).filter(Boolean): []);}catch (e) {}
            write(initial);
            wrap.appendChild(input); wrap.appendChild(btn); grp.appendChild(wrap); grp.appendChild(ul); this.panel.appendChild(grp);
        } catch (e) {}

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
                } catch (e) {}
                if (!curAccent) curAccent = '#16a34a';
            }
            const colorEl = this.createColorInput('CTA kleur', curAccent, (v)=>{
                component._ctaColor = v;
                try { component.style.setProperty('--cf-accent', v); } catch (e) {}
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
                } catch (e) { break; }
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
                } catch (e) { break; }
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
                    } catch (e) {}
                };
                const pick = document.createElement('button'); pick.className='btn btn-secondary btn-small'; pick.textContent='Kies'; pick.onclick = async ()=>{
                    try {
                        if (!window.MediaPicker) return;
                        const r = await window.MediaPicker.openImage();
                        const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                        if (!u) return;
                        const next = imgs.slice(); next[i] = u; api.setImages && api.setImages(next); renderList();
                    } catch (e) {}
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

        // Count control ”“ aantal foto's bepalen
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
            // desired > current.length â†’ vul aan via MediaPicker (sequentieel)
            const missing = desired - current.length;
            const added = [];
            for (let i = 0; i < missing; i++) {
                try {
                    if (!window.MediaPicker) break;
                    const r = await window.MediaPicker.openImage();
                    const u = r && (r.fullUrl || r.regularUrl || r.url || r.dataUrl);
                    if (!u) break;
                    added.push(u);
                } catch (e) { break; }
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
                } catch (e) { alert('AI highlights genereren mislukt.'); }
            });
            aiBtnHl.style.background = '#0ea5e9'; aiBtnHl.style.borderColor = '#0ea5e9'; aiBtnHl.style.color = '#fff';
            this.panel.appendChild(aiBtnHl);
        } catch (e) {}

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

        // Background mode selector
        const detectMode = () => {
            if (component.querySelector('.hp-video')) return 'video';
            return 'image';
        };
        let currentMode = detectMode();

        this.createSelectInput('Achtergrond type', currentMode, [
            { value: 'image', label: 'Afbeelding' },
            { value: 'video', label: 'Video (Pexels/YouTube)' }
        ], async (mode) => {
            try {
                if (mode === 'image') {
                    // Remove video if exists
                    const videoWrap = component.querySelector('.hp-video');
                    if (videoWrap) videoWrap.remove();
                    
                    // Show image
                    if (bgImg) bgImg.style.display = '';
                    
                    // Open image picker
                    if (window.MediaPicker) {
                        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                        const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        if (src && bgImg) {
                            if (typeof __WB_applyResponsiveSrc === 'function') {
                                __WB_applyResponsiveSrc(bgImg, src);
                            } else {
                                bgImg.src = src;
                            }
                        }
                    }
                } else if (mode === 'video') {
                    // Open video picker
                    if (window.MediaPicker) {
                        const res = await window.MediaPicker.openVideo({ defaultTab: 'pexels' });
                        if (!res) return;
                        
                        // Hide image
                        if (bgImg) bgImg.style.display = 'none';
                        
                        // Create or get video container
                        let videoWrap = component.querySelector('.hp-video');
                        if (!videoWrap) {
                            videoWrap = document.createElement('div');
                            videoWrap.className = 'hp-video';
                            videoWrap.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; z-index: 0;';
                            const bgEl = component.querySelector('.hp-bg');
                            if (bgEl) bgEl.parentNode.insertBefore(videoWrap, bgEl);
                        }
                        
                        // Handle Pexels videos
                        if (res.source === 'pexels' && res.videoUrl) {
                            videoWrap.innerHTML = `
                                <video 
                                    autoplay 
                                    loop 
                                    muted 
                                    playsinline
                                    poster="${res.thumbnail || ''}"
                                    style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); object-fit: cover; pointer-events: none;"
                                >
                                    <source src="${res.videoUrl}" type="video/mp4">
                                </video>
                            `;
                        }
                        // Handle YouTube videos
                        else if (res.source === 'youtube' && res.id) {
                            const embedUrl = res.embedUrl || `https://www.youtube.com/embed/${res.id}`;
                            videoWrap.innerHTML = `
                                <iframe 
                                    src="${embedUrl}?autoplay=1&mute=1&loop=1&playlist=${res.id}&controls=0&showinfo=0"
                                    frameborder="0"
                                    allow="autoplay; encrypted-media"
                                    style="position: absolute; top: 50%; left: 50%; width: 177.77777778vh; height: 100%; min-width: 100%; min-height: 56.25vw; transform: translate(-50%, -50%); pointer-events: none; border: none;"
                                ></iframe>
                            `;
                        }
                    }
                }
            } catch(err) { console.warn('Mode switch canceled/failed', err); }
        });

        // Background image chooser (for quick changes)
        const pickBg = this.createButton('Achtergrond wijzigen (Media)', async () => {
            try {
                if (!window.MediaPicker) return;
                
                // Check current mode
                const hasVideo = !!component.querySelector('.hp-video');
                
                if (hasVideo) {
                    // Video mode - open video picker
                    const res = await window.MediaPicker.openVideo({ defaultTab: 'pexels' });
                    if (!res) return;
                    
                    let videoWrap = component.querySelector('.hp-video');
                    if (!videoWrap) return;
                    
                    // Handle Pexels videos
                    if (res.source === 'pexels' && res.videoUrl) {
                        videoWrap.innerHTML = `
                            <video 
                                autoplay 
                                loop 
                                muted 
                                playsinline
                                poster="${res.thumbnail || ''}"
                                style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); object-fit: cover; pointer-events: none;"
                            >
                                <source src="${res.videoUrl}" type="video/mp4">
                            </video>
                        `;
                    }
                    // Handle YouTube videos
                    else if (res.source === 'youtube' && res.id) {
                        const embedUrl = res.embedUrl || `https://www.youtube.com/embed/${res.id}`;
                        videoWrap.innerHTML = `
                            <iframe 
                                src="${embedUrl}?autoplay=1&mute=1&loop=1&playlist=${res.id}&controls=0&showinfo=0"
                                frameborder="0"
                                allow="autoplay; encrypted-media"
                                style="position: absolute; top: 50%; left: 50%; width: 177.77777778vh; height: 100%; min-width: 100%; min-height: 56.25vw; transform: translate(-50%, -50%); pointer-events: none; border: none;"
                            ></iframe>
                        `;
                    }
                } else {
                    // Image mode - open image picker
                    const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
                    const src = (res && (res.fullUrl || res.regularUrl || res.url || res.dataUrl || res.src || res.imageUrl || res.downloadUrl)) || '';
                    try { console.debug('[hero-page][props] media chosen src', src, res); } catch (e) {}
                    if (src && bgImg) {
                        if (typeof window.__WB_applyResponsiveSrc === 'function') {
                            window.__WB_applyResponsiveSrc(bgImg, src);
                        } else if (typeof __WB_applyResponsiveSrc === 'function') {
                            __WB_applyResponsiveSrc(bgImg, src);
                        } else {
                            bgImg.src = src;
                        }
                    }
                }
            } catch(err) { console.warn('Media select canceled/failed', err); }
        });
        pickBg.style.background = '#8b5cf6'; pickBg.style.borderColor = '#8b5cf6'; pickBg.style.color = '#fff';
        this.panel.appendChild(pickBg);

        // Height (min-height on section) ”” use numeric slider and add 'px' via callback
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

        // Word font size ”” numeric slider, add 'px' in callback
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

        // Position X (left) as percentage to move across full width ”” numeric slider 0”“95
        const curLeft = (word?.style.left || '5%').replace('%','');
        this.createRangeInput('Positie X (%)', curLeft, '0', '95', '1', (v) => { if (word) word.style.left = `${parseInt(v,10)||0}%`; });

        // Position Y (bottom) in px with wider range and a quick snap button ”” numeric slider
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
            } catch (e) {}
            bgImg.alt = 'Hero background';
            bgImg.decoding = 'async';
            bgImg.loading = 'eager';
            bg.insertBefore(bgImg, bg.firstChild || null);
            try { bg.style.backgroundImage = ''; } catch (e) {}
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
            if (bg && value) try { bg.style.backgroundImage = `url("${value}")`; } catch (e) {}
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
                if (src) {
                    if (bgImg) bgImg.src = src;
                    if (bg) try { bg.style.backgroundImage = `url("${src}")`; } catch (e) {}
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
            if (src) {
                if (bgImg) bgImg.src = src;
                if (bg) try { bg.style.backgroundImage = `url("${src}")`; } catch (e) {}
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
            case 'travel-day-header':
                this.createTravelDayHeaderProperties(component);
                break;
            case 'travel-card-destination':
            case 'travel-card-hotel':
                this.createTravelCardProperties(component);
                break;
            case 'travel-hero':
                this.createTravelHeroProperties(component);
                break;
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
                        const src = res?.fullUrl || res?.regularUrl || res?.url || res?.dataUrl;
                        const bg = comp.querySelector('.hero-bg');
                        let bgImg = comp.querySelector('.hero-bg img');
                        // If img missing (older markup), create it
                        if (bg && !bgImg) {
                            bgImg = document.createElement('img');
                            bgImg.className = 'hero-bg-img';
                            bgImg.alt = 'Hero background';
                            bgImg.decoding = 'async';
                            bgImg.loading = 'eager';
                            bg.insertBefore(bgImg, bg.firstChild || null);
                        }
                        if (src) {
                            if (bgImg) bgImg.src = src;
                            if (bg) try { bg.style.backgroundImage = `url("${src}")`; } catch (e) {}
                        }
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
            case 'hero-travel-search':
                this.createHeroTravelSearchProperties(component);
                break;
            case 'hero-travel':
                // Add Media Selector button for Hero video background
                (function addTopHeroVideoMediaButton(self, comp){
                    const btn = self.createButton('🎬 Achtergrond kiezen (Media)', async () => {
                        if (!window.MediaPicker) {
                            alert('Media Picker niet beschikbaar');
                            return;
                        }
                        
                        const res = await window.MediaPicker.openVideo({ defaultTab: 'pexels' });
                        if (!res) return;
                        
                        // Handle Pexels videos (direct MP4)
                        if (res.source === 'pexels' && res.videoUrl) {
                            const videoWrap = comp.querySelector('.hero-video');
                            if (videoWrap) {
                                // Replace iframe with HTML5 video element
                                videoWrap.innerHTML = `
                                    <video 
                                        autoplay 
                                        loop 
                                        muted 
                                        playsinline
                                        poster="${res.thumbnail || ''}"
                                        style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); object-fit: cover; pointer-events: none;"
                                    >
                                        <source src="${res.videoUrl}" type="video/mp4">
                                    </video>
                                `;
                                console.log('[Properties] Pexels video set:', res.videoUrl);
                            }
                            return;
                        }
                        
                        // Handle YouTube videos (iframe)
                        if (!res.videoId) return;
                        
                        const iframe = comp.querySelector('iframe');
                        const videoWrap = comp.querySelector('.hero-video');
                        if (iframe && videoWrap) {
                            const newId = res.videoId;
                            const start = 0; // Can be extended later
                            const baseUrl = `https://www.youtube.com/embed/${newId}`;
                            const common = `${start>0?`&start=${start}`:''}&mute=1&controls=0&playsinline=1`;
                            const isEditMode = !!(document.body?.dataset?.wbMode === 'edit');
                            const paramsEdit = `autoplay=0&loop=0${common}`;
                            const paramsView = `autoplay=1&loop=1&playlist=${newId}${common}`;
                            const targetSrc = `${baseUrl}?${isEditMode ? paramsEdit : paramsView}`;
                            
                            iframe.src = targetSrc;
                            if (iframe.dataset) iframe.dataset.src = targetSrc;
                            
                            // Update preview button if exists
                            const previewBtn = videoWrap.querySelector('.video-preview-btn');
                            if (previewBtn) {
                                previewBtn.onclick = (e) => {
                                    e.stopPropagation();
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
                                    closeBtn.onclick = () => modal.remove();
                                    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                                    modalContent.appendChild(modalIframe);
                                    modalContent.appendChild(closeBtn);
                                    modal.appendChild(modalContent);
                                    document.body.appendChild(modal);
                                };
                            }
                        }
                    });
                    // Emphasize button visually
                    btn.style.backgroundColor = '#8b5cf6';
                    btn.style.borderColor = '#8b5cf6';
                    btn.style.color = '#fff';
                    btn.style.fontWeight = '700';
                    self.panel.appendChild(btn);
                })(this, component);
                this.createHeroTravelProperties(component);
                break;
            case 'hero-banner-cta':
                this.createHeroBannerCtaProperties(component);
                break;
            case 'hero-video-cta':
                this.createHeroVideoCtaProperties(component);
                break;
            case 'news-overview':
                this.createNewsOverviewProperties(component);
                break;
            case 'travel-overview':
                this.createTravelOverviewProperties(component);
                break;
            case 'travel-filter-bar':
                this.createTravelFilterBarProperties(component);
                break;
            case 'travel-intro':
                this.createTravelIntroProperties(component);
                break;
            case 'animated-route-map':
                this.createAnimatedRouteMapProperties(component);
                break;
            case 'route-overview-btn':
                this.createRouteOverviewBtnProperties(component);
                break;
            case 'roadbook':
                this.createRoadbookProperties(component);
                break;
            case 'feature-media':
                this.createFeatureMediaProperties(component);
                break;
            case 'feature-highlight':
                this.createFeatureHighlightProperties(component);
                break;
            case 'feature-icon-image':
                this.createFeatureIconImageProperties(component);
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
            case 'news-article':
                this.createNewsArticleProperties(component);
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
            'travel-hero': '🎨 Reis Hero',
            'hero-travel': 'Hero Travel',
            'hero-page': 'Hero (Pagina)',
            'hero-banner-cta': 'Hero Banner + CTA',
            'feature-media': 'Feature + Media',
            'feature-highlight': 'Feature Highlight',
            'feature-icon-image': 'Feature Icon & Image',
            'travel-types': 'Soorten Reizen',
            'contact-info': 'Contact Info',
            'contact-map-cta': 'Contact Map + CTA',
            'media-row': 'Media Rij',
            'dest-tabs': 'Bestemmingen Tabs',
            'news-article': 'Nieuwsartikel'
        };
        return titles[type] || 'Component';
    }

    // Properties for News Article (title, date, author, tags chips, body)
    createNewsArticleProperties(component) {
        const titleEl = component.querySelector('.na-title');
        const dateEl = component.querySelector('.na-date');
        const authorEl = component.querySelector('.na-author');
        const tagsUl = component.querySelector('.na-tags');
        const bodyEl = component.querySelector('.na-body');

        // Basic fields
        if (titleEl) this.createTextInput('Titel', titleEl.textContent || '', (v) => { titleEl.textContent = v; });
        if (dateEl) this.createTextInput('Datum (YYYY-MM-DD)', dateEl.textContent || '', (v) => { dateEl.textContent = v; });
        if (authorEl) this.createTextInput('Auteur', authorEl.textContent || '', (v) => { authorEl.textContent = v; });

        // AI Fill button
        try {
            const aiRow = document.createElement('div');
            aiRow.style.display='flex'; aiRow.style.gap='8px'; aiRow.style.margin='6px 0 8px';
            const aiBtn = this.createButton('✨ AI vullen', async () => {
                try {
                    if (window.ComponentFactory && typeof window.ComponentFactory.fillWithAI === 'function') {
                        await window.ComponentFactory.fillWithAI(component);
                    } else {
                        alert('AI module niet geladen.');
                    }
                } catch (e) { 
                    console.warn('AI fill failed', e);
                    if (window.websiteBuilder && window.websiteBuilder.showNotification) {
                        window.websiteBuilder.showNotification('AI vullen mislukt', 'error');
                    }
                }
            });
            aiBtn.style.background = '#8b5cf6'; aiBtn.style.borderColor = '#8b5cf6'; aiBtn.style.color = '#fff'; aiBtn.style.fontWeight = '600';
            aiRow.appendChild(aiBtn);
            this.panel.appendChild(aiRow);
        } catch (e) {}

        // Helper to apply current styling to a tag element
        const styleTag = (li, text) => {
            const bg = component._tagBg || '#eef2ff';
            const fg = component._tagColor || '#3730a3';
            const br = component._tagBorder || '#e5e7eb';
            const mode = component._tagStyle || 'pill'; // pill | ticket | label
            const holes = !!component._tagHoles; // ticket punch holes
            const holeBg = component._tagHoleBg || '#ffffff';
            const shadow = !!component._tagShadow;
            const iconCls = component._tagIcon || '';

            li.className = 'na-tag';
            li.style.cssText = 'display:flex;gap:6px;align-items:center;position:relative;line-height:1;';
            li.style.background = bg;
            li.style.color = fg;
            li.style.border = `1px solid ${br}`;
            li.style.padding = '4px 10px';
            li.style.fontSize = '12px';
            li.style.borderRadius = (mode === 'pill') ? '20px' : (mode === 'ticket' ? '12px' : '6px');
            li.style.boxShadow = shadow ? '0 2px 8px rgba(0,0,0,0.12)' : 'none';

            // Clean existing adornments
            li.querySelector('[data-tag-left-notch]')?.remove();
            li.querySelector('[data-tag-right-notch]')?.remove();
            li.querySelector('[data-tag-tail]')?.remove();
            li.querySelector('[data-tag-icon]')?.remove();
            li.querySelector('[data-tag-perf]')?.remove();
            li.querySelector('[data-tag-cut]')?.remove();

            // Ticket notches (ponsgaten)
            if (mode === 'ticket' && holes) {
                const mkHole = (side) => {
                    const h = document.createElement('span');
                    h.setAttribute(side === 'left' ? 'data-tag-left-notch' : 'data-tag-right-notch', '');
                    h.style.cssText = `
                        position:absolute;top:50%;${side}: -6px;transform:translateY(-50%);
                        width:12px;height:12px;border-radius:50%;
                        background:${holeBg};box-shadow:0 0 0 1px ${br} inset;`;
                    li.appendChild(h);
                };
                mkHole('left'); mkHole('right');
                // Perforation dotted line inside
                const perf = document.createElement('span');
                perf.setAttribute('data-tag-perf','');
                perf.style.cssText = `height:70%;border-left:2px dotted ${br};margin:0 6px;`;
                li.insertBefore(perf, li.querySelector('[data-tag-text]'));
            }

            // Label tail (prijskaartje)
            if (mode === 'label') {
                const tail = document.createElement('span');
                tail.setAttribute('data-tag-tail','');
                tail.style.cssText = `width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:10px solid ${bg}; margin-left:4px;`;
                li.appendChild(tail);
                // Left angled cut
                const cut = document.createElement('span');
                cut.setAttribute('data-tag-cut','');
                cut.style.cssText = `position:absolute;left:-5px;top:50%;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:${holeBg};box-shadow:0 0 0 1px ${br} inset;`;
                li.appendChild(cut);
            }

            // Optional icon
            let resolvedIcon = iconCls;
            if (!resolvedIcon) {
                if (mode === 'ticket') resolvedIcon = 'fa-ticket';
                else if (mode === 'label') resolvedIcon = 'fa-tag';
            }
            if (resolvedIcon) {
                const ic = document.createElement('i'); ic.setAttribute('data-tag-icon',''); ic.className = `fas ${resolvedIcon}`; ic.style.color = fg; ic.style.opacity = '.9';
                li.appendChild(ic);
            }

            // Ensure text span exists
            let span = li.querySelector('[data-tag-text]');
            if (!span) { span = document.createElement('span'); span.setAttribute('data-tag-text',''); li.insertBefore(span, li.firstChild); }
            span.textContent = text;

            // Visible remove button
            let x = li.querySelector('[data-tag-del]');
            if (!x) { x = document.createElement('button'); x.type='button'; x.setAttribute('data-tag-del',''); li.appendChild(x); }
            x.title = 'Verwijder tag';
            x.textContent = '×';
            x.style.cssText = 'background:transparent;border:none;color:#111827;font-weight:700;cursor:pointer;padding:0 6px;';
            x.onclick = () => { const list = readTags().filter(v => v !== text); writeTags(list); syncGlobals(list); };
        };

        // Tags chips (properties panel rendering and synchronization)
        const readTags = () => Array.from(tagsUl?.querySelectorAll('li.na-tag [data-tag-text]') || []).map(span => (span.textContent || '').trim()).filter(Boolean);
        const writeTags = (arr) => {
            if (!tagsUl) return;
            tagsUl.innerHTML = '';
            (arr || []).forEach(t => {
                const li = document.createElement('li');
                styleTag(li, String(t));
                tagsUl.appendChild(li);
            });
        };
        const syncGlobals = (tags) => {
            try { window.CURRENT_NEWS_TAGS = tags.slice(0, 50); } catch (e) {}
        };

        // UI group
        const grp = this.createFormGroup('Tags');
        const wrap = document.createElement('div');
        wrap.style.display = 'flex'; wrap.style.gap = '8px'; wrap.style.alignItems = 'center';
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'form-control'; input.placeholder = 'Voeg tag toe… (Enter of ,)'; input.style.maxWidth = '220px';
        const add = (raw) => {
            const base = readTags();
            const parts = String(raw||'').split(',').map(s=>s.trim()).filter(Boolean);
            if (!parts.length) return;
            const limited = Array.from(new Set(base.concat(parts))).slice(0, 20);
            writeTags(limited); syncGlobals(limited); input.value = '';
        };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); }
        });
        const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-secondary'; btn.textContent='Toevoegen'; btn.onclick=()=>add(input.value);
        wrap.appendChild(input); wrap.appendChild(btn); grp.appendChild(wrap); this.panel.appendChild(grp);

        // Appearance controls
        this.createColorInput('Tag achtergrond', component._tagBg || '#eef2ff', (v)=>{ component._tagBg = v; writeTags(readTags()); });
        this.createColorInput('Tag tekstkleur', component._tagColor || '#3730a3', (v)=>{ component._tagColor = v; writeTags(readTags()); });
        this.createColorInput('Tag randkleur', component._tagBorder || '#e5e7eb', (v)=>{ component._tagBorder = v; writeTags(readTags()); });
        this.createColorInput('Gaatjeskleur (ticket)', component._tagHoleBg || '#ffffff', (v)=>{ component._tagHoleBg = v; writeTags(readTags()); });
        this.createSelectInput('Tag stijl', component._tagStyle || 'pill', [
            { value:'pill', label:'Pil' },
            { value:'ticket', label:'Ticket' },
            { value:'label', label:'Prijskaartje' }
        ], (v)=>{
            const m = String(v||'pill').toLowerCase();
            let norm = m;
            if (!['pill','ticket','label'].includes(m)) {
                if (m.includes('prijs')) norm = 'label';
                else if (m.includes('ticket')) norm = 'ticket';
                else norm = 'pill';
            }
            component._tagStyle = norm;
            if (norm === 'ticket' && typeof component._tagHoles === 'undefined') component._tagHoles = true;
            writeTags(readTags());
        });
        // Ticket ponsgaten
        this.createSelectInput('Ticket ponsgaten', component._tagHoles ? 'on' : 'off', [
            { value:'on', label:'Aan' },
            { value:'off', label:'Uit' }
        ], (v)=>{ component._tagHoles = (v==='on'); writeTags(readTags()); });
        this.createSelectInput('Tag schaduw', component._tagShadow ? 'on' : 'off', [
            { value:'on', label:'Aan' },
            { value:'off', label:'Uit' }
        ], (v)=>{ component._tagShadow = (v==='on'); writeTags(readTags()); });
        // Optional icon per tag set (globaal voor weergave)
        if (typeof this.createIconPickerInput === 'function') {
            this.createIconPickerInput('Tag icoon (optioneel)', component._tagIcon || '', (val)=>{ component._tagIcon = val || ''; writeTags(readTags()); });
        }

        // Initialize chips
        writeTags(readTags()); syncGlobals(readTags());

        // Body (richtext)
        if (bodyEl) this.createTextareaInput('Inhoud', bodyEl.innerHTML || '', (v) => { bodyEl.innerHTML = v; });
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
                    } catch (e) {}
                };

                // Title
                const title = document.createElement('input');
                title.type = 'text'; title.className = 'form-control'; title.value = it.title || '';
                title.onchange = () => { api.updateItem && api.updateItem(active, idx, { title: title.value }); };

                // Summary
                const sum = document.createElement('input');
                sum.type = 'text'; sum.className = 'form-control'; sum.value = it.summary || '';
                sum.placeholder = '2”“3 regels';
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
        
        // Ensure existing Pexels video is playing
        const existingVideo = component.querySelector('.hero-video video');
        if (existingVideo && !existingVideo.paused) {
            // Video is already playing, good!
        } else if (existingVideo) {
            // Video exists but not playing, try to play it
            existingVideo.play().catch(e => console.warn('Resume video failed:', e));
        }

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
            { value: 'youtube', label: 'Video (Pexels/YouTube)' },
            { value: 'widget', label: 'Widget (Travel Compositor)' }
        ], async (mode) => {
            try {
                if (mode === 'image') {
                    component._heroMode = 'image';
                    // Remove video if present
                    const videoWrap = component.querySelector('.hero-video');
                    if (videoWrap) videoWrap.remove();
                    // Restore background images
                    const bg = component.querySelector('.hero-bg');
                    if (bg) {
                        bg.style.opacity = '1';
                        bg.style.pointerEvents = '';
                    }
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
                    const r = await window.MediaPicker.openVideo({ defaultTab: 'pexels' });
                    
                    // Handle Pexels videos
                    if (r && r.source === 'pexels' && r.videoUrl) {
                        // Find or create video container
                        let videoWrap = component.querySelector('.hero-video');
                        if (!videoWrap) {
                            videoWrap = document.createElement('div');
                            videoWrap.className = 'hero-video';
                            videoWrap.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; z-index: 1;';
                            const bg = component.querySelector('.hero-bg');
                            if (bg) {
                                // Hide background images when video is active
                                bg.style.opacity = '0';
                                bg.style.pointerEvents = 'none';
                                bg.parentNode.insertBefore(videoWrap, bg);
                            }
                        }
                        
                        // Clear existing content
                        videoWrap.innerHTML = '';
                        
                        // Create video element programmatically for better control
                        const video = document.createElement('video');
                        video.loop = true;
                        video.muted = true;
                        video.playsInline = true;
                        video.autoplay = true;
                        video.poster = r.thumbnail || '';
                        video.style.cssText = 'position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); object-fit: cover;';
                        
                        // Add source
                        const source = document.createElement('source');
                        source.src = r.videoUrl;
                        source.type = 'video/mp4';
                        video.appendChild(source);
                        
                        // Add to container
                        videoWrap.appendChild(video);
                        
                        // Store video reference
                        component._pexelsVideo = video;
                        component._pexelsVideoUrl = r.videoUrl;
                        
                        // Force play with multiple attempts
                        const attemptPlay = (attempts = 0) => {
                            if (attempts > 5) {
                                console.warn('Video autoplay failed after 5 attempts');
                                return;
                            }
                            
                            const playPromise = video.play();
                            if (playPromise !== undefined) {
                                playPromise
                                    .then(() => {
                                        console.log('✅ Pexels video playing on canvas');
                                    })
                                    .catch(e => {
                                        console.warn(`Video play attempt ${attempts + 1} failed:`, e);
                                        // Retry after delay
                                        setTimeout(() => attemptPlay(attempts + 1), 200);
                                    });
                            }
                        };
                        
                        // Start playing when video is loaded enough
                        video.addEventListener('loadeddata', () => {
                            attemptPlay();
                        });
                        
                        // Also try immediately
                        video.load();
                        setTimeout(() => attemptPlay(), 100);
                    }
                    // Handle YouTube videos
                    else if (r && (r.embedUrl || r.url)) {
                        const embed = r.embedUrl || r.url;
                        if (api.setYouTube) api.setYouTube(embed);
                    }
                    
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
        } catch (e) {}

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
                } catch (e) { alert('AI activiteiten genereren mislukt.'); }
            });
            aiBtnAct.style.background = '#0ea5e9'; aiBtnAct.style.borderColor = '#0ea5e9'; aiBtnAct.style.color = '#fff';
            this.panel.appendChild(aiBtnAct);
        } catch (e) {}

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

        // Background color (section) - Skip for travel-day-header (has own background system)
        const componentType = component.dataset.wbComponent || component.dataset.component || '';
        if (componentType !== 'travel-day-header') {
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
        }

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
        let tId = null;
        const safeCall = (val)=>{ try { if (typeof onChange === 'function') onChange(val); } catch(err){ console.warn('text onChange failed', err); } };
        input.addEventListener('input', (e) => {
            try { e.stopPropagation(); } catch (e) {}
            try { window.websiteBuilder && typeof window.websiteBuilder.markTyping==='function' && window.websiteBuilder.markTyping(900); } catch (e) {}
            const val = e.target.value;
            if (tId) clearTimeout(tId);
            tId = setTimeout(()=> { try { requestAnimationFrame(()=> safeCall(val)); } catch (e) { safeCall(val); } }, 220);
        }, { passive: true });
        group.appendChild(input);
        this.panel.appendChild(group);
        return group;
    }

    createColorInput(label, value, onChange) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = value;
        colorInput.className = 'form-control color-input';
        colorInput.id = inputId;
        colorInput.setAttribute('aria-label', label);
        const lbl2 = group.querySelector('label');
        if (lbl2) lbl2.setAttribute('for', inputId);
        const safeCall = (val) => { try { if (typeof onChange === 'function') onChange(val); } catch (err) { console.warn('color onChange failed', err); } };
        colorInput.addEventListener('input', (e) => { const val = e.target.value; requestAnimationFrame(()=> safeCall(val)); });
        colorInput.addEventListener('change', (e) => { const val = e.target.value; safeCall(val); });
        group.appendChild(colorInput);
        this.panel.appendChild(group);
        return group;
    }

    createRangeInput(label, value, min, max, step, onChange, container) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'range-wrapper';
        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.min = min;
        rangeInput.max = max;
        rangeInput.step = step;
        rangeInput.value = value;
        rangeInput.className = 'form-control range-input';
        rangeInput.id = inputId;
        rangeInput.setAttribute('aria-label', label);
        const lbl3 = group.querySelector('label');
        if (lbl3) lbl3.setAttribute('for', inputId);
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'range-value';
        valueDisplay.textContent = value;
        const safeRange = (newValueRaw) => {
            try { if (typeof onChange === 'function') onChange(newValueRaw); } catch (err) { console.warn('range onChange failed', err); }
        };
        rangeInput.addEventListener('input', (e) => {
            const v = e.target.value;
            const newValue = v + (String(step).includes('rem') ? 'rem' : String(step).includes('px') ? 'px' : '');
            valueDisplay.textContent = newValue;
            safeRange(newValue);
        });
        wrapper.appendChild(rangeInput);
        wrapper.appendChild(valueDisplay);
        group.appendChild(wrapper);
        (container || this.panel).appendChild(group);
        return group;
    }

    createSelectInput(label, value, options, onChange, container) {
        const group = this.createFormGroup(label);
        const inputId = `prop_${label.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${Date.now()}`;
        const select = document.createElement('select');
        select.className = 'form-control';
        select.id = inputId;
        select.setAttribute('aria-label', label);
        const lbl4 = group.querySelector('label');
        if (lbl4) lbl4.setAttribute('for', inputId);
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            optionEl.selected = option.value === value;
            select.appendChild(optionEl);
        });
        select.addEventListener('change', (e) => { try { onChange(e.target.value); } catch (err) { console.warn('select onChange failed', err); } });
        group.appendChild(select);
        (container || this.panel).appendChild(group);
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

    hexToRgba(hex, alpha) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

// Feature Icon Image Properties
PropertiesPanel.prototype.createFeatureIconImageProperties = function(component) {
    const img = component.querySelector('.fii-image-wrap img');
    const label = component.querySelector('.fii-label');
    const title = component.querySelector('.fii-title');
    const desc = component.querySelector('.fii-description');
    const button = component.querySelector('.fii-button');
    const ctaTitle = component.querySelector('.fii-cta-card h3');
    const ctaText = component.querySelector('.fii-cta-card p');

    // Image upload
    const imgBtn = this.createButton('📷 Upload Afbeelding', async () => {
        if (window.MediaPicker) {
            const result = await window.MediaPicker.open({ type: 'image' });
            if (result && result.url && img) {
                img.src = result.url;
            }
        }
    });
    imgBtn.style.background = '#8b5cf6';
    imgBtn.style.borderColor = '#8b5cf6';
    imgBtn.style.color = '#fff';
    this.panel.appendChild(imgBtn);

    // Position
    this.createSelectInput('Foto positie', component.querySelector('.fii-grid').style.gridTemplateColumns.startsWith('1fr 1fr') ? 'right' : 'left', [
        { value: 'left', label: 'Links' },
        { value: 'right', label: 'Rechts' }
    ], (value) => {
        const grid = component.querySelector('.fii-grid');
        const textCol = component.querySelector('.fii-text');
        const imageCol = component.querySelector('.fii-image-col');
        grid.innerHTML = '';
        if (value === 'left') {
            grid.appendChild(imageCol);
            grid.appendChild(textCol);
        } else {
            grid.appendChild(textCol);
            grid.appendChild(imageCol);
        }
    });

    // Label color
    this.createColorInput('Label kleur', label ? window.getComputedStyle(label).backgroundColor : '#fbbf24', (value) => {
        if (label) label.style.background = value;
    });

    // Icon pickers for items
    const items = component.querySelectorAll('.fii-item');
    items.forEach((item, idx) => {
        const iconEl = item.querySelector('.fii-item-icon i');
        const iconBtn = this.createButton(`🎨 Icoon ${idx + 1}`, async () => {
            if (window.IconPicker) {
                const result = await window.IconPicker.open({ current: iconEl.className, compact: true });
                if (result && result.icon) {
                    iconEl.className = result.icon;
                }
            }
        });
        this.panel.appendChild(iconBtn);
    });

    // CTA Icon picker
    const ctaIcon = component.querySelector('.fii-cta-card i');
    const ctaIconBtn = this.createButton('🎨 CTA Icoon', async () => {
        if (window.IconPicker) {
            const result = await window.IconPicker.open({ current: ctaIcon.className, compact: true });
            if (result && result.icon) {
                ctaIcon.className = result.icon;
            }
        }
    });
    this.panel.appendChild(ctaIconBtn);

    // Delete button
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// Hero Video CTA Properties
PropertiesPanel.prototype.createHeroVideoCtaProperties = function(component) {
    // Media selector for background
    const bgBtn = this.createButton('Achtergrond kiezen', async () => {
        if (!window.MediaPicker) {
            alert('Media Picker niet beschikbaar');
            return;
        }
        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
        if (res) {
            const src = res.fullUrl || res.regularUrl || res.url || res.dataUrl || '';
            if (src) {
                component.style.backgroundImage = `url(${src})`;
            }
        }
    });
    bgBtn.style.backgroundColor = '#ff7700';
    bgBtn.style.borderColor = '#ff7700';
    bgBtn.style.color = '#fff';
    bgBtn.style.fontWeight = '700';
    this.panel.appendChild(bgBtn);
    
    // Title
    const title = component.querySelector('h2');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    // CTA Button
    const ctaBtn = component.querySelector('.wb-cta-btn');
    if (ctaBtn) {
        this.createTextInput('CTA Button Tekst', ctaBtn.textContent, (val) => {
            ctaBtn.textContent = val;
        });
        this.createColorInput('CTA Button Kleur', ctaBtn.style.background || '#ff8c00', (val) => {
            ctaBtn.style.background = val;
        });
    }
    
    // Video selector button
    const videoBtn = component.querySelector('.wb-video-play-btn');
    if (videoBtn) {
        const videoPickerBtn = this.createButton('🎬 Video Kiezen (Pexels/YouTube)', async () => {
            if (!window.MediaPicker) {
                alert('Media Picker niet beschikbaar');
                return;
            }
            const res = await window.MediaPicker.openVideo({ defaultTab: 'pexels' });
            if (!res) return;
            
            // Handle Pexels videos
            if (res.source === 'pexels' && res.videoUrl) {
                // Store Pexels video data
                videoBtn.dataset.videoSource = 'pexels';
                videoBtn.dataset.videoUrl = res.videoUrl;
                videoBtn.dataset.videoThumbnail = res.thumbnail || '';
                videoBtn.dataset.videoId = ''; // Clear YouTube ID
                
                // Update click handler to show Pexels video
                videoBtn.onclick = function() {
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
                    
                    const videoContainer = document.createElement('div');
                    videoContainer.style.cssText = 'position:relative;width:100%;max-width:900px;aspect-ratio:16/9;';
                    
                    const video = document.createElement('video');
                    video.src = this.dataset.videoUrl;
                    video.controls = true;
                    video.autoplay = true;
                    video.style.cssText = 'width:100%;height:100%;border-radius:8px;';
                    
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    closeBtn.style.cssText = 'position:absolute;top:-40px;right:0;background:transparent;border:none;color:#fff;font-size:32px;cursor:pointer;';
                    closeBtn.onclick = () => modal.remove();
                    
                    videoContainer.appendChild(video);
                    videoContainer.appendChild(closeBtn);
                    modal.appendChild(videoContainer);
                    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                    document.body.appendChild(modal);
                };
                
                console.log('[Properties] Pexels video set for play button:', res.videoUrl);
            }
            // Handle YouTube videos
            else if (res.source === 'youtube' && res.id) {
                videoBtn.dataset.videoSource = 'youtube';
                videoBtn.dataset.videoId = res.id;
                videoBtn.dataset.videoUrl = '';
                
                // Restore YouTube click handler
                videoBtn.onclick = function() {
                    const videoId = this.dataset.videoId;
                    if (!videoId) return;
                    
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
                    
                    const videoContainer = document.createElement('div');
                    videoContainer.style.cssText = 'position:relative;width:100%;max-width:900px;aspect-ratio:16/9;';
                    
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    iframe.style.cssText = 'width:100%;height:100%;border:none;';
                    iframe.setAttribute('allowfullscreen', '');
                    
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    closeBtn.style.cssText = 'position:absolute;top:-40px;right:0;background:transparent;border:none;color:#fff;font-size:32px;cursor:pointer;';
                    closeBtn.onclick = () => modal.remove();
                    
                    videoContainer.appendChild(iframe);
                    videoContainer.appendChild(closeBtn);
                    modal.appendChild(videoContainer);
                    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                    document.body.appendChild(modal);
                };
                
                console.log('[Properties] YouTube video set for play button:', res.id);
            }
        });
        videoPickerBtn.style.backgroundColor = '#8b5cf6';
        videoPickerBtn.style.borderColor = '#8b5cf6';
        videoPickerBtn.style.color = '#fff';
        videoPickerBtn.style.fontWeight = '700';
        this.panel.appendChild(videoPickerBtn);
        
        // Manual Video ID input (fallback for YouTube)
        this.createTextInput('Of YouTube Video ID', videoBtn.dataset.videoId || '', (val) => {
            videoBtn.dataset.videoId = val;
            videoBtn.dataset.videoSource = 'youtube';
        });
        
        this.createColorInput('Video Button Kleur', videoBtn.style.background || '#ff8c00', (val) => {
            videoBtn.style.background = val;
        });
    }
    
    // Feature buttons (4 iconen)
    const featureBtns = component.querySelectorAll('.wb-feature-btn');
    if (featureBtns.length > 0) {
        const header = document.createElement('h4');
        header.textContent = 'Feature Buttons';
        header.style.marginTop = '20px';
        header.style.marginBottom = '10px';
        header.style.fontWeight = '600';
        this.panel.appendChild(header);
        
        featureBtns.forEach((btn, index) => {
            const icon = btn.querySelector('i');
            const label = btn.querySelector('div');
            
            // Button label
            if (label) {
                this.createTextInput(`Button ${index + 1} Tekst`, label.textContent, (val) => {
                    label.textContent = val;
                });
                
                // Text color
                this.createColorInput(`Button ${index + 1} Tekst Kleur`, label.style.color || '#ffffff', (val) => {
                    label.style.color = val;
                });
            }
            
            // Icon picker
            if (icon) {
                const iconBtn = this.createButton(`🎨 Button ${index + 1} Icoon Kiezen`, async () => {
                    if (!window.IconPicker) {
                        alert('Icon Picker niet beschikbaar');
                        return;
                    }
                    const selectedIcon = await window.IconPicker.open();
                    if (selectedIcon) {
                        icon.className = `fas ${selectedIcon}`;
                    }
                });
                iconBtn.style.backgroundColor = '#3b82f6';
                iconBtn.style.borderColor = '#3b82f6';
                iconBtn.style.color = '#fff';
                iconBtn.style.fontWeight = '600';
                this.panel.appendChild(iconBtn);
                
                // Icon color
                this.createColorInput(`Button ${index + 1} Icoon Kleur`, icon.style.color || '#ff8c00', (val) => {
                    icon.style.color = val;
                });
            }
            
            // Button background
            this.createColorInput(`Button ${index + 1} Achtergrond`, btn.style.background || 'rgba(255, 140, 0, 0.9)', (val) => {
                btn.style.background = val;
            });
        });
    }
    
    // Delete button
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// News Overview Properties
PropertiesPanel.prototype.createNewsOverviewProperties = function(component) {
    const title = component.querySelector('h2');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    const info = document.createElement('div');
    info.style.cssText = 'padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; margin: 12px 0; font-size: 13px; color: #1e40af;';
    info.textContent = 'Dit component toont automatisch nieuwsartikelen uit de database.';
    this.panel.appendChild(info);
    
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// Travel Overview Properties
PropertiesPanel.prototype.createTravelOverviewProperties = function(component) {
    const title = component.querySelector('h2');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    const badge = component.querySelector('span[contenteditable]');
    if (badge) {
        this.createTextInput('Badge Tekst', badge.textContent, (val) => {
            badge.textContent = val;
        });
    }
    
    const searchInput = component.querySelector('.travel-search-input');
    if (searchInput) {
        this.createTextInput('Zoekbalk Placeholder', searchInput.placeholder, (val) => {
            searchInput.placeholder = val;
        });
    }
    
    // Filter Preset
    const presetSection = document.createElement('div');
    presetSection.style.marginBottom = '20px';
    
    const presetLabel = document.createElement('label');
    presetLabel.textContent = 'Filter Preset';
    presetLabel.style.cssText = 'display: block; font-weight: 600; margin-bottom: 8px; color: #374151; font-size: 14px;';
    presetSection.appendChild(presetLabel);
    
    const presetSelect = document.createElement('select');
    presetSelect.style.cssText = 'width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;';
    presetSelect.innerHTML = '<option value="">Geen (toon alle reizen)</option><option value="strand">Alleen Strandvakanties</option><option value="rondreis">Alleen Rondreizen</option><option value="stedentrip">Alleen Stedentrips</option><option value="safari">Alleen Safaris</option><option value="cultuur">Alleen Cultuur</option><option value="natuur">Alleen Natuur</option><option value="avontuur">Alleen Avontuur</option><option value="luxe">Alleen Luxe</option>';
    
    const currentPreset = component.dataset.filterPreset || '';
    presetSelect.value = currentPreset;
    
    presetSelect.addEventListener('change', (e) => {
        const preset = e.target.value;
        component.dataset.filterPreset = preset;
        
        if (preset) {
            const filterBtn = Array.from(component.querySelectorAll('.travel-filter-btn')).find(btn => btn.textContent.toLowerCase().includes(preset));
            if (filterBtn) filterBtn.click();
        } else {
            const alleBtn = Array.from(component.querySelectorAll('.travel-filter-btn')).find(btn => btn.textContent === 'Alle');
            if (alleBtn) alleBtn.click();
        }
    });
    
    presetSection.appendChild(presetSelect);
    this.panel.appendChild(presetSection);
    
    // Filter configuratie info
    const filterInfo = document.createElement('div');
    filterInfo.style.cssText = 'padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; margin: 12px 0; font-size: 13px; color: #1e40af;';
    filterInfo.innerHTML = '<strong>Filters:</strong><br>Gebruik Filter Preset om deze pagina te beperken tot specifieke reizen. Bijvoorbeeld voor een aparte strandvakanties pagina.';
    this.panel.appendChild(filterInfo);
    
    // Data source info
    const dataInfo = document.createElement('div');
    dataInfo.style.cssText = 'padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; margin: 12px 0; font-size: 13px; color: #166534;';
    dataInfo.innerHTML = '<strong>Data Bron:</strong><br>Reizen worden automatisch geladen via Travel Compositor API. Zorg dat de API configuratie correct is ingesteld.';
    this.panel.appendChild(dataInfo);
    
    // BOLT integration button
    const boltBtn = this.createButton('⚡ Configureer in BOLT', () => {
        alert('BOLT integratie komt binnenkort beschikbaar. Hiermee kun je filters en data sources configureren.');
    });
    boltBtn.style.background = '#8b5cf6';
    boltBtn.style.borderColor = '#8b5cf6';
    boltBtn.style.color = '#fff';
    boltBtn.style.marginTop = '1rem';
    this.panel.appendChild(boltBtn);
    
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// Travel Intro Properties
PropertiesPanel.prototype.createTravelIntroProperties = function(component) {
    const title = component.querySelector('h2');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    const description = component.querySelector('p');
    if (description) {
        this.createTextareaInput('Beschrijving', description.textContent, (val) => {
            description.textContent = val;
        });
    }
    
    const buttonText = component.querySelector('.route-overview-trigger span');
    if (buttonText) {
        this.createTextInput('Button Tekst', buttonText.textContent, (val) => {
            buttonText.textContent = val;
        });
    }
    
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// Route Overview Button Properties
PropertiesPanel.prototype.createRouteOverviewBtnProperties = function(component) {
    const buttonText = component.querySelector('.route-overview-trigger span');
    if (buttonText) {
        this.createTextInput('Button Tekst', buttonText.textContent, (val) => {
            buttonText.textContent = val;
        });
    }
    
    const info = document.createElement('div');
    info.style.cssText = 'padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; margin: 12px 0; font-size: 13px; color: #1e40af;';
    info.textContent = 'Deze button opent het route overzicht panel op de live website.';
    this.panel.appendChild(info);
    
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

PropertiesPanel.prototype.createAnimatedRouteMapProperties = function(component) {
    const travelMap = component._travelMap;
    const routes = component._routes || [];
    
    // Heading
    const heading = document.createElement('h3');
    heading.textContent = '🗺️ Geanimeerde Route Kaart';
    heading.style.cssText = 'margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;';
    this.panel.appendChild(heading);
    
    // Icon grootte
    const currentIconSize = (travelMap && travelMap.iconSize) || 32;
    this.createRangeInput('Icon Grootte', currentIconSize, 16, 64, 4, (val) => {
        if (travelMap) {
            travelMap.iconSize = parseInt(val);
            // Just update the size, no need to reset/restart
            console.log('[Properties] Icon size updated to:', val);
        }
    });
    
    // Animatie snelheid
    const currentSpeed = (travelMap && travelMap.animationSpeed) || 1;
    const speedLabels = { '0.5': 'Langzaam', '1': 'Normaal', '1.5': 'Snel', '2': 'Zeer snel' };
    this.createSelectInput('Animatie Snelheid', currentSpeed.toString(), [
        { value: '0.5', label: 'Langzaam (0.5x)' },
        { value: '1', label: 'Normaal (1x)' },
        { value: '1.5', label: 'Snel (1.5x)' },
        { value: '2', label: 'Zeer snel (2x)' }
    ], (val) => {
        if (travelMap) {
            travelMap.animationSpeed = parseFloat(val);
        }
    });
    
    // Kaart stijl
    const currentStyle = (travelMap && travelMap.options.style) || 'mapbox://styles/mapbox/light-v11';
    const styleMap = {
        'mapbox://styles/mapbox/streets-v12': 'Streets',
        'mapbox://styles/mapbox/light-v11': 'Light',
        'mapbox://styles/mapbox/dark-v11': 'Dark',
        'mapbox://styles/mapbox/satellite-v9': 'Satelliet',
        'mapbox://styles/mapbox/outdoors-v12': 'Outdoor'
    };
    this.createSelectInput('Kaart Stijl', currentStyle, 
        Object.entries(styleMap).map(([value, label]) => ({ value, label })),
        (val) => {
            if (travelMap && travelMap.map) {
                travelMap.map.setStyle(val);
            }
        }
    );
    
    // Separator
    const separator1 = document.createElement('div');
    separator1.style.cssText = 'height: 1px; background: #e5e7eb; margin: 20px 0;';
    this.panel.appendChild(separator1);
    
    // Routes heading
    const routesHeading = document.createElement('h4');
    routesHeading.textContent = 'Routes';
    routesHeading.style.cssText = 'margin: 16px 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;';
    this.panel.appendChild(routesHeading);
    
    // Routes lijst
    const routesList = document.createElement('div');
    routesList.style.cssText = 'margin-bottom: 16px;';
    
    // Define updateMap first so it can be called from event listeners
    const updateMap = () => {
        if (travelMap) {
            travelMap.destroy();
        }
        
        const mapEl = component.querySelector('.animated-map');
        if (mapEl && typeof AnimatedTravelMap !== 'undefined') {
            const newMap = new AnimatedTravelMap(mapEl, {
                routes: routes,
                autoplay: false,
                style: currentStyle,
                iconSize: currentIconSize,
                animationSpeed: currentSpeed
            });
            component._travelMap = newMap;
            component._routes = routes;
        }
    };
    
    const renderRoutes = () => {
        routesList.innerHTML = '';
        
        routes.forEach((route, index) => {
            const routeItem = document.createElement('div');
            routeItem.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 8px;';
            
            const header = document.createElement('div');
            header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
            header.innerHTML = `
                <strong style="color: #374151;">Route ${index + 1}</strong>
                <button class="delete-route-btn" data-index="${index}" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            routeItem.appendChild(header);
            
            // Van
            const fromGroup = document.createElement('div');
            fromGroup.style.marginBottom = '8px';
            fromGroup.innerHTML = `<label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Van:</label>`;
            const fromInput = document.createElement('input');
            fromInput.type = 'text';
            fromInput.value = route.from.name;
            fromInput.style.cssText = 'width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;';
            fromInput.addEventListener('change', (e) => {
                route.from.name = e.target.value;
                // Update map automatically
                updateMap();
            });
            fromGroup.appendChild(fromInput);
            routeItem.appendChild(fromGroup);
            
            // Naar
            const toGroup = document.createElement('div');
            toGroup.style.marginBottom = '8px';
            toGroup.innerHTML = `<label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Naar:</label>`;
            const toInput = document.createElement('input');
            toInput.type = 'text';
            toInput.value = route.to.name;
            toInput.style.cssText = 'width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;';
            toInput.addEventListener('change', (e) => {
                route.to.name = e.target.value;
                // Update map automatically
                updateMap();
            });
            toGroup.appendChild(toInput);
            routeItem.appendChild(toGroup);
            
            // Transport type
            const transportGroup = document.createElement('div');
            transportGroup.style.marginBottom = '8px';
            transportGroup.innerHTML = `<label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Transport:</label>`;
            const transportSelect = document.createElement('select');
            transportSelect.style.cssText = 'width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;';
            transportSelect.innerHTML = `
                <option value="flight" ${route.mode === 'flight' ? 'selected' : ''}>✈️ Vliegtuig</option>
                <option value="car" ${route.mode === 'car' ? 'selected' : ''}>🚗 Auto</option>
                <option value="train" ${route.mode === 'train' ? 'selected' : ''}>🚂 Trein</option>
                <option value="boat" ${route.mode === 'boat' ? 'selected' : ''}>⛴️ Boot</option>
                <option value="bus" ${route.mode === 'bus' ? 'selected' : ''}>🚌 Bus</option>
                <option value="bike" ${route.mode === 'bike' ? 'selected' : ''}>🚴 Fiets</option>
            `;
            transportSelect.addEventListener('change', (e) => {
                route.mode = e.target.value;
                // Update map automatically
                updateMap();
            });
            transportGroup.appendChild(transportSelect);
            routeItem.appendChild(transportGroup);
            
            // Duur
            const durationGroup = document.createElement('div');
            durationGroup.innerHTML = `<label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Duur (seconden):</label>`;
            const durationInput = document.createElement('input');
            durationInput.type = 'number';
            durationInput.value = (route.duration || 3000) / 1000;
            durationInput.min = '1';
            durationInput.max = '10';
            durationInput.step = '0.5';
            durationInput.style.cssText = 'width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;';
            durationInput.addEventListener('change', (e) => {
                route.duration = parseFloat(e.target.value) * 1000;
            });
            durationGroup.appendChild(durationInput);
            routeItem.appendChild(durationGroup);
            
            routesList.appendChild(routeItem);
        });
        
        // Delete buttons
        routesList.querySelectorAll('.delete-route-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                routes.splice(index, 1);
                renderRoutes();
                updateMap();
            });
        });
    };
    
    renderRoutes();
    this.panel.appendChild(routesList);
    
    // Voeg route toe knop
    const addRouteBtn = this.createButton('➕ Route Toevoegen', () => {
        const lastRoute = routes[routes.length - 1];
        const newRoute = {
            from: lastRoute ? { name: lastRoute.to.name, coords: lastRoute.to.coords } : { name: 'Amsterdam', coords: [4.9041, 52.3676] },
            to: { name: 'Nieuwe Bestemming', coords: [0, 0] },
            mode: 'flight',
            duration: 3000
        };
        routes.push(newRoute);
        renderRoutes();
    });
    addRouteBtn.style.background = '#10b981';
    addRouteBtn.style.borderColor = '#10b981';
    addRouteBtn.style.color = '#fff';
    addRouteBtn.style.marginBottom = '12px';
    this.panel.appendChild(addRouteBtn);
    
    // Update kaart knop
    const updateBtn = this.createButton('🔄 Kaart Bijwerken', () => {
        updateMap();
    });
    updateBtn.style.background = '#667eea';
    updateBtn.style.borderColor = '#667eea';
    updateBtn.style.color = '#fff';
    this.panel.appendChild(updateBtn);
    
    // Separator
    const separator2 = document.createElement('div');
    separator2.style.cssText = 'height: 1px; background: #e5e7eb; margin: 20px 0;';
    this.panel.appendChild(separator2);
};

// Hero Travel Search Properties
PropertiesPanel.prototype.createHeroTravelSearchProperties = function(component) {
    const title = component.querySelector('h1');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    const subtitle = component.querySelector('p');
    if (subtitle) {
        this.createTextInput('Subtitel', subtitle.textContent, (val) => {
            subtitle.textContent = val;
        });
    }
    
    const badge = component.querySelector('div[contenteditable="true"]');
    if (badge) {
        this.createTextInput('Badge Tekst', badge.textContent, (val) => {
            badge.textContent = val;
        });
    }
    
    // Background image selector
    const bgBtn = this.createButton('🖼️ Achtergrond Afbeelding', async () => {
        if (!window.MediaPicker) {
            alert('Media Picker niet beschikbaar');
            return;
        }
        
        const res = await window.MediaPicker.openImage({ defaultTab: 'unsplash' });
        if (res && res.url) {
            const bgImg = component.querySelector('.hero-bg img');
            if (bgImg) {
                bgImg.src = res.url;
            }
        }
    });
    bgBtn.style.background = '#0284c7';
    bgBtn.style.borderColor = '#0284c7';
    bgBtn.style.color = '#fff';
    bgBtn.style.marginTop = '1rem';
    this.panel.appendChild(bgBtn);
    
    // Info box
    const info = document.createElement('div');
    info.style.cssText = 'padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; margin: 12px 0; font-size: 13px; color: #1e40af;';
    info.innerHTML = '<strong>Zoek & Boek Functionaliteit:</strong><br>Deze hero zoekt automatisch in de "Reizen Overzicht" component op dezelfde pagina. Voeg een Travel Overview component toe om de zoekresultaten te tonen.';
    this.panel.appendChild(info);
    
    // Popular destinations editor
    const destLabel = document.createElement('label');
    destLabel.textContent = 'Populaire Bestemmingen';
    destLabel.style.cssText = 'display: block; font-weight: 600; margin: 16px 0 8px 0; color: #374151;';
    this.panel.appendChild(destLabel);
    
    const destInfo = document.createElement('div');
    destInfo.style.cssText = 'padding: 8px; background: #f3f4f6; border-radius: 6px; margin-bottom: 8px; font-size: 12px; color: #6b7280;';
    destInfo.textContent = 'Huidige: Thailand, Spanje, Italië, Griekenland, Frankrijk';
    this.panel.appendChild(destInfo);
    
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

// Travel Filter Bar Properties
PropertiesPanel.prototype.createTravelFilterBarProperties = function(component) {
    const title = component.querySelector('h3');
    if (title) {
        this.createTextInput('Titel', title.textContent, (val) => {
            title.textContent = val;
        });
    }
    
    // Filter Management
    const filterSection = document.createElement('div');
    filterSection.style.marginBottom = '20px';
    
    const filterTitle = document.createElement('h5');
    filterTitle.textContent = '🏷️ Filters Beheren';
    filterTitle.style.marginBottom = '12px';
    filterTitle.style.fontSize = '14px';
    filterTitle.style.fontWeight = '600';
    filterSection.appendChild(filterTitle);
    
    // Current filters list
    const filtersList = document.createElement('div');
    filtersList.style.marginBottom = '12px';
    
    const updateFiltersList = () => {
        filtersList.innerHTML = '';
        const filterBtns = component.querySelectorAll('.travel-filter-btn');
        
        filterBtns.forEach((btn, idx) => {
            const filterRow = document.createElement('div');
            filterRow.style.display = 'flex';
            filterRow.style.alignItems = 'center';
            filterRow.style.gap = '8px';
            filterRow.style.padding = '8px';
            filterRow.style.background = '#f9fafb';
            filterRow.style.borderRadius = '6px';
            filterRow.style.marginBottom = '8px';
            
            const label = document.createElement('span');
            label.textContent = btn.textContent;
            label.style.flex = '1';
            label.style.fontSize = '13px';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.style.background = '#ef4444';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.padding = '6px 10px';
            deleteBtn.style.borderRadius = '4px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = () => {
                btn.remove();
                updateFiltersList();
            };
            
            filterRow.appendChild(label);
            if (btn.textContent !== 'Alle') { // Don't allow deleting "Alle"
                filterRow.appendChild(deleteBtn);
            }
            filtersList.appendChild(filterRow);
        });
    };
    
    updateFiltersList();
    filterSection.appendChild(filtersList);
    
    // Add filter input
    const addFilterDiv = document.createElement('div');
    addFilterDiv.style.display = 'flex';
    addFilterDiv.style.gap = '8px';
    addFilterDiv.style.marginBottom = '12px';
    
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Nieuwe filter...';
    filterInput.style.flex = '1';
    filterInput.style.padding = '8px';
    filterInput.style.border = '1px solid #d1d5db';
    filterInput.style.borderRadius = '6px';
    filterInput.style.fontSize = '13px';
    
    const addBtn = this.createButton('➕ Toevoegen', () => {
        const filterName = filterInput.value.trim();
        if (!filterName) return;
        
        // Add new filter button to component
        const filterButtons = component.querySelector('.filter-buttons');
        const newBtn = document.createElement('button');
        newBtn.className = 'travel-filter-btn';
        newBtn.dataset.filter = filterName.toLowerCase();
        newBtn.textContent = filterName;
        newBtn.style.cssText = `
            padding: 12px 24px;
            border: 2px solid #e5e7eb;
            background: white;
            color: #374151;
            border-radius: 24px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
        `;
        
        // Add click handler
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const allBtns = component.querySelectorAll('.travel-filter-btn');
            allBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'white';
                b.style.color = '#374151';
                b.style.borderColor = '#e5e7eb';
            });
            newBtn.classList.add('active');
            newBtn.style.background = '#667eea';
            newBtn.style.color = 'white';
            newBtn.style.borderColor = '#667eea';
            
            document.dispatchEvent(new CustomEvent('travelFilterChange', {
                bubbles: true,
                detail: { filter: filterName.toLowerCase() }
            }));
        });
        
        filterButtons.appendChild(newBtn);
        filterInput.value = '';
        updateFiltersList();
    });
    
    addBtn.style.background = '#667eea';
    addBtn.style.borderColor = '#667eea';
    addBtn.style.color = 'white';
    addBtn.style.padding = '8px 16px';
    addBtn.style.fontSize = '13px';
    
    addFilterDiv.appendChild(filterInput);
    addFilterDiv.appendChild(addBtn);
    filterSection.appendChild(addFilterDiv);
    
    const info = document.createElement('div');
    info.style.fontSize = '12px';
    info.style.color = '#6b7280';
    info.style.padding = '8px';
    info.style.background = '#f9fafb';
    info.style.borderRadius = '6px';
    info.textContent = 'Filters worden automatisch gekoppeld aan Travel Overview component';
    filterSection.appendChild(info);
    
    this.panel.appendChild(filterSection);
    
    // Delete button
    const del = this.createButton('Blok verwijderen', () => {
        if (confirm('Weet je zeker dat je dit blok wilt verwijderen?')) {
            component.remove();
            this.clearProperties();
        }
    });
    del.style.background = '#dc2626';
    del.style.borderColor = '#dc2626';
    del.style.color = '#fff';
    del.style.marginTop = '1rem';
    this.panel.appendChild(del);
};

PropertiesPanel.prototype.createRoadbookProperties = function(component) {
    this.createHeader('Roadbook Instellingen');
    
    // Hero Media Selector
    this.createSubheader('Hero Achtergrond');
    const mediaBtn = this.createButton('🎬 Media Kiezen (Foto/Video)', async () => {
        if (!window.MediaPicker) {
            alert('Media Picker niet beschikbaar');
            return;
        }
        
        const res = await window.MediaPicker.open({ 
            allowVideo: true,
            defaultTab: 'pexels' 
        });
        if (!res) return;
        
        const hero = component.querySelector('.roadbook-hero');
        if (!hero) return;
        
        // Remove existing media
        const existingVideo = hero.querySelector('video');
        const existingSlider = hero.querySelector('.hero-slider');
        if (existingVideo) existingVideo.remove();
        if (existingSlider) existingSlider.remove();
        
        // Add new media
        if (res.type === 'video' && res.videoUrl) {
            // Add video
            const video = document.createElement('video');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;';
            video.innerHTML = `<source src="${res.videoUrl}" type="video/mp4">`;
            hero.insertBefore(video, hero.firstChild);
            
            // Store in dataset
            component.dataset.heroVideo = res.videoUrl;
            delete component.dataset.heroImages;
        } else if (res.url) {
            // Add single image (could extend to slider later)
            const img = document.createElement('div');
            img.className = 'hero-slider';
            img.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(' + res.url + '); background-size: cover; background-position: center; z-index: 0;';
            hero.insertBefore(img, hero.firstChild);
            
            // Store in dataset
            component.dataset.heroImages = res.url;
            delete component.dataset.heroVideo;
        }
    });
    mediaBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    mediaBtn.style.color = '#fff';
    mediaBtn.style.fontWeight = '700';
    this.panel.appendChild(mediaBtn);
    
    // Countdown Settings
    this.createSubheader('Countdown Instellingen');
    
    const countdownEnabled = component.dataset.countdownEnabled !== 'false';
    const countdownToggle = this.createToggle('Countdown Tonen', countdownEnabled, (enabled) => {
        component.dataset.countdownEnabled = enabled;
        const countdown = component.querySelector('.roadbook-countdown');
        if (countdown) {
            countdown.style.display = enabled ? 'flex' : 'none';
        }
    });
    this.panel.appendChild(countdownToggle);
    
    const countdownStyle = component.dataset.countdownStyle || 'hero';
    const styleSelect = this.createSelect('Countdown Stijl', [
        { value: 'hero', label: 'Hero (Groot, in header)' },
        { value: 'compact', label: 'Compact (Klein, onder header)' }
    ], countdownStyle, (value) => {
        component.dataset.countdownStyle = value;
        const countdown = component.querySelector('.roadbook-countdown');
        if (!countdown) return;
        
        if (value === 'compact') {
            countdown.style.cssText = `
                display: flex;
                gap: 16px;
                justify-content: center;
                padding: 16px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin: -30px auto 30px;
                max-width: 600px;
                position: relative;
                z-index: 10;
            `;
            countdown.querySelectorAll('.countdown-item').forEach(item => {
                item.style.cssText = 'text-align: center;';
            });
            countdown.querySelectorAll('.countdown-value').forEach(val => {
                val.style.fontSize = '24px';
            });
            countdown.querySelectorAll('.countdown-label').forEach(label => {
                label.style.fontSize = '12px';
            });
        } else {
            countdown.style.cssText = `
                display: flex;
                gap: 32px;
                justify-content: center;
                padding: 32px;
            `;
            countdown.querySelectorAll('.countdown-item').forEach(item => {
                item.style.cssText = 'text-align: center;';
            });
            countdown.querySelectorAll('.countdown-value').forEach(val => {
                val.style.fontSize = '48px';
            });
            countdown.querySelectorAll('.countdown-label').forEach(label => {
                label.style.fontSize = '14px';
            });
        }
    });
    this.panel.appendChild(styleSelect);
    
    // Standard properties
    this.createStandardProperties(component);
};

// Initialize properties panel
window.PropertiesPanel = new PropertiesPanel();
