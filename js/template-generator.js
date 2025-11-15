/**
 * Template Generator
 * Generates customized website from templates with brand data
 */

class TemplateGenerator {
    constructor(config) {
        this.config = config;
        this.template = config.template;
        this.brandData = {
            name: config.brandName,
            tagline: config.tagline,
            email: config.email,
            phone: config.phone,
            address: config.address,
            primaryColor: config.primaryColor,
            secondaryColor: config.secondaryColor,
            logo: config.logo || null
        };
        this.trips = config.trips || [];
    }

    /**
     * Generate complete website
     */
    async generate() {
        const steps = [
            { name: 'Template laden', fn: () => this.loadTemplate() },
            { name: 'Menu aanpassen', fn: () => this.updateNavigation() },
            { name: 'Footer aanpassen', fn: () => this.updateFooter() },
            { name: 'Kleuren toepassen', fn: () => this.applyBranding() },
            { name: 'Reizen toevoegen', fn: () => this.addTrips() },
            { name: 'Contact info invullen', fn: () => this.updateContactInfo() },
            { name: 'Website genereren', fn: () => this.finalizeWebsite() }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.updateProgress(step.name, (i / steps.length) * 100);
            
            try {
                await step.fn();
                await this.delay(500); // Visual feedback
            } catch (error) {
                console.error(`Error in step ${step.name}:`, error);
                throw new Error(`Fout bij ${step.name}: ${error.message}`);
            }
        }

        this.updateProgress('Voltooid!', 100);
        return this.getGeneratedFiles();
    }

    /**
     * Load template HTML files
     */
    async loadTemplate() {
        const templatePaths = {
            'gotur': 'templates/gotur/gotur-html-main/',
            'tripix': 'templates/tripix-html/'
        };

        this.templatePath = templatePaths[this.template];
        if (!this.templatePath) {
            throw new Error('Onbekende template');
        }

        // Load main index.html
        const response = await fetch(this.templatePath + 'index.html');
        if (!response.ok) {
            throw new Error('Kon template niet laden');
        }

        this.htmlContent = await response.text();
        this.parser = new DOMParser();
        this.doc = this.parser.parseFromString(this.htmlContent, 'text/html');
    }

    /**
     * Update navigation menu
     */
    updateNavigation() {
        // Find main navigation
        const nav = this.doc.querySelector('nav, .main-menu, .navbar');
        if (!nav) return;

        // Create menu structure
        const menuItems = [
            { label: 'Home', url: 'index.html' },
            { label: 'Reizen', url: 'trips.html' },
            { label: 'Bestemmingen', url: 'destinations.html' },
            { label: 'Over Ons', url: 'about.html' },
            { label: 'Contact', url: 'contact.html' }
        ];

        // Find menu list
        const menuList = nav.querySelector('ul');
        if (menuList) {
            // Keep existing structure but update links
            const existingItems = menuList.querySelectorAll('li');
            existingItems.forEach((item, index) => {
                if (menuItems[index]) {
                    const link = item.querySelector('a');
                    if (link) {
                        link.textContent = menuItems[index].label;
                        link.href = menuItems[index].url;
                    }
                }
            });
        }
    }

