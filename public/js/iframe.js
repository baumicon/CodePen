// reassign the $ to $j so that jquery doesn't conflict with other libraries
var $j = jQuery.noConflict();

var __renderIFrame = function(event) {
    var contentObj = JSON.parse(event.data);
    
    if(contentObj['error']) {
        // errors exist. show those
        var html = $j('html')[0];
        html.innerHTML = contentObj['error'];
        $j('<link rel="stylesheet" href="/stylesheets/css/errors.css">').appendTo("head");
    }
    else {
        // HTML related
        var html = $j('html')[0];
        html.innerHTML = contentObj['HTML'];
        html.className = contentObj['HTML_CLASSES'];

        // CSS related
        if(contentObj['CSS_STARTER']) {
            $j(contentObj['CSS_STARTER']).appendTo("head");
        }
        else if(contentObj['CSS_EXTERNAL']) {
            $j(contentObj['CSS_EXTERNAL']).appendTo("head");
        }

        var style = "<style>\n";
        style += contentObj['CSS'] + "</style>";
        $j(style).appendTo("head");

        // JS related
        if(contentObj['JSLIBRARY']) {
            if(contentObj['JSLIBRARY'].indexOf('jquery') > 1) {
                $ = $j;
            }
            else {
                $j(contentObj['JSLIBRARY']).appendTo("head");
            }
        }
        if(contentObj['PREFIX']) {
            //console.log($j(contentObj['PREFIX']));
            //$j(contentObj['PREFIX']).appendTo("head");
            $j.getScript('/box-libs/prefixfree.min.js', function() {
                // callback works
            });
        }
        if(contentObj['JS_MODERNIZR']) {
            $j(contentObj['JS_MODERNIZR']).appendTo("head");
        }
        if(contentObj['JS_EXTERNAL']) {
            $j(contentObj['JS_EXTERNAL']).appendTo("head");
        }

        var js = "<script>\n";
        js += contentObj['JS'] + "</script>";
        $j(js).appendTo("head");
    }
}

// Only used for browsers that support postMessage function
// IE6 and 7 will do a full refresh
if (window.addEventListener) {
    window.addEventListener('message', __renderIFrame, false);
} else {
    // IE browsers
    window.attachEvent('onmessage', __renderIFrame);
}
