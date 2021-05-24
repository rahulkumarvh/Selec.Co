const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstname: {
        type:String,
        required:true
    },
    lastname: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    role: {
        type: String,
        default: 'customer'
    }
}, { timeStamps: true})


// userSchema.pre("save", async function (next) {

//     // console.log(`the current password is ${this.password}`);
//     this.password = await bcrypt.hash(this.password, 10);
//     // console.log(`the current password is ${this.password}`);
//     next();
// })

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;