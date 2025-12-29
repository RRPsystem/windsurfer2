<?php
function travellers_custom_css( $options = array() ){
	$options = array(
		array(
        'id'          => 'custom_css',
        'label'       => __( 'Custom css', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'css',
        'section'     => 'custom_css',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      )
    );

	return apply_filters( 'travellers_custom_css', $options );
}   
?>