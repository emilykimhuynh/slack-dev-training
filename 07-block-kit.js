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

// Handle all Slack events here.
// When a Slack event occurs, it makes a POST request to this endpoint.
app.post('/event', function(request, response) {
  var challenge = request.body.challenge;
  if(typeof challenge!='undefined') {
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
      path : '/api/chat.postMessage',
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

// Respond to slash command requests from Slack
app.post('/slash-command', function(request, response) {

  var requestData = request.body;

  var city = (request.body.text != '') ? request.body.text : null;
  var responseData;

  response.setHeader('Content-Type', 'application/json');

  // Construct data object to send to Slack
  if(city != null) {
    responseData = {
      'text': `It's -1 degrees right now in ${city}`,
      'response_type': 'in_channel',
      'attachments': [
        {
          'text': 'Partly cloudy today and tomorrow'
        }
      ]
    };
  } else {
    responseData = {
      'text': 'Which city would you like a weather report for? ☀️⛄️☂️',
      'attachments': [
        {
          'fallback': 'Upgrade your Slack client to use messages like these.',
          'color': '2A679F',
          'attachment_type': 'default',
          'callback_id': 'weather_city_callback',
          'actions': [
            {
              'name': 'weather_city_list',
              'text': 'Which random bug do you want to resolve?',
              'type': 'select',
              'data_source': 'external',
              'min_query_length': 1
            }
          ]
        }
      ]

    };
  }
  response.status(200).send(JSON.stringify(responseData));
});

// Load menu options
app.post('/options-load-endpoint', function(request, response) {

  response.setHeader('Content-Type', 'application/json');
  var responseData = {
    'options': [
      {
        'text': 'London',
        'value': 'London'
      },
      {
        'text': 'Montréal',
        'value': 'Montréal'
      },
      {
        'text': 'Sydney',
        'value': 'Sydney'
      }
    ]
  };
  response.status(200).send(JSON.stringify(responseData));
});

// Configure action endpoint for any interaction with message menus
app.post('/action-endpoint', function(request, response) {

  response.setHeader('Content-Type', 'application/json');
  var payload = JSON.parse(request.body.payload);
  if(payload.callback_id == 'weather_city_callback') {
    var city = payload.actions[0].selected_options[0].value;
    var responseData = {
      'text': `It's -1 degrees right now in ${city}`,
      'response_type': 'in_channel',
      'attachments': [
        {
          'text': 'Partly cloudy today and tomorrow'
        }
      ]
    };
    response.status(200).send(JSON.stringify(responseData));
  }
});


const blockKitSection = {
  'response_type': 'in_channel',
  'blocks': [
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': 'This is a mrkdwn section block :ghost: *this is bold*, and ~this is crossed out~, and <https://google.com|this is a link>'
      }
    }
  ]
};

const blockKitDivider = {
  'response_type': 'in_channel',
  'blocks':[
    {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': 'Last updated: Jan 1, 2019'
        }
      ]
    },
    {
      'type': 'divider'
    }
  ]
};

const blockKitSectionDatepicker = {
  'response_type': 'in_channel',
  'blocks':[
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': 'Pick a date for the deadline.'
      },
      'accessory': {
        'type': 'datepicker',
        'initial_date': '1990-04-28',
        'placeholder': {
          'type': 'plain_text',
          'text': 'Select a date',
          'emoji': true
        }
      }
    }
  ]
};

const blockKitSectionImage = {
  'response_type':'in_channel',
  'blocks':[
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': 'Take a look at this image.'
      },
      'accessory': {
        'type': 'image',
        'image_url': 'https://api.slack.com/img/blocks/bkb_template_images/palmtree.png',
        'alt_text': 'palm tree'
      }
    }
  ]
};

// TODO: Enter Request URL endpoint that we configured 
// in the Slack Config Dashboard
// Slash command for Block Kit to call different Block Kit elements
app.post('/{endpoint name}', function(request, response) {
    
  response.setHeader('Content-Type', 'application/json; charset=utf8');
  console.log(request.body);
  var text = request.body.text;
  var data = {};
  if (text == 'section') {
      data = blockKitSection;
  } else if (text == 'divider') {
      data = blockKitDivider;
  } else if (text == 'section-datepicker') {
      data = blockKitSectionDatepicker;
  } else if (text == 'section-image'){
      data = blockKitSectionImage;
  }
  response.status(200).send(data);
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