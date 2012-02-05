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
		
		// UI elements
		prefixFreeCheckbox: $("#prefix-free"),

	    init: function() {
	    	// load the data sent by the server
	    	for(var key in __tbdb) {
	    		this[key] = __tbdb[key];
	    	}
	    },
	    
	    getPrefixFree: function() {
	    	if(this.prefixFreeCheckbox.is(":checked")) {
	    		// TODO: Make URL Dynamic or Settable
	    		this.cssOptions['prefixFree'] = "/box-libs/prefixfree.min.js";
	    	}
	    	else {
	    		this.cssOptions['prefixFree'] = '';
	    	}

	    	return this.cssOptions['prefixFree'];
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
	    }
    };

// This ends the TBDB module

return TBDB;

})();