var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var UserSchema = new mongoose.Schema({
	fullName:{type:String, required:false, default: null},
	firstName:{type:String, required:false, default: null},
	lastName:{type:String, required:false, default: null},
	address :{type:String, required:false, default: null},
	city :{type:String, required:false, default: null},
	companyName :{type:String, required:false, default: null},
	country :{type:String, required:false, default: null},
	phoneNo :{type:String, required:false, default: null},
	email	:{type:String, required:false, default: null},
	username:{type:String, required:false,default: null},
	password:{type:String, required:false, default: null},
	gender: {type:String,enum: ['Male', 'Female', 'Other', null],default:null},
	birthDate: {type: Date, required:false, default:null},
	age: { type: Number, min: 18,required:false, default:null},
    confirmOTP: {type: String, required:false, default: null},
	otpTries: {type: Number, required:false, default: 0},
	profilePic: {type: String, required: false,default:null},
	businessImage: {type: String, required: false,default:null},
	profilePicPath: {type: String, required: false,default:null},
	profileVideo: {type: String, required: false,default:null},
	profileVideoPath: {type: String, required: false,default:null},
	profileVideoThumb: {type: String, required: false,default:null},
	aboutBio: {type: String, required: false,default:null},
	userType:{type:String,enum: ['Person', 'Business', null],default:null},
	interestedIn:{type:String,default:null},
	deviceType:{type:String,enum: ['Web', 'Android', 'Ios'],default:'Web'},
	status:{type:Boolean, required:true, default:0},/* 0=pending,1=verified,2=block*/
	ipAddress:{type:String, required:false, default:null},
	relationship:{type:String,required:false,default:null},
	personalBio:{type:String, required:false, default:null},
	/*interested:{type:Array, required:false, default:null},
	restaurants:{type:Array, required:false, default:null},*/
	referredByUserId:{type:ObjectId,default: null},
	interested:[{type:ObjectId,default: null}],
	restaurants:[{type:ObjectId,default: null}],
	inviteCode: {type: Number,required:false,unique:true},
	paymentMode:{type: String,required:false, default:0},
	userRoleType: {type:String,required:false,enum: ['User', 'Admin', 'Subadmin'],default:'User'},
	onlineStatus: {type:String,required:false,enum: ['Online', 'Offline', 'Away'],default:'Offline'},
	sourceType:{type:String,enum: ['Direct', 'Facebook', 'Google','Apple','Instagram'],default:'Direct'},
	sourceSocialId:{type:String,required:false,default:null},
	isSocialSignup:{type:String,enum:['Yes','No'],default:'No'},
	isProfile:{type:String,enum:['Pending','Completed'],default:'Pending'},
	lastLoginDate:{type: Date, default: null},
	entryDate:{type: Date, default: Date.now}
});

