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
                
                // Get base URL (remove trailing slash and /functions/v1 if present)
                const baseUrl = window.BOLT_DB.url.replace(/\/+$/, '').replace(/\/functions\/v1$/, '');
                console.log('[TravelDataService] Base URL:', baseUrl);
                
                // Use direct Supabase query (trips-api requires special auth)
                let travels = [];
                
                // Direct Supabase query - haal ALLE trips op voor deze brand (ook drafts voor bewerking)
                const fallbackUrl = `${baseUrl}/rest/v1/trip_brand_assignments?select=*,trips(*)&brand_id=eq.${brandId}`;
                console.log('[TravelDataService] Query URL:', fallbackUrl);
                
                const response = await fetch(fallbackUrl, {
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

                // Extract trips from assignments and merge featured/priority from assignment
                travels = assignments
                    .filter(a => a.trips) // Only assignments with trips
                    .map(a => ({
                        ...a.trips, // Trip data
                        // Override with assignment-level featured/priority if present
                        featured: a.is_featured !== undefined ? a.is_featured : a.trips.featured,
                        priority: a.priority !== undefined ? a.priority : a.trips.priority,
                        // Keep assignment metadata
                        assignmentId: a.id,
                        assignmentStatus: a.status
                    }));
                
                console.log('[TravelDataService] Extracted travels:', travels.length);

                // NOTE: TC enrichment disabled - using database data directly
                // The trip.id is a UUID, not the TC numeric ideaId
                // To enable TC enrichment, add a tc_idea_id column to trips table
                console.log('[TravelDataService] Using trip data from database (TC enrichment disabled)');

                // Transform and cache
                const transformed = travels.map(t => this.transformTravel(t));
                this.cache.travels = transformed;
                this.cache.lastFetch = Date.now();

                return this.filterTravels(transformed, options);

            } catch (error) {
                console.error('[TravelDataService] Error fetching travels:', error);
                // Fallback naar sample data
                return this.getSampleTravels();
            }
        },

        /**
         * Haal Travel Compositor detail data op voor een reis
         * @param {string} ideaId - Travel Compositor idea ID
         * @returns {Promise<Object>} Travel Compositor data
         */
        async getTravelCompositorDetail(ideaId) {
            try {
                // Use existing /api/ideas/[id] proxy WITHOUT info parameter (try regular endpoint)
                const url = `/api/ideas/${ideaId}?language=NL`;
                
                console.log('[TravelDataService] Fetching TC detail:', url);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.warn('[TravelDataService] TC API returned:', response.status);
                    // Log response body for debugging
                    const errorText = await response.text();
                    console.warn('[TravelDataService] TC API error body:', errorText);
                    return null;
                }
                
                const data = await response.json();
                return data;
                
            } catch (error) {
                console.warn('[TravelDataService] Error fetching TC detail:', error);
                return null;
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

                // Bepaal Edge Function URL voor veilige opslag via service role
                const functionUrl = window.BOLT_DB.url.replace(/\/functions\/v1$/, '') + '/functions/v1/trips-import';
                
                console.log('[TravelDataService] Saving via Edge Function:', functionUrl);
                console.log('[TravelDataService] Data to save:', dbTravel);

                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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

                // Handle both array and single object response
                const savedTrip = Array.isArray(saved) ? saved[0] : saved;
                return this.transformTravel(savedTrip);

            } catch (error) {
                console.error('[TravelDataService] Error saving travel:', error);
                throw error;
            }
        },

        /**
         * Maak een nette slug van een titel of fallback ID
         */
        slugify(title, fallbackId) {
            try {
                const source = title || fallbackId || '';
                if (!source) {
                    return 'trip-' + Math.random().toString(36).slice(2, 8);
                }

                const base = source
                    .toString()
                    .normalize('NFKD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .slice(0, 80);

                if (!base) {
                    return 'trip-' + Math.random().toString(36).slice(2, 8);
                }

                // Voeg eventueel een korte suffix toe om botsende slugs te verminderen
                const suffix = fallbackId ? '-' + String(fallbackId).slice(-6) : '';
                return base + suffix;

            } catch (e) {
                console.warn('[TravelDataService] slugify error, falling back to random slug', e);
                return 'trip-' + Math.random().toString(36).slice(2, 8);
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
            // Ensure description is a string
            let description = '';
            if (typeof dbTravel.description === 'string') {
                description = dbTravel.description;
            } else if (dbTravel.description && typeof dbTravel.description === 'object') {
                description = JSON.stringify(dbTravel.description);
            } else if (dbTravel.content) {
                description = dbTravel.content;
            }
            
            return {
                id: dbTravel.id,
                title: dbTravel.title || '',
                location: dbTravel.destination_id || '',
                duration: `${dbTravel.duration_days || 0} dagen`,
                price: this.formatPrice(dbTravel.price),
                priceRaw: dbTravel.price,
                description: description,
                image: dbTravel.featured_image || '',
                tags: '',
                
                // BOLT metadata
                featured: dbTravel.is_featured || false,
                priority: dbTravel.priority || 999,
                status: dbTravel.status || 'draft',
                
                // Extra data
                days: dbTravel.duration_days,
                slug: dbTravel.slug,
                gallery: dbTravel.gallery,
                departure_dates: dbTravel.departure_dates,
                
                // Timestamps
                createdAt: dbTravel.created_at,
                updatedAt: dbTravel.updated_at,
                publishedAt: dbTravel.published_at
            };
        },

        /**
         * Transform component format naar database format
         */
        transformToDb(travel) {
            // Get brand_id from context
            const urlParams = new URLSearchParams(window.location.search);
            const brandId = urlParams.get('brand_id') || 
                           window.websiteBuilder?._edgeCtx?.brand_id || 
                           window.edgeCtx?.brand_id || 
                           window.BOLT_DB?.brandId || 
                           window.BRAND_ID;
            
            console.log('[TravelDataService] transformToDb input:', travel);
            console.log('[TravelDataService] transformToDb - brand_id:', brandId);
            
            if (!brandId) {
                console.error('[TravelDataService] No brand_id found! RLS policy will fail.');
            }
            
            // Extract price - handle different formats
            let price = 0;
            if (typeof travel.price === 'number') {
                price = travel.price;
            } else if (travel.priceRaw) {
                price = parseFloat(travel.priceRaw);
            } else if (typeof travel.price === 'string') {
                price = parseFloat(travel.price.replace(/[^0-9.]/g, ''));
            }
            
            // Extract duration
            let duration = 0;
            if (travel.duration_days) {
                duration = parseInt(travel.duration_days);
            } else if (travel.days) {
                duration = parseInt(travel.days);
            } else if (typeof travel.duration === 'string') {
                duration = parseInt(travel.duration.replace(/[^0-9]/g, ''));
            }

            // Zorg dat we altijd een slug hebben (vereist door database NOT NULL constraint)
            const slug = travel.slug || this.slugify(travel.title, travel.id || travel.tcIdeaId || travel.tcId);
            
            const dbTravel = {
                brand_id: brandId,
                title: travel.title || 'Onbekende reis',
                description: travel.description || '',
                featured_image: travel.featured_image || travel.image || travel.imageUrl || '',
                price: price,
                duration_days: duration,
                status: travel.status || 'draft',
                content: travel.description || '',
                slug: slug
            };

            // Add optional fields (only if valid UUID format)
            if (travel.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(travel.id)) {
                dbTravel.id = travel.id;
            }
            // Only add destination_id if it's a valid UUID
            if (travel.destination_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(travel.destination_id)) {
                dbTravel.destination_id = travel.destination_id;
            }
            
            console.log('[TravelDataService] transformToDb output:', dbTravel);
            
            return dbTravel;
        },

        /**
         * Filter reizen op basis van opties
         */
        filterTravels(travels, options = {}) {
            let filtered = [...travels];

            // Filter op status (SKIP - reizen zijn al gefilterd door de query op is_published)
            // De status field in trips tabel is niet hetzelfde als assignment status
            // We filteren al op is_published=true in de query, dus alle reizen hier zijn al "published"
            if (options.status && options.status !== 'published') {
                // Alleen filteren als expliciet een andere status wordt gevraagd
                filtered = filtered.filter(t => t.status === options.status);
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
