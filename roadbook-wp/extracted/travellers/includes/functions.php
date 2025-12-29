<?php
include TRAVELLERS_DIR.'/includes/template-tags.php';
include TRAVELLERS_DIR.'/includes/scripts.php';
include( TRAVELLERS_DIR.'/includes/styles.php' );
if( function_exists('is_woocommerce') ){
include TRAVELLERS_DIR.'/includes/woo-functions.php';
}
function travellers_get_post_categories(){
	global $post;
	$categories_list = get_the_category_list( _x( ', ', 'Used between list items, there is a space after the comma.', 'travellers' ) );
		if ( $categories_list ) {
			return sprintf( '%1$s',
				$categories_list
			);
		}
}

function travellers_get_post_author(){
	global $post;
	
	return sprintf( '<span class="byline"><span class="author vcard"><span class="screen-reader-text">%1$s </span><a class="url fn n" href="%2$s"><i class="fa fa-user"></i><b>%3$s</b></a></span></span>',
		_x( 'Author', 'Used before post author name.', 'travellers' ),
		esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
		get_the_author()
	);
		
}

function travellers_get_post_date(){
	global $post;
	
	$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';

		if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
			$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
		}

		$time_string = sprintf( $time_string,
			esc_attr( get_the_date( 'c' ) ),
			get_the_date('jS F Y'),
			esc_attr( get_the_modified_date( 'c' ) ),
			get_the_modified_date()
		);

		return sprintf( '<span class="posted-on"><span class="screen-reader-text">%1$s </span><a href="%2$s" rel="bookmark"><i class="fa fa-calendar"></i><b>%3$s</b></a></span>',
			_x( 'Posted on', 'Used before publish date.', 'travellers' ),
			esc_url( get_permalink() ),
			$time_string
		);
		
}

function travellers_get_post_comment(){ //765249, 478991 - 1610388599
	global $post;
	return sprintf( _nx( '0', '%1$s', get_comments_number(), 'comments title', 'travellers' ), number_format_i18n( get_comments_number() ) );
}

// Content excerpt length
function travellers_excerpt_length( $length ) {
	$excerpt_length = ot_get_option('excerpt_length', 75);
	return esc_attr(get_theme_mod( 'excerpt_length', $excerpt_length ));
}
add_filter( 'excerpt_length', 'travellers_excerpt_length', 999 );

function travellers_read_more_link( $more ) {
	$read_more_text = ot_get_option('readmore_text', 'Read More');
	return '<a class="btn btn-primary" href="'.get_permalink().'">'.esc_attr($read_more_text).'</a>';
}
add_filter( 'the_content_more_link', 'travellers_read_more_link' );

function travellers_excerpt_more( $more ){
	return '';
}
add_filter('excerpt_more', 'travellers_excerpt_more');

function travellers_get_social_share_box(){	
	global $post;
	// Get current page URL 
	$URL = urlencode(get_permalink());

	// Get current page title
	$Title = str_replace( ' ', '%20', get_the_title());
	
	// Get Post Thumbnail for pinterest
	if( has_post_thumbnail($post->ID) ){
		$Thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'full' );
		$thumburl = $Thumbnail[0];
	}else{
		$thumburl = '';
	}
	

	$facebookURL = 'https://www.facebook.com/sharer/sharer.php?u='.esc_url($URL);
	
	$pinterestURL = 'https://pinterest.com/pin/create/button/?url='.esc_url($URL).'&amp;media='.$thumburl.'&amp;description='.$Title; 
	$twitterURL = 'https://twitter.com/intent/tweet?text='.$Title.'&amp;url='.esc_url($URL).'&amp;via=themeperch';

	return '<div class="media-box">
                <a href="#" class="fa fa-share-alt meta-icon"> </a> 
                <ul>
                    <li> <a target="_blank" href="'.esc_url($twitterURL).'" class="fa fa-twitter"> </a> </li>
                    <li> <a target="_blank" href="'.esc_url($facebookURL).'" class="fa fa-facebook"> </a> </li>                   
                    <li> <a target="_blank" href="'.esc_url($pinterestURL).'" class="fa fa-pinterest"> </a> </li>                                           
                </ul>
            </div>';
}

