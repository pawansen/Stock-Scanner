var mongoose = require("mongoose");

var RestaurantsSchema = new mongoose.Schema({
	name:{type:String,required:false,default:null},
	image:{type:String,required:false,default:null},
	address:{type:String,required:false,default:null},
	lat:{type:String,required:false,default:null},
	long:{type:String,required:false,default:null},
	status:{type:String,enum: ['Open', 'Closed'],default:'Open'},
	openTime:{type:String,required:false,default:null},
	closeTime:{type:String,required:false,default:null},
	imagePath:{type:String,required:false,default:null},
	location: {
    type: {
	      type: String, // Don't do `{ location: { type: String } }`
	      enum: ['Point'], // 'location.type' must be 'Point'
	      required: false
	    },
	    coordinates: {
	      type: [Number],
	      required: false
	    }
    },
	entryDate:{type: Date, default: Date.now}
});
RestaurantsSchema.index({ location: '2dsphere' });
mongoose.set('useFindAndModify', false);
var RestaurantsSchema = mongoose.model("restaurants", RestaurantsSchema);
module.exports = {Restaurants:RestaurantsSchema};