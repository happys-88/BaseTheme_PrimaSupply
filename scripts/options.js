define(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", "modules/api", "modules/models-product", "pages/cart", "modules/models-cart", "pages/product","modules/cart-monitor"], function ($, _, Hypr, Backbone, HyprLiveContext, api, ProductModel, cart, cartModel, product, CartMonitor) {  
    $(document).on("click",".mz-option-add-to-cart", function (event) {
        var $thisElem = $(event.currentTarget);
        var productCode = $thisElem.attr("data-mz-productcode");
        openOptionModalPopup(productCode);
    });

    function openOptionModalPopup(productCode) {

       api.request("GET", "/api/commerce/catalog/storefront/products/"+productCode).then(function(body){
            var product = new ProductModel.Product(body);
            var optionView = new OptionView({
                model: product,
                el: $('#optionModal')
            });
            optionView.render();
            $('#optionModal').on('hidden.bs.modal', function (e) {
                $(".modal-dialog").remove();
                product.clear();    
            });
        }); 
    }

    $(document).on("click",".mz-addon-add-to-cart", function (event) {
        var $thisElem = $(event.currentTarget);
        var productCode = $thisElem.attr("data-mz-productcode");
        openAddonModalPopup(productCode);
    });

    function openAddonModalPopup(productCode){

       api.request("GET", "/api/commerce/catalog/storefront/products/"+productCode).then(function(body){
            var product = new ProductModel.Product(body);
            var addonView = new AddonView({
                model: product,
                el: $('#addonModal')
            });
            addonView.addToCart();
            addonView.render();
            $('#addonModal').on('hidden.bs.modal', function (e) {
                $(".modal-dialog").remove();
                product.clear();    
            });
        }); 
    }

    var OptionView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-options-popup',
        additionalEvents: {
            'click .addtocart': 'addToCart',
            'click .colorswatch': "colorswatch",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "change .mz-productoptions-option": "onOptionChange",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            "click [data-mz-removeItem]":"removeItem",
            "click .addtocartaddon":"addToCartUpdate"
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
        },
        render: function () {
            Backbone.MozuView.prototype.render.call(this);
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
              newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        },500),
        onOptionChange: function (e) {
            var $optionEl = $(e.currentTarget);
            var productCode = $optionEl.val();
            var attributeFQN = $optionEl.data('mz-product-option');
            this.model.set('selected'+attributeFQN,productCode);
            this.configure($(e.currentTarget));
        },
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
        quantityMinus: function() {
            var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                _qtyCountObj = $('.mz-productdetail-qty');
            _qtyObj.text('');
            var value = parseInt(_qtyCountObj.val(), 10);
            if (value == 1) {
                _qtyObj.text("Quantity can't be zero.");
                $('.modal-body').animate({ scrollTop: $('.tab_container')[0].scrollHeight }, 'slow');
                return;
            }
            value--;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);
            if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined') {
                if (product.attributes.inventoryInfo.onlineStockAvailable >= value)
                $(".mz-productdetail-addtocart").removeClass("is-disabled");
                if (product.attributes.inventoryInfo.onlineStockAvailable < value && product.attributes.inventoryInfo.onlineStockAvailable > 0)
                    $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
            }
        },
        quantityPlus: function() {
            var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                _qtyCountObj = $('.mz-productdetail-qty');
            _qtyObj.text('');
            var value = parseInt(_qtyCountObj.val(), 10);
            if (value == 99) {
                _qtyObj.text("Quantity can't be greater than 99.");
                return;
            }
            value++;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);
            if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined' && product.attributes.inventoryInfo.onlineStockAvailable < value) {
                $(".mz-productdetail-addtocart").addClass("is-disabled");
                if (product.attributes.inventoryInfo.onlineStockAvailable > 0)
                    $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
            }
        },
        removeItem: function() {
            if(require.mozuData('pagecontext').isEditMode) {
                return false;
            }
            var totalQuant = this.model.get('totalQuant');
            var newQuant =  this.model.get('quantity');
            totalQuant = parseInt(totalQuant, 10);
            newQuant = parseInt(newQuant, 10);
            var prevQuant = parseInt(totalQuant - newQuant, 10);
            var cartItemId = this.model.get('cartItemId');
            
            var method;
            var url;
            if(prevQuant > 0){
                method = "PUT";
                url = "/api/commerce/carts/current/items/"+cartItemId+"/"+prevQuant;
            } else if(prevQuant === 0){
                method = "DELETE";
                url = "/api/commerce/carts/current/items/"+cartItemId;
            }
            if(method) {
               api.request( method, url ).then(function () {
                    $('#optionModal').modal('hide');
                }); 
            }
        },
        addToCartUpdate: function() {
            if(require.mozuData('pagecontext').isEditMode) {
                return false;
            }
            var me = this.model;
            var cartItemId = this.model.get('cartItemId');
            var totalQuant = this.model.get('totalQuant');
            var newQuant =  this.model.get('quantity');
            totalQuant = parseInt(totalQuant, 10);
            newQuant = parseInt(newQuant, 10);
            var prevQuant = parseInt(totalQuant - newQuant, 10);

            var method;
            var url;
            if(prevQuant > 0){
                method = "PUT";
                url = "/api/commerce/carts/current/items/"+cartItemId+"/"+prevQuant;
            } else if(prevQuant === 0){
                method = "DELETE";
                url = "/api/commerce/carts/current/items/"+cartItemId;
            }

            if(method) {
               api.request( method, url ).then(function () {
                    me.addToCart();
                    setTimeout(function(){
                        window.location = "/cart";
                    },500);
                }); 
            }
        },
        addToCart: function (event) {

            this.model.addToCart();
            this.model.set('addonsPopup', true);
            var optionModel = this.model;
            var me = this;
            this.model.on('addedtocart', function (cartitem) {
                optionModel.set('cartItemId',cartitem.data.id);
                optionModel.set('totalQuant',cartitem.data.quantity);
                optionModel.set('hasAddon', false);
                var options = JSON.parse(JSON.stringify(optionModel.get('options')));
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    if(option.attributeDetail.dataType == 'ProductCode') {
                        optionModel.set('hasAddon', true);
                        break;
                    }
                }
                me.render();
            });
        }
    });
    var AddonView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-addons-popup',
        additionalEvents: {
            'click .addtocart': 'addToCart',
            'click .colorswatch': "colorswatch",
            "change [data-mz-value='quantity']": "onQuantityChange",
            "change .mz-productoptions-option": "onOptionChange",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            "click [data-mz-removeItem]":"removeItem",
            "click .addtocartaddon":"addToCartUpdate"
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
        },
        render: function () {
            Backbone.MozuView.prototype.render.call(this);
        },
        onQuantityChange: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
              newQuantity = parseInt($qField.val(), 10);
            if (!isNaN(newQuantity)) {
                this.model.updateQuantity(newQuantity);
            }
        },500),
        onOptionChange: function (e) {
            this.configure($(e.currentTarget));
        },
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
        quantityMinus: function() {
            var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                _qtyCountObj = $('.mz-productdetail-qty');
            _qtyObj.text('');
            var value = parseInt(_qtyCountObj.val(), 10);
            if (value == 1) {
                _qtyObj.text("Quantity can't be zero.");
                $('.modal-body').animate({ scrollTop: $('.tab_container')[0].scrollHeight }, 'slow');
                return;
            }
            value--;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);
            if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined') {
                if (product.attributes.inventoryInfo.onlineStockAvailable >= value)
                $(".mz-productdetail-addtocart").removeClass("is-disabled");
                if (product.attributes.inventoryInfo.onlineStockAvailable < value && product.attributes.inventoryInfo.onlineStockAvailable > 0)
                    $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
            }
        },
        quantityPlus: function() {
            var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                _qtyCountObj = $('.mz-productdetail-qty');
            _qtyObj.text('');
            var value = parseInt(_qtyCountObj.val(), 10);
            if (value == 99) {
                _qtyObj.text("Quantity can't be greater than 99.");
                return;
            }
            value++;
            this.model.updateQuantity(value);
            _qtyCountObj.val(value);
            if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined' && product.attributes.inventoryInfo.onlineStockAvailable < value) {
                $(".mz-productdetail-addtocart").addClass("is-disabled");
                if (product.attributes.inventoryInfo.onlineStockAvailable > 0)
                    $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
            }
        },
        removeItem: function() {
            if(require.mozuData('pagecontext').isEditMode) {
                return false;
            }
            var totalQuant = this.model.get('totalQuant');
            var newQuant =  this.model.get('quantity');
            totalQuant = parseInt(totalQuant, 10);
            newQuant = parseInt(newQuant, 10);
            var prevQuant = parseInt(totalQuant - newQuant, 10);
            var cartItemId = this.model.get('cartItemId');
            
            var method;
            var url;
            if(prevQuant > 0){
                method = "PUT";
                url = "/api/commerce/carts/current/items/"+cartItemId+"/"+prevQuant;
            } else if(prevQuant === 0){
                method = "DELETE";
                url = "/api/commerce/carts/current/items/"+cartItemId;
            }
            if(method) {
               api.request( method, url ).then(function () {
                    $('#addonModal').modal('hide');
                }); 
            }
        },
        addToCartUpdate: function() {
            if(require.mozuData('pagecontext').isEditMode) {
                return false;
            }
            var me = this.model;
            var cartItemId = this.model.get('cartItemId');
            var totalQuant = this.model.get('totalQuant');
            var newQuant =  this.model.get('quantity');
            totalQuant = parseInt(totalQuant, 10);
            newQuant = parseInt(newQuant, 10);
            var prevQuant = parseInt(totalQuant - newQuant, 10);

            var method;
            var url;
            if(prevQuant > 0){
                method = "PUT";
                url = "/api/commerce/carts/current/items/"+cartItemId+"/"+prevQuant;
            } else if(prevQuant === 0){
                method = "DELETE";
                url = "/api/commerce/carts/current/items/"+cartItemId;
            }

            if(method) {
               api.request( method, url ).then(function () {
                    me.addToCart();
                    setTimeout(function(){
                        window.location = "/cart";
                    },500);
                }); 
            }
        },
        addToCart: function (event) {
            this.model.addToCart();
            this.model.set('addonsPopup', true);
            var optionModel = this.model;
            var me = this;
            this.model.on('addedtocart', function (cartitem) {
                optionModel.set('cartItemId',cartitem.data.id);
                optionModel.set('totalQuant',cartitem.data.quantity);
                optionModel.set('hasAddon', false);
                var options = JSON.parse(JSON.stringify(optionModel.get('options')));
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    if(option.attributeDetail.dataType == 'ProductCode') {
                        optionModel.set('hasAddon', true);
                        break;
                    }
                }
                me.render();
            });
        }
    });
});