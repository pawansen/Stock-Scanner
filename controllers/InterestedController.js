const InterestedModel = require('../models/InterestedModel');
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
var auth = require("../middlewares/jwt");

/**
 * add Interested.
 *
 * @returns {Object}
 */

 exports.addInterested = [
 	auth,
 	body("name").isLength({min:1}).withMessage('Name must be specified.'),
 	(req,res)=>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				let nameVal = req.body.name.toLowerCase();
 				InterestedModel.Interested.create({name:nameVal},function(err){
					if(err){
					   return apiResponse.ErrorResponse(res, err);
					}
					return apiResponse.successResponse(res,"Successfully added.");
 				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


/**
 * get Interested.
 *
 * @returns {Object}
 */

 exports.getInterested = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filter) ? {name:{ $regex: '.*' + req.body.filter.toLowerCase() + '.*' }} : {};
			InterestedModel.Interested.find(filters,'_id name').skip(offset).limit(limit).then(response=>{
				if(response){
					let responseObj = [];
					for(var i=0;i<parseInt(response.length);i++){
						let row = {};
						row.id = response[i]._id;
						row.name = response[i].name;
						responseObj.push(row);
					}
					return apiResponse.successResponseWithData(res,"Successfully listed.",responseObj);
				}else{
					return apiResponse.unauthorizedResponse(res,"Records not found");
				}
			});
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];