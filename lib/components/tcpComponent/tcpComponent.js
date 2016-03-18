var Net = require('net');
var Tls = require('tls');
var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var Logger = require('pomelo-logger').getLogger('newbbely', 'tcpComponent');
var Bearcat = require('bearcat');
var Path = require('path');

/**
 *
 * @class TcpComponent
 * @param sid
 * @param opts
 * @constructor
 */
function TcpComponent(sid, opts) {
    EventEmitter.call(this);

    this.sid = sid;

    this.opts = opts;

    this.accepter = null;

    this.app = null;

    this.connections = {};
    Logger.info("TcpComponent will start at " + JSON.stringify(this.opts));
}
Util.inherits(TcpComponent, EventEmitter);

/**
 *
 */
TcpComponent.prototype.init = function () {
    this.opts["path"] = Path.join(this.app.workedir, "/app/", this.sid);
};

/**
 *
 */
TcpComponent.prototype.start = function () {
    Logger.info("TcpComponent " + this.sid + " is starting...");
    if (this.opts.ssl) {
        this.accepter = Tls.createServer(this.opts.ssl);
        this.accepter.on('secureConnection', Accept.bind(null, this));
        this.accepter.on('clientError', function (e, tlsSo) {
            Logger.warn('an ssl error occured before handshake established: ', e);
            tlsSo.destroy();
        });
    } else {
        this.accepter = Net.createServer();

        this.accepter.on('connection', Accept.bind(null, this));
    }
    this.accepter.on('error', this.emit.bind(this, 'error'));
    this.accepter.listen(this.opts.port, this.opts.host);
    Logger.info("TcpComponent " + this.sid + " is started!");
};

/**
 *
 */
TcpComponent.prototype.stop = function () {
    this.accepter.stop();
};

/**
 *
 * @param component
 * @param socket
 * @constructor
 */
function Accept(component, socket) {
    var connect = Bearcat.getBean('tcp-connection', socket, component.opts.protocol);
    connect.once('close', function () {
        delete component.connections[connect.sid];
    });
    connect.on('timeout', function () {
        Logger.debug("Connection " + connect.sid + " timeout!");
        connect.kick("timeout");
    });
    connect.on('error', function (error) {
        Logger.warn('Connection has error for ' + error);
    });
    connect.on('message', function () {
        connect.send("ok!");
    });
    component.connections[connect.sid] = component;
}

module.exports = {
    id: "tcpComponent",
    func: TcpComponent,
    init: "init",
    scope: "prototype",
    args: [
        {name: "sid", "type": "String"},
        {name: "opts", type: "Object"}
    ],
    "props": [
        {name: "app", "ref": "application"}
    ]
};
