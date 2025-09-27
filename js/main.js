// Main JavaScript file voor Website Builder
class WebsiteBuilder {
    constructor() {
        this.currentDevice = 'desktop';
        this.isInitialized = false;
        this.init();
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
            this.loadSavedProject();
            
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
            const canvas = document.getElementById('canvas');
            const projectData = {
                html: canvas.innerHTML,
                device: this.currentDevice,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem('wb_project', JSON.stringify(projectData));
            
            if (!silent) {
                console.log('💾 Project opgeslagen:', projectData);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Fout bij opslaan project:', error);
            if (!silent) {
                this.showNotification('❌ Fout bij opslaan project', 'error');
            }
            return false;
        }
    }

    loadSavedProject() {
        try {
            const saved = localStorage.getItem('wb_project');
            if (saved) {
                const projectData = JSON.parse(saved);
                const canvas = document.getElementById('canvas');
                
                if (projectData.html && projectData.html.trim() !== '') {
                    canvas.innerHTML = projectData.html;
                    
                    // Hide drop zone if content exists
                    const dropZone = canvas.querySelector('.drop-zone');
                    if (dropZone && canvas.children.length > 1) {
                        dropZone.style.display = 'none';
                    }
                    
                    // Restore device setting
                    if (projectData.device) {
                        this.currentDevice = projectData.device;
                        const deviceBtn = document.querySelector(`[data-device="${projectData.device}"]`);
                        if (deviceBtn) {
                            deviceBtn.click();
                        }
                    }
                    
                    // Re-attach event listeners
                    this.reattachEventListeners();
                    
                    console.log('📂 Project geladen:', projectData);
                    this.showNotification('📂 Vorig project geladen', 'info');
                }
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

    // Public API methods
    getProjectData() {
        const canvas = document.getElementById('canvas');
        return {
            html: canvas.innerHTML,
            device: this.currentDevice,
            timestamp: new Date().toISOString()
        };
    }

    loadProjectData(data) {
        if (data && data.html) {
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = data.html;
            
            if (data.device) {
                this.currentDevice = data.device;
                const deviceBtn = document.querySelector(`[data-device="${data.device}"]`);
                if (deviceBtn) deviceBtn.click();
            }
            
            this.reattachEventListeners();
            this.showNotification('📂 Project geladen', 'success');
        }
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
