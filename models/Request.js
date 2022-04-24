const mongoose = require('mongoose');
const {Schema} =mongoose;
const UserSchema = new Schema({
    userId:{
        type:String,
        required:true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    passengers: {
        type: Number,
        required: true
    },
    vehicleNo: {
        type: String,
        required:true,
    },
    Vehicletype:{
        type:String,
        required:true
    },
    followers:{
        type:Array,
        default:[]
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Request', UserSchema);
