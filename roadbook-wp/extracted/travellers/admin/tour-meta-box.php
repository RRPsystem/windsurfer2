<?php
/**
 * Initialize the custom Meta Boxes. 
 */
add_action( 'admin_init', 'travellers_tour_meta_boxes' );

/**
 * Meta Boxes demo code.
 *
 * You can find all the available option types in demo-theme-options.php.
 *
 * @return    void
 * @since     2.0
 */
function travellers_tour_meta_boxes() {
  
  /**
   * Create a custom meta boxes array that we pass to 
   * the OptionTree Meta Box API Class.
   */
  $tour_meta_box = array(
    'id'          => 'travellers_tour_meta_box',
    'title'       => __( 'Tour information', 'travellers' ),
    'desc'        => '',
    'pages'       => array( 'tour' ),
    'context'     => 'normal',
    'priority'    => 'low',
    'fields'      => array(
      
      array(
        'label'       => 'Starting from',
        'id'          => 'date',
        'type'        => 'date-picker',
        'std'        => get_the_date(),
        'desc'        => '',
        'operator'    => 'and',
        'condition'   => ''
      ),
      array(
        'label'       => 'Duration',
        'id'          => 'duration',
        'type'        => 'text',
        'std'        => '7 days & 6 nights',
        'desc'        => '',
        'operator'    => 'and',
        'condition'   => ''
      ),
      
    )
  );

  /**
   * Create a custom meta boxes array that we pass to 
   * the OptionTree Meta Box API Class.
   */
  $location_meta_box = array(
    'id'          => 'travellers_location_meta_box',
    'title'       => __( 'Location information', 'travellers' ),
    'desc'        => '',
    'pages'       => array( 'location' ),
    'context'     => 'normal',
    'priority'    => 'high',
    'fields'      => array(
      
      array(
        'label'       => 'Sub title',
        'id'          => 'subtitle',
        'type'        => 'text',
        'std'        => '',
        'desc'        => 'e.g: Province / Snow Mountain',
        'operator'    => 'and',
        'condition'   => ''
      ),
      array(
        'label'       => __( 'Location features', 'travellers' ),
        'id'          => 'features',
        'type'        => 'list-item',
        'desc'        => '',
        'settings'    => array(
            array(
              'label'       => 'Small details',
              'id'          => 'desc',
              'type'        => 'text',
              'desc' => '',
            ),
            array(
                'id'        => 'icon',
                'label'     => __( 'Icon', 'travellers' ),
                'type'        => 'iconpicker',
            ),
          ),
        'std'         => array(
            array(
              'title' => 'Tourist Attraction:',
              'desc' => 'Sunrise Point of Riverview',
              'icon' => 'fa-map-marker'
              ),
            array(
              'title' => 'Best Buy of this Place:',
              'desc' => 'Handmade Wooden Accessories',
              'icon' => 'fa-shopping-cart'
              ),
            array(
              'title' => 'Food Speciality:',
              'desc' => 'Sushie',
              'icon' => 'fa-cutlery'
              ),
            array(
              'title' => 'Activity:',
              'desc' => 'Two Hours Boating Ride',
              'icon' => 'fa-street-view'
              ),
          )
      ),
      
    )
  );



  $pricing_meta_box = array(
    'id'          => 'travellers_pricing_meta_box',
    'title'       => __( 'Pricing information', 'travellers' ),
    'desc'        => '',
    'pages'       => array( 'product' ),
    'context'     => 'normal',
    'priority'    => 'high',
    'fields'      => array(
      array(
          'id' => 'pricing_type',
          'label' => __('Pricing display', 'travellers'),
          'desc' => '',
          'std' => 'on',
          'type' => 'on-off',
          'condition' => '',
          'operator' => 'and'
      ),
      array(
          'id' => 'pricing_after_price',
          'label' => __('After price text', 'travellers'),
          'desc' => '',
          'std' => '/persion',
          'type' => 'text',
          'condition' => '',
          'operator' => 'and'
      ),       
      array(
        'label'       => __( 'Pricing features', 'travellers' ),
        'id'          => 'features',
        'type'        => 'list-item',
        'desc'        => '',
        'condition' => 'pricing_type:is(on)',
        'settings'    => array(
            array(
              'label'       => 'Avialibility',
              'id'          => 'avialibility',
              'type'        => 'text',
              'desc' => 'Optional details',
            ),
          ),
        'std'         => array(
            array(
              'title' => 'Lorem ipsum dolor sit amet'
              ),
            array(
              'title' => 'consectetur adipiscing elit'
              ),
            array(
              'title' => 'Sed scelerisque'
              ),
            array(
              'title' => 'purus sit amet elementum blandit'
              ),
            array(
              'title' => 'sem arcu egestas quam'
              ),
            array(
              'title' => 'eget malesuada sem libero eu ante'
              ),
            array(
              'title' => 'Duis nec ultricies enim.'
              ),
          )
      ),
      array(
          'id' => 'pricing_button_text',
          'label' => __('Pricing Button text', 'travellers'),
          'desc' => '',
          'std' => 'Book Now',
          'type' => 'text',
          'condition' => '',
          'operator' => 'and'
      ), 
    )
  );

  
  /**
   * Register our meta boxes using the 
   * ot_register_meta_box() function.
   */
  if ( function_exists( 'ot_register_meta_box' ) ){
    ot_register_meta_box( $tour_meta_box );
    ot_register_meta_box( $location_meta_box );
    ot_register_meta_box( $pricing_meta_box );
  }

}