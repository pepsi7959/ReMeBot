const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const port = process.env.PORT || 4000;
const meeting = require('./meeting').default;
const path = require('path');
global.appRoot = path.resolve(__dirname);
const logger = require('./common/logger');
const {
  WebhookClient,
  Payload
} = require('dialogflow-fulfillment');

app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    success: true
  });
})

app.post('/', (req, res) => {
  console.log('POST: /');
  console.log('Body: ', req.body);

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res
  });

  //Test get value of WebhookClient
  console.log('agentVersion: ' + agent.agentVersion);
  console.log('intent: ' + agent.intent);
  console.log('locale: ' + agent.locale);
  console.log('query: ', agent.query);
  console.log('session: ', agent.session);
  console.log('parameter: ', agent.parameters);

  let intentMap = new Map();
  intentMap.set('ไม่ให้จองแล้ว', meeting.notAvailableRoom);
  intentMap.set('check.available-room - yes', meeting.checkAvailableRoom);
  agent.handleRequest(intentMap);
  
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});