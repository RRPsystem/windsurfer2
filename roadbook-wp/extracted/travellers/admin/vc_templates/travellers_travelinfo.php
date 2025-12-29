<?php

extract(shortcode_atts(array(

    'travelinfo' => '',

), $atts));

$travelinfoArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($travelinfo) : array();

$args = array(

      'tag' => 'strong',
      'tagclass' => '',
      'before' => '<br>',
      'after' => '',

  );

if( !empty($travelinfoArr) ):

?>



<div class="row">

  <!-- ::: Owl Carousel Start ::: -->

  <div id="owl-demo" class="owl-carousel">

  <?php foreach ($travelinfoArr as $key => $value) : extract($value); ?>



        <!-- ::: Start item ::: -->

        <div class="item">

            <div class="item-header">

                <i class="<?php echo esc_attr($icon) ?>"></i>

                <h5><?php echo esc_attr($title) ?><small><?php echo esc_attr($subtitle) ?></small></h5>

            </div><!-- end item-header -->



            <div class="item-info">

            <?php if( $type == 'flight' ): ?>

                <div class="departure">

                    <h6><?php echo travellers_parse_text($departure, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($departure_form1, array('tag' => 'h2')); ?>                        

                        <strong><?php echo esc_attr($departure_at1); ?></strong>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-right-s.svg" onerror="this.src='images/svg/arrow-right-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($arrival_to1, array('tag' => 'h2')); ?>

                        <strong><?php echo esc_attr($arrival_at1); ?></strong>

                    </div>

                    <div class="clear"></div>

                </div><!-- end departure -->



                <div class="arrival">

                    <h6><?php echo travellers_parse_text($arrival, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($arrival_to2, array('tag' => 'h2')); ?>

                        <strong><?php echo esc_attr($arrival_at2); ?></strong>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-left-s.svg" onerror="this.src='images/svg/arrow-left-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($departure_form2, array('tag' => 'h2')); ?>

                        <strong><?php echo esc_attr($departure_at2); ?></strong>

                    </div>

                    <div class="clear"></div>

                </div><!-- end arrival -->

            <?php endif; ?>



            <?php if( $type == 'train' ): ?>

                <div class="departure">

                    <h6><?php echo travellers_parse_text($departure, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($departure_form1, array('tag' => 'h5')); ?>                        

                        <strong><?php echo esc_attr($departure_at1); ?></strong>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-right-s.svg" onerror="this.src='images/svg/arrow-right-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($arrival_to1, array('tag' => 'h5')); ?>

                        <strong><?php echo esc_attr($arrival_at1); ?></strong>

                    </div>

                    <div class="clear"></div>

                </div><!-- end departure -->



                <div class="arrival">

                    <h6><?php echo travellers_parse_text($arrival, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($arrival_to2, array('tag' => 'h5')); ?>

                        <strong><?php echo esc_attr($arrival_at2); ?></strong>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-left-s.svg" onerror="this.src='images/svg/arrow-left-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($departure_form2, array('tag' => 'h5')); ?>

                        <strong><?php echo esc_attr($departure_at2); ?></strong>

                    </div>

                    <div class="clear"></div>

                </div><!-- end arrival -->

            <?php endif; ?>



            <?php if( $type == 'accomodation' ): ?>

                <img class="img-responsive" src="<?php echo esc_url($image); ?>" alt="">

                <div class="info">

                    <h5 class="prime"><?php echo esc_attr($name) ?></h5>

                    <p><?php echo esc_attr($desc) ?></p>

                    <a href="<?php echo esc_url($website) ?>" title="" target="_blank"><i class="fa fa-globe"></i> <?php echo esc_attr($website) ?></a>

                </div>

            <?php endif; ?>



          <?php if( $type == 'cruise' ): ?>

                <div class="departure">

                    <h5><?php echo esc_attr($name) ?></h5>

                    <h6><?php echo travellers_parse_text($departure, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($departure_at1, array('tag' => 'h2')); ?>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-right-s.svg" onerror="this.src='images/svg/arrow-right-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($arrival_at1, array('tag' => 'h2')); ?>

                    </div>

                    <div class="clear"></div>

                </div><!-- end departure -->



                <div class="arrival">

                    <h5><?php echo esc_attr($name2) ?></h5>

                    <h6><?php echo travellers_parse_text($arrival, array('tag' => 'strong')); ?></h6>

                    <div class="left">

                        <?php echo travellers_parse_text($arrival_at2, array('tag' => 'h2')); ?>

                    </div>

                    <img class="svg arrPrime" src="<?php echo TRAVELLERS_URI; ?>/images/svg/arrow-left-s.svg" onerror="this.src='images/svg/arrow-left-s.png'" alt="">

                    <div class="right">

                        <?php echo travellers_parse_text($departure_at2, array('tag' => 'h2')); ?>

                    </div>

                    <div class="clear"></div>

                </div><!-- end arrival -->           

          <?php endif; ?>



      </div><!-- end item-info -->

    </div><!-- ::: End item ::: -->

      

    <?php endforeach; ?>



  </div><!-- ::: end OWL Carousel ::: -->

</div><!-- .row -->

<?php endif; ?>