define([ 
	"modules/jquery-mozu"
], function( $) {
	$(document).ready(function(){ 

		// Check if sitenav-item has dropdown
		$(".mz-sitenav-list .mz-sitenav-item").each(function(){
            if($(this).find("div.mz-sitenav-sub-container").length !== 0){
                $(this).addClass("has-dropdown"); 
            }
        }); 

        // Check if sitenav-item has dropdown - Learning Center
		$(".mz-sitenav-lc .mz-sitenav-item").each(function(){
            if($(this).find(".mz-sitenav-sub-sub").length !== 0){
                $(this).addClass("has-dropdown"); 
            }
        }); 
		
		// Global Navigation - Calculate the position of dropdown
		function calculatingSubPosition() {
            $(".mz-sitenav-sub-container").each(function() {
	            var currentElemnt = $(this),
	            	currentDropWidth = currentElemnt.outerWidth(),
	                rightReference = $("#store-branding").offset().left + $(".mz-header-bottom .container").outerWidth(),
	                currentParentOffset = currentElemnt.parents(".mz-sitenav-item").offset().left, 
	                leftOrigin = $(".mz-sitenav-list").offset().left;
	                
	                //console.log(leftOrigin); 
	                //console.log(currentDropWidth + "--" + currentParentOffset);   
	              
	            if (currentParentOffset + currentDropWidth >= rightReference) {
	                currentElemnt.addClass("menu-right");
	            } else {
	                currentElemnt.removeClass("menu-right"); 
	            }
	        });
        }

        calculatingSubPosition();
		
		if ($(this).scrollTop() > 200) { 
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

		    if (scroll >= 200) {
		    	$("#back-to-top").fadeIn();
		    } else{
		    	$("#back-to-top").fadeOut();
		    }

		});

		// Back To Top
		$("#back-to-top").click(function(){
	        $("body").animate({
	            scrollTop: 0
	        }, 600);
	    });

		// Refine By Toggle in Mobile

	    $(".mz-facets-dropdown").click(function(){
			$(this).toggleClass("mz-facets-dropdown-open");
		    $(".mz-faceting-section").toggleClass("mz-faceting-section-open");
		});
		
		var navHeight = $(".mz-sitenav").outerHeight();
		//alert(navHeight); 
		$(".mz-sitenav-sub-container").css('top', navHeight);
	
		// Mobile Navigation
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

			// Global Nav Dropdown function
			calculatingSubPosition();
		});

		$(".mz-sitenav-item .mz-sitenav-link").css('height', navHeight); 

		// Brand Gateway 
		$(".brand-letter a").on('click', function(e){
		    var id = $(this).attr("name");
		    var position = $(id).position();
		    $('body,html').animate({
		    	scrollTop : position.top                       
		    }, 500);
		    
		});

		// Blog Facets
		$("#lcBlogFacets .mz-facet-row").each(function(){
			$(".mz-facet-title").click(function(){ 
				$(this).parent(".mz-facet-row").toggleClass("active");   
			});

			// Hide facet dropdown when clicks outside 
			$(document).mouseup(function (e){
			  var currentFacetRow = $(".mz-facet-row"); 
			  if (!currentFacetRow.is(e.target) && currentFacetRow.has(e.target).length === 0) {
			    currentFacetRow.removeClass("active");  
			  }
			}); 
		});


	});
}); 