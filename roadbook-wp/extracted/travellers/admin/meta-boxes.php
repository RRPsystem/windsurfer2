<?php
/**
 * Initialize the meta boxes. 
 */

add_action( 'admin_init', 'travellers_page_meta_boxes' );


function travellers_page_meta_boxes() {
    global $wpdb, $post;
  if( function_exists( 'ot_get_option' ) ): 
  $page_meta_box = array(
    'id'        => 'travellers_page_meta_box',
    'title'     => 'Travellers page Settings',
    'desc'      => '',
    'pages'     => array( 'page' ),
    'context'   => 'normal',
    'priority'  => 'high',
    'fields'    => array(  
     array(
        'id'          => 'header_bg',
        'label'       => __( 'Header background', 'travellers' ),
        'std'         => ot_get_option('header_background'),
        'type'        => 'upload',
        'section'     => 'header_options',        
      ),     
      array(
        'id'          => 'page_layout',
        'label'       => esc_attr(__( 'Default layout', 'travellers' )),
        'desc'        => '',
        'std'         => 'rs',
        'type'        => 'radio-image',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and',
        'choices'     => array( 
          array(
            'value'       => 'full',
            'label'       => esc_attr(__( 'Full width', 'travellers' )),
            'src'         => OT_URL . '/assets/images/layout/full-width.png'
          ),
          array(
            'value'       => 'ls',
            'label'       => esc_attr(__( 'Left sidebar', 'travellers' )),
            'src'         => OT_URL . '/assets/images/layout/left-sidebar.png'
          ),
          array(
            'value'       => 'rs',
            'label'       => esc_attr(__( 'Right sidebar', 'travellers' )),
            'src'         => OT_URL . '/assets/images/layout/right-sidebar.png'
          ),
        )
      ),
      array(
        'id'          => 'sidebar',
        'label'       => __('Select sidebar', 'travellers'),
        'desc'        => '',
        'std'         => 'sidebar-1',
        'type'        => 'sidebar-select',
        'class'       => '',
        'choices'     => array(),
        'operator'    => 'and',
        'condition'   => 'page_layout:not(full)'
      ),           
          
    )
  );
  
  ot_register_meta_box( $page_meta_box );
  endif;  //if( function_exists( 'ot_get_option' ) ):

}