<template>
<div class="app-container">
  
  <materials-panel :panelshowmode="panelShowMode"></materials-panel>

  <div class="menu-panel">

      <!-- -->
      <div v-if="!imageExist">
        <div class="menu-panel-title">
          <!-- Загрузите изображение -->
        </div>
      </div>

      <div v-else>
            <div class="edit-area-menu" v-if="activeStage == 'before-start'">

              <div class="menu-panel-title">
                Определите масштаб
              </div>
              <div class="note">
                Нарисуйте линию и укажите ее реальный размер
              </div>

            </div>
            
            <div class="edit-area-menu" v-if="activeStage == 'start'">
              <div class="menu-panel-title">
                Выберите область
              </div>
              <div class="areas-list">
                <div class="areas-list__item" v-for="(area,i) in areas" :key="area.id">
                  <div class="areas-list__title">
                    {{ area.title }}
                    <button class="add-surface" @click="addSurface(area.id)">+</button>
                  </div>
                  <ul>
                    <li v-for="(surface,index) in area.surfaces" :key="index">
                      <div class="surface-item" v-if="Object.keys(surface.material).length === 0">
                        <div class="surface-icon empty" @click="toggleMaterialPanel(area.id, index)">+</div>
                        <div class="surface-content"> 
                          <div class="title">
                            <!-- <div>{{ surface.id }}</div> -->
                            <div class="no-material">Добавьте материал</div>
                          </div>
                          <div class="edit" :class="{'active': onEdit}" @click="editSurface(area.id, surface.num)"></div>
                        </div>
                      </div>
                      <div class="surface-item" v-else>
                        <div class="surface-icon" @click="toggleMaterialPanel(area.id, index)" :style="{backgroundImage: 'url('+ surface.material.img +')'}">+</div>
                        <div class="surface-content"> 
                          <div class="title">
                            <div v-if="surface.material"> {{ surface.material.material }}</div>
                            <div v-if="surface.material"> {{ surface.material.color }}</div>
                          </div>
                          <div class="edit" :class="{'active': onEdit}" @click="editSurface(area.id, surface.num)"></div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- -->
            <div class="draw-surface-menu" v-if="activeStage == 'draw-surface'">
              <div class="menu-panel-title">
                Добавление поверхности
              </div>
              <div class="note">
                Обведите поверхность, щелкая для добавления точки каждый раз, когда путь должен изменить направление. Чтобы закрыть фигуру, снова щелкните начальную точку.
              </div>
              <button class="btn sec-btn" @click="cancelAddSusface()">Отмена</button>
            </div>

            <!-- -->
            <div class="edit-surface-menu" v-if="activeStage == 'edit-surface' || activeStage == 'cut-surface'">
              <div class="menu-panel-title">
                Редактировать поверхность {{ activeSurfaceData.id }}
              </div>
              <div class="note" v-if="activeStage == 'cut-surface'">
                Нарисуйте на выбранной поверхности, то что хотите вырезать.
              </div>
              <div class="note" v-else>
                Вы можете редактировать нарисованную поверхность перемещая существующие точки, а также вырезать или добавить к поверхности используя эти два инструмента 
              </div>
              <button class="btn tools-btn" @click="removeFromPath()" v-if="activeStage != 'cut-surface'">Удалить с поверхности</button>
              <button class="btn tools-btn" @click="setPerspectiva(true)" v-if="activeStage != 'cut-surface'">Установить перспективу</button>
              <button class="btn sec-btn" @click="cancelAddSusface()">Отмена</button>
            </div>

            <!-- -->
            <div class="menu-bottom">
              <button class="btn main-btn" @click="saveAction()">Сохранить</button>
            </div>


      </div>

  </div>
  
  <div class="visualizer" ref="printMe">
    <vizualizator-main ref="VizualizatorMain"/>  
  </div>

  <div class="right-panel">
    <div class="menu-bottom" v-if="imageExist">
        <button class="btn main-btn" @click="exportPNG()">Сохранить</button>
    </div>
    <img :src="output">
  </div>
   
</div>
</template>

<script>
import VizualizatorMain from '~/components/VizualizatorUpload.vue'
import MaterialsPanel from '~/components/MaterialsPanel.vue'
import VueHtml2Canvas from '../node_modules/html2canvas/dist/html2canvas.min.js';
//import VueHtml2Canvas from '../node_modules/vue-html2canvas/dist/index.js';

