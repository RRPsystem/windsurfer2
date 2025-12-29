<?php

extract(shortcode_atts(array(

    'type' => 'product',
    'pricing_table' => '',
    'title' => 'Package-1',
    'unit' => '$',
    'price' => '29',
    'perunit' => '/persion',
    'features' => '',
    'button_text' => 'Book now',
    'button_link' => '#',
    'eventbriteid' => '18432753863',
    'event_title' => 'Register Now {/ dont mıss event!}',
    'shortcode' => '',
    'contact_title' => 'Welcome to our booking',
    'modal_bg' => TRAVELLERS_URI.'/images/places/01.jpg',

), $atts));

if( $type != 'product' ):

	$id = uniqid();

	$features_arr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($features) : array();

		?>

		<div class="price-list">

			<div class="pricing-table-default text-center">

	            <div class="pricing-head">

	                <h5><?php echo esc_attr($title) ?></h5>

	                <span class="price"><sup><?php echo esc_attr($unit) ?></sup><span class="price-digit"><?php echo esc_attr($price) ?></span><br><?php echo esc_attr($perunit) ?></span>

	            </div>

	            <?php if( !empty($features_arr) ): ?>

	            <div class="pricing-detail">

	                <ul class="pricing-list ">

	                	<?php  

	                	foreach ($features_arr as $key => $value) {

	                		echo '<li>'.esc_attr($value['feature']).'</li>';

	                	}

	                	?>

	                </ul> 

	            </div>

	        	<?php endif; ?>



	        	<?php if( $type == 'contact_form' ): ?>

	        		<?php 

					$args = array(

					    'id' => $id,

					    'shortcode' => $shortcode,

					    'title' => $contact_title,

					    'bg' => $modal_bg

					    );

					travellers_contact_modal($args); 

					?>

					<a data-toggle="modal" href="#booking-popup-<?php echo esc_attr($id) ?>" class="btn btn-default"><?php echo esc_attr($button_text) ?></a>

	        	<?php endif; ?>	



	        	<?php if( $type == 'eventbrite' ): ?>

	            <a data-toggle="modal" href="#event-brite-<?php echo esc_attr($id) ?>" class="btn btn-default"><?php echo esc_attr($button_text) ?></a>

	            	<?php 

					$args = array(

					    'id' => $id,

					    'title' => $event_title,

					    'eid' => $eventbriteid

					    );

					travellers_event_modal($args); 

					?>

	            <?php endif; ?>	



	            <?php if( $type == 'custom' ): ?>

	            	<a href="<?php echo esc_url($button_link); ?>" target="_blank" class="btn btn-default"><?php echo esc_attr($button_text) ?></a>

	            <?php endif; ?>	



	        </div><!-- /.pricing-table-wrapper -->

        </div>

	<?php

else:

	$args = array();

	$args['post__in'] = array($pricing_table);

	$args['post_type'] = 'product';





	// The Query

	$the_query = new WP_Query( $args );



	// The Loop

	if ( $the_query->have_posts() ) :

		echo '<div class="price-list">';

		while ( $the_query->have_posts() ) :

			$the_query->the_post();

			

			echo '<div class="price-slider">';

			get_template_part('templates/pricing', 'table');

			echo '</div>';

	        

		endwhile;

		echo '</div>';

		/* Restore original Post Data */

		wp_reset_postdata();

	else :

		// no posts found

	endif;

endif;

?>

