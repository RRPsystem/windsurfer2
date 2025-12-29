<?php if( ot_get_option('terms_display', 'on') == 'on' ): ?>
    <!-- ::: Terms & Conditions Content ::: -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="myModalLabel"><?php echo esc_attr( ot_get_option('terms_title', 'Terms & Conditions') ) ?></h4>
                </div>
                
                <div class="modal-body">
                    <?php 
                    $term_details = ot_get_option( 'terms_details', ' <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id turpis sit amet enim rutrum placerat vel sit amet risus. Nulla ultricies dolor quis quam scelerisque aliquet. Praesent fermentum in lectus non lobortis. Sed sit amet tincidunt libero. Suspendisse euismod metus lobortis, ultrices augue id, dictum elit. Proin vehicula euismod nisl id iaculis. Nunc ac nisi ex. Sed nisl libero, accumsan vel fringilla quis, accumsan sit amet sem.</p>' );
                        
                    echo wp_kses_post(wpautop($term_details, true));
                        ?>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal"><?php _e('Close', 'travellers'); ?></button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    <!-- ::: Terms end ::: -->
<?php endif; ?>