<?php

extract(shortcode_atts(array(

	'style' => 'style1',
    'icon' => 'fa fa-heartbeat',
    'title' => 'Health Requirements',

), $atts));



?>

<?php if( $style == 'style1' ): ?>

	<div class="tips">

	    <i class="<?php echo esc_attr($icon) ?> round"></i>

	    <h5><?php echo esc_attr($title); ?></h5>

	    <p><?php echo do_shortcode($content); ?></p>

	</div>
<?php elseif( $style == 'style3' ): ?>	

	<div class="text-center">
        <i class="<?php echo esc_attr($icon) ?> fa-5x theme-clr"></i>
        <h2 class="title-1"><?php echo esc_attr($title); ?></h2>
        <p><?php echo do_shortcode($content); ?></p>
    </div>    
                

<?php else: ?>

	<div class="imptips">

		<h5><i class="<?php echo esc_attr($icon) ?> theme-clr"></i><?php echo esc_attr($title); ?></h5>

		<p><?php echo do_shortcode($content); ?></p>

	</div>

<?php endif; ?>	

