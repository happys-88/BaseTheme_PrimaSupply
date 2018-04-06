define([
    'modules/backbone-mozu',
    'modules/jquery-mozu',
    "modules/api",
    "hyprlive",
    'underscore',
    "modules/models-product",
    'modules/models-cart',
    'modules/preserve-element-through-render'
    
], function(Backbone, $, Api, Hypr, _, ProductModels, CartModels, preserveElement) {
   
    var globalCartMaxItemCount = Hypr.getThemeSetting('globalCartMaxItemCount'),
        globalCartHidePopover = Hypr.getThemeSetting('globalCartHidePopover'),
        coerceBoolean = function(x) {
            return !!x;
        };
    var GlobalCartView = Backbone.MozuView.extend({
        templateName: "modules/page-header/global-cart-dropdown",
        initialize: function() {
            var me = this;
        },
        render: function() {
            preserveElement(this, ['.v-button'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
            
        },
        updateQuantity: _.debounce(function (e) {
            
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
            }
        },400),
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
            return false;
        },
        openLiteRegistration: function() {
            $(".second-tab").show();
            $(".third-tab").hide();
            $('#liteRegistrationModal').modal('show');
        },
      
      
        update: function(showGlobalCart) {
            var me = this;
            Api.get("cart").then(function(resp) {
                resp.data.cartItems = resp.data.items.slice(0, globalCartMaxItemCount);
                if (globalCartHidePopover === true && resp.data.cartItems.length === 0) {
                    $(me.el).hide();
                }
                me.model.attributes = resp.data;
                me.render();
                try {
                    window.updateGCRTI();
                } catch (e) {}
                if (showGlobalCart) {
                    me.$el.parents('#global-cart').show();
                    setTimeout(function() {
                        me.$el.parents('#global-cart').attr('style', '');
                    }, 5000);
                }
            });
        }
    });

    var Model = Backbone.MozuModel.extend();
    console.log(Model);
    var globalCartView = new GlobalCartView({
        el: $('#global-cart-listing'),
        model: new Model({})
    });
    globalCartView.render();
    var GlobalCart = {
        update: function(showGlobalCart) {
            globalCartView.update(showGlobalCart);
        }
    };
    return GlobalCart;

});