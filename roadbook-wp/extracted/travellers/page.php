<?php get_header(); ?>       

    <?php get_template_part( 'templates/content', 'before' ); ?>
    <?php if ( have_posts() ) : ?>
        <?php
        // Start the loop.
        while ( have_posts() ) : the_post();
            /*
            * Include the Post-Format-specific template for the content.
            * If you want to override this in a child theme, then include a file
            * called content-___.php (where ___ is the Post Format name) and that will be used instead.
            */
            get_template_part( 'templates/content', 'page' );

            // End the loop.
        endwhile;
        ?>
        <?php 
        edit_post_link( __( 'Edit', 'travellers' ), '<p class="entry-footer"><span class="edit-link">', '</span></p><!-- .entry-footer -->' ); 
        
         // If comments are open or we have at least one comment, load up the comment template.
        if ( comments_open() || get_comments_number() ) :
            comments_template();
            get_template_part( 'templates/comment', 'form' );
        endif;
        ?>
        <?php
        // If no content, include the "No posts found" template.
        else :
        get_template_part( 'templates/content', 'none' );
    endif;
    ?>



    <?php get_sidebar(); ?>
    
    <?php get_template_part( 'templates/content', 'after' ); ?> 
    
 <?php  get_footer(); ?> 