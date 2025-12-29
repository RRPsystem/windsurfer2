 <!-- CONTENT AREA -->
 <!--Breadcrumb Section Start-->
<section class="breadcrumb-bg">                
    <div class="theme-container container ">                       
        <div class="site-breadcumb white-clr">                        
            <h3> <?php echo esc_attr( TravellersHeader::get_title() ); ?> </h3> 
            <?php if( (ot_get_option('show_breadcrumbs', 'on') == 'on') && function_exists('bcn_display') ): ?>
            <ol class="breadcrumb breadcrumbs breadcrumb-menubar" typeof="BreadcrumbList" vocab="https://schema.org/">
                <li> 
                    <?php 
                        bcn_display();
                    ?>
               
                </li>                             
            </ol>
        	<?php endif; ?>
        </div>  
    </div>
</section>
<!--Breadcrumb Section End-->