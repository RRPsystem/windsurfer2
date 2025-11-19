// Inline Toolbar Functions for Template Editor

// Make selected text bold
window.makeTextBold = function() {
    const element = templateEditor.selectedElement?.element;
    if (!element) return;
    
    const currentWeight = window.getComputedStyle(element).fontWeight;
    element.style.fontWeight = currentWeight === 'bold' || currentWeight >= 700 ? 'normal' : 'bold';
    templateEditor.showNotification('✅ Tekst stijl gewijzigd');
};

// Make selected text italic
window.makeTextItalic = function() {
    const element = templateEditor.selectedElement?.element;
    if (!element) return;
    
    const currentStyle = window.getComputedStyle(element).fontStyle;
    element.style.fontStyle = currentStyle === 'italic' ? 'normal' : 'italic';
    templateEditor.showNotification('✅ Tekst stijl gewijzigd');
};

// Change text color inline
window.changeTextColor = function(color) {
    const element = templateEditor.selectedElement?.element;
    if (!element) return;
    
    element.style.color = color;
    templateEditor.showNotification('✅ Tekstkleur gewijzigd');
};

// Change background color inline
window.changeBackgroundColor = function(color) {
    const element = templateEditor.selectedElement?.element;
    if (!element) return;
    
    element.style.backgroundColor = color;
    templateEditor.showNotification('✅ Achtergrondkleur gewijzigd');
};

// Remove image
window.removeImage = function() {
    const element = templateEditor.selectedElement?.element;
    if (!element) return;
    
    if (confirm('Weet je zeker dat je deze afbeelding wilt verwijderen?')) {
        element.remove();
        templateEditor.showNotification('✅ Afbeelding verwijderd');
    }
};
