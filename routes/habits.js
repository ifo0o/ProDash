var express = require('express');
var router = express.Router();

/* GET habits page. */
router.get('/', function(req, res, next) {
    res.render('habits', {
        title: 'ProducDash'
    });
});



/*
 * GET habits including streaks
 */
router.get('/h', function(req, res) {
    var db = req.db;
    var collection = db.get('habits');
    collection.find({}, {}, function(e, docs) {
        //console.log(docs)
        for(var j = 0; j < docs.length; j++) {
            for(var i = 0; i < docs[j].days.length; i++) {
                docs[j].days[i] = new Date(docs[j].days[i]);
            };
            var streakinfo = current_upto_today_streak(docs[j].days);
            docs[j].streak = streakinfo[0];
            docs[j].doneToday = streakinfo[1];
        }
        res.json(docs);
        console.log(docs)
    });
});

/*
 * PUT to add other dates.
 mongo ds129028.mlab.com:29028/producdash -u admin -p admin
 */
router.put('/date', function(req, res) {
    var db = req.db;
    var collection = db.get("habits");

    date = new Date(req.body.date);
    console.log(date)
    date.setUTCHours(13, 0, 0, 0)
    console.log(date)
    collection.update({
        '_id': req.body._id
    }, {
        "$addToSet": {
            "days": date
        }
    }, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
        console.log(err)
    });
});

/*
 * PUT to remove a date.
 mongo ds129028.mlab.com:29028/producdash -u admin -p admin
 */
router.put('/removedate', function(req, res) {
    var db = req.db;
    var collection = db.get("habits");

    date = new Date(req.body.date)
    date.setUTCHours(13, 0, 0, 0);
    console.log(date)

    collection.update({
        '_id': req.body._id
    }, {
        "$pull": {
            "days": date
        }
    }, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
        console.log(err)
    });
});

/*
PUT add today to habit if not already done
*/
router.put('/today', function(req, res) {
    var db = req.db;
    var collection = db.get("habits");

    var today = new Date();
    today.setUTCHours(13, 0, 0, 0);
    console.log(today)

    collection.update({
        '_id': req.body._id
    }, {
        "$addToSet": {
            "days": today
        }
    }, function(err, result) {
        res.send(
            (err === null) ? {
                msg: ''
            } : {
                msg: err
            }
        );
    });
});



//Helper functions to calculate streaks
function current_upto_today_streak(d) {
    var s = 0;

    var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    //yesterday.setSeconds(0);
    yesterday.setUTCHours(13, 0, 0, 0);
    //yesterday.setMinutes(0);
    //yesterday.setMilliseconds(0);

    var today = new Date();
    //today.setSeconds(0);
    today.setUTCHours(13, 0, 0, 0);
    //today.setMinutes(0);
    //today.setMilliseconds(0);
    var yesterdayDone = false;
    var todayDone = false;
    console.log(today)
    console.log(yesterday)

    for(var i = 0; i < d.length; i++) {
        if(d[i].getTime() == yesterday.getTime()) {
            yesterdayDone = true;
        };
    };
    for(var i = 0; i < d.length; i++) {
        if(d[i].getTime() == today.getTime()) {
            todayDone = true;
        };
    };

    //if habit is not done today or yesterday, then streak is zero
    if(yesterdayDone || todayDone) {
        while(consecutive(latestDay(d), nextLatestDay(d))) {
            s++;
            d = removeLatestDay(d);
        };
        s++; // since counted the consecutive links, consective days = ++;
    };

    var res = [s, todayDone]; //results including if needs to be done today
    return res;
};

function removeLatestDay(d) {
    var copy = d.slice(0); //otherwise risk modify it
    var index = copy.map(Number).indexOf(+latestDay(copy));
    copy.splice(index, 1);
    return(copy);
};

function nextLatestDay(d) {
    return new Date(latestDay(removeLatestDay(d)));
};

function latestDay(d) {
    return new Date(Math.max.apply(null, d));
};

function consecutive(latest, former) {
    if(latest - former === 86400000) {
        return true;
    } else {
        return false;
    };
};

/* Not used at the moment
function current_real_streak(d) {
    var today = new Date();
    today.setSeconds(0);
    today.setHours(0)
    today.setMinutes(0)
    today.setMilliseconds(0)
    s = 0;

    for(var i = 0; i < d.length; i++) {
        if(d[i].getTime() == today.getTime()) {
            while(consecutive(latestDay(d), nextLatestDay(d))) {
                s++;
                d = removeLatestDay(d);
            };
            s++; // since counted the consecutive links, consective days = ++;
        };
    };
    return s;
};

//get habits without streaks
router.get('/h', function(req, res) {
    var db = req.db;
    var collection = db.get('habits');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});

*/

module.exports = router;
