<template>
    <div class="upload-form">

      <div class="form-group cover-dropzone" v-bind:class="{ 'active': coverNeed}">
          <vue-dropzone ref="myVueDropzone2" id="dropzone2" :options="dropzoneOptionsCover" v-on:vdropzone-file-added="coverAdded" @vdropzone-complete="afterComplete"></vue-dropzone>
      </div>
      <!-- <div v-if="order.picture.url != undefined">
        <img v-bind:src="order.picture.url" class="img-thumbnail">
      </div> -->

    </div>

</template>

<script>

import Dropzone from 'nuxt-dropzone'
import 'nuxt-dropzone/dropzone.css'

// import { SVG } from '@svgdotjs/svg.js'
// import '@svgdotjs/svg.draggable.js'

export default {
  middleware: ['auth'],
  name: 'PostsPage',
  components: {
    vueDropzone: Dropzone,
    modal: {
      template: '#modal-template',
      methods: {
        async deleteOrder () {
          await this.$axios.$delete('orders/'+this.$route.params.id)
          //await PostsService.deleteOrder(this.$route.params.id)
          this.$router.push({
            name: 'Orders'
          })
        }
      }
    }
  },
  data () {
    return {
      svgId: "svgContainer",
      order: {
        picture: {
            format: '',
            data: ''
        },
      },
      coverNeed: true,
      user: undefined,
      isShow: true,
      formDataCover: '',
      checkFileResponse: true,
      errorWithSave: undefined,
      fileIsAdded: false,
      fileLoading: false,
      uploadPercentage: 0,
      uploadingState: undefined,
      uploadingStateOnChange: false,
      dropzoneOptions: {
        autoProcessQueue: false,
        url: 'localhost',
        maxFilesize: 50,
        uploadMultiple: false,
        maxFiles: 1,
        timeout: 180000,
        dictDefaultMessage: 'Drop your file here',
        acceptedFiles: 'audio/aiff, audio/flac, audio/wav, audio/aif',
        addRemoveLinks: true,
        accept: function (file, done) {
          // console.log('accept: '+file);
          if (file.type != 'audio/aiff') {
            done('Error! Files of this type are not accepted')
          } else { done() }
        },
        init: function () {
          this.on('maxfilesreached', function (file) {
            // console.log('maxfilesreached: '+file);
            this.removeAllFiles()
            // this.addFile(file);
          })
        }
      },
      dropzoneOptionsCover: {
        autoProcessQueue: false,
        url: 'localhost',
        maxFilesize: 50,
        uploadMultiple: false,
        maxFiles: 1,
        timeout: 180000,
        dictDefaultMessage: 'Выберите файл (.jpg, .png) или перетащите его сюда',
        acceptedFiles: 'image/*',
        addRemoveLinks: true,
        accept: function (file, done) {
          // console.log('accept: '+file);
          if (file.type != 'image/*') {
            done('Error! Files of this type are not accepted')
          } else { done() }
        },
        init: function () {
          this.on('maxfilesreached', function (file) {
            // console.log('maxfilesreached: '+file);
            this.removeAllFiles()
            // this.addFile(file);
          })
        }
      },
      uploadDisabled: 1,
      isOpen: false,
      filesAdded: [],
      filesAddedCount: 0,
      mapAttr: {
          viewBoxWidth: 830,
          viewBoxHeight: 536
      },
      svgContainer: undefined,
      pathArr: [],
      path: undefined,
      pathPointsArr: [],
      pathPoints: '',
      pathExist: false,
      circleArr: [],
      startCircle: undefined,
      canDrawPath: false,
      canEndPath: false,
    }
  },
  beforeRouteLeave (to, from, next) {
    //this.checkIfOrderEmpty()
    clearInterval(this.t)
    next()
  },
  watch: {
    mousePos: function (val) {
      this.path.attr({'d': this.pathPoints+'L'+val.x+ ''+val.y, fill: '#f06'})
    },
  },
  methods: {

    async fileUpload () {
      // console.log('response ', this.$auth.user.id)
      this.formDataCover.append('user', 77777)
      this.fileLoading = true; 
      const response = await this.$axios.$post('/upload-file/', this.formDataCover, {

        onUploadProgress: function (progressEvent) {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }.bind(this)
 
      })

      if (response.success === true) {
        this.uploadDisabled = 1
        //console.log('response: '+response.message);
        this.file = response.filename
        // this.saveFile (response.filename)
      } else if (response.success === false) {
        //console.log('response: '+response.message);
      }
      
    },
    removeAllFiles () {
      // console.log('removeAllFiles!')
      this.$refs.myVueDropzone.removeAllFiles()
      this.track.filename = ''
      this.fileIsAdded = false
      this.fileInDropzone = 0
      this.acceptDisabled = 0
      this.uploadDisabled = 1
      this.filesAdded = []
      this.filesAddedCount = 0
    },
    afterComplete (file) {
      this.filesAdded.push(file)
      //this.filesAddedCount = this.filesAdded.length
    },
    fileDrop() {
        this.fileLoading = true; 
        //console.log('fileDrop', this.fileLoading)
    },
    async coverAdded (file) {

      console.log('coverAdded ', JSON.stringify(file))
      console.log('file.type: '+file.type);

      var reader  = new FileReader();
      var url;
      var _this = this;
      
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        
        url = reader.result;
        console.log('')
        _this.order.picture.url = url;
        _this.coverNeed = false;
        
        let im = new Image;
        im.src = url;
        im.onload = () => {
            var imageData = {
            url: url,
            width: im.width,
            height: im.height,
            ratio:  im.width/im.height
          }
          console.log('imageData ', imageData)
          _this.$store.commit('setImageOriginal', imageData)
          _this.$store.commit('setImageCurrent', imageData)
        };
      }

      var formDataCover = new FormData()
      formDataCover.append('filename', file)
      this.formDataCover = formDataCover;

      this.pictureExist = 1;

      setTimeout(() => {
          // this.generateMap()
          this.$store.commit('setImageExist', true)
      }, 200);
      

    }
  },
  mounted () {
    //this.checkIfUserAuth()
    //this.getUserA(this.username)


    setTimeout(function () {
      // console.log('isShow')
      this.isShow = true
    }.bind(this), 400)

  },
  computed: {

  },
  created () {
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')

    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  },
  watch: {
    filesAddedCount: function (val) {
      console.log('val: ' + val)
      if (val> 1) {
        setTimeout(function () {
          alert('Only one file can upload')
          this.removeAllFiles()
        }.bind(this), 800)
      }
    },
    // 'tag': 'initItems',
  }
}
</script>

