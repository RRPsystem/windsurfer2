<?php
function gowilds_id(){
 	if(class_exists('WooCommerce') && is_shop()){
		$pid = wc_get_page_id('shop');
 	}elseif(is_page() || is_singular()){
		$pid = get_the_ID();
 	}else{
		$pid = '';
 	}
 	return $pid;
}

function gowilds_list_header_layout(){
 	$layouts = array();
 	$layouts[''] = esc_html__('-- Select Layout --', 'gowilds');
 	$layouts['_default_active'] = esc_html__('_Default Header Layout Actived', 'gowilds');
 	if(class_exists('GVA_Layout_Model')){
 		$page_layouts = GVA_Layout_Model::getInstance()->get_templates('header_layout');
 		if($page_layouts){
	 		foreach ($page_layouts as $item) {
	 			$layouts[$item['id']] = $item['title'];
	 		}
	 	}
 	}
 	return $layouts;
}

function gowilds_list_footer_layout(){
 	$layouts = array();
 	$layouts[''] = esc_html__('-- Select Layout --', 'gowilds');
 	$layouts['_default_active'] = esc_html__('_Default Footer Layout Actived', 'gowilds');
 	if(class_exists('GVA_Layout_Model')){
 		$page_layouts = GVA_Layout_Model::getInstance()->get_templates('footer_layout');
 		if($page_layouts){
	 		foreach ($page_layouts as $item) {
	 			$layouts[$item['id']] = $item['title'];
	 		}
	 	}
 	}
 	return $layouts;
}

function gowilds_get_booking_layout(){
 	$layouts = array();
 	$layouts['_default_active'] = esc_html__('_Default Layout Actived', 'gowilds');
 	if(class_exists('GVA_Layout_Model')){
 		$ba_layouts = GVA_Layout_Model::getInstance()->get_templates('single_booking_layout');
 		if($ba_layouts){
	 		foreach ($ba_layouts as $item) {
	 			$layouts[$item['id']] = $item['title'];
	 		}
	 	}
 	}
 	return $layouts;
}

function gowilds_general_breadcrumbs() {
	
 	$delimiter = '';
 	$home = esc_html__('Home', 'gowilds');
 	$before = '<li class="active">';
 	$after = '</li>';
 	$breadcrumb = '';
 	if(!is_home() && !is_front_page() || is_paged()) {

		$breadcrumb .= '<ol class="breadcrumb">';

		global $post;
		$breadcrumb .= '<li><a href="' . esc_url(home_url()) . '">' . $home . '</a> ' . $delimiter . '</li> ';

		if(is_category()){
		  
		  	global $wp_query;
		  	$cat_obj = $wp_query->get_queried_object();
		  	$thisCat = $cat_obj->term_id;
		  	$thisCat = get_category($thisCat);
		  	$parentCat = get_category($thisCat->parent);
		  	if ($thisCat->parent != 0) $breadcrumb .= (get_category_parents($parentCat, TRUE, ' ' . $delimiter . ' '));
		  	$breadcrumb .= $before . single_cat_title('', false) . $after;
	  
		}elseif(is_day()){
		  
		  	$breadcrumb .= '<li><a href="' . esc_url(get_year_link(get_the_time('Y'))) . '">' . get_the_time('Y') . '</a>' . ' ' . $delimiter . ' ' . '</li>';
		  	$breadcrumb .= '<li><a href="' . esc_url(get_month_link(get_the_time('Y'), get_the_time('m'))) . '">' . get_the_time('F') . '</a>' . ' ' . $delimiter . ' ' . '</li>';
		  	$breadcrumb .= $before . get_the_time('d') . $after;
	  
		}elseif(is_month()){
		 
		  	$breadcrumb .= '<li><a href="' . esc_url(get_year_link(get_the_time('Y'))) . '">' . get_the_time('Y') . '</a>' . ' ' . $delimiter . ' ' . '</li>';
		  	$breadcrumb .= $before . get_the_time('F') . $after;
	  
		}elseif(is_year()){
		 
		  	$breadcrumb .= $before . get_the_time('Y') . $after;
		
		}elseif( is_search() || get_query_var('s')){

		  	$breadcrumb .= $before . esc_html__('Search results for', 'gowilds') . '"' . get_search_query() . '"' . $after;

		}elseif(is_single() && !is_attachment()){
		  	
		  	if ( get_post_type() != 'post' ) {
			 	if(get_the_title()){
					$breadcrumb .= $before . get_the_title() . $after;
			 	}
		  	}else{
			 	$cat = get_the_category(); $cat = $cat[0];
			 	$breadcrumb .= $before . get_category_parents($cat, TRUE, '') . $after;
		  	}

		}elseif(!is_single() && !is_page() && get_post_type() != 'post' && !is_404()){
		  
		  	$post_type = get_post_type_object(get_post_type());
		  	if( $post_type ){
			 	$breadcrumb .= $before . $post_type->labels->singular_name . $after;
		  	}

		}elseif(is_attachment()){

		  	$parent = get_post($post->post_parent);
		  	$cat = get_the_category($parent->ID); 
		  	if(isset($cat[0]) && $cat[0]){
			 	$cat = $cat[0];
			 	$breadcrumb .= get_category_parents($cat, TRUE, ' ' . $delimiter . ' ');
		  	}
		  	$breadcrumb .= '<li><a href="' . esc_url(get_permalink($parent)) . '">' . $parent->post_title . '</a></li> ' . $delimiter . ' ';
		  	$breadcrumb .= $before . get_the_title() . $after;

		}elseif(is_page() && !$post->post_parent){
		  
		  	$breadcrumb .= $before . get_the_title() . $after;

		}elseif(is_page() && $post->post_parent){

		  	$parent_id  = $post->post_parent;
		  	$breadcrumbs = array();
		  	while ($parent_id) {
			 	$page = get_page($parent_id);
			 	$breadcrumbs[] = '<li><a href="' . esc_url(get_permalink($page->ID)) . '">' . get_the_title($page->ID) . '</a></li>';
			 	$parent_id  = $page->post_parent;
		  	}
		  	$breadcrumbs = array_reverse($breadcrumbs);
		  	foreach ($breadcrumbs as $crumb) $breadcrumb .= ($crumb) . ' ' . $delimiter . ' ';
		  	$breadcrumb .= $before . get_the_title() . $after;

		}elseif(is_tag()){

		  $breadcrumb .= $before . esc_html__('Posts tagged', 'gowilds') . '"' . single_tag_title('', false) . '"' . $after;

		}elseif(is_author()){

		  	global $author;
		  	$userdata = get_userdata($author);
		  	if($userdata){
			 	$breadcrumb .= $before . esc_html__('Articles posted by', 'gowilds') . $userdata->display_name . $after;
		  	} 

		}elseif(is_404()){
		  	$breadcrumb .= $before . esc_html__('Error 404', 'gowilds') . $after;
		}

		if(get_query_var('paged')){
		  	$breadcrumb .= $before . esc_html__('Page','gowilds') . ' ' . get_query_var('paged') . $after;
		}

		$breadcrumb .= '</ol>';
		echo html_entity_decode($breadcrumb);
 	}
}

