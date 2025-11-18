<?php 
   global $post;

   $thumbnail = 'post-thumbnail';

   $thumbnail = (isset($thumbnail_size) && $thumbnail_size) ? $thumbnail_size : 'gowilds_medium';
   $excerpt_words = (isset($excerpt_words) && $excerpt_words) ? $excerpt_words : 30;

   $meta_classes = 'post-standard__meta';
   if(empty(get_the_date())){
      $meta_classes = 'post-standard__meta schedule-date';
   }
   $content_classes = 'post-standard__content';
   $content_classes .= has_post_thumbnail() ? ' has-thumbnail' : ' has-no-thumbnail';
   $desc = gowilds_limit_words($excerpt_words, get_the_excerpt(), '');
?>

   <article id="post-<?php echo esc_attr(get_the_ID()); ?>" <?php post_class('post post-standard__single'); ?>>
      
      <?php if(has_post_thumbnail()){ ?>
         <div class="post-standard__thumbnail">
            <a href="<?php echo esc_url( get_permalink() ) ?>">
               <?php the_post_thumbnail( $thumbnail, array( 'alt' => get_the_title() ) ); ?>
            </a>
         </div>   
      <?php } ?>   

      <div class="<?php echo esc_attr($content_classes) ?>">
         <div class="post-standard__content-inner">
            <div class="<?php echo esc_attr($meta_classes) ?>">
               <?php gowilds_posted_on(); ?>
            </div> 
            <h3 class="post-standard__title"><a href="<?php echo esc_url( get_permalink() ) ?>" rel="bookmark"><?php the_title() ?></a></h3>
            <?php if($desc){ ?>
               <div class="post-standard__desc">
                  <?php echo esc_html($desc) ?>
               </div>   
            <?php } ?>
            <div class="post-standard__read-more">
               <a class="btn-border-theme" href="<?php echo esc_url( get_permalink() ) ?>"><?php echo esc_html__('Read more', 'gowilds'); ?></a>
            </div>
         </div>

      </div>
   </article>   

  