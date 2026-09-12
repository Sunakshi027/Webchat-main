const multer= require("multer");

const storage=multer.memoryStorage();

const uploade=multer({
    storage,
    limits:{
        fileSize:5 * 1024 * 1024,
    },

    fileFilter:(req, file, cb)=>{
        if(file.mimetype.startsWith("image/")){
            cb(null, true);
        }else{
            cb(new Error("Only Image file is allowed"));
        }
    }
});

module.exports=uploade;