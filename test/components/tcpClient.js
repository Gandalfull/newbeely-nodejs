var Bearcat = require('bearcat');

describe("tcp client test", function () {
    before("init bearcat", function (done) {
        Bearcat.createApp();
        Bearcat.start(function () {
            Bearcat.getBean(require('../../lib/utils/protocol'));
            Bearcat.getBean(require('../../lib/components/tcpComponent/tcpConnection'))
            done();
        });
    });
    it("client test", function (done) {
        var client = Bearcat.getBean(require('../../lib/components/tcpComponent/tcpclient'));
        client.connect();
        client.on('connected', function () {
            client.socket.send(0, "hello!!!!!", "utf8", done());
        });
    });
    after('release bearcat', function (done) {
        Bearcat.stop();
        done();
    });
});