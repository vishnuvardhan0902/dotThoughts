const jwt = require('jsonwebtoken');
require('dotenv').config()
function verifyToken(req,res,next){
    //get bearers token from headers of req
    const bearerToken = req.headers.authorization;
    if(!bearerToken){
        return res.send('unauthorized access, login to continue');
    }
    const token = bearerToken.split(' ')[1]
    try{
        jwt.verify(token,process.env.SECRET_KEY)
    }
    catch{
        next(err)
    }
}
module.exports = verifyToken;