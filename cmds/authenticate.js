const ora = require('ora')

module.exports = async (args) => {

  console.log("Authenticating...")

  const spinner = ora().start()

  try {

    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })

    spinner.stop()

    console.log(`

      Debug - this application is still under development, check an upcoming version soon!

    `)

  } catch (err) {

    spinner.stop()
    console.error(err)

  }
}
