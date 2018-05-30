define([
    'modules/backbone-mozu',
    'underscore',
    'modules/jquery-mozu',
    'modules/models-cart',
    'modules/cart-monitor',
    'hyprlivecontext',
    'hyprlive',
    'modules/preserve-element-through-render',
    'modules/models-checkout', 
    'modules/api'
], function (Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, CheckoutModels, api) {
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        additionalEvents: {
                /*"change [data-mz-value=usShipping]":"populateShipping",
                "change [data-mz-value=usStates]":"populateShipping"*/
                "change [data-mz-value=usShipping]":"populateDropDowns",
                "change [data-mz-value=usStates]":"populateDropDowns",
                "click [data-mz-qty-minus]": "quantityMinus",
                "click [data-mz-qty-plus]": "quantityPlus"

        },
        initialize: function () {
            var me = this;
           
            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });

            this.listenTo(this.model.get('items'), 'quantityupdatefailed', this.onQuantityUpdateFailed, this);

            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var pageContext = require.mozuData('pagecontext');
            if (visaCheckoutSettings.isEnabled) {
                window.onVisaCheckoutReady = initVisaCheckout;
                require([pageContext.visaCheckoutJavaScriptSdkUrl], initVisaCheckout);
            }
            this.listenTo(this.model, 'sync', this.render);
            var Ships = localStorage.getItem("shippingData");
            var ratesParse = JSON.parse(Ships);
            this.model.set("shippingDetail", ratesParse);
            // console.log("SHippingDetail : "+JSON.stringify(this.model));
            if(localStorage.getItem('selectedShipping') && localStorage.getItem('selectedState')) {
               this.model.set({'selectedShipping': localStorage.getItem('selectedShipping')});
               this.model.set({'selectedState': localStorage.getItem('selectedState')}) ;
            }          
        },
        beforeRender: _.once(function() {
           var cart = this.model;
            var productCode = this.model.get("items").models[0].get('product').get('productCode');
            var shipping = localStorage.getItem("selectedShipping");
            // console.log("Shipping storage : "+shipping);
            if(typeof shipping === 'undefined' || shipping === null) {
                var url = "api/commerce/catalog/storefront/shipping/request-rates";
                api.request("POST", url, {
                    originAddress: {
                        cityOrTown: 'California',
                        isValidated: true,
                        countryCode: 'US',
                        postalOrZipCode: '94945',
                        stateOrProvince: 'CA'
                    },
                    items: [
                          {
                            itemId: productCode,
                            quantity: 1,
                            shipsByItself: true,
                            unitMeasurements: {
                                girth: 2.3,
                                height: {
                                   unit: 'in',
                                   value: 50.0
                                },
                                length: {
                                   unit: 'in',
                                   value: 12.0
                                },
                                weight: {
                                   unit: 'oz',
                                   value: 12.0
                                },
                                width: {
                                   unit: 'in',
                                   value: 12.0
                                }
                             }
                        }
                    ],
                    destinationAddress: {
                          cityOrTown: 'Florida',
                          countryCode: 'US',
                          isValidated: true,
                          postalOrZipCode: "32007",
                          stateOrProvince: "FL"
                    }
                    
                }).then(function (response){
                   console.log("RESPONSE : "+JSON.stringify(response.rates[0]));
                   _.defer(function() {
                        var shippingRates = response.rates[0].shippingRates;
                    localStorage.setItem("shippingData", JSON.stringify(shippingRates));
                    var Ships = localStorage.getItem("shippingData");
                    var ratesParse = JSON.parse(Ships);
                    cart.set("shippingDetail", ratesParse);

                    
                    // console.log("Mode : "+cart.selectedShipping);
                    var shipping = cart.selectedShipping;
                    if(typeof shipping !== 'undefined') {
                        var shippingDetailObj = cart.get("shippingDetail");
                        var selectedShipping = cart.get("selectedShipping");
                        var selectedMethod = _.find(shippingDetailObj, function(obj) {
                          if(obj.content.name === selectedShipping){ 
                              return obj;
                            }
                        });

                        var selectedMethodAmount = selectedMethod.amount;
                        // var cart = this.model;
                        // var tot = cart.get('shippingTotal');
                        cart.set({'shippingTotal': selectedMethodAmount});
                        var tot = cart.get('shippingTotal');
                        var total = cart.get('discountedTotal');
                        // console.log("tot : "+tot + ": "+total);
                        var newTotal = Number(tot)+Number(total);
                        // console.log("TOTAL :  ::  "+newTotal);
                        cart.set({'total':newTotal});
                    }
                    
                   });
                   
                });
            } else {
                // this.render();
                // console.log("ELSE");
                var shippingDetailObj = this.model.get("shippingDetail");
                var selectedShipping = this.model.get("selectedShipping");
                var selectedMethod = _.find(shippingDetailObj, function(obj) {
                  if(obj.content.name === selectedShipping){ 
                      return obj;
                    }
                });
                var selectedMethodAmount = selectedMethod.amount;
                cart = this.model;
                // var tot = cart.get('shippingTotal');
                cart.set({'shippingTotal': selectedMethodAmount});
                var tot = cart.get('shippingTotal');
                var total = cart.get('discountedTotal');
                // console.log("tot : "+tot + ": "+total);
                var newTotal = Number(tot)+Number(total);
                // console.log("TOTAL :  ::  "+newTotal);
                cart.set({'total':newTotal});
                
            }
        }),
        render: function() {
            // console.log("render");
            if(this.model.get("items").length!==0){
                this.beforeRender(); 
            }
                
                        
            CartMonitor.update();
          
            preserveElement(this, ['.v-button'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
        },
        getShippingMethodsDetail: function() {
           /* console.log("DATA");
            var responseData = '';*/
        },
        populateDropDowns: function() {
            // console.log("populateDropDowns : ");
            var cart = this.model;
            var stateSel = $('#usStates :selected').val();
            var shippingSel = $('#shippingOption :selected').val();
            // console.log("Seleyed : "+shippingSel);
            if(typeof shippingSel === 'undefined') {
                var shippingDetailObj = cart.get("shippingDetail");
                var defaultShippingMethod = shippingDetailObj[0].content.name;
                
                // console.log("detail : "+JSON.stringify(shippingDetailObj[0].amount));
                localStorage.setItem('selectedState',stateSel);    
                localStorage.setItem('selectedShipping',defaultShippingMethod);
            } else {
                localStorage.setItem('selectedState',stateSel);    
                localStorage.setItem('selectedShipping',shippingSel);
            }

            if(localStorage.getItem('selectedShipping') || localStorage.getItem('selectedState')) {
               this.model.set({'selectedShipping': localStorage.getItem('selectedShipping')});
               this.model.set({'selectedState': localStorage.getItem('selectedState')}) ;
            }
            this.populateShipping();
            // console.log("CART : "+JSON.stringify(this.model));
            
            // this.render();

        },
       populateShipping: function(){
                // console.log("Populate Shipping"+JSON.stringify(this.model));
                var stateSel = $('#usStates :selected').val();
                var shippingSel = $('#shippingOption :selected').val();
                var shippingAmount = $('#shippingOption :selected').attr("price");
                if(typeof shippingSel === 'undefined') {
                    var shippingDetailObj = this.model.get("shippingDetail");
                    var selectedShipping = this.model.get("selectedShipping");
                    var selectedMethod = _.find(shippingDetailObj, function(obj) {
                      if(obj.content.name === selectedShipping){ 
                          shippingAmount = obj.amount;

                        }
                    });
                }
                // console.log("Shipping Selected : "+shippingAmount);
                // var elm = e.target;
                // var cartModel = CartModels.Cart.fromCurrent();
                var cart = this.model;
                var tax = 15;
                
                var tot = cart.get('shippingTotal');
                cart.set({'shippingTotal': shippingAmount});
                tot = cart.get('shippingTotal');
                var total = cart.get('discountedTotal');
                var newTotal = Number(tot)+Number(total);
                // console.log("TOTAL :  ::  "+newTotal);
                cart.set({'total':newTotal});
                this.render();
                
                
        },     
        // updateQuantity: _.debounce(function (e) {
        //     var $qField = $(e.currentTarget),
        //         newQuantity = parseInt($qField.val(), 10),
        //         id = $qField.data('mz-cart-item'),
        //         item = this.model.get("items").get(id);
        //         console.log($qField);
        //         this._isSyncing = true;
        //     if (item && !isNaN(newQuantity)) {
        //         item.set('quantity', newQuantity);
        //         item.saveQuantity();
                
        //     }
        // },400),
        quantityMinus: _.debounce(function (e) {
          
            var $qField = $(e.currentTarget).parent(".qty-block"); 
            var qFieldValue = $qField.find(".mz-carttable-qty-field").val();        
            var _qtyCountObj = $qField.find(".mz-carttable-qty-field");  
            var value = parseInt(qFieldValue, 10);   
            value--;
            _qtyCountObj.val(value); 
            e.stopImmediatePropagation();
             var newQuantity = parseInt( value, 10);
             var id = _qtyCountObj.data('mz-cart-item');
             var item = this.model.get("items").get(id);
             this._isSyncing = true;
            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
                
            }     
           
        },400),
        quantityPlus:  _.debounce(function (e) {
            var $qField = $(e.currentTarget).parent(".qty-block"); 
            var qFieldValue = $qField.find(".mz-carttable-qty-field").val();            
            var _qtyCountObj = $qField.find(".mz-carttable-qty-field");  
            var value = parseInt(qFieldValue, 10);   
            value++;
            _qtyCountObj.val(value);  
            e.stopImmediatePropagation();
            var newQuantity = parseInt(value, 10);
            var id = _qtyCountObj.data('mz-cart-item');
            var item = this.model.get("items").get(id);
            this._isSyncing = true;
            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
                
            }         
           
    },400),
        onQuantityUpdateFailed: function(model, oldQuantity) {
            var field = this.$('[data-mz-cart-item=' + model.get('id') + ']');
            if (field) {
                field.val(oldQuantity);
            }
            else {
                this.render();
            }
        },
        removeItem: function(e) {
            if(require.mozuData('pagecontext').isEditMode) {
                // 65954
                // Prevents removal of test product while in editmode
                // on the cart template
               
                return false;
            }
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.removeItem(id);
            this.render();
            return false;
        },
        empty: function() {
            this.model.apiDel().then(function() {
                window.location.reload();
            });
        },
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            // this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        addCoupon: function () {
            var self = this;
            this.model.addCoupon().ensure(function () {
                self.model.unset('couponCode');
                self.render();
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    /* begin visa checkout */
    function initVisaCheckout (model, subtotal) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            subtotal = model.get('subtotal');
            delay = 0;


            if (!window.V) {
                //console.warn( 'visa checkout has not been initilized properly');
                return false;
            }
            // on success, attach the encoded payment data to the window
            // then turn the cart into an order and advance to checkout
            window.V.on("payment.success", function(payment) {
                // payment here is an object, not a string. we'll stringify it later
                var $form = $('#cartform');
                
                _.each({

                    digitalWalletData: JSON.stringify(payment),
                    digitalWalletType: "VisaCheckout"

                }, function(value, key) {
                    
                    $form.append($('<input />', {
                        type: 'hidden',
                        name: key,
                        value: value
                    }));

                });

                $form.submit();

            });

        }

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(window.V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                subtotal: "" + subtotal
            }
        });
    }
    /* end visa checkout */

        /*var checkoutData = CheckoutModels.CheckoutPage;
        alert("CHECKOUT DATA : "+JSON.stringify(checkoutData));*/
        var cartModel = CartModels.Cart.fromCurrent();
        
            var cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                })
            };
        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + '/checkout/' + order.prop('id');
        });

        cartModel.on('sync', function() {
            
            CartMonitor.setCount(cartModel.count());
        });

        window.cartView = cartViews;
        
        CartMonitor.setCount(cartModel.count());
        // if(window.location.pathname=="/cart"){
           
        //         var length=cartModel.attributes.changeMessages.length;
        //         if(length>0){
        //             var productcode=cartModel.attributes.changeMessages[length-1].metadata[0].productCode;
        //             var id='#'+productcode;
        //             $(id).prependTo(".mz-carttable-items");
        //         }
              
        // }

    return CartView;
    
});
