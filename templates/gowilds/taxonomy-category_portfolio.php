<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
 */
	get_header(); 

	$columns_lg = gowilds_get_option('portfolio_columns_lg', '4');
	$columns_md = gowilds_get_option('portfolio_columns_md', '3');
	$columns_sm = gowilds_get_option('portfolio_columns_sm', '2');
	$columns_xs = gowilds_get_option('portfolio_columns_xs', '1');

 ?>

<section id="wp-main-content" class="clearfix main-page">
	<?php do_action( 'gowilds_page_breacrumb' ); ?>
	<div class="container">  
		<div class="main-page-content row">
		  	<div class="content-page col-12">      
			 	<div id="wp-content" class="wp-content clearfix padding-top-50 padding-bottom-50">
					<div class="lg-block-grid-<?php echo esc_attr($columns_lg) ?> md-block-grid-<?php echo esc_attr($columns_md) ?> sm-block-grid-<?php echo esc_attr($columns_sm) ?> xs-block-grid-<?php echo esc_attr($columns_xs) ?>">
						<?php while ( have_posts() ) : the_post(); ?>
							<?php get_template_part( 'templates/content/item', 'portfolio-style-1' ); ?>
						<?php endwhile; ?>  
					</div>
			 	</div>    
		  	</div>      
		</div>   
	</div>
</section>

<?php get_footer(); ?>
