// API endpoint for fetching news/blog posts from pages table
// Returns news in template-friendly format

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
        
        // If slug provided, get single news article
        if (slug) {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('brand_id', brandId)
                .eq('slug', slug)
                .single();
            
            if (error) {
                console.error('Supabase error:', error);
                return res.status(404).json({ error: 'News article not found' });
            }
            
            // Transform to template format
            const article = transformArticle(data);
            return res.status(200).json(article);
        }
        
        // Get all news articles for this brand
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch news' });
        }
        
        // Filter and transform news articles
        const articles = data
            .filter(page => isNewsArticle(page))
            .map(page => transformArticleCard(page));
        
        return res.status(200).json(articles);
        
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper: Check if page is a news article
function isNewsArticle(page) {
    // Check if page has news/blog indicators
    if (page.slug && (page.slug.startsWith('news-') || page.slug.startsWith('blog-'))) return true;
    if (page.title && (page.title.toLowerCase().includes('nieuws') || page.title.toLowerCase().includes('blog'))) return true;
    
    // Check metadata if available
    if (page.metadata && (page.metadata.type === 'news' || page.metadata.type === 'blog')) return true;
    
    return false;
}

// Helper: Transform article for card display
function transformArticleCard(page) {
    return {
        slug: page.slug,
        title: page.title,
        excerpt: extractExcerpt(page.html),
        image: extractFirstImage(page.html),
        author: extractAuthor(page),
        date: formatDate(page.created_at),
        category: extractCategory(page),
        link: `/blog-detail.html?slug=${page.slug}`,
        createdAt: page.created_at
    };
}

// Helper: Transform full article
function transformArticle(page) {
    return {
        slug: page.slug,
        title: page.title,
        html: page.html,
        content: extractContent(page.html),
        images: extractImages(page.html),
        author: extractAuthor(page),
        date: formatDate(page.created_at),
        category: extractCategory(page),
        tags: extractTags(page),
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
    if (!html) return '/assets/images/blog-placeholder.jpg';
    
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : '/assets/images/blog-placeholder.jpg';
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

// Helper: Extract author from page metadata
function extractAuthor(page) {
    if (page.metadata && page.metadata.author) return page.metadata.author;
    return 'Redactie';
}

// Helper: Extract category from page
function extractCategory(page) {
    if (page.metadata && page.metadata.category) return page.metadata.category;
    return 'Algemeen';
}

// Helper: Extract tags from page
function extractTags(page) {
    if (page.metadata && page.metadata.tags) return page.metadata.tags;
    return [];
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('nl-NL', options);
}
