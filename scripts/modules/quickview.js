require([
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/models-product",
    "modules/views-productimages", 
    "hyprlivecontext"
], function ( $, _, Hypr, Backbone, CartMonitor, ProductModel, ProductImageViews, HyprLiveContext) {

    var QuickView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-quick-view',
        autoUpdate: ['quantity'],
        additionalEvents: {
            "click .qvButton": 'buttonClicked'/*,
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "keyup input[data-mz-value='quantity']": "onQuantityChange"*/
        },
        updateProduct: function (e){
            var productCode = $(e.currentTarget).data("productcode"),
                _parent = this,
                product;
            this.model = new ProductModel.Product({
                productCode: productCode
            });
            this.model.apiGet().then(function(){
                console.log("Got the product");
                _parent.model.set("show", true);

                //Quickview added to cart
                _parent.model.on('addedtocart', function (cartitem) {
                    if (cartitem && cartitem.prop('id')) {
                        _parent.model.isLoading(true);
                        CartMonitor.addToCount(product.get('quantity'));
                        //window.location.href = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/cart";
                        _parent.exit();
                    } else {
                        _parent.trigger("error", { message: Hypr.getLabel('unexpectedError') });
                    }
                });
                _parent.model.on("optionUpdated", function(){
                    _parent.render();
                });
                _parent.render();

            }, function(err){
                console.log(err);
            });
            return false;
        },
        exit: function(){
            this.model.set("show", false);
            this.render();
        },
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
        },
        /*onOptionChange: function (e) {
            this.model.isLoading(true);
            this.render();
            return this.configure($(e.currentTarget));
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
              newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        },500),*/
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
            this.model.isLoading(true);
            this.render();
            this.model.isLoading(false);
            this.model.addToCart();
        },
        addToWishlist: function () {
            this.model.addToWishlist();
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
/*
    return {
        View: QuickView
    };*/

    $(document).ready(function () {

        // Quickview Stuff
        var product = new ProductModel.Product();

        // Making Backbone View
        var quickView = new QuickView({
            el: $("#quickViewModal"),
            model: product
        });

        // Binding click to Quick View Button to load popup modal
        $("body").on("click", ".qvButton", function(event){
            alert("button clicked");
            quickView.updateProduct(event);
        });

        window.quickView = quickView;

    });

});
