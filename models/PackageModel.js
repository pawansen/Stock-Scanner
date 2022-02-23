var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var PackagesSchema = new mongoose.Schema({
	packageType:{type:String,enum: ['Silver', 'Gold', 'Diamond', 'Platinum'], default:'Silver'},
	name:{type:String,required:true},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var PackagesDescriptionSchema = new mongoose.Schema({
	packageId:{type:ObjectId,required:true},
	packageDescription:{type:String,required:true},
	packageValue:{type:String,required:true}
});

var CouponSchema = new mongoose.Schema({
	couponType:{type:String,enum: ['Flat', 'Percentage'], default:'Percentage'},
	couponTitle:{type:String,required:false,default:null},
	couponDescription:{type:String,required:false,default:null},
	couponImage:{type:String,required:false,default:null},
	couponCode:{type:String,required:false,default:null},
	couponAmountOf:{type:String,required:false,default:null},
	newPrice:{type:String,required:false,default:null},
	awardedBy:{type:String,enum: ['Level', 'Game Winner','Game Loser'], default:'Level'},
	awardlevelValue:{type:String,required:false,default:null},
	freeItem:{type:String,required:false,default:null},
	couponValue:{type:Number,required:false,default:0},
	couponPurchasePoint:{type:Number,required:false,default:0},
	couponValidTillDate:{type:Date,required:false,default:null},
	userId:{type:ObjectId,required:false,default:null,ref:'users'},
	restaurantId:{type:ObjectId,required:false,default:null,ref:'restaurants'},
	status:{type:String,enum: ['Active', 'Inactive','Expired','Deleted'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var PurchaseCouponSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:false,default:null,ref:'users'},
	couponId:{type:ObjectId,required:false,default:null,ref:'coupons'},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var FaqSchema = new mongoose.Schema({
	question:{type:String,required:false,default:null},
	answer:{type:String,required:false,default:null},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var QuestionSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:false,default:null,ref:'users'},
	question:{type:String,required:false,default:null},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});
var QuestionOptionSchema = new mongoose.Schema({
	questionId:{type:ObjectId,required:false,default:null,ref:'questions'},
	option:{type:String,required:false,default:null},
	isRightAnswer:{type:String,enum: ['Yes', 'No'], default:'No'},
	entryDate:{type:Date,default: Date.now}
});

var PoolingAnswersSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:true,default:null,ref:'users'},
	questionId:{type:ObjectId,required:true,default:null,ref:'questions'},
	chatId:{type:ObjectId,required:false,default:null,ref:'chats'},
	optionId:{type:ObjectId,required:true,default:null},
	isRightAnswer:{type:String,enum: ['Yes', 'No'], default:'No'},
	points:{type:Number,required:false,default:0},
	entryDate:{type:Date,default: Date.now}
});

var StoreSchema = new mongoose.Schema({
	storeType:{type:String,enum: ['Game Coins', 'Date Coins', 'Multiplier Boosters', 'DM Boosters', 'One Time Purchase'], default:'Game Coins'},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var StoreItemSchema = new mongoose.Schema({
	storeId:{type:ObjectId,required:true},
	storeItemMultiValue:{type:Array, default:null},
	value:{type:Number,required:false,default:0},
	amount:{type:String,required:false,default:0},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var PackagesSchema = mongoose.model("packages", PackagesSchema);
var PackagesDescriptionSchema = mongoose.model("package_descriptions", PackagesDescriptionSchema);
var CouponSchema = mongoose.model("coupons", CouponSchema);
var PurchaseCouponSchema = mongoose.model("purchase_coupons", PurchaseCouponSchema);
var FaqSchema = mongoose.model("faqs", FaqSchema);
var QuestionSchema = mongoose.model("questions", QuestionSchema);
var QuestionOptionSchema = mongoose.model("question_options", QuestionOptionSchema);
var PoolingAnswersSchema = mongoose.model("pooling_answers", PoolingAnswersSchema);
var StoreSchema = mongoose.model("stores", StoreSchema);
var StoreItemSchema = mongoose.model("store_items", StoreItemSchema);
module.exports = {
	Package:PackagesSchema,
	PackageDescription:PackagesDescriptionSchema,
	Coupon:CouponSchema,
	PurchaseCoupon:PurchaseCouponSchema,
	Faq:FaqSchema,
	Question:QuestionSchema,
	QuestionOption:QuestionOptionSchema,
	PoolingAnswersSchema:PoolingAnswersSchema,
	Store:StoreSchema,
	StoreItem:StoreItemSchema,
};