var UserLoginSession = new mongoose.Schema({
	userID:{type:ObjectId,required:true},
	sessionKey:{type:String,required:true, default:null},
	ipAddress:{type:String,required:false, default:null},
	deviceType:{type:String,enum: ['Web', 'Android', 'Ios'],required:true},
	deviceID:{type:String,required:false, default:null},
	deviceToken:{type:String,required:false, default:null},
	token:{type:String,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});

var UserSocialSubscribers = new mongoose.Schema({
	userID:{type:ObjectId,required:true},
	toUserID:{type:ObjectId,required:true},
	action:{type:String,enum: ['Friend', 'Follow', 'Subscribe', 'Couple', 'Like','Unlike','Report','Block'], default:'Friend'},
	status:{type:String,enum: ['Pending', 'Verified', 'Rejected'], default:'Pending'},
	entryDate:{type:Date,default: Date.now}
});

var Notifications = new mongoose.Schema({
	patternID:{type:String,required:true},/*Welcome,FriendAccepted,Post,Follow,Liked,AddCash,Comment,Friend,Subscribe,Message,Matched,DatePartner,MatchRequest*/
	userID:{type:ObjectId,required:true},
	toUserID:{type:ObjectId,required:true},
	entityID:{type:ObjectId,default:null},
	notificationText:{type:String,required:false, default:null},
	notificationMessage:{type:String,required:false, default:null},
	status:{type:String,enum: ['Pending', 'Verified', 'Rejected', 'Cancelled','Failed','Upcoming','Completed'], default:'Pending'},
	modifiedDate:{type:Date,default: null},
	readStatus:{type:Boolean,required:false, default:0},
	entryDate:{type:Date,default: Date.now}
});

var UserReporting = new mongoose.Schema({
	userId:{type:ObjectId,required:true,ref:'users'},
	toUserId:{type:ObjectId,required:true,ref:'users'},
	action:{type:String,enum: ['Block', 'Report']},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var UserAccount = new mongoose.Schema({
	userId:{type:ObjectId,required:true,ref:'users'},
	totalPoints:{type:Number,default:0},
	currentPoints:{type:Number,default:0},
	gameCoins:{type:Number,default:0},
	dateCoins:{type:Number,default:0},
	dmBooster:{type:Number,default:0},
	multiplayer:{type:Number,default:0},
	exclusiveDiscounts:{type:String,enum: ['Yes', 'No'],default:'No'},
	accessAllGames:{type:String,enum: ['Yes', 'No'],default:'No'},
	updateDate:{type:Date,default: null},
	entryDate:{type:Date,default: Date.now}
});

var UserTransaction = new mongoose.Schema({
	userId:{type:ObjectId,required:true,ref:'users'},
	amount:{type:Number,default:null},
	transactionType:{type:String,enum: ['Cr', 'Dr'],default:'Cr'},
	narration:{type:String,enum: 
		['Deposit Money', 
		'Referral Bonus', 
		'Admin Bonus',
		'Signup Bonus',
		'Coupon Discount',
		'Coupon Purchased',
		'Post Answered',
		'Pooling Answered',
		],default:'Referral Bonus'},
	entityId:{type:ObjectId,default:null},
	paymentGatewayResponse:{type:String,default:null},
	couponDetails:{type:String,default:null},
	referralGetUserId:{type:ObjectId,default:null},
	cuponCode:{type:String,default:null},
	status:{type:Boolean,default:1},
	entryDate:{type:Date,default: Date.now}
});

var CoupleSubscribers = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	toUserId:{type:ObjectId,required:true},
	bio:{type:String,default:null},
	action:{type:String,enum: ['Couple',''], default:'Couple'},
	relationType:{type:String,enum: ['Invite','Friend'], default:'Invite'},
	status:{type:String,enum: ['Pending', 'Verified', 'Rejected', 'Breakup'], default:'Pending'},
	entryDate:{type:Date,default: Date.now}
});

var CreateDatePartner = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	toUserId:{type:ObjectId,required:true},
	action:{type:String,enum: ['Date'], default:'Date'},
	status:{type:String,enum: ['Pending', 'Accepted', 'Rejected', 'Completed' ,'Breakup'], default:'Pending'},
	entryDate:{type:Date,default: Date.now}
});

UserSchema.index({ username:1 });
UserSchema.index({ email:1 });
UserSchema.index({ phoneNo:1 });
var User = mongoose.model("users", UserSchema);
var UserLoginSession = mongoose.model("user_session_login", UserLoginSession);
var UserSocialSubscribers = mongoose.model("user_social_subscribers", UserSocialSubscribers);
var Notifications = mongoose.model("notifications", Notifications);
var UserReporting = mongoose.model("user_reported", UserReporting);
var UserAccount = mongoose.model("user_accounts", UserAccount);
var UserTransaction = mongoose.model("user_transactions", UserTransaction);
var CoupleSubscribers = mongoose.model('partner_subscribers',CoupleSubscribers);
var CreateDatePartner = mongoose.model('create_date_partners',CreateDatePartner);
/*mongoose.set('useFindAndModify', false);*/
module.exports = {
	User:User,
	UserLoginSession:UserLoginSession,
	Notifications:Notifications,
};