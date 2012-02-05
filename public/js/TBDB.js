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

	    init: function() {
	    	this.loadStoredData();
	    },

	    loadStoredData: function() {
	    	if(this.useLocalStorage()) {
	    		this.syncObjects(localStorage, this);
	    	}
	    	else {
	    		this.syncObjects(localStorage, this);
	    	}

	    	// alextodo, consider just saving data as string dunno
	    	//console.log(JSON.stringify(this));
	    	// alextodo, need to figure out why the 
	    },

	    // Looks for data stored locally on the client
	    // If it exists and the date is fresher than the date
	    // provided by the data served by the server, the local
	    // data is used

	    // todo. for now if data exist locally use that
	    // implement the date comparison in future
	    useLocalStorage: function() {
	    	if(typeof(localStorage) != 'undefined' && localStorage['dateUpdated']) {
	    		return true;
	    	}
	    	else {
	    		return false;
	    	}
	    },

	    setHTMLOption: function(name, value) {
	    	this.htmlOptions[name] = value;
	    	this.save();
	    },

	    setCSSOption: function(name, value) {
	    	if(name == 'prefixFree') {
	    		// TODO: Make URL Dynamic or Settable
	    		value = (value)	? "/box-libs/prefixfree.min.js" : '';
	    	}

	    	this.cssOptions[name] = value;
	    	this.save();
	    },

	    setJSOption: function(name, value) {
	    	this.htmlOptions[name] = value;	
	    	this.save();
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
	    	if(mode == 'html') {
	    		this.html = value;
	    	}
	    	else if(mode == 'css') {
	    		this.css = value;
	    	}
	    	else {
	    		this.js = value;
	    	}

	    	this.save();
	    },

	    save: function() {
	    	// update time stamp
	    	this.updateTimeStamp();

	    	// save this to local storage
	    	if(localStorage) {
	    		this.syncObjects(this, localStorage);
	    	}
	    },

	    syncObjects: function(from, to) {
	    	for(var attribute in from) {
	    		if(typeof(from[attribute]) == 'object') {
	    			for(var opt in from[attribute]) {
	    				// console.log('opt: ' + opt);
	    				to[attribute][opt] = from[attribute][opt];
	    			}
	    		}
	    		else if(typeof(from[attribute]) != 'function') {
	    			// console.log(attribute);
	    			to[attribute] = from[attribute];
	    		}
	    	}
	    },

	    updateTimeStamp: function() {
	    	var now = new Date()

	    	yyyy = now.getFullYear();
	    	mm = now.getMonth() + 1;
	    	mm = (mm > 9) ? mm : '0' + mm;
	    	dd = now.getDate();
	    	dd = (dd > 9) ? dd : '0' + dd;
	    	var date = yyyy + '-' + mm + '-' + dd;

	    	var regex = /\d\d:\d\d:\d\d/g;
			var match = regex.exec(now.toString());
			var time = match[0];

	    	this.dateUpdated = date + ' ' + time;
	    }
    };

// This ends the TBDB module

return TBDB;

})();