const path = require('path')
const fs = require('fs')

module.exports = function scanForFiles(search_file_path, filter) {

    let found_files = []

    if (search_file_path.indexOf('node_modules') !== -1 || search_file_path == '.git'){

        return []

    }

    // console.log('Scanning ' + search_file_path + '/')

    if (!fs.existsSync(search_file_path)) {

        console.log("no dir ", search_file_path)

        return []

    }

    var files = fs.readdirSync(search_file_path)

    for (var i = 0; i < files.length; i++) {

        var filename = path.join(search_file_path, files[i])

        var stat = fs.lstatSync(filename)

        if (stat.isDirectory()) {

            found_files = found_files.concat(scanForFiles(filename, filter)) //recurse

        } else if (filter.test(filename)) {

            found_files.push(filename)
        }
    }

    return found_files
}