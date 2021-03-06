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
    'modules/api',
    'modules/xpressPaypal',
    'modules/block-ui'
], function (Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement, CheckoutModels, api, paypal, blockUiLoader) { 
    var value;
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        additionalEvents: {
                /*"change [data-mz-value=usShipping]":"populateShipping",
                "change [data-mz-value=usStates]":"populateShipping"
                "change [data-mz-value=usShipping]":"populateDropDowns",*/
                "click [data-mz-qty=minus]": "quantityMinus", 
                "click [data-mz-qty=plus]": "quantityPlus",
                "keyup [data-mz-value=quantity]":"updateQuantity",
                "keyup  [data-mz-value='usStates']": "allowDigit"
                /*"click [data-mz-value=callRoute]": "callCustomRoute"*/
        },
        initialize: function () {
            var me = this;
            //setup coupon code text box enter.
            this.listenTo(this.model, "change:taxTotal", this.render);
            this.listenTo(this.model, "change:shippingTotal", this.render);
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
            
            if(localStorage.getItem('selectedShipping') && localStorage.getItem('selectedState')) {
               this.model.set({'selectedShipping': localStorage.getItem('selectedShipping')});
               this.model.set({'selectedState': localStorage.getItem('selectedState')}) ;
            }          
        },
        beforeRender: _.once(function() {
            var cart = this.model;
            var productCode = this.model.get("items").models[0].get('product').get('productCode');
            var shipping = localStorage.getItem("selectedShipping");
            var stateData = this.model.get("selectedState");
            if(this.model.get("selectedState")) {
                stateData = this.model.get("selectedState");
            } else {
                stateData = localStorage.getItem('selectedState');
            }
            
            if(typeof stateData !== 'undefined' && stateData !== null) {
                this.model.set({'selectedState': stateData});
                this.calculateTax(stateData, false, this.model);
            }
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
                   
                   _.defer(function() {
                    var shippingRates = response.rates[0].shippingRates;
                    localStorage.setItem("shippingData", JSON.stringify(shippingRates));
                    var Ships = localStorage.getItem("shippingData");
                    var ratesParse = JSON.parse(Ships);
                    cart.set("shippingDetail", ratesParse);
                    var shipPrice = _.filter(shippingRates, 
                        function(rates) { return (rates.amount === 0);   });
                    if(shipPrice.length > 0) {
                        cart.set('selectedShipping', shipPrice[0].content.name);
                        // cart.set('shippingTotal', shipPrice[0].amount);
                        localStorage.setItem('selectedShipping',shipPrice[0].content.name);
                    } else {
                        cart.set('selectedShipping', shippingRates[0].content.name);
                        // cart.set('shippingTotal', shippingRates[0].amount);
                        localStorage.setItem('selectedShipping',shippingRates[0].content.name);
                    }

                    var shipping = cart.get('selectedShipping');
                    if(typeof shipping !== 'undefined') {
                        var shippingDetailObj = cart.get("shippingDetail");
                        var selectedShipping = cart.get("selectedShipping");
                        var selectedMethod = _.find(shippingDetailObj, function(obj) {
                          if(obj.content.name === selectedShipping){ 
                              return obj;
                            }
                        });

                        var selectedMethodAmount = selectedMethod.amount;
                        // cart.set({'shippingTotal': selectedMethodAmount});
                        var tot = cart.get('shippingTotal');
                        var total = cart.get('discountedTotal');
                        var newTotal = Number(tot)+Number(total);
                    }
                   });
                   
                });
            } else {
                // this.render();
                var shippingDetailObj = this.model.get("shippingDetail");
                var selectedShipping = this.model.get("selectedShipping");

                var selectedMethod = _.find(shippingDetailObj, function(obj) {
                  if(obj.content.name === selectedShipping){ 
                      return obj;
                    }
                });

                if(typeof selectedMethod === 'undefined') {
                    if(shippingDetailObj.length > 1) {
                        selectedMethod = _.find(shippingDetailObj, function(obj) {
                            if(obj.amount === 0){ 
                              return obj;
                            }  
                        });          
                    } else if(shippingDetailObj.length > 0 && shippingDetailObj.length === 1) {
                        selectedMethod = shippingDetailObj[0];
                    }
                }

                var selectedMethodAmount = selectedMethod.amount;
               
                this.model.set({'shippingTotal': selectedMethodAmount});
                var tot = this.model.get('shippingTotal');
                var total = this.model.get('discountedTotal');
                var newTotal = Number(tot)+Number(total);
            }
        }),
        render: function() {
            /*var cartEmpty = this.model.get("isEmpty");
            if(this.$el.context.location.pathname === '/cart' && !cartEmpty && typeof cartEmpty !== "undefined"){
                this.beforeRender(); 
            }*/
            CartMonitor.update();
            preserveElement(this, ['.v-button', '.p-button'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
            //recently added
            var productcod=localStorage.getItem("lastAddedItemToCart");
            var id="#"+productcod;
            $(id).prependTo(".mz-carttable-items-global"); 
            $(id).addClass("recently-added");
        },
        
        allowDigit: function(e) {
            e.stopImmediatePropagation();
            e.target.value = e.target.value.replace(/[^\d]/g, '');
            if(e.target.value.length === 0) {
               $('[data-mz-validation-message="zipCode"]').hide();  
            }
            if(e.target.value.length >= 5)
                $('#zipCodeButton').attr('disabled', false);            
            else
                $('#zipCodeButton').attr('disabled',true);
            
            if (e.which === 13) {
                if(!$('#zipCodeButton').prop('disabled'))
                    $('#zipCodeButton').click();
                return false;
            }
        },
        getShippingMethodsDetail: function() {
           
        },
        populateDropDowns: function(e) {
            e.stopImmediatePropagation();
            
            var stateSel = $('#zip :selected').val();
            var shippingSel = $('#shippingOption :selected').val();
            if(typeof shippingSel === 'undefined') {
                var shippingDetailObj = this.model.get("shippingDetail");
                var defaultShippingMethod = shippingDetailObj[0].content.name;
                localStorage.setItem('selectedShipping',defaultShippingMethod);
            } else {
                localStorage.setItem('selectedShipping',shippingSel);
            }

            if(localStorage.getItem('selectedShipping') || localStorage.getItem('selectedState')) {
               this.model.set({'selectedShipping': localStorage.getItem('selectedShipping')});
               this.model.set({'selectedState': localStorage.getItem('selectedState')}) ;
            }
            this.populateShipping(true);
        
        },
        calculateTax: function(stateSel, bool, cart){
            $('[data-mz-validation-message="zipCode"]').hide();

            if(typeof cart === 'undefined') {
                cart = this.model;
            }
            
            if(typeof stateSel !== 'undefined') {
                localStorage.setItem('selectedState',stateSel); 
                this.model.set({'selectedState': localStorage.getItem('selectedState')});
            } 

            var codeRanges = HyprLiveContext.locals.themeSettings.zipCodeRanges;
            var getTax = false;
            codeRanges = codeRanges.split(",");
            for(var i=0; i<codeRanges.length; i++) {
                var range = codeRanges[i].trim().split('-');
                var state = Number(stateSel);
                if(range[0] <= state && state <= range[1]) {
                    getTax = true;
                    break;
                }
            }
           
            if(getTax) {

                api.request("POST", "/taxEstimation", {'state':stateSel}).then(function (response){
                    if(response.statusCode == 200) {

                        var resp = JSON.parse(response.body);
                        var total = cart.get('discountedTotal');
                        var tax = total*Number(resp.totalRate);
                        tax = tax.toPrecision(3);
                        cart.set({'taxTotal':tax});

                       /* var shipping = localStorage.getItem('selectedShipping');
                        if(typeof shipping !== 'undefined') {
                            var Ships = localStorage.getItem("shippingData");
                            var shippingDetailObj = JSON.parse(Ships);
                            if(cart.shippingDetail !== null)
                                cart.set("shippingDetail", shippingDetailObj);
                            var selectedShipping = localStorage.getItem("selectedShipping");
                            var selectedMethod = _.find(shippingDetailObj, function(obj) {
                              if(obj.content.name === selectedShipping){ 
                                  cart.set("selectedShipping", selectedShipping) ;
                                  return obj;
                                }
                            });
                            var selectedMethodAmount = selectedMethod.amount;
                            cart.set({'shippingTotal': selectedMethodAmount});
                        }*/
                    } else {
                        cart.set({'taxTotal':0});
                    }

                }, function(err) {
                    if(stateSel && bool)
                        $('[data-mz-validation-message="zipCode"]').show();
                });
            } else {
                this.model.set({'taxTotal':0});
                this.render();
            }
        },
        populateShippingMethod: function(cart) {
            var shipping = cart.get('selectedShipping');
            if(typeof shipping !== 'undefined') {
                var shippingDetailObj = cart.get("shippingDetail");
                var selectedShipping = localStorage.getItem("selectedShipping");
                var selectedMethod = _.find(shippingDetailObj, function(obj) {
                  if(obj.content.name === selectedShipping){ 
                      return obj;
                    }
                });
                var selectedMethodAmount = selectedMethod.amount;
                cart.set({'shippingTotal': selectedMethodAmount});
            }
        },
        populateTax: function(e){
            e.stopPropagation();
            var stateSel = $('#zip').val();
            this.calculateTax(stateSel, true);
            // this.populateShipping(false);

        },
        populateShipping: function(bool){
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

                var tot = this.model.get('shippingTotal');
                this.model.set({'shippingTotal': shippingAmount});
                var stateSel = localStorage.getItem('selectedState');
                if(bool)
                    this.calculateTax(stateSel, true, this.model);
        },     
        updateQuantity: _.debounce(function (e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);
                var textValue = e.currentTarget.value;
                textValue = textValue.trim();
                var reg = /^[A-Za-z]+$/;
                var lastValue ='';
                if (textValue !== '' &&  (!isNaN(newQuantity) || reg.test(newQuantity))){              
                    if(((e.which >= 48 && e.which <= 57) || (e.which >= 96 && e.which <= 105)) && (newQuantity > 0)){
                        this._isSyncing = true;
                         item.set('quantity', newQuantity);
                         item.saveQuantity();  
                         this.model.set("currentVal", newQuantity); 
                    } else if (newQuantity!== 'NaN'  && (!reg.test(newQuantity))) {
                          this._isSyncing = true;
                          if (newQuantity > 0){
                            $('#mz-carttable-qty-field').val(newQuantity);
                            $('#global-mz-carttable-qty-field').val(newQuantity);
                            item.set('quantity', newQuantity);
                            this.model.set("currentVal", newQuantity);
                          }
                          else{
                            lastValue =  this.model.get("currentVal");
                              if(lastValue === undefined){
                                lastValue ='1';
                                }
                            $('#mz-carttable-qty-field').val(lastValue);
                            $("[data-id='global-mz-carttable-qty-field']").val(lastValue);
                            item.set('quantity', lastValue);
                          }
                          item.saveQuantity();
                    }else{
                         
                         this._isSyncing = true;
                         if ((textValue === '' ||(!(e.which >= 48 && e.which <= 57) || !(e.which >= 96 && e.which <= 105)))){
                            lastValue =  this.model.get("currentVal");
                             if(lastValue === undefined){
                                lastValue ='1';
                             }
                            $('#mz-carttable-qty-field').val(lastValue);
                            $("[data-id='global-mz-carttable-qty-field']").val(lastValue);
                            item.set('quantity', lastValue);
                         }
                         
                         item.saveQuantity();   
                    }
                }else {
                    $('#mz-carttable-qty-field').val('1');
                    $("[data-id='global-mz-carttable-qty-field']").val('1');
                    this._isSyncing = true;
                    item.set('quantity', '1');
                    item.saveQuantity();
                }


/*
                this._isSyncing = true;
            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
            }*/
        },400),
        quantityMinus: _.debounce(function (e) {
            var minusQty =$(e.currentTarget);
            var msgId = minusQty.data('mz-cart-item-minus');
            var $qField = $(e.currentTarget).parent(".qty-block"); 
            var qFieldValue = $qField.find(".mz-carttable-qty-field").val();        
            var _qtyCountObj = $qField.find(".mz-carttable-qty-field");  
            value = parseInt(qFieldValue, 10);
            var _qtyCartObj = $('[data-mz-cart-item-msg='+ '"' +msgId + '"' +']');
            var _qtyGlobalObj = $('[data-mz-global-cart-item-msg='+ '"' +msgId + '"' +']');
            _qtyCartObj.text('');
            _qtyGlobalObj.text('');

            if (value == 1) {
                if ($(e.delegateTarget).attr("id")=="cart"){
                  _qtyCartObj.text("Quantity can't be zero.");
                }
                if ($(e.delegateTarget).attr("id")=="global-cart-listing"){
                     _qtyGlobalObj.text("Quantity can't be zero.");
                }       
                return;
            }   
            value--;
            var errormsg = this.$('[data-mz-message]'); 
            if(value===0){
                errormsg.text("Quantity cannot be zero");   
            }
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
            var minusQty =$(e.currentTarget);
            var msgId = minusQty.data('mz-cart-item-minus');
            var $qField = $(e.currentTarget).parent(".qty-block"); 
            var qFieldValue = $qField.find(".mz-carttable-qty-field").val();            
            var _qtyCountObj = $qField.find(".mz-carttable-qty-field");  
            value = parseInt(qFieldValue, 10);
            var  _qtyCartObj = $('[data-mz-cart-item-msg='+ '"' +msgId + '"' +']');
            var _qtyGlobalObj = $('[data-mz-global-cart-item-msg='+ '"' +msgId + '"' +']');
            _qtyGlobalObj.text('');
            _qtyCartObj.text('');   
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
            if (value > 1) {
                if (prodCode) {
                    errormsg.text(prodCode + " is limited in stock");
                }
            }
        }
        else {
            this.render();
        }
        var errormsg = this.$('[data-mz-message]');
        var message = model.messages.models[0].attributes.message;
        var prodCode = message.split(':')[1]; 
        
       if (prodCode[prodCode.length-1] === ".")
            prodCode = prodCode.slice(0,-1);
          
        $('.mz-productdetail-wrap').find('.mz-errors').remove();
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
        addCoupon: function() {  
            var self = this;
            if (!$('#coupon-code').val()) {
                $('[data-mz-validationmessage-for="couponcode"]').text(Hypr.getLabel('couponCodeRequired'));
                return false;
            } else {
                $('[data-mz-validationmessage-for="couponcode"]').text('');
            }
            //blockUiLoader.globalLoader(); 
            this.model.addCoupon().ensure(function() {   
                self.model.unset('couponCode');
                self.render();
            });
             
        },
        removeCoupon: function(e) {  
            var self = this;
            var getCouponCode = e.currentTarget.id; 
            blockUiLoader.globalLoader();
            var serviceurl = '/api/commerce/carts/' + this.model.get('id') + '/coupons/' + getCouponCode;
            api.request('DELETE', serviceurl).then(function(response) {
                blockUiLoader.unblockUi();
                self.model.set(response);
              //  var arr = _.without(self.model.get("appliedCouponCodes"), _.findWhere(self.model.get("appliedCouponCodes"), getCouponCode));
              //  self.model.set("appliedCouponCodes", arr);
               // self.model.set('codeApplied', false);
                self.render();
                $("#couponDisclaimer").text("");
            }, function(err) {
                self.trigger('error', {
                    message: Hypr.getLabel('promoCodeError', getCouponCode) 
                });
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
        paypal.loadScript(); 
        

        // Redirect user to previous page on click of Continue Shopping 
        $(document).on('click','#continueShoppingCartButton', function(e){
            var lasturl=document.referrer;  
            if(lasturl.lastIndexOf("/checkout")==-1){ 
                window.history.back();
            }
            else{
                window.location = "/";
            }
        });       
        
    return CartView;  

});