'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  picture: { type: String },
  confirmkey: { type: String },
})

// UserSchema.methods.validPassword = function (password) {
//   return bcrypt.compareSync(password, this.passwordHash)
// }

// UserSchema.virtual('password').set(function (value) {
//   console.log('virtual ', value)
//   this.passwordHash = bcrypt.hashSync(value, 12)
// })

// UserSchema.methods.comparePassword = function (passw, cb) {
//   console.log('compare: ' + passw, this.passwordHash)
//   bcrypt.compare(passw, this.passwordHash, function (err, isMatch) {
//     if (err) {
//       console.log('UserSchema.methods.comparePassword error')
//       return cb(err)
//     }

//     cb(null, isMatch)
//   })
// }

const User = mongoose.model('User', UserSchema)
module.exports = User
