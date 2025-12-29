<?php
add_action('vc_after_init', function() {

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'Section type', 'travellers' ),
      'param_name' => 'section_type',
      'value' => array(
        __( 'Section', 'travellers' ) => 'section',
        __( 'Header', 'travellers' ) => 'header',       
        __( 'footer', 'travellers' ) => 'footer',       
      ),
      'description' => __( 'Select Container section, Header and footer', 'travellers' ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

     $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'image_upload',
      'heading' => __( 'Header logo', 'travellers' ),
      'param_name' => 'logo',
      'value' => ot_get_option('logo', TRAVELLERS_URI.'/images/company-blue.png'),
      'dependency' => array(
        'element' => 'section_type',
        'value' => array('header'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );


    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'One page Menu', 'travellers' ),
      'param_name' => 'onepage_menu',
      'value' => array_flip(travellers_get_terms('nav_menu', 'slug')),
      'description' => __( 'Create menu and select', 'travellers' ),
      'dependency' => array(
        'element' => 'section_type',
        'value' => array('header'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'Menu position', 'travellers' ),
      'param_name' => 'menu_position',
      'value' => array(
        __( 'Bottom', 'travellers' ) => 'bottom',
        __( 'Top', 'travellers' ) => 'top',    
      ),
      'description' => __( 'Select header background type', 'travellers' ),
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('slider', 'image', 'video'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'Header type', 'travellers' ),
      'param_name' => 'header_type',
      'value' => array(
        __( 'Image', 'travellers' ) => 'image',
        __( 'Background slider', 'travellers' ) => 'slider',               
        __( 'Video Background', 'travellers' ) => 'video',  
        __( 'Menu bar only', 'travellers' ) => 'image_slider',     
      ),
      'description' => __( 'Select header background type', 'travellers' ),
      'dependency' => array(
        'element' => 'section_type',
        'value' => array('header'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'checkbox',
      'heading' => __( 'Overlay disable?', 'travellers' ),
      'param_name' => 'header_overlay',
      'value' => array( __( 'Yes', 'travellers' ) => 'yes' ),
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('slider', 'image', 'video'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'param_group',
      'heading' => __( 'SLider images', 'travellers' ),
      'param_name' => 'header_slider_images',
      'value' => urlencode( json_encode( array(
                    array(
                      'title' => 'Image 2',
                       'image' => TRAVELLERS_URI.'/images/slider/slide1.jpg',
                    ),
                    array(
                      'title' => 'Image 1',
                      'image' => TRAVELLERS_URI.'/images/slider/slide2.jpg',
                    ),                    
                    array(
                      'title' => 'Image 3',
                       'image' => TRAVELLERS_URI.'/images/slider/slide3.jpg',
                    ),
                  ) ) ),
      'params' => array(
            array(
                  'type' => 'textfield',
                  'value' => '',
                  'heading' => 'Title',
                  'param_name' => 'title',   
                  'admin_label' => true,                       
              ),
              array(
                'type' => 'image_upload',
                'heading' => __('Slide Image', 'travellers'),
                'param_name' => 'image',
                'description' => '',
              ),  
              array(
                'type' => 'image_upload',
                'heading' => __('Slide Image for small screen', 'travellers'),
                'param_name' => 'image_sm',
                'description' => '',
              ),  
                 
          ),
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('slider'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

   

    
    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'image_upload',
      'heading' => __( 'Video poster image', 'travellers' ),
      'param_name' => 'header_video_poster',
      'value' => TRAVELLERS_URI.'/images/slider/slide1.jpg',
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('video'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'param_group',
      'heading' => __( 'SLider Video', 'travellers' ),
      'param_name' => 'header_video',
      'value' => urlencode( json_encode( array(
                    array(
                      'format' => 'mp4',
                       'video' => TRAVELLERS_URI.'/images/media/demo.mp4',
                    ),
                    array(
                      'format' => 'webm',
                      'video' => TRAVELLERS_URI.'/images/media/demo.webm',
                    ),                    
                    array(
                      'format' => 'ogg',
                       'video' => TRAVELLERS_URI.'/images/media/demo.ogg',
                    ),
                  ) ) ),
      'params' => array(
            array(
                  'type' => 'textfield',
                  'value' => '',
                  'heading' => 'Video format',
                  'param_name' => 'format',   
                  'admin_label' => true,                       
              ),
              array(
                'type' => 'image_upload',
                'heading' => __('Upload Video', 'travellers'),
                'param_name' => 'video',
                'description' => '',
              ),  
                 
          ),
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('video'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );


    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'image_upload',
      'heading' => __( 'Header image', 'travellers' ),
      'param_name' => 'header_image_bg',
      'value' => TRAVELLERS_URI.'/images/slider2.jpg',
      'description' => __( 'Select header background type', 'travellers' ),
      'dependency' => array(
        'element' => 'header_type',
        'value' => array('image'),
      ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );




    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'Section type', 'travellers' ),
      'param_name' => 'section_type',
      'value' => array(
        __( 'Section', 'travellers' ) => 'section',
        __( 'Header', 'travellers' ) => 'header',       
        __( 'footer', 'travellers' ) => 'footer',       
      ),
      'description' => __( 'Select Container section, Header and footer', 'travellers' ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
        'type' => 'dropdown',
        'heading' => __( 'Section class name', 'travellers' ),
        'param_name' => 'padding_class',
        'group' => 'Travellers Settings',
        'value' => array(
                    'Section padding normal'  => 'page-block',
                    'Section padding large'  => 'page-block-large',
                    'Section no padding'  => 'section-no-padding',
                    'Section top padding only'  => 'section-top-padding',
                    'Section Bottom padding only'  => 'section-bottom-padding',
                  ),
        'description' => '',
        'dependency' => array(
          'element' => 'section_type',
          'value' => array('section'),
        ),
    );  
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
        'type' => 'dropdown',
        'heading' => __( 'Section Background', 'travellers' ),
        'param_name' => 'bg_class',
        'group' => 'Travellers Settings',
        'value' => array(
                    'Default Background color'  => 'default-bg',                    
                    'Primary Background color'  => 'BGprime',
                    'Gray Background color'  => 'BGlight',
                    'Dark Background color'  => 'BGdark',
                    'Overlay'  => 'overlay',
                  ),
        'description' => '',
        'dependency' => array(
          'element' => 'section_type',
          'value' => array('section'),
        ),
    ); 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
       'group' => 'Travellers Settings',
      'type' => 'el_id',
      'heading' => __( 'Section ID', 'travellers' ),
      'param_name' => 'el_id',
      'description' => sprintf( __( 'Enter section ID (Note: make sure it is unique and valid according to <a href="%s" target="_blank">w3c specification</a>).', 'travellers' ), 'http://www.w3schools.com/tags/att_global_id.asp' ),
    );
 
    vc_update_shortcode_param( 'vc_section', $newParamData );

    $newParamData = array(
      'group' => 'Travellers Settings',
      'type' => 'dropdown',
      'heading' => __( 'Section stretch', 'travellers' ),
      'param_name' => 'full_width',
      'value' => array(
        __( 'Default', 'travellers' ) => 'container',
        __( 'Stretch section', 'travellers' ) => 'container-wide',       
      ),
      'dependency' => array(
          'element' => 'section_type',
          'value' => array('section'),
        ),
      'description' => __( 'Select stretching options for section and content (Note: stretched may not work properly if parent container has "overflow: hidden" CSS property).', 'travellers' ),
    );
 
    vc_update_shortcode_param( 'vc_section', $newParamData );
}
);