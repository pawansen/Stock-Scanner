    /**
     * To get random number
    */

exports.randomNumber = function (length) {
	var text = "";
	var possible = "1234567890123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

    /**
     * To get unique guid
    */
exports.getGuid = function(){
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
                this.s4() + '-' + this.s4() + this.s4() + this.s4();
}

/**
     * To get md5 value
     * @param {string} value
    */
 exports.randomValueHex = function(len){
        var crypto = require('crypto');
        return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex')
        .slice(0,len).toUpperCase();
}

    /**
     * To get offset
     * @param {integer} pageNo 
     * @param {integer} limit 
    */
    exports.getOffset=function(pageNo,limit = 10){
        if(parseInt(pageNo) === 0){
            pageNo = 1;
        }
        let offsetVal = (parseInt(pageNo) - 1) * parseInt(limit);
        return parseInt(offsetVal);
    }
