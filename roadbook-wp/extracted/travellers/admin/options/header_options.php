<?php
function travellers_header_options( $options = array() ){
	$options = array(        
      array(
        'id'          => 'logo',
        'label'       => __( 'Logo', 'travellers' ),
        'desc'        => 'Appear in Menu bar',
        'std'         => TRAVELLERS_URI. '/images/company-blue.png',
        'type'        => 'upload',
        'section'     => 'header_options',
        'condition'   => '',
        'operator'    => 'and'
      ),
      array(
        'id'          => 'header_background',
        'label'       => __( 'Default Header background', 'travellers' ),
        'desc'        => 'You can change header background image from editing page.',
        'std'         => TRAVELLERS_URI.'/images/breadcrumb.jpg',
        'type'        => 'upload',
        'section'     => 'header_options',        
      ),
            array(
        'id'          => 'header_padding',
        'label'       => __( 'header background Spacing', 'travellers' ),       
        'std'         => array( 'top' => 10, 'bottom' => 25, 'unit' => 'px'),
        'type'        => 'spacing',
        'section'     => 'header_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      ),
		
    
     
    );

	return apply_filters( 'travellers_header_options', $options );
}  
?>