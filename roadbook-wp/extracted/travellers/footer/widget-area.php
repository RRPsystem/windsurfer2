<?php
$footer_widget_display = ot_get_option( 'footer_widget_area', 'on' );
if( $footer_widget_display == 'on' ):
	$classArr = array('col-lg-4', 'col-md-4 col-lg-3', 'col-md-3 col-lg-2 offset-md-1 offset-lg-0', 'col-md-4 col-lg-3');
    $total = ot_get_option( 'footer_widget_area_column', '4' );
    for( $i=1; $i<=$total; $i++ ):
        $class = ($total == 4)? $classArr[$i-1] : 'col-md-'.(12/$total);
			?>
			<div class="<?php echo esc_attr($class) ?>">
	            <?php 
	            $sidebar = 'footer-'.$i;
	            if ( is_active_sidebar( $sidebar ) ) :
	            	dynamic_sidebar( $sidebar ); 
	            else:
	            	 //$args = 'before_widget=<div class="footer-links m-bottom-40">&after_widget=</div>&before_title=<h5 class="h5-sm">&after_title=</h5>'; 
					//the_widget( 'WP_Widget_Meta', '', $args ); 
	            endif;
	            ?>
	        </div>
			<?php 
	endfor;
endif; 
?>