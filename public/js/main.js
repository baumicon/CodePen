(function($) {
    
    window.Main = (function() {

        var Main = {
            
            win         : $(window),
            body        : $('body'),
            boxHTML     : $("#box-html"),
            boxCSS      : $("#box-css"),
            boxJS       : $("#box-js"),
            boxResult   : $(".result"),
            result      : $("#result"),
            boxes       : $(".boxes"),
            topBoxesCon : $(".top-boxes"),
            vertResizer : $("#vert-resizer"),
            
            init: function() {
                // Initialize the data backing object first
                TBData.init();
                
                this.syncUIWithDBO();
                this.buildEditors();
                
                this.bindUIActions();
                this.bindDataActions();
                
                // Run initial compile
                CodeRenderer.init();
            },
            
            syncUIWithDBO: function() {
                // Sync UI with data values
                $('#slug').val(TBData.name);
                $('#html').html(TBData.html);
                $('#css').html(TBData.css);
                $('#js').html(TBData.js);
                
                // Sync preprocessors with correct data
                // alextodo, for some reason these stopped working, why?
                // I can't check the radio button anymore
                $('input[type="radio"]').prop('checked', false);
                $('input[value="' + TBData.htmlPreProcessor + '"]').prop('checked', true);
                $('input[value="' + TBData.cssPreProcessor + '"]').prop('checked', true);
                $('input[value="' + TBData.cssStarter + '"]').prop('checked', true);
                $('input[value="' + TBData.jsPreProcessor + '"]').prop('checked', true);
                
                Main.updatePrefixFreeBox(TBData.cssPreProcessor);
                
                // Set the header type indicator for editors
                this.addClassBoxHTML(TBData.htmlPreProcessor);
                this.addClassBoxCSS(TBData.cssPreProcessor);
                this.addClassBoxJS(TBData.jsPreProcessor);
                
                // Sync library with correct data as well
                $('#js-select').val(TBData.jsLibrary);

                // Better select box for chosing JS library
                $("#js-select, #theme").chosen();

                if(TBData.cssPrefixFree) $('#prefix-free').prop('checked', true);
                if(TBData.jsModernizr) $('#modernizr').prop('checked', true);
                
                // externals
                if(TBData.htmlClasses) $('#html-classes').val(TBData.htmlClasses);
                if(TBData.cssExternal) $('#external-css').val(TBData.cssExternal);
                if(TBData.jsExternal) $('#external-js').val(TBData.jsExternal);
                
                // select current theme
                $('#theme').val(TBData.theme);
                // show a specific theme
                this.body.attr("data-theme", TBData.theme);
            },
            
            addClassBoxHTML: function(clazz) {
                this.boxHTML.removeClass('none jade haml').addClass(clazz);
            },
            
            addClassBoxCSS: function(clazz) {
                this.boxCSS.removeClass("scss sass stylus less").addClass(clazz);
            },
            
            addClassBoxJS: function(clazz) {
                this.boxJS.removeClass("coffeescript").addClass(clazz);
            },
            
            bindUIActions: function() {
                // Resize all boxes when window resized
                this.win.resize(function() {
                    var space = Main.body.height() - 25;
                    Main.topBoxesCon.height(space / 2);
                    Main.boxResult.height(space / 2);
                    Main.result.css({
                        "height"  : space / 2,
                        "width"   : Main.win.width()
                    });
                    Main.boxes.height(Main.win.height());
                    Main.vertResizer.css({
                        "top"    : space / 2 + 82 + "px",
                    });
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
                    Main.body.toggleClass("focus");
                    $(this)
                        .parent()
                        .parent()
                        .toggleClass("expanded");
                });

                $("#app-settings-panel").hide();

                // Opening and closing app settings
                $("#app-settings").on("click", function(e) {
                    e.preventDefault();
                    $("#app-settings-panel").toggle();
                });
            },
            
            bindDataActions: function() {
                // Bind events
                 $('#run').on('click', function() {
                     CodeRenderer.compileContent(true);
                 });

                 // HTML related
                 $('input[name="html-preprocessor"]').on('click', function() {
                     TBData.setHTMLOption('preprocessor', this.value);
                     Main.compileContent(HTMLeditor, '', true);
                     Main.addClassBoxHTML(this.value);
                 });

                 // CSS related
                 $('input[name="css-preprocessor"]').on('click', function() {
                       TBData.setCSSOption('preprocessor', this.value);
                       Main.compileContent(CSSeditor, '', true);
                       Main.addClassBoxCSS(this.value);
                       Main.updatePrefixFreeBox(this.value);
                 });

                 // prefix free checkbox
                 $('#prefix-free').on('click', function() {
                     if(TBData.cssPreProcessor != 'sass') {
                        TBData.setPrefixFree($(this).is(":checked"));
                     }
                 });
                 
                 // CSS Resests
                 $('input[name="startercss"]').on('click', function() {
                     TBData.setCSSStarter(this.value);
                     Main.compileContent(CSSeditor, '', true);
                 });

                 // JS related
                 $('input[name="js-preprocessor"]').on('click', function() {
                       TBData.setJSOption('preprocessor', this.value);
                       Main.compileContent(JSeditor, '', true);
                       Main.addClassBoxJS(this.value);
                 });

                 $('#js-select').on('change', function(index, select) {
                     TBData.setJSLibrary(this.value);
                 });
                 
                 $('#modernizr').on('click', function() {
                     TBData.setModernizr($(this).is(":checked"));
                 });
                 
                 $('#html-classes,#external-css,#external-js').on('keyup', function(e) {
                     if(this.id == 'html-classes') TBData.setHTMLClass(this.value);
                     else if(this.id == 'external-css') TBData.setCSSExternal(this.value);
                     else if(this.id == 'external-js') TBData.setJSExternal(this.value);
                 });
                 
                 // Theme related

                 $('#theme').on('change', function(index, select) {
                     TBData.setTheme(this.value);
                     // Update current theme
                     Main.body.attr("data-theme", this.value);
                 });
                 
                 $("#save-template").on('click', function() {
                      // alextodo, save as template to user settings
                      // will you need anything else beyond that? will u have to give ur template a name?
                      // will it be an overlay, where will the user select an existing template 
                      $("#app-settings-panel").toggle();
                 });
                 
                 // save this code pen
                 $("#save").on('click', function() {
                    // save data to backend
                 });
                 
                 // Bind keys
                 KeyBindings.init(HTMLeditor, CSSeditor, JSeditor);
            },
            
            updatePrefixFreeBox: function(cssPreProcessor) {
                if(cssPreProcessor == 'sass') {
                       // turn off prefix free
                       TBData.setPrefixFree(false);
                       $('#prefix-free').prop('checked', false);
                       $('#prefix-free').prop('disabled', true);
                   }
                   else {
                       $('#prefix-free').prop('disabled', false);
                   }
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
                    onChange     : Main.compileContent,
                });

                window.CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
                    lineNumbers  : true,
                    value        : TBData.css,
                    mode         : "css",
                    tabSize      : 2,
                    onChange     : Main.compileContent
                });

                window.JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
                    lineNumbers  : true,
                    value        : TBData.js,
                    mode         : "javascript",
                    tabSize      : 2,
                    onChange     : Main.compileContent
                });
            },
            
            compileContent: function(editor, changes, forceCompile) {
                TBData.setEditorValue(editor.getOption('mode'), editor.getValue());
                CodeRenderer.compileContent(forceCompile);
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
    
    Main.init();

})(jQuery);