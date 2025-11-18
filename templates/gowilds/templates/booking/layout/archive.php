<?php do_action('gowilds_page_breacrumb') ?>
<div class="booking-archive-layout-default margin-top-80 margin-bottom-50">
   <div class="booking-content">
      <div class="container">
         <div class="row">
            <div class="col-12">
               <div class="lg-block-grid-3 md-block-grid-3 sm-block-grid-2 xs-block-grid-1">
                  <?php 
                     while ( have_posts() ) : the_post();
                        $post = get_post( get_the_ID(), ARRAY_A);
                        $prices = BABE_Post_types::get_post_price_from( $post['ID'] );
                        $post = array_merge($post, $prices);
                        echo '<div class="item-colums">';
                           include get_theme_file_path('templates/booking/block/item-style-1.php');
                        echo '</div>';
                    endwhile;
                  ?>
               </div>   
            </div>
         </div>
      </div>
   </div>   
</div>