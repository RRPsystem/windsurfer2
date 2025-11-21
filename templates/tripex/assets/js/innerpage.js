
(function($) {
	'use strict';


    //======= Quantity Number js

    $('.quantity-down').on('click', function(){
        var numProduct = Number($(this).next().val());
        if(numProduct > 1) $(this).next().val(numProduct - 1);
    });
    $('.quantity-up').on('click', function(){
        var numProduct = Number($(this).prev().val());
        $(this).prev().val(numProduct + 1);
    });

    
    // ===== Slider

    $('.tour-gallery-slider').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 6000,
        autoplay: true,
        autoplaySpeed: 0,
        cssEase: 'linear',
        slidesToShow: 3,
        responsive: [
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
    });


    if ($('.destination-slider').length) {
        $('.destination-slider').slick({
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
                {
                    breakpoint: 1400,
                    settings: {
                        slidesToShow: 4,
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3
                    }
                },
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }


    if ($('.testimonial-slider').length) {
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

    $('.gallery-slider').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 6000,
        autoplay: true,
        autoplaySpeed: 0,
        cssEase: 'linear',
        slidesToShow: 1,
        variableWidth: true
    });

    if ($('.clients-slider').length) {
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
                {
                    breakpoint: 1450,
                    settings: {
                        slidesToShow: 5,
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3,
                    }
                },
				{
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 400,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    if ($('.product-big-slider').length) {
        $('.product-big-slider').slick({
            dots: false,
            arrows: false,
            speed: 800,
            autoplay: true,
            fade: true,
            asNavFor: '.product-thumb-slider',
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
        });
    }

    if ($('.product-thumb-slider').length) {
        $('.product-thumb-slider').slick({
            dots: false,
            arrows: false,
            speed: 800,
            autoplay: true,
            asNavFor: '.product-big-slider',
            focusOnSelect: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
        });
    }

    if ($('.related-product-slider').length) {
        $('.related-product-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="fas fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="fas fa-angle-right"></i></div>',
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        });
    }

    // ===== Accordion Class Toggle

    $('.accordion-title').on('click', function (event) {
        event.preventDefault();
        var $card = $(this).closest('.accordion-card');
        if ($card.hasClass('accordion-active')) {
            $card.removeClass('accordion-active');
        } else {
            $('.accordion-card').removeClass('accordion-active');
            $card.addClass('accordion-active');
        }
    }); 


    //====== Isotope js

    $('.filter-nav-items li').on('click', function () {
        $(this).siblings('.active').removeClass('active');
        $(this).addClass('active');
        var filterValue = $(this).attr('data-filter');
        $('.isotope-grid').isotope({ filter: filterValue });
        $('.isotope-masonry-grid').isotope({ filter: filterValue });
    });

    if ($('.tripex-isotope').length) {
        $('.tripex-isotope').imagesLoaded(function () {
            $('.isotope-grid').isotope({
                itemSelector: '.filter-item',
                layoutMode: 'fitRows'
            })
            $('.isotope-masonry-grid').isotope({
                itemSelector: '.filter-item',
                percentPosition: true,
                masonry: {
                    columnWidth: 1
                }
            })
        });
    }
    
    
    // Price Range Slider

    if ($('#tripex-price-range').length) {
        $("#tripex-price-range").slider({
            range: true,
            min: 0,
            max: 580,
            values: [98, 580],
            slide: function (event, ui) {
                $("#min-label").text(pluralizePrice(ui.values[0]));
                $("#max-label").text(pluralizePrice(ui.values[1]));
            }
        });
        const values = $("#tripex-price-range").slider("values");
        $("#min-label").text(pluralizePrice(values[0]));
        $("#max-label").text(pluralizePrice(values[1]));
    }
    function pluralizePrice(value) {
        return "$" + value;
    }



    // Days Range Slider

    if ($('#tripex-days-range').length) {
        $("#tripex-days-range").slider({
            range: "min",       // only left side fill
            min: 1,
            max: 10,
            value: 1,
            slide: function(event, ui) {
                $("#current-day").text(pluralizeDay(ui.value)); // update left label only
            }
        });
        const initial = $("#tripex-days-range").slider("value");
        $("#current-day").text(pluralizeDay(initial));
        $("#max-day").text("10 Days");
    }
    function pluralizeDay(value) {
        return value === 1 ? "1 Day" : value + " Days";
    }



})(window.jQuery);