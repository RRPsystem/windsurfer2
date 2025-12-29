<!-- Page Starts--> 
<section class="page-block">
    <div class="container">
        <div class="row gx-5">
        <?php			
			$layout = travellers_get_layout();
			if($layout != 'full'){		
				$rsclass = ($layout == 'ls')? ' pull-right' : '';
				echo '<aside class="col-md-9 col-sm-8 post-wrap '.$rsclass.'">';
			}else{
				echo '<aside class="col-md-12 col-sm-12">';
			}
		?>
