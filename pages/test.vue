<template>
  <div class="visualizer-wrap">
    <div id="print" class="main-zone" :class="{'show': true }">
      <div :id="svgId2" ref="persectivaContainer" class="svg-container2" :class="{'show': isShow}"></div>
      <div :id="svgId" ref="svgContainer" class="svg-container" ></div>

      <!-- <upload-photo mode="index"/>   -->
    </div>

  </div>    
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
      mainSVGScene: {},
      allIsShow: false,
      loadingIsShow: false,
      isShow: true,
      img: '/uploads/vid1.jpg',
      siding: undefined,
      svgId: "svgContainer",
      svgId2: "persectivaContainer",
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
      needToEnterScale: false,
      dragging: false,
      clip: undefined,
      matrix: '1,0,0,0,0,1,6,0,0,0,1,0,50,100,0,1.1',
      points: [],
      canRemoveFromPath: false,
      d: '',
      surfaceArr: [],
      materials: [],
      projectScaleProcent: undefined,
      hoveredSurface: undefined,
      sourcePoints: [],
      targetPoints:[],
      margin: {},
      width: 0,
      mapRatio: .5,
      height: 0
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
  
   
  },
  mounted () {

    var d=[{"x":370,"y":40,"label":"Label 1"},    
            {"x":370,"y":150,"label":"Label 2"} ];

    var svg = d3.select("#svgContainer").append('svg')
    svg.attr({width: 400, height: 400});

    svg.selectAll("*")
            
            .data(d)
            .enter()
            .append("circle")
            .attr("cy", function (d) {    
                console.log('dddd', d)                
                return d.y
            })
            .attr("cx", function (d) {
                return d.x
            })
            .attr("r", 10);

  },
  computed: {



  },
  created () {
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')

    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  },

}
</script>

<style lang="scss">

@import 'assets/scss/main.scss'; 

.visualizer-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
#print {
  overflow: hidden;
}
.main-zone {
  position: relative;
  width: 100%;
  visibility: hidden;
  opacity: 0;
  @include base-transition(all);

  &.show {
    visibility: visible;
    opacity: 1;
  }

  div {
    width: 100%;
  }
  &.start {
    path {
      //stroke: none
    }
  }

}

.loading{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  visibility: visible;
  opacity: 1;
  display: flex;
  // align-items: center;
  justify-content: center;
  z-index: 9999;
  padding-top: 25%;
  @include base-transition(all);

  &.hide {
    visibility: hidden;
    opacity: 0;
  }

  &.show {
    visibility: visible;
    opacity: 1;
  }

  img {
    // position: relative;
    // display: block;
    
    width: 60px;
    height: 60px;
  }

}


.line {
    stroke: #fff;
    stroke-opacity: 1;
    stroke-width: 1px;
    stroke-linecap: square;
}

.handle {
    fill: none;
    pointer-events: all;
    stroke: #fff;
    stroke-width: 3px;
    cursor: move;
}

.material-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .5);
    z-index: 999;
    overflow: hidden;
    //background: rgba(221, 99, 13, .5);

    &.down {
      z-index: -1;
    }
}

.material-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /// transform: perspective(600px) rotateY(-50deg);
    background-size: 50%;
    transform-origin: 0px 0px 0px;
    cursor: pointer;
}
 ////

label {
  margin-bottom: 5px;
  margin-left: 0px;
  font-size: 12px;
}




#svgContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
  &.can-cut {

    .path-overlay {
      display: none;
    }
  
  }
  svg {
    position: absolute;
    cursor: default;

    circle:hover {
      cursor: pointer;
    }

    path {

      // &:hover {
      //   cursor: pointer;
      //   stroke-opacity: 1;
      //   stroke-width: 5;
      // }
    }

    
  
  }

  &.can-draw {
    svg {
      cursor: crosshair;
    }
  }
}

#persectivaContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: none;

  &.show {
    display: block;
  }

  svg {
    position: absolute;
    cursor: crosshair;
    left: 0px;
    top: 0px;
    overflow: initial;

    circle:hover {
      cursor: pointer;
    }

    &#persectiva {
      background: red;
    }


  
  }
}


</style>
