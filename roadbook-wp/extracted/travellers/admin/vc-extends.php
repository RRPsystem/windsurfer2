<?php
if(function_exists('vc_set_as_theme')):
vc_set_as_theme( $disable_updater = false );
endif; 

$dir = TRAVELLERS_DIR.'/admin/vc_templates';
if(function_exists('vc_set_shortcodes_templates_dir')){
  vc_set_shortcodes_templates_dir( $dir );
}


if(!function_exists('travellers_parse_text')):
function travellers_parse_text( $text, $args = array() ) {

  extract(shortcode_atts(array(
      'tag' => 'span',
      'tagclass' => '',
      'before' => '',
      'after' => '',
  ), $args));

  preg_match_all( "/\{([^\}]*)\}/", $text, $matches );
  if ( !empty( $matches ) ) {
    foreach ( $matches[1] as $value ) {
      $find    = "{{$value}}";

      $replace = "{$before}<{$tag} class='{$tagclass}'>{$value}</{$tag}>{$after}";
    
      
      $text    = str_replace( $find, $replace, $text );
    } //$matches[1] as $value
  } //!empty( $matches )
  
  $text = str_replace( " / ", "<span class='separator'>/</span>", $text );
  $text = str_replace( "&#8457;", "<sup>&#8457;</sup>", $text );
  
  
  return force_balance_tags($text);
}
endif;

function travellers_highlightLastWord($theTitle){
  $titleWords = explode(' ', $theTitle);
  $wordCount = count($titleWords)-1;
  if ($wordCount > 0)
  {
    $i = 0;
    $title = '';
    // wrap the last word in span (change this to whatever you want it wrapped in)
    foreach ($titleWords as $word):
      if ($i == $wordCount) :
        $title .= '<br /><span>'.$titleWords[$i].'</span>';
      else :
        $title .= esc_attr($titleWords[$i]) . ' ';
      endif;
      $i++;
    endforeach;
  }
  else 
  {
    $title .= '<span>'.esc_attr($titleWords[0]).'</span>';
  }
  return $title;
}

add_filter( 'vc_iconpicker-type-pixden', 'travellers_iconpicker_type_pixden' );

