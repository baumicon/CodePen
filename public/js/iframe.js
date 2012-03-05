//respond to events
// alextodo, make window.addEventListener cross browser
// can't use jquery, cause it will conflict with this
window.addEventListener('message', function(event) {
    // console.log(event.data);
    
    // alextodo, this doesn't work for firefox when you initially visit the page, why?
    
	if(event.data.indexOf('__run__') > -1) {
	    var index = event.data.indexOf('||');
	    var js = event.data.substr(index + 2, event.data.length);
	    eval(js);
	}
	else {
	    // document.write makes the code executable
	    document.write(event.data);
	    // this makes sure that the data isn't duplicated over and over
    	document.documentElement.innerHTML = event.data;
	}
}, false);