function travellers_post_meta(){

	if ( in_array( get_post_type(), array( 'post', 'attachment' ) ) ) {
		echo '<div class="blog-meta"><ul class="list-inline">';
	                
	    echo '<li class="meta-author"> '.travellers_get_post_author().' </li>';
	    echo '<li class="meta-date"> '.travellers_get_post_date().' </li>';
	    echo '<li class="meta-category"> <i class="fa fa-link"></i> <b>'.travellers_get_post_categories().'</b> </li>';
	    echo (function_exists('get_simple_likes_button'))? '<li class="meta-like"> '.get_simple_likes_button(get_the_ID()).' </li>' : '';
	    if ( ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
		    echo '<li class="meta-comment"> <a href="'.get_comments_link().'"> <i class="fa fa-comments-o"></i> <b>'.get_comments_number(get_the_ID()).'</b> </a> </li>';
		}
	    echo (function_exists('getPostViews'))? '<li class="meta-view"> <a href="#"> <i class="fa fa-eye"></i> <b>'.getPostViews(get_the_ID()).'</b> </a> </li>' : '';

	    echo '</ul></div>';
	}
}

function travellers_post_nav(){
	$navigation = '';
	$navigation = '';
 
    $previous = get_previous_post_link('<div class="post-previous">&laquo; %link</div>');
 
    $next = get_next_post_link( '<div class="post-next">%link &raquo;</div>');
 
    // Only add markup if there's somewhere to navigate to.
    if ( $previous || $next ) {
        $navigation = _navigation_markup( $previous . $next, 'post-navigation', '' );
    }
 
	echo force_balance_tags($navigation);
}



if(!( function_exists('travellers_pagination') )){
	function travellers_pagination($pages = '', $range = 2){
		$showitems = ($range * 2)+1;
		
		global $paged, $wp_query;
		if(empty($paged)) $paged = 1;
		
		if($pages == ''){
			global $wp_query;
			$pages = $wp_query->max_num_pages;
				if(!$pages) {
					$pages = 1;
				}
		}
		
		$output = '';
			
		if(1 != $pages){
			$output .= "<div class='pagination-wrapper'><ul class='pagination-1'>";
			if($paged > 2 && $paged > $range+1 && $showitems < $pages) $output .= "<li><a href='".get_pagenum_link(1)."' aria-label='Previous'>&laquo;</a></li> ";
			
			for ($i=1; $i <= $pages; $i++){
				if (1 != $pages &&( !($i >= $paged+$range+1 || $i <= $paged-$range-1) || $pages <= $showitems )){
					$output .= ($paged == $i)? "<li><a  class='active' href='".get_pagenum_link($i)."'>".$i."</a></li> ":"<li><a href='".get_pagenum_link($i)."'>".$i."</a></li> ";
				}
			}
		
			if ($paged < $pages-1 &&  $paged+$range-1 < $pages && $showitems < $pages) $output .= "<li><a href='".get_pagenum_link($pages)."' aria-label='Next'>&raquo;</a></li> ";
			$output.= "</ul></div>";
		}
		
		return $output;
	}
}

if ( ! function_exists( 'travellers_comment_nav' ) ) :
/**
 * Display navigation to next/previous comments when applicable.
 *
 * @since Twenty Fifteen 1.0
 */
function travellers_comment_nav() {
	// Are there comments to navigate through?
	if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) :
	?>
	<nav class="navigation comment-navigation" role="navigation">
		<h2 class="screen-reader-text"><?php _e( 'Comment navigation', 'travellers' ); ?></h2>
		<div class="nav-links">
			<?php
				if ( $prev_link = get_previous_comments_link( __( 'Older Comments', 'travellers' ) ) ) :
					printf( '<div class="nav-previous">%s</div>', $prev_link );
				endif;

				if ( $next_link = get_next_comments_link( __( 'Newer Comments', 'travellers' ) ) ) :
					printf( '<div class="nav-next">%s</div>', $next_link );
				endif;
			?>
		</div><!-- .nav-links -->
	</nav><!-- .comment-navigation -->
	<?php
	endif;
}
endif;

