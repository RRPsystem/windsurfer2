// GET /api/templates/list
// Returns all available template categories

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
        const categories = [
            {
                category: 'gowild',
                display_name: 'Gowild Website',
                description: 'Modern outdoor adventure template',
                total_pages: 16,
                preview_url: 'https://www.ai-websitestudio.nl/templates/Gowild/previews/gowild-preview.png',
                pages: [
                    { slug: 'index', name: 'Home', order: 1 },
                    { slug: 'index-2', name: 'Home 2', order: 2 },
                    { slug: 'index-3', name: 'Home 3', order: 3 },
                    { slug: 'index-4', name: 'Home 4', order: 4 },
                    { slug: 'about', name: 'About', order: 5 },
                    { slug: 'destination', name: 'Destinations', order: 6 },
                    { slug: 'destination-details', name: 'Destination Details', order: 7 },
                    { slug: 'tours', name: 'Tours', order: 8 },
                    { slug: 'tour-details', name: 'Tour Details', order: 9 },
                    { slug: 'events', name: 'Events', order: 10 },
                    { slug: 'gallery', name: 'Gallery', order: 11 },
                    { slug: 'shop', name: 'Shop', order: 12 },
                    { slug: 'product-details', name: 'Product Details', order: 13 },
                    { slug: 'blog-list', name: 'Blog List', order: 14 },
                    { slug: 'blog-details', name: 'Blog Details', order: 15 },
                    { slug: 'contact', name: 'Contact', order: 16 }
                ]
            },
            {
                category: 'tripex',
                display_name: 'Tripex Website',
                description: 'Elegant travel agency template',
                total_pages: 25,
                preview_url: 'https://www.ai-websitestudio.nl/templates/tripex/previews/tripex-preview.png',
                pages: [
                    { slug: 'index', name: 'Home', order: 1 },
                    { slug: 'index-02', name: 'Home 2', order: 2 },
                    { slug: 'index-03', name: 'Home 3', order: 3 },
                    { slug: 'index-04', name: 'Home 4', order: 4 },
                    { slug: 'index-05', name: 'Home 5', order: 5 },
                    { slug: 'index-06', name: 'Home 6', order: 6 },
                    { slug: 'about', name: 'About', order: 7 },
                    { slug: 'service', name: 'Services', order: 8 },
                    { slug: 'service-details', name: 'Service Details', order: 9 },
                    { slug: 'team', name: 'Team', order: 10 },
                    { slug: 'team-details', name: 'Team Details', order: 11 },
                    { slug: 'tour-grid', name: 'Tour Grid', order: 12 },
                    { slug: 'tour-list', name: 'Tour List', order: 13 },
                    { slug: 'tour-details', name: 'Tour Details', order: 14 },
                    { slug: 'destination', name: 'Destinations', order: 15 },
                    { slug: 'destination-details', name: 'Destination Details', order: 16 },
                    { slug: 'gallery-01', name: 'Gallery 1', order: 17 },
                    { slug: 'gallery-02', name: 'Gallery 2', order: 18 },
                    { slug: 'faq', name: 'FAQ', order: 19 },
                    { slug: 'contact', name: 'Contact', order: 20 },
                    { slug: 'shop', name: 'Shop', order: 21 },
                    { slug: 'shop-details', name: 'Shop Details', order: 22 },
                    { slug: 'blog-standard', name: 'Blog Standard', order: 23 },
                    { slug: 'blog-details', name: 'Blog Details', order: 24 },
                    { slug: 'error', name: 'Error 404', order: 25 }
                ]
            }
        ];

        res.status(200).json({
            builder_name: 'AI Website Studio',
            builder_url: 'https://www.ai-websitestudio.nl',
            categories
        });

    } catch (error) {
        console.error('Error in /api/templates/list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
