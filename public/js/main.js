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
            window.Data = new Data();
            
            this.syncUIWithData();
            this.buildEditors();
            this.bindUIActions();
            this.bindDataActions();
            
            window.CodeRenderer = new CodeRenderer();
            
            this.afterPageLoad();
        },
        
        syncUIWithData: function() {
            // Sync UI with data values
            this.selectPreProcessors();
            
            $('input[value="' + Data.css_starter + '"]').prop('checked', true);
            
            Main.updatePrefixFreeBox(Data.css_pre_processor);
            
            // Set the header type indicator for editors
            this.addClassBoxHTML(Data.html_pre_processor);
            this.addClassBoxCSS(Data.css_pre_processor);
            this.addClassBoxJS(Data.js_pre_processor);
            
            // Sync library with correct data as well
            $('#js-select').val(Data.js_library);

            // select current theme
            $('#theme').val(Data.theme);

            // Better select box for chosing JS library
            // Chosen selection has to happen after the value's been selected
            $("#js-select, #theme").chosen();

            if(Data.css_prefix_free) $('#prefix-free').prop('checked', true);
            if(Data.js_modernizr) $('#modernizr').prop('checked', true);
            
            // externals
            if(Data.html_classes) $('#html-classes').val(Data.html_classes);
            if(Data.css_external) $('#external-css').val(Data.css_external);
            if(Data.js_external) $('#external-js').val(Data.js_external);
            
            // show a specific theme
            // [Chris]: turned this off since settings moving
            // this.body.attr("data-theme", Data.theme);
        },
        
        selectPreProcessors: function() {
            // Sync preprocessors with correct data
            var selectPreProcessor = function(type) {
                var value = Data[type + '_pre_processor'];
                s = ':input[name="' + type + '-preprocessor"][value="' + value + '"]';
                
                $(s).prop('checked', true);
            }
            
            $.each(['html', 'css', 'js'], function(index, type) {
                selectPreProcessor(type);
            });
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
        
        /* End of syncUIWithData functions */
        
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

               // Kick it off once for page load layout
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
                if(this.id == 'viewsource-html') {
                    HTMLEditor.toggleReadOnly();
                    // Compile the content then execute the callback after processing is done
                    CodeRenderer.compileContent(true, Main.updateReadOnly);
                }
                else if(this.id == 'viewsource-css') {
                    CSSEditor.toggleReadOnly();
                    CodeRenderer.compileContent(true, Main.updateReadOnly);
                }
                else if(this.id == 'viewsource-js') {
                    JSEditor.toggleReadOnly();
                    CodeRenderer.compileContent(true, Main.updateReadOnly);
                }
                
                return false;
            });

            $("#sharing-button").on("click", function() {
                $(this).toggleClass("active");
                $(".sharing-panel").toggle();
            });

            $("#keyboard-commands-button").on("click", function() {
                $("#keycommands").toggle();
            });
            
            this.hideSettingModalsOnblur();
        },
        
        updateReadOnly: function() {
            var s = '#box-html.view-compiled,';
            s += '#box-css.view-compiled,';
            s += '#box-js.view-compiled';
            
            $(s).each(function(index, el) {
                if(this.id == 'box-html') HTMLEditor.updateReadOnly();
                else if(this.id == 'box-css') CSSEditor.updateReadOnly();
                else if(this.id == 'box-js') JSEditor.updateReadOnly();
            })
        },
        
        // Hide anything that gets set on top of the rest of the UI
        // for examples settings boxes or share boxe, when the user clicks
        // away from the intended targets.
        hideSettingModalsOnblur: function() {
            $('body').bind('click', function(e) {
                var elements = $(e.target).closest('.settings,.settings-nub');
                
                if(elements.length == 0) {
                    $('.settings,.settings-nub').removeClass('open');
                }
                
                // If the user clicks outside of the element, hide them
                elements = $(e.target).closest('#sharing-panel,#sharing-button');
                
                if(elements.length == 0) {
                    $('#sharing-button').removeClass('active');
                    $("#sharing-panel").hide();
                }
                
                Main.refreshEditors();
            });
        },
        
        /* End of bindUIActions functions */
        
        bindDataActions: function() {
             // once the slug is set, you can't edit it
             // you can only fork it and create a second slug
             $('#slug').on('keydown', function() {
                 Data.setSlug(this.value);
             });
             
             // HTML related
             $('input[name="html-preprocessor"]').on('click', function() {
                 Data.setHTMLOption('preprocessor', this.value);
                 HTMLEditor.preProcessorChanged();
                 
                 Main.addClassBoxHTML(this.value);
                 Main.compileContent(HTMLEditor, '', true);
             });

             // CSS related
             $('input[name="css-preprocessor"]').on('click', function() {
                   Data.setCSSOption('css_pre_processor', this.value);
                   CSSEditor.preProcessorChanged();
                   
                   Main.addClassBoxCSS(this.value);
                   Main.updatePrefixFreeBox(this.value);
                   Main.compileContent(CSSEditor, '', true);
             });

             // prefix free checkbox
             $('#prefix-free').on('click', function() {
                 if(Data.css_pre_processor != 'sass') {
                    Data.setCSSOption('css_prefix_free', $(this).is(":checked"));
                    
                    Main.compileContent(CSSEditor, '', true);
                 }
             });
             
             // CSS Resests
             $('input[name="startercss"]').on('click', function() {
                 Data.setCSSOption('css_starter', this.value);
                 
                 Main.compileContent(CSSEditor, '', true);
             });

             // JS related
             $('input[name="js-preprocessor"]').on('click', function() {
                 Data.setJSOption('js_pre_processor', this.value);
                 JSEditor.preProcessorChanged();
                 
                 Main.addClassBoxJS(this.value);
                 Main.compileContent(JSEditor, '', true);
             });

             $('#js-select').on('change', function(index, select) {
                 // alextodo, may need to move to an observe model, backbone? too complicated right now
                 Data.setJSOption('js_library', this.value);
                 
                 Main.compileContent(JSEditor, '', true);
             });
             
             $('#modernizr').on('click', function() {
                 Data.setJSOption('js_modernizr', $(this).is(":checked"));
                 
                 Main.compileContent(CSSEditor, '', true);
             });
             
             $('#html-classes,#external-css,#external-js').on('keyup', function(e) {
                 if(this.id == 'html-classes') {
                     Data.setHTMLClass(this.value);
                 }
                 else if(this.id == 'external-css') {
                     Data.setCSSOption('css_external', this.value);
                 }
                 else if(this.id == 'external-js') {
                     Data.setJSOption('js_external', this.value);
                 }
                 
                 Main.compileContent(JSEditor, '', true);
             });
             
             // Theme related

             // [Chris]: Turned this off because settings moving
             // $('#theme').on('change', function(index, select) {
             //     Data.setTheme(this.value);
             //     // Update current theme
             //     Main.body.attr("data-theme", this.value);
             // });
             
             // Save this code pen
             $("#save, #update").on('click', function() {
                // validate save
                Data.save();
                
                return false;
             });

             $("#new").on('click', function() {
                Data.new();
                window.location = '/';
                
                return false;
             });
             
             $('#fork').on('click', function() {
                Data.fork();
                return false;
             });
             
             $('#logout').on('click', function() {
                Data.logout();
             });
             
             // Bind keys
             KeyBindings.init();
        },
        
        updatePrefixFreeBox: function(css_pre_processor) {
            if(css_pre_processor == 'sass') {
                   // turn off prefix free
                   Data.setCSSOption('css_prefix_free', false);
                   $('#prefix-free').prop('checked', false);
                   $('#prefix-free').prop('disabled', true);
               }
               else {
                   $('#prefix-free').prop('disabled', false);
               }
        },
        
        buildEditors: function() {
            window.HTMLEditor = new HTMLEditor('html', Data.html);
            window.CSSEditor = new CSSEditor('css', Data.css);
            window.JSEditor = new JSEditor('js', Data.js);
        },
        
        refreshEditors: function(delay) {
            // Sometimes you have to wait a few milliseconds
            // for a task to complete before updating the editor
            // is effective (like a css transition). This delay makes 
            // sure the refresh is called after the transition
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
            Data.setEditorValue(editor.getOption('mode'), editor.getValue());
            CodeRenderer.compileContent(forceCompile);
        },
        
        openExpandedArea: function(areaID) {
            Main.closeExpandedAreas();
            $(areaID).addClass('expanded');
        },
        
        closeExpandedAreas: function() {
            $(".expander").each(function() {
                Main.body.toggleClass("focus");

                $(this)
                    .parent()
                    .parent()
                    .removeClass('expanded');
            });
        },
        
        afterPageLoad: function() {
            this.refreshEditors();
            
            Main.win.load(function() {
                Main.body.removeClass("preload")
            });
        }
    };
    
    Main.init();

})(jQuery);