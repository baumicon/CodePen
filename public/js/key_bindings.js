var KeyBindings = {
    
    init: function() {
        this.bindKeys();
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
                    CodeRenderer.setCursorToEnd(HTMLeditor);
                    Main.refreshEditors(200);
                }
                else if(event.keyCode == 50) {
                    // cmd + 2
                    stop = true;
                    Main.openExpandedArea('#box-css');
                    CodeRenderer.setCursorToEnd(CSSeditor);
                    Main.refreshEditors(200);
                }
                else if(event.keyCode == 51) {
                    // cmd + 3
                    stop = true;
                    Main.openExpandedArea('#box-js');
                    CodeRenderer.setCursorToEnd(JSeditor);
                    Main.refreshEditors(200);
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
            }
            
            if(stop) {
                $.Event(event).stopPropagation();
                return false;
            }
        });
    },
};