<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_facility_shortcode_vc');
function travellers_facility_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Facility', 'travellers'),
			'base' => 'travellers_facility',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),	
			'description' => 'Image box with icon, title & description',	
			'params' => array(	
				array(
	                'type' => 'image_upload',
	                'value' => TRAVELLERS_URI.'/images/accomodation.jpg',
	                'heading' => 'Image',
	                'param_name' => 'image',
	                
	            ),
	            travellers_vc_icon_set('fontawesome', 'icon', 'fa fa-building-o', ''  ), 	                	
            	array(
					'type' => 'textfield',
					'heading' => __('Title', 'travellers'),
					'param_name' => 'title',
					'value' => 'Accomodation',
					'admin_label' => true
				),
				array(
					'type' => 'textfield',
					'heading' => __('Sub Title', 'travellers'),
					'param_name' => 'subtitle',
					'value' => 'Pellentesque tincidunt non molestie',
				),					
	            array(
					'type' => 'textarea',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'content',
					'description' => '',
					'value' => '
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet ligula at tellus scelerisque elementum a et ante. Mauris pellentesque quam tortor. Pellentesque tincidunt id nisl non molestie. Cum sociis natoque penatibus et magnis dis parturient montes
                    ',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_facility extends WPBakeryShortCode {
}