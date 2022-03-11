var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var ExchangeSchema = new mongoose.Schema({
	symbol:{type:String,required:false, default:null},
	startTimestamp:{type:String,required:false, default:null},
	endTimestamp:{type:String,required:false, default:null},
	previousClose:{type:String,required:false, default:null},
	chartPreviousClose:{type:String,required:false, default:null},
	dataGranularity:{type:String,required:false, default:null},
	change:{type:String,required:false, default:null},
	timestamps:{type:Array,required:false, default:null},
	closePrice:{type:Array,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});

var ExchangeSchema = mongoose.model("stock-exchange",ExchangeSchema);
module.exports = {Exchange:ExchangeSchema};