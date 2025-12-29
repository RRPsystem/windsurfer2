<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_section_title_shortcode_vc');
function travellers_section_title_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Section title', 'travellers'),
			'base' => 'travellers_section_title',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Title, description',
			
			'params' => array(
				array(
		          'type' => 'dropdown',
		          'heading' => __('Alignment', 'travellers'),
		          'param_name' => 'align',
		          'description' => '',
		          'value' => array(
		          		'Center' => 'center',
			            'Left'  => 'left',
		              ),
		        ),
				array(
					'type' => 'textfield',
					'heading' => __('Title', 'travellers'),
					'param_name' => 'title',
					'description' => 'use {} for thin text',
					'value' => '{TOUR} ITINERARY',
					'admin_label' => true
				),
				array(
					'type' => 'textarea',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'desc',
					'description' => '',
					'value' => 'Highlights Of Your Journey',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_section_title extends WPBakeryShortCode {
}