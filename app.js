/*
 * Purpose: Running node.js and initialize. 
 * Authur : Pawan Sen
*/

const app 							= require('express')();
      express 						= require('express');
      bodyParser 					= require('body-parser');
      multer						= require('multer');
      session 						= require('express-session');
      server						= require('http').createServer(app);
      io 							= require('socket.io')(server);
      helmet                        = require("helmet");
      redis              			= require('socket.io-redis');
const { check, validationResult } 	= require('express-validator');
const loggerMessage = require("./lib/logger").log;
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var path = require("path");
require("dotenv").config();
var mongoose = require('mongoose');
var apiResponse = require("./helpers/apiResponse");
var apiRouter = require('./routes/api');
const axios = require('axios').default;
/* To set port */
app.set('port', process.env.PORT || 3100);

const PORT = process.env.PORT || 3100

/* To handle invalid JSON data request */
app.use(bodyParser.json({limit: '50mb'}));

/* For parsing urlencoded data */
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));

/** mongodb connection**/
var MONGODB_URL = process.env.MONGO_URL;
mongoose.connect(MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() =>{
	console.log("Connected to %s", MONGODB_URL);
	console.log("App is running ... \n");
}).catch(err=>{
	console.error("App starting error:", err.message);
	process.exit(1);
})
var db = mongoose.connection;
/* To handle invalid JSON data request */

app.use((err, req, res, next) =>{
	console.log(err);
	let jsonErrorResponse = {};
	  	jsonErrorResponse.code = 400;
  	    jsonErrorResponse.response = {};
  	    jsonErrorResponse.status = 0;
  	    jsonErrorResponse.message = 'Invalid JSON request';
  	if(err.status === 400)
    return res.send(jsonErrorResponse);
    return next(err);
});

app.use(function(req,res,next){
	/*CORS headers*/
	loggerMessage.info(req.originalUrl);
	loggerMessage.info(req.body);
	var responseSettings = {
		"AccessControlAllowOrigin": req.headers.origin,
		"AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
		"AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
		"AccessControlAllowCredentials": true
	};
		// Set custom headers for CORS
	res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
	res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
	res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
	res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);
	if ('OPTIONS' == req.method) {
		res.send(200).end();
	}
	else {
		next();
	}

});


/** set upload directory **/
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/public'));

/** listen server **/
server.listen(app.get('port'),function(){
	console.log(`Stock Scanner listening on port ${app.get('port')}`);
	loggerMessage.info(`Stock Scanner listening on port ${app.get('port')}`);
});

app.get("/forex", function(req, res) {

   res.render('forex.ejs');
	
});

app.get("/futures", function(req, res) {

   res.render('futures.ejs');
	
});

app.get("/insider", function(req, res) {

   res.render('insider.ejs');
	
});

app.get("/map", function(req, res) {

   res.render('map.ejs');
	
});

app.get("/relative-performance", function(req, res) {

   res.render('relative_performance.ejs');
	
});




app.get("/", function(req, res) {

				var optionsBond = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote',
				  params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': 'wquq92e3rm6vROKusWn4m1tzXST8k0cP7n5mZ7vI'
				  }
				};

				var optionsFuture = {
				  method: 'GET',
				  url: 'https://yfapi.net/v6/finance/quote/marketSummary',
				  params: {lang: "en",region:"US"},
				  headers: {
				    'x-api-key': 'wquq92e3rm6vROKusWn4m1tzXST8k0cP7n5mZ7vI'
				  }
				};


				var options = {
				  method: 'GET',
				  url: 'https://yfapi.net/ws/screeners/v1/finance/screener/predefined/saved?count=10&scrIds=day_gainers',
				  //params: {lang: "en",region:"US",symbols:"^IRX,^FVX,^TNX,^TYX"},
				  headers: {
				    'x-api-key': 'wquq92e3rm6vROKusWn4m1tzXST8k0cP7n5mZ7vI'
				  }
				};

				axios.request(options).then(function (response) {

					axios.request(optionsFuture).then(function (responseFuture) {


				axios.request(optionsBond).then(function (responseBond) {
				
						res.render('index.ejs',
							{ "stockList": response.data.finance.result[0].quotes,
							  "futures": responseFuture.data.marketSummaryResponse.result,
							  "forexBond":responseBond.data.quoteResponse.result,
							  "message":"",
						      }
							);


				}).catch(function (error) {
					console.error(error);
				});

					}).catch(function (error) {
						console.error(error);
					});
					

				}).catch(function (error) {
					console.error(error);
				});
	
});

app.use("/api/", apiRouter);

/*throw 404 if URL not found*/
// app.get("/", function(req, res) {
// 	return apiResponse.notFoundResponse(res, "Page not found");
// });



/** socket connection**/
//io.adapter(redis({ host: 'localhost', port: 6379 }));
// io.sockets.on('connection',function(socket){
// 	const Socket = require('./controllers/ChatController.js'); 
// 	console.log('----------- Socket Connection --------------');
// 	socket.on('chat_message', function(data){
// 	    io.sockets.emit('chat_message', data);
// 	});
// 	socket.on('chat_message_ios', function(data){
// 	    socket.emit('chat_message_ios', data);
// 	});
// 	new Socket(socket,io.sockets);
// });

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = (app);