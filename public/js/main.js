(function($) {
    
    Main = {
        win         : $(window),
        body        : $('body'),
        header      : $('body > header'),
        boxHTML     : $("#box-html"),
        boxCSS      : $("#box-css"),
        boxJS       : $("#box-js"),
        boxResult   : $(".result"),
        boxResPos   : $(".result").position(),
        result      : $("#result"),
        boxes       : $(".boxes"),
        topBoxesCon : $(".top-boxes"),
        vertResizer : $("#vert-resizer"),
        
        init: function() {
            // Initialize the data backing object first
            CData.init();
            
            this.syncUIWithDBO();
            this.buildEditors();
            
            this.bindUIActions();
            this.bindDataActions();
            
            // Run initial compile
            CodeRenderer.init();
            this.refreshEditors();
        },
        
        syncUIWithDBO: function() {
            // Sync UI with data values
            $('#slug').val(CData.name);
            $('#html').html(CData.html);
            $('#css').html(CData.css);
            $('#js').html(CData.js);
            
            // Sync preprocessors with correct data
            var selector = function(prefix, value) {
                return ':input[name="' + prefix + '-preprocessor"][value="' + value + '"]';
            }
            
            $(selector('html', CData.html_pre_processor)).prop('checked', true);
            $(selector('css', CData.css_pre_processor)).prop('checked', true);
            $(selector('js', CData.js_pre_processor)).prop('checked', true);
            
            $('input[value="' + CData.css_starter + '"]').prop('checked', true);
            
            Main.updatePrefixFreeBox(CData.css_pre_processor);
            
            // Set the header type indicator for editors
            this.addClassBoxHTML(CData.html_pre_processor);
            this.addClassBoxCSS(CData.css_pre_processor);
            this.addClassBoxJS(CData.js_pre_processor);
            
            // Sync library with correct data as well
            $('#js-select').val(CData.js_library);

            // Better select box for chosing JS library
            $("#js-select, #theme").chosen();

            if(CData.css_prefix_free) $('#prefix-free').prop('checked', true);
            if(CData.js_modernizr) $('#modernizr').prop('checked', true);
            
            // externals
            if(CData.html_classes) $('#html-classes').val(CData.html_classes);
            if(CData.css_external) $('#external-css').val(CData.css_external);
            if(CData.js_external) $('#external-js').val(CData.js_external);
            
            // select current theme
            $('#theme').val(CData.theme);
            // show a specific theme
            this.body.attr("data-theme", CData.theme);
        },
        
        addClassBoxHTML: function(clazz) {
            this.boxHTML.removeClass('none jade slim haml').addClass(clazz);
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

                if (!dontTreadOnMe) {

                    var space = Main.body.height();
                    Main.topBoxesCon.height(space / 2 - 28);
                    Main.boxResult.height(space / 2);
                    
                    Main.vertResizer.css({
                        "top" : ((space / 2) + Main.header.outerHeight()) - 7 + "px"
                    });

                } else {

                    Main.vertResizer.css({
                        top: Main.boxResult.offset().top - 15
                    });

                }

                // Always do
                Main.boxes.height(Main.win.height());
                Main.result.css({
                    "width" : Main.win.width()
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
                $(this).toggleClass("open");
                $("#app-settings-panel").toggle();
            });

            // Resizer
            var dragCover = $("#drag-cover");
            var dontTreadOnMe = false;
            $("#vert-resizer").draggable({
                // iframeFix: true,   // DOES NOT WORK AS GOOD
                start: function() {
                    dragCover.show();
                },
                stop: function(e, ui) {
                    dragCover.hide();

                    var space = Main.body.height();
                    var headerSpace = Main.header.outerHeight();

                    // Adjust the parts
                    Main.topBoxesCon.height(((ui.position.top - 85) / space) * 100 + "%");
                    Main.boxResult.height(((space + headerSpace) - ui.position.top) / space * 100 + "%");
                    Main.vertResizer.css({
                        "top" : (ui.position.top / space * 100) + "%",
                    });
                    
                    // Big daddy
                    Main.boxes.height(Main.win.height());

                    // Don't reset back to halfs anymore, this is the new jam
                    dontTreadOnMe = true;
                },
                axis: "y",
                drag: function(e, ui) {
                    var space = Main.body.height();
                    var headerSpace = Main.header.outerHeight();
                    Main.boxResult.height((space + headerSpace) - ui.position.top);
                    Main.topBoxesCon.height(ui.position.top - 85);
                    Main.boxes.height(Main.win.height());
                }
            });

        },
        
        bindDataActions: function() {
            // Bind events
             $('#run').on('click', function() {
                 CodeRenderer.compileContent(true);
             });
             
             // todo
             // once the slug is set, you can't edit it
             // you can only fork it and create a second slug
             $('#slug').on('keydown', function() {
                 CData.setSlug(this.value);
             });
             
             // HTML related
             $('input[name="html-preprocessor"]').on('click', function() {
                 CData.setHTMLOption('preprocessor', this.value);
                 Main.compileContent(HTMLeditor, '', true);
                 Main.addClassBoxHTML(this.value);
             });

             // CSS related
             $('input[name="css-preprocessor"]').on('click', function() {
                   CData.setCSSOption('css_pre_processor', this.value);
                   Main.compileContent(CSSeditor, '', true);
                   Main.addClassBoxCSS(this.value);
                   Main.updatePrefixFreeBox(this.value);
             });

             // prefix free checkbox
             $('#prefix-free').on('click', function() {
                 if(CData.css_pre_processor != 'sass') {
                    CData.setCSSOption('css_prefix_free', $(this).is(":checked"));
                 }
             });
             
             // CSS Resests
             $('input[name="startercss"]').on('click', function() {
                 CData.setCSSOption('css_starter', this.value);
                 Main.compileContent(CSSeditor, '', true);
             });

             // JS related
             $('input[name="js-preprocessor"]').on('click', function() {
                 CData.setJSOption('js_pre_processor', this.value);
                 Main.compileContent(JSeditor, '', true);
                 Main.addClassBoxJS(this.value);
             });

             $('#js-select').on('change', function(index, select) {
                 CData.setJSOption('js_library', this.value);
             });
             
             $('#modernizr').on('click', function() {
                 CData.setJSOption('js_modernizr', $(this).is(":checked"));
             });
             
             $('#html-classes,#external-css,#external-js').on('keyup', function(e) {
                 if(this.id == 'html-classes') CData.setHTMLClass(this.value);
                 else if(this.id == 'external-css') CData.setCSSOption('css_external', this.value);
                 else if(this.id == 'external-js') CData.setJSOption('js_external', this.value);
             });
             
             // Theme related

             $('#theme').on('change', function(index, select) {
                 CData.setTheme(this.value);
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
             $("#save,#update").on('click', function() {
                // validate save
                CData.save();
                
                return false;
             });
             
             $('#logout').on('click', function() {
                CData.logout();
             });
             
             // Bind keys
             KeyBindings.init();
        },
        
        updatePrefixFreeBox: function(css_pre_processor) {
            if(css_pre_processor == 'sass') {
                   // turn off prefix free
                   CData.setCSSOption('css_prefix_free', false);
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
                value        : CData.html,
                mode         : "xml",
                tabSize      : 2,
                onChange     : Main.compileContent,
            });

            window.CSSeditor = CodeMirror.fromTextArea(document.getElementById("css"), {
                lineNumbers  : true,
                value        : CData.css,
                mode         : "css",
                tabSize      : 2,
                onChange     : Main.compileContent
            });

            window.JSeditor = CodeMirror.fromTextArea(document.getElementById("js"), {
                lineNumbers  : true,
                value        : CData.js,
                mode         : "javascript",
                tabSize      : 2,
                onChange     : Main.compileContent
            });

            HTMLeditor.setValue(CData.html);
            CSSeditor.setValue(CData.css);
            JSeditor.setValue(CData.js);
        },

        refreshEditors: function(delay) {
            // Sometimes you have to wait a few milliseconds
            // for a task to complete before updating the editor
            // is effective. This delay makes sure the refresh actually
            // works.
            if(delay > 0) {
                setTimeout(function() {
                    Main.refreshEditors(0);
                }, delay);
            }
            else {
                HTMLeditor.refresh();
                CSSeditor.refresh();
                JSeditor.refresh();
            }
        },
        
        compileContent: function(editor, changes, forceCompile) {
            CData.setEditorValue(editor.getOption('mode'), editor.getValue());
            CodeRenderer.compileContent(forceCompile);
        },
        
        openExpandedArea: function(areaID) {
            Main.closeExpandedAreas();
            $(areaID).addClass('expanded');
        },
        
        closeExpandedAreas: function() {
            $.each($(".expander"), function(index, el) {
                Main.body.toggleClass("focus");

                $(this)
                    .parent()
                    .parent()
                    .removeClass('expanded');
            });
        }
    };
    
    Main.init();

})(jQuery);