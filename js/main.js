(function($) {

	$(".settings").hide().css({
		"height": "auto"
	});
	
	$(".settings-nub").on("click", function(e) {

		e.preventDefault();
		
		$(this).toggleClass("open").next().slideToggle();

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
	    	console.log(changes);
	    }
    };
    // This ends the CodeRenderer module
    
    return CodeRenderer;
})();


var HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
    lineNumbers: true,
    onChange: CodeRenderer.codeChanged
});

var CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
    lineNumbers: true,
    onChange: CodeRenderer.codeChanged
});

var JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
    lineNumbers: true,
    onChange: CodeRenderer.codeChanged
});