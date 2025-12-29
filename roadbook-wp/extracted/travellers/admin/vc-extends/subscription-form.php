<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_subscription_form_shortcode_vc');
function travellers_subscription_form_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Subscription form', 'travellers'),
			'base' => 'travellers_subscription_form',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'flight, train, hotel & resturant info',
			'params' => array(				
				array(
					'type' => 'textfield',
					'heading' => __('Subscription form shortcode', 'travellers'),
					'param_name' => 'shortcode',
					'description' => '',
					'value' => '[mc4wp_form id="135"]',
				),
				
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_subscription_form extends WPBakeryShortCode {
}