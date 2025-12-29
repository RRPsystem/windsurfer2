<?php
function travellers_blog_options( $options = array() ){
	$options = array(
    array(
        'id'          => 'blog_options_tab',
        'label'       => __( 'Blog options', 'travellers' ),
        'type'        => 'tab',
        'section'     => 'blog_options',
      ),
        array(
        'id'          => 'blog_title',
        'label'       => __( 'Blog Title', 'travellers' ),
        'desc'        => '',
        'std'         => 'Blog Posts',
        'type'        => 'text',
        'section'     => 'blog_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      ),
    array(
        'id'          => 'excerpt_length',
        'label'       => __( 'Excerpt length', 'travellers' ),
        'desc'        => '',
        'std'         => '55',
        'type'        => 'numeric-slider',
        'section'     => 'blog_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '10,150,5',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      ),
    array(
        'id'          => 'readmore_text',
        'label'       => __( 'Read more text', 'travellers' ),
        'desc'        => '',
        'std'         => 'Read more',
        'type'        => 'text',
        'section'     => 'blog_options',
      ),
		array(
        'id'          => 'blog_layout',
        'label'       => __( 'Blog layout', 'travellers' ),
        'desc'        => '',
        'std'         => 'rs',
        'type'        => 'radio-image',
        'section'     => 'blog_options',
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
            'label'       => __( 'Full width', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/full-width.png'
          ),
          array(
            'value'       => 'ls',
            'label'       => __( 'Left sidebar', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/left-sidebar.png'
          ),
          array(
            'value'       => 'rs',
            'label'       => __( 'Right sidebar', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/right-sidebar.png'
          )
        )
      ),
      array(
        'id'          => 'blog_sidebar',
        'label'       => __( 'Blog Sidebar', 'travellers' ),
        'desc'        => '',
        'std'         => 'sidebar-1',
        'type'        => 'sidebar-select',
        'section'     => 'blog_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => 'blog_layout:not(full)',
        'operator'    => 'and'
      ),
      array(
        'id'          => 'post_options_tab',
        'label'       => __( 'Single post options', 'travellers' ),
        'type'        => 'tab',
        'section'     => 'blog_options',
      ),
      array(
        'id'          => 'single_layout',
        'label'       => __( 'Blog single post layout', 'travellers' ),
        'desc'        => '',
        'std'         => 'rs',
        'type'        => 'radio-image',
        'section'     => 'blog_options',
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
            'label'       => __( 'Full width', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/full-width.png'
          ),
          array(
            'value'       => 'ls',
            'label'       => __( 'Left sidebar', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/left-sidebar.png'
          ),
          array(
            'value'       => 'rs',
            'label'       => __( 'Right sidebar', 'travellers' ),
            'src'         => OT_URL . '/assets/images/layout/right-sidebar.png'
          )
        )
      ),
    array(
        'id'          => 'blog_single_sidebar',
        'label'       => __( 'Single post Sidebar', 'travellers' ),
        'desc'        => '',
        'std'         => 'sidebar-1',
        'type'        => 'sidebar-select',
        'section'     => 'blog_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => 'single_layout:not(full)',
        'operator'    => 'and'
      ),
      array(
        'id'          => 'sticky_post_text',
        'label'       => __( 'Sticky post text', 'travellers' ),
        'desc'        => '',
        'std'         => 'Featured post',
        'type'        => 'text',
        'section'     => 'blog_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      ),
      array(
            'id'          => 'single_post_title_tag',
            'label'       => esc_attr__( 'Single post title tag', 'travellers' ),
            'std'         => 'h2',
            'type'        => 'select',           
            'section'     => 'blog_options',
            'operator'    => 'and',
            'choices'     => array(                 
              array(
                'value'       => 'h1',
                'label'       => esc_attr__( 'H1', 'travellers' ),
              ),
              array(
                'value'       => 'h2',
                'label'       => esc_attr__( 'H2', 'travellers' ),
              ),
              array(
                'value'       => 'h3',
                'label'       => esc_attr__( 'H3', 'travellers' ),
              ),
              array(
                'value'       => 'h4',
                'label'       => esc_attr__( 'H4', 'travellers' ),
              ),
              array(
                'value'       => 'h5',
                'label'       => esc_attr__( 'H5', 'travellers' ),
              ),
              array(
                'value'       => 'h6',
                'label'       => esc_attr__( 'H6', 'travellers' ),
              )
            )
        ),
        array(
            'id'          => 'single_post_title_tag_size',
            'label'       => esc_attr__( 'Single post title tag size', 'travellers' ),
            'std'         => 'Initial',
            'type'        => 'select',           
            'section'     => 'blog_options',
            'operator'    => 'and',
            'choices'     => array(                 
              array(
                'value'       => 'entry-title',
                'label'       => esc_attr__( 'Default', 'travellers' ),
              ),
              array(
                'value'       => 'xl',
                'label'       => esc_attr__( 'Extra large', 'travellers' ),
              ),
              array(
                'value'       => 'lg',
                'label'       => esc_attr__( 'Large', 'travellers' ),
              ),
              array(
                'value'       => 'md',
                'label'       => esc_attr__( 'Medium', 'travellers' ),
              ),
              array(
                'value'       => 'sm',
                'label'       => esc_attr__( 'Small', 'travellers' ),
              ),
              array(
                'value'       => 'xs',
                'label'       => esc_attr__( 'Extra small', 'travellers' ),
              )
            )
        ),
      array(
        'id'          => 'related_posts',
        'label'       => __( 'Show Related posts', 'travellers' ),
        'desc'        => '',
        'std'         => 'on',
        'type'        => 'on-off',
        'section'     => 'blog_options',
        'condition'   => '',
        'operator'    => 'and'
      ),
      array(
        'id'          => 'related_posts_title',
        'label'       => __( 'Related posts title', 'travellers' ),
        'desc'        => '',
        'std'         => 'Related Posts',
        'type'        => 'text',
        'section'     => 'blog_options',
        'condition'   => 'related_posts:is(on)',
        'operator'    => 'and'
      ),
       array(
          'id'          => 'total_related_posts',
          'label'       => __( 'Related posts display maximum', 'travellers' ),
          'desc'        => '',
          'std'         => '3',
          'type'        => 'numeric-slider',
          'section'     => 'blog_options',
          'min_max_step'=> '1,12,1',
          'condition'   => 'related_posts:is(on)',
          'operator'    => 'and' 
        ),
    );

	return apply_filters( 'travellers_blog_options', $options );
}  


function travellers_event_options( $options = array() ){
  $post_types = [
    'tour' => 'Tour',
    'location' => 'Location',
  ];

  $options = [];
  foreach ($post_types as $post_type => $label) {
    $new_options = array(
      array(
          'id'          => $post_type.'_options_tab',
          'label'       => sprintf(__( '%s options', 'travellers' ), $label),
          'type'        => 'tab',
          'section'     => 'event_options',
        ), 
        array(
        'id'          => $post_type.'_title',
        'label'       => sprintf(__( '%s Archive title', 'travellers' ), $label),
        'desc'        => '',
        'std'         => $label,
        'type'        => 'text',
        'section'     => 'event_options',
        'rows'        => '',
        'post_type'   => '',
        'taxonomy'    => '',
        'min_max_step'=> '',
        'class'       => '',
        'condition'   => '',
        'operator'    => 'and'
      ),    
      array(
          'id'          => $post_type.'_layout',
          'label'       => sprintf(__( '%s Archive Layout', 'travellers' ), $label),
          'desc'        => '',
          'std'         => 'rs',
          'type'        => 'radio-image',
          'section'     => 'event_options',
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
              'label'       => __( 'Full width', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/full-width.png'
            ),
            array(
              'value'       => 'ls',
              'label'       => __( 'Left sidebar', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/left-sidebar.png'
            ),
            array(
              'value'       => 'rs',
              'label'       => __( 'Right sidebar', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/right-sidebar.png'
            )
          )
        ),
        array(
          'id'          => $post_type.'_sidebar',
          'label'       => sprintf(__( '%s Archive Sidebar', 'travellers' ), $label),
          'desc'        => '',
          'std'         => 'sidebar-1',
          'type'        => 'sidebar-select',
          'section'     => 'event_options',
          'rows'        => '',
          'post_type'   => '',
          'taxonomy'    => '',
          'min_max_step'=> '',
          'class'       => '',
          'condition'   => $post_type.'_layout:not(full)',
          'operator'    => 'and'
        ),
        array(
          'id'          => $post_type.'_single_layout',
          'label'       => sprintf(__( 'Single %s layout', 'travellers' ), $label),
          'desc'        => '',
          'std'         => 'rs',
          'type'        => 'radio-image',
          'section'     => 'event_options',
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
              'label'       => __( 'Full width', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/full-width.png'
            ),
            array(
              'value'       => 'ls',
              'label'       => __( 'Left sidebar', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/left-sidebar.png'
            ),
            array(
              'value'       => 'rs',
              'label'       => __( 'Right sidebar', 'travellers' ),
              'src'         => OT_URL . '/assets/images/layout/right-sidebar.png'
            )
          )
        ),
      array(
          'id'          => $post_type.'_single_sidebar',
          'label'       => sprintf(__( 'Single %s Sidebar', 'travellers' ), $label),
          'desc'        => '',
          'std'         => 'sidebar-1',
          'type'        => 'sidebar-select',
          'section'     => 'event_options',
          'rows'        => '',
          'post_type'   => '',
          'taxonomy'    => '',
          'min_max_step'=> '',
          'class'       => '',
          'condition'   => $post_type.'_single_layout:not(full)',
          'operator'    => 'and'
        ),
        
      );

    $options = array_merge($options, $new_options);
  }
  

  return apply_filters( 'travellers_event_options', $options );
}