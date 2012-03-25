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
        sharingPan  : $(".sharing-panel"),
        
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

            // select current theme
            $('#theme').val(CData.theme);

            // Better select box for chosing JS library
            $("#js-select, #theme").chosen();

            if(CData.css_prefix_free) $('#prefix-free').prop('checked', true);
            if(CData.js_modernizr) $('#modernizr').prop('checked', true);
            
            // externals
            if(CData.html_classes) $('#html-classes').val(CData.html_classes);
            if(CData.css_external) $('#external-css').val(CData.css_external);
            if(CData.js_external) $('#external-js').val(CData.js_external);
            
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

                var headerHeight = Main.header.outerHeight();
                
                // Window is in default state
                if (!dontTreadOnMe) {

                    var space = Main.body.height();
                    Main.topBoxesCon.height(space / 2 - 28);
                    Main.boxResult.height(space / 2 - 102);
                    
                    Main.vertResizer.css({
                        "top" : ((space / 2) + headerHeight) - 7 + "px"
                    });

                // Window has been effed with already
                } else {

                    Main.vertResizer.css({
                        top: Main.boxResult.offset().top - 15
                    });

                }

                // Always do
                Main.boxes.height(Main.win.height() - headerHeight - 40);
                Main.result.css({
                    "width" : Main.win.width()
                });

               // kick it off once for page load layout
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
                    Main.boxResult.height(((space + headerSpace) - ui.position.top - 8) / space * 100 + "%");
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
                    Main.boxResult.height((space + headerSpace) - ui.position.top - 8);
                    Main.topBoxesCon.height(ui.position.top - 85);
                    Main.boxes.height(Main.win.height());
                },
                containment: Main.boxes
            });
            
            $('#viewsource-html, #viewsource-css, #viewsource-js').on('click', function() {
                if(this.id == 'viewsource-html') HTMLEditor.toggleReadOnly();
                else if(this.id == 'viewsource-css') CSSEditor.toggleReadOnly();
                else if(this.id == 'viewsource-js') JSEditor.toggleReadOnly();
                
                return false;
            });

            $("#sharing-button").on("click", function() {
                Main.sharingPan.toggle();
            });
            
            this.hideSettingsAndPanelsOnblur();
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
                 HTMLEditor.updateCompiledCode();
                 
                 Main.compileContent(HTMLEditor, '', true);
                 Main.addClassBoxHTML(this.value);
             });

             // CSS related
             $('input[name="css-preprocessor"]').on('click', function() {
                   CData.setCSSOption('css_pre_processor', this.value);
                   CSSEditor.updateCompiledCode();
                   
                   Main.compileContent(CSSEditor, '', true);
                   Main.addClassBoxCSS(this.value);
                   Main.updatePrefixFreeBox(this.value);
             });

             // prefix free checkbox
             $('#prefix-free').on('click', function() {
                 if(CData.css_pre_processor != 'sass') {
                    CData.setCSSOption('css_prefix_free', $(this).is(":checked"));
                    
                    Main.compileContent(CSSEditor, '', true);
                 }
             });
             
             // CSS Resests
             $('input[name="startercss"]').on('click', function() {
                 CData.setCSSOption('css_starter', this.value);
                 
                 Main.compileContent(CSSEditor, '', true);
             });

             // JS related
             $('input[name="js-preprocessor"]').on('click', function() {
                 CData.setJSOption('js_pre_processor', this.value);
                 JSEditor.updateCompiledCode();
                 
                 Main.compileContent(JSEditor, '', true);
                 Main.addClassBoxJS(this.value);
             });

             $('#js-select').on('change', function(index, select) {
                 // alextodo, may need to move to an observe model, backbone? too complicated right now
                 CData.setJSOption('js_library', this.value);
                 
                 Main.compileContent(JSEditor, '', true);
             });
             
             $('#modernizr').on('click', function() {
                 CData.setJSOption('js_modernizr', $(this).is(":checked"));
                 
                 Main.compileContent(CSSEditor, '', true);
             });
             
             // alextodo, figure out how long before you start typing again.
             // may need to put these settings into a settings.js file
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

             $("#new").on('click', function() {
                CData.new();
                window.location = '/';
                
                return false;
             });
             
             $('#fork').on('click', function() {
                CData.fork();
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
            window.HTMLEditor = new HTMLEditor('html', CData.html);
            window.CSSEditor = new CSSEditor('css', CData.css);
            window.JSEditor = new JSEditor('js', CData.js);
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
                HTMLEditor.refresh();
                CSSEditor.refresh();
                JSEditor.refresh();
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
        },
        
        hideSettingsAndPanelsOnblur: function() {
            $('body').bind('click', function(e) {
                var elements = $(e.target).closest('.settings,.settings-nub');
                
                if(elements.length == 0) {
                    $('.settings,.settings-nub').removeClass('open');
                    
                    Main.refreshEditors();
                }
                
                // If the user clicks outside of the element, hide them
                elements = $(e.target).
                    closest('#app-settings-button,#app-settings,.app-settings-panel');
                
                if(elements.length == 0) {
                    $('#app-settings').removeClass('open');
                    $("#app-settings-panel").hide();
                    
                    Main.refreshEditors();
                }
            });
        }
    };
    
    Main.init();

})(jQuery);