// Travel Management View - Beheer reizen in BOLT
// Toont alle reizen met featured toggle en priority management
(function() {
    const TravelManagementView = {
        currentFilter: 'all',
        travels: [],

        mount(container) {
            if (!container) return;
            container.innerHTML = this.renderHTML();
            this.attachEventListeners(container);
            this.loadTravels();
        },

        renderHTML() {
            return `
                <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
                        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                            <i class="fas fa-globe-europe"></i> Reizen Beheer
                        </h1>
                        <p style="margin: 0; opacity: 0.9; font-size: 14px;">
                            Beheer alle reizen, stel featured reizen in en pas de volgorde aan
                        </p>
                    </div>

                    <!-- Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Totaal Reizen</div>
                            <div id="totalCount" style="font-size: 32px; font-weight: 700; color: #0284c7;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Featured</div>
                            <div id="featuredCount" style="font-size: 32px; font-weight: 700; color: #fbbf24;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Published</div>
                            <div id="publishedCount" style="font-size: 32px; font-weight: 700; color: #22c55e;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Draft</div>
                            <div id="draftCount" style="font-size: 32px; font-weight: 700; color: #9ca3af;">-</div>
                        </div>
                    </div>

                    <!-- Filters & Actions -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                            <button class="filter-btn active" data-filter="all" style="padding: 8px 16px; border: 2px solid #0284c7; background: #0284c7; color: white; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                Alle
                            </button>
                            <button class="filter-btn" data-filter="published" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                Published
                            </button>
                            <button class="filter-btn" data-filter="draft" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                Draft
                            </button>
                            <button class="filter-btn" data-filter="featured" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-star"></i> Featured
                            </button>
                            <div style="flex: 1;"></div>
                            <button id="refreshBtn" style="padding: 8px 16px; border: 2px solid #0284c7; background: white; color: #0284c7; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                                <i class="fas fa-sync"></i> Ververs
                            </button>
                        </div>
                    </div>

                    <!-- Travels List -->
                    <div id="travelsList" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                        <div style="text-align: center; padding: 40px; color: #9ca3af;">
                            <i class="fas fa-circle-notch fa-spin" style="font-size: 32px;"></i>
                            <br><br>Reizen laden...
                        </div>
                    </div>
                </div>
            `;
        },

        attachEventListeners(container) {
            // Filter buttons
            const filterBtns = container.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => {
                        b.style.background = 'white';
                        b.style.color = '#6b7280';
                        b.style.borderColor = '#e5e7eb';
                        b.classList.remove('active');
                    });
                    btn.style.background = '#0284c7';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#0284c7';
                    btn.classList.add('active');
                    this.currentFilter = btn.dataset.filter;
                    this.filterTravels(btn.dataset.filter);
                });
            });

            // Refresh button
            const refreshBtn = container.querySelector('#refreshBtn');
            refreshBtn?.addEventListener('click', () => {
                if (window.TravelDataService) {
                    window.TravelDataService.clearCache();
                }
                this.loadTravels();
            });
        },

        async loadTravels() {
            try {
                if (!window.TravelDataService) {
                    throw new Error('TravelDataService not available');
                }

                // Get brand_id
                const brandId = window.CURRENT_BRAND_ID || 
                               window.websiteBuilder?._edgeCtx?.brand_id || 
                               'default';

                console.log('[TravelManagement] Loading travels for brand:', brandId);

                // Fetch all assignments for this brand (including unpublished)
                const response = await fetch(
                    `${window.BOLT_DB.url}/rest/v1/trip_brand_assignments?` +
                    `select=*,trips(*)&` +
                    `brand_id=eq.${brandId}`,
                    {
                        headers: {
                            'apikey': window.BOLT_DB.anonKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const assignments = await response.json();
                console.log('[TravelManagement] Loaded assignments:', assignments.length);

                // Transform to travel objects
                this.travels = assignments
                    .filter(a => a.trips)
                    .map(a => ({
                        ...a.trips,
                        assignmentId: a.id,
                        featured: a.is_featured || false,
                        priority: a.priority || 999,
                        status: a.status || 'draft',
                        isPublished: a.is_published || false
                    }));

                this.renderTravels(this.travels);
                this.updateStats(this.travels);

            } catch (error) {
                console.error('[TravelManagement] Error loading travels:', error);
                const list = document.getElementById('travelsList');
                if (list) {
                    list.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #ef4444;">
                            <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                            <br><br>Fout bij laden van reizen
                            <br><small>${error.message}</small>
                        </div>
                    `;
                }
            }
        },

        renderTravels(travels) {
            const list = document.getElementById('travelsList');
            if (!list) return;

            if (travels.length === 0) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #9ca3af;">
                        <i class="fas fa-info-circle" style="font-size: 32px;"></i>
                        <br><br>Nog geen reizen gevonden
                    </div>
                `;
                return;
            }

            // Sort by priority (featured first)
            const sortedTravels = [...travels].sort((a, b) => {
                if (a.featured !== b.featured) return b.featured ? 1 : -1;
                return a.priority - b.priority;
            });

            list.innerHTML = sortedTravels.map(travel => `
                <div class="travel-item" 
                     data-id="${travel.id}" 
                     data-assignment-id="${travel.assignmentId}"
                     data-status="${travel.status}" 
                     data-featured="${travel.featured}"
                     data-published="${travel.isPublished}"
                     style="border-bottom: 1px solid #e5e7eb; padding: 16px 0; display: flex; gap: 16px; align-items: center;">
                    
                    <!-- Image -->
                    <img src="${travel.image || travel.main_image || 'https://via.placeholder.com/80'}" 
                         alt="${travel.title || travel.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                    
                    <!-- Info -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">
                                ${travel.title || travel.name}
                            </h3>
                            ${travel.featured ? 
                                '<span style="background: #fbbf24; color: #78350f; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap;"><i class="fas fa-star"></i> Featured</span>' 
                                : ''}
                            <span style="background: ${travel.isPublished ? '#22c55e' : '#9ca3af'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap;">
                                ${travel.isPublished ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                            <i class="fas fa-map-marker-alt"></i> ${travel.location || travel.destination || 'Geen locatie'} • 
                            ${travel.duration || travel.days ? `${travel.days || 0} dagen` : 'Geen duur'} • 
                            ${this.formatPrice(travel.price, travel.currency)}
                        </div>
                        <div style="color: #9ca3af; font-size: 12px;">
                            Priority: ${travel.priority} • 
                            Status: ${travel.status} • 
                            ${travel.created_at ? new Date(travel.created_at).toLocaleDateString('nl-NL') : 'Geen datum'}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div style="display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap;">
                        <button class="toggle-featured-btn" 
                                data-assignment-id="${travel.assignmentId}" 
                                data-featured="${travel.featured}" 
                                title="${travel.featured ? 'Verwijder featured status' : 'Maak featured'}"
                                style="padding: 8px 12px; border: 2px solid ${travel.featured ? '#fbbf24' : '#e5e7eb'}; background: ${travel.featured ? '#fbbf24' : 'white'}; color: ${travel.featured ? '#78350f' : '#6b7280'}; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s; white-space: nowrap;">
                            <i class="fas fa-star"></i> ${travel.featured ? 'Unfeatured' : 'Featured'}
                        </button>
                        <button class="toggle-publish-btn" 
                                data-assignment-id="${travel.assignmentId}" 
                                data-published="${travel.isPublished}" 
                                title="${travel.isPublished ? 'Verberg van website' : 'Toon op website'}"
                                style="padding: 8px 12px; border: 2px solid ${travel.isPublished ? '#22c55e' : '#e5e7eb'}; background: ${travel.isPublished ? '#22c55e' : 'white'}; color: ${travel.isPublished ? 'white' : '#6b7280'}; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s; white-space: nowrap;">
                            <i class="fas fa-${travel.isPublished ? 'eye' : 'eye-slash'}"></i>
                        </button>
                        <button class="delete-btn" 
                                data-assignment-id="${travel.assignmentId}" 
                                title="Verwijder reis"
                                style="padding: 8px 12px; border: 2px solid #ef4444; background: white; color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Attach action listeners
            this.attachActionListeners();
        },

        attachActionListeners() {
            // Featured toggle
            document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assignmentId = btn.dataset.assignmentId;
                    const currentFeatured = btn.dataset.featured === 'true';
                    await this.toggleFeatured(assignmentId, currentFeatured);
                });
            });

            // Publish toggle
            document.querySelectorAll('.toggle-publish-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assignmentId = btn.dataset.assignmentId;
                    const currentPublished = btn.dataset.published === 'true';
                    await this.togglePublish(assignmentId, currentPublished);
                });
            });

            // Delete
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Weet je zeker dat je deze reis wilt verwijderen?')) {
                        await this.deleteAssignment(btn.dataset.assignmentId);
                    }
                });
            });
        },

        async toggleFeatured(assignmentId, currentFeatured) {
            try {
                const newFeatured = !currentFeatured;
                const newPriority = newFeatured ? 1 : 999;

                console.log('[TravelManagement] Toggling featured:', { assignmentId, newFeatured, newPriority });

                const response = await fetch(
                    `${window.BOLT_DB.url}/rest/v1/trip_brand_assignments?id=eq.${assignmentId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.BOLT_DB.anonKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            is_featured: newFeatured,
                            priority: newPriority
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log('[TravelManagement] Featured status updated');
                this.loadTravels();

            } catch (error) {
                console.error('[TravelManagement] Error toggling featured:', error);
                alert('Fout bij updaten featured status: ' + error.message);
            }
        },

        async togglePublish(assignmentId, currentPublished) {
            try {
                const newPublished = !currentPublished;

                console.log('[TravelManagement] Toggling publish:', { assignmentId, newPublished });

                const response = await fetch(
                    `${window.BOLT_DB.url}/rest/v1/trip_brand_assignments?id=eq.${assignmentId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.BOLT_DB.anonKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            is_published: newPublished,
                            status: newPublished ? 'accepted' : 'draft'
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log('[TravelManagement] Publish status updated');
                this.loadTravels();

            } catch (error) {
                console.error('[TravelManagement] Error toggling publish:', error);
                alert('Fout bij updaten publish status: ' + error.message);
            }
        },

        async deleteAssignment(assignmentId) {
            try {
                console.log('[TravelManagement] Deleting assignment:', assignmentId);

                const response = await fetch(
                    `${window.BOLT_DB.url}/rest/v1/trip_brand_assignments?id=eq.${assignmentId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'apikey': window.BOLT_DB.anonKey
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                console.log('[TravelManagement] Assignment deleted');
                this.loadTravels();

            } catch (error) {
                console.error('[TravelManagement] Error deleting:', error);
                alert('Fout bij verwijderen: ' + error.message);
            }
        },

        filterTravels(filter) {
            const items = document.querySelectorAll('.travel-item');
            items.forEach(item => {
                const status = item.dataset.status;
                const featured = item.dataset.featured === 'true';
                const published = item.dataset.published === 'true';
                
                let show = false;
                if (filter === 'all') show = true;
                else if (filter === 'published') show = published;
                else if (filter === 'draft') show = !published;
                else if (filter === 'featured') show = featured;
                
                item.style.display = show ? 'flex' : 'none';
            });
        },

        updateStats(travels) {
            const total = travels.length;
            const featured = travels.filter(t => t.featured).length;
            const published = travels.filter(t => t.isPublished).length;
            const draft = travels.filter(t => !t.isPublished).length;

            document.getElementById('totalCount').textContent = total;
            document.getElementById('featuredCount').textContent = featured;
            document.getElementById('publishedCount').textContent = published;
            document.getElementById('draftCount').textContent = draft;
        },

        formatPrice(price, currency = 'EUR') {
            if (!price) return '€ 0';
            try {
                return new Intl.NumberFormat('nl-NL', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(price);
            } catch (e) {
                return `€ ${price}`;
            }
        }
    };

    window.TravelManagementView = TravelManagementView;
    console.log('[TravelManagementView] ✅ Module loaded');
})();