function travellers_iconpicker_type_pixden( $icons ){
  $pixden = array( array('pe-7s-album' => 'album' ), array('pe-7s-arc' => 'arc' ), array('pe-7s-back-2' => 'back-2' ), array('pe-7s-bandaid' => 'bandaid' ), array('pe-7s-car' => 'car' ), array('pe-7s-diamond' => 'diamond' ), array('pe-7s-door-lock' => 'door-lock' ), array('pe-7s-eyedropper' => 'eyedropper' ), array('pe-7s-female' => 'female' ), array('pe-7s-gym' => 'gym' ), array('pe-7s-hammer' => 'hammer' ), array('pe-7s-headphones' => 'headphones' ), array('pe-7s-helm' => 'helm' ), array('pe-7s-hourglass' => 'hourglass' ), array('pe-7s-leaf' => 'leaf' ), array('pe-7s-magic-wand' => 'magic-wand' ), array('pe-7s-male' => 'male' ), array('pe-7s-map-2' => 'map-2' ), array('pe-7s-next-2' => 'next-2' ), array('pe-7s-paint-bucket' => 'paint-bucket' ), array('pe-7s-pendrive' => 'pendrive' ), array('pe-7s-photo' => 'photo' ), array('pe-7s-piggy' => 'piggy' ), array('pe-7s-plugin' => 'plugin' ), array('pe-7s-refresh-2' => 'refresh-2' ), array('pe-7s-rocket' => 'rocket' ), array('pe-7s-settings' => 'settings' ), array('pe-7s-shield' => 'shield' ), array('pe-7s-smile' => 'smile' ), array('pe-7s-usb' => 'usb' ), array('pe-7s-vector' => 'vector' ), array('pe-7s-wine' => 'wine' ), array('pe-7s-cloud-upload' => 'cloud-upload' ), array('pe-7s-cash' => 'cash' ), array('pe-7s-close' => 'close' ), array('pe-7s-bluetooth' => 'bluetooth' ), array('pe-7s-cloud-download' => 'cloud-download' ), array('pe-7s-way' => 'way' ), array('pe-7s-close-circle' => 'close-circle' ), array('pe-7s-id' => 'id' ), array('pe-7s-angle-up' => 'angle-up' ), array('pe-7s-wristwatch' => 'wristwatch' ), array('pe-7s-angle-up-circle' => 'angle-up-circle' ), array('pe-7s-world' => 'world' ), array('pe-7s-angle-right' => 'angle-right' ), array('pe-7s-volume' => 'volume' ), array('pe-7s-angle-right-circle' => 'angle-right-circle' ), array('pe-7s-users' => 'users' ), array('pe-7s-angle-left' => 'angle-left' ), array('pe-7s-user-female' => 'user-female' ), array('pe-7s-angle-left-circle' => 'angle-left-circle' ), array('pe-7s-up-arrow' => 'up-arrow' ), array('pe-7s-angle-down' => 'angle-down' ), array('pe-7s-switch' => 'switch' ), array('pe-7s-angle-down-circle' => 'angle-down-circle' ), array('pe-7s-scissors' => 'scissors' ), array('pe-7s-wallet' => 'wallet' ), array('pe-7s-safe' => 'safe' ), array('pe-7s-volume2' => 'volume2' ), array('pe-7s-volume1' => 'volume1' ), array('pe-7s-voicemail' => 'voicemail' ), array('pe-7s-video' => 'video' ), array('pe-7s-user' => 'user' ), array('pe-7s-upload' => 'upload' ), array('pe-7s-unlock' => 'unlock' ), array('pe-7s-umbrella' => 'umbrella' ), array('pe-7s-trash' => 'trash' ), array('pe-7s-tools' => 'tools' ), array('pe-7s-timer' => 'timer' ), array('pe-7s-ticket' => 'ticket' ), array('pe-7s-target' => 'target' ), array('pe-7s-sun' => 'sun' ), array('pe-7s-study' => 'study' ), array('pe-7s-stopwatch' => 'stopwatch' ), array('pe-7s-star' => 'star' ), array('pe-7s-speaker' => 'speaker' ), array('pe-7s-signal' => 'signal' ), array('pe-7s-shuffle' => 'shuffle' ), array('pe-7s-shopbag' => 'shopbag' ), array('pe-7s-share' => 'share' ), array('pe-7s-server' => 'server' ), array('pe-7s-search' => 'search' ), array('pe-7s-film' => 'film' ), array('pe-7s-science' => 'science' ), array('pe-7s-disk' => 'disk' ), array('pe-7s-ribbon' => 'ribbon' ), array('pe-7s-repeat' => 'repeat' ), array('pe-7s-refresh' => 'refresh' ), array('pe-7s-add-user' => 'add-user' ), array('pe-7s-refresh-cloud' => 'refresh-cloud' ), array('pe-7s-paperclip' => 'paperclip' ), array('pe-7s-radio' => 'radio' ), array('pe-7s-note2' => 'note2' ), array('pe-7s-print' => 'print' ), array('pe-7s-network' => 'network' ), array('pe-7s-prev' => 'prev' ), array('pe-7s-mute' => 'mute' ), array('pe-7s-power' => 'power' ), array('pe-7s-medal' => 'medal' ), array('pe-7s-portfolio' => 'portfolio' ), array('pe-7s-like2' => 'like2' ), array('pe-7s-plus' => 'plus' ), array('pe-7s-left-arrow' => 'left-arrow' ), array('pe-7s-play' => 'play' ), array('pe-7s-key' => 'key' ), array('pe-7s-plane' => 'plane' ), array('pe-7s-joy' => 'joy' ), array('pe-7s-photo-gallery' => 'photo-gallery' ), array('pe-7s-pin' => 'pin' ), array('pe-7s-phone' => 'phone' ), array('pe-7s-plug' => 'plug' ), array('pe-7s-pen' => 'pen' ), array('pe-7s-right-arrow' => 'right-arrow' ), array('pe-7s-paper-plane' => 'paper-plane' ), array('pe-7s-delete-user' => 'delete-user' ), array('pe-7s-paint' => 'paint' ), array('pe-7s-bottom-arrow' => 'bottom-arrow' ), array('pe-7s-notebook' => 'notebook' ), array('pe-7s-note' => 'note' ), array('pe-7s-next' => 'next' ), array('pe-7s-news-paper' => 'news-paper' ), array('pe-7s-musiclist' => 'musiclist' ), array('pe-7s-music' => 'music' ), array('pe-7s-mouse' => 'mouse' ), array('pe-7s-more' => 'more' ), array('pe-7s-moon' => 'moon' ), array('pe-7s-monitor' => 'monitor' ), array('pe-7s-micro' => 'micro' ), array('pe-7s-menu' => 'menu' ), array('pe-7s-map' => 'map' ), array('pe-7s-map-marker' => 'map-marker' ), array('pe-7s-mail' => 'mail' ), array('pe-7s-mail-open' => 'mail-open' ), array('pe-7s-mail-open-file' => 'mail-open-file' ), array('pe-7s-magnet' => 'magnet' ), array('pe-7s-loop' => 'loop' ), array('pe-7s-look' => 'look' ), array('pe-7s-lock' => 'lock' ), array('pe-7s-lintern' => 'lintern' ), array('pe-7s-link' => 'link' ), array('pe-7s-like' => 'like' ), array('pe-7s-light' => 'light' ), array('pe-7s-less' => 'less' ), array('pe-7s-keypad' => 'keypad' ), array('pe-7s-junk' => 'junk' ), array('pe-7s-info' => 'info' ), array('pe-7s-home' => 'home' ), array('pe-7s-help2' => 'help2' ), array('pe-7s-help1' => 'help1' ), array('pe-7s-graph3' => 'graph3' ), array('pe-7s-graph2' => 'graph2' ), array('pe-7s-graph1' => 'graph1' ), array('pe-7s-graph' => 'graph' ), array('pe-7s-global' => 'global' ), array('pe-7s-gleam' => 'gleam' ), array('pe-7s-glasses' => 'glasses' ), array('pe-7s-gift' => 'gift' ), array('pe-7s-folder' => 'folder' ), array('pe-7s-flag' => 'flag' ), array('pe-7s-filter' => 'filter' ), array('pe-7s-file' => 'file' ), array('pe-7s-expand1' => 'expand1' ), array('pe-7s-exapnd2' => 'exapnd2' ), array('pe-7s-edit' => 'edit' ), array('pe-7s-drop' => 'drop' ), array('pe-7s-drawer' => 'drawer' ), array('pe-7s-download' => 'download' ), array('pe-7s-display2' => 'display2' ), array('pe-7s-display1' => 'display1' ), array('pe-7s-diskette' => 'diskette' ), array('pe-7s-date' => 'date' ), array('pe-7s-cup' => 'cup' ), array('pe-7s-culture' => 'culture' ), array('pe-7s-crop' => 'crop' ), array('pe-7s-credit' => 'credit' ), array('pe-7s-copy-file' => 'copy-file' ), array('pe-7s-config' => 'config' ), array('pe-7s-compass' => 'compass' ), array('pe-7s-comment' => 'comment' ), array('pe-7s-coffee' => 'coffee' ), array('pe-7s-cloud' => 'cloud' ), array('pe-7s-clock' => 'clock' ), array('pe-7s-check' => 'check' ), array('pe-7s-chat' => 'chat' ), array('pe-7s-cart' => 'cart' ), array('pe-7s-camera' => 'camera' ), array('pe-7s-call' => 'call' ), array('pe-7s-calculator' => 'calculator' ), array('pe-7s-browser' => 'browser' ), array('pe-7s-box2' => 'box2' ), array('pe-7s-box1' => 'box1' ), array('pe-7s-bookmarks' => 'bookmarks' ), array('pe-7s-bicycle' => 'bicycle' ), array('pe-7s-bell' => 'bell' ), array('pe-7s-battery' => 'battery' ), array('pe-7s-ball' => 'ball' ), array('pe-7s-back' => 'back' ), array('pe-7s-attention' => 'attention' ), array('pe-7s-anchor' => 'anchor' ), array('pe-7s-albums' => 'albums' ), array('pe-7s-alarm' => 'alarm' ), array('pe-7s-airplay' => 'airplay' ),  );

  return array_merge( $icons, $pixden );
}

