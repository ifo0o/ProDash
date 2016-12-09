var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ProducDash' });
});

/* GET text page. */
router.get('/text', function(req, res, next) {
  res.render('text', { title: 'ProducDash' });
});

module.exports = router;
