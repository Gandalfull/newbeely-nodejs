#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander'),
    mkdirp = require('mkdirp'),
    __ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

var SupportComponentIndex = {
    '1': "httpComponent",
    '2': 'expressComponent',
    '3': 'mongooseComponent',
    '4': 'mongooseRedisCacheComponent',
    '5': 'redisComponent',
    '6': 'rpcComponent(un-support)',
    '7': 'websocketComponent(un-support)',
    '8': 'socketioComponent(un-support)'
};

program.version(require('../package.json').version);

program.command('init [path]')
    .description('create a new application')
    .action(function (ph) {
        ph = ph ? path.join(process.cwd(), ph) : process.cwd();
        if (!fs.existsSync(ph)) {
            mkdir(ph);
        }
        SelectComponent(function (components) {
            var projectConfig = {
                "development": {},
                "production": {}
            };
            async.eachOfSeries(components, function (supportIndex, component, cb) {
                SetComponentOption(component, supportIndex, function (reaConfig) {
                    projectConfig.development[component] = reaConfig;
                    projectConfig.production[component] = reaConfig;
                    cb();
                });
            }, function () {
                InitProject(ph, projectConfig);
                InitComponent(ph, projectConfig.development);
                process.stdio.close();
            });
        });
    });

program.command('add')
    .description('add a new component to this project')
    .action(function () {
        var ph = process.cwd();
        SelectComponent(function (components) {
            var projectConfig = JSON.parse(fs.readFileSync(path.join(ph, 'config/services.json')).toString());
            async.eachOfSeries(components, function (supportIndex, component, cb) {
                if (projectConfig[component]) {
                    cb();
                    return;
                }
                SetComponentOption(component, supportIndex, function (reaConfig) {
                    projectConfig.development[component] = reaConfig;
                    projectConfig.production[component] = reaConfig;
                    cb();
                });
            }, function () {
                InitProject(ph, projectConfig);
                InitComponent(ph, projectConfig.development);
                process.stdio.close();
            });
        });
    });

program.parse(process.argv);

function SelectComponent(fn) {
    console.log('Support components:\n\r' + JSON.stringify(SupportComponentIndex, 0, 4));
    prompt('Please select component by index=name index=name:\n  Examples: 1=api-http 2=web-server 3=dao-logs OR 1:api 2:web-server 3:dao-logs', function (msg) {
        var components = msg.trim().split(/[\s]/);
        components = __.compact(components);
        if (components.length == 0) {
            console.log('None Component from input data!');
        }
        var realComponents = {};
        for (var i in components) {
            var component = components[i].split(/[:,=]/);
            component = __.compact(component);
            if (component.length != 2) {
                console.log('Input data has error by:', components[i]);
                return;
            }
            if (!SupportComponentIndex[component[0]]) {
                console.log('Non-support component id by:' + component[0]);
                return;
            }
            if (realComponents[component[1]]) {
                console.log('Input data has error by repeated name:' + component[1]);
                return;
            }
            realComponents[component[1]] = component[0];
        }
        fn(realComponents);
    });
}

function SetComponentOption(component, InputIndex, fn) {
    var componentConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../template/config.template')));
    var realConfig = copy_json_object(componentConfig[SupportComponentIndex[InputIndex]]);
    console.log("Initialise " + component + " by " + realConfig.bean);
    if (realConfig.bean == "httpComponent" || realConfig.bean == "expressComponent") {
        async.waterfall([
            function (cb) {
                prompt('Please input host (default:' + realConfig.host + '):', function (msg) {
                    if (msg.trim() != "") {
                        realConfig.host = msg.trim();
                    }
                    cb();
                });
            }, function (cb) {
                prompt('Please input port (default:' + realConfig.port + '):', function (msg) {
                    if (msg.trim() != "") {
                        realConfig.port = parseInt(msg.trim());
                    }
                    cb();
                });
            }
        ], function () {
            fn(realConfig);
        });
    }
    if (realConfig.bean == "mongooseComponent" || realConfig.bean == "mongooseRedisCacheComponent") {
        async.waterfall([
            function (cb) {
                prompt('Please input database name (default:' + realConfig.dbname + '):', function (msg) {
                    if (msg.trim() != "") {
                        realConfig.dbname = msg.trim();
                    }
                    cb();
                });
            }
        ], function () {
            fn(realConfig);
        });
    }
}

