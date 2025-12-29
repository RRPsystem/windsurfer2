/**
 * Define all the formatting buttons with the HTML code they set.
 */
				
				
var perchButtons=[	

		
		{
			id:'dropcap',
			image:'dropcap.png',
			title:'Dropcap',
			generateHtml:function(ed){
				var selected_text = ed.selection.getContent();
                var return_text = '';
                return '<span class="dropcap">' + selected_text + '</span>';
			}
		},
		{
			id:'colortext',
			image:'color-text.png',
			title:'Color Text',
			generateHtml:function(ed){
				var selected_text = ed.selection.getContent();
                var return_text = '';
                return '<span class="color-text">' + selected_text + '</span>';
			}
		},
		{
			id:'colorbg',
			image:'color-bg.png',
			title:'Color Background Text',
			generateHtml:function(ed){
				var selected_text = ed.selection.getContent();
                var return_text = '';
                return '<span class="color-bg">' + selected_text + '</span>';
			}
		},
		{
			id:'highlights',
			image:'highlight.png',
			title:'Highlight Text',
			generateHtml:function(ed){
				var selected_text = ed.selection.getContent();
                var return_text = '';
                return '<strong class="text-uppercase">' + selected_text + '</strong>';
			}
		},
		{
			id:'perchbreak',
			image:'cpanel-btn-break.png',
			title:'tt Insert Break <br>',
			allowSelection:true,
			generateHtml:function(ed){
				return '<br class="clear" />';
			}
		},
		
		
];

/**
 * Contains the main formatting buttons functionality.
 */
perchButtonManager={
	dialog:null,
	idprefix:'perch-shortcode-',
	ie:false,
	opera:false,
		
	/**
	 * Init the formatting button functionality.
	 */
	init:function(){
			
		var length=perchButtons.length;
		for(var i=0; i<length; i++){
		
			var btn = perchButtons[i];
			perchButtonManager.loadButton(btn);
			
		}

		if ( jQuery.browser.msie ) {
			perchButtonManager.ie=true;
		}
		
		if (jQuery.browser.opera){
			perchButtonManager.opera=true;
		}
		
	},
	
	/**
	 * Loads a button and sets the functionality that is executed when the button has been clicked.
	 */
	loadButton:function(btn){
		
		tinymce.create('tinymce.plugins.'+btn.id, {
	        init : function(ed, url) {
			        ed.addButton(btn.id, {
	                title : btn.title,
	                image : url+'/buttons/'+btn.image,
	                onclick : function() {
			        	
			           var selection = ed.selection.getContent();
	                   if(btn.allowSelection && selection && btn.fields){
							
	                	   //there are inputs to fill in, show a dialog to fill the required data
	                	   perchButtonManager.showDialog(btn, ed);
	                   }else if(btn.allowSelection && selection){
							
	                	   //modification via selection is allowed for this button and some text has been selected
							selection = btn.generateHtml(selection);
							ed.selection.setContent(selection);
	                   }else if(btn.fields){
	                	   //there are inputs to fill in, show a dialog to fill the required data
	                	   perchButtonManager.showDialog(btn, ed);
	                   }else if(btn.list){
	                	   ed.dom.remove('perchcaret');
		           		    ed.execCommand('mceInsertContent', false, '&nbsp;');	
	           			
	                	    //this is a list
	                	    var list, dom = ed.dom, sel = ed.selection;
	                	    
		               		// Check for existing list element
		               		list = dom.getParent(sel.getNode(), 'ul');
		               		
		               		// Switch/add list type if needed
		               		ed.execCommand('InsertUnorderedList');
		               		
		               		// Append styles to new list element
		               		list = dom.getParent(sel.getNode(), 'ul');
		               		
		               		if (list) {
		               			dom.addClass(list, btn.list);
		               		}
	                   }else{
	                	   //no data is required for this button, insert the generated HTML
	                	   ed.execCommand('mceInsertContent', true, btn.generateHtml());
	                   }
					   

				
						jQuery("#travellers-shortcode-style").change(function () {
						    if (jQuery(this).val() == 'Spacer 4' || jQuery(this).val() == 'Spacer 3' || jQuery(this).val() == 'Spacer 2' || jQuery(this).val() == 'Style-3') {
						        jQuery("#perch-shortcode-icon").removeAttr('disabled');
						    } else {
						        jQuery("#perch-shortcode-icon").attr('disabled', 'disabled').val('');
						    }
						});
			
	                }
	            });
	        }
	    });
		
	    tinymce.PluginManager.add(btn.id, tinymce.plugins[btn.id]);
	},
	
	
};

/**
 * Init the formatting functionality.
 */
(function() {
	/**
	 * Add the shortcodes downdown.
	 */
	tinymce.PluginManager.add( 'bpbutton', function ( editor ) {
		var ed = tinymce.activeEditor;
		editor.addButton( 'bpbutton', {
			text: 'Button',
			icon: 'link',
			onclick: function () {
				editor.windowManager.open({
					title: 'BohoPeople Button',
					body: [
						{
							type:  'textbox',
							name:  'title',
							label: 'Title',
							value: 'Link Title'
						},
						{
							type:  'textbox',
							name:  'url',
							label: 'URL',
							value: '#'
						},
						{
							type:  'listbox',
							name:  'size',
							label: 'Size',
							values: [
								{
									text: 'Medium',
									value: ''
								},
								{
									text: 'Small',
									value: 'btn-sm'
								},
								{
									text: 'Large',
									value: 'btn-lg'
								},
								
							]
						},
						{
							type:  'listbox',
							name:  'color',
							label: 'Color',
							values: [
								{
									text: 'Default',
									value: 'btn-default'
								},
								{
									text: 'Dark',
									value: 'btn-dark'
								},
								{
									text: 'Color',
									value: 'btn-primary'
								},
								
							]
						}
					],
					onsubmit: function ( e ) {	
						var cls = (e.data.size != '')? ' '+e.data.size : '';
						cls += (e.data.color != '')? ' '+e.data.color : '';
						editor.insertContent( '<a href="'+e.data.url+'" title="'+e.data.title+'" class="btn smmoth '+cls+'">'+e.data.title+'</a>' );						
					}
				});
			}
		});
	});
	perchButtonManager.init();
    
})();
