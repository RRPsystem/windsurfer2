<?php 
   if(!isset($index)){
      $index = 2;
   }
   $thumbnail = (isset($thumbnail_size) && $thumbnail_size) ? $thumbnail_size : 'post-thumbnail';
   if ( in_array( 'category', get_object_taxonomies(get_post_type()) ) ){
      $cat_html = '<span class="cat-links">' . get_the_category_list( _x( ", ", "Used between list items, there is a space after the comma.", "gowilds" ) ) . '</span>';
   }
   if(!isset($excerpt_words)){
      $excerpt_words = gowilds_get_option('blog_excerpt_limit', 20);
   }
?>

<article id="post-<?php echo esc_attr(get_the_ID()); ?>" class="post post-five__single">
   <div class="post-five__thumbnail">
      <a href="<?php echo esc_url( get_permalink() ) ?>">
         <?php the_post_thumbnail( $thumbnail, array( 'alt' => get_the_title() ) ); ?>
      </a>
   </div>

   <div class="post-five__content">
      <?php 
         if($cat_html){
            echo '<div class="post-five__category">';
               echo wp_kses( $cat_html, true );
            echo '</div>';
         }
      ?>
      <div class="post__meta post-five__meta">
         <?php gowilds_posted_on(); ?>
      </div> 
      <h2 class="post-five__title">
         <a href="<?php echo esc_url( get_permalink() ) ?>" rel="bookmark"><?php the_title() ?></a>
      </h2>
   </div>
</article>

  