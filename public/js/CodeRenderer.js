var CodeRenderer = (function() {

	var CodeRenderer = {

        // cached html results
        cachedHTML  : '',
        cachedCSS   : '',
        cachedJS    : '',

	    init: function() {
	    	this.codeChanged(true);
	    },

	    codeChanged: function(forceCompile) {
	        if(forceCompile || TBData.compileInRealTime) {
	           	var content = CodeRenderer.getResultContent();
            	CodeRenderer.writeContentToIFrame(content);
            	CodeRenderer.executeIFrameJS();
	        }
	    },

	    writeContentToIFrame: function(content) {
	    	var doc = $('#result').contents()[0];

	    	try {
	    	   	doc.open();
                // alextodo, having some sort of tool that checks html, css, and js
                // for validdity would really help
                // good error reporting would help as well
                // otherwise we'll be showing error on the console to the user
                doc.write(content);
                doc.close();
                }
            catch(err) {
                console.log(err);
            }
	    },

        saveContent: function() {
             $.ajax({
                url: '/return/stuff/',
                type: 'GET',
                async: false,
                data: 'stuff=rad&things=good',
                success: function( result ) {
                    alert(result);
                }
            });
        },

	    executeIFrameJS: function() {
	    	// TO DO: look at the security implications of this
	    	var contentWindow = $('#result')[0].contentWindow;

	    	if(contentWindow.__run) {
	    	    contentWindow.__run();
	    	}
	    },

	    getResultContent: function() {
	    	var values = {
                TITLE : "Tinkerbox",
                CSS   : this.getCSS(),
                HTML  : this.getHTML(),
                JS    : this.getJS(),
                JSLIB : $("#js-select option:selected").val(),
                PREFIX: TBData.getOption('css', 'prefixFree')
			};

			return tmpl(this.getTPL('result'), values);
	    },

	    getHTML: function() {
	        // check if any preprocessors are set
	        if(!this.useCache('html', CodeRenderer.cachedHTML)) {
                if(this.processOnServer(TBData.htmlPreProcessor)) {
                    $.ajax({
                    url: '/process/html/',
                    type: 'POST',
                    async: false,
                    data: 'type=' + TBData.htmlPreProcessor + '&html=' + encodeURIComponent(TBData.html),
                    success: function( result ) {
                        obj = $.parseJSON(result);
                    CodeRenderer.cachedHTML = obj.html;
                    }
                });
            }
            else {
                CodeRenderer.cachedHTML = TBData.html;
            }
            }

	    	return CodeRenderer.cachedHTML;
	    },

       getCSS: function() {
	        if(!this.useCache('css', CodeRenderer.cachedCSS)) {
        if(this.processOnServer(TBData.cssPreProcessor)) {
            $.ajax({
			url: '/process/css/',
			type: 'POST',
			async: false,
			data: 'type=' + TBData.cssPreProcessor + '&css=' + encodeURIComponent(TBData.css),
			success: function( result ) {
			    obj = $.parseJSON(result);
			CodeRenderer.cachedCSS = obj.css;
			}
		});
        }
        else {
            CodeRenderer.cachedCSS = TBData.css;
        }
            }

			return CodeRenderer.cachedCSS;
	    },

	    getJS: function() {
	        // check if this editor even changed before making request
	        if(!this.useCache('js', CodeRenderer.cachedJS)) {
	            if(this.processOnServer(TBData.jsPreProcessor)) {
            $.ajax({
			url: '/process/js/',
			type: 'POST',
			async: false,
			data: 'type=' + TBData.jsPreProcessor + '&js=' + encodeURIComponent(TBData.js),
			success: function( result ) {
			    obj = $.parseJSON(result);
			CodeRenderer.cachedJS = obj.js;
			}
		});
        }
        else {
            CodeRenderer.cachedJS = TBData.js;
        }
	        }

            return CodeRenderer.cachedJS;
	    },

	    useCache: function(type, cached) {
	        if(TBData.editorChanged != type && cached) {
	            return true;
	        }
	        else {
	            return false;
	        }
	    },

	    processOnServer: function(preProcessor) {
	        if(preProcessor && preProcessor != 'none') {
	            return true;
	        }
	        else {
	            return false;
	        }
	    },

	    getTPL: function(name) {
	    	return __templates[name];
	    }
    };

	return CodeRenderer;

})();
