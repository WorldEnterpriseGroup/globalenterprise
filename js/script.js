//------------------------------------- Waiting for the entire site to load ------------------------------------------------//

jQuery(window).load(function() { 
		jQuery("#loaderInner").fadeOut(); 
		jQuery("#loader").delay(400).fadeOut("slow"); 
		$('.teaserTitle ').stop().animate({marginTop :'330px', opacity:"1"}, 1000, 'easeOutQuint');
		$('.down a ').stop().animate({marginTop :'30px', opacity:"1"}, 600, 'easeOutQuint');
});



$(document).ready(function(){

//------------------------------------- Navigation setup ------------------------------------------------//


//--------- Scroll navigation ---------------//


$("#mainNav ul a, .logo a, .shortLink a, .down a, .notBtn a, .shortContact a").click(function(e){

	
	var full_url = this.href;
	var parts = full_url.split("#");
	var trgt = parts[1];
	var target_offset = $("#"+trgt).offset();
	var target_top = target_offset.top;
	


	$('html,body').animate({scrollTop:target_top -110}, 800);
		return false;
	
});


//-------------Highlight the current section in the navigation bar------------//
	var sections = $("section");
		var navigation_links = $("#mainNav a");

		sections.waypoint({
			handler: function(event, direction) {

				var active_section;
				active_section = $(this);
				if (direction === "up") active_section = active_section.prev();

				var active_link = $('#mainNav a[href="#' + active_section.attr("id") + '"]');
				navigation_links.removeClass("active");
				active_link.addClass("active");

			},
			offset: '35%'
		});
		
		
//------------------------------------- End navigation setup ------------------------------------------------//




//---------------------------------- Clients animation-----------------------------------------//

$('.clientList a').css({opacity:0.5});
		$('.clientList a').hover( function(){ 
			$(this).stop().animate({opacity:"1"}, 100, 'easeOutQuint');
		}, function(){ 
			$(this).stop().animate({opacity:"0.5"}, 100, 'easeOutQuint');
		});
//---------------------------------- End clients animation-----------------------------------------//


//---------------------------------- Form validation-----------------------------------------//




$('#submit').click(function(){ 

	$('input#name').removeClass("errorForm");
	$('textarea#message').removeClass("errorForm");
	$('input#email').removeClass("errorForm");
	
	var error = false; 
	var name = $('input#name').val(); 
	if(name == "" || name == " ") { 
		error = true; 
		$('input#name').addClass("errorForm");
	}
	
	
		var msg = $('textarea#message').val(); 
		if(msg == "" || msg == " ") {
			error = true;
			$('textarea#message').addClass("errorForm");
			
		}
	
	var email_compare = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i; 
	var email = $('input#email').val(); 
	if (email == "" || email == " ") { 
		$('input#email').addClass("errorForm");
		error = true;
	}else if (!email_compare.test(email)) { 
		$('input#email').addClass("errorForm");
		error = true;
	}

	if(error == true) {
		return false;
	}

	var data_string = $('.contactForm form').serialize(); 
	

	$.ajax({
		type: "POST",
		url: $('.contactForm form').attr('action'),
		data: data_string,
		
		success: function(message) {
				if(message == 'SENDING'){
					$('#success').fadeIn('slow');
				}
				else{
					$('#error').fadeIn('slow');
				}
					}
					
					
					
	});

	return false; 
});



//---------------------------------- End form validation-----------------------------------------//



//--------------------------------- To the top handler --------------------------------//
$().UItoTop({ easingType: 'easeOutQuart' });
//--------------------------------- End to the top handler --------------------------------//


//--------------------------------- Mobile menu --------------------------------//


var mobileBtn = $('.mobileBtn');
	nav = $('#mainNav ul');
	navHeight= nav.height();

$(mobileBtn).click(function(e) {
		e.preventDefault();
		nav.slideToggle();
});

$(window).resize(function(){
		var w = $(window).width();
		if(w > 320 && nav.is(':hidden')) {
			nav.removeAttr('style');
		}
});




//--------------------------------- End mobile menu --------------------------------//


//--------------------------------- Parallax --------------------------------//
	
$(".subscribeContainer").parallax("100%", 0.3);
$(".clientContainer").parallax("100%", 0.3);
$(".feedContainer").parallax("100%", 0.3);

//--------------------------------- End parallax --------------------------------//


//---------------------------------- Newsletter form validation-----------------------------------------//
$(".subscribeHolder form").validate();
//---------------------------------- End newsletter form validation-----------------------------------------//




//---------------------------------- Gallery slider-----------------------------------------//

$('.slider').flexslider({
	animation: "slide",
	slideshow: true,
	minItems: 1,
	maxItems: 1
});

//---------------------------------- End gallery slider-----------------------------------------//




//--------------------------------- Accordion --------------------------------//	

		$( "#tabs" ).tabs();
		$( "#accordion" ).accordion();
		var selectedEffect = $( "#effectTypes" ).val();
		var link = $("#button")
		var options = {};

			if ( selectedEffect === "slide" ) {
				options = { percent: 0 };
			} else if ( selectedEffect === "size" ) {
				options = { to: { width: 200, height: 60 } };
			}

			$( "#effect" ).toggle( selectedEffect, options, 500 );
			
//--------------------------------- End accordion --------------------------------//



});






