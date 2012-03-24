(function() {

  var navLinks = $("nav a");

  navLinks.on("click", function() {

    navLinks.removeClass("active");
    $(this).addClass("active");

  });

})();