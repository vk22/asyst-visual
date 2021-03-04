<template>
   <upload-photo mode="index"/>  
</template>

<script>
import UploadPhoto from '~/components/UploadPhoto.vue'
export default {
  //middleware: ['auth'],
  components: {
    UploadPhoto
  },
  data() {
    return {
      user: undefined,
      errors: [],
      show: true,
      playlist: []
    }
  },
  methods: {

  },
  mounted() {

  }

}
</script>

<style lang="scss">

</style>

