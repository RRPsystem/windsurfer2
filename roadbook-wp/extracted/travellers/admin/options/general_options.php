<?php
function travellers_general_options( $options = array() ){

 
	$options = array( 
      array(
        'id'          => 'admin_logo',
        'label'       => __( 'Admin logo', 'travellers' ),
        'desc'        => '',
        'std'         => TRAVELLERS_URI. '/images/company-blue.png',
        'type'        => 'upload',
        'section'     => 'general_options',
        'condition'   => '',
        'operator'    => 'and'
      ),
      
      array(
        'id'          => 'show_breadcrumbs',
        'label'       => __( 'Show Breadcrumbs', 'travellers' ),
        'desc'        => '',
        'std'         => 'on',
        'type'        => 'on-off',
        'section'     => 'general_options',
        'condition'   => '',
        'operator'    => 'and'
      ),
	);

	return apply_filters( 'travellers_general_options', $options );
}
?>