function travellers_comment_form( $args = array(), $post_id = null ) {
	if ( null === $post_id )
		$post_id = get_the_ID();

	$commenter = wp_get_current_commenter();
	$user = wp_get_current_user();
	$user_identity = $user->exists() ? $user->display_name : '';

	$args = wp_parse_args( $args );
	if ( ! isset( $args['format'] ) )
		$args['format'] = current_theme_supports( 'html5', 'comment-form' ) ? 'html5' : 'xhtml';

	$req      = get_option( 'require_name_email' );
	$aria_req = ( $req ? " aria-required='true'" : '' );
	$html_req = ( $req ? " required='required'" : '' );
	$html5    = 'html5' === $args['format'];
	$fields   =  array(
		'author' => '<div class="form-group col-sm-4"><label> * '.esc_attr(__('Name', 'travellers')).' </label>' .
		            '<input id="author" class="form-control" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) . '" ' . $aria_req . $html_req  . ' /><span class="fa fa-user"></span></div>',
		'email'  => '<div class="form-group col-sm-4"><label> * '.esc_attr(__('Email', 'travellers')).' </label>' .
		            '<input id="email" class="form-control" name="email" ' . ( $html5 ? 'type="email"' : 'type="text"' ) . ' value="' . esc_attr(  $commenter['comment_author_email'] ) . '" aria-describedby="email-notes"' . $aria_req . $html_req  . ' /><span class="fa fa-envelope"></span></div>',
		'url'    => '<div class="form-group col-sm-4"><label>  '.esc_attr(__('Website', 'travellers')).' </label>' .
		            '<input id="url" class="form-control" name="url" ' . ( $html5 ? 'type="url"' : 'type="text"' ) . ' value="' . esc_attr( $commenter['comment_author_url'] ) . '" /><span class="fa fa-globe"></span></div>',
	);

	$required_text = sprintf( ' ' . __('Required fields are marked %s', 'travellers'), '<span class="required">*</span>' );

	/**
	 * Filter the default comment form fields.
	 *
	 * @since 3.0.0
	 *
	 * @param array $fields The default comment fields.
	 */
	$fields = apply_filters( 'comment_form_default_fields', $fields );
	$defaults = array(
		'fields'               => $fields,
		'comment_field'        => '<div class="form-group no-label col-sm-12"><textarea class="form-control message input-message" placeholder="'.__('Write your comment here...', 'travellers').'" id="comment" name="comment"  rows="3" cols="60"  aria-required="true" required="required"></textarea><span class="fa fa-pencil"></span></div>',
		/** This filter is documented in wp-includes/link-template.php */
		'must_log_in'          => '<p class="must-log-in">' . sprintf( __( 'You must be <a href="%s">logged in</a> to post a comment.', 'travellers' ), wp_login_url( apply_filters( 'the_permalink', get_permalink( $post_id ) ) ) ) . '</p>',
		/** This filter is documented in wp-includes/link-template.php */
		'logged_in_as'         => '<p class="logged-in-as">' . sprintf( __( '<a href="%1$s" aria-label="Logged in as %2$s. Edit your profile.">Logged in as %2$s</a>. <a href="%3$s">Log out?</a>', 'travellers' ), get_edit_user_link(), $user_identity, wp_logout_url( apply_filters( 'the_permalink', get_permalink( $post_id ) ) ) ) . '</p>',
		'comment_notes_before' => '<p>'.__('Your email address will not be published. Required fields are marked * ', 'travellers').'</p>',
		'comment_notes_after'  => '',
		'id_form'              => 'commentform',
		'id_submit'            => 'submit',
		'class_form'           => 'comment-form',
		'class_submit'         => 'submit btn btn-primary btn-lg',
		'name_submit'          => 'submit',
		'title_reply'          => __( 'Leave a Reply', 'travellers' ),
		'title_reply_to'       => __( 'Leave a Reply to %s', 'travellers' ),
		'title_reply_before'   => '<h2 id="reply-title" class="comment-reply-title comment-reply-title">',
		'title_reply_after'    => '</h2>',
		'cancel_reply_before'  => ' <small>',
		'cancel_reply_after'   => '</small>',
		'cancel_reply_link'    => __( 'Cancel reply', 'travellers' ),
		'label_submit'         => __( 'Post Comment', 'travellers' ),
		'submit_button'        => '<input name="%1$s" type="submit" id="%2$s" class="%3$s submit" value="%4$s" />',
		'submit_field'         => '<p class="form-submit">%1$s %2$s</p>',
		'format'               => 'xhtml',
	);

	/**
	 * Filter the comment form default arguments.
	 *
	 * Use 'comment_form_default_fields' to filter the comment fields.
	 *
	 * @since 3.0.0
	 *
	 * @param array $defaults The default comment form arguments.
	 */
	$args = wp_parse_args( $args, apply_filters( 'comment_form_defaults', $defaults ) );

	// Ensure that the filtered args contain all required default values.
	$args = array_merge( $defaults, $args );

	if ( comments_open( $post_id ) ) : ?>
	<div class="reply-wrap pt-40">
		<div class="row">
        <div class="col-md-12 col-sm-12">
		<?php
		/**
		 * Fires before the comment form.
		 *
		 * @since 3.0.0
		 */
		do_action( 'comment_form_before' );
		?>
		<div id="respond" class="comment-respond">
			<?php
			echo $args['title_reply_before'];

			comment_form_title( $args['title_reply'], $args['title_reply_to'] );

			echo $args['cancel_reply_before'];

			cancel_comment_reply_link( $args['cancel_reply_link'] );

			echo $args['cancel_reply_after'];

			echo $args['title_reply_after'];

			if ( get_option( 'comment_registration' ) && !is_user_logged_in() ) :
				echo $args['must_log_in'];
				/**
				 * Fires after the HTML-formatted 'must log in after' message in the comment form.
				 *
				 * @since 3.0.0
				 */
				do_action( 'comment_form_must_log_in_after' );
			else : ?>
				
				<div id="contact_form"><form action="<?php echo site_url( '/wp-comments-post.php' ); ?>" method="post" id="<?php echo esc_attr( $args['id_form'] ); ?>" class="<?php echo esc_attr( $args['class_form'] ); ?> reply-form form-icon"<?php echo esc_attr($html5) ? ' novalidate' : ''; ?>>
					<?php
					/**
					 * Fires at the top of the comment form, inside the form tag.
					 *
					 * @since 3.0.0
					 */
					do_action( 'comment_form_top' );

					if ( is_user_logged_in() ) :
						/**
						 * Filter the 'logged in' message for the comment form for display.
						 *
						 * @since 3.0.0
						 *
						 * @param string $args_logged_in The logged-in-as HTML-formatted message.
						 * @param array  $commenter      An array containing the comment author's
						 *                               username, email, and URL.
						 * @param string $user_identity  If the commenter is a registered user,
						 *                               the display name, blank otherwise.
						 */
						echo apply_filters( 'comment_form_logged_in', $args['logged_in_as'], $commenter, $user_identity );

						/**
						 * Fires after the is_user_logged_in() check in the comment form.
						 *
						 * @since 3.0.0
						 *
						 * @param array  $commenter     An array containing the comment author's
						 *                              username, email, and URL.
						 * @param string $user_identity If the commenter is a registered user,
						 *                              the display name, blank otherwise.
						 */
						do_action( 'comment_form_logged_in_after', $commenter, $user_identity );

					else :

						echo $args['comment_notes_before'];

					endif;

					// Prepare an array of all fields, including the textarea
					$comment_fields = (array) $args['fields'] + array( 'comment' => $args['comment_field'] );

					/**
					 * Filter the comment form fields.
					 *
					 * @since 4.4.0
					 *
					 * @param array $comment_fields The comment fields.
					 */
					$comment_fields = apply_filters( 'comment_form_fields', $comment_fields );

					// Get an array of field names, excluding the textarea
					$comment_field_keys = array_diff( array_keys( $comment_fields ), array( 'comment' ) );

					// Get the first and the last field name, excluding the textarea
					$first_field = reset( $comment_field_keys );
					$last_field  = end( $comment_field_keys );
					echo '<div class="row">';
					foreach ( $comment_fields as $name => $field ) {

						if ( 'comment' === $name ) {

							/**
							 * Filter the content of the comment textarea field for display.
							 *
							 * @since 3.0.0
							 *
							 * @param string $args_comment_field The content of the comment textarea field.
							 */
							echo apply_filters( 'comment_form_field_comment', $field );

							echo $args['comment_notes_after'];

						} elseif ( ! is_user_logged_in() ) {
							

							if ( $first_field === $name ) {
								/**
								 * Fires before the comment fields in the comment form, excluding the textarea.
								 *
								 * @since 3.0.0
								 */
								do_action( 'comment_form_before_fields' );
							}

							/**
							 * Filter a comment form field for display.
							 *
							 * The dynamic portion of the filter hook, `$name`, refers to the name
							 * of the comment form field. Such as 'author', 'email', or 'url'.
							 *
							 * @since 3.0.0
							 *
							 * @param string $field The HTML-formatted output of the comment form field.
							 */
							echo apply_filters( "comment_form_field_{$name}", $field ) . "\n";

							if ( $last_field === $name ) {
								/**
								 * Fires after the comment fields in the comment form, excluding the textarea.
								 *
								 * @since 3.0.0
								 */
								do_action( 'comment_form_after_fields' );
							}

						}
					}
					echo '</div>';

					$submit_button = sprintf(
						$args['submit_button'],
						esc_attr( $args['name_submit'] ),
						esc_attr( $args['id_submit'] ),
						esc_attr( $args['class_submit'] ),
						esc_attr( $args['label_submit'] )
					);

					/**
					 * Filter the submit button for the comment form to display.
					 *
					 * @since 4.2.0
					 *
					 * @param string $submit_button HTML markup for the submit button.
					 * @param array  $args          Arguments passed to `comment_form()`.
					 */
					$submit_button = apply_filters( 'comment_form_submit_button', $submit_button, $args );

					$submit_field = sprintf(
						$args['submit_field'],
						$submit_button,
						get_comment_id_fields( $post_id )
					);

					/**
					 * Filter the submit field for the comment form to display.
					 *
					 * The submit field includes the submit button, hidden fields for the
					 * comment form, and any wrapper markup.
					 *
					 * @since 4.2.0
					 *
					 * @param string $submit_field HTML markup for the submit field.
					 * @param array  $args         Arguments passed to comment_form().
					 */
					echo apply_filters( 'comment_form_submit_field', $submit_field, $args );

					/**
					 * Fires at the bottom of the comment form, inside the closing </form> tag.
					 *
					 * @since 1.5.0
					 *
					 * @param int $post_id The post ID.
					 */
					do_action( 'comment_form', $post_id );
					?>
				</form></div>
			<?php endif; ?>
		</div><!-- #respond -->
		</div></div>
		</div>
		<?php
		/**
		 * Fires after the comment form.
		 *
		 * @since 3.0.0
		 */
		do_action( 'comment_form_after' );
	else :
		/**
		 * Fires after the comment form if comments are closed.
		 *
		 * @since 3.0.0
		 */
		do_action( 'comment_form_comments_closed' );
	endif;
}

