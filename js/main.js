(function($) {

	$(".settings").hide().css({
		"height": "auto"
	});
	
	$(".settings-nub").on("click", function(e) {

		e.preventDefault();
		
		$(this).toggleClass("open").next().slideToggle();

	});

	var win          = $(window),
		body         = $("body"),

        boxHTML      = $(".box-html"),
        boxCSS       = $(".box-css"),
        boxJS        = $(".box-js"),
        boxResult    = $(".result"),

        topBoxes     = $(".box-html, .box-css, .box-js");

    win.resize(function() {
    	
		var space = body.height() - 100;

		topBoxes.height(space / 2);

		boxResult.height(space / 2);

    }).trigger("resize");

})(jQuery);