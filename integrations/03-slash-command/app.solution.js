const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const https = require('https');
const environment = require('../../environment');
var accessToken = environment.accessToken;
var chatPostResponseChannelID = environment.chatPostResponseChannelID;

app.post('/event', function(request, response) {
  var challenge = request.body.challenge;
  if(typeof challenge!='undefined') {
    // If the request contains a challenge its
    // a request from Slack to verify a URL
    response.send(challenge);
  } else {
    var event = request.body.event;
    var type = event.type;

    if(type == 'channel_created') {
      console.log('A new Channel was created');            
    }
    response.sendStatus(200);
    var options = {
      host : 'slack.com',
      port : 443,
      method : 'POST',
      path : '/api/chat.postMessage',
      headers : {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type' : 'application/json'
      }
    };
    var chatPostRequest = https.request(options, function(chatPostResponse) {

      chatPostResponse.setEncoding('utf8');
      var chatPostResponseBuffer = '';
      chatPostResponse.on('data', function(chatPostResponseData) {
        chatPostResponseBuffer += chatPostResponseData;
      });
      chatPostResponse.on('end', function() {
        var chatPostResponseJSON = JSON.parse(chatPostResponseBuffer);
        if(chatPostResponseJSON.ok != true) {
          console.error(chatPostResponseJSON);
        }
      });
    });

    var chatPostRequestData = {
      'channel': chatPostResponseChannelID,
      'text': `A new Channel called ${event.channel.name} was created`,
      'as_user': false
    };
    chatPostRequest.write(JSON.stringify(chatPostRequestData));
    chatPostRequest.end();

  }
});

// Respond to slash command requests from Slack
//Snippet 4
app.post('/slash-command', function(request, response) {

  var requestData = request.body;

  response.setHeader('Content-Type', 'application/json');
  var responseData = {
    'text': 'Its -1 degrees right now.',
    'response_type': 'in_channel',
    'attachments': [
      {
        'text': 'Partly cloudy today and tomorrow'
      }
    ]
  };
  response.status(200).send(JSON.stringify(responseData));
});

// Respond to HTTP GET requests for the / URI
app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Hello World listening on port 3000');
});