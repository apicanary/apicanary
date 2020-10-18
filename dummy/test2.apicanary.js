/**
 * @canary_test_id dummy2
 * @canary_test_name Dummy Test 2
 */

const request = require('request')
const axios = require('axios')

// exports.handler = function (event, context, callback) {
//     request.get({
//         url: 'http://ip-api.com/json',
//         method: 'get',
//         json: true
//     }, function (err, res, body) {
//         if (err) {
//             return callback(err)
//         }
//         // console.log("data returned:", body)
//         // console.log("data returned:", [body.city, body.regionName, body.country,body.lat,body.lon].join("|"))
//         //callback(null, [body.city, body.regionName, body.country,body.lat,body.lon].join("|"))
//         // console.log("process.env", process.env)
//         callback(null, [body.city, body.regionName].join(", "))
//     })
// }

// exports.handler = async (event) => {
//     console.log("logged from async")
//     console.error("logged2 from async")
//     console.log("logged2 from async")
//     // throw "DEBUG FAILIURE FROM ASYNC"
//     return "DEBUG SUCCESS FROM ASYNC"
// }

// exports.handler = function (event, context, callback) {
//     console.log("event", event)
//     console.log("context", context)
//     console.log("callback", callback)
//     callback(null, "DEBUG SUCCESS")
//     // return callback("DEBUG FAILURE")
// }

// exports.handler = "XXX"

exports.handler = async (event) => {
    console.log("a")
    // TODO implement
    // const response = {
    //     statusCode: 200,
    //     body: JSON.stringify('Hello from Lambda!'),
    // }
    // return response


    console.log("Before async 1")
    await new Promise((resolve, reject) => {

        console.log("async 1")
        setTimeout(function(){
            console.log("Inside setTimeout")
            return resolve("WORKS")
            // return reject("DEBUG FAIL")
        }, 10)
        // throw "debug exception"

    })

    const data = await axios.get('http://ip-api.com/json')
        .catch((err) => {
            console.error("Axios error", err)
        })

    console.log("data", data)
    console.log("data2")
    console.log(data)
    // throw "did this work"
    // const abc = data.data

    console.log("After async 2")


    // console.log("get_response: ", get_response)

    // try {
    // } catch (err) {
    //     console.err(err)
    // }

    console.log("c")

    return "ok this test passed"
}
