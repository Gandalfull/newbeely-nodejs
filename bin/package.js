var fs = require('fs');
var config = require('./config');
var util = require('util');

fs.mkdirSync(config.projectName);
fs.mkdirSync(config.projectName + "/app");
var contextTemplate = {
    "name": config.projectName,
    "beans": []
};
fs.writeFileSync(config.projectName + "/context.json", JSON.stringify(contextTemplate, 0, 4));

var appCode = "var App = require('newbeely-nodejs');\n\rApp.start( function(){});";
fs.writeFileSync(config.projectName + "/app.js", appCode);

var servicesTemplate = {
    development: {},
    production: {}
};
for (var i in config.components) {
    fs.mkdirSync(config.projectName + "/app/" + i);
    contextTemplate.name = i;
    fs.writeFileSync(config.projectName + "/app/" + i + "/context.json", JSON.stringify(contextTemplate, 0, 4));

    if (config.components[i].bean == "mongooseComponent") {
        fs.mkdirSync(config.projectName + "/app/" + i + "/schemas");
        fs.writeFileSync(config.projectName + "/app/" + i + "/schemas/.keepme", " ");
    }
    if (config.components[i].bean == "expressComponent") {

    }

    if (config.components[i].bean == "httpComponent") {

    }
    servicesTemplate.development[i] = config.components[i];
    servicesTemplate.production[i] = config.components[i];
}

fs.mkdirSync(config.projectName + "/logs");
fs.writeFileSync(config.projectName + "/logs/.keepme", " ");

fs.mkdirSync(config.projectName + "/config");

fs.writeFileSync(config.projectName + "/config/services.json", JSON.stringify(servicesTemplate, 0, 4));

var npmPackageTemplate = {
    "name": config.projectName,
    "version": "0.0.1",
    "dependencies": {
        "async": "*",
        "bearcat": "*",
        "crc32": "*",
        "express": "x",
        "generic-pool": "2.x.x",
        "mongoose": "3.8.x",
        "pomelo-logger": "0.1.x",
        "pomelo-scheduler": "0.3.x",
        "redis": "0.12.x",
        "underscore": "1.6.x",
        "serve-favicon": "*",
        "body-parser": "*",
        "cookie-parser": "*",
        "express-session": "*",
        "ejs": "*",
        "morgan": "*",
        "jade": "*",
        "rangedate": "*",
        "lodash": "*",
        "ftp": "*",
        "uuid": "*",
        "formidable": "*",
        "utility": "*",
        "csv": "*",
        "cron": "*",
        "request": "*",
        "http": "*",
        "querystring": "*",
        "multer": "*"
    }
};
fs.writeFileSync(config.projectName + "/package.json", JSON.stringify(npmPackageTemplate, 0, 4));
