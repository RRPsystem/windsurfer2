<?php
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

/**
 * Shortcode attributes
 * @var $atts
 * @var $el_class
 * @var $full_width
 * @var $full_height
 * @var $columns_placement
 * @var $content_placement
 * @var $parallax
 * @var $parallax_image
 * @var $css
 * @var $el_id
 * @var $video_bg
 * @var $video_bg_url
 * @var $video_bg_parallax
 * @var $parallax_speed_bg
 * @var $parallax_speed_video
 * @var $content - shortcode content
 * @var $css_animation
 * Shortcode class
 * @var $this WPBakeryShortCode_VC_Row
 */
$el_class = $full_height = $parallax_speed_bg = $parallax_speed_video = $full_width = $flex_row = $columns_placement = $content_placement = $parallax = $parallax_image = $css = $el_id = $video_bg = $video_bg_url = $video_bg_parallax = $css_animation = '';
$disable_element = '';
$output = $after_output = '';
$atts = vc_map_get_attributes( $this->getShortcode(), $atts );
extract( $atts );

wp_enqueue_script( 'wpb_composer_front_js' );

$el_class = $this->getExtraClass( $el_class ) . $this->getCSSAnimation( $css_animation );

if($section_type == 'section'){
	$css_classes = array(
		'vc_section',
		$el_class,
		$padding_class,
		$bg_class,
		vc_shortcode_custom_css_class( $css ),
	);
}else{
	
	$css_classes = array(
		$header_overlay,
		'vc_'.$section_type,
		$el_class,
		(($section_type == 'header') && ($header_type == 'image') )? 'header-fixed-background slider-off': '',
		(($section_type == 'header') && ($header_type == 'slider') )? 'header-slider slider-on': '',
		(($section_type == 'header') && ($header_type == 'video') )? 'header-video-background': '',
		vc_shortcode_custom_css_class( $css ),
	);
}




if ( 'yes' === $disable_element ) {
	if ( vc_is_page_editable() ) {
		$css_classes[] = 'vc_hidden-lg vc_hidden-xs vc_hidden-sm vc_hidden-md';
	} else {
		return '';
	}
}

if ( vc_shortcode_custom_css_has_property( $css, array(
		'border',
		'background',
	) ) || $video_bg || $parallax
) {
	$css_classes[] = 'vc_section-has-fill';
}


$wrapper_attributes = array();
// build attributes for wrapper
if ( ! empty( $el_id ) ) {
	$wrapper_attributes[] = 'id="' . esc_attr( $el_id ) . '"';
}
if ( ! empty( $full_width ) ) {
	
	$after_output .= '<div class="vc_row-full-width vc_clearfix"></div>';
}

if ( ! empty( $full_height ) ) {
	$css_classes[] = 'vc_row-o-full-height';
}

if ( ! empty( $content_placement ) ) {
	$flex_row = true;
	$css_classes[] = 'vc_section-o-content-' . $content_placement;
}

if ( ! empty( $flex_row ) ) {
	$css_classes[] = 'vc_section-flex';
}

$has_video_bg = ( ! empty( $video_bg ) && ! empty( $video_bg_url ) && vc_extract_youtube_id( $video_bg_url ) );

$parallax_speed = $parallax_speed_bg;
if ( $has_video_bg ) {
	$parallax = $video_bg_parallax;
	$parallax_speed = $parallax_speed_video;
	$parallax_image = $video_bg_url;
	$css_classes[] = 'vc_video-bg-container';
	wp_enqueue_script( 'vc_youtube_iframe_api_js' );
}

if ( ! empty( $parallax ) ) {
	wp_enqueue_script( 'vc_jquery_skrollr_js' );
	$wrapper_attributes[] = 'data-vc-parallax="' . esc_attr( $parallax_speed ) . '"'; // parallax speed
	$css_classes[] = 'vc_general vc_parallax vc_parallax-' . $parallax;
	if ( false !== strpos( $parallax, 'fade' ) ) {
		$css_classes[] = 'js-vc_parallax-o-fade';
		$wrapper_attributes[] = 'data-vc-parallax-o-fade="on"';
	} elseif ( false !== strpos( $parallax, 'fixed' ) ) {
		$css_classes[] = 'js-vc_parallax-o-fixed';
	}
}

