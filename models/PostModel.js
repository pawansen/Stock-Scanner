var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var MediaSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	section:{type:String, required:true},
	sectionPath:{type:String, required:true},
	entityId:{type:ObjectId,required:false, default:null},
	mediaName:{type:String,required:true},
	mediaThumbName:{type:String,required:false, default:null},
	MediaSize:{type:String,required:false, default:null},
	mediaExt:{type:String,required:false, default:null},
	mediaType:{type:String,enum: ['Image', 'Video', 'Audio'], default:'Image'},
	status:{type:String,enum: ['Active', 'Inactive'], default:'Active'},
	entryDate:{type:Date,default: Date.now}
});

var FeedSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	mediaId:{type:ObjectId,required:false,default:null},
	postCaption:{type:String,required:false},
	postContent:{type:String,required:false},
	tagFriend:[{type:ObjectId,default: null}],
	location:{type:String,required:false},
	coordinates: {type:String,required:false,default: null},
	postType:{type:String,enum: ['Normal', 'Memory','Question'], default:'Normal'},
	privacy:{type:String,enum: ['Public', 'Private', 'Friends'], default:'Public'},
	status:{type:String,enum: ['Active', 'Inactive', 'Delete'], default:'Active'},
	notifyStatus:{type:String,enum: ['On', 'Off'], default:'On'},
	modifyDate:{type:Date,default: null},
	likes:{type:Number,required:false,default:0},
	comments:{type:Number,required:false,default:0},
	commentStatus:{type:Boolean,required:false,default:1}, /* 1= ON 0= OFF */
	tag:{type:String,required:false,default:null},
	colorCode:{type:String,required:false,default:null},
	emojiCode:{type:String,required:false,default:null},
	tag:{type:String,required:false,default:null},
	entryDate:{type:Date,default: Date.now}
});

var FeedLike = new mongoose.Schema({
	postId:{type:ObjectId,required:true,ref:'feed_posts'},
	userId:{type:ObjectId,required:true,ref:'users'},
	status:{type:String,enum: ['Like', 'Unlike'], default:'Like'},
	entryDate:{type:Date,default: Date.now}
});

var FeedComment = new mongoose.Schema({
	postId:{type:ObjectId,required:true,ref:'feed_posts'},
	userId:{type:ObjectId,required:true,ref:'users'},
	comment:{type:String,required:false},
    parentCommentId:{type:ObjectId,required:false,ref:'feed_comments'},
    status:{type:String,enum: ['Active', 'Delete'], default:'Active'},
    reported:{type:Number,required:false,default:0},
	entryDate:{type:Date,default: Date.now}
});

var FeedCommentReport = new mongoose.Schema({
	postId:{type:ObjectId,required:true,ref:'feed_posts'},
	userId:{type:ObjectId,required:true,ref:'users'},
	commentId:{type:ObjectId,required:true,ref:'feed_comments'},
	entryDate:{type:Date,default: Date.now}
});

var FeedUserGalary = new mongoose.Schema({
	postId:{type:ObjectId,required:true,ref:'feed_posts'},
	userId:{type:ObjectId,required:true,ref:'users'},
	mediaId:{type:ObjectId,required:true,ref:'media'},
	galleryType:{type:String,enum: ['PostUpload', 'PostSaved'], default:'PostUpload'},
	entryDate:{type:Date,default: Date.now}
});

var FeedNotifyconfiguration = new mongoose.Schema({
	postId:{type:ObjectId,required:true,ref:'feed_posts'},
	userId:{type:ObjectId,required:true,ref:'users'},
	status:{type:String,enum: ['On', 'Off'], default:'On'},
	entryDate:{type:Date,default: Date.now}
});

FeedSchema.index({coordinates: '2dsphere'});

var Media = mongoose.model("media",MediaSchema);
var FeedPost = mongoose.model("feed_posts",FeedSchema);
var FeedLike = mongoose.model("feed_likes",FeedLike);
var FeedComment = mongoose.model("feed_comments",FeedComment);
var FeedUserGalary = mongoose.model("feed_user_galleries",FeedUserGalary);
var FeedCommentReport = mongoose.model("feed_comment_report",FeedCommentReport);

module.exports = {
	Media:Media,
	FeedPost:FeedPost,
	FeedLike:FeedLike,
	FeedComment:FeedComment,
	FeedUserGalary:FeedUserGalary,
	FeedCommentReport:FeedCommentReport
};