<?php
/**
 * List View Single Event
 * This file contains one event in the list view
 *
 * Override this template in your own theme by creating a file at [your-theme]/tribe-events/list/single-event.php
 *
 * @version 4.6.19
 *
 */
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

$excerpt_words = 20;

// Setup an array of venue details for use later in the template
$venue_details = tribe_get_venue_details();

// The address string via tribe_get_venue_details will often be populated even when there's
// no address, so let's get the address string on its own for a couple of checks below.
$venue_address = tribe_get_address();

// Venue
$has_venue_address = ( ! empty( $venue_details['address'] ) ) ? ' location' : '';

$thumbnail = (isset($thumbnail_size) && $thumbnail_size) ? $thumbnail_size : 'post-thumbnail';

?>

<div class="event-one__single clearfix">
	
	<div class="event-one__wrap">
		<?php echo tribe_event_featured_image( null, $thumbnail ); ?>
		
		<div class="event-one__content">
			<div class="event-one__start-date">
				<?php echo tribe_get_start_date(get_the_ID(), false, 'd'); ?>
				<?php echo tribe_get_start_date(get_the_ID(), false, 'M'); ?>
			</div>
			<div class="event-one__event-meta">
				<span class="event-one__schedule-details">
					<span class="icon"><i class="far fa-clock"></i></span><?php echo tribe_get_start_date(null) ?>
				</span>
			</div>
			<h3 class="event-one__title event-title">
				<?php the_title() ?>
			</h3>
			<div class="event-one__footer">
				<?php 
					if( $venue_details ){
						echo '<span class="event-one__venue-details">';
							echo '<span class="icon"><i class="fas fa-map-marker-alt"></i></span>';
							$address_delimiter = empty( $venue_address ) ? ' ' : ', ';
							echo wp_kses( $venue_details['address'], false);
						echo '</span>'; 
					}
				?>
			</div>
		</div>
	</div>
	<a class="event-one__url" href="<?php echo esc_url( tribe_get_event_link() ); ?>"></a>

</div>