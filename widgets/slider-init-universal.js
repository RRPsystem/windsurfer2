// Universal Slider Initialization for Tripex & GoWild Templates
// Add this script before </body> tag in website viewer

(function($) {
    'use strict';
    
    // Wait for DOM and all scripts to load
    $(document).ready(function() {
        
        console.log('[Slider Init] Starting universal slider initialization...');
        
        // Destroy ALL existing sliders to prevent duplicates
        try {
            $('.slick-initialized').slick('unslick');
            console.log('[Slider Init] Destroyed existing sliders');
        } catch(e) {
            // Ignore error if no sliders exist yet
        }
        
        // ====== TRIPEX SLIDERS ======
        
        // Destination Slider (Tripex)
        if ($('.destination-slider').length && !$('.destination-slider').hasClass('slick-initialized')) {
            $('.destination-slider').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                variableWidth: true, slidesToShow: 6, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 1024, settings: { slidesToShow: 3 } },
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ Tripex destination-slider');
        }
        
        // Tour Slider (Tripex)
        if ($('.tour-slider').length && !$('.tour-slider').hasClass('slick-initialized')) {
            $('.tour-slider').slick({
                dots: true, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 4, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1500, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ Tripex tour-slider');
        }
        
        // Gallery Slider (Tripex)
        if ($('.gallery-slider').length && !$('.gallery-slider').hasClass('slick-initialized')) {
            $('.gallery-slider').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 5, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1500, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 550, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ Tripex gallery-slider');
        }
        
        // Testimonial Slider (Tripex)
        if ($('.testimonial-slider').length && !$('.testimonial-slider').hasClass('slick-initialized')) {
            $('.testimonial-slider').slick({
                dots: true, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 1, slidesToScroll: 1
            });
            console.log('[Slider Init] ✅ Tripex testimonial-slider');
        }
        
        // Clients Slider (Tripex)
        if ($('.clients-slider').length && !$('.clients-slider').hasClass('slick-initialized')) {
            $('.clients-slider').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 6, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1450, settings: { slidesToShow: 5 } },
                    { breakpoint: 1200, settings: { slidesToShow: 3 } },
                    { breakpoint: 767, settings: { slidesToShow: 2 } },
                    { breakpoint: 400, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ Tripex clients-slider');
        }
        
        // Tour Gallery Slider (Tripex tour-details)
        if ($('.tour-gallery-slider').length && !$('.tour-gallery-slider').hasClass('slick-initialized')) {
            $('.tour-gallery-slider').slick({
                dots: false, arrows: true, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
            console.log('[Slider Init] ✅ Tripex tour-gallery-slider');
        }
        
        // ====== GOWILD SLIDERS ======
        
        // Hero Sliders (GoWild) - with animation support
        function initHeroSlider(selector) {
            if ($(selector).length && !$(selector).hasClass('slick-initialized')) {
                $(selector).slick({
                    dots: false, arrows: true, infinite: true, speed: 800,
                    fade: true, autoplay: true, slidesToShow: 1, slidesToScroll: 1,
                    prevArrow: '<div class="prev"><i class="fal fa-arrow-left"></i></div>',
                    nextArrow: '<div class="next"><i class="fal fa-arrow-right"></i></div>',
                    responsive: [
                        { breakpoint: 1200, settings: { arrows: false } }
                    ]
                });
                console.log('[Slider Init] ✅ GoWild ' + selector);
            }
        }
        
        initHeroSlider('.hero-slider-one');
        initHeroSlider('.hero-slider-two');
        initHeroSlider('.hero-slider-three');
        
        // Service/Activity Sliders (GoWild)
        if ($('.slider-active-3-item').length && !$('.slider-active-3-item').hasClass('slick-initialized')) {
            $('.slider-active-3-item').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 3, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 991, settings: { slidesToShow: 2 } },
                    { breakpoint: 800, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild slider-active-3-item');
        }
        
        if ($('.slider-active-4-item').length && !$('.slider-active-4-item').hasClass('slick-initialized')) {
            $('.slider-active-4-item').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 4, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild slider-active-4-item');
        }
        
        if ($('.slider-active-5-item').length && !$('.slider-active-5-item').hasClass('slick-initialized')) {
            $('.slider-active-5-item').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 5, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 1199, settings: { slidesToShow: 3 } },
                    { breakpoint: 991, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild slider-active-5-item');
        }
        
        // Place Sliders (GoWild)
        if ($('.place-slider').length && !$('.place-slider').hasClass('slick-initialized')) {
            $('.place-slider').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                variableWidth: true, slidesToShow: 3, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild place-slider');
        }
        
        if ($('.recent-place-slider').length && !$('.recent-place-slider').hasClass('slick-initialized')) {
            $('.recent-place-slider').slick({
                dots: false, arrows: true, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 2, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                responsive: [
                    { breakpoint: 767, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild recent-place-slider');
        }
        
        // Testimonial Slider (GoWild)
        if ($('.testimonial-slider-one').length && !$('.testimonial-slider-one').hasClass('slick-initialized')) {
            $('.testimonial-slider-one').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 1, slidesToScroll: 1
            });
            console.log('[Slider Init] ✅ GoWild testimonial-slider-one');
        }
        
        // Partner Slider (GoWild)
        if ($('.partner-slider-one').length && !$('.partner-slider-one').hasClass('slick-initialized')) {
            $('.partner-slider-one').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 5, slidesToScroll: 1,
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 991, settings: { slidesToShow: 3 } },
                    { breakpoint: 800, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
            console.log('[Slider Init] ✅ GoWild partner-slider-one');
        }
        
        console.log('[Slider Init] ✅ All sliders initialized!');
    });
})(window.jQuery);
