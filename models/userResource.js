const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user")

let userResourceSchema = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    resource :{
        type: String,
        required: true,
    },
    link :{
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})
 
UserResource = mongoose.model("UserResource", userResourceSchema);
module.exports = UserResource;