<?php 
   if(!isset($index)){
      $index = 2;
   }
   $thumbnail = (isset($thumbnail_size) && $thumbnail_size) ? $thumbnail_size : 'gowilds_medium';
   if(!isset($excerpt_words)){
      $excerpt_words = gowilds_get_option('blog_excerpt_limit', 20);
   }
?>

<article id="post-<?php echo esc_attr(get_the_ID()); ?>" class="post post-six__single">
   <div class="post-six__content">
      <div class="post-six__meta">
         <?php gowilds_posted_on(); ?>
      </div> 
      <h2 class="post-six__title"><a href="<?php echo esc_url( get_permalink() ) ?>" rel="bookmark"><?php the_title() ?></a></h2>
   </div>
</article> 

  