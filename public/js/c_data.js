var CData = {

	/***********************
	* Keeps the app's state.
	* Persist state to local storage first,
	* then to the backend storage
	************************/

	// Code Pen data
	slug               : '',
	url                : '',
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

        if(__c_data['payload']['version']) {
            data = __c_data['payload'];
        }
        
        // if(typeof(localStorage) == 'undefined') {
        //     if(localStorage['fork']) {
        //         localStorage['content'] = localStorage['fork'];
        //         localStorage.removeItem('fork');
        //     }
            
        //     if(localStorage['content']) {
        //         localData = $.parseJSON(localStorage['content']);

        //         locVersion = (localData['version']) ? localData['version'] : 0;
        //         datVersion = (data['version']) ? data['version'] : 0;
                
        //         if(locVersion > datVersion) {
        //            data = localData;
        //         }
        //     }
        // }
        
    	if(data.version) {
    	    this.syncThisWithDataObj(data);
    	}
        
        this.version = (isNaN(this.version)) ? 1 : this.version * 1;
        this.auth_token = __c_data['payload']['auth_token'];
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
    
    save: function() {
        this.version += 1;
        alert(JSON.stringify(CData));
        $.ajax({
              url: '/save/content',
              type: 'POST',
              data: Util.getDataValues(
                { 'content': JSON.stringify(CData), 'auth_token': CData.auth_token }),
              success: function(result) {
                  var obj = $.parseJSON(result);
                  
                  if(obj.success) {
                      window.location = '/' + obj.payload.slug + '/';
                  }
                  else {
                      // todo, what happens when saving goes wrong?
                  }
              }
        });
    },
    
    logout: function() {
        if(localStorage) {
            localStorage.removeItem("fork");
            localStorage.removeItem("content");
            localStorage['logout'] = 'true';
        }
    }
};
