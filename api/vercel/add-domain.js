/**
 * Vercel Domain Management API
 * Adds custom domain to Vercel project
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { domain, websiteId, type = 'live' } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        if (!websiteId) {
            return res.status(400).json({ error: 'Website ID is required' });
        }
        
        // Vercel API configuration
        const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
        const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'website-builder';
        
        if (!VERCEL_TOKEN) {
            console.error('VERCEL_TOKEN not configured');
            return res.status(500).json({ error: 'Vercel not configured' });
        }
        
        console.log(`[Vercel] Adding domain: ${domain} for website: ${websiteId}`);
        
        // Add domain to Vercel project
        const vercelResponse = await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${VERCEL_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: domain,
                    gitBranch: null // Use production deployment
                })
            }
        );
        
        const vercelData = await vercelResponse.json();
        
        if (!vercelResponse.ok) {
            console.error('[Vercel] Error adding domain:', vercelData);
            
            // Check if domain already exists
            if (vercelData.error?.code === 'domain_already_in_use') {
                return res.status(200).json({
                    success: true,
                    domain,
                    message: 'Domain already configured',
                    existing: true
                });
            }
            
            return res.status(vercelResponse.status).json({
                error: 'Failed to add domain to Vercel',
                details: vercelData.error?.message || 'Unknown error'
            });
        }
        
        console.log('[Vercel] Domain added successfully:', domain);
        
        // Update website in Supabase
        const supabaseUrl = process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
        
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const updateData = type === 'live' 
            ? { live_url: domain, status: 'live' }
            : { preview_url: domain, status: 'preview' };
        
        const { error: dbError } = await supabase
            .from('websites')
            .update(updateData)
            .eq('id', websiteId);
        
        if (dbError) {
            console.error('[Database] Error updating website:', dbError);
            // Don't fail if DB update fails, domain is already added
        }
        
        return res.status(200).json({
            success: true,
            domain,
            type,
            vercelDomain: vercelData,
            message: `Domain ${domain} successfully configured`
        });
        
    } catch (error) {
        console.error('[Vercel API] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
