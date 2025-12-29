<?php
//include all available options
get_template_part('admin/options/general_options') ;
get_template_part('admin/options/background_options') ;
get_template_part('admin/options/header_options') ;
get_template_part('admin/options/sidebar_options') ;
get_template_part('admin/options/footer_options') ;
get_template_part('admin/options/blog_options') ;
get_template_part('admin/options/typography') ;
get_template_part('admin/options/styling_options') ;
get_template_part('admin/options/custom_css') ;
/**
 * Initialize the custom theme options.
 */
add_action( 'admin_init', 'travellers_theme_options', 1 );

/**
 * Build the custom settings & update OptionTree.
 */
function travellers_theme_options() {
  
  /* OptionTree is not loaded yet */
  if ( ! function_exists( 'ot_settings_id' ) )
    return false;
    
  /**
   * Get a copy of the saved settings array. 
   */
  $saved_settings = get_option( ot_settings_id(), array() );
  
  /**
   * Custom settings array that will eventually be 
   * passes to the OptionTree Settings API Class.
   */
  //available option functions 
  //merge all available options
  $settings = array_merge( 
    travellers_general_options(), 
    travellers_header_options(),
    travellers_background_options(), 
    travellers_sidebar_options(), 
    travellers_footer_options(),  
    travellers_blog_options(), 
    travellers_event_options(), 
    travellers_typography_options(), 
    travellers_styling_options(), 
    travellers_custom_css() 
  );

 

  $custom_settings = array( 
    'contextual_help' => array( 
      'sidebar'       => ''
    ),
    'sections'        => array( 
      array(
        'id'          => 'general_options',
        'title'       => __( 'General options', 'travellers' )
      ),
      array(
        'id'          => 'header_options',
        'title'       => __( 'Header options', 'travellers' )
      ),
      array(
        'id'          => 'background_options',
        'title'       => __( 'Background Options', 'travellers' )
      ),     
      array(
        'id'          => 'footer_options',
        'title'       => __( 'Footer options', 'travellers' )
      ),
      array(
        'id'          => 'sidebar_option',
        'title'       => __( 'Sidebar options', 'travellers' )
      ),
      array(
        'id'          => 'blog_options',
        'title'       => __( 'Blog options', 'travellers' )
      ),
      array(
        'id'          => 'event_options',
        'title'       => __( 'Event options', 'travellers' )
      ),
      array(
        'id'          => 'typography',
        'title'       => __( 'Typography options', 'travellers' )
      ),
      array(
        'id'          => 'styling_options',
        'title'       => __( 'Color options', 'travellers' )
      ),
      array(
        'id'          => 'custom_css',
        'title'       => __( 'Custom css', 'travellers' )
      )
    ),
    'settings'        => $settings
  );

  
  /* allow settings to be filtered before saving */
  $custom_settings = apply_filters( ot_settings_id() . '_args', $custom_settings );
  
  /* settings are not the same update the DB */
  if ( $saved_settings !== $custom_settings ) {
    update_option( ot_settings_id(), $custom_settings ); 
  }
  
  /* Lets OptionTree know the UI Builder is being overridden */
  global $ot_has_custom_theme_options;
  $ot_has_custom_theme_options = true;

  return $custom_settings[ 'settings' ];
  
}