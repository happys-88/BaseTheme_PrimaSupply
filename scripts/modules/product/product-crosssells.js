define([
	'modules/jquery-mozu',
	'underscore',
	"modules/backbone-mozu",
	'hyprlive',
	"bxslider",
	"modules/api",
	"modules/models-product"
], function ($, _, Backbone, Hypr, bxslider, api, ProductModel) {

	console.log("aa gya"); 

	var productCrossSellView = Backbone.MozuView.extend({
	    templateName: 'modules/product/product-crosssells',
	    productCarousel: function () {
	        $('#crossSellSlider').bxSlider({ 
		        minSlides: 4,
                maxSlides: 12,
                moveSlides: 4,
                slideWidth: 333,
                slideMargin: 15,
                responsive: true,
                pager: false,
                speed: 1000,
                infiniteLoop: false,
                hideControlOnEnd: true,
		        onSliderLoad: function() {
		            $(".slider").css("visibility", "visible");
		        }  
			});
		}
	});
 	
 	var sell = require.mozuData("productCrossSell");
 	var prodCodeCrossSell = [];
 	$.each(sell.properties, function( index, value ) {
    	if(value.attributeFQN == "tenant~product-crosssell"){
	        $.each(value.values, function( index, value ){
	            prodCodeCrossSell[index] = value.value;   
	        });
        }
   	});

   	var crosssellurl = "";
   	var crossselgenerateURL = "";
   	$.each(prodCodeCrossSell, function( index, value ) {
    	crosssellurl = "productCode eq "+ "'" + value + "'"+ " or ";
       	crossselgenerateURL= crossselgenerateURL + crosssellurl;
   	}); 

   	crossselgenerateURL = crossselgenerateURL.slice(0, -3);
   	var crosssellUrl= "/api/commerce/catalog/storefront/products/?filter=(" + crossselgenerateURL + ")";
   	api.request("GET", crosssellUrl ).then(function(body){
	    var product = new ProductModel.Product(body); 
	    var crosssellview = new productCrossSellView({
	        model:product,
	        el: $('#product-crosssells')
	  	});
	  	
	  	crosssellview.render();
	  	crosssellview.productCarousel();
	});

});
