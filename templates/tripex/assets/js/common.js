/*-----------------------------------------------------------------------------------
    
    Template Name: Tripex - Travel & Tour Booking HTML Template
    URI: pixelfit.agency
    Description: Tripex is a clean and elegant Travel & Tour Booking HTML template designed for travel agencies, tour operators, and booking platforms. With its modern layout and smooth user experience, it allows you to beautifully showcase destinations, tour packages, and booking options all in one place. Perfect for creating a professional online presence with style and simplicity.
    Author: Pixelfit
    Author URI: https://themeforest.net/user/pixelfit
    Version: 1.0 

    Note: This is Main Js file

-----------------------------------------------------------------------------------
    ===================
    Js INDEX
    ===================
    ## Main Menu
    ## Offcanvas Overlay
    ## Preloader
    ## Sticky
    ## Back to top
    ## Magnific-popup js
	## Nice Select
	## Counter
	## Parallax
    ## AOS Js
	## Document Ready
    
-----------------------------------------------------------------------------------*/

(function($) {
	'use strict';

	//===== Main Menu

	function mainMenu() {
		var navbarToggler = $('.navbar-toggler'),
			navMenu = $('.theme-nav-menu'),
			closeIcon = $('.navbar-close');
			navbarToggler.on('click', function() {
				navbarToggler.toggleClass('active');
				navMenu.toggleClass('menu-on');
			});
		closeIcon.on('click', function() {
			navMenu.removeClass('menu-on');
			navbarToggler.removeClass('active');
		});
		navMenu.find("li a").each(function() {
			if ($(this).children('.dd-trigger').length < 1) {
				if ($(this).next().length > 0) {
					$(this).append('<span class="dd-trigger"><i class="far fa-angle-down"></i></span>')
				}
			}
		});
		navMenu.on('click', '.dd-trigger', function(e) {
			e.preventDefault();
			$(this).parent().parent().siblings().children('ul.sub-menu').slideUp();
			$(this).parent().next('ul.sub-menu').stop(true, true).slideToggle(350);
			$(this).toggleClass('sub-menu-open');
		});
	};

	//===== Offcanvas Overlay

	function offCanvas() {
		const $overlay = $(".offcanvas__overlay");
		const $toggler = $(".navbar-toggler");
		const $menu = $(".theme-nav-menu");
		const $close = $(".navbar-close");
		$toggler.on("click", function () {
			$overlay.addClass("overlay-open");
			$toggler.addClass("active");
			$menu.addClass("menu-on");
		});
		$overlay.add($close).on("click", function () {
			$overlay.removeClass("overlay-open");
			$toggler.removeClass("active");
			$menu.removeClass("menu-on");
		});
	}

	function initOffcanvasPanel() {
		const overlay = $(".offcanvas__overlay");
		var panelIcon = $('.offcanvas-toggle'),
		panelClose = $('.panel-close-btn'),
		panelWrap = $('.tripex-offcanvas-panel');
		panelIcon.on('click', function (e) {
			e.preventDefault();
			overlay.addClass("overlay-open");
			panelWrap.addClass('panel-on');
		});
		panelClose.on('click', function (e) {
			e.preventDefault();
			overlay.removeClass("overlay-open");
			panelWrap.removeClass('panel-on');
		});
		overlay.on('click', function (e) {
			e.preventDefault();
			overlay.removeClass("overlay-open");
			panelWrap.removeClass('panel-on');
		});
	}

	//===== Windows load

	$(window).on('load', function(event) {
		//===== Preloader
		$('.preloader').delay(500).fadeOut(500);
	})

	//===== Sticky

	$(window).on('scroll', function(event) {
		var scroll = $(window).scrollTop();
		if (scroll < 100) {
			$(".header-area").removeClass("sticky");
		} else {
			$(".header-area").addClass("sticky");
		}
	});

    //===== Back to top

    $(window).on('scroll', function(event) {
        if ($(this).scrollTop() > 600) {
            $('.back-to-top').fadeIn(200)
        } else {
            $('.back-to-top').fadeOut(200)
        }
    });
    $('.back-to-top').on('click', function(event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: 0,
        }, 1500);
    });
    
	//===== Magnific-popup js

	if ($('.video-popup').length) {
		$('.video-popup').magnificPopup({
			type: 'iframe',
			removalDelay: 300,
			mainClass: 'mfp-fade'
		});
	}

    //===== Nice select js
    
    if ($('select').length){
        $('select').niceSelect();
    }

	// ===== Counter

	if ($('.counter').length) {
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					$(entry.target).counterUp({
						delay: 100,
						time: 4000
					});
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 1.0
		});
		$('.counter').each(function() {
			observer.observe(this);
		});
	}

	//====== Parallax js

    $('.scene').each(function () {
        new Parallax($(this)[0]);
    });


	//====== Aos 

	AOS.init({
		offset: 0
	});

	// Document Ready

	$(function() {
		mainMenu();
		offCanvas();
		initOffcanvasPanel();
	});

})(window.jQuery);