if(!( function_exists('travellers_breadcrumbs') )){ 
	function travellers_breadcrumbs() {
		if ( is_front_page() || is_search() || is_404() ) {
			return;
		}
		global $post;
		$ancestors = array_reverse( get_post_ancestors( $post->ID ) );
		$before = '<ol class="breadcrumb breadcrumb-menubar"><li>';
		$after = '</li></ol>';
		$home_text = ot_get_option('bredcrumb_menu_prefix', 'Home');
		$home = '<a href="' . esc_url( home_url( "/" ) ) . '" rel="home">' . $home_text . '</a> / ';
		
		
		
		$breadcrumb = '';
		if ( $ancestors ) {
			foreach ( $ancestors as $ancestor ) {
				$breadcrumb .= '<a href="' . esc_url( get_permalink( $ancestor ) ) . '">' . esc_html( get_the_title( $ancestor ) ) . '</a> / ';
			}
		}
		
		if( is_home() ){
			$breadcrumb .= esc_html( get_option('blog_title','Our Blog') );
		} elseif( is_post_type_archive('product') ){
			//nothing
		} elseif( is_post_type_archive('instructor') ){
			$id = ot_get_option('instructor_archive_id');
            	if(get_post_status($id) == 'publish'){
            		$breadcrumb .=  get_the_title($id);
            	}else{
            		$breadcrumb .= __('Our instructor', 'travellers');
            	}
		} else {
			$breadcrumb .= esc_html( get_the_title( $post->ID ) );
		}
		
		return $before . $home . $breadcrumb . $after;
	}
}

