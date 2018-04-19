define([
    'modules/jquery-mozu',
    'underscore',
    'modules/api',
    'modules/backbone-mozu',
    'hyprlivecontext',
    'bxslider',
    'sdk'
], function($, _, api, Backbone, HyprLiveContext, bxslider, sdk) {
    var sitecontext = HyprLiveContext.locals.siteContext,
        cdn = sitecontext.cdnPrefix,
        siteID = cdn.substring(cdn.lastIndexOf('-') + 1),
        imagefilepath = cdn + '/cms/' + siteID + '/files',
        pageContext = require.mozuData('pagecontext'),
        rviEnable = HyprLiveContext.locals.themeSettings.rviEnable,
        rviNumberCookie = parseInt(HyprLiveContext.locals.themeSettings.rviNumberCookie, 10),
        rviExpirationDuration = parseInt(HyprLiveContext.locals.themeSettings.rviExpirationDuration, 10)||1,
        rviDuration = parseInt(rviExpirationDuration, 10)*24*60*60*1000,
        cookieName = 'recentProducts',
        cookieValue = [];

        //Product List Item View
        var ProductListItemView = Backbone.MozuView.extend({
            tagName: 'li',
            className: 'mz-recentproductlist-item',
            templateName: 'modules/product/recent/recent-products',
            initialize: function() {
                var self = this;
                self.listenTo(self.model, 'change', self.render);
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this);
                return this;
            }
        });

        var Model = Backbone.MozuModel.extend();

        function getProductCodeFromUrl() {
            return require.mozuData('pagecontext').productCode||null;
        }

        function validateAndAddProduct(productCode) {
            var thisTime = new Date();
            for(var i=0;i<cookieValue.length;i++) {
                var currentVal = cookieValue[i];
                if (currentVal.pCode == productCode) {
                    deleteProduct(productCode);
                    break;
                }
            }
            cookieValue.unshift({"pCode": productCode, "last": thisTime.getTime()});
            if(cookieValue.length > rviNumberCookie ) {
                cookieValue = cookieValue.slice(0, rviNumberCookie + 1);
            }
            $.cookie(cookieName, JSON.stringify(cookieValue), {expires: rviExpirationDuration, path: '/'});
        }

        function getCurrentProducts() {
            var products = [];
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].last + rviDuration > (new Date()).getTime() && cookieValue[i].pCode != require.mozuData('pagecontext').productCode) {
                    products.push(cookieValue[i].pCode);
                }
            }
            return products;
        }

        function addProduct() {
            var productCode = getProductCodeFromUrl();
            if(productCode) {
                validateAndAddProduct(productCode);
            }
        }

        function showLoader() {
            $(".rvi-loading").show();
        }

        function hideLoader() {
            $(".rvi-loading").hide();
        }

        function renderRVI(container) {
            if (!container) {
                container = '#rvi-auto';
            }
            if($.cookie(cookieName)) {
                try{
                    cookieValue = JSON.parse($.cookie(cookieName));
                }
                catch(e) {
                    cookieValue = [];
                }
            }
            addProduct();
            if ($(container).length > 0) {
                var filter = getCurrentProducts().join(" or productCode+eq+");
                if (filter !== "" && filter !== " or ") {
                    showLoader();
                    var serviceurl = sdk.getServiceUrls().searchService + 'search/?startIndex=0&pageSize='+rviNumberCookie+'&filter=productCode+eq+'+filter;
                    api.request('GET', serviceurl).then(function(productslist){
                        var orderedProductList = [];
                        for(var i = 0;i<cookieValue.length;i++) {
                            var productAvailable = _.findWhere(productslist.items, {productCode: cookieValue[i].pCode});
                            if (productAvailable) {
                                orderedProductList.push(productAvailable);
                                continue;
                            }
                        }
                        if(orderedProductList.length > 0) {
                            $(container).removeClass('hide').append('<div class="col-xs-12"><ul class="recently-viewed-list"></ul></div><div class="clearfix"></div>');
                            for(var p=0;p<orderedProductList.length;p++) {
                                var view = new ProductListItemView({ model: new Model(orderedProductList[p]) });
                                var renderedView = view.render().el;
                                $(container + ' .recently-viewed-list').append(renderedView);
                            }
                            if(orderedProductList.length > 1){
                                $(container + ' .recently-viewed-list').bxSlider({
                                    minSlides: 2,
                                    maxSlides: 7,
                                    slideWidth: 160,
                                    slideMargin: 15,
                                    nextText:'<i class="fa fa-angle-right" aria-hidden="true"></i>',
                                    prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                                    responsive: true,
                                    pager: false,
                                    speed: 0,
                                    infiniteLoop: false,
                                    hideControlOnEnd: true
                                });
                            }
                        }
                        hideLoader();
                    }, function(){
                        hideLoader();
                    });    
                }
            }
        }

        function deleteProduct(product) {
            var isExist = false;
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].pCode == product) {
                    cookieValue.splice(i, 1);
                    isExist = true;
                    break;
                }
            }
            if(isExist) {
                deleteProduct(product);
            }
            else {
                $.cookie(cookieName, JSON.stringify(cookieValue), {expires: rviExpirationDuration, path: '/'});
            }
        }

        function getSize() {
            var size = 0;
            for(var i=0;i<cookieValue.length;i++) {
                if(cookieValue[i].last + rviDuration > (new Date()).getTime()) {
                    size++;
                }
            }
            return size;
        }

    return {
        addProduct: addProduct,
        deleteProduct: deleteProduct,
        renderRVI: renderRVI,
        getSize: getSize
    };
});
