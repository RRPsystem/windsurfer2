<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_onepage_footer_shortcode_vc');
function travellers_onepage_footer_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Onepage footer', 'travellers'),
			'base' => 'travellers_onepage_footer',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),	
			'description' => 'Comany logo, social icons & description',	
			'params' => array(	
				array(
		          'type' => 'perch_select',
		          'heading' => __('Footer menu', 'travellers'),
		          'param_name' => 'menu',
		          'description' => '',
		          'value' => travellers_get_terms('nav_menu', 'slug'),
		          'admin_label' => true
		        ),
				// params group
	            array(
	                'type' => 'param_group',
	                'description' => '',
	                'heading' => __( 'Social icons', 'travellers' ),
	                'param_name' => 'icons',
	                'value' => urlencode( json_encode( array(
						                array(
						                	'icon' => 'fab fa-facebook',
						                    'title' => 'Follow me on Facebook',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fab fa-twitter',
						                    'title' => 'Folow me on Twitter',
						                    'link' => '#',	                    
						                ),
						                array(
						                	'icon' => 'fab fa-google-plus',
						                    'title' => 'Google Plus',
						                    'link' => '#',	                    
						                ),	
						                array(
						                	'icon' => 'fab fa-flickr',
						                    'title' => 'Watch Our gallery',
						                    'link' => '#',	                    
						                ),					                
						                array(
						                	'icon' => 'fab fa-youtube',
						                    'title' => 'Watch me on Youtube',
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
					'heading' => __('Copyright text', 'travellers'),
					'param_name' => 'content',
					'description' => '',
					'value' => '
                        <p><strong>Group Tour</strong> &copy; '.date('Y').'. All Rights Reserved.<br> Landing Page Template Designed &amp; Developed By: <a href="http://themeforest.net/user/jthemes?ref=jthemes" title="jThemes Studio"><strong>jThemes Studio</strong></a></p>
                    ',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_onepage_footer extends WPBakeryShortCode {
}