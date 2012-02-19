var CodeRenderer = (function() {

    var CodeRenderer = {
        
        // reference versions of data
        refHTML     : '',
        refCSS      : '',
        refJS       : '',
        
        // cached html results
        cachedHTML  : '',
        cachedCSS   : '',
        cachedJS    : '',
        
        errorHTML   : '',
        
        codeChanged: function(forceCompile) {
            if(forceCompile || this.compileInRealTime()) {
                var content = CodeRenderer.getResultContent();
                CodeRenderer.writeContentToIFrame(content);
                CodeRenderer.executeIFrameJS();
            }
        },
        
        // Allows the editor to determine if it can show results in realtime
        compileInRealTime: function() {
            // Determine if we have a cached result for any of the content types
            // (html, css and js) and it's doesn't need a pre processor
            if( ( !this.useCache('html') && TBData.htmlPreProcessor != 'none') ||
                ( !this.useCache('css')  && TBData.cssPreProcessor  != 'none') ||
                ( !this.useCache('js')   && TBData.jsPreProcessor   != 'none') ) {
                // we don't have cache type and it needs a server pre processor
                return false;
            }
            else {
                return true;
            }
        },

        writeContentToIFrame: function(content) {
            var doc = $('#result').contents()[0];
            doc.open();
            doc.write(content);
            doc.close();
        },

        executeIFrameJS: function() {
            // TO DO: look at the security implications of this
            var contentWindow = $('#result')[0].contentWindow;
            
            if(contentWindow.__run) {
                contentWindow.__run();
            }
        },

        getResultContent: function() {
            this.renderContentUpdateCache();
            
            if(CodeRenderer.errorHTML) {
               // errors exist, show those as result
               return CodeRenderer.errorHTML;
            }
            else {
               return this.getIFrameHTML();
            }
        },
        
        getIFrameHTML: function() {
            var values = {
                  TITLE      : "Code Pen",
                  CSS        : this.cachedCSS,
                  HTML       : this.cachedHTML,
                  JS         : this.getJS(),
                  JSLIB      : this.getJSLibrary(),
                  PREFIX     : this.getPrefixFree(),
                  CSS_STARTER: this.getCSSStarter()
            };

            return tmpl(this.getTPL('result'), values);
        },
        
        getJS: function() {
            if(this.cachedJS) {
                var js = 'function __run() { ';
                js += this.cachedJS + ' }';
            }
            else {
                return '';
            }
        },
        
        getJSLibrary: function() {
            if(TBData.jsLibrary) {
                var jsLibs = {
                    'jquery-latest': 'http://code.jquery.com/jquery-latest.js',
                    'mootools'     : '//ajax.googleapis.com/ajax/libs/mootools/1.4.1/mootools-yui-compressed.js',
                    'prototype'    : '//ajax.googleapis.com/ajax/libs/prototype/1.7.0.0/prototype.js'
                }
                return '<script src="' + jsLibs[TBData.jsLibrary] + '"></script>';
            }
            else {
                return '';
            }
        },
        
        getPrefixFree: function() {
            if(TBData.cssPreFixFree) {
                return '<script src="/box-libs/prefixfree.min.js"></script>';
            }
            else {
                return '';
            }
        },
        
        getCSSStarter: function() {
            if(TBData.cssStarter == 'normalize') {
                href = '/stylesheets/css/normalize.css';
                return '<link rel="stylesheet" href="'+ href + '">';
            }
            else if(TBData.cssStarter == 'reset') {
                href = '/stylesheets/css/reset.css';
                return '<link rel="stylesheet" href="'+ href + '">';
            }
            else {
                return '';
            }
        },
        
        // Render content, serverside or client, then update cached content
        renderContentUpdateCache: function() {
            params = { };
            processContent = false;
            
            var keys = ['html', 'css', 'js'];
            
            for (var i=0; i < keys.length; i++) {
                var key = keys[i];
                var upKey = keys[i].toUpperCase();
               
                if(!this.useCache(key)) {
                       this['ref' + upKey] = TBData[key];
                       
                       if(this.processOnServer(TBData[key + 'PreProcessor'])) {
                           processContent = true;
                           params[key] = TBData[key];
                           params[key + 'PreProcessor'] = TBData[key + 'PreProcessor'];
                       }
                       else {
                           this['cached' + upKey] = TBData[key];
                       }
                   }
            }
            
            if(processContent) {
                CodeRenderer.errorHTML = '';
                this.processContent(params);
            }
        },
        
        processContent: function(params) {
            $.ajax({
                  url: '/process/',
                  type: 'POST',
                  async: false,
                  data: this.getDataValues(params),
                  success: function( result ) {
                      obj = $.parseJSON(result);
                      
                      if(obj['error_html']) {
                          CodeRenderer.errorHTML = obj['error_html'];
                      }
                      else {
                          for(var key in obj) {
                              var upKey = key.toUpperCase();
                              if(obj[key]) CodeRenderer['cached' + upKey] = obj[key];
                          }
                      }
                  }
            });
        },
        
        getDataValues: function(params) {
            var dataValues = '';
            var count = 0;
            
            for(var key in params) {
                if(count > 0) dataValues += '&';
                dataValues += key + '=' + encodeURIComponent(params[key]);
                count += 1;
            }
            
            return dataValues;
        },
        
        clearCache: function(type) {
            if(type == 'html') {
                this.refHTML = '';
            }
            else if(type == 'css') {
                this.refCSS = '';
            }
            else {
                this.refJS = '';
            }
            
            CodeRenderer.errorHTML = '';
        },
        
        // determine if what's in the editor is the same 
        // as what's saved in reference (unprocessed content) cache. 
        // if so use cached version of content, e.g. cachedHTML, cachedCSS
        useCache: function(type) {
            // if any errors exist, don't use cache
            if(CodeRenderer.errorHTML) return false;
            
            if(type == 'html') {
                if(this.refHTML == TBData.html) return true;
                else return false;
            }
            else if(type == 'css') {
                if(this.refCSS == TBData.css) return true;
                else return false;
            }
            else {
                if(this.refJS == TBData.js) return true;
                else return false;
            }
        },
        
        // Determine if the content needs to be processed on the server
        // All preprocessors are rendered server side
        processOnServer: function(preProcessor) {
            return (preProcessor && preProcessor != 'none');
        },

        getTPL: function(name) {
            return __templates[name];
        },
        
        createGist: function() {
            var gistData = {
                'html': this.cachedHTML,
                'css' : this.cachedCSS,
                'js'  : this.cachedJS,
            }
            
            $.ajax({
                  url: '/gist/',
                  type: 'POST',
                  async: false,
                  data: this.getDataValues(gistData),
                  success: function( result ) {
                      obj = $.parseJSON(result);
                      
                      console.log('response from github');
                      console.log(obj);
                      
                      // once succssefull need to open new tab
                  }
            });
        }
    };

    return CodeRenderer;

})();