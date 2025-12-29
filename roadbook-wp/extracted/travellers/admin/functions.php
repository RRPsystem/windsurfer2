<?php

include_once(TRAVELLERS_DIR.'/admin/mce-button.php');
include_once(TRAVELLERS_DIR.'/admin/iconpicker/iconpicker.php');
include_once(TRAVELLERS_DIR.'/admin/travellers-widgets.php');
include_once(TRAVELLERS_DIR.'/admin/scripts.php');
include_once(TRAVELLERS_DIR.'/admin/meta-boxes.php');
include_once(TRAVELLERS_DIR.'/admin/tour-meta-box.php');
include_once(TRAVELLERS_DIR.'/admin/vc-extends.php');
include_once(TRAVELLERS_DIR.'/admin/demo-data.php');
include_once(TRAVELLERS_DIR . '/admin/class.wpcf7-config.php') ;



function travellers_login_logo() { 
    $logo = (function_exists('ot_get_option'))? ot_get_option('admin_logo', TRAVELLERS_URI.'/images/logo.png') : TRAVELLERS_URI.'/images/logo.png';

    $css = '<style type="text/css">
        body.login div#login h1 a {
            background-image: url('.esc_url($logo).') !important;
            background-position: bottom center  !important; 
            width: 160px;
            background-size: 100% auto;
        }</style>
    ';

    echo $css;

}
add_action( 'login_enqueue_scripts', 'travellers_login_logo' );

function travellers_display_image_size_names_muploader( $sizes ) {
  
  $new_sizes = array();
  
  $added_sizes = get_intermediate_image_sizes();
  
  // $added_sizes is an indexed array, therefore need to convert it
  // to associative array, using $value for $key and $value
  foreach( $added_sizes as $key => $value) {
    $new_sizes[$value] = $value;
  }
  
  // This preserves the labels in $sizes, and merges the two arrays
  $new_sizes = array_merge( $new_sizes, $sizes );
  
  return $new_sizes;
}
add_filter('image_size_names_choose', 'travellers_display_image_size_names_muploader', 11, 1);
/**
 * Filters the Logo header link
 */
add_filter('ot_header_logo_link', function(){
    ob_start();
    ?>
    <div class="theme-logo">
        <img width="40" height="40" src="<?php echo get_template_directory_uri() ?>/images/icon.png" alt="">
        <span>Travellers</span>
    </div>
    <?php
    return ob_get_clean();
});
add_filter( 'ot_header_version_text', function(){
    return 'vs '.wp_get_theme()->get('Version');
});
add_action('ot_header_list', 'travellers_ot_header_list');
function travellers_ot_header_list(){
    echo '<li style="margin-left: auto;"><a class="button button-primary right" style="color: #fff;" href="http://event-theme.com/themes/travellers/docs/" target="_blank">View online documentation</a></li>';
}

/**
 * Filters the Google font API key
 */
add_filter( 'ot_google_fonts_api_key', function(){
    return 'AIzaSyAY4CxRw0I0VvaABZcMcNqU-Zjuw7xjrW4'; 
});

add_filter('ot_validate_setting_input_safe', function($input_safe, $input, $type){

    if ( 'iconpicker' === $type ) {
        $input_safe = esc_attr($input);
    }

    if ( 'list-item' === $type ) {
        $input_safe = $input;
    }

    return $input_safe;
}, 10, 3);

function travellers_recognized_font_families( $families ) {
    
 
    $families['roboto'] = 'Roboto';
    
    return $families;    
}
add_filter( 'ot_recognized_font_families', 'travellers_recognized_font_families' ) ;

function travellers_filter_typography_fields( $array, $field_id ) {

   if (($field_id == "primary_font") || ($field_id == "secondary_font"))  {
      $array = array( 'font-family');
   }

   return $array;

}

add_filter( 'ot_recognized_typography_fields', 'travellers_filter_typography_fields', 10, 2 );

add_filter('manage_posts_columns', 'travellers_columns_head');
add_action('manage_posts_custom_column', 'travellers_columns_content', 10, 2);
add_filter('manage_location_posts_columns', 'travellers_columns_head');
add_action('manage_location_posts_custom_column', 'travellers_columns_content', 10, 2);
add_filter('manage_tour_posts_columns', 'travellers_columns_head');
add_action('manage_tour_posts_custom_column', 'travellers_columns_content', 10, 2);


