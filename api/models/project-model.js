'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
  id: { type: Number },
  state: { type: Object },
  user: { type: String },
})

const Project = mongoose.model('Project', ProjectSchema)
module.exports = Project
