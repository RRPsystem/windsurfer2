// Travel Data Service - Haalt reizen op uit BOLT/Supabase
// Gebruikt voor Travel Overview component en andere reis displays

(function() {
    const TravelDataService = {
        // Cache voor reizen
        cache: {
            travels: null,
            lastFetch: null,
            ttl: 5 * 60 * 1000 // 5 minuten cache
        },

        /**
         * Haal alle reizen op uit BOLT/Supabase
         * @param {Object} options - Filter opties
         * @returns {Promise<Array>} Array van reizen
         */
        async getTravels(options = {}) {
            try {
                // Check cache
                if (this.cache.travels && this.cache.lastFetch && 
                    (Date.now() - this.cache.lastFetch < this.cache.ttl) && 
                    !options.forceRefresh) {
                    console.log('[TravelDataService] Returning cached travels');
                    return this.filterTravels(this.cache.travels, options);
                }

                console.log('[TravelDataService] Fetching travels from BOLT...');

                // Check if we have BOLT_DB configured
                if (!window.BOLT_DB || !window.BOLT_DB.url || !window.BOLT_DB.anonKey) {
                    console.warn('[TravelDataService] BOLT_DB not configured, returning sample data');
                    return this.getSampleTravels();
                }

                // Get brand_id from multiple sources (priority order)
                const urlParams = new URLSearchParams(window.location.search);
                const brandId = urlParams.get('brand_id') ||                    // 1. URL parameter
                               window.websiteBuilder?._edgeCtx?.brand_id ||    // 2. Deeplink context
                               window.edgeCtx?.brand_id ||                     // 3. Legacy context
                               window.BOLT_DB.brandId ||                       // 4. Config
                               window.BRAND_ID ||                              // 5. Legacy global
                               'default';                                      // 6. Fallback
                
                console.log('[TravelDataService] Using brand_id:', brandId);
                
                // Fetch from BOLT database (trip_brand_assignments with trips relation)
                const response = await fetch(`${window.BOLT_DB.url}/rest/v1/trip_brand_assignments?select=*,trips(*)&brand_id=eq.${brandId}&is_published=eq.true&status=in.(accepted,mandatory)`, {
                    headers: {
                        'apikey': window.BOLT_DB.anonKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const assignments = await response.json();
                console.log('[TravelDataService] Fetched assignments:', assignments.length);

                // Extract trips from assignments
                const travels = assignments
                    .filter(a => a.trips) // Only assignments with trips
                    .map(a => a.trips); // Extract trip object
                
                console.log('[TravelDataService] Extracted travels:', travels.length);

                // Transform data naar component format
                const transformedTravels = travels.map(t => this.transformTravel(t));

                // Update cache
                this.cache.travels = transformedTravels;
                this.cache.lastFetch = Date.now();

                return this.filterTravels(transformedTravels, options);

            } catch (error) {
                console.error('[TravelDataService] Error fetching travels:', error);
                // Fallback naar sample data
                return this.getSampleTravels();
            }
        },

        /**
         * Haal featured reizen op
         * @returns {Promise<Array>} Featured reizen
         */
        async getFeaturedTravels() {
            const travels = await this.getTravels();
            return travels.filter(t => t.featured === true);
        },

        /**
         * Haal één specifieke reis op
         * @param {string} id - Reis ID
         * @returns {Promise<Object>} Reis object
         */
        async getTravel(id) {
            try {
                if (!window.BOLT_DB || !window.BOLT_DB.url || !window.BOLT_DB.anonKey) {
                    throw new Error('BOLT_DB not configured');
                }

                // Haal alle reizen op en filter op ID (trips-api heeft geen single ID endpoint)
                const travels = await this.getTravels({ forceRefresh: false });
                const travel = travels.find(t => t.id === id);
                
                if (!travel) {
                    throw new Error('Travel not found');
                }

                return travel;

            } catch (error) {
                console.error('[TravelDataService] Error fetching travel:', error);
                throw error;
            }
        },

        /**
         * Sla een reis op in BOLT
         * @param {Object} travelData - Reis data
         * @returns {Promise<Object>} Opgeslagen reis
         */
        async saveTravel(travelData) {
            try {
                if (!window.BOLT_DB || !window.BOLT_DB.url) {
                    throw new Error('BOLT_DB not configured');
                }

                // Transform naar database format
                const dbTravel = this.transformToDb(travelData);

                const response = await fetch(`${window.BOLT_DB.url}/rest/v1/travels`, {
                    method: 'POST',
                    headers: {
                        'apikey': window.BOLT_DB.anonKey,
                        'Authorization': `Bearer ${window.BOLT_DB.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(dbTravel)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`HTTP ${response.status}: ${error}`);
                }

                const saved = await response.json();
                console.log('[TravelDataService] Travel saved:', saved);

                // Clear cache
                this.clearCache();

                return this.transformTravel(saved[0]);

            } catch (error) {
                console.error('[TravelDataService] Error saving travel:', error);
                throw error;
            }
        },

        /**
         * Update een reis
         * @param {string} id - Reis ID
         * @param {Object} updates - Updates
         * @returns {Promise<Object>} Updated reis
         */
        async updateTravel(id, updates) {
            try {
                if (!window.BOLT_DB || !window.BOLT_DB.url) {
                    throw new Error('BOLT_DB not configured');
                }

                const response = await fetch(`${window.BOLT_DB.url}/rest/v1/travels?id=eq.${id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.BOLT_DB.anonKey,
                        'Authorization': `Bearer ${window.BOLT_DB.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(updates)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const updated = await response.json();
                console.log('[TravelDataService] Travel updated:', updated);

                // Clear cache
                this.clearCache();

                return this.transformTravel(updated[0]);

            } catch (error) {
                console.error('[TravelDataService] Error updating travel:', error);
                throw error;
            }
        },

        /**
         * Verwijder een reis
         * @param {string} id - Reis ID
         */
        async deleteTravel(id) {
            try {
                if (!window.BOLT_DB || !window.BOLT_DB.url) {
                    throw new Error('BOLT_DB not configured');
                }

                const response = await fetch(`${window.BOLT_DB.url}/rest/v1/travels?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': window.BOLT_DB.anonKey,
                        'Authorization': `Bearer ${window.BOLT_DB.anonKey}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log('[TravelDataService] Travel deleted:', id);

                // Clear cache
                this.clearCache();

            } catch (error) {
                console.error('[TravelDataService] Error deleting travel:', error);
                throw error;
            }
        },

        /**
         * Transform database travel naar component format
         */
        transformTravel(dbTravel) {
            return {
                id: dbTravel.id,
                title: dbTravel.title || dbTravel.name,
                location: dbTravel.location || dbTravel.destination,
                duration: dbTravel.duration || `${dbTravel.days || 0} dagen`,
                price: this.formatPrice(dbTravel.price, dbTravel.currency),
                priceRaw: dbTravel.price,
                currency: dbTravel.currency || 'EUR',
                description: dbTravel.description || dbTravel.intro,
                image: dbTravel.image || dbTravel.main_image || dbTravel.header_image,
                tags: dbTravel.tags || dbTravel.travel_type || '',
                
                // BOLT metadata
                featured: dbTravel.featured || false,
                priority: dbTravel.priority || 999,
                status: dbTravel.status || 'published',
                source: dbTravel.source || 'manual',
                
                // Extra data
                days: dbTravel.days,
                destinations: dbTravel.destinations,
                hotels: dbTravel.hotels,
                transports: dbTravel.transports,
                
                // Timestamps
                createdAt: dbTravel.created_at,
                updatedAt: dbTravel.updated_at
            };
        },

        /**
         * Transform component format naar database format
         */
        transformToDb(travel) {
            return {
                title: travel.title || travel.name,
                name: travel.title || travel.name,
                location: travel.location || travel.destination,
                destination: travel.location || travel.destination,
                duration: travel.duration,
                days: travel.days || this.extractDays(travel.duration),
                price: travel.priceRaw || travel.price,
                currency: travel.currency || 'EUR',
                description: travel.description || travel.intro,
                intro: travel.description || travel.intro,
                image: travel.image,
                main_image: travel.image,
                tags: travel.tags || travel.travelType || '',
                travel_type: travel.tags || travel.travelType || '',
                
                // BOLT metadata
                featured: travel.featured || false,
                priority: travel.priority || 999,
                status: travel.status || 'published',
                source: travel.source || 'manual',
                
                // Extra data (JSON)
                destinations: travel.destinations || [],
                hotels: travel.hotels || [],
                transports: travel.transports || [],
                
                // Timestamps
                created_at: travel.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        },

        /**
         * Filter reizen op basis van opties
         */
        filterTravels(travels, options = {}) {
            let filtered = [...travels];

            // Filter op status
            if (options.status) {
                filtered = filtered.filter(t => t.status === options.status);
            } else {
                // Standaard alleen published tonen
                filtered = filtered.filter(t => t.status === 'published');
            }

            // Filter op featured
            if (options.featured === true) {
                filtered = filtered.filter(t => t.featured === true);
            }

            // Filter op tags
            if (options.tags && options.tags.length > 0) {
                filtered = filtered.filter(t => {
                    const travelTags = (t.tags || '').toLowerCase().split(',').map(tag => tag.trim());
                    return options.tags.some(filterTag => 
                        travelTags.some(travelTag => 
                            travelTag.includes(filterTag.toLowerCase()) || 
                            filterTag.toLowerCase().includes(travelTag)
                        )
                    );
                });
            }

            // Filter op prijs range
            if (options.minPrice !== undefined || options.maxPrice !== undefined) {
                filtered = filtered.filter(t => {
                    const price = t.priceRaw || 0;
                    if (options.minPrice !== undefined && price < options.minPrice) return false;
                    if (options.maxPrice !== undefined && price > options.maxPrice) return false;
                    return true;
                });
            }

            // Sorteer op priority (laagste eerst = hoogste prioriteit)
            filtered.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                // Als priority gelijk, sorteer op datum (nieuwste eerst)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            // Limit aantal resultaten
            if (options.limit) {
                filtered = filtered.slice(0, options.limit);
            }

            return filtered;
        },

        /**
         * Format prijs
         */
        formatPrice(price, currency = 'EUR') {
            if (!price) return '€ 0';
            
            try {
                const formatted = new Intl.NumberFormat('nl-NL', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(price);
                return formatted;
            } catch (e) {
                return `€ ${price}`;
            }
        },

        /**
         * Extract dagen uit duration string
         */
        extractDays(duration) {
            if (!duration) return 0;
            const match = duration.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        },

        /**
         * Clear cache
         */
        clearCache() {
            this.cache.travels = null;
            this.cache.lastFetch = null;
            console.log('[TravelDataService] Cache cleared');
        },

        /**
         * Sample data voor fallback
         */
        getSampleTravels() {
            return [
                { 
                    id: 'sample_1',
                    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600',
                    duration: '8 dagen',
                    days: 8,
                    location: 'Thailand',
                    title: 'Rondreis Bangkok & Eilanden',
                    description: 'Ontdek de bruisende hoofdstad en ontspan op paradijselijke stranden',
                    price: '€ 1.299',
                    priceRaw: 1299,
                    currency: 'EUR',
                    tags: 'rondreis,strand,cultuur',
                    featured: true,
                    priority: 1,
                    status: 'published',
                    source: 'sample'
                },
                {
                    id: 'sample_2',
                    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600',
                    duration: '5 dagen',
                    days: 5,
                    location: 'Spanje',
                    title: 'Stedentrip Barcelona',
                    description: 'Gaudi, tapas en het strand - alles in één stad',
                    price: '€ 599',
                    priceRaw: 599,
                    currency: 'EUR',
                    tags: 'stedentrip,cultuur,strand',
                    featured: false,
                    priority: 2,
                    status: 'published',
                    source: 'sample'
                },
                {
                    id: 'sample_3',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
                    duration: '10 dagen',
                    days: 10,
                    location: 'Noorwegen',
                    title: 'Fjorden & Noorderlicht',
                    description: 'Spectaculaire natuur en het magische noorderlicht',
                    price: '€ 1.899',
                    priceRaw: 1899,
                    currency: 'EUR',
                    tags: 'rondreis,actief,natuur',
                    featured: true,
                    priority: 3,
                    status: 'published',
                    source: 'sample'
                }
            ];
        }
    };

    // Expose globally
    window.TravelDataService = TravelDataService;
    console.log('[TravelDataService] ✅ Service loaded');

})();
