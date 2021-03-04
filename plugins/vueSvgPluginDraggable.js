import svgJsDraggable from "@svgdotjs/svg.js/dist/svg.draggable"

export default {
    install: Vue => {
        Vue.prototype.$svgDraggable = svgJsDraggable
    }
}