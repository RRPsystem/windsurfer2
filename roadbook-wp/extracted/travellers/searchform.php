<form role="search" method="get" id="searchform" class="bp-searchform searchform" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<div class="widget-search">
	    <input  value="<?php echo esc_attr(get_search_query()); ?>" name="s" id="s" placeholder="<?php echo esc_attr(__( 'Search...', 'travellers' )); ?>" class="form-control" type="text">
	    <button><i class="fa fa-search"></i></button>
	</div>	
</form>
