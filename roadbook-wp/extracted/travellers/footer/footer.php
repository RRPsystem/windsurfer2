<?php 
$footer_social_links = array(
    array(
        'title' => 'Facebook',
        'icon' => 'fa-facebook',
        'link' => '#',
    ),
    array(
        'title' => 'Twitter',
        'icon' => 'fa-twitter',
        'link' => '#',
    ), 
    array(
        'title' => 'Google+',
        'icon' => 'fa-google-plus',
        'link' => '#',
    ), 
    array(
        'title' => 'Linkedin',
        'icon' => 'fa-linkedin',
        'link' => '#',
    ),  
    array(
        'title' => 'Flickr',
        'icon' => 'fa-flickr',
        'link' => '#',
    ),
    array(
        'title' => 'Youtube',
        'icon' => 'fa-youtube',
        'link' => '#',
    ), 
);
extract(wp_parse_args( $args,  array(
    'footer_widget_area' => 'on',
    'copyright_text' => ot_get_option( 'copyright_text', '<p><strong>Group Tour</strong> &copy; '.date('Y').'. All Rights Reserved.<br> Landing Page Template Designed &amp; Developed By: <a href="http://themeforest.net/user/jthemes?ref=jthemes" title="jThemes Studio"><strong>jThemes Studio</strong></a></p>' ),
    'footer_social_links' => ot_get_option( 'footer_social_links', $footer_social_links),
    'terms_display' => ot_get_option('terms_display', 'on')
)));
?>
<!--  ::: FOOTER ::: -->
<footer id="main-footer" class="BGdark opaque">
    <div class="container">
        <?php if( ot_get_option('footer_widget_area', 'on') == 'on' ): ?>
        <div class="footer-widget-part">
            <div class="row">
                <?php get_template_part( 'footer/widget-area' ); ?>
            </div>    <!-- END FOOTER CONTENT -->
        </div>
        <?php endif; ?>
        
        <div class="col-md-6 col-sm-12">
            <?php 
                echo wp_kses_post(wpautop($copyright_text, true));
            ?>
        </div>
        <div class="col-md-6 col-sm-12 text-right">
            <?php if( $terms_display == 'on' ): ?>
            <ul class="list-inline">
                <li><a href="#" title="<?php echo esc_attr( ot_get_option('terms_title', 'Terms & Conditions') ) ?>" target="_blank"  data-toggle="modal" data-target="#myModal"><?php echo esc_attr( ot_get_option('terms_title', 'Terms & Conditions') ) ?></a></li>
            </ul>
            <?php endif; ?>
            <?php
                if( !empty($footer_social_links) ):
                ?>
                <div class="social">
                    <ul class="list-inline">
                        <?php foreach ($footer_social_links as $key => $value) {
                            if(empty($value['link'])) continue;

                            $icon_class = '';
                            if(strpos($icon_class, 'fab') !== false){
                                $icon_class = $value['icon'];
                            }else{
                                $icon_class = 'fab '. $value['icon'];
                            }                            
                            
                            echo '<li><a href="'.esc_url($value['link']).'" title="'.esc_attr($value['title']).'"><i class="'.esc_attr($icon_class).'"></i></a></li>';
                        } ?>
                    </ul>
                </div>
            <?php endif; ?>
        </div>
    </div><!-- end container -->
</footer>
<!-- ::: END ::: -->