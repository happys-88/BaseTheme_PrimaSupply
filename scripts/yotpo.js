define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "hyprlivecontext"
], 
function ($, Hypr, Backbone, api, HyprLiveContext) {
  var YotPo = {
    update: function() {
        var productCodes = [];
        var itemsArr = [];

        api.request("GET", "/api/commerce/carts/current/items").then(function(response) {
          
          var items = response.items;
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            productCodes[i] = item.product.productCode;
            itemsArr[i] = item;
          }

          // Custom Yotpo Rating
          var yotpoApiKey = HyprLiveContext.locals.themeSettings.yotpoApiKey;
          var bottomline = HyprLiveContext.locals.themeSettings.bottomline;
          var yotpoBottomlineBaseUrl = HyprLiveContext.locals.themeSettings.yotpoBottomlineBaseUrl;

          $(".mz-productlist-list .mz-productlist-item").each(function() {

            var currentProduct = $(this);
            var productCode = $(this).find(".mz-productlisting").data("mz-product");

            // <----- code for show/hide pricing start ----->

            var itemIndex = productCodes.indexOf(productCode);
            if(itemIndex >= 0) {
              var item = itemsArr[itemIndex];
              if($('.cartPrice-'+productCode).length) {
                $('.cartPrice-'+productCode).show();
              } else {
                $('.mapPrice-'+productCode).show();
              }
            } else {
              $('.mapPrice-'+productCode).show();
            }

            // </----- code for show/hide pricing end ----->

              var ratingURL = ""+yotpoBottomlineBaseUrl+"/"+yotpoApiKey+"/"+productCode+"/"+bottomline+"";
              $.get(ratingURL, function(data, status){ 
              var ratingAverageScore = data.response.bottomline.average_score;
                  var ratingTotalCount = data.response.bottomline.total_reviews;
                  //$(currentProduct).find("#product-rating").html("Average score...="+ratingAverageScore+" Total count="+ratingTotalCount); 
              }).done(function() {
              
              }).fail(function() {
                   $(currentProduct).find("#product-rating").html('<div class="yotpo bottomline"><div class="yotpo-bottomline pull-left  star-clickable"><span class="yotpo-stars"><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span> </span><div class="yotpo-clr"></div> </div></div><br>'); 
              });
          });
        });
    }
  };
  YotPo.update();
  return YotPo;
});