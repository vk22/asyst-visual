<template>
  <div>
      <div class="admin-dialog">
        <h3>Удалить этот проект?</h3>
        <b-row>
          <b-col><button class="btn btn-secondary order-send" @click="$emit('close')">Отмена</button></b-col>
          <b-col><button class="btn btn-danger order-send" @click="deletePost()">Удалить</button></b-col>
        </b-row>
        
        
      </div>
  </div>
</template>

<script>
export default {
    props: ['project'],
    name: 'adminDeleteModal',
    data () {
      return {
        hasError: false,
        responseMessage: '',
        responseStatus: false
      }
    },
    methods: {
      beforeOpen (event) {
        },
      async deletePost () {
        await this.$axios.$delete('/delete-project/'+this.project._id)
        this.$emit('close'); 
        // this.$router.push({
        //     name: 'projects'
        // }) 
      },
    }, 
    created() {
      //console.log('created: '+event.params.title);
    }
 }
</script>


<style scoped>

.v--modal-overlay {
    background: rgba(255, 255, 255, .5);
}


.admin-dialog {
  padding: 3rem 2rem;
  position: absolute;
  width: 100%;
  height: 100%;
}

h3 {
  font-size: 20px;
  margin-bottom: 30px;
}


</style>
