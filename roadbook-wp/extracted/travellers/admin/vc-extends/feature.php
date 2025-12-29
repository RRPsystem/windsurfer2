<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_feature_shortcode_vc');
function travellers_feature_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Feature', 'travellers'),
			'base' => 'travellers_feature',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),	
			'description' => 'icon, title & description',	
			'params' => array(	
				array(
			      'type' => 'dropdown',
			      'heading' => __( 'Feature style', 'travellers' ),
			      'param_name' => 'style',
			      'value' => array(
			        __( 'Default', 'travellers' ) => 'style1',
			        __( 'Style 2', 'travellers' ) => 'style2',
			        __( 'Style 3 (Center aligned)', 'travellers' ) => 'style3',

			      ),
			    ),
				travellers_vc_icon_set('fontawesome', 'icon', 'fa fa-heartbeat', ''  ),
				array(
					'type' => 'textfield',
					'heading' => __('Title', 'travellers'),
					'param_name' => 'title',
					'value' => 'Health Requirements',
					'admin_label' => true
				),
	            array(
					'type' => 'textarea',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'content',
					'description' => '',
					'value' => '
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet ligula at tellus scelerisque elementum a et ante. Mauris pellentesque quam tortor. Pellentesque tincidunt id nisl non molestie. Cum sociis natoque penatibus et magnis dis parturient montes.
                    ',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_feature extends WPBakeryShortCode {
}