define([
	"modules/jquery-mozu",
	"underscore",
	"hyprlive",
	"modules/backbone-mozu",
	"modules/cart-monitor",
	"modules/views-productimages",
	"hyprlivecontext",
	"modules/views-collections",
	"modules/models-product",
	"modules/models-price",
	"modules/api" 
],  

function ($, _, Hypr, Backbone, CartMonitor, ProductImageViews, HyprLiveContext, CollectionViewFactory, ProductModel, ProductPrice, api) {

	$(document).ready(function(){ 
	    var ordid = location.hash.substring(1);
	    console.log(ordid);  
	    	api.request("GET", '/api/commerce/orders/'+ordid).then(function(body){ 
	    		console.log("order items: "+JSON.stringify(body)); 
				$('#print').empty().append(Hypr.getTemplate('modules/my-account/print-receipt').render({ model: body }));  
			});
	    });
	}); 
 
