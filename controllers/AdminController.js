const UserModel = require('../models/UserModel');
const PackageModel = require('../models/PackageModel');
const InterestedModel = require('../models/InterestedModel');
const RestaurantsModel = require('../models/RestaurantsModel');
const ChatModel = require('../models/ChatModel');
const PostModel = require('../models/PostModel');
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var authorization = require("../middlewares/Authorization");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const moment = require('moment');
var ip = require("ip");
const MomentDT = moment();
const utility = require("../helpers/utility");
var auth = require("../middlewares/jwt");
const multer = require('multer');
let path     = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

/**
 * User Login.
 *
 * @returns {Object}
 */

exports.login = [
	body("keyward").isLength({ min: 1 }).trim().withMessage("Keyward must be specified."),
	(req,res)=>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else{
				UserModel.User.findOne({$or:[{email:req.body.keyward},{phoneNo:req.body.keyward}]}).then(user =>{
					if(user){
						bcrypt.compare(req.body.password,user.password,function(err,match){
							if(match){
								if(user.userRoleType != 'User'){
									let userData = {
										id:user._id,
										fullName:user.fullName,
										email:user.email,
										username:user.username,
										phoneNo:user.phoneNo,
										status:user.status,
									};
									//jwt configuration
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									userData.gender = user.gender;
									userData.birthDate = user.birthDate;
									userData.age = user.age;
									userData.profilePic = user.profilePic;
									userData.profilePicPath = (user.profilePicPath) ? constants.baseUrl+user.profilePicPath : null;
									userData.profileVideo = user.profileVideo;
									userData.profileVideoPath = (user.profileVideoPath) ? constants.baseUrl+user.profileVideoPath : null;
									userData.relationship = user.relationship;
									userData.personalBio = user.personalBio;
									userData.interested = user.interested;
									userData.restaurants = user.restaurants;
									userData.userType = user.userType;
									userData.interestedIn = user.interestedIn;
									userData.inviteCode = user.inviteCode;
									userData.paymentMode = user.paymentMode;
									userData.sourceType = user.sourceType;
									userData.sourceSocialId = user.sourceSocialId;
									/** delete all session **/
									UserModel.UserLoginSession.deleteMany({userID:new ObjectId(user._id)},function(err,ress){
									});
									let userSession ={
										userID:user._id,
										sessionKey:utility.randomValueHex(32),
										deviceType:req.body.deviceType,
										deviceID:req.body.deviceID,
										deviceToken:req.body.deviceToken,
										ipAddress:ip.address(),
									};
									UserModel.UserLoginSession.create(userSession,function(err){
										if(err){
											return apiResponse.ErrorResponse(res,err);
										}
										return apiResponse.successResponseWithData(res,"Successfully login.", userData);
									});
								}else{
									return apiResponse.unauthorizedResponse(res,"You have not permission to admin access.");
								}
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");
					}

				});
			}
		}catch(err){
			return apiResponse.ErrorResponse(res, err);
		}

	}];

/**
 * User registration.
 *
 * @returns {Object}
 */


 exports.register = [
 	// Validate fields.
 	body("fullName").isLength({min:1}).trim().withMessage("Name must be specified."),
 	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.User.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
    body("deviceType").isLength({min:1}).trim().withMessage("Device Type must be specified Web,Android,Ios."),
    body("phoneNo").isLength({min:10}).trim().withMessage("Phone Number must be 10 characters.").isNumeric().
    withMessage('Phone Number should be numeric only').custom((value)=>{
    	return UserModel.User.findOne({phoneNo:value}).then((user)=>{
    		if(user){
    			return Promise.reject("Phone Number already in use");
    		}
    	});
    }),
    body("password").isLength({min:6}).trim().withMessage("Password must be 6 characters or greater."),
    body("userRoleType").isLength({min:1}).trim().withMessage("UserType must be specified Admin,Subadmin."),
	(req,res) =>{
		try{
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
			}else{
				bcrypt.hash(req.body.password,10,function(err,hash){

					// generate OTP for confirmation
					//let otp = utility.randomNumber(4);
					let otp = 1234;
					// Create User object with escaped and trimmed data
					var users =
						{
							fullName: req.body.fullName,
							email: req.body.email,
							address: req.body.address,
							phoneNo: req.body.phoneNo,
							password: hash,
							userRoleType:req.body.userRoleType,
							inviteCode:utility.randomNumber(4),
							ipAddress:ip.address(),
							status:1,
							username:'playAdmin',
						};
						UserModel.User.create(users,function(err){
							if(err){
								return apiResponse.ErrorResponse(res, err);
							}else{
								return apiResponse.successResponseWithData(res,"Registration Success.", users);
							}
						});
				});
			}
		}catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

	/**
 * add Questions.
 *
 * @returns {Object}
 */

 exports.addQuestion=[
 	auth,
 	body("question").isLength({min:1}).trim().withMessage('Question must be specified.'),
 	body("options").isLength({min:1}).trim().withMessage('Options must be specified.'),
 	body("isRightAnswer").isLength({min:1}).trim().withMessage('IsRightAnswer must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 					let restData ={
	 						userId:req.userSession.id,
	 						question:req.body.question,
	 					};
	 					var opt = req.body.options.split(",");
	 					PackageModel.Question.create(restData,function(err,response){
	 						if(err){
	 							console.log(err);
	 							return apiResponse.ErrorResponse(res,err);
	 						}else{
									for(i=0;i<opt.length;i++){
										/** options **/
							 			let options = {
							 				questionId:response._id,
							 				option:opt[i],
							 				isRightAnswer:(opt[i] == req.body.isRightAnswer) ? "Yes" : "No",
							 			};
							 			console.log(options);
							 			PackageModel.QuestionOption.create(options,function(err){});
									}	
								return apiResponse.successResponse(res,"Successfully added.");
	 						}	
	 					});
 			}
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];

	/**
 * get Questions.
 *
 * @returns {Object}
 */

 exports.getQuestions=[
 	auth,
 	(req,res)=>{
 		try{
	 					  PackageModel.Question.aggregate([
						 	    { "$lookup": {
									        "from": 'question_options',
									        "let": { "qId": "$_id" },
									        "pipeline": [

									          { "$match": { "$expr": { "$and":[{ "$eq": ["$questionId", "$$qId"] }] } }},

									          {"$project":{_id:0,optionId:"$_id",option:1,questionId:1,isRightAnswer:1}},

									        ],"as": "options"
							    }},
					    		{ 
							    $match: {
							                $and:[{"status":"Active"}]
							            }
							     },
					            {$project: {
					                	_id:0,
					                	questionId: "$_id",
					                    question: 1,
					                    status:1,
					                    entryDate:1,
					                    options:"$options",

					             }
					            },
					            {"$sort":{entryDate:-1}},
								]).exec().then(function(questions){
									return apiResponse.successResponseWithData(res,"Successfully listed",questions);
								}).catch(function(err){
									return apiResponse.ErrorResponse(res,err);
								});
 		}catch(err){
 			console.log(err);
			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


	/**
 * get Questions.
 *
 * @returns {Object}
 */

 exports.getQuestionDetails=[
 	auth,
 	body("questionId").trim().isLength({min:1}).withMessage("Question id must be specified.").custom((value)=>{
 		return PackageModel.Question.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid question id.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 					  PackageModel.Question.aggregate([
						 	    { "$lookup": {
									        "from": 'question_options',
									        "let": { "qId": "$_id" },
									        "pipeline": [

									          { "$match": { "$expr": { "$and":[{ "$eq": ["$questionId", "$$qId"] }] } }},

									          {"$project":{_id:0,optionId:"$_id",option:1,questionId:1,isRightAnswer:1}},

									        ],"as": "options"
							    }},
					    		{ 
							    $match: {
							                $and:[{"status":"Active"},{"_id":new ObjectId(req.body.questionId)}]
							            }
							     },
					            {$project: {
					                	_id:0,
					                	questionId: "$_id",
					                    question: 1,
					                    status:1,
					                    entryDate:1,
					                    options:"$options",

					             }
					            },
					            {"$sort":{entryDate:-1}},
								]).exec().then(function(questions){
									return apiResponse.successResponseWithData(res,"Successfully listed",questions);
								}).catch(function(err){
									return apiResponse.ErrorResponse(res,err);
								});
	 		}
 		}catch(err){
 			console.log(err);
			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];

 	/**
 * get Questions.
 *
 * @returns {Object}
 */

 exports.updateQuestion=[
 	auth,
 	body("question").isLength({min:1}).trim().withMessage('Question must be specified.'),
 	body("options").isLength({min:1}).trim().withMessage('Options must be specified.'),
 	body("isRightAnswer").isLength({min:1}).trim().withMessage('IsRightAnswer must be specified.'),
 	body("questionId").trim().isLength({min:1}).withMessage("Question id must be specified.").custom((value)=>{
 		return PackageModel.Question.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid question id.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 					let restData ={
	 						userId:req.userSession.id,
	 						question:req.body.question,
	 					};
	 					var opt = req.body.options.split(",");
	 					PackageModel.Question.findOneAndUpdate({_id:new ObjectId(req.body.questionId)},restData).
						 catch(err =>{
						 	//return apiResponse.ErrorResponse(res,err);
						});
 						var whereQ = {questionId:req.body.questionId};
 						PackageModel.QuestionOption.deleteMany(whereQ).catch(err=>{
 							//return apiResponse.ErrorResponse(res,err);
 						});
						for(i=0;i<opt.length;i++){
							/** options **/
							let options = {
							 	questionId:req.body.questionId,
							 	option:opt[i],
							 	isRightAnswer:(opt[i] == req.body.isRightAnswer) ? "Yes" : "No",
							};
							console.log(options);
							PackageModel.QuestionOption.create(options,function(err){});
							}	
						return apiResponse.successResponse(res,"Successfully updated.");
	 		}
 		}catch(err){
 			console.log(err);
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
 auth,
 body("restaurantId").trim().isLength({min:1}).withMessage("Restaurant id must be specified.").custom((value)=>{
 		return RestaurantsModel.Restaurants.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid restaurant id.");
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 			var filters = {"_id":new ObjectId(req.body.restaurantId)};
				RestaurantsModel.Restaurants.find(filters,'_id name image imagePath address status openTime closeTime lat long').then(response=>{
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

	 		}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


 /**
 * add Interested.
 *
 * @returns {Object}
 */

 exports.addInteresteds = [
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

 exports.getInteresteds = [
 auth,
 	(req,res)=>{
 		try{
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			let filters = (req.body.filter) ? {name:{ $regex: '.*' + req.body.filter.toLowerCase() + '.*' }} : {};
			if(req.body.interestedId){
				filters._id=new ObjectId(req.body.interestedId);
			}
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

  	/**
 * get Questions.
 *
 * @returns {Object}
 */

 exports.updateInterested=[
 	auth,
 	body("name").isLength({min:1}).trim().withMessage('Name must be specified.'),
 	body("interestedId").trim().isLength({min:1}).withMessage("Interested id must be specified.").custom((value)=>{
 		return InterestedModel.Interested.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid interested id.");
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 					let restData ={
	 						name:req.body.name.toLowerCase(),
	 					};
	 					InterestedModel.Interested.findOneAndUpdate({_id:new ObjectId(req.body.interestedId)},restData).
						 catch(err =>{
						});
						return apiResponse.successResponse(res,"Successfully updated.");
	 		}
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
 			filters.status="Active";
 			if(req.body.faqId){
				filters._id=new ObjectId(req.body.faqId);
			}
			PackageModel.Faq.aggregate([
					{$match: filters
	                },
	                {$project:{"_id":1,"faqId":"$_id","question":1,"answer":1}},
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
 * update Faq.
 *
 * @returns {Object}
 */

 exports.updateFaq=[
 	auth,
 	body("question").isLength({min:1}).trim().withMessage('Question must be specified.'),
 	body("answer").isLength({min:1}).trim().withMessage('Answer must be specified.'),
 	body("faqId").trim().isLength({min:1}).withMessage("Faq id must be specified.").custom((value)=>{
 		return PackageModel.Faq.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid faq id.");
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 					let restData ={
	 						question:req.body.question,
	 						answer:req.body.answer,
	 					};
	 					PackageModel.Faq.findOneAndUpdate({_id:new ObjectId(req.body.faqId)},restData).
						 catch(err =>{
						});
						return apiResponse.successResponse(res,"Successfully updated.");
	 		}
 		}catch(err){
 			console.log(err);
			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


 /**
 * get users list.
 *
 * @returns {Object}
 */

exports.getUsers = [
 	// Validate fields.
 	auth,
 	body("filters").trim(),
 	(req,res)=>{
 		try{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				let filters = (req.body.filter) ? {fullName:{ $regex: '.*' + req.body.filter + '.*' }} : {};
				UserModel.User.aggregate([
					 {$project: {_id: 1,userId:"$_id",email:1,gender:1,birthDate:1,userType:1,relationship:1,userRoleType:1,fullName: 1, phoneNo: 1, 
					 	username: 1, status: 1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}
					 }},
				     {$skip : skip},
				     {$limit : limit},
					{
		              $match: filters,
				    },
				]).exec().then(function(data){
					return apiResponse.successResponseWithData(res,"Successfully listed",data);
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});
	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


/**
 * get user profile details.
 *
 * @returns {Object}
 */

exports.getProfileDetails = [
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
    	return UserModel.User.findOne({_id:new ObjectId(value)}).then((user)=>{
    		if(!user){
    			return Promise.reject("Invalid UserId.");
    		}
    	});
    }),
 	(req,res)=>{
 		try{
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{

 				UserModel.User.aggregate([
 				    { 
					   $match: { 
					   			$or:[ {'_id':new ObjectId(req.body.userId)} ]
					    	 }
					},
					{
						$lookup:{
							from: "user_social_subscribers",
							let: {
								uId:"$_id",
						    },
							pipeline:[
								{
									$match:{
										$expr:{ 
												$or:[
												{
													$eq:['$userID',"$$uId"]
												},
												{
													$eq:['$toUserID',"$$uId"]
												},
												],

										},
										$and:[{"action":"Friend"},{"status":"Verified"}]
									},
								}
							],as:"friends"
						}
					},
					{
						$lookup:{
							from: "feed_posts",
							let: {
								uId:"$_id",
						    },
							pipeline:[
								{
									$match:{
										$expr:{ 
												$and:[
												{
													$eq:['$userId',"$$uId"]
												},
												],

										},
										$and:[{"status":"Active"}]
									},
								}
							],as:"posts"
						}
					},
					{
						$lookup:{
							from: "interesteds",
							let: {
								instId:"$interested",
						    },
							pipeline:[
								{
									$match:{$expr:{$in:["$_id","$$instId"]}},
								},
								{$project:{_id:0,"id":"$_id",name:1}},
							],as:"interestedList"
						}
					},
					{
						$lookup:{
							from: "restaurants",
							let: {
								restId:"$restaurants",
						    },
							pipeline:[
								{
									$match:{$expr:{$in:["$_id","$$restId"]}},
								},
								{$project:{_id:0,"id":"$_id",name:1}},
							],as:"restaurantsList"
						}
					},
					{
						$lookup:{
							from: "user_accounts",
							let: {
								uId:"$_id",
						    },
							pipeline:[
								{
									$match:{
										$expr:{ 
												$and:[
												{
													$eq:['$userId',"$$uId"]
												}
												],

										}
									},
								},
								{$project:{_id:0,userId:1,totalPoints:1,currentPoints:1,gameCoins:1,dateCoins:1,dmBooster:1,multiplayer:1,exclusiveDiscounts:1,accessAllGames:1}},
							],as:"account"
						}
					},
					{
						$project: {
						 	_id: 1,
						 	"userId":"$_id",
						 	fullName: 1,
						 	address: 1,
						 	phoneNo: 1,
						 	email: 1,
						 	username: 1,
						 	gender: 1,
						 	birthDate: 1,
						 	age: 1,
						 	relationship:1,
						 	personalBio: 1,
						 	interestedIn: 1,
						 	paymentMode: 1,
						 	onlineStatus: 1,
						 	inviteCode: 1,
						 	status: 1,
						 	profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
						 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]},
						 	totalFriends:{$size:"$friends"},
						 	totalPosts:{$size:"$posts"},
						 	interested:"$interestedList",
						 	restaurants:"$restaurantsList",
						 	account:"$account"
						}
 					},

 					]).exec().then(function(data){
 						data[0].inviteLink = "Hey, I'm on PlayDate . Join me! Download it here: "+constants.baseUrl+"/"+data[0].inviteCode+" and use promo code "+data[0].inviteCode+" and earn "+constants.referralPoints+" PlayDate Coins.";
 					   return apiResponse.successResponseWithData(res,"Successfully listed",data);
 					}).catch(function(err){
 						return apiResponse.ErrorResponse(res,err);
 					});
 			}
	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


 /**
 * profile change password.
 *
 * @returns {Object}
 */

 exports.changePassword = [
 	// Validate fields.
 	auth,
 	authorization.UserAuth,
 	body("oldPassword").isLength({min:6}).trim().withMessage("Old Password must be 6 characters or greater."),
	body("newPassword").isLength({min:6}).trim().withMessage("New Password must be 6 characters or greater.").custom((value , { req }) => {
	    	if (value == req.body.oldPassword) {
		        //throw new Error('New password should be different to old password.');
		        return Promise.reject("New password should be different to old password.");
		    }
		    return true;
		}),
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
	(req,res)=>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else{
 				UserModel.User.aggregate([
 				    { $match: {$and:[ {'_id':new ObjectId(req.body.userId)}]}},
					{$project: {_id: 1,password: 1,isSocialSignup:1}},
 					]).exec().then(function(user){
 						if(user != ""){
 							if(user[0].isSocialSignup == "No"){
	 							bcrypt.compare(req.body.oldPassword,user[0].password,function(err,match){
	 								if(match){
										bcrypt.hash(req.body.newPassword,10,function(err,hash){
												/** updte password **/
												var users =
												{
													password: hash,
												};
												UserModel.User.findOneAndUpdate({'_id':new ObjectId(req.body.userId)},users).
									 			catch(err =>{
									 				return apiResponse.ErrorResponse(res,err);
									 			});
									 			/** delete all session **/
									 			let userSession ={
													userID:new ObjectId(req.body.userId)
												};
												UserModel.UserLoginSession.deleteMany(userSession).then(function(){
												    console.log("Data deleted"); // Success
												}).catch(function(error){
												    return apiResponse.ErrorResponse(res,err);
												});
												return apiResponse.successResponse(res,"Password updated successfully.");
										});
	 								}else{
	 									return apiResponse.unauthorizedResponse(res,"Old password doesn`t match.");
	 								}
	 							});
 					     }else{
 							return apiResponse.unauthorizedResponse(res,"Social user can`t change password.");	
 						 }
 						}else{
 							return apiResponse.unauthorizedResponse(res,"Invalid user.");	
 						}
 					}).catch(function(err){
 						return apiResponse.ErrorResponse(res,err);
 					});
			}
		}catch(err){
			return apiResponse.ErrorResponse(res, err);
		}

}];

/**
 * get my feed post.
 *
 * @returns {Object}
 */
exports.getMyPostFeed=[
	//validation fields
	auth,
	//authorization.UserAuth,
	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
	(req,res) =>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else{
			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
			PostModel.FeedPost.aggregate([
		        {"$project":{
		        	_id:0,
		        	postId:"$_id",
		        	location:1,
		        	postType:1,
		        	tag:1,
		        	notifyStatus:1,
		        	entryDate:1,
		        	mediaId:1,
		        	tagFriend:1,
		        	username:1,
		        	userId:1,
		        	likes:1,
		        	comments:1,
		        	emojiCode:1,
		        	colorCode:1,
		        	commentStatus:1,
		        	status:1,
		        }},
		        {"$sort":{entryDate:-1}},
		        { "$lookup": {
				    "from": 'users',
				    "let": { "uid": "$userId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$uid"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "postedBy"
				  }},
				{ "$lookup": {
				    "from": 'media',
				    "let": { "mId": "$mediaId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$mId"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,mediaId:"$_id",mediaType:1,mediaFullPath:{$concat:[constants.baseUrl,"$sectionPath","/","$mediaName"]},mediaThumbName:{$concat:[constants.baseUrl,"/","$mediaThumbName"]},}},
				    ],
				    "as": "media"
				  }},
				  { "$lookup": {
				    "from": 'users',
				    "let": { "tagId": "$tagFriend" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$in":["$_id", "$$tagId"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "tagFriends"
				  }},
				  { "$lookup": {
				    "from": 'feed_likes',
				    "let": { "pId": "$postId"},
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$postId", "$$pId"]},
													{
				                                        $eq:["$userId",new ObjectId(req.userSession.id)]
				                                    }
												]
											}
				      	 		   } 
				      },
				      {
				      	"$group":
            			{
		                	_id:"$likeArr",
		                    "like":{$sum:1},
            		    }
            		},
		 			{"$project":{_id:0}},
				    ],
				    "as": "likeArr"
				  },

				},
				{ "$lookup": {
				    "from": 'feed_user_galleries',
				    "let": { "pIds": "$postId"},
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$postId", "$$pIds"]},
													{
				                                        $eq:["$userId",new ObjectId(req.userSession.id)]
				                                    }
												]
											}
				      	 		   } 
				      },
				      {
				      	"$group":
            			{
		                	_id:"$galleryArr",
		                    "gallery":{$sum:1},
            		    }
            		},
		 			{"$project":{_id:0}},
				    ],
				    "as": "galleryArr"
				  },

				},
				{ "$lookup": {
				    "from": 'feed_comments',
				    "let": { "postCommentId": "$postId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$postId","$$postCommentId"]}
												]
											},
									"$and":[{"status":"Active"}]
				      	 		   },


				      },{"$limit":4},
		 			  {"$project":{_id:1,commentId:"$_id",postId:1,comment:1,entryDate:1,userId:1}},
		 			  {"$lookup":{
		 			  		"from": 'users',
		 			  		"let": {'commentUserId':'$userId'},
		 			  		"pipeline":[
		 			  				{"$match":{"$expr":{
		 			  					"$and":[{"$eq":["$_id","$$commentUserId"]}]
		 			  				}}},
		 			  				{"$project":{userId:1,username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
		 			  		],"as":"commentBy"
		 			  }},
				    ],
				    "as": "comments_list"
				  }},
				{"$addFields": { isLike: {$size: "$likeArr"},isGallerySave:{$size: "$galleryArr"} } },
				{"$match":{userId:new ObjectId(req.body.userId),"status":"Active","postType":{$ne:"Question"}} },
				{"$skip" : skip},
		        {"$limit" : limit},
				]).exec().then(function(data){
					if(data != ""){
			        	return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.unauthorizedResponse(res,"Records not found");
					}
		      }).catch(function(err){
		      	console.log(err);
		        return apiResponse.ErrorResponse(res,err);
		      });
			}

		}catch(err){console.log(err);
			console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}

];

/**
 * get post likes.
 *
 * @returns {Object}
 */
exports.getPostLikes=[
	//validation fields
	auth,
	 body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 	return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
			if (!postFeed) {
				return Promise.reject("Invalid post id.");
			}
	 	});
 	}),
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			UserModel.User.aggregate([{
			            $lookup: {
			                from: "feed_likes",
			                localField: "_id",
			                foreignField: "userId",
			                as: "likes"
			            }
				        }, {
				        $unwind: {
				                path: "$likes",
				                preserveNullAndEmptyArrays: false
				            }
				        },{
			            $match: {
			                $or:[{"likes.postId":new ObjectId(req.body.postId)}]
			            }
			        	}, {
			            $project: {
			                	_id:0,
			                	userId: "$_id",
			                    username: 1,
			                    fullName:1,
			                    profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
			                    "likes.postId": 1
			             }
			            },
			            { $skip : skip},
			            { $limit : limit}
		            ]).exec().then(function(data){
		            	if(data != ""){
		            		 return apiResponse.successResponseWithData(res,"Successfully listed",data);
		            	}else{
		            		 return apiResponse.unauthorizedResponse(res,'Likes not found');
		            	}
					}).catch(function(err){
					    console.log(err);
					    return apiResponse.ErrorResponse(res,err);
				});

 				}
		}catch(err){console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}

];

