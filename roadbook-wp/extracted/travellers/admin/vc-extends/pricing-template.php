<?php
/**
 * The VC Functions
 */
function travellers_pricing_carousel_settings_vc() {
    vc_map(
    array(
      'name'       => __( 'Pricing tables', 'travellers' ),
        'base' => 'travellers_pricing_list',
        'class' => 'travellers-vc',
        'icon' => 'travellers-icon',
        'category' => __('Travellers', 'travellers'),
        'params' => array(   
            array(
                'type' => 'perch_select',
                'value' => array('product' => 'Product', 'eventbrite' => 'Event brite', 'contact_form' => 'Contact form', 'custom' => 'Custom link' ),
                'heading' => 'Pricing tables type',
                'param_name' => 'type',
                'admin_label' => true,
            ), 
            array(
                'type' => 'perch_select',
                'value' => travellers_get_posts_dropdown(array('post_type' => 'product', 'posts_per_page' => -1)),
                'heading' => 'Pricing table',
                'param_name' => 'pricing_table',
                'dependency' => array(
                    'element' => 'type',
                    'value' => 'product'
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Title', 'travellers'),
                'param_name' => 'title',
                'value' => 'Package-1',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Price unit', 'travellers'),
                'param_name' => 'unit',
                'value' => '$',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Price', 'travellers'),
                'param_name' => 'price',
                'value' => '29',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Price per unit', 'travellers'),
                'param_name' => 'perunit',
                'value' => '/persion',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            // params group
            array(
                'type' => 'param_group',
                'value' => '',
                'heading' => __( 'Features', 'travellers' ),
                'param_name' => 'features',
                'value' => urlencode( json_encode( array(
                        array(
                            'feature' => 'Lorem ipsum dolor sit amet',                                                  
                        ),
                        array(
                            'feature' => 'consectetur adipiscing elit',                                          
                        ),
                        array(
                            'feature' => 'Sed scelerisque',                                            
                        ),
                        array(
                            'feature' => 'purus sit amet elementum blandit',                                            
                        ),
                        array(
                            'feature' => 'sem arcu egestas quam',                                            
                        ),
                        array(
                            'feature' => 'eget malesuada sem libero eu ante',                                            
                        ),
                        array(
                            'feature' => 'Duis nec ultricies enim.',                                            
                        ),
                        ) ) ),
                'params' => array(                    
                   array(
                        'type' => 'textfield',
                        'heading' => __('Feature', 'travellers'),
                        'param_name' => 'feature',
                        'value' => '',
                        'admin_label' => true,
                    ),
                ),
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Button text', 'travellers'),
                'param_name' => 'button_text',
                'value' => 'Book now',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite', 'contact_form', 'custom')
                )
            ),
            array(
                'type' => 'textfield',
                'heading' => __('Button link', 'travellers'),
                'param_name' => 'button_link',
                'value' => '#',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('custom')
                )
            ),
            array(
                'type' => 'textfield',
                'class' => '',
                'heading' => 'Eventbrite ID',
                'param_name' => 'eventbriteid', 
                'value' => '18432753863',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite')
                )
            ),
            array(
                'type' => 'textfield',
                'class' => '',
                'heading' => 'Event title',
                'param_name' => 'event_title', 
                'value' => 'Register Now {/ dont mıss event!}',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('eventbrite')
                )
            ), 
            array(
                'type' => 'image_upload',
                'class' => '',
                'heading' => 'Modal background',
                'param_name' => 'modal_bg', 
                'value' => TRAVELLERS_URI.'/images/places/01.jpg',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('contact_form')
                )
            ), 
            array(
                'type' => 'textfield',
                'class' => '',
                'heading' => 'Contact form 7 title',
                'param_name' => 'contact_title', 
                'value' => 'Welcome to our booking',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('contact_form')
                )
            ), 
            array(
                'type' => 'textfield',
                'class' => '',
                'heading' => 'Contact form 7 shortcode',
                'param_name' => 'shortcode', 
                'value' => '',
                'dependency' => array(
                    'element' => 'type',
                    'value' => array('contact_form')
                )
            ), 

        ),
           
    )
    );
}
add_action( 'vc_before_init', 'travellers_pricing_carousel_settings_vc');
class WPBakeryShortCode_Travellers_pricing_list extends WPBakeryShortCode {
}