<?php
// Register Style
function travellers_admin_styles() {
	wp_register_style( 'travellers-font-awesome', TRAVELLERS_URI . '/assets/plugins/font-awesome/css/font-awesome.min.css', false, false );
	wp_register_style( 'travellers-travellers-icon-picker', TRAVELLERS_URI. '/admin/icon-picker/css/icon-picker.css', false, '1.0.0', 'all' );
	wp_register_style( 'travellers-admin-style', TRAVELLERS_URI. '/admin/assets/css/style.css', array( 'travellers-travellers-icon-picker', 'travellers-font-awesome' ), TRAVELLERS_VERSION, 'all' );
	wp_enqueue_style( 'travellers-admin-style' );
	

}

// Hook into the 'admin_enqueue_scripts' action
add_action( 'admin_enqueue_scripts', 'travellers_admin_styles' );

function travellers_ot_admin_styles_after(){
	wp_dequeue_style( 'tc-admin-jquery-ui');
}
add_action('ot_admin_styles_after', 'travellers_ot_admin_styles_after');


// Register Script
function travellers_admin_scripts() {	


	wp_enqueue_script( 'travellers-scripts', TRAVELLERS_URI. '/admin/assets/js/scripts.js', array( 'jquery' ), TRAVELLERS_VERSION, true );


	$arr = array( 
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'TRAVELLERS_URI' => TRAVELLERS_URI,
		'TRAVELLERS_DIR' => TRAVELLERS_DIR,
		'CountdownText' => apply_filters( 'travellers_CountdownText', array('years', 'days', 'hrs', 'min', 'sec'))
		);
	wp_localize_script( 'travellers-scripts', 'travellers', $arr );
}

// Hook into the 'admin_enqueue_scripts' action
add_action( 'admin_enqueue_scripts', 'travellers_admin_scripts' );
?>