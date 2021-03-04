const express = require('express');
const router = express.Router();
const multer = require('multer');
const moveFile = require('move-file');
const fs = require('fs-extra');
const Project = require('../models/project-model');
//const projectFolderPath = '/var/www/neva/www/static/uploads/';
const projectFolderPath = '/Users/viktorkusnir/asyst-visual/static/projects/';

//var async = require("async");


/// Get All Posts ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/projects/:id', (req, res) => {
    try {
    //var token = getToken(req.headers);
    var token = '99999';
  
      console.log('projects post')
  
    if (token) {
      Project.find({'user': req.params.id}, (err, projects) => {
        if (err) {
          res.sendStatus(500)
        } else {
          res.send({success: true, projects: projects})
        }
      }).sort({ _id: 1 })
  
      } else {
        return res.status(403).send({success: false, msg: 'Unauthorized'});
      }
  
      } catch (err) {
        next(err);
      }
  
  })



/// Create New Project  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/add-project', (req, res) => {

  function uniqueIDGenerate(){
    function chr4(){
      return Math.random().toString(16).slice(-4);
    }
    return chr4() + chr4() +
      '-' + chr4() +
      '-' + chr4() +
      '-' + chr4() +
      '-' + chr4() + chr4() + chr4();
  }
  var uniqueID = uniqueIDGenerate();

  const dateandtime = Date.parse(new Date());
  
  console.log('add-project', req.body)

  var lastPostNum;
  var newPost = {};
  newPost.state = req.body.state;
  newPost.user = req.body.user;


  Project.find({}, 'id', (err, projects) => {
    if (err) {
      res.sendStatus(500)
    } else {

      console.log('projects: '+projects);

      if (projects == '') {
        lastPostNum = 0;
      } else {
        var lastPostNumArray = [];
        projects.forEach(function(el) {
          lastPostNumArray.push(el.id)
        });
        lastPostNum = lastPostNumArray[0];

      }

      newPost.id = lastPostNum+1;
      const project = new Project(newPost)
      
      project.save((err, data) => {
        if (err) {
          console.log(err)
          res.send({
            success: false,
            project: data._id,
            message: `Project not saved! Maybe duplicate title error...`
          })
        } else {

          const projectFolder = projectFolderPath+data.id;
          fs.mkdirSync(projectFolder, { recursive: true });

          res.send({
            success: true,
            message: `Project with ID_${data._id} saved successfully!`,
            projectID: data._id
          })
        }
      })
      
    }
  }).sort({ _id: -1 })

})

/// Edit Project  //////////////////////////////////////////
router.put('/project/:id', (req, res) => {
  
  //console.log('req.params.id,: '+req.params.id);
  //console.log('edit: '+JSON.stringify(req.body));

  Project.findById(req.params.id, (err, project) => {
    if (err) {
      console.log(err)
    } else {

      //console.log('edit2: '+project.id);

      if (req.body) {
        project.state = req.body
      }

      //console.log('edit3: '+project.id);

      project.save((err, data) => {
        if (err) {
          console.log(err)
          res.send({
            success: false,
            message: `Project not saved!`
          })
        } else {
          res.send({
            success: true,
            message: `Project with ID_${data._id} saved saved!`,
          })
        }
      })


    }
  })
})

/// File Upload ////////////////////////////////////////////////////////////////////////////////////////////////////////////


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var projectID = req.params.id;
    //('destination ', projectFolderPath+projectID)
    cb(null, projectFolderPath+projectID)
  },
  filename: function (req, file, cb) {
    var filenameHandled = file.originalname.replace(/['" #]+/g, '_');
    cb(null, filenameHandled)
  }
})
 
var upload = multer({ storage: storage })

router.post('/files-project-upload/:id', upload.array('files', 12), (req, res, next) => {
  const files = req.files
  //console.log('req.body: '+JSON.stringify(req.body));
  //console.log('files: '+JSON.stringify(files));
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    res.json({
      success: false,
      message: `Error upload!`
    })
  }
 
  res.json({
    success: true,
    message: `Pictures uploaded!`
  })
  
})

/// Get One Project ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/project/:id', (req, res) => {
  //console.log('get project ', req.params.id)
  //console.log("Cookies: ", req.cookies)
  //var token = getToken(req.headers);
  //console.log ('req.params.id: '+req.params.id);
  var token = '99999';
  if (token) {
    Project.findById(req.params.id, (err, project) => {
      if (err) {
        res.sendStatus(500)
      } else {
        // console.log('get project selectedColor', project.state.selectedColor)
        // console.log('get project imageUploaded', project.state.imageUploaded)
        
        res.send({success: true, project: project})
      }
    })
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized'});
  }
})



/// Delete Project ////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.delete('/delete-project/:id', (req, res) => {


  Project.findById(req.params.id, 'post_num', (err, project) => {
    if (err) {
      console.log(err)
    } else {
      console.log('removed: '+project.post_num) 
      const folder = projectFolderPath+project.post_num;
      fs.remove(folder).then(() => {
        //done
        console.log('removed done') 
      }).catch(err => {
        console.error(err)
      })

    }
  })

  Project.remove({ _id: req.params.id }, err => {
    if (err) {
      res.sendStatus(500)  
    } else {
      res.sendStatus(200)
    }
  })

})


getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;