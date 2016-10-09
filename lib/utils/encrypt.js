/**
 * @filename encrypt
 *
 * @module encrypt
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var Crypto = require('crypto');

/**
 * 加密解密类
 *
 * @class Encrypt
 * @constructor
 */
function Encrypt() {
    this.expired = 0;
}

/**
 *  rc4 加密
 * @method decode
 * @for Encrypt
 * @param buf
 * @param key
 * @returns {*}
 */
Encrypt.prototype.rc4Encode = function (buf, key, exp) {
    return Code(buf, 'ENCODE', key, exp || this.expired);
};

/**
 * rc4 解密
 *
 * @method decode
 * @for Encrypt
 * @param buf
 * @returns {*}
 */
Encrypt.prototype.rc4Decode = function (buf, key) {
    return Code(buf, 'DECODE', key);
};

/**
 * md5
 *
 * @method md5
 * @for Encrypt
 * @param str
 * @param opt
 * @returns {*}
 */
Encrypt.prototype.md5 = function (str, opt) {
    return MD5(str, opt);
};

/**
 * sha1
 *
 * @method sha1
 * @for Encrypt
 * @param str
 * @param opt
 * @returns {*}
 */
Encrypt.prototype.sha1 = function (str, opt) {
    return SHA1(str, opt);
};

/**
 * base64Encode
 *
 * @method base64Encode
 * @for Encrypt
 * @param str
 * @returns {string}
 */
Encrypt.prototype.base64Encode = function (str) {
    return Base64Encode(str);
};

/**
 * base64Decode
 *
 * @method base64Decode
 * @for Encrypt
 * @param str
 * @returns {string}
 */
Encrypt.prototype.base64Decode = function (str) {
    return Base64Decode(str);
};

module.exports = {
    id: "encrypt",
    func: Encrypt,
    props: [
        {name: "expired", value: 60 * 60 * 24 * 30 * 12}
    ]
};

/**
 * 编码
 * @param string
 * @param operation
 * @param key
 * @param expiry
 * @returns {*}
 */
function Code(string, operation, key, expiry) {
    operation = operation || 'DECODE';
    key = key || 'ondae8dafbGfda0FDA';
    expiry = expiry || 30;

    // 采用 encodeURI 对字符编码
    string = encodeURI(string);

    // 时间取得
    var now = new Date().getTime() / 1000;
    // Unix 时间戳
    var timestamp = parseInt(now, 10);
    // 毫秒
    var seconds = (now - timestamp) + '';

    var fvzone_auth_key = '';
    var ckey_length = 4;
    var key = MD5(key ? key : fvzone_auth_key);
    var keya = MD5(key.substr(0, 16));
    var keyb = MD5(key.substr(16, 16));
    var keyc = ckey_length ? (operation == 'DECODE' ? string.substr(0, ckey_length) : MD5(seconds).substr(-ckey_length)) : '';

    cryptkey = keya + MD5(keya + keyc);

    if (operation == 'DECODE') {
        string = Base64Decode(string.substr(ckey_length));
    } else {
        string = (expiry ? timestamp + expiry : '0000000000') + MD5(string + keyb).substr(0, 16) + string;
    }

    // RC4 加密原始算法函数
    result = RC4(cryptkey, string);

    if (operation == 'DECODE') {
        if ((result.substr(0, 10) == 0 || (result.substr(0, 10) - timestamp) > 0) && result.substr(10, 16) == MD5(result.substr(26) + keyb).substr(0, 16)) {
            // 对返回的结果使用 decodeURI 解码
            return decodeURI(result.substr(26));
        } else {
            return '';
        }
    } else {
        return keyc + Base64Encode(result);
    }
}

/**
 * RC4
 *
 * @method RC4
 * @param key
 * @param text
 * @returns {string}
 */
function RC4(key, text) {
    s = new Array();
    for (var i = 0; i < 256; i++) {
        s[i] = i;
    }
    var j = 0, x;
    for (i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }
    i = j = 0;
    var ct = [];
    for (var y = 0; y < text.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        ct.push(String.fromCharCode(text.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]));
    }
    return ct.join('');
}

/**
 * MD5
 *
 * @method MD5
 * @param str
 * @param enc
 * @returns {*}
 */
function MD5(str, enc) {
    return Crypto.createHash('md5').update(str).digest(enc || 'hex');
}

/**
 * SHA1
 *
 * @method SHA1
 * @param str
 * @param enc
 * @returns {*}
 */
function SHA1(str, enc) {
    return Crypto.createHash('sha1').update(str).digest(enc || 'hex');
}

/**
 * Base64Encode
 *
 * @method Base64Encode
 * @param str
 * @returns {string}
 */
function Base64Encode(str) {
    return new Buffer(str, 'utf8').toString('base64');
}

/**
 * Base64Decode
 *
 * @method Base64Decode
 * @param str
 * @returns {string}
 */
function Base64Decode(str) {
    return new Buffer(str, 'base64').toString('utf8');
}

/**
 * Aes128位加密
 * @param str
 * @param key
 * @returns {*|Array|Array.<T>|string}
 * @constructor
 */
function AesEncode(str, key) {
    var cipher = Crypto.createCipheriv('aes-128-cbc', key.crypt_key, key.iv);
    cipher.setAutoPadding(true);
    var bytes = [];
    bytes.push(cipher.update(str));
    bytes.push(cipher.final());
    return Buffer.concat(bytes);
}

/**
 * aes128解密
 * @param str
 * @param key
 * @constructor
 */
function AesDecode(str, key) {
    var decipher = Crypto.createDecipheriv('aes-128-cbc', key.crypt_key, key.iv);
    decipher.setAutoPadding(true);
    try {
        var bytes = [];
        bytes.push(decipher.update(str));
        bytes.push(decipher.final());
        return Buffer.concat(bytes);
    } catch (e) {
        console.error('decode error:', e.message);
        return "";
    }
}
