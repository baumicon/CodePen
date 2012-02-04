(function($) {

	// $(".settings").hide().css({
	// 	"height": "auto"
	// });
	
	$(".settings-nub").on("click", function(e) {

		e.preventDefault();
		
		$(this).toggleClass("open").next().toggleClass("open");

	});

	var win          = $(window),
		body         = $("body"),

        boxHTML      = $(".box-html"),
        boxCSS       = $(".box-css"),
        boxJS        = $(".box-js"),
        boxResult    = $(".result"),

        topBoxes     = $(".box-html, .box-css, .box-js");

    win.resize(function() {
    	
		var space = body.height() - 100; // 100 is ghetto

		topBoxes.height(space / 2);

		boxResult.height(space / 2);

    }).trigger("resize");



})(jQuery);

var CodeRenderer = (function() {
	// CodeRenderer Module
	var CodeRenderer = {

	    init: function() {

	    },
	    
	    codeChanged: function(editor, changes) {
	    	var content = CodeRenderer.getResultContent();
	    	console.log(content);
			CodeRenderer.getResultIFrameBody().html(content);

			$('#result')[0].contentWindow.__run();
	    },

	    getResultIFrameBody: function() {
	    	return $('#result').contents().find('body');
	    },

	    getResultContent: function() {
	    	var values = {
  				title : "Tinkerbox",
  				CSS   : CSSeditor.getValue(),
  				HTML  : HTMLeditor.getValue(),
  				JS    : JSeditor.getValue()
			};

			return Mustache.render(this.getTPL('result'), values);
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