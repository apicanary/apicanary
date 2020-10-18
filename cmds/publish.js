const ora = require('ora')
const path = require('path')
const fs = require('fs')

function scanForFiles(search_file_path, filter, callback) {

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

module.exports = async (args) => {

    console.log("Scanning for files...")
    console.log("")

    // const spinner = ora().start()
    const found_files = scanForFiles('.', /\.apicanary.js$/)
    // spinner.stop()

    console.log("Publishing the following files:", found_files)

    console.log("")

    // try {
    // } catch (err) {

    //   spinner.stop()
    //   console.error(err)

    // }
}
