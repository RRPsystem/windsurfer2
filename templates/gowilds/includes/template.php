<?php 
add_editor_style( array( 'style.css', get_template_directory(), 'style.css' ) );

// Set default width content*
if ( ! isset( $content_width ) ) $content_width = 900;

// Add support in theme
add_theme_support( 'post-thumbnails' ); 
set_post_thumbnail_size( 500, 360, true );
add_theme_support( 'automatic-feed-links' );
add_image_size('gowilds_medium', 550, 660, true );
remove_image_size('1536x1536');
remove_image_size('2048x2048');

// Set Global Theme Options
if(!function_exists('gowilds_theme_option')){
	function gowilds_theme_option(){
		global $gowilds_theme_options;
		$gowilds_theme_options = get_option( 'gowilds_theme_options' );
	}
}    
add_action('wp_head', 'gowilds_theme_option', 99);

function gowilds_admin_scripts() {
	wp_enqueue_style('gowilds-be-style', GOWILDS_THEME_URL . '/includes/assets/css/admin.css');
	wp_enqueue_script('gowilds-be-script', GOWILDS_THEME_URL . '/includes/assets/js/admin.js', 'jquery', '1.0', TRUE);
	wp_enqueue_style('line-awesome', GOWILDS_THEME_URL . '/assets/css/line-awesome/css/line-awesome.min.css');
}
add_action('admin_enqueue_scripts', 'gowilds_admin_scripts');

//  Customize header
function gowilds_custom_header_setup() {
	add_theme_support( 'custom-header', apply_filters( 'gowilds_custom_header_args', array(
	  'default-text-color'     => 'fff',
	  'width'                  => 1260,
	  'height'                 => 240,
	  'flex-height'            => true,
	  'wp-head-callback'       => 'gowilds_header_style',
	  'admin-head-callback'    => 'gowilds_admin_header_style',
	  'admin-preview-callback' => 'gowilds_admin_header_image',
	) ) );
}
add_action( 'after_setup_theme', 'gowilds_custom_header_setup' );

function gowilds_header_style(){
	$text_color = get_header_textcolor();
	$image = get_header_image();
	if($image){
	?>
		<style>header{ background: url('<?php echo esc_url($image) ?>')!important; }</style>
	<?php
	}
}

add_theme_support( 'custom-background', apply_filters( 'gowilds_custom_background_args', array(
	 'default-color' => 'f5f5f5',
) ) );
add_theme_support( 'title-tag' );


//	Registry menu
register_nav_menus( array(
	'primary'      => esc_html__( 'Main menu', 'gowilds' ),
));


function gowilds_posted_on($show_cat = false) {
	global $post;
	$author_name = get_the_author_meta( 'display_name', $post->post_author );
	if ( is_sticky() && is_home() && ! is_paged() ) {
		echo '<span class="featured-post hidden">' . esc_html__( 'Sticky', 'gowilds' ) . '</span>';
	}
	echo '<div class="clearfix meta-inline post-meta-1">';
		echo( '<span class="author vcard"><i class="fas fa-user-circle"></i>' . $author_name . '</span>');
		if(comments_open()){
			echo '<span class="post-comment"><i class="fas fa-comments"></i>';
				echo comments_number( esc_html__('0 Comments', 'gowilds'), esc_html__('1 Comment', 'gowilds'), esc_html__('% Comments', 'gowilds') );
			echo '</span>';
		}
		if ( in_array( 'category', get_object_taxonomies( get_post_type() ) ) && is_single() && $show_cat ){
			echo '<span class="cat-links"><i class="fas fa-tags"></i>' . get_the_category_list( _x( ", ", "Used between list items, there is a space after the comma.", "gowilds" ) ) . '</span>';
		}
	echo '</div>';  
}

