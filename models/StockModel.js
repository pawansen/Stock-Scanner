var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var ExchangeSchema = new mongoose.Schema({
	userId:{type:ObjectId,required:true},
	toUserId:{type:ObjectId,required:true},
	status:{type:Boolean,default:1},
	activeStatus:{type:String,enum: ['Active','Delete','Pending','Reject','Block'], default:'Active'},
	entryDate:{type: Date, default: Date.now}
});

var ExchangeSchema = mongoose.model("stock-exchange",ExchangeSchema);
module.exports = {Exchange:ExchangeSchema};