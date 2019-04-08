'use strict';
const API_AI_TOKEN = "1ee7f7c6ade444b9b25a7e0226f0a024";
const apiAiClient = require('apiai')(API_AI_TOKEN);
const MongoClient = require('mongodb').MongoClient;

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
console.log(result);

if(result === "Fee"){

	makePayload(sender_psid,["postback","postback"],"Whom do you want to know about ?",["I.MTech","MTech"],["I.MTech","MTech"]);
}
else if(result === "Phd" || result === "Research")
{
	sendText(sender_psid,"There are alot of research opportunities available here at IIITB and you can find further information here : https://iiitb.ac.in/content.php?pid=research-home");
	setTimeout(function(){sendText(sender_psid,"Alot of aluminis who wanted to go for Phd have been selected by prestigious institutes like Harvard,MIT,University of Washington");
},1000);
}else if(result === "placements")
{
	sendText(sender_psid,"The placements here are at par with the best colleges in India and if you work hard during your stay you'll easily get a well paying job that is all we can tell you");
}
else if(result.includes("Infrastructure"))
{
	sendTextDBS(sender_psid,result);

}
else if(result === "Faculty")
{
	sendText(sender_psid,"One of India's best Faculty, All of them graduating from the top universities and colleges of the world coming here with plenty of industry experience, some of them still have ties with the industry. Their expeiece in teaching and industry is clearly observed during their lectures. You will enjoy all of the lectures here this bot is pretty sure of that !!");
	setTimeout(function(){sendTextDBS(sender_psid,result);},3000);
}
else if(result.includes("Sports"));
{
	sendTextDBS(sender_psid,result);
}
else{
	sendText(sender_psid,result);
}
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
  if (payload === "I.MTech") {
			  	sendTextDBS(sender_psid,"Fees-"+ payload);
			  	setTimeout(function(){
			  		var reply= "Would you like to know about scholarship opportunities aswell ?";
	makePayload(sender_psid,["postback","postback"],reply,["First-Scholarship-Yes","Scholarship-No"],["Yes please ! ","No I'm rich"]);
},3000);
    
  } else if (payload === 'MTech') {
  				sendTextDBS(sender_psid,"Fees-"+payload);
  				setTimeout(function(){
			  		var reply= "Would you like to know about scholarship opportunities aswell ?";
	makePayload(sender_psid,["postback","postback"],reply,["First-Scholarship-Yes","Scholarship-No"],["Yes please ! ","No I'm rich"]);
},3000);
  }
  else if (payload === "First-Scholarship-Yes")
  {
  				makePayload(sender_psid,["postback","postback"],"Whose scholarship would to like to know about",["Scholarship-MTech","Scholarship-IMTech"],["MTech","IMTech"]);
  }
  else if(payload === "Scholarship-No")
  {
  				sendText(sender_psid,"Well you rich spoiled kid OK ");
  }
  else if( payload === "Scholarship-MTech")
  {
  				sendTextDBS(sender_psid,payload);
  }
  else if( payload === "Scholarship-IMTech")
  	{
  				sendTextDBS(sender_psid,payload);
  	}

// Send the message to acknowledge the postback
  sendText(sender_psid, response);

}


function callSendAPI(response){

request({
 uri : 'https://graph.facebook.com/v2.6/me/messages',
 qs:{access_token: "EAADkck8r4ZCMBABkOhnJTZAemELZAXZBq4sNz9U2FGd1JpB7wZB7OCMdDcc7m7bF5uXUzg7Q4AmR3gdWb3neuOMKrRelAFQpz72M2Wl1NxQMjMInXJ7ye8ZAqIZBelQCoyf9KOjN4ZCCUfrio0dgKLC4eHwbbDvRaKDkqaXEr09jvQZDZD"},
method: 'POST', 
json: response
}, (err,res,body) => {
 if(!err && res.statusCode == 200) {
 console.log('message sent!')
 }
 else{
 console.error("Unable to send message: "+res);
 }
});
}


function makePayload(sender_psid,type,text,payload,caption)
{
	console.log("called makePayload");
	var messageData = {
		recipient:{
			id:sender_psid
		},
		message:{
			attachment:{
				type:"template",
				payload:{
					template_type:"button",
					text:text,
					buttons:[

					]
				}
			}
		}
	};

	var fill;
	for(var i=0;i<type.length;i++)
	{
		if(type[i]==="postback")
		{
			fill = {
				type:type[i],
				title:caption[i],
				payload:payload[i],
			};
			messageData.message.attachment.payload.buttons.push(fill);
		}
	}
	callSendAPI(messageData);
}

function sendText(sender_psid, messageText)
{
	var messageData = {
		recipient: {

			id: sender_psid
		},
		message: {
			text: messageText
		}
	};
	callSendAPI(messageData);
}
function sendTextDBS(sender_psid,response)
{
		MongoClient.connect("mongodb://localhost:27017/",function (err, db){
				var dbo=db.db("queries");
				var category= response.split("-");
				console.log(category[0]);
				var query={category: category[1]};
				if(category[0] === "Fees"){
				dbo.collection('fees',function(err,collection) {
					collection.find(query).toArray(function(err, items){
					if(err) throw err;
					var ans="The Sructured Fees for the "+response+ " Programme is as follows :- \n"
					ans =ans + "Tuition Fees: Rs." + items[0].TuitionFee + "\nAdmission Form Fees : Rs."+items[0].AdmissionFormFee + "\nMess and Hostel Fees: Rs." + items[0].MessHostelFee;
					console.log(ans);
					sendText(sender_psid, ans);
					});
				});
				}
				if(category[0] === "Scholarship")
				{
					dbo.collection('fees',function(err,collection) {
					query ={category:response};
					collection.find(query).toArray(function(err, items){
					if(err) throw err;
					var ans=items[0].description;
					console.log(ans);
					sendText(sender_psid, ans);
					});
				});
				}
				if(category[0] === "Infrastructure")
				{
					dbo.collection('Infrastructure',function(err,collection){
						collection.find(query).toArray(function(err,items){
							if(err) throw err;
							var ans=items[0].description;
							console.log(ans);
							sendText(sender_psid,ans);
						});
					});
				}
				if(category[0] === "Faculty")
				{
					dbo.collection('Faculty',function(err,collection){
						collection.find(response).toArray(function(err,items){
							if(err) throw err;
							var ans=items[0].description;
							console.log(ans);
							sendText(sender_psid,ans);
						});
					});
				}
				if(category[0] === "Sports")
				{
					dbo.collection('Infrastructure',function(err,collection){
						collection.find(query).toArray(function(err,items){
							if(err) throw err;
							var ans=items[0].description;
							console.log(ans);
							sendText(sender_psid,ans);
						});
					});
				}
			});

}

