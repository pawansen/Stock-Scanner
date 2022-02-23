const RestaurantsModel = require('../models/RestaurantsModel');
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const auth = require("../middlewares/jwt");
const multer = require('multer');
var uploadPath = "./public/uploads/restaurants";
var uploadFolderPath = "/uploads/restaurants/";
let path     = require('path');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const { constants } = require("../helpers/constants");
var storage    = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, uploadPath)
	},
	filename: function(req, file, callback) {
		let uploadedFileName = 'restaurant-'+ Date.now() + path.extname(file.originalname);
		callback(null, uploadedFileName)
	}
});
var uploadFile  = multer({ storage:storage }).array('restaurantImage',1);
/**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.addRestaurant=[
 	auth,
 	body('name').trim(),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 			uploadFile(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					let fileObj = req.files;
	 					let coordinates = [req.query.lat,req.query.long];
	 					let restData ={
	 						image:fileObj[0].filename,
	 						imagePath:uploadFolderPath+fileObj[0].filename,
	 						name:req.query.name,
	 						address:req.query.location,
	 						openTime:req.query.openTime,
	 						closeTime:req.query.closeTime,
	 						lat:req.query.lat,
	 						long:req.query.long,
	 						location:{
									"type" : "Point",
									"coordinates" : coordinates
								}
	 					};
	 					RestaurantsModel.Restaurants.create(restData,function(err){
	 						if(err){
	 							return apiResponse.ErrorResponse(res,err);
	 						}
	 						return apiResponse.successResponse(res,"Successfully added.");
	 					});
	 				}
	 			})
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];

 /**
 * get Restaurents.
 *
 * @returns {Object}
 */

 exports.getRestaurant = [
 auth,
 	(req,res)=>{
 		console.log(req.body);
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};

			RestaurantsModel.Restaurants.find(filters,'_id name image imagePath address status openTime closeTime lat long').skip(offset).limit(limit).then(response=>{
				if(response){
					let responseObj = [];
					for(var i=0;i<parseInt(response.length);i++){
						let row = {};
						row.id = response[i]._id;
						row.name = response[i].name;
						row.address = response[i].address;
						row.openTime = response[i].openTime;
						row.closeTime = response[i].closeTime;
						row.lat = response[i].lat;
						row.long = response[i].long;
						row.status = response[i].status;
						row.image = constants.baseUrl+response[i].imagePath;
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

 /**
 * update Restaurants.
 *
 * @returns {Object}
 */

 exports.updateRestaurant=[
 	auth,
 	body('name').trim().isLength({min:1}).withMessage('Name fiels is required'),
 	body('id').trim().isLength({min:1}).withMessage('ID fiels is required'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 			var query = {_id:req.body.id};
	 			let restData ={
	 				name:req.body.name.toLowerCase()
	 			};
	 			console.log(restData);
	            RestaurantsModel.Restaurants.findOneAndUpdate(query,restData).catch(err =>{
	 			    return apiResponse.ErrorResponse(res,err);
	 			});
				return apiResponse.successResponse(res,"Successfully updated.");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];

  exports.updateRestaurant=[
 	auth,
 	body('name').trim(),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 			uploadFile(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					var query = {_id:req.query.restaurantId};
	 					let fileObj = req.files;
	 					let coordinates = [req.query.lat,req.query.long];
	 					let restData ={
	 						image:fileObj[0].filename,
	 						imagePath:uploadFolderPath+fileObj[0].filename,
	 						name:req.query.name,
	 						address:req.query.location,
	 						openTime:req.query.openTime,
	 						closeTime:req.query.closeTime,
	 						lat:req.query.lat,
	 						long:req.query.long,
	 						location:{
									"type" : "Point",
									"coordinates" : coordinates
								}
	 					};
			            RestaurantsModel.Restaurants.findOneAndUpdate(query,restData).catch(err =>{
			 			    return apiResponse.ErrorResponse(res,err);
			 			});
						return apiResponse.successResponse(res,"Successfully updated.");
			 				}
			 			})
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];


  /**
 * get Restaurents.
 *
 * @returns {Object}
 */

 exports.getRestaurantDetails = [
  	body('lat').trim().isLength({min:1}).withMessage('lat fiels is required'),
 	body('long').trim().isLength({min:1}).withMessage('long fiels is required'),
 auth,
 	(req,res)=>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
	 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
	 			let filters = {};
	 			if(req.body.id != ""){
	 				filters._id=new ObjectId(req.body.id);
	 			}
				RestaurantsModel.Restaurants.aggregate([
					{ "$geoNear": {
			            "near": {
			                "type": "Point",
			                "coordinates": [parseFloat(req.body.lat),parseFloat(req.body.long)]
			            },
			            "distanceField": "distance",
			            "spherical": true,
			            //"maxDistance": 250
			        }},
					{$project:{_id:0,"id":"$_id","distance":"$distance",name:1,address:1,openTime:1,closeTime:1,lat:1,long:1,status:1,image:{$concat:[constants.baseUrl,"","$imagePath"]}}},
					{$limit:1},
				]).exec().then(function(response){
					if(response != ""){
						return apiResponse.successResponseWithData(res,"Successfully listed.",response);
					}else{
						return apiResponse.unauthorizedResponse(res,"Records not found");
					}
				}).catch(function(err){
					console.log(err);
					return apiResponse.ErrorResponse(res,err);
				});
 			}
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];