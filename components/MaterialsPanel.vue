<template>
    <transition name="fade">
      <div class="materials-panel" :class="{'show': panelshowmode}" v-if="panelshowmode">
        <div class="panel-close" @click="closePanel()">
          <svg width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="Desktop-HD-Copy-5" transform="translate(-1542.000000, -31.000000)" fill="#4A4A4A">
                      <g id="Group-5" transform="translate(1554.829773, 44.480788) rotate(45.000000) translate(-1554.829773, -44.480788) translate(1537.329773, 26.980788)">
                          <rect id="Rectangle" x="16.7708333" y="0" width="1.45833333" height="34.2708333"></rect>
                          <polygon id="Rectangle" transform="translate(17.500000, 17.135417) rotate(90.000000) translate(-17.500000, -17.135417) " points="16.7708333 -6.48003764e-12 18.2291667 -6.48003764e-12 18.2291667 34.2708333 16.7708333 34.2708333"></polygon>
                      </g>
                  </g>
              </g>
          </svg>
        </div>
        <div class="materials-panel-container">
          <b-row v-if="activeArea == 'roof'">
            <b-col sm="12">
                  <b-row v-if="panelMaterialSelected != ''" class="raw-input">
                    <b-col sm="12">
                      <label>Выберите цвет:</label>
                    </b-col>
                    <b-col sm="12">
                      <div class="panel-material-colors-list">
                        <div class="color-item" v-for="color in roofMaterials" :key="color.value">
                          <label>
                            <input type="radio" v-model="panelMaterialSelectedColor" @change="setSelectedColor()" name="panelMaterialColor" :img="color.img" :value="color.value">
                            <div class="color-square" :class="color.value" :style="{ backgroundImage: 'url(' + color[panelSurfaceType] + ')' }">
                            </div>
                          </label>
                            <div class="color-name">{{color.text}}</div>
                            <div class="color-id">{{color.value}}</div>
                        </div>
                      </div>
                    </b-col>
                  </b-row> 
                </b-col>   
          </b-row>
          <b-row v-if="activeArea == 'siding'">
            <b-col sm="12">
              <b-row class="raw-input">
                <b-col sm="4">
                  <label>Выберите материал:</label>
                  <b-form-select
                    @change="getSelectedColors()"
                    v-model="panelMaterialSelected"
                    :options="materials"
                    required
                  ></b-form-select>
                </b-col>
              </b-row> 
            </b-col>
            <b-col sm="12">
                  <b-row v-if="panelMaterialSelected != ''" class="raw-input">
                    <b-col sm="12">
                      <label>Выберите цвет:</label>
                    </b-col>
                    <b-col sm="12">
                      <div class="panel-material-colors-list">
                        <div class="color-item" v-for="color in panelMaterialColorsSelected" :key="color.value">
                          <label>
                            <input type="radio" v-model="panelMaterialSelectedColor" @change="setSelectedColor()" name="panelMaterialColor" :img="color.img" :value="color.value">
                            <div class="color-square" :class="color.value" :style="{ backgroundImage: 'url(' + color[panelSurfaceType] + ')' }">
                            </div>
                          </label>
                            <div class="color-name">{{color.text}}</div>
                            <div class="color-id">{{color.value}}</div>
                        </div>
                      </div>
                    </b-col>
                  </b-row> 
                </b-col>   
          </b-row>
        </div>
      </div>
    </transition>

</template>

<script>

import color_RR32_MATT from '@/assets/img/siding/RR32_MATT.jpg'
import color_RR23_MATT from '@/assets/img/siding/RR23_MATT.jpg' 
import color_RR33_MATT from '@/assets/img/siding/RR33_MATT.jpg'
import color_RAL8017_MATT from '@/assets/img/siding/RAL8017_MATT.jpg' 
import color_RR32 from '@/assets/img/siding/RR32.jpg'
import color_RR23 from '@/assets/img/siding/RR23.jpg' 
import color_RR29 from '@/assets/img/siding/RR29.jpg'
import color_RAL8017 from '@/assets/img/siding/RAL8017.jpg' 
import color_RAL6005 from '@/assets/img/siding/RAL6005.jpg' 
import color_RR20 from '@/assets/img/siding/RR20.jpg'
import color_RR11 from '@/assets/img/siding/RR11.jpg'
import color_naive  from '@/assets/img/siding/Naive.jpg' 
import color_naiveMaroon  from '@/assets/img/siding/Naive_Maroon.jpg' 
import color_log  from '@/assets/img/siding/Log.jpg'
import color_RAL7003 from '@/assets/img/siding/RAL7003.jpg' 
import color_RAL7003_MATT from '@/assets/img/siding/RAL7003_MATT.jpg' 
import color_RAL1001 from '@/assets/img/siding/RAL1001.jpg'
import color_RAL1015 from '@/assets/img/siding/RAL1015.jpg' 
import color_RAL1015_MATT from '@/assets/img/siding/RAL1015_MATT.jpg' 
import color_siding_edco from '@/assets/img/siding/siding-edco.jpeg' 


