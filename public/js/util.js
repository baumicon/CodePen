var Util = (function() {

	var Util = {

	    getDataValues: function(params) {
            var dataValues = '';
            var count = 0;
            
            for(var key in params) {
                if(dataValues != '') dataValues += '&';
                dataValues += key + '=' + encodeURIComponent(params[key]);
            }
            
            return dataValues;
        },
	    
    };

	// This ends the Util module

	return Util;

})();