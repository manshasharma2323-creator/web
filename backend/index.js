//get ke through data insert ho skta h?
//get (post)
//built in middleware and user defined
//special method having three parameters(req,res,next) = middleware
//middleware error handler(error, req,res,next)
const express = require('express');
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json);

const logger = (req,res,next) => {
  console.log(`you access method : ${req.method} URL:$ {req.url} at ${new Date().toIS}`);
  next();
}
app.use(logger);
app.get('/product',(req,res)=>{
  res.send("welcome to express js")
})
//query string - localhost:3000/product?pid=100&pname=mobile
app.get('/product',(req,res)=>{
  const {pid,pname} = req.query;
  
  res.status(200).json({pid,pname});
  console.log("product inserted");
});
//post me - url parameter use hoga (query string nhi use hogi)
// app.post('/',(req,res)=>{
//   const pid = req.body.pid;
//   const pname = req.body.pname;
//   res.status(200).json({pid,pname});
//   console.log("product inserted through post");
// });

// app.put('/',(req,res)=>{
//   res.send('welcome to put request');
// });
// app.delete('/',(req,res)=>{
//   res.send('welcome to delete request');
// });

app.listen(3000,(err)=>{
  if(err){
    console.log(err.message);
  }
});