add_filter( 'woocommerce_breadcrumb_defaults', 'travellers_woocommerce_breadcrumbs' );
function travellers_woocommerce_breadcrumbs() {
    return array(
            'delimiter'   => '/',
            'wrap_before' => '<ol class="breadcrumb breadcrumb-menubar">',
            'wrap_after'  => '</ol>',
            'before'      => '<li>',
            'after'       => '</li>',
            'home'        => ot_get_option('bredcrumb_menu_prefix', 'Home'),
        );
}

//travellers_comments
if( !function_exists('travellers_comments') ):
	function travellers_comments($comment, $args, $depth) {
		$GLOBALS['comment'] = $comment;
		extract($args, EXTR_SKIP);

		if ( 'div' == $args['style'] ) {
			$tag = 'div';
			$add_below = 'comment';
		} else {
			$tag = 'li';
			$add_below = 'div-comment';
		}
		
		?>
	
		<<?php echo esc_attr($tag) ?> <?php comment_class( ( $depth > 1 ) ? 'media comment-child' : 'media comment' ) ?> id="comment-<?php comment_ID() ?>">
		
		<div id="div-comment-<?php comment_ID() ?>">
			<a class="pull-left comment-avatar" href="#">
                <?php if ( $args['avatar_size'] != 0 ) echo get_avatar( $comment, $args['avatar_size'] ); ?>
            </a>

            <div class="media-body">
                <p class="comment-meta"> 
                    <?php printf( __( '<b class="author-title fn title-2 fsz-16">%s</b>', 'travellers' ), get_comment_author_link() ); ?>
                    <b class="comment-date fsz-12"> <i class="fa fa-clock-o"></i> <?php printf( __('%1$s at %2$s', 'travellers'), get_comment_date(),  get_comment_time() ); ?> </b>  
                    	<?php comment_reply_link( array_merge( $args, array( 'add_below' => $add_below, 'depth' => $depth, 'max_depth' => $args['max_depth'], 'before' => '<span class="reply fsz-12"><i class="fa fa-reply-all"></i>', 'after' => '</span>' ) ) ); ?>
                </p>

                <div class="comment-text">
                	<?php if ( $comment->comment_approved == '0' ) : ?>
						<br /><em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.', 'travellers' ); ?></em><br />						
					<?php endif; ?>	
                	<?php comment_text(); ?>
                	<?php edit_comment_link( __( '(Edit)', 'travellers' ), '  ', '' ); ?>
                </div>    

                                                                                                          
            </div>

			
		</div>

	<?php
	}
