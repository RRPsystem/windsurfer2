<?php
require_once TRAVELLERS_DIR . '/lib/class-tgm-plugin-activation.php';

add_action('tgmpa_register', 'travellers_register_required_plugins');

function travellers_register_required_plugins()
{
	/*
	 * Array of plugin arrays. Required keys are name and slug.
	 * If the source is NOT from the .org repo, then source is also required.
	 */
	$plugins = array(
		array(
			'name'               => 'WPBakery Page Builder', // The plugin name.
			'slug'               => 'js_composer', // The plugin slug (typically the folder name).
			'source'             => TRAVELLERS_DIR . '/lib/plugins/js_composer-6.8.0.zip', // The plugin source.
			'required'           => true,
			'version'            => '6.8.0',
			'force_activation'   => false,
			'force_deactivation' => false,
			'external_url'       => '',
			'is_callable'        => '',
		),
		array(
			'name'               => 'Convert Plus', // The plugin name.
			'slug'               => 'convertplug', // The plugin slug (typically the folder name).
			'source'             => TRAVELLERS_DIR . '/lib/plugins/convertplug-3.5.24.zip', // The plugin source.
			'required'           => false,
			'version'            => '3.5.24',
			'force_activation'   => false,
			'force_deactivation' => false,
			'external_url'       => '',
			'is_callable'        => '',
		),
		array(
			'name'               => 'WP Perch shortcodes',
			'slug'               => 'wpperch-shortcodes',
			'source'             => TRAVELLERS_DIR . '/lib/plugins/wpperch-shortcodes.zip',
			'required'           => true,
			'version'            => '1.0.2',
			'force_activation'   => false,
			'force_deactivation' => false,
		),
		array(
			'name'               => 'Post like & view',
			'slug'               => 'perch-post-like-view',
			'source'             => TRAVELLERS_DIR . '/lib/plugins/perch-post-like-view.zip',
			'required'           => true,
			'version'            => '1.0',
			'force_activation'   => false,
			'force_deactivation' => false,
		),
		array(
			'name' => __('Envato market', 'travellers'), // The plugin name.
			'slug' => 'envato-market', // The plugin slug (typically the folder name).
			'source' => 'https://goo.gl/pkJS33',
		),
		array(
			'name'      => 'WooCommerce',
			'slug'      => 'woocommerce',
			'required'  => true,
		),
		array(
			'name'      => 'Contact form 7',
			'slug'      => 'contact-form-7',
			'required'  => true,
		),
		array(
			'name'      => 'Contact Form 7 MailChimp Extension',
			'slug'      => 'contact-form-7-mailchimp-extension',
			'source' => 'https://downloads.wordpress.org/plugin/contact-form-7-mailchimp-extension.zip',
			'required'  => false,
		),
		array(
			'name'      => 'Breadcrumb Navxt',
			'slug'      => 'breadcrumb-navxt',
			'required'  => true,
		),
		array(
			'name' => __('One Click Demo Import', 'travellers'),
			'slug' => 'one-click-demo-import',
			'required' => false
		),
		array(
            'name' => esc_attr__( 'Control Block Patterns', 'travellers' ),
            'slug' => 'control-block-patterns',
            'source' => 'https://downloads.wordpress.org/plugin/control-block-patterns.zip',
            'version' => '1.3.5.5',
            'required' => false
        ),
		array(
			'name'               => esc_attr(__('Team Booking', 'travellers')),
			'slug'               => 'team-booking',
			'source'             => '#',
			'required'           => true,
			'version'            => '3.0.13'
		),
	);

	/*
	 * Array of configuration settings. Amend each line as needed.
	 *
	 * TGMPA will start providing localized text strings soon. If you already have translations of our standard
	 * strings available, please help us make TGMPA even better by giving us access to these translations or by
	 * sending in a pull-request with .po file(s) with the translations.
	 *
	 * Only uncomment the strings in the config array if you want to customize the strings.
	 */
	$config = array(
		'id'           => 'travellers',                 // Unique ID for hashing notices for multiple instances of TGMPA.
		'default_path' => '',                      // Default absolute path to bundled plugins.
		'menu'         => 'tgmpa-install-plugins', // Menu slug.
		'parent_slug'  => 'themes.php',            // Parent menu slug.
		'capability'   => 'edit_theme_options',
		'has_notices'  => true,                    // Show admin notices or not.
		'dismissable'  => true,                    // If false, a user cannot dismiss the nag message.
		'dismiss_msg'  => '',                      // If 'dismissable' is false, this message will be output at top of nag.
		'is_automatic' => false,                   // Automatically activate plugins after installation or not.
		'message' => '<p><a class="" href="' . add_query_arg(['check' => 'plugin_status']) . '">Check ' . wp_get_theme()->get('Name') . '\'s custom plugins update availability</a></p>'


	);

	tgmpa(travellers_fetch_plugins_update($plugins), $config);
}

