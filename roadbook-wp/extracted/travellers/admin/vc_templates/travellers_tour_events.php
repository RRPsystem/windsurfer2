<?php

extract(shortcode_atts(array(

    'display' => 'all',
    'tours' => '',
    'column' => 4,

), $atts));



$tours_arr = (function_exists('vc_param_group_parse_atts'))? vc_param_group_parse_atts($tours) : array();

$arr = array();

if(!empty($tours_arr)){

	foreach ($tours_arr as $key => $value) {

		$arr[] = $value['tour'];

	}

}



$args['posts_per_page'] = ($display == 'all')? get_option('posts_per_page', -1): '';

$args['post__in'] = ($display == 'specific')? $arr: false;

$args['post_type'] = 'tour';





// The Query

$the_query = new WP_Query( $args );



// The Loop

if ( $the_query->have_posts() ) :

	echo '<div id="upcoming"  class="owl-carousel">';

	while ( $the_query->have_posts() ) :

		$the_query->the_post();

		$date = get_post_meta( get_the_ID(), 'date', true );

        $date = date_create($date);

        $duration = get_post_meta( get_the_ID(), 'duration', true );

		?>

		<div class="item">

            <div class="name">

                <h1><?php echo travellers_highlightLastWord(get_the_title()); ?></h1>

                <a class="link" href="<?php the_permalink() ?>" title="<?php the_title() ?>"><i class="fa fa-link"></i></a>

                <h4><?php echo date_format($date,"d M"); ?><span><?php echo esc_attr($duration); ?></span></h4>   

            </div>

            <img src="<?php the_post_thumbnail_url('travellers-instructor-size'); ?>" alt="">

        </div>

        <?php

	endwhile;

	echo '</div>';

	/* Restore original Post Data */

	wp_reset_postdata();

else :

	// no posts found

endif;

?>