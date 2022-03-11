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