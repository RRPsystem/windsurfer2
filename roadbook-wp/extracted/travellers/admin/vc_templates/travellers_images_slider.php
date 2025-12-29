<?php
extract(shortcode_atts(array(
    'header_images_slider' => '',
), $atts));
$slidesArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($header_images_slider) : array();

if( !empty($slidesArr) ): 
    $i = 0;
    
?>
<!--BEGIN-HEADER-CAROUSEL-->
<div id="image-slider" class="BGprime opaque carousel slide carousel-fade" data-ride="carousel"> 
    <!--<div class="texture"></div>-->
    <!-- Wrapper for slides -->
    <div class="carousel-inner"> 
        <?php foreach ($slidesArr as $key => $value) :
         
        if( !isset($value['contact_form']) ) $value['contact_form'] = '';

        extract($value); ?>
            <!--begin-carousel-item-->
            <div class="item<?php echo ( $i == 0 )? ' active': ''; ?>">
                <div class="carousel-image"><img src="<?php echo esc_url($image) ?>" alt="<?php echo esc_attr($title) ?>"></div>
                <div class="carousel-caption">
                    <div class="container">
                        <?php if( $contact_form != '' ): ?>
                            <div class="col-md-7">
                                <?php echo ( $title != '' )? '<h3>'.esc_attr($title).'</h3>' : ''; ?>
                                <?php echo ( $subtitle != '' )? '<h6>'.esc_attr($subtitle).'</h6>' : ''; ?>
                            </div>
                            <div class="col-md-5 visible-lg visible-md">
                                <div class="slider_form">
                                    <h5> our booking <i class="fa fa-road"></i></h5>
                                    <form id="slider_form" method="post" action="">
                                        <div class="field-wrapper">
                                            <div class="form-row">
                                                <div class="col-md-6"><input type="text" class="form-control" id="name" name="name" placeholder="Your Name" /></div>
                                                <div class="col-md-6"><input type="email" class="form-control" id="email" name="email" placeholder="Your Email" /></div>
                                                <div class="col-md-6"><input type="text" class="form-control" id="phone" name="phone" placeholder="Your Phone" /></div>
                                                <div class="col-md-6">
                                                    <div class="search-selectpicker selectpicker-wrapper">
                                                        <select class="selectpicker form-control">
                                                            <option selected disabled>Package</option>
                                                            <option>Package-1</option>
                                                            <option>Package-2</option>
                                                            <option>Package-3</option>
                                                            <option>Package-4</option>
                                                        </select>
                                                    </div> 
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="search-selectpicker selectpicker-wrapper">
                                                        <select class="selectpicker form-control">
                                                            <option selected disabled>Guests</option>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                        </select>
                                                    </div> 
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="search-selectpicker selectpicker-wrapper">
                                                        <select class="selectpicker form-control">
                                                            <option selected disabled>Children</option>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                            <option>4</option>
                                                        </select>
                                                    </div> 
                                                </div>                                               

                                                <div class="col-md-12">
                                                    <input type="text" id="security" name="security" class="form-control hide" value="" />
                                                    <input type="submit" value="Booking" class="btn btn-primary btn-lg" id="submit" name="submit" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        <?php else: ?>

                            <?php echo ( $title != '' )? '<h3>'.esc_attr($title).'</h3>' : ''; ?>
                            <?php echo ( $subtitle != '' )? '<h6>'.esc_attr($subtitle).'</h6>' : ''; ?>
                            
                        <?php endif; ?>
                    </div>
                </div>

                
            </div>
            <!--end-of-carousel-item--> 
            <?php $i++; ?>
        <?php endforeach; ?>

    </div>
    <!-- Controls --> 
    <a class="left carousel-control" href="#image-slider" data-slide="prev">
        <img class='svg' src='<?php echo TRAVELLERS_URI ?>/images/svg/arrow-left-s.svg' onerror="this.src='arrow-left-s.png'" alt="Prev" />
    </a>
    <a class="right carousel-control" href="#image-slider" data-slide="next">
        <img class='svg' src='<?php echo TRAVELLERS_URI ?>/images/svg/arrow-right-s.svg' onerror="this.src='arrow-right-s.png'" alt="Next" />
    </a>
</div>
<!--END-OF-HEADER-CAROUSEL-->
<!-- ::: HOME SLIDER END ::: -->
<?php endif; ?>