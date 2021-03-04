import axios from 'axios'

export default async function ({ $auth, app }) {
  if (!$auth.loggedIn) {
    return
  }

  const sub = $auth.user.sub
  const username = $auth.user.username
  const picture = $auth.user.picture
  const authStrategy = $auth.strategy.name

  //console.log('auth plugin', sub, username, picture)
  // const { data } = await axios.post('/checkuser', { sub: sub, username: username, picture: picture })
  // console.log('data ', data)

  // if (authStrategy === 'facebook' || authStrategy === 'google') {
  //   const token = $auth.token.get().substring(7)
  //   //console.log('token ', token)
  //   // const authStrategyConverted = authStrategy === 'facebook' ? 'fb' : 'google'
  //   const url = `/login?token=${token}`

  //   try {
  //     const { data } = await axios.post(url, { token: token, username: username, password: '123'})
  //     console.log('data ', data.token.accessToken)
  //     $auth.setToken('local', 'Bearer ' + data.token.accessToken)
  //     setTimeout(async () => {
  //       $auth.setStrategy('local')
  //       setTimeout(async () => {
  //         await $auth.fetchUser()
  //       })
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
}
