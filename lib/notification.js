const { constants } = require("../helpers/constants");
const apn  = require('apn');
const FCM = require('fcm-push');
var appRoot  = require('app-root-path');
const UserModel = require('../models/UserModel');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
class Notification{

	/* Notification Constructor */
	constructor() {
	}

	/**
	 * To send android push notifications
	 * @param {string} userDeviceToken
	 * @param {string} userMessage
	 * @param {object} extraParams
	*/
    sendAndroidNotification(callBack,userDeviceToken,userMessage,extraParams = {}){
		
		let fcm = new FCM(constants.fcm_server_key);
		extraParams.userMessage = userMessage;
		extraParams.body = userMessage;
		let message = {
					    to: userDeviceToken, // registration_ids: ['device_Token_1', 'device_Token_2'], Array of device tokens
					    collapse_key: constants.site_name, 
					    data: extraParams,
					    notification:extraParams,
					    priority:"high"
					};
		fcm.send(message, function(err, response){
		    if (err) {
		        console.log("Android notification error",err);
		        return callBack(err, response);
		    } else {
		        console.log("Android notification response",response);
		        return callBack(err, response);
		    }
		});
    }

    /**
	 * To send IOS push notifications
	 * @param {string} userDeviceToken
	 * @param {string} userMessage
	 * @param {integer} userBadges
	 * @param {object} extraParams
	 * @param {integer} expiryTime (Optional - In Seconds)
	 * @param {integer} collapseId (Optional)
	*/
    sendIOSNotification(callBack,userDeviceToken,userMessage,userBadges = 0,extraParams = {},expiryTime = 0,collapseId = ''){
    	let self = this;
    	let options = {
					  token: {
					    key   : appRoot + "/apns/AuthKey_DV2NAKPY5W.p8",
					    keyId : "DV2NAKPY5W",
					    teamId: "3FR26TP83Y",
					  },
					  production: false
					};
		let notificationType  = extraParams.notificationType || "";
    	let apnProvider       = new apn.Provider(options);
    	let note              = new apn.Notification();
    	let notificationSound = "SIMPLE_NOTIFICATION_APP_IN_BACKGROUND.caf";
    	if(expiryTime && expiryTime > 0)
    	{
    		note.expiry = Math.floor(Date.now() / 1000) + parseInt(expiryTime); 
    	}
    	note.badge   = parseInt(userBadges);
    	note.alert   = userMessage;
    	if(collapseId != "")
    	{
    		note.collapseId = collapseId;
    	}
    	note.payload = extraParams;
    	note.sound   = notificationSound;
    	note.topic   = "com.nectar.PlayDate"; // BUNDEL ID

    	apnProvider.send(note, userDeviceToken).then( (result) => {
		  console.log('result',JSON.stringify(result));
		  return callBack(result);
		});
    }

