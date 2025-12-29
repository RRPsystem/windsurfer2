<?php
/**
 * Template Name: VC Template - only display content
 *
 * Description: A page template that provides a key component of WordPress as a CMS
 * by meeting the need for a carefully crafted introductory page. The front page template
 * in landx consists of a page content area for adding text, images, video --
 * anything you'd like -- followed by front-page-only widgets in one or two columns.
 *
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php if ( is_singular() && pings_open( get_queried_object() ) ) : ?>
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<?php endif; ?>
    <?php travellers_favico_icon(); ?>
	<?php wp_head(); ?>
</head>
<body  id="top" <?php body_class(); ?>>
    <?php if( function_exists('wp_body_open') ) wp_body_open(); ?>
	<?php if ( have_posts() ) : ?>
        <?php
        // Start the loop.
        while ( have_posts() ) : the_post();
           
           the_content();

            // End the loop.
        endwhile;
       
        // If no content, include the "No posts found" template.
        else :
        get_template_part( 'templates/content', 'none' );
    endif;
    ?>
    <?php $back_to_top = ot_get_option('backtotop', 'on');
        if($back_to_top == 'on'):?>
            <a href="#top" class="top BGprime"><i class="fa fa-angle-up fa-lg"></i></a>
        <?php endif;?>
<?php if( ot_get_option('terms_display', 'on') == 'on' ): ?>

     <!-- ::: Terms & Conditions Content ::: -->

        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">

            <div class="modal-dialog" role="document">

                <div class="modal-content">

                    <div class="modal-header">

                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                        <h4 class="modal-title" id="myModalLabel"><?php echo esc_attr( ot_get_option('terms_title', 'Terms & Conditions') ) ?></h4>

                    </div>

                    

                    <div class="modal-body">

                        <?php 

                        $term_details = ot_get_option( 'terms_details', ' <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id turpis sit amet enim rutrum placerat vel sit amet risus. Nulla ultricies dolor quis quam scelerisque aliquet. Praesent fermentum in lectus non lobortis. Sed sit amet tincidunt libero. Suspendisse euismod metus lobortis, ultrices augue id, dictum elit. Proin vehicula euismod nisl id iaculis. Nunc ac nisi ex. Sed nisl libero, accumsan vel fringilla quis, accumsan sit amet sem.</p>' );

                            echo force_balance_tags($term_details);

                         ?>

                    </div>

                    <div class="modal-footer">

                        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>

                    </div>

                </div><!-- /.modal-content -->

            </div><!-- /.modal-dialog -->

        </div><!-- /.modal -->

        <!-- ::: Terms end ::: -->

    <?php endif; ?>
<?php wp_footer(); ?>
</body>
</html>