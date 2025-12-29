<div class="auther-wrap block-inline">
    <div class="col-sm-3 text-center auther-img">
        <?php
            if ( function_exists('has_wp_user_avatar') && has_wp_user_avatar(get_the_author_meta( 'user_email' )) ) {
                echo get_wp_user_avatar(get_the_author_meta( 'user_email' ), 'thumbnail');
            } else {
                $author_info_avatar_size = apply_filters( 'travellers_author_info_avatar_size', 100 );
                echo get_avatar( get_the_author_meta( 'user_email' ), $author_info_avatar_size );
            }
        ?>
    </div>
    <div class="col-sm-9 auther-detail">
        <div class="col-sm-5"> <h2 class="title-2"><?php echo get_the_author(); ?></h2> </div>
        <div class="col-sm-7"> 
            <?php travellers_get_user_contacts_list(); ?>
        </div>
        <div class="col-sm-12 gray-clr">
            <p><?php the_author_meta( 'description' ); ?></p>
        </div>
    </div>
</div>