var TBData = (function() {

	/***********************
	* Keeps the apps states.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	var TBData = {

		// Tinkerbox data
		name              : '',
		html              : '',
		css               : '',
		js                : '',
		// keep version number and increment that
		version           : 1,
		compileInRealTime : false,
		editorChanged     : '',
		htmlPreProcessor  : 'none',
		
		cssPreProcessor   : 'none',
		cssPreFixFree     : '',
		
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
                localStorage['tb'] = JSON.stringify(TBData);
            }
	    },

        // Looks for data stored locally on the client
	    // If it exists and the date is fresher than the date
	    // provided by the data served by the server, the local
	    // data is used
	    loadStoredData: function() {
	        var data = { };
	        
	        if(__tbdata['dateUpdated']) {
	            // alextodo enable localstorage when i start adding a date
	            // for now nothing
	            // data = __tbdata;
	        }
	        
	        if(typeof(localStorage) != 'undefined') {
	            if(localStorage['fork']) {
	                localStorage['tb'] = localStorage['fork'];
	                localStorage.removeItem('fork');
	            }
	            
	            if(localStorage['tb']) {
	                localData = $.parseJSON(localStorage['tb']);
	                // alextodo, will need to determine which one is fresher
	                // for now always use localStorage if it exists
	                data = localData;
	            }
	        }
	        
	    	if(data['dateUpdated']) {
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
			this.name = data.name;
			this.html = data.html;
			this.css  = data.css;
			this.js   = data.js;
			this.version = data.version;
			this.dateUpdated = data.dateUpdated;

            this.htmlPreProcessor = data.htmlPreProcessor;
            
            this.cssPreProcessor = data.cssPreProcessor;
            this.cssPreFixFree = data.cssPreFixFree;
            
            this.jsPreProcessor = data.jsPreProcessor;
            this.jsLibrary = data.jsLibrary;
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

        // alextodo, also update the compileInRealTime here
	    setHTMLOption: function(name, value) {
	    	this.htmlPreProcessor = value;
	    	this.updateTimeStamp();
	    	this.updateCompileInRealTime();
	    },

	    setCSSOption: function(name, value) {
	    	this.cssPreProcessor = value;
	    	this.updateTimeStamp();
	    	this.updateCompileInRealTime();
	    },
	    
	    setPrefixFree: function(value) {
    		this.cssPreFixFree = value;
	    },

	    setJSOption: function(name, value) {
	    	this.jsPreProcessor = value;
	    	this.updateTimeStamp();
	    	this.updateCompileInRealTime();
	    },
	    
	    setJSLibrary: function(value) {
	        this.jsLibrary = value;
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
            this.editorChanged = mode;
	    	this.updateTimeStamp();
	    },

        // alextodo, need to use version numbers
        
	    // Update the time stamp, save in the format
	    // yyyy-mm-dd hh:mm:ss
	    updateTimeStamp: function() {
	    	var now = new Date()

	    	yyyy = now.getFullYear();
	    	mm = now.getMonth() + 1;
	    	mm = (mm > 9) ? mm : '0' + mm;
	    	dd = now.getDate();
	    	dd = (dd > 9) ? dd : '0' + dd;
	    	var date = yyyy + '-' + mm + '-' + dd;

	    	var regex = /\d\d:\d\d:\d\d/g;
			var time = regex.exec(now.toString());
            
	    	this.dateUpdated = date + ' ' + time;
	    }
    };

	// This ends the TBData module

	return TBData;

})();