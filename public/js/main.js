(function($) {

	// "GLOBALS"
	var win          = $(window),
		  body         = $("body"),

		  boxes        = $(".boxes"),
      boxHTML      = $(".box-html"),
      boxCSS       = $(".box-css"),
      boxJS        = $(".box-js"),
      boxResult    = $(".result"),

      topBoxesCon  = $(".top-boxes"),
      topBoxes     = $(".box-html, .box-css, .box-js"),

      handle1      = $("#handle-1"),
      handle2      = $("#handle-2"),
      handle3      = $("#handle-3");

  // Opening and closing settings panels
  $(".settings-nub").on("click", function(e) {
    e.preventDefault();
    $(this).toggleClass("open").next().toggleClass("open");
  });

  $("#app-settings-panel").position({
      "my": "right top",
      "at": "right bottom",
      "of": "#app-settings",
      "offset": "5px -1px"
    }).hide();

  // Opening and closing app settings
  $("#app-settings").on("click", function(e) {
    e.preventDefault();
    $("#app-settings-panel").toggle();
  });

  // Change Theme
  $("#theme").change(function() { // TO DO: Test change event in other browsers
    body.attr("data-theme", $(this).find(":selected").val());
  })

	// Resize all boxes when window resized
	// TO DO: Debounce? 
  win.resize(function() {
		var space = body.height() - 100; // TO DO: Make less ghetto (problems with floats)
		topBoxes.height(space / 2);
		boxResult.height(space / 2);
  }).trigger("resize");

  // Better select box for chosing JS library
  $("#js-select, #theme").chosen();

    // Initialize the data backing object
	TBData.init();

	// Sync UI with data values
	$('#slug').val(TBData.name);
	$('#html').html(TBData.html);
	$('#css').html(TBData.css);
	$('#js').html(TBData.js);
	
	// Sync preprocessors with correct data
	$('input[name="html-preprocessor"]').each(function(index, input) {
	    input.checked = (TBData.htmlPreProcessor == input.value) ? true : false;
	});
	
    $('input[name="css-preprocessor"]').each(function(index, input) {
    	input.checked = (TBData.cssPreProcessor == input.value) ? true : false;
    });

    $('input[name="js-preprocessor"]').each(function(index, input) {
    	input.checked = (TBData.jsPreProcessor == input.value) ? true : false;
    });

	if(TBData.getOption('css', 'prefixFree') != '') $('#prefix-free').prop('checked', true);

	codeChanged = function(editor, changes) {
		TBData.setEditorValue(editor.getOption('mode'), editor.getValue());
		if(TBData.compileInRealTime) CodeRenderer.codeChanged();
	}

	// 
	// INITIALIZE EDITORS
	//
	var HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
	    lineNumbers  : false,
	    value        : TBData.html,
	    mode         : "xml",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});

	var CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
	    lineNumbers  : false,
	    value        : TBData.css,
	    mode         : "css",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});

	var JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
	    lineNumbers  : false,
	    value        : TBData.js,
	    mode         : "javascript",
	    tabSize      : 2,
	    onChange     : this.codeChanged
	});
	 
	// Initialize the CodeRenderer
    CodeRenderer.init();

    // Bind events
    
    // HTML related
    $('input[name="html-preprocessor"]').on('click', function() {
    	TBData.setHTMLOption('preprocessor', this.value);
    	codeChanged(HTMLeditor);
    });

    // CSS related
    $('input[name="css-preprocessor"]').on('click', function() {
    	TBData.setCSSOption('preprocessor', this.value);
    	codeChanged(CSSeditor);
    });

    // prefix free checkbox
    $('#prefix-free').on('click', function() {
    	TBData.setCSSOption('prefixFree', $(this).is(":checked"));
    });

    // JS related
    $('input[name="js-preprocessor"]').on('click', function() {
    	TBData.setCSSOption('preprocessor', this.value);
    	codeChanged(JSeditor);
    });

    // Bind keys
    KeyBindings.init(HTMLeditor, CSSeditor, JSeditor);

})(jQuery);