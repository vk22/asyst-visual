<template>
  <div>
    <Header></Header>
    <div id="app">
      <nuxt />
    </div>
  </div>  
</template>

<script>
import get from 'lodash.get'

import Header from '~/components/Header.vue'

export default  {
  middleware: ['auth'],
  components: {
    Header
  },
  data() {
    return {

    }
  },
  methods: {
    // userLogout(event) {
    //   event.preventDefault()
    //   this.$auth.logout()
    // }
  },
  mounted() {
    
  },

}
</script>

<style lang="scss">

@import 'assets/scss/main.scss';




</style>
