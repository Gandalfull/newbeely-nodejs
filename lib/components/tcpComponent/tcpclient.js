var Net = require('net');
var Tls = require('tls');
var Logger = require('pomelo-logger').getLogger('newbeely', "tcpComponent");
var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var Bearcat = require('bearcat');

function TcpClient(opts) {
    EventEmitter.call(this);

    this.opts = opts || {ssl: false, host: "localhost", port: 1990};

    this.socket = null;
};
Util.inherits(TcpClient, EventEmitter);

/**
 *
 */
TcpClient.prototype.connect = function () {
    var _this = this;
    var socket = Net.connect(this.opts, function () {
        Logger.debug('connect to server by ' + _this.opts);
        _this.emit('connected');
    });
    this.socket = Bearcat.getBean('tcp-connection', socket, this.opts.protocol || "");
    this.socket.on('close', function () {
        Logger.debug("socket closed!");
    });
    this.socket.on('message', function () {
        Logger.debug("remote message :" + arguments);
    });
};

module.exports = {
    id: "tcp-client",
    func: TcpClient,
    scope: "prototype",
    args: [
        {name: "opts", type: "Object"}
    ]
}

