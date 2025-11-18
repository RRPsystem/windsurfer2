<?php
$_rand  		= wp_rand(5);
$thumbnail 	= isset($settings['image_size']) && $settings['image_size'] ? $settings['image_size'] : 'post-thumbnail';
$post_id =  isset($post_item->ID) && $post_item->ID ? $post_item->ID : $post['ID'];
$ba_post 	= BABE_Post_types::get_post($post_id);
$url   		= BABE_Functions::get_page_url_with_args($post_id, $_GET);
$image   	= wp_get_attachment_image_src(get_post_thumbnail_id($post_id), $thumbnail);
if ( !isset($ba_post['discount_price_from']) || !isset($ba_post['price_from']) || !isset($ba_post['discount_date_to']) || !isset($ba_post['discount']) ) {
   $prices = BABE_Post_types::get_post_price_from($post_id);
} else {
   $prices = $ba_post;
}
?>

<div class="booking-block-list-small">
	<div class="babe-block-content">
		<div class="post-image">
			<?php if(has_post_thumbnail($post_id)){ ?>
				<a class="post-link" href="<?php echo esc_url($url) ?>">
					<img src="<?php echo esc_url($image[0]) ?>" alt="<?php echo esc_attr( $ba_post['post_title'] ) ?>">
				</a>
			<?php } ?>   
		</div>

		  <div class="booking-content">
				<div class="content-inner">
					<?php echo BABE_Rating::post_stars_rendering( $post_id ); ?>
					<h3 class="title">
						<a href="<?php echo esc_url( $url ); ?>"><?php echo apply_filters( 'translate_text', $ba_post['post_title'] ); ?></a>
					</h3>
					<div class="ba-price">
						<?php 
							$discount_price_from = isset($prices['discount_price_from']) ? $prices['discount_price_from'] : false;
							$price_from = isset($prices['price_from']) ? $prices['price_from'] : false;
						
							if( $discount_price_from || $price_from ){
								echo '<label>' . esc_html__('From', 'gowilds') . '</label>&nbsp;';
								if( $discount_price_from ){ 
					  				echo '<span class="item_info_price_new">' . BABE_Currency::get_currency_price($prices['discount_price_from']) . '</span>&nbsp;';
					  			}
					  			if( $discount_price_from && $price_from && ($discount_price_from < $price_from) ){ 
									echo '<span class="item_info_price_old">' .  BABE_Currency::get_currency_price($prices['price_from']) . '</span>';
								}
							}
						?>
					</div>
				</div>   
		  </div>

	 </div>
</div>