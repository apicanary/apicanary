let log_level = 1

const setLogLevel = function(new_log_level){
    log_level = new_log_level
}

const getLogLevel = function(){
    return log_level
}

const log = function(this_log_level, ...args){
    if (this_log_level >= log_level) {
        console.log(...args)
    }
}

exports.setLogLevel = setLogLevel
exports.getLogLevel = getLogLevel
exports.log = log