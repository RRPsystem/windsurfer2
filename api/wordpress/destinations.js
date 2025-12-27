// WordPress Destinations API - SECURITY ENHANCED
// Provides destination content for WordPress multisite integration
// Supports both push (webhook) and pull (REST API) models
// 
// SECURITY FEATURES:
// - Brand ownership verification (API key → brand_id mapping)
// - Webhook URL allowlist
// - Rate limiting per brand
// - Update strategy (merge vs overwrite)

const crypto = require('crypto');

// Configuration - Move to environment variables in production
const CONFIG = {
    // Allowed WordPress domains for webhooks
    ALLOWED_WEBHOOK_DOMAINS: [
        'localhost',
        '127.0.0.1',
        '.ai-websitestudio.nl',
        '.ai-travelstudio.nl',
        // Add agent domains here
    ],
    
    // Rate limits
    RATE_LIMIT_PER_BRAND_PER_HOUR: 50,
    RATE_LIMIT_PER_BRAND_PER_DAY: 200,
    
    // Generation timeout
    GENERATION_TIMEOUT_MS: 45000, // 45 seconds
    
    // Update strategy
    DEFAULT_UPDATE_STRATEGY: 'merge', // 'merge' or 'overwrite'
};

export default async function handler(req, res) {
    // Enable CORS for WordPress domains only
    const origin = req.headers.origin || req.headers.referer;
    if (isAllowedOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-WordPress-Site');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // 🔐 SECURITY: Verify API key and get authorized brand_id
        const authResult = await verifyAuthentication(req);
        if (!authResult.success) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: authResult.message 
            });
        }
        
        const { brandId: authorizedBrandId, apiKey } = authResult;
        
        // 🔐 SECURITY: Rate limiting check
        const rateLimitResult = await checkRateLimit(authorizedBrandId);
        if (!rateLimitResult.allowed) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: rateLimitResult.message,
                retryAfter: rateLimitResult.retryAfter
            });
        }
        
        // GET: WordPress pulls destination data
        if (req.method === 'GET') {
            return await handlePullRequest(req, res, authorizedBrandId);
        }
        
        // POST: Generate and push to WordPress
        if (req.method === 'POST') {
            return await handlePushRequest(req, res, authorizedBrandId, apiKey);
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('[WordPress API] Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
}

// 🔐 SECURITY: Verify authentication and return authorized brand_id
async function verifyAuthentication(req) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const requestedBrandId = req.query.brandId || req.body.brandId;
    
    if (!apiKey) {
        return { 
            success: false, 
            message: 'API key required. Provide X-API-Key header or Authorization: Bearer token' 
        };
    }
    
    if (!requestedBrandId) {
        return { 
            success: false, 
            message: 'brandId required' 
        };
    }
    
    // Initialize Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    // 🔐 Verify: Does this API key belong to this brand?
    // Check brands table for api_key matching
    const { data: brand, error } = await supabase
        .from('brands')
        .select('id, api_key, name, settings')
        .eq('id', requestedBrandId)
        .single();
    
    if (error || !brand) {
        console.warn('[Auth] Brand not found:', requestedBrandId);
        return { 
            success: false, 
            message: 'Invalid brand_id' 
        };
    }
    
    // Verify API key matches (use constant-time comparison)
    const expectedApiKey = brand.api_key || process.env.SUPABASE_ANON_KEY;
    
    if (!timingSafeEqual(apiKey, expectedApiKey)) {
        console.warn('[Auth] API key mismatch for brand:', requestedBrandId);
        return { 
            success: false, 
            message: 'Invalid API key for this brand' 
        };
    }
    
    console.log('[Auth] ✅ Authorized:', brand.name, '(' + requestedBrandId + ')');
    
    return { 
        success: true, 
        brandId: requestedBrandId,
        apiKey: apiKey,
        brandName: brand.name,
        settings: brand.settings || {}
    };
}

