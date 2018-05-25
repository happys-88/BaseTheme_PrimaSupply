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

        // Declaration of scrollToTop function 
        function scrollToTop(){
        	$("body, html").animate({ 
	            scrollTop: 0
	        }, 600); 
        }
		
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
		        $(".mz-back-to-top-btn").fadeOut();
		    }

		    if (scroll >= 200) {
		    	$(".mz-back-to-top-btn").fadeIn();
		    } else{
		    	$(".mz-back-to-top-btn").fadeOut(); 
		    }

		});

		// Back To Top
		$(".mz-back-to-top-btn").click(function(){
	        scrollToTop(); 
	    });

		// Refine By Toggle in Mobile

	    $(".mz-facets-dropdown").click(function(){
			$(this).toggleClass("mz-facets-dropdown-open");
		    $(".mz-faceting-section").toggleClass("mz-faceting-section-open");
		});
		
		var navHeight = $(".mz-sitenav").outerHeight();
		//alert(navHeight); 
		$(".mz-sitenav-sub-container").css('top', navHeight);
			
		$(window).resize(function(){	
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

		/*$(".mz-table-cart .mz-carttable-items").find(".mz-carttable-item").each(function(){ 
			var getCartItemHeight = $(this).outerHeight(); 
			console.log(getCartItemHeight);   
		});*/ 

	});
}); 