add_filter( 'vc_iconpicker-type-perch', 'travellers_iconpicker_type_perch' );

function travellers_iconpicker_type_perch( $icons ){
  $pixden = array( 
    array('perch perch-Inbox' => 'Inbox' ), 
    array('perch perch-Folder' => 'Folder' ),   
    array('perch perch-integrity' => 'integrity' ),   
    array('perch perch-Keyboard' => 'Keyboard' ),   
    array('perch perch-Message' => 'Message' ),   
    array('perch perch-middle-market' => 'Middle market' ),   
    array('perch perch-operator-first' => 'Operator-first' ),   
    array('perch perch-Phone2' => 'Phone2' ),   
    array('perch perch-Plaine' => 'Plaine' ),   
    array('perch perch-Printer' => 'Printer' ),   
    array('perch perch-Search' => 'Search' ),   
    array('perch perch-strategy' => 'strategy' ),   
    array('perch perch-User' => 'User' ),   
    array('perch perch-value' => 'value' ),   
  );

  return array_merge( $icons, $pixden );
}

function travellers_vc_icontype_dropdown( $name = 'icon_type', $value = array(
                'Pixden'  => 'pixden',
                'Linecons' => 'linecons',
                'Entypo' => 'entypo',
                'Typicons' => 'typicons',
                'Openiconic' => 'openiconic',
                'Fontawesome' => 'fontawesome',                
              ) ){
  return array(
          'type' => 'dropdown',
          'heading' => __('Icon type', 'travellers'),
          'param_name' => $name,
          'description' => '',
          'value' => $value
        );
}

