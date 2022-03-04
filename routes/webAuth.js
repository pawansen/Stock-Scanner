var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require('moment');
var ip = require("ip");
const UserModel = require('../models/UserModel');
var mongoose = require('mongoose');
const multer = require('multer');
let path     = require('path');
var fs = require('fs');
var ObjectId = mongoose.Types.ObjectId;
const utility = require("../helpers/utility");
const { constants } = require("../helpers/constants");
const notification = require("../lib/notification");
const MomentDT = moment();
// Handling user signup
router.post("/register", function (req, res) {
    

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
						console.log(users);
						UserModel.User.create(users,function(err){
							if(err){
								console.log(err);
								 res.render("index.ejs",{'message':err});
							}else{
								UserModel.User.findOne({email:req.body.email,phoneNo:req.body.phoneNo}).then(userResponse =>{
									
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
											 res.render("index.ejs",{'message':err});
										}
										res.redirect("/")
										//return res.render("index.ejs",{"message":"Successfully Register"});
									});
							   });
							}
						});
	});

});


router.post("/login", function (req, res) {

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

										//return apiResponse.successResponseWithData(res,"Successfully login.", userData);
										res.render("profile.ejs",{'message':"Successfully login"});
									});
 								}else{
 									//return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");
 									res.redirect("/")
 								}
 							});
 						}else{
 							//return apiResponse.unauthorizedResponse(res,"Invalid login credentials.");	
 							res.redirect("/")
 						}
 					}).catch(function(err){
 						res.redirect("/")
 					});
});

module.exports = router;