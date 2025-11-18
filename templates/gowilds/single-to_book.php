<?php
/**
 * $Desc
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html 
 * 
 */
   get_header(); 
 ?>
<section id="wp-main-content" class="clearfix main-page">
   <div class="main-page-content">
      <div class="content-page">      
         <div id="wp-content" class="wp-content clearfix">
            <?php 
               if(class_exists('GVA_Layout_Frontend')){
                  do_action('gowilds/layouts/single/booking');
               }else{
                  get_template_part('templates/blog/single');
               }
            ?>
         </div>    
      </div>      
   </div>   
</section>

<?php get_footer(); ?>
