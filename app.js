"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://admin:admin@ds129028.mlab.com:29028/producdash');

var routes = require('./routes/index');
var tex = require('./routes/text');
var habits = require('./routes/habits');
var logs = require('./routes/logs');

var app = express();

var http = require("http");
var qs = require("querystring");
//const myurl = "producdash.herokuapp.com";
//const myport = null;
const myurl = "localhost";
const myport = "3000"

const TOKEN = process.env.TELEGRAM_TOKEN || '293492545:AAHhD2Tk93nsSjqCTV552J1ID8JTYkuPzac';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = {
  polling: true
};
const bot = new TelegramBot(TOKEN, options);

// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yess, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
  const resp = match[1];
  bot.sendMessage(msg.chat.id, resp);
});

// Hoi bericht
bot.onText(/hey|hoi/i, function onEchoText(msg, match) {
  const resp = match[1];
  bot.sendMessage(msg.chat.id, 'Hoi Ivo! Wat kan ik voor je doen?');
});

bot.onText(/((?=.*\bgist)|(?=.*\bvand\b))((?=.*\bwak)|(?=.*\bop)|(?=.*\bbed))(?=.*(([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])).*/gi, function onLoveText(msg) {
    console.log(msg.text)

    var today_patt = /vand/;
    var yesterday_patt = /gist/;
    var time_patt = /(([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])/
    var wake_patt = /wak|opst/
    var bed_patt = /bed/

    //Check if info is there
    var info = {}
    info.day = (today_patt.test(msg.text) && !yesterday_patt.test(msg.text)) || (!today_patt.test(msg.text) && yesterday_patt.test(msg.text)) //XOR
    info.time = time_patt.test(msg.text)
    info.subj = (wake_patt.test(msg.text) && !bed_patt.test(msg.text)) || (!wake_patt.test(msg.text) && bed_patt.test(msg.text)) //XOR
    console.log(info)

    if(info.day && info.time && info.subj) {
        //Prepare info
        var sendbody = {}
        //Determine date
        if(today_patt.test(msg.text)) {
            var path = '/logs/new/today'
        } else {
            var path = '/logs/new/yesterday'
        }
        //Determine time
        var time = time_patt.exec(msg.text)[1]
            //Determine type
        if(wake_patt.test(msg.text)) {
            sendbody.wake = time;
        } else {
            sendbody.bed = time;
        }
        bot.sendMessage(msg.chat.id, 'Oké, ik zal het noteren!')

        var options = {
            "method": "PUT",
            "hostname": myurl,
            "port": myport,
            "path": path,
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
            }
        };

        var req = http.request(options, function(res) {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            res.on("end", function() {
                var body = Buffer.concat(chunks);
                var data = JSON.parse(body);
                console.log(data);
                if(data.sleep > 0) {
                    bot.sendMessage(msg.chat.id, 'Je hebt vannacht ' + data.sleep.toFixed(1) + ' uren geslapen!')
                };
            });
        });
        req.write(qs.stringify(sendbody));
        req.end();
    } else {
        bot.sendMessage(msg.chat.id, 'Hmm, je hebt me niet alle info gegeven die ik nodig heb om je slaapgegevens te noteren...')
    };
});


    /*

    if(today_patt.test(msg.text)){
        if(wake_patt.test(msg.text)){
            if(time_patt.test(msg.text)){
                var time = time_patt.exec(msg.text)[1]
                bot.sendMessage(msg.chat.id, 'Ik noteer dat je vandaag om '+time+' bent opgestaan!')
                //send toda
            }else{
                //bot.sendMessage(msg.chat.id, 'Ik moet een tijd weten, anders kan ik natuurlijk niks opschrijven!')
                bot.sendMessage(msg.chat.id, 'Om hoe laat ben je vandaag opgestaan?',{reply_markup:{force_reply:true}})
                .then(function(sent){
                    bot.onReplyToMessage(sent.chat.id, sent.message_id, function(msg){
                        if(time_patt.test(msg.text)){
                            var time = time_patt.exec(msg.text)[1]
                            bot.sendMessage(msg.chat.id, 'Ik noteer dat je vandaag om '+time+' bent opgestaan!')
                        }else{
                            bot.sendMessage(msg.chat.id, 'Hmm, die tijd begrijp ik niet...')
                        };
                    });
                });
            };
        }else if(bed_patt.test(msg.text)){
            if(time_patt.test(msg.text)){
                var time = time_patt.exec(msg.text)[1]
                bot.sendMessage(msg.chat.id, 'Ga je vandaag naar bed om '+time+' uur?')
            }else{
                bot.sendMessage(msg.chat.id, 'Ik moet een tijd weten, anders kan ik natuurlijk niks opschrijven!')
            }
        }else{
            bot.sendMessage(msg.chat.id, 'Gaat dit de tijd dat je opstond of dat je naar bed ging? ',{reply_markup:{force_reply:true}})
            .then(function(sent){
                bot.onReplyToMessage(sent.chat.id, sent.message_id, function(msg){
                    if(wake_patt.test(msg.text)){
                        bot.sendMessage(msg.chat.id, 'Ik noteer dat je vandaag om '+time+' bent opgestaan!')
                    }else if(bed_patt.test(msg.text)){
                        bot.sendMessage(msg.chat.id, 'Ik noteer dat je vandaag om '+time+' naar bed ging!')
                    }else{
                        bot.sendMessage(msg.chat.id, 'Hmm, dat begrijp ik niet...')
                    }
                });
            });
        }
    }else if(yesterday_patt.test(msg.text)){
        if(wake_patt.test(msg.text)){
            if(time_patt.test(msg.text)){
                var time = time_patt.exec(msg.text)[1]
                bot.sendMessage(msg.chat.id, 'Ben je gisteren opgestaan om '+time+' uur?')
            }else{
                bot.sendMessage(msg.chat.id, 'Ik moet een tijd weten, anders kan ik natuurlijk niks opschrijven!')
            }
        }else if(bed_patt.test(msg.text)){
            if(time_patt.test(msg.text)){
                var time = time_patt.exec(msg.text)[1]
                bot.sendMessage(msg.chat.id, 'Ging je gisteren naar bed om '+time+' uur?')
            }else{
                bot.sendMessage(msg.chat.id, 'Ik moet een tijd weten, anders kan ik natuurlijk niks opschrijven!')
            }
        }else{
            //bedtijd of opstaan tijd?
        }
    }else{
        bot.sendMessage(msg.chat.id, 'Ik snap er niks van!')
    }
    console.log(msg)
    */

/*
bot.onText(/\/bed (([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])/, function onEchoText(msg, match) {
    const resp = match[1];

    bot.sendMessage(msg.chat.id, 'Ging je gisteren naar bed om ' + resp + '?', {
            reply_markup: {
                force_reply: true
            }
        })
    .then(function(sent) {
        bot.onReplyToMessage(sent.chat.id, sent.message_id, function(message) {
            if(message.text === 'ja' || message.text === 'Ja') {
                bot.sendMessage(message.chat.id, 'Oké, staat genoteerd voor gisteren!')
            } else if(message.text.includes("van")) {
                bot.sendMessage(msg.chat.id, 'Ga je vandaag naar bed om ' + resp + '?', {
                        reply_markup: {
                            force_reply: true
                        }
                    })
                .then(function(sent) {
                    bot.onReplyToMessage(sent.chat.id, sent.message_id, function(message) {
                        if(message.text === 'ja' || message.text === 'Ja') {
                            bot.sendMessage(message.chat.id, 'Oké, staat genoteerd voor vandaag!')
                        } else {
                            bot.sendMessage(message.chat.id, 'Oké, dan schrijf ik niks op!')
                        }
                    })
                })
            }
        })
    })
});
*/
/* Deprecated
// Matches /echo [whatever]
bot.onText(/\/wakker (([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9])/, function onEchoText(msg, match) {
    const resp = match[1];
    bot.sendMessage(msg.chat.id, 'Was je vanochtend wakker om ' + resp + '?',{reply_markup:{force_reply:true}})
    .then(function(sent){
        bot.onReplyToMessage(sent.chat.id, sent.message_id, function(message){
            if(message.text === 'ja' || message.text === 'Ja'){
                bot.sendMessage(message.chat.id, 'Oké, staat genoteerd!')
                var time = new Date()
                if(resp.length===5){
                    time.setUTCHours(resp.substring(0,2), resp.substring(3,5),0,0);
                }else if(resp.length===4){
                    time.setUTCHours(resp.substring(0,1), resp.substring(2,4),0,0);
                }
                time = time.toString()
                console.log(time)
                var options = {
                  "method": "PUT",
                  "hostname": myurl,
                  "port": myport,
                  "path": "/logs/new",
                  "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "cache-control": "no-cache",
                  }
                };

                var req = http.request(options, function (res) {
                  var chunks = [];

                  res.on("data", function (chunk) {
                    chunks.push(chunk);
                  });

                  res.on("end", function () {
                    var body = Buffer.concat(chunks);
                    var data = JSON.parse(body);
                    //console.log(body.toString());
                    if(data.sleep>0){
                        bot.sendMessage(message.chat.id, 'Dan heb je vannacht '+data.sleep+' uren geslapen!')
                    }else{
                        bot.sendMessage(message.chat.id, 'Ik weet niet hoelang je hebt geslapen, omdat ik niet weet hoe laat je gisteren naar bed ging...')
                    };
                  });
                });
                req.write(qs.stringify({ date: time, wake: time }));
                req.end();
            }else{
                bot.sendMessage(message.chat.id, 'Dat was dus een foutje, ik schrijf niks op!')
            };
        });
    });
});
*/

// Matches /echo [whatever]
bot.onText(/\/notities/, function onEchoText(msg, match) {
  bot.sendMessage(msg.chat.id, 'Ik pak je notities erbij! Dit zijn ze:');

  var http = require("http");

    var options = {
      "method": "GET",
      "hostname": myurl,
      "port": myport,
      "path": "/text/tex",
      "headers": {
        "cache-control": "no-cache",
        "postman-token": "cc8a3422-6e9c-c382-37c5-776e08e2bc93"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        var data = JSON.parse(body);
        bot.sendMessage(msg.chat.id, data[0].tex);
      });
    });

    req.end();
});

