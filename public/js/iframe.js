// reassign the $ to $j so that jquery doesn't conflict with other libraries
var $j = jQuery.noConflict();

$j.getCSS = function(url) {
    $j(document.createElement('link')).attr({
        href: url,
        media: 'screen',
        type: 'text/css',
        rel: 'stylesheet'
    }).appendTo('head');
};

$j.addCSS = function(css) {
    var style = "<style>\n";
    style += css + "</style>";
    $j(style).appendTo("head");
}

$j.addJS = function(code) {
    var js = "<script>\n";
    js += code + "</script>";
    $j(js).appendTo("head");
}

var __renderIFrame = function(event) {
    var contentObj = JSON.parse(event.data);
    
    if(contentObj['error']) {
        // errors exist. show those
        var html = $j('html')[0];
        html.innerHTML = contentObj['error'];
        $j.getCSS('/stylesheets/css/errors.css');
    }
    else {
        // HTML related
        var html = $j('html')[0];
        html.innerHTML = contentObj['HTML'];
        html.className = contentObj['HTML_CLASSES'];

        // CSS related
        if(contentObj['CSS_STARTER']) {
            $j.getCSS(contentObj['CSS_STARTER']);
        }
        else if(contentObj['CSS_EXTERNAL']) {
            $j.getCSS(contentObj['CSS_EXTERNAL']);
        }
        
        $j.addCSS(contentObj['CSS']);
        
        // JS related
        if(contentObj['JSLIBRARY']) {
            // Since we already load jquery, give users access to $, instead of $j
            if(contentObj['JSLIBRARY'].indexOf('jquery') > -1) {
                $ = $j;
            }
            else {
                $j.getScript(contentObj['JSLIBRARY']);
            }
        }
        
        if(contentObj['PREFIX']) {
            $j.getScript('/box-libs/prefixfree.min.js', function() {
                StyleFix.process();
            });
        }
        if(contentObj['JS_MODERNIZR']) {
            $j.getScript(contentObj['JS_MODERNIZR']);
        }
        
        if(contentObj['JS_EXTERNAL']) {
            $j.getScript(contentObj['JS_EXTERNAL']);
        }
        
        $j.addJS(contentObj['JS']);
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
