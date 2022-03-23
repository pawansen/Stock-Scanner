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

var StockSchema = new mongoose.Schema({
	symbol:{type:String,required:true},
	searchType:{type:String,required:false, default:"All"},
	shortName:{type:String,required:false, default:null},
	quoteType:{type:String,required:false, default:null},
	typeDisplay:{type:String,required:false, default:null},
	longName:{type:String,required:false, default:null},
	exchange:{type:String,required:false, default:null},
	fullExchangeName:{type:String,required:false, default:null},
	region:{type:String,required:false, default:null},
	sector:{type:String,required:false, default:null},
	industry:{type:String,required:false, default:null},
	volume:{type:String,required:false, default:null},
	marketCap:{type:String,required:false, default:null},
	marketPreviousClosePrice:{type:String,required:false, default:null},
	marketChangePrice:{type:String,required:false, default:null},
	marketCurrentPrice:{type:Number,required:false, default:null},
	marketChangePercent:{type:String,required:false, default:null},
	marketTime:{type:String,required:false, default:null},
	fiftyTwoWeekLowChange:{type:String,required:false, default:null},
	fiftyTwoWeekLowChangePercent:{type:String,required:false, default:null},
	fiftyTwoWeekRange:{type:String,required:false, default:null},
	fiftyTwoWeekHighChange:{type:String,required:false, default:null},
	fiftyTwoWeekHighChangePercent:{type:String,required:false, default:null},
	fiftyTwoWeekLow:{type:String,required:false, default:null},
	fiftyTwoWeekHigh:{type:String,required:false, default:null},
	fiftyDayAverage:{type:String,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});

var StockChartSchema = new mongoose.Schema({
	symbol:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	longName:{type:String,required:false, default:null},
	exchange:{type:String,required:false, default:null},
	region:{type:String,required:false, default:null},
	quoteType:{type:String,required:false, default:null},
	marketPreviousClosePrice:{type:String,required:false, default:null},
	marketChangePrice:{type:String,required:false, default:null},
	marketCurrentPrice:{type:String,required:false, default:null},
	marketChangePercent:{type:String,required:false, default:null},
	marketTimestamps:{type:String,required:false, default:null},
	marketClosePrice:{type:String,required:false, default:null},
	interval:{type:String,required:false, default:null},
	range:{type:String,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});


var StockDescriptionSchema = new mongoose.Schema({
	symbol:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	shortName:{type:String,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});


var NewsSchema = new mongoose.Schema({
	newsId:{type:String,required:false, default:null},
	title:{type:String,required:false, default:null},
	link:{type:String,required:false, default:null},
	pubDate:{type:String,required:false, default:null},
	guid:{type:String,required:false, default:null},
	content:{type:String,required:false, default:null},
	creator:{type:String,required:false, default:null},
	contentSnippet:{type:String,required:false, default:null},
	contentEncoded:{type:String,required:false, default:null},
	entryDate:{type: Date, default: Date.now}
});

StockSchema.index({ symbol:1 },{ unique: true });

var ExchangeSchema = mongoose.model("stock-exchange",ExchangeSchema);
var StocksSchema = mongoose.model("stocks",StockSchema);
var NewsSchema = mongoose.model("news-feed",NewsSchema);
module.exports = {Exchange:ExchangeSchema,Stocks:StocksSchema,News:NewsSchema};