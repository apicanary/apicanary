// AWS Lambda API Canary Execute code - 2019-02-08

const {
    NodeVM
} = require('vm2')
const _ = require('lodash')
const util = require('util')
const Domain = require('domain')
const toSource = require('tosource')

const FATAL_ERROR = "FATAL_ERROR"
const SUCCESS = "SUCCESS"
const ERROR = "ERROR"
const LOG = "LOG"

exports.handler = async function (_event, _context) {

    let finish_called = false

    const return_obj = {
        "success_flag": null,
        "success_message": null,
        "error_message": null,
        "start_execution": +new Date(),
        "end_execution": null,
        "log_lines": []
    }

    const finishFunction = function (success_flag, return_message) {
        if (finish_called) {
            return
        }
        finish_called = true

        return_obj["end_execution"] = +new Date()

        if (success_flag) {
            return_obj["success_flag"] = true
            return_obj["success_message"] = convertToString(return_message)
        } else {
            return_obj["success_flag"] = false
            return_obj["error_message"] = convertToString(return_message)
        }

    }

    const convertToString = function (data) {

        // return "<" + (typeof data) + ">" + _.toString(data)
        // console.log("typeof data", typeof data)
        // console.log("typeof data.stack", typeof data.stackx)
        // console.log("data", _.toString(data))

        if (typeof data.stack !== "undefined") {
            return _.toString(data)
        } else if (typeof data !== "string") {
            return toSource(data).substring(0, 200)
        }
        return data.substring(0, 200)
    }

    const updateLogLines = function (type, log_line_data) {
        return_obj["log_lines"].push({
            "date": +new Date(),
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

        // console.log("restArgs", restArgs)

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
    vm.on('console.trace', handleConsoleLogCall)
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

    const context = {}

    /*
    const canaryTestCodeModule = eval(_event.canary_test_code)
    canaryTestCodeModule(event, context, _callback)
    */

    // https://github.com/patriksimek/vm2/issues/53#issuecomment-300834149
    // console.log("before domain.run")
    await domain.run(async() => {
        try {

            const functionInSandbox = vm.run(_event.canary_test_code, 'api_canary_test_runner.js')
            if (typeof functionInSandbox.handler !== "function") {
                return finishFunction(false, "Test did not export a handler function")
            }

            const is_async_function = functionInSandbox.handler[Symbol.toStringTag] === "AsyncFunction"

            // console.log("is_async_function", is_async_function)

            // Converting non-async tests to promise based
            let functionInSandboxToExecute
            if (!is_async_function) {

                functionInSandboxToExecute = function(event, context) {
                    return new Promise((resolve, reject) => {
                        functionInSandbox.handler(event, context, function(err, data){
                            if(err){
                                return reject(err)
                            }
                            return resolve(data)
                        })
                    })
                }

            } else {
                functionInSandboxToExecute = functionInSandbox.handler
            }

            return await functionInSandboxToExecute(event, context)
                .then(data => {
                    return finishFunction(true, data)
                })
                .catch(err => {

                    // console.log("Hit functionInSandboxToExecute catch", err)

                    // console.log("test1", convertToString(err))

                    return finishFunction(false, err)
                })

        } catch (err) {

            return finishFunction(false, err)

        }
    })
    // console.log("after domain.run")

    return return_obj
}
