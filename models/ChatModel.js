var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var ChatSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	toUserId:{type:ObjectId,required:true},
	status:{type:Boolean,default:1},
	activeStatus:{type:String,enum: ['Active','Delete','Pending','Reject','Block'], default:'Active'},
	entryDate:{type: Date, default: Date.now}
});
var ChatMessageSchema = new mongoose.Schema({
	chatId:{type:ObjectId,required:true},
	userId:{type:ObjectId,required:true},
	questionId:{type:ObjectId,required:false,default:null},
	message:{type:String,default:null},
	messageType:{type:String,enum: ['question', 'text', 'location', 'media', 'emoji'],default:'text'},
	mediaId:{type:ObjectId,required:false,default:null},
	lat:{type:String,required:false,default:null},
	long:{type:String,required:false,default:null},
	location: {
    type: {
	      type: String, // Don't do `{ location: { type: String } }`
	      enum: ['Point'], // 'location.type' must be 'Point'
	      required: false
	    },
	    coordinates: {
	      type: [Number],
	      required: false
	    }
    },
	status:{type:Boolean,default:0},
	deleteStatus:{type:String,enum: ['Active', 'Delete'], default:'Active'},
	entryDate:{type: Date, default: Date.now}
});
ChatMessageSchema.index({ location: '2dsphere' });
var ChatSchema = mongoose.model("chat",ChatSchema);
var ChatMessageSchema = mongoose.model("chat_message",ChatMessageSchema);
module.exports = {Chat:ChatSchema,ChatMessage:ChatMessageSchema};