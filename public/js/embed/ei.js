function __CP() {
	this.host='codepen.io',
	this.height = 250,
	this.width = '100%',
	
	this.showCodePens = function() {
	    var codePenDivs = document.getElementsByClassName('codepen');
	    
	    for(var i = codePenDivs.length - 1; i > -1; i--) {
	       var cp = codePenDivs[i];
	       
	       var host = cp.getAttribute('data-host');
	       if(host) this.host = host;
	       
	       var url = this.buildURL(cp.getAttribute('data-href'), cp.getAttribute('data-type'));
	       cp.innerHTML = this.buildIFrame(url);
	    }
	},
	
	this.buildURL = function(href, type) {
	    type = type || 'result';
	    var url = this.host + '/embed' + href + '/#' + type;
	    return url.replace(/\/\//g, '/');
	},
	
	this.buildIFrame = function(url) {
		var src = '<iframe height="'+this.height+'" allowTransparency="true"';
		src += ' frameborder="0" scrolling="no" style="width:'+this.width+';border:none"';
		src += 'src="' + url + '"></iframe>';
		
		return src;
	}
}

__cp = new __CP();
__cp.showCodePens();