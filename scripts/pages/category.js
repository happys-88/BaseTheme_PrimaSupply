require([
	'modules/jquery-mozu',
	"modules/views-collections",
	"modules/api", 
	"modules/models-product",
	"modules/quickview"
], function( $, CollectionViewFactory, Api, ProductModel, Quickview) {
    $(document).ready(function() {
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            template: "category-interior"
        });

        // Add To Cart Button functionality in Category Page
        $(".add-to-cart").click(function(event){

        	var $thisElem = $(event.currentTarget);
			Api.request("POST", "/api/commerce/carts/current/items", {
				product: {
					productCode: $thisElem.data("productcode")
					//options: [prodOptions]
					//options: []
				},
				quantity: 1,
				fulfillmentMethod: "ship"
			}).then(function(){
		 		window.location = "/cart";
			});
		});

		// Yotpo Rating
		
		$(".mz-productlist-list .mz-productlist-item").each(function() {
			var currentProduct = $(this);

			var getProductCode = $(this).find(".mz-productlisting").data("mz-product");
			console.log(getProductCode); 

    	    var ratingURL = "https://api.yotpo.com/products/4X91rXasdFWFBX4Rnh5WEr4NnvMwpFpjxzNFLubD/"+getProductCode+"/bottomline";
    	 
	    	  $.get(ratingURL, function(data, status){

	    	  	console.log(data.response);
		        var ratingAverageScore = data.response.bottomline.average_score;
		        var ratingTotalCount = data.response.bottomline.total_reviews;
		         $(currentProduct).find("#product-rating").html("Average score...="+ratingAverageScore+" Total count="+ratingTotalCount); 


		     }).done(function() {
			   // alert( "second success" );
			  })
			  .fail(function() {
			  //  alert( "error" );

			       $(currentProduct).find("#product-rating").html('<div class="yotpo bottomline"><div class="yotpo-bottomline pull-left  star-clickable"><span class="yotpo-stars"><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span> </span><div class="yotpo-clr"></div> </div></div><br>'); 
			  });
		});
		

    });
}); 