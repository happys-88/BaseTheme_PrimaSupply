
require(["modules/jquery-mozu", "underscore", "hyprlive", "modules/backbone-mozu", 'hyprlivecontext'], function ($, _, Hypr, Backbone, HyprLiveContext) {
	var model;
	var SignUpModel = Backbone.Model.extend({
		defaults: {
			email : ''
		},
	    validation: {
	    	/*email: {
	            required: true,
	            pattern: 'email'
	        }*/
	    },
		validate: function(attrs) {
	        var invalid=[];
	        console.log("Email : "+attrs.email);
	        if (attrs.email!=="abcd@gmail.com") invalid.push("Invalid Email");
	        if (invalid.length>0) return invalid;
	    }
	});

	var GuestCheckoutView = Backbone.MozuView.extend({
		templateName: 'modules/checkout/checkout-as-guest',
		additionalEvents: {
			"change [data-mz-value=usShipping]":"poupulateShipping"
		},
		initialize: function () {
			model = new SignUpModel();
			 Backbone.Validation.bind(this);
		},
		checkoutAsGuest: function(){
			console.log("CheckoutAsGuest");
			var me = this;
			var email = $('#guestEmail').val();
			var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   			if(pattern.test(email)) {
   				console.log("Session Storage : "+email);
   				var url = HyprLiveContext.locals.pageContext.url + '/checkout';
   				sessionStorage.setItem("guestEmail", email);
   				console.log("sessionStorage : "+JSON.stringify(sessionStorage));
   				// console.log("url : "+url);
	   			window.location = url;
   			} else {
   				$('#guestEmailError').removeClass('hide');
   			}
		}

	});
	
	var Mod = Backbone.MozuModel.extend({});
	// var dummyModel = new SignUpModel();
	var dummyModel = new Mod();
	var view = new GuestCheckoutView({
		model: dummyModel,
		el: $('#guestForm')
	});
	view.render();
});