/**
 * Template Editor - Elementor Style
 * Allows inline editing of template pages with text, images, and AI generation
 */

class TemplateEditor {
    constructor() {
        this.currentTemplate = null;
        this.currentPage = null;
        this.pages = [];
        this.selectedElement = null;
        this.supabase = null;
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.templateName = urlParams.get('template') || 'tripix';  // Changed default from 'gotur' to 'tripix'
        this.brandId = urlParams.get('brand_id');
        this.token = urlParams.get('token');
        this.apiKey = urlParams.get('apikey');
        this.apiUrl = urlParams.get('api') || 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1';
        
        console.log('[TemplateEditor] Template name from URL:', this.templateName);
        console.log('[TemplateEditor] URL params:', {
            template: urlParams.get('template'),
            brand_id: urlParams.get('brand_id')
        });
        
        this.init();
    }
    
    async init() {
        try {
            console.log('[TemplateEditor] Initializing...');
            console.log('[TemplateEditor] Brand ID:', this.brandId);
            console.log('[TemplateEditor] Token:', this.token ? 'Present' : 'Missing');
            console.log('[TemplateEditor] API Key:', this.apiKey ? 'Present' : 'Missing');
            
            // Security check: Require brand_id and token for editor access
            if (!this.brandId || !this.token) {
                document.getElementById('loadingOverlay').innerHTML = `
                    <div style="text-align:center;">
                        <div style="font-size:64px;margin-bottom:20px;">🔒</div>
                        <h2 style="color:#333;margin-bottom:16px;">Toegang Geweigerd</h2>
                        <p style="color:#666;margin-bottom:24px;">Deze editor is alleen toegankelijk via een geldige deeplink vanuit BOLT.</p>
                        <p style="color:#999;font-size:14px;">Ontbrekende parameters: ${!this.brandId ? 'brand_id' : ''} ${!this.token ? 'token' : ''}</p>
                        <button onclick="window.close()" style="margin-top:20px;padding:12px 24px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">
                            Sluiten
                        </button>
                    </div>
                `;
                return;
            }
            
            // Initialize Supabase if we have credentials
            if (this.apiKey) {
                const supabaseUrl = this.apiUrl.replace('/functions/v1', '');
                this.supabase = supabase.createClient(supabaseUrl, this.apiKey);
            }
            
            // Extract user ID from JWT token
            if (this.token) {
                try {
                    const payload = JSON.parse(atob(this.token.split('.')[1]));
                    this.userId = payload.sub;
                    console.log('[TemplateEditor] User ID:', this.userId);
                } catch (e) {
                    console.error('[TemplateEditor] Failed to parse token:', e);
                }
            }
            
            // Set template name in header
            document.getElementById('templateName').textContent = 
                this.templateName.charAt(0).toUpperCase() + this.templateName.slice(1) + ' Template Editor';
            
            // Load template pages
            await this.loadTemplatePages();
            
            // Setup device selector
            this.setupDeviceSelector();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup auto-save (every 2 minutes)
            this.setupAutoSave();
            
            // Hide loading overlay
            document.getElementById('loadingOverlay').style.display = 'none';
        } catch (error) {
            console.error('[TemplateEditor] Initialization error:', error);
            document.getElementById('loadingOverlay').innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:64px;margin-bottom:20px;">❌</div>
                    <h2 style="color:#333;margin-bottom:16px;">Fout bij Laden</h2>
                    <p style="color:#666;margin-bottom:24px;">Er is een fout opgetreden bij het laden van de editor.</p>
                    <p style="color:#999;font-size:12px;font-family:monospace;">${error.message}</p>
                    <button onclick="window.location.reload()" style="margin-top:20px;padding:12px 24px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">
                        Opnieuw Proberen
                    </button>
                </div>
            `;
        }
    }
    
    loadTemplateDefaults() {
        // Define default settings for each template based on their SCSS files
        const templateDefaults = {
            'tripix': {
                // Colors from _variable.scss
                primaryColor: '#f7921f',      // Orange (--theme-color)
                secondaryColor: '#223740',    // Dark blue (--second-theme-color)
                accentColor: '#465b2d',       // Green (--third-theme-color)
                textColor: '#535b5f',         // Gray (--body-color)
                titleColor: '#141414',        // Black (--title-color)
                footerBgColor: '#223740',     // Dark blue
                
                // Typography from _reset.scss
                primaryFont: 'Rubik',         // --body-font
                titleFont: 'Abril Fatface',   // --title-font
                h1Size: '90px',
                h2Size: '45px',
                h3Size: '40px',
                h4Size: '36px',
                h5Size: '24px',
                h6Size: '20px',
                bodySize: '14px',
                
                // Spacing from _variable.scss
                sectionSpace: '120px',
                containerWidth: '1300px',
                
                // Logo & Branding
                logoMaxWidth: '200px',
                logoPosition: 'left',
                faviconUrl: 'assets/img/favicon.png'
            },
            'gotur': {
                // Colors from gotur.css
                primaryColor: '#F7921E',      // Orange (--gotur-primary)
                secondaryColor: '#63AB45',    // Green (--gotur-base)
                accentColor: '#1D231F',       // Black (--gotur-black)
                textColor: '#595959',         // Gray (--gotur-text)
                titleColor: '#1D231F',        // Black (--gotur-black)
                footerBgColor: '#1D231F',     // Black
                
                // Typography
                primaryFont: 'Plus Jakarta Sans',  // --gotur-font
                titleFont: 'Plus Jakarta Sans',    // --gotur-heading-font
                secondaryFont: 'Just Another Hand', // --gotur-font2
                h1Size: '80px',
                h2Size: '48px',
                h3Size: '36px',
                h4Size: '28px',
                h5Size: '22px',
                h6Size: '18px',
                bodySize: '16px',
                
                // Spacing
                sectionSpace: '100px',
                containerWidth: '1200px',
                
                // Logo & Branding
                logoMaxWidth: '180px',
                logoPosition: 'left',
                faviconUrl: 'assets/images/favicons/favicon.ico'
            }
        };
        
        const defaults = templateDefaults[this.templateName] || templateDefaults['tripix'];
        
        // Store template defaults for reference
        this.templateDefaults = defaults;
        
        // Try to set color values in settings panel (if elements exist)
        try {
            const primaryColorEl = document.getElementById('primaryColor');
            const secondaryColorEl = document.getElementById('secondaryColor');
            const textColorEl = document.getElementById('textColor');
            const footerBgColorEl = document.getElementById('footerBgColor');
            const primaryFontEl = document.getElementById('primaryFont');
            
            if (primaryColorEl) primaryColorEl.value = defaults.primaryColor;
            if (secondaryColorEl) secondaryColorEl.value = defaults.secondaryColor;
            if (textColorEl) textColorEl.value = defaults.textColor;
            if (footerBgColorEl) footerBgColorEl.value = defaults.footerBgColor;
            if (primaryFontEl) primaryFontEl.value = defaults.primaryFont;
        } catch (error) {
            console.log('[TemplateEditor] Settings panel not ready yet, defaults stored for later');
        }
        
        console.log('[TemplateEditor] Loaded template defaults:', defaults);
    }
    
    async loadTemplatePages() {
        console.log('[TemplateEditor] Loading template pages...');
        
        // Load template default colors
        this.loadTemplateDefaults();
        
        // Try to load saved draft from Supabase first
        let loadedDraft = null;
        if (this.supabase && this.brandId) {
            try {
                console.log('[TemplateEditor] Checking for saved draft...');
                const { data, error } = await this.supabase
                    .from('template_drafts')
                    .select('*')
                    .eq('brand_id', this.brandId)
                    .eq('template', this.templateName)
                    .single();
                
                if (data && !error) {
                    console.log('[TemplateEditor] Found saved draft!');
                    loadedDraft = data;
                }
            } catch (error) {
                console.log('[TemplateEditor] No draft found, loading fresh template');
            }
        }
        
        // Define pages for each template
        const templatePages = {
            'tripix': [
                { name: 'Home', path: 'index.html', icon: 'home', category: 'basis' },
                { name: 'About', path: 'about.html', icon: 'info-circle', category: 'basis' },
                { name: 'Trips', path: 'trips.html', icon: 'plane', category: 'tours' },
                { name: 'Destinations', path: 'destinations.html', icon: 'map', category: 'tours' },
                { name: 'Blog', path: 'blog.html', icon: 'newspaper', category: 'blog' },
                { name: 'Contact', path: 'contact.html', icon: 'phone', category: 'basis' }
            ],
            'gotur': [
                { name: 'Home', path: 'index-2.html', icon: 'home', category: 'basis' },
                { name: 'About', path: 'about.html', icon: 'info-circle', category: 'basis' },
                { name: 'Tours', path: 'tour-listing-1.html', icon: 'map-marked-alt', category: 'tours' },
                { name: 'Tour Detail', path: 'tour-listing-details-1.html', icon: 'map-marker-alt', category: 'tours' },
                { name: 'Destinations', path: 'destination-one.html', icon: 'globe', category: 'tours' },
                { name: 'Blog', path: 'blog-grid.html', icon: 'newspaper', category: 'blog' },
                { name: 'Contact', path: 'contact.html', icon: 'envelope', category: 'basis' }
            ]
        };
        
        this.pages = templatePages[this.templateName] || templatePages['tripix'];
        
        // If we have a draft, merge it with the pages
        if (loadedDraft && loadedDraft.pages) {
            console.log('[TemplateEditor] Applying saved draft to pages...');
            this.savedDraft = loadedDraft;
        }
        
        // Render pages list
        this.renderPagesList();
        
        // Load first page (or the page from draft)
        if (this.pages.length > 0) {
            const pageToLoad = loadedDraft?.current_page 
                ? this.pages.find(p => p.path === loadedDraft.current_page) || this.pages[0]
                : this.pages[0];
            await this.loadPage(pageToLoad);
        }
    }
    
    renderPagesList() {
        const pagesList = document.getElementById('pagesList');
        pagesList.innerHTML = '';
        
        // Add "New Page" button
        const addPageBtn = document.createElement('button');
        addPageBtn.className = 'add-page-btn';
        addPageBtn.style.cssText = 'width:100%;padding:12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;';
        addPageBtn.innerHTML = '<i class="fas fa-plus"></i> Nieuwe Pagina';
        addPageBtn.onmouseover = () => addPageBtn.style.transform = 'translateY(-2px)';
        addPageBtn.onmouseout = () => addPageBtn.style.transform = 'translateY(0)';
        addPageBtn.onclick = () => this.openComponentLibrary();
        pagesList.appendChild(addPageBtn);
        
        this.pages.forEach((page, index) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            if (index === 0) pageItem.classList.add('active');
            
            pageItem.innerHTML = `
                <div class="page-info">
                    <div class="page-name">
                        <i class="fas fa-${page.icon}"></i> ${page.name}
                    </div>
                    <div class="page-path">${page.path}</div>
                </div>
                <div class="page-actions">
                    <button class="page-action-btn" onclick="templateEditor.editPageSettings(${index})" title="Instellingen">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="page-action-btn" onclick="templateEditor.deletePage(${index})" title="Verwijderen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            pageItem.addEventListener('click', (e) => {
                if (!e.target.closest('.page-actions')) {
                    this.loadPage(page);
                }
            });
            
