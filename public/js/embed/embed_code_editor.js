// A Wrapper around the Code Mirror Editor
// Simplifies interactions with the editor for the rest of the application
// Encapsulates behaviors not native for our editors
var CPEditor = Class.extend({
    type    : '',
    value   : '',
    editor  : '',
    
    init: function(type, value) {
        this.type     = type;
        this.value    = value || '';
        
        this.buildEditor(this.type, this.value);
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
            readOnly     : true,
            onChange     : function() { },
        }
        
        standardConfig['mode'] = this.getMode();
        this.editor = CodeMirror.fromTextArea($(this.getTextAreaID())[0], standardConfig);
        this.editor.setValue(value);
    }
});
// End of CPEditor class

var HTMLEditor = CPEditor.extend({
    getMode: function() {
        return 'xml';
    },
    
    getTextAreaID: function() {
        return '#html';
    }
});

var CSSEditor = CPEditor.extend({
    getMode: function() {
        return 'css';
    },
    
    getTextAreaID: function() {
        return '#css';
    }
});

var JSEditor = CPEditor.extend({
    getMode: function() {
        return 'javascript';
    },
    
    getTextAreaID: function() {
        return '#js';
    }
});