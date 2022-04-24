const connectToMongo= require('./db');
const express = require('express');
var cors = require('cors')
connectToMongo();
const app = express();
const port = 5000;
app.use(express.json());
app.use(cors())
app.get('/', (req, res) => {
  res.send('carpals backend heyyy')
});

app.use('/api/auth',require('./routes/auth'));
app.use('/api/request',require('./routes/request'));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})