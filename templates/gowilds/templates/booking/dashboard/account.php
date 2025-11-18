<?php
	$user_info = wp_get_current_user();

	if($user_info->ID > 0){
		  
		$check_role = BABE_My_account::validate_role($user_info); 
		 
		if ($check_role){
			echo '<div id="my_account_page_wrapper">';
				$nav_arr = BABE_My_account::get_nav_arr($check_role);
				$current_nav_slug_arr = BABE_My_account::get_current_nav_slug($nav_arr);
				$current_nav_slug = key($current_nav_slug_arr);
		 
				echo '<div class="my_account_page_nav_wrapper">';
		 
					echo '<input type="text" class="my_account_page_nav_selector" name="' . esc_attr($current_nav_slug) . '_label" value="'. esc_attr($current_nav_slug_arr[$current_nav_slug]) . '">';
						echo '<i class="fas fa-chevron-down my_account_page_nav_selector_i"></i>';
						echo '<div class="my_account_page_nav_list">';     
							echo BABE_My_account::get_nav_html($nav_arr, $current_nav_slug);
						echo '</div>';
					echo '</div>';
		 
					echo '<div class="my_account_page_content_wrapper">';
						echo '<div class="my_account-content-inner">';

							if(isset($_GET['inner_page']) && $_GET['inner_page'] == 'posts-wishlist'){ 
								do_action('gowilds_get_all_posts_wishlist');
							}else{
								echo apply_filters('babe_myaccount_page_content_' . $check_role, '', $user_info );
							}

						echo '</div>';
					echo '</div>';
		 
				echo '</div>';
		 
		 } //// end if ($check_role)
		 
	}else{
		  
		if (isset($_GET['action']) && $_GET['action'] == 'lostpassword'){
			echo '<div class="my_account_page_content_wrapper login-register-page">';
				echo '<div class="z-login-form">';
					echo '<div class="form-content">';
						echo BABE_My_account::get_lostpassword_form();
					echo '</div>';   
				echo '</div>';   
			echo '</div>';
		}else{
			
			echo '<div class="my_account_page_content_wrapper login-register-page">';

				if(isset($_GET['action']) && $_GET['action'] == 'register'){
					
					$html = BABE_My_account::get_register_form();
					$html = str_replace('modal fade', 'registration-wrapper', $html);
					$html = str_replace('modal-dialog modal-dialog-centered modal-lg', '', $html);
					$html = str_replace('modal-body', 'form-content', $html);
					$html = str_replace('modal-content', 'form-content-inner', $html);

					if(!get_option( 'users_can_register' )){
						$html = '<div class="alert alert-info">' . esc_html__('Website does not allow register', 'gowilds') . '</div>';
					}
					$register_image = GOWILDS_THEME_URL . '/assets/images/register.png';
					$image_options = gowilds_get_option('register_image', array('id'=> 0));
					if(isset($image_options['url']) && $image_options['url']){
      				$register_image = $image_options['url'];
   				}

   				$login_link = site_url('/wp-login.php?action=login&redirect_to=' . get_permalink());
		         if(class_exists('BABE_Settings')){
		            $login_link = BABE_Settings::get_my_account_page_url() . '?action=login';
		         } 
					echo '<div class="container">';
						echo '<div class="z-register-form">';
							echo '<div class="row">';
								
								echo '
									<div class="col-12 col-md-5 register-content-left">
										<span class="img-register">
											<img src="' . esc_url($register_image) . '" alt="' . esc_attr__('Register', 'gowilds') . '">
										</span>
										<div class="content-inner">
											<div class="quick-login">
												<span class="text">' . esc_html__('Already a member', 'gowilds') . '</span>
												<a class="btn-theme btn-small login-link" href="' . esc_url($login_link) . '">
													' . esc_html__('Login', 'gowilds') . '             
												</a>
											</div>
										</div>
									</div>
								';

								echo '
									<div class="col-12 col-md-7 register-form-content">
										<h3 class="title">' . esc_html__('Create a free account', 'gowilds') . '</h3>
										<div class="desc"> ' . esc_html__('A few clicks away from creating your account', 'gowilds') . '</div>
										' . html_entity_decode($html) . '
									</div>                   
								'; 

							echo '</div>';   
						echo '</div>';   
					echo '</div>';   

				}else{
					$register_link = site_url('/wp-login.php?action=register');
				   if(class_exists('BABE_Settings')){
				      $register_link = BABE_Settings::get_my_account_page_url() . '?action=register';
				      $lostpassword_link = BABE_Settings::get_my_account_page_url() . '?action=lostpassword';
				   }
					echo '<div class="z-login-form">';
						echo '<div class="form-content">';
							echo BABE_My_account::get_login_form();
							echo '<div class="user-registration">';
								echo esc_html__('Do not have an account', 'gowilds');
								echo '<a class="quick-login-link" href="' . $register_link . '">' . esc_html__('Register', 'gowilds') . '?</a><br>';
								echo '<a class="lost-password" href="' . $lostpassword_link . '">' . esc_html__('Forgot your password?', 'gowilds') . '</a>';
							echo '</div>';
						echo '</div>';   
					echo '</div>';   
				}

			echo '</div>';
		}
		  
	 } //// end if ($user_info->ID > 0)
	 
