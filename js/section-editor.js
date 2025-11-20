/**
 * Section-Based Editor for Tailwind Template
 * No iframe - Direct section editing with form panels
 */

class SectionEditor {
    constructor() {
        this.pages = [
            { id: 'home', name: 'Home', icon: 'home', file: 'index.html' },
            { id: 'about', name: 'About', icon: 'info-circle', file: 'about-1.html' },
            { id: 'trips', name: 'Trips', icon: 'plane', file: 'tour-1-grid.html' },
            { id: 'destinations', name: 'Destinations', icon: 'map-marked-alt', file: 'destination-1-grid.html' },
            { id: 'blog', name: 'Blog', icon: 'newspaper', file: 'blog-grid.html' },
            { id: 'contact', name: 'Contact', icon: 'envelope', file: 'contact.html' }
        ];
        
        this.currentPage = null;
        this.currentSection = null;
        this.sections = {};
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Section Editor...');
        
        // Render page list
        this.renderPageList();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Section Editor initialized!');
    }
    
    renderPageList() {
        const pageList = document.getElementById('pageList');
        pageList.innerHTML = '';
        
        this.pages.forEach(page => {
            const pageItem = document.createElement('div');
            pageItem.className = 'mb-2';
            
            pageItem.innerHTML = `
                <button class="page-btn w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-between group"
                        data-page-id="${page.id}">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-${page.icon} text-blue-600"></i>
                        <span class="font-medium text-gray-800">${page.name}</span>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400 group-hover:text-blue-600 transition"></i>
                </button>
                <div class="section-list ml-8 mt-2 space-y-1 hidden" data-page-id="${page.id}">
                    <!-- Sections will be loaded here -->
                </div>
            `;
            
            pageList.appendChild(pageItem);
        });
    }
    
