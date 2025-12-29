<?php
// register sidebar
function travellers_widgets_init(){
    
    register_sidebar(array(
        'name' => __('Main Widget Area', 'travellers'),
        'description' => __('Add Your Right Sidebar Widgets Here', 'travellers'),
        'id' => 'sidebar-1',
        'before_widget' => '<div id="%1$s" class="widget-wrap %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h2 class="widget-title">',
        'after_title' => '</h2>',
    ));

    if( function_exists( 'ot_get_option' ) ):
        $sidebarArr = ot_get_option( 'create_sidebar', array() );
        if( !empty( $sidebarArr ) ){
            $i = 2;
            foreach ($sidebarArr as $sidebar) {

                register_sidebar( array(
                    'name' => esc_attr($sidebar['title']),
                    'id' => 'sidebar-'.$i,
                    'description' => esc_attr($sidebar['desc']),
                    'before_widget' => '<div id="%1$s" class="widget-wrap %2$s">',
                    'after_widget' => '</div>',
                    'before_title' => '<h2 class="widget-title">',
                    'after_title' => '</h2>',
                ) );

                $i++;
            }
        }
    endif;  //if( function_exists( 'ot_get_option' ) ):

    $footer_widget_display = ot_get_option( 'footer_widget_area', 'on' );
        if( $footer_widget_display == 'on' ):
            $column = ot_get_option( 'footer_widget_area_column', '4' );
           
            for( $i = 1; $i <= $column; $i++ ){
                $args = array(
                    'id' => 'footer-'.$i,
                    'name' => __( 'Footer Widget Area ', 'travellers' ).intval($i),
                    'before_title' => '<h2 class="title-1 space-bottom-15 ">',
                    'after_title' => '</h2>',
                    'before_widget' => '<div id="%1$s" class="%2$s">',
                    'after_widget' => '</div>' 
                );
                register_sidebar( $args );
            }           
        endif; 
}
add_action( 'widgets_init', 'travellers_widgets_init' );

class Travellers_Widget_Recent_Posts extends WP_Widget {

    /**
     * Sets up a new Recent Posts widget instance.
     *
     * @since 2.8.0
     * @access public
     */
    public function __construct() {
        $widget_ops = array('classname' => 'widget_recent_entries', 'description' => __( "Your site&#8217;s most recent Posts.", "travellers") );
        parent::__construct('travellers-recent-posts', __('Travellers Recent Posts', 'travellers'), $widget_ops);
        $this->alt_option_name = 'widget_recent_entries';
    }

    /**
     * Outputs the content for the current Recent Posts widget instance.
     *
     * @since 2.8.0
     * @access public
     *
     * @param array $args     Display arguments including 'before_title', 'after_title',
     *                        'before_widget', and 'after_widget'.
     * @param array $instance Settings for the current Recent Posts widget instance.
     */
    public function widget( $args, $instance ) {
        if ( ! isset( $args['widget_id'] ) ) {
            $args['widget_id'] = $this->id;
        }

        $title = ( ! empty( $instance['title'] ) ) ? $instance['title'] : __( 'Recent Posts', 'travellers' );

        /** This filter is documented in wp-includes/widgets/class-wp-widget-pages.php */
        $title = apply_filters( 'widget_title', $title, $instance, $this->id_base );

        $number = ( ! empty( $instance['number'] ) ) ? absint( $instance['number'] ) : 5;
        if ( ! $number )
            $number = 5;

        $show_thumb = isset( $instance['show_thumb'] ) ? $instance['show_thumb'] : false;
        $show_date = isset( $instance['show_date'] ) ? $instance['show_date'] : false;

        /**
         * Filter the arguments for the Recent Posts widget.
         *
         * @since 3.4.0
         *
         * @see WP_Query::get_posts()
         *
         * @param array $args An array of arguments used to retrieve the recent posts.
         */
        $r = new WP_Query( apply_filters( 'widget_posts_args', array(
            'posts_per_page'      => $number,
            'no_found_rows'       => true,
            'post_status'         => 'publish',
            'ignore_sticky_posts' => true
        ) ) );

        if ($r->have_posts()) :
        ?>
        <?php echo $args['before_widget']; ?>
        <?php if ( $title ) {
            echo force_balance_tags($args['before_title'] . esc_attr($title) . $args['after_title']);
        } ?>
        <ul class="post-widget">
        <?php while ( $r->have_posts() ) : $r->the_post(); ?>
            <li>
                <?php
                    if( has_post_thumbnail() && $show_thumb ){
                        echo '<div class="post-img">';
                        echo '<a href="'.get_permalink().'"> <img alt="'.get_the_title().'" src="'.get_the_post_thumbnail_url(get_the_ID(), 'travellers-150x150-crop').'"> </a>';
                        echo '</div>';
                    }
                ?>
                <div class="details">
                <?php if ( $show_date ) : ?>
                    
                       <?php echo get_the_date(); ?> / <a href="<?php echo get_comments_link(); ?>"><i class="fa fa-comment"></i><?php echo get_comments_number(); ?></a> 
                  
                <?php endif; ?>
                <a href="<?php the_permalink(); ?>" class="blog-title"><?php get_the_title() ? the_title() : the_ID(); ?></a>
                
                </div>
            </li>
        <?php endwhile; ?>
        </ul>
        <?php echo $args['after_widget']; ?>
        <?php
        // Reset the global $the_post as this query will have stomped on it
        wp_reset_postdata();

        endif;
    }