bot.onText(/\/onthouden (.+)/, function onEchoText(msg, match) {
    const resp = match[1];
  bot.sendMessage(msg.chat.id, 'Ik help je dat onthouden; ik zet het bovenaan je lijstje!');
  var qs = require("querystring");
  var http = require("http");

    var options = {
      "method": "PUT",
      "hostname": myurl,
      "port": myport,
      "path": "/text/add",
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
        "postman-token": "0ab217fb-6943-eb8e-9541-aeef613caa38"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });

    req.write(qs.stringify({ tex: resp }));
    req.end();
});

bot.onText(/\/taken/, function onEchoText(msg, match) {
    const resp = match[1];
  //bot.sendMessage(msg.chat.id, 'Uit welke lijst wil je je taken zien?');
  var http = require("https");

var options = {
  "method": "GET",
  "hostname": "a.wunderlist.com",
  "port": null,
  "path": "/api/v1/lists",
  "headers": {
    "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
    "x-client-id": "6b6bfca8e9a100b98a48",
    "cache-control": "no-cache",
    "postman-token": "bd6b7eca-17e6-b0ca-01ab-7f2b2deb65bf"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    var data = JSON.parse(body);
    var lists = data.map(function(a) {return a.title;});
    console.log(lists);
    var newLists = [], size = 1;
    while (lists.length > 0){newLists.push(lists.splice(0, size))};
    console.log(newLists)
    const opts = {
      reply_to_message_id: msg.message_id,
      force_reply:true,
      one_time_keyboard: true,
      reply_markup: JSON.stringify({
        keyboard:newLists
      })
    };
    bot.sendMessage(msg.chat.id, 'Uit welke lijst wil je je taken zien?', opts);

    //console.log(msg.chat.id)
    //bot.onReplyToMessage(msg.chat.id, msg.id, function(reply){
    //    console.log(reply)
    //})
  });
});

