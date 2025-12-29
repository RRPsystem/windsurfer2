<?php 
$related_posts = ot_get_option('related_posts', 'on'); 
?>
<?php if( ($related_posts == 'on') && is_single() ): ?>
    <?php
    $posts_per_page =  ot_get_option( 'total_related_posts', 3 );
    $orig_post = $post;
    global $post;
    $tags = wp_get_post_tags($post->ID);
     
    if ($tags) :
    $tag_ids = array();
    foreach($tags as $individual_tag) $tag_ids[] = $individual_tag->term_id;
    $args=array(
        'tag__in' => $tag_ids,
        'post__not_in' => array($post->ID),
    );
    $args[ 'posts_per_page' ] = $posts_per_page;
     
    $related_posts_query = new wp_query( $args );
    if( $related_posts_query->have_posts() ):
        $related_posts_title =  ot_get_option( 'related_posts_title', 'Related posts' );
        ?>
        <!-- Related Post Starts-->
        <div class="related-blog">     
            <h2> <?php echo esc_attr( $related_posts_title ); ?> </h2>                           
                <div id="blog-slider" class="rel-blog-slider">
                    <?php             
                    while( $related_posts_query->have_posts() ) :
                    $related_posts_query->the_post();
                    ?>
                        <div class="item">
                            <div class="blog-wrap">
                                <?php if(has_post_thumbnail()): ?>
                                    <div class="blog-img">
                                        <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail(); ?></a>
                                    </div> 
                                <?php endif; ?> 
                                <div class="blog-page-wrap">
                                    <div class="blog-heading">  
                                        <?php the_title( sprintf( '<h4><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h4>' ); ?>
                                        <?php travellers_post_meta(); ?>
                                    </div>
                                    <div class="blog-content">
                                        <p><?php echo wp_trim_words( get_the_excerpt(), '15', '' ) ?></p>
                                    </div>                                   
                                    <div class="read-more">
                                        <?php echo travellers_read_more_link(''); ?>
                                        <?php echo travellers_get_social_share_box(); ?>
                                    </div>
                                </div>
                            </div>
                        </div>                     
                    <?php
                     endwhile;                   
                    $post = $orig_post;
                    wp_reset_postdata();
                    ?>
                </div>                                  
            </div>
            <!-- / Related Post Ends -->       
        <?php  endif; ?>  
    <?php endif; ?>
<?php endif; ?>


                             
    