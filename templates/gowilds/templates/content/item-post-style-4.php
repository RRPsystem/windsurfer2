<?php 
   global $post;

   $thumbnail = (isset($thumbnail_size) && $thumbnail_size) ? $thumbnail_size : 'post-thumbnail';
   $excerpt_words = (isset($excerpt_words) && $excerpt_words) ? $excerpt_words : '0';

   $desc = gowilds_limit_words($excerpt_words, get_the_excerpt(), '');

   $meta_classes = 'post-four__meta';
   if(empty(get_the_date())){
      $meta_classes = 'post-four__meta schedule-date';
   }
   $content_classes = 'post-four__content';
   $content_classes .= has_post_thumbnail() ? ' has-thumbnail' : ' has-no-thumbnail';
?>

<article <?php post_class('post post-four__single'); ?>>
   
   <?php if(has_post_thumbnail()){ ?>
      <div class="post-four__thumbnail">
         <a href="<?php echo esc_url( get_permalink() ) ?>">
            <?php the_post_thumbnail( $thumbnail, array( 'alt' => get_the_title() ) ); ?>
         </a>
         <?php if( get_the_date() ){ ?>
            <div class="entry-date">
               <span class="date"><?php echo esc_html( get_the_date('d')) ?></span>
               <span class="month"><?php echo esc_html( get_the_date('M')) ?></span>
            </div>
         <?php } ?>
      </div>   
   <?php } ?>   

   <div class="<?php echo esc_attr($content_classes) ?>">
      <div class="post-four__content-inner">
         
         <div class="<?php echo esc_attr($meta_classes) ?>">
            <?php gowilds_posted_on(); ?>
         </div> 
         
         <h3 class="post-four__title"><a href="<?php echo esc_url( get_permalink() ) ?>" rel="bookmark"><?php the_title() ?></a></h3>
         
         <?php 
            if($desc){ 
               echo '<div class="post-four__desc">';
                  echo esc_html($desc);
               echo '</div>';   
            } 
         ?>
         <a class="post-four__read-more" href="<?php echo esc_url( get_permalink() ) ?>">
            <i class="fa-solid fa-angles-right"></i><?php echo esc_html__('Read more', 'gowilds'); ?>
         </a>
      </div>

   </div>
</article>   

  