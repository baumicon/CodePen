var ContentWrangler = (function() {

	var ContentWrangler = {

	    init: function() {
            console.log('inited');
	    },

        saveContent: function(slug) {
             $.ajax({
                url: '/return/stuff/',
                type: 'GET',
                async: false,
                data: 'slug='+slug+'&things=good',
                success: function( result ) {
                    alert(result+slug);
                    return false;
                }
            });
        },

        getFakeContent: function() {

        }
    }

	return ContentWrangler;

})();
