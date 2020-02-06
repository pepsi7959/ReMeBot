const {
    WebhookClient,
    Payload
} = require("dialogflow-fulfillment");
const mysqlHelper = require('./helpers/mysqlHelper');

var StickerPlayload = {
    type: "sticker",
    packageId: "11537",
    stickerId: "52002739"
}

function randResponse(response) {
    var len = response.length;
    var rand = Math.floor(Math.random() * 100);
    var idx = rand % len;
    console.log(idx, len, rand, response[idx])
    return response[idx]
}

function notAvailableRoom(agent) {
    let payload = new Payload(`LINE`, StickerPlayload, {
        sendAsMessage: true
    });
    agent.add(randResponse(
        ['เสียใจด้วย ห้องไม่เปิดให้จองแล้ว', 'ขอโทษด้วยน้า']));
    agent.add(payload);
}

function checkAvailableRoom(agent) {
    console.log(agent);
    var db = mysqlHelper.getConnection();
    db.then(conn => {
        mysqlHelper.query(conn, "select * from remebot.MeetingRoom limit 2")
        .then(result => {console.log(result)});
    });
    agent.add("ว่างจ้า");
}

exports.default = {
    notAvailableRoom,
    checkAvailableRoom
};