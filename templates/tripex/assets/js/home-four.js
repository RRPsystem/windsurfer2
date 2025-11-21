


(function($) {
	'use strict';

    //====== Slick Slider 

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

    if ($('.destination-slider').length) {
        $('.destination-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 1000,
            autoplay: true,
            slidesToShow: 1,
            variableWidth: true
        });
    }

    if ($('.testimonial-slider').length) {
        $('.testimonial-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
        });
    }


})(window.jQuery);