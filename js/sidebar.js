// Sidebar Category Management
(function() {
    'use strict';

    // Initialize collapsible categories
    function initCategories() {
        const categories = document.querySelectorAll('.category');
        
        categories.forEach(category => {
            const header = category.querySelector('.category-header');
            if (!header) return;
            
            header.addEventListener('click', () => {
                category.classList.toggle('collapsed');
                
                // Save state to localStorage
                const categoryId = category.dataset.categoryId;
                if (categoryId) {
                    const isCollapsed = category.classList.contains('collapsed');
                    localStorage.setItem(`category-${categoryId}`, isCollapsed ? 'collapsed' : 'expanded');
                }
            });
        });
        
        // Restore saved states (default: collapsed)
        categories.forEach(category => {
            const categoryId = category.dataset.categoryId;
            if (categoryId) {
                const savedState = localStorage.getItem(`category-${categoryId}`);
                // Default to collapsed if no saved state
                if (savedState === 'collapsed' || savedState === null) {
                    category.classList.add('collapsed');
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCategories);
    } else {
        initCategories();
    }
})();
