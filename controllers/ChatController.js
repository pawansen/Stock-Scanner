const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const PackageModel = require('../models/PackageModel');
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const moment = require('moment');
var ip = require("ip");
const MomentDT = moment();
const utility = require("../helpers/utility");
//var auth = require("../middlewares/jwt");
//var authorization = require("../middlewares/Authorization");
const multer = require('multer');
let path     = require('path');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
//var io = require("../app.js").io;
const secret = process.env.JWT_SECRET;
var userSession = {};
class Socket {
	 constructor(socket,io) {
	 		var self = this;

	 		/**
			 * To manage user online
			 * @param {integer} userId
			 * @param {integer} token
			*/
	 		socket.on("online",function(userData){
	 			var auth = self.authorizationAuth(userData.token);
	 			if(userSession != ""){
	 				if(userData.userId == userSession.id){
	 					socket.userId = userSession.id;
	 					UserModel.User.findOneAndUpdate({_id:new ObjectId(userSession.id)},{onlineStatus:"Online"})
	 					.then(()=>{
	 						io.emit("Data",{status:1,"message":"Successfully updated."});
	 					}).catch(err=>{
	 						io.emit("Data",{status:0,"message":"Failed updated."});
	 					});
	 				}else{
	 					io.emit("Data",{status:0,"message":"Invalid userId."});
	 				}
	 			}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}

	 		});

