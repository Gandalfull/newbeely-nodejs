var Bearcat = require('bearcat');
var Encrypt = require('../../lib/utils/encrypt');

describe("encrypt test!", function () {
    before('init bearcat', function (done) {
        Bearcat.createApp();
        Bearcat.module(Encrypt,Encrypt.func);
        Bearcat.use([Encrypt.id]);
        Bearcat.start(function(){
            done();
        });
    });
    it("md5 test", function (done) {
        var test = "Hello world!";
        console.log(Bearcat.getBean('encrypt'));
        var md5text = Bearcat.getBean('encrypt').md5(test, "hex");
        console.log(test, "(md5)", md5text,"\n");
        done();
    });
});