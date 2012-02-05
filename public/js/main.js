(function($) {

	// "GLOBALS"
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

    // Initialize the data backing object
	TBDB.init();

	// Sync UI with data values

	$('#slug').val(TBDB.name);
	$('#html').html(TBDB.html);
	$('#css').html(TBDB.css);
	$('#js').html(TBDB.js);

	if(TBDB.getOption('css', 'prefixFree') != '') $('#prefix-free').prop('checked', true);

	codeChanged = function(editor, changes) {
		TBDB.setEditorValue(editor.getOption('mode'), editor.getValue());
		CodeRenderer.codeChanged();
	}

	// 
	// INITIALIZE EDITORS
	//
	var HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
	    lineNumbers  : false,
	    value        : TBDB.html,
	    mode         : "xml",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});

	var CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
	    lineNumbers  : false,
	    value        : TBDB.css,
	    mode         : "css",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});

	var JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
	    lineNumbers  : false,
	    value        : TBDB.js,
	    mode         : "javascript",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});
	 
	// Initialize the CodeRenderer
    CodeRenderer.init();

    // Bind events

    // HTML related
    $('input[name="html-preprocessor"]').on('click', function() {
    	TBDB.setHTMLOption('preprocessor', this.value);
    });

    // CSS related
    $('input[name="css-preprocessor"]').on('click', function() {
    	TBDB.setCSSOption('preprocessor', this.value);
    });

    // prefix free checkbox
    $('#prefix-free').on('click', function() {
    	TBDB.setCSSOption('prefixFree', $(this).is(":checked"));
    });

    // JS related
    $('input[name="js-preprocessor"]').on('click', function() {
    	TBDB.setCSSOption('preprocessor', this.value);
    });


})(jQuery);
