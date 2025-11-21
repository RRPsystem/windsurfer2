// GET /api/templates
// API index - shows available endpoints

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
        res.status(200).json({
            name: 'AI Website Studio Template API',
            version: '1.0.0',
            description: 'Template API for BOLT integration',
            endpoints: {
                registration: '/api/templates/registration',
                list_all: '/api/templates/list',
                list_category: '/api/templates/{category}/list',
                get_page: '/api/templates/{category}/{page-slug}'
            },
            examples: {
                registration: 'https://www.ai-websitestudio.nl/api/templates/registration',
                list_all: 'https://www.ai-websitestudio.nl/api/templates/list',
                gowild_list: 'https://www.ai-websitestudio.nl/api/templates/gowild/list',
                gowild_home: 'https://www.ai-websitestudio.nl/api/templates/gowild/index',
                tripex_list: 'https://www.ai-websitestudio.nl/api/templates/tripex/list'
            },
            documentation: 'https://www.ai-websitestudio.nl/api/templates/registration'
        });

    } catch (error) {
        console.error('Error in /api/templates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
