const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
  }
});

// Respond to HTTP GET requests for the / URI
app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Hello World listening on port 3000');
});