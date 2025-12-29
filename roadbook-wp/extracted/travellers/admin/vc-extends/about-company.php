<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_about_company_shortcode_vc');
function travellers_about_company_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('About company', 'travellers'),
			'base' => 'travellers_about_company',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),	
			'description' => 'Comany logo, social icons & description',	
			'params' => array(	
				array(
	                'type' => 'image_upload',
	                'value' => TRAVELLERS_URI.'/images/company-green.png',
	                'heading' => 'Logo',
	                'param_name' => 'image',
	                
	            ),
				// params group
	            array(
	                'type' => 'param_group',
	                'description' => '',
	                'heading' => __( 'Social icons', 'travellers' ),
	                'param_name' => 'icons',
	                'value' => urlencode( json_encode( array(
						                array(
						                	'icon' => 'fa fa-facebook',
						                    'title' => 'Follow me on Facebook',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-twitter',
						                    'title' => 'Folow me on Twitter',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-youtube',
						                    'title' => 'Watch me on Youtube',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-linkedin',
						                    'title' => 'LinkedIn',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-pinterest-square',
						                    'title' => 'Follow Us On Pinterest',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-flickr',
						                    'title' => 'Watch Our gallery',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-google-plus',
						                    'title' => 'Google Plus',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-instagram',
						                    'title' => 'Instagram',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fa fa-vk',
						                    'title' => 'vk',
						                    'link' => '#',	                    
						                ),
						                ) ) ),
	                'params' => array(
	                	travellers_vc_icon_set('fontawesome', 'icon', '', ''  ), 	                	
	                	array(
							'type' => 'textfield',
							'heading' => __('Title', 'travellers'),
							'param_name' => 'title',
							'value' => '',
							'admin_label' => true
						),
						array(
							'type' => 'textfield',
							'heading' => __('Social Icon link', 'travellers'),
							'param_name' => 'link',
							'value' => '#',
						),
			            
	                   
	                )
	            ), 
	            array(
					'type' => 'textarea_html',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'content',
					'description' => '',
					'value' => '
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit Pellentesque elit tortor, adipiscing vel velit inermentum nulla. Donec in urna semulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt tellus vel libero pellentes Proin elit turpis, blandit in libero in</p> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit Pellentesque elite Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt tellus vel libero pellentes Proin elit turpis, blandit in libero in</p>
                    ',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_about_company extends WPBakeryShortCode {
}