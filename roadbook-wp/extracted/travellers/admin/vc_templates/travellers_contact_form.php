<?php
extract(shortcode_atts(array(
    'title' => '{Have} Questions?',
    'desc' => 'We’re here to help solve all your problems',
    'align' => 'center',
    'contact_form' => ''
), $atts));

?>
<div class="gradient dark">   
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="text-<?php echo esc_attr($align); ?>">
                    <?php echo travellers_parse_text($title, array('tag' => 'span')); ?>
                    <small><?php echo esc_attr($desc); ?></small>
                </h1> 

                <?php 
                if( $contact_form != '' ){
                    echo do_shortcode('[contact-form-7 id="'.intval($contact_form).'"]');
                }
                ?>

            </div>
        </div>    
    </div>
</div>