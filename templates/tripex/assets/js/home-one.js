


(function($) {
	'use strict';

    //====== Slick Slider 
    
    if ($('.destination-slider').length) {
        $('.destination-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            variableWidth:true,
            slidesToShow: 6,
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
    
    if ($('.tour-slider').length) {
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
                {
                    breakpoint: 1500,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
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

    if ($('.gallery-slider').length) {
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
                {
                    breakpoint: 1500,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 550,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

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

})(window.jQuery);