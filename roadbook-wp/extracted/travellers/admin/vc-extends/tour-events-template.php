<?php
/**
 * The VC Functions
 */
function travellers_tour_events_settings_vc() {
    vc_map(
    array(
      'name'       => __( 'Tour events carousel', 'travellers' ),
        'base' => 'travellers_tour_events',
        'class' => 'travellers-vc',
        'icon' => 'travellers-icon',
        'category' => __('Travellers', 'travellers'),
        'params' => array(           
            array(
                'type' => 'perch_select',
                'value' => array('all' => 'All', 'specific' => 'Specific tour'),
                'heading' => 'Tours display',
                'param_name' => 'display',
                'admin_label' => true,
            ),
            // params group
            array(
                'type' => 'param_group',
                'value' => '',
                'heading' => __( 'Tours', 'travellers' ),
                'param_name' => 'tours',
                'value' => '',
                'params' => array(
                    array(
                        'type' => 'perch_select',
                        'value' => travellers_get_posts_dropdown(array('post_type' => 'tour', 'posts_per_page' => -1)),
                        'heading' => 'Tour',
                        'param_name' => 'tour',
                        'admin_label' => true,
                    ),
                   
                ),
                'dependency' => array(
                    'element' => 'display',
                    'value' => 'specific'
                )
            ),

        ),
           
    )
    );
}
add_action( 'vc_before_init', 'travellers_tour_events_settings_vc');
class WPBakeryShortCode_Travellers_tour_events extends WPBakeryShortCode {
}