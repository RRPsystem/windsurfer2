<?php
if( class_exists('WPCF7_ContactFormTemplate') ):
class Shiftkey_ContactFormTemplate extends WPCF7_ContactFormTemplate { 
	function __construct(){
      add_action( 'wpcf7_init', array( __CLASS__, 'add_form_tag_admin_edit_link' ) );
		  add_filter( 'wpcf7_default_template', array( __CLASS__, 'custom_form' ), 10, 2 );
	}
 
 
  public static function custom_form($template, $prop) { 
    if ( $prop == 'form' ) {
      $template = '<div class="field-wrapper">
<div class="form-row col-md-6 col-sm-12">
<div>[text your-name class:form-control "Your name"]</div>
<div>[email* your-email class:form-control "Your email"]</div>
<div> [text your-subject class:form-control "Your subject"]</div>
</div>
<div class="form-row col-md-6 col-sm-12">
[textarea your-message class:form-control "Write your comment here"]
</div><div class="clear"></div>
<div class="form-row  col-md-12">
[submit class:btn class:btn-primary class:btn-lg "&#xf1d8; Send message"]
</div><div class="clear"></div>
</div>[editlink]'; 
    }
 
      return $template; 
  } 


  public static function add_form_tag_admin_edit_link() {
      wpcf7_add_form_tag( 'editlink', 'travellers_admin_edit_link_form_tag_handler', array( 'name-attr' => false ) );
  }

  
} 

new Shiftkey_ContactFormTemplate();
endif;

function travellers_admin_edit_link_form_tag_handler( $tag ) {
     if( current_user_can( 'administrator' ) ){
          $wpcf7 = WPCF7_ContactForm::get_current(); 
          $id = $wpcf7->id();
          $form_edit_link = admin_url( 'admin.php?page=wpcf7&post='.intval($id).'&action=edit' );
          $mail_edit_link = admin_url( 'admin.php?page=wpcf7&post='.intval($id).'&action=edit&active-tab=1' );

          $html = '<div class="cf7-edit-link small">';  
          $html .= sprintf(' <a target="_blank" href="%s">%s</a>', esc_url($form_edit_link), esc_attr__('Edit contact form', 'travellers'));        
          $html .= sprintf(', <a target="_blank" href="%s">%s</a>', esc_url($mail_edit_link), esc_attr__('Check Mail settings', 'travellers'));
          $html .= '</div>';      

          return $html;
      }
}