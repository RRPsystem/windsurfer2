<?php
extract(shortcode_atts(array(
	'image' => TRAVELLERS_URI.'/assets/img/slider/slider-1.jpg',
    'title' => 'Safe Drive & Get License',
    'desc' => 'Morbi accumsan ipsum velit. Nam nec tellus a odio tincidunt auctor consequat auctor eu in elit. Class aptent taciti sociosqu ad litora torquent Get free forever!',
    'buttons' => '',
    'shortcode' => '',
), $atts));

?>            
    <div class="theme-slider">
        <div class="item">  
            <div class="carousel-inner slider">
                <span class="mask-overlay"></span>      
                <img src="<?php echo esc_url($image) ?>" alt="">                       
                <div class="theme-container container">
                    <div class="caption-text row animated fadeInUp">
                        <div class="col-md-7 col-sm-7">
                            <h2 class="extra-bold-font block-inline"><?php echo travellers_parse_text($title); ?></h2>
                            <p><?php echo esc_attr($desc); ?></p>
                            <?php
                            $buttonsArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($buttons) : array();
                            if( !empty($buttonsArr) ):
                            ?>
                            <div class="buy-now">
                                <?php
                                foreach ($buttonsArr as $key => $value) {
                                    extract($value);
                                    $class = ( $button_style == 'style1' )? 'theme-btn btn' : 'theme-btn-1 btn white-color';
                                    echo '<a href="'.esc_url($button_url).'" class="'.esc_attr($class).'">'.esc_attr($button_text).'</a>';
                                }
                                ?>
                            </div>
                            <?php endif; ?>
                        </div>
                        <div class="col-md-4 col-sm-5 col-md-offset-1 hidden-xs">

                            <div class="form-wrap">
                                <div class="slider-form">      
                                    <?php echo do_shortcode($shortcode); ?>                                       
                                </div>                                     
                            </div>                                                                 
                        </div>
                    </div>
                </div>
            </div>
        </div>                    
    </div>