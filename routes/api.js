var express = require("express");
var authRouter = require('./auth');
var adminRouter = require('./admin');
var webAuthRouter = require('./webAuth');

var app = express();

app.use('/user/',authRouter);
app.use('/admin/',adminRouter);
app.use('/webAuth/',webAuthRouter);
module.exports = app;