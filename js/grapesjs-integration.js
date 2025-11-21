/**
 * GrapesJS Integration Module
 * Handles template management, ZIP processing, and BOLT integration
 */

class GrapesJSIntegration {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.brandId = null;
        this.token = null;
    }

    /**
     * Initialize from URL parameters
     */
    initFromUrl() {
        const params = new URLSearchParams(window.location.search);
        
        this.supabaseUrl = params.get('api') || 'https://huaaogdxxdcakxryecnw.supabase.co';
        this.supabaseKey = params.get('apikey');
        this.brandId = params.get('brand_id');
        this.token = params.get('token');
        
        if (this.supabaseKey) {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        }
        
        return this;
    }

    /**
     * Process ZIP file and extract template files
     */
    async processZipFile(file) {
        try {
            const zip = await JSZip.loadAsync(file);
            const files = {};
            
            // Extract all files
            for (let filename in zip.files) {
                const zipFile = zip.files[filename];
                
                if (!zipFile.dir) {
                    // Determine file type
                    const ext = filename.split('.').pop().toLowerCase();
                    
                    if (['html', 'htm'].includes(ext)) {
                        files[filename] = {
                            type: 'html',
                            content: await zipFile.async('string')
                        };
                    } else if (['css'].includes(ext)) {
                        files[filename] = {
                            type: 'css',
                            content: await zipFile.async('string')
                        };
                    } else if (['js'].includes(ext)) {
                        files[filename] = {
                            type: 'js',
                            content: await zipFile.async('string')
                        };
                    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                        files[filename] = {
                            type: 'image',
                            content: await zipFile.async('base64'),
                            ext: ext
                        };
                    } else if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
                        files[filename] = {
                            type: 'font',
                            content: await zipFile.async('base64'),
                            ext: ext
                        };
                    }
                }
            }
            
            return {
                success: true,
                files: files,
                mainHtml: this.findMainHtmlFile(files)
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find the main HTML file (index.html or similar)
     */
    findMainHtmlFile(files) {
        const priorities = [
            'index.html',
            'home.html',
            'main.html',
            'index-1.html',
            'default.html'
        ];
        
        // Check priority files
        for (let filename of priorities) {
            if (files[filename]) {
                return filename;
            }
        }
        
        // Find any HTML in root
        for (let filename in files) {
            if (files[filename].type === 'html' && !filename.includes('/')) {
                return filename;
            }
        }
        
        // Find any HTML file
        for (let filename in files) {
            if (files[filename].type === 'html') {
                return filename;
            }
        }
        
        return null;
    }

    /**
     * Convert extracted files to data URIs for inline use
     */
    convertToDataUris(files) {
        const dataUris = {};
        
        for (let filename in files) {
            const file = files[filename];
            
            if (file.type === 'image') {
                const mimeTypes = {
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'gif': 'image/gif',
                    'svg': 'image/svg+xml',
                    'webp': 'image/webp'
                };
                dataUris[filename] = `data:${mimeTypes[file.ext]};base64,${file.content}`;
            } else if (file.type === 'font') {
                const mimeTypes = {
                    'woff': 'font/woff',
                    'woff2': 'font/woff2',
                    'ttf': 'font/ttf',
                    'eot': 'application/vnd.ms-fontobject'
                };
                dataUris[filename] = `data:${mimeTypes[file.ext]};base64,${file.content}`;
            }
        }
        
        return dataUris;
    }

    /**
     * Replace relative paths in HTML with data URIs
     */
    replacePathsWithDataUris(html, dataUris) {
        let processedHtml = html;
        
        // Replace image sources
        for (let path in dataUris) {
            const patterns = [
                new RegExp(`src=["']${path}["']`, 'gi'),
                new RegExp(`src=["']./${path}["']`, 'gi'),
                new RegExp(`src=["']../${path}["']`, 'gi')
            ];
            
            patterns.forEach(pattern => {
                processedHtml = processedHtml.replace(pattern, `src="${dataUris[path]}"`);
            });
        }
        
        // Replace CSS background images
        for (let path in dataUris) {
            const patterns = [
                new RegExp(`url\\(['"]?${path}['"]?\\)`, 'gi'),
                new RegExp(`url\\(['"]?./${path}['"]?\\)`, 'gi'),
                new RegExp(`url\\(['"]?../${path}['"]?\\)`, 'gi')
            ];
            
            patterns.forEach(pattern => {
                processedHtml = processedHtml.replace(pattern, `url('${dataUris[path]}')`);
            });
        }
        
        return processedHtml;
    }

    /**
     * Save template to Supabase
     */
    async saveTemplate(name, html, css) {
        if (!this.supabase || !this.brandId) {
            throw new Error('Supabase not initialized or brand_id missing');
        }
        
        const fullHtml = this.buildFullHtml(name, html, css);
        
        try {
            const { data, error } = await this.supabase
                .from('website_templates')
                .upsert({
                    brand_id: this.brandId,
                    name: name,
                    html_content: fullHtml,
                    css_content: css,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'brand_id,name'
                });
            
            if (error) throw error;
            
            return { success: true, data };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Load template from Supabase
     */
    async loadTemplate(templateId) {
        if (!this.supabase) {
            throw new Error('Supabase not initialized');
        }
        
        try {
            const { data, error } = await this.supabase
                .from('website_templates')
                .select('*')
                .eq('id', templateId)
                .single();
            
            if (error) throw error;
            
            return { success: true, template: data };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * List all templates for current brand
     */
    async listTemplates() {
        if (!this.supabase || !this.brandId) {
            throw new Error('Supabase not initialized or brand_id missing');
        }
        
        try {
            const { data, error } = await this.supabase
                .from('website_templates')
                .select('id, name, created_at, updated_at')
                .eq('brand_id', this.brandId)
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, templates: data };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Build full HTML document
     */
    buildFullHtml(title, bodyHtml, css) {
        return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
${css}
    </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
    }

    /**
     * Deploy to BOLT
     */
    async deployToBolt(templateName, html, css) {
        const fullHtml = this.buildFullHtml(templateName, html, css);
        
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('return_url');
        
        if (returnUrl) {
            // Redirect back to BOLT with template
            const deployParams = new URLSearchParams({
                template_html: fullHtml,
                template_name: templateName,
                status: 'success'
            });
            
            window.location.href = `${returnUrl}?${deployParams.toString()}`;
            return { success: true };
        } else {
            return { 
                success: false, 
                error: 'No return_url specified for BOLT deployment' 
            };
        }
    }

    /**
     * Download template as HTML file
     */
    downloadTemplate(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Extract inline CSS from HTML
     */
    extractInlineCss(html) {
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let css = '';
        let match;
        
        while ((match = styleRegex.exec(html)) !== null) {
            css += match[1] + '\n';
        }
        
        return css;
    }

    /**
     * Remove inline CSS from HTML
     */
    removeInlineCss(html) {
        return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    }

    /**
     * Clean HTML for editor (remove scripts, extract styles, etc.)
     */
    cleanHtmlForEditor(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove scripts
        doc.querySelectorAll('script').forEach(el => el.remove());
        
        // Extract and remove style tags (we'll handle CSS separately)
        const styles = [];
        doc.querySelectorAll('style').forEach(el => {
            styles.push(el.textContent);
            el.remove();
        });
        
        // Get body content
        const bodyContent = doc.body.innerHTML;
        
        return {
            html: bodyContent,
            css: styles.join('\n')
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrapesJSIntegration;
}
