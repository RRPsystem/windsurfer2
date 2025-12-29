<?php
// Register Style
function travellers_iconpicker_styles() {

	wp_register_style( 'elusiveicons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/elusive-icons-2.0.0/css/elusive-icons.min.css', false, '2.0.0', 'all' );
	
	wp_register_style( 'fontawesome', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/font-awesome-4.3.0/css/font-awesome.min.css', false, '4.3.0', 'all' );
	wp_register_style( 'ionicons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/ionicons-1.5.2/css/ionicons.min.css', false, '1.5.2', 'all' );
	wp_register_style( 'mapicons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/map-icons-2.1.0/css/map-icons.min.css', false, '2.1.0', 'all' );
	wp_register_style( 'materialdesign', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/material-design-1.1.1/css/material-design-iconic-font.min.css', false, '1.1.1', 'all' );
	wp_register_style( 'octicons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/octicons-2.1.2/css/octicons.min.css', false, '2.1.2', 'all' );
	wp_register_style( 'typicons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/typicons-2.0.6/css/typicons.min.css', false, '2.0.6', 'all' );
	wp_register_style( 'weathericons', TRAVELLERS_URI. '/admin/iconpicker/icon-fonts/weather-icons-1.2.0/css/weather-icons.min.css', false, '1.2.0', 'all' );
	wp_register_style( 'travellers-admin-bootstrap', TRAVELLERS_URI. '/admin/iconpicker/bootstrap-3.2.0/css/bootstrap.css', false, '1.0.0', 'all' );
	wp_register_style( 'travellers-iconpicker', TRAVELLERS_URI. '/admin/iconpicker/bootstrap-iconpicker/css/bootstrap-iconpicker.min.css', array('travellers-admin-bootstrap'), '1.0.0', 'all' );
}

// Hook into the 'admin_enqueue_scripts' action
add_action( 'init', 'travellers_iconpicker_styles' );

// Register Script
function travellers_iconpicker_scripts() {	
	wp_register_script( 'travellers-admin-bootstrap', TRAVELLERS_URI. '/admin/iconpicker/bootstrap-3.2.0/js/bootstrap.min.js', array( 'jquery' ), false, false );
	wp_register_script( 'travellers-iconset-all', TRAVELLERS_URI. '/admin/iconpicker/bootstrap-iconpicker/js/iconset/iconset-all.min.js', array( 'jquery' ), false, false );
	wp_register_script( 'travellers-iconpicker', TRAVELLERS_URI. '/admin/iconpicker/bootstrap-iconpicker/js/bootstrap-iconpicker.js', array( 'jquery', 'travellers-admin-bootstrap' ), false, false );
	
}

add_action( 'init', 'travellers_iconpicker_scripts' );

function travellers_get_iconpicker_inputgroup( $name, $atts, $iconset='fontawesome', $iconprefix="fa "){
	if($name == '') return;

	extract(shortcode_atts( array('icon' => 'fa-adjust', 'input' => ''), $atts ));

	$iconsetArr = explode('|', $iconset);
	foreach ($iconsetArr as $key => $value) {
		wp_enqueue_style( 'travellers-'.esc_attr($value));
	}	
	wp_enqueue_style( 'travellers-iconpicker');
	wp_enqueue_script( 'travellers-iconset-all');
	wp_enqueue_script('travellers-iconpicker');
	wp_enqueue_style( 'fontawesome');

	return '<div class="input-group">
		    <span class="input-group-btn">
		        <button class="btn btn-default iconpicker" name="'.esc_attr($name).'[icon]" data-iconset="'.esc_attr($iconset).'" data-icon="'.esc_attr($icon).'" role="iconpicker">
		        '.(($icon != '')?'<i class="'.$iconprefix.esc_attr($icon).'"></i>' : '<i class="fa fa-adjust"></i>').'
		        <input type="hidden" name="'.esc_attr($name).'[icon]" value="'.esc_attr($icon).'">
		        </button>
		    </span>
		    <input type="text" name="'.esc_attr($name).'[input]" class="form-control" value="'.esc_attr($input).'" placeholder="">
		</div>';
	
}

function travellers_get_iconpicker( $name, $atts, $iconset='fontawesome', $iconprefix="fa "){
	if($name == '') return;
	$icon = $atts;

	$iconsetArr = explode('|', $iconset);
	foreach ($iconsetArr as $key => $value) {
		wp_enqueue_style( 'travellers-'.esc_attr($value));
	}	
	wp_enqueue_style( 'travellers-iconpicker');
	wp_enqueue_script( 'travellers-iconset-all');
	wp_enqueue_script('travellers-iconpicker');
	wp_enqueue_style( 'fontawesome');

	return '<button data-placement="right" class="btn btn-default iconpicker" name="'.esc_attr($name).'" data-iconset="'.esc_attr($iconset).'" data-icon="'.esc_attr($icon).'" role="iconpicker">
		        '.(($icon != '')?'<i class="'.$iconprefix.esc_attr($icon).'"></i>' : '<i class="fa fa-adjust"></i>').'
		        <input type="hidden" name="'.esc_attr($name).'" value="'.esc_attr($icon).'">
		        </button>';
	
}


add_filter( 'ot_option_types_array', 'travellers_ot_option_types_array', 10, 1 );
function travellers_ot_option_types_array($args){
	$args['iconpicker_input'] = 'Icon picker input group';
	$args['iconpicker'] = 'Icon picker';
	return $args;
}

/**
 * Text option type.
 *
 * See @ot_display_by_type to see the full list of available arguments.
 *
 * @param     array     An array of arguments.
 * @return    string
 *
 * @access    public
 * @since     2.0
 */
if ( ! function_exists( 'ot_type_iconpicker' ) ) {
  
  function ot_type_iconpicker( $args = array() ) {
    
    /* turns arguments array into variables */ 
    extract( $args ); //print_r($args);
    
    /* verify a description */
    $has_desc = $field_desc ? true : false;
    
    /* format setting outer wrapper */
    echo '<div class="format-setting type-text ' . ( $has_desc ? 'has-desc' : 'no-desc' ) . '">';
      
      /* description */
      echo $has_desc ? '<div class="description">' . htmlspecialchars_decode( $field_desc ) . '</div>' : '';
      
      /* format setting inner wrapper */
      echo '<div class="format-setting-inner">';


     	$field_value = !empty($field_value)? $field_value : $field_std;
     	$name = 'option_tree['.$field_id.']';
        echo travellers_get_iconpicker( $field_name,  $field_value );
        
      echo '</div>';
    
    echo '</div>';
    
  }
  
}


/**
 * Text option type.
 *
 * See @ot_display_by_type to see the full list of available arguments.
 *
 * @param     array     An array of arguments.
 * @return    string
 *
 * @access    public
 * @since     2.0
 */
if ( ! function_exists( 'ot_type_iconpicker_input' ) ) {
  
  function ot_type_iconpicker_input( $args = array() ) {
    
    /* turns arguments array into variables */ 
    extract( $args ); //print_r($args);
    
    /* verify a description */
    $has_desc = $field_desc ? true : false;
    
    /* format setting outer wrapper */
    echo '<div class="format-setting type-text ' . ( $has_desc ? 'has-desc' : 'no-desc' ) . '">';
      
      /* description */
      echo $has_desc ? '<div class="description">' . htmlspecialchars_decode( $field_desc ) . '</div>' : '';
      
      /* format setting inner wrapper */
      echo '<div class="format-setting-inner">';


     	$field_value = !empty($field_value)? $field_value : $field_std;
     	$name = 'option_tree['.$field_id.']';
        echo travellers_get_iconpicker_inputgroup( $field_name,  $field_value );
        
      echo '</div>';
    
    echo '</div>';
    
  }
  
}

function travellers_ot_iconpicker($field_id = ''){

  if( $field_id == '' ) return;

  $field_value = ot_get_option($field_id);
  $iconclass = '';
  if( $field_value != '' ) { $v= explode('|',$field_value); $iconclass = $v[0].' '.$v[1]; }
  return ( $iconclass != '' )? "<i class='{$iconclass}'></i>" : "";
}

function travellers_ot_get_icon($field_value = ''){

  if( $field_value == '' ) return;

  $iconclass = '';
  if( $field_value != '' ) { $v= explode('|',$field_value); $iconclass = $v[0].' '.$v[1]; }
  return ( $iconclass != '' )? "<i class='{$iconclass}'></i>" : "";
}
