<?php
class Gowilds_BA_DashBoard{

	public function __construct(){
		add_filter('babe_myaccount_manager_all_posts', array($this, 'get_all_posts_html'), 1, 3);
		add_action('gowilds_get_all_posts_wishlist', array($this, 'get_all_posts_wishlist'));
	}

	public static function get_all_posts_html($output, $post_type, $user_info){
		$output = '';
		$post_type_obj = get_post_type_object($post_type);
		$args = array(
			'post_type'   		=> $post_type,
			'posts_per_page' 	=> 10,
			'paged' 				=> get_query_var('paged'),
			'post_status' 		=> 'any',
			'orderby' 			=> 'post_date',
			'order' 				=> 'DESC'
		);
	 
		if( !(in_array('manager', $user_info->roles) || in_array('administrator', $user_info->roles)) ){
		 	$args['author__in'] = [$user_info->ID];
		} 

				 
	 	$args = apply_filters('babe_myaccount_all_posts_get_post_args', $args, $post_type, $user_info);
				 
	 	$the_query = new WP_Query($args);
	 	$max_num_pages = $the_query->max_num_pages;
	 	$found_posts = $the_query->found_posts;
	 
	 	while ($the_query->have_posts()) : $the_query->the_post();
		 	$post_id = get_the_ID();
		 	$edit_url = BABE_Settings::get_my_account_page_url(array('inner_page' => 'edit-post', 'edit_post_id' => $post_id));
		 	$thumbnail = '';
		 	if(has_post_thumbnail($post_id)){ 
		 		$thumbnail .= '<div class="image">';
			 		$thumbnail .= '<a href="' . get_the_permalink($post_id) . '">';
			 			$thumbnail .= get_the_post_thumbnail($post_id, 'post-thumbnail');
			 		$thumbnail .= '</a>';
			 	$thumbnail .= '</div>';
		 	}
		 	$output .= '
		 		<tr>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_title">
			 			<div class="title-image">
			 				' . $thumbnail . '
			 				<div class="title"><a href="' . get_the_permalink($post_id) . '">' . get_the_title($post_id) . '</a></div>
			 			</div>	
			 		</td>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_date">' . get_the_date('', $post_id) . '</td>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_action">
			 			<a href="' . esc_url($edit_url) . '"><i class="las la-edit"></i></a>
			 		</td>
		 		</tr>';
	 	endwhile;
	 	wp_reset_postdata();
	 
		if($output){
			$output = '
		 		<div class="my_account_all_posts_total">'.esc_html__( 'Total: ', 'gowilds' ).$found_posts.'</div>    
		 		<table class="my_account_all_posts_table">
				 	<thead>
				 		<tr>
				 			<td> '.esc_html__('Title & Image', 'gowilds').' </td>
				 			<td> '.esc_html__('Published Date', 'gowilds').' </td>
				 			<td> '.esc_html__('Action', 'gowilds').' </td>
				 		</tr>
				 	</thead>			
			  		<tbody>
			 			'.$output.'
			  		</tbody>
		 		</table> 
		 	';
		} 
			  
		$output = '
			<div class="my_account_inner_page_block my_account_all_posts">
			  	<h2>'.$post_type_obj->labels->all_items.'</h2>
			  	<div class="my_account_all_posts_inner">
					'.$output.'
					'.BABE_Functions::pager($max_num_pages).'
			 	</div>
			</div>
		';
	 
		return $output;
 	}   

  	public function get_all_posts_wishlist(){
		$output = '';
		$post_type = 'to_book';
		$user = wp_get_current_user();
		$userid = $user->ID;
		$post_ids = get_user_meta($userid, 'lt_wishlist', true);

		$post_type_obj = get_post_type_object($post_type);
		$args = array(
			'post_type'   		=> $post_type,
			'posts_per_page' 	=> 10,
			'paged' 				=> get_query_var('paged'),
			'post_status' 		=> 'any',
			'orderby' 			=> 'post_date',
			'order' 				=> 'DESC',
			'post__in'			=> $post_ids
		);
	 
	 	$the_query = new WP_Query($args);
	 	$max_num_pages = $the_query->max_num_pages;
	 	$found_posts = $the_query->found_posts;
	 
	 	while ( $the_query->have_posts() ) : $the_query->the_post();
		 	$post_id = get_the_ID();
		 	$thumbnail = '';
		 	if(has_post_thumbnail($post_id)){ 
		 		$thumbnail .= '<div class="image">';
			 		$thumbnail .= '<a href="' . get_the_permalink($post_id) . '">';
			 			$thumbnail .= get_the_post_thumbnail($post_id, 'post-thumbnail');
			 		$thumbnail .= '</a>';
			 	$thumbnail .= '</div>';
		 	}
		 	$output .= '
		 		<tr>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_title">
			 			<div class="title-image">
			 				' . $thumbnail . '
			 				<div class="title"><a href="' . get_the_permalink($post_id) . '">' . get_the_title($post_id) . '</a></div>
			 			</div>	
			 		</td>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_date">' . get_the_date('', $post_id) . '</td>
			 		<td class="my_account_all_posts_td my_account_all_posts_td_action">' . Gowilds_Addons_Wishlist_Ajax::html_icon($post_id) . '</td>
		 		</tr>';
	 	endwhile;
	 	wp_reset_postdata();
	 
	 	if($output){
			$output = '
		 		<div class="my_account_all_posts_total">'.__( 'Total: ', 'gowilds' ).$found_posts.'</div>    
		 		<table class="my_account_all_posts_table">
				 	<thead>
				 		<tr>
				 			<td> '.esc_html__('Title & Image', 'gowilds').' </td>
				 			<td> '.esc_html__('Published Date', 'gowilds').' </td>
				 			<td> '.esc_html__('Action', 'gowilds').' </td>
				 		</tr>
				 	</thead>			
			  		<tbody>
			 			' . $output . '
			  		</tbody>
		 		</table> 
	 		';
		} 
		  
		$output = '
			<div class="my_account_inner_page_block my_account_all_posts">
			  	<h2>'.esc_html__('Wishlist', 'gowilds').'</h2>
			  	<div class="my_account_all_posts_inner">
					'.$output.'
					'.BABE_Functions::pager($max_num_pages).'
			 	</div>
			</div>
		';
	 
		echo wp_kses($output, true);
  	}   
}

new Gowilds_BA_DashBoard();