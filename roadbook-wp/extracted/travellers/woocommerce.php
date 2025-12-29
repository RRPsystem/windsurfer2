<?php get_header(); ?>       

    <?php get_template_part( 'templates/content', 'before' ); ?>
    <?php if ( have_posts() ) : ?>
        <?php woocommerce_content(); ?>
       
       
    <?php endif;  ?>



    <?php get_sidebar(); ?>
    
    <?php get_template_part( 'templates/content', 'after' ); ?> 

 <?php  get_footer(); ?> 