define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/api",
    'modules/models-cart',
    "pages/cart",
    "session-management",
    "hyprlivecontext"
], 
function ($, Hypr, Backbone, CartMonitor, api, cartModel, cart, sessionManagement, HyprLiveContext) {
    if (require.mozuData('user').isAuthenticated) {
        $(window).sessionManagement(Hypr.getThemeSetting('sessionTimeout'), function() {
            window.location.href = '/logout';
        });
    }
        var GlobalCart = {
            update: function(redirect_to_cart) {
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
                     var productcod=localStorage.getItem("lastAddedItemToCart");
                       var id="#"+productcod;
                       $(id).prependTo(".mz-carttable-items-global");
                    if (redirect_to_cart == 'redirect_to_cart') {
                      window.location = "/cart";
                    }
                  });
            }
        };
        GlobalCart.update();
       return GlobalCart;
       
});