if ( ! empty( $parallax_image ) ) {
	if ( $has_video_bg ) {
		$parallax_image_src = $parallax_image;
	} else {
		$parallax_image_id = preg_replace( '/[^\d]/', '', $parallax_image );
		$parallax_image_src = wp_get_attachment_image_src( $parallax_image_id, 'full' );
		if ( ! empty( $parallax_image_src[0] ) ) {
			$parallax_image_src = $parallax_image_src[0];
		}
	}
	$wrapper_attributes[] = 'data-vc-parallax-image="' . esc_attr( $parallax_image_src ) . '"';
}
if ( ! $parallax && $has_video_bg ) {
	$wrapper_attributes[] = 'data-vc-video-bg="' . esc_attr( $video_bg_url ) . '"';
}

if(($section_type == 'header') && ($header_type == 'image')){
	$wrapper_attributes[] = 'style="background-image: url('.esc_url($header_image_bg).')"';
}

if(($section_type == 'header') && ($header_type == 'slider') ){
	$header_slider_imagesArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($header_slider_images) : array();
	$slides = array();
	if( !empty($header_slider_imagesArr) ){		
		foreach ($header_slider_imagesArr as $key => $value) {
			$slides[]['src'] = $value['image'];
		}
	}
	$wrapper_attributes[] = 'data-slides='.json_encode($slides);
}

$video_content = '';
if(($section_type == 'header') && ($header_type == 'video') ){

	$header_videoArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($header_video) : array();

	$video_content .= '<video autoplay="autoplay" loop="loop" poster="'.esc_url($header_video_poster).'">';
	foreach ($header_videoArr as $key => $value) {
			$video_content .= '<source src="'.esc_url($value['video']).'" type="video/'.esc_attr($value['format']).'">';
		}
	$video_content .= '</video>';
	
}

$section_type = ($section_type)? $section_type : 'section';

$css_class = preg_replace( '/\s+/', ' ', apply_filters( VC_SHORTCODE_CUSTOM_CSS_FILTER_TAG, implode( ' ', array_filter( array_unique( $css_classes ) ) ), $this->settings['base'], $atts ) );
$wrapper_attributes[] = 'class="' . esc_attr( trim( $css_class ) ) . '"';

$header_content = '';

if(($section_type == 'header') && ($header_type == 'slider') ){
	$header_slider_imagesArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($header_slider_images) : array();
	$slides = array();
	$header_content = '<ul class="slides-container">';
	if( !empty($header_slider_imagesArr) ){		
		foreach ($header_slider_imagesArr as $key => $value) {
			$image_sm = !empty($value['image_sm'])? '<source media="(max-width:767px)" srcset="'.esc_url($value['image_sm']).'">' : '';
			$header_content .= '<li><picture>'.$image_sm.'
                    <img src="'.$value['image'].'" alt="'.$value['title'].'">
					</picture></li>';
		}
	$header_content .= '</ul>';	
	}
	
}

if(($section_type == 'header') && ($header_type == 'image')){

	$header_content .= '<img src="'.esc_url($header_image_bg).'" alt="">';
}


if(($section_type == 'header') && ($header_type == 'video') ){

	$header_videoArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($header_video) : array();

	$header_content .= '<video autoplay="autoplay" loop="loop" poster="'.esc_url($header_video_poster).'">';
	foreach ($header_videoArr as $key => $value) {
			$header_content .= '<source src="'.esc_url($value['video']).'" type="video/'.esc_attr($value['format']).'">';
		}
	$header_content .= '</video>';
	
}

