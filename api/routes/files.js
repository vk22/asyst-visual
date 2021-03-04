const express = require('express')
const router = express.Router()
const axios = require('axios')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const util = require('util')
const moveFile = require('move-file')
const config = require('../config/config')
const Jimp = require('jimp')
const orderFolderName = config.orderFolderName


function uniqueIDGenerate () {
  function chr4 () {
    return Math.random().toString(16).slice(-4)
  }
  return chr4() + chr4() +
    chr4() +
    chr4() +
    chr4() +
    chr4() + chr4() + chr4()
}



/// File Upload ////////////////////////////////////////////////////////////////////////////////////////////////////////////

var storage = multer.diskStorage({

  destination: function (req, file, cb) {
    // console.log('storage.file: '+JSON.stringify(file));
    // console.log('storage.params: '+JSON.stringify(req.params));
    console.log('File uploaded', orderFolderName)
    cb(null, orderFolderName)
  },
  filename: function (req, file, cb) {
    console.log('originalname: ' + JSON.stringify(file.originalname))
    var originalnameSplit = file.originalname.split('.')
    var extension = originalnameSplit[originalnameSplit.length - 1]
    var uniqueID = uniqueIDGenerate() + '.' + extension
    cb(null, uniqueID)
  }
})

var upload = multer({ storage: storage }).single('filename')

/// File Upload ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/upload-file', upload, (req, res) => {
  console.log('File uploaded: ', JSON.stringify(req.body.user))

  if (!fs.existsSync(orderFolderName + req.body.user)) {
    fs.mkdirSync(orderFolderName + req.body.user)
  }
  /// Подставляем имя без кавычек
  // var newPath = req.file.destination + req.body.user + '/' + req.body.filenameNoQuotes
  var renamedfilename = req.file.filename
  var filepreviewname = renamedfilename.split('.').slice(0, -1).join('.')

  // var filepreviewname = filepreviewname0.replace(/["']/g,'');
  console.log('req.file.path: ', req.file.path)
  console.log('req.file.filename: ', req.file.filename)

  var oldPath = req.file.path
  var newPath = req.file.destination + req.body.user + '/' + req.file.filename

  fs.rename(oldPath, newPath, function (err) {
    if (err) throw err
    console.log('Successfully renamed - AKA moved!')

    res.json({
      success: true,
      message: 'File is uploaded',
      filename: renamedfilename
    })

  })

})




getToken = function (headers) {

  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ')
    if (parted.length === 2) {
      return parted[1]
    } else {
      return null
    }
  } else {
    return null
  }
}

module.exports = router
