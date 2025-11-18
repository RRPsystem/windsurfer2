<?php
/**
 *
 * @author     Gaviasthemes Team     
 * @copyright  Copyright (C) 2023 Gaviasthemes. All Rights Reserved.
 * @license    GNU/GPL v2 or later http://www.gnu.org/licenses/gpl-2.0.html
 * 
 */ 
$header_id = apply_filters('gowilds_get_header_layout', null );

if($header_id && class_exists('GVA_Layout_Frontend') && class_exists('Elementor\Plugin')){
   if($header_id){
      get_template_part('header', 'builder');
   }else{
      get_template_part('header', 'default');
   }
}else{
   get_template_part('header', 'default');
}