const ora = require('ora')
const path = require('path')
const fs = require('fs')
const error = require('../utils/error')
const code_execute = require('../utils/code_execute')
// const code_execute = require('../utils/execution_node')

module.exports = async (args) => {

    const file_path = args._[1]

    // console.log(`Checking for ${file_path}...`)
    // console.log("")

    if (!fs.existsSync(file_path)) {
        error("file was not found", true)
    }

    // const found_files = scanForFiles('.', /\.apicanary.js$/)

    // console.log("Publishing the following files:", found_files)

    const canary_test_code = fs.readFileSync(file_path,{ encoding: 'utf8' })

    // console.log("Before code_execute.handler")
    const spinner = ora().start()
    const execute_response = await code_execute.handler({ "canary_test_code": canary_test_code }, null)
    spinner.stop()

    // console.log("After code_execute.handler")
    console.log("execute_response", execute_response)

    console.log("")
    console.log("finished execution")
    console.log("")


    // const execution_result = await code_execute.handler({ "canary_test_code": canary_test_code })
    //     .catch((err) => {
    //         spinner.stop()
    //         console.log("Caught an execution error:", err)
    //     })

    // spinner.stop()

    // console.log("execution_result", execution_result)

    // console.log("")

    // try {
    // } catch (err) {

    //   spinner.stop()
    //   console.error(err)

    // }
}
