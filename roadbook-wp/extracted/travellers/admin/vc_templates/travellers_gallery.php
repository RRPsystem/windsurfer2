<?php

extract(shortcode_atts(array(
    'images' => '',
), $atts));

$imagesArr = explode(',', $images);

if( !empty($imagesArr) ):

$id = uniqid();    

?>

<div id="galleryCarousel" class="owl-carousel">

    <?php foreach ($imagesArr as $key => $value) : 

            $thumb = wp_get_attachment_image_src(intval($value), 'travellers-instructor-size' );
            if( is_wp_error($thumb) ) continue;

            

           

            $full = wp_get_attachment_image_src(intval($value), 'full' );

            $data = wp_get_attachment_metadata( intval($value) );

            ?>

            <div class="item">

                <img src="<?php echo esc_url($thumb[0]) ?>" alt="">

                <div class="overlay">

                    <a class="zoom" href="<?php echo esc_url($full[0]) ?>" data-rel="prettyPhoto[gallery<?php echo esc_attr($id) ?>]" title="<?php echo esc_attr($data['image_meta']['caption']); ?>"><img class="svg" src="<?php echo TRAVELLERS_URI; ?>/images/svg/plus-icon.svg" onerror="this.src='plus-icon.png'" alt=""></a>

                </div>

            </div>

           

    <?php endforeach; ?> 

</div>

<?php endif; ?>