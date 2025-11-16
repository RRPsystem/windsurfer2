/**
 * Subdomain utilities for generating preview URLs
 */

/**
 * Generate a subdomain from brand name or slug
 * @param {string} brandName - Brand name or slug
 * @returns {string} - Sanitized subdomain
 */
export function generateSubdomain(brandName) {
    if (!brandName) {
        throw new Error('Brand name is required');
    }
    
    return brandName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, '') // Remove leading/trailing dashes
        .substring(0, 63); // Max subdomain length
}

/**
 * Generate full preview URL
 * @param {string} brandSlug - Brand slug
 * @returns {string} - Full preview URL
 */
export function generatePreviewUrl(brandSlug) {
    const subdomain = generateSubdomain(brandSlug);
    return `${subdomain}.ai-websitestudio.nl`;
}

/**
 * Validate subdomain format
 * @param {string} subdomain - Subdomain to validate
 * @returns {boolean} - Is valid
 */
export function isValidSubdomain(subdomain) {
    // RFC 1123 subdomain rules
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
}

/**
 * Extract subdomain from URL
 * @param {string} url - Full URL
 * @returns {string|null} - Subdomain or null
 */
export function extractSubdomain(url) {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const parts = urlObj.hostname.split('.');
        
        // Check if it's a subdomain of ai-websitestudio.nl
        if (parts.length >= 3 && parts.slice(-2).join('.') === 'ai-websitestudio.nl') {
            return parts[0];
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Check if URL is a preview URL
 * @param {string} url - URL to check
 * @returns {boolean} - Is preview URL
 */
export function isPreviewUrl(url) {
    return url.includes('.ai-websitestudio.nl');
}

/**
 * Generate unique subdomain if exists
 * @param {string} baseSubdomain - Base subdomain
 * @param {Function} checkExists - Async function to check if subdomain exists
 * @returns {Promise<string>} - Unique subdomain
 */
export async function generateUniqueSubdomain(baseSubdomain, checkExists) {
    let subdomain = generateSubdomain(baseSubdomain);
    let counter = 1;
    
    while (await checkExists(subdomain)) {
        subdomain = generateSubdomain(`${baseSubdomain}-${counter}`);
        counter++;
    }
    
    return subdomain;
}
