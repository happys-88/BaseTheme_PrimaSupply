define(['modules/jquery-mozu', 'underscore', "modules/backbone-mozu", 'hyprlive', "elevatezoom", "bxslider","modules/api", "modules/models-product" ], function ($, _, Backbone, Hypr, elevatezoom, bxslider, api, ProductModel) {

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'click [data-mz-productimage-thumb]': 'switchImage',
            'click .mz-productimages-thumbs a img': 'elevatezoom'
            
        },
        //.mz-productimages-thumbimage
        initialize: function () {
            this.corousel();
            var zoomConfig = { zoomType: "inner", cursor: "crosshair", zoomWindowFadeIn: 300, zoomWindowFadeOut: 300 };
            var zoomImage = $('.mz-productimages-mainimage');
            zoomImage.elevateZoom(zoomConfig);
            // preload images
            var imageCache = this.imageCache = {},
                cacheKey = Hypr.engine.options.locals.siteContext.generalSettings.cdnCacheBustKey;
            _.each(this.model.get('content').get('productImages'), function (img) {
                var i = new Image();
                i.src = img.imageUrl + '?max=' + Hypr.getThemeSetting('productImagesContainerWidth') + '&_mzCb=' + cacheKey;
                if (img.altText) {
                    i.alt = img.altText;
                }
                imageCache[img.sequence.toString()] = i;
            });
        },
        elevatezoom: function (event) {
            var zoomConfig = { zoomType: "inner", cursor: "crosshair", zoomWindowFadeIn: 600, zoomWindowFadeOut: 600 };       
            var zoomImage = $('.mz-productimages-mainimage');    
            var image = $('.mz-productimages-thumbs a img');
            zoomImage.elevateZoom(zoomConfig);
            var elm=$(event.currentTarget);
            $('.zoomContainer').remove();
            zoomImage.removeData('elevateZoom'); 
            zoomImage.data('zoom-image', elm.data('zoom-image'));
            zoomImage.elevateZoom(zoomConfig);
          },
          corousel: function () {
            $('.bxslider').bxSlider({ 
                minSlides: 1,
                maxSlides: 1,
                //slideWidth: 600,
                //slideMargin: 10,
                auto: false,
                pager:false,
                useCSS: false,
                onSliderLoad: function() {
                   // $("#product-detail-slider").css("visibility", "visible");
                }
              });  
          },
        switchImage: function (e) {
            var $thumb = $(e.currentTarget);
            this.selectedImageIx = $thumb.data('mz-productimage-thumb');
            this.updateMainImage();
            return false;
        },
        updateMainImage: function () {
            if (this.imageCache[this.selectedImageIx]) {
                this.$('[data-mz-productimage-main]')
                    .prop('src', this.imageCache[this.selectedImageIx].src)
                    .prop('alt', this.imageCache[this.selectedImageIx].alt);
            }
        },

        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.updateMainImage();
            this.corousel();
        }
    });
    return {
        ProductPageImagesView: ProductPageImagesView
    };

});