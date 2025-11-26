# BOLT Universal Slider Fix (Tripex + GoWild)

## Probleem
Image sliders staan onder elkaar op BOLT websites met Tripex OF GoWild templates.

## Oorzaak
Slick Slider jQuery plugin initialiseert niet automatisch bij dynamisch geladen HTML.

## ✅ Oplossing: Universal Script

**Inject dit script voor `</body>` in de website viewer:**

```html
<!-- jQuery (required) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Slick Slider CSS + JS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css">
<script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

<!-- Universal Slider Initialization (Tripex + GoWild) -->
<script src="/widgets/slider-init-universal.js"></script>
```

**Of inline:**

```html
<script>
(function($) {
    'use strict';
    $(document).ready(function() {
        // Destroy existing sliders
        try { $('.slick-initialized').slick('unslick'); } catch(e) {}
        
        // Initialize all common sliders
        const sliders = {
            // Tripex
            '.destination-slider': { slidesToShow: 6, variableWidth: true },
            '.tour-slider': { slidesToShow: 4, dots: true },
            '.gallery-slider': { slidesToShow: 5 },
            '.testimonial-slider': { slidesToShow: 1, dots: true },
            '.clients-slider': { slidesToShow: 6 },
            // GoWild
            '.hero-slider-one': { slidesToShow: 1, fade: true, arrows: true },
            '.hero-slider-two': { slidesToShow: 1, fade: true, arrows: true },
            '.slider-active-3-item': { slidesToShow: 3 },
            '.slider-active-4-item': { slidesToShow: 4 },
            '.slider-active-5-item': { slidesToShow: 5 },
            '.place-slider': { slidesToShow: 3, variableWidth: true },
            '.testimonial-slider-one': { slidesToShow: 1 },
            '.partner-slider-one': { slidesToShow: 5 }
        };
        
        Object.keys(sliders).forEach(selector => {
            if ($(selector).length && !$(selector).hasClass('slick-initialized')) {
                $(selector).slick({
                    ...{ dots: false, arrows: false, infinite: true, speed: 800, autoplay: true, slidesToScroll: 1 },
                    ...sliders[selector]
                });
            }
        });
        
        console.log('✅ Universal sliders initialized');
    });
})(window.jQuery);
</script>
```

## Hoe te Gebruiken

### Optie 1: Via Widget File (AANBEVOLEN)
Upload `/widgets/slider-init-universal.js` naar je CDN/server en reference het:

```html
<script src="/widgets/slider-init-universal.js"></script>
```

### Optie 2: Inline Script
Kopieer het inline script hierboven direct in de HTML.

## Wat het doet

**Detecteert automatisch:**
- ✅ Tripex sliders (destination, tour, gallery, testimonial, clients)
- ✅ GoWild sliders (hero, service, place, testimonial, partner)
- ✅ Responsive breakpoints per slider type
- ✅ Voorkomt dubbele initialisatie

## Testing

1. Open BOLT website met Tripex of GoWild template
2. Open browser console (F12)
3. Je zou moeten zien: `✅ Universal sliders initialized`
4. Sliders zouden nu moeten sliden! ✨

## Debugging

Als sliders niet werken:
```javascript
// Check in console:
typeof jQuery !== 'undefined'          // ✅ jQuery loaded?
typeof $.fn.slick !== 'undefined'      // ✅ Slick loaded?
$('.hero-slider-one').length          // ✅ Elements found?
$('.hero-slider-one').hasClass('slick-initialized')  // ✅ Initialized?
```

## Files
- **Full script:** `/widgets/slider-init-universal.js`
- **Old Tripex-only:** `/docs/BOLT-SLIDER-INIT-FIX.md`
