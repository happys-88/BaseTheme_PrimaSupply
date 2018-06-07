define([
    'modules/jquery-mozu',
    'underscore',
    'modules/api',
    'modules/backbone-mozu',
    'hyprlivecontext',
    'modules/models-product',
    'bxslider',
    "pages/cart",
    "modules/models-cart",
    "modules/page-header/global-cart",
    "modules/cart-monitor",
    "hyprlive"

], function($, _, api, Backbone, HyprLiveContext, ProductModels, bxslider, cart, cartModel, GlobalCart, CartMonitor, Hypr) {
console.log("quicknew");
$(document).on('click', '.mz-quick-view', function (event) {
    var $Elem = $(event.currentTarget);
    var prdCode = $Elem.attr("data-mz-productcode-quickview");
    api.request("GET", "/api/commerce/catalog/storefront/products/" + prdCode).then(function (body) {
        var quickview = Backbone.MozuView.extend({
            templateName: 'modules/product/quickview',
            additionalEvents: {
                'click .addtocart': 'AddToCart',
                "click [data-mz-product-option='tenant~color']": "colorswatch",
                "change [data-mz-value='quantity']": "onQuantityChange",
                "change .mz-productoptions-option": "onOptionChange",
                "click [data-mz-qty-minus]": "quantityMinus",
                "click [data-mz-qty-plus]": "quantityPlus",
                "click .bx-controls-direction a":"clickOnNextOrprevious",
                "keyup [id=qty-field]":"updateqtyManual",

            },
            initialize: function() {
              // console.log("initialze call");
               
               // console.log(this.model());
            
             
            if(typeof this.model.get('variations') !== "undefined" ){
                
               var variations = this.model.get('variations');
                            var sum = 0;
                             
                            if(variations.length !== 0)
                            { 
                                var stockArray = [];
                                    
                                for(var i=0; i<variations.length; i++)
                                {
                                    stockArray.push(variations[i].inventoryInfo.onlineStockAvailable);
                                    sum += variations[i].inventoryInfo.onlineStockAvailable;
                                }
                                this.model.set({'totalCount': sum});
                                var inStock =_.contains(stockArray, 0);
                                this.model.set({'containsZero': inStock});
                                   
                            }                    

             }
            else{
                    this.model.set({'totalCount': this.model.attributes.inventoryInfo.onlineStockAvailable});
                                   
                }
                       
            },
            render: function () {
                Backbone.MozuView.prototype.render.call(this);
                this.corousel();
                return this;
            },
            corousel: function () {
                $('#quick-slider').bxSlider({
                    minSlides: 1,
                    maxSlides: 1,
                    slideWidth: 600
                });

            },
            onQuantityChange: _.debounce(function (e) {
                var $qField = $(e.currentTarget),
                    newQuantity = parseInt($qField.val(), 10);
                if (!isNaN(newQuantity)) {
                    this.model.updateQuantity(newQuantity);
                }
            }, 500),
            onOptionChange: function (e) {           
                return this.configure($(e.currentTarget));

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

                if(typeof this.model.get('productCode') !== 'undefined') {
                    //Set url value here
                    if(id !="tenant~color"){
                        this.model.set({
                            "dataurl": null
                        });
                    }
                }
            },
            updateqtyManual: function () {
                if(typeof this.model.get('productCode') !== 'undefined') {
                    var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                        _qtyCountObj = $('.mz-productdetail-qty');
                    _qtyObj.text('');
                    var value = parseInt(_qtyCountObj.val(), 10);
                    if (isNaN(value)) {
                        $(".mz-productdetail-addtocart").addClass("is-disabled");
                    }
                    if (value === 0) {
                        _qtyObj.text("Quantity can't be zero.");
                        return;
                    }
                    if (typeof this.model.attributes.inventoryInfo.onlineStockAvailable !== 'undefined' && this.model.attributes.inventoryInfo.onlineStockAvailable < value) {

                        $(".mz-productdetail-addtocart").addClass("is-disabled");
                        
                        if (this.model.attributes.inventoryInfo.onlineStockAvailable > 0){
                            $('[data-mz-validationmessage-for="quantity"]').text("*Only " + this.model.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
                        }
                           
                    }else{
                            if (!isNaN(value)) {
                            this.model.updateQuantity(value);
                            $(".mz-productdetail-addtocart").removeClass("is-disabled");
                        }

                   }
                }
                   
               
            },
            quantityMinus: function () {
                if(typeof this.model.get('productCode') !== 'undefined') {
                var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                    _qtyCountObj = $('.mz-productdetail-qty');
                _qtyObj.text('');

                var value = parseInt(_qtyCountObj.val(), 10);

                if (value == 1) {
                    _qtyObj.text("Quantity can't be zero.");
                    return;
                }
                value--;

                this.model.updateQuantity(value);
                _qtyCountObj.val(value);
                if (typeof this.model.attributes.inventoryInfo.onlineStockAvailable !== 'undefined') {
                    if (this.model.attributes.inventoryInfo.onlineStockAvailable >= value)
                        $(".mz-productdetail-addtocart").removeClass("is-disabled");
                    if (this.model.attributes.inventoryInfo.onlineStockAvailable < value && this.model.attributes.inventoryInfo.onlineStockAvailable > 0)
                        $('[data-mz-validationmessage-for="quantity"]').text("*Only " + this.model.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
                }
              }
            },
            quantityPlus: function () {
                if(typeof this.model.get('productCode') !== 'undefined'){
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
                if (typeof this.model.attributes.inventoryInfo.onlineStockAvailable !== 'undefined' && this.model.attributes.inventoryInfo.onlineStockAvailable < value) {
                    $(".mz-productdetail-addtocart").addClass("is-disabled");
                    if (this.model.attributes.inventoryInfo.onlineStockAvailable > 0)
                        $('[data-mz-validationmessage-for="quantity"]').text("*Only " + this.model.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
                }

                }
               
                
            },
            AddToCart: function (event) {
                this.model.addToCart();
            },
            colorswatch: function (event) {
                if(typeof this.model.get('productCode') !== 'undefined') {

                var $thisElem = $(event.currentTarget);
                event.stopImmediatePropagation();
                var colorValue = $thisElem.val();
                var colorcode = $thisElem.attr("data-mz-option");
                var productcode = $thisElem.attr("data-mz-prodduct-code");
                var sitecontext = HyprLiveContext.locals.siteContext;
                var cdn = sitecontext.cdnPrefix;
                var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
                var imagefilepath = cdn + '/cms/' + siteID + '/files/' + productcode + '-' + colorcode + '.jpg';
                
                this.model.set({
                    "dataurl": imagefilepath
                });
              }
            },
            clickOnNextOrprevious: function(){
                if(typeof this.model.get('productCode') !== 'undefined'){
                 $('[src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/No_image_3x4.svg/1024px-No_image_3x4.svg.png"]').parent().remove();
                 if($(".bx-pager-item").length > imagecount){
                    $(".bx-pager-item").eq(2).remove();
                 }
             }
            }
        });
       
        var product = new ProductModels.Product(body);
        var imagecount= product.get("content").get("productImages").length;
        var Quickview = new quickview({
            model: product,
            el: $('#quickViewModal')
        });
        Quickview.render();
    
        this.model.on('addedtocart', function (cartitem) {
            GlobalCart.update();
        });

       
        $('#quickViewModal').on('hidden.bs.modal', function (e) {
            $(".destroy").remove();
            product.clear();
        });
    });

});

});