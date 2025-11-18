<?php
Redux::setSection( $opt_name, array(
	'icon'         => 'el-icon-shopping-cart',
	'title'        => esc_html__('WooCommerce Options', 'gowilds'),
	'fields'       => array(
		array(
	      'id'     => 'nf_shop_info',
	       'type'   => 'info',
	        'icon'   => true,
	      'raw'    => '<h3 class="margin-bottom-0">' . esc_html__('Shop Page Settings', 'gowilds') . '</h3>',
	   ),
	 	array(
		  'id'        => 'products_per_page',
		  'type'      => 'text',
		  'title'     => esc_html__('Products Per Page', 'gowilds'),
		  'subtitle'  => esc_html__('Number value.', 'gowilds'),
		  'desc'      => esc_html__('The amount of products you would like to show per page on shop/category pages.', 'gowilds'),
		  'validate'  => 'numeric',
		  'default'   => '24'
		),
		array(
			'id'        => 'product_columns_lg',
			'type'      => 'select',
			'title'     => esc_html__('Display Columns for Large Screen', 'gowilds'),
			'subtitle'  => esc_html__('Choose the number of columns to display on shop/category pages.', 'gowilds'),
			'options'   => array(
				'1'      => '1',
				'2'      => '2',
				'3'      => '3',
				'4'      => '4',
				'5'      => '5',
				'6'      => '6',
			),
			'default'   => '3'
		),

		array(
			'id'        => 'product_columns_md',
			'type'      => 'select',
			'title'     => esc_html__('Display Columns for Medium Screen', 'gowilds'),
			'subtitle'  => esc_html__('Choose the number of columns to display on shop/category pages.', 'gowilds'),
			'options'   => array(
				'1'      => '1',
				'2'      => '2',
				'3'      => '3',
				'4'      => '4',
				'5'      => '5',
				'6'      => '6',
			),
			'default'   => '3'
		),

		array(
			'id'        => 'product_columns_sm',
			'type'      => 'select',
			'title'     => esc_html__('Display Columns for Small Screen', 'gowilds'),
			'subtitle'  => esc_html__('Choose the number of columns to display on shop/category pages.', 'gowilds'),
			'options'   => array(
				'1'      => '1',
				'2'      => '2',
				'3'      => '3',
				'4'      => '4',
				'5'      => '5',
				'6'      => '6',
			),
			'default'   => '2'
		),

		array(
			'id'        => 'product_columns_xs',
			'type'      => 'select',
			'title'     => esc_html__('Display Columns for Extra Small Screen', 'gowilds'),
			'subtitle'  => esc_html__('Choose the number of columns to display on shop/category pages.', 'gowilds'),
			'options'   => array(
				'1'      => '1',
				'2'      => '2',
				'3'      => '3',
				'4'      => '4',
				'5'      => '5',
				'6'      => '6',
			),
			'default'   => '1'
		),

		array(
	      'id'     => 'nf_product_info',
	       'type'   => 'info',
	        'icon'   => true,
	      'raw'    => '<h3 class="margin-bottom-0">' . esc_html__('Shop Page Settings', 'gowilds') . '</h3>',
	   ),

		array(
			'id'        => 'upsell_heading_text',
			'type'      => 'text',
			'title'     => esc_html__('Upsell Heading Text', 'gowilds'),
			'default'   => esc_html__('Complete the look', 'gowilds')
		),
		array(
			'id'        => 'related_heading_text',
			'type'      => 'text',
			'title'     => esc_html__('Related Heading Text', 'gowilds'),
			'default'   => esc_html__('Related Products', 'gowilds')
		),

		array(
		  'id'  => 'woo_product_page_breadcrumb',
		  'type'  => 'info',
		  'icon'  => true,
		  'raw' => '<h3 style="margin: 0;">' . esc_html__( 'Breacrumb Settings', 'gowilds' ) . '</h3>',
		),

		array(
			'id'        => 'woo_breadcrumb',
			'type'      => 'button_set',
			'title'     => esc_html__('Breadcrumb On Product Page', 'gowilds'),
			'options'   => array(
				1 => esc_html__('Enable', 'gowilds'),
				0 => esc_html__('Disable', 'gowilds')
			),
			'default'   => 1
		),

		array(
			'id'        => 'woo_breadcrumb_title',
			'type'      => 'button_set',
			'title'     => esc_html__('Breadcrumb Title', 'gowilds'),
			'options'   => array(
				1 => esc_html__('Enable', 'gowilds'),
				0 => esc_html__('Disable', 'gowilds')
			),
			'default'   => 1
		),
		array(
			'id'        => 'woo_breadcrumb_padding_top',
			'type'      => 'slider',
			'title'     => esc_html__('Breadcrumb Padding Top', 'gowilds'),
			'default'   => 120,
			'min'       => 50,
			'max'       => 500,
			'step'      => 1,
			'display_value' => 'text',
		),
		array(
			'id'        => 'woo_breadcrumb_padding_bottom',
			'type'      => 'slider',
			'title'     => esc_html__('Breadcrumb Padding Top', 'gowilds'),
			'default'   => 120,
			'min'       => 50,
			'max'       => 500,
			'step'      => 1,
			'display_value' => 'text',
		),
		array(
			'id'        => 'woo_breadcrumb_bg_color',
			'type'      => 'color',
			'title'     => esc_html__('Background Overlay Color', 'gowilds'),
			'default'   => ''
		),
		array(
			'id'        => 'woo_breadcrumb_bg_opacity',
			'type'      => 'slider',
			'title'     => esc_html__('Breadcrumb Ovelay Color Opacity', 'gowilds'),
			'default'   => 50,
			'min'       => 0,
			'max'       => 100,
			'step'      => 2,
			'display_value' => 'text',
		),
		array(
			'id'        => 'woo_breadcrumb_bg',
			'type'      => 'button_set',
			'title'     => esc_html__('Breadcrumb Image', 'gowilds'),
			'options'   => array( 
				1 => esc_html__('Enable', 'gowilds'),
				0 => esc_html__('Disable', 'gowilds')
			),
			'default'   => '1'
		),
		array(
			'id'        => 'woo_breadcrumb_bg_image',
			'type'      => 'media',
			'url'       => true,
			'title'     => esc_html__('Breadcrumb Background Image', 'gowilds'),
			'default'   => '',
			'required'  => array('woo_breadcrumb_bg', '=', 1 )
		),
		array(
			'id'        => 'woo_breadcrumb_text_stype',
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
