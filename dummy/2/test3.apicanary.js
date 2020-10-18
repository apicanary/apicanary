/**
 * @canary_test_id dummy3
 * @canary_test_name Dummy Test 3
 */

exports.handler = function (event, context, callback) {
    console.log("event", event)
    console.log("context", context)
    console.log("callback", callback)
    callback(null, "DEBUG SUCCESS")
    // return callback("DEBUG FAILURE")
}
