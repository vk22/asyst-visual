import axios from 'axios'

const getDefaultState = () => {
  return {
    id: undefined,
    stages: [
      'start',
      'set-scale',
      'draw-surface',
      'edit-surface',
      'cut-surface',
      'add-material',
      'save-project'
    ],
    activeStage: 'start',
    areas: [
      {
        num: 0,
        id: 'roof',
        title: 'Кровля',
        surfaces: []
      },
      {
        num: 1,
        id: 'siding',
        title: 'Сайдинг',
        surfaces: []
      }
    ],
    activeArea: '',
    activeAreaIndex: null,
    activeSurface: undefined,
    activeSurfaceData: undefined,
    perspectivaMode: false,
    saveActionMode: false,
    selectedColor: undefined,
    imageExist: false,
    imageCurrent: {},
    imageOriginal: {},
    projectScale: null,
    finalImage: undefined,
    viewbox: {},
    isLoading: false,
    hoveredSurface: undefined
  }
}

export const state = () => ({
    id: undefined,
    stages: [
      'start',
      'set-scale',
      'draw-surface',
      'edit-surface',
      'cut-surface',
      'add-material'
    ],
    activeStage: 'start',
    areas: [
      {
        num: 0,
        id: 'roof',
        title: 'Кровля',
        surfaces: []
      },
      {
        num: 1,
        id: 'siding',
        title: 'Сайдинг',
        surfaces: []
      }
    ],
    activeArea: '',
    activeAreaIndex: null,
    activeSurface: undefined,
    activeSurfaceData: undefined,
    perspectivaMode: false,
    saveActionMode: false,
    selectedColor: undefined,
    imageExist: false,
    imageCurrent: {},
    imageOriginal: {},
    projectScale: null,
    finalImage: undefined,
    viewbox: {},
    isLoading: false,
    hoveredSurface: undefined
})

export const actions = {
  // async nuxtServerInit ({ commit, dispatch }, { req }) {
  //   console.log('nuxtServerInit ')
  //   dispatch('getTracks')
  // },
  async saveState ({ state, commit }) {
    
    const projectID = '' + state.id
    console.log('store saveState ', projectID)
    const { response } = await axios.put('/api/project/'+projectID, state)
    // console.log('store saveState', response)
    commit('setActiveStage', 'start')
  }
}

