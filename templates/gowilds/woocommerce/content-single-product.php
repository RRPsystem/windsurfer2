<?php
/**
 * The template for displaying product content in the single-product.php template
 *
 * Override this template by copying it to yourtheme/woocommerce/content-single-product.php
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     3.6.0
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

global $product;

	/**
	 * woocommerce_before_single_product hook
	 *
	 * @hooked wc_print_notices - 10
	*/	
?>

<?php
	 if ( post_password_required() ) {
	 	echo get_the_password_form();
	 	return;
	 }
?>

<?php 
	if(class_exists('GVA_Layout_Frontend')){
		echo '<div class="product-single-main">';
			echo '<div class="product-single-inner">';
				do_action('gowilds/layouts/single/product');
			echo '</div>';
		echo '</div>';
	}else{ 
		wc_get_template_part('content', 'single-product-default');
	} 
?>

