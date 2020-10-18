const ora = require('ora')
const path = require('path')
const fs = require('fs')
const colors = require('colors')
const error = require('../utils/error')
const code_execute = require('../utils/code_execute')
const scanForFiles = require('../utils/scan_for_files')

const outputExecuteResponse = function(file_path, execute_response){
    const success_string = ((execute_response.success_flag) ? 'PASSED'.green : 'FAILED'.red)
    console.log(file_path, success_string)
    if (!execute_response.success_flag) {
        execute_response.log_lines.map((log_line) => {
            console.log("    " + log_line.type + ":", log_line.data)
        })
        console.log("    ERROR:", execute_response.error_message.red)
        // console.log(execute_response.log_lines)
    }
}

const executeLocalTest = async function(file_path){
   // const found_files = scanForFiles('.', /\.apicanary.js$/)

    // console.log("Publishing the following files:", found_files)

    const canary_test_code = fs.readFileSync(file_path,{ encoding: 'utf8' })

    // console.log("Before code_execute.handler")
    // const spinner = ora().start()
    const execute_response = await code_execute.handler({ "canary_test_code": canary_test_code }, null)
    // spinner.stop()

    // console.log("After code_execute.handler")
    outputExecuteResponse(file_path, execute_response)


    // const execution_result = await code_execute.handler({ "canary_test_code": canary_test_code })
    //     .catch((err) => {
    //         spinner.stop()
    //         console.log("Caught an execution error:", err)
    //     })

    // spinner.stop()


    // try {
    // } catch (err) {

    //   spinner.stop()
    //   console.error(err)

    // }
}

module.exports = async (args) => {

    const file_path = args._[1]

    // console.log(`Checking for ${file_path}...`)
    // console.log("")

    let found_files
    if (file_path) {
        if (!fs.existsSync(file_path)) {
            error("file was not found", true)
        }
        found_files = [file_path]
    } else {
        found_files = scanForFiles('.', /\.apicanary.js$/)
    }

    // console.log("Executing the following files:", found_files)

    for(let i=0; i<found_files.length; i++){
        await executeLocalTest(found_files[i])
    }

    console.log("")
    console.log("finished execution")
    console.log("")

 }
