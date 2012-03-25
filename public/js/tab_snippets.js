// Handles Auto Complete Snippets
TabSnippets = {
    snippets: {
        'html': {
            'lorem': '<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>',
            'nav':'<nav>\n\t<ul>\n\t\t<li><a href="#">Home<\/a><\/li>\n\t\t<li><a href="#">About<\/a><\/li>\n\t\t<li><a href="#">Clients<\/a><\/li>\n\t\t<li><a href="#">Contact Us<\/a><\/li>\n\t<\/ul>\n<\/nav>',
            'ul':'<ul>\n\t<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<\/li>\n\t<li>Aliquam tincidunt mauris eu risus.<\/li>\n\t<li>Vestibulum auctor dapibus neque.<\/li>\n<\/ul>',
            'ol':'<ol>\n\t<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<\/li>\n\t<li>Aliquam tincidunt mauris eu risus.<\/li>\n\t<li>Vestibulum auctor dapibus neque.<\/li>\n<\/ol>',
            'form':'<form action="#" method="post">\n\t<div>\n\t\t<label for="name">Text Input:<\/label>\n\t\t<input type="text" name="name" id="name" value="" tabindex="1" \/>\n\t<\/div>\n\n\t<div>\n\t\t<h4>Radio Button Choice<\/h4>\n\n\t\t<label for="radio-choice-1">Choice 1<\/label>\n\t\t<input type="radio" name="radio-choice-1" id="radio-choice-1" tabindex="2" value="choice-1" \/>\n\n\t\t<label for="radio-choice-2">Choice 2<\/label>\n\t\t<input type="radio" name="radio-choice-2" id="radio-choice-2" tabindex="3" value="choice-2" \/>\n\t<\/div>\n\n\t<div>\n\t\t<label for="select-choice">Select Dropdown Choice:<\/label>\n\t\t<select name="select-choice" id="select-choice">\n\t\t\t<option value="Choice 1">Choice 1<\/option>\n\t\t\t<option value="Choice 2">Choice 2<\/option>\n\t\t\t<option value="Choice 3">Choice 3<\/option>\n\t\t<\/select>\n\t<\/div>\n    \n\t<div>\n\t\t<label for="textarea">Textarea:<\/label>\n\t\t<textarea cols="40" rows="8" name="textarea" id="textarea"><\/textarea>\n\t<\/div>\n   \n\t<div>\n \t\t<label for="checkbox">Checkbox:<\/label>\n  \t\t<input type="checkbox" name="checkbox" id="checkbox" \/>\n\t<\/div>\n\n\t<div>\n\t\t<input type="submit" value="Submit" \/>\n\t<\/div>\n<\/form>'
        },
        'css': {
            'phark': ".element {\n"+
                "\ttext-indent: -9999px;\n"+
                "\tdisplay: block;\n"+
                "\twidth: px;\n"+
                "\theight: px;\n"+
                "\tbackground: url() no-repeat;\n"+
            "}"
        },
        'js': {
            'for': "for(var i = 0; i > Things.length; i++) {\n\tconsole.log(Things[i]);\n}"
        }
    },
    
    findSnippet: function(editor) {
        var snippetExist = false;
        
        var mode = editor.getOption('mode');
        mode = (mode == 'xml') ? 'html' : mode;
        mode = (mode == 'javascript') ? 'js' : mode;
        
        var from = editor.getCursor();
        var line = editor.getLine(from.line);
        var textToLeft = line.substring(0, from.ch).trim();
        
        for(var key in this.snippets[mode]) {
            var negIndex = key.length * -1;
            
            if(textToLeft.substr(negIndex) == key) {
                snippetExist = this.snippets[mode][key];
                break;
            }
        }
        
        return snippetExist;
    }
}