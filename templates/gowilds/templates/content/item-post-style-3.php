<?php 
   $thumbnail = isset($thumbnail_size) && $thumbnail_size ? $thumbnail_size : 'post-thumbnail';
?>

<article <?php post_class('post post-three__single'); ?>>
   <div class="post-three__thumbnail" style="background-image:url('<?php echo get_the_post_thumbnail_url(get_the_ID(), $thumbnail) ?>');"></div>   
   <div class="post-three__content">
      <div class="post-three__content-inner">
         <div class="post-three__meta">
            <?php gowilds_posted_on_width_avata(); ?>
         </div> 
         <h2 class="post-three__title">
            <a href="<?php echo esc_url( get_permalink() ) ?>"><?php the_title() ?></a>
         </h2>
      </div>
      <div class="post-three__read-more">
         <a href="<?php echo esc_url( get_permalink() ) ?>">
            <i class="icon las la-arrow-right"></i>
         </a>
      </div>
   </div>
   <a href="<?php echo esc_url( get_permalink() ) ?>" class="post-three__link-overlay"></a>
</article>   

  