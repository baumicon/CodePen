// A Wrapper around the Code Mirror Editor
// Simplifies interactions with the editor for the rest of the application
// Encapsulates behaviors not native for our editors
function CPEditor(type, value) {
    this.editor = '';
    
    this.buildEditor(type, value);
    
    this.getOption = function(option) {
        return this.editor.getOption(option);
    };

    this.getValue = function() {
        return this.editor.getValue();
    };
    
    
};

var EUtil = {
    editor: '',
    from: '',
    // Have EUtil hold onto the latest cursor coordinates
    // so that they are accessible from anonymous functions
    coordinates: '',
    
    showColorPicker: function(editor) {
        var showColorPicker = false;

        // figure out if we should insert a color here
        // figure out if the context is right
        var from = editor.getCursor();
        var line = editor.getLine(from.line);
        var textToLeft = line.substring(0, from.ch);
        
        if(textToLeft.match(/color:\s{0,}/i)) {
            showColorPicker = true;
        }
        
        return showColorPicker;
    }
}

CPEditor.prototype.buildEditor = function(type, value) {
    var standardConfig = {
        lineNumbers  : true,
        value        : value,
        tabSize      : 2,
        onChange     : Main.compileContent,
        // Code Mirror natively indents the entire line. We wanted it to work like
        // a standard editor where a tab (for us 2 spaces) is inserted into the 
        // current cursor position
        onKeyEvent   : function(editor, key) {
            // Initially have code mirror not ignore the key
            // if we decide to handle it then set this to true
            var cmIgnoreKey = false;
            
            if(key.keyCode == 9 && key.type == 'keydown') {
                if(!editor.getSelection()) {
                    var from = editor.getCursor();
                    var line = editor.getLine(from.line);
                    var to = {'line': from.line, 'ch': line.length};
                    var range = editor.getRange(from, to);
                    var tab = '';
                    
                    for(var i = editor.getOption('tabSize'); i > 0 ; i--) {
                        tab += ' ';
                    }
                    
                    editor.replaceRange(tab + range, from, to);
                    
                    var endCursor = from.ch + tab.length;
                    editor.setCursor({'line': from.line, 'ch': endCursor});
                    
                    // Stop the keydown and keypress both
                    key = $.Event(key);
                    key.stopPropagation();
                    key.preventDefault();
                    
                    cmIgnoreKey = true;
                }
            }
            // If the User selects the alt key and text is selected
            // stupidly replace the text with a color value
            else if(key.keyCode == 18 && key.type == 'keydown') {
                if(EUtil.showColorPicker(editor)) {
                    EUtil.editor = editor;
                    EUtil.from = editor.getCursor();
                    EUtil.coordinates = editor.charCoords({'line': EUtil.from.line, 'ch':0}, 'page');
                    
                    // alextodo, need to set the proper start value
                    $('#tcolor').ColorPicker({
                        onShow: function (colpkr) {
                            var coordinates = EUtil.coordinates;
                            
                            $(colpkr).css({
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
                            var from = EUtil.editor.getCursor();
                            var line = EUtil.editor.getLine(from.line);
                            var newLine = line.replace(/(color:\s{0,})(#[\w\d]+|)/, "$1#" + hex);
                            
                            EUtil.editor.setLine(from.line, newLine);
                        }
                    });
                         
                    $('#tcolor').click();
                }
            }

            return cmIgnoreKey;
        },
    }

    if(type == 'html') {
        standardConfig['mode'] = 'xml';
        this.editor = CodeMirror.fromTextArea($('#html')[0], standardConfig);
        this.editor.setValue(value);
    }
    else if(type == 'css') {
        standardConfig['mode'] = 'css';
        this.editor = CodeMirror.fromTextArea($('#css')[0], standardConfig);
        this.editor.setValue(value);
    }
    else if(type == 'js') {
        standardConfig['mode'] = 'javascript';
        this.editor = CodeMirror.fromTextArea($('#js')[0], standardConfig);
        this.editor.setValue(value);
    }
};

CPEditor.prototype.refresh = function() {
    this.editor.refresh();
};

CPEditor.prototype.setCursorToEnd = function() {
    this.editor.focus();

    var text = this.editor.getValue();
    
    // set the cursor to the end of the editor
    // Make sure it's at the end by line num and char num to
    // same value as the actual number of chars, CodeMirror will
    // simply move the cursor to the end
    this.editor.setCursor(text.length, text.length, true);
};