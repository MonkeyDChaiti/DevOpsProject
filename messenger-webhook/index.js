'use strict';
const API_AI_TOKEN = "1ee7f7c6ade444b9b25a7e0226f0a024";
const apiAiClient = require('apiai')(API_AI_TOKEN);

const PAGE_ACCESS_TOKEN="EAADkck8r4ZCMBABkOhnJTZAemELZAXZBq4sNz9U2FGd1JpB7wZB7OCMdDcc7m7bF5uXUzg7Q4AmR3gdWb3neuOMKrRelAFQpz72M2Wl1NxQMjMInXJ7ye8ZAqIZBelQCoyf9KOjN4ZCCUfrio0dgKLC4eHwbbDvRaKDkqaXEr09jvQZDZD";
const request=require("request"),
express = require('express'),
bodyParser = require('body-parser'),
app = express().use(bodyParser.json());

app.listen(process.env.PORT || 3000,() => console.log('webhook is listening'));


app.post('/webhook',(req,res) => {
let body = req.body;
if(body.object === 'page'){
	 body.entry.forEach(function(entry){
		  let webhook_event = entry.messaging[0];	
  		  console.log(webhook_event);

		  let sender_psid = webhook_event.sender.id;
		  console.log('Sender PSID: '+sender_psid);

		  if(webhook_event.message){

		    //differentiate messages
		  handleMessage(sender_psid, webhook_event.message);
		  }
		  else if(webhook_event.postback) {
		  handlePostback(sender_psid, webhook_event.postback);  
		  }
 	});

 	res.status(200).send('EVENT_RECIEVED');
	}else{
 	res.sendStatus(404);
	}
});


app.get('/webhook', (req,res) => {

const VERIFY_TOKEN = "abc"

let mode = req.query['hub.mode'];
let token = req.query['hub.verify_token'];
let challenge = req.query['hub.challenge'];


if(mode && token){

 if(mode === 'subscribe' && token === VERIFY_TOKEN){
  console.log('WEBHOOK_VERIFIED');
  res.status(200).send(challenge);
 }
 else
 {
  res.sendStatus(403);
 }
}
});


function handleMessage(sender_psid, received_message){
let result;
let apiaiSession = apiAiClient.textRequest(received_message.text,{sessionId:'chatbot'});

if(received_message.text){


apiaiSession.on('response',(response) => {
result = response.result.fulfillment.speech;
callSendAPI(sender_psid, result);
});
}else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    result = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 
apiaiSession.on('error',error => console.log(error));
apiaiSession.end();
}


function handlePostback(sender_psid, received_postback){
let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }

// Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);

}


function callSendAPI(sender_psid, response){
var request_body = {
  recipient: {
   id: sender_psid
  },
  message: { 
	text: response 
	}
 };


request({
 uri : 'https://graph.facebook.com/v2.6/me/messages',
 qs:{access_token: "EAADkck8r4ZCMBABkOhnJTZAemELZAXZBq4sNz9U2FGd1JpB7wZB7OCMdDcc7m7bF5uXUzg7Q4AmR3gdWb3neuOMKrRelAFQpz72M2Wl1NxQMjMInXJ7ye8ZAqIZBelQCoyf9KOjN4ZCCUfrio0dgKLC4eHwbbDvRaKDkqaXEr09jvQZDZD"},
method: 'POST', 
json: request_body
}, (err,res,body) => {
 if(!err) {
 console.log('message sent!')
 }
 else{
 console.error("Unable to send message:"+err);
 }
});
}


