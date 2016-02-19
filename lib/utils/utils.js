/**
 * @filename Utils
 *
 * @module Utils
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var __ = require('underscore');

/**
 * 64 进制编码查询表
 * @type {string[]}
 */
var Key64Maps = [
    'Y', 'i', '*', 'q', 't', 'L',
    'F', 'A', 'f', 'x', 'W', '7',
    'J', 'l', 'a', '3', 'H', 'Z',
    '5', 'E', 's', 'm', 'U', 'b',
    'S', 'c', 'p', 'd', 'g', 'C',
    'n', 'P', 'k', 'N', '6', 'e',
    'r', 'y', 'R', '8', 'G', '4',
    'z', '@', '0', 'K', 'u', '2',
    'h', 'M', '9', 'w', 'X', 'j',
    'V', 'I', 'Q', 'o', 'T', 'v',
    'B', 'D', '1', 'O'
];

/**
 * 32 进制编码查询表
 * @type {string[]}
 */
var Key64Maps = [

];


/**
 * 16进制 映射表
 *
 * @type {*[]}
 */
var Key16Maps = [
    ['Y', 'i', 'q'], ['t', 'L', 'F', 'A'], ['f', 'x', 'W', '7'],
    ['J', 'a', '3'], ['H', 'Z', '5', 'E'], ['s', 'm', 'U', 'b'],
    ['S', 'c', 'p', 'd'], ['g', 'C', 'n', 'P'], ['k', 'N', '6', 'e'],
    ['r', 'y', 'R', '8'], ['G', '4', 'z'], ['K', 'u', '2'],
    ['h', 'M', '9', 'w'], ['X', 'j', 'V', 'I'], ['Q', 'T', 'v'],
    ['B', 'D']
];

/**
 * 参考时间
 * @type {number}
 */
var RefDate = new Date("2016-01-01 00:00:00").getTime();

/**
 * 常用方法工具集
 *
 * @class Utils
 * @constructor
 */
function Utils() {

}

/**
 * 生成唯一的字符串
 * 根据时间算法生成
 *
 * @method uniqueString
 * @param variances
 * @param model 16 or 64 default 16
 * @returns {string}
 */
Utils.prototype.uniqueString = function (variances, model) {
    model = model || 16;
    var bits, mask, maps;
    if (model == 16) {
        bits = 4;
        mask = 0x0f;
        maps = Key16Maps;
    } else {
        bits = 6;
        mask = 0x3f;
        maps = Key64Maps;
    }
    variances = Math.floor(variances);
    var value = Date.now() - RefDate;
    value = ((value << 8) >>> 1) + variances;
    var retValue = [];
    while (value > 0) {
        retValue.unshift(__.sample(__.shuffle(maps)[value & mask]));
        if (value > 0xffffffff) {
            value = value >> bits >>> 1;
        } else {
            value = value >> bits;
        }
    }
    return retValue.join("");
}
/**
 * 安全调用方法
 * @param cb
 */
Utils.prototype.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * 从数组内随机一个元素
 *
 * @method random
 * @param array
 * @returns {*}
 */
Utils.prototype.random = function (array) {
    if (!array.length) {
        return null;
    }
    if (typeof array[0].weight !== 'number') {
        return __.sample(array);
    }
    var weight = 0;
    for (var i = 0; i < array.length; i++) {
        weight += array[i].weight;
    }
    var ran = Math.floor(Math.random() * 100000) % weight;
    var tmp = 0;
    for (var i = 0; i < array.length; i++) {
        tmp += array[i].weight;
        if (tmp >= ran) {
            return array[i];
        }
    }
    return null;
}

/**
 * 计算一个对象内的变量数量
 *
 * @method size
 * @for Utils
 * @param JSON obj
 * @returns {Number}
 */
Utils.prototype.size = function (obj) {
    var count = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
            count++;
        }
    }
    return count;
};
/**
 * 检测两个数组是否相同
 *
 * @method arrayDiff
 * @for Utils
 * @param JSON array1
 * @param JSON array2
 * @returns {boolean}
 */
Utils.prototype.arrayDiff = function (array1, array2) {
    var o = {};
    for (var i = 0, len = array2.length; i < len; i++) {
        o[array2[i]] = true;
    }

    var result = [];
    for (i = 0, len = array1.length; i < len; i++) {
        var v = array1[i];
        if (o[v]) continue;
        result.push(v);
    }
    return result;
};

/**
 * 检测字符串内是否包含中文字符
 *
 * @method hasChineseChar
 * @for Utils
 * @param string
 * @returns {boolean}
 */
Utils.prototype.hasChineseChar = function (str) {
    if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
        return true;
    } else {
        return false;
    }
};

/**
 * 获取http请求的客户端ip
 *
 * 因为有可能是nginx/负载均衡 转发的 需要判定headers内的字段
 *
 * @method getClientIP
 * @param req
 * @returns {*|Object|string}
 */
Utils.prototype.getClientIP = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.headers['remote-host'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket && req.connection.socket.remoteAddress) ||
        "";
    ip = ip.substring(ip.lastIndexOf(":") + 1, ip.length);
    return ip;
}

/**
 * 判断是否是Ip
 *
 * @method isIp
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.ipIp = function isIp(ipvalue) {
    return this.isIPv4(ipvalue) || this.isIPv6(ipvalue);
};


/**
 * 判断是否是Ipv4
 *
 * @method isIPv4
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.isIPv4 = function isIPv4(ipvalue) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return re.test(ipvalue);
};

/**
 * 判断是否是Ipv6
 *
 * @method isIPv6
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.isIPv6 = function isIPv6(ipvalue) {
    return ipvalue.match(/:/g).length <= 7 && /::/.test(ipvalue) ? /^([\da-f]{1,4}(:|::)){1,6}[\da-f]{1,4}$/i.test(ipvalue) : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(ipvalue);
};

module.exports = {
    id: "utils",
    func: Utils
};