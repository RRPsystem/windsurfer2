<?php
extract(shortcode_atts(array(
	'style' => 'style1',
    'departure_on_title' => 'DEPARTURE ON',
    'departure_on' => '01 JAN {2015}',
    'event_datetime' => 'jan,01,2015,00:00:00',
), $atts));



?>

<?php if( $style == 'style1' ): ?>

<div class="counter">
    <div class="date BGdark"><?php echo esc_attr($departure_on_title); ?><h4><?php echo travellers_parse_text($departure_on, array('tag'=> 'strong')); ?></h4></div>
    <div class="timerwrap">
        <div><span id="months">00</span> <?php _e( 'months', 'travellers' ); ?></div> 
        <div><span id="days">00</span> <?php _e( 'days', 'travellers' ); ?></div> 
        <div><span id="hours">00</span> <?php _e( 'hours', 'travellers' ); ?></div> 
        <div><span id="minutes">00</span><?php _e( 'mins', 'travellers' ); ?></div> 
        <div><span id="seconds">00</span> <?php _e( 'sec', 'travellers' ); ?></div>
    </div>
    <div class="clear"></div>
</div>

<?php else: ?>

<!-- ::: START COUNTER ::: -->       

<div class="info-box option">
	<div class="container">
    <div class="counter">
        <div class="date BGdark"><?php echo esc_attr($departure_on_title); ?><h4><?php echo travellers_parse_text($departure_on, array('tag'=> 'strong')); ?></h4></div>
        <div class="timerwrap">
            <div><span id="months">00</span> <?php _e( 'months', 'travellers' ); ?></div> 
            <div><span id="days">00</span> <?php _e( 'days', 'travellers' ); ?></div> 
            <div><span id="hours">00</span> <?php _e( 'hours', 'travellers' ); ?></div> 
            <div><span id="minutes">00</span><?php _e( 'mins', 'travellers' ); ?></div> 
            <div><span id="seconds">00</span> <?php _e( 'sec', 'travellers' ); ?></div>
        </div>
        <div class="clear"></div>
    </div>
    </div>
</div>

<!-- ::: END COUNTER ::: -->

<?php endif; ?>

<script type="text/javascript">
    window.onload=function() {
  // Month,Day,Year,Hour,Minute,Second
  upTime('<?php echo esc_attr($event_datetime) ?>'); 
};
function upTime(countTo) {
  now = new Date();
  countTo = new Date(countTo);
  difference = (now-countTo);
  days=Math.floor(difference/(60*60*1000*24)*1);
  months = Math.floor(days / 30);
  if (months > 1){ days = days - (months * 30)}
  hours=Math.floor((difference%(60*60*1000*24))/(60*60*1000)*1);
  mins=Math.floor(((difference%(60*60*1000*24))%(60*60*1000))/(60*1000)*1);
  secs=Math.floor((((difference%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1);
  document.getElementById('months').firstChild.nodeValue = months;
  document.getElementById('days').firstChild.nodeValue = days;
  document.getElementById('hours').firstChild.nodeValue = hours;
  document.getElementById('minutes').firstChild.nodeValue = mins;
  document.getElementById('seconds').firstChild.nodeValue = secs;

  clearTimeout(upTime.to);
  upTime.to=setTimeout(function(){ upTime(countTo); },1000);
}
</script>

