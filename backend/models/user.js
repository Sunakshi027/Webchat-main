const mongoose= require("mongoose");

const userSchema=new mongoose.Schema(
    {
        fullName:{
            type:String,
            required: true,
            trim:true,
        },
        email:{
            type:String,
            required: true,
            unique:true,
            lowercase:true,
            trim:true,
        },

        password:{
             type:String,
             require:true,
        },
        profilePic:{
            type:String,
            
        },

        bio:{
            type:String,
            default:"Hey! I am Using WebChat"
        },

        isOnline:{
            type:Boolean,
            default:false,
        },
    },
    {
        timestamps:true,
    }
);
module.exports=mongoose.model("User", userSchema)