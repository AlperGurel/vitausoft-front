var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('kampanya');
});

router.get("/:id", function(req, res, next) {
  console.log("dsfaf")
  let id = req.params.id;
  res.render("kampanyaDetail", {id: id})
})

module.exports = router;