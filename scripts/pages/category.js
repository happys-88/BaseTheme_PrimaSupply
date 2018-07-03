require([
	'modules/jquery-mozu',
	"modules/views-collections",
	"modules/api", 
	"modules/models-product",
    "hyprlivecontext",
    "modules/api"
], function( $, CollectionViewFactory, Api, ProductModel, HyprLiveContext, api) { 
    $(document).ready(function() {
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            template: "category-interior"
        });

        
    }); 

    // Show Yotpo Ratings 
    var yotpoApiKey = HyprLiveContext.locals.themeSettings.yotpoApiKey;
    var bottomline = HyprLiveContext.locals.themeSettings.bottomline;
    var yotpoBottomlineBaseUrl = HyprLiveContext.locals.themeSettings.yotpoBottomlineBaseUrl;

    $(".mz-productlist-list .mz-productlist-item").each(function() { 
        var currentProduct = $(this);
        var productCode = $(this).find(".mz-productlisting").data("mz-product");
        var ratingURL = ""+yotpoBottomlineBaseUrl+"/"+yotpoApiKey+"/"+productCode+"/"+bottomline+"";
        var ratingElement = $(currentProduct).find("#product-rating").find(".yotpo-stars");   
        var yotpoStars = '<span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span><span class="yotpo-icon yotpo-icon-empty-star pull-left"></span>' ; 

        $.get(ratingURL, function(data, status){ 
            var ratingAverageScore = data.response.bottomline.average_score;
            var ratingTotalCount = data.response.bottomline.total_reviews;
            $(currentProduct).find("#product-rating p").html("Average Score ="+ratingAverageScore+" Total Count="+ratingTotalCount);  

            $(ratingElement).html(yotpoStars);  

            var ratingStar = "",
                text = ""; 

            if(ratingAverageScore>=0.1 && ratingAverageScore<=0.9){
                ratingStar = "Star 0.5";       
            }
            if(ratingAverageScore>=1 && ratingAverageScore<=1.4){
                ratingStar = "Star 1";        
            }
            if(ratingAverageScore>=1.5 && ratingAverageScore<=1.9){
                ratingStar = "Star 1.5";          
            }
            if(ratingAverageScore>=2 && ratingAverageScore<=2.4){ 
                ratingStar = "Star 2";           
            }
            if(ratingAverageScore>=2.5 && ratingAverageScore<=2.9){
                ratingStar = "Star 2.5";          
            }
            if(ratingAverageScore>=3 && ratingAverageScore<=3.4){ 
                ratingStar = "Star 3";           
            }
            if(ratingAverageScore>=3.5 && ratingAverageScore<=3.9){
                ratingStar = "Star 3.5";          
            }
            if(ratingAverageScore>=4 && ratingAverageScore<=4.4){
                ratingStar = "Star 4";           
            }
            if(ratingAverageScore>=4.5 && ratingAverageScore<=4.9){
                ratingStar = "Star 4.5";           
            }
            if(ratingAverageScore>=5){ 
                ratingStar = "Star 5";       
            }

            switch(ratingStar) {  
                case "Star 0.5":  
                    $(ratingElement).find('.yotpo-icon:lt(1)').removeClass("yotpo-icon-empty-star").addClass("yotpo-icon-star");    
                    break;
                case "Star 1":
                    text = "Banana is good!";
                    break;
                case "Star 2":
                    text = "I am not a fan of orange.";
                    break;
                case "Star 3":
                    text = "How you like them apples?";
                    break;
                case "Star 4":
                    text = "How you like them apples?";
                    break;
                case "Star 5":
                    console.log("star 5");   
                    $(ratingElement).find('.yotpo-icon').removeClass("yotpo-icon-empty-star").addClass("yotpo-icon-star"); 
                    break;
                default:
                    text = "I have never heard of that fruit...";
            }

        }).done(function() { 
      
        }).fail(function() {
            $(ratingElement).html(yotpoStars);    
        });
    });

}); 