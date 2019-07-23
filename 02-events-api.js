const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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

    // TODO: add the correct event API
    if(type == '{events API}') {
      console.log('A new Channel was created');
    }
    response.sendStatus(200);
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