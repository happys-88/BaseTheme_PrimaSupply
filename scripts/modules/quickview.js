/*define(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", "modules/api", "modules/models-product", "pages/cart", "modules/models-cart", "pages/product", "bxslider"], function ($, _, Hypr, Backbone, HyprLiveContext, api, ProductModel, cart, cartModel, product, bxslider) {
    console.log("quick");
    $(document).on('click', '.mz-quick-view', function (event) {

        var $thisElem = $(event.currentTarget);
        var prdCode = $thisElem.attr("data-mz-productcode");
        api.request("GET", "/api/commerce/catalog/storefront/products/" + prdCode).then(function (body) {
            var PersonView = Backbone.MozuView.extend({
                templateName: 'modules/product/product-quickview',
                additionalEvents: {
                    'click .addtocart': 'AddToCart',
                    'click .mz-productoptions-option': "colorswatch",
                    "change [data-mz-value='quantity']": "onQuantityChange",
                    "change .mz-productoptions-option": "onOptionChange",
                    "click [data-mz-qty-minus]": "quantityMinus",
                    "click [data-mz-qty-plus]": "quantityPlus",
                    "click .bx-controls-direction a":"clickOnNextOrprevious"

                },

                render: function () {
                    Backbone.MozuView.prototype.render.call(this);

                    this.corousel();

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


                    this.render();
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
                },
                quantityMinus: function () {

                    var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                        _qtyCountObj = $('.mz-productdetail-qty');
                    _qtyObj.text('');

                    var value = parseInt(_qtyCountObj.val(), 10);

                    if (value == 1) {
                        _qtyObj.text("Quantity can't be zero.");
                        alert("Quantity can't be zero.");
                        $('.modal-body').animate({
                            scrollTop: $('.tab_container')[0].scrollHeight
                        }, 'slow');
                        return;
                    }
                    value--;

                    product.updateQuantity(value);
                    _qtyCountObj.val(value);
                    if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined') {
                        if (product.attributes.inventoryInfo.onlineStockAvailable >= value)
                            $(".mz-productdetail-addtocart").removeClass("is-disabled");
                        if (product.attributes.inventoryInfo.onlineStockAvailable < value && product.attributes.inventoryInfo.onlineStockAvailable > 0)
                            $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
                    }
                },
                quantityPlus: function () {
                    var option = this.model.get('options');
                    console.log(option.get('value'));
                    var _qtyObj = $('[data-mz-validationmessage-for="quantity"]'),
                        _qtyCountObj = $('.mz-productdetail-qty');
                    _qtyObj.text('');
                    var value = parseInt(_qtyCountObj.val(), 10);


                    if (value == 99) {
                        _qtyObj.text("Quantity can't be greater than 99.");
                        return;
                    }
                    value++;
                    product.updateQuantity(value);
                    _qtyCountObj.val(value);
                    if (typeof product.attributes.inventoryInfo.onlineStockAvailable !== 'undefined' && product.attributes.inventoryInfo.onlineStockAvailable < value) {
                        $(".mz-productdetail-addtocart").addClass("is-disabled");
                        if (product.attributes.inventoryInfo.onlineStockAvailable > 0)
                            $('[data-mz-validationmessage-for="quantity"]').text("*Only " + product.attributes.inventoryInfo.onlineStockAvailable + " left in stock.");
                    }
                },

                AddToCart: function (event) {

                    this.model.addToCart();
                },
                colorswatch: function (event) {
                    this.render();
                    var $thisElem = $(event.currentTarget);
                    event.stopImmediatePropagation();
                    var colorValue = $thisElem.val();
                    var colorcode = $thisElem.attr("data-mz-option");
                    var productcode = $thisElem.attr("data-mz-prodduct-code");
                    var sitecontext = HyprLiveContext.locals.siteContext;
                    var cdn = sitecontext.cdnPrefix;
                    var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
                    var imagefilepath = cdn + '/cms/' + siteID + '/files/' + productcode + '-' + colorcode + '.jpg';
                    product.set({
                        "dataurl": imagefilepath
                    });
                  

                },
                clickOnNextOrprevious: function(){
                    //var newpath= imagefilepath + '?_mzcb=undefined';
                     $("[src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/No_image_3x4.svg/1024px-No_image_3x4.svg.png']").parent().remove();
                     var len=$(".bx-pager-item").length;
                     console.log(len);
                    $(".bx-pager-item").eq(len).remove();
                    //$("[src=newpath]").eq(1).remove();
                    //console.log($("[src=newpath]").length);
                     //$('div.foo3').eq(1).remove();
                     //cdn-sb.mozu.com/25008-37918/cms/37918/files/ric-002-Orange.jpg?_mzcb=undefined
                 }
            });

            var product = ProductModel.Product.fromCurrent();
            product.set(body);
            var todoView = new PersonView({
                model: product,
                el: $('#quickViewModal')
            });
            todoView.render();
            $('#quickViewModal').on('hidden.bs.modal', function (e) {
                $(".destroy").remove();

                product.clear();
            });
        });

    });

});*/