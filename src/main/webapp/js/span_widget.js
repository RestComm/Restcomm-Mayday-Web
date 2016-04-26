//START: Widget for JS
			jQuery(document).ready(function($) {

				// Define any icon actions before calling the toolbar
				$('#video-panel').on('click', function( event ) {
					//event.preventDefault();
					console.log("click event got triggered!");
					//$('#video-button').toolbar({content: '#video-options', position: 'bottom'});
					$('#dailpad-options').hide();
					$('#video-options').show();
					
				});
				
				$('#hide-video-panel').on('click', function( event ) {
					console.log("click event got triggered!");
					$('#video-options').hide();
					$('#dailpad-options').hide();
					
				});
				$('#dail-textbox').on('click', function( event ) {
					console.log("click event got triggered!");
					$('#video-options').hide();
					
				});
				
				$('#dest-number').on('click', function( event ) {
					console.log("click event got triggered!");
					$('#dailpad-options').hide();
					$('#video-options').show();
					
				});
				$('#dest-number').on('click', function( event ) {
					console.log("click event got triggered!");
					$('#dailpad-options').hide();
					$('#video-options').show();
					
				});
				$('#normal-button').toolbar({content: '#user-options', position: 'top'});
				$("#drag").draggable();
			});
			// END: Widget for JS	