// 🔐 SECURITY: Timing-safe string comparison
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    
    // Ensure same length to prevent timing attacks
    if (a.length !== b.length) {
        return false;
    }
    
    try {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

// 🔐 SECURITY: Check rate limits
async function checkRateLimit(brandId) {
    // Use Vercel KV or Redis in production
    // For now, use simple in-memory cache (resets on cold start)
    
    if (!global.rateLimitCache) {
        global.rateLimitCache = new Map();
    }
    
    const now = Date.now();
    const hour = Math.floor(now / (1000 * 60 * 60));
    const day = Math.floor(now / (1000 * 60 * 60 * 24));
    
    const hourKey = `${brandId}:${hour}`;
    const dayKey = `${brandId}:${day}`;
    
    const hourCount = global.rateLimitCache.get(hourKey) || 0;
    const dayCount = global.rateLimitCache.get(dayKey) || 0;
    
    // Check limits
    if (hourCount >= CONFIG.RATE_LIMIT_PER_BRAND_PER_HOUR) {
        return {
            allowed: false,
            message: `Rate limit exceeded: ${CONFIG.RATE_LIMIT_PER_BRAND_PER_HOUR} requests per hour`,
            retryAfter: 3600 - (Math.floor(now / 1000) % 3600)
        };
    }
    
    if (dayCount >= CONFIG.RATE_LIMIT_PER_BRAND_PER_DAY) {
        return {
            allowed: false,
            message: `Daily rate limit exceeded: ${CONFIG.RATE_LIMIT_PER_BRAND_PER_DAY} requests per day`,
            retryAfter: 86400 - (Math.floor(now / 1000) % 86400)
        };
    }
    
    // Increment counters
    global.rateLimitCache.set(hourKey, hourCount + 1);
    global.rateLimitCache.set(dayKey, dayCount + 1);
    
    // Cleanup old entries (simple memory management)
    if (global.rateLimitCache.size > 10000) {
        const oldHour = hour - 2;
        for (const [key] of global.rateLimitCache) {
            if (key.includes(':') && parseInt(key.split(':')[1]) < oldHour) {
                global.rateLimitCache.delete(key);
            }
        }
    }
    
    return { 
        allowed: true,
        remaining: {
            hour: CONFIG.RATE_LIMIT_PER_BRAND_PER_HOUR - hourCount - 1,
            day: CONFIG.RATE_LIMIT_PER_BRAND_PER_DAY - dayCount - 1
        }
    };
}

// 🔐 SECURITY: Check if origin is allowed
function isAllowedOrigin(origin) {
    if (!origin) return false;
    
    try {
        const url = new URL(origin);
        const hostname = url.hostname;
        
        return CONFIG.ALLOWED_WEBHOOK_DOMAINS.some(allowed => {
            if (allowed.startsWith('.')) {
                // Wildcard domain: .example.com matches subdomain.example.com
                return hostname.endsWith(allowed) || hostname === allowed.substring(1);
            }
            return hostname === allowed;
        });
    } catch {
        return false;
    }
}

// 🔐 SECURITY: Verify webhook URL is allowed
function isAllowedWebhookUrl(url) {
    if (!url) return false;
    
    try {
        const parsed = new URL(url);
        
        // Must be HTTPS in production
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
            return false;
        }
        
        // Check if domain is in allowlist
        const hostname = parsed.hostname;
        return CONFIG.ALLOWED_WEBHOOK_DOMAINS.some(allowed => {
            if (allowed.startsWith('.')) {
                return hostname.endsWith(allowed) || hostname === allowed.substring(1);
            }
            return hostname === allowed;
        });
    } catch {
        return false;
    }
}

// PULL MODEL: WordPress requests existing destination
// authorizedBrandId is already verified by authentication middleware
async function handlePullRequest(req, res, authorizedBrandId) {
    const { slug, format = 'wordpress' } = req.query;
    
    // Use authorized brand ID (not from query - security!)
    const brandId = authorizedBrandId;
    
    console.log('[Pull] Fetching destinations for brand:', brandId);
    
    // Initialize Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    // Single destination
    if (slug) {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
            .eq('brand_id', brandId)
            .eq('slug', slug)
            .single();
        
        if (error) {
            return res.status(404).json({ error: 'Destination not found' });
        }
        
        const destination = transformForWordPress(data);
        return res.status(200).json(destination);
    }
    
    // All destinations
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(500).json({ error: 'Failed to fetch destinations' });
    }
    
    // Filter destinations (pages with destination metadata)
    const destinations = data
        .filter(page => isDestination(page))
        .map(page => transformForWordPress(page));
    
    return res.status(200).json({
        total: destinations.length,
        destinations: destinations
    });
}

