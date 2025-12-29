<article id="post-<?php the_ID(); ?>" <?php post_class('post-wrap'); ?>>
    <?php if(has_post_thumbnail()): ?>
	    <div class="post-img">
	        <?php the_post_thumbnail(); ?>
	    </div>
    <?php endif; ?>
    <div class="post-content">
        <?php the_content(); ?>

        <?php
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

		?>
    </div>
</article>