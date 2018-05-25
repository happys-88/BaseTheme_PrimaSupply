
define([
	'modules/jquery-mozu',
	'underscore',
	"modules/backbone-mozu",
	'hyprlive',
	"bxslider",
	"modules/api",
	"modules/models-product",
	"pages/cart",
	 "modules/models-cart"
], function ($, _, Backbone, Hypr, bxslider, api, ProductModel, cart, cartModel) {
	var productCrossSellView = Backbone.MozuView.extend({
	    templateName: 'modules/product/product-crosssells',  
	    productCarousel: function () {
			var minSlides;
		    var maxSlides;
			var slideWidth;
			var  slideMargin;
			var windowWidth=$( window ).width();
			if(windowWidth<767){
				 minSlides=2;
				 maxSlides=2;
				 slideMargin= 10;
				 slideWidth= 333;
			}else{
				 minSlides=4;
				 maxSlides=12;
				slideWidth= 333;
				slideMargin=15;
			}
	        $('#crossSellSlider').bxSlider({ 
		        minSlides: minSlides,
                maxSlides: maxSlides,
                moveSlides: 1,
                slideWidth: slideWidth,
                slideMargin: slideMargin,
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
	 var cartModels = cartModel.Cart.fromCurrent();
	 var indexcartnewproduct;
	 var prodCodeCrossSell = [];
	 var variantion=[];
 	$.each(sell.properties, function( index, value ) {
    	if(value.attributeFQN == "tenant~product-crosssell"){
	        $.each(value.values, function( index, value ){
				prodCodeCrossSell.push(value.value);
				variantion.push(value.value.slice(0,value.value.lastIndexOf("-")));         
	        });
        }
	   });
	   if(prodCodeCrossSell.length>0){
				var Crosssellurl = "";
				var CrosssellgenerateURL = "";
				var items=[];
				var product = ProductModel.Product.fromCurrent();
				$.each(prodCodeCrossSell, function( index, value ) {
					Crosssellurl = "productCode eq "+ "'" + value + "'"+ " or ";
					CrosssellgenerateURL= CrosssellgenerateURL + Crosssellurl;
				api.request("GET", "/api/commerce/catalog/storefront/products/"+variantion[index]+"?"+"variationProductCode="+value ).then(function(body){
						items.push(body); 
					});
				});
				CrosssellgenerateURL = CrosssellgenerateURL.slice(0, -3);
				var upsellUrl= "/api/commerce/catalog/storefront/products/?filter=(" + CrosssellgenerateURL + ")";
				api.request("GET", upsellUrl ).then(function(body){
					$.each(body.items, function( index, value ) {
						items.push(value);
					});					
					product.set("items",items);
				var crosssellview = new productCrossSellView({
					model:product,
					el: $('#product-crosssells')
				});
				
				crosssellview.render();
				crosssellview.productCarousel();
			});
	   }
  
	
});



