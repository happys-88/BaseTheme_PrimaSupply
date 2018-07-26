define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'hyprlivecontext',
        'hyprlive',
        "modules/block-ui",
        'modules/editable-view'
    ],
    function(api, Backbone, _, $, HyprLiveContext, Hypr, blockUiLoader, EditableView) {

        var ContactUsView = EditableView.extend({
            templateName: 'modules/contact-us/contact',
            autoUpdate: [
                'firstname',
                'lastname',
                'email',
                'message',
                'selectedTopic'
            ],
            setError: function(msg) {
                this.model.set('isLoading', false);
                this.trigger('error', { message: msg || 'Something went wrong!! Please try after sometime!' });
            },
            contactUsSubmit: function(event) {
                var self = this;
                var firstName = self.model.get('firstname');
                var lastName = self.model.get('lastname');
                var email = self.model.get('email');
                var selectedTopic = self.model.get('selectedTopic');
                var message = self.model.get('message');
                console.log(self.model);
                if (!self.model.validate()) {
                    api.request("POST", "/commonRout",
                    {
                        requestFor:'contactUsMail',
                        firstname:firstName,
                        lastname:lastName,
                        email:email,
                        selectedTopic: selectedTopic,
                        message: message
                    }).then(function (response){
                        var labels = HyprLiveContext.locals.labels;
                        console.log("Success : "+JSON.stringify(response.body));
                        if(response.statusCode === 202 || response.statusCode === 200) {
                            $('#contactUsForm').each(function(){
                                this.reset();
                            });
                            $("#submitMsg").html(labels.emailMessage);
                            $("#submitMsg").show();    
                        } else {
                            $("#submitMsg").html("Error: "+response.body.errors[0].message);
                            $("#submitMsg").show();    
                        }
                    }, function(err) {
                        console.log("Failure : "+JSON.stringify(err));
                        $("#submitMsg").html("Error: "+err.message);
                        $("#submitMsg").show();
                        self.setError();
                    });
                } else {
                    self.setError("Invalid form submission");
                }
                self.model.set('isLoading', true);
            },
            render: function() {
                Backbone.MozuView.prototype.render.apply(this);
            }
        });

        var validationfields = {
            'email': [{
                required: true,
                msg: Hypr.getLabel('genericRequired')
            },
            {
                pattern: 'email',
                msg: Hypr.getLabel('emailMissing')
            }],
            'selectedTopic': {
                required: true,
                msg: Hypr.getLabel('genericRequired')
            },
            'message': {
                required: true,
                msg: Hypr.getLabel('genericRequired')
            }
        };
        if (HyprLiveContext.locals.themeSettings.enableCaptcha) {
            _.extend(validationfields, {
                'recaptcha_widget_div': {
                    required: function(val, attr, computed) {
                        return window.recaptchaResponse === undefined;
                    },
                    msg: Hypr.getLabel('captchaStatusMessage')
                }
            });
        }
        var Model = Backbone.MozuModel.extend({
            validation: validationfields
        });
        var $contactUsEl = $('.contact');
        var contactUsView = window.view = new ContactUsView({
            el: $contactUsEl,
            model: new Model({
                "selectTopic": require.mozuData('selectTopic')
            })
        });
        contactUsView.render();
    });