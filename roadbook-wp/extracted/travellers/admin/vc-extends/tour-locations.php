<?php
/**
 * The VC Functions
 */
function travellers_tour_locations_settings_vc() {
    vc_map(
    array(
      'name'       => __( 'Tour Itinerary', 'travellers' ),
        'base' => 'travellers_tour_locations',
        'description' => 'Display tour locations',
        'class' => 'travellers-vc',
        'icon' => 'travellers-icon',
        'category' => __('Travellers', 'travellers'),
        'params' => array(   
            array(
              'type' => 'dropdown',
              'heading' => __( 'Display style', 'travellers' ),
              'param_name' => 'style',
              'value' => array(
                __( 'Default', 'travellers' ) => 'style1',
                __( 'Carousel', 'travellers' ) => 'style2',      
              ),
              'admin_label' => true,
            ), 
            array(
              'type' => 'dropdown',
              'heading' => __( 'Place info Background', 'travellers' ),
              'param_name' => 'placeinfo_bg',
              'value' => array(
                __( 'Dark', 'travellers' ) => 'dark',
                __( 'light', 'travellers' ) => 'white', 
                __( 'Gray', 'travellers' ) => 'light',     
              ),
              'dependency' => array(
                                'element' => 'style',
                                'value' => array('style2',)
                            )
            ),          
            // params group
            array(
                'type' => 'param_group',
                'value' => '',
                'heading' => __( 'Days and Locations', 'travellers' ),
                'param_name' => 'locations',
                'value' => '',
                'params' => array(
                    array(
                        'type' => 'textfield',
                        'heading' => __('Day', 'travellers'),
                        'param_name' => 'day',
                        'description' => '',
                        'value' => 'Day 1',
                        'admin_label' => true,
                    ),
                    array(
                        'type' => 'perch_select',
                        'value' => travellers_get_posts_dropdown(array('post_type' => 'location', 'posts_per_page' => -1)),
                        'heading' => 'Location',
                        'param_name' => 'location',
                        'admin_label' => true,
                    ),
                    array(
                        'type' => 'textfield',
                        'heading' => __('Tour delight', 'travellers'),
                        'param_name' => 'delight',
                        'description' => 'Leave blank to avoid this field',
                        'value' => '{TOUR DELIGHT :} Dinner with Ice Cream Treat',
                    ),
                   
                ),
            ),

        ),
           
    )
    );
}
add_action( 'vc_before_init', 'travellers_tour_locations_settings_vc');
class WPBakeryShortCode_Travellers_tour_locations extends WPBakeryShortCode {
}