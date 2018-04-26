/*jshint undef: true */
/*global YT */
require(['modules/jquery-mozu', 'underscore', 'modules/api', 'modules/backbone-mozu', 'bxslider'],
function ($, _, api, Backbone, bxSlider) {
    $(document).ready(function(){
        $('#mz-home-slider .slider').bxSlider({
            auto: false,
            useCSS: false,
            speed: 1000,  
            minSlides: 1,
            maxSlides: 1,
            moveSlides: 1,
            slideMargin: 0,
            infiniteLoop: false,
            pager: true,
            hideControlOnEnd: true,
            touchEnabled: true,
            onSliderLoad: function() {
                $(".slider").css("visibility", "visible");
            }
        });
    });
});