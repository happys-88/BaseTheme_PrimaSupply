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
                      var lengt=cartModels.attributes.changeMessages.length;
                     
                  
                      //var clone=$(".mz-carttable-items-global").find(id).addClass("just-added-to-cart").clone();
                     // $(".mz-carttable-items-global").find(id).addClass("just-added-to-cart").remove();
                       //$(id).prependTo(".mz-carttable-items-global");
                       if(cartModels.isEmpty!==true){
                        var id;
                        var productcod;
                        for(var index = length; index >= 0; index--) {
                           if(cartModels.attributes.changeMessages[index].verb !== "Merged"){
                               if(cartModels.attributes.changeMessages[index].metadata[0].variationProductCode){
                                productcod=cartModels.attributes.changeMessages[index].metadata[0].variationProductCode;
                                id='#'+productcod;
                               }
                               else{
                                productcod=cartModels.attributes.changeMessages[index].metadata[0].productCode;
                                id='#'+productcod;
                               }
                            $(id).prependTo(".mz-carttable-items-global");
                            break;
                           }
                        }
                     }
                    if (redirect_to_cart == 'redirect_to_cart') {
                      window.location = "/cart";
                    }
                  });
            }
        };
        GlobalCart.update();
       return GlobalCart;
       
});