/**
 * @filename hello
 *
 * @module hello
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Bearcat = require('bearcat');

module.exports = function () {
    return Bearcat.getBean({
        id: "api-hello",
        func: Hello,
        props: [
            {name: "app", "ref": "application"}
        ]
    });
}
function Hello() {
    var client = Bearcat.getBean('tcp-client');
    client.connect();

    client.on('connected', function () {
        client.socket.send(0, "hello world", "utf8", function () {
            console.log("发送数据完成!");
        });
    });
}

/**
 * http://127.0.0.1:port/hello
 *
 * @param msg
 * @param next
 */
Hello.prototype.handle = function (msg, next) {

    next(null, "hello newbeely!");
}

/**
 * http://127.0.0.1:port/hello/world
 *
 * @param msg
 * @param next
 */
Hello.prototype.world = function (msg, next) {
    next(null, "hello world!");
}