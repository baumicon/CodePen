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
	    	// todo, look at the security implications of this
	    	$('#result')[0].contentWindow.__run();
	    },

	    getResultContent: function() {
	    	var values = {
  				TITLE : "Tinkerbox",
  				CSS   : this.getCSS(),
  				HTML  : this.getHTML(),
  				JS    : this.getJS(),
  				JSLIB : $("#js-select option:selected").val(),
  				PREFIX: TBDB.getPrefixFree()
			};

			return Mustache.render(this.getTPL('result'), values);
	    },

	    getHTML: function() {
	    	return TBDB.html;
	    },

	    getCSS: function() {
	    	return TBDB.css;

	    	return css;

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

// This ends the CodeRenderer module

return CodeRenderer;

})();