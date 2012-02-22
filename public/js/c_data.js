var CData = (function() {

	/***********************
	* Keeps the app's state.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	var CData = {

		// Code Pen data
		slug              : '',
		url               : '',
		html              : '',
		css               : '',
		js                : '',
		theme             : '',
		version           : 1,
		html_pre_processor  : 'none',
		html_classes         : '',
		
		css_pre_processor   : 'none',
		css_prefix_free     : '',
		css_starter        : '',
		css_external       : '',
		
		js_pre_processor    : 'none',
		js_library         : '',
		js_modernizr       : '',
		js_external        : '',

	    init: function() {
	        this.bindSaveToLocalStorage();
	        this.loadStoredData();
	    },
	    
	    bindSaveToLocalStorage: function() {
	        localStorage.removeItem("logout");
	        
            $(window).unload( function () {
                CData.saveDataToLocalStorage();
            });
	    },
	    
	    saveDataToLocalStorage: function() {
	        // alextodo, future feature, allow you to save data
	        // for more than one piece of content, use the name in the URL!
	        if(typeof(localStorage) != 'undefined') {
	            if(localStorage['logout'] != 'true') {
	                localStorage['content'] = JSON.stringify(CData);
	            }
            }
	    },
        
        // Use the most recent data, either localstorage or from db
	    loadStoredData: function() {
	        var data = { };
	        
	        if(__c_data['version']) {
	            // alextodo enable localstorage we start pulling from db
	            // data = __c_data;
	            // If you use tbdata, the version number 
	            // has to be incremented immediately to differentiate it
	            // on save, we should check version number doesn't already exist
	            // so that you can't overwrite someones data
	            // and make sure they are logged in
	        }
	        
	        if(typeof(localStorage) != 'undefined') {
	            if(localStorage['fork']) {
	                localStorage['content'] = localStorage['fork'];
	                localStorage.removeItem('fork');
	            }
	            
	            if(localStorage['content']) {
	                localData = $.parseJSON(localStorage['content']);
	                locVersion = (localData['version']) ? localData['version'] : 0;
	                datVersion = (data['version']) ? data['version'] : 0;
	                
	                if(locVersion > datVersion) {
	                   data = localData;
	                }
	            }
	        }
	        
	    	if(data['version']) {
	    	    this.syncThisWithDataObj(data);
	    	}	    	
	    },
	    
	    forkData: function() {
	        // save fork to content store
            // reset version number
            // alextodo, reset any values that id this box
            // alextodo, what doesn't have localStorage? which browsers
            this.name = '';
            this.version = 1;
            localStorage['fork'] = JSON.stringify(CData);
	    },

	    syncThisWithDataObj: function(data) {
	        for(var key in data) {
	            this[key] = data[key];
	        }
	    },

	    setHTMLOption: function(name, value) {
	    	this.html_pre_processor = value;
	    },
	    
	    setHTMLClass: function(value) {
	        this.html_classes = value;
	    },

	    setCSSOption: function(name, value) {
	    	this.css_pre_processor = value;
	    },
	    
	    setPrefixFree: function(value) {
    		this.css_prefix_free = value;
	    },
	    
	    setCSSStarter: function(value) {
	        this.css_starter = value;
	    },
	    
	    setCSSExternal: function(value) {
	        this.css_external = value;
	    },

	    setJSOption: function(name, value) {
	    	this.js_pre_processor = value;
	    },
	    
	    setJSLibrary: function(value) {
	        this.js_library = value;
	    },
	    
	    setModernizr: function(value) {
	        this.js_modernizr = value;
	    },
	    
	    setJSExternal: function(value) {
	        this.js_external = value;
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
	    
	    logout: function() {
	        if(localStorage) {
	            localStorage.removeItem("fork");
	            localStorage.removeItem("content");
	            localStorage['logout'] = 'true';
	        }
	    }
    };

	// This ends the CData module

	return CData;

})();