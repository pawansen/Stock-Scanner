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