function travellers_vc_icon_set( $type, $name = 'icon_pixden', $value= 'pe-7s-diamond', $dependency = '' ){
 
  $arr = array(
          'type' => 'iconpicker',
          'heading' => __( 'Icon', 'travellers' ),
          'param_name' => $name,
          'value' => $value,
          'settings' => array(
              'emptyIcon' => false,
              'type' => $type,
              'iconsPerPage' => 4000,
          ),
          'description' => __( 'Select icon from library.', 'travellers' ),

      );

  if( $dependency != '' ){
    $arr['dependency']['element'] = $dependency;
    $arr['dependency']['value'] =  $type;
  }

  return $arr;
}

if( !function_exists('travellers_get_posts_dropdown') ):
function travellers_get_posts_dropdown( $args = array(), $option_key = 'ID' ) {
    global $wpdb, $post;

    $dropdown = array();
    $the_query = new WP_Query( $args );
    if ( $the_query->have_posts() ) {
        while ( $the_query->have_posts() ) {
            $the_query->the_post(); 
            switch ($option_key) {
              case 'title':
                $dropdown[get_the_title()] = get_the_title();
                break;
              
              default:
                $dropdown[get_the_ID()] = get_the_title();
                break;
            }
            
        }
    }
    wp_reset_postdata();

    return $dropdown;
}
endif;

if( !function_exists('travellers_get_terms') ):
function travellers_get_terms( $tax = 'category', $key = 'id' ) {
    $terms = array();

    if(!taxonomy_exists($tax)) return false;

    if ( $key === 'id' ) foreach ( (array) get_terms( $tax, array( 'hide_empty' => false ) ) as $term ) $terms[$term->term_id] = $term->name;
      elseif ( $key === 'slug' ) foreach ( (array) get_terms( $tax, array( 'hide_empty' => false ) ) as $term ) $terms[$term->slug] = $term->name;
        return $terms;
}
endif;

if(!function_exists('travellers_number_settings_field')):
function travellers_number_settings_field( $settings, $value ) {
   return '<div class="my_param_block">'
             .'<input name="' . esc_attr( $settings['param_name'] ) . '" class="wpb_vc_param_value wpb-textinput ' .
             esc_attr( $settings['param_name'] ) . ' ' .
             esc_attr( $settings['type'] ) . '_field" type="number" min="'.intval($settings['min']).'" max="'.intval($settings['max']).'" step="'.intval($settings['step']).'" value="' . esc_attr( $value ) . '" />' .
             '</div>'; // This is html markup that will be outputted in content elements edit form
}
endif;

