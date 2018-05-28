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
    "modules/page-header/global-cart"], function ($, _, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, RVIModel, HyprLiveContext, api, GlobalCart) {

    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail',
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"
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
        }
    });

    RVIModel.renderRVI('#rvi-container');

    $(document).ready(function () {

        var product = ProductModels.Product.fromCurrent();
        var currentProductCode = product.attributes.productCode;
        $.each(product.attributes.categories, function( index, value ) {
            var currentCategoryCode = value.categoryId;
            $.each(product.attributes.properties, function( index, value ) {
                
                        var preUrl;
                        var hostname = window.location.hostname;
                        var flag1 = false;
                        var flag2 = false;
                        var nxtUrl;
                        api.request("GET", "/api/commerce/catalog/storefront/products/?filter=categoryId eq "+currentCategoryCode+"").then(function(body){
                            //console.log("Category Dataiiiii "+JSON.stringify(body));

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
                            // console.log("hello "+preUrl);
                            if(!_.isUndefined(preUrl)){
                            $("#prev-url").attr("href", preUrl);
                           }
                           if(!_.isUndefined(nxtUrl)){
                            $("#next-url").attr("href", nxtUrl);
                            }
                        });
                    });
                });

        product.on('addedtocart', function (cartitem) {
            if (cartitem && cartitem.prop('id')) {
                //product.isLoading(true);
                CartMonitor.addToCount(product.get('quantity'));
                $('html,body').animate({
                    scrollTop: $('header').offset().top
                }, 1000);
                GlobalCart.update();
                product.set('quantity', 1);
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
