// API endpoint for fetching destinations from pages table
// Returns destinations in template-friendly format

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { brandId, slug } = req.query;
        
        if (!brandId) {
            return res.status(400).json({ error: 'brandId is required' });
        }
        
        // Initialize Supabase client
        const supabaseUrl = process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
        
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // If slug provided, get single destination
        if (slug) {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('brand_id', brandId)
                .eq('slug', slug)
                .single();
            
            if (error) {
                console.error('Supabase error:', error);
                return res.status(404).json({ error: 'Destination not found' });
            }
            
            // Transform to template format
            const destination = transformDestination(data);
            return res.status(200).json(destination);
        }
        
        // Get all destinations for this brand
        // Assuming destinations have a specific pattern or metadata
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch destinations' });
        }
        
        // Filter and transform destinations
        // You might want to add a 'type' or 'category' field to pages table
        const destinations = data
            .filter(page => isDestination(page))
            .map(page => transformDestinationCard(page));
        
        return res.status(200).json(destinations);
        
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper: Check if page is a destination
function isDestination(page) {
    // Check if page has destination indicators
    // This could be based on:
    // - Page slug pattern (e.g., starts with 'destination-')
    // - Metadata field
    // - Content analysis
    
    if (page.slug && page.slug.startsWith('destination-')) return true;
    if (page.title && page.title.toLowerCase().includes('bestemming')) return true;
    
    // Check metadata if available
    if (page.metadata && page.metadata.type === 'destination') return true;
    
    return false;
}

// Helper: Transform destination for card display
function transformDestinationCard(page) {
    return {
        slug: page.slug,
        title: page.title,
        excerpt: extractExcerpt(page.html),
        image: extractFirstImage(page.html),
        link: `/destination-detail.html?slug=${page.slug}`,
        createdAt: page.created_at
    };
}

// Helper: Transform full destination
function transformDestination(page) {
    return {
        slug: page.slug,
        title: page.title,
        html: page.html,
        content: extractContent(page.html),
        images: extractImages(page.html),
        metadata: page.metadata || {},
        createdAt: page.created_at,
        updatedAt: page.updated_at
    };
}

// Helper: Extract excerpt from HTML
function extractExcerpt(html, maxLength = 150) {
    if (!html) return '';
    
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
}

// Helper: Extract first image from HTML
function extractFirstImage(html) {
    if (!html) return '/assets/images/destination-placeholder.jpg';
    
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : '/assets/images/destination-placeholder.jpg';
}

// Helper: Extract all images from HTML
function extractImages(html) {
    if (!html) return [];
    
    const images = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
        images.push(match[1]);
    }
    
    return images;
}

// Helper: Extract clean content from HTML
function extractContent(html) {
    if (!html) return '';
    
    // Remove script and style tags
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    return content;
}
