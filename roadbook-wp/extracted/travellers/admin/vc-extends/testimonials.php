<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_testimonial_shortcode_vc');
function travellers_testimonial_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Testimonials', 'travellers'),
			'base' => 'travellers_testimonials',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Display single testimonial or multiple as carousel',
			'params' => array(
				
				// params group
	            array(
	                'type' => 'param_group',
	                'description' => '',
	                'heading' => __( 'Testimonials', 'travellers' ),
	                'param_name' => 'testimonials',
	                'value' => urlencode( json_encode( array(
						                array(
						                	'title' => 'INCREDIBLE EXPERIENCE',
						                    'image' => TRAVELLERS_URI.'/images/quote/01.jpg',
						                    'name' => 'Natasha Romonoff',				                    
						                    'subtitle' => 'Secret Agent',                   
						                    'desc' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Pellentesque elit tortor, adipiscing vel velit inermentum nulla. Donec in urna semulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt tellus vel libero pellentes Proin elit turpis, blandit in libero in',                    
						                ),
						                array(
						                	'title' => 'Awesome Places',
						                    'image' => TRAVELLERS_URI.'/images/quote/02.jpg',
						                    'name' => 'Richard Simon',				                    
						                    'subtitle' => 'CEO at IT Company',                   
						                    'desc' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Pellentesque elit tortor, adipiscing vel velit inermentum nulla. Donec in urna semulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt tellus vel libero pellentes Proin elit turpis, blandit in libero in', 	
						                ),
						                array(
						                	'title' => 'Best Food &amp; place',
						                    'image' => TRAVELLERS_URI.'/images/quote/03.jpg',
						                    'name' => 'John Doen',				                    
						                    'subtitle' => 'CEO at IT Company',                   
						                    'desc' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Pellentesque elit tortor, adipiscing vel velit inermentum nulla. Donec in urna semulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt tellus vel libero pellentes Proin elit turpis, blandit in libero in', 	
						                ),
						                ) ) ),
	                'params' => array(
	                	array(
			                'type' => 'textfield',
			                'value' => '',
			                'heading' => 'Title',
			                'param_name' => 'title',
			            ),  
	                	array(
			                'type' => 'image_upload',
			                'value' => 'Jhenny Doe',
			                'heading' => 'Testimonial image',
			                'param_name' => 'image',
			            ),
	                	array(
							'type' => 'textfield',
							'heading' => __('Names', 'travellers'),
							'param_name' => 'name',
							'description' => '',
							'value' => 'Jhone doe',
							'admin_label' => true,
						),
						array(
							'type' => 'textfield',
							'heading' => __('Sub-title', 'travellers'),
							'param_name' => 'subtitle',
							'description' => '',
							'value' => 'Marketing Consult Manager',
							'admin_label' => true,
						),				
			            array(
							'type' => 'textarea',
							'heading' => __('Testimonial description', 'travellers'),
							'param_name' => 'desc',
								'value' => 'Morbi accumsan ipsum velit. Nam nec tellus a odio tincidunt auctor a ornare odio. Sed non mauris vitae erat consequat auctor eu in elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra',
						),			            
	                   
	                )
	            ),
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_testimonials extends WPBakeryShortCode {
}