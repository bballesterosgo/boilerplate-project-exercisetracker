const express = require("express");
const app = express();
const cors = require("cors");
const { urlencoded } = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, () => {
  console.log("Connected DB successfully");
});

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
  },
  { versionKey: false }
);

const User = mongoose.model("user", userSchema);

const exerciseEchema = mongoose.Schema({
  username : String,
  description : String,
  duration : Number,
  date : String,
  userId: String,
},
{ versionKey: false }
);

const Exercise = mongoose.model('Exercise', exerciseEchema);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//GET resquest to /api/users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
})

//POST  to /api/users username
app.post("/api/users", async (req, res) => {
  const username = req.body.username;

  const foundUser = await User.findOne({ username });

  if(foundUser){
    res.json(foundUser);
  }

  const user = await User.create({
    username,
  });

  res.json(user);
});

//POST to /api/users/:_id/exercises

app.post('/api/users/:_id/exercises',async (req, res) => {

  const userId = req.body[":_id"];
  let { description,duration,date } = req.body;

  //Search user name
  const foundUser = await User.findById(userId);
  if(!foundUser){
    res.json({ message: "No user exists for that id" });
  }

  if(!date){
    date = new Date();
  }else{
    date = new Date(date);
  }

  const exercise = await Exercise.create({
    username: foundUser.username,
    description,
    duration,
    date,
    userId
  });

  res.json({
    username: foundUser.username,
    description,
    duration,
    date: date.toDateString(),
    _id: userId
  });
});

//GET to /api/users/:_id/logs
// Puedes añadir parámetros from, to y limit a una petición GET /api/users/:_id/logs para recuperar parte del log de cualquier usuario. from 
//y to son fechas en formato yyyy-mm-dd. limit es un número entero de cuántos logs hay que devolver.

app.get('/api/users/:_id/logs', async (req, res) =>{

  let { from, to, limit } = req.query;

  const userId = req.params._id;

  const foundUser = await User.findById(userId); 

  if(!foundUser){
    res.json({ message: "No user exists for that id" });
  }
  let filter = { userId};
  let dateFilter =  {};
  if(from){
      dateFilter['$gte'] = new Date(from);
  }
  if(to){
    dateFilter['$gte'] = new Date(to);
  }

  if(from || to){
    filter.date = dateFilter;
  }

  if(!limit){
    limit = 100;
  }

  let exercises = await Exercise.find(filter).limit(limit);
  exercises = exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),

    }
  });

  res.json({
    username: foundUser.username,
    count: exercises.length,
    _id: userId,
    log: exercises
  });



  res.send(userId);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
