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
        $(".addToCart").click(function(event){
        	var $thisElem = $(event.currentTarget);
                //prodOptions = $("[data-option='"+ $thisElem.data("productcode") +"']").val();
			Api.request("POST", "/api/commerce/carts/current/items", {
				product: {
					productCode: $thisElem.data("productcode"),
					//options: [prodOptions]
					options: []
				},
				quantity: 1,
				fulfillmentMethod: "ship"
			}).then(function(){
		 		window.location = "/cart";
			});
		});


    });
}); 