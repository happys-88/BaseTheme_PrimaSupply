﻿define(['shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'underscore',  'hyprlive', 'modules/api',
      'hyprlivecontext'], function($, _, Hypr, api,
        HyprLiveContext) {

    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict(); 

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers
    var qs = '%QUERY',
        eqs = encodeURIComponent(qs),
        suggestPriorSearchTerms = Hypr.getThemeSetting('suggestPriorSearchTerms'),
        getApiUrl = function(groups) {
            return api.getActionConfig('suggest', 'get', { query: qs, groups: groups }).url;
        },
        termsUrl = getApiUrl('terms'),
        productsUrl = getApiUrl('pages'),
        categoriesUrl = getApiUrl('categories'),
        ajaxConfig = {
            headers: api.getRequestHeaders()
        },
        i,
        nonWordRe = /\W+/,
        makeSuggestionGroupFilter = function(name) {
            return function(res) {
                // console.log("Results : "+JSON.stringify(res));
                var suggestionGroups = res.suggestionGroups,
                    thisGroup;
                for (i = suggestionGroups.length - 1; i >= 0; i--) {
                    if (suggestionGroups[i].name === name) {
                        thisGroup = suggestionGroups[i];
                        break;
                    }
                }

                if($('.learningCenterInput').is(':focus') && name==='Pages') { 
                    var valArray = filterCatsArray();
                    var result = _.filter(thisGroup.suggestions, function(someThing) {
                        var boolVal = false;
                        return someThing.suggestion.productType === 'content';
                        /*if(someThing.suggestion.categories.length > 0) {
                            $.each(someThing.suggestion.categories, function(index, obj){
                                if(valArray.indexOf(obj.categoryId) >= 0) {
                                    boolVal = true;
                                    return false;
                                } else {
                                    boolVal = false;
                                }                                
                            });
                            console.log("Boolval : "+boolVal);
                            return boolVal;
                        } else {
                            return true;
                        }*/
                    });
                    return result;
                } else if($('#globalSearch').is(':focus') && name==='Pages') {
                    var valArrayGlobal = filterCatsArray();
                    var resultGlobal = _.filter(thisGroup.suggestions, function(someThing) {
                    var boolVal = false;
                    return someThing.suggestion.productType !== 'content';
                        /*if(someThing.suggestion.categories.length > 0) {
                            $.each(someThing.suggestion.categories, function(index, obj){
                                if(valArrayGlobal.indexOf(obj.categoryId) == -1) {
                                    boolVal = true;
                                    return false;
                                } else {
                                    boolVal = false;
                                }                                
                            });
                            return boolVal;
                        } else {
                            return true;
                        }*/

                        /*if(someThing.suggestion.categories.length > 0) {
                            return valArrayGlobal.indexOf(someThing.suggestion.categories[0].categoryId) == -1;
                        } else {
                            return true;
                        }*/
                    });
                    
                    return resultGlobal;
                }            
                return thisGroup.suggestions;
            };
        },
        filterCatsArray= function(){
            var categories = HyprLiveContext.locals.themeSettings.searchSuggestionFilter;
            
            var arrayCats = categories.split(',');          
            var categoryArray = [];
            for(var i = 0; i < arrayCats.length; i++) {
                if(arrayCats[i] !== '') {
                    categoryArray.push(Number(arrayCats[i]));
                }
            }
            return categoryArray;
        },
        makeTemplateFn = function(name) {
            var tpt = Hypr.getTemplate(name);
            return function(obj) {
                return tpt.render(obj);
            };
        },

    // create bloodhound instances for each type of suggestion

    AutocompleteManager = {
        datasets: {
            pages: new Bloodhound({
                datumTokenizer: function(datum) {
                    return datum.suggestion.term.split(nonWordRe);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: productsUrl,
                    wildcard: eqs,
                    filter: makeSuggestionGroupFilter("Pages"),
                    rateLimitWait: 400,
                    ajax: ajaxConfig
                }
            })
        }
   };


    $.each(AutocompleteManager.datasets, function(name, set) {
        set.initialize();
    });

    var dataSetConfigs = [
        {
            name: 'pages',
            displayKey: function(datum) {
                return datum.suggestion.productCode;
            },
            templates: {
                suggestion: makeTemplateFn('modules/search/autocomplete-page-result')
            },
            source: AutocompleteManager.datasets.pages.ttAdapter()
        }
    ];

    if (suggestPriorSearchTerms) {
        AutocompleteManager.datasets.terms = new Bloodhound({
            datumTokenizer: function(datum) {
                return datum.suggestion.term.split(nonWordRe);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: termsUrl,
                wildcard: eqs,
                filter: makeSuggestionGroupFilter("Terms"),
                rateLimitWait: 100,
                ajax: ajaxConfig
            }
        });
        AutocompleteManager.datasets.terms.initialize();

        dataSetConfigs.push({
            name: 'terms',
            displayKey: function(datum) {
                return datum.suggestion.term;
            },
            source: AutocompleteManager.datasets.terms.ttAdapter()
        });

        AutocompleteManager.datasets.categories = new Bloodhound({
            datumTokenizer: function(datum) {
                return datum.suggestion.term.split(nonWordRe);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: categoriesUrl,
                wildcard: eqs,
                filter: makeSuggestionGroupFilter("Categories"),
                rateLimitWait: 500,
                ajax: ajaxConfig
            }
        });
        AutocompleteManager.datasets.categories.initialize();
        dataSetConfigs.push({
            name: 'categories',
            displayKey: function(datum) {
                return datum.suggestion.categoryId;
            },
            templates: {
                suggestion: makeTemplateFn('modules/search/autocomplete-page-result')
            },
            source: AutocompleteManager.datasets.categories.ttAdapter()
        });
    }

    $(document).ready(function() {
        var $field = AutocompleteManager.$typeaheadField = $('[data-mz-role="searchquery"]');
        AutocompleteManager.typeaheadInstance = $field.typeahead({
            hint: true,
            highlight: true,
            minLength: 3
        }, dataSetConfigs).data('ttTypeahead');
        // user hits enter key while menu item is selected;
        $field.on('typeahead:selected', function (e, data, set) {
            if (data.suggestion.productCode) window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/p/" + data.suggestion.productCode;
        });
        $('#searchbox').on('submit', function(e) {
            var searchVal = $('#globalSearch').val().trim();
            if (searchVal === "") {
                window.alert(Hypr.getLabel('blankSearchResult'));
                e.preventDefault();
            } else if (searchVal.length < 3) {
                window.alert("Your keyword or item number must be at least 3 characters long");
                e.preventDefault();
            }
        });
    });

    return AutocompleteManager;
});