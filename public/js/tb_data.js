var TBData = (function() {

	/***********************
	* Keeps the app's state.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	var TBData = {

		// Code Pen data
		name              : '',
		html              : '',
		css               : '',
		js                : '',
		theme             : '',
		version           : 1,
		htmlPreProcessor  : 'none',
		htmlClasses         : '',
		
		cssPreProcessor   : 'none',
		cssPreFixFree     : '',
		cssStarter        : '',
		cssExternal       : '',
		
		jsPreProcessor    : 'none',
		jsLibrary         : '',
		jsModernizr       : '',
		jsExternal        : '',

	    init: function() {
	        this.bindSaveToLocalStorage();
	        this.loadStoredData();
	    },
	    
	    bindSaveToLocalStorage: function() {
            $(window).unload( function () {
                TBData.saveDataToLocalStorage();
            });
	    },
	    
	    saveDataToLocalStorage: function() {
	        // alextodo, future feature, allow you to save data
	        // for more than one codepen, use the name in the URL!
	        if(typeof(localStorage) != 'undefined') {
                localStorage['tb'] = JSON.stringify(TBData);
            }
	    },
        
        // Use the most recent data, either localstorage or from db
	    loadStoredData: function() {
	        var data = { };
	        
	        if(__tbdata['dateUpdated']) {
	            // alextodo enable localstorage we start pulling from db
	            // data = __tbdata;
	            // If you use tbdata, the version number 
	            // has to be incremented immediately to differentiate it
	            // on save, we should check version number doesn't already exist
	            // so that you can't overwrite someones data
	            // and make sure they are logged in
	        }
	        
	        if(typeof(localStorage) != 'undefined') {
	            if(localStorage['fork']) {
	                localStorage['tb'] = localStorage['fork'];
	                localStorage.removeItem('fork');
	            }
	            
	            if(localStorage['tb']) {
	                localData = $.parseJSON(localStorage['tb']);
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
	        // save fork to tb store
            // reset version number
            // alextodo, reset any values that id this box
            // alextodo, what doesn't have localStorage? which browsers
            this.name = '';
            this.version = 1;
            localStorage['fork'] = JSON.stringify(TBData);
	    },

	    syncThisWithDataObj: function(data) {
	        for(var key in data) {
	            this[key] = data[key];
	        }
	    },

	    setHTMLOption: function(name, value) {
	    	this.htmlPreProcessor = value;
	    },
	    
	    setHTMLClass: function(value) {
	        this.htmlClasses = value;
	    },

	    setCSSOption: function(name, value) {
	    	this.cssPreProcessor = value;
	    },
	    
	    setPrefixFree: function(value) {
    		this.cssPreFixFree = value;
	    },
	    
	    setCSSStarter: function(value) {
	        this.cssStarter = value;
	    },
	    
	    setCSSExternal: function(value) {
	        this.cssExternal = value;
	    },

	    setJSOption: function(name, value) {
	    	this.jsPreProcessor = value;
	    },
	    
	    setJSLibrary: function(value) {
	        this.jsLibrary = value;
	    },
	    
	    setModernizr: function(value) {
	        this.jsModernizr = value;
	    },
	    
	    setJSExternal: function(value) {
	        this.jsExternal = value;
	    },
	    
	    setTheme: function(value) {
	        this.theme = value;
	    },

	    getOption: function(mode, name) {
	    	if(mode == 'xml') {
	    		return this.htmlPreProcessor;
	    	}
	    	else if(mode == 'css') {
	    		return this.cssPreProcessor;
	    	}
	    	else {
	    		return this.jsPreProcessor;
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
	    }
    };

	// This ends the TBData module

	return TBData;

})();