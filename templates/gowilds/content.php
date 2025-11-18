<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 */
?>
<?php 
	$thumbnail = 'post-thumbnail';
	if(isset($thumbnail_size) && $thumbnail_size){
		$thumbnail = $thumbnail_size;
	}
	if(is_single()){
		$thumbnail = 'full';
	}

	if(!isset($excerpt_words)){
    	$excerpt_words = gowilds_get_option('blog_excerpt_limit', 20);
  	}

?>
<article id="post-<?php echo esc_attr(get_the_ID()); ?>" <?php post_class(); ?>>

	<div class="post-thumbnail <?php echo has_post_thumbnail(get_the_ID()) ? '' : 'without_image' ?>">
      <a href="<?php echo esc_url( get_permalink() ) ?>">
         <?php the_post_thumbnail( $thumbnail, array( 'alt' => get_the_title() ) ); ?>
      </a>
      <?php if( get_the_date() ){ ?>
         <div class="entry-date"><?php echo esc_html( get_the_date( get_option( 'date_format' ) ) ) ?></div>
      <?php } ?>
   </div>   	

	<div class="entry-content">
		
      <div class="content-inner">
         <div class="entry-meta">
            <?php gowilds_posted_on(false); ?>
         </div>

         <?php if( !is_single() ){ ?>
            <h2 class="entry-title"><a href="<?php echo esc_url( get_permalink() ) ?>" rel="bookmark"><?php the_title() ?></a></h2>
         <?php }else{ ?>
            <h1 class="entry-title"><?php echo the_title() ?></h1>
         <?php } ?>
            
			<?php if(is_single()){
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
			}
			?>
         <?php the_tags( '<footer class="entry-meta-footer"><span class="tag-links">', '', '</span></footer>' ); ?>
         
         <?php 
            if(is_single()){ 
               do_action( 'gowilds_share' );
            }
         ?>
      </div>
      
	</div><!-- .entry-content -->	

	
</article><!-- #post-## -->
