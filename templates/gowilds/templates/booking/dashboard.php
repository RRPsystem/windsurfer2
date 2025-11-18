<?php
/**
 * $Desc
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
*/ 

$protocol = is_ssl() ? 'https' : 'http';

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
   <meta http-equiv="content-type" content="text/html; charset=<?php bloginfo( 'charset' ); ?>">
   <meta name="viewport" content="width=device-width">
   <link rel="profile" href="<?php echo esc_attr($protocol) ?>://gmpg.org/xfn/11">
   <?php wp_head(); ?>
</head>
<body <?php body_class() ?>>
   <?php wp_body_open(); ?>

      <div class="wrapper-page gowilds-dashboard-page"> 
         <?php if(!is_user_logged_in()){
            get_header();
         }else{
            get_template_part('templates/booking/dashboard/header');
         } ?>

         <div id="page-content">
            <?php
               get_template_part('templates/booking/dashboard/account');
            ?>
         </div>

         <?php if(!is_user_logged_in()){
            get_footer();
         }else{
            wp_footer();
         } ?>

      </div>

</body>
</html>
