<?php
/**
 * The VC Functions
 */
add_action( 'vc_before_init', 'travellers_travelinfo_shortcode_vc');
function travellers_travelinfo_shortcode_vc() {	
	
	vc_map( 
		array(
			'icon' => 'travellers-icon',
			'name' => __('Travel-Info Carousel', 'travellers'),
			'base' => 'travellers_travelinfo',
			'class' => 'travellers-vc',
			'category' => __('Travellers', 'travellers'),
			'description' => 'flight, train, hotel & resturant info',
			'params' => array(
				
				// params group
	            array(
	                'type' => 'param_group',
	                'heading' => __( 'Travel information', 'travellers' ),
	                'param_name' => 'travelinfo',
	                'value' => urlencode( json_encode( array(
						                array(	
						                	'icon' => 'fas fa-plane',					                    
						                    'title' => 'Flight Information',				                    
						                    'subtitle' => 'Departure and Arrival',
						                    'type' => 'flight',
						                    'departure' => 'DEPARTURE: {25 JAN, 2022}',
						                    'departure_form1' => '{JFK} New York, NY',
						                    'departure_at1' => '09.30 AM',
						                    'arrival_to1' => '{LAX} Los Angeles',
						                    'arrival_at1' => '09.30 AM',
						                    'arrival' => 'ARRIVAL: {30 JAN, 2022}',
						                    'departure_form2' => '{LAX} Los Angeles',
						                    'departure_at2' => '09.30 AM',
						                    'arrival_to2' => '{JFK} New York, NY',
						                    'arrival_at2' => '09.30 AM',
						                ),
						                array(	
						                	'icon' => 'fas fa-train',					                    
						                    'title' => 'TRAIN Information',				                    
						                    'subtitle' => 'Departure and Arrival',
						                    'type' => 'train',
						                    'departure' => 'DEPARTURE: {25 JAN, 2022}',
						                    'departure_form1' => '{Lorem Sta} Avenue Thiers BP 1463 06008 Nice Cedex 1',
						                    'departure_at1' => '09.30 AM',
						                    'arrival_to1' => '{Lorem Sta} Avenue Thiers BP 1463 06008 Nice Cedex 1',
						                    'arrival_at1' => '09.30 AM',
						                    'arrival' => '>ARRIVAL: {30 JAN, 2022}',
						                    'departure_form2' => '{Lorem Sta} Avenue Thiers BP 1463 06008 Nice Cedex 1',
						                    'departure_at2' => '09.30 AM',
						                    'arrival_to2' => '{Lorem Sta} Avenue Thiers BP 1463 06008 Nice Cedex 1',
						                    'arrival_at2' => '09.30 AM',
						                ),
						                array(		
						                	'icon' => 'fas fa-building',				                    
						                    'title' => 'HOTEL Information',				                    
						                    'subtitle' => 'Accomodation and Dining',
						                    'type' => 'accomodation',
						                    'image' => TRAVELLERS_URI.'/images/hotel.jpg',
						                    'name' => 'Luxury Hotel',
						                    'desc' => 'Lorem ipsum dolor sit amet, consectetur adipi scing elit. Donec feugiat iaculis tortor molestie. Nunc imperdiet commodo nunc, a porta eros iaculis sit amet iaculis tortor molestie iaculis tortor molestie.',
						                    'website' => 'www.grandhotelinparis.com',
						                ),
						                array(	
						                	'icon' => 'fas fa-ship',					                    
						                    'title' => 'Cruise Information',				                    
						                    'subtitle' => 'Departure and Arrival',
						                    'type' => 'cruise',
						                    'name' => 'Royal Cruise 1234',
						                    'departure' => 'DEPARTURE: {25 JAN, 2022}',
						                    'departure_at1' => '{09.30} Royal Port, USA',
						                    'arrival_at1' => '{02.30} Royal Port, UK',
						                    'name2' => 'Royal Cruise 5678',
						                    'arrival' => '>ARRIVAL: {30 JAN, 2022}',
						                    'departure_at2' => '{14.30} Royal Port, UK',
						                    'arrival_at2' => '{03.30} Royal Port, USA',
						                ),
						                array(
						                	'icon' => 'fas fa-utensils',						                    
						                    'title' => 'HOTEL Information',				                    
						                    'subtitle' => 'Accomodation and Dining',
						                    'type' => 'accomodation',
						                    'image' => TRAVELLERS_URI.'/images/restaurant.jpg',
						                    'name' => 'SpiceHub',
						                    'desc' => 'Lorem ipsum dolor sit amet, consectetur adipi scing elit. Donec feugiat iaculis tortor molestie. Nunc imperdiet commodo nunc, a porta eros iaculis sit amet iaculis tortor molestie iaculis tortor molestie.',
						                    'website' => 'www.grandhotelinparis.com',
						                ),
						                ) ) ),
	                'params' => array( 
	                	travellers_vc_icon_set('fontawesome', 'icon', '', ''  ), 
	                	array(
							'type' => 'textfield',
							'heading' => __('Title', 'travellers'),
							'param_name' => 'title',
							'description' => '',
							'value' => '',
							'admin_label' => true,
						),
						array(
							'type' => 'textfield',
							'heading' => __('Sub-title', 'travellers'),
							'param_name' => 'subtitle',
							'description' => '',
							'value' => '',
						),	
						array(
							'type' => 'dropdown',
							'heading' => __('Information type', 'travellers'),
							'param_name' => 'type',
							'description' => '',
							'value' => array(
									'Accomodation'  => 'accomodation',
									'Flight' => 'flight',
								  'Train/Bus'  => 'train',
								  'Cruise'  => 'cruise',					            
								),
							'admin_label' => true,
						  ),
				        array(
							'type' => 'textfield',
							'heading' => __('Name', 'travellers'),
							'param_name' => 'name',
							'description' => '',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('accomodation', 'train', 'cruise')
			                )
						),			       
				        array(
							'type' => 'textfield',
							'heading' => __('Departure', 'travellers'),
							'param_name' => 'departure',
							'description' => 'Example: DEPARTURE: {25 JAN, 2022}',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
								
						array(
							'type' => 'textfield',
							'heading' => __('Departure From #1', 'travellers'),
							'param_name' => 'departure_form1',
							'description' => 'Example: {JFK} New York, NY',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Departing At #1', 'travellers'),
							'param_name' => 'departure_at1',
							'description' => 'Example: 09.30 AM',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Arrival to #1', 'travellers'),
							'param_name' => 'arrival_to1',
							'description' => 'Example: {LAX} Los Angeles',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Arriving At #1', 'travellers'),
							'param_name' => 'arrival_at1',
							'description' => 'Example: 09.30 AM',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),						 
						array(
							'type' => 'textfield',
							'heading' => __('Arrival', 'travellers'),
							'param_name' => 'arrival',
							'description' => 'Example: ARRIVAL: {30 JAN, 2022}',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Name #2', 'travellers'),
							'param_name' => 'name2',
							'description' => '',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train')
			                )
						),	
						array(
							'type' => 'textfield',
							'heading' => __('Departure From #2', 'travellers'),
							'param_name' => 'departure_form2',
							'description' => 'Example: {LAX} Los Angeles',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Departing At #2', 'travellers'),
							'param_name' => 'departure_at2',
							'description' => 'Example: 09.30 AM',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Arrival to #2', 'travellers'),
							'param_name' => 'arrival_to2',
							'description' => 'Example: {JFK} New York, NY, ',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Arriving At #2', 'travellers'),
							'param_name' => 'arrival_at2',
							'description' => 'Example: 09.30 AM',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('train', 'cruise', 'flight')
			                )
						),	
						array(
			                'type' => 'image_upload',
			                'value' => '',
			                'heading' => 'Accomodation image',
			                'param_name' => 'image',
			                'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('accomodation')
			                )
			            ),
			            array(
							'type' => 'textarea',
							'heading' => __('Description', 'travellers'),
							'param_name' => 'desc',
							'description' => '',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('accomodation')
			                )
						),
						array(
							'type' => 'textfield',
							'heading' => __('Website', 'travellers'),
							'param_name' => 'website',
							'description' => '',
							'value' => '',
							'dependency' => array(
			                    'element' => 'type',
			                    'value' => array('accomodation')
			                )
						),
			            
	                   
	                )
	            ),
			)
		) 
	);
	
}
class WPBakeryShortCode_Travellers_travelinfo extends WPBakeryShortCode {
}