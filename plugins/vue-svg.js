import Vue from 'vue'
//import svgJs from "./vueSvgPlugin"
import { SVG } from '@svgdotjs/svg.js'

Vue.use(SVG)



// export default ({ app }, inject) => {
//     app.svg = require(`imports-loader?this=>window,fix=>module.exports=0!svg.js/dist/svg.js`);
//     console.log('app.svg ', app.svg())
// }