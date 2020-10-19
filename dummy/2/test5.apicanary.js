// https://www.chaijs.com/guide/styles/#assert
var assert = require('chai').assert

exports.handler = async (event) => {
    console.log(process.env.DUMMYENV)
}
