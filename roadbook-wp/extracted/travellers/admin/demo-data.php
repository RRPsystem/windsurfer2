<?php
function travellers_import_demo_data() {

  return array(    
    array(
      'import_file_name'           => 'Home 1',
      'categories'                 => array( 'Landing pages' ),
      'import_file_url'            => TRAVELLERS_URI.'/admin/demo-data/demo-content.xml',
      'import_widget_file_url'     => TRAVELLERS_URI.'/admin/demo-data/widgets.wie',
      'import_customizer_file_url' => TRAVELLERS_URI.'/admin/demo-data/customizer.dat', 
      'preview_url'                => '//themeperch.net/travelers',
    ),
    array(
      'import_file_name'           => 'Home 2',
      'categories'                 => array( 'Landing pages' ),
      'import_file_url'            => TRAVELLERS_URI.'/admin/demo-data/demo-content.xml',
      'import_widget_file_url'     => TRAVELLERS_URI.'/admin/demo-data/widgets.wie',
      'import_customizer_file_url' => TRAVELLERS_URI.'/admin/demo-data/customizer.dat',  
      'preview_url'                => '//themeperch.net/travelers/home-2/',
    ),
    array(
      'import_file_name'           => 'Home 3',
      'categories'                 => array( 'Landing pages' ),
      'import_file_url'            => TRAVELLERS_URI.'/admin/demo-data/demo-content.xml',
      'import_widget_file_url'     => TRAVELLERS_URI.'/admin/demo-data/widgets.wie',
      'import_customizer_file_url' => TRAVELLERS_URI.'/admin/demo-data/customizer.dat',  
      'preview_url'                => '//themeperch.net/travelers/home-3/',
    ),
    array(
      'import_file_name'           => 'Home 4',
      'categories'                 => array( 'Landing pages' ),
      'import_file_url'            => TRAVELLERS_URI.'/admin/demo-data/demo-content.xml',
      'import_widget_file_url'     => TRAVELLERS_URI.'/admin/demo-data/widgets.wie',
      'import_customizer_file_url' => TRAVELLERS_URI.'/admin/demo-data/customizer.dat',  
      'preview_url'                => '//themeperch.net/travelers/home-4/',
    ),

  );

}

add_filter( 'pt-ocdi/import_files', 'travellers_import_demo_data' );


function travellers_after_import_setup() {
  // Assign menus to their locations.
  $primary = get_term_by( 'name', 'Main menu', 'nav_menu' );

  set_theme_mod( 'nav_menu_locations', array(
        'primary' => $primary->term_id,
        //'footer' => $footer->term_id,
      )
  );

  // Assign front page and posts page (blog page).
  $front_page_id = get_page_by_title( 'Home' );
  $blog_page_id  = get_page_by_title( 'Blog' );

  update_option( 'show_on_front', 'page' );
  update_option( 'page_on_front', $front_page_id->ID );
  update_option( 'page_for_posts', $blog_page_id->ID );
  

}
add_action( 'pt-ocdi/after_import', 'travellers_after_import_setup' );

function travellers_after_import( $selected_import ) {


  $pagename = 'Home 2';
  if ( $pagename === $selected_import['import_file_name'] ) {
      $front_page_id = get_page_by_title( $pagename );
      update_option( 'show_on_front', 'page' );
      update_option( 'page_on_front', $front_page_id->ID );
  }

  $pagename = 'Home 3';
  if ( $pagename === $selected_import['import_file_name'] ) {
      $front_page_id = get_page_by_title( $pagename );
      update_option( 'show_on_front', 'page' );
      update_option( 'page_on_front', $front_page_id->ID );     
  }

  $pagename = 'Home 4';
  if ( $pagename === $selected_import['import_file_name'] ) {
      $front_page_id = get_page_by_title( $pagename );
      update_option( 'show_on_front', 'page' );
      update_option( 'page_on_front', $front_page_id->ID );     
  }
  
   //woocommerce setup
    $shop_page  = get_page_by_title( 'Shop' );
    $cart_page  = get_page_by_title( 'Cart' );
    $checkout_page  = get_page_by_title( 'Checkout' );
    $account_page  = get_page_by_title( 'My account' );
    $privacy_page  = get_page_by_title( 'Privacy Policy' );
    update_option( 'woocommerce_shop_page_id', $shop_page->ID );
    update_option( 'woocommerce_cart_page_id', $cart_page->ID );
    update_option( 'woocommerce_checkout_page_id', $checkout_page->ID );
    update_option( 'woocommerce_myaccount_page_id', $account_page->ID );
    update_option( 'woocommerce_terms_page_id', $privacy_page->ID );
  
}
//pt-ocdi/after_import
add_action( 'pt-ocdi/after_import', 'travellers_after_import' );

add_filter( 'pt-ocdi/disable_pt_branding', '__return_true' );