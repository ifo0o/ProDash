var express = require('express');
var router = express.Router();

/* GET text page. */
router.get('/', function(req, res, next) {
  res.render('logs', { title: 'ProducDash' });
});

/*
 * GET tex
 */
router.get('/tex', function(req, res) {
  var db = req.db;
  var collection = db.get('text');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});



module.exports = router;
