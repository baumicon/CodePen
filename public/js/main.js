var KeyBindings = (function() {

	/***********************
	* Manages the key bindings for Tinkerbox
	*
	* Tinkerbox, let's get fancy
	* Tinkerbox, women wear dresses, men use Tinkerbox
	* Tinkerbox, don't let your mom catch you using it
	* Tinkerbox, hide your women, hide your childen
	************************/

	var KeyBindings = {

		lastKeyPressed:  0,
		altKeyPressedPreviously: false,
		
		HTMLeditor: '', 
		CSSeditor: '', 
		JSeditor: '',

	    init: function(HTMLeditor, CSSeditor, JSeditor) {
	    	this.bindKeys();
	    	this.HTMLeditor = HTMLeditor;
	    	this.CSSeditor = CSSeditor;
	    	this.JSeditor = JSeditor;
	    },
	    
	    giveEditorFocus: function(editor) {
	        editor.focus();
            KeyBindings.setCursorToEnd(editor);
	    },
	    
	    setCursorToEnd: function(editor) {
	        var text = editor.getValue();
            
            // set the cursor to the end of the editor
            // Make sure it's at the end by line num and char num to
            // same value as the actual number of chars, CodeMirror will
            // simply move the cursor to the end
            editor.setCursor(text.length, text.length, true);
	    },
        
        // todo, implment CMD-SHIFT-C - Copy current URL
        bindKeys: function() {
            $(window).on('keydown keypress', function(event) {
                // mac os x uses command key (91) as alt key
                // every other OS uses actual alt key (18)
                if(KeyBindings.lastKeyPressed == 18 || KeyBindings.lastKeyPressed == 91) {
                    this.altKeyPressedPreviously = true;
                }
                else {
                    this.altKeyPressedPreviously = false;
                }
                
                // If the user is holding down the cmd key, then you won't get another key press
                // event for that. Only update lastKeyPressed only if key isn't the same as previous key
                if(KeyBindings.lastKeyPressed != event.keyCode) {
                    KeyBindings.lastKeyPressed = event.keyCode;
                }
                
                stop = false;
                
                // Process all the altKey pressed events
                if(altKeyPressedPreviously) {
                    if(event.keyCode == 49) {
                        // cmd + 1
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.HTMLeditor);
                    }
                    else if(event.keyCode == 50) {
                        // cmd + 2
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.CSSeditor);
                    }
                    else if(event.keyCode == 51) {
                        // cmd + 3
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.JSeditor);
                    }
                    else if(event.keyCode == 67) {
                        // cmd + c
                        // compile and run code
                        console.log('compile');
                        CodeRenderer.codeChanged();
                    }
                    else if(event.keyCode == 70) {
                        // command + K
                        // fork this project
                        console.log('fork');
                    }
                    else if(event.keyCode == 71) {
                        // command + g
                        // create a gist
                        console.log('gist');
                    }
                    else if(event.keyCode == 78) {
                        // command + n
                        // create a new tinker box
                        console.log('create new tinker box in new tab');
                        stop = true;
                    }
                    else if(event.keyCode == 83) {
                        // command + s
                        console.log('save');
                        stop = true;
                    }
                }
                
                if(stop) {
                    $.Event(event).stopPropagation();
                    
                    return false;
                }
            });
        }
    };

	// This ends the KeyBindings module

	return KeyBindings;

})();

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

	// Resize all boxes when window resized
	// TO DO: Debounce? 
    win.resize(function() {
		var space = body.height() - 100; // TO DO: Make less ghetto (problems with floats)
		topBoxes.height(space / 2);
		boxResult.height(space / 2);
		handle3.css("top", "50%");
    }).trigger("resize");

    // Better select box for chosing JS library
    $("#js-select").chosen();

    handle1.draggable({
    	containment  : 'parent',
    	axis         : 'x',
    	drag         : function(e, ui) {
    		var percent = (ui.position.left / topBoxesCon.width() * 100);
    		boxHTML.css("width", percent + "%");
    		var leftover = 100 - percent;
    		var split = leftover / 2;
    		boxCSS.css("width", split + "%");
    		boxJS.css("width", split + "%");
    		handle2.css("left", (percent + split) + "%");
    	}
    });
    handle2.draggable({
    	containment  : 'parent',
    	axis         : 'x',
    	drag         : function(e, ui) {
			var percent = 100 - (ui.position.left / topBoxesCon.width() * 100);
    		boxJS.css("width", percent + "%");
    		var leftover = 100 - percent;
    		var split = leftover / 2;
    		boxCSS.css("width", split + "%");
    		boxHTML.css("width", split + "%");
    		handle1.css("left", split + "%");
    	}
    });
    handle3.draggable({
    	containment  : 'parent',
    	axis         : 'y',
    	drag         : function(e, ui) {
			var percent =  ui.position.top / boxes.height() * 100;
			topBoxes.css("height", ui.position.top + "px");
			boxResult.css("height", (100 - percent) + "%");
    	}
    });

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
		if(TBDB.compileInRealTime) CodeRenderer.codeChanged();
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

    // Bind keys
    KeyBindings.init(HTMLeditor, CSSeditor, JSeditor);

})(jQuery);