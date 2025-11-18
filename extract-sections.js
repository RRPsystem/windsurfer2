// Script to extract all sections from Tripix template pages
const fs = require('fs');
const path = require('path');

const tripixDir = path.join(__dirname, 'templates', 'tripix-html');
const pages = [
    'index.html',
    'index-2.html', 
    'index-3.html',
    'trips.html',
    'destinations.html',
    'destination-details.html',
    'blog.html',
    'blog-details.html',
    'faq.html',
    'contact.html'
];

const extractedSections = {};

pages.forEach(pageName => {
    const filePath = path.join(tripixDir, pageName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${pageName} - file not found`);
        return;
    }
    
    console.log(`📄 Processing ${pageName}...`);
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Extract sections using regex (simple approach without DOM parsing)
    const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/gi;
    const matches = [...html.matchAll(sectionRegex)];
    
    matches.forEach((match, index) => {
        const sectionHTML = match[0];
        const sectionContent = match[1];
        
        // Skip very small sections
        if (sectionHTML.length < 500) return;
        
        // Skip header, footer sections
        if (sectionHTML.includes('class="header') || 
            sectionHTML.includes('class="footer') ||
            sectionHTML.includes('id="navbars"')) return;
        
        // Determine category based on classes and content
        let category = 'Overige';
        let sectionName = `Sectie ${index + 1}`;
        
        if (sectionHTML.match(/hero|banner|breadcrumb/i)) {
            category = 'Hero Secties';
            sectionName = `Hero ${pageName.replace('.html', '')}`;
        } else if (sectionHTML.match(/about|over-ons/i)) {
            category = 'Over Ons';
            sectionName = `About ${index + 1}`;
        } else if (sectionHTML.match(/service|dienst/i)) {
            category = 'Services';
            sectionName = `Service ${index + 1}`;
        } else if (sectionHTML.match(/destination|bestemming/i)) {
            category = 'Bestemmingen';
            sectionName = `Bestemming ${index + 1}`;
        } else if (sectionHTML.match(/tour|package|reis/i)) {
            category = 'Tours & Packages';
            sectionName = `Tour ${index + 1}`;
        } else if (sectionHTML.match(/blog|article/i)) {
            category = 'Blog';
            sectionName = `Blog ${index + 1}`;
        } else if (sectionHTML.match(/testimonial|review/i)) {
            category = 'Testimonials';
            sectionName = `Testimonial ${index + 1}`;
        } else if (sectionHTML.match(/gallery|galerij/i)) {
            category = 'Galerijen';
            sectionName = `Galerij ${index + 1}`;
        } else if (sectionHTML.match(/cta|call-to-action/i)) {
            category = 'Call-to-Action';
            sectionName = `CTA ${index + 1}`;
        } else if (sectionHTML.match(/contact|form/i)) {
            category = 'Contact';
            sectionName = `Contact ${index + 1}`;
        } else if (sectionHTML.match(/faq|accordion/i)) {
            category = 'FAQ';
            sectionName = `FAQ ${index + 1}`;
        } else if (sectionHTML.match(/feature|kenmerk/i)) {
            category = 'Features';
            sectionName = `Feature ${index + 1}`;
        }
        
        // Extract heading for description
        const headingMatch = sectionHTML.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
        const desc = headingMatch ? 
            headingMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 50) : 
            'Sectie uit ' + pageName;
        
        // Initialize category if not exists
        if (!extractedSections[category]) {
            extractedSections[category] = [];
        }
        
        // Add to extracted sections
        extractedSections[category].push({
            name: sectionName,
            desc: desc,
            source: pageName,
            html: sectionHTML
        });
    });
});

// Generate JavaScript code for the section library
let jsCode = `// Auto-generated section library from Tripix template pages
// Generated on ${new Date().toISOString()}

const tripixSectionLibrary = {\n`;

Object.keys(extractedSections).sort().forEach(category => {
    jsCode += `    '${category}': [\n`;
    
    extractedSections[category].forEach((section, index) => {
        const isLast = index === extractedSections[category].length - 1;
        jsCode += `        {\n`;
        jsCode += `            name: '${section.name.replace(/'/g, "\\'")}',\n`;
        jsCode += `            desc: '${section.desc.replace(/'/g, "\\'")}',\n`;
        jsCode += `            source: '${section.source}',\n`;
        jsCode += `            icon: 'puzzle-piece',\n`;
        jsCode += `            html: \`${section.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n`;
        jsCode += `        }${isLast ? '' : ','}\n`;
    });
    
    jsCode += `    ],\n`;
});

jsCode += `};\n\n`;
jsCode += `// Export for use in template-editor.js\n`;
jsCode += `if (typeof module !== 'undefined' && module.exports) {\n`;
jsCode += `    module.exports = tripixSectionLibrary;\n`;
jsCode += `}\n`;

// Write to file
const outputPath = path.join(__dirname, 'js', 'tripix-sections.js');
fs.writeFileSync(outputPath, jsCode, 'utf-8');

console.log(`\n✅ Extracted ${Object.values(extractedSections).flat().length} sections from ${pages.length} pages`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`\n📊 Breakdown by category:`);
Object.keys(extractedSections).sort().forEach(category => {
    console.log(`   - ${category}: ${extractedSections[category].length} sections`);
});