    /**
	 * To send mobile push notifications
	 * @param {string} userMessage
	 * @param {integer} userId
	 * @param {object} extraParams
	 * @param {integer} expiryTime
	*/
	sendPushNotifications(userMessage,userId,extraParams = {},userBadges=0,expiryTime = 0,collapseId = ''){
    			let self   = this; 
    			/* Get User Details */
				UserModel.User.aggregate([
 				    { 
					   $match: {_id:new ObjectId(userId)}
					},
					{
						$lookup:{
							from: "user_session_logins",
							let: {
								uid:"$_id",
						    },
							pipeline:[
								{
									$match:{$expr:{$eq:["$userID","$$uid"]}},
								},
								{$sort:{entryDate:-1}},
								{$limit:1},
								{$project:{_id:0,"id":"$_id",userID:1,entryDate:1,deviceType:1,ipAddress:1,deviceID:1,deviceToken:1}},
							],as:"loginDetails",

						}
					},
					{
						$project: {
						 	_id: 1,
						 	"userId":"$_id",
						 	fullName: 1,
						 	phoneNo: 1,
						 	email: 1,
						 	username: 1,
						 	gender: 1,
						 	paymentMode: 1,
						 	onlineStatus: 1,
						 	inviteCode: 1,
						 	status: 1,
						 	userType: 1,
						 	sourceType: 1,
						 	sourceSocialId: 1,
						 	relationship:1,
						 	profilePic:1,
						 	profilePicPath:{$concat:[constants.baseUrl,"","$profilePicPath"]},
						 	profileVideoPath:{$concat:[constants.baseUrl,"","$profileVideoPath"]},
						 	loginDetails:"$loginDetails"
						}
 					},
 					]).exec().then(function(userResponse){
 						if(userResponse != ""){
 							if(userResponse[0].loginDetails != ""){
 								var deviceLogin = userResponse[0].loginDetails;
 								if(deviceLogin[0].deviceType == "Android"){
 									/** android notification**/
									self.sendAndroidNotification(function(err,androidNotificationResp){
										console.log(androidNotificationResp);
									},deviceLogin[0].deviceToken,userMessage,extraParams);
 								}else{
 									/** ios notification**/
 								    self.sendIOSNotification(function(err,iosNotificationResp){
										console.log(iosNotificationResp);
									},deviceLogin[0].deviceToken,userMessage,userBadges,extraParams,expiryTime,collapseId);
 								}
 							}else{
 								console.log('Invalid User');
    							return;
 							}
 						}else{
 							console.log('Invalid User');
    						return;
 						}
 						
 					}).catch(function(err){
 						console.log('sendPushNotificationsError',err);
    					return;
 					});
  	};

    sendPushNotificationsOLD(userMessage,userId,extraParams = {},expiryTime = 0,collapseId = ''){
    	let self   = this; 

    	/* Get User Details */
    	UserModel.getAllWhere(function(err,userDetails){
    		if(err){
    			console.log('sendPushNotificationsError',err);
    			return;
    		}else{
    			if(userDetails != "" && parseInt(userDetails[0].userEmailVerified) === 1 && parseInt(userDetails[0].isUserBlocked) === 0 && parseInt(userDetails[0].isUserDeactivated) === 0 && parseInt(userDetails[0].isRedFlagBlock) === 0){

    				/* Check membership status */
    				custom.isMembershipActive(function(respType){
    					if(respType === 1)
    					{
    						/* User Badges (Notification Count) */
		    				let userBadges = parseInt(userDetails[0].userBadges);
		    				extraParams.userBadges = userBadges;
		    				console.log('extraParams',extraParams);

		    				/* To get user devices history */
		    				model.getAllWhere(function(err,userDevicesObj){
		    					if(err){
					    			console.log('sendPushNotificationsError',err);
					    			return;
					    		}else{
					    			if(userDevicesObj != ""){
					    				let totalDevices = parseInt(userDevicesObj.length);
					    				if(totalDevices > 0)
					    				{
					    					/* Send notification to users on all logged in devices */
					    					for (var i = 0; i < totalDevices; i++) 
					    					{
					    						/* To get user device type */
					    						let userDeviceType = userDevicesObj[i].userDeviceType;
					    						if(userDeviceType === 'ANDROID'){

					    							/* Send notification on android */
					    							self.sendAndroidNotification(function(err,androidNotificationResp){
					    							},userDevicesObj[i].userDeviceToken,userMessage,extraParams);
					    						}else{
					    							/* Send notification on ios */
					    							self.sendIOSNotification(function(err,iosNotificationResp){
					    							},userDevicesObj[i].userDeviceToken,userMessage,userBadges,extraParams,expiryTime,collapseId);
					    						}
					    					}
					    				}
					    			}else{
					    				/* When user is logged out or didn`t login yet */
					    				console.log('sendPushNotificationsError','User device history not found');
					    			}
					    		}
		    				},constants.users_device_history,{userId:userId});
    					}
    				},userDetails[0].isPaidMembeship,userDetails[0].isFacebookVerified,userDetails[0].isTwitterVerified,userDetails[0].isInstagramVerified,userDetails[0].userRegistrationDate);
    				
    				
    			}else{
    				console.log('sendPushNotificationsError','User details not found');
    			}
    		}
    	},constants.user_details,{userId:userId});
  	};
}

module.exports = new Notification();

/* End of file notification.js */
/* Location: ./lib/notification.js */