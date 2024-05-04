const ex = require("express");
const router = ex.Router();
const api = require("../controlers/orders");

router.post("/checkout/webhook", api.sliStripe);

module.exports = router;
