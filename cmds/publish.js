const ora = require('ora')

const scanForFiles = require('../utils/scan_for_files')

module.exports = async (args) => {

    console.log("Scanning for files...")
    console.log("")

    const spinner = ora().start()
    const found_files = scanForFiles('.', /\.apicanary.js$/)
    spinner.stop()

    console.log("Publishing the following files:", found_files)
    // return found_files
}
