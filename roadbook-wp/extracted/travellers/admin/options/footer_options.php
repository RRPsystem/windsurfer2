<?php
function travellers_footer_options( $options = array() ){

    
	$options = array(
       
        array(
            'id' => 'footer_widget_area',
            'label' => __( 'Footer widget area Display','travellers' ),
            'desc' => '',
            'std' => 'off',
            'type' => 'on-off',
            'section' => 'footer_options' 
        ),
        array(
            'id' => 'footer_widget_area_column',
            'label' => __( 'Footer widget area column', 'travellers' ),
            'desc' => '',
            'std' => 4,
            'type' => 'numeric-slider',
            'section' => 'footer_options',
            'min_max_step' => '1,4,1',
            'condition' => 'footer_widget_area:is(on)',
            'operator' => 'and' 
            
        ),
        array(
            'id'          => 'footer_social_links',
            'label'       => __( 'Social links', 'travellers' ),
            'desc'        => '',
            'std'         => array(
                    
                    array(
                        'title' => 'Facebook',
                        'icon' => 'fa-facebook',
                        'link' => '#',
                    ),
                    array(
                        'title' => 'Twitter',
                        'icon' => 'fa-twitter',
                        'link' => '#',
                    ), 
                    array(
                        'title' => 'Google+',
                        'icon' => 'fa-google-plus',
                        'link' => '#',
                    ), 
                    array(
                        'title' => 'Linkedin',
                        'icon' => 'fa-linkedin',
                        'link' => '#',
                    ),  
                    array(
                        'title' => 'Flickr',
                        'icon' => 'fa-flickr',
                        'link' => '#',
                    ),
                    array(
                        'title' => 'Youtube',
                        'icon' => 'fa-youtube',
                        'link' => '#',
                    ),                  
                ),
            'type'        => 'list-item',
            'section'     => 'footer_options',
            'settings'    => array(
                array(
                    'id'        => 'icon',
                    'label'     => __( 'Icon', 'travellers' ),
                    'type'        => 'iconpicker',
                    ),
                array(
                    'id'        => 'link',
                    'label'     => __( 'Link', 'travellers' ),
                    'type'        => 'text',
                    ),
               
                ),
            'operator'    => 'and',
        ),	
    array(
        'id'          => 'copyright_text',
        'label'       => __( 'Copyright Text', 'travellers' ),
        'desc'        => '',
        'std'         => '<p><strong>Group Tour</strong> &copy; '.date('Y').'. All Rights Reserved.<br> Landing Page Template Designed &amp; Developed By: <a href="http://themeforest.net/user/jthemes?ref=jthemes" title="jThemes Studio"><strong>jThemes Studio</strong></a></p>
                    ',
        'type'        => 'textarea',
        'section'     => 'footer_options',
        'operator'    => 'and'
    ),
    array(
        'id'        => 'terms_display',
        'section'     => 'footer_options',
        'label'     => __( 'Terms and condition display', 'travellers' ),
        'type'        => 'on-off',
        'std'         => 'on'
    ),
    array(
        'id'        => 'terms_title',
        'section'     => 'footer_options',
        'label'     => __( 'Terms and condition title', 'travellers' ),
        'type'        => 'text',
        'std'         => 'Terms & Conditions'
        ),
    array(
        'id'        => 'terms_details',
        'section'     => 'footer_options',
        'label'     => __( 'Terms and condition details', 'travellers' ),
        'type'        => 'textarea',
        'std'         => '
                        <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id turpis sit amet enim rutrum placerat vel sit amet risus. Nulla ultricies dolor quis quam scelerisque aliquet. Praesent fermentum in lectus non lobortis. Sed sit amet tincidunt libero. Suspendisse euismod metus lobortis, ultrices augue id, dictum elit. Proin vehicula euismod nisl id iaculis. Nunc ac nisi ex. Sed nisl libero, accumsan vel fringilla quis, accumsan sit amet sem.</p>
                    '
    ),
    array(
             'id' => 'backtotop',
            'label' => __( 'Back to top Display','travellers' ),
            'desc' => __( 'Display in backtotop','travellers' ),
            'std' => 'on',
            'type' => 'on-off',
            'section' => 'footer_options',
        ),
    );

	return apply_filters( 'travellers_footer_options', $options );
}  
?>