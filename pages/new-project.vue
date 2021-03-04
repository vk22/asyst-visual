<template>
<div class="app-container">
  
  <materials-panel :panelshowmode="panelShowMode"></materials-panel>

  <div class="menu-panel">


  </div>
  <div class="visualizer" ref="printMe">
    <!-- <VizualizatorUpload ref="VizualizatorMain"/>   -->
    <upload-photo mode="index"/>
  </div>

  <div class="right-panel">

  </div>
   
</div>
</template>

<script>
import UploadPhoto from '~/components/UploadPhoto.vue'
import VizualizatorUpload from '~/components/VizualizatorUpload.vue'
import MaterialsPanel from '~/components/MaterialsPanel.vue'
import VueHtml2Canvas from '../node_modules/html2canvas/dist/html2canvas.min.js';
//import VueHtml2Canvas from '../node_modules/vue-html2canvas/dist/index.js';

export default {
  //middleware: ['auth'],
  components: {
    VizualizatorUpload,
    MaterialsPanel,
    UploadPhoto
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
    async startProject() {
      const response = await this.$axios.$post('add-project', {state: this.$store.state, user: this.$auth.user.id})
      console.log('response: '+JSON.stringify(response))
      this.projectID = response.projectID;

      this.$router.push({
        path: '/projects/'+response.projectID
      })
    }

  },
  mounted() {

    this.$store.commit('resetState')

  },
  created() {
    this.$nuxt.$on('toggle-panel', (data) => {
      this.panelShowMode = !this.panelShowMode
    })
  },
  computed: {
    imageExist() {
      return this.$store.getters.getImageExist
    },
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

.app-container {
    position: relative;
    width: 100%;
    display: flex;
    padding: 0 1rem;


    .visualizer {
      flex: auto;
      padding: 0 1rem;
      height: calc(100vh - 10rem);

    }
}

</style>

