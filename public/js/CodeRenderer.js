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
  				PREFIX: TBDB.getOption('css', 'prefixFree')
			};

			return Mustache.render(this.getTPL('result'), values);
	    },

        // alextodo, start saving the state of the buttons
	    getHTML: function() {
	        // check if any preprocessors are set
	        var html = TBDB.html;
	        
	        if(TBDB.htmlOptions['preprocessor'] == 'jade') {
	            $.ajax({
      				url: '/process/html/',
      				type: 'POST',
      				async: false,
      				data: 'type=jade&html=' + html,
      				success: function( result ) {
      				    obj = $.parseJSON(result);
        				html = obj.html;
      				}
    			});
	        }
	        
	    	return html;
	    },

	    getCSS: function() {
	    	return TBDB.css;

	    	$.ajax({
  				url: '/backend.php',
  				type: 'POST',
  				async: false,
  				data: 'less=' + css,
  				success: function( result ) {
    				css = result;
  				}
			});
			
			return css;
	    },

	    getJS: function() {
	    	return TBDB.js;
	    },

	    getTPL: function(name) {
	    	return __templates[name];
	    }
    };

	return CodeRenderer;

})();