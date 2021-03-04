const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config')

// Create app
const app = express()

// Install middleware
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors())
app.use(require('./routes/projects'))
app.use(require('./routes/user'))
app.use('/uploads', express.static('/api/uploads'))

mongoose.connect(config.dbURL, config.dbOptions)

mongoose.connection
  .once('open', () => {
    console.log('Mongoose - successful connection ...')
  })
  .on('error', error => console.warn(error))


  // -- export app --
module.exports = {
  path: '/api',
  handler: app
}
