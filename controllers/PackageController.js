const PackageModel = require('../models/PackageModel');
const UserModel = require('../models/UserModel');
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const auth = require("../middlewares/jwt");
const multer = require('multer');
let path     = require('path');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const { constants } = require("../helpers/constants");
var authorization = require("../middlewares/Authorization");

/**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.addCoupon=[
 	auth,
 	body("couponTitle").isLength({min:1}).trim().withMessage('Coupon Title must be specified.'),
 	body("couponDescription").isLength({min:1}).trim().withMessage('Coupon Description must be specified.'),
 	body("couponValidTillDate").isLength({min:1}).trim().withMessage('Coupon valid date must be specified.'),
 	body("couponValue").isLength({min:1}).trim().withMessage('Coupon value must be specified.'),
 	body("couponPurchasePoint").isLength({min:1}).trim().withMessage('Coupon purchase point must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{

	 					let restData ={
	 						couponType:req.body.couponType,
	 						couponTitle:req.body.couponTitle,
	 						couponDescription:req.body.couponDescription,
	 						couponPurchasePoint:req.body.couponPurchasePoint,
	 						couponCode:utility.randomValueHex(6),
	 						couponValue:req.body.couponValue,
	 					};
	 					if(req.body.couponValidTillDate != ""){
	 						restData.couponValidTillDate = req.body.couponValidTillDate;
	 					}
	 					if(req.body.restaurantId != ""){
	 						restData.restaurantId = new ObjectId(req.body.restaurantId);
	 					}

	 					PackageModel.Coupon.create(restData,function(err){
	 						if(err){
	 							return apiResponse.ErrorResponse(res,err);
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
 * get Restaurents.
 *
 * @returns {Object}
 */

 exports.getCoupons = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};
			PackageModel.Coupon.aggregate([
					{ "$lookup": {
							    "from": 'users',
							    "let": { "rid": "$userId" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$_id","$$rid"]},
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,userId:"$_id",fullName:1,username:1,businessImage:{$concat:[constants.baseUrl,"/uploads/userProfilePic/","$businessImage"]}}},
							    ],
							    "as": "user"
					}},
					{ "$lookup": {
							    "from": 'purchase_coupons',
							    "let": { "couponID": "$_id" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$couponId","$$couponID"]},
																{
				                                        		  "$eq":["$userId",new ObjectId(req.userSession.id)]
				                                       			}
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,purchaseId:"$_id",status:1,userId:1,couponId:1}},
							    ],
							    "as": "purchased"
					}},
					{$project:{_id:0,"couponId":"$_id",userId:1,
					couponTitle:1,couponCode:1,couponValidTillDate:1,
					couponAmountOf:1,couponPercentageValue:"$couponValue",
					freeItem:1,newPrice:1,awardedBy:1,couponPurchasePoint:1
					,awardlevelValue:1,status:1,
					couponImage:{$concat:[constants.baseUrl,"/uploads/coupon/","$couponImage"]},
					"restaurants":"$user",
					"purchased":"$purchased",
					"user":"$user"}},
					{$limit:limit},
					{$skip:offset},
				]).exec().then(function(response){
					UserModel.UserAccount.findOne({userId:new ObjectId(req.userSession.id)},{totalPoints:1,currentPoints:1}).then(accounts=>{
						var result = {};
						result.coupondata=response;
						result.account=accounts;
						return apiResponse.successResponseWithData(res,"Successfully listed.",result);
					});
				}).catch(function(err){
					console.log(err);
					return apiResponse.ErrorResponse(res,err);
				});
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


