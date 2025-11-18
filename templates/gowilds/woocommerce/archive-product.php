<?php
/**
 * The Template for displaying product archives, including the main shop page which is a post type archive.
 *
 * Override this template by copying it to yourtheme/woocommerce/archive-product.php
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     3.4.0
 */

if(!defined('ABSPATH')) exit; // Exit if accessed directly
	get_header();
?>

<section id="wp-main-content" class="clearfix main-page">
	<?php do_action( 'gowilds_before_page_content' ); ?>
	<div class="main-page-content">
		<div class="content-page">      
			<div id="wp-content" class="wp-content clearfix">
				
 				<?php 
 					if(is_shop()){
 						do_action('gowilds_page_breacrumb');
						echo '<div class="container shop-without-layout">';
							echo '<div class="row">';
								echo '<div class="col-12">';
					 				wc_get_template_part('archive', 'content');
					 			echo '</div>';	
					 		echo '</div>';
					 	echo '</div>';		
 					}else{	
						if(class_exists('GVA_Layout_Frontend')){
						 	if(is_product_category() || is_product_tag() || is_product_taxonomy()){
								do_action('gowilds/layouts/archive/product');
							}
						}else{
							do_action('gowilds_page_breacrumb');
							echo '<div class="container shop-without-layout">';
								echo '<div class="row">';
									echo '<div class="col-12">';
						 				wc_get_template_part('archive', 'content');
						 			echo '</div>';	
						 		echo '</div>';
						 	echo '</div>';		
						}
					}
				?>
			 			
			</div>     
		</div>      
	</div>   
	<?php do_action( 'gowilds_after_page_content' ); ?>
</section>


<?php get_footer(); ?>
