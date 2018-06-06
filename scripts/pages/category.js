require([
	'modules/jquery-mozu',
	"modules/views-collections",
	"modules/api", 
	"modules/models-product",
    "hyprlivecontext"
], function( $, CollectionViewFactory, Api, ProductModel, HyprLiveContext) {
    $(document).ready(function() {
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            template: "category-interior"
        });

		// Custom Yotpo Rating
		var yotpoApiKey = HyprLiveContext.locals.themeSettings.yotpoApiKey;
		var bottomline = HyprLiveContext.locals.themeSettings.bottomline;
		var yotpoBottomlineBaseUrl = HyprLiveContext.locals.themeSettings.yotpoBottomlineBaseUrl;
		$(".mz-productlist-list .mz-productlist-item").each(function() {
			var currentProduct = $(this);
			var getProductCode = $(this).find(".mz-productlisting").data("mz-product");
    	    var ratingURL = ""+yotpoBottomlineBaseUrl+"/"+yotpoApiKey+"/"+getProductCode+"/"+bottomline+"";
   	 
	    	$.get(ratingURL, function(data, status){
				var ratingAverageScore = data.response.bottomline.average_score;
		        var ratingTotalCount = data.response.bottomline.total_reviews;
		        $(currentProduct).find("#product-rating").html("Average score...="+ratingAverageScore+" Total count="+ratingTotalCount); 
		    }).done(function() {
			  
			}).fail(function() {
		       $(currentProduct).find("#product-rating").html('<div class="yotpo bottomline"><div class="yotpo-bottomline pull-left  star-clickable"><span class="yotpo-stars"><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span> </span><div class="yotpo-clr"></div> </div></div><br>'); 

		  	});
		});
	});
}); 