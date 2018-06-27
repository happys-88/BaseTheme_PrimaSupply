define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext"
], 
function ($, Hypr, Backbone, HyprLiveContext) {
  var YotPo = {
    update: function() {

          // Custom Yotpo Rating
          var yotpoApiKey = HyprLiveContext.locals.themeSettings.yotpoApiKey;
          var bottomline = HyprLiveContext.locals.themeSettings.bottomline;
          var yotpoBottomlineBaseUrl = HyprLiveContext.locals.themeSettings.yotpoBottomlineBaseUrl;

          $(".mz-productlist-list .mz-productlist-item").each(function() {

              var currentProduct = $(this);
              var productCode = $(this).find(".mz-productlisting").data("mz-product");
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
    }
  };
  YotPo.update();
  return YotPo;
});