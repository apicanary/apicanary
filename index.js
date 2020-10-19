const minimist = require('minimist')
const error = require('./utils/error')
const logger = require('./utils/logger')

module.exports = () => {
    const args = minimist(process.argv.slice(2))

    if(args.verbose){
        logger.setLogLevel(0)
    }
    // console.log(logger.getLogLevel())


    let cmd = args._[0] || 'help'

    if (args.version || args.v) {
        cmd = 'version'
    }

    if (args.help || args.h) {
        cmd = 'help'
    }

    switch (cmd) {
        case 'publish':
            require('./cmds/publish')(args)
            break

        case 'authenticate':
            require('./cmds/authenticate')(args)
            break

        case 'locally_execute':
            require('./cmds/locally_execute')(args)
            break

        case 'version':
            require('./cmds/version')(args)
            break

        case 'help':
            require('./cmds/help')(args)
            break

        default:
            error(`"${cmd}" is not a valid command!`, true)
            break
    }
}
