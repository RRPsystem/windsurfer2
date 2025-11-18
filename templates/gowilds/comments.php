<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 */
?>

<?php
	if ( post_password_required() ){
		return;
	}
?>
<div id="comments">

	<?php if ( have_comments() ) { ?>
	  	
	  	<h2 class="comments-title">
			<?php 
				printf( 
					_nx( 
						'One thought on &ldquo;%2$s&rdquo;',
						'%1$s thoughts on &ldquo;%2$s&rdquo;',
						get_comments_number(),
						'comments title',
						'gowilds'
					),
					number_format_i18n(get_comments_number()), get_the_title() 
				);
			?>
	  </h2>
		  
	  	<div class="gav-comment-list clearfix">
		 	
		 	<ol class="pingbacklist">
		 		<?php wp_list_comments( array( 'type' => 'pings', 'callback' => 'gowilds_comment_template', 'short_ping'  => true ) ); ?>
		 	</ol>
		 	<ol class="comment-list">
		 		<?php wp_list_comments('type=comment&callback=gowilds_comment_template'); ?>
		 	</ol>
		 	
		 	<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : ?>
			 	<footer class="navigation comment-navigation" role="navigation">
				  	<div class="previous"><?php previous_comments_link( esc_html__( '&larr; Older Comments', 'gowilds') ); ?></div>
				  	<div class="next right"><?php next_comments_link( esc_html__( 'Newer Comments &rarr;', 'gowilds') ); ?></div>
			 	</footer>
		 	<?php endif; ?>

		 	<?php if ( ! comments_open() && get_comments_number() ) : ?>
			  	<p class="no-comments"><?php echo esc_html__( 'Comments are closed.' , 'gowilds'); ?></p>
		 	<?php endif; ?>
		 	
	  	</div>

	<?php } ?>

	<?php
		global $post;
		$aria_req = ( $req ? " aria-required='true'" : '' );

		$comment_field = '<div class="form-group cm-your-comment">';
			$comment_field .= '<textarea placeholder="' . esc_attr__('Write Your Comment', 'gowilds') . '" rows="5" id="comment" class="form-control"  name="comment"'.$aria_req.'></textarea>';
		$comment_field .=  '</div>';
		
		$author_field = '<div class="form-group cm-your-name">';
		  $author_field .= '<input type="text" name="author" placeholder="'.esc_attr__('Your Name *', 'gowilds').'" class="form-control" id="author" value="' . esc_attr( $commenter['comment_author'] ) . '" ' . $aria_req . ' />';
		$author_field .= '</div>';

		$email_field = '<div class="form-group cm-your-email">';
		  $email_field .= '<input id="email" name="email" placeholder="'.esc_attr__('Email *', 'gowilds').'" class="form-control" type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) . '" ' . $aria_req . ' />';
		$email_field .= '</div>';
		
		
		$comment_args = array(
			'title_reply' 		=> '<span class="comments-title">' . esc_html__('Add a Comment', 'gowilds') . '</span>',
			'comment_field' => $comment_field,				
			'fields' => apply_filters('comment_form_default_fields',
				array(
				  'author' => 	$author_field,
				  'email' => $email_field,
				)
			),
			'label_submit' => esc_html__('Post Comment', 'gowilds'),
			'comment_notes_before' => '<div class="form-group h-info">'.esc_html__('Your email address will not be published.','gowilds').'</div>',
			'comment_notes_after' => '',
		);
	?>

	<?php if('open' == $post->comment_status){ ?>
	<div class="comment-form-main">
		<div class="comment-form-inner">
			<?php gowilds_comment_form($comment_args); ?>
		</div>
	 </div>
	<?php } ?>
</div>