/**
 * get post comments.
 *
 * @returns {Object}
 */
exports.getPostComments=[
	//validation fields
	auth,
	 body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 	return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
			if (!postFeed) {
				return Promise.reject("Invalid post id.");
			}
	 	});
 	}),
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			UserModel.User.aggregate([{
			            $lookup: {
			                from: "feed_comments",
			                localField: "_id",
			                foreignField: "userId",
			                as: "comments"
			            }
				        }, {
				        $unwind: {
				                path: "$comments",
				                preserveNullAndEmptyArrays: false
				            }
				        },{
			            $match: {
			                $and:[{"comments.postId":new ObjectId(req.body.postId)},{"comments.status":"Active"}],
			            }
			        	}, {
			            $project: {
			                	_id:0,
			                	userId: "$_id",
			                    username: 1,
			                    fullName:1,
			                    entryDate:1,
			                    profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
			                    "comments.postId": 1,
			                    "comments.comment": 1,
			                    "comments.commentId": "$comments._id",
			                    "comments.entryDate": "$comments.entryDate"
			             }
			            },
			            {$sort:{"comments.entryDate":-1}},
			            { $skip : skip},
			            { $limit : limit}
		            ]).exec().then(function(data){
		            	if(data != ""){
		            		 return apiResponse.successResponseWithData(res,"Successfully listed",data);
		            	}else{
		            		 return apiResponse.unauthorizedResponse(res,'Comments not found');
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
 * get users list.
 *
 * @returns {Object}
 */
 exports.getFriendsList=[
	//validation fields
	auth,
	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
	(req,res) =>{
		try{
			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			//let filters = (req.body.filter) ? {username:{ $regex: '.*' + req.body.filter.toLowerCase() + '.*' }} : {};
 			UserModel.UserSocialSubscribers.aggregate([
		        { "$lookup": {
				    "from": 'users',
				    "let": { "rUserId": "$userID" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$rUserId"]},
													{"$ne":["$_id",new ObjectId(req.body.userId)]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "friend1"
				},},
			    { "$lookup": {
				    "from": 'users',
				    "let": { "fUserId": "$toUserID" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$fUserId"]},
													{"$ne":["$_id",new ObjectId(req.body.userId)]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "friend2"
				}},
				{$match: {
						    "status": 'Verified',
	                		"action": 'Friend',
			                $or:[{"userID":new ObjectId(req.body.userId)},
			                	{"toUserID":new ObjectId(req.body.userId)}]
			            }
	              },
	            {$project: {
	                	_id:0,
	                	friendId: "$_id",
	                    action: 1,
	                    status:1,
	                    friend1:"$friend1",
	                    friend2:"$friend2",
	             }
	            },
	            /*{ "$addFields": {
				    "friend": {
				      "$filter": {
				        "input": "$friend1",
				        "cond": { "$ne": [ "$friend1", null ] }
				      },
				      "$filter": {
				        "input": "$friend1",
				        "cond": { "$ne": [ "$friend1", null ] }
				      }
				    },
				  }},*/
	            { $skip : skip},
	            { $limit : limit},
            ]).exec().then(function(data){
            		if(data != ""){
						  var Responses = [];
						  var arrayLength = data.length;
						  for (var i = 0; i < arrayLength; i++) {
						  	if(data[i].friend1.length > 0){
						  		Responses.push(data[i].friend1[0]);
						  		Responses[i].friendId = data[i].friendId;
						  	}
							if(data[i].friend2.length > 0){
						  		Responses.push(data[i].friend2[0]);
						  		Responses[i].friendId = data[i].friendId;
						  	}
					      };
						return apiResponse.successResponseWithData(res,"Successfully listed",Responses);
            		}else{
            			return apiResponse.unauthorizedResponse(res,"Records not found");
            		 }
			      }).catch(function(err){
			        console.log(err);
			         return apiResponse.ErrorResponse(res,err);
			  });
		}catch(err){console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}

];

 /**
 * get couple profile.
 *
 * @returns {Object}
 */
 exports.getCoupleProfile=[
	//validation fields
	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
	(req,res) =>{
		try{
			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 			UserModel.CoupleSubscribers.aggregate([
		        { "$lookup": {
				    "from": 'users',
				    "let": { "rUserId": "$userId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$rUserId"]},
													//{"$ne":["$_id",new ObjectId(req.userSession.id)]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",gender:1,age:1,personalBio:1,username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "Profile1"
				},},
			    { "$lookup": {
				    "from": 'users',
				    "let": { "fUserId": "$toUserId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$fUserId"]},
													//{"$ne":["$_id",new ObjectId(req.userSession.id)]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",gender:1,age:1,username:1,personalBio:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "Profile2"
				}},
				{$match: {
						    "status": 'Verified',
	                		"action": 'Couple',
			                $or:[{"userId":new ObjectId(req.body.userId)},
			                	{"toUserId":new ObjectId(req.body.userId)}]
			            }
	              },
	            {$project: {
	                	_id:0,
	                	coupleId: "$_id",
	                    action: 1,
	                    status:1,
	                    Profile1:"$Profile1",
	                    Profile2:"$Profile2",
	             }
	            },
            ]).exec().then(function(data){
            		if(data != ""){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
            		}else{
            			return apiResponse.unauthorizedResponse(res,"You are single, find your partner.");
            		 }
			      }).catch(function(err){
			        console.log(err);
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
exports.getPostSavedGallery=[
	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			PostModel.Media.aggregate([{
			            $lookup: {
			                from: "feed_user_galleries",
			                localField: "_id",
			                foreignField: "mediaId",
			                as: "gallery"
			            }
				        }, {
				        $unwind: {
				                path: "$gallery",
				                preserveNullAndEmptyArrays: false
				            }
				        },{
			            $match: {
			                $or:[{"gallery.userId":new ObjectId(req.body.userId)}]
			            }
			        	}, {
			            $project: {
			                	_id:1,
			                	mediaType:1,
			                	mediaThumbName:{$concat:[constants.baseUrl,"/","$mediaThumbName"]},
			                	galleryType:"$gallery.galleryType",
			                	postId:"$gallery.postId",
			                	mediaFullPath:{$concat:[constants.baseUrl,"$sectionPath","/","$mediaName"]}
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
 * add Questions.
 *
 * @returns {Object}
 */

 exports.addPackage=[
 	auth,
 	body("packageType").isLength({min:1}).trim().withMessage('Package Type must be specified Silver,Gold,Diamond,Platinum.'),
 	body("name").isLength({min:1}).trim().withMessage('Name must be specified.'),
 	body("packageDescription").isLength({min:1}).trim().withMessage('packageDescription must be specified.'),
 	body("packageValue").isLength({min:1}).trim().withMessage('packageValue must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 					let restData ={
	 						packageType:req.body.packageType,
	 						name:req.body.name,
	 					};
	 					var packageDescription = JSON.parse(req.body.packageDescription);
	 					var packageValue = JSON.parse(req.body.packageValue);
	 					if(packageDescription.length == packageValue.length){
		 					PackageModel.Package.create(restData,function(err,response){
		 						if(err){
		 							console.log(err);
		 							return apiResponse.ErrorResponse(res,err);
		 						}else{
										for(i=0;i<packageDescription.length;i++){
											/** options **/
								 			let options = {
								 				packageId:response._id,
								 				packageDescription:(packageValue[i] > 0) ? packageValue[i]+" "+packageDescription[i] : packageDescription[i],
								 				packageValue:packageValue[i],
								 			};
								 			PackageModel.PackageDescription.create(options,function(err){});
										}	
									return apiResponse.successResponse(res,"Successfully added.");
		 						}	
		 					});
	 					}else{
	 						return apiResponse.unauthorizedResponse(res,'Package description and values does not match.');
	 					}
 			}
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
 * add Questions.
 *
 * @returns {Object}
 */

 exports.addStore=[
 	auth,
 	body("storeType").isLength({min:1}).trim().withMessage('Store Type must be specified.'),
 	//body("value").isLength({min:1}).trim().withMessage('value must be specified.'),
 	body("amount").isLength({min:1}).trim().withMessage('amount must be specified.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 						if(req.body.storeItemType != "" && req.body.storeType == "One Time Purchase"){
 							var storeItemType = JSON.parse(req.body.storeItemType);
		 					var storeItemValue = JSON.parse(req.body.storeItemValue);
		 					var optionsItems = [];
							for(i=0;i<storeItemType.length;i++){
								optionsItems.push({storeType:storeItemType[i],value:storeItemValue[i]});
							}
 						}

	 					PackageModel.Store.findOne({storeType:req.body.storeType},{_id:1,storeType:1}).then(isAvailable=>{
						if(isAvailable){
											/** options **/
								 			let options = {
								 				storeId:isAvailable._id,
								 			};
								 			if(req.body.value != ""){
								 				options.value = req.body.value;
								 			}
								 			if(req.body.amount != ""){
								 				options.amount = req.body.amount;
								 			}
								 			if(req.body.storeItemType != ""){
								 				options.storeItemMultiValue = optionsItems;
								 			}
								 			console.log(options);
								 			PackageModel.StoreItem.create(options,function(err){console.log(err);});

									       return apiResponse.successResponse(res,"Successfully added.");
						}else{
		 					let restData ={
		 						storeType:req.body.storeType,
		 					};
		 					PackageModel.Store.create(restData,function(err,response){
		 						if(err){
		 							console.log(err);
		 							return apiResponse.ErrorResponse(res,err);
		 						}else{
											/** options **/
								 			let options = {
								 				storeId:response._id,
								 			};
								 			if(req.body.value != ""){
								 				options.value = req.body.value;
								 			}
								 			if(req.body.amount != ""){
								 				options.amount = req.body.amount;
								 			}
								 			if(req.body.storeItemType != ""){
								 				options.storeItemMultiValue = optionsItems;
								 			}
								 			console.log(options);
								 			PackageModel.StoreItem.create(options,function(err){
								 				console.log(err);
								 			});

									return apiResponse.successResponse(res,"Successfully added.");
		 						}	
		 					});
						}
					});
 			}
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
		 			if(req.body.storeId){
						filters._id=new ObjectId(req.body.storeId);
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
exports.getStoresItem=[
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
		 			PackageModel.Store.aggregate([
		 			{
			            $lookup: {
			                from: "store_items",
			                localField: "_id",
			                foreignField: "storeId",
			                as: "storeItems"
			            }
				        }, 
				        {
			            $match: {"status":"Active","_id":new ObjectId(req.body.storeId),"storeItems._id":new ObjectId(req.body.itemId)}
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
 * update package.
 *
 * @returns {Object}
 */

 exports.updatePackage=[
 	auth,
 	body("packageType").isLength({min:1}).trim().withMessage('Package Type must be specified Silver,Gold,Diamond,Platinum.'),
 	body("name").isLength({min:1}).trim().withMessage('Name must be specified.'),
 	body("packageDescription").isLength({min:1}).trim().withMessage('packageDescription must be specified.'),
 	body("packageValue").isLength({min:1}).trim().withMessage('packageValue must be specified.'),
 	body("packageId").trim().isLength({min:1}).withMessage("Package id must be specified.").custom((value)=>{
 		return PackageModel.Package.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid package id.");
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 					var packageDescription = JSON.parse(req.body.packageDescription);
	 					var packageValue = JSON.parse(req.body.packageValue);
	 					if(packageDescription.length == packageValue.length){

							PackageModel.PackageDescription.deleteMany({packageId:new ObjectId(req.body.packageId)},function(err,ress){});

							for(i=0;i<packageDescription.length;i++){
								/** options **/
								let options = {
								 	packageId:req.body.packageId,
								 	packageDescription:(packageValue[i] > 0) ? packageValue[i]+" "+packageDescription[i] : packageDescription[i],
								 	packageValue:packageValue[i],
								};
								PackageModel.PackageDescription.create(options,function(err){});
							}	
						    return apiResponse.successResponse(res,"Successfully updated.");

	 					}else{
	 						return apiResponse.unauthorizedResponse(res,'Package description and values does not match.');
	 					}
	 		}
 		}catch(err){
 			console.log(err);
			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];



 /**
 * update store status.
 *
 * @returns {Object}
 */

 exports.updateStatusStoreItem=[
 	auth,
	body('status').trim().isLength({min:1}).withMessage("Status must be specified Active,Inactive."),
 	body("itemId").trim().isLength({min:1}).withMessage("Item id must be specified.").custom((value)=>{
 		return PackageModel.StoreItem.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid item id.");
				}
 		});
 	}),
 	body("storeId").trim().isLength({min:1}).withMessage("Store id must be specified.").custom((value)=>{
 		return PackageModel.Store.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid store id.");
				}
 		});
 	}),
 	(req,res)=>{
 		try{
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 			var restData = {status:req.body.status};
	 			PackageModel.StoreItem.findOneAndUpdate({_id:new ObjectId(req.body.itemId),storeId:new ObjectId(req.body.storeId)},restData).
					catch(err =>{
					return apiResponse.ErrorResponse(res,err);
				});
				return apiResponse.successResponse(res,"Successfully updated.");
	 		}
 		}catch(err){
 			console.log(err);
			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


   /**
 * get user transaction history.
 *
 * @returns {Object}
 */
exports.getUserTransactionHistory=[
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
		 			UserModel.UserTransaction.aggregate([
				        {
			            $match: {"userId":new ObjectId(req.body.userId)}
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
 * get user coupon history.
 *
 * @returns {Object}
 */
exports.getUserCouponHistory=[
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
		 			UserModel.UserTransaction.aggregate([
				        {
			            $match: {"userId":new ObjectId(req.body.userId),'narration':"Coupon Purchased"}
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
 * get Restaurents.
 *
 * @returns {Object}
 */

 exports.getBusinessCoupons = [
 	auth,
  	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	(req,res)=>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
	 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
	 			var offset = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
	 			let filters = (req.body.filters) ? {name:{ $regex: '.*' + req.body.filters + '.*' }} : {};
	 			var status = req.body.status;
	 			var where = {userId:new ObjectId(req.body.userId)};
	 			if(status == "Active"){
	 				where.couponValidTillDate = {$gte:new Date()};
	 			}else{
	 				where.couponValidTillDate = {$lte:new Date()};
	 				PackageModel.Coupon.updateMany(where,{status:"Expired"},function(err){
	 				});
	 			}
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
	 			}
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


 /**
 * get feed post.
 *
 * @returns {Object}
 */
exports.getPostFeed=[
	//validation fields
	auth,
	(req,res) =>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else{
			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
			PostModel.FeedPost.aggregate([
		        {"$project":{
		        	_id:0,
		        	postId:"$_id",
		        	location:1,
		        	postType:1,
		        	tag:1,
		        	notifyStatus:1,
		        	entryDate:1,
		        	mediaId:1,
		        	tagFriend:1,
		        	username:1,
		        	userId:1,
		        	likes:1,
		        	comments:1,
		        	emojiCode:1,
		        	colorCode:1,
		        	commentStatus:1,
		        	status:1,
		        }},
		        {"$sort":{entryDate:-1}},
		        { "$lookup": {
				    "from": 'users',
				    "let": { "uid": "$userId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$uid"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "postedBy"
				  }},
				{ "$lookup": {
				    "from": 'media',
				    "let": { "mId": "$mediaId" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$eq":["$_id","$$mId"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,mediaId:"$_id",mediaType:1,mediaFullPath:{$concat:[constants.baseUrl,"$sectionPath","/","$mediaName"]},mediaThumbName:{$concat:[constants.baseUrl,"/","$mediaThumbName"]},}},
				    ],
				    "as": "media"
				  }},
				  { "$lookup": {
				    "from": 'users',
				    "let": { "tagId": "$tagFriend" },
				    "pipeline": [
				      { "$match": { "$expr": {
											"$and":[
													{"$in":["$_id", "$$tagId"]},
												]
											}
				      	 		   } 
				      },
		 			  {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
				    ],
				    "as": "tagFriends"
				  }},
				{"$match":{"status":"Active","postType":{$ne:"Question"}} },
				{"$skip" : skip},
		        {"$limit" : limit},
				]).exec().then(function(data){
					if(data != ""){
			        	return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.unauthorizedResponse(res,"Records not found");
					}
		      }).catch(function(err){
		      	console.log(err);
		        return apiResponse.ErrorResponse(res,err);
		      });
			}

		}catch(err){console.log(err);
			console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}

];