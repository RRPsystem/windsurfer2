<?php
function travellers_styling_options( $options = array() ){
	$options = array(
		array(
        'id'          => 'preset_color',
        'label'       => __( 'Preset color', 'travellers' ),
        'desc'        => '',
        'std'         => '#74cc01',
        'type'        => 'colorpicker',
        'section'     => 'styling_options',        
      ),
        array(
        'id'          => 'link_color',
        'label'       => __( 'Link color', 'travellers' ),
        'desc'        => '',
        'std'         => '',
        'type'        => 'link-color',
        'section'     => 'styling_options',        
      ),
      array(
        'id'          => 'preset_color_css',
        'label'       => __( 'CSS', 'travellers' ),
        'class'      => 'hide-field',
        'desc'        => '',
        'std'         => '
a:link { color: {{site_anchor_colors|link}}; }
a:hover { color: {{site_anchor_colors|hover}}; }
a:active { color: {{site_anchor_colors|active}}; }
a:visited { color: {{site_anchor_colors|visited}}; }
a:focus { color: {{site_anchor_colors|focus}}; }
        ',
        'type'        => 'css',
        'section'     => 'styling_options',
      ),
    );

	return apply_filters( 'travellers_styling_options', $options );
}  
?>