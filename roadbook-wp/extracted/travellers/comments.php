<?php
/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
}
?>



    

	<?php if ( have_comments() ) : ?>
		<!-- Comment Starts -->
 		<div id="comments" class="comment-wrap"> 
			<h2>
			<?php
				printf( _nx( '1 Comment', '%1$s Comments', get_comments_number(), 'comments title', 'travellers' ),
					number_format_i18n( get_comments_number() ) );
			?>
			</h2>

		<?php travellers_comment_nav(); ?>
		<div class="comments">
		<ol class="comment-list comments-box clearfix">
			<?php
				wp_list_comments( array(
					'style'       => 'ol',
					'short_ping'  => true,
					'avatar_size' => 80,
					'callback' => 'travellers_comments'
				) );
			?>
		</ol><!-- .comment-list -->
		</div>

		<?php travellers_comment_nav(); ?>
		</div><!-- .comment-wrap -->
	<?php endif; // have_comments() ?>

	<?php
	// If comments are closed and there are comments, let's leave a little note, shall we?
	if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) :
		?>
		<div id="comments" class="comment-wrap"> <p class="no-comments">
			<?php _e( 'Comments are closed.', 'travellers' ); ?></p>
		</div>

	<?php endif; ?>

	


