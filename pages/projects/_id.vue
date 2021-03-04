<template>
  <div class="app-container">
    
    <materials-panel :panelshowmode="panelShowMode"></materials-panel>

    <div class="menu-panel">

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
                <div class="surface-item" v-if="surface.material.img == ''">
                  <div class="surface-icon empty" @mouseover="setHoveredSurface([area.id, surface.num])" @mouseleave="setHoveredSurface(undefined)" @click="toggleMaterialPanel(area.id, index)">+</div>
                  <div class="surface-content"> 
                    <div class="title">
                      <div class="no-material">Добавьте материал</div>
                      <div>{{ area.id}} {{ surface.num}}</div>
                    </div>
                    <div class="edit" :class="{'active': onEdit}" @click="editSurface(area.id, surface.num)"></div>
                  </div>
                </div>
                <div class="surface-item" v-else>
                  <div class="surface-icon" @mouseover="setHoveredSurface([area.id, surface.num])" @mouseleave="setHoveredSurface(undefined)" @click="toggleMaterialPanel(area.id, index)" :style="{backgroundImage: 'url('+ surface.material.img +')'}">+</div>
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
      <div class="draw-surface-menu" v-if="activeStage == 'set-scale'">
        <div class="menu-panel-title">
          Определите масштаб проекта
        </div>
        <div class="note" v-if="!showEnterScaleForm">
          Нарисуйте линию и укажите ее реальный размер
        </div>
        <div class="note" v-else>
          <b-row>
            <b-col cols="12">
              <label>Укажите длину линии в метрах: </label>
            </b-col>
            <b-col cols="6">

              <b-form-input v-model="scaleData" type="number"></b-form-input>
            </b-col>
          </b-row>
        </div>
        <button class="btn sec-btn" @click="cancelAddSusface()">Отмена</button>
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
      <div class="edit-surface-menu" v-if="activeStage == 'edit-surface' || activeStage == 'cut-surface' || activeStage == 'add-material'">
        <div class="menu-panel-title">
          Редактировать поверхность {{ activeSurfaceData.id }}
        </div>
        <div class="note" v-if="activeStage == 'cut-surface'">
          Нарисуйте на выбранной поверхности, то что хотите вырезать.
        </div>
        <div class="note" v-else>
          Вы можете редактировать нарисованную поверхность перемещая существующие точки, а также вырезать или добавить к поверхности используя эти два инструмента 
        </div>
        <button class="btn tools-btn" @click="removeFromPath()" v-if="activeStage != 'cut-surface'">Вырезать</button>
        <button class="btn tools-btn" @click="setPerspectiva(true)" v-if="activeStage != 'cut-surface'">Установить перспективу</button>
        <button class="btn tools-btn" @click="removeSurface()" v-if="activeStage != 'cut-surface'">Удалить поверхность</button>
        <button class="btn sec-btn" @click="cancelAddSusface()">Отмена</button>
      </div>

      <!-- -->
      <div class="menu-bottom" v-if="activeStage == 'start'">
        <button class="btn sec-btn" @click="setScale()">Установить масштаб</button>
      </div>
      <div class="menu-bottom">
        <button class="btn main-btn" @click="preSaveAction()">Сохранить</button>
      </div>

    </div>
    <!-- -->
    <div class="visualizer" ref="printMe">
      <vizualizator-main ref="VizualizatorMain" @enterScale="enterScale()"/>  
    </div>
    <!-- -->
    <div class="right-panel">
      <div>{{ activeStage }}</div>
      <div>
          <button class="btn main-btn" @click="exportPNG()" :disabled="activeStage != 'start'">Скачать результат</button>
      </div>

      <div>
        <div>image Current: {{ imageCurrent.width }} x {{ imageCurrent.height }}</div>
        <img :src="imageCurrent.url" alt="">
        <br><br>
        <div>image Original {{ imageOriginal.width }} x {{ imageOriginal.height }}</div>
        <img :src="imageOriginal.url" alt="">
        <div> {{ activeSurfaceData }}</div>
        
      </div>
    </div>
    
  </div>
</template>

<script>
import VizualizatorMain from '~/components/VizualizatorProject.vue'
import MaterialsPanel from '~/components/MaterialsPanel.vue'
import VueHtml2Canvas from 'html2canvas';
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
      projectID: undefined,
      project: undefined,
      showEnterScaleForm: false,
      scaleData: 0

    }
  },
  methods: {
    setHoveredSurface(data) {
        this.$store.commit('setHoveredSurface', data)
    },
    preSaveAction() {
      // console.log('this.activeStage ', this.activeStage)
      if (this.activeStage != 'set-scale' && this.activeStage != 'add-material') {

              
        this.$store.commit('setLoadingMode', true)

          if (this.perspectivaMode === true) {
            this.$refs.VizualizatorMain.hidePerspectiva();
            //this.$store.commit('setActiveStage', 'start')
          } else if (this.activeStage == 'set-scale') {
            this.$store.commit('setProjectScale', this.scaleData) 
            //this.$store.commit('setActiveStage', 'start')
            d3.select('g.drawPoly').remove(); 
          } else {
            //this.$store.commit('setActiveStage', 'start')
          }

        if (this.activeSurfaceData.material.material != '') {
          this.$store.commit('setActiveStage', 'add-material')
          this.$store.commit('updateCurrentImage')
          setTimeout(() => {
               this.$store.commit('setActiveStage', 'start')
               this.saveAction()
          }, 1000);
        } else {
            this.saveAction()
            this.$store.commit('setActiveStage', 'start')
        }

      } else {
        this.saveAction()
        this.$store.commit('setActiveStage', 'start')
      }
     
    },
    async saveAction() {


      console.log('this.state ', this.state.id)
      var projectID = '' + this.state.id

      const response = await this.$axios.$put('/project/'+projectID, this.state)
      console.log('response: '+JSON.stringify(response))
      this.projectID = response.projectID;
      if (response.success) {

          setTimeout(() => {
            this.$store.commit('setLoadingMode', false)
            this.$toast.success('Изменения сохранены');
          }, 1000);
          setTimeout(() => {
            this.$toast.clear()
          }, 4000);
      }

    },
    setScale() {
      this.$store.commit('setActiveStage', 'set-scale')
    },
    addSurface(area) {
      this.$store.commit('setActiveStage', 'draw-surface')
      this.$store.commit('setActiveArea', area)
    },
    editSurface(area, surface) {
      console.log('editSurface ', area, surface)
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
    removeSurface() {
      this.$store.commit('setActiveStage', 'start')
      var area = this.activeSurfaceData.id.split('-')[0]
      this.$store.commit('removeSurface', this.activeSurfaceData.num)
    },
    toggleMaterialPanel(area, surface) {
      //this.$store.commit('setActiveStage', 'add-material')
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
      this.panelShowMode = !this.panelShowMode
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
    enterScale() {
      console.log('enterScale')
      this.showEnterScaleForm = true;
    }

    

  },
  mounted() {
    //this.getProject()
    this.$store.commit('setActiveStage', 'start')
  },
  created() {
    this.$nuxt.$on('toggle-panel', (data) => {
      this.panelShowMode = !this.panelShowMode
    })
    this.$nuxt.$on('enterScale', (data) => {
      this.enterScale()
    })
  },
  computed: {
    state() {
        return this.$store.getters.getState
    },
    imageUploaded() {
        return this.$store.getters.getImageUploaded
    },
    imageOriginal() {
        return this.$store.getters.getImageOriginal
    },
    imageCurrent() {
        return this.$store.getters.getImageCurrent
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

// @import 'assets/scss/main.scss';


</style>

