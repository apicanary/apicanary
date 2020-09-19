const menus = {
  main: `
    apicanary [command] <options>

    publish ............ Publish tests to API Canary
    authenticate ....... Generate your ~/.apicanary/credentials file
    help ............... Show help for a command e.g. apicanary help [command]

    `,

  publish: `
    apicanary publish <options>

    `,

  authenticate: `
    apicanary authenticate <options>

    `,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
