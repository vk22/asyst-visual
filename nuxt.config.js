export default {
  mode: 'spa',
  head: {
    title: 'Asyst Visual',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, user-scalable=no' },
      { hid: 'description', name: 'description', content: 'Asyst Visual' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ],
    script: [
      //{ src: 'http://otm.github.io/svg.path.js/svg.path.js' },
      { src: '/numeric-solve.min.js' },
      { src: '/FileSaver.min.js' },
      { src: '/dom-to-image.js'}
    ]
  },
  // build: {
  //   extractCSS: true
  // },
  modules: [ 
    ['bootstrap-vue/nuxt', {
        icons: true,
    }], 
    '@nuxtjs/axios', 
    '@nuxtjs/auth', 
    '@nuxtjs/toast'
  ],
  plugins: [
    // { src: '~/plugins/vue-html2canvas', ssr: false }
    { src: '~/plugins/vue-js-modal', ssr: false },
    
  ],
  axios: {
    baseURL: '/api/'
  },
  auth: {
    redirect: {
      login: '/login',
      callback: '/login',
      logout: '/login'
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/login', method: 'post', propertyName: 'token' },
          logout: { url: '/logout', method: 'post' },
          user: { url: '/getuser', method: 'get', propertyName: 'user' }
        }
      },
      tokenRequired: true,
      tokenType: ''
    }
  },
  toast: {
    position: 'top-center',
    register: [ // Register custom toasts
      {
        className: 'my-toast',
        name: 'my-error',
        message: 'Oops...Something went wrong',
        options: {
          duration: 3000
        }
      }
    ]
  },
  /*
  ** Build configuration
  */
  build: {
  /*
  ** You can extend webpack config here
  */
  // extend(config, ctx) {
  //   config.module.rules.push( {
  //     test: require.resolve('svg.js'),
  //     use: 'imports-loader?this=>window,fix=>module.exports=0',
  //   } );
  // }

  },
  server: {
    port: 4000, // default: 3000
    host: 'localhost' // default: localhost
  },
  serverMiddleware: [
    // API middleware
    '../api/server'
  ]
}