req.end();

});


bot.onText(/\/herinner (.+) (\d+)/, function onEchoText(msg, match) {
    var item = match[1];
    var time_in_minutes = match[2];
    time_in_minutes = parseInt(time_in_minutes)
    bot.sendMessage(msg.chat.id, 'Ik zal je aan ' + item + ' herinneren, over ' + time_in_minutes + ' minuten!');
    var notify = setTimeout(
        function() {
            bot.sendMessage(msg.chat.id, 'Hoi Ivo! Denk je aan ' + item + '?');
        }, time_in_minutes * 60 * 1000);
});

/*REMINDER BUGGGY !!!!!!!!! */
/*
var must_note = false;
var notify = {};
bot.onText(/\/herinner (.+) (\d+)/, function onEchoText(msg, match) {
    if(must_note) {
        bot.sendMessage(msg.chat.id, 'Ik help je straks al aan iets herinneren!')
    } else {
        console.log(match)
        var item = match[1];
        var time_in_minutes = match[2];
        time_in_minutes = parseInt(time_in_minutes) / 10
        bot.sendMessage(msg.chat.id, 'Ik zal je aan ' + item + ' herinneren, over ' + time_in_minutes + ' minuten!');

        must_note = true;

        notify = setTimeout(
            function() {
                bot.sendMessage(msg.chat.id, 'Hoi Ivo! Denk je aan ' + item + '?');
                must_note = false;
            }, time_in_minutes * 60 * 1000);

        bot.onText(/\/stop/, function onEchoText(msg, match) {
            if(!must_note) {
                bot.sendMessage(msg.chat.id, 'Ik help je op dit moment nergens aan herinneren!')
            } else {
                clearTimeout(notify)
                must_note = false;
                bot.sendMessage(msg.chat.id, 'Ik zal je niet langer herinneren aan ' + item + '!')
            };

        });
    };
});
*/