    /**
     * Handles updating the settings for the current Recent Posts widget instance.
     *
     * @since 2.8.0
     * @access public
     *
     * @param array $new_instance New settings for this instance as input by the user via
     *                            WP_Widget::form().
     * @param array $old_instance Old settings for this instance.
     * @return array Updated settings to save.
     */
    public function update( $new_instance, $old_instance ) {
        $instance = $old_instance;
        $instance['title'] = sanitize_text_field( $new_instance['title'] );
        $instance['number'] = (int) $new_instance['number'];
        $instance['show_thumb'] = isset( $new_instance['show_thumb'] ) ? (bool) $new_instance['show_thumb'] : false;
        $instance['show_date'] = isset( $new_instance['show_date'] ) ? (bool) $new_instance['show_date'] : false;
        return $instance;
    }

    /**
     * Outputs the settings form for the Recent Posts widget.
     *
     * @since 2.8.0
     * @access public
     *
     * @param array $instance Current settings.
     */
    public function form( $instance ) {
        $title     = isset( $instance['title'] ) ? esc_attr( $instance['title'] ) : '';
        $number    = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
        $show_thumb = isset( $instance['show_thumb'] ) ? (bool) $instance['show_thumb'] : false;
        $show_date = isset( $instance['show_date'] ) ? (bool) $instance['show_date'] : false;
?>
        <p><label for="<?php echo esc_attr($this->get_field_id( 'title' )); ?>"><?php _e( 'Title:', 'travellers' ); ?></label>
        <input class="widefat" id="<?php echo esc_attr($this->get_field_id( 'title' )); ?>" name="<?php echo esc_attr($this->get_field_name( 'title' )); ?>" type="text" value="<?php echo esc_attr($title); ?>" /></p>

        <p><label for="<?php echo esc_attr($this->get_field_id( 'number' )); ?>"><?php _e( 'Number of posts to show:', 'travellers' ); ?></label>
        <input class="tiny-text" id="<?php echo esc_attr($this->get_field_id( 'number' )); ?>" name="<?php echo esc_attr($this->get_field_name( 'number' )); ?>" type="number" step="1" min="1" value="<?php echo esc_attr($number); ?>" size="3" /></p>

        <p><input class="checkbox" type="checkbox"<?php checked( $show_thumb ); ?> id="<?php echo esc_attr($this->get_field_id( 'show_thumb' )); ?>" name="<?php echo esc_attr($this->get_field_name( 'show_thumb' )); ?>" />
        <label for="<?php echo esc_attr($this->get_field_id( 'show_thumb' )); ?>"><?php _e( 'Display thumbnail?', 'travellers' ); ?></label></p>

        <p><input class="checkbox" type="checkbox"<?php checked( $show_date ); ?> id="<?php echo esc_attr($this->get_field_id( 'show_date' )); ?>" name="<?php echo esc_attr($this->get_field_name( 'show_date' )); ?>" />
        <label for="<?php echo esc_attr($this->get_field_id( 'show_date' )); ?>"><?php _e( 'Display post date?', 'travellers' ); ?></label></p>
<?php
    }
}
function travellers_custom_register_widgets() {
	register_widget( 'Travellers_Widget_Recent_Posts' );
}

add_action( 'widgets_init', 'travellers_custom_register_widgets' );
