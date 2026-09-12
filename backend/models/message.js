const mongoose=require("mongoose");

const messaheSchema= new mongoose.Schema(
    {
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        text:{
            type:String,
            default:"",
            trim:true,

        },
        image:{
            type:String,
            default:"",
        },
        seen:{
          type:Boolean,
          default:false,
          isRead: {
  type: Boolean,
  default: false,
},

isFavourite: {
  type: Boolean,
  default: false,
},
}
    },
   {
    timestamps:true,
   }
)

module.exports=mongoose.model("Message", messaheSchema);