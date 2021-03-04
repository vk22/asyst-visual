<template>
  <div class="app-container">
    <div class="container-fluid">
      <div class="projects-list row">
        <div class="col-4" v-for="project in projects" :key="project.id">
          <div class="project-item" v-if="project.state.imageCurrent">
              <button class="delete-btn" @click="showDeletePostModal(project)">
                Удалить
              </button>
              <nuxt-link :to="'/projects/'+project._id">
                <img :src="project.state.imageCurrent.url" class="img-cover" alt="" >
              </nuxt-link>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>

import adminDeleteModal from '~/components/adminDeleteModal.vue'

export default {
  //middleware: ['auth'],
  components: {

  },
  data() {
    return {

      projects: []

    }
  },
  methods: {
    close() {
        console.log('after-close')
    },
    async getProjects() {
        const response = await this.$axios.$get('/projects/'+this.$auth.user.id)
        
        if (response.projects.length) {
          this.projects = response.projects;
        } else {
          this.$router.push('new-project')
        }
        //console.log('this.projects  ', this.projects )
    },
    showDeletePostModal (project) {
        var _this = this
        this.$modal.show(adminDeleteModal, {
          project: project,
        }, {
          draggable: false,
          width: 400,
          height: 185,

        },{
          //'before-open': this.beforeOpen(data),
          'before-close': function() {
            _this.getProjects()
          }
        })
    },  


  },
  mounted() {
    this.getProjects()
  },
  created() {

  },
  computed: {

  }

}
</script>

<style lang="scss">

@import 'assets/scss/main.scss';

.projects-list {

  .project-item {
    display: block;
    position: relative;
    margin-bottom: 30px;
    padding-bottom: 66.65%;
    overflow: hidden;
    &:hover {
      opacity: .75;
    }

    .delete-btn {
      border: 1px solid #ddd;
      background: #fff;
      color: #111;
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 999;
      font-size: .75rem;
      &:hover {
        background: crimson;
        color: #fff;
      }

    }
  }

}

</style>

