// Drag and Drop functionaliteit voor website builder
class DragDropManager {
    constructor() {
        this.init();
        this.draggedElement = null;
        this.dropZones = [];
    }

    init() {
        this.setupComponentDragging();
        this.setupCanvasDropping();
        this.setupSortableComponents();
        this.cleanupDropZone();
        this.setupDropZoneWatcher();
    }

    setupComponentDragging() {
        // Maak alle component items draggable
        const componentItems = document.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            // Click-to-insert fallback (handig als drag&drop niet werkt)
            item.addEventListener('click', () => {
                const componentType = item.getAttribute('data-component');
                if (!componentType) return;
                if (!window.ComponentFactory || typeof window.ComponentFactory.createComponent !== 'function') {
                    console.error('[DND] ComponentFactory ontbreekt bij click insert');
                    alert('Kan component nog niet toevoegen: scripts zijn nog niet volledig geladen. Probeer Ctrl+F5 of herstart de server.');
                    return;
                }
                this.addComponentToCanvas(componentType);
            });

            item.addEventListener('dragstart', (e) => {
                const componentType = item.getAttribute('data-component');
                e.dataTransfer.setData('text/plain', componentType);
                e.dataTransfer.effectAllowed = 'copy';
                
                // Visual feedback
                item.classList.add('dragging');
                
                // Create drag image
                const dragImage = item.cloneNode(true);
                dragImage.style.transform = 'rotate(5deg)';
                dragImage.style.opacity = '0.8';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 50, 25);
                
                setTimeout(() => {
                    document.body.removeChild(dragImage);
                }, 0);
                
                console.debug('[DND] dragstart', componentType);
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                console.debug('[DND] dragend');
            });
        });
    }

    setupCanvasDropping() {
        const canvas = document.getElementById('canvas');
        const dropZone = canvas.querySelector('.drop-zone');

        const handleDropEvent = (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            if (dropZone) dropZone.classList.remove('drag-over');

            const dt = e.dataTransfer;
            if (!dt) return;
            const componentType = dt.getData('text/plain');
            if (componentType) {
                this.addComponentToCanvas(componentType);
            }
            console.debug('[DND] drop on canvas', componentType);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            canvas.classList.add('drag-over');
            if (dropZone) dropZone.classList.add('drag-over');
            // console.debug('[DND] dragover');
        };

        const handleDragLeave = (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                canvas.classList.remove('drag-over');
                if (dropZone) dropZone.classList.remove('drag-over');
            }
        };

        // Allow drop anywhere on canvas
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('dragleave', handleDragLeave);
        canvas.addEventListener('drop', handleDropEvent);

        // Keep supporting the inner drop zone for guidance
        if (dropZone) {
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('dragleave', handleDragLeave);
            dropZone.addEventListener('drop', handleDropEvent);
        }
        
        // Click outside to deselect
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas || e.target === dropZone) {
                this.deselectAll();
            }
        });
    }
    addComponentToCanvas(componentType) {
        const canvas = document.getElementById('canvas');
        const dropZone = canvas.querySelector('.drop-zone');
        
        // Guard: voorkom crash als ComponentFactory nog niet beschikbaar is
        // Probeer automatisch js/components.js te laden en daarna te vervolgen
        const ensureFactory = () => new Promise((resolve) => {
            if (window.ComponentFactory && typeof window.ComponentFactory.createComponent === 'function') return resolve(true);
            // Kijk of script al aanwezig is in DOM
            const existing = document.querySelector('script[src$="js/components.js"],script[src*="/js/components.js"]');
            if (existing) {
                // Wacht heel even en check opnieuw (script kan nog laden)
                setTimeout(() => resolve(!!(window.ComponentFactory && window.ComponentFactory.createComponent)), 150);
                return;
            }
            const s = document.createElement('script');
            s.src = 'js/components.js';
            s.onload = () => resolve(true);
            s.onerror = () => resolve(false);
            document.head.appendChild(s);
        });

        // eslint-disable-next-line no-inner-declarations
        const proceed = async () => {
            const ok = await ensureFactory();
            if (!ok || !window.ComponentFactory || typeof window.ComponentFactory.createComponent !== 'function') {
                console.error('[DND] ComponentFactory is not defined – kan geen component maken.');
                try { window.ExportManager?.showNotification?.('Scripts nog niet geladen. Probeer Ctrl+F5.', 'error'); } catch {}
                alert('Kan component niet toevoegen: scripts nog niet geladen. Probeer Ctrl+F5.');
                return;
            }

            // Create new component
            const component = ComponentFactory.createComponent(componentType);
            if (!component) return;

            // Ensure the initial drop zone is removed so it doesn't keep space
            if (dropZone) {
                dropZone.remove();
            }

            // Add component to canvas
            canvas.appendChild(component);
            // Add animation
            component.classList.add('fade-in');
            // Auto-select the new component
            setTimeout(() => {
                this.selectComponent(component);
            }, 100);
            // Make the new component sortable
            this.makeSortable(component);
        };

        proceed();
    }

    // Remove the initial drop zone if there are real components already (e.g., after loading a project)
    cleanupDropZone() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const dropZone = canvas.querySelector('.drop-zone');
        const hasComponent = canvas.querySelector('.wb-component');
        if (dropZone && hasComponent) {
            dropZone.remove();
        }
    }

    // Watch for components being added externally (e.g., project load) and remove drop-zone
    setupDropZoneWatcher() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        const observer = new MutationObserver(() => this.cleanupDropZone());
        observer.observe(canvas, { childList: true, subtree: false });
        this.dropZoneObserver = observer;
    }

    setupSortableComponents() {
        // This will be called when components are added
        const canvas = document.getElementById('canvas');
        this.makeSortableContainer(canvas);
    }

    makeSortableContainer(container) {
        let draggedComponent = null;
        let placeholder = null;
        
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('wb-component')) {
                draggedComponent = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
                
                // Create placeholder
                placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.height = e.target.offsetHeight + 'px';
                placeholder.style.background = 'rgba(33, 150, 243, 0.1)';
                placeholder.style.border = '2px dashed #2196F3';
                placeholder.style.borderRadius = '4px';
                placeholder.style.margin = '0.5rem 0';
                placeholder.innerHTML = '<div style="text-align: center; padding: 1rem; color: #2196F3;">Drop hier</div>';
            }
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedComponent) return;
            
            const afterElement = this.getDragAfterElement(container, e.clientY);
            
            if (afterElement == null) {
                container.appendChild(placeholder);
            } else {
                container.insertBefore(placeholder, afterElement);
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedComponent || !placeholder) return;
            
            // Replace placeholder with dragged element
            placeholder.parentNode.replaceChild(draggedComponent, placeholder);
            draggedComponent.classList.remove('dragging');
            
            // Clean up
            draggedComponent = null;
            placeholder = null;
        });
        
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('wb-component')) {
                e.target.classList.remove('dragging');
                
                // Remove placeholder if it still exists
                if (placeholder && placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
                
                draggedComponent = null;
                placeholder = null;
            }
        });
    }

    makeSortable(component) {
        component.draggable = true;
        
        component.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            this.draggedElement = component;
            component.classList.add('dragging');
        });
        
        component.addEventListener('dragend', (e) => {
            component.classList.remove('dragging');
            this.draggedElement = null;
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.wb-component:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    selectComponent(component) {
        this.deselectAll();
        component.classList.add('selected');
        
        // Update properties panel
        if (window.PropertiesPanel) {
            window.PropertiesPanel.showProperties(component);
        }
    }

    deselectAll() {
        document.querySelectorAll('.wb-component.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Clear properties panel
        if (window.PropertiesPanel) {
            window.PropertiesPanel.clearProperties();
        }
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const selected = document.querySelector('.wb-component.selected');
            
            if (e.key === 'Delete' && selected) {
                if (confirm('Weet je zeker dat je dit component wilt verwijderen?')) {
                    selected.remove();
                    this.deselectAll();
                }
            }
            
            if (e.key === 'Escape') {
                this.deselectAll();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selected) {
                e.preventDefault();
                const clone = selected.cloneNode(true);
                clone.id = ComponentFactory.generateId(clone.getAttribute('data-component'));
                selected.parentElement.insertBefore(clone, selected.nextSibling);
                this.makeSortable(clone);
            }
        });
    }

    // Touch support for mobile
    setupTouchSupport() {
        let touchStartY = 0;
        let touchElement = null;
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('component-item')) {
                touchStartY = e.touches[0].clientY;
                touchElement = e.target;
                touchElement.classList.add('touch-dragging');
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (touchElement) {
                e.preventDefault();
                const touch = e.touches[0];
                const deltaY = touch.clientY - touchStartY;
                
                if (Math.abs(deltaY) > 10) {
                    // Start drag operation
                    const componentType = touchElement.getAttribute('data-component');
                    // Implement touch drag logic here
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (touchElement) {
                touchElement.classList.remove('touch-dragging');
                touchElement = null;
            }
        });
    }

    // Undo/Redo functionality
    setupUndoRedo() {
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // Save initial state
        this.saveState();
    }

    saveState() {
        const canvas = document.getElementById('canvas');
        const state = canvas.innerHTML;
        
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = this.history[this.historyIndex];
            this.reattachEventListeners();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = this.history[this.historyIndex];
            this.reattachEventListeners();
        }
    }

    reattachEventListeners() {
        // Re-attach event listeners after undo/redo
        const components = document.querySelectorAll('.wb-component');
        components.forEach(component => {
            this.makeSortable(component);
            ComponentFactory.makeSelectable(component);
        });
    }
}

// Initialize drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dragDropManager = new DragDropManager();
    window.dragDropManager.setupKeyboardShortcuts();
    window.dragDropManager.setupTouchSupport();
    window.dragDropManager.setupUndoRedo();
});
