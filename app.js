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
/* To set port */
app.set('port', process.env.PORT || 3100);

/*app.use(helmet());

app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());*/

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
app.use(express.static('public'));

/** listen server **/
server.listen(app.get('port'),function(){
	console.log(`Stock Scanner listening on port ${app.get('port')}`);
	loggerMessage.info(`Stock Scanner listening on port ${app.get('port')}`);
});

app.use("/api/", apiRouter);

/*throw 404 if URL not found*/
/*app.all("*", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});*/
app.get("/", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

/** chat module **/

app.get("/chat", function(req, res) {
	res.render('index.ejs');
});

/** socket connection**/
//io.adapter(redis({ host: 'localhost', port: 6379 }));
io.sockets.on('connection',function(socket){
	const Socket = require('./controllers/ChatController.js'); 
	console.log('----------- Socket Connection --------------');
	socket.on('chat_message', function(data){
	    io.sockets.emit('chat_message', data);
	});
	socket.on('chat_message_ios', function(data){
	    socket.emit('chat_message_ios', data);
	});
	new Socket(socket,io.sockets);
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = (app);