function gowilds_posted_on_width_avata() {
	echo '<div class="left">';
		echo get_avatar( get_the_author_meta( 'ID' ), 160 ); 
	echo '</div>';
	echo '<div class="right">';    
		echo( '<span class="author vcard"><i class="fas fa-user-circle"></i>' . esc_html__('by', 'gowilds') . '&nbsp;' . get_the_author() . '</span>');
		  if(comments_open()){
				echo '<span class="post-comment"><i class="fas fa-comments"></i>';
					echo comments_number( esc_html__('0 comments', 'gowilds'), esc_html__('1 comment', 'gowilds'), esc_html__('% comments', 'gowilds') );
				echo '</span>';
		  	}
	echo '</div>';    
}

function gowilds_pagination( $query = false ){
	global $wp_query;   
	$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : ( ( get_query_var( 'page' ) ) ? get_query_var( 'page' ) : 1 );
	if( ! $query ) $query = $wp_query;
	$translate['prev'] =  esc_html__('Prev page', 'gowilds');
	$translate['next'] =  esc_html__('Next page', 'gowilds');
	$translate['load-more'] = esc_html__('Load more', 'gowilds');
	$query->query_vars['paged'] > 1 ? $current = $query->query_vars['paged'] : $current = 1;  
	if( empty( $paged ) ) $paged = 1;
	$prev = $paged - 1;                         
	$next = $paged + 1;
	$end_size = 1;
	$mid_size = 2;
	$show_all = false;
	$dots = false;
	if( ! $total = $query->max_num_pages ) $total = 1;
	  
	$output = '';
	if( $total > 1 ){   
		$output .= '<div class="column one pager_wrapper">';
			$output .= '<div class="pager">';
				$output .= '<div class="paginations">';
					if($paged >1 && !is_home()){
						$output .= '<a class="prev_page" href="'. previous_posts(false) .'"><i class="fas fa-arrow-left"></i></a>';
					}
					for($i=1; $i <= $total; $i++){
						if ($i == $current){
							$output .= '<a href="'. get_pagenum_link($i) .'" class="page-item active">'. $i .'</a>';
							$dots = true;
						} else {
							if ($show_all || ( $i <= $end_size || ( $current && $i >= $current - $mid_size && $i <= $current + $mid_size ) || $i > $total - $end_size )){
								$output .= '<a href="'. get_pagenum_link($i) .'" class="page-item">'. $i .'</a>';
								$dots = true;
							} elseif ( $dots && ! $show_all ) {
								$output .= '<span class="page-item">... </span>';
								$dots = false;
							}
						}
					}
					if($paged < $total && !is_home()){
						$output .= '<a class="next_page" href="'. next_posts(0,false) .'"><i class="fas fa-arrow-right"></i></a>';
					}
				$output .= '</div>';
			$output .= '</div>';
		$output .= '</div>'."\n";    
	}
	return $output;
}

function gowilds_post_nav() {
	$previous = ( is_attachment() ) ? get_post( get_post()->post_parent ) : get_adjacent_post( false, '', true );
	$next     = get_adjacent_post( false, '', false );
	if ( ! $next && ! $previous ) { return; }
	?>
	<nav class="navigation hidden post-navigation" role="navigation">
	  	<h1 class="screen-reader-text"><?php esc_html__( 'Post navigation', 'gowilds' ); ?></h1>
	  	<div class="nav-links">
			<?php
			 	if ( is_attachment() ) :
					previous_post_link( '%link', '<span class="meta-nav">'. esc_html__('Published In', 'gowilds') .'</span><span class="title"></span>' );
			 	else :
					previous_post_link( '%link', '<span class="meta-nav prev"><i class="fas fa-chevron-left"></i>'.esc_html__('Previous Post', 'gowilds') .'</span><span class="title prev"></span>' );
					next_post_link( '%link', '<span class="meta-nav next">'.esc_html__('Next Post', 'gowilds') .'<i class="fas fa-chevron-right"></i></span><span class="title next"></span>' );
			 	endif;
			?>
	  	</div>
	</nav>
	<?php
}