/*--------------------------------------------------------
var Bot = require('node-telegram-bot');

var bot = new Bot({
  token: '293492545:AAHhD2Tk93nsSjqCTV552J1ID8JTYkuPzac'
})

bot.on('message', function (message) {
  console.log(message);
})

bot.on('tickle',function(message){
    console.log("oeh")
    bot.sendMessage({chat_id:message.chat.id, text:"hoi"})
})

bot.on('hihi',function(message){
    console.log("oeh")
    bot.sendMessage({chat_id:message.chat.id, text:"kies", reply_markup:{one_time_keyboard: true, keyboard:[[{text:"a"}],[{text:"b"}]]}})
})

bot.on('notes',function(message){

    var http = require("http");
    var options = {
      "method": "GET",
      "hostname": "producdash.herokuapp.com",
      "port": null,
      "path": "/text/tex",
      "headers": {
        "cache-control": "no-cache",
        "postman-token": "95cc4189-c2aa-6b82-7f53-572e0f1458bb"
      }
    };
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        body = JSON.parse(body)
        var notes = body[0]
        console.log(notes)
        bot.sendMessage({chat_id:message.chat.id, text:notes.tex})
      });
    });
    req.end();

})

bot.on('remind',function(message){
    console.log("oeh")
    bot.sendMessage({chat_id:message.chat.id, text:"Waar moet ik je aan helpen herinneren?"})
}).on('arg',function(args,message){
    console.log("Reminder")
    bot.sendMessage({chat_id:message.chat.id, text:"Ik zet het bovenaan je lijstje!"});
    //add to tex list
    /*
    var qs = require("querystring");
    var http = require("http");

    var options = {
      "method": "PUT",
      "hostname": "localhost",
      "port": "3000",
      "path": "/text/add",
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
        "postman-token": "4f31dfae-0490-be95-a157-afd99cccefcf"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
      });
    });

    req.write(qs.stringify({ tex: args }));
    req.end()
    */
    /*
});
bot.start();

--------------*/

/*
const TeleBot = require('telebot');
const bot = new TeleBot('293492545:AAHhD2Tk93nsSjqCTV552J1ID8JTYkuPzac');
bot.on('text', msg => {
  let fromId = msg.from.id;
  let firstName = msg.from.first_name;
  let reply = msg.message_id;
  return bot.sendMessage(fromId, `Welcome, ${ firstName }!`, { reply });
});

bot.connect();*/

