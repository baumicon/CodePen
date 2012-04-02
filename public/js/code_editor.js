// A Wrapper around the Code Mirror Editor
// Simplifies interactions with the editor for the rest of the application
// Encapsulates behaviors not native for our editors
var CPEditor = Class.extend({
    type    : '',
    value   : '',
    readOnly: false,
    editor  : '',
    
    init: function(type, value) {
        this.type     = type;
        this.value    = value || '';
        
        this.buildEditor(this.type, this.value);
        
        // Only load the snippets that pertain to the current pre processor
        // for the specific editor
        setTimeout(function() {
            TabSnippets.loadSnippet(type);
        }, 500);
    },
    
    getOption: function(option) {
        return this.editor.getOption(option);
    },
    
    getValue: function() {
        return this.editor.getValue();
    },
    
    buildEditor: function(type, value) {
        var standardConfig = {
            lineNumbers  : true,
            value        : value,
            tabSize      : 2,
            onChange     : function() { },
            // Code Mirror natively indents the entire line. We wanted it to work like
            // a standard editor where a tab (for us 2 spaces) is inserted into the 
            // current cursor position
            onKeyEvent   : function(editor, key) {
                // Initially have code mirror not ignore the key
                // if we decide to handle it then set this to true
                var cmIgnoreKey = false;
                
                if(key.keyCode == 9 && key.type == 'keydown') {
                    if(!editor.somethingSelected()) {
                        var snippet = TabSnippets.findSnippet(editor);
                        var from = editor.getCursor();

                        if(snippet) {
                            editor.setLine(from.line, snippet);
                        }
                    }
                }
                // If the User selects the alt key and text is selected
                // replace the text with a color value from the color picker
                else if(key.keyCode == 18 && key.type == 'keydown') {
                    if(ColorUtil.showColorPicker(editor)) {
                        ColorUtil.editor = editor;
                        ColorUtil.from = editor.getCursor();
                        // ColorUtil needs to hold onto the initial ch where the cursor
                        // started because it will change after we replace text
                        ColorUtil.initialCh = ColorUtil.from.ch;
                        ColorUtil.coordinates = editor.
                            charCoords({'line': ColorUtil.from.line, 'ch':0}, 'page');
                        ColorUtil.startColor = ColorUtil.
                            getStartColor(editor.getLine(ColorUtil.from.line), ColorUtil.from.ch);

                        $('#tcolor').ColorPicker({
                            color: ColorUtil.startColor,
                            onShow: function (colpkr) {
                                var coordinates = ColorUtil.coordinates;
                                $(this).ColorPickerSetColor(ColorUtil.startColor);

                                $(colpkr).css({
                                    // index has to be more than the editors when expanded
                                    // editors z-index values is 1001
                                    'z-index': 1002,
                                    position: 'absolute',
                                    left: Math.ceil(coordinates.x) + 'px', 
                                    top:  Math.ceil((coordinates.y + 15)) + 'px',
                                });

                                $(colpkr).fadeIn(300);

                                return false;
                            },

                            onHide: function (colpkr) {
                                $(colpkr).fadeOut(300);

                                return false;
                            },

                            onChange: function (hsb, hex, rgb) {
                                var from = ColorUtil.editor.getCursor();
                                var line = ColorUtil.editor.getLine(from.line);
                                var newLine = ColorUtil.regexReplace(line, hex);

                                ColorUtil.editor.setLine(from.line, newLine);
                            }
                        });

                        $('#tcolor').click();
                    }
                }
                else if(key.keyCode == 191 && key.type == 'keydown' && key.metaKey) {
                    if(editor.somethingSelected()) {
                        CommentUtil.comment(editor, type);
                    }
                }

                return cmIgnoreKey;
            },
        }

        standardConfig['mode'] = this.getMode();
        this.editor = CodeMirror.fromTextArea($(this.getTextAreaID())[0], standardConfig);
        this.editor.setValue(value);

        // Start registering onchange events after initial call to setValue
        this.editor.setOption('onChange', Main.compileContent);
    },
    
    refresh: function() {
        this.editor.refresh();
    },

    setCursorToEnd: function() {
        this.editor.focus();
        
        var text = this.editor.getValue();
        
        // set the cursor to the end of the editor
        // Make sure it's at the end by line num and char num to
        // same value as the actual number of chars, CodeMirror will
        // simply move the cursor to the end
        this.editor.setCursor(text.length, text.length, true);
    },
    
    toggleReadOnly: function() {
        if(this.allowViewSource()) {
            this.readOnly = (this.readOnly) ? false : 'nocursor';
            
            if(this.readOnly) {
                // Don't register any change events while in readonly mode
                this.editor.setOption('onChange', function() { });
                this.showPostProcessedText();
                this.makeReadOnly();
            }
            else {
                this.makeEditable();
                // Start registering onchange events like normal again
                this.editor.setOption('onChange', Main.compileContent);
            }
            
            this.editor.setOption('readOnly', this.readOnly);
        }
      },
      
     updateReadOnly: function() {
         if(this.readOnly) {
            this.showPostProcessedText();
         }
     },

     preProcessorChanged: function() {
         this.turnOffReadOnlyView();
         TabSnippets.loadSnippet(this.type);
     },
     
     // If the user is viewing the compiled result and changes
     // the selected pre processor, go back to standard editor view
     turnOffReadOnlyView: function() {
         if(this.readOnly) {
             this.toggleReadOnly();
         }
     }
});
// End of CPEditor class

