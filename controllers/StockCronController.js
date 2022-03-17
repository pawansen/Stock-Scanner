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
 * upload nasdaq data by csv.
 *
 * @returns {Object}
 */

exports.uploadNesdeqData = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{


			csvtojson().fromFile(nasdaqFile).then(source => {
			  
					var stockData = [];
			    for (var i = 0; i < source.length; i++) {
			        var Symbols = source[i]["Symbol"];
			        var Name = source[i]["Name"];
			        var LastSale = source[i]["LastSale"].substring(1);
			        var NetChange = source[i]["NetChange"];
			        var ChangePercentage = source[i]["Change"].substring(0, source[i]["Change"].length - 1);
			        var MarketCap = source[i]["MarketCap"];
			        var Volume = source[i]["Volume"];
			        var Sector = source[i]["Sector"];
			        var Industry = source[i]["Industry"];
			        var stock = {
			        	'symbol':Symbols,
			        	'shortName':Name.replace(/ .*/,''),
			        	'longName':Name,
			        	'quoteType':"EQUITY",
			        	'typeDisplay':"Equity",
			        	'exchange':"NMS",
			        	'fullExchangeName':"NasdaqGS",
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

			    }
			    StockModel.Stocks.insertMany(stockData);
			    return apiResponse.successResponseWithData(res,"Successfully listed",stockData);  
			});
	 		}catch(err){
	 			return apiResponse.ErrorResponse(res,err);
	 		}
 	}
 ];


 /**
 * upload nasdaq data by csv.
 *
 * @returns {Object}
 */

