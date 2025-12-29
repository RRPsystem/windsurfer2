<?php

extract(shortcode_atts(array(

    'shortcode' => '',

), $atts));



?>
<div class="subscribe">
<?php echo do_shortcode($shortcode); ?>
</div>