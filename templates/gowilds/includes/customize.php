<?php
function gowilds_custom_color_theme(){
   $color_link                = gowilds_get_option('color_link', '');
   $color_link_hover          = gowilds_get_option('color_link_hover', '');
   $color_heading             = gowilds_get_option('color_heading', '');
   $footer_bg_color           = gowilds_get_option('footer_bg_color', '');
   $footer_color              = gowilds_get_option('footer_color', '');
   $footer_color_link         = gowilds_get_option('footer_color_link', '');
   $footer_color_link_hover   = gowilds_get_option('footer_color_link_hover', '');
   $nfpage_image_width        = gowilds_get_option('nfpage_image_width', '');

   $main_font = false;
   $main_font_enabled = ( gowilds_get_option('main_font_source', 0) == 0 ) ? false : true;
   if ( $main_font_enabled ) {
      $font_main = gowilds_get_option('main_font', '');
      if(isset($font_main['font-family']) && $font_main['font-family']){
         $main_font = $font_main['font-family'];
      }
   }

   $secondary_font = false;
   $secondary_font_enabled = ( gowilds_get_option('secondary_font_source', 0) == 0 ) ? false : true;
   if ( $secondary_font_enabled ) {
      $font_second = gowilds_get_option('secondary_font', '');
      if(isset($font_second['font-family']) && $font_second['font-family']){
         $secondary_font = $font_second['font-family'];
      }
   }
   ob_start();
   ?>

   :root{

      <?php if( !empty($color_link) ){ ?>
         --gowilds-link-color: <?php echo esc_attr($color_link) ?>;
      <?php } ?> 

      <?php if( !empty($color_link_hover) ){ ?>
         --gowilds-link-hover-color: <?php echo esc_attr($color_link_hover) ?>;
      <?php } ?> 

      <?php if( !empty($color_heading) ){ ?>
         --gowilds-heading-color: <?php echo esc_attr($color_heading) ?>;
      <?php } ?> 

      <?php if( !empty($link_color) ){ ?>
         --gowilds-font-sans-serif: "Kumbh Sans", sans-serif; 
      <?php } ?> 

      <?php if ( $main_font_enabled && isset($main_font) && $main_font ){ ?>
         --gowilds-font-sans-serif:<?php echo esc_attr( $main_font ); ?>,sans-serif;
      <?php } ?>   

      <?php if ( $secondary_font_enabled && isset($secondary_font) && $secondary_font ){ ?>
         --gowilds-heading-font-family :<?php echo esc_attr( $secondary_font ); ?>, sans-serif;
      <?php } ?>

      <?php if( !empty($footer_bg_color) ){ ?>
         --gowilds-footer-bg-color: <?php echo esc_attr($footer_bg_color) ?>;
      <?php } ?>   
      
      <?php if( !empty($footer_color) ){ ?>
         --gowilds-footer-color: <?php echo esc_attr($footer_color) ?>;
      <?php } ?>   

      <?php if( !empty($footer_color_link) ){ ?>
         --gowilds-footer-color-link: <?php echo esc_attr($footer_color_link) ?>;
      <?php } ?>   

      <?php if( !empty($footer_color_link_hover) ){ ?>
         --gowilds-footer-color-link-hover: <?php echo esc_attr($footer_color_link_hover) ?>;
      <?php } ?>

      <?php if( !empty($nfpage_image_width) ){ ?>
         --gowilds-nfpage-image-width: <?php echo esc_attr($nfpage_image_width) ?>px;
      <?php } ?>   

   }

<?php
   $styles = ob_get_clean();
   $styles = preg_replace( '!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $styles );
   $styles = str_replace( array( "\r\n", "\r", "\n", "\t", '  ', '   ', '    ' ), '', $styles );
   if($styles){
      wp_enqueue_style( 'gowilds-custom-style-color', GOWILDS_THEME_URL . '/assets/css/custom_script.css');
      wp_add_inline_style( 'gowilds-custom-style-color', $styles );
   }
}

add_action('wp_enqueue_scripts', 'gowilds_custom_color_theme', 99999);