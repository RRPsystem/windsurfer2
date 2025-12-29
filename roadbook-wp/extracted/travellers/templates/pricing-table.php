<?php
if(class_exists('WC_Product')):
$features = get_post_meta( get_the_ID(), 'features', true );
$pricing_after_price = get_post_meta( get_the_ID(), 'pricing_after_price', true );
$button_text = get_post_meta( get_the_ID(), 'pricing_button_text', true );
$button_text = ( $button_text != '' )? $button_text : 'Buy Now';
$product = new WC_Product( get_the_ID() );
?>
<div class="pricing-table-default text-center">
    <div class="pricing-head">
        <h5><?php the_title(); ?></h5>
        <span class="price"><sup><?php echo get_woocommerce_currency_symbol(); ?></sup><span class="price-digit"><?php echo $product->get_price(); ?></span><br><?php echo esc_attr($pricing_after_price); ?></span>
    </div>
    <div class="pricing-detail">
        <ul class="pricing-list ">
            <?php
                if(!empty($features)){
                    foreach ($features as $key => $value) {
                        $avialibility = ($value['avialibility'] != '')? ' - <small>'.esc_attr($value['avialibility']).'</small>' : '';
                        echo '<li>'.esc_attr($value['title']).$avialibility.'</li>';
                    }
                }
                ?> 
        </ul> 
    </div>
    <a data-toggle="modal" href="<?php echo travellers_pricing_signup_url(); ?>" class="btn btn-default"><?php echo esc_attr($button_text); ?></a>                  
</div>
<?php endif; ?>