import Vue from 'vue'
import svgJs from "./vueSvgPluginDraggable"


Vue.use(svgJs)



// export default ({ app }, inject) => {
//     app.svg = require(`imports-loader?this=>window,fix=>module.exports=0!svg.js/dist/svg.js`);
//     console.log('app.svg ', app.svg())
// }