// ADD NEW COLUMN
function travellers_columns_head($defaults) {
    $defaults['featured_image'] = esc_attr(__('Featured Image', 'travellers'));
    return $defaults;
}

function travellers_columns_content($column_name, $post_ID) {
    global $wpdb;
    if ($column_name == 'featured_image') {
        if (has_post_thumbnail($post_ID)) {
            // HAS A FEATURED IMAGE
           echo get_the_post_thumbnail($post_ID, 'thumbnail');
        }
    }
}

function travellers_get_slug($id = null) {
   $post_data = get_post($id, ARRAY_A);
   $slug = $post_data['post_name'];
   return $slug;
}

function travellers_onepage_sections_array( $page_id = 0 ){
    $sections = array();
    if($page_id == 0) return $sections;
    $pages = get_post_meta( $page_id, 'pages', true );
    if(!empty($pages)):
        foreach ($pages as $key => $value) {                
                $sections[] = $value['page_id'];
        }       
    endif;
    return $sections;
}

class Travellers_bootstrap_navwalker extends Walker_Nav_Menu {
    /**
     * @see Walker::start_lvl()
     * @since 3.0.0
     *
     * @param string $output Passed by reference. Used to append additional content.
     * @param int $depth Depth of page. Used for padding.
     */
    public function start_lvl( &$output, $depth = 0, $args = array() ) {
        $indent = str_repeat( "\t", $depth );
        $output .= "\n$indent<ul role=\"menu\" class=\" dropdown-menu\">\n";
    }
    /**
     * @see Walker::start_el()
     * @since 3.0.0
     *
     * @param string $output Passed by reference. Used to append additional content.
     * @param object $item Menu item data object.
     * @param int $depth Depth of menu item. Used for padding.
     * @param int $current_page Menu item ID.
     * @param object $args
     */
    public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
        $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';


