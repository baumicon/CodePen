var TBDB = (function() {

	/***********************
	* Keeps the apps states.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	var TBDB = {

		// Tinker box data
		name         : '',
		html         : '',
		css          : '',
		js           : '',
		version      : 1,
		htmlOptions  : { },
		cssOptions   : { },
		jsOptions    : { },
		dateUpdated  : '',

		// Store localStorage as own hash
		// This way browsers that don't support 
		// localstorage simply save to this hash
		ls : { },

	    init: function() {
	    	this.loadStoredData();
	    },

	    loadStoredData: function() {
	    	// Ensure localstorage exist, even for browsers
	    	// that don't support it
	    	if(typeof(localStorage) != 'undefined') {
	    		this.ls = localStorage;
	    	}

	    	var dataObj = (this.useLocalStorage()) ? this.ls : __tbdb;
	    	this.syncWithLocalStorage(dataObj);
	    },

	    syncWithLocalStorage: function() {
			var ls = this.localStorage;

			this.name = this.ls.name;
			this.html = this.ls.html;
			this.css  = this.ls.css;
			this.js   = this.ls.js;
			this.version = this.ls.version;

			this.htmlOptions = {
				'jade' : this.ls.htmlOptions.jade,
				'haml' : this.ls.htmlOptions.haml,
			};

			this.cssOptions = {
				'less'       : this.ls.cssOptions.less,
				'stylus'     : this.ls.cssOptions.stylus,
				'scss'       : this.ls.cssOptions.scss,
				'sass'       : this.ls.cssOptions.sass,
				'prefixFree' : this.ls.cssOptions.prefixFree
			};

			this.jsOptions = {
				'coffeeScript' : this.ls.jsOptions.coffeeScript,
				'libraries'    : '',
			}
	    },

	    // Looks for data stored locally on the client
	    // If it exists and the date is fresher than the date
	    // provided by the data served by the server, the local
	    // data is used

	    // todo. for now if data exist locally use that
	    // implement the date comparison in future
	    useLocalStorage: function() {
	    	if(this.ls['dateUpdated']) {
	    		return true;
	    	}
	    	else {
	    		return false;
	    	}
	    },

	    setHTMLOption: function(name, value) {
	    	this.htmlOptions[name] = value;
	    	this.ls[htmlOptions][name] = value;
	    	this.updateTimeStamp();
	    },

	    setCSSOption: function(name, value) {
	    	if(name == 'prefixFree') {
	    		// TODO: Make URL Dynamic or Settable
	    		value = (value)	? "/box-libs/prefixfree.min.js" : '';
	    	}

	    	this.cssOptions[name] = value;
	    	this.ls[cssOptions][name] = value;
	    	this.updateTimeStamp();
	    },

	    setJSOption: function(name, value) {
	    	this.htmlOptions[name] = value;	
	    	this.ls[htmlOptions][name] = value;
	    	this.updateTimeStamp();
	    },

	    getOption: function(mode, name) {
	    	if(mode == 'html') {
	    		return this.htmlOptions[name];
	    	}
	    	else if(mode == 'css') {
	    		return this.cssOptions[name];
	    	}
	    	else {
	    		return this.jsOptions[name];
	    	}
	    },

	    setEditorValue: function(mode, value) {
	    	if(mode == 'xml') {
	    		mode = 'html';
	    		this.html = value;
	    	}
	    	else if(mode == 'css') {
	    		this.css = value;
	    	}
	    	else {
	    		mode = 'js';
	    		this.js = value;
	    	}

	    	this.ls[mode] = value;
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
			var timeMatch = regex.exec(now.toString());

	    	this.dateUpdated = date + ' ' + timeMatch[0];
	    	this.ls['dateUpdated'] = this.dateUpdated;
	    }
    };

// This ends the TBDB module

return TBDB;

})();