define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/api",
    'modules/models-cart',
    "pages/cart"
], 
function ($, Hypr, Backbone, CartMonitor, api, cartModel, cart) {
   
    var globalCartMaxItemCount = Hypr.getThemeSetting('globalCartMaxItemCount'),
        globalCartHidePopover = Hypr.getThemeSetting('globalCartHidePopover');
        
        api.get("cart").then(function(body){
          var globalCartView = cart.extend({
            templateName: 'modules/page-header/global-cart-dropdown'
          });
 
           var cartModels = new cartModel.Cart(body.data);
           var globalcartView = new globalCartView({
               model:cartModels,
               el: $("#global-cart-listing")
           });
       
           new cart({
               el: $('#cart'),
               model: cartModels,
               messagesEl: $('[data-mz-message-bar]')
              
           });
           globalcartView.render();

        });
});