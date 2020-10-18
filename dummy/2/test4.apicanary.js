/**
 * @canary_test_id dummy4
 * @canary_test_name Dummy Test 4
 */

exports.handler = function (event, context, callback) {
    console.log("event", event)
    console.log("context", context)
    console.log("callback", callback)
    throw "DEBUG THROW"
    callback("DEBUG Failure")
    // return callback("DEBUG FAILURE")
}
