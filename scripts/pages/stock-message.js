define(["modules/jquery-mozu", 
	"underscore", "hyprlive", 
	"modules/backbone-mozu", 
	"modules/cart-monitor", 
	"modules/views-productimages",  
	"hyprlivecontext",
	"modules/views-collections",
	"modules/models-product", 
	"modules/models-price", 
	"modules/api"], 
function ($, _, Hypr, Backbone, CartMonitor, ProductImageViews, HyprLiveContext, CollectionViewFactory, ProductModel, ProductPrice, api) {

	$(document).ready(function(){
		$(".mz-productlist-list .mz-productlist-item").each(function() {
			var getProductCode = $(this).find(".mz-productlisting").data("mz-product");
			api.request("GET", "/api/commerce/catalog/storefront/products/?startIndex=0&pageSize=10&filter=productCode eq "+getProductCode+"" ).then(function(singleProduct){
				$("#"+getProductCode+"").hide();
				$.each(singleProduct.items, function(index, productValue){
					if(productValue.variations.length !== undefined)
						{	var sum = 0;
							$.each(productValue.variations, function(index, variationsValue){
							sum += variationsValue.inventoryInfo.onlineStockAvailable;
							});
							var stockThreshold = HyprLiveContext.locals.themeSettings.stockThreshold;
							var outOfStock = HyprLiveContext.locals.themeSettings.outOfStock;
							if(sum < 10 && sum !== 0){
								$("#"+getProductCode+"").show();
								$("#stock-messages-"+getProductCode+"").hide();
								$("#"+getProductCode+"").html(stockThreshold.replace("{0}", sum));

							}
							
							if(sum === 0){
								$('[data-mz-productcode='+getProductCode+']').attr("disabled", true);
								$("#"+getProductCode+"").show();
								$("#"+getProductCode+"").html(outOfStock);
							}
						}
				});
			});
    	});
	});
});
 