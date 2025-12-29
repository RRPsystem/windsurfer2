<?php get_header(); ?>       

    <?php get_template_part( 'templates/content', 'before' ); ?>
    <?php if ( have_posts() ) : ?>

        <?php 
        $post_type_Arr = array('tour', 'location'); 
        if (  !in_array(get_post_type(), $post_type_Arr)  ):
        ?>
        <div class="archive-header">
            <?php
                the_archive_title( '<h3 class="archive-title">', '</h3>' );
                the_archive_description( '<div class="taxonomy-description">', '</div>' );
            ?>
        </div><!-- .page-header -->
        <?php endif; ?>
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