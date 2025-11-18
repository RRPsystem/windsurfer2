<section id="wp-main-content" class="clearfix main-page">
  	<?php do_action('gowilds_page_breacrumb'); ?>
  	<div class="container">  
	 	<div class="main-page-content row">
			<div class="content-page">      
			  	<div id="wp-content" class="wp-content clearfix">
			  		<?php
			  			if(have_posts()){
			  				the_post();
			  				the_content(); 
			  			}	
			  		?>
			  	</div>
			</div>
		</div>
	</div>
</section>			
