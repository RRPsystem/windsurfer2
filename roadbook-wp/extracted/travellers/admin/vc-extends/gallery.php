<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_gallery_shortcode_vc');
function travellers_gallery_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Gallery', 'travellers'),
			'base' => 'travellers_gallery',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Image carousel with popup display',
			'params' => array(				
				array(
	                'type' => 'attach_images',
	                'value' => '',
	                'heading' => 'Images',
	                'param_name' => 'images',
	                'admin_label' => true,
	            ),
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_gallery extends WPBakeryShortCode {
}