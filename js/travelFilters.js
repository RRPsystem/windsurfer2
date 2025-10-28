// Travel Filters Configuration
// Dit bestand bevat filter configuraties voor de Travel Overview component

const TravelFilters = {
    // Standaard filter set
    default: [
        { label: 'Alle', value: 'alle', tags: [] },
        { label: 'Strandvakanties', value: 'strandvakanties', tags: ['strand', 'beach', 'zee', 'eiland'] },
        { label: 'Rondreis', value: 'rondreis', tags: ['rondreis', 'roadtrip', 'tour', 'circuit'] },
        { label: 'Stedentrip', value: 'stedentrip', tags: ['stedentrip', 'city', 'stad', 'urban'] },
        { label: 'Actief', value: 'actief', tags: ['actief', 'sport', 'adventure', 'hiking', 'trekking'] },
        { label: 'Cultuur', value: 'cultuur', tags: ['cultuur', 'culture', 'heritage', 'museum', 'geschiedenis'] }
    ],

    // Uitgebreide filter set
    extended: [
        { label: 'Alle', value: 'alle', tags: [] },
        { label: 'Strandvakanties', value: 'strandvakanties', tags: ['strand', 'beach', 'zee', 'eiland'] },
        { label: 'Rondreis', value: 'rondreis', tags: ['rondreis', 'roadtrip', 'tour', 'circuit'] },
        { label: 'Stedentrip', value: 'stedentrip', tags: ['stedentrip', 'city', 'stad', 'urban'] },
        { label: 'Actief', value: 'actief', tags: ['actief', 'sport', 'adventure', 'hiking', 'trekking'] },
        { label: 'Cultuur', value: 'cultuur', tags: ['cultuur', 'culture', 'heritage', 'museum'] },
        { label: 'Luxe', value: 'luxe', tags: ['luxe', 'luxury', '5-star', 'premium'] },
        { label: 'Budget', value: 'budget', tags: ['budget', 'goedkoop', 'backpacker', 'hostel'] },
        { label: 'Familie', value: 'familie', tags: ['familie', 'family', 'kinderen', 'kids'] },
        { label: 'Wellness', value: 'wellness', tags: ['wellness', 'spa', 'relax', 'yoga'] }
    ],

    // Avontuurlijke reizen
    adventure: [
        { label: 'Alle', value: 'alle', tags: [] },
        { label: 'Trekking', value: 'trekking', tags: ['trekking', 'hiking', 'wandelen', 'bergen'] },
        { label: 'Safari', value: 'safari', tags: ['safari', 'wildlife', 'natuur', 'dieren'] },
        { label: 'Duiken', value: 'duiken', tags: ['duiken', 'diving', 'snorkelen', 'underwater'] },
        { label: 'Klimmen', value: 'klimmen', tags: ['klimmen', 'climbing', 'mountaineering'] },
        { label: 'Fietsen', value: 'fietsen', tags: ['fietsen', 'cycling', 'bike', 'mtb'] },
        { label: 'Watersport', value: 'watersport', tags: ['watersport', 'surfing', 'kayak', 'rafting'] }
    ],

    // Luxe reizen
    luxury: [
        { label: 'Alle', value: 'alle', tags: [] },
        { label: '5-Sterren', value: '5-sterren', tags: ['5-star', 'luxury', 'luxe', 'premium'] },
        { label: 'Private Tours', value: 'private', tags: ['private', 'exclusief', 'tailor-made'] },
        { label: 'Cruise', value: 'cruise', tags: ['cruise', 'schip', 'boot'] },
        { label: 'Wellness & Spa', value: 'wellness', tags: ['wellness', 'spa', 'massage', 'relax'] },
        { label: 'Gourmet', value: 'gourmet', tags: ['gourmet', 'culinair', 'food', 'michelin'] }
    ],

    // Familie reizen
    family: [
        { label: 'Alle', value: 'alle', tags: [] },
        { label: 'Kinderen 0-6', value: 'baby', tags: ['baby', 'peuter', 'kleuter', '0-6'] },
        { label: 'Kinderen 7-12', value: 'kids', tags: ['kinderen', 'kids', '7-12', 'basisschool'] },
        { label: 'Tieners', value: 'tieners', tags: ['tieners', 'teens', 'adolescent', '13-17'] },
        { label: 'Multi-generatie', value: 'multi-gen', tags: ['multi-generatie', 'grootouders', 'familie'] },
        { label: 'All-Inclusive', value: 'all-inclusive', tags: ['all-inclusive', 'alles-inbegrepen'] }
    ],

    // Regionale filters
    regional: {
        europa: [
            { label: 'Alle', value: 'alle', tags: [] },
            { label: 'Zuid-Europa', value: 'zuid-europa', tags: ['spanje', 'italie', 'griekenland', 'portugal'] },
            { label: 'Noord-Europa', value: 'noord-europa', tags: ['noorwegen', 'zweden', 'finland', 'ijsland'] },
            { label: 'Oost-Europa', value: 'oost-europa', tags: ['polen', 'tsjechie', 'hongarije', 'kroatie'] },
            { label: 'West-Europa', value: 'west-europa', tags: ['frankrijk', 'belgie', 'duitsland', 'nederland'] }
        ],
        azie: [
            { label: 'Alle', value: 'alle', tags: [] },
            { label: 'Zuidoost-Azië', value: 'zuidoost-azie', tags: ['thailand', 'vietnam', 'cambodja', 'indonesie'] },
            { label: 'Oost-Azië', value: 'oost-azie', tags: ['japan', 'china', 'korea', 'taiwan'] },
            { label: 'Zuid-Azië', value: 'zuid-azie', tags: ['india', 'sri-lanka', 'nepal', 'bhutan'] },
            { label: 'Midden-Oosten', value: 'midden-oosten', tags: ['dubai', 'oman', 'jordanie', 'israel'] }
        ]
    },

    // Prijs filters (kunnen gecombineerd worden met andere filters)
    price: [
        { label: 'Alle Prijzen', value: 'alle', min: 0, max: 999999 },
        { label: 'Budget (< €500)', value: 'budget', min: 0, max: 500 },
        { label: 'Middel (€500-€1500)', value: 'middel', min: 500, max: 1500 },
        { label: 'Premium (€1500-€3000)', value: 'premium', min: 1500, max: 3000 },
        { label: 'Luxe (> €3000)', value: 'luxe', min: 3000, max: 999999 }
    ],

    // Duur filters
    duration: [
        { label: 'Alle Duren', value: 'alle', min: 0, max: 999 },
        { label: 'Weekend (2-4 dagen)', value: 'weekend', min: 2, max: 4 },
        { label: 'Week (5-9 dagen)', value: 'week', min: 5, max: 9 },
        { label: 'Lang (10-14 dagen)', value: 'lang', min: 10, max: 14 },
        { label: 'Extra Lang (15+ dagen)', value: 'extra-lang', min: 15, max: 999 }
    ],

    // Seizoen filters
    season: [
        { label: 'Alle Seizoenen', value: 'alle', months: [] },
        { label: 'Lente', value: 'lente', months: [3, 4, 5] },
        { label: 'Zomer', value: 'zomer', months: [6, 7, 8] },
        { label: 'Herfst', value: 'herfst', months: [9, 10, 11] },
        { label: 'Winter', value: 'winter', months: [12, 1, 2] }
    ],

    /**
     * Helper functie: Match een reis tegen een filter
     * @param {Object} travel - Reis object met tags
     * @param {Object} filter - Filter object met tags
     * @returns {boolean} - True als de reis matched
     */
    matchTravel(travel, filter) {
        // "Alle" filter matched altijd
        if (filter.value === 'alle') return true;

        // Check tags
        if (filter.tags && filter.tags.length > 0) {
            const travelTags = (travel.tags || '').toLowerCase().split(',').map(t => t.trim());
            return filter.tags.some(filterTag => 
                travelTags.some(travelTag => 
                    travelTag.includes(filterTag.toLowerCase()) || 
                    filterTag.toLowerCase().includes(travelTag)
                )
            );
        }

        // Check prijs (als filter prijs range heeft)
        if (filter.min !== undefined && filter.max !== undefined) {
            const price = this.extractPrice(travel.price);
            return price >= filter.min && price <= filter.max;
        }

        // Check duur (als filter duur range heeft)
        if (filter.min !== undefined && filter.max !== undefined && travel.duration) {
            const days = this.extractDays(travel.duration);
            return days >= filter.min && days <= filter.max;
        }

        return false;
    },

    /**
     * Extract prijs uit string (bijv. "€ 1.299" -> 1299)
     */
    extractPrice(priceString) {
        if (!priceString) return 0;
        const match = priceString.match(/[\d.,]+/);
        if (!match) return 0;
        return parseFloat(match[0].replace(/[.,]/g, ''));
    },

    /**
     * Extract dagen uit string (bijv. "8 dagen" -> 8)
     */
    extractDays(durationString) {
        if (!durationString) return 0;
        const match = durationString.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    },

    /**
     * Haal de juiste filter set op basis van naam
     */
    getFilterSet(name) {
        return this[name] || this.default;
    },

    /**
     * Combineer meerdere filter sets
     */
    combineFilters(...filterSets) {
        const combined = [{ label: 'Alle', value: 'alle', tags: [] }];
        filterSets.forEach(setName => {
            const set = this.getFilterSet(setName);
            set.forEach(filter => {
                if (filter.value !== 'alle' && !combined.find(f => f.value === filter.value)) {
                    combined.push(filter);
                }
            });
        });
        return combined;
    }
};

// Export voor gebruik in andere bestanden
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TravelFilters;
}

// Maak globaal beschikbaar
if (typeof window !== 'undefined') {
    window.TravelFilters = TravelFilters;
}

// Voorbeeld gebruik:
// const filters = TravelFilters.getFilterSet('extended');
// const matched = TravelFilters.matchTravel(travelObject, filterObject);
// const combined = TravelFilters.combineFilters('default', 'price', 'duration');
