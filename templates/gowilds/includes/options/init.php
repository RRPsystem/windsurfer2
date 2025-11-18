<?php
	if(!class_exists('Redux')){ return; }

	$opt_name = 'gowilds_theme_options';
	
	$theme = wp_get_theme(); 

	$args = array(
		'disable_tracking' => true,
	  	'opt_name'             => $opt_name,
	  	'display_name'         => $theme->get('Name'),
	  	'display_version'      => $theme->get('Version'),
	  	'menu_type'            => 'menu',
	  	'allow_sub_menu'       => true,
		'menu_title'      	  => esc_html__('Theme Settings', 'gowilds'),
	  	'page_title'      	  => esc_html__('Theme Settings', 'gowilds'),
		'google_update_weekly' => false,
		'async_typography'     => false,
		'admin_bar'            => false,
		'admin_bar_priority'   => 50,
		'global_variable'      => '',
		'dev_mode'             => false,
		'forced_dev_mode_off'  => true,
		'update_notice'        => false,
		'customizer'           => false,
		'page_priority'        => 99,
		'page_parent'          => 'themes.php',
		'page_permissions'     => 'manage_options',
		'page_icon'            => 'icon-themes',
		'page_slug'            => '',
		'save_defaults'        => true,
		'default_show'         => false,
		'show_import_export'   => true,
		'output'               => true,
		'output_tag'           => true,
		'use_cdn'              => true,
		'system_info'          => false
	);

  Redux::setArgs( $opt_name, $args );
	
 
