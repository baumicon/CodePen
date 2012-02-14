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
		version           : 1,
		dateUpdated       : '',
		compileInRealTime : true,
		editorChanged     : '',
		htmlPreProcessor  : 'none',
		
		cssPreProcessor   : 'none',
		cssOptions : {
		    prefixFree        : '',
		},
		
		jsPreProcessor    : 'none',
		jsOptions         : {
            'libraries'    : [ ],
        },

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
	        // for more than one tinkerbox, use the name in the URL!
	        if(typeof(localStorage) != 'undefined') {
	            localStorage.clear();
	            TBData.updateTimeStamp();
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
	    	
	    	console.log(this);
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
            this.cssOptions.prefixFree = data.cssOptions.prefixFree;
            
            this.jsPreProcessor = data.jsPreProcessor;
            this.jsOptions.libraries = data.jsOptions.libraries;
	    },

	    setHTMLOption: function(name, value) {
	    	this.htmlPreProcessor = value;
	    	this.updateTimeStamp();
	    },

	    setCSSOption: function(name, value) {
	    	if(name == 'prefixFree') {
	    		// TODO: Make URL Dynamic or Settable
	    		value = (value) ? "/box-libs/prefixfree.min.js" : '';
	    		this.cssOptions[name] = value;
	    	}
	    	else {
	    	    this.cssPreProcessor = value;
	    	}
	    	
	    	this.updateTimeStamp();
	    },

	    setJSOption: function(name, value) {
	    	this.jsPreProcessor = value;
	    	this.updateTimeStamp();
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

            this[mode] = value;
            this.editorChanged = mode;
	    	this.updateTimeStamp();
	    },

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