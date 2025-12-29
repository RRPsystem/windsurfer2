<?php

extract(shortcode_atts(array(

    'testimonials' => '',

), $atts));

$testimonialsArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($testimonials) : array();



if( !empty($testimonialsArr) ): 

    $i = 0;

    $modal_videos = array();

?>

    <!-- ::: Testimonial slider Start ::: -->

    <div id="testimonial" class="owl-carousel carousel slide" data-ride="carousel">

        <div class="carousel-inner text-center">

                <?php foreach ($testimonialsArr as $key => $value) : 

                        extract($value);

                       

                        ?>

                        <div class="item<?php echo ( $i == 0 )? ' active' : ''; ?>">

                            <div class="heading"><h4><?php echo esc_attr($title) ?></h4></div>

                            <p><?php echo esc_attr($desc) ?></p>

                            <div class="author">

                                <img class="img-circle img-responsive" src="<?php echo esc_url($image) ?>" width="65" height="65" alt="<?php echo esc_attr($name) ?>" /><h5><?php echo esc_attr($name) ?> <small><?php echo esc_attr($subtitle) ?></small></h5>

                            </div>

                        </div><!-- end item -->

                <?php $i++; endforeach; ?>  



                <!-- Controls -->

                <a class="left carousel-control" href="#testimonial" role="button" data-slide="prev">

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-left-s.svg" onerror="this.src='images/svg/arrow-left-s.png'" alt="">

                </a>

                <a class="right carousel-control" href="#testimonial" role="button" data-slide="next">

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-right-s.svg" onerror="this.src='images/svg/arrow-right-s.png'" alt="">

                </a>

               

            </div><!-- end carousel-inner -->

        </div><!-- end testimonial -->

   

<?php endif; ?>







        



