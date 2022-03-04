const UserModel = require('../models/UserModel');
/*const ChatModel = require('../models/ChatModel');*/
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const notification = require("../lib/notification");
const moment = require('moment');
var ip = require("ip");
const MomentDT = moment();
const utility = require("../helpers/utility");
var auth = require("../middlewares/jwt");
var authorization = require("../middlewares/Authorization");
const multer = require('multer');
let path     = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios').default;
ffmpeg.setFfmpegPath(ffmpegPath);


/**
 * User registration.
 *
 * @returns {Object}
 */
exports.register = [
 	// Validate fields.
 	body("firstName").isLength({min:1}).trim().withMessage("First Name must be specified."),
 	body("lastName").isLength({min:1}).trim().withMessage("Last Name must be specified."),
 	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.User.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
    body("phoneNo").isLength({min:10}).trim().withMessage("Phone Number must be 10 characters.").isNumeric().
    withMessage('Phone Number should be numeric only').custom((value)=>{
    	return UserModel.User.findOne({phoneNo:value}).then((user)=>{
    		if(user){
    			return Promise.reject("Phone Number already in use");
    		}
    	});
    }),
    body("password").isLength({min:6}).trim().withMessage("Password must be 6 characters or greater."),
    body("city").isLength({min:1}).trim().withMessage("City must be specified."),
    body("companyName").isLength({min:1}).trim().withMessage("Company Name must be specified."),
    body("country").isLength({min:1}).trim().withMessage("Country must be specified."),
	(req,res) =>{
		try{
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array()[0].msg);
			}else{
				
				bcrypt.hash(req.body.password,10,function(err,hash){

					// generate OTP for confirmation
					//let otp = utility.randomNumber(4);
					let otp = 1234;
					// Create User object with escaped and trimmed data
					var users =
						{
							fullName: req.body.firstName.toLowerCase() +" "+req.body.lastName.toLowerCase(),
							firstName: req.body.firstName.toLowerCase(),
							lastName: req.body.lastName.toLowerCase(),
							email: req.body.email,
							city: req.body.city,
							companyName: req.body.companyName,
							country: req.body.country,
							phoneNo: req.body.phoneNo,
							password: hash,
							confirmOTP: otp,
							userType:"Person",
							deviceType:"Web",
							inviteCode:utility.randomNumber(8),
							ipAddress:ip.address(),
						};
						if(req.body.inviteCode != ""){
							users.referredByUserId=body.inviteUserId;
						}
						UserModel.User.create(users,function(err){
							if(err){
								return apiResponse.ErrorResponse(res, err);
							}else{
								UserModel.User.findOne({email:req.body.email,phoneNo:req.body.phoneNo}).then(userResponse =>{
									
								    /** account creation **/
									/*let userAccounts ={
										userId:userResponse._id,
									};
									UserModel.UserAccount.create(userAccounts,function(err){});*/

									let userData = {
										id:userResponse._id,
										userId:userResponse._id,
										fullName:userResponse.fullName,
										email:userResponse.email,
										username:userResponse.username,
										phoneNo:userResponse.phoneNo,
										status:userResponse.status,
									};
									//jwt configuration
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									userData.firstName = userResponse.firstName;
									userData.lastName = userResponse.lastName;
									userData.city = userResponse.city;
									userData.companyName = userResponse.companyName;
									userData.country = userResponse.country;
									userData.profilePic = userResponse.profilePic;
									let userSession ={
										userID:userResponse._id,
										sessionKey:utility.randomValueHex(32),
										deviceType:req.body.deviceType,
										deviceID:req.body.deviceID,
										deviceToken:req.body.deviceToken,
										ipAddress:ip.address(),
										token:userData.token,
									};
									UserModel.UserLoginSession.create(userSession,function(err){
										if(err){
											return apiResponse.ErrorResponse(res,err);
										}
										/** invite code update **/
										if(req.body.inviteCode != ""){
											/** referrals get points **/
											/*let userAccounts ={
												$inc:{totalPoints:constants.referralPoints,currentPoints:constants.referralPoints}
										    };
						 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});*/
											/** referrals transaction **/
											/*let UserTransactions ={
												userId:userResponse._id,
												amount:constants.referralPoints,
												transactionType:"Cr",
												narration:"Referral Bonus",
												referralGetUserId:new ObjectId(body.inviteUserId)
											};
											UserModel.UserTransaction.create(UserTransactions,function(err){});*/
										}
										/** signup get points **/
										/*let userAccounts ={
											$inc:{totalPoints:constants.signupPoints,currentPoints:constants.signupPoints}
										};*/
										/*UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});*/
										/** signup transaction **/
										/*let UserTransactions ={
											userId:userResponse._id,
											amount:constants.signupPoints,
											transactionType:"Cr",
											narration:"Signup Bonus",
										};
										UserModel.UserTransaction.create(UserTransactions,function(err){});*/
										return apiResponse.successResponseWithData(res,"Registration Success.", userData);
									});
							   });
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
 * User Login.
 *
 * @returns {Object}
 */

 exports.login = [
	body("keyward").isLength({ min: 1 }).trim().withMessage("Keyward must be specified."),
	body("password").isLength({min:6}).trim().withMessage("Password must be 6 characters or greater."),
	(req,res)=>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else{

 				UserModel.User.aggregate([
 				    { 
					   $match: { 
					   			$or:[ {'email':req.body.keyward},{'phoneNo':req.body.keyward} ]
					    	 }
					},
					{
						$project: {
						 	_id: 1,
						 	"userId":"$_id",
						 	fullName: 1,
						 	firstName: 1,
						 	lastName: 1,
						 	city: 1,
						 	companyName: 1,
						 	country: 1,
						 	phoneNo: 1,
						 	email: 1,
						 	username: 1,
						 	age: 1,
						 	password: 1,
						 	status: 1,
						 	profilePic:1,
						}
 					},
 					]).exec().then(function(user){
 						if(user != ""){
 							bcrypt.compare(req.body.password,user[0].password,function(err,match){
 								if(match){
									let userData = {
										id:user[0]._id,
										userId:user[0]._id,
										fullName:user[0].fullName,
										email:user[0].email,
										username:user[0].username,
										phoneNo:user[0].phoneNo,
										status:user[0].status,
									};
									/*jwt configuration*/
									const jwtPayload = userData;
									const jwtData = {
										expiresIn: process.env.JWT_TIMEOUT_DURATION,
									};
									const secret = process.env.JWT_SECRET;
									userData.token = jwt.sign(jwtPayload, secret, jwtData);
									userData.firstName = user[0].firstName;
									userData.lastName = user[0].lastName;
									userData.city = user[0].city;
									userData.companyName = user[0].companyName;
									userData.country = user[0].country;
									userData.profilePic = user[0].profilePic;
									let userSession ={
										userID:user[0]._id,
										sessionKey:utility.randomValueHex(32),
										ipAddress:ip.address(),
										token:userData.token,
										deviceType:'Web'
									};
									/** delete all session **/
									UserModel.UserLoginSession.deleteMany({userID:new ObjectId(user[0]._id)},function(err,ress){
									});
									UserModel.UserLoginSession.create(userSession,function(err){
										if(err){
											return apiResponse.ErrorResponse(res,err);
										}
										return apiResponse.successResponseWithData(res,"Successfully login.", userData);
									});
 								}else{
 									return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");
 								}
 							});
 						}else{
 							return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");	
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
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	auth,
	body("phoneNo").isLength({min:10}).trim().withMessage('Phone Number must be 10 characters.').isNumeric().withMessage("Phone Number should be numeric only"),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {phoneNo : req.body.phoneNo,_id:req.userSession.id};
				UserModel.User.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.status){
							// Generate otp
							//let otp = utility.randomNumber(4);
							let otp = 1234;
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";

 							UserModel.User.findOneAndUpdate(query,{
 								confirmOTP:otp,
 							}).catch(err =>{
 									return apiResponse.ErrorResponse(res,err);
 							});
 							return apiResponse.successResponse(res,"Successfully confirm otp sent.");
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified phnoe number not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */

exports.VerifyConfirmOtp = [
 		body("phoneNo").isLength({min:10}).trim().withMessage('Phone Number must be 10 characters.').isNumeric().withMessage("Phone Number should be numeric only"),
 		body("otp").isLength({min:1}).trim().withMessage('OTP must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
 					var query = {phoneNo:req.body.phoneNo};
 					UserModel.User.findOne(query).then(user=>{
 						if(user){
 							console.log(user.confirmOTP);
 							if(user.confirmOTP == req.body.otp){
 								UserModel.User.findOneAndUpdate(query,{
 									status:1,
 									confirmOTP:null,
 								}).catch(err =>{
 									return apiResponse.ErrorResponse(res,err);
 								});
 								return apiResponse.successResponse(res,"Successfully account confirmed.");
 							}else{
 								return apiResponse.unauthorizedResponse(res,"Invalid OTP.");
 							}
 						}else{
 							return apiResponse.unauthorizedResponse(res,"Specified phone number not found.");
 						}
 					});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
 	}];

 /**
 * Update User Profile.
 *
 * @returns {Object}
 */

exports.UpdateUserProfile = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
 					if(req.body.userId != req.userSession.id){
 						return apiResponse.unauthorizedResponse(res,"Invalid Authorization.");
					}
 					var query = {_id:req.userSession.id};
 					let userData= {};
 					if(req.body.birthDate){
 						var age = parseInt(moment().diff(req.body.birthDate, 'years'));
 						userData.birthDate = req.body.birthDate;
 						userData.age = age;
 						/*if(age < 18){
 							return apiResponse.unauthorizedResponse(res,"Your age should be greater than Or equals to 18, to access dating section.");
 						}*/
 					}	
 					if(req.body.personalBio){
 						userData.personalBio = req.body.personalBio;
 					}
 					if(req.body.gender){
 						if(req.body.gender == "Male" || req.body.gender == "Female" || req.body.gender == "Other"){
 							userData.gender = req.body.gender;
 						}else{
 							return apiResponse.unauthorizedResponse(res,"Gender must be specified Male, Female, Other");
 						}
 						
 					}	
 					if(req.body.userType){
 						if(req.body.userType == "Person" || req.body.userType == "Business"){
 							userData.userType = req.body.userType;
 						}else{
 							return apiResponse.unauthorizedResponse(res,"User type must be specified Person, Business");
 						}
 					}	
 					if(userData){
	 					UserModel.User.findOneAndUpdate(query,userData).catch(err =>{
	 						return apiResponse.ErrorResponse(res,err);
	 					});
	 					return apiResponse.successResponse(res,"Successfully profile updated.");
 					}else{
 						return apiResponse.unauthorizedResponse(res,"Specified one value.");
 					}	
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
 	}];

 /**
 * User Update profile pic.
 *
 * @returns {Object}
 */

exports.updateProfilePic=[
 	auth,
 	(req,res) =>{
 		try{
		 			var uploadPath = "./public/uploads/userProfilePic";
					var uploadFolderPath = "/uploads/userProfilePic/";
					var storage    = multer.diskStorage({
						destination: function(req, file, callback) {
							callback(null, uploadPath)
						},
						filename: function(req, file, callback) {
							let uploadedFileName = 'playdate-user-'+ Date.now() + path.extname(file.originalname);
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
					} }).array('userProfilePic',1)(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					var query = {_id:req.userSession.id};
	 					if(req.files != undefined && req.files.length != 0){
		 					let fileObj = req.files;
		 					let userData ={
		 						profilePic:fileObj[0].filename,
		 						profilePicPath:uploadFolderPath+fileObj[0].filename,
		 					};
		 					UserModel.User.findOneAndUpdate(query,userData,function(err){
		 						if(err){
		 							return apiResponse.ErrorResponse(res,err);
		 						}
		 						return apiResponse.successResponseWithData(res,"Successfully updated.",userData);
		 					});
	 				    }else{
	 				    	return apiResponse.unauthorizedResponse(res,'Image file must be specified.');
	 				    }
	 				}
	 			})
 		}catch(err){
 			console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}

 ];

 
/**
 * User Update profile video.
 *
 * @returns {Object}
 */
exports.updateProfileVideo=[
 	auth,
 	(req,res) =>{
 		try{
	 			var uploadPathVideo = "./public/uploads/userProfileVideo";
				var uploadFolderPathVideo = "/uploads/userProfileVideo/";
				var storageVideo    = multer.diskStorage({
					destination: function(req, file, callback) {
						callback(null, uploadPathVideo)
					},
					filename: function(req, file, callback) {
						let uploadedFileName = 'playdate-user-video-'+ Date.now() + path.extname(file.originalname);
						callback(null, uploadedFileName)
					}
				});
	 			multer({ storage:storageVideo,
	 				fileFilter:function(req,file,callback){
						if (file.mimetype == "video/mp4" || file.mimetype == "video/ogv" || file.mimetype == "video/webm") {
					      callback(null, file);
					    }else{
					    	callback(null, false);
					    	return apiResponse.unauthorizedResponse(res,'Only .mp4, .ogv and .webm format allowed!');
					    }
					}}).array('userProfileVideo',1)(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					var query = {_id:req.userSession.id};
	 					if(req.files != undefined && req.files.length != 0){
		 					let fileObj = req.files;
		 					/** create video thumb**/
							ffmpeg(constants.baseUrl+uploadFolderPathVideo+fileObj[0].filename)
							  .on('filenames', function(filenames) {
							    console.log('Will generate ' + filenames.join(', '))
							  })
							  .on('end', function() {
							  })
							  .screenshots({
							  	timestamps: [0.0],
								filename: fileObj[0].filename.split('.')[0]+'.png',
							    count: 4,
							    folder: uploadPathVideo+'/thumb'
							});

							let userData ={
								isProfile:"Completed",
		 						profileVideo:fileObj[0].filename,
		 						profileVideoPath:uploadFolderPathVideo+fileObj[0].filename,
		 						profileVideoThumb:uploadFolderPathVideo+"thumb/"+fileObj[0].filename.split('.')[0]+'.png',
		 					};
		 					UserModel.User.findOneAndUpdate(query,userData,function(err){
		 						if(err){
		 							return apiResponse.ErrorResponse(res,err);
		 						}
		 						return apiResponse.successResponseWithData(res,"Successfully updated.",userData);
		 					});
	 					}else{
							return apiResponse.unauthorizedResponse(res,'Video file must be specified.');
	 					}
	 				}
	 			})
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}

 	}
 ];

/**
 * Resend forgot password sent otp.
 *
 * @param {string}      phoneNo
 *
 * @returns {Object}
 */

exports.forgotPasswordSentOtp = [
	body("phoneNo").isLength({min:10}).trim().withMessage("Phone Number must be 10 characters.").isNumeric().
    withMessage('Phone Number should be numeric only').custom((value)=>{
    	return UserModel.User.findOne({phoneNo:value}).then((user)=>{
    		if(!user){
    			return Promise.reject("Phone Number not registered.");
    		}
    	});
    }),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
							var query = {phoneNo:req.body.phoneNo};
							// Generate otp
							//let otp = utility.randomNumber(4);
							let otp = 1234;
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";

 							UserModel.User.findOneAndUpdate(query,{
 								confirmOTP:otp,
 							}).catch(err =>{
 									return apiResponse.ErrorResponse(res,err);
 							});
 							return apiResponse.successResponse(res,"Successfully confirm otp sent.");
				
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
}];

/**
 * Verify Confirm otp and change password.
 *
 * @param {string}      phoneNo
 * @param {string}      otp
 * @param {string}      password
 * @returns {Object}
 */

exports.resetPassword = [
 		body("phoneNo").isLength({min:10}).trim().withMessage('Phone Number must be 10 characters.').isNumeric().withMessage("Phone Number should be numeric only"),
 		body("otp").isLength({min:1}).trim().withMessage('OTP must be specified.'),
 		body("password").isLength({min:6}).trim().withMessage("Password must be 6 characters or greater."),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
 					var query = {phoneNo:req.body.phoneNo};
 					UserModel.User.findOne(query).then(user=>{
 						if(user){
 							if(user.confirmOTP == req.body.otp){
								bcrypt.hash(req.body.password,10,function(err,hash){
							    	UserModel.User.findOneAndUpdate(query,{
	 									password:hash,
	 									confirmOTP:null,
	 								}).catch(err =>{
	 									return apiResponse.ErrorResponse(res,err);
	 								});
	 								return apiResponse.successResponse(res,"Successfully reset password.");
								});
 							}else{
 								return apiResponse.unauthorizedResponse(res,"Invalid OTP.");
 							}
 						}else{
 							return apiResponse.unauthorizedResponse(res,"Specified phone number not found.");
 						}
 					});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
 	}];


 	/**
 * User social Sign In.
 *
 * @returns {Object}
 */

exports.socialSignIn = [
 	// Validate fields.
 	body("firstName").trim(),
 	body("lastName").trim(),
 	body("phoneNo").trim(),
 	body("email").trim(),
    body("deviceType").isLength({min:1}).trim().withMessage("Device Type must be specified Web,Android,Ios."),
    body("sourceType").isLength({min:1}).trim().withMessage("Source Type must be specified Facebook,Google,Apple,Instagram."),
	body("sourceSocialId").isLength({min:1}).trim().withMessage("Source social id must be specified."),
	(req,res) =>{
		try{
			const errors = validationResult(req);
			if(!errors.isEmpty()){
				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
			}else{
				var sourceType = req.body.sourceType;
				var firstName = req.body.firstName;
				var lastName = req.body.lastName;
				var email = req.body.email;
				var phoneNo = req.body.phoneNo;
				var deviceType = req.body.deviceType;
				var sourceSocialId = req.body.sourceSocialId;
				var keyward = (req.body.email) ? req.body.email : req.body.phoneNo;
				var fullName = firstName + " "+lastName;
				/*if(!keyward){
					return apiResponse.unauthorizedResponse(res,"Email / Phone must be specified.");
				}
				if(email && phoneNo){
					return apiResponse.unauthorizedResponse(res,"Email / Phone only single param must be specified.");
				}*/
				/** to check user exists or not **/
				var whereSingle = {sourceSocialId:sourceSocialId,sourceType:sourceType};
				/*var where = {$or:[{email:keyward},{phoneNo:keyward}],$and:[{sourceSocialId:sourceSocialId}]};*/
				var where = {$and:[{sourceSocialId:sourceSocialId}]};
				UserModel.User.aggregate([
 				    { 
					   $match: where
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
						 	password: 1,
						 	personalBio: 1,
						 	interestedIn: 1,
						 	paymentMode: 1,
						 	onlineStatus: 1,
						 	inviteCode: 1,
						 	status: 1,
						 	userType: 1,
						 	sourceType: 1,
						 	sourceSocialId: 1,
						 	relationship:1,
						 	profilePic:1,
						 	businessImage:1,
						 	profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
						 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]},
						 	interested:"$interestedList",
						 	restaurants:"$restaurantsList"
						}
 					},
 					]).exec().then(function(userResponse){
 						if(userResponse != ""){

											let userData = {
												id:userResponse[0]._id,
												userId:userResponse[0]._id,
												fullName:userResponse[0].fullName,
												email:userResponse[0].email,
												username:userResponse[0].username,
												phoneNo:userResponse[0].phoneNo,
												status:userResponse[0].status,
											};
											/*jwt configuration*/
											const jwtPayload = userData;
											const jwtData = {
												expiresIn: process.env.JWT_TIMEOUT_DURATION,
											};
											const secret = process.env.JWT_SECRET;
											userData.token = jwt.sign(jwtPayload, secret, jwtData);
											userData.gender = userResponse[0].gender;
											userData.birthDate = userResponse[0].birthDate;
											userData.age = userResponse[0].age;
											userData.profilePic = userResponse[0].profilePic;
											userData.businessImage = (userResponse[0].businessImage) ? constants.baseUrl+"/uploads/userProfilePic/"+userResponse[0].businessImage : null;
											userData.profilePicPath = (userResponse[0].profilePicPath) ? constants.baseUrl+userResponse.profilePicPath : null;
											userData.profileVideo = userResponse[0].profileVideo;
											userData.relationship = userResponse[0].relationship;
											userData.personalBio = userResponse[0].personalBio;
											userData.interested = userResponse[0].interested;
											userData.restaurants = userResponse[0].restaurants;
											userData.userType = userResponse[0].userType;
											userData.interestedIn = userResponse[0].interestedIn;
											userData.inviteCode = userResponse[0].inviteCode;
											userData.paymentMode = userResponse[0].paymentMode;
											userData.sourceType = userResponse[0].sourceType;
											userData.sourceSocialId = userResponse[0].sourceSocialId;
											//userData.inviteLink = "Hey, I'm on PlayDate . Join me! Download it here: "+constants.baseUrl+"/"+userResponse[0].inviteCode+" and use promo code "+userResponse[0].inviteCode+" and earn "+constants.referralPoints+" PlayDate Coins.";
											let userSession ={
												userID:userResponse[0]._id,
												sessionKey:utility.randomValueHex(32),
												deviceType:req.body.deviceType,
												deviceID:req.body.deviceID,
												deviceToken:req.body.deviceToken,
												ipAddress:ip.address(),
												token:userData.token,
											};
											/** delete all session **/
											UserModel.UserLoginSession.deleteMany({userID:new ObjectId(userResponse[0]._id)},function(err,ress){
											});
											UserModel.UserLoginSession.create(userSession,function(err){
												if(err){
													return apiResponse.ErrorResponse(res,err);
												}
												return apiResponse.successResponseWithData(res,"Successfully login.", userData);
											});	
 						}else{
	 						if(keyward != ""){
								var whereOr = {$or:[{email:keyward},{phoneNo:keyward}]};
								UserModel.User.findOne(whereOr).then(userR=>{
									if(userR){
										return apiResponse.unauthorizedResponse(res,"Email / Phone already use by another account.");
									}else{
										var users = {};
										users.fullName = (fullName) ? fullName : null;
										users.phoneNo = (phoneNo) ? phoneNo : null;
										users.email = (email) ? email : null;
										//users.userType = (userType) ? userType : null;
										users.deviceType = deviceType;
										users.sourceType = sourceType;
										users.sourceSocialId = sourceSocialId;
										users.inviteCode = utility.randomNumber(8);
										users.ipAddress = ip.address();
										users.status = 1;
										if(req.body.inviteCode != ""){
											users.referredByUserId=body.inviteUserId;
										}
										UserModel.User.create(users,function(err){
											if(err){
												return apiResponse.ErrorResponse(res, err);
											}
											UserModel.User.findOne(where).then(userResponse =>{
											if(userResponse){ 
													/** account creation **/
													let userAccounts ={
														userId:userResponse._id,
													};
													UserModel.UserAccount.create(userAccounts,function(err){});

													let userData = {
														id:userResponse._id,
														userId:userResponse._id,
														fullName:userResponse.fullName,
														email:userResponse.email,
														username:userResponse.username,
														phoneNo:userResponse.phoneNo,
														status:userResponse.status,
													};
													//jwt configuration
													const jwtPayload = userData;
													const jwtData = {
														expiresIn: process.env.JWT_TIMEOUT_DURATION,
													};
													const secret = process.env.JWT_SECRET;
													userData.token = jwt.sign(jwtPayload, secret, jwtData);
													userData.gender = userResponse.gender;
													userData.birthDate = userResponse.birthDate;
													userData.age = userResponse.age;
													userData.profilePic = userResponse.profilePic;
													userData.businessImage = (userResponse.businessImage) ? constants.baseUrl+"/uploads/userProfilePic/"+userResponse.businessImage : null;
													userData.profilePicPath = (userResponse.profilePicPath) ? constants.baseUrl+userResponse.profilePicPath : null;
													userData.profileVideo = userResponse.profileVideo;
													userData.relationship = userResponse.relationship;
													userData.personalBio = userResponse.personalBio;
													userData.interested = userResponse.interested;
													userData.restaurants = userResponse.restaurants;
													userData.userType = userResponse.userType;
													userData.interestedIn = userResponse.interestedIn;
													userData.inviteCode = userResponse.inviteCode;
													userData.paymentMode = userResponse.paymentMode;
													userData.sourceType = userResponse.sourceType;
													userData.sourceSocialId = userResponse.sourceSocialId;
													//userData.inviteLink = "Hey, I'm on PlayDate . Join me! Download it here: "+constants.baseUrl+"/"+userResponse.inviteCode+" and use promo code "+userResponse.inviteCode+" and earn "+constants.referralPoints+" PlayDate Coins.";
													let userSession ={
														userID:userResponse._id,
														sessionKey:utility.randomValueHex(32),
														deviceType:req.body.deviceType,
														deviceID:req.body.deviceID,
														deviceToken:req.body.deviceToken,
														ipAddress:ip.address(),
														token:userData.token,
													};
													/** delete all session **/
													UserModel.UserLoginSession.deleteMany({userID:new ObjectId(userResponse._id)},function(err,ress){
													});
													UserModel.UserLoginSession.create(userSession,function(err){
														if(err){
															return apiResponse.ErrorResponse(res,err);
														}

														/** invite code update **/
														if(req.body.inviteCode != ""){
															/** referrals get points **/
															let userAccounts ={
																$inc:{totalPoints:constants.referralPoints,currentPoints:constants.referralPoints}
														    };
										 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});
															/** referrals transaction **/
															let UserTransactions ={
																userId:userResponse._id,
																amount:constants.referralPoints,
																transactionType:"Cr",
																narration:"Referral Bonus",
																referralGetUserId:new ObjectId(body.inviteUserId)
															};
															UserModel.UserTransaction.create(UserTransactions,function(err){});
														}
														/** signup get points **/
														let userAccounts ={
															$inc:{totalPoints:constants.signupPoints,currentPoints:constants.signupPoints}
														};
														UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});
														/** signup transaction **/
														let UserTransactions ={
															userId:userResponse._id,
															amount:constants.signupPoints,
															transactionType:"Cr",
															narration:"Signup Bonus",
														};
														UserModel.UserTransaction.create(UserTransactions,function(err){});

														return apiResponse.successResponseWithData(res,"Successfully login.", userData);
													});
											}else{
												return apiResponse.unauthorizedResponse(res,"Something went wrong, Please try again.");
											}
										});	
									  });
									}
								});
	 						}else{
	 									var whereOr = {$or:[{email:keyward},{phoneNo:keyward}]};

										var users = {};
										users.fullName = (fullName) ? fullName : null;
										users.phoneNo = (phoneNo) ? phoneNo : null;
										users.email = (email) ? email : null;
										users.userType = (userType) ? userType : null;
										users.deviceType = deviceType;
										users.sourceType = sourceType;
										users.sourceSocialId = sourceSocialId;
										users.inviteCode = utility.randomNumber(8);
										users.ipAddress = ip.address();
										users.status = 1;
										if(req.body.inviteCode != ""){
											users.referredByUserId=body.inviteUserId;
										}
										UserModel.User.create(users,function(err){
											if(err){
												return apiResponse.ErrorResponse(res, err);
											}
											UserModel.User.findOne(where).then(userResponse =>{
											if(userResponse){
													/** account creation **/
													let userAccounts ={
														userId:userResponse._id,
													};
													UserModel.UserAccount.create(userAccounts,function(err){});

													let userData = {
														id:userResponse._id,
														userId:userResponse._id,
														fullName:userResponse.fullName,
														email:userResponse.email,
														username:userResponse.username,
														phoneNo:userResponse.phoneNo,
														status:userResponse.status,
													};
													//jwt configuration
													const jwtPayload = userData;
													const jwtData = {
														expiresIn: process.env.JWT_TIMEOUT_DURATION,
													};
													const secret = process.env.JWT_SECRET;
													userData.token = jwt.sign(jwtPayload, secret, jwtData);
													userData.gender = userResponse.gender;
													userData.birthDate = userResponse.birthDate;
													userData.age = userResponse.age;
													userData.profilePic = userResponse.profilePic;
													userData.profilePicPath = (userResponse.profilePicPath) ? constants.baseUrl+userResponse.profilePicPath : null;
													userData.profileVideo = userResponse.profileVideo;
													userData.businessImage = (userResponse.businessImage) ? constants.baseUrl+"/uploads/userProfilePic/"+userResponse.businessImage : null;
													userData.relationship = userResponse.relationship;
													userData.personalBio = userResponse.personalBio;
													userData.interested = userResponse.interested;
													userData.restaurants = userResponse.restaurants;
													userData.userType = userResponse.userType;
													userData.interestedIn = userResponse.interestedIn;
													userData.inviteCode = userResponse.inviteCode;
													userData.paymentMode = userResponse.paymentMode;
													userData.sourceType = userResponse.sourceType;
													userData.sourceSocialId = userResponse.sourceSocialId;
													//userData.inviteLink = "Hey, I'm on PlayDate . Join me! Download it here: "+constants.baseUrl+"/"+userResponse.inviteCode+" and use promo code "+userResponse.inviteCode+" and earn "+constants.referralPoints+" PlayDate Coins.";
													let userSession ={
														userID:userResponse._id,
														sessionKey:utility.randomValueHex(32),
														deviceType:req.body.deviceType,
														deviceID:req.body.deviceID,
														deviceToken:req.body.deviceToken,
														ipAddress:ip.address(),
														token:userData.token,
													};
													/** delete all session **/
													UserModel.UserLoginSession.deleteMany({userID:new ObjectId(userResponse._id)},function(err,ress){
													});
													UserModel.UserLoginSession.create(userSession,function(err){
														if(err){
															return apiResponse.ErrorResponse(res,err);
														}

														/** invite code update **/
														if(req.body.inviteCode != ""){
															/** referrals get points **/
															let userAccounts ={
																$inc:{totalPoints:constants.referralPoints,currentPoints:constants.referralPoints}
														    };
										 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});
															/** referrals transaction **/
															let UserTransactions ={
																userId:userResponse._id,
																amount:constants.referralPoints,
																transactionType:"Cr",
																narration:"Referral Bonus",
																referralGetUserId:new ObjectId(body.inviteUserId)
															};
															UserModel.UserTransaction.create(UserTransactions,function(err){});
														}
														/** signup get points **/
														let userAccounts ={
															$inc:{totalPoints:constants.signupPoints,currentPoints:constants.signupPoints}
														};
														UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userResponse._id)},userAccounts).catch(err =>{});
														/** signup transaction **/
														let UserTransactions ={
															userId:userResponse._id,
															amount:constants.signupPoints,
															transactionType:"Cr",
															narration:"Signup Bonus",
														};
														UserModel.UserTransaction.create(UserTransactions,function(err){});

														return apiResponse.successResponseWithData(res,"Successfully login.", userData);
													});
											}else{
												return apiResponse.unauthorizedResponse(res,"Something went wrong, Please try again.");
											}
										});	
									  });
	 						}
 						}
 					}).catch(function(err){ 
 						return apiResponse.ErrorResponse(res,err);
 					});
			}
		}catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
}];