endif;
/* Layout option for travellers */
function travellers_layout_option_values( $options = array() ){
	global $wp_query;

	$post_id = get_the_ID();
	
	if( is_page() ):		
		$layout = get_post_meta( get_the_ID(), 'page_layout', true );
		if(!$layout) $layout = 'rs';
		$sidebar = 	get_post_meta( get_the_ID(), 'sidebar', true );	
		$sidebar = ( $sidebar== '' )? 'sidebar-1' : $sidebar;
	elseif( is_single() ):
		$layout = ot_get_option('single_layout', 'rs');	
		$sidebar = 	ot_get_option( 'blog_single_sidebar', 'sidebar-1' );	
	else:
		$layout = ot_get_option('blog_layout', 'rs');
		$sidebar = 	ot_get_option( 'blog_sidebar', 'sidebar-1' );

		if( is_singular() && 'post' == get_post_type() ){
			$layout = ot_get_option('single_layout', 'rs');
			$sidebar = 	ot_get_option( 'blog_single_sidebar', 'sidebar-1' );
		}
	endif;

	

	$post_types = ['tour', 'location'];
	foreach ($post_types as $post_type) {
		if( $post_type == get_post_type() ){
			$layout = ot_get_option($post_type.'_layout', 'rs');
			$sidebar = 	ot_get_option( $post_type.'_sidebar', 'sidebar-1' );
			if( is_singular($post_type) ){
				$layout = ot_get_option($post_type.'_single_layout', 'rs');
				$sidebar = 	ot_get_option( $post_type.'_single_sidebar', 'sidebar-1' );
			}
		}
	}	
	

	if(function_exists('is_woocommerce') && 'product' == get_post_type()):
		if( function_exists('is_woocommerce') ){
			if( (get_post_type() == 'product') ):
				$post_id = get_option( 'woocommerce_shop_page_id' );	
			endif;
		}
		$layout = get_post_meta( $post_id, 'page_layout', true );
		$sidebar = 	get_post_meta( $post_id, 'sidebar', true );	
		$sidebar = ( $sidebar== '' )? 'sidebar-1' : $sidebar;

	endif;
	

	$layout = ( $layout == '' )	? 'full' : $layout;

	$options['layout'] = $layout;

	if( isset($_GET['layout']) && ($_GET['layout'] != '') ){
		$options['layout'] = $_GET['layout'];
	}
	$options['sidebar'] = ( $layout != 'full' )? $sidebar : '';



	return apply_filters(  'travellers_layout_option_values', $options );
	
}