        /**
         * Dividers, Headers or Disabled
         * =============================
         * Determine whether the item is a Divider, Header, Disabled or regular
         * menu item. To prevent errors we use the strcasecmp() function to so a
         * comparison that is not case sensitive. The strcasecmp() function returns
         * a 0 if the strings are equal.
         */
        if ( strcasecmp( $item->attr_title, 'divider' ) == 0 && $depth === 1 ) {
            $output .= $indent . '<li role="presentation" class="divider">';
        } else if ( strcasecmp( $item->title, 'divider') == 0 && $depth === 1 ) {
            $output .= $indent . '<li role="presentation" class="divider">';
        } else if ( strcasecmp( $item->attr_title, 'dropdown-header') == 0 && $depth === 1 ) {
            $output .= $indent . '<li role="presentation" class="dropdown-header">' . esc_attr( $item->title );
        } else if ( strcasecmp($item->attr_title, 'disabled' ) == 0 ) {
            $output .= $indent . '<li role="presentation" class="disabled"><a href="#">' . esc_attr( $item->title ) . '</a>';
        } else {
            $class_names = $value = '';
            $classes = empty( $item->classes ) ? array() : (array) $item->classes;
            $classes[] = 'menu-item-' . $item->ID;
            $class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
            if ( $args->has_children )
                $class_names .= ' dropdown';
            if ( in_array( 'current-menu-item', $classes ) )
                $class_names .= ' active';
            $class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';
            $id = apply_filters( 'nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args );
            $id = $id ? ' id="' . esc_attr( $id ) . '"' : '';
            $output .= $indent . '<li' . $id . $value . $class_names .'>';
            $atts = array();
            $atts['title']  = ! empty( $item->title )   ? $item->title  : '';
            $atts['target'] = ! empty( $item->target )  ? $item->target : '';
            $atts['rel']    = ! empty( $item->xfn )     ? $item->xfn    : '';
            // If item has_children add atts to a.
            if ( $args->has_children && $depth === 0 ) {
                $atts['href']           = '#';
                $atts['data-toggle']    = 'dropdown';
                $atts['class']          = 'dropdown-toggle';
                $atts['aria-haspopup']  = 'true';

            } else {
                $atts['href'] = ! empty( $item->url ) ? $item->url : '';
            }

            $sections = travellers_onepage_sections_array(get_the_id());
            if(!in_array($item->object_id, $sections)){
                $atts['href'] = ! empty( $item->url )        ?  $item->url : '';
            }else{
                $atts['href'] = ! empty( $item->url )        ? '#'   . esc_attr( travellers_get_slug($item->object_id) ) : '';
            }


            $atts = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args );
            $attributes = '';
            foreach ( $atts as $attr => $value ) {
                if ( ! empty( $value ) ) {
                    $value = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
                    $attributes .= ' ' . $attr . '="' . $value . '"';
                }
            }
            $item_output = $args->before;
            /*
             * Glyphicons
             * ===========
             * Since the the menu item is NOT a Divider or Header we check the see
             * if there is a value in the attr_title property. If the attr_title
             * property is NOT null we apply it as the class name for the glyphicon.
             */
            if ( ! empty( $item->attr_title ) )
                $item_output .= '<a'. $attributes .'><span class="glyphicon ' . esc_attr( $item->attr_title ) . '"></span>&nbsp;';
            else
                $item_output .= '<a'. $attributes .'>';
            $item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
            $item_output .= ( $args->has_children && 0 === $depth ) ? '</a>' : '</a>';
            $item_output .= $args->after;
            $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
        }
    }
    /**
     * Traverse elements to create list from elements.
     *
     * Display one element if the element doesn't have any children otherwise,
     * display the element and its children. Will only traverse up to the max
     * depth and no ignore elements under that depth.
     *
     * This method shouldn't be called directly, use the walk() method instead.  
     */
    public function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {
        if ( ! $element )
            return;
        $id_field = $this->db_fields['id'];
        // Display this element.
        if ( is_object( $args[0] ) )
           $args[0]->has_children = ! empty( $children_elements[ $element->$id_field ] );
        parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
    }
    /**
     * Menu Fallback
     * =============
     * If this function is assigned to the wp_nav_menu's fallback_cb variable
     * and a manu has not been assigned to the theme location in the WordPress
     * menu manager the function with display nothing to a non-logged in user,
     * and will add a link to the WordPress menu manager if logged in as an admin.
     *
     * @param array $args passed from the wp_nav_menu function.
     *
     */
    public static function fallback( $args ) {
        if ( current_user_can( 'manage_options' ) ) {
            extract( $args );
            $fb_output = null;
            if ( $container ) {
                $fb_output = '<' . $container;
                if ( $container_id )
                    $fb_output .= ' id="' . $container_id . '"';
                if ( $container_class )
                    $fb_output .= ' class="' . $container_class . '"';
                $fb_output .= '>';
            }
            $fb_output .= '<ul';
            if ( $menu_id )
                $fb_output .= ' id="' . $menu_id . '"';
            if ( $menu_class )
                $fb_output .= ' class="' . $menu_class . '"';
            $fb_output .= '>';
            $fb_output .= '<li><a href="' . admin_url( 'nav-menus.php' ) . '">Add a menu</a></li>';
            $fb_output .= '</ul>';
            if ( $container )
                $fb_output .= '</' . $container . '>';
            echo $fb_output;
        }
    }
}


function travellers_get_posts_dropdown( $args = array() ) {
    global $wpdb, $post;

    $dropdown = array();
    $the_query = new WP_Query( $args );
    if ( $the_query->have_posts() ) {
        while ( $the_query->have_posts() ) {
            $the_query->the_post(); 
            $dropdown[get_the_ID()] = get_the_title();
        }
    }
    wp_reset_postdata();

    return $dropdown;
}

function travellers_get_terms( $tax = 'category', $key = 'id' ) {
    $terms = array();
    if ( $key === 'id' ) foreach ( (array) get_terms( $tax, array( 'hide_empty' => false ) ) as $term ) $terms[$term->term_id] = $term->name;
        elseif ( $key === 'slug' ) foreach ( (array) get_terms( $tax, array( 'hide_empty' => false ) ) as $term ) $terms[$term->slug] = $term->name;
            return $terms;
}

