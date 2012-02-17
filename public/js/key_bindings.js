var KeyBindings = (function() {

	/***********************
	* Manages the key bindings for Tinkerbox
	*
	* Tinkerbox, let's get fancy
	* Tinkerbox, women wear dresses, men use Tinkerbox
	* Tinkerbox, don't let your mom catch you using it
	* Tinkerbox, hide your women, hide your childen
	************************/

	var KeyBindings = {

		lastKeyPressed:  0,
		commandKeyPressed: false,
		
		HTMLeditor: '', 
		CSSeditor: '', 
		JSeditor: '',

	    init: function(HTMLeditor, CSSeditor, JSeditor) {
	    	this.bindKeys();
	    	this.HTMLeditor = HTMLeditor;
	    	this.CSSeditor = CSSeditor;
	    	this.JSeditor = JSeditor;
	    },
	    
	    giveEditorFocus: function(editor) {
	        editor.focus();
            KeyBindings.setCursorToEnd(editor);
	    },
	    
	    setCursorToEnd: function(editor) {
	        var text = editor.getValue();
            
            // set the cursor to the end of the editor
            // Make sure it's at the end by line num and char num to
            // same value as the actual number of chars, CodeMirror will
            // simply move the cursor to the end
            editor.setCursor(text.length, text.length, true);
	    },
        
        // todo, implment CMD-SHIFT-C - Copy current URL
        bindKeys: function() {
            $(window).on('keydown', function(event) {
                // mac os x uses command key (91) as alt key
                // every other OS will use the control key (17)
                if(event.keyCode == 17 || event.keyCode == 91) {
                    KeyBindings.commandKeyPressed = true;
                }
            });
            
            $(window).on('keyup', function(event) {
                if(event.keyCode == 17 || event.keyCode == 91) {
                    KeyBindings.commandKeyPressed = false;
                }
            });
            
            $(window).on('keydown', function(event) {
                stop = false;
                
                // Process all the altKey pressed events
                if(KeyBindings.commandKeyPressed) {
                    if(event.keyCode == 49) {
                        // cmd + 1
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.HTMLeditor);
                    }
                    else if(event.keyCode == 50) {
                        // cmd + 2
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.CSSeditor);
                    }
                    else if(event.keyCode == 51) {
                        // cmd + 3
                        stop = true;
                        KeyBindings.giveEditorFocus(KeyBindings.JSeditor);
                    }
                    else if(event.keyCode == 67) {
                        // cmd + c
                        // compile and run code
                        CodeRenderer.codeChanged(true);
                    }
                    else if(event.keyCode == 75) {
                        // command + K
                        // fork this project
                        console.log('fork');
                    }
                    else if(event.keyCode == 71) {
                        // command + g
                        // create a gist
                        console.log('gist');
                    }
                    else if(event.keyCode == 83) {
                        // command + s
                        console.log('save');
                        // alextodo, i think the command key is captured wrong,
                        // you can't type s
                        // stop = true;
                    }
                }
                
                if(event.keyCode == 27) {
                    Main.closeExpandedAreas();
                }
                
                if(stop) {
                    $.Event(event).stopPropagation();
                    
                    return false;
                }
            });
        }
    };

	// This ends the KeyBindings module

	return KeyBindings;

})();