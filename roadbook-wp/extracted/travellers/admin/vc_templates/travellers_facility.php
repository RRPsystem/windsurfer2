<?php

extract(shortcode_atts(array(

	'image' => TRAVELLERS_URI.'/images/accomodation.jpg',
    'icon' => 'fa fa-building-o',
    'title' => 'Accomodation',
    'subtitle' => 'Pellentesque tincidunt non molestie',

), $atts));



?>



<div class="pic_box">

    <h4><i class="<?php echo esc_attr($icon); ?> theme-clr"></i> <?php echo esc_attr($title); ?></h4>

    <figure>

        <div><img src="<?php echo esc_url($image) ?>" alt="<?php echo esc_attr($title); ?>" class="img-responsive"></div>

        <figcaption>

            <h5 class="theme-clr"><?php echo esc_attr($subtitle); ?></h5>

            <p><?php echo do_shortcode($content); ?></p>

        </figcaption>

    </figure>

</div>