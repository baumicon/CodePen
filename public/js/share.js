var Share = {
    
    init: function() {
        $("#sharing-button").on("click", function() {
            Share.showShare(this);
            
            return false;
        });
        
        $('#embed-panels a').on('click', function() {
            $('#embed-panels a').removeClass('selected');
            $(this).addClass('selected');
            Share.updateEmbedCode();
            
            return false;
        });
        
        $('#share-gist').on('click', function() {
            CodeRenderer.createGist();
            return false;
        });
    },
    
    showShare: function(btn) {
        if(!$(btn).hasClass('active')) {
            var href = document.location.href;
            $('#sharing-url').val(href);
            
            var full = document.location.origin + '/full' + document.location.pathname;
            $('#sharing-result').val(full);
            
            this.updateTweetLink();
            this.updateEmbedCode();
            this.updateExportZip();
        }
        
        $(btn).toggleClass("active");
        $(".sharing-panel").toggle();
    },
    
    updateTweetLink: function() {
        var href = 'http://twitter.com/home?status=';
        href += 'Check out my Code Pen! ' + document.location.href;
        
        $('#share-tweet').attr('href', href);
    },
    
    updateExportZip: function() {
        var href = document.location.origin + '/zip' + document.location.pathname;
        $('#share-zip').attr('href', href);
    },
    
    // Update the embeddable code. Give user useable code to copy paste
    // into a blog that doesn't allow JS either. Degrades nicely.
    updateEmbedCode: function() {
        var link = $('#embed-panels a.selected')[0];
        var dataType = $(link).attr('data-type');
        var editorCode = (dataType == 'result') ? 
            '<!-- see result in iframe -->' : this.htmlEntities(Data[dataType]);
        
        var dataHost = '';
        
        if( document.location.origin.indexOf('localhost') > -1 || 
            document.location.origin.indexOf('127.0.0.1')) {
            dataHost = 'data-host="' + document.location.origin + '" ';
        }
        
        var code = '<pre class="codepen" data-type="' + dataType + '" ';
        code += 'data-href="' + document.location.pathname + '" ';
        code += dataHost + '><code>' + editorCode + "</code></pre>\n";
        code += '<script async src="' + document.location.origin + '/js/embed/ei.js"></script>';
        
        $('#embed-code').val(code);
    },
    
    htmlEntities: function(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}