<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
 */

?>
	</div><!--end page content-->
	
</div><!-- End page -->

	<footer id="wp-footer" class="clearfix">
		<?php 
			$footer_id = apply_filters('gowilds_get_footer_layout', null );
			if($footer_id && class_exists('GVA_Layout_Frontend')){
				echo '<div class="footer-main">' . GVA_Layout_Frontend::getInstance()->element_display($footer_id) . '</div>';
			}
		?>
		<?php if(gowilds_get_option('copyright_default', 'yes') == 'yes'){ ?>
			<div class="copyright">
				<div class="container">
					<div class="copyright-content">
							<div class="row">
								<div class="col-sm-12 col-xs-12">
									<?php 
										if(!empty($copyright)){ 
											echo esc_html($copyright);
										}else{
											echo esc_html__('Copyright 2023 - Company - All rights reserved. Powered by WordPress.', 'gowilds');
										}
									?>
								</div>
							</div>	
						</div>	
				</div>
			</div>
		<?php } ?>	

	</footer>
	
	<div id="gva-overlay"></div>
	<?php do_action( 'gowilds_offcanvas_mobile' ); ?>
	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="blur-svg">
	   <defs>
	      <filter id="blur-filter">
	         <feGaussianBlur stdDeviation="3"></feGaussianBlur>
	      </filter>
	    </defs>
	</svg>

<?php wp_footer(); ?>

</body>
</html>