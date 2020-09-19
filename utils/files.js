const axios = require('axios')

module.exports = async (path) => {
  const results = await axios({
    method: 'get',
    url: 'https://api.github.com/emojis',
    params: {},
  })

  return results
}
