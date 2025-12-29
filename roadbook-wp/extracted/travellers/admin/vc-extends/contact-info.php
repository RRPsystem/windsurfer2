<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_contact_info_shortcode_vc');
function travellers_contact_info_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Contact info', 'travellers'),
			'base' => 'travellers_contact_info',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Location, phone & email display 3 columns ',
			
			'params' => array(
				array(
					'type' => 'textarea',
					'heading' => __('Location', 'travellers'),
					'param_name' => 'location',
					'description' => '',
					'value' => '123 Main Street
Your City, State Country. ',
					'admin_label' => true
				),
				array(
					'type' => 'textarea',
					'heading' => __('Phone', 'travellers'),
					'param_name' => 'phones',
					'description' => '',
					'value' => '(123) 456-7890
(123) 456-7890',
					'admin_label' => true
				),
				array(
					'type' => 'textarea',
					'heading' => __('Email', 'travellers'),
					'param_name' => 'email',
					'description' => '',
					'value' => 'contact@companyname.com',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_contact_info extends WPBakeryShortCode {
}