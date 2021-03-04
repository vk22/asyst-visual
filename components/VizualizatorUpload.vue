<template>
    <upload-photo mode="index"/>
</template>

<script>

import * as d3 from '../plugins/d3v3.js'
import UploadPhoto from '~/components/UploadPhoto.vue'
//import * as d3 from 'd3'

export default {
  middleware: ['auth'],
  name: 'DrawPath',
  components: {
    UploadPhoto
  },
  data () {
    return {
      allIsShow: true,
      isShow: false,
      img: '/uploads/vid1.jpg',
      siding: undefined,
      svgId: "svgContainer",
      svgId2: "svgContainer2",
      mapAttr: {
          viewBoxWidth: 830,
          viewBoxHeight: 536
      },
      SVG: undefined,
      containerWidth: null,
      containerHeight: null,
      scaleW: null,
      scaleH: null,
      pathArr: [],
      path: undefined,
      pointsData: [],
      pathPoints: '',
      pathExist: false,
      circleArr: [],
      startCircle: undefined,
      canDrawPath: false,
      canEndPath: false,
      canEditPath: false,
      canCutPath: false,
      dragging: false,
      clip: undefined,
      matrix: '1,0,0,0,0,1,6,0,0,0,1,0,50,100,0,1.1',
      points: [],
      canRemoveFromPath: false,
      d: '',
      surfaceArr: [],
      materials: [],
      projectScaleProcent: undefined
    }
  },
  beforeRouteLeave (to, from, next) {
    //this.checkIfOrderEmpty()
    clearInterval(this.t)
    next()
  },
  watch: {

  },
  methods: {
    async startProject() {
      const response = await this.$axios.$post('add-project', {state: this.$store.state, user: this.$auth.user.id})
      console.log('response: '+JSON.stringify(response))
      this.projectID = response.projectID;

      this.$router.push({
        path: '/projects/'+response.projectID
      })
    }
   
  },
  mounted () {
    
    window.addEventListener('resize', this.onResize)

  },
  computed: {
    imageExist() {
      return this.$store.getters.getImageExist
    },

  },
  created () {

  },
  watch: {
    imageExist: function (newVal, oldVal) {
        if (newVal) {
          this.startProject()
        }
    },
  }
}
</script>

<style lang="scss">

@import 'assets/scss/main.scss'; 


</style>
