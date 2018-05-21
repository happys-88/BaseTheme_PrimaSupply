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
	console.log("upsell");
	var productUpSellView = Backbone.MozuView.extend({
	    templateName: 'modules/product/product-upsell',  
	    productCarousel: function () {
	        $('#UpSellSlider').bxSlider({ 
		        minSlides: 4,
                maxSlides: 12,
                moveSlides: 1,
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
	 var cartModels = cartModel.Cart.fromCurrent();
	 var indexcartnewproduct;
	 var newaddedproductcode= sell.changeMessages[sell.changeMessages.length-1].metadata[0].productCode;
	 $.each(sell.items, function( index, value ) {
			if(value.product.productCode==newaddedproductcode){
				indexcartnewproduct=index;
			}
	 });
	 var prodCodeUpSell = [];
	 var variantion=[];
 	$.each(sell.items[indexcartnewproduct].product.properties, function( index, value ) {
    	if(value.attributeFQN == "tenant~product-upsell"){
	        $.each(value.values, function( index, value ){

				prodCodeUpSell.push(value.value);
				variantion.push(value.value.slice(0,value.value.lastIndexOf("-")));
	              
	        });
        }
	   });
	   if(prodCodeUpSell.length>0){
				var Upsellurl = "";
				var upselgenerateURL = "";
				var items=[];
				var product = ProductModel.Product.fromCurrent();
				$.each(prodCodeUpSell, function( index, value ) {
					Upsellurl = "productCode eq "+ "'" + value + "'"+ " or ";
					upselgenerateURL= upselgenerateURL + Upsellurl;
					api.request("GET", "/api/commerce/catalog/storefront/products/"+variantion[index]+"?"+"variationProductCode="+value ).then(function(body){
						items.push(body); 
					});
				});
				upselgenerateURL = upselgenerateURL.slice(0, -3);
				var upsellUrl= "/api/commerce/catalog/storefront/products/?filter=(" + upselgenerateURL + ")";
				api.request("GET", upsellUrl ).then(function(body){
					$.each(body.items, function( index, value ) {
						items.push(value);
					});					
					product.set("items",items);
				var Upsellview = new productUpSellView({
					model:product,
					el: $('#upsell')
				});
				
				Upsellview.render();
				Upsellview.productCarousel();
			});
	   }
  
	
});
