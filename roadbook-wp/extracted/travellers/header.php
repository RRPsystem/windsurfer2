<?php
/**
 * The template for displaying the header
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php if ( is_singular() && pings_open( get_queried_object() ) ) : ?>
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<?php endif; ?>
	<?php wp_head(); ?>
</head>
<body id="top" <?php body_class(); ?>>
<?php if( function_exists('wp_body_open') ) wp_body_open(); ?>
	
    <!-- ::: START HEADER ::: -->
    <header id="home" class="affix">
        <div class="container">
            <div class="row">
                <div class="col-md-3 col-sm-12 col-xs-12 logo">
                    <?php
                    $logo = ot_get_option('logo', TRAVELLERS_URI.'/images/company-blue.png');
                    ?>
                    <a title="<?php bloginfo( 'name' ); ?>" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
                    <img class="img-responsive" src="<?php echo esc_url($logo) ?>" width="185" height="65" alt="<?php bloginfo( 'name' ); ?>" /></a>
                </div>
                <div class="col-md-9 col-sm-12 col-xs-12 cbp-af-inner rightnav">
                    <nav class="navbar navbar-default">
                        <!-- Brand and toggle get grouped for better mobile display -->
                        <div class="navbar-header">
                            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#menu">
                                <span class="sr-only"><?php _e('Toggle navigation', 'travellers'); ?></span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                                <span class="icon-bar"></span>
                            </button>
                        </div>

                        <?php
                            $home_li = '<li class="home active"><a href="'.esc_url( home_url( '/' ) ).'" title="Home"><i class="fa fa-home"></i></a></li>';
                            wp_nav_menu( array(
                                'theme_location' => 'primary',
                                'depth' => 4,
                                'container_id' => 'menu',
                                'container_class' => 'collapse navbar-collapse',
                                'menu_class'     => 'nav navbar-nav',
                                'walker' => new Travellers_bootstrap_navwalker(),
                                'fallback_cb'  => 'Travellers_bootstrap_navwalker::fallback'
                             ) );
                        ?>
                    </nav>
                </div>
            </div>
        </div><!-- end container -->
    </header>
    <!-- ::: END ::: -->    

    <main class="posts-wrap"> 

    <?php get_template_part( 'header/header', (is_page())? 'page' : 'post' ); ?>