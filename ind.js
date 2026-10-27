//get ke through data insert ho skta h?
//get (post)
//built in middleware and user defined
//special method having three parameters(req,res,next) = middleware
//middleware error handler(error, req,res,next)
const express = require('express');
const app = express();
const path = require("path");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
const logger = (req,res,next) => {
  console.log(`You accessed method: ${req.method} URL: ${req.url} at ${new Date().toISOString()}`);
  next();
}
//app.use(logger);
app.get('/',(req,res,next)=>{
  if(req.query.valid){
    return next()
  }
  res.status(400).json({"error:":"not a valid user"})
},
(req,res)=>{
  res.send("welcome to node js")
})
//query string - localhost:3000/product?pid=100&pname=mobile
app.get('/product',logger,(req,res)=>{
  const {pid,pname} = req.query;
  
  res.status(200).json({pid,pname});
  console.log("product inserted");
});


app.listen(3000,(err)=>{
  if(err){
    console.log(err.message);
  }
});