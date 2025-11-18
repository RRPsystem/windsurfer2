<?php
Redux::setSection( $opt_name, array(
  	'title' => esc_html__('Footer Options', 'gowilds'),
  	'icon' => 'el-icon-compass',
  	'fields' => array(
	 	array(
			'id' 			=> 'copyright_default',
			'type' 		=> 'button_set',
			'title' 		=> esc_html__('Enable/Disable Copyright Text', 'gowilds'),
			'options' 	=> array(
				'yes' 	=> esc_html__('Enable', 'gowilds'),
				'no' 		=> esc_html__('Disable', 'gowilds')
			),
			'default' 	=> 'yes'
	 	),
	 	array(
			'id' 			=> 'copyright_text',
			'type' 		=> 'editor',
			'title' 		=> esc_html__('Footer Copyright Text', 'gowilds'),
			'default' 	=> esc_html__('Copyright - 2023 - Company - All rights reserved. Powered by WordPress.', 'gowilds')
	 	),
  	)
));