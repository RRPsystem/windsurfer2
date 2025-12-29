<?php
function travellers_background_options( $options = array() ){
	$options = array(
       
		array(
        'id'          => 'container_width',
        'label'       => __( 'Container width', 'travellers' ),
        'desc'        => '',
        'std'         => array(1170, 'px'),
        'type'        => 'measurement',
        'section'     => 'background_options',
        'condition'   => '',
        'operator'    => 'and',
      ),
      array(
        'id'          => 'body_background',
        'label'       => __( 'Body background', 'travellers' ),
        'desc'        => '',
        'std'         => array('background-color' => '', 'background-image' => ''),
        'type'        => 'background',
        'section'     => 'background_options',        
      ),      
      array(
        'id'          => 'footer_background',
        'label'       => __( 'Footer background', 'travellers' ),
        'desc'        => '',
        'std'         => array('background-color' => '', 'background-image' => ''),
        'type'        => 'background',
        'section'     => 'background_options'        
      ),
      array(
        'id'          => 'background_css',
        'label'       => __( 'CSS', 'travellers' ),
        'class'      => 'hide-field',
        'desc'        => '',
        'std'         => '
@media only screen and (min-width: 1200px) {       
.container{
    width: {{container_width}};
} 
}

body{
    {{body_background}}
}   
#main-footer{
    {{footer_background}}
}  

        ',
        'type'        => 'css',
        'section'     => 'background_options',
        'rows'        => '20',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'condition'   => '',
        'operator'    => 'and'
      ),
     
    );

	return apply_filters( 'travellers_background_options', $options );
}  
?>