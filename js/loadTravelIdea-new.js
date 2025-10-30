// New loadTravelIdea function that uses TC data structure
// This will replace the current implementation in main.js

loadTravelIdea(data) {
    try {
        console.log('[loadTravelIdea] Loading data:', data);
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('[loadTravelIdea] Canvas not found!');
            return;
        }

        // Clear canvas
        canvas.innerHTML = '';

        // Extract TC data structure
        const title = data.name || data.title || 'Reis';
        const description = data.description || data.intro || '';
        const image = data.image || data.mainImage || data.headerImage || '';
        const price = data.price || data.totalPrice;
        const currency = data.currency || 'EUR';
        
        // TC uses these arrays instead of 'days'
        const destinations = data.destinations || [];
        const hotels = data.hotels || [];
        const transports = data.transports || [];
        const transfers = data.transfers || [];

        console.log('[loadTravelIdea] TC Data:', { 
            title, 
            description, 
            destinations: destinations.length,
            hotels: hotels.length,
            transports: transports.length,
            transfers: transfers.length,
            image, 
            price 
        });

        // 1. Add hero with travel image
        if (image) {
            try {
                const hero = ComponentFactory.createComponent('hero-travel', {
                    title: title,
                    subtitle: description.substring(0, 150),
                    background: image,
                    height: '400px'
                });
                if (hero) canvas.appendChild(hero);
            } catch (e) {
                console.warn('Failed to create hero', e);
            }
        }

        // 2. Add intro text with AI-generated content
        try {
            let introText = description;
            
            // Generate AI text about destinations if we have them
            if (destinations.length > 0) {
                console.log('[loadTravelIdea] Generating AI text for destinations...');
                
                // Create destination summary
                const destNames = destinations.map(d => d.name || d.title).filter(Boolean).join(', ');
                
                // Call AI Writer to generate intro text
                fetch('/api/ai-writer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        section: 'intro',
                        destination: destNames,
                        country: title,
                        language: 'nl',
                        useResearch: true
                    })
                }).then(r => r.json())
                  .then(result => {
                      if (result.intro && result.intro.text) {
                          // Update the intro text with AI-generated content
                          const introEl = canvas.querySelector('.wb-content-flex');
                          if (introEl) {
                              const bodyEl = introEl.querySelector('.content-body');
                              if (bodyEl) {
                                  bodyEl.innerHTML = `<p>${result.intro.text}</p>`;
                                  console.log('[loadTravelIdea] AI text updated');
                              }
                          }
                      }
                  })
                  .catch(err => console.warn('[loadTravelIdea] AI text generation failed:', err));
            }
            
            const intro = ComponentFactory.createComponent('content-flex', {
                title: 'Over deze reis',
                body: introText ? `<p>${introText}</p>` : '<p>Ontdek de mooiste plekken...</p>',
                layout: 'none'
            });
            if (intro) canvas.appendChild(intro);
        } catch (e) {
            console.warn('Failed to create intro', e);
        }

        // 3. Create Travel Timeline with TC data
        if (destinations.length > 0 || hotels.length > 0 || transports.length > 0 || transfers.length > 0) {
            try {
                const timeline = document.createElement('section');
                timeline.className = 'wb-component wb-travel-timeline';
                timeline.setAttribute('data-component', 'travel-timeline');
                
                let currentDay = 1;
                
                // Helper to add day header
                const addDayHeader = (day, title, desc) => {
                    const dayHeader = ComponentFactory.createComponent('travel-day-header', {
                        dayNumber: day,
                        dayTitle: title || `Dag ${day}`,
                        dayDescription: desc || ''
                    });
                    if (dayHeader) timeline.appendChild(dayHeader);
                };
                
                // Start with Day 1
                addDayHeader(1, 'Dag 1', 'Aankomst');
                
                // Add all transports
                transports.forEach((transport, idx) => {
                    console.log('[loadTravelIdea] Adding transport:', transport);
                    const card = ComponentFactory.createComponent('travel-card-transport', {
                        departure: transport.departureCity || transport.from || '',
                        arrival: transport.arrivalCity || transport.to || '',
                        airline: transport.airline || transport.carrier || '',
                        flightNumber: transport.flightNumber || transport.number || '',
                        departureTime: transport.departureTime || '',
                        arrivalTime: transport.arrivalTime || '',
                        duration: transport.duration || '',
                        price: transport.price ? `€ ${transport.price}` : '',
                        priceLabel: 'per persoon'
                    });
                    if (card) timeline.appendChild(card);
                });
                
                // Add all transfers
                transfers.forEach((transfer, idx) => {
                    console.log('[loadTravelIdea] Adding transfer:', transfer);
                    const card = ComponentFactory.createComponent('travel-card-transfer', {
                        from: transfer.from || transfer.departureCity || 'Luchthaven',
                        to: transfer.to || transfer.arrivalCity || 'Hotel',
                        transferType: transfer.type || 'Private transfer',
                        duration: transfer.duration || '30 minuten',
                        price: transfer.price ? `€ ${transfer.price}` : '',
                        priceLabel: 'per rit'
                    });
                    if (card) timeline.appendChild(card);
                });
                
                // Add all hotels
                hotels.forEach((hotel, idx) => {
                    console.log('[loadTravelIdea] Adding hotel:', hotel);
                    const card = ComponentFactory.createComponent('travel-card-hotel', {
                        hotelName: hotel.name || hotel.hotelName || 'Hotel',
                        stars: hotel.stars || hotel.rating || 3,
                        nights: hotel.nights || hotel.numberOfNights || 1,
                        persons: hotel.persons || hotel.numberOfPersons || 2,
                        roomType: hotel.roomType || hotel.accommodationType || 'Standaard kamer',
                        meals: hotel.meals || hotel.mealPlan || 'Ontbijt inbegrepen',
                        price: hotel.price ? `€ ${hotel.price}` : '',
                        priceLabel: 'totaal'
                    });
                    if (card) timeline.appendChild(card);
                });
                
                // Add all destinations
                destinations.forEach((destination, idx) => {
                    console.log('[loadTravelIdea] Adding destination:', destination);
                    const card = ComponentFactory.createComponent('travel-card-destination', {
                        activityName: destination.name || destination.title || 'Bestemming',
                        day: `Dag ${currentDay}`,
                        location: destination.location || destination.city || '',
                        duration: destination.duration || '1 dag',
                        includes: destination.includes || destination.description || '',
                        price: destination.price ? `€ ${destination.price}` : '',
                        priceLabel: 'per persoon'
                    });
                    if (card) timeline.appendChild(card);
                });

                canvas.appendChild(timeline);
                console.log('[loadTravelIdea] Timeline added with TC data');
            } catch (e) {
                console.error('Failed to create timeline', e);
            }
        } else {
            console.warn('[loadTravelIdea] No TC data found');
        }

        // 4. Add price/booking CTA if available
        if (price) {
            try {
                const cta = ComponentFactory.createComponent('hero-banner-cta', {
                    title: 'Boek deze reis',
                    subtitle: `Vanaf ${price} ${currency}`,
                    buttonText: 'Boek nu',
                    buttonLink: '#contact'
                });
                if (cta) canvas.appendChild(cta);
            } catch (e) {
                console.warn('Failed to create CTA', e);
            }
        }

        // Save to current page
        try {
            const cur = (this.pages || []).find(p => p.id === this.currentPageId) || (this.pages || [])[0] || null;
            if (cur) {
                cur.html = canvas.innerHTML;
                this.saveProject(true);
            }
        } catch (e) {
            console.warn('Failed to save', e);
        }

        // Show success message
        this.showNotification('✅ Reis geladen met Travel Cards!', 'success');

    } catch (e) {
        console.error('loadTravelIdea failed', e);
        this.showNotification('Fout bij laden van reis', 'error');
    }
}
