<?php get_header(); ?>       

    <?php get_template_part( 'templates/content', 'before' ); ?>
    	<div class="archive-header">
            <h3 class="archive-title"><?php printf( __( 'Search Results for: %s', 'travellers' ), get_search_query() ); ?></h3>
        </div><!-- .archive-header -->

    <?php if ( have_posts() ) : ?>
        
        <?php
        // Start the loop.
        while ( have_posts() ) : the_post();
            /*
            * Include the Post-Format-specific template for the content.
            * If you want to override this in a child theme, then include a file
            * called content-___.php (where ___ is the Post Format name) and that will be used instead.
            */
            get_template_part( 'templates/content', get_post_format() );

            // End the loop.
        endwhile;

        echo travellers_pagination();
        // If no content, include the "No posts found" template.
        else :
        get_template_part( 'templates/content', 'none' );
    endif;
    ?>              

    <?php get_sidebar(); ?>
    <?php get_template_part( 'templates/content', 'after' ); ?>                   
               


 <?php  get_footer(); ?> 