/**
 * Tailwind Website Builder - Component-Based Editor
 * Drag & drop sections, live editing, auto-save
 */

class TailwindEditor {
    constructor() {
        this.sections = [];
        this.selectedSection = null;
        this.history = [];
        this.historyIndex = -1;
        this.currentPage = 'home';
        this.sectionsData = null;
        this.pages = [
            { id: 'home', name: 'Home', icon: 'home', file: 'index.html' },
            { id: 'about', name: 'About', icon: 'info-circle', file: 'about.html' },
            { id: 'trips', name: 'Trips', icon: 'plane', file: 'trips.html' },
            { id: 'destinations', name: 'Destinations', icon: 'map-marked-alt', file: 'destinations.html' },
            { id: 'blog', name: 'Blog', icon: 'newspaper', file: 'blog.html' },
            { id: 'contact', name: 'Contact', icon: 'envelope', file: 'contact.html' }
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Tailwind Editor...');
        
        // Load sections data
        await this.loadSectionsData();
        
        // Setup UI
        this.renderPagesList();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.renderSectionLibrary();
        
        console.log('✅ Editor initialized!');
    }
    
    async loadSectionsData() {
        try {
            const response = await fetch('/data/tailwind-sections.json');
            this.sectionsData = await response.json();
            console.log(`📦 Loaded ${this.sectionsData.totalSections} sections`);
        } catch (error) {
            console.error('❌ Failed to load sections:', error);
            // Fallback to empty data
            this.sectionsData = { sections: [], grouped: {} };
        }
    }
    
    renderPagesList() {
        const pagesList = document.getElementById('pagesList');
        pagesList.innerHTML = '';
        
        this.pages.forEach(page => {
            const pageCard = document.createElement('div');
            pageCard.className = `page-card px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between ${
                page.id === this.currentPage ? 'active' : 'bg-gray-50 hover:bg-gray-100'
            }`;
            pageCard.dataset.pageId = page.id;
            
            pageCard.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-${page.icon} mr-3 ${page.id === this.currentPage ? 'text-white' : 'text-gray-600'}"></i>
                    <div>
                        <div class="font-semibold ${page.id === this.currentPage ? 'text-white' : 'text-gray-800'}">${page.name}</div>
                        <div class="text-xs ${page.id === this.currentPage ? 'text-white/80' : 'text-gray-500'}">${page.file}</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button class="settings-page-btn p-1.5 rounded hover:bg-white/20" title="Settings">
                        <i class="fas fa-cog text-sm ${page.id === this.currentPage ? 'text-white' : 'text-gray-600'}"></i>
                    </button>
                    <button class="delete-page-btn p-1.5 rounded hover:bg-white/20" title="Delete">
                        <i class="fas fa-trash text-sm ${page.id === this.currentPage ? 'text-white' : 'text-gray-600'}"></i>
                    </button>
                </div>
            `;
            
            // Click to switch page
            pageCard.addEventListener('click', (e) => {
                if (!e.target.closest('.settings-page-btn') && !e.target.closest('.delete-page-btn')) {
                    this.switchPage(page.id);
                }
            });
            
            // Settings button
            pageCard.querySelector('.settings-page-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPageSettings(page);
            });
            
            // Delete button
            pageCard.querySelector('.delete-page-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePage(page.id);
            });
            
            pagesList.appendChild(pageCard);
        });
    }
    
    setupEventListeners() {
        // New page button
        document.getElementById('newPageBtn').addEventListener('click', () => {
            this.createNewPage();
        });
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });
        
        // Search
        document.getElementById('sectionSearch').addEventListener('input', (e) => {
            this.searchSections(e.target.value);
        });
        
        // Top bar actions
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('saveBtn').addEventListener('click', () => this.save());
        document.getElementById('previewBtn').addEventListener('click', () => this.preview());
        document.getElementById('publishBtn').addEventListener('click', () => this.publish());
        
        // Properties panel actions
        document.getElementById('duplicateSectionBtn')?.addEventListener('click', () => this.duplicateSection());
        document.getElementById('deleteSectionBtn')?.addEventListener('click', () => this.deleteSection());
        
        // Page selector
        document.getElementById('pageSelector').addEventListener('change', (e) => {
            this.switchPage(e.target.value);
        });
    }
    
    setupDragAndDrop() {
        const canvas = document.getElementById('canvasSections');
        
        // Make canvas sortable
        new Sortable(canvas, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            handle: '.drag-handle',
            onEnd: (evt) => {
                this.saveState();
                console.log('Section moved:', evt.oldIndex, '→', evt.newIndex);
            }
        });
    }
    
    renderSectionLibrary(filter = null) {
        const grid = document.getElementById('sectionsGrid');
        grid.innerHTML = '';
        
        if (!this.sectionsData || !this.sectionsData.sections) {
            grid.innerHTML = '<p class="text-gray-500 text-center py-8">No sections available</p>';
            return;
        }
        
        let sections = this.sectionsData.sections;
        
        // Apply filter
        if (filter && filter !== 'all') {
            sections = sections.filter(s => s.type === filter);
        }
        
        // Render section cards
        sections.forEach(section => {
            const card = this.createSectionCard(section);
            grid.appendChild(card);
        });
        
        if (sections.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 text-center py-8">No sections found</p>';
        }
    }
    
    createSectionCard(section) {
        const card = document.createElement('div');
        card.className = 'section-card bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer';
        card.dataset.sectionId = section.id;
        
        // Preview thumbnail (placeholder for now)
        const previewBg = section.previewImage 
            ? `background-image: url('${section.previewImage}')`
            : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        card.innerHTML = `
            <div class="h-32 bg-gray-100 flex items-center justify-center" style="${previewBg}; background-size: cover;">
                <i class="fas fa-${this.getSectionIcon(section.type)} text-4xl text-white opacity-50"></i>
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-gray-800 text-sm mb-1">${section.title}</h3>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${section.type}</span>
                    <span>${section.imageCount || 0} images</span>
                </div>
            </div>
        `;
        
        // Click to add section
        card.addEventListener('click', () => {
            this.addSectionToCanvas(section);
        });
        
        return card;
    }
    
    getSectionIcon(type) {
        const icons = {
            hero: 'image',
            tours: 'plane',
            destinations: 'map-marked-alt',
            gallery: 'images',
            blog: 'newspaper',
            contact: 'envelope',
            testimonials: 'quote-left',
            features: 'star',
            pricing: 'tag',
            team: 'users',
            cta: 'bullhorn',
            stats: 'chart-bar',
            faq: 'question-circle',
            services: 'concierge-bell'
        };
        return icons[type] || 'cube';
    }
    
    addSectionToCanvas(sectionData, skipSave = false) {
        const canvas = document.getElementById('canvasSections');
        const emptyState = document.getElementById('emptyState');
        
        // Hide empty state
        if (emptyState && !emptyState.classList.contains('hidden')) {
            emptyState.classList.add('hidden');
            canvas.classList.remove('hidden');
        }
        
        // Create section element
        const sectionEl = document.createElement('div');
        sectionEl.className = 'canvas-section relative';
        sectionEl.dataset.sectionId = sectionData.id;
        sectionEl.dataset.sectionType = sectionData.type;
        
        // Add controls
        const controls = document.createElement('div');
        controls.className = 'section-controls flex gap-2 bg-white rounded-lg shadow-lg p-2';
        controls.innerHTML = `
            <button class="drag-handle px-3 py-1 text-gray-600 hover:text-gray-800 cursor-move" title="Drag to reorder">
                <i class="fas fa-grip-vertical"></i>
            </button>
            <button class="edit-section px-3 py-1 text-blue-600 hover:text-blue-800" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="duplicate-section px-3 py-1 text-green-600 hover:text-green-800" title="Duplicate">
                <i class="fas fa-copy"></i>
            </button>
            <button class="delete-section px-3 py-1 text-red-600 hover:text-red-800" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Add section HTML
        const content = document.createElement('div');
        let html = sectionData.html;
        
        // Fix relative image paths
        html = html.replace(/src="assets\//g, 'src="/templates/package/src/assets/');
        html = html.replace(/src="\.\/assets\//g, 'src="/templates/package/src/assets/');
        
        content.innerHTML = html;
        
        sectionEl.appendChild(controls);
        sectionEl.appendChild(content);
        
        // Add event listeners
        controls.querySelector('.edit-section').addEventListener('click', () => {
            this.selectSection(sectionEl);
        });
        controls.querySelector('.duplicate-section').addEventListener('click', () => {
            this.duplicateSection(sectionEl);
        });
        controls.querySelector('.delete-section').addEventListener('click', () => {
            this.deleteSection(sectionEl);
        });
        
        // Add to canvas
        canvas.appendChild(sectionEl);
        
        // Add "Add Section" button after this section
        this.addSectionButton(canvas);
        
        // Save state (unless skipped for batch operations)
        if (!skipSave) {
            this.saveState();
        }
        
        console.log('✅ Added section:', sectionData.title);
    }
    
    addSectionButton(canvas) {
        const addBtn = document.createElement('div');
        addBtn.className = 'add-section-btn relative flex items-center justify-center py-4';
        addBtn.innerHTML = `
            <button class="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
                <i class="fas fa-plus"></i>
                <span>Add Section</span>
            </button>
        `;
        
        addBtn.querySelector('button').addEventListener('click', () => {
            this.showSectionPicker(addBtn);
        });
        
        canvas.appendChild(addBtn);
    }
    
    showSectionPicker(insertAfter) {
        // Show a modal or dropdown with section library
        // For now, just scroll to section library
        document.getElementById('sectionsGrid').scrollIntoView({ behavior: 'smooth' });
        this.showNotification('👆 Select a section from the library on the left', 'info');
    }
    
    selectSection(sectionEl) {
        // Deselect previous
        document.querySelectorAll('.canvas-section').forEach(s => {
            s.classList.remove('ring-4', 'ring-blue-500');
        });
        
        // Select new
        sectionEl.classList.add('ring-4', 'ring-blue-500');
        this.selectedSection = sectionEl;
        
        // Show properties panel
        document.getElementById('noSelection').classList.add('hidden');
        document.getElementById('propertiesForm').classList.remove('hidden');
        
        // Update properties
        const type = sectionEl.dataset.sectionType;
        document.getElementById('selectedSectionType').textContent = 
            type.charAt(0).toUpperCase() + type.slice(1) + ' Section';
    }
    
    duplicateSection(sectionEl = this.selectedSection) {
        if (!sectionEl) return;
        
        const clone = sectionEl.cloneNode(true);
        sectionEl.parentNode.insertBefore(clone, sectionEl.nextSibling);
        
        // Re-attach event listeners
        this.attachSectionEvents(clone);
        
        this.saveState();
        console.log('✅ Section duplicated');
    }
    
    deleteSection(sectionEl = this.selectedSection) {
        if (!sectionEl) return;
        
        if (confirm('Are you sure you want to delete this section?')) {
            sectionEl.remove();
            this.selectedSection = null;
            
            // Hide properties panel
            document.getElementById('noSelection').classList.remove('hidden');
            document.getElementById('propertiesForm').classList.add('hidden');
            
            // Check if canvas is empty
            const canvas = document.getElementById('canvasSections');
            if (canvas.children.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
                canvas.classList.add('hidden');
            }
            
            this.saveState();
            console.log('✅ Section deleted');
        }
    }
    
    attachSectionEvents(sectionEl) {
        const controls = sectionEl.querySelector('.section-controls');
        
        controls.querySelector('.edit-section').addEventListener('click', () => {
            this.selectSection(sectionEl);
        });
        controls.querySelector('.duplicate-section').addEventListener('click', () => {
            this.duplicateSection(sectionEl);
        });
        controls.querySelector('.delete-section').addEventListener('click', () => {
            this.deleteSection(sectionEl);
        });
    }
    
    filterByCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            if (tab.dataset.category === category) {
                tab.classList.remove('bg-gray-200', 'text-gray-700');
                tab.classList.add('bg-blue-600', 'text-white');
            } else {
                tab.classList.remove('bg-blue-600', 'text-white');
                tab.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
        
        // Filter sections
        this.renderSectionLibrary(category === 'all' ? null : category);
    }
    
    searchSections(query) {
        const grid = document.getElementById('sectionsGrid');
        const cards = grid.querySelectorAll('.section-card');
        
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const type = card.querySelector('.bg-blue-100').textContent.toLowerCase();
            
            if (title.includes(query.toLowerCase()) || type.includes(query.toLowerCase())) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    saveState() {
        const canvas = document.getElementById('canvasSections');
        const state = {
            html: canvas.innerHTML,
            timestamp: Date.now()
        };
        
        // Add to history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            console.log('↶ Undo');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            console.log('↷ Redo');
        }
    }
    
    restoreState(state) {
        const canvas = document.getElementById('canvasSections');
        canvas.innerHTML = state.html;
        
        // Re-attach event listeners
        canvas.querySelectorAll('.canvas-section').forEach(section => {
            this.attachSectionEvents(section);
        });
    }
    
    async save() {
        console.log('💾 Saving...');
        
        const iframe = document.getElementById('pageFrame');
        let html = '';
        
        try {
            // Get HTML from iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            html = iframeDoc.documentElement.outerHTML;
        } catch (error) {
            console.error('Cannot access iframe content:', error);
            // Fallback to canvas
            const canvas = document.getElementById('canvasSections');
            html = canvas.innerHTML;
        }
        
        const data = {
            page: this.currentPage,
            html: html,
            timestamp: Date.now()
        };
        
        // TODO: Save to Supabase
        localStorage.setItem(`tailwind_page_${this.currentPage}`, JSON.stringify(data));
        
        // Show success message
        this.showNotification('✅ Saved successfully!', 'success');
    }
    
    preview() {
        console.log('👁️ Opening preview...');
        
        const canvas = document.getElementById('canvasSections');
        const html = canvas.innerHTML;
        
        // Open in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="/templates/package/src/assets/css/style.css">
            </head>
            <body>
                ${html}
            </body>
            </html>
        `);
    }
    
    publish() {
        console.log('🚀 Publishing...');
        this.showNotification('🚀 Publishing feature coming soon!', 'info');
    }
    
    createNewPage() {
        const name = prompt('Enter page name:');
        if (!name) return;
        
        const id = name.toLowerCase().replace(/\s+/g, '-');
        const file = `${id}.html`;
        
        this.pages.push({
            id,
            name,
            icon: 'file',
            file
        });
        
        this.renderPagesList();
        this.switchPage(id);
        this.showNotification(`✅ Page "${name}" created!`, 'success');
    }
    
    showPageSettings(page) {
        this.showNotification('⚙️ Page settings coming soon!', 'info');
    }
    
    deletePage(pageId) {
        if (this.pages.length <= 1) {
            this.showNotification('❌ Cannot delete the last page!', 'error');
            return;
        }
        
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;
        
        if (confirm(`Delete page "${page.name}"?`)) {
            this.pages = this.pages.filter(p => p.id !== pageId);
            
            // Switch to first page if current page was deleted
            if (this.currentPage === pageId) {
                this.switchPage(this.pages[0].id);
            }
            
            this.renderPagesList();
            this.showNotification(`✅ Page "${page.name}" deleted!`, 'success');
        }
    }
    
    switchPage(page) {
        console.log('📄 Switching to page:', page);
        this.currentPage = page;
        this.renderPagesList();
        
        // Load saved page data
        const saved = localStorage.getItem(`tailwind_page_${page}`);
        if (saved) {
            const data = JSON.parse(saved);
            const canvas = document.getElementById('canvasSections');
            canvas.innerHTML = data.html;
            
            // Re-attach events
            canvas.querySelectorAll('.canvas-section').forEach(section => {
                this.attachSectionEvents(section);
            });
            
            // Show canvas
            document.getElementById('emptyState').classList.add('hidden');
            canvas.classList.remove('hidden');
        } else {
            // Load template for this page
            this.loadPageTemplate(page);
        }
    }
    
    async loadPageTemplate(pageId) {
        console.log('📋 Loading template for:', pageId);
        
        const iframe = document.getElementById('pageFrame');
        const emptyState = document.getElementById('emptyState');
        
        // Get HTML file for this page
        const htmlFile = this.getPageHtmlFile(pageId);
        
        if (!htmlFile) {
            // Show empty state
            iframe.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        try {
            // Hide empty state, show iframe
            emptyState.classList.add('hidden');
            iframe.classList.remove('hidden');
            
            // Load page in iframe with correct base path
            iframe.src = `/templates/package/src/${htmlFile}`;
            
            // Wait for iframe to load
            iframe.onload = () => {
                console.log('✅ Page loaded in iframe');
                
                // Make iframe content editable
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // Add editing capabilities
                    this.makeIframeEditable(iframeDoc);
                    
                    this.showNotification(`✅ Loaded ${pageId} page`, 'success');
                } catch (error) {
                    console.error('Cannot access iframe content:', error);
                }
            };
            
        } catch (error) {
            console.error('Failed to load template:', error);
            iframe.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    }
    
    makeIframeEditable(iframeDoc) {
        // Add click-to-edit functionality
        iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button').forEach(el => {
            el.style.cursor = 'pointer';
            el.title = 'Click to edit';
            
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.editElement(el);
            });
        });
        
        // Add hover effect
        const style = iframeDoc.createElement('style');
        style.textContent = `
            [contenteditable="true"] {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px;
            }
        `;
        iframeDoc.head.appendChild(style);
    }
    
    editElement(element) {
        // Make element editable
        element.contentEditable = true;
        element.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Save on blur
        element.addEventListener('blur', () => {
            element.contentEditable = false;
            this.save();
            this.showNotification('✅ Text updated!', 'success');
        }, { once: true });
    }
    
    getPageHtmlFile(pageId) {
        // Map page IDs to actual HTML files
        const pageFiles = {
            'home': 'index.html',
            'about': 'about-1.html',
            'trips': 'tour-1-grid.html',
            'destinations': 'destination-1-grid.html',
            'blog': 'blog-grid.html',
            'contact': 'contact.html'
        };
        
        return pageFiles[pageId] || null;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tailwindEditor = new TailwindEditor();
});
