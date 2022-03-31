const StockModel = require('../models/StockModel');
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const notification = require("../lib/notification");
const moment = require('moment');
var ip = require("ip");
const MomentDT = moment();
const utility = require("../helpers/utility");
var auth = require("../middlewares/jwt");
var authorization = require("../middlewares/Authorization");
const multer = require('multer');
let path     = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const axios = require('axios').default;
const apiKey = "wquq92e3rm6vROKusWn4m1tzXST8k0cP7n5mZ7vI"
const csvtojson = require('csvtojson');

const nasdaqFile = "./dump/nasdaq_screener_1647424341554.csv";
const nyseFile = "./dump/nasdaq_screener_1647424348570.csv";

/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getExchangeDetails = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{
 				const interval = req.body.interval;
 				const range = req.body.range;
 				const symbols = req.body.symbols;
 				if(symbols != "" && symbols != undefined){
 					var query = {symbol : symbols};		
 				}else{
 					var query = { symbol: { $in: ['^DJI','^IXIC','^GSPC'] } };
 				}
 				
 				var aggre = {symbol:1,startTimestamp:1,endTimestamp:1,previousClose:1,chartPreviousClose:1,change:1,
 					timestamps:1,closePrice:1};
			  StockModel.Exchange.find(query,aggre, function(err, StockList) {
						if(StockList){
							return apiResponse.successResponseWithData(res,"Successfully listed",StockList);    			
						}else{
							return apiResponse.unauthorizedResponse(res,'Record not found');
				    }  
				});
	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];

