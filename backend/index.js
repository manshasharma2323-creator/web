const express=require("express");
const app=express();
app.get("/",(req,res)=>{
    res.send("welcome to get req in  expressjs")
})
app.listen(3000,(error)=>{
    if(error){
        console.log(errror.message)
    }
})
console.log("prodct inserted ")

