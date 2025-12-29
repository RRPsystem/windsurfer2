<?php
extract(shortcode_atts(array(
    'image' => TRAVELLERS_URI.'/images/company-green.png',
    'icons' => '',
), $atts));
$iconsArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($icons) : array();

$args = array(
    'footer_social_links' => $iconsArr,
    'copyright_text' => $content
);
get_template_part( 'footer/footer', '', $args );
?>

