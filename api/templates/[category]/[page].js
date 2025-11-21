// GET /api/templates/{category}/{page}
// Returns HTML content for a specific page

const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { category, page } = req.query;

        // Template metadata
        const templates = {
            gowild: {
                folder: 'Gowild',
                pages: {
                    'index': 'index.html',
                    'index-2': 'index-2.html',
                    'index-3': 'index-3.html',
                    'index-4': 'index-4.html',
                    'about': 'about.html',
                    'destination': 'destination.html',
                    'destination-details': 'destination-details.html',
                    'tours': 'tours.html',
                    'tour-details': 'tour-details.html',
                    'events': 'events.html',
                    'gallery': 'gallery.html',
                    'shop': 'shop.html',
                    'product-details': 'product-details.html',
                    'blog-list': 'blog-list.html',
                    'blog-details': 'blog-details.html',
                    'contact': 'contact.html'
                }
            },
            tripex: {
                folder: 'tripex',
                pages: {
                    'index': 'index.html',
                    'index-02': 'index-02.html',
                    'index-03': 'index-03.html',
                    'index-04': 'index-04.html',
                    'index-05': 'index-05.html',
                    'index-06': 'index-06.html',
                    'about': 'about.html',
                    'service': 'service.html',
                    'service-details': 'service-details.html',
                    'team': 'team.html',
                    'team-details': 'team-details.html',
                    'tour-grid': 'tour-grid.html',
                    'tour-list': 'tour-list.html',
                    'tour-details': 'tour-details.html',
                    'destination': 'destination.html',
                    'destination-details': 'destination-details.html',
                    'gallery-01': 'gallery-01.html',
                    'gallery-02': 'gallery-02.html',
                    'faq': 'faq.html',
                    'contact': 'contact.html',
                    'shop': 'shop.html',
                    'shop-details': 'shop-details.html',
                    'blog-standard': 'blog-standard.html',
                    'blog-details': 'blog-details.html',
                    'error': 'error.html'
                }
            }
        };

        const template = templates[category.toLowerCase()];

        if (!template) {
            return res.status(404).json({ 
                error: 'Template category not found',
                available: Object.keys(templates)
            });
        }

        const fileName = template.pages[page];

        if (!fileName) {
            return res.status(404).json({ 
                error: 'Page not found',
                available: Object.keys(template.pages)
            });
        }

        // In Vercel, we need to read from the deployed templates folder
        // The files are available at /templates/{folder}/{file}
        const templatePath = path.join(process.cwd(), 'templates', template.folder, fileName);

        // Check if file exists
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ 
                error: 'Template file not found',
                path: templatePath
            });
        }

        // Read the HTML file
        const htmlContent = fs.readFileSync(templatePath, 'utf-8');

        // Return the page data
        res.status(200).json({
            template_name: page,
            category: category.toLowerCase(),
            page_slug: page,
            description: `${page} page from ${category} template`,
            preview_image_url: `https://www.ai-websitestudio.nl/templates/${template.folder}/previews/${page}-preview.png`,
            html_content: htmlContent,
            file_path: `/templates/${template.folder}/${fileName}`
        });

    } catch (error) {
        console.error('Error in /api/templates/[category]/[page]:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message,
            stack: error.stack 
        });
    }
}
