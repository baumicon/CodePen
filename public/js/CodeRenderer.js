var CodeRenderer = (function() {

	var CodeRenderer = {
	    
	    // reference versions of data
	    refHTML     : '',
	    refCSS      : '',
	    refJS       : '',
        
        // cached html results
        cachedHTML  : '',
        cachedCSS   : '',
        cachedJS    : '',
        
        errHTML     : '',
        
	    init: function() {
	    	this.codeChanged(true);
	    },
	    
	    codeChanged: function(forceCompile) {
	        if(forceCompile || TBData.compileInRealTime) {
	           	var content = CodeRenderer.getResultContent();
    	    	CodeRenderer.writeContentToIFrame(content);
    	    	CodeRenderer.executeIFrameJS();
	        }
	    },

	    writeContentToIFrame: function(content) {
	    	var doc = $('#result').contents()[0];
	    	
	    	try {
	    	   	doc.open();
    			// alextodo, having some sort of tool that checks html, css, and js
    			// for validdity would really help
    			// good error reporting would help as well
    			// otherwise we'll be showing error on the console to the user
    			doc.write(content);
    			doc.close();
	    	}
	    	catch(err) {
	    	    console.log(err);
	    	}
	    },

	    executeIFrameJS: function() {
	    	// TO DO: look at the security implications of this
	    	var contentWindow = $('#result')[0].contentWindow;
	    	
	    	if(contentWindow.__run) {
	    	    contentWindow.__run();
	    	}
	    },

	    getResultContent: function() {
	        this.renderContentUpdateCache();
	        
	        if(CodeRenderer.errHTML) {
	           // errors exist, show those as result
	           return CodeRenderer.errHTML;
	        }
	        else {
	           	var values = {
      				TITLE : "Tinkerbox",
      				CSS   : this.cachedCSS,
      				HTML  : this.cachedHTML,
      				JS    : this.cachedJS,
      				JSLIB : this.getJSLibrary(),
      				PREFIX: this.getPrefixFree()
    			};

    			return tmpl(this.getTPL('result'), values);
	        }
	    },
	    
	    getJSLibrary: function() {
	        if(TBData.jsLibrary) {
	            return '<script src="' + TBData.jsLibrary + '"></script>';
	        }
	        else {
	            return '';
	        }
	    },
	    
	    getPrefixFree: function() {
	        if(TBData.jsLibrary) {
	            return '<script src="' + TBData.jsLibrary + '"></script>';
	        }
	        else {
	            return '';
	        }
	    },
	    
	    // Render content, serverside or client, then update cached content
	    renderContentUpdateCache: function() {
	        params = { };
	        processContent = false;
	        
	        var keys = ['html', 'css', 'js'];
	        
	        for (var i=0; i < keys.length; i++) {
	            var key = keys[i];
	            var upKey = keys[i].toUpperCase();
	           
                if(!this.useCache(key)) {
   	                this['ref' + upKey] = TBData[key];
   	                
       	            if(this.processOnServer(TBData[key + 'PreProcessor'])) {
       	                processContent = true;
       	                params[key] = TBData[key];
       	                params[key + 'PreProcessor'] = TBData[key + 'PreProcessor'];
       	            }
       	            else {
       	                this['cached' + upKey] = TBData[key];
       	            }
   	            }
	        }
	        
	        if(processContent) {
	            CodeRenderer.errHTML = '';
	            this.processContent(params);
	        }
	    },
	    
	    processContent: function(params) {
	        $.ajax({
  				url: '/process/',
  				type: 'POST',
  				async: false,
  				data: this.getDataValues(params),
  				success: function( result ) {
  				    obj = $.parseJSON(result);
  				    
  				    if(obj['errors']) {
  				        CodeRenderer.buildErrorContent(obj['errors']);
  				    }
  				    else {
  				        for(var key in obj) {
      				        var upKey = key.toUpperCase();
      				        if(obj[key]) CodeRenderer['cached' + upKey] = obj[key];
      				    }
  				    }
  				}
			});
	    },
	    
	    // alextodo, need to figure out what's happenning with errors
	    // not being related properly, like if you edit html, but there was previously
	    // an error with css, i should still show error with css
	    
	    // also it seems like like only a single error shows at a time
	    buildErrorContent: function(errors) {
	        CodeRenderer.errHTML = '';
	        
	        // errors exist, show them on content page
	        for(var err in errors) {
	            type = new String(err);
	            
	            CodeRenderer.errHTML += '<p>There was an error with ' + type + ' :(</p>';
	            CodeRenderer.errHTML += '<p><strong>' +errors[err] + '</strong></p>';
	        }
	    },
	    
	    getDataValues: function(params) {
	        var dataValues = '';
	        var count = 0;
	        
	        for(var key in params) {
	            if(count > 0) dataValues += '&';
	            dataValues += key + '=' + encodeURIComponent(params[key]);
	            count += 1;
	        }
	        
	        return dataValues;
	    },
	    
	    clearCache: function(type) {
	        if(type == 'html') {
	            this.refHTML = '';
	        }
	        else if(type == 'css') {
	            this.refCSS = '';
	        }
	        else {
	            this.refJS = '';
	        }
	        
	        CodeRenderer.errHTML = '';
	    },
	    
	    // determine if what's in the editor is the same 
	    // as what's saved in reference (unprocessed content) cache. 
	    // if so use cached version of content, e.g. cachedHTML, cachedCSS
	    useCache: function(type) {
	        if(type == 'html') {
	            if(this.refHTML == TBData.html) return true;
	            else return false;
	        }
	        else if(type == 'css') {
	            if(this.refCSS == TBData.css) return true;
	            else return false;
	        }
	        else {
	            if(this.refJS == TBData.js) return true;
	            else return false;
	        }
	    },
	    
	    // Determine if the content needs to be processed on the server
	    // All preprocessors are rendered server side
	    processOnServer: function(preProcessor) {
	        return (preProcessor && preProcessor != 'none');
	    },

	    getTPL: function(name) {
	    	return __templates[name];
	    }
    };

	return CodeRenderer;

})();