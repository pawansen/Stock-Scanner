var mongoose = require("mongoose");
const apiResponse = require("../helpers/apiResponse");
var ObjectId = mongoose.Types.ObjectId;
const UserAuth = (req,res,next) =>{
	let userId = req.body.userId;
	if(ObjectId.isValid(userId)){
        if(req.userSession.id != userId){
            return apiResponse.unauthorizedResponse(res,"Invalid userId.");
        }else{
        	next();
        }
    }else{
    	return apiResponse.unauthorizedResponse(res,"Invalid userId.");
    }
}
module.exports = {UserAuth};