var HTMLEditor = CPEditor.extend({
    getMode: function() {
        return 'xml';
    },
    
    getTextAreaID: function() {
        return '#html';
    },
    
    allowViewSource: function() {
        return Data.html_pre_processor != 'none';
    },
    
    makeReadOnly: function() {
        $("#box-html").toggleClass("view-compiled");
    },
    
    showPostProcessedText: function() {
        this.editor.setValue(CodeRenderer.postProcessedHTML);
    },
    
    makeEditable: function() {
        this.editor.setValue(CodeRenderer.refHTML);
        $("#box-html").toggleClass("view-compiled");
    }
});

var CSSEditor = CPEditor.extend({
    getMode: function() {
        return 'css';
    },
    
    getTextAreaID: function() {
        return '#css';
    },
    
    allowViewSource: function() {
        return Data.css_pre_processor != 'none';
    },
    
    makeReadOnly: function() {
        $("#box-css").toggleClass("view-compiled");
    },
    
    showPostProcessedText: function() {
        this.editor.setValue(CodeRenderer.postProcessedCSS);
    },
    
    makeEditable: function() {
        this.editor.setValue(CodeRenderer.refCSS);
        $("#box-css").toggleClass("view-compiled");
    }
});

var JSEditor = CPEditor.extend({
    getMode: function() {
        return 'javascript';
    },
    
    getTextAreaID: function() {
        return '#js';
    },
    
    allowViewSource: function() {
        return Data.js_pre_processor != 'none';
    },
    
    makeReadOnly: function() {
        $("#box-js").toggleClass("view-compiled");
    },
    
    showPostProcessedText: function() {
        this.editor.setValue(CodeRenderer.postProcessedJS);
    },
    
    makeEditable: function() {
        this.editor.setValue(CodeRenderer.refJS);
        $("#box-js").toggleClass("view-compiled");
    }
});

