(function($) {
    
    Main = {
        init: function() {
            this.buildEditors();
            this.bindUIActions();
            this.syncUIWithData();
        },
        
        syncUIWithData: function() {
            // Select the user defined selected tab
            var hashLinks = {
                '#html'   :'#html-link', 
                '#css'    :'#css-link',
                '#js'     :'#js-link',
                '#result' : '#result-link'
            }
            
            var link = hashLinks[document.location.hash] || '#result-link';
            
            // Attempt to preselect the user's preference, but if it does not exist
            // because that tab has no value, show the result
            if($(link).length > 0) $(link).click();
            else $('#result-link').click();
        },
        
        bindUIActions: function() {
            $('nav a').on('click', function() {
                $('nav a').removeClass('active');
                $(this).addClass('active');
                
                $('#output div').removeClass('active');
                $('#' + this.id.replace('link', 'box')).addClass('active');
            });
        },
        
        buildEditors: function() {
            if($('#html-box').length > 0) {
                window.HTMLEditor = new HTMLEditor('html', Data.html);
            }
            
            if($('#css-box').length > 0) {
                window.CSSEditor = new CSSEditor('css', Data.css);
            }
            
            if($('#js-box').length > 0) {
                window.JSEditor = new JSEditor('js', Data.js);
            }
        }
    };
    
    Main.init();

})(jQuery);