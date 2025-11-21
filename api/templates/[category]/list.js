// GET /api/templates/{category}/list
// Returns all pages for a specific template category

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
        const { category } = req.query;

        // Template metadata
        const templates = {
            gowild: {
                category: 'gowild',
                display_name: 'Gowild Website',
                description: 'Modern outdoor adventure template',
                folder: 'Gowild',
                pages: [
                    { 
                        slug: 'index', 
                        name: 'Home', 
                        description: 'Main homepage with hero slider and featured tours',
                        file: 'index.html',
                        order_index: 1 
                    },
                    { 
                        slug: 'index-2', 
                        name: 'Home 2', 
                        description: 'Alternative homepage layout',
                        file: 'index-2.html',
                        order_index: 2 
                    },
                    { 
                        slug: 'index-3', 
                        name: 'Home 3', 
                        description: 'Third homepage variant',
                        file: 'index-3.html',
                        order_index: 3 
                    },
                    { 
                        slug: 'index-4', 
                        name: 'Home 4', 
                        description: 'Fourth homepage variant',
                        file: 'index-4.html',
                        order_index: 4 
                    },
                    { 
                        slug: 'about', 
                        name: 'About', 
                        description: 'About us page with team and company info',
                        file: 'about.html',
                        order_index: 5 
                    },
                    { 
                        slug: 'destination', 
                        name: 'Destinations', 
                        description: 'Overview of all travel destinations',
                        file: 'destination.html',
                        order_index: 6 
                    },
                    { 
                        slug: 'destination-details', 
                        name: 'Destination Details', 
                        description: 'Detailed destination page',
                        file: 'destination-details.html',
                        order_index: 7 
                    },
                    { 
                        slug: 'tours', 
                        name: 'Tours', 
                        description: 'All available tours',
                        file: 'tours.html',
                        order_index: 8 
                    },
                    { 
                        slug: 'tour-details', 
                        name: 'Tour Details', 
                        description: 'Detailed tour information',
                        file: 'tour-details.html',
                        order_index: 9 
                    },
                    { 
                        slug: 'events', 
                        name: 'Events', 
                        description: 'Upcoming events and activities',
                        file: 'events.html',
                        order_index: 10 
                    },
                    { 
                        slug: 'gallery', 
                        name: 'Gallery', 
                        description: 'Photo gallery',
                        file: 'gallery.html',
                        order_index: 11 
                    },
                    { 
                        slug: 'shop', 
                        name: 'Shop', 
                        description: 'Product catalog',
                        file: 'shop.html',
                        order_index: 12 
                    },
                    { 
                        slug: 'product-details', 
                        name: 'Product Details', 
                        description: 'Detailed product page',
                        file: 'product-details.html',
                        order_index: 13 
                    },
                    { 
                        slug: 'blog-list', 
                        name: 'Blog List', 
                        description: 'Blog overview',
                        file: 'blog-list.html',
                        order_index: 14 
                    },
                    { 
                        slug: 'blog-details', 
                        name: 'Blog Details', 
                        description: 'Single blog post',
                        file: 'blog-details.html',
                        order_index: 15 
                    },
                    { 
                        slug: 'contact', 
                        name: 'Contact', 
                        description: 'Contact page with form',
                        file: 'contact.html',
                        order_index: 16 
                    }
                ]
            },
            tripex: {
                category: 'tripex',
                display_name: 'Tripex Website',
                description: 'Elegant travel agency template',
                folder: 'tripex',
                pages: [
                    { slug: 'index', name: 'Home', description: 'Main homepage', file: 'index.html', order_index: 1 },
                    { slug: 'index-02', name: 'Home 2', description: 'Homepage variant 2', file: 'index-02.html', order_index: 2 },
                    { slug: 'index-03', name: 'Home 3', description: 'Homepage variant 3', file: 'index-03.html', order_index: 3 },
                    { slug: 'index-04', name: 'Home 4', description: 'Homepage variant 4', file: 'index-04.html', order_index: 4 },
                    { slug: 'index-05', name: 'Home 5', description: 'Homepage variant 5', file: 'index-05.html', order_index: 5 },
                    { slug: 'index-06', name: 'Home 6', description: 'Homepage variant 6', file: 'index-06.html', order_index: 6 },
                    { slug: 'about', name: 'About', description: 'About us page', file: 'about.html', order_index: 7 },
                    { slug: 'service', name: 'Services', description: 'Services overview', file: 'service.html', order_index: 8 },
                    { slug: 'service-details', name: 'Service Details', description: 'Detailed service page', file: 'service-details.html', order_index: 9 },
                    { slug: 'team', name: 'Team', description: 'Team members', file: 'team.html', order_index: 10 },
                    { slug: 'team-details', name: 'Team Details', description: 'Team member details', file: 'team-details.html', order_index: 11 },
                    { slug: 'tour-grid', name: 'Tour Grid', description: 'Tours in grid layout', file: 'tour-grid.html', order_index: 12 },
                    { slug: 'tour-list', name: 'Tour List', description: 'Tours in list layout', file: 'tour-list.html', order_index: 13 },
                    { slug: 'tour-details', name: 'Tour Details', description: 'Detailed tour page', file: 'tour-details.html', order_index: 14 },
                    { slug: 'destination', name: 'Destinations', description: 'Destinations overview', file: 'destination.html', order_index: 15 },
                    { slug: 'destination-details', name: 'Destination Details', description: 'Detailed destination page', file: 'destination-details.html', order_index: 16 },
                    { slug: 'gallery-01', name: 'Gallery 1', description: 'Photo gallery layout 1', file: 'gallery-01.html', order_index: 17 },
                    { slug: 'gallery-02', name: 'Gallery 2', description: 'Photo gallery layout 2', file: 'gallery-02.html', order_index: 18 },
                    { slug: 'faq', name: 'FAQ', description: 'Frequently asked questions', file: 'faq.html', order_index: 19 },
                    { slug: 'contact', name: 'Contact', description: 'Contact page', file: 'contact.html', order_index: 20 },
                    { slug: 'shop', name: 'Shop', description: 'Product shop', file: 'shop.html', order_index: 21 },
                    { slug: 'shop-details', name: 'Shop Details', description: 'Product details', file: 'shop-details.html', order_index: 22 },
                    { slug: 'blog-standard', name: 'Blog Standard', description: 'Blog overview', file: 'blog-standard.html', order_index: 23 },
                    { slug: 'blog-details', name: 'Blog Details', description: 'Blog post details', file: 'blog-details.html', order_index: 24 },
                    { slug: 'error', name: 'Error 404', description: '404 error page', file: 'error.html', order_index: 25 }
                ]
            }
        };

        const template = templates[category.toLowerCase()];

        if (!template) {
            return res.status(404).json({ 
                error: 'Template category not found',
                available: Object.keys(templates)
            });
        }

        // Add preview URLs to each page
        const pagesWithPreviews = template.pages.map(page => ({
            ...page,
            preview_image_url: `https://www.ai-websitestudio.nl/templates/${template.folder}/previews/${page.slug}-preview.png`
        }));

        res.status(200).json({
            category: template.category,
            display_name: template.display_name,
            description: template.description,
            total_pages: template.pages.length,
            pages: pagesWithPreviews
        });

    } catch (error) {
        console.error('Error in /api/templates/[category]/list:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
