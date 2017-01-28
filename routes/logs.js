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

function timeDateConvert(time, day){
    if(day === 'today'){
        var datetime = new Date();
    }else if(day = 'yesterday'){
        var datetime = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    };

    if(time.length===5){
        datetime.setUTCHours(time.substring(0,2), time.substring(3,5),0,0);
    }else if(time.length===4){
        datetime.setUTCHours(time.substring(0,1), time.substring(2,4),0,0);
    };

    return(datetime)
}
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
            setObject.bed = timeDateConvert(req.body.bed,'today');
        };
    }else{
        if(req.body.bed == null){
            setObject.wake = timeDateConvert(req.body.wake,'today');
        }else{
            setObject.bed = timeDateConvert(req.body.bed,'today');
            setObject.wake = timeDateConvert(req.body.wake,'today');
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
            console.log(err)
            var daybefore = new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000)
            daybefore.setUTCHours(13, 0, 0, 0)
            collection.findOne( //calculate sleep time of this day
                {
                    'date': daybefore
                }, {}, function(e, docs){
                    if(docs != 'undefined' && setObject.wake != null && docs.bed != null) { //check if yesterday was logged and user logged waketime of today
                        var sleep = timeDiff(new Date(docs.bed), new Date(setObject.wake));
                    } else {
                        var sleep = -1;
                    }
                    res.json({sleep:sleep})
                });
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
            setObject.bed = timeDateConvert(req.body.bed,'yesterday');
        };
    }else{
        if(req.body.bed == null){
            setObject.wake = timeDateConvert(req.body.wake,'yesterday');
        }else{
            setObject.bed = timeDateConvert(req.body.bed,'yesterday');
            setObject.wake = timeDateConvert(req.body.wake,'yesterday');
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
            console.log(err)
            var today = new Date();
            today.setUTCHours(13, 0, 0, 0)
            collection.findOne( //calculate sleep time of this day
                {
                    'date': today
                }, {}, function(e, docs){
                    if(docs != 'undefined' && setObject.bed != null && docs.wake != null) { //check if today was logged and user logged bedtime of yesterday
                        var sleep = timeDiff(new Date(setObject.bed),new Date(docs.wake));
                    } else {
                        var sleep = -1;
                    }
                    res.json({sleep:sleep})
                });
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
            //check if all dates are present
            var nonpresent_dates = []
            for(var i=0; i<8; i++){
                var date = new Date(new Date(today).getTime() - i * 24 * 60 * 60 * 1000);
                console.log(date)
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
                    nonpresent_fields.push({'date':docs[j].date, 'fields':missingfields})
                }
            };

            //Prepare response
            var resp = {}
            //First add dates with missing fields
            resp.missing = nonpresent_fields;
            //Next add dates which were not present as missing both fields
            for(var i=0; i<nonpresent_dates.length; i++){
                var obj = {}
                obj.date = nonpresent_dates[i];
                obj.fields = ['wake','bed']
                resp.missing.push(obj)
            }
            res.json(resp)
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
