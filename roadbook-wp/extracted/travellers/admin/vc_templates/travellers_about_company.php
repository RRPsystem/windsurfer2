<?php
extract(shortcode_atts(array(
    'image' => TRAVELLERS_URI.'/images/company-green.png',
    'icons' => '',
), $atts));
$iconsArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($icons) : array();
?>
<div class="row">

    <div class="col-md-6 col-sm-6 col-xs-12">
        <img class="img-responsive" src="<?php echo esc_url($image)  ?>" width="350" height="142" alt="<?php bloginfo( 'name' ); ?>" />
        <?php if( !empty($iconsArr) ): ?>
        <ul class="list-inline social">
            <?php foreach ($iconsArr as $key => $value) : extract($value); ?>
                    <li><a href="<?php echo esc_url($link) ?>" title="<?php echo esc_attr($title) ?>" target="_blank"><i class="<?php echo esc_attr($icon) ?>"></i></a></li>
            <?php endforeach; ?>
        </ul>
        <?php endif; ?>
    </div>
    <div class="col-md-6 col-sm-6 col-xs-12">
        <?php echo force_balance_tags(do_shortcode($content)); ?>
    </div><div class="clear"></div>
</div>    