/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getStocks = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var where = {quoteType: req.body.quoteType};
 				if(req.body.quoteType == "FUTURE"){
 					where.searchType = "future";
 				}else if(req.body.quoteType == "BOND"){
 					where.searchType = "future&bond";
 					where.quoteType = "INDEX";
 				}else if(req.body.quoteType == "PENNY"){
 					where.searchType = "All";
 				  where.quoteType = "EQUITY";
 				  where.marketCurrentPrice = {$lte:5};
 				}else{
 					where.searchType = "All";
 				}

 				console.log(where)

 				var projection = {symbol:1,searchType:1,shortName:1,quoteType:1,stockVisibleType:1,typeDisplay:1,
 					longName:1,exchange:1,fullExchangeName:1,region:1,sector:1,industry:1,volume:1,marketPreviousClosePrice:1,
 					marketChangePrice:1,marketCurrentPrice:1,marketChangePercent:1,marketTime:1,fiftyTwoWeekLowChange:1,fiftyTwoWeekLowChangePercent:1,
 					fiftyTwoWeekRange:1,fiftyTwoWeekHighChange:1,fiftyTwoWeekHighChangePercent:1,fiftyTwoWeekLow:1,fiftyTwoWeekHigh:1};
				StockModel.Stocks.aggregate([
					   {$project:projection },
					   {
		            $match: where,
				     },
				     {$skip : skip},
				     {$limit : 10}
				]).exec().then(function(data){
					if(data.length > 0){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.notFoundResponse(res,"Record not found");
					}
					
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];



/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getTopStocks = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var where = {marketCurrentPrice: {$gt:1000}};
 				where.quoteType = "EQUITY";

 				console.log(where);
 				var projection = {symbol:1,searchType:1,shortName:1,quoteType:1,stockVisibleType:1,typeDisplay:1,
 					longName:1,exchange:1,fullExchangeName:1,region:1,sector:1,industry:1,volume:1,marketPreviousClosePrice:1,
 					marketChangePrice:1,marketCurrentPrice:1,marketChangePercent:1,marketTime:1,fiftyTwoWeekLowChange:1,fiftyTwoWeekLowChangePercent:1,
 					fiftyTwoWeekRange:1,fiftyTwoWeekHighChange:1,fiftyTwoWeekHighChangePercent:1,fiftyTwoWeekLow:1,fiftyTwoWeekHigh:1};
				StockModel.Stocks.aggregate([
					   {$project:projection },
					   {
		            $match: where,
				     },
				     
				     {$skip : skip},
				     {$limit : 10}
				]).exec().then(function(data){
					if(data.length > 0){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.notFoundResponse(res,"Record not found");
					}
					
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getStocksWithTech = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var where = {quoteType: "EQUITY",sector:{$ne:""}};


 				var projection = {symbol:1,sector:1,industry:1,
 					marketCurrentPrice:1,marketChangePercent:1,quoteType:1};
				StockModel.Stocks.aggregate([
					   {$project:projection },
					   {
		            $match: where,
				     },
				     
				     {$skip : skip},
				     {$limit : limit}
				]).exec().then(function(data){
					if(data.length > 0){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.notFoundResponse(res,"Record not found");
					}
					
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.searchStocks = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;
 				var filter = req.body.filter.toUpperCase();
 				var where = {longName: { $regex: '.*' + filter + '.*' } };

 				console.log(where)

 				var projection = {symbol:1,searchType:1,shortName:1,quoteType:1,stockVisibleType:1,typeDisplay:1,
 					longName:1,exchange:1,fullExchangeName:1,region:1,sector:1,industry:1,volume:1,marketPreviousClosePrice:1,
 					marketChangePrice:1,marketCurrentPrice:1,marketChangePercent:1,marketTime:1,fiftyTwoWeekLowChange:1,fiftyTwoWeekLowChangePercent:1,
 					fiftyTwoWeekRange:1,fiftyTwoWeekHighChange:1,fiftyTwoWeekHighChangePercent:1,fiftyTwoWeekLow:1,fiftyTwoWeekHigh:1};
				StockModel.Stocks.aggregate([
					   {$project:projection },
					   {
		            $match: where,
				     },
				     {$skip : skip},
				     {$limit : 10}
				]).exec().then(function(data){
					if(data.length > 0){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.notFoundResponse(res,"Record not found");
					}
					
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


/**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getNewsFeed = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

 				var limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
 				var skip = (req.body.pageNo) ? utility.getOffset(req.body.pageNo) : 0;


 				var projection = {title:1,link:1,pubDate:1,guid:1,content:1,creator:1,
 					contentSnippet:1,contentEncoded:1};
				StockModel.News.aggregate([
				     {$skip : skip},
				     {$limit : 10}
				]).exec().then(function(data){
					if(data.length > 0){
						return apiResponse.successResponseWithData(res,"Successfully listed",data);
					}else{
						return apiResponse.notFoundResponse(res,"Record not found");
					}
					
				}).catch(function(err){
					return apiResponse.ErrorResponse(res,err);
				});

	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];

/**
 * get users list.
 *
 * @returns {Object}
 */

exports.getSymbol = [
 	// Validate fields.
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/v1/finance/trending/US',
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


/**
 * get stock list.
 *
 * @returns {Object}
 */

exports.addYahooStockData = [
 	// Validate fields.
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote',
				  params: {region: 'US',lang:'en',symbols:"AAPL"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


 /**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getFutureStock = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote/marketSummary',
				  params: {lang: "en",region:"US"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					var stockData = [];
					const result = response.data.marketSummaryResponse.result.map((item) => {

										
			        var Symbols = item["symbol"];
			        var Name = item["shortName"];
			        var LastSale = item["regularMarketPreviousClose"].raw
			        var NetChange = item["regularMarketChange"].fmt;
			        var ChangePercentage = item["regularMarketChangePercent"].fmt.substring(0, item["regularMarketChangePercent"].fmt.length - 1);
			        var MarketCap = 0;
			        var Volume = 0;
			        var Sector = null;
			        var Industry = null;
			        var stock = {
			        	'symbol':Symbols,
			        	'shortName':Name,
			        	'longName':Name,
			        	'quoteType':item['quoteType'],
			        	'typeDisplay':item['typeDisp'],
			        	'exchange':item['exchange'],
			        	'fullExchangeName':item['fullExchangeName'],
			        	'region':"US",
			        	'sector':Sector,
			        	'industry':Industry,
			        	'volume':Volume,
			        	'marketCap':MarketCap,
			        	'marketCurrentPrice':LastSale,
			        	'marketPreviousClosePrice':(NetChange > 0) ? Number(LastSale) - Number(NetChange) : Number(LastSale) + Number(NetChange.substring(1)),
			        	'marketChangePrice':NetChange,
			        	'marketChangePercent':ChangePercentage
			        }
			        stockData.push(stock);
					});

					StockModel.Stocks.insertMany(stockData);
					return apiResponse.successResponseWithData(res,"Successfully listed",stockData);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


 /**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getBondsStockList = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote',
				  params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


  /**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getDaytopGainersList = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/ws/screeners/v1/finance/screener/predefined/saved?count=10&scrIds=day_gainers',
				  //params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data.finance.result[0].quotes);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];

   /**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getDaytopLosersList = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/ws/screeners/v1/finance/screener/predefined/saved?count=10&scrIds=day_losers',
				  //params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data.finance.result[0].quotes);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];

    /**
 * get exchange data list.
 *
 * @returns {Object}
 */

exports.getMostActiveStockList = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{

				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/ws/screeners/v1/finance/screener/predefined/saved?count=10&scrIds=most_actives',
				  //params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': apiKey
				  }
				};

				axios.request(options).then(function (response) {
					console.log(response.data);
					return apiResponse.successResponseWithData(res,"Successfully listed",response.data.finance.result[0].quotes);
				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];