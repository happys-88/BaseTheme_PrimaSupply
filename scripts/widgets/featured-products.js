require([
    'modules/jquery-mozu',
    'bxslider'
],
function ($, bxSlider) { 
    $(document).ready(function(){
        var eachSlide = $(".mz-featured-products .mz-productlist-list").find(".mz-productlist-item");
        
        //console.log(eachSlide.length); 

        if(eachSlide.length > 6){
            $(".mz-featured-products .mz-productlist-list").bxSlider({
                auto: false,
                speed: 600,  
                minSlides: 6,
                maxSlides: 6,
                slideWidth: 275,
                moveSlides: 1,
                slideMargin: 0,
                infiniteLoop: false,
                controls: false,
                pager: true,
                touchEnabled: true,
                onSliderLoad: function() {
                    $(".slider").css("visibility", "visible"); 
                }
            });       
        }
       
    });
});