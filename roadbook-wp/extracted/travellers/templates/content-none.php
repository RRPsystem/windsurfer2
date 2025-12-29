<?php if ( is_search() ) : ?>
    <section id="error-page" class="text-center space-50">
        <h4><?php _e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'travellers' ); ?></h4>
        <hr>
        <?php get_search_form(); ?>
        <hr>
    </section>

<?php else : ?>
    <section id="error-page" class="space-50">
                
                <div class="theme-container">                    
                    <h3><?php _e('404', 'travellers') ?></h3>
                    <h2><i class="fa fa-warning"></i> <?php _e( 'Oops! The Page you requested was not found!', 'travellers') ?></h2>
                    <p><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary"><?php _e('Back to Home', 'travellers') ?></a></p>                    
                </div>
                
            </section>
<?php endif; ?>