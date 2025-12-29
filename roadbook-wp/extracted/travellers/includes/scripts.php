<?php
if (!function_exists('travellers_fonts_url')) :
	/**
	 * Register Google fonts for Twenty Fifteen.
	 *
	 * @return string Google fonts URL for the theme.
	 */
	function travellers_fonts_url()
	{
		$fonts_url = '';
		$fonts     = array();

		/*
	 * Translators: If there are characters in your language that are not supported
	 */
		$fonts = array('Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic&subset=latin,greek,greek-ext,vietnamese,cyrillic-ext,latin-ext,cyrillic');


		if ($fonts) {
			$fonts_url = add_query_arg(array(
				'family' => urlencode(implode('|', $fonts)),
			), '//fonts.googleapis.com/css');
		}

		return $fonts_url;
	}
endif;
// Register Style
function travellers_styles()
{

	wp_enqueue_style('travellers-fonts', travellers_fonts_url(), false, false);

	wp_enqueue_style('bootstrap', TRAVELLERS_URI . '/css/bootstrap.min.css', false, false);
	wp_enqueue_style('bootstrap-grid', TRAVELLERS_URI . '/css/bootstrap-grid.min.css', false, false);
	if (is_rtl()) {
		wp_enqueue_style('bootstrap-rtl', TRAVELLERS_URI . '/css/bootstrap-rtl.min.css', false, false);
	}
	wp_enqueue_style('selectize-bootstrap3', TRAVELLERS_URI . '/css/selectize.bootstrap3.css', false, false);
	wp_enqueue_style('animate', TRAVELLERS_URI . '/css/animate.min.css', false, false);
	wp_enqueue_style('font-awesome-all', TRAVELLERS_URI . '/fonts/font-awesome/css/all.css', false, false);
	wp_enqueue_style('v4-shims', TRAVELLERS_URI . '/fonts/font-awesome/css/v4-shims.min.css', false, false);


	wp_enqueue_style('owl-carousel2', TRAVELLERS_URI . '/css/owl.carousel.css', false, false);
	wp_enqueue_style('prettyPhoto', TRAVELLERS_URI . '/css/prettyPhoto.css', false, false);
	wp_dequeue_style('woocommerce-general');
	wp_enqueue_style('travellers-woocommerce', TRAVELLERS_URI . '/css/woocommerce.css', false, TRAVELLERS_VERSION);
	if (is_rtl()) {
		wp_enqueue_style('travellers-style-rtl', TRAVELLERS_URI . '/css/rtl.css', false, TRAVELLERS_VERSION);
	} else {
		wp_enqueue_style('travellers-style', TRAVELLERS_URI . '/css/style.css', false, TRAVELLERS_VERSION);
	}
	wp_enqueue_style('travellers-color-green', TRAVELLERS_URI . '/css/color-green.css', false, TRAVELLERS_VERSION);
	wp_enqueue_style('travellers-theme', get_stylesheet_uri());
	//wp_dequeue_style( 'ot-dynamic-font_css' );
	//wp_enqueue_style( 'travellers-dynamic-css', TRAVELLERS_URI . '/dynamic.css', false, TRAVELLERS_VERSION );


}
add_action('wp_enqueue_scripts', 'travellers_styles');

// Register Script
function travellers_scripts()
{

	if (is_singular() && comments_open() && get_option('thread_comments')) {
		wp_enqueue_script('comment-reply');
	}

	$api = ot_get_option('google_map_api', '');
	$api = ($api != '') ? '&key=' . esc_attr($api) : '';
	wp_register_script('travellers-maps-api', 'http://maps.google.com/maps/api/js?sensor=false' . $api, array('jquery'), false, false);

	wp_register_script('travellers-directions', TRAVELLERS_URI . '/js/directions.js', array('travellers-maps-api'), false, false);

	wp_enqueue_script('bootstrap', TRAVELLERS_URI . '/js/bootstrap.min.js', array('jquery'), false, true);
	wp_enqueue_script('selectize', TRAVELLERS_URI . '/js/selectize.min.js', array('jquery'), false, true);
	wp_enqueue_script('jquery-countdown', TRAVELLERS_URI . '/js/jquery.countdown.js', array('jquery'), false, true);
	wp_enqueue_script('ScrollMagic', TRAVELLERS_URI . '/js/ScrollMagic.min.js', array('jquery'), false, true);
	wp_enqueue_script('jquery-superslides', TRAVELLERS_URI . '/js/jquery.superslides.min.js', array('jquery'), false, true);
	wp_enqueue_script('jquery-prettyPhoto', TRAVELLERS_URI . '/js/jquery.prettyPhoto.js', array('jquery'), false, true);
	wp_enqueue_script('wow', TRAVELLERS_URI . '/js/wow.min.js', array('jquery'), false, true);
	wp_enqueue_script('owl-carousel', TRAVELLERS_URI . '/js/owl.carousel.min.js', array('jquery'), false, true);
	//wp_enqueue_script( 'font-awesome-all', TRAVELLERS_URI . '/js/all.min.js', array( 'jquery' ), false, true );	
	wp_enqueue_script('v4-shims', TRAVELLERS_URI . '/fonts/font-awesome/css/v4-shims.min.js', array('jquery'), false, true);



	if (is_rtl()) {
		wp_enqueue_script('travellers-master', TRAVELLERS_URI . '/js/master-rtl.js', array('jquery'), TRAVELLERS_VERSION, true);
	} else {
		wp_enqueue_script('travellers-master', TRAVELLERS_URI . '/js/master.js', array('jquery'), TRAVELLERS_VERSION, true);
	}
	$arr = array(
		'ajaxurl' => admin_url('admin-ajax.php'),
		'TRAVELLERS_URI' => TRAVELLERS_URI,
		'TRAVELLERS_DIR' => TRAVELLERS_DIR,
		'CountdownText' => apply_filters('travellers_CountdownText', array(__('Months', 'travellers'), __('Days', 'travellers'), __('Hours', 'travellers'), __('Mins', 'travellers'), __('sec', 'travellers')))
	);
	wp_localize_script('travellers-master', 'travellers', $arr);

	// Load the html5 shiv.
	wp_enqueue_script('travellers-html5', TRAVELLERS_URI . '/js/html5.js', array(), '3.7.3');
	wp_script_add_data('travellers-html5', 'conditional', 'lt IE 9');
}
add_action('wp_enqueue_scripts', 'travellers_scripts');