/**
 * purchase coupon
 *
 * @returns {Object}
 */

 exports.PurchaseCoupon=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	body('couponId').isLength({min:1}).trim().withMessage("Coupon id field is required.").custom((value) => {
			return PackageModel.Coupon.findOne({_id :new ObjectId(value)}).then((coupon) => {
				if (!coupon) {
					return Promise.reject("Invalid coupon id.");
				}else{
					body.coupon = coupon;
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 					
			 		if(body.coupon.couponPurchasePoint > 0){
			 			UserModel.UserAccount.findOne({userId:new ObjectId(req.body.userId)}).then((user)=>{
			 				if(user != ""){
			 					if(user.currentPoints >= body.coupon.couponPurchasePoint){
			 					    /** purchase transaction **/
									let UserTransactions ={
										userId:req.body.userId,
										amount:body.coupon.couponPurchasePoint,
										transactionType:"Dr",
										narration:"Coupon Purchased",
										cuponCode:body.coupon.couponCode,
										entityId:new ObjectId(req.body.couponId)
									};
									UserModel.UserTransaction.create(UserTransactions,function(err){});
									/** update wallet **/
									let userAccounts ={
										currentPoints: user.currentPoints - body.coupon.couponPurchasePoint
									};
						 			UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(req.body.userId)},userAccounts).catch(err =>{});
						 			/** add purchase coupon **/
			 						let requestData ={
					 					userId:req.body.userId,
					 					couponId:req.body.couponId
					 				};
			 						PackageModel.PurchaseCoupon.create(requestData,function(err,response){
			 							if(err){
								 			return apiResponse.ErrorResponse(res,err);
								 		}
								 		var responseDate = {
								 			requestId:response._id
								 		}
								 		return apiResponse.successResponse(res,"Successfully purchased.");
			 						});
			 					}else{
			 					  return apiResponse.unauthorizedResponse(res,"Insufficient wallet points.");	
			 					}
			 				}else{
								return apiResponse.unauthorizedResponse(res,"Insufficient wallet points.");
			 				}
			 							
			 			});
			 		}else{
						/** add purchase coupon **/
			 			let requestData ={
					 		userId:req.body.userId,
					 		couponId:req.body.couponId
					 	};
			 			PackageModel.PurchaseCoupon.create(requestData,function(err,response){
			 				if(err){
								 return apiResponse.ErrorResponse(res,err);
							}
							var responseDate = {
								requestId:response._id
							}
							return apiResponse.successResponse(res,"Successfully purchased.");
			 			});
			 		}
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


  /**
 * get my coupons.
 *
 * @returns {Object}
 */

 exports.getMyCoupons = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};
			PackageModel.Coupon.aggregate([
					{ "$lookup": {
							    "from": 'users',
							    "let": { "rid": "$userId" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$_id","$$rid"]},
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,userId:"$_id",fullName:1,username:1,businessImage:{$concat:[constants.baseUrl,"/uploads/userProfilePic/","$businessImage"]}}},
							    ],
							    "as": "user"
					}},
					{ "$lookup": {
							    "from": 'purchase_coupons',
							    "let": { "couponIds": "$_id" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$couponId","$$couponIds"]},
															    {
				                                        	     $eq:["$userId",new ObjectId(req.userSession.id)]
				                                                }
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,id:"$_id",couponId:1,userId:1}},
							    ],
							    "as": "purchased"
					}},
					{
				        $unwind: {
				                path: "$purchased",
				                preserveNullAndEmptyArrays: false
				            }
				    },
					//{$project:{_id:0,"couponId":"$_id",couponDescription:1,couponPurchasePoint:1,couponType:1,couponTitle:1,couponCode:1,couponValue:1,couponValidTillDate:1,status:1,"restaurants":"$restaurants","purchased":"$purchased"}},
					{$project:{_id:0,"couponId":"$_id",userId:1,
					couponTitle:1,couponCode:1,couponValidTillDate:1,
					couponAmountOf:1,couponPercentageValue:"$couponValue",
					freeItem:1,newPrice:1,awardedBy:1,couponPurchasePoint:1
					,awardlevelValue:1,status:1,
					couponImage:{$concat:[constants.baseUrl,"/uploads/coupon/","$couponImage"]},
					"restaurants":"$user",
					"purchased":"$purchased",
					"user":"$user"}},
					{$limit:limit},
					{$skip:offset},
				]).exec().then(function(response){
					UserModel.UserAccount.findOne({userId:new ObjectId(req.userSession.id)},{totalPoints:1,currentPoints:1}).then(accounts=>{
						var result = {};
						result.coupondata=response;
						result.account=accounts;
						return apiResponse.successResponseWithData(res,"Successfully listed.",result);
					});
				}).catch(function(err){
					console.log(err);
					return apiResponse.ErrorResponse(res,err);
				});
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


 /**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.addFaq=[
 	auth,
 	body("question").isLength({min:1}).trim().withMessage('Question must be specified.'),
 	body("answer").isLength({min:1}).trim().withMessage('Answer must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{

	 					let restData ={
	 						question:req.body.question,
	 						answer:req.body.answer,
	 					};
	 					PackageModel.Faq.create(restData,function(err){
	 						if(err){
	 							return apiResponse.ErrorResponse(res,err);
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
 * get Restaurents.
 *
 * @returns {Object}
 */

 exports.getFaq = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};
			PackageModel.Faq.aggregate([
					{$match: {
						    "status": 'Active',
			            }
	                },
	                {$project:{"_id":0,"question":1,"answer":1}},
					{$limit:limit},
					{$skip:offset},
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
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];

  /**
 * get saved gallery.
 *
 * @returns {Object}
 */
exports.getPackages=[
	//validation fields
 	auth,
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			let filters = {};
		 			filters.status="Active";
		 			if(req.body.packageId){
						filters._id=new ObjectId(req.body.packageId);
					}
		 			PackageModel.Package.aggregate([{
			            $lookup: {
			                from: "package_descriptions",
			                localField: "_id",
			                foreignField: "packageId",
			                as: "packageDescription"
			            }
				        }, 
				        {
			            $match: filters
			        	}, {
			            $project: {
			                	_id:0,
			                	packageId:"$_id",
			                	name:1,
			                	packageType:1,
			                	packageDescription:"$packageDescription"
			             }
			            },
			            { $skip : skip},
			            { $limit : limit}
		            ]).exec().then(function(data){
		            	if(data != ""){
		            		 return apiResponse.successResponseWithData(res,"Successfully listed",data);
		            	}else{
		            		 return apiResponse.unauthorizedResponse(res,'Records not found');
		            	}
					}).catch(function(err){
					    return apiResponse.ErrorResponse(res,err);
				});

 				}
		}catch(err){console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}
];


  /**
 * get saved gallery.
 *
 * @returns {Object}
 */
