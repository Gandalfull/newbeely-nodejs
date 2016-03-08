var Bearcat = require('bearcat');
var Encrypt = require('../../lib/utils/encrypt');

describe("encrypt test!", function () {
    before('init bearcat', function (done) {
        Bearcat.createApp();
        Bearcat.start(function(){
            Bearcat.getBean(Encrypt);
            done();
        });
    });
    it("md5 test", function (done) {
        var test = "Hello world!";
        var md5text = Bearcat.getBean('encrypt').md5(test, "hex");
        console.log(test, "(md5)", md5text,"\n");
        done();
    });
});