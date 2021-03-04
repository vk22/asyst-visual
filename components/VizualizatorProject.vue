<template>
  <div class="visualizer-wrap">
    <div id="print" class="main-zone" :class="{'show': allIsShow, 'start': activeStage == 'start'}" :style="{'height': mainZoneHeight+'px'}">
      <div :id="svgId2" ref="persectivaContainer" class="svg-container2" :class="{'show': isShow}"></div>
      <div :id="svgId" ref="svgContainer" class="svg-container" :class="{'can-draw': canDrawPath, 'can-cut': canCutPath, }"></div>
      <div class="material-container" :class="{'down': activeStage != 'add-material'}" v-for="(item, index) in surfaces" :key="index" :style="{'clip-path':'url(#'+item.clip+')'}">
        <div v-if="item.material.img != undefined">
          <div class="material-item" @click="editHoveredSurface(item)" @mouseover="showHoveredSurface(item)" @mouseleave="showHoveredSurface(null)" :id="'material-'+item.id" :style="{backgroundImage: 'url('+ item.material.img +')', transform: 'matrix3d(' + item.matrix + ') scale(1)', backgroundSize: projectScaleProcent}"></div>
        </div>
      </div>
      <!-- <upload-photo mode="index"/>   -->
    </div>
    <div class="loading" :class="{'hide': allIsShow, 'show': loadingIsShow}">
      <img src="/loading.svg" alt="">
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
      isShow: false,
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
      mainZoneHeight: null,
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
    async getProject() {
      const response = await this.$axios.$get('/project/'+this.$route.params.id)

      this.$store.commit('setState', response.project)
      this.$store.commit('setActiveID', response.project._id)
      this.project = response.project;

      this.setProjectSize()
      this.onResize()

      setTimeout(() => {
        
        this.initD3Project()
          if (this.activeStage == 'start') {
            d3.selectAll('path')
                  .attr('stroke', 'none')
          } 
      }, 250);
    },    
    setProjectSize() {
      this.containerWidth = this.$refs.svgContainer.clientWidth
      this.containerHeight = this.$refs.svgContainer.clientWidth / this.imageCurrent.ratio
      // console.log('_this.viewBox ', this.viewBox)
      if (!this.viewBox) {
        this.$store.commit('setViewBox', {w: this.containerWidth, h: this.containerHeight}) 
      }
    },
    initD3Project(image) {
      var _this = this;
      var dragging = false, canEditPath = false, startPoint = [];
      
      var mainSVGScene = d3.select('#svgContainer').append('svg')
            .style('height', _this.containerHeight + 'px')
            .style('width', _this.containerWidth + 'px')
          //.attr('viewBox','0 0 '+viewBoxW+' '+viewBoxH)
          //.attr('preserveAspectRatio', 'xMinYMin meet')
     
      mainSVGScene.append("svg:image")
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', _this.containerHeight)
        .attr('width', _this.containerWidth)
        .attr("xlink:href", _this.imageCurrent.url)
        .attr('id', 'mainImage')      

      var points = [], pointsInPers = [], g;
      // behaviors
      var dragger = d3.behavior.drag()
        .on('drag', handleDrag)
        .on('dragend', function(d){
            dragging = false;
        });


      ///// mouseup
      mainSVGScene.on('mouseup', function() {
          //console.log('mouseup ', _this.canDrawPath)
          if(dragging || !_this.canDrawPath) return;
          canEditPath = true;
          startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
          if(mainSVGScene.select('g.drawPoly').empty()) g = mainSVGScene.append('g').attr('class', 'drawPoly');
          if(d3.event.target.hasAttribute('is-handle')) {
              generatePath();
              return;
          };
          console.log('point ', d3.mouse(this))
          // console.log('point %', _this.convertAbsoluteToPersent(d3.mouse(this)))
          var pointInPers = _this.convertAbsoluteToPersent(d3.mouse(this))
          // console.log('point 2', _this.convertPersentToAbsolute(posInPers))

          points.push(d3.mouse(this));
          pointsInPers.push(pointInPers);

          if (_this.activeStage == 'set-scale' && points.length > 1) {
              setScaleData();
              return;
          }

          g.select('polyline').remove();
          var polyline = g.append('polyline').attr('points', points)
                          .style('fill', 'none')
                          .attr('stroke', '#000');

          for(var i = 0; i < points.length; i++) { 
              // console.log('points[i] ', points[i])
              g.append('circle')
              .attr('cx', points[i][0])
              .attr('cy', points[i][1]) //
              .attr('r', 4)
              .attr('fill', 'yellow')
              .attr('stroke', '#000')
              .attr('is-handle', 'true')
              .style({cursor: 'pointer'})
              .on("mouseover",function(){
                d3.select(this)
                  .transition()
                  .duration(100)
                  .attr('r', 8)
              })
              .on("mouseleave",function(){
                d3.select(this)
                  .transition()
                  .duration(100)
                  .attr('r', 4)
              });
          }
      });
      
      ///// mousemove
      mainSVGScene.on('mousemove', function() {
          if(!_this.canEditPath) return;
          // if(_this.needToEnterScale) return;
          
          var g = d3.select('g.drawPoly');
          g.select('line').remove();
          if (startPoint.length) {
          var line = g.append('line')
                      .attr('x1', startPoint[0])
                      .attr('y1', startPoint[1])
                      .attr('x2', d3.mouse(this)[0] + 2)
                      .attr('y2', d3.mouse(this)[1])
                      .attr('stroke', '#0059C7')
                      .attr('stroke-width', 1);
          }

      })

      ////// рисуем сохраненные поверхности  
      setTimeout(() => {
        if (this.surfaces.length) {
          insertSavedPath(this.surfaces)
        }
      }, 500);

      ///// insertSavedPath
      function insertSavedPath(surfaces) {

        console.log('insertSavedPath surfaces ', surfaces)  
                
        for(var i = 0; i < surfaces.length; i++) {
              var points = surfaces[i].points.slice()
              var d = 'M '; 
              var d = ''

              
              ///// Переводим Persent to Absolute
              var surfacesPointsForDraw = surfaces[i].points.map ((element,i) => {
                return element.map ( points => {
                  return _this.convertPersentToAbsolute(points)
                })                  
              })

               console.log('surfacesPointsForDraw ', surfacesPointsForDraw)  


              surfacesPointsForDraw.forEach((element, i) => {
                  if (element.length) {
                    var d2 = 'M ';
                    //console.log('element ', element)
                    for(var i = 0; i < element.length; i++) {
                      if (i < element.length-1) {
                        // console.log(' ', element[i][0], element[i][1])
                        d2 += element[i][0] +','+ element[i][1] +' ' 
                      } else {
                        d2 += element[i][0] +','+ element[i][1] +' Z' 
                      }
                    }
                    d += d2
                  }

              })

              // surfaces[i].points.forEach((element, i) => {
              //     if (element.length) {
              //       var d2 = 'M ';
              //       for(var i = 0; i < element.length; i++) {
              //         if (i < element.length-1) {
              //           //console.log(' ', element[i][0], element[i][1])
              //           d2 += _this.convertPersentToAbsolute(element[i])[0] +','+ _this.convertPersentToAbsolute(element[i])[1] +' ' 
              //         } else {
              //           d2 += _this.convertPersentToAbsolute(element[i])[0] +','+ _this.convertPersentToAbsolute(element[i])[1] +' Z' 
              //         }
              //       }
              //       d += d2
              //     }
              // })
              //console.log('d ', d)
              var area = surfaces[i].id.split('-')[0]
              var num = surfaces[i].num
              var surfaceID = area+"-"+num
              var surfaceOverlayID = area+"-overlay-"+num
              var groupID = area+"-group-"+num
              var clipID = area+"-clip-"+num ///

              var clip = mainSVGScene.append("clipPath")       // define a clip path
              .attr("id", clipID)
              // .attr("clipPathUnits", "objectBoundingBox")
              // .attr("transform", "scale("+_this.scaleW+", "+_this.scaleH+")")

              ///// path original

              clip.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0.5')
                .attr('fill', '#e46713')
                // .attr('stroke', 'rgb(19, 78, 191)')
                // .attr('stroke-opacity', '0.5')
                // .attr('stroke-width', '3')
                .attr("id", surfaceID)
                .on("click", function (d) {
                    console.log("Clicked ID: " + d3.select(this).attr("id"));
                  });

              var g = mainSVGScene.append('g').attr("id", groupID)

              g.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0.25')
                .attr('fill', '#111')
                .attr('stroke', 'rgb(19, 78, 191)')
                .attr('stroke-opacity', '1')
                .attr('stroke-width', '3')
                .attr("id", surfaceOverlayID)
                .attr("class", 'path-overlay')
                .style({cursor: 'pointer'})
                .on("click", function (d) {
                    _this.getClickedPathData(d3.select(this).attr("id"))
                    d3.selectAll('circle').style('visibility', 'hidden')
                    d3.select(this.parentNode).selectAll('circle').style('visibility', 'visible')

                })
                .on("mouseover",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '5')
                })
                .on("mouseleave",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '3')
                });
              
              ///// circles

              _this.x.range([0, _this.containerWidth]);
              _this.y.range([0, _this.containerHeight]);
              
              surfacesPointsForDraw.forEach((points, i) => {
                
                var g_circles = g.append('g').attr("id", groupID+'-'+i)
                var data = []

                points.map ((point,i) => {
                  data.push({"x":point[0],"y":point[1],"label":"Label 1"})
                })

                g_circles
                    .selectAll("*")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cy", function (d) {   
                      //console.log('data cy ', data)                 
                      return _this.y(d.y/_this.containerHeight)
                    })
                    .attr("cx", function (d) {
                      return _this.x(d.x/_this.containerWidth)
                    })
                    // .attr('cx', points[0])
                    // .attr('cy', points[1]) //
                    .attr('r', 4)
                    .attr('fill', '#E46713')
                    .attr('stroke', '#000')
                    .attr('is-handle', 'true')
                    .style({cursor: 'move'})
                    .call(dragger)
                    .on("mouseover",function(){
                      d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', 8)
                    })
                    .on("mouseleave",function(){
                      d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('r', 4)
                    });


              })

              // surfaces[i].points[0].map ((points,i) => {
              //   //console.log('points ', points)
              //   var pointsInAbs = _this.convertPersentToAbsolute(points)
              //   data.push({"x":pointsInAbs[0],"y":pointsInAbs[1],"label":"Label 1"})
              // })

              _this.hideAllCircles()
          }    
      }
      ///// setScaleData
      function setScaleData() {
              var d = 'M '; 
              //console.log('points ', points)
              for(var i = 0; i < points.length; i++) {
                if (i < points.length-1) {
                  d += points[i][0] +','+ points[i][1] +' ' 
                } else {
                  d += points[i][0] +','+ points[i][1] +' Z' 
                }
              }

              g.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0')
                .attr('fill', '#e46713')
                .attr('stroke', 'rgb(19, 78, 191)')
                .attr('stroke-opacity', '1')
                .attr('stroke-width', '3')
                // .attr("id", surfaceOverlayID)
                .attr("class", 'path-overlay')
                .style({cursor: 'pointer'})
                .on("click", function (d) {
                    _this.getClickedPathData(d3.select(this).attr("id"))
                    //showMyCircles(d3.select(this.parentNode).selectAll('circle').style('visibility', 'visible'))
                    d3.selectAll('circle').style('visibility', 'hidden')
                    d3.select(this.parentNode).selectAll('circle').style('visibility', 'visible')

                })
                .on("mouseover",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '5')
                })
                .on("mouseleave",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '3')
                });
              
              ///// circles

              var g_circles = g.append('g')

              for(var i = 0; i < points.length; i++) {
                  var circle = g_circles.selectAll('circles')
                  .data([points[i]])
                  .enter()
                  .append('circle')
                  .attr('cx', points[i][0])
                  .attr('cy', points[i][1])
                  .attr('r', 4)
                  .attr('fill', '#E46713')
                  .attr('stroke', '#000')
                  .attr('is-handle', 'true')
                  .style({cursor: 'move'})
                  .style('visibility', 'visible')
                  .call(dragger)
                  .on("mouseover",function(){
                    d3.select(this)
                      .transition()
                      .duration(100)
                      .attr('r', 8)
                  })
                  .on("mouseleave",function(){
                    d3.select(this)
                      .transition()
                      .attr('r', 4)
                  });
              }


              ////////////////////////
              points = [];              
              _this.canEditPath = false;
              _this.canDrawPath = false;
              _this.canSetScale = false;
              _this.needToEnterScale = true;
              $nuxt.$emit('enterScale');

      }
      ///// generatePath
      function generatePath() {
          mainSVGScene.select('g.drawPoly').remove(); //
          /// Вырезать
          if (_this.canRemoveFromPath) {
                var old_points = _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points;
                console.log('old_points ', old_points)
                var old_d = '';
                old_points.forEach((element, i) => {
                  if (element.length) {
                    var old_d_path = 'M '
                    for(var i = 0; i < element.length; i++) {
                      if (i < element.length-1) {
                        old_d_path  += element[i][0] +','+ element[i][1] +' ' 
                      } else {
                        old_d_path  += element[i][0] +','+ element[i][1] +' Z' 
                      }
                    }
                    old_d += old_d_path
                  }
                });

                var new_d = 'M '; 
                for(var i = 0; i < points.length; i++) {
                  if (i < points.length-1) {
                    new_d += points[i][0] +','+ points[i][1] +' ' 
                  } else {
                    new_d += points[i][0] +','+ points[i][1] +' Z' 
                  }
                }

                var d = old_d + new_d

                var path = d3.select('#'+_this.activeArea+'-'+_this.activeSurface);
                var pathOverlay = d3.select('#'+_this.activeArea+'-overlay-'+_this.activeSurface);
                
                path.attr('d', d);
                pathOverlay.attr('d', d);

                var allPoints = [ old_points, points ]
                old_points.push(pointsInPers)

                var surface = {
                  area: _this.activeAreaIndex,
                  index: _this.activeSurface,
                  points: old_points,
                }

                var group = d3.select('#'+_this.activeArea+"-group-"+_this.activeSurface);

                var pointsIndex = 0

                _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points.forEach ((element, i) => { 
                  console.log('pointsIndex element ', element)
                    if (element.length > 0) {
                      pointsIndex += 1
                    }
                })

                pointsIndex = pointsIndex - 1;
                //var pointsIndex = _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points.length
                var g_circles = group.append('g').attr("id", _this.activeArea+"-group-"+_this.activeSurface+'-'+pointsIndex)  //// реальный индекс path
                for(var i = 0; i < points.length; i++) {
                    var circle = g_circles.selectAll('circles')
                    .data([points[i]])
                    .enter()
                    .append('circle')
                    .attr('cx', points[i][0])
                    .attr('cy', points[i][1])
                    .attr('r', 4)
                    .attr('fill', '#E46713')
                    .attr('stroke', '#000')
                    .attr('is-handle', 'true')
                    .style({cursor: 'move'})
                    .style('visibility', 'visible')
                    .call(dragger);
                }

                ////////////////////////

                _this.$store.commit('editSurfaceInAreaPoints', surface)

                points = []; 
                pointsInPers = [];             
                _this.canEditPath = false;
                _this.canDrawPath = false
                _this.canRemoveFromPath = false

          } else {
              var d = 'M '; 

              function checkPathDirection(points) {
                console.log('checkPathDirection ', points)
                  const res = (points[1][0] - points[0][0]) * (points[1][1] + points[0][1]) +
                        (points[2][0] - points[1][0]) * (points[2][1] + points[1][1]) + 
                        (points[3][0] - points[2][0]) * (points[3][1] + points[2][1])
                  return res     
              }

              if(points.length == 4) {
                let pathDirection = checkPathDirection(points)

                if (pathDirection < 0) {
                  console.log('по часовой ')
                } else {
                  console.log('против часовой ')
                  points = points.reverse()
                }
              }

              for(var i = 0; i < points.length; i++) {
                if (i < points.length-1) {
                  d += points[i][0] +','+ points[i][1] +' ' 
                } else {
                  d += points[i][0] +','+ points[i][1] +' Z' 
                }
              }

              var num = _this.getLastSurfaceNum()
              var surfaceID = _this.activeArea+"-"+num
              var surfaceOverlayID = _this.activeArea+"-overlay-"+num
              var groupID = _this.activeArea+"-group-"+num
              var clipID = _this.activeArea+"-clip-"+num ///

              var clip = mainSVGScene.append("clipPath")       // define a clip path
              .attr("id", clipID)
              // .attr("clipPathUnits", "objectBoundingBox")
              //.attr("transform", "scale("+_this.scaleW+", "+_this.scaleH+")")


              ///// path original

              clip.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0.5')
                .attr('fill', '#e46713')
                .attr('stroke', 'rgb(19, 78, 191)')
                .attr('stroke-opacity', '0.5')
                .attr('stroke-width', '3')
                .attr("id", surfaceID)
                .on("click", function (d) {
                    console.log("Clicked ID: " + d3.select(this).attr("id"));
                  });
              
              ///// path overlay

              var g = mainSVGScene.append('g').attr("id", groupID)
              var gImage = mainSVGScene.append('g')
                .attr("id", "image")
                .style('transform', 'matrix3d(2.62979, 0.304711, 0, 0.004124, 0, 1.35581, 0, 0.00089, 0, 0, 1, 0, 0, 0, 0, 1)')
                .attr('clip-path', 'url(#'+clipID+')') 

              g.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0.5')
                .attr('fill', '#000')
                .attr('stroke', 'rgb(19, 78, 191)')
                .attr('stroke-opacity', '1')
                .attr('stroke-width', '3')
                .attr("id", surfaceOverlayID)
                .attr("class", 'path-overlay')
                .style({cursor: 'pointer'})
                .on("click", function (d) {
                    _this.getClickedPathData(d3.select(this).attr("id"))
                    //showMyCircles(d3.select(this.parentNode).selectAll('circle').style('visibility', 'visible'))
                    d3.selectAll('circle').style('visibility', 'hidden')
                    d3.select(this.parentNode).selectAll('circle').style('visibility', 'visible')

                })
                .on("mouseover",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '5')
                })
                .on("mouseleave",function(){
                  d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('stroke-opacity', '1')
                    .attr('stroke-width', '3')
                });
              
              ///// circles

              var g_circles = g.append('g').attr("id", groupID+'-0')

              // for(var i = 0; i < points.length; i++) {
              //     var circle = g_circles.selectAll('circles')
              //     .data([points[i]])
              //     .enter()
              //     .append('circle')
              //     .attr('cx', points[i][0])
              //     .attr('cy', points[i][1])
              //     .attr('r', 4)
              //     .attr('fill', '#E46713')
              //     .attr('stroke', '#000')
              //     .attr('is-handle', 'true')
              //     .style({cursor: 'move'})
              //     .style('visibility', 'visible')
              //     .call(dragger)
              //     .on("mouseover",function(){
              //       d3.select(this)
              //         .transition()
              //         .duration(100)
              //         .attr('r', 8)
              //     })
              //     .on("mouseleave",function(){
              //       d3.select(this)
              //         .transition()
              //         .attr('r', 4)
              //     });
              // }
              _this.x.range([0, _this.containerWidth]);
              _this.y.range([0, _this.containerHeight]);
              var circle = g_circles.selectAll('circles')
              var data = []
              console.log('points ', points)
              points.map ((points,i) => {
                //console.log('points ', points)
                // var pointsInAbs = _this.convertPersentToAbsolute(points)
                data.push({"x":points[0],"y":points[1]})
              })
              console.log('data ', data)
              g_circles
                  .selectAll("circles")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("cy", function (d) {   
                    // console.log('d.y ', d.y)  
                    // console.log('_this.containerHeight ', _this.containerHeight)  
                    // console.log('cy ', _this.y(d.y/_this.containerHeight))                 
                    return _this.y(d.y/_this.containerHeight)
                  })
                  .attr("cx", function (d) {
                    // console.log('cx ', _this.x(d.x/_this.containerWidth))  
                      return _this.x(d.x/_this.containerWidth)
                  })
                  .attr('r', 4)
                  .attr('fill', '#E46713')
                  .attr('stroke', '#000')
                  .attr('is-handle', 'true')
                  .style({cursor: 'move'})
                  .call(dragger)
                  .on("mouseover",function(){
                    d3.select(this)
                      .transition()
                      .duration(100)
                      .attr('r', 8)
                  })
                  .on("mouseleave",function(){
                    d3.select(this)
                      .transition()
                      .duration(100)
                      .attr('r', 4)
                  });


              mainSVGScene.selectAll().sort(function (a, b) { // select the parent and sort the path's
                  if (a.id != d.id) return 1;               // a is not the hovered element, send "a" to the back
                  else return -1;                             // a is the hovered element, bring "a" to the front
              });

              ////////////////////////

              var newSurface = {
                num: num,
                id: surfaceID,
                clip: clipID,
                points: [ pointsInPers ],
                material: {
                  material: '',
                  color: '',
                  img: ''
                },
                matrix: '',
                perspectiva: ''
              }

              ////////////////////////

              _this.$store.commit('addSurfaceInArea', newSurface)
              points = [];     
              pointsInPers = [];         
              _this.canEditPath = false;
              _this.canDrawPath = false
            
              _this.editSurface(_this.activeArea, num)

          }

      }
      ///// handleDrag
      function handleDrag() {        
          if(_this.canEditPath) return;
          if(_this.needToEnterScale) return;
          var dragCircle = d3.select(this); 
          // var newPoints = [[], [], [], [], [], [], [], []]; 
          var newPoints = []; 
          var circle;
          dragging = true;
          var path = d3.select('#'+_this.activeArea+'-'+_this.activeSurface);
          var pathOverlay = d3.select('#'+_this.activeArea+'-overlay-'+_this.activeSurface);
          var circles = d3.select(this.parentNode.parentNode).selectAll('circle');
          //console.log('handleDrag circles ', circles)
          dragCircle
          .attr('cx', d3.event.x)
          .attr('cy', d3.event.y);
          //_this.points = []
          for (var i = 0; i < circles[0].length; i++) {
              circle = d3.select(circles[0][i]);
              var pathIndex = d3.select(circle.node().parentNode).attr("id").split('-')[3]
              //console.log('pathIndex ', pathIndex)
              var pointInPers = _this.convertAbsoluteToPersent([parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))])
              newPoints.push([])
              newPoints[pathIndex].push( pointInPers );
          }
    
          var d_new = ''
          newPoints.forEach((element, i) => {
              if (element.length) {
                var d = 'M ';
                for(var i = 0; i < element.length; i++) {
                  if (i < element.length-1) {
                        //console.log(' ', element[i][0], element[i][1])
                        d += _this.convertPersentToAbsolute(element[i])[0] +','+ _this.convertPersentToAbsolute(element[i])[1] +' ' 
                      } else {
                        d += _this.convertPersentToAbsolute(element[i])[0] +','+ _this.convertPersentToAbsolute(element[i])[1] +' Z' 
                  }
                }
                d_new += d
              }
          })

          /// обновляем points 
          _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points = newPoints;
          //console.log('d_new ', d_new)
          path.attr('d', d_new);
          pathOverlay.attr('d', d_new);
      }

      d3.select(window).on('resize', resizePaths); 

      function resizePaths() {

          console.log('resizePaths surfaces ', _this.surfaces)
          var allSurfaces = _this.surfaces

          if(_this.canEditPath) return;
          if(_this.needToEnterScale) return;
          
          allSurfaces.forEach( surface => {
            
              var pathIndex = surface.id
              var pathOverlayIndex = surface.id.split('-')[0] + '-overlay-' + surface.id.split('-')[1]
              var circlesIndex = surface.id.split('-')[0] + '-group-' + surface.id.split('-')[1]
              
              var path = d3.select('#'+pathIndex);
              var pathOverlay = d3.select('#'+pathOverlayIndex);
              var circles = d3.select('#'+circlesIndex+'-0').selectAll('circle')

              var d = ''

              var surfacesPointsForDraw = surface.points.map ((element,i) => {
                return element.map ( points => {
                  return _this.convertPersentToAbsolute(points)
                })                  
              })

              // console.log('surfacesPointsForDraw ', surfacesPointsForDraw)  

              surfacesPointsForDraw.forEach((element, i) => {
                  if (element.length) {
                    var d2 = 'M ';
                    //console.log('element ', element)
                    for(var i = 0; i < element.length; i++) {
                      if (i < element.length-1) {
                        // console.log(' ', element[i][0], element[i][1])
                        d2 += element[i][0] +','+ element[i][1] +' ' 
                      } else {
                        d2 += element[i][0] +','+ element[i][1] +' Z' 
                      }
                    }
                    d += d2
                  }

              })

              /// обновляем points 
              //_this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points = newPointsPersents;
              //console.log('d_new ', d_new)
              path.attr('d', d);
              pathOverlay.attr('d', d);

           })
      }

      // function resizePaths() {


      //     console.log('resizePaths surfaces ', _this.surfaces)
      //     var allSurfaces = _this.surfaces

      //     if(_this.canEditPath) return;
      //     if(_this.needToEnterScale) return;
          
      //     allSurfaces.forEach( surface => {
      //         console.log('resizePaths surface ', surface)
      //         // var newPoints = [[], [], [], [], [], [], [], []], 
      //         // newPointsPersents = [[], [], [], [], [], [], [], []],
      //         var newPoints = [], 
      //         newPointsPersents = [],
      //         circle;
      //         dragging = true;

      //         var pathIndex = surface.id
      //         var pathOverlayIndex = surface.id.split('-')[0] + '-overlay-' + surface.id.split('-')[1]
      //         var circlesIndex = surface.id.split('-')[0] + '-group-' + surface.id.split('-')[1]
              
            
      //         var path = d3.select('#'+pathIndex);
      //         var pathOverlay = d3.select('#'+pathOverlayIndex);
      //         var circles = d3.select('#'+circlesIndex+'-0').selectAll('circle')

      //         for (var i = 0; i < circles[0].length; i++) {
      //             var circle = d3.select(circles[0][i]);
      //             if (circle.attr('cx') != NaN) {
      //               newPoints.push([])
      //               var pathIndex = d3.select(circle.node().parentNode).attr("id").split('-')[3]
      //               newPoints[pathIndex].push( [parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))] );
                    
      //               newPointsPersents.push([])
      //               var pointInPers = _this.convertAbsoluteToPersent([parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))])
      //               newPointsPersents[pathIndex].push( pointInPers );
        
      //             } 
      //         }
      //         // console.log ('newPoints ', newPoints)
      //         // console.log ('newPointsPersents ', newPointsPersents)
      //         var d_new = ''
      //         newPoints.forEach((element, i) => {
      //             if (element.length) {
      //               var d = 'M ';
      //               for(var i = 0; i < element.length; i++) {
      //                 if (i < element.length-1) {
      //                   d += element[i][0] +','+ element[i][1] +' ' 
      //                 } else {
      //                   d += element[i][0] +','+ element[i][1] +' Z' 
      //                 }
      //               }
      //               d_new += d
      //             }
      //         })

      //         /// обновляем points 
      //         //_this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points = newPointsPersents;
      //         //console.log('d_new ', d_new)
      //         path.attr('d', d_new);
      //         pathOverlay.attr('d', d_new);

      //      })
      // }

      setTimeout(() => {
        this.allIsShow = true;
      }, 1000);

      

    },
    //// сделать setPerspectiva forEach на фоне!

    setPerspectiva() {
      this.getSourcePoints()
      this.getPerspectivaHandlerTargetPoints()
      d3.select("#persectivaContainer svg#persectivaHandler").remove();
      d3.select("#persectivaContainer svg#persectiva").remove(); //
      //
      var _this = this;

      const activePoints = this.activeSurfacePoints
      
      // console.log('activePoints ', activePoints)
      // console.log('activeSurfacePoints ', this.activeSurfacePoints)
      // console.log('activeSurfaceData ', this.activeSurfaceData)


      /////////
      var _this = this;
      var svgContainer = this.$refs.svgContainer;
      var containerWidth = svgContainer.clientWidth
      var containerHeight = svgContainer.clientHeight

      var margin = {top: 0, right: 0, bottom: 0, left: 0},
          width = containerWidth - margin.left - margin.right,
          height = containerHeight - margin.top - margin.bottom;

      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

      if (!_this.targetPoints.length) {
        _this.getPerspectivaHandlerTargetPoints()
      }
      var targetPoints = _this.targetPoints

      if (_this.viewBox.w != undefined) {
        var viewBoxW = _this.viewBox.w
        var viewBoxH = _this.viewBox.h
      } else {
        var viewBoxW = _this.containerWidth
        var viewBoxH = _this.containerHeight
      }

      d3.select("#persectivaContainer").selectAll("svg")
          .data(["persectiva", "persectivaHandler"])
          .enter().append("svg")
          .attr("id", function(d) { return d; })
          .attr('height', '100%')
          .attr('width', '100%')
          //.attr('viewBox','0 0 '+viewBoxW+' '+viewBoxH)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var svgTransform = d3.select("#persectiva")
          .style(transform + "-origin", margin.left + "px " + margin.top + "px 0");

      var svgFlat = d3.select("#persectivaHandler"); //

      // svgTransform.select("g").selectAll(".line--x")
      //     .data(d3.range(0, width + 1, 50))
      //     .enter().append("line")
      //     .attr("class", "line line--x")
      //     .attr("x1", function(d) { return d; })
      //     .attr("x2", function(d) { return d; })
      //     .attr("y1", 0)
      //     .attr("y2", height);

      // svgTransform.select("g").selectAll(".line--y")
      //     .data(d3.range(0, height + 1, 50))
      //     .enter().append("line")
      //     .attr("class", "line line--y")
      //     .attr("x1", 0)
      //     .attr("x2", width)
      //     .attr("y1", function(d) { return d; })
      //     .attr("y2", function(d) { return d; });

      var handle = svgFlat.select("g").selectAll(".handle")
          .data(targetPoints)
          .enter().append("circle")
          .attr("class", "handle")
          //.attr("transform", function(d) { return "translate(" + d + ")"; })
          .attr("cx", function(d) { return d[0]; })
          .attr("cy", function(d) { return d[1]; })
          .attr("r", 7)
          .call(d3.behavior.drag()
            .origin(function(d) { return {x: d[0], y: d[1]}; })
            .on("drag", dragged));

      function dragged(d) {
        d3.select(this).attr("cx", d[0] = d3.event.x);
        d3.select(this).attr("cy", d[1] = d3.event.y);
        _this.perspectivaTransformed()
      }
      window.addEventListener("resize", _this.perspectivaResized);
      //_this.$store.commit('setPerspectivaMode', false)
      //this.hidePerspectiva()
      _this.perspectivaTransformed()

    },
    onResize() {
      // this.containerWidth = this.$refs.svgContainer.clientWidth
      // this.containerHeight = this.$refs.svgContainer.clientWidth / this.imageCurrent.ratio

      let containerWidthNow = this.$refs.svgContainer.clientWidth
      let containerHeightNow = this.$refs.svgContainer.clientWidth / this.imageCurrent.ratio

      this.mainZoneWidth = containerWidthNow
      this.mainZoneHeight = containerHeightNow
      this.scaleW = 1 / this.viewBox.w
      this.scaleH = 1 / this.viewBox.h

      d3.select('#svgContainer svg')
        .style('width', containerWidthNow + 'px')
        .style('height', containerHeightNow + 'px');
      
      d3.select('#svgContainer svg #mainImage')
          .attr('height', containerHeightNow)
          .attr('width', containerWidthNow) 

      // projection and path setup
      var _this = this  

      d3.selectAll('#svgContainer svg path').attr('d', this.path);
      
      this.x.range([0, containerWidthNow]);
      this.y.range([0, containerHeightNow]);

      d3.selectAll('#svgContainer svg circle')
        // .data([+d3.select(this).attr("cx"), +d3.select(this).attr("cy")])
        .attr("cx", d => { 
          var newCX = _this.x(d.x/_this.containerWidth)
          return newCX
        })
        .attr("cy", d => _this.y(d.y/_this.containerHeight))

      d3.selectAll("#persectivaContainer svg#persectivaHandler circle")  
        // .data([+d3.select(this).attr("cx"), +d3.select(this).attr("cy")])
        .attr("cx", d => { 
          var newCX = _this.x(d[0]/_this.containerWidth)
          return newCX
        })
        .attr("cy", d => _this.y(d[1]/_this.containerHeight))
    },
    perspectivaTransformed() {
      var _this = this
      //console.log('transformed')
        // console.log('transformed sourcePoints', JSON.stringify(this.sourcePoints))
        // console.log('transformed targetPoints',JSON.stringify(this.targetPoints))
      var targetPoints = this.targetPoints  
      for (var a = [], b = [], i = 0, n = _this.sourcePoints.length; i < n; ++i) {
        var s = _this.sourcePoints[i], t = _this.targetPoints[i];

        a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
        a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);

      }
      // console.log('this.solve a', a)
      // console.log('this.solve b', b)
      var X = window.solve(a, b, true);        
      var matrix = [
        X[0], X[3], 0, X[6],
        X[1], X[4], 0, X[7],
          0,    0, 1,    0,
        X[2], X[5], 0,    1
      ].map(function(x) {
        return d3.round(x, 6);
      });

      var svgTransform = d3.select("#persectiva")
      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";
      
      svgTransform.style(transform, "matrix3d(" + matrix + ")");
      console.log('transformed matrix ', matrix)
      console.log('transformed targetPoints ', targetPoints)

      let targetPointsInPers

      targetPointsInPers = targetPoints.map ( point => {
        return _this.convertAbsoluteToPersent(point)
      })

      console.log('targetPointsInPers ', targetPointsInPers)

      //var pointInPers = _this.convertAbsoluteToPersent([parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))])

      //_this.matrix = matrix
      this.areas[this.activeAreaIndex].surfaces[this.activeSurface].perspectiva = targetPointsInPers
      this.areas[this.activeAreaIndex].surfaces[this.activeSurface].matrix = matrix
      // this.targetPoints = targetPoints
    },
    perspectivaResized() {
      var _this = this

      var containerWidth = this.$refs.svgContainer.clientWidth
      var containerHeight = this.$refs.svgContainer.clientHeight

      var margin = {top: 0, right: 0, bottom: 0, left: 0},
          width = containerWidth - margin.left - margin.right,
          height = containerHeight - margin.top - margin.bottom;

      let sourcePointsOnResize = [[0, 0], [width, 0], [width, height], [0, height]];


      var allCircles = d3.selectAll("#persectivaContainer svg#persectivaHandler circle")
      let targetPointsOnResize = []
      //console.log('allCircles ', allCircles) 

      allCircles[0].map ( circle => {
        targetPointsOnResize.push([+d3.select(circle).attr("cx"), +d3.select(circle).attr("cy")])
      })
      console.log('targetPointsOnResize ', targetPointsOnResize)  
// // .data([+d3.select(this).attr("cx"), +d3.select(this).attr("cy")])
        // .attr("cx", d => { 
        //   console.log('svg#persectivaHandler circle ', +d3.select(this).attr("cx"))

        //   var newCX = _this.x(d[0]/_this.containerWidth)
        //   return newCX
        // })
        // .attr("cy", d => _this.y(d[1]/_this.containerHeight))

      var targetPoints = this.targetPoints  
      for (var a = [], b = [], i = 0, n = sourcePointsOnResize.length; i < n; ++i) {
        var s = sourcePointsOnResize[i], t = targetPointsOnResize[i];

        a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
        a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);

      }
      // console.log('this.solve a', a)
      // console.log('this.solve b', b)
      var X = window.solve(a, b, true);        
      var matrix = [
        X[0], X[3], 0, X[6],
        X[1], X[4], 0, X[7],
          0,    0, 1,    0,
        X[2], X[5], 0,    1
      ].map(function(x) {
        return d3.round(x, 6);
      });

      var svgTransform = d3.select("#persectiva")
      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";
      
      svgTransform.style(transform, "matrix3d(" + matrix + ")");
      console.log('perspectivaResized matrix ', matrix)
      // console.log('perspectivaResized targetPoints ', targetPoints)

    
      let targetPointsInPers

      targetPointsInPers = targetPoints.map ( point => {
        return _this.convertAbsoluteToPersent(point)
      })

      console.log('targetPointsInPers ', targetPointsInPers)

      //var pointInPers = _this.convertAbsoluteToPersent([parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))])

      //_this.matrix = matrix
      //this.areas[this.activeAreaIndex].surfaces[this.activeSurface].perspectiva = targetPointsInPers
      this.areas[this.activeAreaIndex].surfaces[this.activeSurface].matrix = matrix
      // this.targetPoints = targetPoints
    },
    getSourcePoints() {
      var containerWidth = this.$refs.svgContainer.clientWidth
      var containerHeight = this.$refs.svgContainer.clientHeight

      var margin = {top: 0, right: 0, bottom: 0, left: 0},
          width = containerWidth - margin.left - margin.right,
          height = containerHeight - margin.top - margin.bottom;

      this.sourcePoints = [[0, 0], [width, 0], [width, height], [0, height]];
      //console.log('getSourcePoints ', this.sourcePoints)
    },
    getPerspectivaHandlerTargetPoints () {
      if (this.areas[this.activeAreaIndex]) {
      
        console.log('this.activeSurfacePoints ', this.allSurfacePoints)
        
        let activePoints = this.activeSurfacePoints
        /// convert to pointsPix
        activePoints = activePoints.map( points => {
          //console.log('points ', points)
          var points = this.convertPersentToAbsolute(points)
          //console.log('points 2', points)
          return points
        })
        // console.log('getPerspectivaHandlerTargetPoints this.activeAreaIndex ', this.activeAreaIndex)
        // console.log('getPerspectivaHandlerTargetPoints this.activeSurface ', this.activeSurface)
        // console.log('getPerspectivaHandlerTargetPoints this.activeSurface ', this.areas[this.activeAreaIndex].surfaces[this.activeSurface])
        // console.log('getPerspectivaHandlerTargetPoints activePoints ', activePoints)
        console.log('this.activeSurfacePerspectiva ', this.activeSurfacePerspectiva)    
          if (this.activeSurfacePerspectiva != '') {
                  // var perspectiva = this.areas[this.activeAreaIndex].surfaces[this.activeSurface].perspectiva
                  
                  let perspectivaInPix
                  perspectivaInPix = this.activeSurfacePerspectiva.map ( point => {
                    //console.log('point ', point)
                    return this.convertPersentToAbsolute(point)
                  })
                  //console.log('perspectivaInPix ', perspectivaInPix)
                  this.targetPoints = [
                    perspectivaInPix[0],
                    perspectivaInPix[1],
                    perspectivaInPix[2],
                    perspectivaInPix[3],
                  ]
          } else {
            ////// найти способ определенеи перспективы для 4 точек
            if (activePoints.length === -1) {
              console.log('getPerspectivaHandlerTargetPoints 4 ', activePoints)

              ///// сортируем точки top/left, top/right, bottom/left, bottom/right

                function compareX(a, b) {
                    if (a[0] > b[0]) return 1;
                    if (b[0] > a[0]) return -1;
                    return 0;
                }
                function compareY(a, b) {
                    if (a[1] > b[1]) return 1;
                    if (b[1] > a[1]) return -1;
                    return 0;
                }
                var activePoints0 = [...activePoints]
                var activePoints1 = [...activePoints]
                var activePoints2 = [...activePoints]

                var sortX = activePoints1.sort(compareX)
                var sortY = activePoints2.sort(compareY)

                console.log("sortX ", sortX)
                console.log("sortY ", sortY)

                var sorted = {
                    p0: [],
                    p1: [],
                    p2: [],
                    p3: []
                }
                if (sortX[0][0] == sortY[0][0] && sortX[0][1] == sortY[0][1] || sortX[0][0] == sortY[1][0] && sortX[0][1] == sortY[1][1]) {
                    sorted.p0 = sortX[0] 
                }
                if (sortX[3][0] == sortY[3][0] && sortX[3][1] == sortY[3][1] || sortX[3][0] == sortY[2][0] && sortX[3][1] == sortY[2][1]) {
                    sorted.p2 = sortX[3] 
                }
                var index0 = activePoints0.findIndex (item => item[0] == sortX[0][0] && item[1] == sortX[0][1])
                activePoints0.splice(index0,1);
                var index3 = activePoints0.findIndex (item => item[0] == sortX[3][0] && item[1] == sortX[3][1])
                activePoints0.splice(index3,1);
                activePoints0.sort(compareY)
                sorted.p1 = activePoints0[1]
                sorted.p3 = activePoints0[0]

                console.log('sorted ', sorted)

                this.targetPoints = [
                    sorted.p0,
                    sorted.p1,
                    sorted.p2,
                    sorted.p3,
                ]
           
           } else {
                var allX = []
                var allY = []
                activePoints.map((item) => {
                    allX.push(item[0])
                    allY.push(item[1])
                })
                var Xmin = Math.min.apply(null, allX)
                var Xmax = Math.max.apply(null, allX)
                var Ymin = Math.min.apply(null, allY)
                var Ymax = Math.max.apply(null, allY)

                this.targetPoints = [
                  [Xmin, Ymin],
                  [Xmax, Ymin],
                  [Xmax, Ymax],
                  [Xmin, Ymax],
                ]
            }
        }      
       console.log('getTargetPoints ', this.targetPoints)
      }
    },
    showHoveredSurface(surface) {
      // console.log('surface ', surface)
      if (surface) {
        this.hoveredSurface = surface.id
      } else {
        this.hoveredSurface = undefined
      }
    },
    editHoveredSurface(surface) {
      var area = surface.id.split('-')[0]
      var surface = surface.id.split('-')[1]
      this.editSurface(area, surface)
    },
    editSurface(area, surface) {
      this.$store.commit('setActiveStage', 'edit-surface')
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
    },

    convertAbsoluteToPersent (mouseData) {
        var x = mouseData[0] / this.mainZoneWidth
        var y = mouseData[1] / this.mainZoneHeight
        return [x,y]
      }, 
    convertPersentToAbsolute (data) {
        // console.log('this.mainZoneWidth ', this.mainZoneWidth)
        var x = Math.ceil(data[0] * this.mainZoneWidth)
        var y = Math.ceil(data[1] * this.mainZoneHeight)
        return [x,y]
    },

    hideAllCircles() {
      d3.selectAll('circle').style('visibility', 'hidden')
    },
    showAllCircles() {
      d3.select('#'+this.activeArea+'-group-'+this.activeSurface).selectAll('circle').style('visibility', 'visible')
    },
    getClickedPathData(id) {
      console.log(id.split('-')[0]+'-'+id.split('-')[2])
      var area = id.split('-')[0]
      var surface = id.split('-')[2]
      
      // this.$store.commit('setActiveStage', this.allStages[2])
      // this.$store.commit('setActiveArea', area)
      // this.$store.commit('setActiveSurface', surface)
      this.editSurface(area, surface)
    },
    getLastSurfaceNum() {
        //_this.areas[_this.activeAreaIndex].surfaces.length
        console.log('this.activeArea ', this.activeArea, this.areas)
        var area = this.areas.find(o => o.id === this.activeArea)
        if (area.surfaces.length) {
          var num = area.surfaces[area.surfaces.length-1].num + 1
        } else {
          var num = 0
        }
        
        console.log('getLastSurfaceNum ', area.surfaces, num)

        return num
    },

    hidePerspectiva() {
      d3.select('#persectivaHandler').style('visibility', 'hidden')
      d3.select('#persectiva').style('visibility', 'hidden')
      
      this.isShow = false;
      console.log('hidePerspectiva ', this.isShow)
      this.$store.commit('setPerspectivaMode', false)
    },
    showPerspectiva() {
      this.setPerspectiva()
      d3.select('#persectivaHandler').style('visibility', 'visible')
      d3.select('#persectiva').style('visibility', 'visible')
      this.isShow = true;
    },
    removeFromPath() {
         this.$store.commit('setActiveStage', 'cut-surface')
         this.canDrawPath = true;
         this.canRemoveFromPath = true;
         
    },
    canDraw() {
      this.canDrawPath = !this.canDrawPath
    },
    editSurface(area, surface) {
      //console.log('editSurface ', area, surface)
      this.$store.commit('setActiveStage', 'edit-surface')
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
    },
   
  },
  mounted () {
    this.getProject()
    window.addEventListener('resize', this.onResize)

    this.width = parseInt(d3.select('#svgContainer').style('width'));
    this.height = parseInt(d3.select('#svgContainer').style('height'));
    this.margin = ({top: 25, right: 20, bottom: 35, left: 40})
    this.percent = d3.format('%')

    this.x = d3.scale.linear()
      .range([0, this.width])
      .domain([0, 1]); 

    this.y = d3.scale.linear()
      .range([this.height], 0)
      .domain([0, 1]);   

  },
  computed: {
    state() {
      return this.$store.getters.getState
    },
    imageCurrent() {
      let imageCurrent;
      if (this.activeStage == 'edit-surface' || this.activeStage == 'add-material') {
        imageCurrent = this.$store.getters.getImageOriginal
      } else {
        imageCurrent = this.$store.getters.getImageCurrent
      }
      return imageCurrent
    },
    imageUploaded() {
      return this.$store.getters.getImageUploaded
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
    surfaces() {
      var surfaces1 = this.$store.getters.getAreas[0].surfaces
      var surfaces2 = this.$store.getters.getAreas[1].surfaces
      var surfaces3 = surfaces1.concat(surfaces2);
      
      return surfaces3
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
    activeSurfacePerspectiva () {
      return this.$store.getters.getActiveSurfacePerspectiva
    },
    activeSurfacePoints () {
      return this.$store.getters.getActiveSurfacePoints
    },
    allSurfacePoints () {
      return this.$store.getters.getAllSurfacePoints
    },
    perspectivaMode () {
      return this.$store.getters.getPerspectivaMode
    },
    selectedColor () {
      return this.$store.getters.getSelectedColor
    },
    projectScale () {
      return this.$store.getters.getProjectScale
    },
    viewBox () {
      return this.$store.getters.getViewBox
    },
    projectID () {
      return this.$store.getters.getActiveID
    },
    isLoading() {
      return this.$store.getters.getLoadingState
    },
    hoveredSurfaceFromMenu() {
      return this.$store.getters.getHoveredSurface
    }


  },
  created () {
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')

    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  },
  watch: {
   hoveredSurfaceFromMenu: function (newVal, oldVal) {
     console.log('hoveredSurfaceFromMenu ', newVal)
     if (newVal != undefined) {
       console.log('hoveredSurfaceFromMenu 1 ', newVal)
       console.log ('d3 ', d3.select('#'+newVal))
       d3.select('#'+newVal)
            .attr('stroke', '#DC630C')
            .attr('stroke-opacity', '1')
            .attr('stroke-width', '3')
     } else {
      console.log('hoveredSurfaceFromMenu 2 ', oldVal)
      d3.select('#'+oldVal)
            .attr('stroke', '#DC630C')
            .attr('stroke-opacity', '1')
            .attr('stroke-width', '0')
      }
    },
    surfaces: async function (newVal, oldVal) {
        
        if (newVal.length < oldVal.length) {
          console.log('перерисовка initD3Project')
          const response = await this.$axios.$put('/project/'+this.projectID, this.state)
          console.log('перерисовка response: '+JSON.stringify(response))
          this.initD3Project()
        }
    },
    activeStage: function (newVal, oldVal) {
      if (newVal == 'start') {
        d3.select('image').attr("xlink:href", this.imageCurrent.url) 
        this.hideAllCircles()
        this.hidePerspectiva()
        this.canEditPath = false
        this.canCutPath = false;
        console.log('paths ', d3.selectAll('path'))
        // d3.selectAll('path')
        //     .attr('stroke', 'none')
        //     .attr('fill-opacity', 0)
      }
      if (newVal == 'set-scale') {
        this.hideAllCircles()
        this.canEditPath = true
        this.canDrawPath = true;
        this.canCutPath = false;
      } 
      if (newVal == 'draw-surface') {
        this.canEditPath = true
        this.canDrawPath = true;
        this.canCutPath = false;
      } 
      if (newVal == 'edit-surface') {
        //this.canDrawPath = true;
        // this.canDrawPath = true;
        // this.initD3Project()
        d3.select('image').attr("xlink:href", this.imageCurrent.url) 
        // this.canEditPath = false
        // this.canCutPath = false;
        this.showAllCircles()
        d3.selectAll('path')
            .attr('stroke', 'rgb(19, 78, 191)')
            .attr('stroke-opacity', '1')
            .attr('stroke-width', '3')
            .attr('fill-opacity', 0.25)
      } 
      if (newVal == 'cut-surface') {
        this.canCutPath = true;
        this.showAllCircles()
      } 

      if (newVal == 'add-material') {
        this.setPerspectiva()
        this.hideAllCircles()
        d3.select('image').attr("xlink:href", this.imageCurrent.url) 
        d3.selectAll('path')
            .attr('stroke', 'none')
            .attr('fill-opacity', 0)
      }

      if (newVal == 'save-project') {
        this.hideAllCircles()
      }

      //$nuxt.$emit('onchange', data);
    },
    perspectivaMode: function (newVal, oldVal) {
      console.log('watch perspectivaMode', newVal, oldVal)
      if (newVal == true) {
        this.showPerspectiva();
      }
      //$nuxt.$emit('onchange', data);
    },
    projectScale: function (newVal, oldVal) {
      if (newVal == 0) {
        this.projectScaleProcent = '30%'
      } else if (newVal > 0 && newVal <= 1 ) {
        this.projectScaleProcent = '30%'
      } else if (newVal > 1 && newVal <= 2 ) {
        this.projectScaleProcent = '25%'
      } else if (newVal > 2 && newVal <= 3 ) {
        this.projectScaleProcent = '20%'
      } else if (newVal > 3 && newVal <= 4 ) {
        this.projectScaleProcent = '15%'
      } else if (newVal > 4 && newVal <= 5 ) {
        this.projectScaleProcent = '10%'
      } else if (newVal > 5 && newVal <= 6 ) {
        this.projectScaleProcent = '5%'
      } else if (newVal > 6 && newVal <= 7 ) {
        this.projectScaleProcent = '4%'
      } else if (newVal > 7 && newVal <= 8 ) {
        this.projectScaleProcent = '3%'
      } else if (newVal > 8 && newVal <= 9 ) {
        this.projectScaleProcent = '2%'
      } else if (newVal > 9 && newVal <= 10 ) {
        this.projectScaleProcent = '1%'
      } else if (newVal > 10) {
        this.projectScaleProcent = '1%'
      }
       
    },
    isLoading: function (newVal, oldVal) {
      if(newVal) {
        this.loadingIsShow = true
      } else (
        this.loadingIsShow = false
      )
    },
    // 'tag': 'initItems',
  }
}
</script>

<style lang="scss">

// @import 'assets/scss/main.scss'; 

// .visualizer-wrap {
//   position: relative;
//   width: 100%;
//   height: 100%;
// }
// #print {
//   overflow: hidden;
// }
// .main-zone {
//   position: relative;
//   width: 100%;
//   visibility: hidden;
//   opacity: 0;
//   @include base-transition(all);

//   &.show {
//     visibility: visible;
//     opacity: 1;
//   }

//   div {
//     width: 100%;
//   }
//   &.start {
//     path {
//       //stroke: none
//     }
//   }

// }

// .loading{
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   visibility: visible;
//   opacity: 1;
//   display: flex;
//   // align-items: center;
//   justify-content: center;
//   z-index: 9999;
//   padding-top: 25%;
//   @include base-transition(all);

//   &.hide {
//     visibility: hidden;
//     opacity: 0;
//   }

//   &.show {
//     visibility: visible;
//     opacity: 1;
//   }

//   img {
//     // position: relative;
//     // display: block;
    
//     width: 60px;
//     height: 60px;
//   }

// }


// .line {
//     stroke: #fff;
//     stroke-opacity: 1;
//     stroke-width: 1px;
//     stroke-linecap: square;
// }

// .handle {
//     fill: none;
//     pointer-events: all;
//     stroke: #fff;
//     stroke-width: 3px;
//     cursor: move;
// }

// .material-container {
//     position: absolute;
//     width: 100%;
//     height: 100%;
//     top: 0;
//     left: 0;
//     background: rgba(0, 0, 0, .5);
//     z-index: 999;
//     overflow: hidden;
//     //background: rgba(221, 99, 13, .5);

//     &.down {
//       z-index: -1;
//     }
// }

// .material-item {
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     /// transform: perspective(600px) rotateY(-50deg);
//     background-size: 50%;
//     transform-origin: 0px 0px 0px;
//     cursor: pointer;
// }
//  ////

// label {
//   margin-bottom: 5px;
//   margin-left: 0px;
//   font-size: 12px;
// }




// #svgContainer {
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   z-index: 999;
//   &.can-cut {

//     .path-overlay {
//       display: none;
//     }
  
//   }
//   svg {
//     position: absolute;
//     cursor: default;

//     circle:hover {
//       cursor: pointer;
//     }

//     path {

//       // &:hover {
//       //   cursor: pointer;
//       //   stroke-opacity: 1;
//       //   stroke-width: 5;
//       // }
//     }

    
  
//   }

//   &.can-draw {
//     svg {
//       cursor: crosshair;
//     }
//   }
// }

// #persectivaContainer {
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   z-index: 9999;
//   display: none;

//   &.show {
//     display: block;
//   }

//   svg {
//     position: absolute;
//     cursor: crosshair;
//     left: 0px;
//     top: 0px;
//     overflow: initial;

//     circle:hover {
//       cursor: pointer;
//     }

//     &#persectiva {
//       background: red;
//     }


  
//   }
// }


</style>
