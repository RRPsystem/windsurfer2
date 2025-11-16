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
        this.templateName = urlParams.get('template') || 'gotur';
        this.brandId = urlParams.get('brand_id');
        this.token = urlParams.get('token');
        this.apiKey = urlParams.get('apikey');
        this.apiUrl = urlParams.get('api') || 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1';
        
        this.init();
    }
    
    async init() {
        console.log('[TemplateEditor] Initializing...');
        
        // Initialize Supabase if we have credentials
        if (this.apiKey) {
            const supabaseUrl = this.apiUrl.replace('/functions/v1', '');
            this.supabase = supabase.createClient(supabaseUrl, this.apiKey);
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
        
        // Hide loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
    }
    
    async loadTemplatePages() {
        console.log('[TemplateEditor] Loading template pages...');
        
        // Define pages for each template
        const templatePages = {
            'gotur': [
                { name: 'Home', path: 'index.html', icon: 'home' },
                { name: 'About', path: 'about.html', icon: 'info-circle' },
                { name: 'Tours', path: 'tour-listing-1.html', icon: 'map-marked-alt' },
                { name: 'Tour Detail', path: 'tour-details-1.html', icon: 'map-marker-alt' },
                { name: 'Destinations', path: 'destination.html', icon: 'globe' },
                { name: 'Blog', path: 'blog.html', icon: 'newspaper' },
                { name: 'Contact', path: 'contact.html', icon: 'envelope' }
            ],
            'tripix': [
                { name: 'Home', path: 'index.html', icon: 'home' },
                { name: 'About', path: 'about.html', icon: 'info-circle' },
                { name: 'Trips', path: 'trips.html', icon: 'plane' },
                { name: 'Destinations', path: 'destinations.html', icon: 'map' },
                { name: 'Blog', path: 'blog.html', icon: 'newspaper' },
                { name: 'Contact', path: 'contact.html', icon: 'phone' }
            ]
        };
        
        this.pages = templatePages[this.templateName] || templatePages['gotur'];
        
        // Render pages list
        this.renderPagesList();
        
        // Load first page
        if (this.pages.length > 0) {
            await this.loadPage(this.pages[0]);
        }
    }
    
    renderPagesList() {
        const pagesList = document.getElementById('pagesList');
        pagesList.innerHTML = '';
        
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
        
        // Load page in iframe
        const baseUrl = `templates/${this.templateName}/${this.templateName === 'gotur' ? 'gotur-html-main' : ''}`;
        const pageUrl = `${baseUrl}/${page.path}`;
        
        const iframe = document.getElementById('templateFrame');
        iframe.src = pageUrl;
        
        // Wait for iframe to load
        iframe.onload = () => {
            this.setupIframeEditing();
        };
    }
    
    setupIframeEditing() {
        console.log('[TemplateEditor] Setting up iframe editing...');
        
        const iframe = document.getElementById('templateFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Inject editing styles
        const style = iframeDoc.createElement('style');
        style.textContent = `
            .wb-editable {
                outline: 2px dashed transparent;
                transition: outline 0.2s;
                cursor: pointer;
                position: relative;
            }
            
            .wb-editable:hover {
                outline: 2px dashed #667eea;
                background: rgba(102, 126, 234, 0.05);
            }
            
            .wb-editable.wb-selected {
                outline: 2px solid #667eea;
                background: rgba(102, 126, 234, 0.1);
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
            
            .wb-quick-actions {
                position: absolute;
                top: 8px;
                right: 8px;
                display: none;
                gap: 4px;
                z-index: 1001;
            }
            
            .wb-editable:hover .wb-quick-actions {
                display: flex;
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
        `;
        iframeDoc.head.appendChild(style);
        
        // Make text elements editable
        this.makeTextEditable(iframeDoc);
        
        // Make images editable
        this.makeImagesEditable(iframeDoc);
    }
    
    makeTextEditable(doc) {
        // Find all text elements
        const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, div.text-content';
        const textElements = doc.querySelectorAll(textSelectors);
        
        textElements.forEach(element => {
            // Skip if element is empty or only contains images
            if (!element.textContent.trim() || element.querySelector('img')) return;
            
            // Skip navigation and script elements
            if (element.closest('nav, script, style, .skip-edit')) return;
            
            element.classList.add('wb-editable', 'wb-text');
            
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectElement(element, 'text');
            });
        });
    }
    
    makeImagesEditable(doc) {
        const images = doc.querySelectorAll('img');
        
        images.forEach(img => {
            // Skip small icons
            if (img.width < 50 && img.height < 50) return;
            
            img.classList.add('wb-editable', 'wb-image');
            
            // Wrap in container if not already
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
                // Automatically open media selector
                setTimeout(() => this.openMediaSelector(), 100);
            });
            
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectElement(img, 'image');
            });
        });
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
        
        // Add edit label
        const label = iframeDoc.createElement('div');
        label.className = 'wb-edit-label';
        label.textContent = type === 'text' ? '✏️ Tekst bewerken' : '🖼️ Afbeelding wijzigen';
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
                        <i class="fas fa-palette"></i> Styling
                    </div>
                    <div class="property-field">
                        <label class="property-label">Tekstkleur</label>
                        <input type="color" class="property-input" id="textColor" value="${this.getComputedColor(element)}">
                    </div>
                    <div class="property-field">
                        <label class="property-label">Lettergrootte</label>
                        <input type="number" class="property-input" id="fontSize" value="${parseInt(window.getComputedStyle(element).fontSize)}" min="8" max="72">
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
    
    applyTextChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'text') return;
        
        const element = this.selectedElement.element;
        const newText = document.getElementById('textContent').value;
        const newColor = document.getElementById('textColor').value;
        const newSize = document.getElementById('fontSize').value;
        
        element.textContent = newText;
        element.style.color = newColor;
        element.style.fontSize = newSize + 'px';
        
        this.showNotification('✅ Tekst bijgewerkt!');
    }
    
    applyImageChanges() {
        if (!this.selectedElement || this.selectedElement.type !== 'image') return;
        
        const element = this.selectedElement.element;
        const newWidth = document.getElementById('imageWidth').value;
        const newHeight = document.getElementById('imageHeight').value;
        
        if (newWidth) element.style.width = newWidth;
        if (newHeight) element.style.height = newHeight;
        
        this.showNotification('✅ Afbeelding bijgewerkt!');
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
            // TODO: Integrate with your AI service
            // For now, simulate AI generation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const variations = [
                `Ontdek de wereld met onze unieke reizen en beleef onvergetelijke avonturen.`,
                `Maak je reis onvergetelijk met onze professionele begeleiding en service.`,
                `Ervaar de mooiste bestemmingen ter wereld met onze zorgvuldig samengestelde reizen.`
            ];
            
            const newText = variations[Math.floor(Math.random() * variations.length)];
            document.getElementById('textContent').value = newText;
            
            this.showNotification('✨ AI tekst gegenereerd!');
        } catch (error) {
            console.error('[TemplateEditor] AI generation error:', error);
            this.showNotification('❌ Fout bij genereren', 'error');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
    
    async openMediaSelector() {
        if (!this.selectedElement || this.selectedElement.type !== 'image') return;
        
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
            
            if (result && result.url) {
                // Update image in iframe
                this.selectedElement.element.src = result.url;
                
                // If there's alt text, update it
                if (result.alt) {
                    this.selectedElement.element.alt = result.alt;
                }
                
                // Refresh properties panel to show new image
                this.showPropertiesPanel(this.selectedElement.element, 'image');
                
                this.showNotification('✅ Afbeelding bijgewerkt!');
            }
        } catch (error) {
            console.error('[TemplateEditor] Media selector error:', error);
            
            // If user cancelled, don't show error
            if (error.message !== 'User cancelled') {
                this.showNotification('❌ Fout bij selecteren afbeelding', 'error');
            }
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
}

// Global functions
function previewSite() {
    templateEditor.showNotification('👁️ Preview openen...');
    // TODO: Implement preview
}

function saveDraft() {
    templateEditor.showNotification('💾 Opslaan...');
    // TODO: Implement save
}

function publishSite() {
    if (confirm('Weet je zeker dat je de website wilt publiceren?')) {
        templateEditor.showNotification('🚀 Publiceren...');
        // TODO: Implement publish
    }
}

// Initialize editor when page loads
let templateEditor;
document.addEventListener('DOMContentLoaded', () => {
    templateEditor = new TemplateEditor();
});
