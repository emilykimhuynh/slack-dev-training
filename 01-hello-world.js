const express = require('express');
const app = express();

// Respond to HTTP GET requests for the / URL
// Display 'Hello World' in the browser
app.get('/', function(request, response) {
  response.send('Hello World!');
});

// Start the Express web server, listening on port 3000
app.listen(3000, function() {
  console.log('Hello World listening on port 3000');
});