define([
	"modules/jquery-mozu",
	"underscore",
	"hyprlive",
	"modules/backbone-mozu",
	"hyprlivecontext",
	"modules/api"  
],  

function ($, _, Hypr, Backbone, HyprLiveContext, api) { 

	$(document).ready(function(){ 
	    var orderId = location.hash.substring(1);
    	api.request("GET", '/api/commerce/orders/'+orderId).then(function(body){ 
    		var orderData = JSON.stringify(body); 
    		//console.log("order items: "+JSON.stringify(body)); 
    		console.log("Order Data: " + orderData); 
			$('#print-order').empty().append(Hypr.getTemplate('modules/my-account/print-order').render({ model: body }));      
		}); 
	}); 
});  
 
