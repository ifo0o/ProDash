var express = require('express');
var router = express.Router();

/* GET habits page. */
router.get('/', function(req, res, next) {
    res.render('habits', {
        title: 'ProducDash'
    });
});

/*
 * GET habits without streaks
 */
 /*
router.get('/h', function(req, res) {
    var db = req.db;
    var collection = db.get('habits');
    collection.find({}, {}, function(e, docs) {
        res.json(docs);
    });
});
*/

/*
 * GET habits including streaks
 */
router.get('/h', function(req, res) {
    var db = req.db;
    var collection = db.get('habits');
    collection.find({}, {}, function(e, docs) {
        //console.log(docs)
        for(var j = 0; j < docs.length; j++){
            for(var i = 0; i < docs[j].days.length; i++) {
                docs[j].days[i] = new Date(docs[j].days[i]);
            };
            //console.log(docs[j])
            //console.log(streak(docs[j].days))
            docs[j].streak = streak(docs[j].days);
        }
        res.json(docs);
    });
});

/*
 * PUT to add other dates.
 mongo ds129028.mlab.com:29028/producdash -u admin -p admin
 */
router.put('/date', function(req, res) {
    var db = req.db;
    var collection = db.get("habits");

    date = new Date(req.body.date)
    console.log(date)
    date.setSeconds(0)
    date.setMinutes(0)
    date.setHours(0)
    date.setMilliseconds(0)

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
PUT add today to habit if not already done
*/
router.put('/today', function(req, res) {
    var db = req.db;
    var collection = db.get("habits");

    var today = new Date()
    today.setSeconds(0)
    today.setMinutes(0)
    today.setHours(0)
    today.setMilliseconds(0)
    console.log(today)

    console.log(req.body)
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
        console.log(err)
    });
});


//Helper functions to calculate streaks
function streak(d) {
    s = 0;
    while(consecutive(latestDay(d), nextLatestDay(d))) {
        s++;
        d = removeLatestDay(d);
    }
    s++; // since counted the consecutive links, consective days = ++;
    return s;
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

module.exports = router;
