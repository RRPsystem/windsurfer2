<?php get_header(); ?>       

    <?php get_template_part( 'templates/content', 'before' ); ?>
    <div class="title-wrap space-bottom-50">
        <?php
            $id = ot_get_option('instructor_archive_id');
            if(get_post_status($id) == 'publish'){
                $post_content = get_post($id);
                $content = $post_content->post_content;
                echo apply_filters('the_content',$content) ;
            }
        ?>
    </div>
    <?php if ( have_posts() ) : ?>
        <div class="our-team row">
        <?php
        // Start the loop.
        while ( have_posts() ) : the_post();
            $type = get_post_meta( get_the_ID(), 'type', true );
            $social_icons_display = get_post_meta( get_the_ID(), 'social_icons_display', true );
            $social_icons = get_post_meta( get_the_ID(), 'social_icons', true );
           ?>
           <div class="col-md-3 col-sm-6 space-top-30"> 
                <div class="our-team-wrap text-center">
                    <a href="<?php the_permalink(); ?>"> <?php the_post_thumbnail('travellers-instructor-size'); ?> </a>
                    <div class="team-overlay"> <a href="<?php the_permalink(); ?>" class="view-icn"> <img src="<?php echo TRAVELLERS_URI; ?>/assets/img/our-team/plus.png" alt=""> </a> </div>
                </div>  
                <div class="team-details gray-color text-center">
                    <a href="<?php the_permalink(); ?>" class="title-1"><?php the_title(); ?></a>
                    <?php                        
                    echo ($type != '')? '<h6>'.esc_attr($type).'</h6>' : '';
                    ?>
                    <p><?php echo get_the_excerpt() ?></p>
                    <?php if( ($social_icons_display != 'off') && !empty($social_icons) ): ?>
                    <ul>
                        <?php foreach ($social_icons as $key => $value) {
                            echo '<li><a href="'.esc_url($value['link']).'" title="'.esc_attr($value['title']).'" target="_blank" class="hover-color">'.travellers_ot_get_icon($value['icon']).'</a></li>';
                        } ?>
                    </ul>
                    <?php endif; ?>
                </div>
            </div>

           <?php

            // End the loop.
        endwhile;?>
        </div>

        <?php

        echo travellers_pagination();
        // If no content, include the "No posts found" template.
        else :
        get_template_part( 'templates/content', 'none' );
    endif;
    ?>              

    <?php get_sidebar(); ?>
    <?php get_template_part( 'templates/content', 'after' ); ?>                   
               


 <?php  get_footer(); ?> 