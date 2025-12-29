<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_countup_shortcode_vc');
function travellers_countup_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Countup', 'travellers'),
			'base' => 'travellers_countup',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Count from past date',
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
					'value' => '01 JAN {2015}',
				),
				array(
					'type' => 'textfield',
					'heading' => __('Date & time', 'travellers'),
					'param_name' => 'event_datetime',
					'description' => 'Example: jan,01,2015,00:00:00',
					'value' => 'jan,01,2015,00:00:00',
					'admin_label' => true,
				),
				
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_countup extends WPBakeryShortCode {
}