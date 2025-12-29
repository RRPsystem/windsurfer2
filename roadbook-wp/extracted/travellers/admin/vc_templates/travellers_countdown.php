<?php
extract(shortcode_atts(array(
	'style' => 'style1',
    'departure_on_title' => 'DEPARTURE ON',
    'departure_on' => '25 JAN {2023}',
    'event_datetime' => 'Jan 25, 2023 12:00',
), $atts));
?>
<?php if( $style == 'style1' ): ?>
<div class="counter">
    <div class="date BGdark"><?php echo esc_attr($departure_on_title); ?><h4><?php echo travellers_parse_text($departure_on, array('tag'=> 'strong')); ?></h4></div>
    <div id="timer-<?php echo uniqid(); ?>" class="timerwrap" data-date="<?php echo esc_attr($event_datetime) ?>"></div>
    <div class="clear"></div>
</div>
<?php else: ?> 
<div class="info-box option">
	<div class="container">
    <div class="counter">
        <div class="date BGdark"><?php echo esc_attr($departure_on_title); ?><h4><?php echo travellers_parse_text($departure_on, array('tag'=> 'strong')); ?></h4></div>
        <div id="timer-<?php echo uniqid(); ?>" class="timerwrap" data-date="<?php echo esc_attr($event_datetime) ?>"></div>
        <div class="clear"></div>
    </div>
    </div>
</div><!-- ::: END COUNTER ::: -->
<?php endif; ?>
