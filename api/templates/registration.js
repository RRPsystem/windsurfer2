// GET /api/templates/registration
// Registration manifest for BOLT integration

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
        const registration = {
            builder_name: 'AI Website Studio',
            builder_url: 'https://www.ai-websitestudio.nl',
            api_endpoint: 'https://www.ai-websitestudio.nl/api/templates',
            editor_url: 'https://www.ai-websitestudio.nl/simple-template-editor.html',
            version: '1.0.0',
            categories: [
                {
                    category: 'gowild',
                    display_name: 'Gowild Website',
                    description: 'Modern outdoor adventure template with hero sliders, tours, and destinations',
                    total_pages: 16,
                    preview_url: 'https://www.ai-websitestudio.nl/templates/Gowild/previews/gowild-preview.png',
                    tags: ['adventure', 'outdoor', 'tours', 'travel'],
                    features: [
                        'Hero slider with multiple variants',
                        'Tour and destination pages',
                        'E-commerce shop',
                        'Blog functionality',
                        'Gallery pages',
                        'Contact forms'
                    ],
                    recommended_pages: ['index', 'about', 'contact', 'tours']
                },
                {
                    category: 'tripex',
                    display_name: 'Tripex Website',
                    description: 'Elegant travel agency template with modern design and extensive features',
                    total_pages: 25,
                    preview_url: 'https://www.ai-websitestudio.nl/templates/tripex/previews/tripex-preview.png',
                    tags: ['travel', 'agency', 'elegant', 'modern'],
                    features: [
                        '6 homepage variants',
                        'Team and service pages',
                        'Multiple tour layouts',
                        'Destination showcases',
                        'Gallery options',
                        'FAQ and contact',
                        'Shop integration'
                    ],
                    recommended_pages: ['index', 'about', 'contact', 'tour-grid']
                }
            ],
            endpoints: {
                list_all: '/api/templates/list',
                list_category: '/api/templates/{category}/list',
                get_page: '/api/templates/{category}/{page-slug}',
                preview: '/templates/{category}/previews/{page-slug}-preview.png'
            },
            specifications: {
                preview_format: 'PNG or JPEG',
                preview_dimensions: '1200x800 pixels (landscape)',
                category_preview_dimensions: '800x1200 pixels (portrait)',
                max_file_size: '500KB',
                html_format: 'Full HTML with head and body tags',
                css_included: true,
                js_included: true,
                responsive: true
            }
        };

        res.status(200).json(registration);

    } catch (error) {
        console.error('Error in /api/templates/registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