exports.uploadNyseData = [
 	// Validate fields.
 	// timezone America/New York (EST)
 	body("filters").trim(),
 	(req,res)=>{
 		try{


			csvtojson().fromFile(nyseFile).then(source => {
			  
					var stockData = [];
			    for (var i = 0; i < source.length; i++) {
			        var Symbols = source[i]["Symbol"];
			        var Name = source[i]["Name"];
			        var LastSale = source[i]["LastSale"].substring(1);
			        var NetChange = source[i]["NetChange"];
			        var ChangePercentage = source[i]["Change"].substring(0, source[i]["Change"].length - 1);
			        var MarketCap = source[i]["MarketCap"];
			        var Volume = source[i]["Volume"];
			        var Sector = source[i]["Sector"];
			        var Industry = source[i]["Industry"];
			        var stock = {
			        	'symbol':Symbols,
			        	'shortName':Name.replace(/ .*/,''),
			        	'longName':Name,
			        	'quoteType':"EQUITY",
			        	'typeDisplay':"Equity",
			        	'exchange':"NMS",
			        	'fullExchangeName':"NasdaqGS",
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

			    }
			    StockModel.Stocks.insertMany(stockData);
			    return apiResponse.successResponseWithData(res,"Successfully listed",{});  
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

exports.getExchangeDetails = async function(req,res) {

 		try{

						var options = {
						  method: 'GET',
						  url: 'https://yfapi.net/v8/finance/spark',
						  params: {interval: '15m',range:"1d",symbols:'^DJI,^IXIC,^GSPC'},
						  headers: {
						    'x-api-key': apiKey
						  }
						};
						let exchangeArr = ['^DJI','^IXIC','^GSPC'];
							 axios.request(options).then(function (response) {

			            const results = exchangeArr.map((items) => {
				  	 					let exchange = response.data[items];
											var exchangeData =
														{
															symbol: exchange.symbol,
															startTimestamp: exchange.start,
															endTimestamp: exchange.end,
															previousClose: exchange.previousClose,
															chartPreviousClose: exchange.chartPreviousClose,
															dataGranularity: exchange.dataGranularity,
															change: 100 * Math.abs( (exchange.previousClose - exchange.close.slice(-1)[0]) / ( (exchange.previousClose+exchange.close.slice(-1)[0])/2 ) ),
															timestamps: exchange.timestamp,
															closePrice: exchange.close,
											};
											var query = {symbol : exchange.symbol};		
								      StockModel.Exchange.findOne(query, function(err, item) {
								        		if(item){
								        			StockModel.Exchange.findOneAndUpdate(query,exchangeData).catch(err =>{});
								        		}else{
								        			StockModel.Exchange.create(exchangeData,function(err){});
								        		}  
								      });
			    	      });

					  Promise.all(results).then((data) => {
					    return apiResponse.successResponseWithData(res,"Successfully listed",{});
					  });

				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 		}

};


/**
 * get bond forex list.
 *
 * @returns {Object}
 */

exports.getBondForexStock = async function(req,res) {

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
					      //console.log(response.data.quoteResponse.result)


			            const results = response.data.quoteResponse.result.map((items) => {

							            var exchangeData = {
									        	'symbol':items['symbol'],
									        	'shortName':items['shortName'],
									        	'longName':items['shortName'],
									        	'quoteType':items['quoteType'],
									        	'typeDisplay':items['typeDisp'],
									        	'exchange':items['exchange'],
									        	'fullExchangeName':items['fullExchangeName'],
									        	'region':items['region'],
									        	'volume':0,
									        	'marketCap':0,
									        	'marketCurrentPrice':items['regularMarketPrice'],
									        	'marketPreviousClosePrice':items['regularMarketPreviousClose'],
									        	'marketChangePrice':items['regularMarketChange'],
									        	'marketChangePercent':items['regularMarketChangePercent'],
									        	'marketTime':items['regularMarketTime'],
												'fiftyTwoWeekLowChange':items['fiftyTwoWeekLowChange'],
												'fiftyTwoWeekLowChangePercent':items['fiftyTwoWeekLowChangePercent'],
												'fiftyTwoWeekRange':items['fiftyTwoWeekRange'],
												'fiftyTwoWeekHighChange':items['fiftyTwoWeekHighChange'],
												'fiftyTwoWeekHighChangePercent':items['fiftyTwoWeekHighChangePercent'],
												'fiftyTwoWeekLow':items['fiftyTwoWeekLow'],
												'fiftyTwoWeekHigh':items['fiftyTwoWeekHigh'],
												'fiftyDayAverage':items['fiftyDayAverage'],
												'searchType': "future&bond"
									        }
									  
									  var query = {symbol : items['symbol']};		
								      StockModel.Stocks.findOne(query, function(err, response) {
								        		if(response){
								        			StockModel.Stocks.findOneAndUpdate(query,exchangeData).catch(err =>{});
								        		}else{
								        			StockModel.Stocks.create(exchangeData,function(err){});
								        		}  
								      });
			    	      });

					  Promise.all(results).then((data) => {
					    return apiResponse.successResponseWithData(res,"Successfully listed",{});
					  });

				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 		}

};


/**
 * get bond forex list.
 *
 * @returns {Object}
 */

exports.getFutureStock = async function(req,res) {

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

			            const results = response.data.marketSummaryResponse.result.map((items) => {

			            				var Symbols = items["symbol"];
								        var Name = items["shortName"];
								        var LastSale = items["regularMarketPreviousClose"].raw
								        var NetChange = items["regularMarketChange"].fmt;
								        var ChangePercentage = items["regularMarketChangePercent"].fmt.substring(0, items["regularMarketChangePercent"].fmt.length - 1);
								        var MarketCap = 0;
								        var Volume = 0;
								        var Sector = null;
								        var Industry = null;

							            var exchangeData = {
									        	'symbol':Symbols,
									        	'shortName':Name,
									        	'longName':Name,
									        	'quoteType':items['quoteType'],
									        	'typeDisplay':items['typeDisp'],
									        	'exchange':items['exchange'],
									        	'fullExchangeName':items['fullExchangeName'],
									        	'region':"US",
									        	'sector':Sector,
									        	'industry':Industry,
									        	'volume':Volume,
									        	'marketCap':MarketCap,
									        	'marketCurrentPrice':LastSale,
									        	'marketPreviousClosePrice':(NetChange > 0) ? Number(LastSale) - Number(NetChange) : Number(LastSale) + Number(NetChange.substring(1)),
									        	'marketChangePrice':NetChange,
									        	'marketChangePercent':ChangePercentage,
									        	'searchType': "future"
									        }
									  var query = {symbol : Symbols};		
								      StockModel.Stocks.findOne(query, function(err, response) {
								        		if(response){
								        			StockModel.Stocks.findOneAndUpdate(query,exchangeData).catch(err =>{});
								        		}else{
								        			StockModel.Stocks.create(exchangeData,function(err){});
								        		}  
								      });
			    	      });

					  Promise.all(results).then((data) => {
					    return apiResponse.successResponseWithData(res,"Successfully listed future",{});
					  });

				}).catch(function (error) {
					console.error(error);
				});

	 		}catch(err){
	 			console.log(err);
	 		}

};
