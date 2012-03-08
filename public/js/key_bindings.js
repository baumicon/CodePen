var KeyBindings = {
        
    HTMLeditor: '', 
    CSSeditor: '', 
    JSeditor: '',
    
    // alextodo, map keys to strings for clarity

    init: function(HTMLeditor, CSSeditor, JSeditor) {
        this.bindKeys();
        this.HTMLeditor = HTMLeditor;
        this.CSSeditor = CSSeditor;
        this.JSeditor = JSeditor;
    },

    showOverlay: function() {
        // $("#overlay").show();
    },

    hideOverlay: function() {
        // $("#overlay").hide();
    },
    
    bindKeys: function() {
        $(document).on('keydown', function(event) {

            stop = false;
            
            // Process all the altKey pressed events
            if(event.metaKey) {
                if(event.keyCode == 49) {
                    // cmd + 1
                    stop = true;
                    Main.openExpandedArea('#box-html');
                    // alextodo, is this really the best place for it?
                    // have a wrapper around the editors? better place for it no?
                    CodeRenderer.setCursorToEnd(KeyBindings.HTMLeditor);
                    KeyBindings.showOverlay();
                }
                else if(event.keyCode == 50) {
                    // cmd + 2
                    stop = true;
                    Main.openExpandedArea('#box-css');
                    CodeRenderer.setCursorToEnd(KeyBindings.CSSeditor);
                    KeyBindings.showOverlay();
                }
                else if(event.keyCode == 51) {
                    // cmd + 3
                    stop = true;
                    Main.openExpandedArea('#box-js');
                    CodeRenderer.setCursorToEnd(KeyBindings.JSeditor);
                    KeyBindings.showOverlay();
                }
                else if(event.keyCode == 13) {
                    // cmd + return
                    // compile and run code
                    stop = true;
                    CodeRenderer.compileContent(true);
                }
                else if(event.keyCode == 75) {
                    // command + K
                    // fork this project
                    // alextodo, what does fork this project mean?
                    // start with another, save to local storage?
                    // then start using that? yea
                    CData.forkData();
                    window.open('/');
                }
                else if(event.keyCode == 71) {
                    // command + g
                    // create a gist
                    stop = true;
                    CodeRenderer.createGist();
                }
                else if(event.keyCode == 83) {
                    // command + s
                    console.log('save');
                    // alextodo, i think the command key is captured wrong,
                    // you can't type s
                    // stop = true;
                }
                else if(event.keyCode == 76) {
                    // command + l
                    // need to pull the actual slug once it's saved
                    // what about unsaved accounts?
                    // window.open('/slug/fullpage/');
                }
            }
            
            if(event.keyCode == 27) {
                Main.closeExpandedAreas();
                KeyBindings.hideOverlay();
            }
            
            if(stop) {
                $.Event(event).stopPropagation();
                return false;
            }
        });
    }
};