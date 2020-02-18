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

    var db = mysqlHelper.getConnection();
    var now = new Date();

    var startDate = new Date(agent.parameters.date);
    var startTime = new Date(agent.parameters.time);
    var startAt = new Date();
    startAt.setDate(startDate.getDate);
    startAt.setTime(startTime.getTime);

    var duration = '2';
    var endAt = startAt.setHours(startAt.getHours + duration);
    var room = agent.parameters.room;

    if ( startAt < now ) {
        agent.add(randResponse(
            ['ไม่ควรจองย้อนหลังป่าว', 'จองย้อนหลังไม่ได้ดิ']));
        return;
    }

    var str_sql = 'select * from remebot.MeetingRoom where  meeting_begin >= ' + startAt.toISOString() + ' and meeting_begin < ' + endAt.toISOString() +
        'and room = ' + room +' order by room, meeting_begin desc';
    db.then(conn => {

        mysqlHelper.query(conn, str_sql)
            .then(result => {
                console.log(result);
                conn.close();
            });
    });

    agent.add("ว่างจ้า");
}

exports.default = {
    notAvailableRoom,
    checkAvailableRoom
};