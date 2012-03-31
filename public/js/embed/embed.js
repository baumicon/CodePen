(function($) {
    
    Main = {
        init: function() {
            this.buildEditors();
            this.bindUIActions();
        },
        
        /* End of syncUIWithData functions */
        
        // alextodo, if the user doesn't have js or css or html, hide that tab
        // make it smart
        // alextodo, need to also respect what the user wants to show first
        // which tab should show first and what not
        bindUIActions: function() {
            $('nav a').on('click', function() {
                $('nav a').removeClass('active');
                $(this).addClass('active');
                
                $('#output div').removeClass('active');
                $('#' + this.id.replace('link', 'box')).addClass('active');
            });
        },
        
        /* End of bindUIActions functions */
        
        buildEditors: function() {
            if($('#html-box').length > 0) {
                window.HTMLEditor = new HTMLEditor('html', Data.html);
            }
            else if($('#css-box').length > 0) {
                window.CSSEditor = new CSSEditor('css', Data.css);
            }
            else if($('#js-box').length > 0) {
                window.JSEditor = new JSEditor('js', Data.js);
            }
        }
    };
    
    Main.init();

})(jQuery);