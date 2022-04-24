const mongoose=require('mongoose');
const mongoURI="mongodb://localhost:27017/Carpals?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"

const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("connected successfully with mongo");
    })

}

module.exports=connectToMongo;