export default {
  middleware: ['auth'],
  props: ['panelshowmode'],
  name: 'MaterialsPanel',
  components: {

  },
  data () {
    return {
      isShow: false,
      panelSurfaceType: 'textured',
      panelMaterialSelected: 'SteelPuralMatt',
      panelMaterialColorsSelected: [],
      panelMaterialSelectedColor: undefined,
      materials: [
          {text: 'Сталь PURAL MATT', value: 'SteelPuralMatt', colors: [ 
                  { text: 'color_siding_edco', value: 'siding-edco', textured: color_siding_edco, smooth: ''},
                  { text: 'Тёмно-коричневый', value: 'RR32_MATT', textured: color_RR32_MATT, smooth: ''},
                  { text: 'Маренго', value: 'RR23_MATT', textured: color_RR23_MATT, smooth: ''},
                  { text: 'Чёрный изумруд', value: 'RR33_MATT', textured: color_RR33_MATT, smooth: '' },
                  { text: 'Коричневый', value: 'RAL8017_MATT', textured: color_RAL8017_MATT, smooth: '' }
          ]},
          {text: 'Сталь PURAL', value: 'SteelPural', colors: [ 
                  { text: 'Тёмно-коричневый', value: 'RR32', textured: color_RR32, smooth: '' },
                  { text: 'Маренго', value: 'RR23', textured: color_RR23, smooth: ''},
                  { text: 'Бургундский', value: 'RR29', textured: color_RR29, smooth: ''},
                  { text: 'Коричневый', value: 'RAL8017', textured: color_RAL8017, smooth: '' },
                  { text: 'Зелёный мох', value: 'RAL6005', textured: color_RAL6005, smooth: ''},
                  { text: 'Мраморно-белый', value: 'RR20', textured: color_RR20, smooth: '' },
                  { text: 'Тёмно-оливковый', value: 'RR11', textured: color_RR11, smooth: '' }
          ]},
          {text: 'Сталь Printech', value: 'SteelPrintech', colors: [ 
                  { text: 'Naïve (американский орех)', value: 'NAIVE', textured: color_naive, smooth: '' },
                  { text: 'Naïve Maroon (канадский дуб)', value: 'NAIVE_MAROON', textured: color_naiveMaroon, smooth: '' },
                  { text: 'Log (старый дуб)', value: 'LOG', textured: color_log, smooth: '' }
          ]},
          {text: 'Сталь Polyester Zn275', value: 'SteelPolyester', colors: [ 
                  { text: 'Тёмно-коричневый', value: 'RR32', textured: color_RR32, smooth: ''},
                  { text: 'Маренго', value: 'RR23', textured: color_RR23, smooth: ''},
                  { text: 'Коричневый', value: 'RAL8017', textured: color_RAL8017, smooth: '' },
                  { text: 'Мраморно-белый', value: 'RR20', textured: color_RR20, smooth: '' },
                  { text: 'Песочный', value: 'RAL1001', textured: color_RAL1001, smooth: '' },
                  { text: 'Слоновая кость', value: 'RAL1015', textured: color_RAL1015, smooth: '' }
          ]},
          {text: 'Сталь Polyester Zn140', value: 'SteelPolyester140', colors: [ 
                  { text: 'Тёмно-коричневый', value: 'RR32', textured: color_RR32, smooth: ''},
                  { text: 'Маренго', value: 'RR23', textured: color_RR23, smooth: ''},
                  { text: 'Коричневый', value: 'RAL8017', textured: color_RAL8017, smooth: '' },
                  { text: 'Мраморно-белый', value: 'RR20', textured: color_RR20, smooth: '' },
                  { text: 'Песочный', value: 'RAL1001', textured: color_RAL1001, smooth: '' },
                  { text: 'Слоновая кость', value: 'RAL1015', textured: color_RAL1015, smooth: '' }
          ]},
          {text: 'Сталь Polyester MATT Zn140', value: 'SteelPolyesterMatt140', colors: [ 
                  { text: 'Тёмно-коричневый', value: 'RR32', textured: color_RR32, smooth: ''},
                  { text: 'Маренго', value: 'RR23', textured: color_RR23, smooth: ''},
                  { text: 'Слоновая кость', value: 'RAL1015', textured: color_RAL1015, smooth: '' }
          ]},
          {text: 'Алюминий Polyester', value: 'Alum', colors: [ 
                  { text: 'Коричневый', value: 'RAL8017', textured: color_RAL8017, smooth: '' },
                  { text: 'Белый', value: 'RAL9010', textured: color_RR20, smooth: ''},
          ]},
          {text: 'Алюминий Polyester MATT', value: 'AlumMatt', colors: [ 
                  { text: 'Слоновая кость', value: 'RAL1015_MATT', textured: color_RAL1015_MATT, smooth: '' },
                  { text: 'Cерый мох', value: 'RAL7003_MATT', textured: color_RAL7003_MATT, smooth: '' },
          ]}
        ],
        roofMaterials: [
                  { text: 'Цвет 1', value: 'roof-1', textured: '/uploads/roof/roof-1.jpg', smooth: ''},
                  { text: 'Цвет 2', value: 'roof-2', textured: '/uploads/roof/roof-2.jpg', smooth: ''},
                  { text: 'Цвет 3', value: 'roof-3', textured: '/uploads/roof/roof-3.jpg', smooth: '' },
        ]
    }
  },
  beforeRouteLeave (to, from, next) {
    //this.checkIfOrderEmpty()
    clearInterval(this.t)
    next()
  },
  watch: {
    // panelMaterialSelectedColor: function (newVal, oldVal) {
    //   console.log('panelMaterialSelectedColor', newVal, oldVal)

    // },
  },
  methods: {

    getSelectedColors() {
        if (this.panelMaterialSelected != '') {
          var panelMaterialSelected = this.materials.find(o => o.value === this.panelMaterialSelected);
          var panelMaterial = panelMaterialSelected.text;
          var panelMaterialColors = panelMaterialSelected.colors;
          this.panelMaterialColorsSelected = panelMaterialColors;
        }
    },
    setSelectedColor() {
      
      if (this.activeArea == 'roof') {
        var materialName = ''
        var colorName = this.roofMaterials.find( el => el.value == this.panelMaterialSelectedColor).text

      } else if (this.activeArea == 'siding') {
        var material = this.materials.find( el => el.value == this.panelMaterialSelected)
        var materialName = material.text
        var colorName = material.colors.find( el => el.value == this.panelMaterialSelectedColor).text
      }

      const color = {
        materialName: materialName,
        colorName: colorName,
        colorValue: this.panelMaterialSelectedColor
      }
      
      this.$store.commit('setActiveStage', 'add-material')
      this.$store.commit('setSelectedColor', color)
      
      setTimeout(() => {
          this.$store.commit('updateCurrentImage')
         
      }, 500);      

      setTimeout(() => {
          this.$store.dispatch('saveState')
           this.$store.commit('setActiveStage', 'start')
      }, 1000);
      
      this.closePanel()
      this.panelMaterialSelectedColor = undefined
    },
    closePanel() {
        $nuxt.$emit('toggle-panel');
    },
  },
  mounted () {
    this.getSelectedColors()
  },
  computed: {
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
    perspectivaMode () {
      return this.$store.getters.getPerspectivaMode
    },

  },
  created () {
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')

    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  }
}
</script>

