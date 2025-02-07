const exp = require('express');
const userApp = exp.Router();
const bcryptjs = require('bcryptjs');
const expressasynchandler=require('express-async-handler');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/TokenVerify')
userApp.use(exp.json());

// middleware for db obj, handles the api request
userApp.use((req,res,next)=>{
    userCollection=req.app.get('userCollection');
    thoughtsCollection = req.app.get('thoughtsCollection');
    next();
})

// register a new user
userApp.post('/signup',async(req,res)=>{
    const newUser = req.body;
    const hashedPassword = await bcryptjs.hash(newUser.password,6)
    newUser.password = hashedPassword;
    const dbUser = await userCollection.findOne({username:newUser.username});
    if (dbUser!=null){
        res.send({
            status:"failed",
            message:'User already exists'
        })
    }
    else{
        const result = await userCollection.insertOne(newUser);
        res.send({
            status:"success",
            message:'User created successfully'
            })
        }

})

//login 
userApp.post('/login',async(req,res)=>{
    const user = req.body;
    const dbUser = await userCollection.findOne({username:user.username});
    if (dbUser==null){
        res.send({
            status:"failed",
            message:'Invalid username'
            })
            }
            else{
                const isValidPassword = await bcryptjs.compare(user.password,dbUser.password);
                if (isValidPassword){
                    const token = jwt.sign({username:dbUser.username},process.env.SECRET_KEY,{
                        expiresIn:'600s'
                        })
                        res.send({
                            status:"success",
                            message:'Logged in successfully',
                            user: user,
                            token:token
                            })
                    }
                else{
                        res.send({
                            status:"failed",
                            message:'Invalid password'
                            })
                    }
                }
})

//get a user
userApp.get('/user/:id',async(req,res)=>{
    const id = req.params.id;
    const dbUser = await userCollection.findOne({username:id});
    if (dbUser==null){
        res.send({
            status:"failed",
            message:'User not found'
            })
            }
            else{
                res.send({
                    status:"success",
                    message:'User found',
                    user: dbUser
                    })
                    }
                    })

//get all thoughts of all users
userApp.get('/thoughts',async(req,res)=>{
    //get all thoughts
    const thoughts = await thoughtsCollection.find({ status: true })
    .toArray();
    console.log(thoughts)
    // sending response
    res.send({
        thoughts
        })
})

//delete a thought
userApp.delete('/delete-thought/:thoughtId',async(req,res)=>{
    const thoughtId = req.params.thoughtId;
    const result = await thoughtsCollection.updateOne({thoughtId:thoughtId},{$set:{status:false}});
    if (result.modifiedCount>0){
        res.send({
            status:"success",
            message:'Thought deleted'
            })
            }
    else{
        res.send({
            status:"failed",
            message:'Thought not found'
            })
    }
        }
)

// API to edit a thought
userApp.put('/edit-thought', async (req, res) => {
    const { thoughtId, description, postImage, username } = req.body;
  
    try {
      // Find the thought by its ID
      const existingThought = await thoughtsCollection.findOne({ thoughtId:thoughtId });
  
      if (!existingThought) {
        return res.status(404).send({
          status: "failed",
          message: "Thought not found"
        });
      }
  
      // Update thought data
      const updatedThought = {
        ...existingThought,
        description: description || existingThought.description,
        postImage: postImage || existingThought.postImage,
        dateOfModification: new Date(),
        username: username || existingThought.username
      };
  
      // Update the thought in the database
      const result = await thoughtsCollection.updateOne(
        { thoughtId: thoughtId },
        { $set: updatedThought }
      );
  
      if (result.modifiedCount > 0) {
        res.send({
          status: "success",
          message: "Thought updated successfully"
        });
      } else {
        res.send({
          status: "failed",
          message: "No changes made"
        });
      }
    } catch (err) {
      console.error('Error updating thought:', err);
      res.status(500).send({
        status: "failed",
        message: "Failed to update thought. Please try again."
      });
    }
  });

//get a thought
userApp.get('/get-thought/:thoughtId',async(req,res)=>{
    const thoughtIdFromUrl = req.params.thoughtId;
    const thoughts = await thoughtsCollection.findOne({thoughtId:thoughtIdFromUrl});
    // sending response
    res.send({
        thoughts
        })
})

//get a thought of a user
userApp.get('/thoughts/:username',async(req,res)=>{
    const usernameFromUrl = req.params.username
    const thoughts = await thoughtsCollection.find({ username : usernameFromUrl, status: true })
    .toArray();
    console.log(thoughts)
    // sending response
    res.send({
        thoughts
        })
})

//user create a thought
userApp.post('/create-thought',async(req,res)=>{
    try{
        const thought = req.body;
        const result = await thoughtsCollection.insertOne(thought);
        res.send({message:'Thought created successfully',res:result}
        );
        }
    catch(err){
        res.send({message:'Error creating thought',err});
        }
    })

// user add comment on a thought

userApp.post('/add-comment/:thoughtId',async(req,res)=>{
    const comment = req.body;
    const thoughtIdFromUrl = req.params.thoughtId;
    const final_result = await thoughtsCollection.updateOne({thoughtId:thoughtIdFromUrl},{$addToSet:{comments:comment}});
    console.log(comment, thoughtIdFromUrl);

    res.send({
        status:"success",
        message:'Comment added successfully'
    });

})

//comments

userApp.get('/get-comments/:thoughtId',async(req,res)=>{
    const thoughtIdFromUrl = req.params.thoughtId;
    const Opinions = await thoughtsCollection.findOne({ thoughtId : thoughtIdFromUrl });
    final_opinions = Opinions.comments
    console.log(final_opinions)
    // sending response
    res.send({
        status: 'success',
        comments : final_opinions
        })
})


//add a like to a thought
userApp.post('/like-thought/:thoughtId', async (req, res) => {
    const { thoughtId } = req.params;
    const { username } = req.body;
    console.log(username)
    await thoughtsCollection.updateOne({ thoughtId: thoughtId }, { $inc: { likes: 1 } });
    await userCollection.updateOne({ username: username }, { $push: { likedThoughtsId: thoughtId } });
    
    res.send({ status: 'success' });
    });

// remove the like of a thought
userApp.post('/unlike-thought/:thoughtId', async (req, res) => {
    try {
        const { thoughtId } = req.params;
        const { username } = req.body;
        // console.log(username)
        if (!username) {
            return res.status(400).send({ message: 'Username is required' });
        }

        await thoughtsCollection.updateOne({ thoughtId: thoughtId }, { $inc: { likes: -1 } });
        const res2 = await userCollection.updateOne(
            { username: username },
            { $pull: { likedThoughtsId: thoughtId } }
        );

        console.log(res2);
        res.send({ status: 'success' });
    } catch (err) {
        console.error('Error unliking thought:', err);
        res.status(500).send({ message: 'Error', payload: err });
    }
});



module.exports=userApp;