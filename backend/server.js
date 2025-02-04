// import expresss module(server)
const exp = require('express')
const app = exp();
const path = require('path')

//deploy react build in server
app.use(exp.static(path.join(__dirname,'../client/build')))
// process.env.
require('dotenv').config()
// import body parser
app.use(exp.json())
// import mongo 
// connection to mongo db server
const mc = require('mongodb').MongoClient
mc.connect('mongodb://127.0.0.1:27017')
.then(client=>{
    //db object
    const thoughtsdb=client.db('dotThoughts')
    //get collection object
    const userCollection=thoughtsdb.collection('userCollection')
    const thoughtsCollection=thoughtsdb.collection('thoughtsCollection')
    
    //share collection obj with app
    app.set('userCollection',userCollection)
    app.set('thoughtsCollection',thoughtsCollection)
    console.log('db connection success')

})
.catch(err=>console.log('error occered in db connection',err))
// import user-api
const userApp = require('./api/user-api')
// if url is user-api sending the api request to user-api 
app.use('/user-api',userApp)

//for refresh
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})

// handle errors from all api's
app.use((err,req,res,next)=>{
    res.send({message:"Error",payload:err});
})



//connecting to server with port no given in env file or 5000
const port = process.env.PORT||5000
app.listen(port,()=>{console.log("server is running successfully port ",port);
})