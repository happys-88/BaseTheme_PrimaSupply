define([ 
	"modules/jquery-mozu"
], function( $) {
	$(document).ready(function(){ 
		
		var navHeight = $(".mz-sitenav").outerHeight();
		//alert(navHeight); 
		$(".mz-sitenav-sub-container").css('top', navHeight);
		

		var getWindowWidth = $(window).width();
		console.log(getWindowWidth);
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

	});
}); 