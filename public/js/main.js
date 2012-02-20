(function($) {
    
    window.Main = (function() {

    	var Main = {
            
            init: function() {
                // Initialize the data backing object
                TBData.init();
                
                this.syncUIWithDBO();
                this.buildEditors();
                
                this.bindUIActions();
                this.bindDataActions();
                
            	// Run initial compile
                CodeRenderer.codeChanged(true);
            },
            
            bindUIActions: function() {
                // Resize all boxes when window resized
            	// TO DO: Debounce? 
                win.resize(function() {
            		var space = body.height() - 100; // TO DO: Make less ghetto (problems with floats)
            		topBoxesCon.height(space / 2);
            		boxResult.height(space / 2);
                }).trigger("resize");
                
                // Opening and closing settings panels
                $(".settings-nub").on("click", function(e) {
                    e.preventDefault();
                    $(this)
                        .toggleClass("open")
                        .parent()
                        .parent()
                        .find(".settings")
                        .toggleClass("open");
                });
                
                // Opening and closing the editor
                $(".expander").on("click", function(e) {
                    e.preventDefault();
                    body.toggleClass("focus");
                    
                    $(this)
                        .parent()
                        .parent()
                        .toggleClass("expanded");
                });

                $("#app-settings-panel").position({
                    "my": "right top",
                    "at": "right bottom",
                    "of": "#app-settings",
                    "offset": "5px -1px"
                }).hide(); // to do, adjust position after window size change

                // Opening and closing app settings
                $("#app-settings").on("click", function(e) {
                    e.preventDefault();
                    $("#app-settings-panel").toggle();
                });
            },
            
            bindDataActions: function() {
                // Bind events
                 $('#run').on('click', function() {
                     CodeRenderer.codeChanged(true);
                 });

                 // HTML related
                 $('input[name="html-preprocessor"]').on('click', function() {
               	    TBData.setHTMLOption('preprocessor', this.value);
               	    CodeRenderer.clearCache('html');
               	    Main.codeChanged(HTMLeditor, '', true);
                    $(".box-html").removeClass("jade haml").addClass(this.value);
                 });

                 // CSS related
                 $('input[name="css-preprocessor"]').on('click', function() {
               	    TBData.setCSSOption('preprocessor', this.value);
               	    CodeRenderer.clearCache('css');
               	    Main.codeChanged(CSSeditor, '', true);
                    $(".box-css").removeClass("scss sass stylus less").addClass(this.value);
                 });

                 // prefix free checkbox
                 $('#prefix-free').on('click', function() {
                     TBData.setPrefixFree($(this).is(":checked"));
                 });
                 
                 // CSS Resests
                 $('input[name="startercss"]').on('click', function() {
                     TBData.setCSSStarter(this.value);
                 });

                 // JS related
                 $('input[name="js-preprocessor"]').on('click', function() {
               	    TBData.setJSOption('preprocessor', this.value);
               	    CodeRenderer.clearCache('js');
               	    Main.codeChanged(JSeditor, '', true);
                    $(".box-js").removeClass("coffeescript").addClass(this.value);
                 });

                 $('#js-select').on('change', function(index, select) {
                     TBData.setJSLibrary(this.value);
                 });

                 $('#theme').on('change', function(index, select) {
                     TBData.setTheme(this.value);
                     // Update current theme
                     body.attr("data-theme", this.value);
                 });
                 
                 $("#save-template").on('click', function() {
                      // alextodo, save as template to user settings
                      // will you need anything else beyond that? will u have to give ur template a name?
                      // will it be an overlay, where will the user select an existing template 
                      $("#app-settings-panel").toggle();
                 });
                 
                 // Bind keys
                 KeyBindings.init(HTMLeditor, CSSeditor, JSeditor);
            },
            
            syncUIWithDBO: function() {
                // Sync UI with data values
            	$('#slug').val(TBData.name);
            	$('#html').html(TBData.html);
            	$('#css').html(TBData.css);
            	$('#js').html(TBData.js);
            	
                // Sync preprocessors with correct data
            	$('input[value="' + TBData.htmlPreProcessor + '"]').attr('checked', true);
                $('input[value="' + TBData.cssPreProcessor + '"]').attr('checked', true);
                $('input[value="' + TBData.cssStarter + '"]').attr('checked', true);
                $('input[value="' + TBData.jsPreProcessor + '"]').attr('checked', true);
                
                // Set the header type indicator for editors
                $(".box-html").addClass(TBData.htmlPreProcessor);
                $(".box-css").addClass(TBData.cssPreProcessor);
                $(".box-js").addClass(TBData.jsPreProcessor);
                
                // Sync library with correct data as well
                $('#js-select').val(TBData.jsLibrary);

                // Better select box for chosing JS library
                $("#js-select, #theme").chosen();

            	if(TBData.cssPreFixFree != '') $('#prefix-free').prop('checked', true);
            	
            	// select current theme
                $('#theme').val(TBData.theme);
                // show a specific theme
                body.attr("data-theme", TBData.theme);
            },
            
            buildEditors: function() {
                // 
            	// INITIALIZE EDITORS
            	//
            	window.HTMLeditor = CodeMirror.fromTextArea(document.getElementById("html"), {
            	    lineNumbers  : true,
            	    value        : TBData.html,
            	    mode         : "xml",
            	    tabSize      : 2,
            	    onChange     : Main.codeChanged
            	});

            	window.CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
            	    lineNumbers  : true,
            	    value        : TBData.css,
            	    mode         : "css",
            	    tabSize      : 2,
            	    onChange     : Main.codeChanged
            	});

            	window.JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
            	    lineNumbers  : true,
            	    value        : TBData.js,
            	    mode         : "javascript",
            	    tabSize      : 2,
            	    onChange     : Main.codeChanged
            	});
            },
            
            codeChanged: function(editor, changes, forceCompile) {
        		TBData.setEditorValue(editor.getOption('mode'), editor.getValue());
        		CodeRenderer.codeChanged(forceCompile);
        	},
        	
        	openExpandedArea: function(areaID) {
        	    Main.closeExpandedAreas();
                $(areaID).addClass('expanded');
        	},
        	
        	closeExpandedAreas: function() {
                $.each($(".expander"), function(index, el) {
                    body.toggleClass("focus");

                    $(this)
                        .parent()
                        .parent()
                        .removeClass('expanded');
                });
            }
        };

    	// This ends the Main module

    	return Main;

    })();
    
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
	
    Main.init();
})(jQuery);