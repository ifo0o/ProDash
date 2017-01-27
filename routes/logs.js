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
                        var sleep = -1;
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
                                msg: '',
                                sleep: sleep
                            } : {
                                msg: err
                            });
                    });
            });
    });
});

/*
 * PUT create new log for today if it doesn't exist, else updates today's log
 */
router.put('/new/today', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var date = new Date(); //Date in database will be today
    date.setUTCHours(13, 0, 0, 0)

    var setObject = {} //make object. Note triple === will not work here
    if(req.body.wake == null){
        if(req.body.bed == null){
            //nothing was sent
        }else{
            setObject.bed = new Date(req.body.bed);
        };
    }else{
        if(req.body.bed == null){
            setObject.wake = new Date(req.body.wake);
        }else{
            setObject.bed = new Date(req.body.bed);
            setObject.wake = new Date(req.body.wake);
        };
    };
    console.log(setObject)

    collection.findOneAndUpdate(
        {
            "date": date
        }, {
            '$setOnInsert': {
                "date": date
            },
            '$set': setObject
        }, {
            'upsert': true
        }, function(err, result) {
            res.json(result)
    });
});

/*
 * PUT create new log for yesterday if it doesn't exist, else updates yesterday's log
 */
router.put('/new/yesterday', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0)
    var yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000); //Date will be yesterday
    yesterday.setUTCHours(13, 0, 0, 0);

    var setObject = {} //make object. Note triple === will not work here
    if(req.body.wake == null){
        if(req.body.bed == null){
            //nothing was sent
        }else{
            setObject.bed = new Date(req.body.bed);
        };
    }else{
        if(req.body.bed == null){
            setObject.wake = new Date(req.body.wake);
        }else{
            setObject.bed = new Date(req.body.bed);
            setObject.wake = new Date(req.body.wake);
        };
    };
    console.log(setObject)
    console.log(yesterday)

    collection.findOneAndUpdate(
        {
            "date": yesterday
        }, {
            '$setOnInsert': {
                "date": yesterday
            },
            '$set': setObject
        }, {
            'upsert': true
        }, function(err, result) {
            res.json(result)
    });
});

/*
 * GET sleeptime last night given date
 */
router.get('/sleep', function(req, res) {
     var db = req.db;
     var collection = db.get("logs");

     var today = new Date(req.query.date);
     today.setUTCHours(13, 0, 0, 0)
     var yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000);
     yesterday.setUTCHours(13, 0, 0, 0);

     console.log(yesterday)

     var returnObject = {};

     collection.findOne({
             "date": yesterday
         }, {}, function(e, docs) {
             missing = false
             console.log(e)
             if(docs){ //if result is found for yesterday
                 returnObject.bedtime_yesterday = new Date(docs.bed);
                 returnObject.entry = true;
             }else{
                 returnObject.entry = false;
             };
             collection.findOne({
                     "date": today
                 }, {}, function(e, docs) {
                     console.log(e)
                     if(docs && returnObject.entry){ //if result is found for today and yesterday
                         returnObject.waketime_today = new Date(docs.wake);
                         var sleep = returnObject.waketime_today.getTime() - returnObject.bedtime_yesterday.getTime();
                         returnObject.sleep = sleep / (1000*60*60); //convert to hours
                     }else{
                         returnObject.entry = false;
                     };
                     res.json(returnObject);
                 });
         });
 });

/*
 * GET sleeptime last night
 */
router.get('/sleep/today', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0)
    var yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000);
    yesterday.setUTCHours(13, 0, 0, 0);

    console.log(yesterday)

    var returnObject = {};

    collection.findOne({
            "date": yesterday
        }, {}, function(e, docs) {
            missing = false
            console.log(e)
            if(docs){ //if result is found for yesterday
                returnObject.bedtime_yesterday = new Date(docs.bed);
                returnObject.entry = true;
            }else{
                returnObject.entry = false;
            };
            collection.findOne({
                    "date": today
                }, {}, function(e, docs) {
                    console.log(e)
                    if(docs && returnObject.entry){ //if result is found for today and yesterday
                        returnObject.waketime_today = new Date(docs.wake);
                        var sleep = returnObject.waketime_today.getTime() - returnObject.bedtime_yesterday.getTime();
                        returnObject.sleep = sleep / (1000*60*60); //convert to hours
                    }else{
                        returnObject.entry = false;
                    };
                    res.json(returnObject);
                });
        });
});

