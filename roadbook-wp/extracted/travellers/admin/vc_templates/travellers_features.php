<?php

extract(shortcode_atts(array(

    'type' => 'fontawesome',
    'icon_pixden' => '',
    'icon_linecons' => '',
    'icon_entypo' => '',
    'icon_typicons' => '',
    'icon_openiconic' => '',    
    'icon_fontawesome' => 'fa fa-shield',    
    'title' => 'Guarantee to Get License ',
    'desc' => ' Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis bibendum auctor. Phasellus aliquam non nisl sed varius. Sed quis accumsan orci. ',

), $atts));



wp_enqueue_style( 'vc_'.$type );



$icon = 'icon_'.$type;

$icon_value = (!isset($atts[$icon]))? 'fa fa-shield' : $atts[$icon];

?>



<div class="feature-box">

    <div class="feature-icon"> <i class="theme-color <?php echo esc_attr($icon_value) ?>"></i> </div>

    <div class="feature-content">

        <h2 class="title-1 space-bottom-15"> <?php echo esc_attr( $title ) ?> </h2>

        <p><?php echo esc_attr( $desc ); ?></p>

    </div>

</div>