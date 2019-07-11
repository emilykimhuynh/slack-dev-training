const express = require('express');
const app = express();

// Respond to HTTP GET requests for the / URI
app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(3000, function() {
  console.log('Hello World listening on port 3000');
});