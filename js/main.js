// Main JavaScript file voor Website Builder
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
        this.init();
    }

    setupPublishButton() {
        const btn = document.getElementById('publishBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.maxWidth = '640px';
            modalContent.innerHTML = `
                <div class="modal-header">
                    <h3><i class="fas fa-cloud-upload-alt"></i> Publish naar GitHub</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
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
                    const pubStatus = dbBox.querySelector('#pubStatus');
                    pubBtn && (pubBtn.onclick = async () => {
                        try {
                            pubStatus.textContent = 'Bezig met publiceren…';
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
                            await window.BuilderPublishAPI.publishPage(page.id, htmlString);
                            pubStatus.textContent = '';
                            this.showNotification('✅ Gepubliceerd naar Bolt Database', 'success');
                            // Optioneel: modal sluiten na succes
                            // closeModal();
                        } catch (err) {
                            console.error(err);
                            pubStatus.textContent = '';
                            this.showErrorMessage('Publiceren mislukt (zie console)');
                        }
                    });
                }
            } catch (e) { /* stil */ }

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

    setup() {
        try {
            this.setupDeviceSelector();
            this.setupKeyboardShortcuts();
            this.setupAutoSave();
            this.setupWelcomeMessage();
            this.setupPublishButton();
            this.setupPagesButton();
            this.setupLayoutButton();
            this.setupFileSaveLoad();
            this.loadSavedProject();
            this.ensurePagesInitialized();
            
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

        content.querySelector('#pmNew').onclick = () => {
            const id = this.generateId('page');
            const newPage = { id, name: `Pagina ${this.pages.length+1}`, slug: `pagina-${this.pages.length+1}`, html: this.blankCanvasHtml() };
            this.pages.push(newPage);
            selectedId = id;
            this.persistPagesToLocalStorage();
            renderList();
            fillDetails();
        };

        content.querySelector('#pmRename').onclick = () => {
            const p = this.pages.find(x => x.id === selectedId);
            if (!p) return;
            const nv = prompt('Nieuwe paginanaam:', p.name) || p.name;
            p.name = nv.trim() || p.name;
            this.persistPagesToLocalStorage();
            renderList();
            fillDetails();
        };

        content.querySelector('#pmDelete').onclick = async () => {
            if (this.pages.length <= 1) { this.showNotification('Minimaal 1 pagina vereist', 'info'); return; }
            if (!confirm('Deze pagina verwijderen?')) return;
            const idx = this.pages.findIndex(x => x.id === selectedId);
            if (idx >= 0) {
                const removed = this.pages.splice(idx, 1)[0];
                if (removed.id === this.currentPageId) {
                    this.currentPageId = this.pages[0].id;
                    await this.switchToPage(this.currentPageId);
                }
                selectedId = this.pages[0].id;
                this.persistPagesToLocalStorage();
                renderList();
                fillDetails();
            }
        };
    }

    async switchToPage(pageId) {
        if (pageId === this.currentPageId) return;
        // Save current canvas to current page
        this.captureCurrentCanvasToPage();
        // Load target page
        const target = this.pages.find(p => p.id === pageId);
        if (!target) return;
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = target.html;
        this.currentPageId = pageId;
        this.reattachEventListeners();
        this.persistPagesToLocalStorage();
        this.showNotification(`📄 Gewisseld naar: ${target.name}`, 'success');
    }

    captureCurrentCanvasToPage() {
        const canvas = document.getElementById('canvas');
        const current = this.pages.find(p => p.id === this.currentPageId);
        if (current) current.html = canvas.innerHTML;
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
            this.saveProject(true); // Silent save
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
            localStorage.setItem('wb_project', JSON.stringify(projectData));
            
            if (!silent) {
                console.log('💾 Project opgeslagen:', projectData);
            }
            
            // Auto-publish on save (simple for users): throttle to avoid spam on autosave
            this.scheduleAutoPublish();

            return true;
        } catch (error) {
            console.error('❌ Fout bij opslaan project:', error);
            if (!silent) {
                this.showNotification('❌ Fout bij opslaan project', 'error');
            }
            return false;
        }
    }

    scheduleAutoPublish() {
        try {
            const brand_id = window.CURRENT_BRAND_ID;
            if (!brand_id || !window.BuilderPublishAPI) return; // no-op if not configured
            const now = Date.now();
            const since = now - (this._lastAutoPublishAt || 0);
            const delay = since > 2500 ? 300 : 2000 - since; // quick after manual save, slower after recent
            clearTimeout(this._autoPublishTimer);
            this._autoPublishTimer = setTimeout(() => this.autoPublishCurrentPage().catch(()=>{}), Math.max(300, delay));
        } catch {}
    }

    async autoPublishCurrentPage() {
        const brand_id = window.CURRENT_BRAND_ID;
        if (!brand_id || !window.BuilderPublishAPI) return;
        // Build content JSON and HTML (with layout)
        const contentJson = (typeof window.exportBuilderAsJSON === 'function') ? window.exportBuilderAsJSON() : null;
        const htmlString = (typeof window.exportBuilderAsHTML === 'function') ? window.exportBuilderAsHTML(contentJson || undefined) : null;
        if (!contentJson || !htmlString) return;
        try {
            const page = await window.BuilderPublishAPI.saveDraft({
                brand_id,
                title: contentJson.title,
                slug: contentJson.slug,
                content_json: contentJson
            });
            await window.BuilderPublishAPI.publishPage(page.id, htmlString);
            this._lastAutoPublishAt = Date.now();
            this.showNotification('✅ Wijzigingen gepubliceerd', 'success');
        } catch (err) {
            console.warn('Auto-publish failed', err);
            // Keep silent to avoid noisy UX; consider a single toast if persistent
        }
    }

    loadSavedProject() {
        try {
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

        if (saveBtn) {
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
