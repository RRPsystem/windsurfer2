<?php
if( !function_exists('travellers_compress') ):
function travellers_compress($buffer) {
    //Remove CSS comments
    $buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);
    //Remove tabs, spaces, newlines, etc.
    $buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $buffer);
    return $buffer;
}
endif;
function travellers_hex2rgb( $color, $opacity='1' ) {
  $color = trim( $color, '#' );

  if ( strlen( $color ) == 3 ) {
    $r = hexdec( substr( $color, 0, 1 ).substr( $color, 0, 1 ) );
    $g = hexdec( substr( $color, 1, 1 ).substr( $color, 1, 1 ) );
    $b = hexdec( substr( $color, 2, 1 ).substr( $color, 2, 1 ) );
  } else if ( strlen( $color ) == 6 ) {
    $r = hexdec( substr( $color, 0, 2 ) );
    $g = hexdec( substr( $color, 2, 2 ) );
    $b = hexdec( substr( $color, 4, 2 ) );
  } else {
    return '';
  }

  if( !$opacity ) return "{$r}, {$g}, {$b}";

  return "rgba( {$r}, {$g}, {$b}, {$opacity} )";
}
function travellers_background_css($option_id, $selector = ''){
  $background = ot_get_option($option_id, array());
   $output = '';
   if ( !empty( $background ) ) {
        $background_color       = ( $background['background-color'] != '' ) ? 'background-color:'. $background['background-color'] . ';'."\n" : '';
        $background_image       = ( $background['background-image'] != '' ) ? 'background-image: url('.esc_url($background['background-image']).');'."\n" : '';
        $background_repeat      = ( $background['background-repeat'] != '' ) ? 'background-repeat: '. $background['background-repeat']. ';'."\n" : '';
        $background_positon     = ( $background['background-position'] != '' ) ? 'background-position:'. $background['background-position']. ';'."\n" : '';
        $background_attachment  = ( $background['background-attachment'] != '' ) ? 'background-attachment:'. $background['background-attachment']. ';'."\n" : '';
        $background_size        = ( $background['background-size'] != '' ) ? 'background-size: '. $background['background-size']. ';'."\n" : '';
        

        $output .=  "\n".esc_attr($selector) .' { '."\n".$background_color.$background_image.$background_repeat.$background_attachment.$background_positon. $background_size .'}'. "\n";
        
    }
    return $output;
}

function travellers_spacing_option( $spacing = array() ){

  if(!empty($spacing)){
      $unit = ($spacing['unit'] != '')? $spacing['unit'] : 'px';
      return (isset($spacing['top'])? $spacing['top'].$unit : 0).' '.(isset($spacing['right'])? $spacing['right'].$unit : 0).' '.(isset($spacing['bottom'])? $spacing['bottom'].$unit : 0).' '.(isset($spacing['left'])? $spacing['left'].$unit : 0);
  }else{
    return '';
  } 
  
}

function travellers_typography_css($option_id){
    $typography = ot_get_option( $option_id, array() );
    $css = '';
    if(!empty($typography) && is_array($typography)) :       
                
        foreach ($typography as $key => $value) {

            if( ($key == 'font-color') && ($value != '') ) $css .= 'color: '.$value.'; ';
            elseif( $key == 'font-family' ){
                if($value != ''){
                    $ot_set_google_fonts  = get_theme_mod( 'ot_google_fonts', array() );

                    $default = array(
                        'roboto'     => 'Roboto',
                        'arial'     => 'Arial',
                        'georgia'   => 'Georgia',
                        'helvetica' => 'Helvetica',
                        'palatino'  => 'Palatino',
                        'tahoma'    => 'Tahoma',
                        'times'     => '"Times New Roman"',
                        'trebuchet' => 'Trebuchet',
                        'verdana'   => 'Verdana'
                      );

                    $default = apply_filters( 'travellers/recognized_font_families', $default );
                    $family = isset($ot_set_google_fonts[$value])? $ot_set_google_fonts[$value]['family'] : '';
                    $family = (($family == '') && isset($default[$value]))? $default[$value]. ';' : $family;

                    $css .= ($family != '')? 'font-family: '.$family.'; ' : '';
                }
                
            } 
            else
              $css .= ( ($key != 'font-family') && ($value != '') )? $key. ': '.$value.'; ' : '';
        }

    endif;

    return $css;
}
/**
 * Returns CSS for the color schemes.
 *
 * @param array $colors Color scheme colors.
 * @return string Color scheme CSS.
 */
function travellers_get_color_scheme_css() {
	$css = '';
	/*color options*/
	$preset_color = ot_get_option('preset_color', '#74cc01');
  $container_width = ot_get_option('container_width', array(1170, 'px'));
  $header_background = ot_get_option('header_background', TRAVELLERS_URI.'/images/breadcrumb.jpg');
  $header_padding = ot_get_option('header_padding', array( 'top' => 10, 'bottom' => 25, 'unit' => 'px'));

  $css .= '
  :root{
    --primary: '.$preset_color.';
    --primary-rgb: '.travellers_hex2rgb($preset_color, false).';
    --bs-primary: var(--primary);
    --bs-primary-rgb: var(--primary-rgb);
  }
  ';

  $css .= '.breadcrumb-bg{
    background-image: url('.esc_url(TravellersHeader::header_image_url()).');
    padding: '.travellers_spacing_option($header_padding).'
  }';



 $css .= '/* color */ 
 html, body, div, p, table, tr, td, th, tbody, tfoot, ul, li, ol, dl, dd, dt, fieldset, blockquote, cite, input, select, textarea, button, section, article, aside, header, #main-footer, nav, span, h1, h2, h3, h4, h5, h6{
  '.travellers_typography_css( 'primary_font' ).'
}        
body{
  '.travellers_typography_css( 'body' ).'
}        
h1{
'.travellers_typography_css('h1').'
}
h2{
'.travellers_typography_css('h2').'
}
h3{
'.travellers_typography_css('h3').'
}
h4{
'.travellers_typography_css('h4').'
}
h5{
'.travellers_typography_css('h5').'
}
h6{
'.travellers_typography_css('h6').'
}
.widget-wrap .widget-title{
'.travellers_typography_css('sidebar_title').'
}
footer{
  '.travellers_typography_css('footer').'
}';

$css = travellers_compress($css);

  wp_add_inline_style( 'travellers-theme', $css );
}

add_action( 'wp_enqueue_scripts', 'travellers_get_color_scheme_css' );