if ( ! function_exists( 'travellers_default_paging_nav' ) ) :
/**
 * Display navigation to next/previous set of posts when applicable.
 *
 * @since Twenty Fourteen 1.0
 *
 * @global WP_Query   $wp_query   WordPress Query object.
 * @global WP_Rewrite $wp_rewrite WordPress Rewrite object.
 */
function travellers_default_paging_nav() {
    global $wp_query, $wp_rewrite;

    // Don't print empty markup if there's only one page.
    if ( $wp_query->max_num_pages < 2 ) {
        return;
    }

    $paged        = get_query_var( 'paged' ) ? intval( get_query_var( 'paged' ) ) : 1;
    $pagenum_link = html_entity_decode( get_pagenum_link() );
    $query_args   = array();
    $url_parts    = explode( '?', $pagenum_link );

    if ( isset( $url_parts[1] ) ) {
        wp_parse_str( $url_parts[1], $query_args );
    }

    $pagenum_link = remove_query_arg( array_keys( $query_args ), $pagenum_link );
    $pagenum_link = trailingslashit( $pagenum_link ) . '%_%';

    $format  = $wp_rewrite->using_index_permalinks() && ! strpos( $pagenum_link, 'index.php' ) ? 'index.php/' : '';
    $format .= $wp_rewrite->using_permalinks() ? user_trailingslashit( $wp_rewrite->pagination_base . '/%#%', 'paged' ) : '?paged=%#%';

    // Set up paginated links.
    $links = paginate_links( array(
        'base'     => $pagenum_link,
        'format'   => $format,
        'total'    => $wp_query->max_num_pages,
        'current'  => $paged,
        'mid_size' => 1,
        'add_args' => array_map( 'urlencode', $query_args ),
        'prev_text' => esc_attr(__( '&larr; Previous', 'travellers' )),
        'next_text' => esc_attr(__( 'Next &rarr;', 'travellers' )),
    ) );

    if ( $links ) :

    ?>
    <nav class="navigation paging-navigation" role="navigation">
        <h1 class="screen-reader-text"><?php _e( 'Posts navigation', 'travellers' ); ?></h1>
        <div class="pagination loop-pagination">
            <?php echo force_balance_tags($links); ?>
        </div><!-- .pagination -->
    </nav><!-- .navigation -->
    <?php
    endif;
}
endif;

if ( ! function_exists( 'travellers_default_post_nav' ) ) :
/**
 * Display navigation to next/previous post when applicable.
 *
 * @since Twenty Fourteen 1.0
 */
function travellers_default_post_nav() {
    // Don't print empty markup if there's nowhere to navigate.
    $previous = ( is_attachment() ) ? get_post( get_post()->post_parent ) : get_adjacent_post( false, '', true );
    $next     = get_adjacent_post( false, '', false );

    if ( ! $next && ! $previous ) {
        return;
    }

    ?>
    <nav class="navigation post-navigation" role="navigation">
        <h1 class="screen-reader-text"><?php _e( 'Post navigation', 'travellers' ); ?></h1>
        <div class="nav-links">
            <?php
            if ( is_attachment() ) :
                previous_post_link( '%link', sprintf( '<span class="meta-nav">%s</span>%title', __('Published In', 'travellers')) );
            else :
                previous_post_link( '%link', sprintf( '<span class="meta-nav">%s</span>%title', __('Previous Post','travellers' )) );
                next_post_link( '%link',  sprintf( '<span class="meta-nav">%s</span>%title', __('Next Post','travellers' )) );
            endif;
            ?>
        </div><!-- .nav-links -->
    </nav><!-- .navigation -->
    <?php
}
endif;

if(!function_exists('travellers_favico_icon')):
    function travellers_favico_icon(){
        if(!function_exists('wp_site_icon')){
            $fabicon = ot_get_option('fabicon');
            $apple_icon_72 = ot_get_option('apple_icon_72');
            $apple_icon_114 = ot_get_option('apple_icon_114');
            $apple_icon_144 = ot_get_option('apple_icon_144');

            echo '<!-- Favicon and Apple Icons -->
            <link rel="shortcut icon" href="'.esc_url($fabicon).'">
            <link rel="apple-touch-icon" href="'.esc_url($apple_icon_72).'">
            <link rel="apple-touch-icon" sizes="72x72" href="'.esc_url($apple_icon_114).'">
            <link rel="apple-touch-icon" sizes="114x114" href="i'.esc_url($apple_icon_144).'">';
        }
        
    }
