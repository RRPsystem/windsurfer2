<?php
Redux::setSection( $opt_name, array(
	'title' => esc_html__('General Options', 'gowilds'),
	'icon' => 'el-icon-wrench',
	'fields' => array(
		array(
			'id'           => 'page_layout',
			'type'         => 'button_set',
			'title'        => esc_html__('Page Layout', 'gowilds'),
			'subtitle'     => esc_html__('Select the page layout type', 'gowilds'),
			'options'      => array(
				'boxed'     => esc_html__('Boxed', 'gowilds'),
				'fullwidth' => esc_html__('Fullwidth', 'gowilds')
			),
			'default' => 'fullwidth'
		),
      array(
        'id' => 'map_api_key',
        'type' => 'text',
        'title' => esc_html__('Google Map API key', 'gowilds'),
        'default' => ''
      ),

      // Logo Default Settings
      array(
         'id'     => 'logo_default',
         'type'   => 'info',
         'icon'   => true,
         'raw'    => '<h3 class="margin-bottom-0">' . esc_html__('Logo Default', 'gowilds') . '</h3>',
      ),
      array(
        'id'      => 'header_logo', 
        'type'    => 'media',
        'url'     => true,
        'title'   => esc_html__('Logo in header default', 'gowilds'), 
        'default' => ''
      ), 
         
		// Breadcrumb Default Settings
		array(
         'id'     => 'breadcrumb_default',
         'type'   => 'info',
         'icon'   => true,
         'raw'    => '<h3 class="margin-bottom-0">' . esc_html__('Breadcrumb Settings Without Elementor', 'gowilds') . '</h3>',
      ),
		array(
         'id'        => 'breadcrumb_title',
         'type'      => 'button_set',
         'title'     => esc_html__('Breadcrumb Title', 'gowilds'),
         'options'   => array(
            1 => esc_html__('Enable', 'gowilds'),
            0 => esc_html__('Disable', 'gowilds')
         ),
         'default'   => 1
      ),
      array(
         'id'        => 'breadcrumb_bg_color',
         'type'      => 'color',
         'title'     => esc_html__('Background Overlay Color', 'gowilds'),
         'default'   => ''
      ),
      array(
         'id'        => 'breadcrumb_bg_opacity',
         'type'      => 'slider',
         'title'     => esc_html__('Breadcrumb Ovelay Color Opacity', 'gowilds'),
         'default'   => 50,
         'min'       => 0,
         'max'       => 100,
         'step'      => 2,
         'display_value' => 'text',
      ),
      array(
         'id'        => 'breadcrumb_bg_image',
         'type'      => 'media',
         'url'       => true,
         'title'     => esc_html__('Breadcrumb Background Image', 'gowilds'),
         'default'   => '',
      ),
      array(
         'id'        => 'breadcrumb_text_stype',
         'type'      => 'select',
         'title'     => esc_html__('Breadcrumb Text Stype', 'gowilds'),
         'options'   => 
         array(
            'text-light'     => esc_html__('Light', 'gowilds'),
            'text-dark'      => esc_html__('Dark', 'gowilds')
         ),
         'default' => 'text-light'
      )
	)
));