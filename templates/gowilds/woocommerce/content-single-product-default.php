<?php 
	do_action( 'woocommerce_before_single_product' );
	$classes = array();
	$classes[] = 'product-single-main product-single-default';
?>

<div class="container">
	<div class="main-page-content row">
		<div class="content-page col-12">
			<div id="product-<?php the_ID(); ?>" <?php post_class( $classes ); ?>>
				<div class="product-wrapper clearfix">
					
					<div class="product-single-inner row">
						<div class="column col-md-6 col-sm-12 col-xs-12 product_image_wrapper">
							<div class="column-inner">
								<div class="image_frame scale-with-grid">
									<?php
										/**
										 * woocommerce_before_single_product_summary hook
										 *
										 * @hooked woocommerce_show_product_sale_flash - 10
										 * @hooked woocommerce_show_product_images - 20
										 */
										do_action( 'woocommerce_before_single_product_summary' );	
									?>
								</div>
								<?php do_action( 'woocommerce_product_thumbnails' ); ?>
							</div>	
						</div>

						<div class="column col-md-6 col-sm-12 col-xs-12 summary entry-summary">
							<div class="column-inner clearfix">
								<div class="menu-single-product">
									<?php
										next_post_link( '%link',  '<i class="fas fa-chevron-left"></i>' , true, array(), 'product_cat' );
										previous_post_link( '%link',  '<i class="fas fa-chevron-right"></i>', true, array(), 'product_cat' );
									?>
								</div>
								<?php
									/**
									 * woocommerce_single_product_summary hook
									 *
									 * @hooked woocommerce_template_single_title - 5
									 * @hooked woocommerce_template_single_rating - 10
									 * @hooked woocommerce_template_single_price - 10
									 * @hooked woocommerce_template_single_excerpt - 20
									 * @hooked woocommerce_template_single_add_to_cart - 30
									 * @hooked woocommerce_template_single_meta - 40
									 * @hooked woocommerce_template_single_sharing - 50
									 */
									
									do_action( 'woocommerce_single_product_summary' );
								?>
								
							</div>
						</div>	
					</div>
				</div>
				
				<?php
					/**
					 * woocommerce_after_single_product_summary hook
					 *
					 * @hooked woocommerce_output_product_data_tabs - 10
					 * @hooked woocommerce_output_related_products - 20
					 */
					
					do_action( 'woocommerce_after_single_product_summary' );
				?>

				<meta itemprop="url" content="<?php the_permalink(); ?>" />

			</div><!-- #product-<?php the_ID(); ?> -->
		</div>
	</div>
</div>	
<?php do_action( 'woocommerce_after_single_product' ); ?>