            pagesList.appendChild(pageItem);
        });
    }
    
    async loadPage(page) {
        console.log('[TemplateEditor] Loading page:', page.name);
        
        this.currentPage = page;
        
        // Update current page name
        document.getElementById('currentPageName').textContent = page.name;
        
        // Update active state in pages list
        document.querySelectorAll('.page-item').forEach((item, index) => {
            item.classList.toggle('active', this.pages[index] === page);
        });
        
        // Load fresh page from template first
        let baseUrl;
        if (this.templateName === 'gotur') {
            baseUrl = 'templates/gotur/gotur-html-main';
        } else if (this.templateName === 'tripix') {
            baseUrl = 'templates/tripix-html';
        } else {
            baseUrl = `templates/${this.templateName}`;
        }
        const pageUrl = `${baseUrl}/${page.path}`;
        
        const iframe = document.getElementById('templateFrame');
        iframe.src = pageUrl;
        
        // Wait for iframe to load
        iframe.onload = () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Check if we have a saved draft for this page
            const savedPageData = this.savedDraft?.pages?.find(p => p.path === page.path);
            
            if (savedPageData && savedPageData.html) {
                console.log('[TemplateEditor] Loading saved draft for page:', page.name);
                console.log('[TemplateEditor] Saved HTML length:', savedPageData.html.length);
                
                // WORDPRESS-STYLE: Replace the ENTIRE document with saved HTML
                // This preserves ALL changes: text, images, colors, layout, everything!
                const parser = new DOMParser();
                const savedDoc = parser.parseFromString(savedPageData.html, 'text/html');
                
                // Replace the entire document content
                iframeDoc.open();
                iframeDoc.write(savedPageData.html);
                iframeDoc.close();
                
                console.log('[TemplateEditor] Complete HTML loaded ✓');
                
                // Wait for document to be ready, then setup editing
                setTimeout(() => {
                    const newIframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // Extract colors from brand styles and update settings panel
                    const brandStyles = newIframeDoc.getElementById('wb-brand-styles');
                    if (brandStyles) {
                        this.extractColorsFromBrandStyles(brandStyles.textContent);
                        console.log('[TemplateEditor] Brand styles extracted ✓');
                    }
                    
                    // Setup editor UI
                    this.setupIframeEditing();
                    console.log('[TemplateEditor] Draft loaded successfully ✓');
                }, 100);
                
                return; // Don't call setupIframeEditing yet, we'll do it in setTimeout
            }
            
            // No saved draft, just setup editing on fresh template
            this.setupIframeEditing();
        };
    }
    
    storeOriginalCarouselHTML(iframeDoc) {
        // Store original carousel HTML before Owl Carousel modifies it
        if (!this.originalCarouselHTML) {
            this.originalCarouselHTML = new Map();
        }
        
        const carousels = iframeDoc.querySelectorAll('.owl-carousel');
        carousels.forEach((carousel, index) => {
            // Only store if not already initialized
            if (!carousel.classList.contains('owl-loaded')) {
                this.originalCarouselHTML.set(index, carousel.innerHTML);
                console.log(`[TemplateEditor] Stored original HTML for carousel ${index}`);
            }
        });
    }
    
    setupIframeEditing() {
        console.log('[TemplateEditor] Setting up iframe editing...');
        
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Store original carousel HTML before Owl Carousel initializes
        this.storeOriginalCarouselHTML(iframeDoc);
        
        // Inject editing styles
        const style = iframeDoc.createElement('style');
        style.textContent = `
            /* Editor Overlay Mode - REMOVED dark overlay */
            body.wb-editing-mode::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: transparent;
                z-index: 9998;
                pointer-events: none;
            }
            
            /* Fix destination card image heights */
            .destination-box .destination-thumb {
                max-height: 350px;
                overflow: hidden;
            }
            
            .destination-box .destination-thumb img {
                width: 100%;
                height: 350px;
                object-fit: cover;
            }
            
            /* Ensure destination content is visible */
            .destination-box .destination-content {
                position: relative;
                z-index: 10;
                background: rgba(0, 0, 0, 0.8);
                padding: 20px;
            }
            
            .destination-box .destination-content h4,
            .destination-box .destination-content span {
                position: relative;
                z-index: 11;
            }
            
            /* Fix tour package card image heights - make them all equal */
            .tour-package-card .tour-package-thumb,
            .package-style1 .package-thumb,
            .vs-tour-package .package-thumb,
            .package-card .package-thumb,
            .tour-card .tour-thumb,
            .tour-package .tour-package-thumb,
            .tour-package-box .tour-package-thumb {
                height: 280px !important;
                overflow: hidden;
            }
            
            .tour-package-card .tour-package-thumb img,
            .package-style1 .package-thumb img,
            .vs-tour-package .package-thumb img,
            .package-card .package-thumb img,
            .tour-card .tour-thumb img,
            .tour-package .tour-package-thumb img,
            .tour-package-box .tour-package-thumb img {
                width: 100%;
                height: 280px !important;
                object-fit: cover;
            }
            
            /* Fix service card image heights - make them all equal */
            .service-card .service-card__thumb,
            .service-card-two .service-card-two__thumb,
            .service-box .service-thumb {
                height: 200px;
                overflow: hidden;
            }
            
            .service-card .service-card__thumb img,
            .service-card-two .service-card-two__thumb img,
            .service-box .service-thumb img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            /* Fix gallery grid - 2x2 equal boxes */
            .gallery-grid,
            .gallery-layout1,
            .row.gallery-grid,
            section .row.gallery-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                grid-template-rows: 1fr 1fr !important;
                gap: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
            }
            
            .gallery-grid .col-lg-6,
            .gallery-grid .col-sm-6,
            .gallery-grid .col-md-6,
            .gallery-layout1 .col-lg-6,
            .gallery-layout1 .col-sm-6,
            .gallery-layout1 .col-md-6,
            .gallery-grid [class*="col-"],
            .gallery-layout1 [class*="col-"] {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 300px !important;
            }
            
            .gallery-grid .gallery-box,
            .gallery-layout1 .gallery-box {
                margin: 0 !important;
                height: 100% !important;
                position: relative !important;
                overflow: hidden !important;
            }
            
            .gallery-grid img,
            .gallery-layout1 img {
                margin: 0 !important;
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
            }
            
            .wb-editable {
                outline: 2px dashed transparent;
                transition: all 0.2s;
                cursor: pointer;
                position: relative;
            }
            
            /* Only show hover on TEXT elements - NOT on images or backgrounds */
            .wb-editable.wb-text:hover {
                outline: 2px dashed #667eea;
                background: rgba(102, 126, 234, 0.05);
                z-index: 9999;
            }
            
            /* NO hover effects on any image or background elements */
            .wb-editable.wb-image:hover,
            .wb-editable.wb-bg-image:hover,
            .wb-bg-edit-target:hover,
            .wb-bg-edit-target {
                outline: none !important;
                cursor: default !important;
            }
            
            /* Prevent hover background overlay only - not the actual background */
            .wb-editable.wb-image:hover::before,
            .wb-editable.wb-bg-image:hover::before,
            .wb-bg-edit-target:hover::before {
                display: none !important;
            }
            
            .wb-editable.wb-selected {
                outline: 3px solid #667eea;
                background: rgba(102, 126, 234, 0.1);
                z-index: 9999;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
            }
            
            .wb-edit-label {
                position: absolute;
                top: -24px;
                left: 0;
                background: #667eea;
                color: white;
                padding: 4px 8px;
                font-size: 11px;
                border-radius: 4px;
                font-weight: 600;
                z-index: 1000;
                pointer-events: none;
            }
            
            /* Keep header topbar always visible by forcing it outside GSAP control */
            .header-top-wrap {
                opacity: 1 !important;
                visibility: visible !important;
                transform: none !important;
                position: relative !important;
                z-index: 9999 !important;
            }
            
            /* Keep the sticky wrapper visible */
            .sticky-wrapper {
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .wb-quick-actions {
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 4px;
                z-index: 1001;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .wb-editable:hover .wb-quick-actions {
                opacity: 1;
            }
            
            .wb-quick-btn {
                background: #667eea;
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                transition: all 0.2s;
                pointer-events: auto;
            }
            
            .wb-quick-btn:hover {
                background: #5568d3;
                transform: scale(1.1);
            }
            
            .wb-add-section-btn {
                position: relative;
                width: 100%;
                padding: 20px;
                margin: 20px 0;
                border: 2px dashed #667eea;
                background: rgba(102, 126, 234, 0.05);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                color: #667eea;
                font-weight: 600;
                font-size: 16px;
            }
            
            .wb-add-section-btn:hover {
                background: rgba(102, 126, 234, 0.1);
                border-color: #5568d3;
                transform: translateY(-2px);
            }
            
            .wb-add-section-btn i {
                margin-right: 8px;
                font-size: 20px;
            }
        `;
        iframeDoc.head.appendChild(style);
        
        // Make text elements editable
        this.makeTextEditable(iframeDoc);
        
        // Make images editable
        this.makeImagesEditable(iframeDoc);
        
        // Add section insertion points
        this.addSectionInsertionPoints(iframeDoc);
        
        // Add click handler to deselect when clicking outside
        iframeDoc.addEventListener('click', (e) => {
            // If clicking on body or non-editable element, deselect
            if (e.target === iframeDoc.body || (!e.target.classList.contains('wb-editable') && !e.target.closest('.wb-editable'))) {
                this.deselectElement();
            }
        });
    }
    
    addSectionInsertionPoints(doc) {
        // First, remove ALL existing section buttons to prevent duplicates
        doc.querySelectorAll('.wb-add-section-btn').forEach(btn => btn.remove());
        
        // VERY selective - only add buttons to major content sections
        // Skip hero, header, footer, nav, and small sections
        const sections = doc.querySelectorAll('main section, .content-section, .tours-section, .blog-section');
        
        sections.forEach((section, index) => {
            // Skip if too small (less than 300px = not a major section)
            if (section.offsetHeight < 300) return;
            
            // Skip header, footer, navigation, hero sections
            if (section.closest('header, footer, nav, .hero, .main-slider')) return;
            if (section.classList.contains('top-one') || 
                section.classList.contains('main-header') ||
                section.classList.contains('main-slider-one') ||
                section.classList.contains('hero')) return;
            
            // Skip if already has a button after it (double check)
            if (section.nextElementSibling?.classList.contains('wb-add-section-btn')) return;
            
            // Add section controls container
            const sectionControls = doc.createElement('div');
            sectionControls.className = 'wb-section-controls';
            sectionControls.style.cssText = 'display:flex;gap:12px;justify-content:center;margin:20px auto;';
            
            // Add "Add Section" button
            const insertBtn = doc.createElement('button');
            insertBtn.className = 'wb-add-section-btn';
            insertBtn.innerHTML = '<i class="fas fa-plus"></i> Sectie Toevoegen';
            insertBtn.style.cssText = 'padding:12px 24px;background:#4CAF50;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
            
            insertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSectionLibrary(section);
            });
            
            // Add "Delete Section" button
            const deleteBtn = doc.createElement('button');
            deleteBtn.className = 'wb-delete-section-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Sectie Verwijderen';
            deleteBtn.style.cssText = 'padding:12px 24px;background:#f44336;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
            
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteSection(section);
            });
            
            sectionControls.appendChild(insertBtn);
            sectionControls.appendChild(deleteBtn);
            
            // Insert after section
            section.parentNode.insertBefore(sectionControls, section.nextSibling);
        });
    }
    
    makeTextEditable(doc) {
        // Find all text elements - headings, paragraphs, buttons, links, and ALL spans with text
        const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, .btn, label, input[type="text"], input[type="email"], textarea, select, div.price-off, div.discount';
        const textElements = doc.querySelectorAll(textSelectors);
        
        textElements.forEach(element => {
            // Skip if element is empty
            if (!element.textContent.trim()) return;
            
            // Skip if it contains ONLY images (no text)
            if (element.querySelector('img') && !element.textContent.trim()) return;
            
            // ALLOW topbar, contact info, buttons, and feature sections ALWAYS
            const isInTopbar = element.closest('.header-top-wrap, .contact-info, .social-share');
            const isButton = element.tagName === 'BUTTON' || element.classList.contains('btn') || element.classList.contains('vs-btn');
            const isFeatureSection = element.classList.contains('feature-expert') || element.closest('.vs-feature-style1');
            
            // Skip navigation menu items UNLESS it's in topbar, is a button, or is in feature section
            if (!isInTopbar && !isButton && !isFeatureSection) {
                if (element.closest('nav, .menu, script, style, .skip-edit, .top-one, .main-header, .header-wrapper')) return;
                if (element.closest('header')) return;
                if (element.tagName === 'HEADER' || element.tagName === 'NAV') return;
            }
            
            // Skip very short text (but allow buttons and topbar items)
            if (!isButton && !isInTopbar && element.textContent.trim().length < 2) return;
            
            element.classList.add('wb-editable', 'wb-text');
            
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectElement(element, 'text');
            });
        });
    }
    
    makeImagesEditable(doc) {
        console.log('[TemplateEditor] Making images editable...');
        
        // Find elements with data-bg-src attribute (Tripix style)
        const dataBgElements = doc.querySelectorAll('[data-bg-src], [style*="background-image"]');
        console.log('[TemplateEditor] Found', dataBgElements.length, 'background image elements');
        
        dataBgElements.forEach(bgEl => {
            // Skip if already has edit button
            if (bgEl.querySelector('.wb-quick-actions')) return;
            
            // Skip small elements
            if (bgEl.offsetHeight < 200) return;
            
            // Add class to prevent hover effects
            bgEl.classList.add('wb-bg-edit-target');
            
            // Force no hover effects with inline styles
            bgEl.style.setProperty('cursor', 'default', 'important');
            bgEl.style.setProperty('outline', 'none', 'important');
            
            // Add edit button
            const quickActions = doc.createElement('div');
            quickActions.className = 'wb-quick-actions wb-bg-edit';
            quickActions.style.cssText = 'position:absolute;top:120px;right:30px;z-index:99999;pointer-events:none;';
            quickActions.innerHTML = `
                <button class="wb-quick-btn" title="Wijzig achtergrond" data-action="change-bg" style="font-size:28px;width:70px;height:70px;background:rgba(255,152,0,0.95);color:white;border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.6);font-weight:bold;display:flex;align-items:center;justify-content:center;pointer-events:auto;">
                    🖼️
                </button>
            `;
            
            // Make sure element is positioned
            const computedStyle = window.getComputedStyle(bgEl);
            if (computedStyle.position === 'static') {
                bgEl.style.position = 'relative';
            }
            
            // Ensure content (text) appears above background by setting z-index on children
            const contentElements = bgEl.querySelectorAll('.hero-content, .container, .container-fluid, .row, .col-xl-10, .col-xxl-7, .title-area, .sec-title');
            contentElements.forEach(el => {
                el.style.position = 'relative';
                el.style.zIndex = '10';
            });
            
            // Apply default overlay to existing background if it doesn't have one
            const currentBg = window.getComputedStyle(bgEl).backgroundImage;
            if (currentBg && currentBg !== 'none' && !currentBg.includes('gradient')) {
                bgEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), ${currentBg}`;
            }
            
            bgEl.appendChild(quickActions);
            
            // Handle click
            quickActions.querySelector('[data-action="change-bg"]').addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const result = await window.MediaPicker.openImage();
                    if (result && result.url) {
                        // Update background image with overlay for text readability
                        bgEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${result.url})`;
                        bgEl.style.backgroundSize = 'cover';
                        bgEl.style.backgroundPosition = 'center';
                        bgEl.style.backgroundRepeat = 'no-repeat';
                        
                        // Also update data-bg-src if present
                        if (bgEl.hasAttribute('data-bg-src')) {
                            bgEl.setAttribute('data-bg-src', result.url);
                        }
                        
                        this.showNotification('✅ Achtergrond bijgewerkt!');
                    }
                } catch (err) {
                    console.log('[TemplateEditor] Media selection cancelled');
                }
            });
        });
        
        // Find background images in slider (index-2.html style - Gotur)
        const bgSlides = doc.querySelectorAll('.main-slider-two__bg');
        console.log('[TemplateEditor] Found', bgSlides.length, 'background image slides');
        
        bgSlides.forEach(bgDiv => {
            // Add edit button overlay - positioned below header, right side
            if (!bgDiv.querySelector('.wb-quick-actions')) {
                // Add class to prevent hover effects
                bgDiv.classList.add('wb-bg-edit-target');
                
                // Force no hover effects with inline styles
                bgDiv.style.setProperty('cursor', 'default', 'important');
                bgDiv.style.setProperty('outline', 'none', 'important');
                
                const quickActions = doc.createElement('div');
                quickActions.className = 'wb-quick-actions wb-bg-edit';
                quickActions.style.cssText = 'position:absolute;top:120px;right:30px;z-index:99999;pointer-events:none;';
                quickActions.innerHTML = `
                    <button class="wb-quick-btn" title="Wijzig achtergrond" data-action="change-bg" style="font-size:28px;width:70px;height:70px;background:rgba(255,152,0,0.95);color:white;border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.6);font-weight:bold;display:flex;align-items:center;justify-content:center;pointer-events:auto;">
                        🖼️
                    </button>
                `;
                
                bgDiv.style.position = 'relative';
                bgDiv.appendChild(quickActions);
                
                // Handle click
                quickActions.querySelector('[data-action="change-bg"]').addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Open media selector
                    try {
                        const result = await window.MediaPicker.openImage();
                        if (result && result.url) {
                            // Update background image with overlay for text readability
                            bgDiv.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${result.url})`;
                            bgDiv.style.backgroundSize = 'cover';
                            bgDiv.style.backgroundPosition = 'center';
                            bgDiv.style.backgroundRepeat = 'no-repeat';
                            this.showNotification('✅ Achtergrond bijgewerkt!');
                        }
                    } catch (err) {
                        console.log('[TemplateEditor] Media selection cancelled');
                    }
                });
            }
        });
        
        // Find all img elements
        const images = doc.querySelectorAll('img');
        console.log('[TemplateEditor] Found', images.length, 'images');
        
        images.forEach(img => {
            // Skip small icons
            if (img.width < 50 && img.height < 50) return;
            
            // Skip logo images
            if (img.closest('.logo, .main-header__logo, header')) return;
            
            // Skip cloned carousel items
            if (img.closest('.owl-item.cloned')) return;
            
            // Skip decorative overlay images (like airplane frame)
            if (img.closest('.main-slider-one__destinations__hover, .main-slider-one__element')) return;
            
            img.classList.add('wb-editable', 'wb-image');
            img.dataset.editType = 'img';
            
            // Check if image is in a carousel item
            const carouselItem = img.closest('.item, .owl-item:not(.cloned), .carousel-item, .swiper-slide');
            
            if (carouselItem) {
                // Skip if this is an owl-cloned item
                if (carouselItem.classList.contains('cloned')) return;
                
                // For carousel items, add button directly on the image wrapper
                const imageWrapper = img.closest('.destinations-card-two__thumb') || img.parentElement;
                
                if (imageWrapper && !imageWrapper.querySelector('.wb-quick-actions')) {
                    const quickActions = doc.createElement('div');
                    quickActions.className = 'wb-quick-actions';
                    quickActions.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;pointer-events:auto;';
                    quickActions.innerHTML = `
                        <button class="wb-quick-btn" title="Wijzig afbeelding" data-action="change-image" style="font-size:24px;width:60px;height:60px;background:rgba(76,175,80,0.9);color:white;border:none;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                            🖼️
                        </button>
                    `;
                    
                    // Make sure wrapper is positioned
                    if (window.getComputedStyle(imageWrapper).position === 'static') {
                        imageWrapper.style.position = 'relative';
                    }
                    
                    imageWrapper.appendChild(quickActions);
                    
                    // Handle quick action clicks
                    quickActions.querySelector('[data-action="change-image"]').addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectElement(img, 'image');
                        setTimeout(() => this.openMediaSelector(), 100);
                    });
                }
                
                // Add "Add Slide" button to the carousel section (only once)
                const carousel = carouselItem.closest('.destinations-two__carousel, .owl-carousel');
                const carouselSection = carouselItem.closest('.main-slider-one__destinations');
                
                if (carousel && carouselSection && !carouselSection.querySelector('.wb-add-slide-btn')) {
                    const addSlideBtn = doc.createElement('button');
                    addSlideBtn.className = 'wb-add-slide-btn';
                    addSlideBtn.innerHTML = '<i class="fas fa-plus"></i> Slide Toevoegen';
                    addSlideBtn.style.cssText = 'position:absolute;top:20px;right:20px;z-index:10001;background:#4CAF50;color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
                    
                    addSlideBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.addCarouselSlide(carousel);
                    });
                    
                    carouselSection.style.position = 'relative';
                    carouselSection.appendChild(addSlideBtn);
                    
                    console.log('[TemplateEditor] Added slide button to carousel section');
                }
                
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectElement(img, 'image');
                });
            } else {
                // Regular images - wrap in container
                let wrapper = img.parentElement;
                if (!wrapper.classList.contains('wb-image-wrapper')) {
                    wrapper = doc.createElement('div');
                    wrapper.className = 'wb-image-wrapper';
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    img.parentNode.insertBefore(wrapper, img);
                    wrapper.appendChild(img);
                }
                
                // Add quick action buttons
                const quickActions = doc.createElement('div');
                quickActions.className = 'wb-quick-actions';
                quickActions.innerHTML = `
                    <button class="wb-quick-btn" title="Wijzig afbeelding" data-action="change-image">
                        🖼️
                    </button>
                `;
                wrapper.appendChild(quickActions);
                
                // Handle quick action clicks
                quickActions.querySelector('[data-action="change-image"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectElement(img, 'image');
                    setTimeout(() => this.openMediaSelector(), 100);
                });
                
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectElement(img, 'image');
                });
            }
        });
        
        // Find elements with background images (hero sections, sliders, etc.)
        // Use a more comprehensive approach to find ALL elements with backgrounds
        const allElements = doc.querySelectorAll('*');
        
        allElements.forEach(el => {
            const bgImage = window.getComputedStyle(el).backgroundImage;
            
            // Check if it has a background image
            if (bgImage && bgImage !== 'none' && !bgImage.includes('gradient')) {
                // Skip if too small (likely not a main background)
                if (el.offsetHeight < 200 || el.offsetWidth < 200) return;
                
                // Skip if already editable
                if (el.classList.contains('wb-editable')) return;
                
                // Skip header, footer, nav
                if (el.closest('header, footer, nav')) return;
                
                el.classList.add('wb-editable', 'wb-bg-image');
                el.dataset.editType = 'background';
                
                // Make sure it's positioned
                if (window.getComputedStyle(el).position === 'static') {
                    el.style.position = 'relative';
                }
                
                // Add quick action buttons
                const quickActions = doc.createElement('div');
                quickActions.className = 'wb-quick-actions';
                quickActions.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;pointer-events:auto;';
                quickActions.innerHTML = `
                    <button class="wb-quick-btn" title="Wijzig achtergrond" data-action="change-background" style="font-size:24px;width:60px;height:60px;pointer-events:auto;">
                        🖼️
                    </button>
                `;
                el.appendChild(quickActions);
                
                // Handle quick action clicks
                quickActions.querySelector('[data-action="change-background"]').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectElement(el, 'background');
                    // Automatically open media selector
                    setTimeout(() => this.openMediaSelector(), 100);
                });
                
                el.addEventListener('click', (e) => {
                    // Only if clicking directly on the element, not children
                    if (e.target === el || e.target.classList.contains('wb-bg-image')) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectElement(el, 'background');
                    }
                });
            }
        });
    }
    
    deselectElement() {
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Remove all selections
        iframeDoc.querySelectorAll('.wb-selected').forEach(el => {
            el.classList.remove('wb-selected');
            const label = el.querySelector('.wb-edit-label');
            if (label) label.remove();
        });
        
        // Disable overlay mode
        iframeDoc.body.classList.remove('wb-editing-mode');
        
        // Clear selected element
        this.selectedElement = null;
        
        // Clear properties panel
        const propertiesContent = document.getElementById('propertiesContent');
        propertiesContent.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#999;">
                <i class="fas fa-mouse-pointer" style="font-size:48px;margin-bottom:16px;"></i>
                <p>Klik op een element om te bewerken</p>
            </div>
        `;
    }
    
    selectElement(element, type) {
        console.log('[TemplateEditor] Selected element:', type, element);
        
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Remove previous selection
        iframeDoc.querySelectorAll('.wb-selected').forEach(el => {
            el.classList.remove('wb-selected');
            const label = el.querySelector('.wb-edit-label');
            if (label) label.remove();
        });
        
        // Add selection to new element
        element.classList.add('wb-selected');
        
        // Enable overlay mode
        iframeDoc.body.classList.add('wb-editing-mode');
        
        // Add edit label
        const label = iframeDoc.createElement('div');
        label.className = 'wb-edit-label';
        label.textContent = type === 'text' ? '✏️ Tekst bewerken' : 
                           type === 'background' ? '🖼️ Achtergrond wijzigen' : 
                           '🖼️ Afbeelding wijzigen';
        element.style.position = 'relative';
        element.appendChild(label);
        
        this.selectedElement = { element, type };
        
        // Show properties panel
        this.showPropertiesPanel(element, type);
    }
    
    showPropertiesPanel(element, type) {
        const propertiesContent = document.getElementById('propertiesContent');
        
        if (type === 'text') {
            const currentText = element.textContent.trim();
            
            propertiesContent.innerHTML = `
                <div class="selected-element-info">
                    <i class="fas fa-check-circle"></i> Tekst element geselecteerd
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-font"></i> Tekst Inhoud
                    </div>
                    <div class="property-field">
                        <label class="property-label">Huidige tekst</label>
                        <textarea class="property-input property-textarea" id="textContent">${currentText}</textarea>
                    </div>
                    <button class="ai-generate-btn" onclick="templateEditor.generateAIText()">
                        <i class="fas fa-magic"></i> Genereer met AI
                    </button>
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-code"></i> HTML Code Editor
                    </div>
                    <div class="property-field">
                        <label class="property-label">Bewerk HTML direct</label>
                        <textarea class="property-input property-textarea" id="htmlContent" style="font-family:monospace;font-size:12px;height:150px;">${element.innerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                        <small style="color:#666;font-size:11px;">⚠️ Voorzichtig: verkeerde HTML kan de layout breken</small>
                    </div>
                    <button class="btn btn-secondary" style="width:100%;margin-top:8px;" onclick="templateEditor.applyHTMLChanges()">
                        <i class="fas fa-code"></i> HTML Toepassen
                    </button>
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-palette"></i> Styling
                    </div>
                    <div class="property-field">
                        <label class="property-label">Tekstkleur</label>
                        <input type="color" class="property-input" id="textColor" value="${this.getComputedColor(element)}">
                    </div>
                    <div class="property-field">
                        <label class="property-label">Achtergrondkleur</label>
                        <input type="color" class="property-input" id="bgColor" value="${this.getComputedBgColor(element)}">
                        <small style="color:#666;font-size:11px;">Laat leeg voor transparant</small>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Achtergrond Afbeelding</label>
                        <input type="text" class="property-input" id="bgImage" value="${this.getComputedBgImage(element)}" placeholder="URL of kies afbeelding">
                        <button class="media-selector-btn" onclick="templateEditor.selectBackgroundImage()" style="margin-top:8px;width:100%;">
                            <i class="fas fa-image"></i> Kies Achtergrond
                        </button>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Lettergrootte</label>
                        <input type="number" class="property-input" id="fontSize" value="${parseInt(window.getComputedStyle(element).fontSize)}" min="8" max="72">
                    </div>
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-cog"></i> Geavanceerde Opties
                    </div>
                    <div class="property-field">
                        <label class="property-label">CSS Classes</label>
                        <input type="text" class="property-input" id="cssClasses" value="${element.className}" placeholder="class1 class2 class3">
                        <small style="color:#666;font-size:11px;">Voeg CSS classes toe (gescheiden door spaties)</small>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Custom CSS (inline)</label>
                        <textarea class="property-input" id="customCSS" style="font-family:monospace;font-size:12px;height:80px;" placeholder="color: red; font-weight: bold;">${element.getAttribute('style') || ''}</textarea>
                    </div>
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-tools"></i> Element Acties
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <button onclick="templateEditor.duplicateElement()" title="Dupliceer element" style="font-size:11px;padding:10px 8px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;line-height:1.4;text-align:center;">
                            <i class="fas fa-copy" style="display:block;margin-bottom:4px;font-size:14px;"></i>
                            <span style="display:block;">Dupliceer</span>
                        </button>
                        <button onclick="templateEditor.deleteElement()" title="Verwijder element" style="font-size:11px;padding:10px 8px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;line-height:1.4;text-align:center;">
                            <i class="fas fa-trash" style="display:block;margin-bottom:4px;font-size:14px;"></i>
                            <span style="display:block;">Verwijder</span>
                        </button>
                        <button onclick="templateEditor.moveElementUp()" title="Verplaats omhoog" style="font-size:11px;padding:10px 8px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;line-height:1.4;text-align:center;">
                            <i class="fas fa-arrow-up" style="display:block;margin-bottom:4px;font-size:14px;"></i>
                            <span style="display:block;">Omhoog</span>
                        </button>
                        <button onclick="templateEditor.moveElementDown()" title="Verplaats omlaag" style="font-size:11px;padding:10px 8px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;line-height:1.4;text-align:center;">
                            <i class="fas fa-arrow-down" style="display:block;margin-bottom:4px;font-size:14px;"></i>
                            <span style="display:block;">Omlaag</span>
                        </button>
                    </div>
                </div>
                
                <div class="property-section">
                    <button class="btn btn-primary" style="width:100%;" onclick="templateEditor.applyTextChanges()">
                        <i class="fas fa-check"></i> Wijzigingen Toepassen
                    </button>
                </div>
            `;
        } else if (type === 'image') {
            const currentSrc = element.src;
            const carouselItem = element.closest('.item, .owl-item, .carousel-item, .swiper-slide');
            
            // If in carousel, show ALL carousel images
            if (carouselItem) {
                const carousel = carouselItem.closest('.destinations-two__carousel, .owl-carousel');
                const allItems = carousel ? Array.from(carousel.querySelectorAll('.item')).filter(item => 
                    !item.closest('.owl-item.cloned')
                ) : [];
                
                let carouselImagesHTML = '';
                allItems.forEach((item, index) => {
                    const img = item.querySelector('img');
                    if (img) {
                        const isSelected = img === element;
                        carouselImagesHTML += `
                            <div class="carousel-image-item ${isSelected ? 'selected' : ''}" style="margin-bottom:16px;padding:12px;border:2px solid ${isSelected ? '#667eea' : '#e0e0e0'};border-radius:8px;cursor:pointer;" onclick="templateEditor.selectCarouselImage(${index})">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <img src="${img.src}" style="width:80px;height:60px;object-fit:cover;border-radius:4px;">
                                    <div style="flex:1;">
                                        <div style="font-weight:600;margin-bottom:4px;">Slide ${index + 1}</div>
                                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();templateEditor.changeCarouselImage(${index})" style="padding:4px 12px;font-size:12px;">
                                            <i class="fas fa-image"></i> Wijzig
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                
                propertiesContent.innerHTML = `
                    <div class="selected-element-info">
                        <i class="fas fa-check-circle"></i> Carousel Slider
                    </div>
                    
                    <div class="property-section">
                        <div class="property-title">
                            <i class="fas fa-images"></i> Alle Slides (${allItems.length})
                        </div>
                        <div style="max-height:500px;overflow-y:auto;">
                            ${carouselImagesHTML}
                        </div>
                    </div>
                `;
            } else {
                // Regular image
                propertiesContent.innerHTML = `
                    <div class="selected-element-info">
                        <i class="fas fa-check-circle"></i> Afbeelding geselecteerd
                    </div>
                    
                    <div class="property-section">
                        <div class="property-title">
                            <i class="fas fa-image"></i> Afbeelding
                        </div>
                        <div class="property-field">
                            <img src="${currentSrc}" style="width:100%; border-radius:8px; margin-bottom:12px;">
                        </div>
                        <button class="media-selector-btn" onclick="templateEditor.openMediaSelector()">
                            <i class="fas fa-folder-open"></i> Kies Nieuwe Afbeelding
                        </button>
                    </div>
                    
                    <div class="property-section">
                        <div class="property-title">
                            <i class="fas fa-sliders-h"></i> Afmetingen
                        </div>
                        <div class="property-field">
                            <label class="property-label">Breedte</label>
                            <input type="text" class="property-input" id="imageWidth" value="${element.style.width || 'auto'}">
                        </div>
                        <div class="property-field">
                            <label class="property-label">Hoogte</label>
                            <input type="text" class="property-input" id="imageHeight" value="${element.style.height || 'auto'}">
                        </div>
                    </div>
                    
                    <div class="property-section">
                        <button class="btn btn-primary" style="width:100%;" onclick="templateEditor.applyImageChanges()">
                            <i class="fas fa-check"></i> Wijzigingen Toepassen
                        </button>
                    </div>
                `;
            }
        } else if (type === 'background') {
            const bgImage = window.getComputedStyle(element).backgroundImage;
            const currentBg = bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            
            propertiesContent.innerHTML = `
                <div class="selected-element-info">
                    <i class="fas fa-check-circle"></i> Achtergrond afbeelding geselecteerd
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-image"></i> Achtergrond Afbeelding
                    </div>
                    <div class="property-field">
                        <div style="width:100%; height:150px; background-image:${bgImage}; background-size:cover; background-position:center; border-radius:8px; margin-bottom:12px;"></div>
                    </div>
                    <button class="media-selector-btn" onclick="templateEditor.openMediaSelector()">
                        <i class="fas fa-folder-open"></i> Kies Nieuwe Achtergrond
                    </button>
                </div>
                
                <div class="property-section">
                    <div class="property-title">
                        <i class="fas fa-sliders-h"></i> Achtergrond Opties
                    </div>
                    <div class="property-field">
                        <label class="property-label">Hoogte (px)</label>
                        <input type="number" class="property-input" id="bgHeight" value="${parseInt(element.offsetHeight)}" min="200" max="1200" step="50">
                        <small style="color:#666;font-size:12px;">Standaard: ${parseInt(element.offsetHeight)}px</small>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Donkere Overlay (0-100%)</label>
                        <input type="range" class="property-input" id="bgOverlay" min="0" max="100" value="35" step="5" style="width:100%;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:4px;">
                            <span>Licht (0%)</span>
                            <span id="overlayValue">35%</span>
                            <span>Donker (100%)</span>
                        </div>
                        <small style="color:#666;font-size:12px;">Voor betere tekst leesbaarheid</small>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Background Size</label>
                        <select class="property-input" id="bgSize">
                            <option value="cover" ${element.style.backgroundSize === 'cover' ? 'selected' : ''}>Cover (vult hele ruimte)</option>
                            <option value="contain" ${element.style.backgroundSize === 'contain' ? 'selected' : ''}>Contain (hele foto zichtbaar)</option>
                            <option value="auto" ${element.style.backgroundSize === 'auto' ? 'selected' : ''}>Auto (originele grootte)</option>
                        </select>
                    </div>
                    <div class="property-field">
                        <label class="property-label">Background Position</label>
                        <select class="property-input" id="bgPosition">
                            <option value="center" ${element.style.backgroundPosition === 'center' ? 'selected' : ''}>Center</option>
                            <option value="top" ${element.style.backgroundPosition === 'top' ? 'selected' : ''}>Top</option>
                            <option value="bottom" ${element.style.backgroundPosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                            <option value="left" ${element.style.backgroundPosition === 'left' ? 'selected' : ''}>Left</option>
                            <option value="right" ${element.style.backgroundPosition === 'right' ? 'selected' : ''}>Right</option>
                        </select>
                    </div>
                </div>
                
                <div class="property-section">
                    <button class="btn btn-primary" style="width:100%;" onclick="templateEditor.applyBackgroundChanges()">
                        <i class="fas fa-check"></i> Wijzigingen Toepassen
                    </button>
                </div>
            `;
            
            // Add live overlay slider update
            setTimeout(() => {
                const overlaySlider = document.getElementById('bgOverlay');
                const overlayValue = document.getElementById('overlayValue');
                if (overlaySlider && overlayValue) {
                    overlaySlider.addEventListener('input', (e) => {
                        overlayValue.textContent = e.target.value + '%';
                    });
                }
            }, 100);
        }
    }
    
    getComputedColor(element) {
        const color = window.getComputedStyle(element).color;
        // Convert rgb to hex
        const rgb = color.match(/\d+/g);
        if (rgb) {
            return '#' + rgb.map(x => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
        return '#000000';
    }
    
    getComputedBgColor(element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        // Convert rgb to hex
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            return '#' + rgb.slice(0, 3).map(x => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
        return '#ffffff';
    }
    
    getComputedBgImage(element) {
        const bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage !== 'none') {
            // Extract URL from url("...")
            const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
            return match ? match[1] : '';
        }
        return '';
    }
    
    async selectBackgroundImage() {
        try {
            const result = await window.MediaPicker.openImage();
            const imageUrl = result?.url || result?.dataUrl;
            
            if (imageUrl) {
                document.getElementById('bgImage').value = imageUrl;
                this.showNotification('✅ Achtergrond geselecteerd!');
            }
        } catch (err) {
            console.log('[TemplateEditor] Background selection cancelled');
        }
    }
    
    applyTextChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'text') return;
        
        const element = this.selectedElement.element;
        const newText = document.getElementById('textContent').value;
        const newColor = document.getElementById('textColor')?.value;
        const newSize = document.getElementById('fontSize')?.value;
        
        // Update text content - handle different element structures
        if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            // For buttons and links, just replace text
            element.textContent = newText;
        } else if (element.children.length === 0) {
            // No children, simple text replacement
            element.textContent = newText;
        } else {
            // Has children - check if it's a link inside heading
            const link = element.querySelector('a');
            if (link) {
                // Update the link text
                link.textContent = newText;
            } else {
                // Try to update first text node
                const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                    textNodes[0].textContent = newText;
                } else {
                    // Fallback: replace all text
                    element.textContent = newText;
                }
            }
        }
        
        // Apply color and size if provided
        if (newColor) {
            element.style.color = newColor;
            // Also apply to child spans to ensure visibility
            element.querySelectorAll('span').forEach(span => {
                span.style.color = newColor;
            });
        }
        if (newSize) {
            element.style.fontSize = newSize + 'px';
        }
        
        // Apply background color if provided
        const newBgColor = document.getElementById('bgColor')?.value;
        if (newBgColor) {
            element.style.backgroundColor = newBgColor;
        }
        
        // Apply background image if provided
        const newBgImage = document.getElementById('bgImage')?.value;
        if (newBgImage) {
            element.style.backgroundImage = `url(${newBgImage})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
        } else if (newBgImage === '') {
            // Clear background image if empty
            element.style.backgroundImage = 'none';
        }
        
        // Apply CSS classes if changed
        const cssClasses = document.getElementById('cssClasses')?.value;
        if (cssClasses !== undefined) {
            element.className = cssClasses;
        }
        
        // Apply custom CSS if provided
        const customCSS = document.getElementById('customCSS')?.value;
        if (customCSS !== undefined) {
            element.setAttribute('style', customCSS);
        }
        
        this.showNotification('✅ Tekst bijgewerkt!');
    }
    
    applyHTMLChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'text') return;
        
        const element = this.selectedElement.element;
        const htmlContent = document.getElementById('htmlContent')?.value;
        
        if (htmlContent) {
            element.innerHTML = htmlContent;
            this.showNotification('✅ HTML bijgewerkt!');
        }
    }
    
    duplicateElement() {
        if (!this.selectedElement) return;
        
        const element = this.selectedElement.element;
        const clone = element.cloneNode(true);
        
        // Remove editor classes from clone
        clone.classList.remove('wb-editable', 'wb-text', 'wb-image', 'wb-selected');
        clone.querySelectorAll('.wb-quick-actions, .wb-edit-label').forEach(el => el.remove());
        
        // Insert after original
        element.parentNode.insertBefore(clone, element.nextSibling);
        
        this.showNotification('✅ Element gedupliceerd!');
        this.deselectElement();
    }
    
    deleteElement() {
        if (!this.selectedElement) return;
        
        if (confirm('Weet je zeker dat je dit element wilt verwijderen?')) {
            const element = this.selectedElement.element;
            element.remove();
            this.showNotification('✅ Element verwijderd!');
            this.deselectElement();
        }
    }
    
    moveElementUp() {
        if (!this.selectedElement) return;
        
        const element = this.selectedElement.element;
        const prev = element.previousElementSibling;
        
        if (prev) {
            element.parentNode.insertBefore(element, prev);
            this.showNotification('✅ Element verplaatst!');
        } else {
            this.showNotification('ℹ️ Element staat al bovenaan', 'info');
        }
    }
    
    moveElementDown() {
        if (!this.selectedElement) return;
        
        const element = this.selectedElement.element;
        const next = element.nextElementSibling;
        
        if (next) {
            element.parentNode.insertBefore(next, element);
            this.showNotification('✅ Element verplaatst!');
        } else {
            this.showNotification('ℹ️ Element staat al onderaan', 'info');
        }
    }
    
    applyImageChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'image') return;
        
        const element = this.selectedElement.element;
        
        // Check if image is in a carousel - if so, don't allow dimension changes
        const isInCarousel = element.closest('.item, .owl-item, .carousel-item, .swiper-slide');
        
        if (isInCarousel) {
            this.showNotification('ℹ️ Carousel afbeeldingen behouden hun originele afmetingen');
            return;
        }
        
        const newWidth = document.getElementById('imageWidth').value;
        const newHeight = document.getElementById('imageHeight').value;
        
        if (newWidth && newWidth !== 'auto') element.style.width = newWidth;
        if (newHeight && newHeight !== 'auto') element.style.height = newHeight;
        
        this.showNotification('✅ Afbeelding bijgewerkt!');
    }
    
    applyBackgroundChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'background') return;
        
        const element = this.selectedElement.element;
        const bgHeight = document.getElementById('bgHeight')?.value;
        const bgOverlay = document.getElementById('bgOverlay')?.value;
        const bgSize = document.getElementById('bgSize')?.value;
        const bgPosition = document.getElementById('bgPosition')?.value;
        
        // Apply height
        if (bgHeight) {
            element.style.height = bgHeight + 'px';
            element.style.minHeight = bgHeight + 'px';
        }
        
        // Apply overlay by updating background-image with gradient
        if (bgOverlay !== undefined) {
            const currentBg = window.getComputedStyle(element).backgroundImage;
            // Extract the image URL (remove existing gradient if present)
            const urlMatch = currentBg.match(/url\([^)]+\)/);
            if (urlMatch) {
                const imageUrl = urlMatch[0];
                const overlayOpacity = parseInt(bgOverlay) / 100;
                element.style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), ${imageUrl}`;
            }
        }
        
        // Apply size and position
        if (bgSize) element.style.backgroundSize = bgSize;
        if (bgPosition) element.style.backgroundPosition = bgPosition;
        
        this.showNotification('✅ Achtergrond bijgewerkt!');
    }
    
    async generateAIText() {
        if (!this.selectedElement || this.selectedElement.type !== 'text') return;
        
        const currentText = document.getElementById('textContent').value;
        
        // Show loading
        const btn = event.target;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genereren...';
        btn.disabled = true;
        
        try {
            console.log('[TemplateEditor] Generating AI text...');
            
            // Determine context from current text and page
            const context = this.getTextContext(currentText);
            
            // Call AI writer API
            const response = await fetch('/api/ai-writer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section: context.section,
                    tone: 'inspiring',
                    language: 'nl',
                    count: 1,
                    useResearch: false, // Quick generation without research
                    currentText: currentText
                })
            });
            
            if (!response.ok) {
                throw new Error('AI generation failed');
            }
            
            const data = await response.json();
            console.log('[TemplateEditor] AI response:', data);
            
            // Use the generated text
            let newText = currentText;
            if (data.paragraphs && data.paragraphs.length > 0) {
                newText = data.paragraphs[0];
            } else if (data.text) {
                newText = data.text;
            }
            
            document.getElementById('textContent').value = newText;
            
            this.showNotification('✨ AI tekst gegenereerd!');
        } catch (error) {
            console.error('[TemplateEditor] AI generation error:', error);
            
            // Fallback to simple variations
            const variations = [
                `Ontdek de wereld met onze unieke reizen en beleef onvergetelijke avonturen.`,
                `Maak je reis onvergetelijk met onze professionele begeleiding en service.`,
                `Ervaar de mooiste bestemmingen ter wereld met onze zorgvuldig samengestelde reizen.`,
                `Laat je inspireren door onze selectie van bijzondere reisbestemmingen.`,
                `Beleef de reis van je leven met onze expertise en passie voor reizen.`
            ];
            
            const newText = variations[Math.floor(Math.random() * variations.length)];
            document.getElementById('textContent').value = newText;
            
            this.showNotification('✨ Tekst gegenereerd (fallback)');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
    
    getTextContext(text) {
        // Analyze text to determine context
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('welkom') || lowerText.includes('home') || lowerText.includes('ontdek')) {
            return { section: 'intro' };
        } else if (lowerText.includes('over ons') || lowerText.includes('about') || lowerText.includes('wie zijn')) {
            return { section: 'about' };
        } else if (lowerText.includes('contact') || lowerText.includes('bereik')) {
            return { section: 'contact' };
        } else if (lowerText.includes('reis') || lowerText.includes('tour') || lowerText.includes('bestemming')) {
            return { section: 'destination' };
        } else {
            return { section: 'general' };
        }
    }
    
    async openMediaSelector() {
        if (!this.selectedElement || (this.selectedElement.type !== 'image' && this.selectedElement.type !== 'background')) return;
        
        try {
            console.log('[TemplateEditor] Opening media selector...');
            
            // Check if MediaPicker is available
            if (typeof window.MediaPicker === 'undefined') {
                console.error('[TemplateEditor] MediaPicker not loaded');
                this.showNotification('❌ Media selector niet beschikbaar', 'error');
                return;
            }
            
            // Open media picker
            const result = await window.MediaPicker.openImage({
                defaultTab: 'unsplash', // Start with Unsplash for nice travel images
                allowUpload: true
            });
            
            console.log('[TemplateEditor] Media selected:', result);
            console.log('[TemplateEditor] Selected element:', this.selectedElement);
            
            if (result && result.url) {
                if (this.selectedElement.type === 'image') {
                    const img = this.selectedElement.element;
                    console.log('[TemplateEditor] Updating image:', img, 'with URL:', result.url);
                    
                    // Update image in iframe
                    img.src = result.url;
                    
                    // If there's alt text, update it
                    if (result.alt) {
                        img.alt = result.alt;
                    }
                    
                    // Force reload if needed
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.style.opacity = '1';
                    }, 50);
                    
                    // Refresh properties panel to show new image
                    this.showPropertiesPanel(img, 'image');
                    
                    this.showNotification('✅ Afbeelding bijgewerkt!');
                    
                    console.log('[TemplateEditor] Image updated successfully');
                } else if (this.selectedElement.type === 'background') {
                    // Update background image
                    this.selectedElement.element.style.backgroundImage = `url('${result.url}')`;
                    
                    // Refresh properties panel to show new background
                    this.showPropertiesPanel(this.selectedElement.element, 'background');
                    
                    this.showNotification('✅ Achtergrond bijgewerkt!');
                }
            }
        } catch (error) {
            console.error('[TemplateEditor] Media selector error:', error);
            
            // If user cancelled, don't show error
            if (error.message !== 'User cancelled') {
                this.showNotification('❌ Fout bij selecteren afbeelding', 'error');
            }
        }
    }
    
    selectCarouselImage(index) {
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        const carousel = iframeDoc.querySelector('.destinations-two__carousel, .owl-carousel');
        if (!carousel) return;
        
        const allItems = Array.from(carousel.querySelectorAll('.item')).filter(item => 
            !item.closest('.owl-item.cloned')
        );
        
        if (allItems[index]) {
            const img = allItems[index].querySelector('img');
            if (img) {
                this.selectElement(img, 'image');
            }
        }
    }
    
    async changeCarouselImage(index) {
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        const carousel = iframeDoc.querySelector('.destinations-two__carousel, .owl-carousel');
        if (!carousel) return;
        
        const allItems = Array.from(carousel.querySelectorAll('.item')).filter(item => 
            !item.closest('.owl-item.cloned')
        );
        
        if (!allItems[index]) return;
        
        const img = allItems[index].querySelector('img');
        if (!img) return;
        
        try {
            // Open media picker
            const result = await window.MediaPicker.openImage({
                defaultTab: 'unsplash',
                allowUpload: true
            });
            
            if (result && result.url) {
                img.src = result.url;
                if (result.alt) img.alt = result.alt;
                
                this.showNotification('✅ Slide bijgewerkt!');
                
                // Refresh properties panel
                this.selectElement(img, 'image');
            }
        } catch (error) {
            console.error('[TemplateEditor] Error changing carousel image:', error);
            if (error.message !== 'User cancelled') {
                this.showNotification('❌ Fout bij wijzigen afbeelding', 'error');
            }
        }
    }
    
    async addCarouselSlide(carousel) {
        console.log('[TemplateEditor] Adding carousel slide...');
        
        try {
            // Open media picker to select image for new slide
            const result = await window.MediaPicker.openImage({
                defaultTab: 'unsplash',
                allowUpload: true
            });
            
            if (!result || !result.url) return;
            
            // Find an existing item to clone (not a cloned owl item)
            const existingItems = carousel.querySelectorAll('.item');
            const existingItem = Array.from(existingItems).find(item => 
                !item.closest('.owl-item.cloned')
            );
            
            if (!existingItem) {
                this.showNotification('❌ Kan geen slide toevoegen', 'error');
                return;
            }
            
            // Clone the item
            const newItem = existingItem.cloneNode(true);
            
            // Remove any existing quick actions from clone
            const oldActions = newItem.querySelectorAll('.wb-quick-actions');
            oldActions.forEach(action => action.remove());
            
            // Update the image in the cloned item
            const img = newItem.querySelector('img');
            if (img) {
                img.src = result.url;
                if (result.alt) img.alt = result.alt;
            }
            
            // Simply append the new item to the carousel
            // Don't try to destroy/reinit Owl Carousel - just add the HTML
            carousel.appendChild(newItem);
            
            this.showNotification('✅ Slide toegevoegd! Herlaad de pagina om de carousel te zien.');
            
            // Re-setup editing for the new slide
            setTimeout(() => {
                this.makeImagesEditable(carousel.ownerDocument);
            }, 100);
            
        } catch (error) {
            console.error('[TemplateEditor] Error adding slide:', error);
            this.showNotification('❌ Fout bij toevoegen slide', 'error');
        }
    }
    
    deletePage(index) {
        if (!confirm(`Weet je zeker dat je "${this.pages[index].name}" wilt verwijderen?`)) return;
        
        this.pages.splice(index, 1);
        this.renderPagesList();
        
        // Load first page if current page was deleted
        if (this.pages.length > 0) {
            this.loadPage(this.pages[0]);
        }
        
        this.showNotification('🗑️ Pagina verwijderd');
    }
    
    editPageSettings(index) {
        const page = this.pages[index];
        const newName = prompt('Nieuwe naam voor pagina:', page.name);
        
        if (newName) {
            page.name = newName;
            this.renderPagesList();
            this.showNotification('✅ Pagina naam bijgewerkt');
        }
    }
    
    setupDeviceSelector() {
        const deviceButtons = document.querySelectorAll('.device-btn');
        const frameWrapper = document.getElementById('frameWrapper');
        
        deviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                deviceButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const device = btn.dataset.device;
                frameWrapper.className = 'frame-wrapper ' + device;
            });
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDraft();
            }
            
            // Escape to deselect
            if (e.key === 'Escape' && this.selectedElement) {
                const iframe = document.getElementById('templateFrame');
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.querySelectorAll('.wb-selected').forEach(el => {
                    el.classList.remove('wb-selected');
                });
                this.selectedElement = null;
            }
        });
    }
    
    setupAutoSave() {
        // Auto-save every 2 minutes
        this.autoSaveInterval = setInterval(() => {
            console.log('[TemplateEditor] Auto-saving...');
            this.saveDraft();
        }, 120000); // 2 minutes
        
        console.log('[TemplateEditor] Auto-save enabled (every 2 minutes)');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    async previewSite() {
        console.log('[TemplateEditor] Opening preview...');
        
        try {
            // First, save the draft
            await this.saveDraft();
            
            // Generate unique preview ID
            const previewId = `${this.templateName}_${this.brandId}_${Date.now()}`;
            
            // Get the modified HTML with base tag
            const modifiedPages = await this.getModifiedPages();
            if (!modifiedPages || modifiedPages.length === 0) {
                this.showNotification('❌ Geen pagina om te previewen', 'error');
                return;
            }
            
            const previewHTML = modifiedPages[0].html;
            
            // Store preview in Supabase instead of sessionStorage (too large)
            if (this.supabase && this.brandId) {
                try {
                    const { error } = await this.supabase
                        .from('template_previews')
                        .upsert({
                            preview_id: previewId,
                            brand_id: this.brandId,
                            template: this.templateName,
                            html: previewHTML,
                            created_at: new Date().toISOString(),
                            expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
                        }, {
                            onConflict: 'preview_id'
                        });
                    
                    if (error) {
                        console.error('[TemplateEditor] Preview save error:', error);
                        console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
                        
                        // Show helpful error message
                        if (error.message.includes('relation') || error.message.includes('does not exist')) {
                            this.showNotification('❌ Database tabel ontbreekt. Voer eerst de SQL uit in Supabase!', 'error');
                        } else {
                            this.showNotification(`❌ Fout bij opslaan preview: ${error.message}`, 'error');
                        }
                        return;
                    }
                    
                    console.log('[TemplateEditor] Preview saved to Supabase:', previewId);
                } catch (err) {
                    console.error('[TemplateEditor] Preview save exception:', err);
                    this.showNotification('❌ Fout bij opslaan preview. Check console voor details.', 'error');
                    return;
                }
            }
            
            // Open preview with unique URL
            const previewUrl = `template-preview.html?id=${previewId}`;
            const previewWindow = window.open(previewUrl, '_blank');
            
            if (previewWindow) {
                this.showNotification('👁️ Preview geopend in nieuw tabblad');
            } else {
                this.showNotification('❌ Kon preview niet openen. Sta pop-ups toe.', 'error');
            }
        } catch (error) {
            console.error('[TemplateEditor] Preview error:', error);
            this.showNotification('❌ Fout bij openen preview', 'error');
        }
    }
    
    getUniqueSelector(element) {
        // Try to create a unique CSS selector for the element
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Use nth-child approach
        let path = [];
        let current = element;
        
        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.nodeName.toLowerCase();
            
            if (current.className && typeof current.className === 'string') {
                const classes = current.className.split(' ').filter(c => 
                    c && !c.startsWith('wb-')
                );
                if (classes.length > 0) {
                    selector += '.' + classes.join('.');
                }
            }
            
            // Add nth-child if needed for uniqueness
            if (current.parentNode) {
                const siblings = Array.from(current.parentNode.children);
                const sameTagSiblings = siblings.filter(s => s.nodeName === current.nodeName);
                if (sameTagSiblings.length > 1) {
                    const index = sameTagSiblings.indexOf(current) + 1;
                    selector += `:nth-of-type(${index})`;
                }
            }
            
            path.unshift(selector);
            current = current.parentElement;
            
            // Stop at body or after 5 levels
            if (!current || current.nodeName === 'BODY' || path.length >= 5) {
                break;
            }
        }
        
        return path.join(' > ');
    }
    
    async saveDraft() {
        console.log('[TemplateEditor] Saving draft...');
        console.log('[TemplateEditor] Template name:', this.templateName);
        
        try {
            // Get all modified pages
            console.log('[TemplateEditor] Getting modified pages...');
            const modifiedPages = await this.getModifiedPages();
            console.log('[TemplateEditor] Modified pages retrieved:', modifiedPages);
            
            // Save to localStorage
            const draftData = {
                template: this.templateName,
                pages: modifiedPages,
                timestamp: Date.now(),
                brandId: this.brandId
            };
            
            console.log('[TemplateEditor] Saving draft data:', {
                template: draftData.template,
                brandId: draftData.brandId,
                pagesCount: modifiedPages ? modifiedPages.length : 0
            });
            
            localStorage.setItem(`template_draft_${this.templateName}`, JSON.stringify(draftData));
            console.log('[TemplateEditor] Draft saved to localStorage');
            
            this.showNotification('💾 Draft opgeslagen!');
            
            // If we have Supabase credentials, also save to database
            if (this.supabase && this.brandId) {
                console.log('[TemplateEditor] Saving to Supabase...');
                await this.saveToSupabase(draftData);
            }
            
            // IMPORTANT: Re-apply brand styles after save to keep them visible
            // The styles are saved in the HTML but need to be re-applied to the live iframe
            const iframe = document.getElementById('templateFrame');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const brandStyles = iframeDoc.getElementById('wb-brand-styles');
            if (brandStyles) {
                console.log('[TemplateEditor] Re-applying brand styles after save...');
                // Force a re-render by removing and re-adding
                const styleContent = brandStyles.textContent;
                brandStyles.remove();
                const newStyle = iframeDoc.createElement('style');
                newStyle.id = 'wb-brand-styles';
                newStyle.textContent = styleContent;
                iframeDoc.head.appendChild(newStyle);
            }
        } catch (error) {
            console.error('[TemplateEditor] Save error:', error);
            console.error('[TemplateEditor] Error stack:', error.stack);
            this.showNotification('❌ Fout bij opslaan: ' + error.message, 'error');
        }
    }
    
    async getModifiedPages() {
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Clone the document to avoid modifying the live page
        const clonedDoc = iframeDoc.cloneNode(true);
        
        // IMPORTANT: Ensure brand styles are in the cloned document
        const originalBrandStyles = iframeDoc.getElementById('wb-brand-styles');
        const clonedBrandStyles = clonedDoc.getElementById('wb-brand-styles');
        
        if (originalBrandStyles && !clonedBrandStyles) {
            console.warn('[TemplateEditor] Brand styles not cloned! Re-adding...');
            const brandStylesCopy = originalBrandStyles.cloneNode(true);
            clonedDoc.head.appendChild(brandStylesCopy);
        } else if (originalBrandStyles && clonedBrandStyles) {
            console.log('[TemplateEditor] Brand styles present in clone ✓');
        } else {
            console.warn('[TemplateEditor] No brand styles found in original document!');
        }
        
        // Remove all editor UI elements and classes before saving
        clonedDoc.querySelectorAll('.wb-section-controls').forEach(controls => controls.remove());
        clonedDoc.querySelectorAll('.wb-add-section-btn').forEach(btn => btn.remove());
        clonedDoc.querySelectorAll('.wb-delete-section-btn').forEach(btn => btn.remove());
        clonedDoc.querySelectorAll('.wb-add-slide-btn').forEach(btn => btn.remove());
        clonedDoc.querySelectorAll('.wb-quick-actions').forEach(actions => actions.remove());
        clonedDoc.querySelectorAll('.wb-edit-label').forEach(label => label.remove());
        clonedDoc.querySelectorAll('.wb-selected').forEach(el => el.classList.remove('wb-selected'));
        clonedDoc.querySelectorAll('.wb-editable').forEach(el => {
            el.classList.remove('wb-editable', 'wb-text', 'wb-image', 'wb-bg-image', 'wb-bg-edit-target');
        });
        clonedDoc.body.classList.remove('wb-editing-mode');
        
        // Keep wb-brand-styles (brand colors/fonts) but remove wb-editor-styles
        const editorStyles = clonedDoc.getElementById('wb-editor-styles');
        if (editorStyles) editorStyles.remove();
        
        // Apply gallery grid styles inline to make them persistent
        const galleryGrids = clonedDoc.querySelectorAll('.gallery-grid, .gallery-layout1');
        galleryGrids.forEach(grid => {
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = '1fr 1fr';
            grid.style.gridTemplateRows = '1fr 1fr';
            grid.style.gap = '0';
            grid.style.padding = '0';
            grid.style.margin = '0';
            grid.style.width = '100%';
            
            // Apply to columns
            const cols = grid.querySelectorAll('[class*="col-"]');
            cols.forEach(col => {
                col.style.padding = '0';
                col.style.margin = '0';
                col.style.width = '100%';
                col.style.height = '300px';
            });
            
            // Apply to images
            const imgs = grid.querySelectorAll('img');
            imgs.forEach(img => {
                img.style.margin = '0';
                img.style.display = 'block';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
            });
        });
        
        // Restore original carousel HTML
        const carousels = clonedDoc.querySelectorAll('.owl-carousel');
        carousels.forEach((carousel, index) => {
            if (this.originalCarouselHTML && this.originalCarouselHTML.has(index)) {
                const originalHTML = this.originalCarouselHTML.get(index);
                
                // Get current images from the Owl structure
                const currentImages = new Map();
                const owlItems = carousel.querySelectorAll('.owl-item:not(.cloned) .item img');
                owlItems.forEach((img, imgIndex) => {
                    currentImages.set(imgIndex, img.src);
                });
                
                // Restore original HTML
                carousel.innerHTML = originalHTML;
                
                // Update images with current values
                const restoredImages = carousel.querySelectorAll('.item img');
                restoredImages.forEach((img, imgIndex) => {
                    if (currentImages.has(imgIndex)) {
                        img.src = currentImages.get(imgIndex);
                    }
                });
                
                console.log(`[TemplateEditor] Restored carousel ${index} with ${currentImages.size} images`);
            }
        });
        
        // Add base tag to fix relative paths in preview
        const head = clonedDoc.querySelector('head');
        if (head && iframe.src) {
            // Get base URL from iframe src
            const baseUrl = iframe.src.substring(0, iframe.src.lastIndexOf('/') + 1);
            
            // Remove existing base tag if any
            const existingBase = head.querySelector('base');
            if (existingBase) {
                existingBase.remove();
            }
            
            // Create and add new base tag at the beginning of head
            const baseTag = clonedDoc.createElement('base');
            baseTag.href = baseUrl;
            head.insertBefore(baseTag, head.firstChild);
            
            console.log('[TemplateEditor] Added base tag:', baseUrl);
        }
        
        // Get cleaned HTML
        const html = clonedDoc.documentElement.outerHTML;
        
        return [{
            name: this.currentPage.name,
            path: this.currentPage.path,
            html: html,
            modified: true
        }];
    }
    
    async saveToSupabase(draftData) {
        try {
            console.log('[TemplateEditor] Saving draft to Supabase...');
            
            const { data, error } = await this.supabase
                .from('template_drafts')
                .upsert({
                    brand_id: this.brandId,
                    template: this.templateName,
                    pages: draftData.pages,
                    current_page: this.currentPage?.path || null,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'brand_id,template'
                });
            
            if (error) throw error;
            
            console.log('[TemplateEditor] Draft saved to Supabase successfully');
        } catch (error) {
            console.error('[TemplateEditor] Supabase draft save error:', error);
            console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
            console.error('[TemplateEditor] Error status code:', error.statusCode);
            console.error('[TemplateEditor] Error status text:', error.statusText);
            console.error('[TemplateEditor] Error headers:', error.headers);
            console.error('[TemplateEditor] Error config:', error.config);
            console.error('[TemplateEditor] Error response:', error.response);
            // Don't throw - localStorage save already succeeded
        }
    }
    
    async saveWebsiteToSupabase(exportData) {
        try {
            console.log('[TemplateEditor] Saving website to Supabase...');
            console.log('[TemplateEditor] Export data:', {
                template: exportData.template,
                brandId: this.brandId,
                pagesCount: Object.keys(exportData.pages).length
            });
            
            const websiteData = {
                brand_id: this.brandId,
                name: `${exportData.template} Website`,
                slug: this.sanitizeSlug(exportData.template),
                template: exportData.template,
                pages: exportData.pages,
                preview_url: exportData.previewUrl,
                status: exportData.status,
                created_by: this.userId,
                updated_at: new Date().toISOString()
            };
            
            console.log('[TemplateEditor] Saving to websites table:', websiteData);
            
            const { data, error} = await this.supabase
                .from('websites')
                .upsert(websiteData, {
                    onConflict: 'brand_id,template'
                });
            
            if (error) {
                console.error('[TemplateEditor] Supabase website save error:', error);
                console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
                console.error('[TemplateEditor] Error status code:', error.statusCode);
                console.error('[TemplateEditor] Error status text:', error.statusText);
                console.error('[TemplateEditor] Error headers:', error.headers);
                console.error('[TemplateEditor] Error config:', error.config);
                console.error('[TemplateEditor] Error response:', error.response);
                throw error;
            }
            
            console.log('[TemplateEditor] Website saved to Supabase successfully');
            this.showNotification('✅ Website opgeslagen in database!');
        } catch (error) {
            console.error('[TemplateEditor] Supabase website save error:', error);
            console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
            console.error('[TemplateEditor] Error status code:', error.statusCode);
            console.error('[TemplateEditor] Error status text:', error.statusText);
            console.error('[TemplateEditor] Error headers:', error.headers);
            console.error('[TemplateEditor] Error config:', error.config);
            console.error('[TemplateEditor] Error response:', error.response);
            this.showNotification('⚠️ Website niet opgeslagen in database', 'error');
            throw error;
        }
    }
    
    async publishSite() {
        if (!confirm('Weet je zeker dat je de website wilt publiceren?\n\nDe website wordt teruggezonden naar BOLT.')) {
            return;
        }
        
        console.log('[TemplateEditor] Publishing site...');
        console.log('[TemplateEditor] Current template:', this.templateName);
        
        try {
            // Save first
            await this.saveDraft();
            
            // Get all pages HTML
            const allPagesHTML = await this.getAllPagesHTML();
            
            // Generate preview URL
            const previewUrl = await this.generatePreviewUrl();
            
            // Create export package
            const exportData = {
                template: this.templateName,
                pages: allPagesHTML,
                timestamp: Date.now(),
                brandId: this.brandId,
                previewUrl: previewUrl,
                status: 'published'  // Changed from 'draft' to 'published'
            };
            
            console.log('[TemplateEditor] Export data created:', {
                template: exportData.template,
                brandId: exportData.brandId,
                status: exportData.status,
                pagesCount: Object.keys(allPagesHTML).length
            });
            
            // Save to websites table in Supabase
            if (this.supabase && this.brandId) {
                await this.saveWebsiteToSupabase(exportData);
            }
            
            // If we have a return URL (from BOLT), send data back
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('return_url');
            
            if (returnUrl) {
                // Store export data in localStorage for BOLT to pick up
                localStorage.setItem('template_export', JSON.stringify(exportData));
                
                this.showNotification('🚀 Website gepubliceerd! Terugkeren naar BOLT...');
                
                // Redirect back to BOLT after 1 second
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 1000);
            } else {
                // No return URL - offer download
                this.downloadSite(exportData);
            }
        } catch (error) {
            console.error('[TemplateEditor] Publish error:', error);
            this.showNotification('❌ Fout bij publiceren', 'error');
        }
    }
    
    async getAllPagesHTML() {
        // For now, just return current page
        // TODO: Loop through all pages and collect HTML
        return await this.getModifiedPages();
    }
    
    async generatePreviewUrl() {
        console.log('[TemplateEditor] Generating preview URL...');
        
        try {
            // Get brand info to generate subdomain
            if (!this.supabase || !this.brandId) {
                console.warn('[TemplateEditor] No Supabase or brandId, using fallback');
                return `preview-${Date.now()}.ai-websitestudio.nl`;
            }
            
            // Fetch brand data
            const { data: brand, error } = await this.supabase
                .from('brands')
                .select('slug, name')
                .eq('id', this.brandId)
                .single();
            
            if (error) {
                console.error('[TemplateEditor] Error fetching brand:', error);
                console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
                console.error('[TemplateEditor] Error status code:', error.statusCode);
                console.error('[TemplateEditor] Error status text:', error.statusText);
                console.error('[TemplateEditor] Error headers:', error.headers);
                console.error('[TemplateEditor] Error config:', error.config);
                console.error('[TemplateEditor] Error response:', error.response);
                return `preview-${Date.now()}.ai-websitestudio.nl`;
            }
            
            if (!brand) {
                console.error('[TemplateEditor] Brand not found:', this.brandId);
                return `preview-${Date.now()}.ai-websitestudio.nl`;
            }
            
            // Generate subdomain from brand slug or name
            const brandSlug = brand.slug || this.sanitizeSlug(brand.name);
            const subdomain = this.sanitizeSlug(brandSlug);
            const previewUrl = `${subdomain}.ai-websitestudio.nl`;
            
            console.log('[TemplateEditor] Generated preview URL:', previewUrl);
            
            return previewUrl;
        } catch (error) {
            console.error('[TemplateEditor] Error generating preview URL:', error);
            console.error('[TemplateEditor] Error details:', error.message, error.details, error.hint);
            console.error('[TemplateEditor] Error status code:', error.statusCode);
            console.error('[TemplateEditor] Error status text:', error.statusText);
            console.error('[TemplateEditor] Error headers:', error.headers);
            console.error('[TemplateEditor] Error config:', error.config);
            console.error('[TemplateEditor] Error response:', error.response);
            return `preview-${Date.now()}.ai-websitestudio.nl`;
        }
    }
    
    sanitizeSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 63);
    }
    
    downloadSite(exportData) {
        // Create a downloadable HTML file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.templateName}-website-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('📥 Website gedownload!');
    }
    
    openComponentLibrary() {
        console.log('[TemplateEditor] Opening component library...');
        
        // Component library for Gotur
        const goturComponents = {
            'Basis': [
                { name: 'Home', path: 'index.html', icon: 'home', desc: 'Hoofdpagina met hero en features' },
                { name: 'Home 2', path: 'index-2.html', icon: 'home', desc: 'Alternatieve homepage' },
                { name: 'Home 3', path: 'index-3.html', icon: 'home', desc: 'Moderne homepage' },
                { name: 'Home 4', path: 'index-4.html', icon: 'home', desc: 'Minimale homepage' },
                { name: 'About', path: 'about.html', icon: 'info-circle', desc: 'Over ons pagina' },
                { name: 'Contact', path: 'contact.html', icon: 'envelope', desc: 'Contact formulier' },
                { name: 'FAQ', path: 'faq.html', icon: 'question-circle', desc: 'Veelgestelde vragen' },
                { name: '404', path: '404.html', icon: 'exclamation-triangle', desc: 'Error pagina' }
            ],
            'Tours & Reizen': [
                { name: 'Tour Grid', path: 'tour-listing-1.html', icon: 'th', desc: 'Tours in grid layout' },
                { name: 'Tour Grid 2', path: 'tour-listing-2.html', icon: 'th-large', desc: 'Alternatieve grid' },
                { name: 'Tour List', path: 'tour-listing-list.html', icon: 'list', desc: 'Tours in lijst' },
                { name: 'Tour Carousel', path: 'tour-listing-1-carousel.html', icon: 'images', desc: 'Tours carousel' },
                { name: 'Tour Details', path: 'tour-listing-details-1.html', icon: 'map-marker-alt', desc: 'Tour detail pagina' },
                { name: 'Tour Details 2', path: 'tour-listing-details-2.html', icon: 'map-marked-alt', desc: 'Alternatieve details' }
            ],
            'Bestemmingen': [
                { name: '⭐ Mijn Bestemmingen', path: 'destinations-dynamic.html', icon: 'star', desc: 'Laadt automatisch je bestemmingen uit BOLT', isDynamic: true },
                { name: 'Destinations Grid', path: 'destination-one.html', icon: 'globe', desc: 'Bestemmingen grid' },
                { name: 'Destinations Grid 2', path: 'destination-two.html', icon: 'globe-americas', desc: 'Alternatieve grid' },
                { name: 'Destinations Carousel', path: 'destination-one-carousel.html', icon: 'images', desc: 'Bestemmingen carousel' },
                { name: 'Destination Details', path: 'destination-details.html', icon: 'map-pin', desc: 'Bestemming details' }
            ],
            'Blog': [
                { name: '⭐ Mijn Nieuws', path: 'blog-dynamic.html', icon: 'star', desc: 'Laadt automatisch je nieuws uit BOLT', isDynamic: true },
                { name: 'Blog Grid', path: 'blog-grid.html', icon: 'th', desc: 'Blog in grid' },
                { name: 'Blog List', path: 'blog-list.html', icon: 'list', desc: 'Blog in lijst' },
                { name: 'Blog Carousel', path: 'blog-carousel.html', icon: 'images', desc: 'Blog carousel' },
                { name: 'Blog Details', path: 'blog-details.html', icon: 'newspaper', desc: 'Blog artikel' }
            ],
            'Galerij': [
                { name: 'Gallery Grid', path: 'gallery-grid.html', icon: 'images', desc: 'Foto galerij grid' },
                { name: 'Gallery Filter', path: 'gallery-filter.html', icon: 'filter', desc: 'Filterbare galerij' }
            ],
            'Team': [
                { name: 'Team Grid', path: 'team.html', icon: 'users', desc: 'Team leden grid' },
                { name: 'Team Carousel', path: 'team-carousel.html', icon: 'users', desc: 'Team carousel' },
                { name: 'Team Details', path: 'team-details.html', icon: 'user', desc: 'Team lid details' }
            ],
            'Extra': [
                { name: 'Testimonials', path: 'testimonials.html', icon: 'quote-right', desc: 'Klant reviews' },
                { name: 'Testimonials Carousel', path: 'testimonials-carousel.html', icon: 'quote-left', desc: 'Reviews carousel' },
                { name: 'Pricing', path: 'pricing.html', icon: 'dollar-sign', desc: 'Prijzen overzicht' }
            ]
        };
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background:white;border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;';
        
        modalContent.innerHTML = `
            <div style="padding:24px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;">
                <h2 style="margin:0;font-size:24px;color:#333;">
                    <i class="fas fa-plus-circle" style="color:#667eea;"></i> Nieuwe Pagina Toevoegen
                </h2>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">×</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:24px;" id="componentLibraryContent"></div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Render components
        const content = document.getElementById('componentLibraryContent');
        
        Object.keys(goturComponents).forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.style.marginBottom = '32px';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.style.cssText = 'font-size:18px;color:#667eea;margin-bottom:16px;display:flex;align-items:center;gap:8px;';
            categoryTitle.innerHTML = `<i class="fas fa-folder"></i> ${category}`;
            categorySection.appendChild(categoryTitle);
            
            const componentsGrid = document.createElement('div');
            componentsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;';
            
            goturComponents[category].forEach(component => {
                const card = document.createElement('div');
                const isDynamic = component.isDynamic;
                const borderColor = isDynamic ? '#FFD700' : '#e0e0e0';
                const bgGradient = isDynamic ? 'linear-gradient(135deg,#FFD700 0%,#FFA500 100%)' : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)';
                
                card.style.cssText = `border:2px solid ${borderColor};border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;${isDynamic ? 'background:linear-gradient(135deg,rgba(255,215,0,0.05) 0%,rgba(255,165,0,0.05) 100%);' : ''}`;
                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                        <div style="width:40px;height:40px;background:${bgGradient};border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;">
                            <i class="fas fa-${component.icon}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:600;color:#333;">${component.name}</div>
                            <div style="font-size:12px;color:${isDynamic ? '#FF8C00' : '#999'};">${component.desc}</div>
                        </div>
                    </div>
                `;
                
                card.onmouseover = () => {
                    card.style.borderColor = isDynamic ? '#FFA500' : '#667eea';
                    card.style.transform = 'translateY(-4px)';
                    card.style.boxShadow = isDynamic ? '0 8px 20px rgba(255,165,0,0.3)' : '0 8px 20px rgba(102,126,234,0.2)';
                };
                card.onmouseout = () => {
                    card.style.borderColor = borderColor;
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                };
                
                card.onclick = () => {
                    modal.remove();
                    this.addNewPage(component);
                };
                
                componentsGrid.appendChild(card);
            });
            
            categorySection.appendChild(componentsGrid);
            content.appendChild(categorySection);
        });
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    async addNewPage(component) {
        console.log('[TemplateEditor] Adding new page:', component.name);
        
        try {
            // Show loading
            this.showNotification('📄 Pagina laden...');
            
            // For dynamic pages, add brand_id parameter
            let pagePath = component.path;
            if (component.isDynamic && this.brandId) {
                pagePath = `${component.path}?brand_id=${this.brandId}`;
            }
            
            // Add to pages array
            const newPage = {
                name: component.name,
                path: pagePath,
                icon: component.icon,
                category: 'custom',
                isDynamic: component.isDynamic || false
            };
            
            this.pages.push(newPage);
            
            // Refresh pages list
            this.renderPagesList();
            
            // Load the new page
            await this.loadPage(newPage);
            
            this.showNotification(`✅ ${component.name} toegevoegd!`);
        } catch (error) {
            console.error('[TemplateEditor] Error adding page:', error);
            this.showNotification('❌ Fout bij toevoegen pagina', 'error');
        }
    }
    
    deleteSection(section) {
        if (confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) {
            // Also remove the section controls (buttons) after it
            const nextEl = section.nextElementSibling;
            if (nextEl && nextEl.classList.contains('wb-section-controls')) {
                nextEl.remove();
            }
            
            // Remove the section itself
            section.remove();
            
            this.showNotification('✅ Sectie verwijderd!');
            console.log('[TemplateEditor] Section deleted');
        }
    }
    
    openSectionLibrary(afterSection) {
        console.log('[TemplateEditor] Opening section library...');
        
        // Section components library
        const sectionComponents = {
            'Tekst & Content': [
                { 
                    name: 'Tekst Blok', 
                    icon: 'align-left',
                    desc: 'Simpel tekst blok met titel',
                    html: `
                        <section class="py-5">
                            <div class="container">
                                <div class="row">
                                    <div class="col-lg-8 mx-auto">
                                        <h2 class="mb-4">Nieuwe Sectie</h2>
                                        <p class="lead">Dit is een nieuwe tekst sectie. Klik om te bewerken.</p>
                                        <p>Voeg hier je content toe. Je kunt teksten bewerken, afbeeldingen toevoegen en AI gebruiken voor tekst generatie.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                },
                { 
                    name: 'Twee Kolommen', 
                    icon: 'columns',
                    desc: 'Tekst in twee kolommen',
                    html: `
                        <section class="py-5 bg-light">
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h3 class="mb-3">Linker Kolom</h3>
                                        <p>Content voor de linker kolom. Klik om te bewerken.</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h3 class="mb-3">Rechter Kolom</h3>
                                        <p>Content voor de rechter kolom. Klik om te bewerken.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                },
                {
                    name: 'Quote/Citaat',
                    icon: 'quote-right',
                    desc: 'Opvallend citaat blok',
                    html: `
                        <section class="py-5">
                            <div class="container">
                                <div class="row">
                                    <div class="col-lg-8 mx-auto text-center">
                                        <blockquote class="blockquote">
                                            <p class="mb-4 fs-4 fst-italic">"Dit is een inspirerend citaat dat de aandacht trekt."</p>
                                            <footer class="blockquote-footer">Auteur Naam</footer>
                                        </blockquote>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                }
            ],
            'Afbeeldingen': [
                {
                    name: 'Afbeelding + Tekst',
                    icon: 'image',
                    desc: 'Afbeelding naast tekst',
                    html: `
                        <section class="py-5">
                            <div class="container">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600" class="img-fluid rounded" alt="Placeholder">
                                    </div>
                                    <div class="col-md-6">
                                        <h3 class="mb-3">Titel Hier</h3>
                                        <p>Beschrijving bij de afbeelding. Klik op de afbeelding om een andere te kiezen via de media selector.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                },
                {
                    name: 'Galerij Grid',
                    icon: 'th',
                    desc: '3 afbeeldingen in grid',
                    html: `
                        <section class="py-5 bg-light">
                            <div class="container">
                                <div class="row g-4">
                                    <div class="col-md-4">
                                        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" class="img-fluid rounded" alt="Gallery 1">
                                    </div>
                                    <div class="col-md-4">
                                        <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400" class="img-fluid rounded" alt="Gallery 2">
                                    </div>
                                    <div class="col-md-4">
                                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" class="img-fluid rounded" alt="Gallery 3">
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                }
            ],
            'Call-to-Action': [
                {
                    name: 'CTA Blok',
                    icon: 'bullhorn',
                    desc: 'Call-to-action met knop',
                    html: `
                        <section class="py-5 bg-primary text-white text-center">
                            <div class="container">
                                <h2 class="mb-3">Klaar om te Beginnen?</h2>
                                <p class="lead mb-4">Neem contact op voor meer informatie</p>
                                <a href="#contact" class="btn btn-light btn-lg">Contact Opnemen</a>
                            </div>
                        </section>
                    `
                },
                {
                    name: 'Feature Boxes',
                    icon: 'th-large',
                    desc: '3 feature boxen',
                    html: `
                        <section class="py-5">
                            <div class="container">
                                <div class="row g-4">
                                    <div class="col-md-4 text-center">
                                        <div class="p-4">
                                            <i class="fas fa-star fa-3x text-primary mb-3"></i>
                                            <h4>Feature 1</h4>
                                            <p>Beschrijving van feature 1</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-center">
                                        <div class="p-4">
                                            <i class="fas fa-heart fa-3x text-primary mb-3"></i>
                                            <h4>Feature 2</h4>
                                            <p>Beschrijving van feature 2</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-center">
                                        <div class="p-4">
                                            <i class="fas fa-rocket fa-3x text-primary mb-3"></i>
                                            <h4>Feature 3</h4>
                                            <p>Beschrijving van feature 3</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `
                }
            ]
        };
        
        // Create modal (same as component library)
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background:white;border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;';
        
        modalContent.innerHTML = `
            <div style="padding:24px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;">
                <h2 style="margin:0;font-size:24px;color:#333;">
                    <i class="fas fa-puzzle-piece" style="color:#667eea;"></i> Sectie Toevoegen
                </h2>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">×</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:24px;" id="sectionLibraryContent"></div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Render sections
        const content = document.getElementById('sectionLibraryContent');
        
        Object.keys(sectionComponents).forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.style.marginBottom = '32px';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.style.cssText = 'font-size:18px;color:#667eea;margin-bottom:16px;display:flex;align-items:center;gap:8px;';
            categoryTitle.innerHTML = `<i class="fas fa-folder"></i> ${category}`;
            categorySection.appendChild(categoryTitle);
            
            const componentsGrid = document.createElement('div');
            componentsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;';
            
            sectionComponents[category].forEach(component => {
                const card = document.createElement('div');
                card.style.cssText = 'border:2px solid #e0e0e0;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;';
                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                        <div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;">
                            <i class="fas fa-${component.icon}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:600;color:#333;">${component.name}</div>
                            <div style="font-size:12px;color:#999;">${component.desc}</div>
                        </div>
                    </div>
                `;
                
                card.onmouseover = () => {
                    card.style.borderColor = '#667eea';
                    card.style.transform = 'translateY(-4px)';
                    card.style.boxShadow = '0 8px 20px rgba(102,126,234,0.2)';
                };
                card.onmouseout = () => {
                    card.style.borderColor = '#e0e0e0';
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                };
                
                card.onclick = () => {
                    modal.remove();
                    this.insertSection(afterSection, component.html);
                };
                
                componentsGrid.appendChild(card);
            });
            
            categorySection.appendChild(componentsGrid);
            content.appendChild(categorySection);
        });
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    insertSection(afterSection, html) {
        console.log('[TemplateEditor] Inserting section...');
        
        try {
            const iframe = document.getElementById('templateFrame');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Create temp container to parse HTML
            const temp = iframeDoc.createElement('div');
            temp.innerHTML = html;
            const newSection = temp.firstElementChild;
            
            // Insert after the specified section
            afterSection.parentNode.insertBefore(newSection, afterSection.nextSibling);
            
            // Re-setup editing for new section
            this.setupIframeEditing();
            
            // Scroll to new section
            newSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            this.showNotification('✅ Sectie toegevoegd!');
        } catch (error) {
            console.error('[TemplateEditor] Error inserting section:', error);
            this.showNotification('❌ Fout bij toevoegen sectie', 'error');
        }
    }
    
    openMenuEditor() {
        console.log('[TemplateEditor] Opening menu editor...');
        
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Find menu in current page
        const menu = iframeDoc.querySelector('.main-menu__list, nav ul, .navbar-nav');
        
        if (!menu) {
            this.showNotification('❌ Geen menu gevonden op deze pagina', 'error');
            return;
        }
        
        // Extract menu structure
        const menuItems = this.extractMenuStructure(menu);
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background:white;border-radius:16px;max-width:1000px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;';
        
        modalContent.innerHTML = `
            <div style="padding:24px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;">
                <h2 style="margin:0;font-size:24px;color:#333;">
                    <i class="fas fa-bars" style="color:#667eea;"></i> Menu Bewerken
                </h2>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">×</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:24px;" id="menuEditorContent">
                <div style="margin-bottom:24px;">
                    <h3 style="font-size:18px;color:#667eea;margin-bottom:16px;">
                        <i class="fas fa-info-circle"></i> Menu Structuur
                    </h3>
                    <p style="color:#666;margin-bottom:16px;">
                        Hier zie je de huidige menu structuur. Je kunt:
                    </p>
                    <ul style="color:#666;margin-bottom:24px;">
                        <li>✏️ Menu items bewerken (tekst en links)</li>
                        <li>📋 Mega menu kopiëren naar andere pagina's</li>
                        <li>🗑️ Items verwijderen</li>
                        <li>➕ Nieuwe items toevoegen</li>
                    </ul>
                </div>
                <div id="menuItemsList"></div>
                <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e0e0e0;">
                    <button onclick="templateEditor.copyMenuToAllPages()" style="width:100%;padding:12px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                        <i class="fas fa-copy"></i> Kopieer Menu naar Alle Pagina's
                    </button>
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Render menu items
        this.renderMenuItems(menuItems, menu);
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
    
    extractMenuStructure(menu) {
        const items = [];
        const topLevelItems = menu.querySelectorAll(':scope > li');
        
        topLevelItems.forEach((li, index) => {
            const link = li.querySelector(':scope > a');
            const isMegaMenu = li.classList.contains('megamenu');
            const hasDropdown = li.classList.contains('dropdown');
            
            const item = {
                index: index,
                text: link ? link.textContent.trim() : '',
                href: link ? link.getAttribute('href') : '#',
                isMegaMenu: isMegaMenu,
                hasDropdown: hasDropdown,
                element: li
            };
            
            // Extract submenu if exists
            if (hasDropdown || isMegaMenu) {
                const submenu = li.querySelector(':scope > ul');
                if (submenu) {
                    item.submenuHTML = submenu.outerHTML;
                }
            }
            
            items.push(item);
        });
        
        return items;
    }
    
    renderMenuItems(items, menuElement) {
        const container = document.getElementById('menuItemsList');
        container.innerHTML = '';
        
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:12px;';
            
            let typeLabel = '📄 Normaal';
            let typeColor = '#666';
            if (item.isMegaMenu) {
                typeLabel = '🎨 Mega Menu';
                typeColor = '#667eea';
            } else if (item.hasDropdown) {
                typeLabel = '📂 Dropdown';
                typeColor = '#4CAF50';
            }
            
            card.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <div style="flex:1;">
                        <div style="font-weight:600;color:#333;margin-bottom:4px;">${item.text}</div>
                        <div style="font-size:12px;color:${typeColor};">${typeLabel}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="templateEditor.editMenuItem(${index})" style="padding:8px 16px;background:#667eea;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'">
                            <i class="fas fa-edit"></i> Bewerken
                        </button>
                        <button onclick="templateEditor.deleteMenuItem(${index})" style="padding:8px 16px;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div style="font-size:12px;color:#999;">Link: ${item.href}</div>
            `;
            
            container.appendChild(card);
        });
        
        // Store for later use
        this.currentMenuItems = items;
        this.currentMenuElement = menuElement;
    }
    
    editMenuItem(index) {
        const item = this.currentMenuItems[index];
        
        const newText = prompt('Nieuwe tekst voor menu item:', item.text);
        if (newText && newText !== item.text) {
            const link = item.element.querySelector(':scope > a');
            if (link) {
                link.textContent = newText;
                item.text = newText;
                this.showNotification('✅ Menu item bijgewerkt!');
                
                // Re-render
                this.renderMenuItems(this.currentMenuItems, this.currentMenuElement);
            }
        }
    }
    
    deleteMenuItem(index) {
        const item = this.currentMenuItems[index];
        
        if (!confirm(`Weet je zeker dat je "${item.text}" wilt verwijderen uit het menu?`)) {
            return;
        }
        
        try {
            // Remove from DOM
            item.element.remove();
            
            // Remove from array
            this.currentMenuItems.splice(index, 1);
            
            // Re-render
            this.renderMenuItems(this.currentMenuItems, this.currentMenuElement);
            
            this.showNotification('✅ Menu item verwijderd!');
        } catch (error) {
            console.error('[TemplateEditor] Error deleting menu item:', error);
            this.showNotification('❌ Fout bij verwijderen', 'error');
        }
    }
    
    async copyMenuToAllPages() {
        console.log('[TemplateEditor] Copying menu to all pages...');
        
        if (!confirm('Weet je zeker dat je het huidige menu naar alle pagina\'s wilt kopiëren?')) {
            return;
        }
        
        try {
            const iframe = document.getElementById('templateFrame');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const currentMenu = iframeDoc.querySelector('.main-menu__list, nav ul, .navbar-nav');
            
            if (!currentMenu) {
                this.showNotification('❌ Geen menu gevonden', 'error');
                return;
            }
            
            // Get menu HTML
            const menuHTML = currentMenu.outerHTML;
            
            // Store menu for applying to other pages
            localStorage.setItem('template_menu_copy', menuHTML);
            
            this.showNotification('✅ Menu gekopieerd! Wordt toegepast op alle pagina\'s bij opslaan.');
            
            // Close modal safely
            const modal = document.querySelector('[style*="position:fixed"]');
            if (modal) {
                modal.remove();
            }
            
        } catch (error) {
            console.error('[TemplateEditor] Error copying menu:', error);
            this.showNotification('❌ Fout bij kopiëren menu', 'error');
        }
    }
    
    openWebsiteSettings() {
        const propertiesPanel = document.getElementById('propertiesContent');
        
        // Get current brand colors from CSS variables or defaults
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const rootStyles = window.getComputedStyle(iframeDoc.documentElement);
        
        // Get template defaults
        const defaults = this.templateDefaults || {};
        
        propertiesPanel.innerHTML = `
            <div class="property-section">
                <div class="property-title">
                    <i class="fas fa-palette"></i> Brand Kleuren
                </div>
                
                <!-- Color Preview -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;padding:12px;background:#f9f9f9;border-radius:8px;">
                    <div style="text-align:center;">
                        <div id="primaryPreview" style="width:100%;height:40px;border-radius:6px;background:${defaults.primaryColor || '#FF8C00'};margin-bottom:4px;"></div>
                        <small style="color:#666;font-size:10px;">Primair</small>
                    </div>
                    <div style="text-align:center;">
                        <div id="secondaryPreview" style="width:100%;height:40px;border-radius:6px;background:${defaults.secondaryColor || '#667eea'};margin-bottom:4px;"></div>
                        <small style="color:#666;font-size:10px;">Secundair</small>
                    </div>
                    <div style="text-align:center;">
                        <div id="accentPreview" style="width:100%;height:40px;border-radius:6px;background:${defaults.accentColor || '#465b2d'};margin-bottom:4px;"></div>
                        <small style="color:#666;font-size:10px;">Accent</small>
                    </div>
                </div>
                
                <div class="property-field">
                    <label class="property-label">Primaire Kleur</label>
                    <input type="color" class="property-input" id="primaryColor" value="${defaults.primaryColor || '#FF8C00'}" onchange="document.getElementById('primaryPreview').style.background = this.value">
                    <small style="color:#666;font-size:11px;">Hoofdkleur voor buttons, links, etc.</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Secundaire Kleur</label>
                    <input type="color" class="property-input" id="secondaryColor" value="${defaults.secondaryColor || '#667eea'}" onchange="document.getElementById('secondaryPreview').style.background = this.value">
                    <small style="color:#666;font-size:11px;">Accent kleur voor highlights</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Accent Kleur</label>
                    <input type="color" class="property-input" id="accentColor" value="${defaults.accentColor || '#465b2d'}" onchange="document.getElementById('accentPreview').style.background = this.value">
                    <small style="color:#666;font-size:11px;">Extra accent kleur (${this.templateName === 'tripix' ? 'groen' : 'zwart'})</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Tekst Kleur</label>
                    <input type="color" class="property-input" id="textColor" value="${defaults.textColor || '#333333'}">
                </div>
                <div class="property-field">
                    <label class="property-label">Titel Kleur</label>
                    <input type="color" class="property-input" id="titleColor" value="${defaults.titleColor || '#141414'}">
                </div>
                <div class="property-field">
                    <label class="property-label">Footer Achtergrond</label>
                    <input type="color" class="property-input" id="footerBgColor" value="${defaults.footerBgColor || '#1a1a1a'}">
                    <small style="color:#666;font-size:11px;">Achtergrondkleur voor footer</small>
                </div>
            </div>
            
            <div class="property-section">
                <div class="property-title">
                    <i class="fas fa-font"></i> Typografie
                </div>
                <div class="property-field">
                    <label class="property-label">Body Font</label>
                    <select class="property-input" id="primaryFont">
                        <option value="Rubik" ${defaults.primaryFont === 'Rubik' ? 'selected' : ''}>Rubik</option>
                        <option value="Plus Jakarta Sans" ${defaults.primaryFont === 'Plus Jakarta Sans' ? 'selected' : ''}>Plus Jakarta Sans</option>
                        <option value="Poppins" ${defaults.primaryFont === 'Poppins' ? 'selected' : ''}>Poppins</option>
                        <option value="Roboto" ${defaults.primaryFont === 'Roboto' ? 'selected' : ''}>Roboto</option>
                        <option value="Open Sans" ${defaults.primaryFont === 'Open Sans' ? 'selected' : ''}>Open Sans</option>
                        <option value="Lato" ${defaults.primaryFont === 'Lato' ? 'selected' : ''}>Lato</option>
                        <option value="Montserrat" ${defaults.primaryFont === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                    </select>
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.primaryFont || 'Rubik'}</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Title Font</label>
                    <select class="property-input" id="titleFont">
                        <option value="Abril Fatface" ${defaults.titleFont === 'Abril Fatface' ? 'selected' : ''}>Abril Fatface</option>
                        <option value="Plus Jakarta Sans" ${defaults.titleFont === 'Plus Jakarta Sans' ? 'selected' : ''}>Plus Jakarta Sans</option>
                        <option value="Playfair Display" ${defaults.titleFont === 'Playfair Display' ? 'selected' : ''}>Playfair Display</option>
                        <option value="Montserrat" ${defaults.titleFont === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                        <option value="Poppins" ${defaults.titleFont === 'Poppins' ? 'selected' : ''}>Poppins</option>
                    </select>
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.titleFont || 'Abril Fatface'}</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Body Font Size</label>
                    <input type="number" class="property-input" id="bodySize" value="${parseInt(defaults.bodySize) || 14}" min="12" max="20">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.bodySize || '14px'}</small>
                </div>
            </div>
            
            <div class="property-section">
                <div class="property-title">
                    <i class="fas fa-text-height"></i> Heading Sizes
                </div>
                <div class="property-field">
                    <label class="property-label">H1 Size (px)</label>
                    <input type="number" class="property-input" id="h1Size" value="${parseInt(defaults.h1Size) || 90}" min="30" max="120">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.h1Size || '90px'}</small>
                </div>
                <div class="property-field">
                    <label class="property-label">H2 Size (px)</label>
                    <input type="number" class="property-input" id="h2Size" value="${parseInt(defaults.h2Size) || 45}" min="24" max="80">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.h2Size || '45px'}</small>
                </div>
                <div class="property-field">
                    <label class="property-label">H3 Size (px)</label>
                    <input type="number" class="property-input" id="h3Size" value="${parseInt(defaults.h3Size) || 40}" min="20" max="60">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.h3Size || '40px'}</small>
                </div>
            </div>
            
            <div class="property-section">
                <div class="property-title">
                    <i class="fas fa-ruler-horizontal"></i> Layout & Spacing
                </div>
                <div class="property-field">
                    <label class="property-label">Section Spacing (px)</label>
                    <input type="number" class="property-input" id="sectionSpace" value="${parseInt(defaults.sectionSpace) || 120}" min="60" max="200" step="10">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.sectionSpace || '120px'}</small>
                </div>
                <div class="property-field">
                    <label class="property-label">Container Width (px)</label>
                    <input type="number" class="property-input" id="containerWidth" value="${parseInt(defaults.containerWidth) || 1300}" min="1000" max="1600" step="50">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.containerWidth || '1300px'}</small>
                </div>
            </div>
            
            <div class="property-section">
                <div class="property-title">
                    <i class="fas fa-image"></i> Brand Logo
                </div>
                <div class="property-field">
                    <div id="logoPreview" style="width:100%;height:120px;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;border:2px dashed #ddd;">
                        <span style="color:#999;font-size:14px;">Geen logo geselecteerd</span>
                    </div>
                    <label class="property-label">Logo URL</label>
                    <input type="text" class="property-input" id="logoUrl" placeholder="https://example.com/logo.png" onchange="templateEditor.updateLogoPreview()">
                    <small style="color:#666;font-size:11px;">Of kies een afbeelding</small>
                </div>
                <button class="media-selector-btn" onclick="templateEditor.selectLogo()">
                    <i class="fas fa-image"></i> Kies Logo
                </button>
                <div class="property-field" style="margin-top:12px;">
                    <label class="property-label">Logo Max Width (px)</label>
                    <input type="number" class="property-input" id="logoMaxWidth" value="${parseInt(defaults.logoMaxWidth) || 200}" min="100" max="400" step="10">
                    <small style="color:#666;font-size:11px;">Template default: ${defaults.logoMaxWidth || '200px'}</small>
                </div>
            </div>
            
            <div class="property-section">
                <button class="btn btn-primary" style="width:100%;" onclick="templateEditor.applyWebsiteSettings()">
                    <i class="fas fa-check"></i> Instellingen Toepassen
                </button>
                <button class="btn btn-secondary" style="width:100%;margin-top:8px;" onclick="templateEditor.resetToDefaults()">
                    <i class="fas fa-undo"></i> Reset naar Template Defaults
                </button>
            </div>
        `;
    }
    
    updateLogoPreview() {
        const logoUrl = document.getElementById('logoUrl').value;
        const preview = document.getElementById('logoPreview');
        
        if (logoUrl) {
            preview.innerHTML = `<img src="${logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="Logo Preview">`;
        } else {
            preview.innerHTML = '<span style="color:#999;font-size:14px;">Geen logo geselecteerd</span>';
        }
    }
    
    async selectLogo() {
        try {
            console.log('[TemplateEditor] Opening media picker for logo...');
            const result = await window.MediaPicker.openImage();
            console.log('[TemplateEditor] Media picker result:', result);
            
            // MediaPicker can return either url (from URL/Unsplash) or dataUrl (from upload)
            const logoUrl = result?.url || result?.dataUrl;
            
            if (logoUrl) {
                console.log('[TemplateEditor] Setting logo URL:', logoUrl.substring(0, 50) + '...');
                document.getElementById('logoUrl').value = logoUrl;
                this.updateLogoPreview();
                this.showNotification('✅ Logo geselecteerd!');
            } else {
                console.warn('[TemplateEditor] No URL or dataUrl in result:', result);
                this.showNotification('⚠️ Geen afbeelding geselecteerd', 'warning');
            }
        } catch (err) {
            console.error('[TemplateEditor] Logo selection error:', err);
            this.showNotification('❌ Fout bij selecteren logo', 'error');
        }
    }
    
    applyWebsiteSettings() {
        console.log('[TemplateEditor] Applying website settings...');
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;
        const accentColor = document.getElementById('accentColor').value;
        const textColor = document.getElementById('textColor').value;
        const titleColor = document.getElementById('titleColor').value;
        const footerBgColor = document.getElementById('footerBgColor').value;
        const logoUrl = document.getElementById('logoUrl').value;
        const primaryFont = document.getElementById('primaryFont').value;
        
        console.log('[TemplateEditor] Colors:', {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            text: textColor,
            title: titleColor,
            footer: footerBgColor
        });
        
        // Calculate hover color
        const primaryHover = this.adjustColor(primaryColor, -20);
        
        // Apply colors via CSS variables
        const style = iframeDoc.createElement('style');
        style.id = 'wb-brand-styles';
        
        // Remove existing brand styles
        const existing = iframeDoc.getElementById('wb-brand-styles');
        if (existing) existing.remove();
        
        style.textContent = `
            :root {
                --brand-primary: ${primaryColor};
                --brand-secondary: ${secondaryColor};
                --brand-accent: ${accentColor};
                --brand-text: ${textColor};
                --brand-title: ${titleColor};
                --brand-font: ${primaryFont}, sans-serif;
                
                /* Override ALL Tripix CSS variables */
                --theme-color: ${primaryColor};
                --theme-color-rgb: ${this.hexToRgb(primaryColor)};
                --second-theme-color: ${secondaryColor};
                --second-theme-color-rgb: ${this.hexToRgb(secondaryColor)};
                --third-theme-color: ${accentColor};
                --third-theme-color-rgb: ${this.hexToRgb(accentColor)};
                --body-color: ${textColor};
                --body-color-rgb: ${this.hexToRgb(textColor)};
                --title-color: ${titleColor};
                --title-color-rgb: ${this.hexToRgb(titleColor)};
                
                /* Override ALL Gotur CSS variables */
                --gotur-primary: ${primaryColor};
                --gotur-primary-rgb: ${this.hexToRgb(primaryColor)};
                --gotur-base: ${secondaryColor};
                --gotur-base-rgb: ${this.hexToRgb(secondaryColor)};
                --gotur-text: ${textColor};
                --gotur-text-rgb: ${this.hexToRgb(textColor)};
            }
            
            /* Apply primary color to buttons, links, and accents */
            .vs-btn, .btn-primary, .theme-btn, button[type="submit"],
            .btn, .tour-packages-next, .tour-packages-prev,
            .gotur-btn, .gotur-btn--primary {
                background-color: ${primaryColor} !important;
                border-color: ${primaryColor} !important;
            }
            
            .vs-btn:hover, .btn-primary:hover, .theme-btn:hover,
            .gotur-btn:hover, .gotur-btn--primary:hover {
                background-color: ${primaryHover} !important;
            }
            
            /* Only color specific accent text elements - NOT all links/text */
            .sec-subtitle, .section-subtitle,
            .blog-card__meta a:hover,
            .destination-card__title a:hover {
                color: ${primaryColor} !important;
            }
            
            /* Footer links - only in footer */
            footer a:not(.btn):not(.vs-btn), 
            .footer a:not(.btn):not(.vs-btn), 
            .footer-widget a:not(.btn):not(.vs-btn) {
                color: ${primaryColor} !important;
            }
            
            footer a:hover, .footer a:hover {
                color: ${primaryHover} !important;
            }
            
            /* Footer buttons and subscribe */
            footer button, .footer button, .footer .btn,
            .footer-widget button, .subscribe-btn {
                background-color: ${primaryColor} !important;
                border-color: ${primaryColor} !important;
            }
            
            footer button:hover, .footer button:hover {
                background-color: ${primaryHover} !important;
            }
            
            /* Apply secondary color to specific background classes only */
            /* BUT preserve background images! */
            .bg-theme-color:not([data-bg-src]):not([style*="background-image"]), 
            .price-off:not([data-bg-src]):not([style*="background-image"]),
            .bg-second-theme-color:not([data-bg-src]):not([style*="background-image"]), 
            .bg-secondary-color:not([data-bg-src]):not([style*="background-image"]),
            .secondary-bg:not([data-bg-src]):not([style*="background-image"]), 
            .sec-bg:not([data-bg-src]):not([style*="background-image"]) {
                background-color: ${secondaryColor} !important;
            }
            
            /* For elements WITH background images, use overlay approach */
            .bg-second-theme-color[data-bg-src],
            .bg-second-theme-color[style*="background-image"] {
                background-blend-mode: multiply !important;
                background-color: ${secondaryColor} !important;
            }
            
            /* Override template accent BACKGROUNDS only - not text colors */
            .bg-third-theme-color, .bg-accent-color,
            .accent-bg, .highlight-bg {
                background-color: ${primaryColor} !important;
            }
            
            /* Only specific text accent elements */
            .text-theme-color:not(a):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(p) {
                color: ${primaryColor} !important;
            }
            
            /* Service boxes and cards - use primary for accents */
            .service-box .service-icon,
            .destination-box .destination-icon,
            .feature-icon, .icon-box {
                background-color: ${primaryColor} !important;
                color: white !important;
            }
            
            /* Ensure button text is always white */
            .vs-btn, .btn-primary, .theme-btn, button[type="submit"],
            .btn, .tour-packages-next, .tour-packages-prev,
            footer button, .footer button, .footer .btn {
                color: white !important;
            }
            
            /* Fix green-on-green issue: ensure contrast */
            .vs-btn.style-4, .btn.style-4 {
                background-color: ${primaryColor} !important;
                color: white !important;
            }
            
            /* Footer CTA bar - use primary color */
            .footer-cta, .footer-cta.bg-third-theme-color {
                background-color: ${primaryColor} !important;
            }
            
            /* Footer background color - very specific to override template styles */
            footer, .footer, .footer-one, .footer-two,
            .main-footer, .site-footer,
            footer.footer-one, footer.footer-two,
            .footer-one__top, .footer-one__bottom,
            .footer-two__top, .footer-two__bottom,
            section.footer, section.footer-one, section.footer-two {
                background-color: ${footerBgColor} !important;
                background-image: none !important;
            }
            
            /* Override any footer section backgrounds except CTA */
            footer *:not(.footer-cta), .footer *:not(.footer-cta), 
            .footer-one *:not(.footer-cta), .footer-two *:not(.footer-cta) {
                background-color: transparent !important;
            }
            
            /* But keep the main footer background */
            footer, .footer, .footer-one, .footer-two {
                background-color: ${footerBgColor} !important;
            }
            
            /* Fix Adventures section background text */
            .vs-feature-style1 h2.position-absolute {
                opacity: 0.08 !important;
                color: rgba(255, 255, 255, 0.08) !important;
                pointer-events: none !important;
            }
            
            /* Apply font */
            body, h1, h2, h3, h4, h5, h6, p {
                font-family: var(--brand-font) !important;
            }
        `;
        
        iframeDoc.head.appendChild(style);
        console.log('[TemplateEditor] Brand styles added to HEAD ✓');
        console.log('[TemplateEditor] Style element ID:', style.id);
        console.log('[TemplateEditor] Style content length:', style.textContent.length);
        
        // Update logo if provided
        if (logoUrl) {
            // Find all logo images in header
            const logos = iframeDoc.querySelectorAll('header img, .logo img, .main-header__logo img, .header-logo img, [class*="logo"] img');
            console.log('[TemplateEditor] Found', logos.length, 'logo images');
            
            logos.forEach(logo => {
                // Skip if it's not actually a logo (too small or wrong location)
                if (logo.width > 30 || logo.height > 30) {
                    logo.src = logoUrl;
                    logo.style.maxHeight = '60px';
                    logo.style.width = 'auto';
                    console.log('[TemplateEditor] Updated logo:', logo);
                }
            });
            
            if (logos.length === 0) {
                console.warn('[TemplateEditor] No logo images found in header');
            }
        }
        
        console.log('[TemplateEditor] Website settings applied successfully ✓');
        this.showNotification('✅ Instellingen toegepast!');
    }
    
    extractColorsFromBrandStyles(cssText) {
        console.log('[TemplateEditor] Extracting colors from brand styles...');
        
        // Extract colors using regex
        const primaryMatch = cssText.match(/--brand-primary:\s*(#[0-9a-fA-F]{6})/);
        const secondaryMatch = cssText.match(/--brand-secondary:\s*(#[0-9a-fA-F]{6})/);
        const accentMatch = cssText.match(/--brand-accent:\s*(#[0-9a-fA-F]{6})/);
        const textMatch = cssText.match(/--brand-text:\s*(#[0-9a-fA-F]{6})/);
        const titleMatch = cssText.match(/--brand-title:\s*(#[0-9a-fA-F]{6})/);
        
        // Update settings panel inputs
        if (primaryMatch && document.getElementById('primaryColor')) {
            document.getElementById('primaryColor').value = primaryMatch[1];
            console.log('[TemplateEditor] Set primary color:', primaryMatch[1]);
        }
        if (secondaryMatch && document.getElementById('secondaryColor')) {
            document.getElementById('secondaryColor').value = secondaryMatch[1];
            console.log('[TemplateEditor] Set secondary color:', secondaryMatch[1]);
        }
        if (accentMatch && document.getElementById('accentColor')) {
            document.getElementById('accentColor').value = accentMatch[1];
            console.log('[TemplateEditor] Set accent color:', accentMatch[1]);
        }
        if (textMatch && document.getElementById('textColor')) {
            document.getElementById('textColor').value = textMatch[1];
            console.log('[TemplateEditor] Set text color:', textMatch[1]);
        }
        if (titleMatch && document.getElementById('titleColor')) {
            document.getElementById('titleColor').value = titleMatch[1];
            console.log('[TemplateEditor] Set title color:', titleMatch[1]);
        }
        
        // Update color previews
        if (primaryMatch) document.getElementById('primaryPreview').style.background = primaryMatch[1];
        if (secondaryMatch) document.getElementById('secondaryPreview').style.background = secondaryMatch[1];
        if (accentMatch) document.getElementById('accentPreview').style.background = accentMatch[1];
        if (textMatch) document.getElementById('textPreview').style.background = textMatch[1];
        if (titleMatch) document.getElementById('titlePreview').style.background = titleMatch[1];
        
        // Extract logo from iframe and update settings panel
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (iframeDoc) {
            const logoImg = iframeDoc.querySelector('header img.logo, .logo img, .main-header__logo img, .header-logo img, [class*="logo"] img');
            if (logoImg && logoImg.src && logoImg.src.startsWith('data:image')) {
                console.log('[TemplateEditor] Extracting logo from iframe...');
                document.getElementById('logoUrl').value = logoImg.src;
                this.updateLogoPreview();
                console.log('[TemplateEditor] Logo extracted and set ✓');
            }
        }
        
        console.log('[TemplateEditor] Colors extracted and applied to settings panel ✓');
    }
    
    resetToDefaults() {
        if (!confirm('Weet je zeker dat je alle instellingen wilt resetten naar de template defaults?')) {
            return;
        }
        
        const defaults = this.templateDefaults || {};
        
        // Reset all inputs to defaults
        if (document.getElementById('primaryColor')) document.getElementById('primaryColor').value = defaults.primaryColor || '#FF8C00';
        if (document.getElementById('secondaryColor')) document.getElementById('secondaryColor').value = defaults.secondaryColor || '#667eea';
        if (document.getElementById('accentColor')) document.getElementById('accentColor').value = defaults.accentColor || '#465b2d';
        if (document.getElementById('textColor')) document.getElementById('textColor').value = defaults.textColor || '#333333';
        if (document.getElementById('titleColor')) document.getElementById('titleColor').value = defaults.titleColor || '#141414';
        if (document.getElementById('footerBgColor')) document.getElementById('footerBgColor').value = defaults.footerBgColor || '#1a1a1a';
        if (document.getElementById('primaryFont')) document.getElementById('primaryFont').value = defaults.primaryFont || 'Rubik';
        if (document.getElementById('titleFont')) document.getElementById('titleFont').value = defaults.titleFont || 'Abril Fatface';
        if (document.getElementById('bodySize')) document.getElementById('bodySize').value = parseInt(defaults.bodySize) || 14;
        if (document.getElementById('h1Size')) document.getElementById('h1Size').value = parseInt(defaults.h1Size) || 90;
        if (document.getElementById('h2Size')) document.getElementById('h2Size').value = parseInt(defaults.h2Size) || 45;
        if (document.getElementById('h3Size')) document.getElementById('h3Size').value = parseInt(defaults.h3Size) || 40;
        if (document.getElementById('sectionSpace')) document.getElementById('sectionSpace').value = parseInt(defaults.sectionSpace) || 120;
        if (document.getElementById('containerWidth')) document.getElementById('containerWidth').value = parseInt(defaults.containerWidth) || 1300;
        if (document.getElementById('logoMaxWidth')) document.getElementById('logoMaxWidth').value = parseInt(defaults.logoMaxWidth) || 200;
        
        this.showNotification('🔄 Instellingen gereset naar template defaults!');
    }
    
    adjustColor(color, amount) {
        const num = parseInt(color.slice(1), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    hexToRgb(hex) {
        const num = parseInt(hex.slice(1), 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `${r}, ${g}, ${b}`;
    }
}

// Global functions
function previewSite() {
    templateEditor.previewSite();
}

function saveDraft() {
    templateEditor.saveDraft();
}

function clearDraft() {
    if (confirm('⚠️ Weet je zeker dat je alle wijzigingen wilt verwijderen en terug wilt naar het originele template?')) {
        // Clear localStorage
        localStorage.removeItem(`template_draft_${templateEditor.templateName}`);
        
        // Clear Supabase draft
        if (templateEditor.supabase && templateEditor.brandId) {
            templateEditor.supabase
                .from('template_drafts')
                .delete()
                .eq('brand_id', templateEditor.brandId)
                .eq('template', templateEditor.templateName)
                .then(() => {
                    console.log('[TemplateEditor] Draft cleared from Supabase');
                });
        }
        
        // Reload page to load original template
        window.location.reload();
    }
}

function publishSite() {
    templateEditor.publishSite();
}

// Initialize editor when page loads
let templateEditor;
document.addEventListener('DOMContentLoaded', () => {
    templateEditor = new TemplateEditor();
});
