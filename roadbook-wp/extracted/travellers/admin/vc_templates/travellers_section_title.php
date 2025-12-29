<?php
extract(shortcode_atts(array(
    'title' => '{TOUR} ITINERARY',
    'desc' => 'Highlights Of Your Journey',
    'align' => 'center',
), $atts));

?>
<h1 class="text-<?php echo esc_attr($align); ?>">
    <?php echo travellers_parse_text($title, array('tag' => 'span')); ?>
    <small><?php echo esc_attr($desc); ?></small>
</h1>    