function travellers_get_layout(){
	global $wp_query;
    return $wp_query->travellers['layout'];
}

function travellers_get_sidebar_id(){
	global $wp_query;
    return $wp_query->travellers['sidebar'];
}

//add layout option
function travellers_body_class($classes ){
	global $wp_query;
	$wp_query->travellers = travellers_layout_option_values();
	if ( is_page_template( 'templates/one-page.php' ) ) {		
		$classes[] = 'one-page-layout';		
	}else{
		$classes[] = 'multi-page-layout';
	}

	$boxed_mode = ot_get_option('boxed_mode', 'off');
	$classes[] = (($boxed_mode == 'on') || ( isset($_GET['boxed']) && ($_GET['boxed'] == 'on')) )? 'boxed' : 'wide';

	return $classes;
}
add_filter( 'body_class', 'travellers_body_class' );

function travellers_password_form() {
    global $post;
    $label = 'pwbox-'.( empty( $post->ID ) ? rand() : $post->ID );
    $o = '<form action="' . esc_url( site_url( 'wp-login.php?action=postpass', 'login_post' ) ) . '" method="post">
    ' . __( "To view this protected post, enter the password below:", "travellers" ) . '
    <div class="row"><div class="col-md-6"><input class="post-password-input form-control" name="post_password" placeholder="' . __( "Password:", "travellers" ) . '" id="' . $label . '" type="password" size="20" maxlength="20" /></div><div class="col-md-6 form-submit"><input type="submit" class="submit btn btn-primary btn-lg submit" name="Submit" value="' . esc_attr__( "Submit", "travellers" ) . '" /></div></div>
    </form><br></br>
    ';
    return $o;
}
add_filter( 'the_password_form', 'travellers_password_form' );

