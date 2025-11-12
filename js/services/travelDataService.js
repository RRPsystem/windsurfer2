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
                
                // Try trips-api endpoint first (recommended by BOLT)
                let travels = [];
                try {
                    console.log('[TravelDataService] Trying trips-api endpoint...');
                    const apiUrl = `${baseUrl}/functions/v1/trips-api?for_builder=true`;
                    console.log('[TravelDataService] API URL:', apiUrl);
                    
                    const apiResponse = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${window.BOLT_DB.anonKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (apiResponse.ok) {
                        const apiData = await apiResponse.json();
                        console.log('[TravelDataService] trips-api response:', apiData);
                        
                        // Filter for this brand and published trips
                        travels = (apiData.trips || [])
                            .filter(t => {
                                // Check if trip is assigned to this brand
                                const assignment = t.brand_assignments?.find(a => a.brand_id === brandId);
                                return assignment && assignment.is_published === true;
                            })
                            .map(t => {
                                // Get assignment for this brand
                                const assignment = t.brand_assignments?.find(a => a.brand_id === brandId);
                                return {
                                    ...t,
                                    featured: assignment?.is_featured || false,
                                    priority: assignment?.priority || 999,
                                    assignmentId: assignment?.id,
                                    assignmentStatus: assignment?.status
                                };
                            });
                        
                        console.log('[TravelDataService] Filtered travels from trips-api:', travels.length);
                    } else {
                        throw new Error(`trips-api returned ${apiResponse.status}`);
                    }
                } catch (apiError) {
                    console.warn('[TravelDataService] trips-api failed, falling back to direct query:', apiError.message);
                    
                    // Fallback: Direct Supabase query
                    const fallbackUrl = `${baseUrl}/rest/v1/trip_brand_assignments?select=*,trips(*)&brand_id=eq.${brandId}&is_published=eq.true&status=in.(accepted,mandatory)`;
                    console.log('[TravelDataService] Fallback URL:', fallbackUrl);
                    
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
                    console.log('[TravelDataService] Fetched assignments (fallback):', assignments.length);

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
                    
                    console.log('[TravelDataService] Extracted travels (fallback):', travels.length);
                }

                // Enrich each trip with Travel Compositor detail data
                console.log('[TravelDataService] Enriching trips with Travel Compositor data...');
                const enrichedTravels = await Promise.all(
                    travels.map(async (trip) => {
                        try {
                            // Get Travel Compositor detail data
                            const tcData = await this.getTravelCompositorDetail(trip.id);
                            if (tcData) {
                                console.log('[TravelDataService] Enriched trip:', trip.id, 'with TC data');
                                // Merge TC data with trip data
                                return {
                                    ...trip,
                                    // Override with TC data
                                    title: tcData.title || tcData.largeTitle || trip.title,
                                    description: tcData.description || trip.description,
                                    featured_image: tcData.imageUrl || trip.featured_image,
                                    price: tcData.pricePerPerson?.amount || tcData.totalPrice?.amount || trip.price,
                                    duration_days: tcData.counters?.hotelNights || trip.duration_days,
                                    // Add TC specific data
                                    tc_data: tcData
                                };
                            }
                            return trip;
                        } catch (error) {
                            console.warn('[TravelDataService] Failed to enrich trip:', trip.id, error);
                            return trip; // Return original if enrichment fails
                        }
                    })
                );

                // Transform and cache
                const transformed = enrichedTravels.map(t => this.transformTravel(t));
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
                // Use existing /api/ideas/[id] proxy with info parameter
                const url = `/api/ideas/${ideaId}?info=1&lang=NL`;
                
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

                // Get base URL (remove trailing slash and /functions/v1 if present)
                const baseUrl = window.BOLT_DB.url.replace(/\/+$/, '').replace(/\/functions\/v1$/, '');
                
                // Get JWT token from URL (has trips:write scope)
                const urlParams = new URLSearchParams(window.location.search);
                const jwtToken = urlParams.get('token');
                
                // Use sync-from-builder API instead of direct table access
                // This bypasses RLS and handles proper trip creation
                const saveUrl = `${baseUrl}/functions/v1/sync-from-builder`;
                
                console.log('[TravelDataService] Saving to URL:', saveUrl);
                console.log('[TravelDataService] Using JWT token:', jwtToken ? 'Yes' : 'No (using anonKey)');
                console.log('[TravelDataService] Data to save:', dbTravel);

                const response = await fetch(saveUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwtToken || window.BOLT_DB.anonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'trip',
                        data: dbTravel
                    })
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
                title: dbTravel.title,
                location: dbTravel.destination_id || '',
                duration: `${dbTravel.duration_days || 0} dagen`,
                price: this.formatPrice(dbTravel.price),
                priceRaw: dbTravel.price,
                description: dbTravel.description || dbTravel.content || '',
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
            // Map to actual trips table columns
            // Available columns: id, brand_id, title, slug, content, description, destination_id, 
            // price, duration_days, departure_dates, featured_image, gallery, status, published_at,
            // created_at, updated_at, page_id, author_type, author_id, is_mandatory, 
            // enabled_for_brands, enabled_for_franchise
            
            // Get brand_id from context
            const urlParams = new URLSearchParams(window.location.search);
            const brandId = urlParams.get('brand_id') || 
                           window.websiteBuilder?._edgeCtx?.brand_id || 
                           window.edgeCtx?.brand_id || 
                           window.BOLT_DB?.brandId || 
                           window.BRAND_ID;
            
            console.log('[TravelDataService] transformToDb - brand_id:', brandId);
            
            if (!brandId) {
                console.error('[TravelDataService] No brand_id found! RLS policy will fail.');
            }
            
            const dbTravel = {
                brand_id: brandId, // Required for RLS policy
                title: travel.title || travel.name || 'Untitled',
                description: travel.description || travel.intro || '',
                featured_image: travel.image || travel.imageUrl || '',
                price: parseFloat(travel.priceRaw || travel.price || 0),
                duration_days: parseInt(travel.days || 0),
                status: travel.status || 'draft', // draft, published
                content: travel.description || travel.intro || '' // Full content
            };
            
            // Add optional fields
            if (travel.slug) dbTravel.slug = travel.slug;
            // destination_id is a UUID field - skip for now unless we have a real UUID
            // Travel Compositor destinations use codes like "AAZ-2" which are not UUIDs
            if (travel.gallery) dbTravel.gallery = travel.gallery;
            if (travel.departure_dates) dbTravel.departure_dates = travel.departure_dates;
            
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
