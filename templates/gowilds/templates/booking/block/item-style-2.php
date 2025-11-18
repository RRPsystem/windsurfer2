<?php
$_rand      = wp_rand(5);
$thumbnail  = isset($settings['image_size']) && $settings['image_size'] ? $settings['image_size'] : 'post-thumbnail';
$post_id 	= $post['ID'];
$ba_post 	= BABE_Post_types::get_post($post_id);
$url   		= BABE_Functions::get_page_url_with_args($post_id, $_GET);
$image   	= wp_get_attachment_image_src(get_post_thumbnail_id($post_id), $thumbnail);
if ( !isset($ba_post['discount_price_from']) || !isset($ba_post['price_from']) || !isset($ba_post['discount_date_to']) || !isset($ba_post['discount']) ) {
	$prices = BABE_Post_types::get_post_price_from($post_id);
} else {
	$prices = $ba_post;
}
?>

<div class="booking-two__single ba-block-item">
	<div class="booking-two__wrap">
		
		<div class="booking-two__image">
			<?php if(has_post_thumbnail($post_id)){ ?>
				<img src="<?php echo esc_url($image[0]) ?>" alt="<?php echo esc_attr( $post['post_title'] ) ?>">
			<?php } ?>  

			<?php 
				$discount = isset($post['discount']) && $post['discount'] ? $post['discount'] : false;
				$featured = isset($ba_post['gowilds_booking_featured'] ) ? $ba_post['gowilds_booking_featured'] : false;
				if($discount || $featured){
					echo '<div class="booking__item-labels">';
		            if($featured){
		               echo '<span class="booking__item-label booking__item-featured">' . esc_html__( 'Featured', 'gowilds' ) . '</span>';
		            }
		            if($discount){
		               echo '<span class="booking__item-label booking__item-discount">' . esc_html($discount) . '% ' . esc_html__( 'off', 'gowilds' ) . '</span>';
		            }
		         echo '</div>';   
	         }
         ?>

         <?php if(class_exists('Gowilds_Addons_Wishlist_Ajax')){ 
         	echo Gowilds_Addons_Wishlist_Ajax::html_icon($post_id);
         } ?>

			<a class="booking-two__overlay" href="<?php echo esc_url($url) ?>"></a> 
         
	  	</div>

		  <div class="booking-two__content">
				<div class="booking-two__content-inner">
					
					<div class="booking-two__content-top">
			  			<?php 
				  			echo '<div class="booking__rating">';
				  				echo BABE_Rating::post_stars_rendering($post_id); 
				  			echo '</div>';

							echo '<div class="booking-two__media booking__media">';
								$images = isset($ba_post['images']) && $ba_post['images'] ? $ba_post['images'] : false;
								$video  = isset($ba_post['gowilds_booking_video']) ? $ba_post['gowilds_booking_video'] : false;
						 		if($video || $images){
									if($images){
					            	$i = 1;
					               foreach($images as $image){ 
					               	$classes = ($i>1) ? 'hidden' : 'ba-gallery';
					                  if( isset(wp_get_attachment_image_src($image['image_id'], 'full')[0]) ){ ?>
					                     <a class="<?php echo esc_attr($classes) ?>" href="<?php echo esc_url(wp_get_attachment_image_src($image['image_id'], 'full')[0]) ?>" data-elementor-lightbox-slideshow="<?php echo esc_attr($_rand) ?>">
					                        <?php 
					                        	if($i == 1){
					                        		echo '<i class="las la-camera"></i>';
					                        		echo '<span>' . count($images) . '</span>';
					                        	}
					                        ?>
					                     </a>
					                  <?php }  
					                  $i = $i + 1;
					               }
									}
									if($video){ 
										echo '<a class="booking-two__video popup-video" href="' . esc_url($video) . '"><i class="las la-video"></i></a>';
									}
								}
							echo '</div>';	
						?>
					</div>

					<h3 class="booking-two__title">
						<a href="<?php echo esc_url( $url ); ?>"><?php echo apply_filters( 'translate_text', $post['post_title'] ); ?></a>
					</h3>
					
					<?php 
                  $address = isset($ba_post['address']) ? $ba_post['address'] : false;
                  if($address){ ?>
						<div class="booking-two__address">
							<i class="fas fa-map-marker-alt"></i><span><?php echo esc_html( $address['address'] ); ?></span>
						</div>
					<?php } ?>

					<?php 
						$discount_price_from = isset($prices['discount_price_from']) ? $prices['discount_price_from'] : false;
						$price_from = isset($prices['price_from']) ? $prices['price_from'] : false;
						if( $discount_price_from || $price_from ){
							echo '<div class="booking-two__price booking__price">';
						  		echo '<label><i class="fa-solid fa-circle-dollar-to-slot"></i>' . esc_html__('From', 'gowilds') . '</label>';
						  		if( $discount_price_from ){ 
						  			echo '<span class="item_info_price_new">' . BABE_Currency::get_currency_price($prices['discount_price_from']) . '</span>';
						  		}
								if( $discount_price_from && $price_from && ($discount_price_from < $price_from) ){ 
									echo '<span class="item_info_price_old">' .  BABE_Currency::get_currency_price($prices['price_from']) . '</span>';
								} 
							echo '</div>';
						}
					?>

				</div>   

		  </div>
	 </div>
</div>