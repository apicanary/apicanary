const chalk = require('chalk')

const menus = {
  main: `
    Help

    > apicanary [` + chalk.green('command') + `] <options>

    Commands

    ` + chalk.green('publish') + ` .................. Publish tests to API Canary
    ` + chalk.green('authenticate') + ` ............. Generate your ~/.apicanary/credentials file
    ` + chalk.green('help') + ` ..................... Show help for a command e.g. apicanary help [command]

    Options

    -v or --verbose .......... Output extra information while processing
    `,

  publish: `
    > apicanary publish <options>

    Options

    --dry-run .......... Do everything except publish to API Canary

    `,

  authenticate: `
    > apicanary authenticate <options>

    Authenticates to API Canary and write your account's auth token to ` + chalk.bold('~/.apicanary/credentials') + `

    `,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
