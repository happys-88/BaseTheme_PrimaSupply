require(["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/cart-monitor", 
    "modules/models-product", 
    "modules/views-productimages", 
    "modules/product/recently-viewed-products", 
    "hyprlivecontext",
    "modules/api",
    "modules/page-header/global-cart" 
], function ($, _, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, RVIModel, HyprLiveContext, api, GlobalCart) {

    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail',
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange",
            "click [data-mz-qty=minus]": "quantityMinus",
            "click [data-mz-qty=plus]": "quantityPlus"
        },
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
              newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        },500),
        quantityMinus: _.debounce(function () {
            var _qtyCountObj = $('.mz-productdetail-qty');
            var value = parseInt(_qtyCountObj.val(), 10);
            if (value == 1) {
                return;
            }
            value--;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);
        },500),
        quantityPlus: _.debounce(function () {
            var _qtyCountObj = $('.mz-productdetail-qty');
            var value = parseInt(_qtyCountObj.val(), 10);
            value++;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);      
        },500),
        configure: function ($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').get(id);
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: function () {
            this.model.addToCart();
            this.model.on('addedtocart', function (cartitem) {
                $('.mz-errors').remove();
            });
            this.model.on('addedtocarterror', function (error) {
                if (error.message.indexOf('Validation Error: The following items have limited quantity or are out of stock') > -1) {
                    $('.mz-errors').find('.mz-message-item').html(Hypr.getLabel('outOfStockError'));
                } else if(error.message.indexOf('Missing or invalid parameter: variationProductCode Product is configurable. Variation code must be specified') > -1) {
                    $('.mz-errors').find('.mz-message-item').html(Hypr.getLabel('variationError'));
                }
            });
        },
        addToWishlist: function () {
            this.model.addToWishlist();
        },
        checkLocalStores: function (e) {
            var me = this;
            e.preventDefault();
            this.model.whenReady(function () {
                var $localStoresForm = $(e.currentTarget).parents('[data-mz-localstoresform]'),
                    $input = $localStoresForm.find('[data-mz-localstoresform-input]');
                if ($input.length > 0) {
                    $input.val(JSON.stringify(me.model.toJSON()));
                    $localStoresForm[0].submit();
                }
            });

        },
        initialize: function () {
            // handle preset selects, etc
            var me = this;
            this.$('[data-mz-product-option]').each(function () {
                var $this = $(this), isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });
            var options = JSON.parse(JSON.stringify(this.model.get('options')));
            var count = 0;
            count = parseInt(count, 10);
            for (var j = 0; j < options.length; j++) {
                var option = options[j];
                if (option.attributeFQN == "tenant~size" || option.attributeFQN == "tenant~color" || option.attributeDetail.dataType == "ProductCode") {
                    count++;
                } 
            }
            if (count == options.length) {
                this.model.set('showColorIcon', true);
            }
            var productModel = this.model;
            api.request("GET", "/api/commerce/carts/current/items").then(function(response) {
                var items = response.items;
                productModel.set('viewOnCart', true);
                for (var k = 0; k < items.length; k++) {
                    var item = items[k];
                    if (item.product.productCode == productModel.get('productCode')) {
                        productModel.set('viewOnCart', false);
                        me.render();
                        break;
                    }
                }
            });
        }
    });

    RVIModel.renderRVI('#rvi-container');

    $(document).ready(function () {

        var product = ProductModels.Product.fromCurrent();
        var currentProductCode = product.attributes.productCode;
        if(typeof product.attributes.categories !== "undefined"){
            $.each(product.attributes.categories, function( index, value ) {
            var currentCategoryCode = value.categoryId;
            $.each(product.attributes.properties, function( index, value ) {
                
                        var preUrl;
                        var hostname = window.location.hostname;
                        var flag1 = false;
                        var flag2 = false;
                        var nxtUrl;
                        api.request("GET", "/api/commerce/catalog/storefront/products/?filter=categoryId eq "+currentCategoryCode+"").then(function(body){
                            
                            $.each(body.items, function(index, item){
                                var productCode = item.productCode;
                                var seoFriendlyUrl = item.content.seoFriendlyUrl;
                                if(currentProductCode === productCode){
                                    flag1 = true;
                                }
                                else{
                                    if(!flag1){
                                        preUrl = "http://"+hostname+"/"+seoFriendlyUrl+"/p/"+productCode+"";
                                    }
                                    else{
                                        if(!flag2){
                                            nxtUrl = "http://"+hostname+"/"+seoFriendlyUrl+"/p/"+productCode+"";
                                            flag2 = true;
                                            return false;
                                        } 
                                    }
                                }
                            }); 
                            
                            if(!_.isUndefined(preUrl)){
                                $("#prev-url").attr("href", preUrl).removeClass("is-disabled");
                            } 
                            else{
                                $("#prev-url").addClass("is-disabled");
                            }
                            if(!_.isUndefined(nxtUrl)){
                                $("#next-url").attr("href", nxtUrl).removeClass("is-disabled");  
                            }
                            else{
                                $("#next-url").addClass("is-disabled");  
                            }
                        });
                    });
                });
        }
       
        $(document).on('click','[name=Color]', function(event){  
          
            var $thisElem = $(event.currentTarget);
            event.stopImmediatePropagation();
            var colorcode = $thisElem.attr("data-mz-option");
            var productcode = product.get("productCode");
            var sitecontext = HyprLiveContext.locals.siteContext;
            var cdn = sitecontext.cdnPrefix;
            var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
            var imagefilepath = cdn + '/cms/' + siteID + '/files/' + productcode + '_' + colorcode +'_v1'+'.jpg';
            product.get("mainImage").imageUrl=imagefilepath;
            product.get("mainImage").src=imagefilepath;
            product.get("content").get("productImages")[0].imageUrl=imagefilepath;
            product.get("content").get("productImages")[0].src=imagefilepath;
       
        });  
       
        product.on('addedtocart', function (cartitem) {
            if (cartitem && cartitem.prop('id')) {
                //product.isLoading(true);
                CartMonitor.addToCount(product.get('quantity'));
                $('html,body').animate({
                    scrollTop: $('header').offset().top
                }, 1000);
                GlobalCart.update();
                //product.set('quantity', 1);
                $("#global-cart").show().delay(3000).hide(0,function() { 
                    $(this).css("display", "");
                  });
                //window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/cart"; 
            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            }
        });

        product.on('addedtowishlist', function (cartitem) {
            $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
        });

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        window.productView = productView;

        productView.render();

    });

});
