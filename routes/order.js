var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('order', { title: 'order' });
});

router.get("/:orderId", function(req, res, next){
    res.render("orderDetail", {title: "orderDetail", orderId: req.params.orderId} )
})

module.exports = router;