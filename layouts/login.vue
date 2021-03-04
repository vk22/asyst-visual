<template>
  <div>
    <div id="app-container">
      <b-container>
      <nuxt />
      </b-container>
    </div>
  </div>  
</template>

<script>
import get from 'lodash.get'

export default  {
  components: {
  },
  data() {
    return {
      showDropDown: false,
      checkTokenInterval: undefined,
      remains: undefined
    }
  },
  methods: {
    userLogout(event) {
      event.preventDefault()
      this.$auth.logout()
    }
  },
  mounted() {
    
  },
  computed: {

  }
}
</script>

<style lang="scss" scoped>

@import 'assets/scss/main.scss';

#app-container {
      background: #fff;
      padding: 0;

      .container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        font-size: 1rem;
        background: #fff; 
        min-height: 100vh;
        max-width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

    }
}





</style>
