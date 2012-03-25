var CodeRenderer = Class.extend({
    
    // reference versions of data
    refHTML     : '',
    refCSS      : '',
    refJS       : '',
    
    // reference pre processors
    refHTMLPP   : '',
    refCSSPP    : '',
    refJSPP     : '',
    
    // Cached result of content
    postProcessedHTML  : '',
    postProcessedCSS   : '',
    postProcessedJS    : '',
    
    errorHTML   : '',
    processing: false,
    
    // Functions calling compile content can pass in a function that is called
    // after the code renderer finishes processing data
    finishRenderingCallBack: '',
    
    init: function() {
        // Defer the call to later so that the UI can fully render,
        // then make the call to render the iframe content
        // This may be a long running process and we'd prefer the UI
        // fully render since it's so dependent on JS
        $(this).delay(300).queue(function() {
            CodeRenderer.compileContent(true);
            Main.refreshEditors();
            HTMLEditor.setCursorToEnd();

            $(this).dequeue();
        });
    },

    // The only public function to this module. Renders content to iframe.
    compileContent: function(forceCompile, callback) {
        if(forceCompile || this.compileInRealTime()) {
            this.processContent();
            this.finishRenderingCallBack = callback;
        }
        else {
            // Poll for changes every 2 seconds. Allow the user to keep typing
            // without showing any changes. Once no changes happen for 2 seconds
            // render the result
            clearTimeout(this.timeOutID);

            this.timeOutID = setTimeout(function(value) {
                CodeRenderer.processContent();
            }, 500);
        }
    },
    
    // Allows the editor to determine if it can show results in realtime
    compileInRealTime: function() {
        // Determine if we have a cached result for any of the content types
        // (html, css and js) and it's doesn't need a pre processor
        if( ( this.useCache('html') == false && Data.html_pre_processor != 'none') ||
            ( this.useCache('css')  == false && Data.css_pre_processor  != 'none') ||
            ( this.useCache('js')   == false && Data.js_pre_processor   != 'none') ) {
            // If we've come here, it's because we don't have a cached result
            // and the content needs to be sent to the server for processing
            return false;
        }
        else {
            // We have everything we need to render the content in real time
            // No server needed. Update iframe.
            return true;
        }
    },

    // We rely on postMessage to talk to the iframe. If no iframe.
    // We'll execute a full iframe refresh. Data will simply load from server.
    sendIFrameContentObj: function(contentObj) {
        var iframe = $('#result')[0];
        
        // Send message to iframe if it supports postMessage
        if(iframe.contentWindow.postMessage) {
            var objAsJSON = JSON.stringify(contentObj);
            iframe.contentWindow.postMessage(objAsJSON, iframe.src);
        }
    },
    
    getIFrameContentObj: function() {
        if(CodeRenderer.errorHTML) {
           // errors exist, show those as result
           return { 'error': CodeRenderer.errorHTML } ;
        }
        else {
           return this.getIFrameValues();
        }
    },
    
    getIFrameValues: function() {
        return {
              TITLE        : "Code Pen",
              HTML         : this.postProcessedHTML,
              HTML_CLASSES : Data.html_classes,
              
              CSS          : this.postProcessedCSS,
              PREFIX       : this.getPrefixFree(),
              CSS_STARTER  : this.getCSSStarter(),
              CSS_EXTERNAL : this.getCSSExternal(),
              
              JS           : this.getJS(),
              JSLIBRARY    : this.getJSLibrary(),
              JS_MODERNIZR : this.getModernizr(),
              JS_EXTERNAL  : this.getJSExternal(),
        };
    },
    
    // Get CSS Options
    
    getPrefixFree: function() {
        if(Data.css_prefix_free) {
            return '/box-libs/prefixfree.min.js';
        }
        else {
            return '';
        }
    },
    
    getCSSStarter: function() {
        if(Data.css_starter == 'normalize') {
            return '/stylesheets/css/normalize.css';
        }
        else if(Data.css_starter == 'reset') {
            return '/stylesheets/css/reset.css';
        }
        else {
            return '';
        }
    },
    
    getCSSExternal: function() {
        if(Data.css_external) {
            // Make sure the url is a valid URL and ends with css
            if(this.isValidExternal(Data.css_external, -3, 3, 'css')) {
                return Data.css_external;
            }
            else {
                return '<!-- invalid external stylesheet: ' + Data.css_external + ' -->';
            }
        }
    },
    
    // Get JS Options
    
    getJS: function() {
        if(this.postProcessedJS) {
            var js = '(function() {';
            js += " try { " + this.postProcessedJS + " }";
            js += "catch(err) { if(console) { console.log('Error: ' + err.message); }}";
            js += "})();";

            return js;
        }
        else {
            return '';
        }
    },
    
    getJSLibrary: function() {
        if(Data.js_library) {
            var jsLibs = {
                'jquery': '/code.jquery.com/jquery-latest.js',
                'mootools'     : '/ajax.googleapis.com/ajax/libs/mootools/1/mootools-yui-compressed.js',
                'prototype'    : '/ajax.googleapis.com/ajax/libs/prototype/1/prototype.js'
                // ,'extjs'        : '/ajax.googleapis.com/ajax/libs/ext-core/3/ext-core.js'
                // ,'dojo'         : '/ajax.googleapis.com/ajax/libs/dojo/1/dojo/dojo.xd.js'
            }
            return jsLibs[Data.js_library];
        }
        else {
            return '';
        }
    },
    
    getModernizr: function() {
        return (Data.js_modernizr) ? '/js/libs/modernizr.js' : '';
    },
    
    getJSExternal: function() {
        script = '';
        
        if(Data.js_external) {
            // Make sure the url is a valid URL and ends with js
            if(this.isValidExternal(Data.js_external, -2, 2, 'js')) {
                script = Data.js_external;
            }
            else {
                script = '<!-- invalid external javascript file: ';
                script+= Data.js_external + ' -->';
            }
        }
        
        return script;
    },
    
    isValidExternal: function(url, start, length, value) {
        return (this.isURL(url) && url.substr(start, length) == value);
    },
    
    isURL: function(url) {
        var r = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        
        return r.test(url);
    },
    
    // Render content, serverside or client, then update cached content
    // All content saved to postProcessed(HTML|CSS|JS)
    processContent: function() {
        params = { };
        
        if(!this.useCache('html')) {
            if(this.needsPreProcessing(Data.html_pre_processor)) {
                params['html'] = Data.html;
                params['html_pre_processor'] = Data.html_pre_processor;
            }
            else {
                // Since the html is simply html, it is post processed
                this.postProcessedHTML = Data.html;
            }
        }
        
        if(!this.useCache('css')) {
            if(this.needsPreProcessing(Data.css_pre_processor)) {
                params['css'] = Data.css;
                params['css_pre_processor'] = Data.css_pre_processor;
            }
            else {
                // Since the css is simply css, it is post processed
                this.postProcessedCSS = Data.css;
            }
        }
        
        if(!this.useCache('js')) {
            if(this.needsPreProcessing(Data.js_pre_processor)) {
                params['js'] = Data.js;
                params['js_pre_processor'] = Data.js_pre_processor;
            }
            else {
                // Since the js is simply js, it is post processed
                this.postProcessedJS = Data.js;
            }
        }
        
        CodeRenderer.errorHTML = '';
        
        // If there is any data to process on the server. Send it off
        // and render after it comes back. Otherwise render away.
        if(params['html'] || params['css'] || params['js']) {
            this.sendContentToServer(params);
        }
        else {
            CodeRenderer.finishRendering();
        }
    },
    
    // Send content to server for processing
    sendContentToServer: function(params) {
        $.ajax({
              url: '/process/',
              type: 'POST',
              data: Util.getDataValues(params),
              success: function( result ) {
                  obj = $.parseJSON(result);
                  
                  if(obj['error_html']) {
                      CodeRenderer.errorHTML = obj['error_html'];
                  }
                  else {
                      // keys are html, css or js
                      // Saved results to postProcssed(HTML|CSS|JS)
                      
                      for(var key in obj) {
                          var upKey = key.toUpperCase();
                          
                          CodeRenderer['postProcessed' + upKey] = obj[key];
                      }
                  }
                  
                  CodeRenderer.finishRendering();
              }
        });
    },
    
    finishRendering: function() {
        this.storeRefContent();
        
        var contentObj = this.getIFrameContentObj();
        CodeRenderer.sendIFrameContentObj(contentObj);
        
        if(typeof(this.finishRenderingCallBack) == 'function') {
            this.finishRenderingCallBack();
            this.finishRenderingCallBack = null;
        }
    },

    storeRefContent: function() {
        this.refHTML   = Data.html;
        this.refHTMLPP = Data.html_pre_processor;
        
        this.refCSS    = Data.css;
        this.refCSSPP  = Data.css_pre_processor;
        
        this.refJS     = Data.js;
        this.refJSPP   = Data.js_pre_processor;
    },
    
    // Determine if what's in the editor is the same 
    // as what's saved in reference (unprocessed content) cache. 
    // if so use cached version of content, e.g. postProcessedHTML, postProcessedCSS
    useCache: function(type) {
        // if any errors exist, don't use cache
        if(CodeRenderer.errorHTML) return false;
        
        if(type == 'html') {
            if( this.refHTML   == Data.html && 
                this.refHTMLPP == Data.html_pre_processor) {
                return true;
            }
            else {
                this.postProcessedHTML = '';
                return false;
            }
        }
        else if(type == 'css') {
            if( this.refCSS   == Data.css && 
                this.refCSSPP == Data.css_pre_processor) {
                return true;
            }
            else {
                this.postProcessedCSS = '';
                return false;
            }
        }
        else {
            if( this.refJS   == Data.js && 
                this.refJSPP == Data.js_pre_processor) {
                return true
            }
            else {
                this.postProcessedJS = '';
                return false;
            }
        }
    },
    
    // Determine if the content needs to be processed on the server
    // All preprocessors are rendered server side
    needsPreProcessing: function(preProcessor) {
        return (preProcessor && preProcessor != 'none');
    },
    
    // Send data to backend to create a gist on github.com
    // return the URL to the new gist
    createGist: function() {
        $.ajax({
              url: '/gist/',
              type: 'POST',
              data: Util.getDataValues({ 'data': JSON.stringify(Data) }),
              success: function( result ) {
                  obj = $.parseJSON(result);
                  // Open new gist in a tab!
                  window.open(obj.url);
              }
        });
    }
});