const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const ChatModel = require('../models/ChatModel');
const PackageModel = require('../models/PackageModel');
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const notification = require("../lib/notification");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
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
ffmpeg.setFfmpegPath(ffmpegPath);
/*var MONGODB_URL = process.env.MONGO_URL;
mongoose.connect(MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() =>{
	console.log("Connected to %s", MONGODB_URL);
	console.log("App is running ... \n");
}).catch(err=>{
	console.error("App starting error:", err.message);
	process.exit(1);
})
var dbConn = mongoose.connection;*/
/**
 * add media post
 *
 * @returns {Object}
 */
 exports.addMedia=[
 	//validate fields
 	auth,
 	(req,res)=>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var uploadPath = "./public/uploads/";
				var displayPath = "/uploads/";
 				var mediaType = req.query.mediaType;
 				var section = req.query.section;
 				uploadPath +=section;
 				displayPath +=section;
 				var storage = multer.diskStorage({
		 			destination: function (req, file, cb) {
						cb(null, uploadPath);
					},
					filename: function (req, file, cb) {
						cb(null, "playdate-" + Date.now() + path.extname(file.originalname));
					},
		 		});
		 		var Message = "";
 				switch(mediaType){
 					case "image":
	 					var upload = multer({
							  storage: storage,
							  fileFilter: (req, file, cb) => {
							    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
							      cb(null, true);
							    } else {
							      cb(null, false);
							      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
							    }
							  }
						}).single('mediaFeed');
						Message = 'Only .png, .jpg and .jpeg format allowed!'
 					break;
 					case "video":
	 					var upload = multer({
							  storage: storage,
							  fileFilter: (req, file, cb) => {
							    if (file.mimetype == "video/mp4" || file.mimetype == "video/ogv" || file.mimetype == "video/webm") {
							      cb(null, true);
							    } else {
							      cb(null, false);
							      return cb(new Error('Only .mp4, .ogv and .webm format allowed!'));
							    }
							  }
						}).single('mediaFeed');
						Message = 'Only .mp4, .ogv and .webm format allowed!'
 					break;
 					case "audio":
	 					return apiResponse.unauthorizedResponse(res,'Media type must be specified iamge, video.');
 					break;
 					default:
 					  return apiResponse.unauthorizedResponse(res,'Media type must be specified iamge, video.');
 					break;
 				}
 			    upload(req, res, (err) => {
					if (err) {
						return apiResponse.unauthorizedResponse(res,Message);
					} else {
						if (req.file == undefined) {
						   return apiResponse.unauthorizedResponse(res,'Please select upload file');
						}else{
							var fileObj= req.file;

							if(mediaType == 'video'){
								/** generate video thumb**/
								ffmpeg(constants.baseUrl+displayPath+"/"+fileObj.filename)
								  .on('filenames', function(filenames) {
								    console.log('Will generate ' + filenames.join(', '))
								  })
								  .on('end', function() {
								  })
								  .screenshots({
								  	timestamps: [0.0],
									filename: fileObj.filename.split('.')[0]+'.png',
								    count: 4,
								    folder: uploadPath+'/thumb'
								});	
							}

		 					let media ={
		 						userId:req.userSession.id,
		 						section:section,
		 						sectionPath:displayPath,
		 						mediaName:fileObj.filename,
		 						MediaSize:fileObj.size,
		 						mediaExt:fileObj.mimetype,
		 						mediaType:mediaType.charAt(0).toUpperCase() + mediaType.slice(1),
		 						mediaThumbName:displayPath+"/thumb/"+fileObj.filename.split('.')[0]+'.png',
		 					};
		 					PostModel.Media.create(media,function(err,response){
		 					    if(err){
					 			  return apiResponse.ErrorResponse(res,err);
					 			}
					 			let ResponseData ={
					 				mediaId:response._id,
					 				mediaName:fileObj.filename,
					 				fullPath:constants.baseUrl+displayPath+"/"+fileObj.filename,
					 				mediaThumbName:constants.baseUrl+displayPath+"/thumb/"+fileObj.filename.split('.')[0]+'.png',
					 			};
					 			return apiResponse.successResponseWithData(res,"Successfully uploaded",ResponseData);
		 					});
						}
					}
				});
 	
 			}
 		}catch(err){
 			//throw error in json response with status 500.
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];

