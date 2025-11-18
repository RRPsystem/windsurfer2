<?php
/**
 * The Template for displaying all single products.
 *
 * Override this template by copying it to yourtheme/woocommerce/single-product.php
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     1.6.4
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
	
get_header(); 

?>

<section id="wp-main-content" class="clearfix main-page product-single-page">
	 
	<?php 
		if(!class_exists('GVA_Layout_Frontend')){
			do_action('woocommerce_before_main_content'); 
		}

	 	while(have_posts()) : the_post();
			wc_get_template_part('content', 'single-product');
		endwhile; 

		if(!class_exists('GVA_Layout_Frontend')){
			do_action('woocommerce_after_main_content'); 
		 	echo '<div class="related-section">';
				echo '<div class="container">';
				  woocommerce_output_related_products();
				echo '</div>';
		 	echo '</div>';
		}
	 ?>

</section>

<?php get_footer(); ?>