export const mutations = {
  resetState ( state ) {
    Object.assign(state, getDefaultState())
  },
  setState (state, project) {
    // // console.log ('setState project selectedColor: ', project.state.selectedColor)
    // console.log ('setState project viewbox: ', project.state.viewbox)
    // state = project.state
    state.activeStage = project.state.activeStage
    state.areas = project.state.areas
    state.activeArea = project.state.activeArea
    state.activeAreaIndex = project.state.activeAreaIndex
    state.activeSurface = project.state.activeSurface
    state.activeSurfaceData = project.state.activeSurfaceData
    state.perspectivaMode = project.state.perspectivaMode
    state.saveActionMode = project.state.saveActionMode
    state.selectedColor = project.state.selectedColor
    state.imageCurrent = project.state.imageCurrent
    state.imageOriginal = project.state.imageOriginal
    state.imageExist = project.state.imageExist
    state.viewbox = project.state.viewbox
    state.id = project.state._id
    // console.log ('state ', state)
  },
  setActiveStage (state, stage) {
    state.activeStage = stage
  },
  setActiveID(state, id) {
    state.id = id
  },
  setProjectScale(state, data) {
    
    state.projectScale = data
  },
  setViewBox(state, data) {
    console.log ('setViewBox ', data) 
    state.viewbox = data
  },
  setImageExist(state, mode) {
    state.imageExist = mode
  },
  setImageOriginal(state, data) {
    state.imageOriginal = data
  },
  setImageCurrent(state, data) {
    console.log('store setImageCurrent ', data)
    state.imageCurrent = data
  },
  updateImageCurrent(state, data) {
    state.imageCurrent.url = data
  },
  addSurfaceInArea (state, surface) {
    //console.log('state.activeArea ', state.activeArea)
    var index = state.areas.findIndex(o => o.id === state.activeArea)
    state.areas[index].surfaces.push(surface)
  },
  removeSurface (state, surfaceIndex) {
    var index = state.areas.findIndex(o => o.id === state.activeArea)
    console.log ('removeSurface ', surfaceIndex, state.areas[index].surfaces) 
    
    state.areas[index].surfaces.splice(surfaceIndex, 1)

    state.areas[index].surfaces.map((surface,i) => {
      console.log('reorded ', i, surface.num)
      surface.num = i
      surface.id = surface.id.split('-')[0]+'-'+i
      surface.clip = surface.clip.split('-')[0]+'-'+'clip'+'-'+i
    })

    state.activeSurfaceData = undefined

    console.log('state.areas ', state.areas[index].surfaces)
  },
  setPerspectivaMode (state, mode) {
    console.log('setPerspectivaMode ', mode)
    state.perspectivaMode = mode
  },
  setActiveArea (state, area) {
    state.activeArea = area
    state.activeAreaIndex = state.areas.findIndex(o => o.id === area)
  },
  setActiveSurface (state, surface) {
    console.log('surface ', surface)
    state.activeSurface = surface
    //state.activeSurfaceData = state.areas[state.activeAreaIndex].surfaces[state.activeSurface]
    state.activeSurfaceData = state.areas[state.activeAreaIndex].surfaces.find(item => item.num == surface)
    console.log('activeSurfaceData ', state.activeSurfaceData)
  },
  setHoveredSurface (state, surface) {
    //console.log('setHoveredSurface ', surface)
    if (surface != undefined) {
      state.hoveredSurface = surface[0]+'-overlay-'+surface[1]
    } else {
      state.hoveredSurface = undefined
    }
    
  },
  editSurfaceInAreaPoints(state, surface) {
    state.areas[surface.area].surfaces[surface.index].points = surface.points
    console.log('editSurfaceInArea state ', state)
  },
  setSelectedColor(state, color, dispatch) {

    function toDataURL(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
          callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    }
    console.log('toDataURL ', '/uploads/'+state.activeArea+'/'+color.colorValue+'.jpg')
    toDataURL('/uploads/'+state.activeArea+'/'+color.colorValue+'.jpg', function(dataUrl) {
      var imageBase64 = dataUrl
   

    //console.log('imageBase64 ', imageBase64)

    var material = {
      material: color.materialName,
      color: color.colorName,
      //img: '/uploads/'+state.activeArea+'/'+color.colorValue+'.jpg'
      img: dataUrl
    }

    state.selectedColor = color.colorName
    state.areas[state.activeAreaIndex].surfaces[state.activeSurface].material = material
    // console.log('setSelectedColor state', state)
    // updateCurrentImageAndSave()

    // function updateCurrentImageAndSave() {
    //   // this.$store.commit('setLoadingMode', true)
    //   var wrapper = document.getElementById('print');
    //   // var _this = this;
    //   //dom to image
    //   window.domtoimage.toSvg(wrapper).then(function (svgDataUrl) {
    //   //download function  
    //     saveImageData(svgDataUrl);
    //   });
    // }

    // function saveImageData(src){
    //   var img = new Image;
    //   img.onload = function(){
    //     var canvas = convertImageToCanvas(img);
    //     var imageData = convertCanvasToImage(canvas);
    //     //console.log('imageData ', imageData)
    //     // commit('updateImageCurrent', imageData)
    //     state.imageCurrent.url = imageData
    //   };
      
    //   img.src = src;
    //   // Converts image to canvas; returns new canvas element
    //   function convertImageToCanvas(image) {
    //       var canvas = document.createElement("canvas");
    //       canvas.width = image.width;
    //       canvas.height = image.height;
    //       canvas.getContext("2d").drawImage(image, 0, 0);
    //       return canvas;
    //   }
    //   // Converts canvas to an image
    //   function convertCanvasToImage(canvas) {
    //       var image = new Image();
    //       image.src = canvas.toDataURL("image/png");
    //       const imageData = image.src
    //       return imageData;
    //   }
    // }
  })
  },
  updateCurrentImage(state) {
    var wrapper = document.getElementById('print');
    var wrapperWidth = state.imageOriginal.width
    var wrapperHeight= state.imageOriginal.height
    console.log('wrapperWidth ', wrapperWidth, wrapperHeight)
    // wrapper.setAttribute("style", "width: 1200px; height: 900px;")
    window.domtoimage.toSvg(wrapper).then(function (svgDataUrl) {

      var img = new Image;
      img.onload = function(){
        var canvas = convertImageToCanvas(img);
        var imageData = convertCanvasToImage(canvas);
        console.log('imageData ', imageData)
        // commit('updateImageCurrent', imageData)

        state.imageCurrent = imageData
        
      };
      
      img.src = svgDataUrl;
      // Converts image to canvas; returns new canvas element
      function convertImageToCanvas(image) {
          var canvas = document.createElement("canvas");
          canvas.width = wrapperWidth;
          canvas.height = wrapperHeight;
          canvas.getContext("2d").drawImage(image, 0, 0, wrapperWidth, wrapperHeight);
          return canvas;
      }
      // Converts canvas to an image
      function convertCanvasToImage(canvas) {
          var image = new Image();
          image.src = canvas.toDataURL("image/jpeg", 1.0);
          // const imageData = image.src
          const imageData = {
            url: image.src,
            width: canvas.width,
            height: canvas.height,
            ratio:  canvas.width/canvas.height
          }
          console.log('convertCanvasToImage ', imageData)
          return imageData;
      }

      //wrapper.setAttribute("style", "width: "+wrapperWidth+"px; height: "+wrapperHeight+"px;")

    })
  },
  setLoadingMode(state, mode) {
    state.isLoading = mode
  }
}

