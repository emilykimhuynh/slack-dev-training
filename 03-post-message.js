const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
const https = require('https');

const environment = require('./environment');
var accessToken = environment.accessToken;
var chatPostResponseChannelID = environment.chatPostResponseChannelID;

// Handle all Slack events here.
// When a Slack event occurs, it makes a POST request to this endpoint.
app.post('/event', function(request, response) {
  var challenge = request.body.challenge;
  if(typeof challenge != 'undefined') {
    // If the request contains a challenge its
    // a request from Slack to verify a URL
    response.send(challenge);
  } else {
    var event = request.body.event;
    var type = event.type;
    console.log(`event is %o`, event);

    if(type == 'channel_created') {
      console.log('A new Channel was created');            
    }
        
    response.sendStatus(200);

    // POST a message to the channel
    var options = {
      host : 'slack.com',
      port : 443,
      method : 'POST',
      path : '/api/{web API method}', // TODO: enter correct web API method
      headers : {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type' : 'application/json'
      }
    };

    // Make HTTP request to Slack API
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

    // Construct data object to send to Slack
    var chatPostRequestData = {
      'channel': chatPostResponseChannelID,
      'text': `A new Channel called ${event.channel.name} was created`,
      'as_user': false
    };
    chatPostRequest.write(JSON.stringify(chatPostRequestData));
    chatPostRequest.end();

  }
});

// Respond to HTTP GET requests for the / URL
// Display 'Hello World' in the browser
app.get('/', function(request, response) {
  response.send('Hello World!');
});

// Start the Express web server, listening on port 3000
app.listen(3000, function() {
  console.log('Hello World listening on port 3000');
});