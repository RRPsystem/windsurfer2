<?php
/*Include functions */

global $perch_editor_buttons;
$perch_editor_buttons = array("bpbutton", "perchbreak");

add_action('init', 'travellers_add_editor_buttons');
function travellers_add_editor_buttons()
{
	// add_filter('mce_external_plugins', 'travellers_add_editor_btn_tinymce_plugin');
	add_filter('mce_buttons_2', 'travellers_register_editor_buttons');
}

function travellers_register_editor_buttons($buttons)
{
	global $perch_editor_buttons;

	array_push($buttons, implode(",", $perch_editor_buttons));
	return $buttons;
}

function travellers_add_editor_btn_tinymce_plugin($plugin_array)
{
	global $perch_editor_buttons;

	foreach ($perch_editor_buttons as $btn) {
		$plugin_array[$btn] = TRAVELLERS_URI . '/admin/editor-buttons/editor-plugin.js';
	}
	return $plugin_array;
}
