var TBData = (function() {

	/***********************
	* Keeps the app's state.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	var TBData = {

		// Tinkerbox data
		name              : '',
		html              : '',
		css               : '',
		js                : '',
		theme             : '',
		version           : 1,
		compileInRealTime : false,
		htmlPreProcessor  : 'none',
		
		cssPreProcessor   : 'none',
		cssPreFixFree     : '',
		cssStarter        : '',
		
		jsPreProcessor    : 'none',
		jsLibrary         : '',

	    init: function() {
	        this.bindSaveToLocalStorage();
	        this.loadStoredData();
	        this.updateCompileInRealTime();
	    },
	    
	    bindSaveToLocalStorage: function() {
            $(window).unload( function () {
                TBData.saveDataToLocalStorage();
            });
	    },
	    
	    saveDataToLocalStorage: function() {
	        // alextodo, future feature, allow you to save data
	        // for more than one tinkerbox, use the name in the URL!
	        if(typeof(localStorage) != 'undefined') {
	            localStorage.clear();
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

	    syncThisWithDataObj: function(data) {
			this.name             = data.name;
			this.html             = data.html;
			this.css              = data.css;
			this.js               = data.js;
			this.version          = data.version;
            this.theme            = data.theme;
            this.htmlPreProcessor = data.htmlPreProcessor;
            
            this.cssPreProcessor  = data.cssPreProcessor;
            this.cssPreFixFree    = data.cssPreFixFree;
            this.cssStarter       = data.cssStarter;
            
            this.jsPreProcessor   = data.jsPreProcessor;
            this.jsLibrary        = data.jsLibrary;
	    },
	    
	    // If any preprocessors are chosen (jade, less, coffeescript etc.)
	    // don't compile in real time
	    updateCompileInRealTime: function() {
	        if( this.htmlPreProcessor == 'none' && 
	            this.cssPreProcessor  == 'none' &&
	            this.jsPreProcessor   == 'none' ) {
	            this.compileInRealTime = true;
	        }
	        else {
	            this.compileInRealTime = false;
	        }
	    },

	    setHTMLOption: function(name, value) {
	    	this.htmlPreProcessor = value;
	    	this.updateCompileInRealTime();
	    },

	    setCSSOption: function(name, value) {
	    	this.cssPreProcessor = value;
	    	this.updateCompileInRealTime();
	    },
	    
	    setPrefixFree: function(value) {
	        // TODO: Make URL Dynamic or Settable, hmmm, dunno, let's see
	        // why offer more than one?
    		this.cssPreFixFree = (value) ? "/box-libs/prefixfree.min.js" : '';
	    },
	    
	    setCSSStarter: function(value) {
	        this.cssStarter = value;
	    },

	    setJSOption: function(name, value) {
	    	this.jsPreProcessor = value;
	    	this.updateCompileInRealTime();
	    },
	    
	    setJSLibrary: function(value) {
	        this.jsLibrary = value;
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