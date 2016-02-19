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

}

/**
 *
 * @param msg
 * @param next
 */
Hello.prototype.handle = function (msg, next) {
    next(null, "hello newbeely!");
}