<style lang="scss">

// @import 'assets/scss/main.scss'; 

.fade-enter, .fade-leave-to {
  opacity: 0;
  visibility: hidden;
  height: 0;
  transition: all .25s;
}

.fade-enter-active {
  opacity: 1;
  visibility: visible;
  height: auto;
}

.fade-leave-active {
  display: none;
  opacity: 1!important;
}

.dropzone {
  border: 0px solid #e5e5e5!important;
  &:hover {
    background: #fff!important;
  }
  .dz-message {
    position: relative;
    padding-top: 150px;
    font-size: 20px;
    color: #bbb;

    &:before {
      position: absolute;
      content: '';
      background-image: url('~assets/img/drag-drop.svg');
      background-size: 100%;
      width: 125px;
      height: 125px;  
      top: 0;
      left: 50%;
      transform: translateX(-50%);

    }
  }
  .dz-preview {
    position: relative;
    display: block !important;
    margin: 0 auto !important;
    min-height: 100px;
    text-align: center;
  }

  .dz-progress, .dz-error-message, .dz-success-mark, .dz-error-mark {
    display: none !important;
  }

  .dz-preview {
    .dz-progress {
      display: none !important;
    }

    &.dz-file-preview .dz-details {
      opacity: 1;
      background: #ffffff;
      color: #000;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: center;
    }

    .dz-details .dz-filename {
      order: -1;
      margin-bottom: 20px;

      span {
        font-size: 20px;
      }
    }
  }
}

.vue-dropzone {
  border: 2px dashed #e5e5e5 !important;
}

.form-group.has-error {
  label {
    color: #dc3545 !important;
  }

  input {
    border: 1px solid #dc3545 !important;
  }
}

label {
  margin-bottom: 5px;
  margin-left: 0px;
  font-size: 12px;
}

.img-thumbnail {
  display: block;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 0.25rem;
  width: 100%;
  max-width: 100%;
  height: auto;
  text-align: center;
  margin: 0 auto;
}

.cover-preview {
  position: relative;
  width: 100%;

  div {
    width: 100%;
  }
}

.progress-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  height: 100%;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .spinners {
    margin-bottom: 40px;
  }

  .spinners svg {
    width: 40px;
    height: 40px;
  }

  .progress-status {
    font-size: 20px;
    color: #bbb;
    opacity: 1;
    transform: translateY(0px); 
    transition: all .45s ease-in;
    
    &.onchange {
      transform: translateY(10px);
      opacity: 0;
    }

  }

  .progress {
    border-radius: 20px;
    height: 25px;
  }
}

.notfound .form-control {
  color: #C83333;
}

.new-order {

  .new-action-block-wrap {
    position: fixed;
    bottom: 0px;
    left: 0;
    background: transparent;
    width: 100%;
    transition: all .25s;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 -0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;

    .submit-group {
      border-top: 1px solid #ebebeb;
      padding: 20px 0px;
      margin-bottom: 0px;
      position: relative;
      bottom: 0;
      display: flex;
      justify-content: center;
    }
  }
}



@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: .25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border .75s linear infinite;
  animation: spinner-border .75s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: .2em;
}

.cover-dropzone {
  display: none;

  &.active {
    display: block;
  }
}

.final-link {
  font-size: 40px;
  border-bottom: 1px solid #0b00b1;

  &:hover {
    text-decoration: none;
    border-bottom: none;
  }
}

.discogs-group {
  position: relative;
}

.discogs-links-warp {
    position: absolute;
    right: 0;
    top: 28px;
    background: #e7ecf3;
    height: 60%;
    width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;

    .discogs-link {
        // position: absolute;
        // right: 14px;
        // top: 11px;

      a, span {
        font-size: .9rem;
        color: #a7a6b5;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          color: #9999a5;
        }
      }

    }

}

.checkFileResponse {
    background: #a00c0c;
    color: #fff;
    padding: 0 4px;
    font-size: .85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 400;
}

#svgContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
  svg {
    position: absolute;
    cursor: crosshair;

    circle:hover {
      cursor: pointer;
    }
  
  }
}


</style>