function InitProject(ph, configs) {
    var paths = ph.split(/[/\\]/);
    var projectName = paths[paths.length - 1];
    fs.writeFileSync(path.join(ph, 'context.json'), fs.readFileSync(path.join(__dirname, '../template/context.bearcat')).toString().replace('$', projectName));
    fs.writeFileSync(path.join(ph, 'app.json'), fs.readFileSync(path.join(__dirname, '../template/pm2.config')).toString().replace('$', projectName));
    copy_file(path.join(__dirname, '../template/pm2.start'), path.join(ph, 'start'));
    copy_file(path.join(__dirname, '../template/pm2.stop'), path.join(ph, 'stop'));

    fs.writeFileSync(path.join(ph, 'package.json'), fs.readFileSync(path.join(__dirname, '../template/package.npm')).toString().replace('$', projectName));
    copy_file(path.join(__dirname, '../template/app.default'), path.join(ph, 'app.js'));

    mkdir(path.join(ph, 'app'));

    mkdir(path.join(ph, 'logs'));
    fs.writeFileSync(path.join(ph, 'logs/.keepme'), JSON.stringify(true, 0, 4));

    mkdir(path.join(ph, 'config'));
    fs.writeFileSync(path.join(ph, 'config/services.json'), JSON.stringify(configs, 0, 4));
    copy_file(path.join(__dirname, '../template/log4js.default'), path.join(ph, 'config/log4js.json'));

    mkdir(path.join(ph, 'test'));
    fs.writeFileSync(path.join(ph, 'test/.keepme'), JSON.stringify(true, 0, 4));

    mkdir(path.join(ph, 'pids'));
    fs.writeFileSync(path.join(ph, 'pids/.keepme'), JSON.stringify(true, 0, 4));

    mkdir(path.join(ph, 'docs'));
    fs.writeFileSync(path.join(ph, 'docs/.keepme'), JSON.stringify(true, 0, 4));
}

function InitComponent(ph, components) {
    for (var i in components) {
        if (fs.existsSync(path.join(ph, 'app', i))) {
            continue;
        }
        mkdir(path.join(ph, 'app', i));
        fs.writeFileSync(path.join(ph, 'app', i, 'context.json'), fs.readFileSync(path.join(__dirname, '../template/context.bearcat')).toString().replace('$', "component-" + i));
        var component = components[i].bean;
        if (component == 'httpComponent') {
            mkdir(path.join(ph, 'app', i, 'get'));
            mkdir(path.join(ph, 'app', i, 'post'));
            copy_file(path.join(__dirname, '../template/http.route.template'), path.join(ph, 'app', i, 'get', 'hello.js'));
            copy_file(path.join(__dirname, '../template/http.route.template'), path.join(ph, 'app', i, 'post', 'hello.js'));
        }

        if (component == 'expressComponent') {
            mkdir(path.join(ph, 'app', i, 'routes'));
            copy_file(path.join(__dirname, '../template/express.route.template'), path.join(ph, 'app', i, 'routes', 'hello.js'));

            fs.writeFileSync(path.join(ph, 'app.js'), fs.readFileSync(path.join(__dirname, '../template/app.express')).toString());
        }

        if (component == 'mongooseComponent' || component == 'mongooseRedisCacheComponent') {
            mkdir(path.join(ph, 'app', i, 'schemas'));
            copy_file(path.join(__dirname, '../template/mongoose.schemas.template'), path.join(ph, 'app', i, 'schemas', 'examples.js'));
        }
    }
}

/**
 * Prompt input with the given `msg` and callback `fn`.
 *
 * @param {String} msg
 * @param {Function} fn
 */
function prompt(msg, fn) {
    if (' ' === msg[msg.length - 1]) {
        process.stdout.write(msg);
    } else {
        console.log(msg);
    }
    process.stdin.setEncoding('ascii');
    process.stdin.once('data', function (data) {
        fn(data);
    }).resume();
}

/**
 * Prompt confirmation with the given `msg`.
 *
 * @param {String} msg
 * @param {Function} fn
 */
function confirm(msg, fn) {
    prompt(msg, function (val) {
        fn(/^ *y(es)?/i.test(val));
    });
}
/**
 * Exit with the given `str`.
 *
 * @param {String} str
 */
function abort(str) {
    console.error(str);
    process.exit(1);
}

function copy_file(origin, target) {
    fs.writeFileSync(target, fs.readFileSync(origin).toString());
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */
function mkdir(path, fn) {
    mkdirp(path, 0755, function (err) {
        if (err) {
            throw err;
        }
        console.log('   create : ' + path);
        if (typeof fn === 'function') {
            fn();
        }
    });
}

function copy_json_object(obj) {
    var temp = {};
    for (var i in obj) {
        temp[i] = obj[i];
    }
    return temp;
}
