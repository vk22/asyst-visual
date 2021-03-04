<template>
 <section class="login-page">
     <div>
       <b-form class="login-form"> 
         <b-form-group description="" label="Login" label-for="username">
           <b-form-input id="username" v-model="username" type="text" required></b-form-input>
         </b-form-group>
         <b-form-group description="" label="Password" label-for="pw">
           <b-form-input id="pw" v-model="password" type="password"> </b-form-input>
         </b-form-group>
         <b-form-group size="">
             <b-button @click="login" class="main-btn">Login</b-button>
           </b-form-group>
       </b-form>
     </div>
    </section>
</template>
<script>
export default {
layout: 'login',
 data() {
     return {
       username:'',
       password:''
     }
   },
  mounted() {},
  watch: {},
  components: {},
  methods: {
    async login() {
      try {
        this.$toast.show('Logging in...');
        await this.$auth.login({
          data: {
            "username": this.username,
            "password": this.password
          }
        }).catch(e => {
          this.$toast.error('Failed Logging In');
        });
        
        if (this.$auth.loggedIn) {
          this.$toast.success('Successfully Logged In');

          setTimeout(() => {
            this.$toast.clear()
          }, 2000);
          
          this.$router.push({
              name: 'projects'
            })
        }
      } catch (e) {        
          this.$toast.error('Username or Password wrong');
      }
    },
    check(){
      console.log(this.$auth.loggedIn)
    },
    logout() {
      this.$toast.show('Logging out...');
      this.$auth.logout()
    },
  } 
}
</script>


<style lang="scss">

@import 'assets/scss/main.scss';

.login-page {
   display: flex;
   justify-content: center;
   align-items: center;
   text-align: center;
   min-height: 100vh;

   .login-form {
    width: 250px;
    text-align: left;
  }

  .btn {
      width: 100%;
  }

 }



</style>