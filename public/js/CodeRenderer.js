var CodeRenderer = (function() {

	var CodeRenderer = {
        
	    init: function() {
	    	this.codeChanged();
	    },
	    
	    codeChanged: function() {
	    	var content = CodeRenderer.getResultContent();
	    	CodeRenderer.writeContentToIFrame(content);
	    	CodeRenderer.executeIFrameJS();
	    },

	    writeContentToIFrame: function(content) {
	    	var doc = $('#result').contents()[0];
			doc.open();
			doc.write(content);
			doc.close();
	    },

	    executeIFrameJS: function() {
	    	// TO DO: look at the security implications of this
	    	var contentWindow = $('#result')[0].contentWindow;
	    	
	    	if(contentWindow.__run) {
	    	    contentWindow.__run();
	    	}
	    },

	    getResultContent: function() {
	    	var values = {
  				TITLE : "Tinkerbox",
  				CSS   : this.getCSS(),
  				HTML  : this.getHTML(),
  				JS    : this.getJS(),
  				JSLIB : $("#js-select option:selected").val(),
  				PREFIX: TBData.getOption('css', 'prefixFree')
			};

			return tmpl(this.getTPL('result'), values);
	    },

	    getHTML: function() {
	        // check if any preprocessors are set
	        var html = TBData.html;
	        
	        if(TBData.htmlPreProcessor != 'none') {
	            $.ajax({
      				url: '/process/html/',
      				type: 'POST',
      				async: false,
      				data: 'type=' + TBData.htmlPreProcessor + '&html=' + encodeURI(html),
      				success: function( result ) {
      				    obj = $.parseJSON(result);
        				html = obj.html;
      				}
    			});
	        }
	        
	    	return html;
	    },

       getCSS: function() {
            var css = TBData.css;
	        
	        if(TBData.cssPreProcessor != 'none') {
	            $.ajax({
      				url: '/process/css/',
      				type: 'POST',
      				async: false,
      				data: 'type=' + TBData.cssPreProcessor + '&css=' + encodeURI(css),
      				success: function( result ) {
      				    obj = $.parseJSON(result);
        				css = obj.css;
      				}
    			});
	        }
			
			return css;
	    },

        // coffee script, npm install -g coffee-script
	    getJS: function() {
	    	var js = TBData.js;
	        
	        if(TBData.jsPreProcessor != 'none') {
	            $.ajax({
      				url: '/process/js/',
      				type: 'POST',
      				async: false,
      				data: 'type=' + TBData.jsPreProcessor + '&js=' + encodeURI(js),
      				success: function( result ) {
      				    obj = $.parseJSON(result);
        				js = obj.js;
      				}
    			});
	        }
			
			return js;
	    },

	    getTPL: function(name) {
	    	return __templates[name];
	    }
    };

	return CodeRenderer;

})();