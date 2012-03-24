var CData = {

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
                removeItem: function() { },
                clear: function() { }
            };
        }
    },
    
    bindSaveToLocalStorage: function() {
        localStorage.removeItem("logout");
        
        $(window).unload( function () {
            CData.saveDataToLocalStorage();
            return false;
        });
    },
    
    saveDataToLocalStorage: function() {
        if(localStorage['logout'] != 'true' && localStorage['new'] != 'true') {
            // only save the data for the current url path
            localStorage[document.location.pathname] = JSON.stringify(CData);
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
    
    fork: function() {
        // alextodo, will need a different fork path if the user is logged in
        // will actually have to save to localStorage and redirect to new box
        this.slug = '';
        this.version = 1;
        
        this.save();
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
    
    new: function() {
        localStorage['new'] = 'true';
    },

    save: function() {
        this.version += 1;
        
        $.ajax({
              url: '/save/content',
              type: 'POST',
              data: Util.getDataValues(
                { 'content': JSON.stringify(CData), 'auth_token': CData.auth_token }),
              success: function(result) {
                  var obj = $.parseJSON(result);
                  
                  if(obj.success) {
                      window.location = '/' + obj.slug + '/' + obj.version;
                  }
                  else {
                        alert(result);
                  }
              }
        });
    },

    fork: function() {
        var getLocation = function(href) {
            var l = document.createElement("a");
            l.href = href;
            return l
        }
        var l = getLocation(location.href);
        var form = document.createElement('form');
        form.setAttribute('method', 'post');
        path = '/fork' + l.pathname;
        form.setAttribute('action', path);
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', 'auth_token');
        hiddenField.setAttribute('value', CData.auth_token);
        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    },

    logout: function() {
        if(localStorage) {
            localStorage.clear();
            localStorage['logout'] = 'true';
        }
    }
};