function gowilds_comment_nav() {
  if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) :
  ?>
  	<nav class="navigation comment-navigation" role="navigation">
	 	<h2 class="screen-reader-text"><?php esc_html__( 'Comment navigation', 'gowilds' ); ?></h2>
	 	<div class="nav-links">
			<?php
			  	if ( $prev_link = get_previous_comments_link( esc_html__( 'Older Comments', 'gowilds' ) ) ) :
				 	printf( '<div class="nav-previous">%s</div>', $prev_link );
			  	endif;

			  	if ( $next_link = get_next_comments_link( esc_html__( 'Newer Comments', 'gowilds' ) ) ) :
				 	printf( '<div class="nav-next">%s</div>', $next_link );
			  	endif;
			?>
	 	</div>
  	</nav>
  <?php
  endif;
}

function gowilds_category_count( $links ) {
  	$links = str_replace( '(', '<span class="count">(', $links );
  	$links = str_replace( ')', ')</span>', $links );
  	return $links;
}
add_filter( 'wp_list_categories', 'gowilds_category_count' );

function gowilds_archive_count($links) {
  	$links = str_replace( '&nbsp;(', '<span class="count">(', $links );
  	$links = str_replace( ')', ')</span>', $links );
  	return $links;
}
add_filter( 'get_archives_link', 'gowilds_archive_count' );

function gowilds_limit_words($word_limit, $string, $string_second = ''){
	$string = !empty($string) ? esc_html($string) : esc_html($string_second);
  	if(!empty($string)){
	  	$words = explode(' ', $string, ($word_limit + 1));
	  	if(count($words) > $word_limit)
	  	array_pop($words);
	  	return implode(' ', $words);
	}
	return '';
}

function gowilds_get_options(){
 		global $gowilds_theme_options;
 		return $gowilds_theme_options;
	}

function gowilds_get_option($key, $default = ''){
 	global $gowilds_theme_options;
 	if(isset($gowilds_theme_options[$key]) && $gowilds_theme_options[$key]){
		return $gowilds_theme_options[$key];
 	}else{
		return $default;
 	}
}

function gowilds_random_id($length=4){
 	$characters = '0123456789abcdefghijklmnopqrstuvwxyz';
 	$string = '';
 	for ($i = 0; $i < $length; $i++) {
		$string .= $characters[rand(0, strlen($characters) - 1)];
 	}
 	return $string;
}

function gowilds_convert_hextorgb($hex, $alpha = false) {
 	$hex = str_replace('#', '', $hex);
 	if ( strlen($hex) == 6 ){
		$rgb['r'] = hexdec(substr($hex, 0, 2));
		$rgb['g'] = hexdec(substr($hex, 2, 2));
		$rgb['b'] = hexdec(substr($hex, 4, 2));
 	}else if ( strlen($hex) == 3 ){
		$rgb['r'] = hexdec(str_repeat(substr($hex, 0, 1), 2));
		$rgb['g'] = hexdec(str_repeat(substr($hex, 1, 1), 2));
		$rgb['b'] = hexdec(str_repeat(substr($hex, 2, 1), 2));
 	}else {
		$rgb['r'] = '0';
		$rgb['g'] = '0';
		$rgb['b'] = '0';
  	}
  	if ($alpha) {
		$rgb['a'] = $alpha;
 	}
 	return $rgb;
}
