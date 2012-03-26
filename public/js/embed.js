(function($) {
    
    Main = {
        init: function() {
            // Initialize the data backing object first
            
            this.buildEditors();
            this.bindUIActions();
        },
        
        /* End of syncUIWithData functions */
        
        bindUIActions: function() {
            $('nav a').on('click', function() {
                $('nav a').removeClass('active');
                $(this).addClass('active');
                
                $('#output div').removeClass('active');
                $('#' + this.id.replace('link', 'box')).addClass('active');
            });
            
            $('#viewsource-html, #viewsource-css, #viewsource-js').on('click', function() {
                if(this.id == 'viewsource-html') {
                    HTMLEditor.toggleReadOnly();
                }
                else if(this.id == 'viewsource-css') {
                    CSSEditor.toggleReadOnly();
                }
                else if(this.id == 'viewsource-js') {
                    JSEditor.toggleReadOnly();
                }
                
                return false;
            });
        },
        
        /* End of bindUIActions functions */
        
        buildEditors: function() {
            window.HTMLEditor = new HTMLEditor('html', Data.html);
            window.CSSEditor = new CSSEditor('css', Data.css);
            window.JSEditor = new JSEditor('js', Data.js);
        },
        
        refreshEditors: function(delay) {
            // Sometimes you have to wait a few milliseconds
            // for a task to complete before updating the editor
            // is effective (like a css transition). This delay makes 
            // sure the refresh is called after the transition
            if(delay > 0) {
                setTimeout(function() {
                    Main.refreshEditors(0);
                }, delay);
            }
            else {
                HTMLEditor.refresh();
                CSSEditor.refresh();
                JSEditor.refresh();
            }
        }
    };
    
    Main.init();

})(jQuery);