const express = require('express')
const router = express.Router()
const User = require('../models/user-model')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require('../config/config')
/// Create New User  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/register', (req, res) => {
  console.log('register ', req.body)

  if (req.body.username !== undefined && !req.body.password !== undefined) {
    // eslint-disable-next-line no-inner-declarations
    function uniqueIDGenerate () {
      function chr4 () {
        return Math.random().toString(16).slice(-4)
      }
      return chr4() + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() +
        '-' + chr4() + chr4() + chr4()
    }
    var uniqueID = uniqueIDGenerate()

    var newUser = new User({
      id: uniqueID,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })

    // save the user
    newUser.save(function (err) {
      if (err) {
        return res.json({ success: false, msg: 'Username already exists.' })
      }
      res.json({ success: true, msg: 'Successful created new user.' })
    })
  }
})

router.post('/checkemail', (req, res) => {
  console.log('checkemail', req.body)

  var email = req.body.email

  if (email != undefined) {
    User.findOne({ email: email }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        console.log('user ', user)

        if (!user) {
          res.send({
            success: false,
            message: 'No user found with that email address.'
          })
        } else {
          function uniqueIDGenerate () {
            function chr4 () {
              return Math.random().toString(16).slice(-4)
            }
            return chr4() + chr4() +
                  '' + chr4() +
                  '' + chr4() +
                  '' + chr4() +
                  '' + chr4() + chr4() + chr4()
          }

          const confirmkey = uniqueIDGenerate()

          user.confirmkey = confirmkey

          user.save((err, data) => {
            if (err) {
              console.log(err)
            } else {
              sendConfirmLinkToNewUser(email, confirmkey).catch(console.error)

              res.send({
                success: true,
                message: 'Mail with reset link was sent on this email'
              })
            }
          })
        }
      }
    })
  }
})

router.post('/checkconfirmkey', (req, res) => {
  var confirmkey = req.body.confirmKey
  console.log('confirmkey', confirmkey)

  User.findOne({ confirmkey: confirmkey }, function (err, user) {
    if (err) {
      console.log(err)
    } else {
      console.log('user checkconfirmkey', user)

      if (!user) {
        res.send({
          success: false,
          message: 'No user found with that confirmkey.'
        })
      } else {
        res.send({
          success: true,
          message: 'Found that confirmkey'
        })
      }
    }
  })
})

async function sendConfirmLinkToNewUser (email, confirmkey) {
  const account = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'warnuggetsswap@gmail.com',
      pass: 'wearerippers2019'
    }
  })

  const mailOptions = {
    from: '"Pinery" <hello@pinery.tv>', // sender address
    to: email, // list of receivers
    subject: 'Reset your password', // Subject line
    html: `<a href="http://pinery.tv/reset-password?key=${confirmkey}">Click here to change your password</a>` // html body
  }

  const info = await transporter.sendMail(mailOptions)
}

/// Edit User  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.put('/edituser', (req, res) => {
  console.log('edituser ', req.body)

  if (req.body.username != undefined && !req.body.password != undefined) {
    User.findOne({ username: req.body.username }, 'username usergroup email password', function (err, user) {
      if (err) {
        console.log(err)
      } else {
        if (req.body.username) {
          user.username = req.body.username
        }

        if (req.body.usergroup) {
          user.usergroup = req.body.usergroup
        }

        if (req.body.email) {
          user.email = req.body.email
        }

        if (req.body.email) {
          user.email = req.body.email
        }

        if (req.body.password) {
          user.password = req.body.password
        }

        user.save((err, data) => {
          if (err) {
            console.log(err)
            res.send({
              success: false,
              message: 'user not saved!'
            })
          } else {
            res.send({
              success: true,
              message: `user with ID_${data._id} saved!`
            })
          }
        })
      }
    })
  }
})

/// Edit User  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.put('/editpass', (req, res) => {
  console.log('editpass ', req.body)

  if (req.body.password != undefined) {
    User.findOne({ confirmkey: req.body.confirmkey }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        if (req.body.password) {
          user.password = req.body.password
          user.confirmkey = ''
        }

        user.save((err, data) => {
          if (err) {
            console.log(err)
            res.send({
              success: false,
              message: 'new password not saved!'
            })
          } else {
            res.send({
              success: true,
              message: 'new password saved!'
            })
          }
        })
      }
    })
  }
})

router.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  console.log('login ', username, password)

  if (!username || !password) return res.status(400).json({ type: 'error', message: 'email and password fields are essential for authentication.' })

  User.findOne({ username: username }, function (err, user) {
    if (err) {
      console.log(err)
    } else {
      console.log('user login', user.passwordHash, password)

      bcrypt.compare(password, user.passwordHash, (error, result) => {
        if (error) return res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' + req.body.password })
        if (result) {
          res.json({
            success: true,
            message: 'User logged in.',
            user: { username: user.username, email: user.email, id: user._id, port: user.port },
            token: jwt.sign({ username: user.username, email: user.email, id: user._id, port: user.port }, config.jwtToken, { expiresIn: '7d' })
          })
        } else return res.status(403).json({ type: 'error', message: 'Password is incorrect.' })
      })
    }
  })

})

/// Get All Subscribes ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/getuser', (req, res) => {
  //console.log('getuser ', req.headers)
  // User.find({}, function (err, user) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     console.log('user getuser', user)
  //     // var user = user[0]
  //     if (user) {
  //       res.json({ success: true, user: user })
  //     } else {
  //       res.json({ success: false, user: false })
  //     }
  //   }
  // })
  const token = req.headers.authorization.substring(7)
  //console.log('token ', token)

  jwt.verify(token, config.jwtToken, (error, result) => {
    if (error) return res.status(403).json({ type: 'error', message: 'Provided token is invalid.', error })
    return res.json({
      success: true,
      message: 'Provided token is valid.',
      user: result
    })
  })
})

router.post('/checkuser/', function (req, res) {
  // console.log('register-activate')
  var username = req.body.username
  var email = req.body.email
  // console.log('checkuser', sub, username, picture, email )

  User.findOne({ email: email }, function (err, user) {
    if (err) {
      console.log(err)
    } else {
      // var user = user[0]
      // console.log('user ', user)
      if (user !== '' && user != undefined) {
        res.json({ success: true, user: user })
      } else {
        res.json({ success: false, user: false })
      }
    }
  })
})

router.put('/update-user-comment/', function (req, res) {
  // console.log('register-activate')
  var newUser = req.body.user
  console.log('newUser', newUser)

  User.findOne({ username: newUser.username }, function (err, user) {
    if (err) {
      console.log(err)
    } else {
      if (newUser.comment) {
        user.comment = newUser.comment
      }
      // save the user
      user.save(function (err) {
        if (err) {
          console.log(err)
        }
        res.json({ success: true, msg: 'Successful updated user.' })
      })
    }
  })
})

router.put('/update-user-uploads/', function (req, res) {
  // console.log('register-activate')
  var newUser = req.body.user
  console.log('newUser', newUser)

  User.findOne({ username: newUser.username }, function (err, user) {
    if (err) {
      console.log(err)
    } else {
      if (newUser.uploads) {
        user.uploads.push(newUser.uploads)
      }
      if (newUser.comment) {
        user.comment = newUser.comment
      }
      // save the user
      user.save(function (err) {
        if (err) {
          console.log(err)
        }
        res.json({ success: true, msg: 'Successful updated user.' })
      })
    }
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
