<?php
function travellers_social_options( $options = array() ){
	$options = array(
		array(
        'id'          => 'header_social_icons',
        'label'       => __( 'Header social icons', 'travellers' ),
        'desc'        => '',
        'std'         => array(
                array(
                    'title' => 'Facebook',
                    'icon'  => 'fa|fa-facebook',
                    'link'  => '#'
                    ),
                array(
                    'title' => 'Twitter',
                    'icon'  => 'fa|fa-twitter',
                    'link'  => '#'
                    ),
                array(
                    'title' => 'Heart',
                    'icon'  => 'fa|fa-heart',
                    'link'  => '#'
                    ),
                array(
                    'title' => 'Skype',
                    'icon'  => 'fa|fa-skype',
                    'link'  => '#'
                    ),
                array(
                    'title' => 'Linkedin',
                    'icon'  => 'fa|fa-linkedin',
                    'link'  => '#'
                    ),
            ),
        'type'        => 'list-item',
        'section'     => 'social_options',
        'condition'   => '',
        'operator'    => 'and',
        'settings'    => array(           
          array(
            'id'          => 'icon',
            'label'       => __( 'Icons', 'travellers' ),
            'desc'        => '',
            'std'         => '',
            'type'        => 'iconpicker',    
            'condition'   => '',
            'operator'    => 'and'
          ),
          array(
            'id'          => 'link',
            'label'       => __( 'Link', 'travellers' ),
            'desc'        => '',
            'std'         => '',
            'type'        => 'text',    
            'condition'   => '',
            'operator'    => 'and'
          )
        )
      ),
    );

	return apply_filters( 'bohopeople_theme_text', $options );
}   
?>