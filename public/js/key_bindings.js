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
		altKeyPressedPreviously: false,
		
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
        // todo, when the user presses ?, show the overlay screen with shortcuts
        // ask coyier to mock this up for me
        bindKeys: function() {
            $(window).on('keydown keypress', function(event) {
                // mac os x uses command key (91) as alt key
                // every other OS uses actual alt key (18)
                if(KeyBindings.lastKeyPressed == 18 || KeyBindings.lastKeyPressed == 91) {
                    this.altKeyPressedPreviously = true;
                }
                else {
                    this.altKeyPressedPreviously = false;
                }
                
                // If the user is holding down the cmd key, then you won't get another key press
                // event for that. Only update lastKeyPressed only if key isn't the same as previous key
                if(KeyBindings.lastKeyPressed != event.keyCode) {
                    KeyBindings.lastKeyPressed = event.keyCode;
                }
                
                stop = false;
                
                // todo, will need to create a keydown status for a key
                // then change on keyup, that way you know if that key 
                
                // Process all the altKey pressed events
                if(altKeyPressedPreviously) {
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
                    else if(event.keyCode == 78) {
                        // command + n
                        // create a new tinker box
                        console.log('create new tinker box in new tab');
                        // warn if changes will be lost
                        stop = true;
                    }
                    else if(event.keyCode == 83) {
                        // command + s
                        console.log('save');
                        stop = true;
                    }
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