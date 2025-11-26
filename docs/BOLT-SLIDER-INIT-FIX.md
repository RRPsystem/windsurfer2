# BOLT Template Slider Fix

## Probleem
Image sliders in Tripex/GoWild templates staan onder elkaar in plaats van te sliden.

## Oorzaak
De Slick Slider jQuery plugin vereist initialisatie scripts die niet automatisch worden uitgevoerd wanneer HTML dynamisch wordt geladen.

## Oplossing: JavaScript Snippet voor Website Viewer

Voeg dit script toe **vlak voor de `</body>` tag** in de website-viewer Edge Function:

```javascript
<script>
// Tripex/GoWild Slider Initialization
(function($) {
    'use strict';
    
    // Wait for DOM and all scripts to load
    $(document).ready(function() {
        
        // Destroy existing sliders to prevent duplicates
        $('.destination-slider, .tour-slider, .testimonial-slider, .gallery-slider, .clients-slider, .tour-gallery-slider').filter('.slick-initialized').slick('unslick');
        
        // Destination Slider
        if ($('.destination-slider').length && !$('.destination-slider').hasClass('slick-initialized')) {
            $('.destination-slider').slick({
                dots: false,
                arrows: false,
                infinite: true,
                speed: 800,
                autoplay: true,
                variableWidth: true,
                slidesToShow: 6,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 1024, settings: { slidesToShow: 3 } },
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
        }
        
        // Tour Slider
        if ($('.tour-slider').length && !$('.tour-slider').hasClass('slick-initialized')) {
            $('.tour-slider').slick({
                dots: true,
                arrows: false,
                infinite: true,
                speed: 800,
                autoplay: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1500, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
        }
        
        // Testimonial Slider
        if ($('.testimonial-slider').length && !$('.testimonial-slider').hasClass('slick-initialized')) {
            var sliderDots = $('.testimonial-dots');
            $('.testimonial-slider').slick({
                dots: true,
                arrows: false,
                infinite: true,
                speed: 800,
                appendDots: sliderDots,
                autoplay: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
        }
        
        // Gallery Slider
        if ($('.gallery-slider').length && !$('.gallery-slider').hasClass('slick-initialized')) {
            $('.gallery-slider').slick({
                dots: false,
                arrows: false,
                infinite: true,
                speed: 800,
                autoplay: true,
                slidesToShow: 5,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1500, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 550, settings: { slidesToShow: 1 } }
                ]
            });
        }
        
        // Clients Slider
        if ($('.clients-slider').length && !$('.clients-slider').hasClass('slick-initialized')) {
            $('.clients-slider').slick({
                dots: false,
                arrows: false,
                infinite: true,
                speed: 800,
                autoplay: true,
                slidesToShow: 6,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1450, settings: { slidesToShow: 5 } },
                    { breakpoint: 1200, settings: { slidesToShow: 3 } },
                    { breakpoint: 767, settings: { slidesToShow: 2 } },
                    { breakpoint: 400, settings: { slidesToShow: 1 } }
                ]
            });
        }
        
        // Tour Gallery Slider (for tour-details pages)
        if ($('.tour-gallery-slider').length && !$('.tour-gallery-slider').hasClass('slick-initialized')) {
            $('.tour-gallery-slider').slick({
                dots: false,
                arrows: true,
                infinite: true,
                speed: 800,
                autoplay: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
        }
        
        console.log('✅ Tripex sliders initialized');
    });
})(window.jQuery);
</script>
```

## Belangrijke Vereisten

**Zorg dat deze scripts AL in de `<head>` staan:**

```html
<!-- jQuery (REQUIRED) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Slick Slider CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css">

<!-- Slick Slider JS -->
<script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
```

## Volgorde van Injectie

1. `<head>`: jQuery + Slick CSS + Slick JS
2. `<body>`: Template HTML content
3. **Voor `</body>`**: Bovenstaand initialisatie script

## Testen

1. Laad een template met sliders (bijv. Tripex home page)
2. Sliders zouden nu moeten:
   - ✅ Automatisch sliden
   - ✅ Responsive zijn
   - ✅ Dots/arrows tonen waar van toepassing

## Debugging

Als sliders niet werken, check in browser console:
- `typeof jQuery !== 'undefined'` → jQuery loaded?
- `typeof $.fn.slick !== 'undefined'` → Slick loaded?
- `$('.destination-slider').length` → Elements found?
