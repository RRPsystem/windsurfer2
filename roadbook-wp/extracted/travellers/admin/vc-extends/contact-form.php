<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_contact_form_shortcode_vc');
function travellers_contact_form_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Contact form', 'travellers'),
			'base' => 'travellers_contact_form',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Title, description & contact form',
			
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
					'value' => '{Have} Questions?',
					'admin_label' => true
				),
				array(
					'type' => 'textarea',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'desc',
					'description' => '',
					'value' => 'We’re here to help solve all your problems',
					'admin_label' => true
				),
				array(
		          'type' => 'perch_select',
		          'heading' => __('Contact form', 'travellers'),
		          'param_name' => 'contact_form',
		          'description' => '',
		          'value' => travellers_get_posts_dropdown(array('post_type' => 'wpcf7_contact_form', 'posts_per_page' => -1), 'title'),
		          'admin_label' => true
		        ),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_contact_form extends WPBakeryShortCode {
}