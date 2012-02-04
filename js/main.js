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


var HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
    lineNumbers: true
});

var CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
    lineNumbers: true
});

var JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
    lineNumbers: true
});