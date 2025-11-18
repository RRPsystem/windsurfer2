<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
 */
$classes = 'col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12';
$classes_post_grid = 'lg-block-grid-3 md-block-grid-3 sm-block-grid-2 xs-block-grid-1';
if(is_active_sidebar('default_sidebar')){
	$classes = 'col-xl-8 col-lg-8 col-md-12 col-sm-12 col-12';
	$classes_post_grid = 'lg-block-grid-2 md-block-grid-2 sm-block-grid-1 xs-block-grid-1';
}
?>

<?php do_action( 'gowilds_page_breacrumb' ); ?>
<div class="container">	
	<div class="template-posts-archive row margin-top-80 margin-bottom-80">
		
		<div class="<?php echo esc_attr($classes) ?>">
			
		  	<?php 
		  		if(have_posts()){
		  			echo '<div class="posts-grids blog-grid-style">';
		  				echo '<div class="post-items post-masonry-style post-masonry-index ' . esc_attr($classes_post_grid) . '">';
						 	while ( have_posts() ) : the_post();
							 	if( get_post_type() == 'product' && class_exists('WooCommerce') ){
									echo '<div class="item-columns item-masory">';
										wc_get_template_part( 'content', 'product' );
									echo '</div>';
								}else{
								 	echo '<div class="item-columns item-masory">';  
										set_query_var( 'thumbnail_size', 'full' );
										get_template_part( 'templates/content/item-post','style-1' );
								 	echo '</div>'; 
							 	} 
						 	endwhile;
						echo '</div>'; 	
					echo '</div>';
					echo '<div class="pagination">';
						 echo gowilds_pagination();
					echo '</div>';
			 	}else{
				 	echo '<div class="search-no-results-content">';
			  			echo '<div class="message">';
			  				echo esc_html__( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'gowilds' );
			  			echo '</div>';
			  		echo '</div>';
		  		 	get_search_form();
			 	}
		  	?>
				 
		</div>
		
		<?php if(is_active_sidebar('default_sidebar')){ ?>
			<div class="sidebar wp-sidebar sidebar-right col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12">
				<div class="sidebar-inner">
					<?php dynamic_sidebar('default_sidebar'); ?>
				</div>
			</div>
		<?php } ?>	

	</div>	
</div>

 
