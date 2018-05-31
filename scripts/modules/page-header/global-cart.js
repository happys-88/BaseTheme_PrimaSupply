define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/api",
    'modules/models-cart',
    "pages/cart",
    "session-management"
], 
function ($, Hypr, Backbone, CartMonitor, api, cartModel, cart, sessionManagement) { 
    if (require.mozuData('user').isAuthenticated) {
        $(window).sessionManagement(Hypr.getThemeSetting('sessionTimeout'), function() {
            window.location.href = '/logout';
        });
    }
        var GlobalCart = {
            update: function() {
                api.get("cart").then(function(body){
                    var globalCartView =cart.extend({
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
                      var lengt=cartModels.attributes.changeMessages.length;
                      var productcod=cartModels.attributes.changeMessages[lengt-1].metadata[0].productCode;
                      var id='.'+productcod;
                      $(id).prependTo(".mz-carttable-items-global");
          
                  });
            }
        };
        GlobalCart.update();
       return GlobalCart;
       
});