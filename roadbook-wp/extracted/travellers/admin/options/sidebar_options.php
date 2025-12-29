<?php
function travellers_sidebar_options( $options = array() ){
	$options = array(
		array(
        'id'          => 'create_sidebar',
        'label'       => __( 'Create Sidebar', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'list-item',
        'section'     => 'sidebar_option',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and',
        'settings'    => array(           
          array(
            'id'          => 'desc',
            'label'       => __( 'Description', 'travellers' ),
            'desc'        => __( '(optional)', 'travellers' ),
            'std'         => '',
            'type'        => 'text',
            'rows'        => '',
            'post_type'   => '',
            'taxonomy'    => '',
            'min_max_step'=> '',
            'class'       => '',
            'condition'   => '',
            'operator'    => 'and'
          )
        )
      ),	  

    );

	return apply_filters( 'travellers_sidebar_options', $options );
}   
?>