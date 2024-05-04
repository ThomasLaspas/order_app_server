const ex = require("express");
const router = ex.Router();
const api = require("../controlers/orders");

//get orfers
router.post("/my-orders", api.getOrders);

// upadate status
router.put("/updatestatus", api.UpdateStatus);

//create checkout session
router.post("/checkout/create-checkout-session", api.checkout);

module.exports = router;