/**
 * add chat media post
 *
 * @returns {Object}
 */
 exports.addChatMedia=[
 	//validate fields
 	auth,
 	(req,res)=>{
 		try{
 			const errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 			}else{
 				var uploadPath = "./public/uploads/";
				var displayPath = "/uploads/";
 				var mediaType = req.query.mediaType;
 				var section = req.query.section;
 				uploadPath +=section;
 				displayPath +=section;
 				var storage = multer.diskStorage({
		 			destination: function (req, file, cb) {
						cb(null, uploadPath);
					},
					filename: function (req, file, cb) {
						cb(null, "playdate-" + Date.now() + path.extname(file.originalname));
					},
		 		});
		 		var Message = "";
 				switch(mediaType){
 					case "image":
	 					var upload = multer({
							  storage: storage,
							  fileFilter: (req, file, cb) => {
							    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
							      cb(null, true);
							    } else {
							      cb(null, false);
							      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
							    }
							  }
						}).single('mediaFeed');
						Message = 'Only .png, .jpg and .jpeg format allowed!'
 					break;
 					case "video":
	 					var upload = multer({
							  storage: storage,
							  fileFilter: (req, file, cb) => {
							    if (file.mimetype == "video/mp4" || file.mimetype == "video/ogv" || file.mimetype == "video/webm") {
							      cb(null, true);
							    } else {
							      cb(null, false);
							      return cb(new Error('Only .mp4, .ogv and .webm format allowed!'));
							    }
							  }
						}).single('mediaFeed');
						Message = 'Only .mp4, .ogv and .webm format allowed!'
 					break;
 					case "audio":
	 					var upload = multer({
							  storage: storage,
							  fileFilter: (req, file, cb) => {
							   // if (file.mimetype == "video/mp4" || file.mimetype == "video/ogv" || file.mimetype == "video/webm") {
							      cb(null, true);
							    //} else {
							      //cb(null, false);
							     // return cb(new Error('Only .mp4, .ogv and .webm format allowed!'));
							    //}
							  }
						}).single('mediaFeed');
						Message = 'Only .mp3, .m4a, .flac, .mp4, .wav, .wma and .aac format allowed!'
 					break;
 					default:
 					  return apiResponse.unauthorizedResponse(res,'Media type must be specified iamge, video.');
 					break;
 				}
 			    upload(req, res, (err) => {
					if (err) {
						return apiResponse.unauthorizedResponse(res,Message);
					} else {
						if (req.file == undefined) {
						   return apiResponse.unauthorizedResponse(res,'Please select upload file');
						}else{
							var fileObj= req.file;

							if(mediaType == 'video'){
								/** generate video thumb**/
								ffmpeg(constants.baseUrl+displayPath+"/"+fileObj.filename)
								  .on('filenames', function(filenames) {
								    console.log('Will generate ' + filenames.join(', '))
								  })
								  .on('end', function() {
								  })
								  .screenshots({
								  	timestamps: [0.0],
									filename: fileObj.filename.split('.')[0]+'.png',
								    count: 4,
								    folder: uploadPath+'/thumb'
								});	
							}

		 					let media ={
		 						userId:req.userSession.id,
		 						section:section,
		 						sectionPath:displayPath,
		 						mediaName:fileObj.filename,
		 						MediaSize:fileObj.size,
		 						mediaExt:fileObj.mimetype,
		 						mediaType:mediaType.charAt(0).toUpperCase() + mediaType.slice(1),
		 						mediaThumbName:displayPath+"/thumb/"+fileObj.filename.split('.')[0]+'.png',
		 					};
		 					PostModel.Media.create(media,function(err,response){
		 					    if(err){
					 			  return apiResponse.ErrorResponse(res,err);
					 			}
					 			let ResponseData ={
					 				mediaId:response._id,
					 				mediaType:mediaType,
					 				mediaName:fileObj.filename,
					 				fullPath:constants.baseUrl+displayPath+"/"+fileObj.filename,
					 				mediaThumbName:constants.baseUrl+displayPath+"/thumb/"+fileObj.filename.split('.')[0]+'.png',
					 			};
					 			return apiResponse.successResponseWithData(res,"Successfully uploaded",ResponseData);
		 					});
						}
					}
				});
 	
 			}
 		}catch(err){
 			//throw error in json response with status 500.
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
];
 /**
 * add post feed.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.addPostFeed = [
	auth,
	body("location").isLength({min:1}).trim().withMessage('Location must be specified.'),
	/*body("mediaId").isLength({min:1}).trim().withMessage('Media ID must be specified.').custom((value)=>{
 		return PostModel.Media.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid media ID.");
				}
 		});
 	}),*/
	body("postType").isLength({min:1}).trim().withMessage('Post type must be specified Normal, Memory, Question.'),
	body("colorCode").trim(),
	body("emojiCode").trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
						var feedPost = {
					 		userId:req.userSession.id,
					 		location:req.body.location,
					 		mediaId:req.body.mediaId,
					 		postType:req.body.postType,
					 		tag:req.body.tag,
						};
					    if(req.body.mediaId){
							feedPost.mediaId = req.body.mediaId;
						}
						if(req.body.tagFriend){
							feedPost.tagFriend = req.body.tagFriend.split(",");
						}
						if(req.body.colorCode){
							feedPost.colorCode = req.body.colorCode;
						}
						if(req.body.emojiCode){
							feedPost.emojiCode = req.body.emojiCode;
						}
					    PostModel.FeedPost.create(feedPost,function(err,response){
		 					if(err){
					 			return apiResponse.ErrorResponse(res,err);
					 		}
					 		let gallery ={
				 				userId:req.userSession.id,
				 				postId:response._id,
				 				mediaId:req.body.mediaId,
				 				galleryType: "PostUpload",
				 			};
				 			PostModel.FeedUserGalary.create(gallery,function(err,response){
				 			}); 

					 		if(feedPost.tagFriend != undefined){
								for(i=0;i<feedPost.tagFriend.length;i++){
									/** notification **/
						 			let reqNofity = {
						 				patternID:"Post",
						 				userID:req.userSession.id,
						 				toUserID:feedPost.tagFriend[i],
						 				notificationText: "Post Tagged",
						 				notificationMessage:"tagged you in a post",
						 				status:"Pending",
						 				entityID:response._id,
						 			};
						 			UserModel.Notifications.create(reqNofity,function(err){});

					 				UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
											if (userDetails) {
												
											/** push notification **/
											var userMessage = userDetails.username+" tagged you in a post";
											var userBadges = 1;
											var userIds = feedPost.tagFriend[i];
											var extraParams = {};
											    extraParams.title = 'PlayDate post tagged';
												extraParams.notificationType = 'POST_TAGGED';
												extraParams.userId   = userIds;
												extraParams.moduleName = 'POST';
												extraParams.moduleId = response._id;
												extraParams.fromUserId = req.userSession.id;
												extraParams.status = true;

												notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);


											}
									});

								}	
							}
					 	    return apiResponse.successResponseWithData(res,"Successfully posted",feedPost);
		 				});
			}
		} catch (err) {
			console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}];

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
			console.log(req.userSession.id);
			var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 			UserModel.UserSocialSubscribers.aggregate([
				{$match: {
						    "status": 'Verified',
	                		"action": 'Friend',
			                $or:[{"userID":new ObjectId(req.userSession.id)},
			                	{"toUserID":new ObjectId(req.userSession.id)}]
			            }
	              },
	            {$project: {
	                	_id:0,
	                    userID:1,
	                    toUserID:1,
	             }
	            },
            ]).exec().then(function(data){
            		if(data != ""){
						var Responses = [];
						var arrayLength = data.length;
						for (var i = 0; i < arrayLength; i++) {
						  (data[i].userID != req.userSession.id) ? Responses.push(data[i].userID) : "";
						  (data[i].toUserID != req.userSession.id) ? Responses.push(data[i].toUserID) : "";
					    };
					    Responses.push(new ObjectId(req.userSession.id));
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
					        	status:1
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
							{ "$addFields": { isLike: {$size: "$likeArr"},isGallerySave:{$size: "$galleryArr"} } },
							{"$match": {
									    "status":"Active",
									    "userId" :{ '$in': Responses}
						               }
				            },
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
            		}else{
            			return apiResponse.unauthorizedResponse(res,"Friends not found");
            		 }
			      }).catch(function(err){
			        console.log(err);
			         return apiResponse.ErrorResponse(res,err);
			  });
		}catch(err){console.log(err);
			console.log(err);
			return apiResponse.ErrorResponse(res,err);
		}
	}

];



