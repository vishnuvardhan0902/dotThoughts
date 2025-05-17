// import expresss module(server)
const exp = require('express')
const app = exp();
const path = require('path');
const cors = require("cors");

// Allow requests from your frontend
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Enable if using cookies or authentication
}));
//deploy react build in server
app.use(exp.static(path.join(__dirname,'../client/build')))
// process.env.
require('dotenv').config()
// import body parser
app.use(exp.json())
// import mongo 
// connection to mongo db server
require('dotenv').config(); // Load environment variables
const mc = require('mongodb').MongoClient;

const uri = process.env.MONGO_URI || '';

mc.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    const thoughtsdb = client.db('dotThoughts');
    const userCollection = thoughtsdb.collection('userCollection');
    const thoughtsCollection = thoughtsdb.collection('thoughtsCollection');

    app.set('userCollection', userCollection);
    app.set('thoughtsCollection', thoughtsCollection);
    
    console.log('DB connection success');
  })
  .catch(err => console.log('Error occurred in DB connection:', err));

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