endif;

function travellers_get_social_icons( $social_icons = array(), $args = array() ) {
  
  if ( empty( $social_icons ) )
    return;
  
  $output = '';
  extract( shortcode_atts( array(
     'wrap' => 'ul',
    'wrapclass' => '',
    'linkwrapbefore' => '',
    'linkwrap' => 'li',
    'linkwrapclass' => '',
    'linkclass' => '',
    'linktext' => true 
  ), $args ) );
  
  $output = ( $wrap != '' ) ? '<' . esc_attr( $wrap ) . ( ( $wrapclass != '' ) ? ' class="' . esc_attr( $wrapclass ) . '"' : '' ) . '>' : '';
  $output .= ( $linkwrapbefore != '' ) ? force_balance_tags( $linkwrapbefore ) : '';
  
  $linkbefore = ( $linkwrap != '' ) ? '<' . esc_attr( $linkwrap ) . ( ( $linkwrapclass != '' ) ? ' class="' . esc_attr( $linkwrapclass ) . '"' : '' ) . '>' : '';
  $linkafter  = ( $linkwrap != '' ) ? '</' . esc_attr( $linkwrap ) . '>' : '';
  
  $linkclass = ( $linkclass != '' ) ? ' class="' . esc_attr( $linkclass ) . '"' : '';
  foreach ( $social_icons as $key => $value ) {
    $url        = isset( $value[ 'icon_link' ][ 'input' ] ) ? $value[ 'icon_link' ][ 'input' ] : '';
    $title      = isset( $value[ 'title' ] ) ? $value[ 'title' ] : '';
    $icon_class = isset( $value[ 'icon_link' ][ 'icon' ] ) ? $value[ 'icon_link' ][ 'icon' ] : '';
    
    $output .= $linkbefore . '<a href="' . esc_url( $url ) . '" title="' . esc_attr( $title ) . '"' . $linkclass . '>
      <i class="fa ' . esc_attr( $icon_class ) . '"></i>
      ' . ( ( $linktext ) ? '<span>' . esc_attr( $title ) . '</span>' : '' ) . '
      </a>' . $linkafter;
    
  } //$social_icons as $key => $value
  
  $output .= ( $wrap != '' ) ? '</' . esc_attr( $wrap ) . '>' : '';
  
  return $output;
}


// Add Profile Fields
function travellers_contact_options(){
    $profile_fields = array();
     $profile_fields['facebook'] = array('Facebook', 'fb');
    $profile_fields['twitter'] = array('Twitter', 'tw');
    $profile_fields['youtube-play'] = array('Youtube', 'yt');
    $profile_fields['pinterest'] = array('Pinterest', 'pt');
    $profile_fields['linkedin'] = array('Linkedin', 'li');
    $profile_fields['flickr'] = array('Flickr', 'fl');
    $profile_fields['google-plus'] = array('Google+', 'gplus');
    $profile_fields['instagram'] = array('Instagram', 'ig');
    $profile_fields['vk'] = array('Vk', 'vk');

    return $profile_fields;

}

function travellers_contact_methods($profile_fields) {
    $array = travellers_contact_options();
    foreach ( $array as $key => $value) {
        $profile_fields[$key] = $value[0];
    }
    return apply_filters('travellers_contact_methods',$profile_fields);
}

function travellers_get_user_contacts_list(){
    global $post;
    $array = travellers_contact_options();
    echo '<ul class="list-inline">';
    foreach ($array as $key => $value) {
        $link = get_user_meta( get_the_author_meta( 'ID' ), $key, true );
        echo ($link != '')?'<li><a class="'.esc_attr($value[1]).'" href="'.esc_url($link).'" title="'.esc_attr($value[0]).'"><i class="fa fa-'.esc_attr($key).'"></i></a></li>' : '';
    }
    echo '</ul>';
}