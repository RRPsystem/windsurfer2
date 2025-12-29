<?php
extract(shortcode_atts(array(
    'location' => '123 Main Street
Your City, State Country.',
    'phones' => '(123) 456-7890
(123) 456-7890',
    'email' => 'contact@companyname.com',
    'content' => ''
), $args));
?>

<div class="additional-info contact-info">

    <div class="row row-cols-1 row-cols-lg-3 g-3">
        <?php if (!empty($location)) : ?>
            <div class="col">
                <div class="d-flex align-items-center gx-3">
                    <i class="fa fa-map-marker icon-rounded"></i>
                    <div><?php echo wp_kses_post($location); ?></div>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($phones)) : ?>
            <div class="col">
                <div class="d-flex align-items-center gx-2">
                    <i class="fa fa-phone icon-rounded"></i>
                    <div><?php echo wp_kses_post($phones); ?></div>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($email)) : ?>
            <div class="col">
                <div class="d-flex align-items-center gx-2">
                    <i class="fa fa-envelope icon-rounded"></i>
                    <div><a href="<?php echo esc_attr($email) ?>" title="<?php _e('contact', 'travellers') ?>"><?php echo force_balance_tags($email); ?></a></div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>