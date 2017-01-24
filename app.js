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

//var TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
//const TOKEN = '293492545:AAHhD2Tk93nsSjqCTV552J1ID8JTYkuPzac';

const TOKEN = process.env.TELEGRAM_TOKEN || '293492545:AAHhD2Tk93nsSjqCTV552J1ID8JTYkuPzac';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = {
  polling: true
};
const bot = new TelegramBot(TOKEN, options);


// Matches /photo
bot.onText(/\/photo/, function onPhotoText(msg) {
  // From file path
  const photo = `${__dirname}/../test/data/photo.gif`;
  bot.sendPhoto(msg.chat.id, photo, {
    caption: "I'm a bot!"
  });
});


// Matches /audio
bot.onText(/\/audio/, function onAudioText(msg) {
  // From HTTP request
  const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
  const audio = request(url);
  bot.sendAudio(msg.chat.id, audio);
});


// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
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


// Matches /editable
bot.onText(/\/editable/, function onEditableText(msg) {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Edit Text',
             // we shall check for this value when we listen
             // for "callback_query"
            callback_data: 'edit'
          }
        ]
      ]
    }
  };
  bot.sendMessage(msg.from.id, 'Original Text', opts);
});


// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;

  if (action === 'edit') {
    text = 'Edited Text';
  }

  bot.editMessageText(text, opts);
});

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
