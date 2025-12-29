<?php
define('TRAVELLERS', 'travellers');
define('TRAVELLERS_VERSION', '1.6.1' . WP_DEBUG ? '-' . time() : '');
define('TRAVELLERS_URI', get_template_directory_uri());
define('TRAVELLERS_DIR', get_template_directory());
// Set content width value based on the theme's design
if (!isset($content_width))
	$content_width = 884;

if (!function_exists('travellers_theme_features')) {

	// Register Theme Features
	function travellers_theme_features()
	{

		// Add theme support for Automatic Feed Links
		add_theme_support('automatic-feed-links');

		// Add theme support for Post Formats
		add_theme_support('post-formats', array('status', 'quote', 'gallery', 'image', 'video', 'audio', 'link', 'aside', 'chat'));

		// Add theme support for Featured Images
		add_theme_support('post-thumbnails');

		// Set custom thumbnail dimensions
		set_post_thumbnail_size(1200, 675, true);
		add_image_size('travellers-instructor-size', 300, 300, true);
		add_image_size('travellers-500x500', 500, 500, true);
		add_image_size('travellers-location-size', 800, 400, true);
		add_image_size('travellers-150x150-crop', 150, 150, true);

		// Add theme support for document Title tag
		add_theme_support('title-tag');

		add_theme_support('woocommerce');

		// Add theme support for custom CSS in the TinyMCE visual editor
		add_editor_style();

		// Add theme support for Translation
		load_theme_textdomain('travellers', get_template_directory() . '/language');

		//Register nav menu
		$locations = array(
			'primary' => esc_attr(__('primary menu', 'travellers')),
		);
		register_nav_menus($locations);

		add_editor_style(array('css/editor-style.css', 'fonts/font-awesome/css/font-awesome.min.css', travellers_fonts_url()));
	}
	add_action('after_setup_theme', 'travellers_theme_features');
}

// deactivate new block editor
function travellers_widgets_block_editor()
{
	remove_theme_support('widgets-block-editor');
}
add_action('after_setup_theme', 'travellers_widgets_block_editor');


/**
 * Required: set 'ot_theme_mode' filter to true.bread
 */
add_filter('ot_theme_mode', '__return_true');

add_filter('ot_load_dynamic_css', '__return_false');


/**
 * Show Settings Pages
 */
add_filter('ot_show_pages', '__return_false');

/**
 * Show Theme Options UI Builder
 */
add_filter('ot_show_options_ui', '__return_true');

/**
 * Show Settings Import
 */
add_filter('ot_show_settings_import', '__return_true');

/**
 * Show Settings Export
 */
add_filter('ot_show_settings_export', '__return_true');

/**
 * Show New Layout
 */
add_filter('ot_show_new_layout', '__return_true');

/**
 * Show Documentation
 */
add_filter('ot_show_docs', '__return_true');

/**
 * Custom Theme Option page
 */
add_filter('ot_use_theme_options', '__return_true');

/**
 * Meta Boxes
 */
add_filter('ot_meta_boxes', '__return_true');

/**
 * Allow Unfiltered HTML in textareas options
 */
add_filter('ot_allow_unfiltered_html', '__return_false');

/**
 * Loads the meta boxes for post formats
 */
add_filter('ot_post_formats', '__return_false');

/**
 * OptionTree in Theme Mode
 */
require(TRAVELLERS_DIR . '/option-tree/ot-loader.php');

/**
 * Theme Options
 */
require(TRAVELLERS_DIR . '/admin/theme-options.php');


/*Admin functions*/
include(TRAVELLERS_DIR . '/admin/functions.php');

/*theme functons*/
include(TRAVELLERS_DIR . '/includes/functions.php');

/*reuired plugins*/
include(TRAVELLERS_DIR . '/lib/travellers-plugins.php');
