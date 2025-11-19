/**
 * Tailwind Template Section Extractor
 * Analyzes all HTML pages and extracts reusable sections
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TEMPLATE_DIR = path.join(__dirname, '../templates/package/src');
const OUTPUT_FILE = path.join(__dirname, '../data/tailwind-sections.json');

// Section types we're looking for
const SECTION_TYPES = {
    HERO: 'hero',
    FEATURES: 'features',
    TOURS: 'tours',
    DESTINATIONS: 'destinations',
    TESTIMONIALS: 'testimonials',
    BLOG: 'blog',
    GALLERY: 'gallery',
    PRICING: 'pricing',
    TEAM: 'team',
    CONTACT: 'contact',
    CTA: 'cta',
    STATS: 'stats',
    FAQ: 'faq',
    SERVICES: 'services'
};

// Identify section type based on classes, content, and structure
function identifySectionType(section) {
    const classes = section.className || '';
    const html = section.innerHTML.toLowerCase();
    
    // Hero sections
    if (classes.includes('hero') || classes.includes('banner') || 
        section.querySelector('.hero') || section.querySelector('[class*="banner"]')) {
        return SECTION_TYPES.HERO;
    }
    
    // Tours/Packages
    if (classes.includes('tour') || classes.includes('package') ||
        html.includes('tour') && (html.includes('price') || html.includes('day'))) {
        return SECTION_TYPES.TOURS;
    }
    
    // Destinations
    if (classes.includes('destination') || html.includes('destination')) {
        return SECTION_TYPES.DESTINATIONS;
    }
    
    // Testimonials
    if (classes.includes('testimonial') || classes.includes('review') ||
        html.includes('testimonial') || (html.includes('client') && html.includes('say'))) {
        return SECTION_TYPES.TESTIMONIALS;
    }
    
    // Features/Services
    if (classes.includes('feature') || classes.includes('service') ||
        (html.includes('feature') && section.querySelectorAll('[class*="col"]').length > 2)) {
        return SECTION_TYPES.FEATURES;
    }
    
    // Blog
    if (classes.includes('blog') || classes.includes('post') ||
        html.includes('blog') || html.includes('article')) {
        return SECTION_TYPES.BLOG;
    }
    
    // Gallery
    if (classes.includes('gallery') || classes.includes('portfolio') ||
        section.querySelectorAll('img').length > 6) {
        return SECTION_TYPES.GALLERY;
    }
    
    // Pricing
    if (classes.includes('pricing') || classes.includes('plan') ||
        (html.includes('price') && html.includes('month'))) {
        return SECTION_TYPES.PRICING;
    }
    
    // Team
    if (classes.includes('team') || classes.includes('staff') ||
        (html.includes('team') && section.querySelectorAll('img').length > 2)) {
        return SECTION_TYPES.TEAM;
    }
    
    // Contact
    if (classes.includes('contact') || html.includes('contact') ||
        section.querySelector('form') && html.includes('email')) {
        return SECTION_TYPES.CONTACT;
    }
    
    // CTA (Call to Action)
    if (classes.includes('cta') || classes.includes('call-to-action') ||
        (section.querySelectorAll('a[class*="btn"]').length > 0 && 
         section.textContent.length < 200)) {
        return SECTION_TYPES.CTA;
    }
    
    // Stats/Counter
    if (classes.includes('counter') || classes.includes('stat') ||
        (html.includes('counter') || (section.querySelectorAll('[class*="number"]').length > 2))) {
        return SECTION_TYPES.STATS;
    }
    
    // FAQ
    if (classes.includes('faq') || classes.includes('accordion') ||
        html.includes('faq') || html.includes('question')) {
        return SECTION_TYPES.FAQ;
    }
    
    return 'unknown';
}

// Extract sections from a single HTML file
function extractSectionsFromFile(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const sections = [];
    const fileName = path.basename(filePath, '.html');
    
    // Find all sections - they use divs with specific patterns
    // Look for: .page-content > div with meaningful classes
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return [];
    
    // Get direct children of page-content that look like sections
    const sectionElements = Array.from(pageContent.children).filter(child => {
        // Must be a div
        if (child.tagName !== 'DIV') return false;
        
        // Must have classes or significant content
        const hasClasses = child.className && child.className.length > 10;
        const hasContent = child.innerHTML.length > 500;
        
        return hasClasses && hasContent;
    });
    
    sectionElements.forEach((section, index) => {
        const type = identifySectionType(section);
        
        // Skip unknown sections
        if (type === 'unknown') return;
        
        // Generate unique ID
        const id = `${fileName}-${type}-${index}`;
        
        // Extract section HTML
        const sectionHTML = section.outerHTML;
        
        // Get preview image if exists
        const firstImg = section.querySelector('img');
        const previewImage = firstImg ? firstImg.getAttribute('src') : null;
        
        // Get section title
        const heading = section.querySelector('h1, h2, h3');
        const title = heading ? heading.textContent.trim() : `${type} Section`;
        
        sections.push({
            id,
            type,
            title,
            source: fileName,
            html: sectionHTML,
            previewImage,
            classes: section.className,
            hasForm: !!section.querySelector('form'),
            hasSlider: !!(section.querySelector('[class*="swiper"]') || section.querySelector('[class*="slider"]')),
            imageCount: section.querySelectorAll('img').length
        });
    });
    
    return sections;
}

// Main extraction function
function extractAllSections() {
    console.log('🔍 Scanning Tailwind template for sections...\n');
    
    const allSections = [];
    const files = fs.readdirSync(TEMPLATE_DIR)
        .filter(f => f.endsWith('.html') && !f.includes('error'));
    
    files.forEach(file => {
        const filePath = path.join(TEMPLATE_DIR, file);
        console.log(`📄 Processing: ${file}`);
        
        try {
            const sections = extractSectionsFromFile(filePath);
            allSections.push(...sections);
            console.log(`   ✓ Found ${sections.length} sections`);
        } catch (error) {
            console.error(`   ✗ Error: ${error.message}`);
        }
    });
    
    // Group by type
    const grouped = {};
    allSections.forEach(section => {
        if (!grouped[section.type]) {
            grouped[section.type] = [];
        }
        grouped[section.type].push(section);
    });
    
    // Create output
    const output = {
        totalSections: allSections.length,
        sectionTypes: Object.keys(grouped).length,
        sections: allSections,
        grouped,
        metadata: {
            extractedAt: new Date().toISOString(),
            templatePath: TEMPLATE_DIR,
            filesProcessed: files.length
        }
    };
    
    // Save to JSON
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    
    console.log('\n✅ Extraction complete!');
    console.log(`📊 Total sections found: ${allSections.length}`);
    console.log(`📁 Section types: ${Object.keys(grouped).length}`);
    console.log(`💾 Saved to: ${OUTPUT_FILE}\n`);
    
    // Print summary
    console.log('📋 Section Summary:');
    Object.entries(grouped).forEach(([type, sections]) => {
        console.log(`   ${type.toUpperCase()}: ${sections.length} variants`);
    });
}

// Run extraction
extractAllSections();