	 		/**
			 * To manage user status
			 * @param {integer} userId
			 * @param {integer} token
			*/
	 		socket.on("user_status",function(userData){
	 			if(userSession != ""){
					UserModel.User.findOne({_id:new ObjectId(userData.userId)})
						.then((RecordsDetails)=>{
						if(RecordsDetails != null){
							userData.status = RecordsDetails.onlineStatus;
							userData.username = RecordsDetails.username;
						 	io.emit("user_status",userData);
						}else{
						 	io.emit("Data",{status:0,"message":"Invalid user."});
						}
					});
	 			}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}

	 		});

	 		/**
			 * To manage user offline
			 * @param {integer} userId
			*/
	 	    socket.on("disconnect",function(userData){
	 			UserModel.User.findOneAndUpdate({_id:new ObjectId(socket.userId)},{onlineStatus:"Offline"})
	 			.then(()=>{
	 				io.emit("Data",{status:1,"message":"Successfully updated."});
	 			}).catch(err=>{
	 				io.emit("Data",{status:0,"message":"Failed updated."});
	 			});
	 		});

	 	    /**
			 * To manage user typing
			 * @param {integer} userId
			*/
			socket.on("typing",function(typingRequest){
				ChatModel.Chat.findOne({_id:new ObjectId(typingRequest.chatId)})
					.then((Records)=>{
					if(Records != null){
					 	io.emit("typing",typingRequest);
						io.to(typingRequest.chatId).emit("typing",typingRequest);
					}else{
					 	io.emit("Data",{status:0,"message":"Invalid chat room user."});
					}
				});
			});

	 	    /**
			 * To manage user chat room
			 * @param {integer} userId
			*/
			socket.on("chat_room",function(requestData){
				var auth = self.authorizationAuth(requestData.token);
				if(userSession != ""){
	 				if(requestData.userId == userSession.id){
	 					socket.id = userSession.id;
		            	var where = {
			                "userId":new ObjectId(requestData.userId),
			                "toUserId": new ObjectId(requestData.toUserId),
			                "activeStatus": "Active",
			            }
					    ChatModel.Chat.aggregate([
					     {
			             	$match: where,
					     },
						 {$lookup:{
						 	from:"users",
						 	localField:"userId",
						 	foreignField:"_id",
						 	as: "fromUsers"
						 }},
						 {
					        $unwind: {
					                path: "$fromUsers",
					                preserveNullAndEmptyArrays: false
					            }
					     },
					    {$lookup:{
						 	from:"users",
						 	localField:"toUserId",
						 	foreignField:"_id",
						 	as: "toUsers",
						 }},
						 {
					        $unwind: {
					                path: "$toUsers",
					                preserveNullAndEmptyArrays: false
					            }
					     },
					    {
					      	$project: {
					      		_id: 0,chatId: "$_id",userId:1,toUserId:1,status:1,
					      		"fromUsername":"$fromUsers.username",
					      		"fromFullName":"$fromUsers.fullName",
					      		"fromProfilePicPath":{$concat:[constants.baseUrl,"","$fromUsers.profilePicPath"]},
					      		"toUsername":"$toUsers.username",
					      		"toFullName":"$toUsers.fullName",
					      		"toProfilePicPath":{$concat:[constants.baseUrl,"","$toUsers.profilePicPath"]},
						     }
						},
					]).exec().then(function(data){
						if(data == ""){
							ChatModel.Chat.aggregate([
							     {
					             	$match: {
							                "userId":new ObjectId(requestData.toUserId),
							                "toUserId": new ObjectId(requestData.userId),
							                "activeStatus": "Active",
							                },
							     },
								 {$lookup:{
								 	from:"users",
								 	localField:"userId",
								 	foreignField:"_id",
								 	as: "fromUsers"
								 }},
								 {
							        $unwind: {
							                path: "$fromUsers",
							                preserveNullAndEmptyArrays: false
							            }
							     },
							    {$lookup:{
								 	from:"users",
								 	localField:"toUserId",
								 	foreignField:"_id",
								 	as: "toUsers",
								 }},
								 {
							        $unwind: {
							                path: "$toUsers",
							                preserveNullAndEmptyArrays: false
							            }
							     },
							    {
							      	$project: {
							      		_id: 0,chatId: "$_id",userId:1,toUserId:1,status:1,
							      		"fromUsername":"$fromUsers.username",
							      		"fromFullName":"$fromUsers.fullName",
							      		"fromProfilePicPath":{$concat:[constants.baseUrl,"","$fromUsers.profilePicPath"]},
							      		"toUsername":"$toUsers.username",
							      		"toFullName":"$toUsers.fullName",
							      		"toProfilePicPath":{$concat:[constants.baseUrl,"","$toUsers.profilePicPath"]},
								     }
								},
							]).exec().then(function(data){
								if(data == ""){
									ChatModel.Chat.create({userId:requestData.userId,toUserId:requestData.toUserId},function(err,chatRoom){
			 						socket.join(chatRoom._id);
									//console.log(socket.rooms);
									console.log(" rooms display");
									UserModel.User.findOne({_id:new ObjectId(requestData.userId)})
					 					.then((userRecords)=>{
					 						if(userRecords != null){
												var fromUser={chatId:chatRoom._id,userId:requestData.userId,username:userRecords.username,fullName:userRecords.fullName,profilePic:constants.baseUrl+userRecords.profilePicPath};
					 							io.emit('chat_room',fromUser);
					 							io.in(chatRoom._id).emit('chat_room', fromUser);
					 						}else{
					 							io.emit('error',"Error in user response.");
					 						}
					 					});
			 						});
								}else{
									var fromUser={chatId:data[0].chatId,userId:data[0].userId,username:data[0].fromUsername,fullName:data[0].fromFullName,profilePic:data[0].fromProfilePicPath};
									var toUser = {chatId:data[0].chatId,userId:data[0].toUserId,username:data[0].toUsername,fullName:data[0].toFullName,profilePic:data[0].toProfilePicPath};
									socket.join(data[0].chatId);
									//console.log(socket.rooms);
									//console.log(" rooms display");
									if(data[0].userId == requestData.userId){
									    io.emit('chat_room',fromUser);
									    io.in(data[0].chatId).emit('chat_room', fromUser);
									}else if(data[0].toUserId == requestData.userId){
										io.emit('chat_room',toUser);
										io.in(data[0].chatId).emit('chat_room', toUser);
										/*io.in(data[0].chatId).emit('message', { user: user.name, text: message });*/
									}else{
										io.emit('error',"Error in create room.");
									}
								}
							}).catch(function(err){
								io.emit('error',"Socket Error.");
								console.log(err);
							});
						}else{
							var fromUser={chatId:data[0].chatId,userId:data[0].userId,username:data[0].fromUsername,fullName:data[0].fromFullName,profilePic:data[0].fromProfilePicPath};
							var toUser = {chatId:data[0].chatId,userId:data[0].toUserId,username:data[0].toUsername,fullName:data[0].toFullName,profilePic:data[0].toProfilePicPath};
							socket.join(data[0].chatId);
							//console.log(socket.rooms);
							//console.log(" rooms display");
							if(data[0].userId == requestData.userId){
							    io.emit('chat_room',fromUser);
							    io.in(data[0].chatId).emit('chat_room', fromUser);
							}else if(data[0].toUserId == requestData.userId){
								io.emit('chat_room',toUser);
								io.in(data[0].chatId).emit('chat_room', toUser);
							}else{
								io.emit('error',"Error in create room.");
							}
							/** check all rooms in socket**/
							/*console.log(socket.rooms);*/
						}
					}).catch(function(err){
						io.emit('error',"Socket Error.");
						console.log(err);
					});
	 				}else{
	 					io.emit("Data",{status:0,"message":"Invalid userId."});
	 				}
	 			}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}
			});

	 	    /**
			 * To manage user chat message
			 * @param {integer} userId
			*/
			socket.on('chat_message_room',function(messageData){
				if(userSession != ""){
					var chatId = messageData.chatId;
					var userId = messageData.userId;
					var mediaId = messageData.mediaId;
						ChatModel.Chat.findOne({_id:new ObjectId(chatId)})
					 		.then((Records)=>{
					 			if(Records != null){
									var chat={
									    chatId:messageData.chatId,
										userId:messageData.userId,
										messageType:messageData.messageType,
									};
									if(messageData.messageType == 'text' || messageData.messageType == 'emoji'){
										chat.message = messageData.message;
									}
									if(mediaId != "" && messageData.messageType == 'media'){
										chat.mediaId = messageData.mediaId;
									}
									if(messageData.messageType == 'location' && messageData.lat != "" && messageData.long != ""){
										let coordinates = [messageData.lat,messageData.long];
										chat.lat = messageData.lat;
										chat.long = messageData.long;
										chat.location = {
													    "type" : "Point",
													    "coordinates" : coordinates
												        };	
										if(mediaId != ""){
											chat.mediaId = messageData.mediaId;
										}
									}
					 			    ChatModel.ChatMessage.create(chat,function(err,chatRoom){
					 			    	console.log(err);
					 			    	chat.messageId = chatRoom._id;
					 			    	chat.username = messageData.username;
					 			    	messageData.messageId = chatRoom._id;
						 			    if(mediaId != ""){
											PostModel.Media.findOne({_id:new ObjectId(mediaId)})
						 					.then((mediaRecords)=>{
						 						if(mediaRecords != null){
							 						messageData.mediaType = mediaRecords.mediaType;
							 						messageData.section = mediaRecords.section;
							 						messageData.mediaFullPath = constants.baseUrl+""+mediaRecords.sectionPath+"/"+mediaRecords.mediaName;
							 						messageData.mediaFullPathThumb = constants.baseUrl+""+mediaRecords.mediaThumbName;
						 						}
						 						io.emit('chat_message_room',messageData);
			 						   			io.in(messageData.chatId).emit('chat_message_room', messageData);	
						 					});
										}else{
											io.emit('chat_message_room',messageData);
			 						   		io.in(messageData.chatId).emit('chat_message_room', messageData);	
										}
			 						});
					 			}else{
					 			  io.emit("Data",{status:0,"message":"Invalid chat room user."});
					 		    }
					 	});
				}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}
			});

		    /**
			 * To manage user chat message read
			 * @param {integer} userId
			*/
			socket.on('chat_message_read',function(messageData){
				if(userSession != ""){
					var chatId = messageData.chatId;
					var userId = messageData.userId;
				    var message = {$set:{status:true}};
					ChatModel.ChatMessage.update({status:false,chatId:new ObjectId(chatId),userId:new ObjectId(userId)}
					,message,{ multi: true }).then((update)=>{
						io.emit("Data",{status:0,"message":"Chat message update."});
					}).catch(err =>{
						io.emit("Data",{status:0,"message":"Error in chat message update."});
					});
				}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}
			});

		    /**
			 * question answer
			 * @param {integer} userId
			*/
			socket.on("chat_question_answer",function(messageData){
				if(userSession != ""){
					var questionId = messageData.questionId;
					var userId = messageData.userId;
					var chatId = messageData.chatId;
					var optionId = messageData.optionId;
					var answer = {
						userId : messageData.userId,
						chatId : messageData.chatId,
						questionId : messageData.questionId,
						optionId : messageData.optionId,
					};
					PackageModel.QuestionOption.findOne({questionId:new ObjectId(questionId),_id:new ObjectId(optionId)}).then((answerResponse)=>{
						if(answerResponse){
							answer.isRightAnswer = answerResponse.isRightAnswer;
							if(answerResponse.isRightAnswer == "Yes"){
								PackageModel.PoolingAnswersSchema.find({questionId:new ObjectId(questionId),userId:new ObjectId(userId)}).limit(1).sort({entryDate:-1}).then((questionData)=>{
									if(questionData == ""){
										PackageModel.PoolingAnswersSchema.find({questionId:new ObjectId(questionId),isRightAnswer:"Yes"}).limit(2).sort({entryDate:-1}).then((poolingAnswer)=>{
											if(poolingAnswer != ""){
													var totalRecords = poolingAnswer.length;
													if(totalRecords == 1){
														messageData.points = constants.questionSecondAnswer;
														answer.points = constants.questionSecondAnswer;
														messageData.answerOrder = totalRecords+1;
													}else{
														messageData.answerOrder = totalRecords+1;
														answer.points = 0;
														messageData.points = 0;
													}
													messageData.isRightAnswer = answerResponse.isRightAnswer;
													PackageModel.PoolingAnswersSchema.create(answer,function(err,response){
														io.emit("chat_question_answer",messageData);
													});

						 						    /** question answer get points **/
													let userAccounts ={
														$inc:{totalPoints:answer.points,currentPoints:answer.points}
												    };
								 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userId)},userAccounts).catch(err =>{});
													/** question answer transaction **/
													let UserTransactions ={
														userId:userId,
														amount:answer.points,
														transactionType:"Cr",
														narration:"Pooling Answered",
														entityId:questionId
													};
													UserModel.UserTransaction.create(UserTransactions,function(err){});	

											}else{
												messageData.isRightAnswer = answerResponse.isRightAnswer;
												messageData.points = constants.questionFirstAnswer;
												messageData.answerOrder = 1;
												answer.points = constants.questionFirstAnswer;
												console.log(answer);
												PackageModel.PoolingAnswersSchema.create(answer,function(err,response){
													io.emit("chat_question_answer",messageData);
												});
						 						    /** question answer get points **/
													let userAccounts ={
														$inc:{totalPoints:constants.questionFirstAnswer,currentPoints:constants.questionFirstAnswer}
												    };
								 					UserModel.UserAccount.findOneAndUpdate({userId:new ObjectId(userId)},userAccounts).catch(err =>{});
													/** question answer transaction **/
													let UserTransactions ={
														userId:userId,
														amount:constants.questionFirstAnswer,
														transactionType:"Cr",
														narration:"Pooling Answered",
														entityId:questionId
													};
													UserModel.UserTransaction.create(UserTransactions,function(err){});
											}
										});
									}else{
										io.emit("Data",{status:0,"message":"You have already answered this question."});
									}
								});
							}else{
								PackageModel.PoolingAnswersSchema.find({questionId:new ObjectId(questionId),userId:new ObjectId(userId)}).limit(1).sort({entryDate:-1}).then((questionData)=>{
									if(questionData == ""){
										messageData.isRightAnswer = answerResponse.isRightAnswer;
										messageData.points = 0;
										messageData.answerOrder = 0;
										answer.points = 0;
										PackageModel.PoolingAnswersSchema.create(answer,function(err,response){
											io.emit("chat_question_answer",messageData);
										});
									}else{
										io.emit("Data",{status:0,"message":"You have already answered this question."});
									}
								});
							}
						}else{
							io.emit("Data",{status:0,"message":"Invalid option."});
						}
					});

				}else{
	 				io.emit("Data",{status:0,"message":"Authentication failed."});
	 			}	
			});
	 		
	 }
	/**
	* To check user login
	* @param {string}  authorization
	*/
	authorizationAuth(token){
		jwt.verify(token, secret, (err, user) => {
		    if (err) {
		        return 1;
		    }else{
		        userSession = user;
		        return 0;
		    }
		});
		return true;
	}
}

module.exports = Socket;