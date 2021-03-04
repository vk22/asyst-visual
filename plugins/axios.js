export default function ({ $axios, store, app }) {
  console.log('$axios ', $axios)
  // console.log('store ', store)
  // console.log('app ', app)
  $axios.onRequest(config => {
    //console.log('config ', config)
    config.headers['Content-Type'] = 'application/json'
    config.headers['Access-Control-Allow-Origin'] = '*'
  })
}