router.get('/times', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date(req.query.date);
    today.setUTCHours(13, 0, 0, 0)

    var returnObject = {};

    collection.findOne({
            "date": today
        }, {}, function(e, docs) {
            res.json(docs)
        });
});

router.get('/times/today', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0)

    var returnObject = {};

    collection.findOne({
            "date": today
        }, {}, function(e, docs) {
            res.json(docs)
        });
});

router.get('/sleep/week', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0)
    var oneWeekAgo = new Date(new Date(today).getTime() - 7 * 24 * 60 * 60 * 1000);
    oneWeekAgo.setUTCHours(13, 0, 0, 0);

    var returnObject = {};

    collection.find({
            "date": {
                '$gte': oneWeekAgo,
                '$lte' : today
            }
        }, {sort:{date:-1}, fields:{sleep:0}}, function(e, docs) {
            console.log(e)
            for(var i=0; i<docs.length-1; i++){
                //console.log(docs[i].date)
                //console.log(docs[i+1].date)
                if(consecutive(docs[i].date,docs[i+1].date) && docs[i].wake != null && docs[i+1].bed != null){
                    docs[i].sleep = timeDiff(docs[i+1].bed,docs[i].wake)
                };
            };
            res.json(docs)
        });
});

router.get('/missing/week', function(req, res) {
    var db = req.db;
    var collection = db.get("logs");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0)
    var oneWeekAgo = new Date(new Date(today).getTime() - 7 * 24 * 60 * 60 * 1000);
    oneWeekAgo.setUTCHours(13, 0, 0, 0);

    var returnObject = {};

    collection.find({
            "date": {
                '$gte': oneWeekAgo,
                '$lte' : today
            }
        }, {sort:{date:-1}, fields:{sleep:0}}, function(e, docs) {
            console.log(e)

            //check if all dates are present
            var nonpresent_dates = []
            for(var i=0; i<8; i++){
                var date = new Date(new Date(today).getTime() - i * 24 * 60 * 60 * 1000);
                var present = false;
                for(var j=0; j<docs.length; j++){
                    if(docs[j].date.getTime() - date.getTime() == 0){
                        present = true;
                    };
                };
                if(!present){
                    nonpresent_dates.push(date);
                };
            };

            //check if all fields are entered
            var nonpresent_fields = []
            for(var j=0; j<docs.length; j++){
                var missingfields = []
                if(docs[j].wake == null){
                    missingfields.push('wake');
                }
                if(docs[j].bed == null){
                    missingfields.push('bed');
                }
                if(missingfields.length > 0){
                    nonpresent_fields.push({'date':docs[j].date, 'missing':missingfields})
                }
            };
            //console.log(nonpresent_dates)
            //console.log(nonpresent_fields)
            var missing = {}
            missing.missingdates = nonpresent_dates;
            missing.missingfields = nonpresent_fields;
            res.json(missing)
        });
});

function timeDiff(d1,d2){
    var t = d2.getTime() - d1.getTime();
    t = t / (1000*60*60); //convert to hours
    return(t)
};

function consecutive(latest, former) {
    if(latest - former === 86400000) {
        return true;
    } else {
        return false;
    };
};

/* Function after sending results to calculate sleep

    var yesterday = new Date(new Date(req.body.date).getTime() - 24 * 60 * 60 * 1000);
    yesterday.setUTCHours(13, 0, 0, 0);

    collection.findOne( //calculate sleep time of this day
        {
            'date': yesterday
        }, {}, function(e, docs){
            if(typeof docs != 'undefined') { //check if yesterday was logged
                var sleep = timeDiff(new Date(docs.bed), new Date(req.body.wake));
            } else {
                var sleep = -1;
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
                        msg: '',
                        sleep: sleep
                    } : {
                        msg: err
                    });
            });
    });

*/
module.exports = router;