    /**
     * Update footer with brand info
     */
    updateFooter() {
        const footer = this.doc.querySelector('footer');
        if (!footer) return;

        // Update company name
        const companyElements = footer.querySelectorAll('.company-name, .footer-brand, h3, h4');
        companyElements.forEach(el => {
            if (el.textContent.toLowerCase().includes('gotur') || 
                el.textContent.toLowerCase().includes('tripix') ||
                el.textContent.toLowerCase().includes('company')) {
                el.textContent = this.brandData.name;
            }
        });

        // Update contact info
        const emailLinks = footer.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.href = `mailto:${this.brandData.email}`;
            link.textContent = this.brandData.email;
        });

        const phoneLinks = footer.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            link.href = `tel:${this.brandData.phone}`;
            link.textContent = this.brandData.phone;
        });

        // Update address
        const addressElements = footer.querySelectorAll('.address, .location');
        addressElements.forEach(el => {
            el.textContent = this.brandData.address;
        });

        // Update copyright
        const copyrightElements = footer.querySelectorAll('.copyright, .copy');
        const currentYear = new Date().getFullYear();
        copyrightElements.forEach(el => {
            el.innerHTML = `© ${currentYear} ${this.brandData.name}. Alle rechten voorbehouden.`;
        });
    }

    /**
     * Apply brand colors
     */
    applyBranding() {
        // Create custom CSS for brand colors
        const style = this.doc.createElement('style');
        style.textContent = `
            /* Brand Colors Override */
            :root {
                --primary-color: ${this.brandData.primaryColor};
                --secondary-color: ${this.brandData.secondaryColor};
            }
            
            .btn-primary, .button-primary {
                background: ${this.brandData.primaryColor} !important;
            }
            
            .btn-secondary, .button-secondary {
                background: ${this.brandData.secondaryColor} !important;
            }
            
            a:hover, .link:hover {
                color: ${this.brandData.primaryColor} !important;
            }
            
            .bg-primary {
                background-color: ${this.brandData.primaryColor} !important;
            }
            
            .bg-secondary {
                background-color: ${this.brandData.secondaryColor} !important;
            }
            
            .text-primary {
                color: ${this.brandData.primaryColor} !important;
            }
            
            .border-primary {
                border-color: ${this.brandData.primaryColor} !important;
            }
        `;
        
        this.doc.head.appendChild(style);

        // Update logo text if no logo image
        const logoElements = this.doc.querySelectorAll('.logo, .brand, .site-title');
        logoElements.forEach(el => {
            const img = el.querySelector('img');
            if (!img && !this.brandData.logo) {
                el.textContent = this.brandData.name;
                el.style.color = this.brandData.primaryColor;
                el.style.fontWeight = 'bold';
                el.style.fontSize = '24px';
            }
        });
    }

    /**
     * Add trips to the page
     */
    addTrips() {
        if (this.trips.length === 0) return;

        // Find trips container
        const tripsContainer = this.doc.querySelector('.tours-grid, .trips-grid, .destinations-grid, .tour-listing');
        if (!tripsContainer) return;

        // Clear existing demo content
        tripsContainer.innerHTML = '';

        // Add trips
        this.trips.forEach(trip => {
            const tripCard = this.createTripCard(trip);
            tripsContainer.appendChild(tripCard);
        });
    }

    /**
     * Create trip card HTML
     */
    createTripCard(trip) {
        const card = this.doc.createElement('div');
        card.className = 'trip-card col-lg-4 col-md-6';
        
        const imageUrl = trip.hero_image || trip.image || 'assets/images/placeholder.jpg';
        const price = trip.price ? `€${trip.price}` : 'Prijs op aanvraag';
        const duration = trip.duration || 'Meerdere dagen';
        
        card.innerHTML = `
            <div class="trip-card-inner">
                <div class="trip-image">
                    <img src="${imageUrl}" alt="${trip.title}" onerror="this.src='assets/images/placeholder.jpg'">
                </div>
                <div class="trip-content">
                    <h3 class="trip-title">${trip.title}</h3>
                    <p class="trip-destination">${trip.destination || ''}</p>
                    <div class="trip-meta">
                        <span class="trip-duration">⏱️ ${duration}</span>
                        <span class="trip-price">${price}</span>
                    </div>
                    <a href="trip-details.html?id=${trip.id}" class="btn btn-primary">Bekijk Reis</a>
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Update contact information throughout the site
     */
    updateContactInfo() {
        // Update all email references
        const emailElements = this.doc.querySelectorAll('[href^="mailto:"]');
        emailElements.forEach(el => {
            el.href = `mailto:${this.brandData.email}`;
            if (el.textContent.includes('@')) {
                el.textContent = this.brandData.email;
            }
        });

        // Update all phone references
        const phoneElements = this.doc.querySelectorAll('[href^="tel:"]');
        phoneElements.forEach(el => {
            el.href = `tel:${this.brandData.phone}`;
            if (el.textContent.match(/[\d\s\-\+\(\)]/)) {
                el.textContent = this.brandData.phone;
            }
        });

        // Update tagline/slogan
        if (this.brandData.tagline) {
            const taglineElements = this.doc.querySelectorAll('.tagline, .slogan, .subtitle');
            taglineElements.forEach(el => {
                el.textContent = this.brandData.tagline;
            });
        }
    }

    /**
     * Finalize website generation
     */
    finalizeWebsite() {
        // Add meta tags
        const metaDescription = this.doc.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = `${this.brandData.name} - ${this.brandData.tagline || 'Uw specialist in reizen'}`;
        }

        const title = this.doc.querySelector('title');
        if (title) {
            title.textContent = `${this.brandData.name} - Home`;
        }

        // Add custom script for dynamic content
        const script = this.doc.createElement('script');
        script.textContent = `
            // Brand configuration
            window.BRAND_CONFIG = ${JSON.stringify(this.brandData)};
            window.TRIPS_DATA = ${JSON.stringify(this.trips)};
            
            // Initialize when DOM is ready
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Website generated for:', window.BRAND_CONFIG.name);
            });
        `;
        this.doc.body.appendChild(script);

        // Serialize back to HTML
        this.generatedHTML = '<!DOCTYPE html>\n' + this.doc.documentElement.outerHTML;
    }

    /**
     * Get generated files
     */
    getGeneratedFiles() {
        return {
            'index.html': this.generatedHTML,
            'config.json': JSON.stringify({
                brand: this.brandData,
                trips: this.trips,
                template: this.template,
                generatedAt: new Date().toISOString()
            }, null, 2)
        };
    }

    /**
     * Update progress callback
     */
    updateProgress(message, percentage) {
        if (this.onProgress) {
            this.onProgress(message, percentage);
        }
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateGenerator;
}