function travellers_contact_modal($atts){
	global $wp_query;
    $wp_query->travellers['contact_modal'][] = $atts;
   
	add_action( 'wp_footer', 'travellers_contact_modal_callback', 100 );
}

function travellers_contact_modal_callback() {
	global $wp_query;
	$atts = $wp_query->travellers['contact_modal'];
	foreach ($atts as $key => $value) {
		extract($value);
	
		$logo = ot_get_option('logo', TRAVELLERS_URI.'/images/company-blue.png');
	    echo '<div class="modal fade popups-wrap popups-dark white-clr" id="booking-popup-'.esc_attr($id).'" tabindex="-1" role="dialog" aria-hidden="true">
	            <div class="modal-dialog">  
	                <div class="modal-content" style="background-image: url('.esc_url($bg).')">   
	                    <button type="button" class="close close-btn popup-cls" data-dismiss="modal" aria-label="Close"> <i class="fa-times fa"></i> </button>
	                    <div class="booking-wrap"> 
	                        <div class="col-sm-12 text-center">  
	                            <a title="'.get_bloginfo( 'name' ).'" href="'.esc_url( home_url( '/' ) ).'"><img class="img-responsive" src="'.esc_url($logo).'" alt="'.get_bloginfo( 'name' ).'" width="185" height="65"></a>
	                            <h2 class="section-title">'.esc_attr($title).'</h2>
	                            <div  id="contact-booking" class="booking-form">  
	                                '.do_shortcode($shortcode).'

	                            </div>                       
	                        </div>
	                    </div>
	                </div>
	            </div>
	        </div>
	        <!-- /Popup: Login-Dark --> ';
      }
}

function travellers_event_modal($atts){
	global $wp_query;
    $wp_query->travellers['event_modal'][] = $atts;
	add_action( 'wp_footer', 'travellers_event_modal_callback', 100 );
}

function travellers_event_modal_callback() {
	global $wp_query;
	$atts = $wp_query->travellers['event_modal'];
	foreach ($atts as $key => $value) {
		extract($value);

		$tagname = 'iframe';
		echo '<!-- Popup: Register -->
        <div class="modal fade" id="event-brite-'.esc_attr($id).'" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-lg"> 
                <section  class="popup-register">
                    <button type="button" class="close close-btn" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <div class="section-title">
                        <h3>'.travellers_parse_text($title, array('tag' => 'small')).'</h3>
                    </div>
                    <form id="registration-form" name="registration-form" class="registration-form" action="#" method="post">
                        <'.esc_attr($tagname).'  src="//eventbrite.com/tickets-external?eid='.esc_attr($eid).'&ref=etckt"></'.esc_attr($tagname).'>
                    </form>                  
                </section>
            </div>
        </div>
        <!-- /Popup: Register -->';
	}
    
}

/*Single Posts Tag & Size*/

function travellers_get_post_title_tag(){
    $tag = ot_get_option('single_post_title_tag', 'h2');
    $tag = ( $tag != '' )? $tag : 'h2';
    return esc_attr($tag);
}
function travellers_post_title_before(){
    $tag = travellers_get_post_title_tag();
    $tag_size = ot_get_option('single_post_title_tag_size', 'entry-title'); 
    $tag_size = ($tag_size != 'entry-title' )?  $tag.'-'.$tag_size : $tag_size;    
    return sprintf( '<%s class="%s">', $tag, $tag_size );
}
function travellers_post_title_after(){
    $tag = travellers_get_post_title_tag();
    return sprintf('</%s>', $tag);
}

add_action( 'wp_footer', 'travellers_footer_template_parts' );
function travellers_footer_template_parts(){
	get_template_part( 'footer/terms-conditions' );
	get_template_part( 'footer/back-to-top' );
}