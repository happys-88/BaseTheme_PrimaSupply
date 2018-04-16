define([ 
	"modules/jquery-mozu"
], function( $) {
	$(document).ready(function(){ 

		if ($(this).scrollTop() > 500) { 
	        $("#scroll-to-top").show();
	    }
		// Sticky Nav Header
		$(window).scroll(function() {    
		    var scroll = $(window).scrollTop();

		    if (scroll >= 1) {
		        $("body").addClass("header-fixed");
		        $(".mz-sticky-header").addClass("fixed");
		        
		    } else {
		        $(".mz-sticky-header").removeClass("fixed"); 
		        $("body").removeClass("header-fixed"); 
		        $("#back-to-top").fadeOut();
		    }

		    if (scroll >= 500) {
		    	$("#back-to-top").fadeIn();
		    } else{
		    	$("#back-to-top").fadeOut();
		    }

		});

		$("#back-to-top").click(function(){
	        $("body").animate({
	            scrollTop: 0
	        }, 600);
	    });
		
		var navHeight = $(".mz-sitenav").outerHeight();
		//alert(navHeight); 
		$(".mz-sitenav-sub-container").css('top', navHeight);
	

		var getWindowWidth = $(window).width();
		//console.log(getWindowWidth);
		if(getWindowWidth <=767 ){
			$('.mz-sitenav-item .mz-sitenav-link').click(function(event){
				event.preventDefault();
				if($(this).hasClass("active")){
					$(this).parent(".mz-sitenav-item-inner").find(".mz-sitenav-sub-container").slideUp("slow");
					$(".mz-sitenav-item .mz-sitenav-link").removeClass("active");
					event.preventDefault();
				}else{
					$(".mz-sitenav-sub-container").slideUp("slow");
					$(this).parent(".mz-sitenav-item-inner").find(".mz-sitenav-sub-container").slideToggle("slow");
					$(".mz-sitenav-item .mz-sitenav-link").removeClass("active");
					$(this).toggleClass("active");
				}
			});		
		}
		
		$(window).resize(function(){	
			var w = $(window).width();
			if(w > 767){
				$("#mz-sitenav-container").removeClass("collapse");
				$("#mz-sitenav-container").css("height", "auto");
			}else{
				$("#mz-sitenav-container").addClass("collapse");
			}
		});

		$(".mz-sitenav-item .mz-sitenav-link").css('height', navHeight); 

	});
}); 