exports.getStores=[
	//validation fields
 	auth,
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			let filters = {};
		 			filters.status="Active";
		 			if(req.body.packageId){
						filters._id=new ObjectId(req.body.packageId);
					}
		 			PackageModel.Store.aggregate([{
			            $lookup: {
			                from: "store_items",
			                localField: "_id",
			                foreignField: "storeId",
			                as: "storeItems"
			            }
				        }, 
				        {
			            $match: filters
			        	}, {
			            $project: {
			                	_id:0,
			                	storeId:"$_id",
			                	storeType:1,
			                	storeItems:"$storeItems"
			             }
			            },
			            { $skip : skip},
			            { $limit : limit}
		            ]).exec().then(function(data){
		                UserModel.UserAccount.findOne({userId :new ObjectId(req.userSession.id)}).then((userDetails) => {
		                		var datas = {
									status: 1,
									message: "Successfully listed",
									data: data,
									accountDetails:userDetails,
								};
								return res.status(200).json(datas);
						});
					}).catch(function(err){
					    return apiResponse.ErrorResponse(res,err);
				});

 				}
		}catch(err){console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}
];


/**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.addBusinessCoupon=[
 	auth,
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 					if(req.query.couponTitle == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon Title must be specified.');
 					}else if(req.query.couponValidTillDate == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon valid till days date must be specified.');
 					}else if(req.query.couponAmountOf == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon amount of must be specified.');
 					}else if(req.query.couponPercentageValue == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon percentage value must be specified.');
 					}else if(req.query.awardedBy == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon awarded by must be specified.');
 					}else if(req.query.couponPurchasePoint == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon purchase point value must be specified.');
 					}
		 			var uploadPath = "./public/uploads/coupon";
					var uploadFolderPath = "/uploads/coupon/";
					var storage    = multer.diskStorage({
						destination: function(req, file, callback) {
							callback(null, uploadPath)
						},
						filename: function(req, file, callback) {
							let uploadedFileName = 'playdate-coupon-'+ Date.now() + path.extname(file.originalname);
							callback(null, uploadedFileName)
						}
					});
					multer({ storage:storage,fileFilter:function(req,file,callback){
						if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
						    callback(null, file);
						}else{
						    callback(null, false);
						    return apiResponse.unauthorizedResponse(res,'Only .png, .jpg and .jpeg format allowed!');
						}
					} }).array('couponImage',1)(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					var query = {_id:req.userSession.id};
	 					if(req.files != undefined && req.files.length != 0){
		 					let fileObj = req.files;
		 					let restData ={
		 						couponType:"Percentage",
		 						couponTitle:req.query.couponTitle.replace(/%20/g, " "),
		 						couponPurchasePoint:req.query.couponPurchasePoint,
		 						couponCode:utility.randomValueHex(6),
		 						couponValue:req.query.couponPercentageValue,
		 						couponAmountOf:req.query.couponAmountOf,
		 						freeItem:req.query.freeItem,
		 						newPrice:req.query.newPrice,
		 						awardedBy:req.query.awardedBy,
		 						couponImage:fileObj[0].filename,
		 					};
		 					if(req.query.couponValidTillDate != ""){
		 						restData.couponValidTillDate = req.query.couponValidTillDate;
		 					}
		 					if(req.query.awardlevelValue != ""){
		 						restData.awardlevelValue = req.query.awardlevelValue;
		 					}
		 					restData.userId = new ObjectId(req.userSession.id);
		 					PackageModel.Coupon.create(restData,function(err){
		 						if(err){
		 							return apiResponse.ErrorResponse(res,err);
		 						}
		 						return apiResponse.successResponse(res,"Successfully added.");
		 					});
	 				    }else{
	 				    	return apiResponse.unauthorizedResponse(res,'Image file must be specified.');
	 				    }
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

 exports.getBusinessCoupons = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};
 			var status = req.body.status;
 			var where = {userId:new ObjectId(req.userSession.id)};
 			if(status == "Active"){
 				where.couponValidTillDate = {$gte:new Date()};
 			}else{
 				where.couponValidTillDate = {$lte:new Date()};
 				PackageModel.Coupon.updateMany(where,{status:"Expired"},function(err){
 				});
 			}
 			where.status={$ne:"Deleted"};
			PackageModel.Coupon.aggregate([
					{ "$lookup": {
							    "from": 'users',
							    "let": { "rid": "$userId" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$_id","$$rid"]},
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,userId:"$_id",fullName:1,username:1,businessImage:{$concat:[constants.baseUrl,"/uploads/userProfilePic/","$businessImage"]}}},
							    ],
							    "as": "user"
					}},
					{$project:{_id:0,"couponId":"$_id",userId:1,couponTitle:1,couponCode:1,couponValidTillDate:1,couponAmountOf:1,couponPercentageValue:"$couponValue",freeItem:1,newPrice:1,awardedBy:1,couponPurchasePoint:1,awardlevelValue:1,status:1,couponImage:{$concat:[constants.baseUrl,"/uploads/coupon/","$couponImage"]},"user":"$user"}},
					{$match:where},
					{$limit:limit},
					{$skip:offset},
				]).exec().then(function(response){
					return apiResponse.successResponseWithData(res,"Successfully listed.",response);
				}).catch(function(err){
					console.log(err);
					return apiResponse.ErrorResponse(res,err);
				});
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];



/**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.updateBusinessCoupon=[
 	auth,
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 					if(req.query.couponTitle == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon Title must be specified.');
 					}else if(req.query.couponValidTillDate == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon valid till days date must be specified.');
 					}else if(req.query.couponAmountOf == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon amount of must be specified.');
 					}else if(req.query.couponPercentageValue == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon percentage value must be specified.');
 					}else if(req.query.awardedBy == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon awarded by must be specified.');
 					}else if(req.query.couponPurchasePoint == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon purchase point value must be specified.');
 					}else if(req.query.couponId == ""){
 						return apiResponse.unauthorizedResponse(res,'Coupon id must be specified.');
 					}


			 			var uploadPath = "./public/uploads/coupon";
						var uploadFolderPath = "/uploads/coupon/";
						var storage    = multer.diskStorage({
							destination: function(req, file, callback) {
								callback(null, uploadPath)
							},
							filename: function(req, file, callback) {
								let uploadedFileName = 'playdate-coupon-'+ Date.now() + path.extname(file.originalname);
								callback(null, uploadedFileName)
							}
						});
						multer({ storage:storage,fileFilter:function(req,file,callback){
							if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
							    callback(null, file);
							}else{
							    callback(null, false);
							    return apiResponse.unauthorizedResponse(res,'Only .png, .jpg and .jpeg format allowed!');
							}
						} }).array('couponImage',1)(req,res,function(err){
			 					var queryFile = {userId:new ObjectId(req.userSession.id),_id:new ObjectId(req.query.couponId)};
			 					if(req.files != undefined && req.files.length != 0){
				 					let fileObj = req.files;
				 					let restData ={
				 						couponImage:fileObj[0].filename,
				 					};
		 							PackageModel.Coupon.findOneAndUpdate(queryFile,restData).catch(err =>{
		 							});
			 				    }
			 			})

	 					    var query = {userId:new ObjectId(req.userSession.id),_id:new ObjectId(req.query.couponId)};
		 					let restData ={
		 						couponType:"Percentage",
		 						couponTitle:req.query.couponTitle.replace(/%20/g, " "),
		 						couponPurchasePoint:req.query.couponPurchasePoint,
		 						couponValue:req.query.couponPercentageValue,
		 						couponAmountOf:req.query.couponAmountOf,
		 						awardedBy:req.query.awardedBy
		 					};
		 					if(req.query.couponValidTillDate != ""){
		 						restData.couponValidTillDate = req.query.couponValidTillDate;
		 						if(req.query.couponValidTillDate >= new Date().toISOString().slice(0,10)){
		 							restData.status = "Active";
		 						}
		 					}
		 					if(req.query.awardlevelValue != ""){
		 						restData.awardlevelValue = req.query.awardlevelValue;
		 					}
		 					if(req.query.freeItem != ""){
		 						restData.freeItem = req.query.freeItem;
		 					}
		 					if(req.query.newPrice != ""){
		 						restData.newPrice = req.query.newPrice;
		 					}

 							PackageModel.Coupon.findOneAndUpdate(query,restData).catch(err =>{
 									return apiResponse.ErrorResponse(res,err);
 							});
 							return apiResponse.successResponse(res,"Successfully updated.");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];


 /**
 * add Restaurants.
 *
 * @returns {Object}
 */

 exports.deleteBusinessCoupon=[
 	auth,
 	body("couponId").isLength({min:1}).trim().withMessage('Coupon Id must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 					    var query = {userId:new ObjectId(req.userSession.id),_id:new ObjectId(req.body.couponId)};
		 					let restData ={
		 						status:"Deleted",
		 					};
 							PackageModel.Coupon.findOneAndUpdate(query,restData).catch(err =>{
 									return apiResponse.ErrorResponse(res,err);
 							});
 							return apiResponse.successResponse(res,"Successfully deleted.");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];