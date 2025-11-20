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
        console.log('🚀 Initializing Tailwind Editor v2.6 SELECTIVE...');
        console.log('📅 Build: 2025-11-20 10:21');
        
        // FORCE CLEAR OLD SAVED PAGES (always clear for now)
        // This ensures we always load fresh templates with new CSS
        console.log('🧹 Clearing all saved pages...');
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('tailwind_page_')) {
                localStorage.removeItem(key);
                console.log('  ✓ Cleared:', key);
            }
        });
        console.log('✅ All pages cleared - loading fresh templates!');
        
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
        
        const iframe = document.getElementById('pageFrame');
        
        // Check if iframe has content
        if (!iframe.classList.contains('hidden')) {
            try {
                // Get the EDITED HTML from iframe
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const fullHtml = iframeDoc.documentElement.outerHTML;
                
                // Open in new window with edited content
                const previewWindow = window.open('', '_blank', 'width=1200,height=800');
                previewWindow.document.write(fullHtml);
                previewWindow.document.close();
                
                this.showNotification('👁️ Preview opened with your changes!', 'success');
                return;
            } catch (error) {
                console.error('Cannot access iframe content:', error);
                this.showNotification('⚠️ Cannot preview - security restriction', 'error');
                return;
            }
        }
        
        // Fallback: try canvas content
        const canvas = document.getElementById('canvasSections');
        const html = canvas.innerHTML;
        
        if (html.trim()) {
            // Open in new window
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Preview - ${this.currentPage}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link rel="stylesheet" href="/templates/package/src/assets/css/style.css">
                    <link rel="stylesheet" href="/templates/package/src/assets/vendor/swiper/swiper-bundle.min.css">
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `);
        } else {
            this.showNotification('⚠️ No content to preview', 'error');
        }
    }
    
    publish() {
        console.log('🚀 Publishing...');
        this.showNotification('🚀 Publishing feature coming soon!', 'info');
    }
    
    createNewPage() {
        // Show template picker modal
        this.showTemplatePicker();
    }
    
    showTemplatePicker() {
        const modal = document.getElementById('templatePickerModal');
        const grid = document.getElementById('templateGrid');
        
        // Available templates
        const templates = [
            { name: 'Home - Main', file: 'index.html', icon: 'home', category: 'Home' },
            { name: 'Home - Style 2', file: 'index-2.html', icon: 'home', category: 'Home' },
            { name: 'Home - Style 3', file: 'index-3.html', icon: 'home', category: 'Home' },
            { name: 'About Us', file: 'about-1.html', icon: 'info-circle', category: 'About' },
            { name: 'Tours Grid', file: 'tour-1-grid.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours Grid Right', file: 'tour-1-grid-right.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours Style 2', file: 'tour-2-grid.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours Style 2 Right', file: 'tour-2-grid-right.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours Style 3', file: 'tour-3-grid.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours Style 3 Right', file: 'tour-3-grid-right.html', icon: 'plane', category: 'Tours' },
            { name: 'Tours List', file: 'tour-list-style.html', icon: 'list', category: 'Tours' },
            { name: 'Tour Detail', file: 'tour-detail.html', icon: 'plane', category: 'Tours' },
            { name: 'Destinations Grid', file: 'destination-1-grid.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destinations Left', file: 'destination-1-left.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destinations Style 2', file: 'destination-2-grid.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destinations Style 2 Left', file: 'destination-2-left.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destinations Style 3', file: 'destination-3-grid.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destinations Style 3 Left', file: 'destination-3-left.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Destination Detail', file: 'destination-detail.html', icon: 'map-marked-alt', category: 'Destinations' },
            { name: 'Blog Grid', file: 'blog-grid.html', icon: 'newspaper', category: 'Blog' },
            { name: 'Blog Grid Left', file: 'blog-grid-left.html', icon: 'newspaper', category: 'Blog' },
            { name: 'Blog List Left', file: 'blog-list-left.html', icon: 'list', category: 'Blog' },
            { name: 'Blog Detail', file: 'blog-detail.html', icon: 'newspaper', category: 'Blog' },
            { name: 'Contact', file: 'contact.html', icon: 'envelope', category: 'Contact' },
            { name: 'Gallery', file: 'gallery.html', icon: 'images', category: 'Other' },
            { name: 'Services', file: 'services.html', icon: 'concierge-bell', category: 'Other' },
            { name: 'Service Detail', file: 'service-detail.html', icon: 'concierge-bell', category: 'Other' },
            { name: 'Our Team', file: 'our-team.html', icon: 'users', category: 'Other' },
            { name: 'Team Detail', file: 'our-team-detail.html', icon: 'user', category: 'Other' },
            { name: 'Testimonials', file: 'testimonial.html', icon: 'quote-left', category: 'Other' },
            { name: 'Pricing', file: 'pricing.html', icon: 'tag', category: 'Other' },
            { name: 'FAQ', file: 'faq.html', icon: 'question-circle', category: 'Other' },
            { name: '404 Error', file: 'error-404.html', icon: 'exclamation-triangle', category: 'Other' }
        ];
        
        // Category colors
        const categoryColors = {
            'Home': 'from-orange-500 to-red-500',
            'About': 'from-blue-500 to-indigo-600',
            'Tours': 'from-sky-500 to-blue-600',
            'Destinations': 'from-green-500 to-emerald-600',
            'Blog': 'from-purple-500 to-pink-600',
            'Contact': 'from-red-500 to-rose-600',
            'Other': 'from-gray-500 to-slate-600'
        };
        
        // Render templates grouped by category
        grid.innerHTML = '';
        
        // Group by category
        const grouped = {};
        templates.forEach(t => {
            if (!grouped[t.category]) grouped[t.category] = [];
            grouped[t.category].push(t);
        });
        
        // Render each category
        Object.keys(grouped).forEach(category => {
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'col-span-full mt-6 mb-2';
            categoryHeader.innerHTML = `
                <h3 class="text-xl font-bold text-gray-800 flex items-center">
                    <span class="w-2 h-8 bg-gradient-to-b ${categoryColors[category]} rounded mr-3"></span>
                    ${category}
                    <span class="ml-2 text-sm text-gray-500 font-normal">(${grouped[category].length})</span>
                </h3>
            `;
            grid.appendChild(categoryHeader);
            
            // Templates in this category
            grouped[category].forEach(template => {
                const card = document.createElement('div');
                card.className = 'bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition cursor-pointer';
                card.innerHTML = `
                    <div class="h-40 bg-gradient-to-br ${categoryColors[category]} flex items-center justify-center relative">
                        <i class="fas fa-${template.icon} text-6xl text-white opacity-80"></i>
                        <div class="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-semibold">
                            ${category}
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-800 mb-3">${template.name}</h3>
                        <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                            <i class="fas fa-plus mr-2"></i>Gebruik Template
                        </button>
                    </div>
                `;
            
            card.querySelector('button').addEventListener('click', () => {
                this.selectTemplate(template);
            });
            
                grid.appendChild(card);
            });
        });
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Close button
        document.getElementById('closeTemplatePickerBtn').onclick = () => {
            modal.classList.add('hidden');
        };
    }
    
    selectTemplate(template) {
        const name = prompt(`Naam voor nieuwe pagina:`, template.name);
        if (!name) return;
        
        const id = name.toLowerCase().replace(/\s+/g, '-');
        
        this.pages.push({
            id,
            name,
            icon: template.icon,
            file: template.file
        });
        
        // Close modal
        document.getElementById('templatePickerModal').classList.add('hidden');
        
        // Switch to new page
        this.renderPagesList();
        this.switchPage(id);
        
        this.showNotification(`✅ Pagina "${name}" aangemaakt!`, 'success');
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
        
        // Check if we have saved changes
        const saved = localStorage.getItem(`tailwind_page_${page}`);
        if (saved) {
            console.log('📂 Found saved version, loading...');
            this.loadSavedPage(page, saved);
        } else {
            console.log('📄 No saved version, loading fresh template...');
            this.loadPageTemplate(page);
        }
    }
    
    loadSavedPage(pageId, savedData) {
        const iframe = document.getElementById('pageFrame');
        const emptyState = document.getElementById('emptyState');
        
        try {
            const data = JSON.parse(savedData);
            
            // Hide empty state, show iframe
            emptyState.classList.add('hidden');
            iframe.classList.remove('hidden');
            
            // Write saved HTML to iframe
            iframe.srcdoc = data.html;
            
            // Wait for iframe to load
            iframe.onload = () => {
                console.log('✅ Saved page loaded');
                
                // Make iframe content editable
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    this.makeIframeEditable(iframeDoc);
                    this.showNotification(`✅ Loaded saved ${pageId} page`, 'success');
                } catch (error) {
                    console.error('Cannot access iframe content:', error);
                }
            };
        } catch (error) {
            console.error('Failed to load saved page:', error);
            // Fallback to fresh template
            this.loadPageTemplate(pageId);
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
            
            // Load page normally first (so CSS paths work)
            iframe.src = `/templates/package/src/${htmlFile}`;
            
            // Wait for iframe to load
            iframe.onload = () => {
                console.log('✅ Page loaded in iframe');
                
                // NOW remove scripts from the loaded document
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // Remove problematic scripts AFTER page loaded
                    console.log('🧹 Removing JavaScript from loaded page...');
                    const scripts = iframeDoc.querySelectorAll('script[src]');
                    let removedCount = 0;
                    scripts.forEach(script => {
                        const src = script.getAttribute('src') || '';
                        if (src.includes('swiper') || 
                            src.includes('main.js') || 
                            src.includes('jquery') || 
                            src.includes('bootstrap')) {
                            script.remove();
                            removedCount++;
                            console.log('  🛑 Removed:', src);
                        }
                    });
                    console.log(`✅ Removed ${removedCount} script(s), CSS preserved`);
                    
                    // Make iframe content editable
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
        console.log('🎨 Making iframe editable...');
        
        // Add editing styles
        const style = iframeDoc.createElement('style');
        style.textContent = `
            /* HIDE NAVIGATION AND HEADER IN EDITOR */
            .site-header,
            header:not(.template-name),
            .header,
            nav,
            .navigation,
            .navbar,
            .menu,
            .main-bar-wraper,
            .loading-area,
            .cursor,
            .cursor2,
            footer,
            .footer,
            .site-footer,
            [class*="header"],
            [class*="Header"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
            }
            
            /* Clean body layout */
            body {
                padding: 0 !important;
                margin: 0 !important;
            }
            
            /* Make page-wraper full width */
            .page-wraper {
                padding: 0 !important;
                margin: 0 !important;
            }
            
            /* DISABLE SLIDERS/CAROUSELS IN EDITOR */
            .swiper-container,
            .swiper,
            .swiper-wrapper,
            [class*="swiper"],
            [class*="slider"],
            [class*="carousel"],
            [data-swiper] {
                pointer-events: none !important;
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
            
            /* Lock slider position */
            .swiper-wrapper {
                transform: translate3d(0, 0, 0) !important;
            }
            
            /* Hide slider navigation */
            .swiper-button-prev,
            .swiper-button-next,
            .swiper-pagination,
            [class*="arrow"],
            [class*="prev"],
            [class*="next"] {
                display: none !important;
            }
            
            /* But allow editing text inside sliders */
            .swiper-container .editable-element,
            .swiper .editable-element,
            [class*="swiper"] .editable-element {
                pointer-events: auto !important;
            }
            
            /* ONLY pause slider/carousel animations - keep everything else */
            .swiper-wrapper,
            [class*="swiper"],
            [class*="slider"],
            [class*="carousel"] {
                animation: none !important;
                animation-play-state: paused !important;
                transition: none !important;
            }
            
            /* But keep editing transitions */
            .editable-element:hover,
            [contenteditable="true"] {
                transition: outline 0.2s ease, background 0.2s ease !important;
            }
            
            /* CRITICAL: Allow scrolling */
            html, body, .page-content, .page-wraper {
                overflow: visible !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                height: auto !important;
                max-height: none !important;
            }
            
            /* Editable elements hover */
            .editable-element:hover {
                outline: 2px dashed #3b82f6 !important;
                outline-offset: 2px;
                cursor: pointer !important;
                position: relative;
            }
            
            /* Active editing */
            [contenteditable="true"] {
                outline: 3px solid #3b82f6 !important;
                outline-offset: 2px;
                background: rgba(59, 130, 246, 0.05) !important;
            }
            
            /* Edit indicator */
            .editable-element:hover::after {
                content: '✏️ Click to edit';
                position: absolute;
                top: -25px;
                left: 0;
                background: #3b82f6;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                z-index: 10000;
                pointer-events: none;
            }
            
            /* Hide edit indicator when editing */
            [contenteditable="true"]::after {
                display: none !important;
            }
        `;
        iframeDoc.head.appendChild(style);
        
        // Disable ALL sliders, carousels, and template scripts
        try {
            const iframeWindow = iframeDoc.defaultView;
            
            // NUCLEAR OPTION: Disable ALL template JavaScript
            // Remove all script tags from the iframe
            iframeDoc.querySelectorAll('script').forEach(script => {
                if (script.src && (
                    script.src.includes('swiper') ||
                    script.src.includes('main.js') ||
                    script.src.includes('jquery') ||
                    script.src.includes('bootstrap')
                )) {
                    script.remove();
                    console.log('🛑 Removed script:', script.src);
                }
            });
            
            // Override common animation functions
            if (iframeWindow) {
                iframeWindow.requestAnimationFrame = () => {};
                iframeWindow.setInterval = () => {};
                iframeWindow.setTimeout = (fn, delay) => {
                    // Only allow very short timeouts (for essential functionality)
                    if (delay && delay < 100) {
                        return window.setTimeout(fn, delay);
                    }
                    return 0;
                };
            }
            
            // Stop Swiper instances
            if (iframeWindow.Swiper) {
                iframeDoc.querySelectorAll('.swiper, [class*="swiper"]').forEach(swiperEl => {
                    if (swiperEl.swiper) {
                        swiperEl.swiper.destroy(true, true);
                        console.log('🛑 Stopped Swiper instance');
                    }
                });
            }
            
            // Stop all existing timers
            const highestId = window.setTimeout(() => {}, 0);
            for (let i = 0; i < highestId; i++) {
                window.clearTimeout(i);
                window.clearInterval(i);
            }
            console.log('🛑 Cleared all timers');
            
            // Disable all slider navigation buttons
            iframeDoc.querySelectorAll('[class*="prev"], [class*="next"], [class*="arrow"], .swiper-button-prev, .swiper-button-next').forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.3';
            });
            
            console.log('✅ All scripts and animations disabled');
        } catch (error) {
            console.log('Error disabling scripts:', error);
        }
        
        // Make text elements editable (including badges, tags, and small text)
        const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, a, span, li, td, th, button, label, div[class*="badge"], div[class*="tag"], small, em, strong, b, i';
        iframeDoc.querySelectorAll(editableSelectors).forEach(el => {
            // Skip if no text content or only whitespace
            if (!el.textContent || !el.textContent.trim()) return;
            
            // Skip elements inside forms or with specific classes
            if (el.closest('form') || el.closest('.no-edit')) return;
            
            // Skip if it's a container with many children (likely not meant to be edited as one)
            if (el.children.length > 3) return;
            
            el.classList.add('editable-element');
            
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editElement(el, iframeDoc);
            });
        });
        
        // Make images clickable for future image upload
        iframeDoc.querySelectorAll('img').forEach(img => {
            img.style.cursor = 'pointer';
            img.title = 'Click to change image (coming soon)';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('🖼️ Image upload coming soon!', 'info');
            });
        });
        
        console.log('✅ Iframe is now editable!');
    }
    
    editElement(element, iframeDoc) {
        // Don't edit if already editing
        if (element.contentEditable === 'true') return;
        
        console.log('✏️ Editing element:', element.tagName);
        
        // Store original content
        const originalContent = element.innerHTML;
        
        // Make element editable
        element.contentEditable = true;
        element.focus();
        
        // Select all text
        const iframeWindow = iframeDoc.defaultView;
        const range = iframeDoc.createRange();
        range.selectNodeContents(element);
        const sel = iframeWindow.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Handle keyboard shortcuts
        const handleKeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            } else if (e.key === 'Escape') {
                element.innerHTML = originalContent;
                element.blur();
            }
        };
        
        element.addEventListener('keydown', handleKeydown);
        
        // Save on blur
        const handleBlur = () => {
            element.contentEditable = false;
            element.removeEventListener('keydown', handleKeydown);
            element.removeEventListener('blur', handleBlur);
            
            // Check if content changed
            if (element.innerHTML !== originalContent) {
                console.log('💾 Content changed, saving...');
                this.save();
                this.showNotification('✅ Text updated!', 'success');
            }
        };
        
        element.addEventListener('blur', handleBlur);
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
