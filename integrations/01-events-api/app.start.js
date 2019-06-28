const express = require('express');
const app = express();

// Respond to HTTP GET requests for the / URI
app.get('/', function(request, response) {
    response.send('Hello World!');
});

app.post('/event', function(request, response) {
  var challenge = request.body.challenge;
    if(typeof challenge!='undefined') {
        // If the request contains a challenge its
        // a request from Slack to verify a URL
        response.send(challenge);
    } else {
      // TODO: Get type from response body
      // TODO: Check for channel_created event
    }
});

app.listen(3000, function() {
    console.log('Hello World listening on port 3000');
});