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

        // Show Yotpo Ratings 
        var yotpoApiKey = HyprLiveContext.locals.themeSettings.yotpoApiKey;
        var bottomline = HyprLiveContext.locals.themeSettings.bottomline;
        var yotpoBottomlineBaseUrl = HyprLiveContext.locals.themeSettings.yotpoBottomlineBaseUrl;

        $(".mz-productlist-list .mz-productlist-item").each(function() { 
            var currentProduct = $(this);
            var productCode = $(this).find(".mz-productlisting").data("mz-product");
            var ratingURL = ""+yotpoBottomlineBaseUrl+"/"+yotpoApiKey+"/"+productCode+"/"+bottomline+"";
            var ratingElement = $(currentProduct).find("#product-rating").find(".yotpo-stars");   
            var yotpoStars = '<span class="yotpo-icon rating-star yotpo-icon-empty-star"></span><span class="yotpo-icon rating-star yotpo-icon-empty-star"></span><span class="yotpo-icon rating-star yotpo-icon-empty-star"></span><span class="yotpo-icon rating-star yotpo-icon-empty-star"></span><span class="yotpo-icon rating-star yotpo-icon-empty-star"></span>' ;     

            $.get(ratingURL, function(data, status){ 
                var ratingAverageScore = data.response.bottomline.average_score,
                    ratingTotalCount = data.response.bottomline.total_reviews,
                    starRating = ratingAverageScore.toString().split('.'), 
                    decimalNumber = (ratingAverageScore - Math.floor(ratingAverageScore)) !== 0,
                    fullStarsToShow = " ",
                    halfStarsToShow = " " ; 
                
                $(ratingElement).html(yotpoStars);

                if(decimalNumber){ 
                    fullStarsToShow = starRating[0]; 
                    halfStarsToShow = starRating[1]; 
                    $(ratingElement).find('.yotpo-icon:lt('+fullStarsToShow+')').removeClass("yotpo-icon-empty-star").addClass("yotpo-icon-star");
                    if(halfStarsToShow>=5 && halfStarsToShow<=9){ 
                        $(ratingElement).find('.yotpo-icon:eq('+fullStarsToShow+')').removeClass("yotpo-icon-empty-star").addClass("yotpo-icon-half-star");    
                    }   
                 
                } else{ 
                    fullStarsToShow = ratingAverageScore;    
                    $(ratingElement).find('.yotpo-icon:lt('+fullStarsToShow+')').removeClass("yotpo-icon-empty-star").addClass("yotpo-icon-star");       
                }     

            }).done(function() {  
          
            }).fail(function() {
                $(ratingElement).html(yotpoStars);    
            });
        });
    });  
});  