<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
 */

get_header();
$class_main = 'col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12';
if(is_active_sidebar('default_sidebar')){ 
  $class_main = 'col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12';
}
?> 

<section id="wp-main-content" class="clearfix main-page">
  	<?php do_action('gowilds_page_breacrumb'); ?>

  	<div class="container"> 
	 	<div class="main-page-content main-page-index row">
  		
			<!-- Main content -->
			<div class="content-page <?php echo esc_attr($class_main) ?>">      
			  <div id="wp-content" class="wp-content content-page-index">   
				 	<div class="blog-grid-style-2 gva-posts-grid">
						<div class="lg-block-grid-2 md-block-grid-2 sm-block-grid-2 xs-block-grid-1 post-masonry-style post-masonry-index">
					  	<?php 
					  		if ( have_posts() ) :
						
							 	// Start the Loop.
							 	while ( have_posts() ) : the_post();

								 	echo '<div class="item-columns item-masory">';
										get_template_part( 'templates/content/item', 'post-style-1' );
								 	echo '</div>';  

							 	endwhile;
							 	// Previous/next page navigation.         

						 	else :
							 	// If no content, include the "No posts found" template.
							 	get_template_part( 'content', 'none' );

						 	endif;
					  	?>
						</div>
				 	</div>  

					<div class="pagination">
						<?php echo gowilds_pagination(); ?>
					</div>
			  	</div>

			</div>  

			<?php if(is_active_sidebar('default_sidebar')){ ?>
			 	<div class="sidebar wp-sidebar sidebar-left col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12">
				 	<div class="sidebar-inner">
						<?php dynamic_sidebar('default_sidebar'); ?>
				 	</div>
			 	</div>
			<?php } ?> 	

	 	</div>
  	</div>              
</section>

<?php get_footer(); ?>