/**
 * get users list.
 *
 * @returns {Object}
 */

exports.getUsersSuggestions = [
 	// Validate fields.
 	auth,
 	body("filters").trim(),
 	(req,res)=>{
 		try{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filters = '';
 				/** get block user **/
	 			UserModel.UserReporting.aggregate([
					{$match: {
							    "status": 'Active',
		                		"action": 'Block',
				                "userId":new ObjectId(req.userSession.id)
				            }
		              },
		            {$project: {
		                	_id:0,
		                    userId:1,
		                    toUserId:1,
		                    action:1
		             }
		            },
	            ]).exec().then(function(data){	
	            	var Responses = [];
	            	Responses.push(new ObjectId(req.userSession.id));
	            	if(data != ""){
						var arrayLength = data.length;
						for (var i = 0; i < arrayLength; i++) {
							Responses.push(data[i].toUserId);
					    };
	            	}
	            	var where = {
		                "status":true,
		            }
			        if(req.body.filters != "") {
	 					where.fullName=new RegExp(req.body.filters, 'i');
	 				}
	 				where.isProfile = "Completed";
	 				if(Responses != ""){
	 					where._id={'$nin': Responses}
	 				}
				    UserModel.User.aggregate([
					 {$project: {_id: 1,id: "$_id" ,isProfile:1,userId:"$_id",fullName: 1, phoneNo: 1, 
					 	username: 1, status: 1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}
					 }},
				     {$skip : skip},
				     {$limit : limit},
				     {$lookup: {
				               from: "user_social_subscribers",
				               let: {
				                    ids: "$_id", //localField
				               },
				               pipeline: [
				                    {	 /** left table condition **/
				                         $match: {
				                              $expr:{
				                                   $and:[
				                                        {
				                                            $eq:["$toUserID","$$ids"] // foreign figle
				                                        },
				                                          {
				                                            $eq:["$action","Friend"]
				                                         },
				                                        /*{
				                                             $ne:["$status","Rejected"]
				                                        },*/
				                                        {
				                                        	$eq:["$userID",new ObjectId(req.userSession.id)]
				                                        }
				                                   ]
				                              }
				                         },


				                    },
				                    {$project:{_id:1,requestId:"$_id",userID:1,status:1,action:1}}
				               ],
				               as: "friendRequest"
				          }
				     },
				     { $lookup: {
							    from: 'chats',
							    let: { "rUserId": "$userId" },
							    pipeline: [
							      { $match: { $expr: {
														$and:[
																{$eq:["$toUserId","$$rUserId"]},
																{
					                                             "$eq":["$userId",new ObjectId(req.userSession.id)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {$project:{_id:0,chatId:"$_id",activeStatus:1,userId:1,toUserId:1}},
							    ],
							    "as": "chatStatusFrom"
							},},
							{ $lookup: {
							    from: 'chats',
							    let: { "rUserId": "$userId" },
							    pipeline: [
							      { $match: { $expr: {
														$and:[
																{$eq:["$userId","$$rUserId"]},
																{
					                                             "$eq":["$toUserId",new ObjectId(req.userSession.id)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {$project:{_id:0,chatId:"$_id",activeStatus:1,userId:1,toUserId:1}},
							    ],
							    "as": "chatStatusTo"
							},},
				     /*{$lookup:{
				     		from: "user_reporteds",
				     		let:{ uId:"$id"},
				     		pipeline:[{
				     			$match:{
				     				$expr:{
				     					$and:[
				     						{
				     							$eq:['$toUserId','$$uId']
				     						},
				     						{
				                                $eq:["$action","Block"]
				                            },
				                            {
				                                $eq:["$userId",new ObjectId(req.userSession.id)]
				                            }
				     					]
				     				}
				     			}
				     		},
				     		{$project:{_id:1,toUserId:1,userId:1}}
				     		], as : "blockUser"
				     	}
				 	 },*/
					{
		            $match: where,
				},
				]).exec().then(function(data){
					  var Responses = [];
					  var arrayLength = data.length;
					  for (var i = 0; i < arrayLength; i++) {
					  	//if(data[i].blockUser.length == 0){
						  	if(data[i].friendRequest.length > 0){
						  		if(data[i].friendRequest[0].status == "Pending"){
						  			Responses.push(data[i]);
						  		}
						  	}else{
						  		Responses.push(data[i]);
						  	}
					  	//}
				      };
					return apiResponse.successResponseWithData(res,"Successfully listed",Responses);
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

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
 * get users list.
 *
 * @returns {Object}
 */
exports.addFriendRequest = [
 	// Validate fields.
 	auth,
 	body('toUserID').isLength({min:1}).trim().withMessage("ToUserID field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}else{
					body.ToUserDetails = user;
				}
			});
		}),
 	(req,res)=>{
 		try{
 			//console.log(body.ToUserDetails);
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				if(req.body.toUserID == req.userSession.id){
 					return apiResponse.unauthorizedResponse(res,"You can not send request to your self.");
 				}else if(!body.ToUserDetails.status){
 					return apiResponse.unauthorizedResponse(res,"You can send request only verified user.");
 				}
 				let  findWhere = {action:"Friend",userID:new ObjectId(req.userSession.id),toUserID:new ObjectId(req.body.toUserID),status:{$ne:'Rejected'}};
 				UserModel.UserSocialSubscribers.findOne(findWhere).then((isRequest) =>{

 					if(isRequest){
 						if(isRequest.status == "Pending"){
 							return apiResponse.unauthorizedResponse(res,"Your friend request already is pending.");
 						}else if(isRequest.status == "Verified"){
 							return apiResponse.unauthorizedResponse(res,"You are already friend of this user.");
 						}else if(isRequest.status == "Rejected"){
 							return apiResponse.unauthorizedResponse(res,"Your friend request is rejected.");
 						}
 					}else{
 						let  findWhereOR = {action:"Friend",toUserID:new ObjectId(req.userSession.id),userID:new ObjectId(req.body.toUserID),status:{$ne:'Rejected'}};
 						UserModel.UserSocialSubscribers.findOne(findWhereOR).then((isRequestResponse) =>{
 							if(isRequestResponse){
		 						if(isRequestResponse.status == "Pending"){
		 							return apiResponse.unauthorizedResponse(res,"Your friend request already is pending.");
		 						}else if(isRequestResponse.status == "Verified"){
		 							return apiResponse.unauthorizedResponse(res,"You are already friend of this user.");
		 						}
 							}else{
 								let reqData = {
					 					userID:req.userSession.id,
					 					toUserID:req.body.toUserID,
					 					action:"Friend",
					 					status:"Pending",
					 			};
					 			UserModel.UserSocialSubscribers.create(reqData,function(err,subscribe){
					 				if(err){
					 					return apiResponse.ErrorResponse(res,err);
					 			    }
					 				let reqNofity = {
					 					patternID:"Friend",
					 					userID:req.userSession.id,
					 					toUserID:req.body.toUserID,
					 					notificationText: "Friend request invite",
					 					notificationMessage:"sent you friend request",
					 					status:"Pending",
					 					entityID:subscribe._id,
					 				};
					 				UserModel.Notifications.create(reqNofity,function(err){
						 				if(err){
						 					//return apiResponse.ErrorResponse(res,err);
						 				}
					 				});

					 				UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
											if (userDetails) {
												
							 				/** push notification **/
											var userMessage = userDetails.username+" sent you friend request";
											var userBadges = 1;
											var userIds = req.body.toUserID;
											var extraParams = {};
												extraParams.title = 'PlayDate friend request invite';
												extraParams.notificationType = 'FRIEND_REQUEST';
												extraParams.userId   = userIds;
												extraParams.moduleName = 'FRIEND';
												extraParams.moduleId = subscribe._id;
												extraParams.fromUserId = req.userSession.id;
												extraParams.status = true;

												notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);

											}
									});
					 				return apiResponse.successResponse(res,"Friend request sent successfully.");
					 			});
 							}
 						});
 					}
 				});
 			}
 		}catch(err){
 			//console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];

  /**
 * get notifications list.
 *
 * @returns {Object}
 */

 exports.getNotifications = [
 	//validation fields
 	auth,
 	(req,res)=>{
 		try{
 		var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 		var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		UserModel.Notifications.aggregate([
        {"$project":{_id:1,notificationId:"$_id",entityID:1,notificationText:1,notificationMessage:1,patternID:1,entryDate:1,status:1,readStatus:1,toUserID:1,userID:1}},
        {"$sort":{entryDate:-1}},
        {"$match": {toUserID: new ObjectId(req.userSession.id),status:"Pending"} },
        {"$skip" : skip},
        {"$limit" : limit},
		{ "$lookup": {
		    "from": 'user_social_subscribers',
		    "let": { "friendID": "$userID" },
		    "pipeline": [
		      { "$match": { "$expr": {
									"$and":[
											{"$eq":["$userID","$$friendID"]},
											{"$eq":["$toUserID",new ObjectId(req.userSession.id)]},
											{"$eq":["$status","Pending"]}
										]
									}
		      	 		   } 
		      },
 			  {"$project":{_id:1,requestId:"$_id",action:1,status:1,userID:1,toUserID:1}},

		      { "$lookup": {
		        "from": 'users',
		        "let": { "myId": "$userID" },
		        "pipeline": [

		          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myId"] }] } }},

		          {"$project":{_id:1,username:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}}},

		        ],"as": "UserInfo"
		      }},
		     
		    ],
		    "as": "friendRequest"
		  }},
		  { "$lookup": {
		    "from": 'partner_subscribers',
		    "let": { "relID": "$userID" },
		    "pipeline": [
		      { "$match": { "$expr": {
									"$and":[
											{"$eq":["$userId","$$relID"]},
											{"$eq":["$toUserId",new ObjectId(req.userSession.id)]},
											{"$eq":["$status","Pending"]}
										]
									}
		      	 		   } 
		      },
 			  {"$project":{_id:1,requestId:"$_id",action:1,status:1,userId:1,toUserId:1}},

		      { "$lookup": {
		        "from": 'users',
		        "let": { "myIds": "$userId" },
		        "pipeline": [

		          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myIds"] }] } }},

		          {"$project":{_id:0,"id":"$_id",username:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}}},

		        ],"as": "UserInfo"
		      }},
		     
		    ],
		    "as": "relationRequest"
		  }},
		  { "$lookup": {
		    "from": 'chats',
		    "let": { "chatId": "$userID" },
		    "pipeline": [
		      { "$match": { "$expr": {
									"$and":[
											{"$eq":["$userId","$$chatId"]},
											{"$eq":["$toUserId",new ObjectId(req.userSession.id)]},
											{"$eq":["$activeStatus","Pending"]}
										]
									}
		      	 		   } 
		      },
 			  {"$project":{_id:1,requestId:"$_id",activeStatus:1,userId:1,toUserId:1}},

		      { "$lookup": {
		        "from": 'users',
		        "let": { "myId": "$userId" },
		        "pipeline": [

		          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myId"] }] } }},

		          {"$project":{_id:1,username:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}}},

		        ],"as": "UserInfo"
		      }},
		     
		    ],
		    "as": "chatRequest"
		  }},
		    { "$lookup": {
		        "from": 'users',
		        "let": { "myId": "$userID" },
		        "pipeline": [

		          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myId"] }] } }},

		          {"$project":{_id:0,"id":"$_id",fullName:1,username:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]}}},

		        ],"as": "UserInformation"
		    }},
		    { "$lookup": {
		        "from": 'feed_posts',
		        "let": { "entId": "$entityID" },
		        "pipeline": [

		          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$entId"] }] } }},

		          {"$project":{_id:0,"postId":"$_id",postType:1,mediaId:1}},
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
		        ],"as": "PostInfo",

		    }},
		]).exec().then(function(data){

			UserModel.Notifications.updateMany({toUserID: new ObjectId(req.userSession.id),readStatus:false},
				{"$set":{"readStatus": true}},{"multi": true},function(err,result){});

		    return apiResponse.successResponseWithData(res,"Successfully listed",data);
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
 * add friend request status
 *
 * @returns {Object}
 */

exports.friendRequestUpdateStatus=[
  	//validation fields
 	auth,
 	body("requestID").trim().isLength({min:1}).withMessage("Request id must be specified.").custom((value)=>{
 		return UserModel.UserSocialSubscribers.findOne({_id:new ObjectId(value),action:'Friend'}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid friend request ID.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	body('status').trim().isLength({min:1}).withMessage("Status must be specified Verified,Rejected."),
 	(req,res)=>{
 		try{ 
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
					var status = req.body.status;
		 			var query = {_id:new ObjectId(req.body.requestID),toUserID:new ObjectId(req.userSession.id)};
							    	
				    UserModel.UserSocialSubscribers.findOneAndUpdate(query,{status:req.body.status}).catch(err =>{
		 			});
		 			UserModel.Notifications.findOneAndUpdate({entityID:new ObjectId(req.body.requestID)},{status:req.body.status}).catch(err =>{
		 			});
		 			if(status == "Verified"){
		 				let reqNofity = {
						    patternID:"FriendAccepted",
						 	userID:req.userSession.id,
						 	toUserID:body.toRequestDetails.userID,
						 	notificationText: "Friend request accepted",
						 	notificationMessage:"Friend request accepted successfully",
						 	status:"Pending",
						    entityID:req.body.requestID,
						};
						if(body.toRequestDetails.status == "Pending"){
							UserModel.Notifications.create(reqNofity,function(err){
							});	

									UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
											if (userDetails) {
															
								 				/** push notification **/
												var userMessage = userDetails.username+ " has been accept your friend request accepted";
												var userBadges = 1;
												var userIds = body.toRequestDetails.userID;
												var extraParams = {};
													extraParams.notificationType = 'FRIEND_REQUEST';
													extraParams.title = 'PlayDate friend request';
													extraParams.userId   = userIds;
													extraParams.moduleName = 'FRIEND';
													extraParams.moduleId = req.body.requestID;
													extraParams.fromUserId = req.userSession.id;
													extraParams.status = true;

													notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);

											}
									});

						}
		 				return apiResponse.successResponse(res,"Friend request accepted successfully.");	
		 			}else{
		 				return apiResponse.successResponse(res,"Friend request rejected successfully.");
		 			}
	 		}
 		}catch(err){
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
													{"$ne":["$_id",new ObjectId(req.userSession.id)]},
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
													{"$ne":["$_id",new ObjectId(req.userSession.id)]},
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
			                $or:[{"userID":new ObjectId(req.userSession.id)},
			                	{"toUserID":new ObjectId(req.userSession.id)}]
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
 * get users match list.
 *
 * @returns {Object}
 */

exports.getUsersMatchList = [
 	// Validate fields.
 	auth,
 	(req,res)=>{
 		try{
 			console.log(req.userSession.id);
 			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			//let filters = (req.body.filter) ? {fullName:{ $regex: '.*' + req.body.filter.toLowerCase() + '.*' }} : {};
				
 				/** get block user **/
	 			UserModel.UserReporting.aggregate([
					{$match: {
							    "status": 'Active',
		                		"action": 'Block',
				                "userId":new ObjectId(req.userSession.id)
				            }
		              },
		            {$project: {
		                	_id:0,
		                    userId:1,
		                    toUserId:1,
		                    action:1
		             }
		            },
	            ]).exec().then(function(data){	
	            	var Responses = [];
	            	Responses.push(new ObjectId(req.userSession.id));
	                if(data != ""){
						var arrayLength = data.length;
						for (var i = 0; i < arrayLength; i++) {
							Responses.push(data[i].toUserId);
					    };
	            	}

		            UserModel.User.findOne({_id:new ObjectId(req.userSession.id)},{username:1,userType:1,interestedIn:1,interested:1,restaurants:1}).then(user=>{
	 					
		                var where = { interested: { $in: user.interested },
							    	  restaurants: { $in: user.restaurants },
							    	 _id:{$ne : new ObjectId(req.userSession.id)},
							    	  isProfile:{$eq : "Completed"},
							    	};
				        /*if(req.body.filters != "") {
		 					where.fullName=new RegExp(req.body.filters, 'i');
		 				}*/
		 				if(Responses != ""){
		 					where._id={'$nin': Responses}
		 				}
	 					UserModel.User.aggregate([
	 						{
							 	$project: {
							 	_id: 1,userId:"$_id",isProfile:1, fullName: 1,interested:1,restaurants:1,gender:1,age:1,paymentMode:1, phoneNo: 1, username: 1, status: 1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
							 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"],
							 	}
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
							{ $lookup: {
							    from: 'chats',
							    let: { "rUserId": "$userId" },
							    pipeline: [
							      { $match: { $expr: {
														$and:[
																{$eq:["$toUserId","$$rUserId"]},
																{
					                                             "$eq":["$userId",new ObjectId(req.userSession.id)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {$project:{_id:0,chatId:"$_id",activeStatus:1,userId:1,toUserId:1}},
							    ],
							    "as": "chatStatusFrom"
							},},
							{ $lookup: {
							    from: 'chats',
							    let: { "rUserId": "$userId" },
							    pipeline: [
							      { $match: { $expr: {
														$and:[
																{$eq:["$userId","$$rUserId"]},
																{
					                                             "$eq":["$toUserId",new ObjectId(req.userSession.id)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {$project:{_id:0,chatId:"$_id",activeStatus:1,userId:1,toUserId:1}},
							    ],
							    "as": "chatStatusTo"
							},},
						    {$skip : skip},
						    {$limit : limit},
						    { 
						    	$match: where
						    },

							]).exec().then(function(data){
								return apiResponse.successResponseWithData(res,"Successfully listed",data);
							}).catch(function(err){
								return apiResponse.ErrorResponse(res,err);
							});
	 				});
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
 * update username.
 *
 * @returns {Object}
 */
exports.UpdateUsername = [
 		auth,
 		body("username").trim().isLength({min:4}).withMessage('Username must be minimum 4 characters long').
 		isAlphanumeric().withMessage('Username must be alphanumeric'),
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
 					if(req.body.userId == req.userSession.id){
	 					 $whereQ = {username : req.body.username,_id:{$ne:req.userSession.id}}
		 				 UserModel.User.findOne($whereQ).then((user) => {
							if (user) {
								return apiResponse.unauthorizedResponse(res,"Username already in use.");
							}else{
			 					var query = {_id:req.userSession.id};
			 					let userData= {};
			 					userData.username = req.body.username;	
			 					if(userData){
				 					UserModel.User.findOneAndUpdate(query,userData).catch(err =>{
				 						return apiResponse.ErrorResponse(res,err);
				 					});
				 					return apiResponse.successResponse(res,"Successfully username updated.");
			 					}else{
			 						return apiResponse.unauthorizedResponse(res,"Specified one value.");
			 					}	
							}
						});
	 			    }else{
 						return apiResponse.unauthorizedResponse(res,"Invalid Authorization.");
 					}
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * add user like unlike request.
 *
 * @returns {Object}
 */
exports.addUserMatchRequest = [
 	// Validate fields.
 	auth,
 	body('toUserID').isLength({min:1}).trim().withMessage("ToUserID field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}else{
					body.ToUserDetails = user;
				}
			});
		}),
 	body('action').trim().isLength({min:1}).withMessage("Action must be specified Like,Unlike"),
 	(req,res)=>{
 		try{
 			//console.log(body.ToUserDetails);
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				var reqAction = req.body.action;
 				if(req.body.toUserID == req.userSession.id){
 					return apiResponse.unauthorizedResponse(res,"You can not send match request to your self.");
 				}
 				
 				let  findWhere = {action:{$in:['Like','Unlike']},
 					userID:new ObjectId(req.userSession.id),toUserID:new ObjectId(req.body.toUserID)};
 				UserModel.UserSocialSubscribers.findOne(findWhere).then((isRequest) =>{
 					if(isRequest){
 						if(isRequest.status == "Pending"){
 							return apiResponse.unauthorizedResponse(res,"Your match request already is pending.");
 						}else if(isRequest.status == "Verified"){
 							return apiResponse.unauthorizedResponse(res,"You are already match of this user.");
 						}else if(isRequest.status == "Rejected"){
 							return apiResponse.unauthorizedResponse(res,"Your match request is rejected.");
 						}
 					}else{
 						let  findWhereOR = {action:{$in:['Like','Unlike']},toUserID:new ObjectId(req.userSession.id),userID:new ObjectId(req.body.toUserID)};
 						UserModel.UserSocialSubscribers.findOne(findWhereOR).then((isRequestResponse) =>{
 							if(isRequestResponse){
		 						if(isRequestResponse.status == "Pending"){
		 							return apiResponse.unauthorizedResponse(res,"Your match request already is pending.");
		 						}else if(isRequestResponse.status == "Verified"){
		 							return apiResponse.unauthorizedResponse(res,"You are already match of this user.");
		 						}else if(isRequestResponse.status == "Rejected"){
		 							return apiResponse.unauthorizedResponse(res,"Your match request is rejected.");
		 						}
 							}else{
 								let reqData = {
					 					userID:req.userSession.id,
					 					toUserID:req.body.toUserID,
					 					action:reqAction,
					 					status: (reqAction == "Like") ? "Pending" : "Rejected",
					 			};
					 			UserModel.UserSocialSubscribers.create(reqData,function(err,subscribe){
					 				if(err){
					 					return apiResponse.ErrorResponse(res,err);
					 			    }
					 			    if(reqAction == 'Like'){
						 				let reqNofity = {
						 					patternID:"Match",
						 					userID:req.userSession.id,
						 					toUserID:req.body.toUserID,
						 					notificationText: "Match request invite",
						 					notificationMessage:"sent you match request",
						 					status:"Pending",
						 					entityID:subscribe._id,
						 				};
						 				UserModel.Notifications.create(reqNofity,function(err){
							 				if(err){
							 					//return apiResponse.ErrorResponse(res,err);
							 				}
						 				});

							 			UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
												if (userDetails) {
													/** push notification **/
													var userMessage = userDetails.username+" sent you match request";
													var userBadges = 1;
													var userIds = req.body.toUserID;
													var extraParams = {};
														extraParams.title = 'PlayDate match request invite';
														extraParams.notificationType = 'MATCH_REQUEST';
														extraParams.userId   = userIds;
														extraParams.moduleName = 'MATCH';
														extraParams.moduleId = subscribe._id;
														extraParams.fromUserId = req.userSession.id;
														extraParams.status = true;

														notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
												}
										});
						 				return apiResponse.successResponse(res,"Match request sent successfully.");
					 			    }else{
					 			    	return apiResponse.successResponse(res,"Match list remove.");
					 			    }
					 				
					 			});
 							}
 						});
 					}
 				});
 			}
 		}catch(err){
 			//console.log(err);
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];

  /**
 * update match request status
 *
 * @returns {Object}
 */

exports.matchRequestUpdateStatus=[
  	//validation fields
 	auth,
 	body("requestID").trim().isLength({min:1}).withMessage("Request id must be specified.").custom((value)=>{
 		return UserModel.UserSocialSubscribers.findOne({_id:new ObjectId(value),action:'Like'}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid match request ID.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	body('status').trim().isLength({min:1}).withMessage("Status must be specified Verified,Rejected."),
 	(req,res)=>{
 		try{ 
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 			var status = req.body.status;
	 			var query = {_id:new ObjectId(req.body.requestID),toUserID:new ObjectId(req.userSession.id)};
						    	
			    UserModel.UserSocialSubscribers.findOneAndUpdate(query,{status:req.body.status}).catch(err =>{
	 				return apiResponse.ErrorResponse(res,err);
	 			});
	 			UserModel.Notifications.findOneAndUpdate({entityID:new ObjectId(req.body.requestID)},{status:req.body.status}).catch(err =>{
	 				return apiResponse.ErrorResponse(res,err);
	 			});
	 		    /** notification **/
	 		    var sts = "Accepted";
	 		    var stsPush = "accept";
	 		    if(status == "Rejected"){
	 		    	var sts = "Rejected";
	 		    	var stsPush = "reject";
	 		    }
				let reqNofity = {
					patternID:"MatchRequest",
					userID:body.toRequestDetails.toUserID,
					toUserID:body.toRequestDetails.userID,
					notificationText: "Match Request "+sts+"",
					notificationMessage:""+sts+" your match request",
					status:"Pending",
					entityID:req.body.requestID,
				};
				UserModel.Notifications.create(reqNofity,function(err){});

				UserModel.User.findOne({_id :new ObjectId(body.toRequestDetails.toUserID)}).then((userDetails) => {
					if (userDetails) {
									/** push notification **/
									var userMessage = userDetails.username+" has been "+stsPush+" your match request";
									var userBadges = 1;
									var userIds = body.toRequestDetails.userID;
									var extraParams = {};
									    extraParams.title = 'PlayDate match request';
										extraParams.notificationType = 'MATCH_REQUEST';
										extraParams.userId   = userIds;
										extraParams.moduleName = 'MATCH';
										extraParams.moduleId = req.body.requestID;
										extraParams.fromUserId = body.toRequestDetails.toUserID;
										extraParams.status = true;

										notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
				
					}
				});

	 			if(status == "Verified"){
	 				return apiResponse.successResponse(res,"Match request accepted successfully.");	
	 			}else{
	 				return apiResponse.successResponse(res,"Match request rejected successfully.");
	 			}
	 		}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];

/**
 * read notification & delete notification.
 *
 * @returns {Object}
 */

 exports.updateNotification=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	body("notificationId").trim().isLength({min:1}).withMessage('notificationId must be specified.'),
 	body("status").trim().isLength({min:1}).withMessage('Status must be specified.'),
 	body("action").trim().isLength({min:1}).withMessage('Action must be specified.'),
 	(req,res)=>{
 		try{
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				if(req.body.action == "read" || req.body.action == "delete"){
 					if(req.body.action == "read"){
	 					var query = {toUserID:req.userSession.id,_id:req.body.notificationId};
					    let userData= {};
					 	userData.readStatus = req.body.status;	
						UserModel.Notifications.findOneAndUpdate(query,userData).catch(err =>{
						 		return apiResponse.ErrorResponse(res,err);
						});
						return apiResponse.successResponse(res,"Successfully notification update.");	
 					}else{
	 					var query = {toUserID:req.userSession.id,_id:req.body.notificationId};
					    let userData= {};
					 	userData.readStatus = req.body.status;	
						UserModel.Notifications.deleteOne(query).catch(err =>{
						 		return apiResponse.ErrorResponse(res,err);
						});
						return apiResponse.successResponse(res,"Successfully notification deleted.");	
 					}
 				}else{
 					return apiResponse.unauthorizedResponse(res,"Action must be specified value read, delete.");
 				}
				
 			}
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
												{
													$ne:['$postType',"Question"]
												},
												],

										},
										$and:[{"status":"Active"}],
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
						 	businessImage:{$concat:[constants.baseUrl,"/uploads/userProfilePic/","$businessImage"]},
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
 * remove friend.
 *
 * @returns {Object}
 */
exports.removeFriend = [
 	// Validate fields.
 	auth,
 	//authorization.UserAuth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	body('friendId').isLength({min:1}).trim().withMessage("Friend Id field is required.").custom((value,{req}) => {
			return UserModel.UserSocialSubscribers.findOne({$or:[{userID:req.body.userId},{toUserID:req.body.userId}],$and:[{_id:new ObjectId(value)}]}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid friendId.");
				}
			});
		}),
 	(req,res)=>{
 		try{
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				let  QueryWhere = {$or:[{userID:req.body.userId},{toUserID:req.body.userId}],$and:[{_id:new ObjectId(req.body.friendId)}]};
 				UserModel.UserSocialSubscribers.deleteOne(QueryWhere).catch(err =>{
					return apiResponse.ErrorResponse(res,err);
				});
				return apiResponse.successResponse(res,"User unfriend successfully.");	
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];


/**
 * add users report block.
 *
 * @returns {Object}
 */
exports.addUserReportBlock = [
 	// Validate fields.
 	auth,
 	body('toUserId').isLength({min:1}).trim().withMessage("ToUserId field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}
			});
		}),
 	body("action").isLength({min:1}).trim().withMessage('Action must be specified Block, Report.'),
 	authorization.UserAuth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	(req,res)=>{
 		try{
 			//console.log(body.ToUserDetails);
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				var action = req.body.action;
 				if(req.body.toUserID == req.userSession.id){
 					return apiResponse.unauthorizedResponse(res,"You can not "+action+" to your self.");
 				}
 				let  findWhere = {userId:new ObjectId(req.userSession.id),toUserId:new ObjectId(req.body.toUserId),action:action};
 				UserModel.UserReporting.findOne(findWhere).then((isRequest) =>{
 					if(isRequest){
 						return apiResponse.unauthorizedResponse(res,"You are already "+action+" of this user.");
 					}else{
 						 		let reqData = {
					 					userId:req.userSession.id,
					 					toUserId:req.body.toUserId,
					 					action:action,
					 					status:"Active",
					 			};
					 			UserModel.UserReporting.create(reqData,function(err,subscribe){
					 				if(err){
					 					return apiResponse.ErrorResponse(res,err);
					 			    }
					 			    if(action == "Block"){

						 			    /** block friend user**/
							 			var query = {userID:new ObjectId(req.userSession.id),toUserID:new ObjectId(req.body.toUserId),'status':"Verified"};
												    	
									    UserModel.UserSocialSubscribers.findOneAndUpdate(query,{action:"Block"}).catch(err =>{
							 				//return apiResponse.ErrorResponse(res,err);
							 			});

							 			var query = {toUserID:new ObjectId(req.userSession.id),userID:new ObjectId(req.body.toUserId),'status':"Verified"};
												    	
									    UserModel.UserSocialSubscribers.findOneAndUpdate(query,{action:"Block"}).catch(err =>{
							 				//return apiResponse.ErrorResponse(res,err);
							 			});

							 	        /** block friend user**/
							 			var query = {userId:new ObjectId(req.userSession.id),toUserId:new ObjectId(req.body.toUserId),'activeStatus':"Active"};
												    	
									    ChatModel.Chat.findOneAndUpdate(query,{activeStatus:"Block"}).catch(err =>{
							 				//return apiResponse.ErrorResponse(res,err);
							 			});

							 			var query = {toUserId:new ObjectId(req.userSession.id),userId:new ObjectId(req.body.toUserId),'activeStatus':"Active"};
												    	
									    ChatModel.Chat.findOneAndUpdate(query,{activeStatus:"Block"}).catch(err =>{
							 				//return apiResponse.ErrorResponse(res,err);
							 			});
								    } 

					 				return apiResponse.successResponse(res,"You are successfully "+action+" of this user.");
					 			});
 					}
 				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];


/**
 * remove friend.
 *
 * @returns {Object}
 */
exports.removeUserReportBlock = [
 	// Validate fields.
 	auth,
 	authorization.UserAuth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	body('toUserId').isLength({min:1}).trim().withMessage("ToUserId field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}
			});
		}),
 	body("action").isLength({min:1}).trim().withMessage('Action must be specified Block, Report.'),
 	(req,res)=>{
 		try{
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				let  QueryWhere = {userId:req.body.userId,toUserId:req.body.toUserId,action:req.body.action};
 				UserModel.UserReporting.deleteOne(QueryWhere).catch(err =>{
					return apiResponse.ErrorResponse(res,err);
				});

				if(req.body.action == "Block"){

				    /** block friend user**/
					var query = {userID:new ObjectId(req.userSession.id),toUserID:new ObjectId(req.body.toUserId)};
												    	
					UserModel.UserSocialSubscribers.findOneAndUpdate(query,{action:"Friend"}).catch(err =>{
						//return apiResponse.ErrorResponse(res,err);
					});

					var query = {toUserID:new ObjectId(req.userSession.id),userID:new ObjectId(req.body.toUserId)};
												    	
					UserModel.UserSocialSubscribers.findOneAndUpdate(query,{action:"Friend"}).catch(err =>{
						//return apiResponse.ErrorResponse(res,err);
					});

					/** block friend user**/
					var query = {userId:new ObjectId(req.userSession.id),toUserId:new ObjectId(req.body.toUserId),'activeStatus':"Block"};
												    	
					ChatModel.Chat.findOneAndUpdate(query,{activeStatus:"Active"}).catch(err =>{
						//return apiResponse.ErrorResponse(res,err);
					});

					var query = {toUserId:new ObjectId(req.userSession.id),userId:new ObjectId(req.body.toUserId),'activeStatus':"Block"};
												    	
					ChatModel.Chat.findOneAndUpdate(query,{activeStatus:"Active"}).catch(err =>{
						//return apiResponse.ErrorResponse(res,err);
					});

				} 

				if(req.body.action == "Block"){
					return apiResponse.successResponse(res,"User unblocked successfully.");	
				}else{
					return apiResponse.successResponse(res,"User removed in report category.");	
				}
				
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];

/**
 * get users block.
 *
 * @returns {Object}
 */

exports.getUserBlocked = [
 	// Validate fields.
 	auth,
 	body("filters").trim(),
 	(req,res)=>{
 		try{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filters = '';
 				/** get block user **/
	 			UserModel.UserReporting.aggregate([
					{$match: {
							    "status": 'Active',
		                		"action": 'Block',
				                "userId":new ObjectId(req.userSession.id)
				            }
		              },
		            {$lookup:{
		            	from:"users",
		            	localField:"toUserId",
		            	foreignField:"_id",
		            	as:"blockUsers"
		            	
		            }},
		            {
				        $unwind: {
				                path: "$blockUsers",
				                preserveNullAndEmptyArrays: false
				            }
				        },
		            {$project: {
		                	_id:0,
		                    userId:1,
		                    toUserId:1,
		                    action:1,
		                    fullName:"$blockUsers.fullName",
		                    username:"$blockUsers.username",
		                    profilePicPath:{$concat:[constants.baseUrl,"","$blockUsers.profilePicPath"]},
		             }
		            },
	            ]).exec().then(function(data){	
				    if(data != ""){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
					    return apiResponse.unauthorizedResponse(res,"Records not found");
					}
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
 * join couple code
 *
 * @returns {Object}
 */

 exports.JoinCoupleCode=[
 	// Validate fields.
 	auth,
 	body('inviteCode').isLength({min:1}).trim().withMessage("Invite code field is required.").custom((value) => {
			return UserModel.User.findOne({inviteCode:value},{_id:1,relationship:1}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid invite code.");
				}else{
					body.inviteUserId = user._id;
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				UserModel.CoupleSubscribers.findOne({$or:[{userId:new ObjectId(req.userSession.id)},{toUserId:new ObjectId(req.userSession.id)}]}).then((relationUser)=>{
 					if(relationUser){
 						return apiResponse.unauthorizedResponse(res,"You are already in relationship.");
 					}else{
		 				UserModel.CoupleSubscribers.findOne({$or:[{userId:new ObjectId(body.inviteUserId)},{toUserId:new ObjectId(body.inviteUserId)}]}).then((relationUser)=>{
		 					if(relationUser){
		 						return apiResponse.unauthorizedResponse(res,"Invite user already in relationship.");
		 					}else{
		 						let relation ={
				 					userId:req.userSession.id,
				 					toUserId:body.inviteUserId,
				 					action:"Couple",
				 					status: "Verified",
				 					relationType:"Invite",
				 				};
		 						UserModel.CoupleSubscribers.create(relation,function(err,response){
		 							if(err){
							 			return apiResponse.ErrorResponse(res,err);
							 		}
							 		/** update relation status**/
						 			var relStatus = {relationship:"Taken"};
									UserModel.User.findOneAndUpdate({_id:new ObjectId(body.inviteUserId)}
											,relStatus).
						 			catch(err =>{});
						 			UserModel.User.findOneAndUpdate({_id:new ObjectId(req.userSession.id)}
											,relStatus).
						 			catch(err =>{});
							 		return apiResponse.successResponse(res,"You are successfully made couple.");
		 						})
		 					}
		 				});
 					}
 				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];

 /**
 * crate date get partner list
 *
 * @returns {Object}
 */

 exports.CreateDateGetPartnerList=[
 	// Validate fields.
 	auth,
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filters = '';
 				/** get block user **/
	 			UserModel.UserReporting.aggregate([
					{$match: {
							    "status": 'Active',
		                		"action": 'Block',
				                "userId":new ObjectId(req.userSession.id)
				            }
		              },
		            {$project: {
		                	_id:0,
		                    userId:1,
		                    toUserId:1,
		                    action:1
		             }
		            },
	            ]).exec().then(function(data){	
	            	var Responses = [];
	            	Responses.push(new ObjectId(req.userSession.id));
	            	if(data != ""){
						var arrayLength = data.length;
						for (var i = 0; i < arrayLength; i++) {
							Responses.push(data[i].toUserId);
					    };
	            	}
	            	var where = {
		                "status":true
		            }
			        if(req.body.filters != "") {
	 					where.fullName=new RegExp(req.body.filters, 'i');
	 				}
	 				if(Responses != ""){
	 					where._id={'$nin': Responses}
	 				}
				    UserModel.User.aggregate([
					 {$lookup:{
					 	from:"user_accounts",
					 	localField:"_id",
					 	foreignField:"userId",
					 	as: "account"
					 }},
					 {
				        $unwind: {
				                path: "$account",
				                preserveNullAndEmptyArrays: false
				            }
				     },
				     {$sort:{"account.totalPoints":-1}},
				     {$project: {_id: 1,id: "$_id" ,fullName: 1, phoneNo: 1, 
					 	username: 1, status: 1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]},
					 	"totalPoints":"$account.totalPoints",
					 	"currentPoints":"$account.currentPoints"
					 }},
					{
		            $match: where,
				    },		   
				    {$skip : skip},
				    {$limit : limit},
				]).exec().then(function(data){
					return apiResponse.successResponseWithData(res,"Successfully listed",data);
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	            }).catch(function(err){
				    return apiResponse.ErrorResponse(res,err);
				});
 			}
 		}catch(err){
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
	authorization.UserAuth,
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
			                $or:[{"userId":new ObjectId(req.userSession.id)},
			                	{"toUserId":new ObjectId(req.userSession.id)}]
			            }
	              },
	            {$project: {
	                	_id:0,
	                	coupleId: "$_id",
	                    action: 1,
	                    status:1,
	                    bio:1,
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
 * create date request partner
 *
 * @returns {Object}
 */

 exports.CreateDateRequestPartner=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body('toUserId').isLength({min:1}).trim().withMessage("ToUserId field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				UserModel.CreateDatePartner.findOne({$or:[{userId:new ObjectId(req.userSession.id)},{toUserId:new ObjectId(req.body.toUserId)}],$and:[{status:"Pending"}]},{_id:0,'requestId':"$_id"}).then((relationUser)=>{
 					if(relationUser){
 						return apiResponse.successResponseWithData(res,"You are successfully made request.",relationUser);
 						//return apiResponse.unauthorizedResponse(res,"Your partner date request already in pending.");
 					}else{
		 				UserModel.CreateDatePartner.findOne({$or:[{userId:new ObjectId(req.body.userId)},{toUserId:new ObjectId(req.body.toUserId)}],$and:[{status:"Accepted"}]}).then((relationUser)=>{
		 					if(relationUser){
		 						return apiResponse.unauthorizedResponse(res,"Your partner already in another date.");
		 					}else{
		 						let relation ={
				 					userId:req.body.userId,
				 					toUserId:req.body.toUserId,
				 					action:"Date",
				 					status: "Pending",
				 				};
		 						UserModel.CreateDatePartner.create(relation,function(err,response){
		 							if(err){
							 			return apiResponse.ErrorResponse(res,err);
							 		}
							 		/** notification **/
					 				let reqNofity = {
					 					patternID:"DatePartner",
					 					userID:req.userSession.id,
					 					toUserID:req.body.toUserId,
					 					notificationText: "Date Request Invite",
					 					notificationMessage:"sent you date request",
					 					status:"Pending",
					 					entityID:response._id,
					 				};
					 				UserModel.Notifications.create(reqNofity,function(err){
					 				});

					 				UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
											if (userDetails) {
												/** push notification **/
												var userMessage = userDetails.username+" sent you date request";
												var userBadges = 1;
												var userIds = req.body.toUserId;
												var extraParams = {};
												    extraParams.title = 'PlayDate date request invite';
													extraParams.notificationType = 'DATE_REQUEST';
													extraParams.userId   = userIds;
													extraParams.moduleName = 'DATE';
													extraParams.moduleId = response._id;
													extraParams.fromUserId = req.userSession.id;
													extraParams.status = true;

													notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
				
											}
									});

							 		var responseDate = {
							 			requestId:response._id
							 		}
							 		return apiResponse.successResponseWithData(res,"You are successfully made request.",responseDate);
		 						})
		 					}
		 				});
 					}
 				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


  /**
 * crate date get my partner list
 *
 * @returns {Object}
 */

 exports.CreateDateGetMyPartnerRequest=[
 	// Validate fields.
 	auth,
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filters = '';
 				/** get block user **/
	            	var where = {
		                "status":"Pending",
		                "action":"Date",
		                "toUserId": new ObjectId(req.userSession.id),
		            }
				    UserModel.CreateDatePartner.aggregate([
					 {$lookup:{
					 	from:"users",
					 	localField:"userId",
					 	foreignField:"_id",
					 	as: "partner"
					 }},
					 {
				        $unwind: {
				                path: "$partner",
				                preserveNullAndEmptyArrays: false
				            }
				     },
				    {$sort:{"entryDate":-1}},
				    {
				      	$project: {
				      		_id: 0,requestId: "$_id",userId:1,toUserId:1,status:1,action:1,entryDate:1,
				      		"username":"$partner.username",
				      		"fullName":"$partner.fullName",
				      		"profilePicPath":{$concat:[constants.baseUrl,"","$partner.profilePicPath"]},
					     }
					},
					{
		            $match: where,
				    },		   
				    {$skip : skip},
				    {$limit : limit},
				]).exec().then(function(data){
					return apiResponse.successResponseWithData(res,"Successfully listed",data);
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}

 ];


 /**
 * status update create date request partner
 *
 * @returns {Object}
 */

 exports.CreateDateStatusUpdatePartnerRequest=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body('requestId').isLength({min:1}).trim().withMessage("Request id field is required.").custom((value,{req}) => {
			return UserModel.CreateDatePartner.findOne({_id :new ObjectId(value),toUserId:new ObjectId(req.body.userId)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid Request Id.");
				}else{
					if(user.status != "Pending"){
						return Promise.reject("Status already "+user.status+" .");
					}
					body.dateRequest = user;
				}
			});
		}),
 	body("status").isLength({min:1}).trim().withMessage('Status must be specified Accepted, Rejected.'),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var where = {_id:new ObjectId(req.body.requestId)};
 				UserModel.CreateDatePartner.findOneAndUpdate(where,{
 				    status:req.body.status,
 				}).catch(err =>{
 					return apiResponse.ErrorResponse(res,err);
 				});
				/** notification **/
					let reqNofity = {
					 	patternID:"DatePartner",
					 	userID:body.dateRequest.toUserId,
					 	toUserID:body.dateRequest.userId,
					 	notificationText: "Date Request "+req.body.status+"",
					 	notificationMessage:"Successfully Date Request "+req.body.status+"",
					 	status:"Pending",
					 	entityID:req.body.requestId,
					 	};
					UserModel.Notifications.create(reqNofity,function(err){
					});

									UserModel.User.findOne({_id :new ObjectId(body.dateRequest.toUserId)}).then((userDetails) => {
											if (userDetails) {
												var sts = "reject";
												if(req.body.status == "Accepted"){
													var sts = "accept";
												}
							 				/** push notification **/
											var userMessage = userDetails.username+" has been "+sts+" your date request ";
											var userBadges = 1;
											var userIds = body.dateRequest.userId;
											var extraParams = {};
												extraParams.title = 'PlayDate date request';
												extraParams.notificationType = 'DATE_REQUEST';
												extraParams.userId   = userIds;
												extraParams.moduleName = 'DATE';
												extraParams.moduleId = req.body.requestId;
												extraParams.fromUserId = body.dateRequest.toUserId;
												extraParams.status = true;

												notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
											}
									});


 				return apiResponse.successResponse(res,"Successfully Request "+req.body.status+" .");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];

  /**
 * delete date request
 *
 * @returns {Object}
 */

 exports.DeleteDateRequest=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body('requestId').isLength({min:1}).trim().withMessage("Request id field is required.").custom((value,{req}) => {
			return UserModel.CreateDatePartner.findOne({_id :new ObjectId(value),userId:new ObjectId(req.body.userId)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid Request Id.");
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var where = {_id:new ObjectId(req.body.requestId)};
 				UserModel.CreateDatePartner.deleteOne(where).catch(err =>{
 					return apiResponse.ErrorResponse(res,err);
 				});
 				return apiResponse.successResponse(res,"Successfully request deleted.");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];



  /**
 * crate date get my partner list
 *
 * @returns {Object}
 */

 exports.GetMycreateDateRequestStatus=[
 	// Validate fields.
 	auth,
 	body('requestId').isLength({min:1}).trim().withMessage("Request id field is required.").custom((value,{req}) => {
			return UserModel.CreateDatePartner.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid Request Id.");
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
 				var filters = '';
 				/** get block user **/
	            	var where = {
		                "action":"Date",
		                "_id": new ObjectId(req.body.requestId),
		            }
				    UserModel.CreateDatePartner.aggregate([
				     {
		             $match: where,
				     },
					 {$lookup:{
					 	from:"users",
					 	localField:"userId",
					 	foreignField:"_id",
					 	as: "partner"
					 }},
					 {
				        $unwind: {
				                path: "$partner",
				                preserveNullAndEmptyArrays: false
				            }
				     },
				    {
				      	$project: {
				      		_id: 0,requestId: "$_id",userId:1,toUserId:1,status:1,action:1,entryDate:1,
				      		"username":"$partner.username",
				      		"fullName":"$partner.fullName",
				      		"profilePicPath":{$concat:[constants.baseUrl,"","$partner.profilePicPath"]},
					     }
					},

				]).exec().then(function(data){
					return apiResponse.successResponseWithData(res,"Successfully listed",data);
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}

 ];


  /**
 * status update create date request partner
 *
 * @returns {Object}
 */

 exports.finishDate=[
 	// Validate fields.
 	auth,
 	body('requestId').isLength({min:1}).trim().withMessage("Request id field is required.").custom((value,{req}) => {
			return UserModel.CreateDatePartner.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid Request Id.");
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var where = {_id:new ObjectId(req.body.requestId)};
 				UserModel.CreateDatePartner.findOneAndUpdate(where,{
 				    status:'Completed',
 				}).catch(err =>{
 					return apiResponse.ErrorResponse(res,err);
 				});
 				return apiResponse.successResponse(res,"Date completed.");
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


 /**
 * create relationship
 *
 * @returns {Object}
 */

 exports.createRelationship=[
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body('toUserId').isLength({min:1}).trim().withMessage("ToUserId field is required.").custom((value,{req}) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid UserID.");
				}else{
					return UserModel.CoupleSubscribers.findOne({$and:[{userId:new ObjectId(req.body.userId)},{toUserId:new ObjectId(value)}],status:{$ne:"Breakup"}}).then((isExists) =>{
						if(isExists){
							if(isExists.status == "Verified"){
		 						return Promise.reject("Your friend already in relationship with you.");
		 					}else if(isExists.status == "Pending"){
		 						return Promise.reject("Your request already in pending.");
		 					}
						}
					});
				}
			});
		}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				UserModel.CoupleSubscribers.findOne({$or:[{userId:new ObjectId(req.userSession.id)},{toUserId:new ObjectId(req.userSession.id)}],status:{$eq:"Verified"}}).then((relationUser)=>{
 					if(relationUser){
 						return apiResponse.unauthorizedResponse(res,"You are already in relationship.");
 					}else{
		 				UserModel.CoupleSubscribers.findOne({$or:[{userId:new ObjectId(req.body.toUserId)},{toUserId:new ObjectId(req.body.toUserId)}],status:{$eq:"Verified"}}).then((relationUser)=>{
		 					if(relationUser){
		 						return apiResponse.unauthorizedResponse(res,"Your friend already in relationship.");
		 					}else{
		 						let relation ={
				 					userId:req.userSession.id,
				 					toUserId:req.body.toUserId,
				 					action:"Couple",
				 					status: "Pending",
				 					relationType:"Friend",
				 				};
		 						UserModel.CoupleSubscribers.create(relation,function(err,response){
		 							if(err){
							 			return apiResponse.ErrorResponse(res,err);
							 		}
							 		let reqNofity = {
					 					patternID:"Relationship",
					 					userID:req.userSession.id,
					 					toUserID:req.body.toUserId,
					 					notificationText: "Relationship request",
					 					notificationMessage:"sent you relationship request",
					 					status:"Pending",
					 					entityID:response._id,
					 				};
					 				UserModel.Notifications.create(reqNofity,function(err){
						 				if(err){
						 					//return apiResponse.ErrorResponse(res,err);
						 				}
					 				});

					 			    UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
											if (userDetails) {
												
							 				/** push notification **/
											var userMessage = userDetails.username+" sent you relationship request";
											var userBadges = 1;
											var userIds = req.body.toUserId;
											var extraParams = {};
											    extraParams.title = 'PlayDate relationship request';
												extraParams.notificationType = 'RELATIONSHIP_REQUEST';
												extraParams.userId   = userIds;
												extraParams.moduleName = 'RELATIONSHIP';
												extraParams.moduleId = response._id;
												extraParams.fromUserId = req.userSession.id;
												extraParams.status = true;

												notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
											}
									});


							 		/** update relation status**/
						 			/*var relStatus = {relationship:"Taken"};
									UserModel.User.findOneAndUpdate({_id:new ObjectId(body.inviteUserId)}
											,relStatus).
						 			catch(err =>{});*/
							 		return apiResponse.successResponse(res,"Your request successfully sent.");
		 						})
		 					}
		 				});
 					}
 				});
 			}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


   /**
 * add relationship request status
 *
 * @returns {Object}
 */

exports.updateStatusRelationship=[
  	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body("requestId").trim().isLength({min:1}).withMessage("Request id must be specified.").custom((value,{req})=>{
 		return UserModel.CoupleSubscribers.findOne({_id:new ObjectId(value),action:'Couple','toUserId':new ObjectId(req.body.userId)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid request ID.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	body('status').trim().isLength({min:1}).withMessage("Status must be specified Verified,Rejected."),
 	(req,res)=>{
 		try{ 
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
	 			var status = req.body.status;
	 			var query = {_id:new ObjectId(req.body.requestId),toUserId:new ObjectId(req.userSession.id)};
						    	
			    UserModel.CoupleSubscribers.findOneAndUpdate(query,{status:req.body.status}).catch(err =>{
	 				//return apiResponse.ErrorResponse(res,err);
	 			});
	 			UserModel.Notifications.findOneAndUpdate({entityID:new ObjectId(req.body.requestId)},{status:req.body.status}).catch(err =>{
	 				//console.log(err);
	 			});
	 			UserModel.User.findOneAndUpdate({_id:new ObjectId(req.body.userId)},{relationship:"Taken"}).catch(err =>{
	 			});
	 			UserModel.User.findOneAndUpdate({_id:new ObjectId(body.toRequestDetails.userId)},{relationship:"Taken"}).catch(err =>{
	 			});
	 			if(status == "Verified"){
	 				let reqNofity = {
					    patternID:"RelationAccepted",
					 	userID:req.userSession.id,
					 	toUserID:body.toRequestDetails.userId,
					 	notificationText: "Relation request accepted",
					 	notificationMessage:"Relation request accepted successfully",
					 	status:"Pending",
					    entityID:req.body.requestId,
					};
					UserModel.Notifications.create(reqNofity,function(err){
					});


					UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
						if (userDetails) {
									/** push notification **/
									var userMessage = userDetails.username+" has been accepted your relationship request";
									var userBadges = 1;
									var userIds = body.toRequestDetails.userId;
									var extraParams = {};
									    extraParams.title = 'PlayDate relationship request';
										extraParams.notificationType = 'RELATIONSHIP_REQUEST';
										extraParams.userId   = userIds;
										extraParams.moduleName = 'RELATIONSHIP';
										extraParams.moduleId = req.body.requestId;
										extraParams.fromUserId = req.userSession.id;
										extraParams.status = true;

										notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
						}
					});
	 				return apiResponse.successResponse(res,"Relation request accepted successfully.");	
	 			}else{
	 				return apiResponse.successResponse(res,"Relation request rejected successfully.");
	 			}
	 		}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


    /**
 * add relationship request status
 *
 * @returns {Object}
 */

exports.LeaveRelationship=[
  	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body("requestId").trim().isLength({min:1}).withMessage("Request id must be specified.").custom((value,{req})=>{
 		return UserModel.CoupleSubscribers.findOne({$or:[{userId:req.body.userId},{toUserId:req.body.userId}],$and:[{_id:new ObjectId(value)}]}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid request ID.");
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
	 			var query = {_id:new ObjectId(req.body.requestId)};
						    	
			    UserModel.CoupleSubscribers.findOneAndUpdate(query,{status:"Breakup"}).catch(err =>{
	 				//return apiResponse.ErrorResponse(res,err);
	 			});
	 			UserModel.User.findOneAndUpdate({_id:new ObjectId(req.body.userId)},{relationship:"Single"}).catch(err =>{
	 			});
	 			UserModel.User.findOneAndUpdate({_id:new ObjectId(body.toRequestDetails.userId)},{relationship:"Single"}).catch(err =>{
	 			});
	 			return apiResponse.successResponse(res,"Successfully leave relationship.");
	 			/*if(status == "Verified"){
	 				let reqNofity = {
					    patternID:"RelationAccepted",
					 	userID:req.userSession.id,
					 	toUserID:body.toRequestDetails.userId,
					 	notificationText: "Relation request accepted",
					 	notificationMessage:"Relation request accepted sucessfully",
					 	status:"Pending",
					    entityID:req.body.requestId,
					};
					UserModel.Notifications.create(reqNofity,function(err){
					});
	 				return apiResponse.successResponse(res,"Relation request accepted sucessfully.");
	 			}else{
	 				return apiResponse.successResponse(res,"Relation request rejected sucessfully.");
	 			}*/
	 		}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];


   /**
 * get notifications list.
 *
 * @returns {Object}
 */

 exports.getNotificationsCount = [
 	//validation fields
 	auth,
 	(req,res)=>{
 		try{
 		var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 		var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		UserModel.Notifications.aggregate([
        {"$match": {toUserID: new ObjectId(req.userSession.id),readStatus:false,status:"Pending"} },
        {"$group" :{_id:null,totalUnreadNotification:{$sum:1}}},
        {"$project":{_id:0}},
		]).exec().then(function(data){
				if(data == ""){
					data.push({totalUnreadNotification:0});
				}
		        return apiResponse.successResponseWithData(res,"Successfully listed",data);
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
 * status update create date request partner
 *
 * @returns {Object}
 */

 exports.updateCoupleProfile=[
 	// Validate fields.
 	auth,
 	body("bio").trim().isLength({min:1}).withMessage('Bio must be specified.'),
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body("coupleId").trim().isLength({min:1}).withMessage("Couple id must be specified.").custom((value,{req})=>{
 		return UserModel.CoupleSubscribers.findOne({$or:[{userId:req.body.userId},{toUserId:req.body.userId}],$and:[{_id:new ObjectId(value)}]}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid couple ID.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	(req,res) =>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var where = {_id:new ObjectId(req.body.coupleId)};
 				UserModel.CoupleSubscribers.findOneAndUpdate(where,{
 				    bio:req.body.bio,
 				}).catch(err =>{
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
 * User Update profile pic.
 *
 * @returns {Object}
 */

exports.addBusinessImage=[
 	auth,
 	(req,res) =>{
 		try{
		 			var uploadPath = "./public/uploads/userProfilePic";
					var uploadFolderPath = "/uploads/userProfilePic/";
					var storage    = multer.diskStorage({
						destination: function(req, file, callback) {
							callback(null, uploadPath)
						},
						filename: function(req, file, callback) {
							let uploadedFileName = 'playdate-business-'+ Date.now() + path.extname(file.originalname);
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
					} }).array('userBusinessImage',1)(req,res,function(err){
	 				if(err){
	 					return apiResponse.ErrorResponse(res,err);
	 				}else{
	 					var query = {_id:req.userSession.id};
	 					if(req.files != undefined && req.files.length != 0){
		 					let fileObj = req.files;
		 					let userData ={
		 						businessImage:fileObj[0].filename,
		 					};
		 					UserModel.User.findOneAndUpdate(query,userData,function(err){
		 						if(err){
		 							return apiResponse.ErrorResponse(res,err);
		 						}
		 						return apiResponse.successResponseWithData(res,"Successfully updated.",userData);
		 					});
	 				    }else{
	 				    	return apiResponse.unauthorizedResponse(res,'Image file must be specified.');
	 				    }
	 				}
	 			})
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

exports.getBusinessRestaurants = [
 	// Validate fields.
 	auth,
 	body("filters").trim(),
 	(req,res)=>{
 		try{
 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filters = '';

				UserModel.User.aggregate([
					 {$project: {_id: 1,id: "$_id" ,isProfile:1,userId:"$_id",userType:1,fullName: 1, phoneNo: 1, 
					 	username: 1, status: 1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
					 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]},
					 	businessImage:{$concat:[constants.baseUrl,"/uploads/userProfilePic/","$businessImage"]}
					 }},
				     {$match: {"userType":"Business"}},
				     {$limit : limit},
				     {$skip : skip},
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
 * get users list.
 *
 * @returns {Object}
 */

exports.addYahooStockData = [
 	// Validate fields.
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote',
				  params: {region: 'US',lang:'en',symbols:"AAPL"},
				  headers: {
				    'x-api-key': 'wquq92e3rm6vROKusWn4m1tzXST8k0cP7n5mZ7vI'
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];