<?php
/**
* Travellers header
*/
class TravellersHeader{

	function __construct(){
		add_filter( 'travellers_header_image_url', array( __CLASS__, 'header_image_url' ) );	
		add_filter( 'travellers_navbar_logo', array( __CLASS__, 'header_logo_default' ) );	
		add_filter( 'travellers_navbar_logo_white', array( __CLASS__, 'header_logo_white_default' ) );	
		add_filter( 'travellers_sticky_navbar', array( __CLASS__, 'header_sticky_navbar' ) );	
		add_filter( 'travellers_navbg_style', array( __CLASS__, 'header_navbg_style' ) );
		add_filter( 'travellers_navbar_style_args', array( __CLASS__, 'navbar_style_args' ) );

	}

	static function navbar_style_args($output){
		global $wpdb;
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'one_page_wp_nav', true );
			if( $newval != '' ){
				$output['menu'] = $newval;
				unset($output['theme_location']);
			}
		}

		

		return $output;
	}

	static function header_navbg_style($output){
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'nav_style', true );
		}

		$output = ( $newval != '' )? $newval : $output;

		return $output;
	}

	static function header_sticky_navbar($output){
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'header_sticky_nav', true );
		}

		$output = ( $newval != '' )? $newval : $output;

		return $output;
	}

	static function header_logo_default($output){
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'logo', true );
		}

		$output = ( $newval != '' )? $newval : $output;

		return $output;
	}

	static function header_logo_white_default($output){
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'logo_white', true );
		}

		$output = ( $newval != '' )? $newval : $output;

		return $output;
	}

	static function get_navbar_style(){
		$output = '';
		$output = ot_get_option('navbar_style', 'navbar-style1');

		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'navbar_style', true );
		}

		$output = ( $newval != '' )? $newval : $output;

		return $output;
	}

	static function get_default_nav_buttons(){
		return array(
                    array(
                        'title' => 'Contact us',
                        'link' => '#',
                        'target' => '_self',
                        'style' => 'btn-default'
                    ),
                );
	}

	static function get_default_portfolio_buttons(){
		return array(
                    array(
                        'title' => 'Open Website',
                        'button_url' => '#',
                        'button_target' => '_blank',
                        'button_style' => 'btn-default'
                    ),
                );
	}

	static function get_default_header_buttons(){
		return array(
                    array(
                        'title' => 'View Collection',
                        'link' => '#',
                        'target' => '_self',
                        'style' => 'btn-primary'
                    ),
                );
	}

	static function get_default_header_image(){
		$active_layout = travellers_get_optiontree_layout();
		
		//$image = TRAVELLERS_URI.'/images/breadcrumbs-bg.jpg';
		$image = '';
		switch ($active_layout) {
		    case 'layout-dark':
		        $image = TRAVELLERS_URI.'/images/breadcrumbs-bg-dark.jpg';
		        break;
		}

		return $image;
	}

	static function get_id(){
		if( is_home() || (get_post_type() == 'post') ){
			$post_id = get_option( 'page_for_posts' ); 
		}elseif( is_page() ){
			$post_id = get_the_ID();
		}else{
			$post_id = NULL;
		}

		if( get_post_type() == 'portfolio' ){
			$post_id = ot_get_option('portfolio_archive', NULL);
		}
		if( get_post_type() == 'team' ){
			$post_id = ot_get_option('team_archive', NULL);
		}

		if( function_exists('is_woocommerce') ){
			if( (get_post_type() == 'product') ):
				$post_id = get_option( 'woocommerce_shop_page_id' );	
			endif;
		}

		return $post_id;
	}

	public static function get_shortcode(){
		if(is_page_template('templates/onepage-template.php')){
			return true;
		}

		$post_id = self::get_id();
		$shortcode = get_post_meta( $post_id, 'shortcode', true );
		if( $shortcode != '' ){
			echo '<div class="slider-area">'.do_shortcode($shortcode).'</div>';
		}else{
			if(is_page_template('templates/vc-template.php')){
				return true;
			}else{
				return false;
			}
		}

		
	}

	public static function get_container_spacing(){
		$post_id = self::get_id();
		$output = get_post_meta( $post_id, 'container_spacing', true );
		$output = ($output == '')? 'p-top-bottom-100' : $output;
		return $output;		
	}
	
	public static function topbar_class(){
		$classArr = array();
		$topbar_background = ot_get_option('topbar_background', 'dark-bg');
		$classArr[] = $topbar_background;
		if( in_array($topbar_background, array('color-bg', 'dark-bg')) ){
			$classArr[] = 'has-darkbg';
		}
		$classArr = array_filter($classArr);
		$classes = implode(' ', $classArr);

		echo apply_filters( 'travellers_topbar_class', $classes );
	}

	public static function header_class(){
		$classArr = array();
		$post_id = self::get_id();
		$transparent_header = get_post_meta( $post_id, 'force_transparent_header', true );
		$transparent_header = ( $transparent_header != '' )? $transparent_header : 'off';

		$classArr[] = ($transparent_header == 'on')? 'fixed-header' : 'default-header';

		$classArr = array_filter($classArr);
		$classes = implode(' ', $classArr);

		echo apply_filters( 'travellers_navbar_class', $classes );
	}

	public static function topbar_contact_info(){
		$contact_info = ot_get_option( 'topbar_contact_info', travellers_header_default_contact_info() );

		$html = '';
		if( !empty($contact_info) ){
			
			foreach ($contact_info as $key => $value) {
				extract($value);
				$html .= '<li><a title="'.esc_attr($title).'" href="'.esc_url($link).'" ><i class="color-text '.esc_attr($icon_link['icon']).'"></i> '.esc_attr($icon_link['input']).'</a></li>';
			}
			
		}
	     echo '<ul class="list-inline topbar-contact">';   
	    echo apply_filters( 'travellers_topbar_contact_info', $html ); 
	    travellers_wpml_lang_select_option();
	    echo '</ul>';
	}

	public static function header_social_icons(){

		$header_social_icons_display = ot_get_option( 'header_social_icons_display', 'off' );
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'header_social_icons_display', true );
		}
		$header_social_icons_display = ( $newval != '' )? $newval : $header_social_icons_display;

		if( $header_social_icons_display != 'on') return '';


		$social_icons = ot_get_option( 'header_social_icons', travellers_header_default_social_icons() );
		if(is_page_template('templates/onepage-template.php')){
			$social_icons = get_post_meta( get_the_ID(), 'header_social_icons', true );
		}
		
		$html = travellers_get_social_icons( $social_icons, array('wrap' => 'li', 'wrapclass' => 'header-socials clearfix', 'linkwrap' => 'span') );
	        
	    return apply_filters( 'travellers_topbar_social_icons', $html );    
	}
	
	public static function get_nav_button(){
		$html = '';

		

		$menu_button_display = ot_get_option('header_button_display', 'off');
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'header_button_display', true );
		}
		$menu_button_display = ( $newval != '' )? $newval : $menu_button_display;

		if( $menu_button_display == 'off' ) return $html;

		$navbar_button = ot_get_option('header_button', self::get_default_nav_buttons());
		$newval = self::get_default_nav_buttons();
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'header_button', true );
		}
		$navbar_button = ( !empty($newval) )? $newval : $navbar_button;

		if( !empty($navbar_button) ){
			$i=1;
			foreach ($navbar_button as $key => $value) {
				extract($value);				
				$title = sprintf( _x('%s', 'Navbar button title #'.$key, 'travellers'), $title );
				$html .= '<li class="nav-button nav-button'.$i.'"><a href="'.esc_url($link).'" class="btn btn-arrow '.esc_attr($style).'" target="'.esc_attr($target).'"><span>'.esc_attr($title).' <i class="fas fa-angle-double-right"></i></span></a></li>';
				$i++;
			}
		}
		return apply_filters( 'travellers_get_nav_button', $html );

	}

	public static function get_header_buttons(){
		$html = '';
		$post_id = self::get_id();

		//if( is_singular('product') ) return false;

		$button_display = get_post_meta( $post_id, 'button_display', true );
		$button_display = ($button_display)? $button_display : 'off';
		if( $button_display == 'off' ) return $html;

		$buttons = get_post_meta( $post_id, 'buttons', true );
		$buttons = ($buttons)? $buttons : self::get_default_header_buttons();
		if( !empty($buttons) ){
			$i=1;
			$html .= '<div class="btns-wraper download-btn">';
			foreach ($buttons as $key => $value) {
				extract($value);
				$title = sprintf( _x('%s', 'Navbar button title #'.$key, 'travellers'), $title );
				$html .= '<a href="'.esc_url($link).'" class="button active-btn sabbi-button hupup '.esc_attr($style).'" target="'.esc_attr($target).'">'.esc_attr($title).'</a>';
				$i++;
			}
			$html .= '</div>';
		}
		return apply_filters( 'travellers_get_header_button', $html );

	}

	public static function get_searchform(){

		$header_search_display = ot_get_option('header_search_display', 'off');
		$newval = '';
		if(is_page_template('templates/onepage-template.php')){
			$newval = get_post_meta( get_the_ID(), 'header_search_display', true );
			$newval = ( $newval != '' )? $newval : 'off';			
		}
		$header_search_display = ( $newval != '' )? $newval : $header_search_display;

		if( $header_search_display == 'off' ) return false;

		$placeholder = ot_get_option( 'nav_search_placeholder', 'What are you looking for?' );
		$placeholder = sprintf( _x('%s', 'Navbar Search placeholder text', 'travellers'), $placeholder );

		return '<li class="cart-icon search-menu-item menu-item menu-item-has-children nav-item travellers-megamenu megamenu-navbarwidth dropdown">
			<a class="nav-link nav-icon dropdown-toggle"  data-toggle="dropdown" href="#" aria-haspopup="true" aria-expanded="false"><span class="fa fa-search"></span></a>
			<div class="dropdown-menu collapse" id="headersearch" role="menu">
				<form class="header-search-form" action="'.esc_url( home_url( '/' ) ).'">
					<div class="input-group">
		                <input class="form-control" placeholder="'.esc_attr($placeholder).'" type="text" name="s">
		                <div class="input-group-append">
					    	<button class="btn btn-lightgreen1" type="submit"><i class="fa fa-search" aria-hidden="true"></i> '.esc_attr(__('Search', 'travellers')).'</button>
					 	</div>
		            </div>
		        </form>
	        </div>
        </li>';
	}

	public static function header_breadcrumb_is_on(){

		$post_id = self::get_id();

		$display = get_post_meta( $post_id, 'breadcrumb_display_in_page', true );
		$display = ( $display != '' )? $display : 'off';

		$display = ( is_front_page() )? 'off' : $display;

		//if( is_singular('product') ) $display = 'on';

		$display = ( $display == 'on' )? true : false;
		return apply_filters( 'travellers_header_breadcrumb_is_on', $display );
	}

	public static function header_banner_is_on(){

		$post_id = self::get_id();

		$banner = get_post_meta( $post_id, 'title_display', true );
		$banner = ( $banner != '' )? $banner : 'off';


		$banner = ( is_singular('post') )? ot_get_option( 'single_post_header', 'off' ) : $banner;
		$banner = ( is_singular('portfolio') )? ot_get_option( 'single_portfolio_header', 'off' ) : $banner;
		$banner = ( is_singular('team') )? ot_get_option( 'single_team_header', 'off' ) : $banner;
		$banner = ( is_singular('product') )? ot_get_option( 'single_product_header', 'off' ) : $banner;
		$banner = ( is_404() )? 'off' : $banner;

		$banner = ( $banner == 'on' )? true : false;
		if(is_page_template('templates/onepage-template.php')){
			$banner = true;
		}

		return apply_filters( 'travellers_header_banner_is_on', $banner );
	}


	public static function shortcode(){

		$post_id = self::get_id();

		$shortcode = get_post_meta( $post_id, 'shortcode', true );
		if( $shortcode == '' )  return false;

		$shortcode = '<div class="slider-wrapper">'.$shortcode.'</div>';

		return $shortcode;
	}
	
	public static function header_image_url(){
		
		$post_id = self::get_id();

		$header_image = ot_get_option('header_background', TRAVELLERS_URI.'/images/breadcrumb.jpg');
		

		if ( 'portfolio' == get_post_type() ){
			$id = travellers_get_post_type_archive_page_id('portfolio');
			if($id) $post_id = $id; 
		}

		
		if( function_exists('is_woocommerce') ){
			if( (get_post_type() == 'product') ):
				$post_id = get_option( 'woocommerce_shop_page_id' );
			endif;
		}

		$new_header_image = get_post_meta( $post_id, 'header_bg', true ); 

		
		
		$header_image = ( $new_header_image != '' )? $new_header_image : $header_image;

		return $header_image;
	}


	public static function get_title(){
		$title = get_the_title();
		$post_id = self::get_id();

		if(is_page()){
			$newtitle = get_post_meta( $post_id, 'title', true );
			$title = ( $newtitle != '' )? $newtitle : $title;
		}elseif ((get_post_type() == 'post')) {
			$post_page_id = get_option( 'page_for_posts' );
			if( (is_home() || is_single()) && ($post_page_id) ){
				$title = get_the_title( $post_id );
				$newtitle = get_post_meta( $post_id, 'title', true );
				$title = ( $newtitle != '' )? $newtitle : $title;
			}elseif( is_category() ){
				$prefix = '';
				$title = single_cat_title( $prefix, false );
			}elseif( is_tag() ){
				$prefix = '';
				$title = single_tag_title( $prefix, false );
			}elseif( is_archive() ){				
				$title = get_the_archive_title();
			}else{
				$title = ot_get_option('blog_title', 'Blog Posts');
			}

			
		}

		$post_type_Arr = array('tour', 'location');	
		if (  in_array(get_post_type(), $post_type_Arr)  ){	
			if(is_singular()){
				$title = get_the_title();
			}else{
				$title = ot_get_option(get_post_type().'_title', $title);
			}
		}

		if( function_exists('is_woocommerce') ){
			if( (get_post_type() == 'product') ):
				$newtitle = get_post_meta( $post_id, 'title', true );
				$title = ( $newtitle != '' )? $newtitle : get_the_title($post_id);

				/*if(is_singular()){
					$title = get_the_title();
				}*/
			endif;
		}

		
		
		if(is_404()){
			$title = ot_get_option('404_title', '404');
		}

		if( is_search() ){
			$title = get_search_query();
		}

		

		return apply_filters( 'travellers_header_title', $title );
	}

	public static function get_subtitle(){
		$title = '';
		$post_id = self::get_id();

		$newtitle = get_post_meta( $post_id, 'subtitle', true );
		$title = ( $newtitle != '' )? $newtitle : $title;

		if($title != ''){
			$title = esc_attr($title);
		}
		return apply_filters( 'travellers_header_subtitle', $title );
	}
}

new TravellersHeader;