/*
 * Purpose: For database connection 
 * Authur : Pawan Sen
 * Company: Nectar Infotel
*/

var mongoose = require('mongoose');
//var  dotenv	= require('dotenv').config();
mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

const DB = mongoose.connection;