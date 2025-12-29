<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_images_slider_shortcode_vc');
function travellers_images_slider_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Images slider', 'travellers'),
			'base' => 'travellers_images_slider',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => '',
			'params' => array(				
				// params group
	            array(
			      'type' => 'param_group',
			      'heading' => __( 'Images slider', 'travellers' ),
			      'param_name' => 'header_images_slider',
			      'value' => urlencode( json_encode( array(
			                    array(
			                      'title' => 'Excellent Jungle Safari',
			                      'subtitle' => 'Pellentesque tincidunt id nisl non molestie. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
			                      'contact_form' => '',
			                       'image' => TRAVELLERS_URI.'/images/slider/slide1.jpg',
			                    ),
			                    array(
			                      'title' => 'Honeymoon Special Tours',
			                      'subtitle' => 'Pellentesque tincidunt id nisl non molestie. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
			                      'contact_form' => '',
			                       'image' => TRAVELLERS_URI.'/images/slider/slide2.jpg',
			                    ),                   
			                    array(
			                      'title' => 'Life In Real Action',
			                      'subtitle' => 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
			                      'contact_form' => '',
			                       'image' => TRAVELLERS_URI.'/images/slider/slide3.jpg',
			                    ),
			                  ) ) ),
			      'params' => array(
			            array(
			                  'type' => 'textfield',
			                  'value' => '',
			                  'heading' => 'Title',
			                  'param_name' => 'title',   
			                  'admin_label' => true,                       
			              ),
			            array(
			                  'type' => 'textfield',
			                  'value' => '',
			                  'heading' => 'Sub-Title',
			                  'param_name' => 'subtitle',                     
			              ),
			            array(
			                  'type' => 'textfield',
			                  'value' => '',
			                  'heading' => 'Contact form 7 shortcode',
			                  'param_name' => 'contact_form',                     
			              ),
			              array(
			                'type' => 'image_upload',
			                'heading' => __('Slide Image', 'travellers'),
			                'param_name' => 'image',
			                'description' => '',
			              ),  
			                 
			          ),
			      
			    )
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_images_slider extends WPBakeryShortCode {
}