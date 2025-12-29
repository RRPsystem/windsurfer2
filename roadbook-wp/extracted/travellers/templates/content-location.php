<?php
$subtitle = get_post_meta( get_the_ID(), 'subtitle', true );
$features = get_post_meta( get_the_ID(), 'features', true );
?>
<h2><?php the_title(); ?></h2>
<?php echo ( $subtitle != '' )? '<span>'.esc_attr($subtitle).'</span>' : ''; ?>

<?php the_content(); ?>
<?php if( !empty($features) ): ?>
    <ul class="special">
        <?php foreach ($features as $key => $value) {

            echo ($value['title'] != '')? '<li><i class="fa '.esc_attr($value['icon']).'"></i><h6>'.esc_attr($value['title']).'</h6>'.esc_attr($value['desc']).'</li>' : '';
        }
        ?>
    </ul>
<?php endif; ?>
<div class="clear"></div>