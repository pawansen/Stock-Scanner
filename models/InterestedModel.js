var mongoose = require("mongoose");

var InterestedSchema = new mongoose.Schema({
	name:{type:String,required:true},
	entryDate:{type: Date, default: Date.now}
});
var InterestedSchema = mongoose.model("interested", InterestedSchema);
module.exports = {Interested:InterestedSchema};