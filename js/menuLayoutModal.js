// Unified Menu & Layout Modal
(function() {
    function openMenuLayoutModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.id = 'menuLayoutModal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '900px';
        modalContent.style.height = '80vh';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        
        // Header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3><i class="fas fa-layer-group"></i> Menu & Layout</h3>
            <button class="modal-close" id="closeMenuLayout">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.style.cssText = 'display:flex;gap:8px;padding:0 20px;border-bottom:2px solid #e5e7eb;';
        
        const tabs = [
            { id: 'header', label: '🎨 Header', icon: 'fa-heading' },
            { id: 'footer', label: '📄 Footer', icon: 'fa-window-maximize' },
            { id: 'menus', label: '🔗 Menu\'s', icon: 'fa-bars' }
        ];
        
        tabs.forEach((tab, idx) => {
            const tabBtn = document.createElement('button');
            tabBtn.className = 'tab-btn';
            tabBtn.dataset.tab = tab.id;
            tabBtn.innerHTML = `<i class="fas ${tab.icon}"></i> ${tab.label}`;
            tabBtn.style.cssText = `
                padding:12px 20px;
                border:none;
                background:transparent;
                cursor:pointer;
                font-weight:600;
                color:#6b7280;
                border-bottom:3px solid transparent;
                transition:all 0.2s;
            `;
            if (idx === 0) {
                tabBtn.style.color = '#667eea';
                tabBtn.style.borderBottomColor = '#667eea';
                tabBtn.classList.add('active');
            }
            tabBtn.onclick = () => switchTab(tab.id);
            tabsContainer.appendChild(tabBtn);
        });
        
        // Tab content
        const tabContent = document.createElement('div');
        tabContent.style.cssText = 'flex:1;overflow-y:auto;padding:20px;';
        tabContent.id = 'menuLayoutTabContent';
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(tabsContainer);
        modalContent.appendChild(tabContent);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close handler
        const closeBtn = modalHeader.querySelector('.modal-close');
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        
        // Tab switching
        function switchTab(tabId) {
            // Update tab buttons
            tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                if (btn.dataset.tab === tabId) {
                    btn.style.color = '#667eea';
                    btn.style.borderBottomColor = '#667eea';
                    btn.classList.add('active');
                } else {
                    btn.style.color = '#6b7280';
                    btn.style.borderBottomColor = 'transparent';
                    btn.classList.remove('active');
                }
            });
            
            // Load tab content
            loadTabContent(tabId);
        }
        
        function loadTabContent(tabId) {
            tabContent.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-circle-notch fa-spin"></i> Laden...</div>';
            
            setTimeout(() => {
                if (tabId === 'header') {
                    loadHeaderTab();
                } else if (tabId === 'footer') {
                    loadFooterTab();
                } else if (tabId === 'menus') {
                    loadMenusTab();
                }
            }, 100);
        }
        
        function loadHeaderTab() {
            // Use existing MenuFooterView if available
            if (window.MenuFooterView && window.MenuFooterView.mount) {
                tabContent.innerHTML = '';
                const container = document.createElement('div');
                tabContent.appendChild(container);
                
                // Mount the header section only
                try {
                    // Create a minimal form for header
                    const headerSection = document.createElement('div');
                    headerSection.innerHTML = '<h4 style="margin-bottom:16px;">Header Instellingen</h4>';
                    
                    // Call LayoutsBuilder if available
                    if (window.LayoutsBuilder && window.LayoutsBuilder.openHeaderBuilder) {
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-primary';
                        btn.innerHTML = '<i class="fas fa-heading"></i> Open Header Builder';
                        btn.onclick = () => {
                            closeModal();
                            window.LayoutsBuilder.openHeaderBuilder();
                        };
                        headerSection.appendChild(btn);
                    }
                    
                    tabContent.innerHTML = '';
                    tabContent.appendChild(headerSection);
                } catch (e) {
                    console.error('Header tab error:', e);
                    tabContent.innerHTML = '<div style="padding:20px;color:#ef4444;">Error loading header settings</div>';
                }
            } else {
                tabContent.innerHTML = `
                    <div style="padding:20px;">
                        <h4>Header Templates</h4>
                        <p style="color:#6b7280;margin:12px 0;">Kies een header layout voor je website</p>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:20px;">
                            ${createHeaderPresets()}
                        </div>
                    </div>
                `;
            }
        }
        
        function loadFooterTab() {
            if (window.LayoutsBuilder && window.LayoutsBuilder.openFooterBuilder) {
                const footerSection = document.createElement('div');
                footerSection.innerHTML = '<h4 style="margin-bottom:16px;">Footer Instellingen</h4>';
                
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.innerHTML = '<i class="fas fa-window-maximize"></i> Open Footer Builder';
                btn.onclick = () => {
                    closeModal();
                    window.LayoutsBuilder.openFooterBuilder();
                };
                footerSection.appendChild(btn);
                
                tabContent.innerHTML = '';
                tabContent.appendChild(footerSection);
            } else {
                tabContent.innerHTML = `
                    <div style="padding:20px;">
                        <h4>Footer Templates</h4>
                        <p style="color:#6b7280;margin:12px 0;">Kies een footer layout voor je website</p>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:20px;">
                            ${createFooterPresets()}
                        </div>
                    </div>
                `;
            }
        }
        
        function loadMenusTab() {
            if (window.LayoutsBuilder && window.LayoutsBuilder.openMenuBuilder) {
                const menuSection = document.createElement('div');
                menuSection.innerHTML = '<h4 style="margin-bottom:16px;">Menu Instellingen</h4>';
                
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.innerHTML = '<i class="fas fa-bars"></i> Open Menu Builder';
                btn.onclick = () => {
                    closeModal();
                    window.LayoutsBuilder.openMenuBuilder();
                };
                menuSection.appendChild(btn);
                
                tabContent.innerHTML = '';
                tabContent.appendChild(menuSection);
            } else {
                tabContent.innerHTML = `
                    <div style="padding:20px;">
                        <h4>Menu Beheer</h4>
                        <p style="color:#6b7280;margin:12px 0;">Beheer je website menu's</p>
                        <div style="margin-top:20px;">
                            <p>Menu builder wordt geladen...</p>
                        </div>
                    </div>
                `;
            }
        }
        
        function createHeaderPresets() {
            const presets = [
                { name: 'Minimaal', preview: 'Logo + Menu' },
                { name: 'Logo Links', preview: 'Logo | Menu | CTA' },
                { name: 'Logo Center', preview: 'Logo boven menu' },
                { name: 'Split', preview: 'Menu | Logo | CTA' }
            ];
            
            return presets.map(p => `
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all 0.2s;" 
                     onmouseover="this.style.borderColor='#667eea';this.style.boxShadow='0 4px 12px rgba(102,126,234,0.1)'"
                     onmouseout="this.style.borderColor='#e5e7eb';this.style.boxShadow='none'">
                    <div style="font-weight:600;margin-bottom:8px;">${p.name}</div>
                    <div style="font-size:12px;color:#6b7280;">${p.preview}</div>
                </div>
            `).join('');
        }
        
        function createFooterPresets() {
            const presets = [
                { name: 'Compact', preview: 'Logo + Links' },
                { name: 'Kolommen', preview: '3 kolommen met links' },
                { name: 'Legal', preview: 'Links + Legal info' }
            ];
            
            return presets.map(p => `
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all 0.2s;"
                     onmouseover="this.style.borderColor='#667eea';this.style.boxShadow='0 4px 12px rgba(102,126,234,0.1)'"
                     onmouseout="this.style.borderColor='#e5e7eb';this.style.boxShadow='none'">
                    <div style="font-weight:600;margin-bottom:8px;">${p.name}</div>
                    <div style="font-size:12px;color:#6b7280;">${p.preview}</div>
                </div>
            `).join('');
        }
        
        // Load first tab
        loadTabContent('header');
    }
    
    // Setup button handler
    function setupMenuLayoutButton() {
        const btn = document.getElementById('menuLayoutBtn');
        if (btn) {
            btn.onclick = openMenuLayoutModal;
            console.log('✅ Menu & Layout button ready');
        }
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMenuLayoutButton);
    } else {
        setupMenuLayoutButton();
    }
    
    // Expose for external use
    window.openMenuLayoutModal = openMenuLayoutModal;
})();
