// JavaScript Document
// Author Name: Saptarang
// Author URI: http://www.saptarang.org
// Themeforest: http://themeforest.net/user/saptarang?ref=saptarang
// Creation Date: 22 Oct, 2015


jQuery(document).ready(function($){
    'use strict';

    // Top Arrow
    $(window).scroll(function () {
        if ($(window).scrollTop() > 1000) {
            $('a.top').fadeIn('slow');
        } else {
            $('a.top').fadeOut('slow');
        }
    });

    $(window).on('scroll', function() { 
                                
        /*----------------------------------------------------*/
        /*  Navigtion Menu Scroll
        /*----------------------------------------------------*/    
        
        var b = $(window).scrollTop();
        
        if( b > 72 ){       
            $(".affix").addClass("scroll");
        } else {
            $(".affix").removeClass("scroll");
        }               

    });

    $('table').addClass('table');
    $('.tips ul, .imptips ul').addClass('list-main');
    // Sectionize-Control
    if ($('.blog-sidebar select').length > 0) {
        $('.blog-sidebar select').selectize();
    }

    if ($('.orderby').length > 0) {
        $('.orderby').selectize();
    }

    $(document).on('click', '.count-control', function(){
        var old = parseInt($(this).closest('.quantity').find('.qty').val());
        if($(this).hasClass('plus')){

          if(parseInt($(this).data('max')) != -1 ){
            if( (parseInt($(this).data('max'))-1) >= old ){
             $(this).closest('.quantity').find('.qty').val(old+1);
            }
          }else{
            $(this).closest('.quantity').find('.qty').val(old+1);
          }      
          
        }else{
          if(old > 1){
            $(this).closest('.quantity').find('.qty').val(old-1);
          }     
        }
        $(this).closest('form').find('button[name="update_cart"]').prop('disabled', false);
        return false;
    });

    $('div:not(.subscribe) .button, div:not(.subscribe) .submit').addClass('btn btn-primary');


    // Collapse menu for small devices
    var winWidth = $('body').width();
    if (winWidth <= 767) {

        // Add attribs to menu
        $('#menu .navbar-nav li a').attr('data-toggle', 'collapse');
        $('#menu .navbar-nav li a').attr('data-target', '#menu');

        // smooth page Scroll
        $('nav a[href^="#"], a.top[href^="#"], a.smooth[href^="#"]').on("click", function (event) {
            event.preventDefault();
            $('html,body').animate({
                scrollTop: $(this.hash).offset().top - 150},
            1000);
        });

        // clone subscribe
        $(".subscribe").appendTo("#hidCon");

    } else {

        // smooth page Scroll
        $('nav a[href^="#"], a.top[href^="#"], a.smooth[href^="#"]').on("click", function (event) {
            event.preventDefault();
            $('html,body').animate({
                scrollTop: $(this.hash).offset().top - 0},
            1000);
        });
    }

    /*----------------------------------------------------*/
    /*	SubMenu On Hover
     /*----------------------------------------------------*/

    if ($(window).width() > 767) {
        $('#menu li.dropdown').on('hover', function () {
            $(this).find('.dropdown-menu').first().stop(true, true).delay(200).fadeIn(500);
        }, function () {
            $(this).find('.dropdown-menu').first().stop(true, true).delay(200).fadeOut(500);
        });
        $("#menu li.dropdown li").mouseover(function () {
            if ($(this).children('ul').length == 1) {
                var parent = $(this);
                var child_menu = $(this).children('ul');
                if ($(parent).offset().left + $(parent).width() + $(child_menu).width() > $(window).width()) {
                    $(child_menu).css('left', '-' + $(parent).width() + 'px');
                } else {
                    $(child_menu).css('left', $(parent).width() + 'px');
                }
            }
        });
    }

    // Full screen Slider
    $('#slides').superslides({
        animation: 'fade',
        play: 5000, // slideshow speed keep min 5000
        animation_speed: 7000,
        pagination: 'false'
    });

    // Affix for header
    var winHieght = $("#slides").outerHeight();
    var menuHT = $("#home").outerHeight();
    $('#home').affix({
          offset: {
                top: winHieght - menuHT,
                bottom: function () {
                      return (this.bottom = $('.footer').outerHeight(true))
                }
          }
    });

    // Slider option 3
    $('#image-slider.carousel').carousel({
        pause: 'true',
        interval: false, // slideshow speed
        autoPlay: false
    });


    function captionReset() {
        $('.carousel .active').each(function () {
            $(this).find('.carousel-caption h3').animate({marginLeft: '25.250em', opacity: '0'}, 200);
            $(this).find('.carousel-caption h6').animate({marginLeft: '-25.250em', opacity: '0'}, 200);
        });
    }
    function carouselCustom() {
        $('.carousel .active').each(function () {
            $(this).find('.carousel-caption h3, .carousel-caption h6').animate({marginLeft: '0', opacity: '1'}, 400);
            $(this).find('.carousel-caption h6').animate({marginLeft: '0', opacity: '1'}, 400);
        });
    }
    // Set First Slide Caption to Transparent
    $('#image-slider .carousel-caption h3, .carousel-caption h6').css("opacity", "0");
    $('#image-slider .carousel-caption h3').after('<br />');

    // first slide show
    carouselCustom();

    $('#image-slider').bind('slide.bs.carousel', function (e) {
        captionReset();
    });
    $('#image-slider').bind('slid.bs.carousel', function (e) {
        carouselCustom();
    });

    $('.timerwrap').each(function(){
        if($(this).attr('id') != ''){
        // Instanciating a custom countdown
         var CID = '#'+$(this).attr('id');
        var months = travellers.CountdownText[0];
        var days = travellers.CountdownText[1];
        var hours = travellers.CountdownText[2];
        var mins = travellers.CountdownText[3];
        var sec = travellers.CountdownText[4];
        
        var countdown = new Countdown({
            selector: CID,
            msgBefore: "Be Ready!",
            msgAfter: "Sorry Folks, try our next Tour!",
            msgPattern: "<div><span>{months}</span> "+months+"</div> <div><span>{days}</span> "+days+"</div> <div><span>{hours}</span> "+hours+"</div> <div><span>{minutes}</span>"+mins+"</div> <div><span>{seconds}</span> "+sec+"</div>",
            //msgPattern: "<div><span>{years}</span> years</div> <div><span>{months}</span> months</div> <div><span>{days}</span> days</div> <div><span>{hours}</span> hours</div> <div><span>{minutes}</span>minutes</div> <div><span>{seconds}</span> seconds</div>",
            dateStart: new Date('2013/12/25 12:00'),
            dateEnd: new Date($(CID).data('date'))
        });
        }
    })
    


    // OWL CAROUSEL: TRAVEL INFO
    $("#owl-demo").owlCarousel({
        autoPlay: 8000, //Set AutoPlay to 3 seconds
        items: 3,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [979, 2],
        itemsTablet: [767, 1],
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        pagination: false
    });

    // OWL CAROUSEL: ITINARARY - Layout option 2
    $("#itinarary2").owlCarousel({
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true,
        pagination: false
    });

    // OWL CAROUSEL: GALLERY
    $("#galleryCarousel").owlCarousel({
        autoPlay: false, //Set AutoPlay to 3 seconds
        items: 5,
        itemsDesktop: [1199, 4],
        itemsDesktopSmall: [979, 3],
        itemsMobile: [600, 2],
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        pagination: false
    });

    // OWL CAROUSEL: LINED UP
    $("#upcoming").owlCarousel({
        autoPlay: false, //Set AutoPlay to 3 seconds
        items: 3,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [979, 3],
        itemsMobile: [600, 1],
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        pagination: false
    });


// OWL CAROUSEL: PARTNERS
    $("#partnerSlider").owlCarousel({
        autoPlay: false, //Set AutoPlay to 3 seconds
        items: 4,
        itemsDesktop: [1199, 4],
        itemsDesktopSmall: [979, 3],
        itemsTablet: [767, 2],
        itemsMobile: [480, 1],
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        pagination: false
    });

    // OWL CAROUSEL: BLOG
    $("#blog-slider").owlCarousel({
        autoPlay: false, //Set AutoPlay to 3 seconds
        items: 2,
        itemsDesktop: [1199, 2],
        itemsDesktopSmall: [979, 1],
        itemsTablet: [767, 1],
        itemsMobile: [480, 1],
        navigation: true, // Show next and prev buttons
        navigationText: ["<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-left-s.svg' onerror='this.src='arrow-left-s.png' alt='Prev' />", "<img class='svg' src='"+travellers.TRAVELLERS_URI+"/images/svg/arrow-right-s.svg' onerror='this.src='arrow-right-s.png'' alt='Next' />"],
        pagination: false
    });

     $('.woocommerce-product-gallery__wrapper').owlCarousel({
        autoPlay: false, //Set AutoPlay to 3 seconds
        items: 1,
    });

    // Testimonials
    $('#testimonial.carousel').owlCarousel({
        interval: 7000, // slideshow speed,
        items: 1,
        itemsDesktop: [1199],
        itemsDesktopSmall: [979, 1],
        itemsTablet: [767, 1],
        itemsMobile: [480, 1],
    });

    // Input placeholder in IE
    //$('input, textarea').placeholder();

    // Image Lightbox
    $("a[data-rel^='prettyPhoto']").prettyPhoto({overlay_gallery: true});


    // Contact Form
    $('.loader').hide();

    
   


    if( $("#car").length > 0 ){
         // init controller CAR
        var controller = new ScrollMagic.Controller();
        var tube = $(".tube").outerHeight();
        var greyHgt = tube - 150;
        // create a scene
        var scene = new ScrollMagic.Scene({triggerElement: "#car", duration: greyHgt})
                .setPin("#car") // pins the element for the the scene's duration
                .addTo(controller); // assign the scene to the controller
    }
   


    /*  Replace all SVG images with inline SVG */
    $('img.svg').each(function () {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.get(imgURL, function (data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });

    // WOW - animated content
    var wow = new WOW(
            {
                boxClass: 'wow', // default
                animateClass: 'animated', // default
                offset: 100, // default
                mobile: true, // set false if you dont want animation on mobile phones
                live: true        // default
            }
    )
    wow.init();

    //twitter
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
 
    //facebook
    (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

    //google+
    (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();

    // Equal Height for Owl carousel
    let equalheight = function (container) {

        var currentTallest = 0,
                currentRowStart = 0,
                rowDivs = new Array(),
                $el,
                topPosition = 0;
        jQuery(container).each(function () {

            $el = jQuery(this);
            jQuery($el).height('auto')
            topPostion = $el.position().top;

            if (currentRowStart != topPostion) {
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0; // empty the array
                currentRowStart = topPostion;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
        });
    }


    $(window).on( 'load', function () {
        equalheight('#owl-demo .item');
    });


    $(window).on( 'resize', function () {
        equalheight('#owl-demo .item');
    });

});


