<div id="post-<?php the_ID(); ?>" <?php post_class('blog-wrap'); ?>>
    <?php if(has_post_thumbnail()): ?>
    <div class="blog-img">
        <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail(); ?></a>
    </div> 
    <?php endif; ?>
    <div class="blog-page-wrap">
        <div class="blog-heading">  
            <?php
                if ( is_sticky() ) {
                    $sticky_post_text = ot_get_option( 'sticky_post_text', 'Featured post' );
                    echo '<span class="sticky-post">'.sprintf(_x( '%s', 'Sticky post text', 'travellers'), esc_attr($sticky_post_text) ).'</span>';
                }

            ?>
            <?php
                if ( is_single() ) :
                    the_title(travellers_post_title_before(), travellers_post_title_after());
                else :
                    the_title( sprintf( '<h2 class="entry-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' );
                endif;
            ?> 
            <?php travellers_post_meta(); ?>
        </div>
        <div class="blog-content">
            <?php
                if ( is_single() ) :
                    the_content();
                else :
                    the_excerpt();
                endif;

                $defaults = array(
                    'before'           => '<p><strong>' . esc_attr(__( 'Pages:', 'travellers' )).'</strong> ',
                    'after'            => '</p>',
                    'link_before'      => '',
                    'link_after'       => '',
                    'next_or_number'   => 'number',
                    'separator'        => ' ',
                    'nextpagelink'     => esc_attr(__( 'Next page', 'travellers' )),
                    'previouspagelink' => esc_attr(__( 'Previous page', 'travellers' )),
                    'pagelink'         => '%',
                    'echo'             => 1
                );

                wp_link_pages( $defaults );

                if(is_single()){
                     echo travellers_get_social_share_box();
                    edit_post_link( __( 'Edit', 'travellers' ), '<span class="edit-link pull-right">', '</span><!-- .edit-link -->' ); 
                }
               

            ?>


        </div> 

        <?php if( !is_single() ): ?>                            
            <div class="read-more">
                <?php echo travellers_read_more_link(''); ?>
                <?php echo travellers_get_social_share_box(); ?>
                <?php edit_post_link( __( 'Edit', 'travellers' ), '<span class="edit-link pull-right">', '</span><!-- .edit-link -->' ); ?>
            </div>
        <?php else: ?>
                <?php
                    if(get_the_tag_list()) {
                        $tag_title = __( 'Post Tags', 'travellers' );
                        echo get_the_tag_list('<div class="block-inline tag-cloud"><h3 class="post-tags"> '.esc_attr($tag_title).' </h3><ul class="list-inline no-margin"><li>','</li><li>','</li></ul></div>');
                    }
                ?>
        <?php endif; ?>
    </div>
</div>