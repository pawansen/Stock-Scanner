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

