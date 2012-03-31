// this should contain the minified version of ei.js
function WufooForm() {
	this.host='codepen.io',
	this.userName = '',
	this.formHash = '',
	this.ssl = 'unset',
	this.autoResize = true,
	this.height = '',
	this.width = '100%',
	this.disabled = false,
	this.frameUrl = '',
	this.defaultValues = '',
	this.header='show',
	this.key = '',
	this.polling = false,
	this.resizeDone = '',
	this.initialize = function(params) {
		for(key in params) {
			this[key] = params[key];
		}
		this.key = this.formHash + '' + Math.floor(Math.random()*1000000);
		this.generateFrameUrl();
		this.addEvent(window, 'message', this.bindMethod(this.resizeWufooForm, this));
		this.attachOnResizeEvent();
	},
	this.generateFrameUrl = function() {
		var url = '';
		var refer = document.referrer;
		refer = refer.replace(/\//g, "wuslash");
		refer = refer.replace(/\+/g, "wube");
		url += this.determineSecurity();
		url += this.userName + '.' + this.host + '/embed/' + this.formHash + '/';
		url += 'def/embedKey=' + this.key;
		url += '&referrer='+encodeURIComponent(refer);
		if(this.defaultValues != '') url += '&'+this.defaultValues;
		if(this.ssl == false) url += '&secure=false';
		if(this.disabled) url += '&disable=true';
		if(this.autoResize == false) url += '&scrolling=true';
		if(this.header=='hide')url += '&header=hide';
		this.frameUrl = url;
	},
	this.generateFullPageUrl = function() {
		var url = '';
		url += this.determineSecurity();
		url += this.userName + '.' + this.host + '/forms/' + this.formHash + '/';
		if(this.ssl == false) url += 'http/true/';
		return url;
	}
	this.addResizeScript = function() {
		if(!this.polling) {
			var self = this;
			setTimeout(function() {
				var script = document.createElement("script"); 
		    	script.setAttribute("src", document.location.protocol+"//"+self.host+"/forms/height.js?embedKey="+self.key+"&variable="+self.formHash+"&timestamp="+ new Date().getTime().toString());
		    	script.setAttribute("type","text/javascript");
		    	document.body.appendChild(script);
			}, 50);
		}
	},
	this.resizeForm = function(ret) {
		if(this.autoResize == true && ret.height) { 
			document.getElementById('wufooForm'+this.formHash).height = ret.height;
			
			if(ret.rules == '1' || this.isFunction(this.resizeDone)) {
				if(this.isFunction(this.resizeDone)) this.resizeDone(ret.height);
				__wufooCallBackFn = this.resizeDone;
				
				this.appendChildProxyFrame(ret.protocol);
				__poll(this.formHash);
				this.polling = true;
			}
		}
	},
	this.isFunction = function(object) {
	    return typeof object === "function";
	},
	this.determineSecurity = function() {
		if(this.ssl == true) return 'https://';
		else return 'http://';
	},
	this.generateFrameMarkup = function() {
		var scroll = 'no';
		if(this.autoResize == false) scroll = 'auto';
		var src='<iframe id="wufooForm'+this.formHash+'" height="'+this.height+'" allowTransparency="true" frameborder="0" scrolling="'+scroll+'" style="width:'+this.width+';border:none"'+
		'src="'+this.frameUrl+'"><a href="'+this.generateFullPageUrl()+'" title="html form">Fill out my Wufoo form!</a></iframe>';
		return src;
	},
	this.display = function() {
		if(this.async == true) {
			document.getElementById('wufoo-'+this.formHash).innerHTML = this.generateFrameMarkup();
		} else {
			document.write(this.generateFrameMarkup());
		}
		if(!window.postMessage) this.addEvent(document.getElementById('wufooForm'+this.formHash), 'load', this.bindMethod(this.addResizeScript, this));
	},
	this.resizeWufooForm = function(event) {
		if (event.origin != 'http://' + this.userName + '.' + this.host &&
		    event.origin != 'https://' + this.userName + '.' + this.host) {
		    return;
		}

		if(this.autoResize == true) {
			var data = event.data.split('|');
			var newFormHeight = new Number(data[0]);
			var formEl = document.getElementById('wufooForm' + this.formHash);
			
			if(formEl && this.isMessageFromCorrectForm(data[1])) {
				formEl.height = newFormHeight;
			}
			
			if(this.isFunction(this.resizeDone)) {
				this.resizeDone(newFormHeight);
			}
		}
	},
	this.isMessageFromCorrectForm = function(dataHash) {
		dataHash = dataHash || '';
		var hash = dataHash.substring(0, this.formHash.length);
		
		return (hash == this.formHash) ? true : false;
	},
	this.addEvent = function( obj, type, fn ) {
		if ( obj.attachEvent ) {
		    obj["e"+type+fn] = fn;
		    obj[type+fn] = function() { obj["e"+type+fn]( window.event ) };
		    obj.attachEvent( "on"+type, obj[type+fn] );
		  } 
		  else{
		    obj.addEventListener( type, fn, false );	
		  }
	},
	this.bindMethod = function(method, scope) {
		return function() {
			method.apply(scope,arguments);
		}
	},
	
	this.appendChildProxyFrame = function(protocol) {
		var proxyName = 'wufooProxyFrame' + this.formHash;
		__proxyFrameUrl = this.getChildProxyUrl(protocol);
		
		this.appendIFrame(proxyName, __proxyFrameUrl);
	},
	
	this.getChildProxyUrl = function(protocol) {
		var url = '';
		url += protocol + '//';
		url += this.userName + '.' + this.host + '/forms/blank.htm';
		url += '#' + window.location.href;
		return url;
	},
	
	this.appendIFrame = function(name, src) {
		var proxyFrame = document.getElementById(name);
		
		if(!proxyFrame) {
			var newiframe = document.createElement('iframe');
			newiframe.setAttribute('id', name);
			newiframe.setAttribute('name', name);
			newiframe.setAttribute('height', '0px;');
			newiframe.setAttribute('style', 'position: absolute; left: -500px; top: 500px; width: 0px;');
			newiframe.setAttribute('src', src);
			
			document.body.appendChild(newiframe);
		}
	},

	this.resizeIFrame = function(formHash) {
	    if(window.postMessage) {
	        iframe = document.getElementById('wufooForm'+formHash);
	      
    		var origin =  this.determineSecurity() + this.userName + '.' + this.host;

    		iframe.contentWindow.postMessage('resize', origin);
	    }
	},
	
	this.attachOnResizeEvent = function() {
	    if(typeof(window.__wufooForms) != 'undefined') {
	        window.__wufooForms.push(this);
	    }
	    else {
	        window.__wufooForms = new Array();
    	    window.__wufooForms.push(this);
    	    window.oldHandler = window.onresize;
	    }
	    
	    // Note: If user declares window.onresize after our scripts, this gets overrideen.
	    window.onresize = function() {
            for (i=0; i < window.__wufooForms.length; i++) {
                window.__wufooForms[i].resizeIFrame(window.__wufooForms[i].formHash);
            }
            
            if(window.oldHandler) window.oldHandler();
    	}
	}
}