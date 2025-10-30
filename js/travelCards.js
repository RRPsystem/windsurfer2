// Travel Card Components for ComponentFactory
// Add these to components.js

// Transport Card
static createTravelCardTransport(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card transport';
    card.setAttribute('data-component', 'travel-card-transport');
    card.id = this.generateId('travel_card_transport');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const departure = options.departure || 'Amsterdam';
    const arrival = options.arrival || 'Barcelona';
    const airline = options.airline || 'KLM';
    const flightNumber = options.flightNumber || 'KL1234';
    const departureTime = options.departureTime || '10:30';
    const arrivalTime = options.arrivalTime || '13:45';
    const duration = options.duration || '3u 15min';
    const price = options.price || '€ 250';
    const priceLabel = options.priceLabel || 'per persoon';

    card.innerHTML += `
        <div class="wb-travel-card-header">
            <div class="wb-travel-card-icon">
                <i class="fas fa-plane-departure"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true">Transport</h3>
                <div class="subtitle" contenteditable="true">${departure} → ${arrival}</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-plane"></i>
                <span contenteditable="true">${airline} Flight ${flightNumber}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-clock"></i>
                <span contenteditable="true">${departureTime} - ${arrivalTime} (${duration})</span>
            </div>
        </div>
        <div class="wb-travel-card-price">
            <div>
                <div class="wb-travel-card-price-amount" contenteditable="true">${price}</div>
                <div class="wb-travel-card-price-label" contenteditable="true">${priceLabel}</div>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Hotel Card
static createTravelCardHotel(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card hotel';
    card.setAttribute('data-component', 'travel-card-hotel');
    card.id = this.generateId('travel_card_hotel');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const hotelName = options.hotelName || 'Hotel Barcelona Plaza';
    const stars = options.stars || 4;
    const nights = options.nights || 3;
    const persons = options.persons || 2;
    const roomType = options.roomType || 'Standaard kamer';
    const meals = options.meals || 'Ontbijt inbegrepen';
    const price = options.price || '€ 450';
    const priceLabel = options.priceLabel || 'totaal';

    const starsHtml = '⭐'.repeat(stars);

    card.innerHTML += `
        <div class="wb-travel-card-header">
            <div class="wb-travel-card-icon">
                <i class="fas fa-hotel"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true">Hotel</h3>
                <div class="subtitle" contenteditable="true">${hotelName} ${starsHtml}</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-bed"></i>
                <span contenteditable="true">${roomType}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-calendar-days"></i>
                <span contenteditable="true">${nights} nachten, ${persons} personen</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-utensils"></i>
                <span contenteditable="true">${meals}</span>
            </div>
        </div>
        <div class="wb-travel-card-price">
            <div>
                <div class="wb-travel-card-price-amount" contenteditable="true">${price}</div>
                <div class="wb-travel-card-price-label" contenteditable="true">${priceLabel}</div>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Destination/Activity Card
static createTravelCardDestination(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card destination';
    card.setAttribute('data-component', 'travel-card-destination');
    card.id = this.generateId('travel_card_destination');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const activityName = options.activityName || 'Barcelona City Tour';
    const day = options.day || 'Dag 2';
    const location = options.location || 'Sagrada Familia';
    const duration = options.duration || '3 uur';
    const includes = options.includes || 'inclusief gids';
    const price = options.price || '€ 45';
    const priceLabel = options.priceLabel || 'per persoon';

    card.innerHTML += `
        <div class="wb-travel-card-header">
            <div class="wb-travel-card-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true">Bestemming</h3>
                <div class="subtitle" contenteditable="true">${activityName}</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-calendar"></i>
                <span contenteditable="true">${day}: ${location}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-clock"></i>
                <span contenteditable="true">${duration}, ${includes}</span>
            </div>
        </div>
        <div class="wb-travel-card-price">
            <div>
                <div class="wb-travel-card-price-amount" contenteditable="true">${price}</div>
                <div class="wb-travel-card-price-label" contenteditable="true">${priceLabel}</div>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Transfer Card
static createTravelCardTransfer(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card transfer';
    card.setAttribute('data-component', 'travel-card-transfer');
    card.id = this.generateId('travel_card_transfer');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const from = options.from || 'Luchthaven';
    const to = options.to || 'Hotel';
    const transferType = options.transferType || 'Private transfer';
    const duration = options.duration || '30 minuten';
    const price = options.price || '€ 35';
    const priceLabel = options.priceLabel || 'per rit';

    card.innerHTML += `
        <div class="wb-travel-card-header">
            <div class="wb-travel-card-icon">
                <i class="fas fa-car"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true">Transfer</h3>
                <div class="subtitle" contenteditable="true">${from} → ${to}</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-taxi"></i>
                <span contenteditable="true">${transferType}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-clock"></i>
                <span contenteditable="true">${duration}</span>
            </div>
        </div>
        <div class="wb-travel-card-price">
            <div>
                <div class="wb-travel-card-price-amount" contenteditable="true">${price}</div>
                <div class="wb-travel-card-price-label" contenteditable="true">${priceLabel}</div>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Booking Info Card
static createTravelCardBooking(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card booking-info';
    card.setAttribute('data-component', 'travel-card-booking');
    card.id = this.generateId('travel_card_booking');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const bookingRef = options.bookingReference || 'RRP-12345';
    const pnr = options.pnr || 'ABC123';
    const travelAgent = options.travelAgent || 'Reisorganisatie';
    const agentPhone = options.agentPhone || '+31 20 123 4567';
    const agentEmail = options.agentEmail || 'info@reisorganisatie.nl';

    card.innerHTML += `
        <div class="wb-travel-card-header">
            <div class="wb-travel-card-icon">
                <i class="fas fa-file-contract"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true">Boekingsinformatie</h3>
                <div class="subtitle" contenteditable="true">Bewaar deze gegevens</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-hashtag"></i>
                <span><strong>Boeking:</strong> <span contenteditable="true">${bookingRef}</span></span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-ticket"></i>
                <span><strong>PNR:</strong> <span contenteditable="true">${pnr}</span></span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-building"></i>
                <span contenteditable="true">${travelAgent}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-phone"></i>
                <span contenteditable="true">${agentPhone}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-envelope"></i>
                <span contenteditable="true">${agentEmail}</span>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Emergency Contacts Card
static createTravelCardEmergency(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card emergency';
    card.setAttribute('data-component', 'travel-card-emergency');
    card.id = this.generateId('travel_card_emergency');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const emergency112 = options.emergency112 || '112 (Europa)';
    const localEmergency = options.localEmergency || 'Lokaal alarmnummer';
    const embassy = options.embassy || 'Nederlandse Ambassade';
    const embassyPhone = options.embassyPhone || '+XX XX XXX XXXX';
    const alarmCentral = options.alarmCentral || 'Alarmcentrale';
    const alarmPhone = options.alarmPhone || '+31 70 123 4567';

    card.innerHTML += `
        <div class="wb-travel-card-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            <div class="wb-travel-card-icon">
                <i class="fas fa-circle-exclamation"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true" style="color: white;">Noodcontacten</h3>
                <div class="subtitle" contenteditable="true" style="color: rgba(255,255,255,0.9);">Belangrijk bij noodsituaties</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            <div class="wb-travel-card-row">
                <i class="fas fa-phone-volume" style="color: #ef4444;"></i>
                <span><strong>Alarm:</strong> <span contenteditable="true">${emergency112}</span></span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-hospital"></i>
                <span><strong>Lokaal:</strong> <span contenteditable="true">${localEmergency}</span></span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-flag"></i>
                <span contenteditable="true">${embassy}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-phone"></i>
                <span contenteditable="true">${embassyPhone}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-shield-halved"></i>
                <span contenteditable="true">${alarmCentral}</span>
            </div>
            <div class="wb-travel-card-row">
                <i class="fas fa-phone-square"></i>
                <span contenteditable="true">${alarmPhone}</span>
            </div>
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Important Info Card
static createTravelCardInfo(options = {}) {
    const card = document.createElement('div');
    card.className = 'wb-component wb-travel-card info';
    card.setAttribute('data-component', 'travel-card-info');
    card.id = this.generateId('travel_card_info');

    const toolbar = this.createToolbar();
    card.appendChild(toolbar);
    this.addTypeBadge(card);

    const title = options.title || 'Belangrijke Informatie';
    const items = options.items || [
        'Vergeet je paspoort niet',
        'Check-in 2 uur voor vertrek',
        'Bagage max 23kg'
    ];

    const itemsHtml = items.map(item => `
        <div class="wb-travel-card-row">
            <i class="fas fa-circle-check"></i>
            <span contenteditable="true">${item}</span>
        </div>
    `).join('');

    card.innerHTML += `
        <div class="wb-travel-card-header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <div class="wb-travel-card-icon">
                <i class="fas fa-circle-info"></i>
            </div>
            <div class="wb-travel-card-title">
                <h3 contenteditable="true" style="color: white;">${title}</h3>
                <div class="subtitle" contenteditable="true" style="color: rgba(255,255,255,0.9);">Let hierop</div>
            </div>
        </div>
        <div class="wb-travel-card-body">
            ${itemsHtml}
        </div>
    `;

    this.makeSelectable(card);
    return card;
}

// Day Header
static createTravelDayHeader(options = {}) {
    const header = document.createElement('div');
    header.className = 'wb-component wb-travel-day-header';
    header.setAttribute('data-component', 'travel-day-header');
    header.id = this.generateId('travel_day_header');

    const toolbar = this.createToolbar();
    header.appendChild(toolbar);
    this.addTypeBadge(header);

    const dayNumber = options.dayNumber || 1;
    const dayTitle = options.dayTitle || `Dag ${dayNumber}`;
    const dayDescription = options.dayDescription || 'Aankomst en check-in';

    header.innerHTML += `
        <div class="wb-travel-day-number">${dayNumber}</div>
        <div class="wb-travel-day-info">
            <h2 contenteditable="true">${dayTitle}</h2>
            <p contenteditable="true">${dayDescription}</p>
        </div>
    `;

    this.makeSelectable(header);
    return header;
}

// Travel Timeline Container
static createTravelTimeline(options = {}) {
    const timeline = document.createElement('section');
    timeline.className = 'wb-component wb-travel-timeline';
    timeline.setAttribute('data-component', 'travel-timeline');
    timeline.id = this.generateId('travel_timeline');

    const toolbar = this.createToolbar();
    timeline.appendChild(toolbar);
    this.addTypeBadge(timeline);

    // Add example content
    const day1 = this.createTravelDayHeader({ dayNumber: 1, dayTitle: 'Dag 1', dayDescription: 'Aankomst' });
    const transport1 = this.createTravelCardTransport({});
    const transfer1 = this.createTravelCardTransfer({});
    const hotel1 = this.createTravelCardHotel({});

    timeline.appendChild(day1);
    timeline.appendChild(transport1);
    timeline.appendChild(transfer1);
    timeline.appendChild(hotel1);

    this.makeSelectable(timeline);
    return timeline;
}
