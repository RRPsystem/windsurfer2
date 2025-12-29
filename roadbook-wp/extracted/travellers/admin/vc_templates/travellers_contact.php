<?php
extract(shortcode_atts(array(
    'title' => 'We are here to help you!',
    'desc' => 'Proin gravida nibh vel velit auctor aliquet. Aenean sollicitudin, lorem quis bibendum auctor.',
    'button_text' => 'Contact now',
    'contact_title' => 'Dont Be Hesitate to Say Hello!',
    'contact_desc' => 'Morbi accumsan ipsum velit. Nam nec tellus a odio tincidunt auctor a ornare odio.',
    'shortcode' => '',
), $atts));
$id = uniqid();
?>
<div class="title-wrap">
    <h2 class="title-1 space-bottom-15"><?php echo travellers_parse_text($title); ?></h2>
    <p><?php echo esc_attr($desc); ?></p>                            
    <div class="space-15">
        <a class="theme-btn btn" data-toggle="modal" href="#contact-popup-<?php echo esc_attr($id) ?>"><?php echo esc_attr($button_text); ?></a>
    </div>
</div> 

<?php 
$args = array(
    'id' => $id,
    'contact_title' => $contact_title,
    'contact_desc' => $contact_desc,
    'shortcode' => $shortcode,
    );
travellers_contact_modal($args); 
?>   