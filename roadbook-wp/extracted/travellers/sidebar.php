</aside>
 <?php
    $layout = travellers_get_layout();
    if($layout != 'full'):   
?>
                   
<!-- Sidebar Starts --> 
<aside class="col-md-3 col-sm-4 blog-sidebar">
    <?php 
        $sidebar = travellers_get_sidebar_id();
        if ( is_active_sidebar( $sidebar ) ) : ?>               
                <?php dynamic_sidebar( $sidebar ); ?>               
            <?php 
        else: 
            $args = 'before_widget=<div class="widget-wrap categories">&after_widget=</div>&before_title=<h2 class="widget-title">&after_title=</h2>'; 
            the_widget( 'WP_Widget_Archives', '', $args ); 
            the_widget( 'WP_Widget_Pages', '', $args ); 
        endif; 
    ?>
</aside> 
<?php endif; ?>