if(($section_type == 'header')): ?>

	
	<?php if($header_type == 'image_slider'): ?>
			
			<!-- ::: START HEADER ::: -->
        	<header id="home" class="affix">
	            <div class="container">
	                    <div class="row">
	                        <div class="col-md-3 col-sm-12 col-xs-12 logo">                        	
	                            <a title="<?php bloginfo( 'name' ); ?>" href="<?php the_permalink() ?>" rel="home"><img class="img-responsive" src="<?php echo esc_url($logo); ?>" alt="<?php bloginfo( 'name' ); ?>"  height="65" width="185"></a>
	                        </div>
	                        <div class="col-md-9 col-sm-12 col-xs-12 rightnav">
	                            <nav class="navbar navbar-default">
	                                <!-- Brand and toggle get grouped for better mobile display -->
	                                <div class="navbar-header">
	                                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#menu">
	                                        <span class="sr-only"><?php _e( 'Toggle navigation', 'travellers' ); ?></span>
	                                        <span class="icon-bar"></span>
	                                        <span class="icon-bar"></span>
	                                        <span class="icon-bar"></span>
	                                    </button>
	                                </div>

	                                <!-- Collect the nav links, forms, and other content for toggling -->
	                                <div class="collapse navbar-collapse" id="menu">

	                                    <!-- ::: Main Nav ::: -->                                    
	                                    <?php 
	                                    $home_li = '<li class="home active"><a href="'.esc_url( home_url( '/' ) ).'" title="'.esc_attr(__('Home', 'travellers')).'"><i class="fa fa-home"></i></a></li>';
	                                    wp_nav_menu( array(
					                    	'menu' 			=> $onepage_menu,
					                    	'menu_class' 	=> 'nav navbar-nav',
					                    	'container'		=> '',
					                    	'items_wrap' => '<ul id="%1$s" class="%2$s">'.$home_li.'%3$s</ul>',
					                    	'walker' => new Travellers_bootstrap_navwalker(),
	                                		'fallback_cb'  => 'Travellers_bootstrap_navwalker::fallback'
					                    ) );
					                    ?>

	                                </div><!-- /.navbar-collapse -->
	                            </nav>
	                        </div>
	                    </div>
	                </div><!-- end container -->
	        </header>
	        <!-- ::: END ::: -->

	        <?php echo wpb_js_remove_wpautop( $content ); ?>
	        
	<?php else: ?>	
		<?php if($menu_position == 'bottom'): ?>
			<!--  :::  HOME SLIDER ::: -->
	        <div id="slides" class="BGprime opaque header-type-<?php echo esc_attr($header_type) ?>  menu-postion-<?php echo esc_attr($menu_position) ?>">
	            <?php echo ($header_overlay != 'yes')?  '<div class="texture"></div>' : ''; ?>
	           <?php echo force_balance_tags($header_content); ?>

	           
		            <!-- ::: COUNTER BOX & SUBSCRIBE ::: -->
		            <div class="info-box abs">
		                <div class="container">
		                	<?php echo wpb_js_remove_wpautop( $content ); ?>                    
		                </div>
		            </div>
		        

	            <!-- ::: START HEADER ::: -->
	            <header id="home">
	                <div class="container">
	                    <div class="row">
	                        <div class="col-md-3 col-sm-12 col-xs-12 logo">                        	
	                            <a title="<?php bloginfo( 'name' ); ?>" href="<?php the_permalink() ?>" rel="home"><img class="img-responsive" src="<?php echo esc_url($logo); ?>" alt="<?php bloginfo( 'name' ); ?>"  height="65" width="185"></a>
	                        </div>
	                        <div class="col-md-9 col-sm-12 col-xs-12 rightnav">
	                            <nav class="navbar navbar-default">
	                                <!-- Brand and toggle get grouped for better mobile display -->
	                                <div class="navbar-header">
	                                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#menu">
	                                        <span class="sr-only"><?php _e( 'Toggle navigation', 'travellers' ); ?></span>
	                                        <span class="icon-bar"></span>
	                                        <span class="icon-bar"></span>
	                                        <span class="icon-bar"></span>
	                                    </button>
	                                </div>

	                                <!-- Collect the nav links, forms, and other content for toggling -->
	                                <div class="collapse navbar-collapse" id="menu">

	                                    <!-- ::: Main Nav ::: -->                                    
	                                    <?php 
	                                    $home_li = '<li class="home active"><a href="'.esc_url( home_url( '/' ) ).'" title="'.esc_attr(__('Home', 'travellers')).'"><i class="fa fa-home"></i></a></li>';
	                                    wp_nav_menu( array(
					                    	'menu' 			=> $onepage_menu,
					                    	'menu_class' 	=> 'nav navbar-nav',
					                    	'container'		=> '',
					                    	'items_wrap' => '<ul id="%1$s" class="%2$s">'.$home_li.'%3$s</ul>',
					                    	'walker' => new Travellers_bootstrap_navwalker(),
	                                		'fallback_cb'  => 'Travellers_bootstrap_navwalker::fallback'
					                    ) );
					                    ?>

	                                </div><!-- /.navbar-collapse -->
	                            </nav>
	                        </div>
	                    </div>
	                </div><!-- end container -->
	            </header><!-- ::: END ::: -->

	        </div>
	        <!-- ::: HOME SLIDER END ::: -->
	    	<?php else: ?>
    			<!-- ::: START HEADER ::: -->
		        <header id="home" class="affix">
		            <div class="container">
		                <div class="row">
		                    <div class="col-md-3 col-sm-12 col-xs-12 logo">
		                        <a title="<?php bloginfo( 'name' ); ?>" href="<?php the_permalink() ?>" rel="home"><img class="img-responsive" src="<?php echo esc_url($logo); ?>" alt="<?php bloginfo( 'name' ); ?>"  height="65" width="185"></a>
		                    </div>
		                    <div class="col-md-9 col-sm-12 col-xs-12 cbp-af-inner rightnav">
		                        <nav class="navbar navbar-default">
		                            <!-- Brand and toggle get grouped for better mobile display -->
		                            <div class="navbar-header">
		                                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#menu">
		                                    <span class="sr-only"><?php _e( 'Toggle navigation', 'travellers' ); ?></span>
		                                    <span class="icon-bar"></span>
		                                    <span class="icon-bar"></span>
		                                    <span class="icon-bar"></span>
		                                </button>
		                            </div>

		                            <!-- Collect the nav links, forms, and other content for toggling -->
		                            <div class="collapse navbar-collapse" id="menu">

		                                <!-- ::: Main Nav ::: -->                                    
	                                    <?php 
	                                    $home_li = '<li class="home active"><a href="'.esc_url( home_url( '/' ) ).'" title="'.esc_attr(__('Home', 'travellers')).'"><i class="fa fa-home"></i></a></li>';
	                                    wp_nav_menu( array(
					                    	'menu' 			=> $onepage_menu,
					                    	'menu_class' 	=> 'nav navbar-nav',
					                    	'container'		=> '',
					                    	'items_wrap' => '<ul id="%1$s" class="%2$s">'.$home_li.'%3$s</ul>',
					                    	'walker' => new Travellers_bootstrap_navwalker(),
	                                		'fallback_cb'  => 'Travellers_bootstrap_navwalker::fallback'
					                    ) );
					                    ?>

		                            </div><!-- /.navbar-collapse -->
		                        </nav>
		                    </div>
		                </div>
		            </div><!-- end container -->
		        </header>
		        <!-- ::: END ::: -->

		        <!--  :::  HOME SLIDER ::: -->
		        <!--  :::  HOME SLIDER ::: -->
		        <div id="slides" class="opt BGprime opaque header-type-<?php echo esc_attr($header_type) ?> menu-postion-<?php echo esc_attr($menu_position) ?>">
		            <?php echo ($header_overlay != 'yes')?  '<div class="texture"></div>' : ''; ?>
		           <?php echo force_balance_tags($header_content); ?>

		           
		            <!-- ::: COUNTER BOX & SUBSCRIBE ::: -->
		            <div class="info-box abs">
		                <div class="container">
		                	<?php echo wpb_js_remove_wpautop( $content ); ?>                    
		                </div>
		            </div>
		        </div>
		        <!-- ::: HOME SLIDER END ::: -->
    	<?php endif; ?>		
    <?php endif; ?>	
	
<?php
else:

$output .= '<'.$section_type.' ' . implode( ' ', $wrapper_attributes ) . '>'.$video_content.'<div class="'.$full_width.'">';

$output .= wpb_js_remove_wpautop( $content );

$output .= '</div></'.$section_type.'>';
$output .= $after_output;

echo $output;

endif;
