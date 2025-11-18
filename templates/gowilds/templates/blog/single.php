<?php
/**
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 */
?>
<?php 
	$thumbnail = 'full';
	if(!isset($excerpt_words)){
		$excerpt_words = gowilds_get_option('blog_excerpt_limit', 20);
	}

	$classes = 'col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12';
	if(is_active_sidebar('default_sidebar')){ 
  		$classes = 'col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12';
	}
?>

<div class="single-post-template">
	<?php do_action( 'gowilds_page_breacrumb' ); ?>
	<div class="single-content-inner padding-top-50 padding-bottom-50">
		<div class="container">
			<div class="row">
				
				<div class="<?php echo esc_attr($classes) ?>">
					<?php while ( have_posts() ) : the_post(); ?>

						<article id="post-<?php echo esc_attr(get_the_ID()); ?>" <?php post_class(); ?>>
							<div class="post-thumbnail <?php echo has_post_thumbnail(get_the_ID()) ? '' : 'without_image' ?>">
								<a href="<?php echo esc_url( get_permalink() ) ?>">
									<?php the_post_thumbnail( $thumbnail, array( 'alt' => get_the_title() ) ); ?>
								</a>
							</div>      

							<div class="entry-content">
								
								<div class="content-inner">
									<div class="entry-meta">
										<?php gowilds_posted_on(true); ?>
									</div>
								
									<h1 class="entry-title"><?php echo the_title() ?></h1>
														
									<?php 
										echo '<div class="post-content clearfix">';
											the_content( sprintf(
												esc_html__( 'Continue reading %s <span class="meta-nav">&rarr;</span>', 'gowilds' ),
												the_title( '<span class="screen-reader-text">', '</span>', false )
											) );

											wp_link_pages( array(
												'before'      => '<div class="page-links"><span class="page-links-title">' . esc_html__( 'Pages:', 'gowilds' ) . '</span>',
												'after'       => '</div>',
												'link_before' => '<span>',
												'link_after'  => '</span>',
											) );
										echo '</div>';
									?>

									<?php the_tags( '<footer class="entry-meta-footer"><span class="tag-links"><span class="tag-title">' . esc_html__( 'Tags:', 'gowilds' ) . '</span>', '', '</span></footer>' ); ?>
									
								</div>
								
							</div><!-- .entry-content --> 

							
						</article><!-- #post-## -->
						
					<?php endwhile; // end of the loop. ?>		

					<?php 
                 	if( comments_open() || get_comments_number() ) {
                     comments_template();
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
	</div>    
</div>   