    setupEventListeners() {
        // Page button clicks
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pageId = e.currentTarget.dataset.pageId;
                this.loadPage(pageId);
            });
        });
        
        // Close panel button
        document.getElementById('closePanelBtn').addEventListener('click', () => {
            this.closeEditPanel();
        });
        
        // Cancel edit button
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeEditPanel();
        });
        
        // Form submit
        document.getElementById('sectionEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSectionChanges();
        });
        
        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.openPreview();
        });
        
        // Save all button
        document.getElementById('saveAllBtn').addEventListener('click', () => {
            this.saveAll();
        });
    }
    
    async loadPage(pageId) {
        console.log('📄 Loading page:', pageId);
        
        this.currentPage = pageId;
        const page = this.pages.find(p => p.id === pageId);
        
        if (!page) {
            console.error('Page not found:', pageId);
            return;
        }
        
        // Highlight active page
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-l-4', 'border-blue-600');
        });
        const activeBtn = document.querySelector(`[data-page-id="${pageId}"]`);
        activeBtn.classList.add('bg-blue-100', 'border-l-4', 'border-blue-600');
        
        // Load page HTML
        try {
            const response = await fetch(`/templates/package/src/${page.file}`);
            const html = await response.text();
            
            // Parse sections from HTML
            this.parseSections(html, pageId);
            
            // Render sections list
            this.renderSectionsList(pageId);
            
            // Render preview
            this.renderPreview(html);
            
            this.showNotification(`✅ Loaded ${page.name} page`, 'success');
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showNotification('❌ Failed to load page', 'error');
        }
    }
    
    parseSections(html, pageId) {
        console.log('🔍 Parsing sections from HTML...');
        
        // Create a temporary DOM to parse
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find all major sections (sections with classes or IDs)
        const sectionElements = doc.querySelectorAll('section, [class*="section"], .hero, [id*="section"]');
        
        this.sections[pageId] = [];
        
        sectionElements.forEach((section, index) => {
            const sectionData = {
                id: section.id || `section-${index}`,
                name: this.getSectionName(section, index),
                html: section.outerHTML,
                type: this.detectSectionType(section),
                data: this.extractSectionData(section)
            };
            
            this.sections[pageId].push(sectionData);
        });
        
        console.log(`✅ Found ${this.sections[pageId].length} sections`);
    }
    
    getSectionName(section, index) {
        // Try to get a meaningful name from the section
        const heading = section.querySelector('h1, h2, h3');
        if (heading) {
            return heading.textContent.trim().substring(0, 30);
        }
        
        // Check for common class names
        if (section.classList.contains('hero')) return 'Hero Section';
        if (section.classList.contains('about')) return 'About Section';
        if (section.classList.contains('services')) return 'Services Section';
        if (section.classList.contains('gallery')) return 'Gallery Section';
        if (section.classList.contains('contact')) return 'Contact Section';
        
        return `Section ${index + 1}`;
    }
    
    detectSectionType(section) {
        // Detect section type based on content
        if (section.classList.contains('hero') || section.querySelector('.hero')) return 'hero';
        if (section.querySelector('form')) return 'form';
        if (section.querySelectorAll('img').length > 3) return 'gallery';
        if (section.querySelector('.swiper, [class*="slider"]')) return 'slider';
        return 'content';
    }
    
    extractSectionData(section) {
        // Extract editable data from section
        const data = {
            headings: [],
            paragraphs: [],
            images: [],
            links: [],
            buttons: []
        };
        
        // Extract headings
        section.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
            data.headings.push({
                tag: h.tagName.toLowerCase(),
                text: h.textContent.trim(),
                element: h.outerHTML
            });
        });
        
        // Extract paragraphs
        section.querySelectorAll('p').forEach(p => {
            if (p.textContent.trim()) {
                data.paragraphs.push(p.textContent.trim());
            }
        });
        
        // Extract images
        section.querySelectorAll('img').forEach(img => {
            data.images.push({
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || '',
                element: img.outerHTML
            });
        });
        
        // Extract buttons
        section.querySelectorAll('button, a.btn, [class*="button"]').forEach(btn => {
            data.buttons.push({
                text: btn.textContent.trim(),
                href: btn.getAttribute('href') || '',
                element: btn.outerHTML
            });
        });
        
        return data;
    }
    
    renderSectionsList(pageId) {
        const sectionList = document.querySelector(`.section-list[data-page-id="${pageId}"]`);
        sectionList.innerHTML = '';
        sectionList.classList.remove('hidden');
        
        const sections = this.sections[pageId] || [];
        
        sections.forEach((section, index) => {
            const sectionItem = document.createElement('button');
            sectionItem.className = 'section-item w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition flex items-center justify-between text-sm';
            sectionItem.dataset.sectionIndex = index;
            
            sectionItem.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-puzzle-piece text-purple-500 text-xs"></i>
                    <span class="text-gray-700">${section.name}</span>
                </div>
                <i class="fas fa-edit text-gray-400 text-xs"></i>
            `;
            
            sectionItem.addEventListener('click', () => {
                this.editSection(pageId, index);
            });
            
            sectionList.appendChild(sectionItem);
        });
    }
    
    renderPreview(html) {
        const previewArea = document.getElementById('previewArea');
        
        // Create iframe for preview to maintain proper styling
        previewArea.innerHTML = `
            <iframe id="previewFrame" 
                    class="w-full h-full min-h-screen border-0"
                    sandbox="allow-same-origin allow-scripts">
            </iframe>
        `;
        
        const iframe = document.getElementById('previewFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Write HTML to iframe
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Fix image paths in iframe
        setTimeout(() => {
            this.fixImagePaths(iframeDoc);
        }, 100);
    }
    
    fixImagePaths(doc) {
        // Fix all image src paths to be absolute
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/templates')) {
                img.src = `/templates/package/src/${src}`;
            }
        });
        
        // Fix CSS background images
        doc.querySelectorAll('[style*="background-image"]').forEach(el => {
            const style = el.getAttribute('style');
            if (style && style.includes('url(')) {
                const newStyle = style.replace(/url\(['"]?(?!http|\/templates)([^'"]+)['"]?\)/g, 
                    'url(/templates/package/src/$1)');
                el.setAttribute('style', newStyle);
            }
        });
    }
    
    editSection(pageId, sectionIndex) {
        console.log('✏️ Editing section:', pageId, sectionIndex);
        
        this.currentSection = { pageId, sectionIndex };
        const section = this.sections[pageId][sectionIndex];
        
        // Show edit panel
        const editPanel = document.getElementById('editPanel');
        editPanel.classList.remove('hidden');
        editPanel.classList.add('slide-in');
        
        // Update panel title
        document.getElementById('editPanelTitle').textContent = section.name;
        
        // Generate form fields
        this.generateFormFields(section);
    }
    
    generateFormFields(section) {
        const formFields = document.getElementById('formFields');
        formFields.innerHTML = '';
        
        const data = section.data;
        
        // Headings
        if (data.headings.length > 0) {
            const headingsSection = document.createElement('div');
            headingsSection.innerHTML = '<h3 class="font-bold text-gray-800 mb-3 flex items-center"><i class="fas fa-heading mr-2 text-blue-600"></i>Headings</h3>';
            
            data.headings.forEach((heading, index) => {
                const field = this.createTextField(`heading_${index}`, heading.tag.toUpperCase(), heading.text);
                headingsSection.appendChild(field);
            });
            
            formFields.appendChild(headingsSection);
        }
        
        // Paragraphs
        if (data.paragraphs.length > 0) {
            const parasSection = document.createElement('div');
            parasSection.className = 'mt-6';
            parasSection.innerHTML = '<h3 class="font-bold text-gray-800 mb-3 flex items-center"><i class="fas fa-paragraph mr-2 text-green-600"></i>Text Content</h3>';
            
            data.paragraphs.forEach((para, index) => {
                const field = this.createTextArea(`paragraph_${index}`, `Paragraph ${index + 1}`, para);
                parasSection.appendChild(field);
            });
            
            formFields.appendChild(parasSection);
        }
        
        // Images
        if (data.images.length > 0) {
            const imagesSection = document.createElement('div');
            imagesSection.className = 'mt-6';
            imagesSection.innerHTML = '<h3 class="font-bold text-gray-800 mb-3 flex items-center"><i class="fas fa-image mr-2 text-purple-600"></i>Images</h3>';
            
            data.images.forEach((img, index) => {
                const field = this.createImageField(`image_${index}`, `Image ${index + 1}`, img.src, img.alt);
                imagesSection.appendChild(field);
            });
            
            formFields.appendChild(imagesSection);
        }
        
        // Buttons
        if (data.buttons.length > 0) {
            const buttonsSection = document.createElement('div');
            buttonsSection.className = 'mt-6';
            buttonsSection.innerHTML = '<h3 class="font-bold text-gray-800 mb-3 flex items-center"><i class="fas fa-mouse-pointer mr-2 text-orange-600"></i>Buttons</h3>';
            
            data.buttons.forEach((btn, index) => {
                const field = this.createTextField(`button_${index}`, `Button ${index + 1}`, btn.text);
                buttonsSection.appendChild(field);
            });
            
            formFields.appendChild(buttonsSection);
        }
    }
    
    createTextField(name, label, value) {
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
            <input type="text" 
                   name="${name}" 
                   value="${this.escapeHtml(value)}"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        `;
        return div;
    }
    
    createTextArea(name, label, value) {
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
            <textarea name="${name}" 
                      rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">${this.escapeHtml(value)}</textarea>
        `;
        return div;
    }
    
    createImageField(name, label, src, alt) {
        const div = document.createElement('div');
        div.className = 'mb-4 p-4 bg-gray-50 rounded-lg';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
            <div class="flex items-center space-x-4">
                <img src="/templates/package/src/${src}" alt="${alt}" class="w-24 h-24 object-cover rounded-lg border-2 border-gray-300">
                <div class="flex-1">
                    <input type="text" 
                           name="${name}_src" 
                           value="${this.escapeHtml(src)}"
                           placeholder="Image path"
                           class="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm">
                    <input type="text" 
                           name="${name}_alt" 
                           value="${this.escapeHtml(alt)}"
                           placeholder="Alt text"
                           class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <button type="button" class="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition">
                        <i class="fas fa-upload mr-1"></i> Upload New
                    </button>
                </div>
            </div>
        `;
        return div;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveSectionChanges() {
        console.log('💾 Saving section changes...');
        
        const formData = new FormData(document.getElementById('sectionEditForm'));
        const { pageId, sectionIndex } = this.currentSection;
        const section = this.sections[pageId][sectionIndex];
        
        // Update section data with form values
        let updatedHtml = section.html;
        
        // Update headings
        section.data.headings.forEach((heading, index) => {
            const newText = formData.get(`heading_${index}`);
            if (newText) {
                updatedHtml = updatedHtml.replace(heading.text, newText);
                heading.text = newText;
            }
        });
        
        // Update paragraphs
        section.data.paragraphs.forEach((para, index) => {
            const newText = formData.get(`paragraph_${index}`);
            if (newText) {
                updatedHtml = updatedHtml.replace(para, newText);
                section.data.paragraphs[index] = newText;
            }
        });
        
        // Update buttons
        section.data.buttons.forEach((btn, index) => {
            const newText = formData.get(`button_${index}`);
            if (newText) {
                updatedHtml = updatedHtml.replace(btn.text, newText);
                btn.text = newText;
            }
        });
        
        // Update section HTML
        section.html = updatedHtml;
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Refresh preview
        this.refreshPreview();
        
        this.showNotification('✅ Changes saved!', 'success');
        this.closeEditPanel();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('tailwind_sections', JSON.stringify(this.sections));
        console.log('💾 Saved to localStorage');
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('tailwind_sections');
        if (saved) {
            this.sections = JSON.parse(saved);
            console.log('📂 Loaded from localStorage');
        }
    }
    
    refreshPreview() {
        if (this.currentPage) {
            // Rebuild HTML with updated sections
            const sections = this.sections[this.currentPage];
            const updatedHtml = sections.map(s => s.html).join('\n');
            
            // Re-render preview
            this.renderPreview(updatedHtml);
        }
    }
    
    closeEditPanel() {
        document.getElementById('editPanel').classList.add('hidden');
        this.currentSection = null;
    }
    
    openPreview() {
        if (!this.currentPage) {
            this.showNotification('⚠️ Please select a page first', 'warning');
            return;
        }
        
        // Open preview in new window
        const sections = this.sections[this.currentPage];
        const html = sections.map(s => s.html).join('\n');
        
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(html);
        previewWindow.document.close();
    }
    
    saveAll() {
        this.saveToLocalStorage();
        this.showNotification('✅ All changes saved!', 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } text-white animate-bounce`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sectionEditor = new SectionEditor();
});
