// AWS Lambda API Canary Execute code - 2019-02-08

const {
    NodeVM
} = require('vm2')
const util = require('util')
const Domain = require('domain')
const toSource = require('tosource')

const FATAL_ERROR = "FATAL_ERROR"
const SUCCESS = "SUCCESS"
const ERROR = "ERROR"
const LOG = "LOG"

exports.handler = async function (_event, _context, _callback) {

    let finish_called = false

    const return_obj = {
        "success_flag": null,
        "success_message": null,
        "error_message": null,
        "start_execution": new Date().toISOString(),
        "end_execution": null,
        "log_lines": []
    }

    const finishFunction = function (success_flag, return_message) {
        if (finish_called) {
            return
        }
        finish_called = true

        return_obj["end_execution"] = new Date().toISOString()

        if (success_flag) {
            return_obj["success_flag"] = true
            return_obj["success_message"] = convertToString(return_message)
        } else {
            return_obj["success_flag"] = false
            return_obj["error_message"] = convertToString(return_message)
        }

        return _callback(null, return_obj)
    }

    const convertToString = function (data) {
        if (typeof data !== "string") {
            return toSource(data)
        }
        return data
    }

    const updateLogLines = function (type, log_line_data) {
        return_obj["log_lines"].push({
            "date": new Date().toISOString(),
            "type": type,
            "data": convertToString(log_line_data)
        })
    }

    const handleAnError = function (err) {
        let error_message = err
        if (err.message) {
            error_message = err.message
        }

        if (err.stack) {
            updateLogLines(FATAL_ERROR, err.stack)
        } else {
            updateLogLines(FATAL_ERROR, error_message)
        }

        finishFunction(false, error_message)
    }

    const handleConsoleLogCall = function (...restArgs) {
        const log_line_string = restArgs.map((restArg) => {
            return convertToString(restArg)
        }).join(" ")

        updateLogLines(LOG, log_line_string)
    }

    const handleConsoleErrorCall = function (...restArgs) {
        const log_line_string = restArgs.map((restArg) => {
            return convertToString(restArg)
        }).join(" ")

        updateLogLines(ERROR, log_line_string)
    }

    // https://nodejs.org/api/domain.html
    let domain = Domain.create()

    // https://github.com/patriksimek/vm2
    const vm = new NodeVM({
        console: 'redirect',
        require: {
            builtin: ['*'],
            external: true
        },
        sandbox: {
            process: {
                env: process.env
                // env: _event["variable_vault"]
            }
        }
    })

    // Adding listeners
    vm.on('console.log', handleConsoleLogCall)
    vm.on('console.error', handleConsoleErrorCall)
    vm.on('console.dir', handleConsoleLogCall)
    vm.on('console.table', handleConsoleLogCall)
    vm.on('console.info', handleConsoleLogCall)
    vm.on('console.warn', handleConsoleErrorCall)
    domain.on('error', handleAnError)
    process.on('uncaughtException', (err) => handleAnError)

    const event = {
        "variable_vault": {}
    }

    // process.env = {}

    if (_event["variable_vault"]) {
        event["variable_vault"] = _event["variable_vault"]
    }

    const context = {
        // "done": (err, data) => {
        //     if (err) {
        //         return finishFunction(false, err)
        //     }
        //     return finishFunction(true, data)
        // },
        // "succeed": (data) => {
        //     return finishFunction(true, data)
        // },
        // "fail": (data) => {
        //     return finishFunction(false, data)
        // }
    }

    /*
    const canaryTestCodeModule = eval(_event.canary_test_code)
    canaryTestCodeModule(event, context, _callback)
    */

    // https://github.com/patriksimek/vm2/issues/53#issuecomment-300834149
    console.log("before domain.run")
    await domain.run(async() => {
        try {

            const functionInSandbox = vm.run(_event.canary_test_code, 'api_canary_test_runner.js')
            if (typeof functionInSandbox !== "function") {
                return finishFunction(false, "Test did not export a function")
            }

            const is_async_function = ((functionInSandbox[Symbol.toStringTag] === "AsyncFunction") ? true : false)

            console.log("is_async_function", is_async_function)

            // await Promise.resolve( functionInSandbox(/* args needed */) ).then( value => {
            //     console.log("hit", value)
            //     // return finishFunction(true, "DEBUG")
            // } )

            // Converting non-async tests to promise based
            let functionInSandboxToExecute
            if (!is_async_function) {
                // functionInSandbox = async (event, context) => {
                //     return new Promise((resolve, reject) => {
                //         functionInSandbox(event, context, (err, data) => {
                //             if (err) return reject(err)
                //             resolve(data)
                //         })
                //     })
                // }
                functionInSandboxToExecute = function(event, context) {
                    return new Promise((resolve, reject) => {
                        // console.log("h1", event)
                        // console.log("h2", context)
                        // setTimeout(function(){
                        //     // resolve("WORKS")
                        //     reject("DEBUG FAIL")
                        // }, 3000)
                        functionInSandbox(event, context, function(err, data){
                            if(err){
                                return reject(err)
                            }
                            return resolve(data)
                        })
                    })
                }
            } else {
                functionInSandboxToExecute = functionInSandbox
            }

            const function_finish = await functionInSandboxToExecute(event, context)
                .catch(err => {
                    console.log("log this error:", err)
                })

            console.log("function_finish", function_finish)

            /*
            functionInSandbox(event, context, (err, data) => {
            // functionInSandbox.handler(event).then((data) => {

                // if (err) {

                //     return handleAnError(err)

                // }

                updateLogLines(SUCCESS, data)

                return finishFunction(true, data)

            }) // catch should probably go here
            */

            return finishFunction(true, "DEBUG")

        } catch (err) {

            return handleAnError(err)

        }
    })
    console.log("after domain.run")

}
