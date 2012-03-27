// Handles Auto Complete Snippets
TabSnippets = {
    // data structure where we store our loaded snippets
    snippets: { 'html': {}, 'css': {}, 'js': {}},
    
    loadSnippet: function(mode) {
        var type = this.getPreProcessorType(mode);
        
        if(typeof(this.snippets[mode][type]) == 'undefined') {
            $.ajax({
                  url: '/load_snippets/' + type,
                  type: 'GET',
                  success: function(result) {
                      var obj = $.parseJSON(result);
                      
                      TabSnippets.snippets[obj.mode][obj.type] = obj.snippets;
                  }
            });
        }
    },
    
    findSnippet: function(editor) {
        var snippet = false;
        
        var mode = this.getMode(editor);
        var type = this.getPreProcessorType(mode);
        var from = editor.getCursor();
        var line = editor.getLine(from.line);
        var textToLeft = line.substring(0, from.ch).trim();
        
        if(typeof(this.snippets[mode][type]) != 'undefined') {
            for(var key in this.snippets[mode][type]) {
                var negIndex = key.length * -1;

                if(textToLeft.substr(negIndex) == key) {
                    snippet = this.snippets[mode][type][key];
                    break;
                }
            }
        }
        
        return snippet;
    },
    
    getMode: function(editor) {
        var mode = editor.getOption('mode');
        mode = (mode == 'xml') ? 'html' : mode;
        mode = (mode == 'javascript') ? 'js' : mode;
        
        return mode;
    },
    
    getPreProcessorType: function(mode) {
        var type = Data[mode + '_pre_processor'];
        return (type == 'none') ? mode : type;
    }
}