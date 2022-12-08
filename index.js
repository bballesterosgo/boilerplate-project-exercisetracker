const express = require('express')
const app = express()
const cors = require('cors')
const { urlencoded } = require('express')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,() =>{
  console.log('Connected DB successfully');
});
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST  TO /api/users username
app.post('/api/users',(req, res ) =>{
  const username = req.body.username;
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
