<template>
    <div class="workspace">
      <div class="material-container" v-for="(item, index) in surfaces" :key="index" :style="{'clip-path':'url(#'+item.clip+')', 'height': imageHeightData+'px'}">
        <div v-if="activeStage != 'edit-surface2'" class="material-item" :id="'material-'+item.id" :style="{backgroundImage: 'url('+ item.material.img +')', transform: 'matrix3d(' + item.matrix + ')'}"></div>
      </div>
      <div :id="svgId2" ref="svgContainer2" class="svg-container2" :class="{'show': isShow}"></div>
      <div :id="svgId" ref="svgContainer" class="svg-container" :class="{'can-draw': canDrawPath, 'can-cut': canCutPath, }">
      </div>
      <!-- <img v-bind:src="img" ref="imgContainer" class="img-thumbnail">   -->
    </div>
</template>

<script>

import * as d3 from '../plugins/d3v3.js'
//import * as d3 from 'd3'

export default {
  middleware: ['auth'],
  name: 'DrawPath',
  components: {

  },
  data () {
    return {
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
      clip: undefined,
      matrix: '1,0,0,0,0,1,6,0,0,0,1,0,50,100,0,1.1',
      points: [],
      canRemoveFromPath: false,
      d: '',
      surfaceArr: [],
      materials: [],
      imageHeightData: null,
      svgWidth: null,
      svgHeight: null
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

    d3InitV3() {
      var _this = this;
      var svgContainer = this.$refs.svgContainer; 
      var containerWidth = this.$refs.svgContainer.clientWidth
      var containerHeight = this.$refs.svgContainer.clientHeight
            
      console.log('svgContainer ', Math.min(containerWidth,containerHeight))

      

      var dragging = false, drawing = false, startPoint;

      var svg = d3.select('#svgContainer').append('svg')
          .attr('height', '100%')
          .attr('width', '100%')
          //.attr('viewBox','0 0 100% 100%')
          //.attr('viewBox','0 0 '+Math.min(containerWidth,containerHeight)+' '+Math.min(containerWidth,containerHeight))
          // .attr('viewBox','0 0 '+containerWidth+' '+containerWidth)
          // .attr('preserveAspectRatio','xMinYMin')

      svg.append("svg:image")
        // .attr('x', 0)
        // .attr('y', 0)
        // .attr('width', '100%')
        // .attr('height', '100%')
        .attr("xlink:href", _this.img)  
        
        
      _this.getImageHeight()  
      // console.log('this.imageHeightData ', _this.imageHeightData)

      // svg
      // .attr('height', _this.imageHeightData)

      
      // var clip = svg.append("clipPath")       // define a clip path
      // .attr("id", "fake-clip") //
      
      var points = [], g;
      // behaviors
      var dragger = d3.behavior.drag()
          .on('drag', handleDrag)
          .on('dragend', function(d){
              dragging = false;
          });

      ///
      svg.on('mouseup', function() {
          if(dragging || !_this.canDrawPath) return;

          drawing = true;
          startPoint = [d3.mouse(this)[0], d3.mouse(this)[1]];
          if(svg.select('g.drawPoly').empty()) g = svg.append('g').attr('class', 'drawPoly');
          if(d3.event.target.hasAttribute('is-handle')) {
              closePolygon();
              return;
          };
          
          points.push(d3.mouse(this));
          //_this.points.push(d3.mouse(this));

          g.select('polyline').remove();
          var polyline = g.append('polyline').attr('points', points)
                          .style('fill', 'none')
                          .attr('stroke', '#000');

          for(var i = 0; i < points.length; i++) { //
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

      function closePolygon() {

          svg.select('g.drawPoly').remove(); //
          
        
          if (_this.canRemoveFromPath) {
            var old_points = _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points;
            var old_d = '';
            old_points.forEach((element, i) => {
              console.log('element ', element)
              if (element.length) {
                var old_d_path = 'M '
                for(var i = 0; i < element.length; i++) {
                  if (i < element.length-1) {
                    old_d_path  += element[i][0] +','+ element[i][1] +' ' 
                  } else {
                    old_d_path  += element[i][0] +','+ element[i][1] +' Z' 
                  }
                  console.log('old_d_path ', old_d_path)
                }
                console.log('old_d ', old_d)
                old_d += old_d_path
              }
            });

            console.log('old_d ', old_d)

            if (points[0][0] < points[1][0]) {
              console.log('по часовой ')
              points = points.reverse()
            } else {
              console.log('против часовой ')
            }

            var new_d = 'M '; 
            for(var i = 0; i < points.length; i++) {
              if (i < points.length-1) {
                new_d += points[i][0] +','+ points[i][1] +' ' 
              } else {
                new_d += points[i][0] +','+ points[i][1] +' Z' 
              }
            }

            var d = old_d + new_d
            console.log('d ', d)

            var path = d3.select('#'+_this.activeArea+'-'+_this.activeSurface);
            var pathOverlay = d3.select('#'+_this.activeArea+'-overlay-'+_this.activeSurface);
            path.attr('d', d);
            pathOverlay.attr('d', d);

            var allPoints = [ old_points, points ]
            old_points.push(points)

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

            console.log('pointsIndex ', pointsIndex)

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

            _this.$store.commit('editSurfaceInArea', surface)

            points = [];              
            drawing = false;
            _this.canDrawPath = false
            _this.canRemoveFromPath = false


          } else {

              var d = 'M '; 

              console.log('points ', points)

              if (points[0][0] < points[1][0]) {
                console.log('по часовой ')
              } else {
                console.log('против часовой ')
                points = points.reverse()
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

              var clip = svg.append("clipPath")       // define a clip path
              .attr("id", clipID)


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

              var g = svg.append('g').attr("id", groupID)

              g.append('path')
                .attr('d', d)
                .attr('fill-opacity', '0')
                .attr('fill', '#e46713')
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

              var newSurface = {
                num: num,
                id: surfaceID,
                clip: clipID,
                points: [ points ],
                material: {},
                matrix: '',
                perspectiva: ''
              }

              ////////////////////////

              _this.$store.commit('addSurfaceInArea', newSurface)
              points = [];              
              drawing = false;
              _this.canDrawPath = false
            
              _this.editSurface(_this.activeArea, num)


          }

     

      }
      svg.on('mousemove', function() {
          if(!drawing) return;
          var g = d3.select('g.drawPoly');
          g.select('line').remove();
          var line = g.append('line')
                      .attr('x1', startPoint[0])
                      .attr('y1', startPoint[1])
                      .attr('x2', d3.mouse(this)[0] + 2)
                      .attr('y2', d3.mouse(this)[1])
                      .attr('stroke', '#0059C7')
                      .attr('stroke-width', 1);
      })

      function handleDrag() {
        ///
          if(drawing) return;
          var dragCircle = d3.select(this), newPoints = [[], [], [], [], [], [], [], []], circle;
          dragging = true;
          var path = d3.select('#'+_this.activeArea+'-'+_this.activeSurface);
          var pathOverlay = d3.select('#'+_this.activeArea+'-overlay-'+_this.activeSurface);
          var circles = d3.select(this.parentNode.parentNode).selectAll('circle');
          console.log('circles ', circles)
          dragCircle
          .attr('cx', d3.event.x)
          .attr('cy', d3.event.y);
          //_this.points = []
          for (var i = 0; i < circles[0].length; i++) {
              circle = d3.select(circles[0][i]);
              //console.log('parentNode ', d3.select(this.parentNode)[0][0].parentNode)
              console.log('circle ', d3.select(circle.node().parentNode).attr("id").split('-')[3])
              var pathIndex = d3.select(circle.node().parentNode).attr("id").split('-')[3]
              console.log('pathIndex ', pathIndex)
              newPoints[pathIndex].push( [parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))] );
              //_this.points.push([parseInt(circle.attr('cx')), parseInt(circle.attr('cy'))]);
          }

          console.log ('newPoints ', newPoints)
          
          var d_new = ''

          newPoints.forEach((element, i) => {
              if (element.length) {
                var d = 'M ';
                for(var i = 0; i < element.length; i++) {
                  if (i < element.length-1) {
                    d += element[i][0] +','+ element[i][1] +' ' 
                  } else {
                    d += element[i][0] +','+ element[i][1] +' Z' 
                  }
                }

                d_new += d
              }
          })

          /// обновляем points 
          _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points = newPoints;
          console.log('d_new ', d_new)
          path.attr('d', d_new);
          pathOverlay.attr('d', d_new);
          
      }

    },
    hideAllCircles() {
      d3.selectAll('circle').style('visibility', 'hidden')
    },
    showAllCircles() {
      d3.selectAll('circle').style('visibility', 'visible')
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
        var num = area.surfaces.length

        return num
    },
    setPerspectiva() {

      d3.select("#svgContainer2 svg#flat").remove();
      d3.select("#svgContainer2 svg#transform2").remove(); //
      //
      var _this = this;

      console.log('perspectiva', _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].perspectiva)
       
      if (_this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].perspectiva != '') {
        var perspectiva = _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].perspectiva
              var targetPoints = [
                perspectiva[0],
                perspectiva[1],
                perspectiva[2],
                perspectiva[3],
              ]
      } else {

        var allX = []
        var allY = []

        _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].points[0].map((item) => {
            allX.push(item[0])
            allY.push(item[1])
        })

        var Xmin = Math.min.apply(null, allX)
        var Xmax = Math.max.apply(null, allX)
        var Ymin = Math.min.apply(null, allY)
        var Ymax = Math.max.apply(null, allY)

        var targetPoints = [
          [Xmin, Ymin],
          [Xmax, Ymin],
          [Xmax, Ymax],
          [Xmin, Ymax],
        ]

      }

      console.log('targetPoints', targetPoints) /////////

      var _this = this;
      var svgContainer = this.$refs.svgContainer;
      var containerWidth = svgContainer.clientWidth
      var containerHeight = svgContainer.clientHeight
      // console.log('containerWidth ', containerWidth)
      // console.log('containerHeight ', containerHeight)
      
      var margin = {top: 10, right: 10, bottom: 10, left: 10},
          width = _this.svgWidth - margin.left - margin.right,
          height = _this.svgWidth - margin.top - margin.bottom;

      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

      var sourcePoints = [[0, 0], [width, 0], [width, height], [0, height]];
          //targetPoints = [[118, 345], [288, 293], [282, 499], [115, 471]]; //


      // this.svgWidth = containerWidth
      // this.svgHeight = imageHeightData

      // _this.viewBoxW = w
      // _this.viewBoxH = h

      d3.select("#svgContainer2").selectAll("svg")
          .data(["transform2", "flat"])
          .enter().append("svg")
          .attr("id", function(d) { return d; })
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var svgTransform = d3.select("#transform2")
          .style(transform + "-origin", margin.left + "px " + margin.top + "px 0");

      var svgFlat = d3.select("#flat"); //

      svgTransform.select("g").selectAll(".line--x")
          .data(d3.range(0, width + 1, 10))
        .enter().append("line")
          .attr("class", "line line--x")
          .attr("x1", function(d) { return d; })
          .attr("x2", function(d) { return d; })
          .attr("y1", 0)
          .attr("y2", height);

      svgTransform.select("g").selectAll(".line--y")
          .data(d3.range(0, height + 1, 10))
        .enter().append("line")
          .attr("class", "line line--y")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", function(d) { return d; })
          .attr("y2", function(d) { return d; });

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

      // d3.selectAll("button")
      //     .datum(function(d) { return JSON.parse(this.getAttribute("data-targets")); })
      //     .on("click", clicked)
      //     .call(transformed);

      function clicked(d) {
        d3.transition()
            .duration(750)
            .tween("points", function() {
              var i = d3.interpolate(targetPoints, d);
              return function(t) {
                handle.data(targetPoints = i(t)).attr("transform", function(d) { return "translate(" + d + ")"; });
                transformed();
              };
            });
      }

      function dragged(d) {
        //d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        d3.select(this).attr("cx", d[0] = d3.event.x);
        d3.select(this).attr("cy", d[1] = d3.event.y);
        transformed();
      }

      function transformed() {
        for (var a = [], b = [], i = 0, n = sourcePoints.length; i < n; ++i) {
          var s = sourcePoints[i], t = targetPoints[i];
          a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
          a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);

        }
        //console.log('this.solve ', _this.solve)
        var X = window.solve(a, b, true);        
        var matrix = [
          X[0], X[3], 0, X[6],
          X[1], X[4], 0, X[7],
            0,    0, 1,    0,
          X[2], X[5], 0,    1
        ].map(function(x) {
          return d3.round(x, 6);
        });

        svgTransform.style(transform, "matrix3d(" + matrix + ")");
        console.log('targetPoints ', targetPoints)
        //_this.matrix = matrix
        _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].perspectiva = targetPoints
        _this.areas[_this.activeAreaIndex].surfaces[_this.activeSurface].matrix = matrix
      }

      transformed()
      //_this.$store.commit('setPerspectivaMode', false)
      //this.hidePerspectiva()

    },
    hidePerspectiva() {
      d3.select('#flat').style('visibility', 'hidden')
      d3.select('#transform2').style('visibility', 'hidden')
      
      this.isShow = false;
      console.log('hidePerspectiva ', this.isShow)
      this.$store.commit('setPerspectivaMode', false)
    },
    showPerspectiva() {
      this.setPerspectiva()
      d3.select('#flat').style('visibility', 'visible')
      d3.select('#transform2').style('visibility', 'visible')
      this.isShow = true;
    },

    // insertImage() {
    //     //this.path.attr({fill: 'url(#siding)', 'fill-opacity': '1'}) activeSurface
    //     //
    //     var material = '/uploads/'+this.activeArea+'/'+this.selectedColor+'.jpg'
    //     //this.surfaceArr[this.activeSurface].material = '/uploads/siding.jpg'
    //     var materialData = {
    //       area: this.activeAreaIndex,
    //       surface: this.activeSurface,
    //       material: material
    //     }
    //     this.$store.commit('insertMaterial', materialData)

    // },
    removeFromPath() {
         this.$store.commit('setActiveStage', this.allStages[3])
         this.canDrawPath = true;
         this.canRemoveFromPath = true;
         
    },
    canDraw() {
      this.canDrawPath = !this.canDrawPath
    },
    editSurface(area, surface) {
      //console.log('editSurface ', area, surface)
      this.$store.commit('setActiveStage', this.allStages[2])
      this.$store.commit('setActiveArea', area)
      this.$store.commit('setActiveSurface', surface)
    },
    getImageHeight() {
      var containerWidth = this.$refs.svgContainer.clientWidth
      var containerHeight = this.$refs.svgContainer.clientHeight
      console.log('containerWidth', containerWidth)

      var myPicXE = document.getElementsByTagName('image')[0];
      var address = myPicXE.getAttribute('href');
      var myPicXO = new Image();
      myPicXO.src = address;
      var w = myPicXO.width
      var h = myPicXO.height
      var ratio = w/h

      console.log('imageHeightData', containerWidth / ratio)
      this.imageHeightData = containerWidth / ratio

      this.svgWidth = containerWidth
      this.svgHeight = this.imageHeightData

      this.viewBoxW = w
      this.viewBoxH = h

      d3.select('#svgContainer svg')
        .attr('width', containerWidth)
        .attr('height', this.imageHeightData)
        //.attr('viewBox','0 0 1000 500')
        //.attr('viewBox','0 0 '+w+' '+h)

      //this.imageHeightData = containerWidth / ratio
    },
   
  },
  mounted () {
    //this.checkIfUserAuth()
    //this.getUserA(this.username)

    setTimeout(() => {
      this.d3InitV3()
    }, 200);
    
    //this.setPerspectiva()

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
    perspectivaMode () {
      return this.$store.getters.getPerspectivaMode
    },
    selectedColor () {
      return this.$store.getters.getSelectedColor
    },


  },
  created () {
    window.addEventListener("resize", this.getImageHeight);
    //this.$axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')

    //window.addEventListener('beforeunload', this.checkIfOrderEmpty)
  },
  watch: {
    activeStage: function (newVal, oldVal) {
      if (newVal == 'start') {
        this.hideAllCircles()
      }
      if (newVal == 'draw-surface') {
        this.canDrawPath = true;
        this.canCutPath = false;
      } 
      if (newVal == 'edit-surface') {
        //this.canDrawPath = true;
        this.canDrawPath = true;
        this.canCutPath = false;
        this.showAllCircles()
      } 
      if (newVal == 'cut-surface') {
        this.canCutPath = true;
        this.showAllCircles()
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

@import 'assets/scss/main.scss'; 

.line {
    stroke: #000;
    stroke-opacity: .5;
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
    //background: rgba(221, 99, 13, .5);
    z-index: 9999
}

.material-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /// transform: perspective(600px) rotateY(-50deg);
    background-size: 100%;
    transform-origin: 0px 0px 0px;
    z-index: 9999
}
 ////

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

.workspace {
  position: relative;
  width: 100%;
  height: 100%;

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

    image {
      width:100%;
      // height:100%;
      position: absolute;
      top:0;
      left:0;
      // bottom:0;
      // right:0;
    }

    
  
  }

  &.can-draw {
    svg {
      cursor: crosshair;
    }
  }
}

#svgContainer2 {
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


  
  }
}


</style>
