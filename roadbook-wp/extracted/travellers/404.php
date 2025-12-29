<?php get_header(); ?>       
	<?php get_template_part( 'templates/content', 'before' ); ?>
    
    <?php 
        get_template_part( 'templates/content', 'none' );
    ?>              

  <?php get_sidebar(); ?>
  <?php get_template_part( 'templates/content', 'after' ); ?>  


 <?php  get_footer(); ?> 