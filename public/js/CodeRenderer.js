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

        // alextodo, start saving the state of the buttons
        // finish creating the backend service for preprocessors
        // none - done
        // jade  - done
        // haml - ruby, a simple gem
	    getHTML: function() {
	        // check if any preprocessors are set
	        var html = TBData.html;
	        
	        if(TBData.htmlPreProcessor == 'jade') {
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

        // less, npm install less
        // stylus - npm , npm install stylus
        // sass - ruby
        // sass with compass - gem install compass
        // prefix free, what's up with that?
	    getCSS: function() {
	    	return TBData.css;

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

        // coffee script, npm install -g coffee-script
	    getJS: function() {
	    	return TBData.js;
	    },

	    getTPL: function(name) {
	    	return __templates[name];
	    }
    };

	return CodeRenderer;

})();