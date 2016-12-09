var express = require('express');
var router = express.Router();

/*
 * GET tex
 */
router.get('/', function(req, res) {
  var db = req.db;
  var collection = db.get('text');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});


/*
 * POST tex
 */
 /*
router.post('/mod', function(req, res) {
    var db = req.db;
    var collection = db.get('text');

    collection.insert(req.body, function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});
*/
/*
 * PUT to updateWO.
 mongo ds129028.mlab.com:29028/producdash -u admin -p admin
 */
router.put('/mod', function(req, res) {
    var db = req.db;
    var collection = db.get("text");

    console.log(req.body)
    collection.update({
        "name": "primary"
    }, {
        "$set": req.body
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


module.exports = router;