if(!function_exists('travellers_vc_image_upload_settings_field')):
function travellers_vc_image_upload_settings_field($settings, $value){
  return '<div class="travellers-upload-container">
      <input type="text" name="' . esc_attr( $settings['param_name'] ) . '" value="'.esc_url($value).'" class="wpb_vc_param_value wpb-textinput perch-generator-attr perch-generator-upload-value" />
      <a href="javascript:;" class="button travellers-upload-button"><span class="wp-media-buttons-icon"></span>'.esc_attr(__( 'Media manager', 'travellers' )).'</a>
      <img width="80" src="'.esc_url($value).'" alt="Image URL">     
    </div>';
}
endif;

if(!function_exists('travellers_perch_select_settings_field')):
function travellers_perch_select_settings_field( $args, $value ) {
    $selected = is_array($value)? $value : explode(',', $value);
    $args = wp_parse_args( $args, array(
        'param_name'       => '',
        'heading'     => '',
        'class'    => 'wpb_vc_param_value wpb-input wpb-select dropdown',
        'multiple' => '',
        'size'     => '',
        'disabled' => '',
        'selected' => $selected,
        'none'     => '',
        'value'  => array(),
        'style' => '',
        'format'   => 'keyval', // keyval/idtext
        'noselect' => '' // return options without <select> tag
      ) );
    $options = array();
    if ( !is_array( $args['value'] ) ) $args['value'] = array();
     if ( $args['param_name'] ) $name = ' name="' . $args['param_name'] . '"';
    if ( $args['param_name'] ) $args['param_name'] = ' id="' . $args['param_name'] . '"';   
    if ( $args['class'] ) $args['class'] = ' class="' . $args['class'] . '"';
    if ( $args['style'] ) $args['style'] = ' style="' . esc_attr( $args['style'] ) . '"';
    if ( $args['multiple'] ) $args['multiple'] = ' multiple="multiple"';
    if ( $args['disabled'] ) $args['disabled'] = ' disabled="disabled"';
    if ( $args['size'] ) $args['size'] = ' size="' . $args['size'] . '"';
    if ( $args['none'] && $args['format'] === 'keyval' ) $args['options'][0] = $args['none'];
    if ( $args['none'] && $args['format'] === 'idtext' ) array_unshift( $args['options'], array( 'id' => '0', 'text' => $args['none'] ) );
    
    // keyval loop
    // $args['options'] = array(
    //   id => text,
    //   id => text
    // );
    if ( $args['format'] === 'keyval' ) foreach ( $args['value'] as $id => $text ) {
        $options[] = '<option value="' . (string) $id . '">' . (string) $text . '</option>';
      }
    // idtext loop
    // $args['options'] = array(
    //   array( id => id, text => text ),
    //   array( id => id, text => text )
    // );
    elseif ( $args['format'] === 'idtext' ) foreach ( $args['options'] as $option ) {
        if ( isset( $option['id'] ) && isset( $option['text'] ) )
          $options[] = '<option value="' . (string) $option['id'] . '">' . (string) $option['text'] . '</option>';
      }
    $options = implode( '', $options );

    if(is_array($args['selected'])){
        foreach ($args['selected'] as $key => $value) {
          $options = str_replace( 'value="' . $value . '"', 'value="' . $value . '" selected="selected"', $options );
        }
    }else{
      $options = str_replace( 'value="' . $args['selected'] . '"', 'value="' . $args['selected'] . '" selected="selected"', $options );
    }
    
    $output = ( $args['noselect'] ) ? $options : '<select' .$name. $args['param_name'] . $args['class'] . $args['multiple'] . $args['size'] . $args['disabled'] . $args['style'] . '>' . $options . '</select>';
   // $output .= '<input type="hidden" '.$name.' value="'.$value.'">';
    return '<div class="perch_select_param_block">'.$output.'</div>';
}
endif;


if(function_exists('vc_set_as_theme')):
vc_set_as_theme( $disable_updater = false );
$list = array(
    'page',
    'post',
);
vc_set_default_editor_post_types( $list ); 

/* global vc include files */
foreach (glob(TRAVELLERS_DIR."/admin/vc-extends/*.php") as $filename){   
    include $filename;
}
endif;


