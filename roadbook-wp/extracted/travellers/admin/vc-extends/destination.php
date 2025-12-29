<?php 
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_destination_shortcode_vc');
function travellers_destination_shortcode_vc() {
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Destination', 'travellers'),
			'base' => 'travellers_destination',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'Dare, duration and Wheather',
			
			'params' => array(
				array(
					'type' => 'textfield',
					'heading' => __('Title', 'travellers'),
					'param_name' => 'title',
					'description' => '',
					'value' => 'Mariana Trench',
					'admin_label' => true
				),
				array(
					'type' => 'textfield',
					'heading' => __('Sub-Title', 'travellers'),
					'param_name' => 'subtitle',
					'description' => '',
					'value' => 'Deepest Place in the Ocean',
					'admin_label' => true
				),
				array(
					'type' => 'textfield',
					'heading' => __('Adventure Begins', 'travellers'),
					'param_name' => 'begins',
					'description' => 'title {Date}',
					'value' => 'Adventure Begins {25 Jan 2022}',
					'admin_label' => true
				),
				array(
					'type' => 'textfield',
					'heading' => __('Adventure Duration', 'travellers'),
					'param_name' => 'duration',
					'description' => 'title {Duration}',
					'value' => 'Duration {5 Days}',
					'admin_label' => true
				),
				array(
					'type' => 'textfield',
					'heading' => __('Wheather', 'travellers'),
					'param_name' => 'wheather',
					'description' => 'title {Wheather} in Farenheit',
					'value' => 'Wheather {Summer - 95&#8457; to 100.4&#8457;}',
					'admin_label' => true
				),
				array(
					'type' => 'textarea_html',
					'heading' => __('Description', 'travellers'),
					'param_name' => 'content',
					'description' => '',
					'value' => '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed scelerisque, purus sit amet elementum blandit, sem arcu egestas quam, eget malesuada sem libero eu ante. Duis nec ultricies enim. Sed cursus volutpat finibus. Morbi at ornare purus. Vivamus congue suscipit dui nec fringilla. Nam auctor velit nec nisi molestie, ut maximus libero euismod. Nam dolor nunc, consequat nec sollicitudin vel, commodo vitae ex. Vestibulum rhoncus mollis felis in auctor. Donec at ultricies erat, eu pulvinar est. Integer pretium nunc quis dui sollicitudin commodo.</p>',
					'admin_label' => true
				),
				
			),	

	));
	
}

class WPBakeryShortCode_Travellers_destination extends WPBakeryShortCode {
}