/**
 * get feed like.
 *
 * @returns {Object}
 */
exports.addPostLike = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		body("status").isLength({min:1}).trim().withMessage('Status must be specified Like, Unlike.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {userId:req.body.userId,postId:req.body.postId};
		 				 PostModel.FeedLike.findOne(whereQ).then((post) => {
							if (post) {
								if(req.body.status == 'Unlike'){
									var incLikes = {$inc:{likes:-1}};
									PostModel.FeedLike.deleteOne(whereQ).catch(err =>{
									 		return apiResponse.ErrorResponse(res,err);
									});
									/** like decrement & increment**/
				 					PostModel.FeedPost.findOneAndUpdate({_id:new ObjectId(req.body.postId)},incLikes).
						 			catch(err =>{});
							    }
							    return apiResponse.successResponse(res,"Successfully "+req.body.status+".");
							}else{
								if(req.body.status == 'Like'){
				 					let userData= {};
					 					userData.userId = req.body.userId;
					 					userData.postId = req.body.postId;
					 					userData.status = req.body.status;
						 			PostModel.FeedLike.create(userData,function(err,postLike){
						 				if(err){
						 					return apiResponse.ErrorResponse(res,err);
						 			    }
						 			    /** like increment**/
						 			    var like = {$inc:{likes:1}};
										PostModel.FeedPost.findOneAndUpdate({_id:new ObjectId(req.body.postId)}
											,like).
						 				catch(err =>{});
					 					if(body.feed.notifyStatus == 'On' && req.body.status == 'Like'){
					 						let reqNofity = {
							 					patternID:"FeedLike",
							 					userID:req.body.userId,
							 					toUserID:body.feed.userId,
							 					notificationText: "Post like",
							 					notificationMessage:"liked your post",
							 					status:"Pending",
							 					entityID:body.feed._id,
							 				};
							 				UserModel.Notifications.create(reqNofity,function(err){
								 				if(err){
								 					//return apiResponse.ErrorResponse(res,err);
								 				}
							 				});
									 		if(req.body.userId != req.body.userId){
								 				UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
														if (userDetails) {
															
										 				/** push notification **/
										 				var userMessage = userDetails.username+" liked your post";
												 	    var userBadges = 1;
														var userIds = body.feed.userId;
														var extraParams = {};
														    extraParams.title = 'PlayDate post liked';
												 			extraParams.notificationType = 'POST_LIKED';
												 			extraParams.userId   = userIds;
												 			extraParams.moduleName = 'POST';
												 			extraParams.moduleId = req.body.postId;
															extraParams.fromUserId = null;
															extraParams.status = true;

														notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
														}
												});
							 		        }

					 				     }
						 			});
								}
								return apiResponse.successResponse(res,"Successfully "+req.body.status+".");
							}
						});
 				}
 			}catch(err){
 				console.log(err);
 				return apiResponse.ErrorResponse(res,err);
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
 * add post notification turn on and off.
 *
 * @returns {Object}
 */
exports.OwnerPostNotifyOnOff = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}
	 		});
 		}),
 		body("status").isLength({min:1}).trim().withMessage('Status must be specified On, Off.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {userId:req.body.userId,_id:req.body.postId};
		 				 PostModel.FeedPost.findOne(whereQ).then((post) => {
							if (post) {
								/** notification off on**/
						 	    var reqData = {notifyStatus:req.body.status};
								PostModel.FeedPost.findOneAndUpdate(whereQ,reqData).
						 		 catch(err =>{
						 		 	if(err){
								 		return apiResponse.ErrorResponse(res,err);
								 	}
						 		 });
							    return apiResponse.successResponse(res,"Successfully notification "+req.body.status+".");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid post owner");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * add post file save to gallery.
 *
 * @returns {Object}
 */
exports.PostFileSaveToGallery = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		body("status").isLength({min:1}).trim().withMessage('Status must be specified Save, Delete.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
 					var status = req.body.status;
 					if(status == "Save" || status == "Delete"){
 						if(status == "Save"){
		 					 var whereQ = {userId:req.body.userId,postId:req.body.postId};
			 				 PostModel.FeedUserGalary.findOne(whereQ).then((post) => {
								if (post) {
									return apiResponse.unauthorizedResponse(res,"Already saved.");
								}else{
				 					let gallery ={
				 						userId:req.body.userId,
				 						postId:req.body.postId,
				 						mediaId:body.feed.mediaId,
				 						galleryType: "PostSaved",
				 					};
				 					PostModel.FeedUserGalary.create(gallery,function(err,response){
				 					    if(err){
							 			  return apiResponse.ErrorResponse(res,err);
							 			}
							 			return apiResponse.successResponse(res,"Saved to gallery.");
				 					}); 
								}
							});
 						}else{
 							var whereQ = {userId:req.body.userId,postId:req.body.postId};
 							PostModel.FeedUserGalary.deleteOne(whereQ).catch(err=>{
 								return apiResponse.ErrorResponse(res,err);
 							});
 							return apiResponse.successResponse(res,"Successfully deleted.");
 						}
 					}else{
 						return apiResponse.unauthorizedResponse(res,"Status must be specified Save, Delete.");
 					}
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * get saved gallery.
 *
 * @returns {Object}
 */
exports.getPostSavedGallery=[
	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
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
			                $or:[{"gallery.userId":new ObjectId(req.userSession.id)}]
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
 * add feed comment.
 *
 * @returns {Object}
 */
exports.addPostComment = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		body("comment").trim().isLength({min:1}).withMessage('Comment must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					var whereQ = {userId:req.body.userId,postId:req.body.postId};
				 					let userData= {};
					 					userData.userId = req.body.userId;
					 					userData.postId = req.body.postId;
					 					userData.comment = req.body.comment;
								 	PostModel.FeedComment.create(userData,function(err,postComment){
								 		if(err){
								 			return apiResponse.ErrorResponse(res,err);
								 		}
						 			    /** comment increment**/
						 			    var comments = {$inc:{comments:1}};
										PostModel.FeedPost.findOneAndUpdate({_id:new ObjectId(req.body.postId)}
											,comments).
						 				catch(err =>{});
						 				if(body.feed.postType == "Question"){
						 					UserModel.UserTransaction.findOne({entityId:new ObjectId(req.body.postId),userId:new ObjectId(req.body.userId),'narration':"Post Answered"}).then((transaction)=>{
						 						if(transaction == null){
						 							/** question answer get points **/
													let userAccounts ={
														$inc:{totalPoints:constants.answeredPoints,currentPoints:constants.answeredPoints}
												    };
								 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(req.body.userId)},userAccounts).catch(err =>{});
													/** question answer transaction **/
													let UserTransactions ={
														userId:req.body.userId,
														amount:constants.answeredPoints,
														transactionType:"Cr",
														narration:"Post Answered",
														entityId:req.body.postId
													};
													UserModel.UserTransaction.create(UserTransactions,function(err){});	
						 						}
						 					});
						 				}
					 					if(body.feed.notifyStatus == 'On'){
					 						if(body.feed.postType == "Question"){
						 						let reqNofity = {
								 					patternID:"FeedComment",
								 					userID:req.body.userId,
								 					toUserID:body.feed.userId,
								 					notificationText: "Post Question Answered",
								 					notificationMessage:"Answered on your post",
								 					status:"Pending",
								 					entityID:body.feed._id,
								 				};
								 				UserModel.Notifications.create(reqNofity,function(err){
								 				});
					 						}else{
						 						let reqNofity = {
								 					patternID:"FeedComment",
								 					userID:req.body.userId,
								 					toUserID:body.feed.userId,
								 					notificationText: "Post Comment",
								 					notificationMessage:"commented on your post",
								 					status:"Pending",
								 					entityID:body.feed._id,
								 				};
								 				UserModel.Notifications.create(reqNofity,function(err){
								 				});

								 				if(req.body.userId != req.body.userId){
											 	UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
														if (userDetails) {
															/** push notification **/
											 				var userMessage = userDetails.username+" has commented on your post";
													 	    var userBadges = 1;
															var userIds = body.feed.userId;
															var extraParams = {};
																extraParams.title = 'PlayDate post comment';
													 			extraParams.notificationType = 'POST_COMMENT';
													 			extraParams.userId   = userIds;
													 			extraParams.moduleName = 'POST';
													 			extraParams.moduleId = req.body.postId;
																extraParams.fromUserId = null;
																extraParams.status = true;

														    notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);

														}
												});
											}
					 					  }
					 					}
						 			});
						return apiResponse.successResponse(res,"Successfully added.");
 				}
 			}catch(err){
 				console.log(err);
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


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
 * delete post comment.
 *
 * @returns {Object}
 */
exports.deletePostComment = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		body("commentId").trim().isLength({min:1}).withMessage('CommentId must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {
	 					 	userId:req.body.userId,
	 					 	postId:req.body.postId,
	 					 	_id:req.body.commentId
	 					 };
		 				 PostModel.FeedComment.findOne(whereQ).then((postComment) => {
							if (postComment) {
									var update = {status:"Delete"};
				 					PostModel.FeedComment.findOneAndUpdate(whereQ,update).
						 			catch(err =>{
						 				return apiResponse.ErrorResponse(res,err);
						 			});
							    return apiResponse.successResponse(res,"Successfully deleted.");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid request");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * reported post comment.
 *
 * @returns {Object}
 */
exports.reportedPostComment = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}
	 		});
 		}),
 		//authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}
	 		});
 		}),
 		body("commentId").trim().isLength({min:1}).withMessage('CommentId must be specified.').custom((value)=>{
	 		return PostModel.FeedComment.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid comment id.");
					}else{
						body.reported = postFeed.reported;
					}
	 		});
 		}),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {
	 					 	postId:req.body.postId,
	 					 	commentId:req.body.commentId,
	 					 	userId:req.body.userId
	 					 };
		 				 PostModel.FeedCommentReport.findOne(whereQ).then((postComment) => {
							if (!postComment) {
								var insert = {
									postId:req.body.postId,
	 					 			userId:req.body.userId,
	 					 			commentId:req.body.commentId
								};
								PostModel.FeedCommentReport.create(insert,function(err){
									if(err){
										return apiResponse.ErrorResponse(res,err);
									}
									var whereComment = {
				 					 	postId:req.body.postId,
				 					 	_id:req.body.commentId,
				 					 };
									/** comment reported count **/
						 			var comment = {$inc:{reported:1}};
						 			if(body.reported >= 5){
						 				comment.status= 'Delete';
									}
									PostModel.FeedComment.findOneAndUpdate(whereComment,comment).catch(err =>{});
									return apiResponse.successResponse(res,"Successfully reported.");
								});
							}else{
								return apiResponse.unauthorizedResponse(res,"Already reported");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * delete post.
 *
 * @returns {Object}
 */
exports.deletePost = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {
	 					 	userId:req.body.userId,
	 					 	_id:req.body.postId
	 					 };
		 				 PostModel.FeedPost.findOne(whereQ).then((postComment) => {
							if (postComment) {
									var whereQery = {
				 					 	userId:req.body.userId,
				 					 	_id:req.body.postId
				 					 };
									var update = {status:"Delete"};
				 					PostModel.FeedPost.findOneAndUpdate(whereQery,update).
						 			catch(err =>{
						 				return apiResponse.ErrorResponse(res,err);
						 			});
						 			/** delete post saved gallery **/
							 		var whereQ = {userId:req.body.userId,postId:req.body.postId};
		 							PostModel.FeedUserGalary.deleteOne(whereQ).catch(err=>{
		 							});

							    return apiResponse.successResponse(res,"Successfully deleted.");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid post request");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];



/**
 * add post comment turn on and off.
 *
 * @returns {Object}
 */
exports.OwnerPostCommentOnOff = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 		authorization.UserAuth,
 		body("postId").trim().isLength({min:1}).withMessage('PostId must be specified.').custom((value)=>{
	 		return PostModel.FeedPost.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid post id.");
					}
	 		});
 		}),
 		body("commentStatus").isLength({min:1}).trim().withMessage('Comment status must be specified 1, 0.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {userId:req.body.userId,_id:req.body.postId};
		 				 PostModel.FeedPost.findOne(whereQ).then((post) => {
							if (post) {
								/** notification off on**/
								var whereQuery = {userId:req.body.userId,_id:req.body.postId};
								var status = (req.body.commentStatus == 1) ? "On" : "Off";
						 	    var reqData = {commentStatus:req.body.commentStatus};
								PostModel.FeedPost.findOneAndUpdate(whereQuery,reqData).
						 		 catch(err =>{
						 		 	if(err){
								 		return apiResponse.ErrorResponse(res,err);
								 	}
						 		 });
							    return apiResponse.successResponse(res,"Successfully notification "+status+".");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid post owner");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * get chat users.
 *
 * @returns {Object}
 */
exports.getChatUsers=[
	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
	(req,res) =>{
		try{
			 	const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
					var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
		 			var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
		 			var where = {$or:[{userId: new ObjectId(req.body.userId)},{toUserId: new ObjectId(req.body.userId)}]};
	 				//ChatModel.ChatMessage.create({chatId:new ObjectId('60d3154361566c27b837eb70'),userId:new ObjectId(req.body.userId),message:"hello"},function(err,ch){});
	 				ChatModel.Chat.aggregate([
	 						{ "$lookup": {
							    "from": 'users',
							    "let": { "rUserId": "$userId" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$_id","$$rUserId"]},
																{
					                                             "$ne":["$_id",new ObjectId(req.body.userId)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,userId:"$_id",onlineStatus:1,username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
							    ],
							    "as": "fromUser"
							},},
						    { "$lookup": {
							    "from": 'users',
							    "let": { "fUserId": "$toUserId" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$_id","$$fUserId"]},
																{
					                                             "$ne":["$_id",new ObjectId(req.body.userId)]
					                                            },
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,userId:"$_id",onlineStatus:1,username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},
							    ],
							    "as": "toUser"
							}},
				            { "$lookup": {
							    "from": 'chat_messages',
							    "let": { "chId": "$_id" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$chatId","$$chId"]},
																{"$eq":["$deleteStatus","Active"]},
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,messageId:"$_id",messageType:1,lat:1,long:1,mediaId:1,message:1,status:1,userId:1,entryDate:1}},
					 			  { "$lookup": {
								        "from": 'users',
								        "let": { "myId": "$userId" },
								        "pipeline": [

								          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myId"] }] } }},

								          {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},

								        ],"as": "UserInfo"
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
								    {"$sort":{entryDate:-1}},
								    {"$limit":1},  
							    ],
							    "as": "chatMessage"
							}},
							{ "$lookup": {
							    "from": 'chat_messages',
							    "let": { "chId": "$_id" },
							    "pipeline": [
							      { "$match": { "$expr": {
														"$and":[
																{"$eq":["$chatId","$$chId"]},
																{"$eq":["$status",false]},
															]
														}
							      	 		   } 
							      },
					 			  {"$project":{_id:0,messageId:"$_id",message:1,status:1,userId:1,entryDate:1}},
								  {"$group":{"_id":null,"count":{$sum:1}}}
								    
							    ],
							    "as": "unreadChat"
							}},
				    		{ 
						    $match: {
						                $or:[{"userId":new ObjectId(req.body.userId)},
						                	{"toUserId":new ObjectId(req.body.userId)}],
						                $and:[{"activeStatus":"Active"}],
						            }
						     },
				            {$project: {
				                	_id:0,
				                	chatId: "$_id",
				                    userId: 1,
				                    toUserId:1,
				                    fromUser:"$fromUser",
				                    toUser:"$toUser",
				                    chatMessage:"$chatMessage",
				                    unreadChat:"$unreadChat.count",
				             }
				            },
	                        { $skip : skip},
	           			    { $limit : limit},
							]).exec().then(function(data){
								if(data != ""){
								var Responses = [];
								  var arrayLength = data.length;
								  for (var i = 0; i < arrayLength; i++) {
								  	if(data[i].fromUser != ""){
								  		data[i].fromUser = data[i].fromUser;
								  	}else if(data[i].toUser != ""){
								  		data[i].fromUser = data[i].toUser;
								  	}
								  	data[i].toUser="";
								  	if(data[i].unreadChat != ""){
								  		data[i].unreadChat=data[i].unreadChat[0];
								  	}else{
								  		data[i].unreadChat=0;
								  	}
								  	
							      };
							      return apiResponse.successResponseWithData(res,"Successfully listed",data);
								}else{
								  return apiResponse.unauthorizedResponse(res,"Chat not found");
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
 * get chat users.
 *
 * @returns {Object}
 */
exports.getChatMessage=[
	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body("chatId").trim().isLength({min:1}).withMessage('Chat Id must be specified.').custom((value,{req})=>{
	 	return ChatModel.Chat.findOne({$or:[{userId:req.body.userId},{toUserId:req.body.userId}],$and:[{_id:new ObjectId(value),'activeStatus':"Active"}]}).then((chat) =>{
			if (!chat) {
			   return Promise.reject("Invalid chat id or chat deleted.");
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
		 			var where = {$or:[{userId: new ObjectId(req.body.userId)},{toUserId: new ObjectId(req.body.userId)}]};
	 				ChatModel.ChatMessage.aggregate([
					 	    { "$lookup": {
								        "from": 'users',
								        "let": { "myId": "$userId" },
								        "pipeline": [

								          { "$match": { "$expr": { "$and":[{ "$eq": ["$_id", "$$myId"] }] } }},

								          {"$project":{_id:0,userId:"$_id",username:1,fullName:1,profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]}}},

								        ],"as": "UserInfo"
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
				    		{ 
						    $match: {
						                $and:[{"chatId":new ObjectId(req.body.chatId)},{"deleteStatus":"Active"}]
						            }
						     },
				            {$project: {
				                	_id:0,
				                	messageId: "$_id",
				                    userId: 1,
				                    chatId:1,
				                    status:1,
				                    entryDate:1,
				                    message:1,
				                    mediaId:1,
				                    lat:1,
				                    long:1,
				                    messageType:1,
				                    questionId:1,
				                    UserInfo:"$UserInfo",
				                    mediaInfo:"$media",
				             }
				            },
				            {"$sort":{entryDate:-1}},
	                        { $skip : skip},
	           			    { $limit : limit},
							]).exec().then(function(data){

		 					  PackageModel.Question.aggregate([
						 	    { "$lookup": {
									        "from": 'question_options',
									        "let": { "qId": "$_id" },
									        "pipeline": [

									          { "$match": { "$expr": { "$and":[{ "$eq": ["$questionId", "$$qId"] }] } }},

									          {"$project":{_id:0,optionId:"$_id",option:1,questionId:1}},

									        ],"as": "options"
							    }},
							    { "$lookup": {
									        "from": 'pooling_answers',
									        "let": { "qId": "$_id" },
									        "pipeline": [

									          { "$match": { "$expr": { "$and":[{ "$eq": ["$questionId", "$$qId"] },{ "$eq": ["$isRightAnswer", "Yes"] }] } }},

									          {"$project":{_id:1,optionId:1,questionId:1,isRightAnswer:1,points:1,userId:1}},

									        ],"as": "totalAnswered"
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
					                    totalAnswered:"$totalAnswered.length"

					             }
					            },
					            {"$sort":{entryDate:-1}},
					            { $skip : skip},
	           			        { $limit : limit},
								]).exec().then(function(questions){
									var promotions = [];
									if(questions != ""){
										promotions1 = "Hurry up! First to get it right will be awarded "+constants.questionFirstAnswer+" points !";
										promotions2 = "Don't worry! Second place will be awarded "+constants.questionSecondAnswer+" points !";
										promotions.push(promotions1,promotions2);
									}
									var resData = {
										status: 1,
										message: "Successfully listed",
										data: data,
										questions: questions,
										promotions: promotions,
									};
									return res.status(200).json(resData);
								}).catch(function(err){
									return apiResponse.ErrorResponse(res,err);
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
 * delete chat message.
 *
 * @returns {Object}
 */
exports.deleteChatMessage = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("chatId").trim().isLength({min:1}).withMessage('chatId must be specified.').custom((value)=>{
	 		return ChatModel.Chat.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid chat id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		body("messageId").trim().isLength({min:1}).withMessage('Message id must be specified.'),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {
	 					 	userId:req.body.userId,
	 					 	chatId:req.body.chatId,
	 					 	_id:req.body.messageId
	 					 };
		 				 ChatModel.ChatMessage.findOne(whereQ).then((postComment) => {
							if (postComment) {
									var update = {deleteStatus:"Delete"};
				 					ChatModel.ChatMessage.findOneAndUpdate(whereQ,update).
						 			catch(err =>{
						 				return apiResponse.ErrorResponse(res,err);
						 			});
							    return apiResponse.successResponse(res,"Successfully deleted.");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid request");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];


/**
 * delete chat room.
 *
 * @returns {Object}
 */
exports.deleteChatRoom = [
 		auth,
 		body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.').custom((value)=>{
	 		return UserModel.User.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid user id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		authorization.UserAuth,
 		body("chatId").trim().isLength({min:1}).withMessage('chatId must be specified.').custom((value)=>{
	 		return ChatModel.Chat.findOne({_id:new ObjectId(value)}).then((postFeed) =>{
					if (!postFeed) {
						return Promise.reject("Invalid chat id.");
					}else{
						body.feed = postFeed;
					}
	 		});
 		}),
 		(req,res) =>{
 			try{
 				const errors = validationResult(req);
 				if(!errors.isEmpty()){
 					return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
 				}else{
	 					 var whereQ = {$and:[{_id:new ObjectId(req.body.chatId)}],$or:[{userId:new ObjectId(req.body.userId)},{toUserId:new ObjectId(req.body.userId)}]};
		 				 ChatModel.Chat.findOne(whereQ).then((chat) => {
							if (chat) {
									var update = {activeStatus:"Delete"};
				 					ChatModel.Chat.findOneAndUpdate(whereQ,update).
						 			catch(err =>{
						 				return apiResponse.ErrorResponse(res,err);
						 			});
							    return apiResponse.successResponse(res,"Successfully deleted.");
							}else{
								return apiResponse.unauthorizedResponse(res,"Invalid request");
							}
						});
 				}
 			}catch(err){
 				return apiResponse.ErrorResponse(res,err);
 			}
}];

/**
 * add chat request.
 *
 * @returns {Object}
 */
exports.addChatRequest = [
 	// Validate fields.
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body('toUserId').isLength({min:1}).trim().withMessage("ToUserId field is required.").custom((value) => {
			return UserModel.User.findOne({_id :new ObjectId(value)}).then((user) => {
				if (!user) {
					return Promise.reject("Invalid ToUserID.");
				}else{
					body.ToUserDetails = user;
				}
			});
		}),
 	(req,res)=>{
 		try{
 			var errors = validationResult(req);
 			if(!errors.isEmpty()){
 				return apiResponse.validationErrorWithData(res,"Validation Error.",errors.array());
 			}else{
 				if(req.body.toUserID == req.userSession.id){
 					return apiResponse.unauthorizedResponse(res,"You can not send request to your self.");
 				}else if(!body.ToUserDetails.status){
 					return apiResponse.unauthorizedResponse(res,"You can send request only verified user.");
 				}
 				let  findWhere = {userId:new ObjectId(req.body.userId),toUserId:new ObjectId(req.body.toUserId)};
 				ChatModel.Chat.findOne(findWhere).then((isRequest) =>{

 					if(isRequest){
 						if(isRequest.activeStatus == "Pending"){
 							return apiResponse.unauthorizedResponse(res,"Your chat request already is pending.");
 						}else if(isRequest.activeStatus == "Active"){
 							return apiResponse.unauthorizedResponse(res,"You are already chat of this user.");
 						}else if(isRequest.activeStatus == "Reject"){
 							return apiResponse.unauthorizedResponse(res,"Your chat request is rejected.");
 						}else if(isRequest.activeStatus == "Delete"){
 							return apiResponse.unauthorizedResponse(res,"Your chat is deleted.");
 						}
 					}else{
 						let  findWhereOR = {toUserId:new ObjectId(req.body.userId),userId:new ObjectId(req.body.toUserId)};
 						ChatModel.Chat.findOne(findWhereOR).then((isRequestResponse) =>{
 							if(isRequestResponse){
		 						if(isRequestResponse.activeStatus == "Pending"){
		 							return apiResponse.unauthorizedResponse(res,"Your chat request already is pending.");
		 						}else if(isRequestResponse.activeStatus == "Active"){
		 							return apiResponse.unauthorizedResponse(res,"You are already chat of this user.");
		 						}else if(isRequest.activeStatus == "Reject"){
		 							return apiResponse.unauthorizedResponse(res,"Your chat request is rejected.");
		 						}else if(isRequest.activeStatus == "Delete"){
		 							return apiResponse.unauthorizedResponse(res,"Your chat is deleted.");
		 						}
 							}else{
 								let reqData = {
					 					userId:req.body.userId,
					 					toUserId:req.body.toUserId,
					 					activeStatus:"Pending",
					 			};
					 			ChatModel.Chat.create(reqData,function(err,subscribe){
					 				if(err){
					 					return apiResponse.ErrorResponse(res,err);
					 			    }
					 				let reqNofity = {
					 					patternID:"ChatRequest",
					 					userID:req.body.userId,
					 					toUserID:req.body.toUserId,
					 					notificationText: "Chat request invite",
					 					notificationMessage:"sent you chat request",
					 					status:"Pending",
					 					entityID:subscribe._id,
					 				};
					 				UserModel.Notifications.create(reqNofity,function(err){
						 				if(err){
						 					//return apiResponse.ErrorResponse(res,err);
						 				}
					 				});

					 				UserModel.User.findOne({_id :new ObjectId(req.body.userId)}).then((userDetails) => {
											if (userDetails) {
												/** push notification **/
								 				var userMessage = userDetails.username+" sent you chat request";
										 	    var userBadges = 1;
												var userIds = req.body.toUserId;
												var extraParams = {};
												    extraParams.title = 'PlayDate chat request';
										 			extraParams.notificationType = 'CHAT_REQUEST';
										 			extraParams.userId   = userIds;
										 			extraParams.moduleName = 'CHAT';
										 			extraParams.moduleId = subscribe._id;
													extraParams.fromUserId = req.body.userId;
													extraParams.status = true;

												notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
											}
									});

					 				return apiResponse.successResponse(res,"Chat request sent successfully.");
					 			});
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
 * chat request status
 *
 * @returns {Object}
 */

exports.chatRequestUpdateStatus=[
  	//validation fields
 	auth,
 	body("userId").trim().isLength({min:1}).withMessage('UserId must be specified.'),
 	authorization.UserAuth,
 	body("requestID").trim().isLength({min:1}).withMessage("Request id must be specified.").custom((value)=>{
 		return ChatModel.Chat.findOne({_id:new ObjectId(value)}).then((user) =>{
				if (!user) {
					return Promise.reject("Invalid chat request ID.");
				}else{
					body.toRequestDetails = user;
				}
 		});
 	}),
 	body('status').trim().isLength({min:1}).withMessage("Status must be specified Active,Reject."),
 	(req,res)=>{
 		try{ 
	 		const errors = validationResult(req);
	 		if(!errors.isEmpty()){
	 		    return apiResponse.validationErrorWithData(res,"Validation Error.", errors.array());
	 		}else{
					var status = req.body.status;
		 			var query = {_id:new ObjectId(req.body.requestID),toUserId:new ObjectId(req.userSession.id)};
							    	
				    ChatModel.Chat.findOneAndUpdate(query,{activeStatus:req.body.status}).catch(err =>{
		 			});
		 			UserModel.Notifications.findOneAndUpdate({entityID:new ObjectId(req.body.requestID)},{status:"Verified"}).catch(err =>{
		 			});
		 			if(status == "Active"){
		 				let reqNofity = {
						    patternID:"ChatAccepted",
						 	userID:req.userSession.id,
						 	toUserID:body.toRequestDetails.userId,
						 	notificationText: "Chat request accepted",
						 	notificationMessage:"Chat request accepted successfully",
						 	status:"Pending",
						    entityID:req.body.requestID,
						};
						if(body.toRequestDetails.activeStatus == "Pending"){
							UserModel.Notifications.create(reqNofity,function(err){
							});

					 		UserModel.User.findOne({_id :new ObjectId(req.userSession.id)}).then((userDetails) => {
								if (userDetails) {
									/** push notification **/
									var userMessage = userDetails.username+" has been accept your chat request";
									var userBadges = 1;
									var userIds = body.toRequestDetails.userId;
									var extraParams = {};
									    extraParams.title = 'PlayDate chat request';
										extraParams.notificationType = 'CHAT_REQUEST';
										extraParams.userId   = userIds;
										extraParams.moduleName = 'CHAT';
										extraParams.moduleId = req.body.requestID;
										extraParams.fromUserId = req.userSession.id;
										extraParams.status = true;

										notification.sendPushNotifications(userMessage,userIds,extraParams,userBadges);
								}
							});
						}
		 				return apiResponse.successResponse(res,"Chat request accepted successfully.");	
		 			}else{
		 				return apiResponse.successResponse(res,"Chat request rejected successfully.");
		 			}
	 		}
 		}catch(err){
 			return apiResponse.ErrorResponse(res,err);
 		}
 	}
 ];