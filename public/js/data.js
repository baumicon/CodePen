var Data = Class.extend({

	/***********************
	* Keeps the app's state.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	// Code Pen data
	slug               : '',
	html               : '',
	css                : '',
	js                 : '',
	theme              : 'sublime',
	version            : 1,
	html_pre_processor : 'none',
	html_classes       : '',
	
	css_pre_processor  : 'none',
	css_prefix_free    : false,
	css_starter        : 'neither',
	css_external       : '',
	
	js_pre_processor   : 'none',
	js_library         : '',
	js_modernizr       : false,
	js_external        : '',

    init: function() {
        this.shimLocalStorage();
        this.bindSaveToLocalStorage();
        this.loadStoredData();
    },

    shimLocalStorage: function() {
        // make sure a localStorage object exist
        if(typeof(localStorage) == 'undefined') {
            window.localStorage = {
                setItem: function() { },
                removeItem: function() { },
                clear: function() { }
            };
        }
    },
    
    bindSaveToLocalStorage: function() {
        localStorage.removeItem("logout");
        
        $(window).unload( function () {
            Data.saveDataToLocalStorage();
            return false;
        });
    },
    
    saveDataToLocalStorage: function() {
        if(localStorage['logout'] != 'true' && localStorage['new'] != 'true') {
            // only save the data for the current url path
            localStorage[document.location.pathname] = JSON.stringify(Data);
        }
    },
    
    // Use the most recent data, either localstorage or from db
    loadStoredData: function() {
        var data = { };

        if(__c_data['version']) {
            data = __c_data;
        }
        
        // If any data for local storage exist at this path
        // always use it because it's always the latest. Need to also
        // determine if this is the latest data on the server
        // If you visit any other url we start keep track of that
        if(localStorage[document.location.pathname]) {
            data = $.parseJSON(localStorage[document.location.pathname]);
        }
        
        // Always clear localStorage
        localStorage.clear();
        
        if(data.version) {
            for(var key in data) {
                this[key] = data[key];
            }
        }
        
        this.version = (isNaN(this.version)) ? 1 : this.version * 1;
        this.auth_token = __c_data['auth_token'];
    },

    setSlug: function(value) {
        this.slug = value;
    },
    
    setHTMLOption: function(name, value) {
    	this.html_pre_processor = value;
    },
    
    setHTMLClass: function(value) {
        this.html_classes = value;
    },

    setCSSOption: function(name, value) {
        this[name] = value;
    },

    setJSOption: function(name, value) {
    	this[name] = value;
    },
    
    setTheme: function(value) {
        this.theme = value;
    },

    getOption: function(mode, name) {
    	if(mode == 'xml') {
    		return this.html_pre_processor;
    	}
    	else if(mode == 'css') {
    		return this.css_pre_processor;
    	}
    	else {
    		return this.js_pre_processor;
    	}
    },

    setEditorValue: function(mode, value) {
    	if(mode == 'xml') {
    		mode = 'html';
    	}
    	else if(mode == 'javascript') {
    	    mode = 'js';
    	}
    	
        this[mode] = value;
    },
    
    newPen: function() {
        try {
            localStorage.setItem('new', 'true');
        }
        catch(err) {
            alert(err.message);
        }
    },

    save: function() {
        if(this.canSave()) {
            this.version += 1;
            
            $.ajax({
                  url: '/save/content',
                  type: 'POST',
                  data: Util.getDataValues(
                    { 'content': JSON.stringify(Data), 'auth_token': Data.auth_token }),
                  success: function(result) {
                      var obj = $.parseJSON(result);
                      
                      if(obj.success) {
                          var href = '/' + obj.slug + '/' + obj.version;
                          
                          // If current URL is blank, send to new location
                          // If it's brand new, refresh to the new
                          if(document.location.pathname == '/') {
                              window.location = href;
                          }
                          else {
                              Data.updateURL(href);
                          }
                      }
                      else {
                            alert(result);
                      }
                  }
            });
        }
    },
    
    canSave: function() {
    	var canSave = true;
    	
        if(this.html == '' && this.css == '' && this.js == '') {
            canSave = false;
        }
        
        return canSave;
    },
    
    fork: function() {
        if(this.canFork()) {
            this.version += 1;
            
            $.ajax({
                  url: '/fork' + location.pathname,
                  type: 'POST',
                  data: Util.getDataValues(
                    { 'content': JSON.stringify(Data), 'auth_token': Data.auth_token }),
                  success: function(result) {
                      var obj = $.parseJSON(result);
                      
                      if(obj.success) {
                          Data.updateThisValues(obj);
                          window.location = '/' + obj.slug + '/' + obj.version;
                      }
                      else {
                            alert(result);
                      }
                  }
            });
        }
    },
    
    canFork: function() {
        return true;
    },
    
    updateThisValues: function(obj) {
        for(var attr in Data) {
            if(typeof(Data[attr]) != 'function') {
                if(obj[attr]) {
                    Data[attr] = obj[attr];
                }
            }
        }
    },
    
    // Attempts to update the replaceState so we don't have to reload
    // otherwise, update the window.location
    updateURL: function(href) {
        if(window.history.replaceState) {
            var desc = "Moving to URL " + href;
            window.history.replaceState('', desc, href);
        }
        else {
            window.location = href;
        }
    },

    logout: function() {
        if(localStorage) {
            localStorage.clear();
            localStorage['logout'] = 'true';
        }
    }
});