<style lang="scss">

// @import 'assets/scss/main.scss'; 

@mixin shadow (){
    box-shadow: 0 1px 14px rgba(70, 96, 140, 0.2);
}

.materials-panel {
  position: fixed;
  width: calc(100vw - 300px);
  height: 100vh;
  background:#ffffffa1;
  right: 0;
  top: 0;
  z-index: 99999;
  @include shadow();
  //visibility: hidden;
  //opacity: 0;


  &.show {
    display: block;
  }

  .panel-close {
    position: absolute;
    right: 2rem;
    top: 2rem;
    cursor: pointer;

    &:hover {
      opacity: .75;
    }
  }
}

.materials-panel-container {
  padding: 2rem;
  padding-top: 10rem;

  label {
    font-size: .85rem;
    font-weight: 600;
    line-height: 1.35;
    margin-bottom: .5rem;
  }

  .raw-input {
    margin-bottom: 4rem;
  }

  .custom-select {
    background-color: #FAFAFA;
    border-radius: 0;
    border: 1px solid #ddd;
  }

}



.panel-material-colors-list {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .color-item {
    text-align: center;
    width: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .color-item label{
    cursor: pointer;
    display: inline-flex;
    width: 212px;
    height: 112px;
    padding: 2px;
    border: 3px solid rgba(255, 255, 255, 0);
    border-radius: 0px;
    margin: 0 auto;
  }

  .color-item input{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    overflow: hidden;
    padding: 0;
    border: none;
    background: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .color-item .color-square{
    width: 200px;
    height: 100px;
    border: 3px solid rgba(255, 255, 255, 0);
    border-radius: 0px;
    box-shadow: 0px 0px 2px #00000057;
    margin: 0 auto 10px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }

  &.color_rr32_matt {
    background-image: url('~assets/img/snowretention.jpg');
  }

  .color-item input:checked + .color-square {
      border-color: #E46713;
      background-color: #fffcfd;
  }

  .options-item.active .options-square {
    border-color: #E46713;
    background-color: #fffcfd;
  }

  .color-item .color-name {
    font-weight: 600;
    font-size: 0.9rem;
  }  

  .color-item .color-id {
    font-size: 0.9rem;
  }  

}


</style>