// PUSH MODEL: Generate and send to WordPress
// authorizedBrandId is already verified by authentication middleware
async function handlePushRequest(req, res, authorizedBrandId, apiKey) {
    const { 
        destination,
        wordpressUrl,
        wordpressAuth,
        generateContent = true,
        updateStrategy = CONFIG.DEFAULT_UPDATE_STRATEGY // 'merge' or 'overwrite'
    } = req.body;
    
    // Use authorized brand ID (not from body - security!)
    const brandId = authorizedBrandId;
    
    if (!destination) {
        return res.status(400).json({ 
            error: 'destination is required' 
        });
    }
    
    // 🔐 SECURITY: Verify webhook URL is in allowlist
    if (wordpressUrl && !isAllowedWebhookUrl(wordpressUrl)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'WordPress URL not in allowlist. Contact admin to add your domain.'
        });
    }
    
    console.log('[Push] Request:', { brandId, destination, updateStrategy });
    
    // Step 1: Check if destination already exists in builder
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    const slug = slugify(destination);
    let destinationData;
    
    const { data: existing } = await supabase
        .from('pages')
        .select('*')
        .eq('brand_id', brandId)
        .eq('slug', `destination-${slug}`)
        .single();
    
    if (existing) {
        console.log('[Push] Using existing destination');
        
        // Apply update strategy if content exists
        if (updateStrategy === 'overwrite' && generateContent) {
            console.log('[Push] Regenerating content (overwrite strategy)');
            try {
                destinationData = await generateDestinationContentWithTimeout(destination, brandId, supabase);
            } catch (error) {
                // If generation fails, use existing
                console.warn('[Push] Regeneration failed, using existing:', error.message);
                destinationData = existing;
            }
        } else {
            // 'merge' strategy: use existing data
            destinationData = existing;
        }
    } else if (generateContent) {
        // Step 2: Generate new content using AI with timeout
        console.log('[Push] Generating new destination content');
        try {
            destinationData = await generateDestinationContentWithTimeout(destination, brandId, supabase);
        } catch (error) {
            if (error.message === 'Generation timeout') {
                // Return 202 Accepted - processing in background
                return res.status(202).json({
                    success: false,
                    processing: true,
                    message: 'Content generation started but exceeded timeout. Check back in 1-2 minutes.',
                    destination: destination,
                    slug: `destination-${slug}`,
                    retryAfter: 120 // seconds
                });
            }
            throw error;
        }
    } else {
        return res.status(404).json({ 
            error: 'Destination not found and generateContent is false' 
        });
    }
    
    // Step 3: Transform for WordPress ACF format
    const wpData = transformForWordPress(destinationData);
    
    // Step 4: Push to WordPress (if URL and auth provided)
    if (wordpressUrl && wordpressAuth) {
        try {
            const wpResponse = await pushToWordPress(wpData, wordpressUrl, wordpressAuth, updateStrategy);
            console.log('[Push] Successfully pushed to WordPress');
            
            return res.status(200).json({
                success: true,
                destination: wpData,
                wordpress: wpResponse
            });
        } catch (wpError) {
            console.error('[WordPress API] Failed to push to WordPress:', wpError);
            return res.status(200).json({
                success: true,
                destination: wpData,
                wordpress: {
                    error: wpError.message,
                    note: 'Content generated but WordPress push failed'
                }
            });
        }
    }
    
    // Return data without pushing to WordPress
    return res.status(200).json({
        success: true,
        destination: wpData
    });
}

// ⏱️ TIMEOUT: Generate with timeout protection
async function generateDestinationContentWithTimeout(destination, brandId, supabase) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout')), CONFIG.GENERATION_TIMEOUT_MS);
    });
    
    const generationPromise = generateDestinationContent(destination, brandId, supabase);
    
    return Promise.race([generationPromise, timeoutPromise]);
}