var CommentUtil = {
    
    comment: function(editor, type) {
        if(type == 'html') this.commentHTML(editor);
        else if(type == 'css') this.commentCSS(editor);
        else if(type == 'js') this.commentJS(editor);
    },
    
    commentHTML: function(editor) {
        if(Data.html_pre_processor == 'jade') {
            this.prefixComments(editor, '//');
        }
        else if(Data.html_pre_processor == 'slim') {
            this.prefixComments(editor, '/!');
        }
        else if(Data.html_pre_processor == 'haml') {
            this.prefixComments(editor, '/');
        }
        else {
            // regular html comment
            this.wrapComments(editor, '<!--', '-->');
        }
    },
    
    commentCSS: function(editor) {
        this.wrapComments(editor, '/*', '*/');
    },
    
    commentJS: function(editor) {
        if(Data.js_pre_processor == 'coffeescript') {
            this.wrapComments(editor, '###', '###');
        }
        else {
            this.wrapComments(editor, '/*', '*/');
        }
    },
    
    // Prefix every line of the selection
    prefixComments: function(editor, prefix) {
        var lines = editor.getSelection().split("\n");
        var newSelection = '';
        var invertedSelection = '';
        var selectionHasComments = true;
        
        for (var i=0; i < lines.length; i++) {
            newSelection += prefix + lines[i];
            if(i + 1 < lines.length) newSelection += "\n";
            
            // If every line ended up having comments, then use the
            // invertedSelection because we want to uncomment it
            if(lines[i].substring(0, prefix.length) == prefix) {
                if(selectionHasComments) {
                    invertedSelection += lines[i].substring(prefix.length, lines[i].length);
                    if(i + 1 < lines.length) invertedSelection += "\n";
                }
            }
            else {
                selectionHasComments = false;
            }
        }
        
        if(selectionHasComments) editor.replaceSelection(invertedSelection);
        else editor.replaceSelection(newSelection);
    },
    
    // Wrap the selection in a comment block
    wrapComments: function(editor, prefix, suffix) {
        // replaceSelection(string)
        var selection = editor.getSelection();
        var newSelection = '';
        
        if( selection.substr(0, prefix.length) == prefix && 
            selection.substr(suffix.length * -1, suffix.length) == suffix) {
            // If it's already wrapped, we need to unwrap it
            newSelection = selection.substring(prefix.length, selection.length - suffix.length);
        }
        else {
            // wrap the selection in comments
            newSelection = prefix + selection + suffix;
        }
        
        editor.replaceSelection(newSelection);
    }
}

var ColorUtil = {
    editor: '',
    from: '',
    colorType: '', // (hex|rgb|)
    initialCh: 0, // hold onto the initial ch because it changes after we replace text
    
    regexReplace: function() { }, // (colorRegexReplace|poundRegexReplace)
    // Have ColorUtil hold onto the latest cursor coordinates
    // so that they are accessible from anonymous functions
    coordinates: '',
    
    showColorPicker: function(editor) {
        if(editor.getOption('mode') != 'css') return false;
        
        var showColorPicker = false;

        // Context for showing the color picker is right if
        // color: is to the left of the cursor or
        // # is to the left of the cursor;
        var from = editor.getCursor();
        var line = editor.getLine(from.line);
        var textToLeft = line.substring(0, from.ch);
        
        if(textToLeft.match(/color:\s{0,}/i)) {
            showColorPicker = true;
            this.regexReplace = this.colorRegexReplace;
        }
        else if(textToLeft.match(/\s{0,}#/i)) {
            showColorPicker = true;
            this.regexReplace = this.poundRegexReplace;
        }
        
        return showColorPicker;
    },
    
    colorRegexReplace: function(line, hex) {
        if(hex.indexOf('NaN') > -1) {
            return line;
        }
        else {
            return line.replace(/(color:\s{0,})(#[\w\d]+|)/, "$1#" + hex);
        }
    },
    
    poundRegexReplace: function(line, hex) {
        if(hex.indexOf('NaN') > -1) {
            return line;
        }
        else {
            var start = this.findClosestPound(line, this.initialCh);
            var beginOfLine = line.substring(0, start);
            var endOfLine = line.substring(start, line.length);
            endOfLine = endOfLine.replace(/(\s){0,}(#[0-9a-fA-F]{0,6})/i, "$1#" + hex);
            
            return beginOfLine + endOfLine;
        }
    },
    
    // helps up figure out which hex color to replace for situations where
    // the text on the line is "background: linear-gradient(#d12222, #2E2E2E);"
    // we find the closest # to the left of the cursor and start replacing the line there
    findClosestPound: function(line, ch) {
        for(var i = ch; i > 0; i--) {
            if(line.charAt(i) == '#') {
                return i;
            }
        }
        
        return 0;
    },
    
    getStartColor: function(line, ch) {
        var lPound = this.findClosestPound(line, ch);
        var subLine = line.substring(lPound, (lPound + 7));

        if(subLine.match(/(\s){0,}(#[0-9a-fA-F]{0,6})/i)){
            return subLine.replace(/(\s){0,}(#[0-9a-fA-F]{0,6})/i, "$2");
        }
        else {
            return '';
        }
    }
}