export default {
  //middleware: ['auth'],
  components: {
    VizualizatorMain,
    MaterialsPanel
  },
  data() {
    return {
      user: undefined,
      errors: [],
      onEdit: false,
      panelShowMode: false,
      output: null,
      projectID: undefined

    }
  },
  methods: {
    addSurface(area) {
      this.$store.commit('setActiveStage', 'draw-surface')
      this.$store.commit('setActiveArea', area)
    },
    editSurface(area, surface) {
      this.$store.commit('setActiveStage', 'edit-surface')
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
    },
    cancelAddSusface() {
      if (this.activeStage == 'cut-surface') {
        this.$store.commit('setActiveStage', 'edit-surface')
      } else {
        this.$store.commit('setActiveStage', 'start')
        this.$store.commit('setActiveSurface', undefined)
      }
      
    },
    setPerspectiva(mode) {
      this.$store.commit('setPerspectivaMode', mode)
    },

    removeFromPath() {
      this.$refs.VizualizatorMain.removeFromPath();
    },
    toggleMaterialPanel(area, surface) {
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
      this.panelShowMode = !this.panelShowMode
    },
    print2() {
        const el = this.$refs.printMe;
        // add option type to get the image version
        // if not provided the promise will return 
        // the canvas.
        const options = {
          type: 'dataURL'
        }
        // this.output = await VueHtml2Canvas(el, options);
        // console.log('this.output ', this.output)

        VueHtml2Canvas(el).then(canvas => {
          document.body.appendChild(canvas)
        });

    },
    exportPNG() {
      var wrapper = document.getElementById('print');
      var _this = this;
      //dom to image
      window.domtoimage.toSvg(wrapper).then(function (svgDataUrl) {
      //download function    
      _this.downloadPNGFromAnyImageSrc(svgDataUrl);
      });
    },
    downloadPNGFromAnyImageSrc(src){
      //recreate the image with src recieved
      var img = new Image;
      //when image loaded (to know width and height)
      img.onload = function(){
        //drow image inside a canvas
        var canvas = convertImageToCanvas(img);
        //get image/png from convas
        var pngImage =  convertCanvasToImage(canvas);
        //download
        var anchor = document.createElement('a');
        anchor.setAttribute('href', pngImage.src);
        anchor.setAttribute('download', 'image.png');
        anchor.click();
      };
      
      img.src = src;

      // Converts image to canvas; returns new canvas element
      function convertImageToCanvas(image) {
          var canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext("2d").drawImage(image, 0, 0);
          return canvas;
      }
              
      // Converts canvas to an image
      function convertCanvasToImage(canvas) {
          var image = new Image();
          image.src = canvas.toDataURL("image/png");
          return image;
      }
    },
    async saveAction() {
      if (this.perspectivaMode === true) {
        this.$refs.VizualizatorMain.hidePerspectiva();
        this.$store.commit('setActiveStage', 'start')
      } else {
        this.$store.commit('setActiveStage', 'start')
      }

      const response = await this.$axios.$post('add-project', {state: this.$store.state, user: this.$auth.user.id})
      console.log('response: '+JSON.stringify(response))
      this.projectID = response.projectID;

      this.$router.push({
        path: '/projects/'+response.projectID
      })

    },

  },
  mounted() {

    console.log('VueHtml2Canvas ', VueHtml2Canvas)

  },
  created() {
    this.$nuxt.$on('toggle-panel', (data) => {
      this.panelShowMode = !this.panelShowMode
    })
  },
  computed: {
    imageCurrent() {
      return this.$store.getters.getImageCurrent
    },
    imageExist() {
      return this.$store.getters.getImageExist
    },
    allStages () {
      return this.$store.getters.getAllStages
    },
    activeStage () {
      return this.$store.getters.getActiveStage
    },
    areas() {
      return this.$store.getters.getAreas
    },
    activeArea () {
      return this.$store.getters.getActiveArea
    },
    activeAreaIndex () {
      return this.$store.getters.getActiveAreaIndex
    },
    activeSurface () {
      return this.$store.getters.getActiveSurface
    },
    activeSurfaceData () {
      return this.$store.getters.getActiveSurfaceData
    },
    perspectivaMode () {
      return this.$store.getters.getPerspectivaMode
    },
  }

}
</script>

<style lang="scss">

@import 'assets/scss/main.scss';



</style>

