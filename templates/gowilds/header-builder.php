<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
*/ 
  	use Elementor\Plugin;
  	$protocol = is_ssl() ? 'https' : 'http';
	$header_id = apply_filters('gowilds_get_header_layout', null );
	$document = Plugin::instance()->documents->get($header_id);
  	$header_position = $document->get_settings('gowilds_header_position');
  	
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
	<meta http-equiv="content-type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="<?php echo esc_attr($protocol) ?>://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class() ?>>
	<?php wp_body_open(); ?>
  <div class="gowilds-page-loading"></div>
	
	<div class="wrapper-page"> <!--page-->
		<?php do_action( 'gowilds_before_header' );  ?>
	 
		<header class="wp-site-header header-builder-frontend header-position-<?php echo esc_attr($header_position) ?>">
			<div class="header_default_screen">
				<div class="header-builder-inner">
					<?php if($header_id && class_exists('GVA_Layout_Frontend')){
						echo '<div class="header-main-wrapper">' .  GVA_Layout_Frontend::getInstance()->element_display($header_id)  . '</div>'; 
					}else{
						get_template_part('header-default');
					}?>
				</div> 
			</div> 
	  </header>

		<?php do_action( 'gowilds_after_header' );  ?>
	 
		<div id="page-content"> <!--page content-->
