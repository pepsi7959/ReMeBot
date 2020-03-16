const {
    WebhookClient,
    Payload
} = require("dialogflow-fulfillment");
const mysqlHelper = require('./helpers/mysqlHelper');
const appConf = require('./config/production.conf');
const winston = require('./common/logger');
const promise = require("promise");
const logger = winston.logger;

/* sticker reference : https://developers.line.biz/media/messaging-api/sticker_list.pdf */
var StickerPlayload = {
    type: "sticker",
    packageId: "11537",
    stickerId: "52002739"
}

function randStricker(stickers) {
    var len = stickers.length;
    var rand = Math.floor(Math.random() * 100);
    var idx = rand % len;
    console.log(idx, len, rand, stickers[idx])
    StickerPlayload.packageId = stickers[idx].packageId;
    StickerPlayload.stickerId = stickers[idx].stickerId;
    return new Payload(`LINE`, StickerPlayload, {
        sendAsMessage: true
    });
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

    console.log("startDate", startDate);
    console.log("startTime", startTime);

    var duration = 2;
    var startAt = new Date(agent.parameters.date);
    var endAt = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), (startTime.getHours() + duration), startTime.getMinutes(), 0);


    console.log("startAt.getHours(): ", startTime.getHours());

    var room = agent.parameters.room;

    console.log("now: " + now);

    if (startAt < now) {
        agent.add(randResponse(
            ['ไม่ควรจองย้อนหลังป่าว', 'จองย้อนหลังไม่ได้ดิ']));
        return;
    }

    console.log("start: " + startAt);
    console.log("  end: " + endAt);

    var rooms = room.split(" ");
    var room_number = rooms[1] || "";

    var qtr_start = startAt.getFullYear() + '-' + (startAt.getMonth() + 1) + '-' + startAt.getDate() + '  ' + startAt.getHours() + ":" + startAt.getMinutes() + ":00";
    var qtr_end = endAt.getFullYear() + '-' + (endAt.getMonth() + 1) + '-' + endAt.getDate() + '  ' + endAt.getHours() + ":" + endAt.getMinutes() + ":00";
    var str_sql = 'select * from remebot.MeetingRoom where  meeting_end > \'' + qtr_start + '\' and meeting_begin < \'' + qtr_end +
        '\' and room = \'' + room_number + '\' order by room, meeting_begin desc';

    console.log("query:: " + str_sql);

    /** fixed some error by https://codepen.io/siddajmera/pen/eraNLW?editors=0010 */
    return db.then(conn => {
        return mysqlHelper.query(conn, str_sql).then(result => {
            logger.debug(JSON.stringify(result));
            if (result.length >= 1) {
                var str = 'คุณ' + result[0].reserver + ' ได้จองห้อง ' + result[0].room + ' แล้ว';
                agent.add(str);

                StickerPlayload.stickerId = "52114110";
                StickerPlayload.packageId = "11539";

                agent.add(randStricker([{
                        stickerId: "52114110",
                        packageId: "11539"
                    },
                    {
                        stickerId: "52002739",
                        packageId: "11537"
                    }
                ]));
            } else {
                agent.add("ว่างจ้า รีบจองเลย");
                agent.add(randStricker([{
                    stickerId: "52002734",
                    packageId: "11537"
                },
                {
                    stickerId: "51626494",
                    packageId: "11538"
                },
                {
                    stickerId: "52114146",
                    packageId: "11539"
                }
            ]));
            }
            return Promise.resolve(agent);
        });
    });

}
exports.default = {
    notAvailableRoom,
    checkAvailableRoom
};