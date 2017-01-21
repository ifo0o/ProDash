var express = require('express');
var router = express.Router();

/* GET text page. */
router.get('/', function(req, res, next) {
    res.render('logs', {
        title: 'ProducDash'
    });
});

/*
 * PUT create new log if doesn't exist, else updates
 */
router.put('/new', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var date = new Date(req.body.date);
    date.setUTCHours(13, 0, 0, 0)

    var yesterday = new Date(new Date(req.body.date).getTime() - 24 * 60 * 60 * 1000);
    yesterday.setUTCHours(13, 0, 0, 0);

    //console.log(req.body)
    collection.findOneAndUpdate(
        {
            "date": date
        }, {
            '$setOnInsert': {
                "date": date
            },
            '$set': {
                'wake': new Date(req.body.wake),
                'bed': new Date(req.body.bed)
            }
        }, {
            'upsert': true
        }, function(err1, result1) {
            collection.findOne( //calculate sleep time of this day
                {
                    'date': yesterday
                }, {}, function(e, docs){
                    if(typeof docs != 'undefined') { //check if yesterday was logged
                        var sleep = timeDiff(new Date(docs.bed), new Date(req.body.wake));
                    } else {
                        var sleep = 0;
                    }
                    collection.update(
                        {
                            'date': date
                        }, {
                            '$set':{
                                'sleep': sleep
                            }
                        }, function(err, result) {
                            res.send(
                            (err === null) ? {
                                msg: ''
                            } : {
                                msg: err
                            });
                    });
            });
    });
});

/*
 * GET sleeptime last night
 */
router.get('/sleep', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date(req.query.date);
    today.setUTCHours(13, 0, 0, 0)

    var yesterday = new Date(new Date(req.query.date).getTime() - 24 * 60 * 60 * 1000);
    yesterday.setUTCHours(13, 0, 0, 0);

    collection.findOne({
            "date": yesterday
        }, {}, function(e, docs) {
            if(docs){ //if result is found
                var sleeptime_yesterday = new Date(docs.sleep);
            }else{
                var noEntry = true;
            };
            collection.findOne({
                    "date": today
                }, {}, function(e, docs) {
                    if(docs){ //if result is found
                        var waketime_today = new Date(docs.wake);
                        var sleep = waketime_today.getTime() - sleeptime_yesterday.getTime();
                        sleep = sleep / (1000*60*60); //convert to hours
                    }else{
                        var noEntry = true;
                    };
                    if(!noEntry){
                        res.json({
                            'entry' : true,
                            'start': sleeptime_yesterday,
                            'end' : waketime_today,
                            'sleep':sleep
                        });
                    }else{
                        res.json({
                            'entry' : false
                        });
                    };

                });
        });
});

function timeDiff(d1,d2){
    var t = d2.getTime() - d1.getTime();
    t = t / (1000*60*60); //convert to hours
    return(t)
};


module.exports = router;