add_filter('ocdi/register_plugins', 'travellers_ocdi_register_plugins');
function travellers_ocdi_register_plugins()
{
	return array(

		array(
			'name'        => 'WPBakery Page Builder', // The plugin name.
			'slug'        => 'js_composer', // The plugin slug (typically the folder name).
			'source'      => TRAVELLERS_DIR . '/lib/plugins/js_composer-6.8.0.zip', // The plugin source.
			'required'    => true,
			'preselected' => true
		),
		array(
			'name'        => 'WP Perch shortcodes',
			'slug'        => 'wpperch-shortcodes',
			'source'      => TRAVELLERS_DIR . '/lib/plugins/wpperch-shortcodes.zip',
			'required'    => true,
			'preselected' => true
		),
		array(
			'name' => __('Contact Form 7', 'travellers'),
			'slug' => 'contact-form-7',
			'required' => true,
			'preselected' => true
		),
		array(
			'name' => __('Breadcrumb NavXT', 'travellers'),
			'slug' => 'breadcrumb-navxt',
			'required' => true,
			'preselected' => true
		),
		array(
			'name' => esc_attr__('Woocommerce', 'travellers'),
			'slug' => 'woocommerce',
			'required' => false
		),
	);
}

if (!function_exists('travellers_fetch_plugins_update')) {

	/**
	 * Helper function to fetch the Plugins array.
	 *
	 * @param array $plugins Whether or not to return a normalized array. 
	 *
	 * @return array
	 *
	 * @access public
	 */
	function travellers_fetch_plugins_update($plugins, $force_build = false)
	{

		if (is_string($plugins) || is_bool($plugins)) return $plugins;



		$update_data = wp_get_update_data();
		if ($update_data['counts']['plugins'] > 0) {
			$force_build = true;
		} elseif (!empty($_GET['check']) && ($_GET['check'] == 'plugin_status')) {
			$force_build = true;
		}

		// Plugins cache key.
		$plugins_cache_key = apply_filters('travellers_plugins_cache_key', 'travellers_plugins_cache');
		// Get the plugins from cache.
		$plugins_cache = apply_filters('travellers_plugins_cache', get_transient($plugins_cache_key));


		if ($force_build || !is_array($plugins_cache) || empty($plugins_cache)) {

			$plugins_response = travellers_get_plugin_api_response();

			// Continue if we got a valid response.
			if (200 === wp_remote_retrieve_response_code($plugins_response)) {
				$response_body = wp_remote_retrieve_body($plugins_response);

				if ($response_body) {
					// JSON decode the response body and cache the result.
					$plugins_data = json_decode(trim($response_body), true);
					if (is_array($plugins_data) && isset($plugins_data['items'])) {


						$plugins_tmp = [];
						foreach ($plugins_data['items'] as $value) {
							if (empty($value['source'])) continue;

							$id = $value['slug'];
							if ($id) {
								$plugins_tmp[$id] = array(
									'version' => $value['Version'],
									'source' => $value['source'],
								);
							}
						}

						$plugins = travellers_compare_plugins_version($plugins, $plugins_tmp);
						set_theme_mod('travellers_plugins', $plugins);
						set_transient($plugins_cache_key, $plugins, WEEK_IN_SECONDS);
					}
				}
			}
		} else {
			$plugins = $plugins_cache;
		}

		return $plugins;
	}
}



function travellers_get_plugin_api_response()
{
	// API url and key.
	$plugins_api_url = apply_filters('travellers_plugins_api_url', 'https://www.jthemes.com/themes/tgmpa/');
	$plugins_api_key = apply_filters('travellers_plugins_api_key', 'AIzaSyAY4CxRw0I0VvaABZcMcNqU-Zjuw7xjrW4');

	// API arguments.
	$plugins_fields = apply_filters('travellers_plugins_fields',	array('Slug', 'Version', 'Name'));
	$plugins_sort   = apply_filters('travellers_plugins_sort', 'alpha');
	// Initiate API request.
	$plugins_query_args = array(
		'key'    => $plugins_api_key,
		'fields' => implode(',', $plugins_fields),
		'sort'   => $plugins_sort,
	);

	// Build and make the request.
	$plugins_query    = esc_url_raw(add_query_arg($plugins_query_args, $plugins_api_url));
	return wp_safe_remote_get(
		$plugins_query,
		array(
			'sslverify' => false,
			'timeout'   => 15,
		)
	);
}

function travellers_compare_plugins_version($plugins, $plugins_tmp)
{
	// check custom plugins
	foreach ($plugins as $key => $plugin) {
		if (empty($plugin['source'])) continue;
		if (!array_key_exists($plugin['slug'], $plugins_tmp)) continue;

		$slug = $plugin['slug'];
		if (version_compare($plugins[$key]['version'], $plugins_tmp[$slug]['version'], '>='))  continue;

		$plugins[$key]['version'] = $plugins_tmp[$slug]['version'];
		$plugins[$key]['source'] = $plugins_tmp[$slug]['source'];
	}
	return array_filter($plugins);
}
