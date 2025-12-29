<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_countdown_shortcode_vc');
function travellers_countdown_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Countdown', 'travellers'),
			'base' => 'travellers_countdown',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => '',
			'params' => array(
				array(
			      'type' => 'dropdown',
			      'heading' => __( 'Countdown style', 'travellers' ),
			      'param_name' => 'style',
			      'value' => array(
			        __( 'Default', 'travellers' ) => 'style1',
			        __( 'Shadow box', 'travellers' ) => 'style2',      
			      ),
			    ),
				array(
					'type' => 'textfield',
					'heading' => __('Departure on title', 'travellers'),
					'param_name' => 'departure_on_title',
					'description' => '',
					'value' => 'DEPARTURE ON',
					'admin_label' => true,
				),
				array(
					'type' => 'textfield',
					'heading' => __('Departure on', 'travellers'),
					'param_name' => 'departure_on',
					'description' => '',
					'value' => '25 JAN {2023}',
				),
				array(
					'type' => 'textfield',
					'heading' => __('Date & time', 'travellers'),
					'param_name' => 'event_datetime',
					'description' => 'Example: Jan 25, 2023 12:00',
					'value' => 'Jan 25, 2023 12:00',
					'admin_label' => true,
				),
				
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_countdown extends WPBakeryShortCode {
}