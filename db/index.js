import mongoose from 'mongoose';

export default async function connectMongo(uri){
    try{
        await mongoose.connect(uri)
        console.log("Database connection online")
    }
    catch(err){
        console.log("Database connection failed...")
        console.log(err)
    }
}