var KeyBindings = {
    
    init: function() {
        this.bindKeys();
    },
    
    bindKeys: function() {
        $(document).on('keydown', function(event) {

            stop = false;
            
            // Process all the altKey pressed events
            if(event.altKey) {
                if(event.keyCode == 49) {
                    // 1
                    stop = true;
                    Main.openExpandedArea('#box-html');
                    HTMLEditor.setCursorToEnd();
                    Main.refreshEditors(200);
                }
                else if(event.keyCode == 50) {
                    // 2
                    stop = true;
                    Main.openExpandedArea('#box-css');
                    CSSEditor.setCursorToEnd();
                    Main.refreshEditors(200);
                }
                else if(event.keyCode == 51) {
                    // 3
                    stop = true;
                    Main.openExpandedArea('#box-js');
                    JSEditor.setCursorToEnd();
                    Main.refreshEditors(200);
                }
            }

            if(event.metaKey) {
                if(event.keyCode == 75) {
                    // k
                    // fork this project
                    Data.fork();
                    window.open('/');
                }
                else if(event.keyCode == 71) {
                    // g
                    // create a gist
                    stop = true;
                    CodeRenderer.createGist();
                }
                else if(event.keyCode == 83) {
                    // s
                    Data.save();
                    stop = true;
                }
                else if(event.keyCode == 91) {
                    // n
                    // TODO: Call function for BRAND NEW BOX
                }
                else if(event.keyCode == 85) {
                    // u
                    // TODO: Call function for UPDATE
                }
                else if(event.keyCode == 76) {
                    // l
                    // If you've saved your code, you can open it in full page
                    // mode. Otherwise this fails silently.
                    if(document.location.pathname.match(/\/[\d]+(\/[\d]+)?/)) {
                        window.open(document.location.pathname + '/full')
                    }
                }
            }
            
            if(event.keyCode == 27) {
                Main.closeExpandedAreas();
                $("#keycommands").hide();
            }
            
            if(stop) {
                $.Event(event).stopPropagation();
                return false;
            }
        });
    },
};