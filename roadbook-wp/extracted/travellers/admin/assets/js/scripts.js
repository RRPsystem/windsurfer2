jQuery(document).ready(function ($) {

	"use strict";

	if ($('#page_template').length > 0) {
		$(document).on('change', '#page_template', function () {

			if ($(this).val() == 'templates/one-page.php') {
				$('#travellers_onepage_meta_box').show();
				$('#travellers_page_meta_box').hide();
			} else {
				$('#travellers_onepage_meta_box').hide();
				$('#travellers_page_meta_box').show();
			}
			if ($(this).val() == 'templates/comming-soon.php') {
				$('#travellers_onepage_meta_box').hide();
				$('#travellers_page_meta_box').hide();
			}


			return false;
		})

		$('#page_template').trigger('change');
	}

	// Init media buttons

	$(document).on('click', '.travellers-upload-button', function (e) {
		var $button = $(this),
			$val = $(this).parents('.travellers-upload-container').find('input:text'),
			file;
		e.preventDefault();
		e.stopPropagation();
		// If the frame already exists, reopen it
		if (typeof (file) !== 'undefined') file.close();
		// Create WP media frame.
		file = wp.media.frames.perch_media_frame_2 = wp.media({
			// Title of media manager frame
			title: 'Upload image',
			button: {
				//Button text
				text: 'Insert URL'
			},
			// Do not allow multiple files, if you want multiple, set true
			multiple: false
		});
		//callback for selected image
		file.on('select', function () {
			var attachment = file.state().get('selection').first().toJSON();
			$val.val(attachment.url).trigger('change');
			$val.closest('.travellers-upload-container').find('img').attr('src', attachment.url);
		});
		// Open modal
		file.open();
	});



});