/*
const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.pushbullet.com/websocket/o.MYhpItpbrA5ET59i0hJLKbD6ZTIhPynu');

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data, flags) {
    //console.log('received: %s',data);
    var data = JSON.parse(data)
    if(data.type === 'tickle') {
        console.log("oeh!")
        //GET latest messages
        var http = require("https");
        var options = {
            "method": "GET",
            "hostname": "api.pushbullet.com",
            "port": null,
            "path": "/v2/pushes",
            "headers": {
                "access-token": "o.MYhpItpbrA5ET59i0hJLKbD6ZTIhPynu",
                "cache-control": "no-cache",
                "postman-token": "2d22627b-5a8a-935f-2971-7c092426a7fd"
            }
        };
        var req = http.request(options, function(res) {
            var chunks = [];
            res.on("data", function(chunk) {
                chunks.push(chunk);
            });
            res.on("end", function() {
                var body = Buffer.concat(chunks);
                body = JSON.parse(body)
                var incomingMessages = body.pushes.filter(function(obj) {
                    return obj.direction === 'incoming';
                });
                latestIncomingMessage = incomingMessages[0];
                latestMessage = body.pushes[0];
                console.log(latestMessage)

                //check if the latest direction is in fact incoming
                if(latestMessage.direction == "outgoing"){
                    console.log('I have no job.')
                }else{
                    console.log('I should send a message!')

                    //get notes
                    var http = require("http");
                    var options = {
                      "method": "GET",
                      "hostname": "producdash.herokuapp.com",
                      "port": null,
                      "path": "/text/tex",
                      "headers": {
                        "cache-control": "no-cache",
                        "postman-token": "95cc4189-c2aa-6b82-7f53-572e0f1458bb"
                      }
                    };
                    var req = http.request(options, function (res) {
                      var chunks = [];

                      res.on("data", function (chunk) {
                        chunks.push(chunk);
                      });

                      res.on("end", function () {
                        var body = Buffer.concat(chunks);
                        body = JSON.parse(body)
                        var notes = body[0]

                        //now send the notes
                        var http = require("https");

                        var options = {
                          "method": "POST",
                          "hostname": "api.pushbullet.com",
                          "port": null,
                          "path": "/v2/pushes",
                          "headers": {
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
                            "access-token": "o.MYhpItpbrA5ET59i0hJLKbD6ZTIhPynu",
                            "cache-control": "no-cache",
                            "postman-token": "99999c55-fc23-8341-6189-1655f68f1221"
                          }
                        };

                        var req = http.request(options, function (res) {
                          var chunks = [];

                          res.on("data", function (chunk) {
                            chunks.push(chunk);
                          });

                          res.on("end", function () {
                            var body = Buffer.concat(chunks);
                            //console.log(body.toString());
                          });
                        });

                        req.write("------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"type\"\r\n\r\nnote\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"body\"\r\n\r\n"+notes.tex+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"email\"\r\n\r\nivostoepker@gmail.com\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--");
                        req.end();
                      });
                    });

                    req.end();

                }
            });
        });
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        req.end();
    };
});

*/

//repeat tryout
/*
var minutes = 0.1, the_interval = minutes * 60 * 1000;
setInterval(function() {

console.log('I\'m gonna read new messages!')

//GET latest messages
var http = require("https");
var options = {
  "method": "GET",
  "hostname": "api.pushbullet.com",
  "port": null,
  "path": "/v2/pushes",
  "headers": {
    "access-token": "o.MYhpItpbrA5ET59i0hJLKbD6ZTIhPynu",
    "cache-control": "no-cache",
    "postman-token": "2d22627b-5a8a-935f-2971-7c092426a7fd"
  }
};
var req = http.request(options, function (res) {
  var chunks = [];
  res.on("data", function (chunk) {
    chunks.push(chunk);
  });
  res.on("end", function () {
    var body = Buffer.concat(chunks);
    body = JSON.parse(body)
    var incomingMessages = body.pushes.filter(function(obj){
        return obj.direction === 'incoming';
    });
    latestIncomingMessage = incomingMessages[0];
    latestMessage = body.pushes[0];

    if(latestMessage.direction == "outgoing"){
        console.log('I have no job.')
    }else{
        console.log('I should send a message!')
        var http = require("https");

        var options = {
          "method": "POST",
          "hostname": "api.pushbullet.com",
          "port": null,
          "path": "/v2/pushes",
          "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
            "access-token": "o.MYhpItpbrA5ET59i0hJLKbD6ZTIhPynu",
            "cache-control": "no-cache",
            "postman-token": "99999c55-fc23-8341-6189-1655f68f1221"
          }
        };

        var req = http.request(options, function (res) {
          var chunks = [];

          res.on("data", function (chunk) {
            chunks.push(chunk);
          });

          res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
          });
        });

        req.write("------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"type\"\r\n\r\nnote\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"body\"\r\n\r\nFeaky\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"email\"\r\n\r\nivostoepker@gmail.com\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--");
        req.end();
    }
    console.log(latestMessage)

    //console.log(new Date().getTime())
    //console.log(body.toString());
  });
});

req.end();

}, the_interval);
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/text', tex);
app.use('/habits', habits);
app.use('/logs', logs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
