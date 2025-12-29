<?php

extract(shortcode_atts(array(

    'style' => 'style1',
    'placeinfo_bg' => 'dark',
    'locations' => '',

), $atts));

$locationsArr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($locations) : array();

if( !empty($locationsArr) ):

$count = 0;   

if( $style == 'style1' ):

    ?>

    <div id="itinarary-wrap">

    <div class="tube">

        <span class="start">START</span>

        <span class="end">END</span>

    </div>

    <div id="car"></div>



    <!-- ::: Itinarary Start ::: -->

    <div class="itinarary">

        <div class="line"></div>

        <?php foreach ($locationsArr as $key => $value) : 

            $args = array(

                    'post_type' => 'location',

                    'post__in' => explode(',', $value['location']),

                    'posts_per_page' => 1,



                ); 

            

            $the_query = new WP_Query( $args );

            if ( $the_query->have_posts() ) :

                while ( $the_query->have_posts() ) :

                        $the_query->the_post();

                        ?>

                        <?php if( ($count%2) == 0 ): ?>

                            <!-- ::: Place image left::: -->

                            <div class="day">

                                <div class="left placeImg">

                                    <img src="<?php the_post_thumbnail_url('travellers-location-size') ?>" width="800" height="480" alt="<?php the_title() ?>">

                                </div>

                                <div class="right placeInfo">

                                <div class="dayNum abs"><?php echo esc_attr($value['day']) ?></div>



                                 <?php get_template_part( 'templates/content', 'location' ); ?> 



                                 <?php if( $value['delight'] != '' ): ?>

                                    <div class="delight"><i class="fa fa-star"></i> <?php echo travellers_parse_text($value['delight'], array('tag' => 'h6')); ?></div>

                                <?php endif; ?>



                                </div><div class="clear"></div>

                            </div><div class="clear"></div>

                        <?php else: ?>    

                            <!-- ::: Place image right::: -->

                            <div class="day">

                                <div class="left placeInfo">

                                    <div class="dayNum abs"><?php echo esc_attr($value['day']) ?></div>



                                    <?php get_template_part( 'templates/content', 'location' ); ?> 

                                    

                                    <?php if( $value['delight'] != '' ): ?>

                                        <div class="delight"><i class="fa fa-star"></i> <?php echo travellers_parse_text($value['delight'], array('tag' => 'h6')); ?></div>

                                    <?php endif; ?>



                                </div>

                                <div class="right placeImg">

                                    <img src="<?php the_post_thumbnail_url('travellers-location-size') ?>" width="800" height="480" alt="Place 2">

                                </div><div class="clear"></div>

                            </div><div class="clear"></div>

                        <?php endif; ?>

                    <?php endwhile; wp_reset_postdata(); ?>    

                <?php $count++; endif; ?>





        <?php  endforeach; ?>



        



    </div><!-- ::: Itinarary end ::: -->

    </div>

<?php else: ?>



        <!-- ::: Itinarary Start ::: -->

        <div class="itinarary opt">

            <div id="itinarary2" class="owl-carousel owl-theme <?php echo esc_attr($placeinfo_bg) ?>">

                <?php foreach ($locationsArr as $key => $value) : 

                $args = array(

                        'post_type' => 'location',

                        'post__in' => explode(',', $value['location']),

                        'posts_per_page' => 1,



                    ); 

                

                $the_query = new WP_Query( $args );

                if ( $the_query->have_posts() ) :

                    while ( $the_query->have_posts() ) :

                            $the_query->the_post();

                            

                        if( ($count%2) == 0 ): ?>

                            <!-- ::: item ::: -->

                            <div class="item">

                                <div class="day">

                                    <div class="left placeImg">

                                        <img src="<?php the_post_thumbnail_url('travellers-location-size') ?>" width="800" height="480" alt="<?php the_title() ?>">

                                    </div>

                                    <div class="right placeInfo">

                                        <div class="dayNum abs"><?php echo esc_attr($value['day']) ?></div>

                                        <?php get_template_part( 'templates/content', 'location' ); ?> 



                                         <?php if( $value['delight'] != '' ): ?>

                                            <div class="delight"><i class="fa fa-star"></i> <?php echo travellers_parse_text($value['delight'], array('tag' => 'h6')); ?></div>

                                        <?php endif; ?>

                                    </div><div class="clear"></div>

                                </div><div class="clear"></div>

                            </div>

                        <?php else: ?> 

                            <!-- ::: item ::: -->

                            <div class="item">

                                <div class="day">

                                    <div class="left placeInfo">

                                        <div class="dayNum abs"><?php echo esc_attr($value['day']) ?></div>

                                            <?php get_template_part( 'templates/content', 'location' ); ?> 



                                             <?php if( $value['delight'] != '' ): ?>

                                                <div class="delight"><i class="fa fa-star"></i> <?php echo travellers_parse_text($value['delight'], array('tag' => 'h6')); ?></div>

                                            <?php endif; ?>

                                    </div>

                                    <div class="right placeImg">

                                        <img src="<?php the_post_thumbnail_url('travellers-location-size') ?>" width="800" height="480" alt="<?php the_title() ?>">

                                    </div><div class="clear"></div>

                                </div><div class="clear"></div>

                            </div>

                    <?php endif; ?>



                    <?php endwhile; wp_reset_postdata(); ?>    

                <?php $count++; endif; ?>



                <?php  endforeach; ?>



            </div>

        </div><!-- ::: Itinarary end ::: -->

<?php endif; ?>

<?php endif; ?>