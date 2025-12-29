<?php
extract(shortcode_atts(array(
    'title' => 'Mariana Trench',
    'subtitle' => 'Deepest Place in the Ocean',
    'begins' => 'Adventure Begins {25 Jan 2022}',
    'duration' => 'Duration {5 Days}',
    'wheather' => 'Wheather {Summer - 95&#8457; to 100.4&#8457;}',
    'content' => ''
), $args));
$parse_text_args = array(
    'tag' => 'strong',
    'tagclass' => '',
    'before' => '<br>',
    'after' => '',
);
?>

<div class="row g-3">
  <div class="col-md-6 col-sm-12 col-xs-12">
      <h1 class="m-0"><?php echo esc_attr($title); ?><small><?php echo esc_attr($subtitle); ?></small></h1>
  </div>

  <div class="col-md-6 col-sm-12 col-xs-12">
      <?php echo force_balance_tags(do_shortcode($content)) ?>
  </div>
</div>  



<!-- ::: Additional info Start ::: -->
<div class="additional-info">
    <div class="row">
        <?php if(!empty($begins)): ?>
        <div class="col-md-4 col-sm-12 col-xs-12">
            <span><i class="fa fa-calendar"></i> 
                <?php echo travellers_parse_text($begins, $parse_text_args); ?>
            </span> 
        </div>
        <?php endif; ?>


        <?php if(!empty($duration)): ?>
        <div class="col-md-3 col-sm-12 col-xs-12">
            <span><i class="fa fa-bullhorn"></i>
            <?php echo travellers_parse_text($duration, $parse_text_args); ?>
            </span>
        </div> 
        <?php endif; ?>


        <?php if(!empty($wheather)): ?>
        <div class="col-md-5 col-sm-12 col-xs-12">
            <span><i class="fa fa-cloud"></i> 
            <?php echo travellers_parse_text($wheather, $parse_text_args); ?>
            </span>
        </div>
        <?php endif; ?>
    </div>
</div><!-- ::: Additional info end ::: -->
