<?php
   $gowilds_options = gowilds_get_options();
   $gowilds_logo = GOWILDS_THEME_URL . '/assets/images/logo.png';
   if(isset($gowilds_options['header_logo']['url']) && $gowilds_options['header_logo']['url']){
     $gowilds_logo = $gowilds_options['header_logo']['url'];
   }
?>
<div class="my-account-header">
   <div class="header-left">
      <div class="logo">
         <a class="logo-theme" href="<?php echo esc_url( home_url( '/' ) ); ?>">
            <img src="<?php echo esc_url($gowilds_logo); ?>" alt="<?php bloginfo( 'name' ); ?>" />
         </a>
      </div>
   </div>
   <div class="header-right">
      <div class="wishlist">
         <a href="<?php echo BABE_Settings::get_my_account_page_url() ?>?inner_page=posts-wishlist">
            <i class="lar la-heart"></i>&nbsp;<?php echo esc_html__( 'Wishlist', 'gowilds' ) ?>
         </a>
      </div>
      <div class="user-profile">
         <div class="avata">
            <?php  
               $user_id = get_current_user_id();
               $user_info = wp_get_current_user();
               $user_avatar = get_avatar_url($user_id, array('size' => 90));;
               $avatar_url = !empty($user_avatar) ? $user_avatar : (get_template_directory_uri() . '/images/placehoder-user.jpg');
            ?>
            <img src="<?php echo esc_url($avatar_url) ?>" alt="<?php echo esc_attr($user_info->display_name) ?>">
         </div>
         <div class="name">
            <span class="user-text">
               <?php echo esc_html($user_info->display_name) ?>
            </span>
         </div>
      </div>
   </div>
</div>