// Generate destination content using AI
async function generateDestinationContent(destination, brandId, supabase) {
    // Call research API to gather information
    const researchResponse = await fetch(`${process.env.VERCEL_URL || 'https://www.ai-websitestudio.nl'}/api/research/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination })
    });
    
    if (!researchResponse.ok) {
        throw new Error('Failed to research destination');
    }
    
    const research = await researchResponse.json();
    
    // Generate HTML content
    const html = generateDestinationHTML(destination, research);
    
    // Save to database
    const slug = `destination-${slugify(destination)}`;
    const { data, error } = await supabase
        .from('pages')
        .insert({
            brand_id: brandId,
            slug: slug,
            title: destination,
            html: html,
            metadata: {
                type: 'destination',
                research: research,
                generatedAt: new Date().toISOString()
            },
            show_in_menu: false
        })
        .select()
        .single();
    
    if (error) {
        throw new Error(`Failed to save destination: ${error.message}`);
    }
    
    return data;
}

// Generate HTML from research data
function generateDestinationHTML(destination, research) {
    const { highlights, bestTime, culture, activities, places } = research;
    
    let html = `
    <div class="destination-content">
        <h1>${destination}</h1>
        
        ${highlights.length > 0 ? `
        <section class="highlights">
            <h2>Highlights</h2>
            <ul>
                ${highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </section>
        ` : ''}
        
        ${bestTime ? `
        <section class="best-time">
            <h2>Beste Reistijd</h2>
            <p>${bestTime}</p>
        </section>
        ` : ''}
        
        ${activities.length > 0 ? `
        <section class="activities">
            <h2>Activiteiten</h2>
            <ul>
                ${activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
        </section>
        ` : ''}
        
        ${culture.length > 0 ? `
        <section class="culture">
            <h2>Cultuur & Lokale Tradities</h2>
            <ul>
                ${culture.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </section>
        ` : ''}
        
        ${places && places.length > 0 ? `
        <section class="places">
            <h2>Top Attracties</h2>
            <div class="places-grid">
                ${places.slice(0, 6).map(p => `
                    <div class="place-card">
                        <h3>${p.name}</h3>
                        ${p.rating ? `<div class="rating">⭐ ${p.rating} (${p.reviews} reviews)</div>` : ''}
                        ${p.address ? `<p class="address">${p.address}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
    </div>
    `;
    
    return html;
}

// Transform page data to WordPress ACF format
function transformForWordPress(page) {
    const content = extractContent(page.html);
    const images = extractImages(page.html);
    const research = page.metadata?.research || {};
    
    return {
        // WordPress post fields
        title: page.title,
        slug: page.slug,
        status: 'draft', // WordPress will publish
        
        // ACF fields structure
        acf: {
            // Hero section
            hero_title: page.title,
            hero_subtitle: research.bestTime || '',
            hero_image: images[0] || '',
            
            // Introduction
            introduction: extractExcerpt(page.html, 300),
            
            // Highlights
            highlights: (research.highlights || []).map((text, index) => ({
                title: `Highlight ${index + 1}`,
                description: text,
                icon: 'star' // WordPress kan dit customizen
            })),
            
            // Activities
            activities: (research.activities || []).map((text, index) => ({
                title: `Activiteit ${index + 1}`,
                description: text,
                icon: 'activity'
            })),
            
            // Culture section
            culture_title: 'Cultuur & Tradities',
            culture_content: (research.culture || []).join('\n\n'),
            
            // Places/Attractions
            attractions: (research.places || []).slice(0, 10).map(place => ({
                name: place.name,
                rating: place.rating || 0,
                reviews: place.reviews || 0,
                address: place.address || '',
                types: (place.types || []).join(', '),
                website: place.website || '',
                image: place.photos?.[0] ? 
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].reference}&key=${process.env.GOOGLE_PLACES_API_KEY}` 
                    : ''
            })),
            
            // SEO
            meta_description: extractExcerpt(page.html, 160),
            meta_keywords: page.title,
            
            // Images gallery
            gallery: images.slice(1, 10), // Exclude hero image
            
            // Best time to visit
            best_time_title: 'Beste Reistijd',
            best_time_content: research.bestTime || '',
            
            // Raw data for custom usage
            raw_html: content,
            generated_at: page.metadata?.generatedAt || page.created_at,
            builder_url: `https://www.ai-websitestudio.nl/builder.html?slug=${page.slug}`,
            
            // Sources
            sources: (research.sources || []).map(s => ({
                title: s.title,
                url: s.url,
                snippet: s.snippet
            }))
        },
        
        // Builder metadata
        builder: {
            id: page.id,
            brand_id: page.brand_id,
            created_at: page.created_at,
            updated_at: page.updated_at
        }
    };
}

// Push to WordPress REST API
async function pushToWordPress(wpData, wordpressUrl, auth, updateStrategy = 'merge') {
    const endpoint = `${wordpressUrl}/wp-json/wp/v2/destinations`;
    
    // Add update strategy to payload
    const payload = {
        ...wpData,
        _aiws_update_strategy: updateStrategy
    };
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth // Basic or Bearer token
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WordPress API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
}

// Helper functions
function isDestination(page) {
    if (page.slug && page.slug.startsWith('destination-')) return true;
    if (page.metadata && page.metadata.type === 'destination') return true;
    return false;
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

function extractExcerpt(html, maxLength = 150) {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

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

function extractContent(html) {
    if (!html) return '';
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    return content;
}
