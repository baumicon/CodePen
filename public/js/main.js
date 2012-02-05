(function($) {

	// "GLOBALS"
	var PrefixFreeCheckbox = $("#prefix-free");

	var win          = $(window),
		body         = $("body"),

        boxHTML      = $(".box-html"),
        boxCSS       = $(".box-css"),
        boxJS        = $(".box-js"),
        boxResult    = $(".result"),

        topBoxes     = $(".box-html, .box-css, .box-js");

    // Opening and closing settings panels
    $(".settings-nub").on("click", function(e) {
		e.preventDefault();
		$(this).toggleClass("open").next().toggleClass("open");
	});

	// Resize all boxes when window resized
    win.resize(function() {
		var space = body.height() - 100; // TODO: Make less ghetto (problems with floats)
		topBoxes.height(space / 2);
		boxResult.height(space / 2);
    }).trigger("resize");

    // Better select box for chosing JS library
    $("#js-select").chosen(); 

    var CodeRenderer = (function() {

		var CodeRenderer = {

		    init: function() {

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

		    	var PrefixURL = "";

		    	if (PrefixFreeCheckbox.is(":checked")) {
		    		// TODO: Make URL Dynamic or Settable
		    		PrefixURL = "/box-libs/prefixfree.min.js";
		    	}

		    	var values = {
	  				TITLE : "Tinkerbox",
	  				CSS   : this.getCSS(),
	  				HTML  : HTMLeditor.getValue(),
	  				JS    : JSeditor.getValue(),
	  				JSLIB : $("#js-select option:selected").val(),
	  				PREFIX: PrefixURL
				};

				return Mustache.render(this.getTPL('result'), values);
		    },

		    getCSS: function() {
		    	css = CSSeditor.getValue();
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

		    getTPL: function(name) {
		    	return __templates[name];
		    }
	    };
    
    // This ends the CodeRenderer module
    
    return CodeRenderer;

	})();


	// 
	// INITIALIZE EDITORS
	//
	var HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
	    lineNumbers  : false,
	    value        : "<div>Howdy, folks!</div>",  // TODO: Load HTML Template Here
	    mode         : "html",
	    tabSize      : 2,
	    onChange: CodeRenderer.codeChanged
	});

	var CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
	    lineNumbers  : false,
	    value        : "body { background: #BADA55; }",  // TODO: Load CSS Template Here
	    mode         : "css",
	    tabSize      : 2,
	    onChange: CodeRenderer.codeChanged
	});

	var JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
	    lineNumbers  : false,
	    value        : "var myString = 'Badda bing!';",  // TODO: Load Template Here
	    mode         : "javascript",
	    tabSize      : 2,
	    onChange: CodeRenderer.codeChanged
	});

	// When page loads, have result there
	CodeRenderer.codeChanged();

})(jQuery);
