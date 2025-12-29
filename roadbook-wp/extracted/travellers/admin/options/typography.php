<?php
function travellers_typography_options( $options = array() ){
	$options = array(      
     array(
        'id'          => 'travellers_google_fonts',
        'label'       => __( 'Google Fonts', 'travellers' ),
        'desc'        => __( 'The Google Fonts option type will dynamically enqueue any number of Google Web Fonts into the document %1$s. As well, once the option has been saved each font family will automatically be inserted 
          into the %2$s array for the Typography option type.', 'travellers' ),
        'std'         => array(
          array(
            'family'    => 'roboto',
            'variants'  => explode(',', '400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic'),
            'subsets'   => explode( ',', 'latin,greek,greek-ext,vietnamese,cyrillic-ext,latin-ext,cyrillic' )
          )
        ),
        'type'        => 'google-fonts',
        'section'     => 'typography',
        'operator'    => 'and'
      ),
      array(
        'id'          => 'primary_font',
        'label'       => __( 'Primary font', 'travellers' ),
        'desc'        => __( 'It is a global Font setting for whole pages.', 'travellers' ),
        'std'         => array(
          'font-family'    => 'roboto',
         ),
        'type'        => 'typography',
        'section'     => 'typography',
        'operator'    => 'and',      
         
      ),
      array(
        'id'          => 'body',
        'label'       => __( 'Body', 'travellers' ),
        'desc'        => __( 'It is a global Font setting for whole pages.', 'travellers' ),
        'std'         => '',
        'type'        => 'typography',
        'section'     => 'typography',
        'operator'    => 'and',       
         
      ),
      array(
        'id'          => 'h1',
        'label'       => __( 'H1', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'selector'    => 'h1',
        'type'        => 'typography',
        'section'     => 'typography',
        
      ),
      array(
        'id'          => 'h2',
        'label'       => __( 'H2', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'selector'    => 'h2',
        'type'        => 'typography',
        'section'     => 'typography',
        
      ),
      array(
        'id'          => 'h3',
        'label'       => __( 'H3', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'selector'    => 'h3',
        'type'        => 'typography',
        'section'     => 'typography',
      ),
      array(
        'id'          => 'h4',
        'label'       => __( 'H4', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'selector'    => 'h4',
        'type'        => 'typography',
        'section'     => 'typography',
      ),
      array(
        'id'          => 'h5',
        'label'       => __( 'H5', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'typography',
        'section'     => 'typography',
      ),
      array(
        'id'          => 'h6',
        'label'       => __( 'H6', 'travellers' ),
        'desc'        => '',
        'std'         => '',        
        'type'        => 'typography',
        'section'     => 'typography',
      ),
      array(
        'id'          => 'sidebar_title',
        'label'       => __( 'Sidebar title', 'travellers' ),
        'desc'        => '',
        'std'         => '',               
        'type'        => 'typography',
        'section'     => 'typography',
      ),
      array(
        'id'          => 'footer',
        'label'       => __( 'Footer', 'travellers' ),
        'desc'        => '',
        'std'         => '',        
        'type'        => 'typography',
        'section'     => 'typography',
      ),      
      
    );

	return apply_filters( 'travellers_typography_options', $options );
}