export const getters = {
  getState( state ) {
    return state
  },
  getActiveID( state ) {
    return state.id
  },
  getProjectScale(state) {
    return state.projectScale
  },
  getViewBox(state) {
    return state.viewbox
  },
  getImageExist( state ) {
    return state.imageExist
  },
  getImageCurrent( state ) {
    return state.imageCurrent
  },
  getImageOriginal( state ) {
    return state.imageOriginal
  },
  getAllStages (state) {
    return state.stages
  },
  getActiveStage (state) {
    return state.activeStage
  },
  getAreas (state) {
    return state.areas
  },
  getActiveArea (state) {
    return state.activeArea
  },
  getActiveAreaIndex (state) {
    return state.activeAreaIndex
  },
  getActiveSurface (state) {
    return state.activeSurface
  },
  getActiveSurfacePoints (state) {
    return state.areas[state.activeAreaIndex].surfaces[state.activeSurface].points[0]
  },
  getAllSurfacePoints (state) {
    let allPoints = []
    state.areas[0].surfaces.forEach(surface => allPoints.push(surface.points[0]))
    state.areas[1].surfaces.forEach(surface => allPoints.push(surface.points[0]))
    return allPoints
  },
  getActiveSurfacePerspectiva (state) {
    return state.areas[state.activeAreaIndex].surfaces[state.activeSurface].perspectiva
  },
  getActiveSurfaceData (state) {
    return state.activeSurfaceData 
  },
  getAreasSurface: state => (id) => {
    //var track = state.tracks.find(item => item.id === id)
    // var track = state.tracks[0]
    return track
  },
  getPerspectivaMode (state) {
    return state.perspectivaMode
  },
  getSelectedColor (state) {
    return state.selectedColor
  },
  getLoadingState (state) {
    return state.isLoading
  },
  getHoveredSurface (state) {
    return state.hoveredSurface
  }

}

/// лечит Error: [vuex] Do not mutate vuex store state outside mutation handlers
export const strict = false
