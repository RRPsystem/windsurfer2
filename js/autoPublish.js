// Auto-publish: Trigger save button automatically when user clicks "Opslaan"
// This ensures the preview link is always shareable
(function() {
    console.log('[AutoPublish] Monitoring save button...');
    
    // Wait for save button to be ready
    const checkSaveButton = setInterval(() => {
        const saveBtn = document.getElementById('saveProjectBtn');
        if (saveBtn && saveBtn.onclick) {
            clearInterval(checkSaveButton);
            
            // Wrap the original save handler
            const originalHandler = saveBtn.onclick;
            saveBtn.onclick = async function(e) {
                console.log('[AutoPublish] Save triggered, will auto-publish after save...');
                
                // Call original save
                await originalHandler.call(this, e);
                
                // Wait a bit for save to complete
                setTimeout(async () => {
                    try {
                        const canvas = document.getElementById('canvas');
                        if (!canvas || !canvas.innerHTML) {
                            console.warn('[AutoPublish] No content to publish');
                            return;
                        }
                        
                        // Get API credentials
                        const u = new URL(window.location.href);
                        const brand_id = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID;
                        const apiBase = u.searchParams.get('api') || (window.BOLT_API && window.BOLT_API.baseUrl) || '';
                        const token = u.searchParams.get('token') || window.CURRENT_TOKEN || '';
                        const apiKey = u.searchParams.get('apikey') || (window.BOLT_API && window.BOLT_API.apiKey) || '';
                        
                        if (!brand_id || !apiBase || !token || !apiKey) {
                            console.warn('[AutoPublish] Missing credentials, preview link may not work');
                            return;
                        }
                        
                        console.log('[AutoPublish] ✅ Content saved! Preview link is now shareable.');
                        
                        // Show shareable preview URL
                        const pageSlug = document.getElementById('pageSlugInput')?.value || 'page';
                        const previewUrl = `${window.location.origin}/preview.html?brand_id=${brand_id}&api=${encodeURIComponent(apiBase)}&token=${encodeURIComponent(token)}&apikey=${encodeURIComponent(apiKey)}`;
                        
                        console.log('[AutoPublish] 🔗 Shareable link:', previewUrl);
                        
                    } catch (error) {
                        console.error('[AutoPublish] Error:', error);
                    }
                }, 2000); // Wait 2 seconds for save to complete
            };
            
            console.log('[AutoPublish] ✅ Auto-publish wrapper installed');
        }
    }, 500);
    
    // Cleanup after 10 seconds if button not found
    setTimeout(() => clearInterval(checkSaveButton), 10000);
})();
