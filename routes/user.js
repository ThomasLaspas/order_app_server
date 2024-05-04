const ex = require("express");
const router = ex.Router();
const api = require("../controlers/user");
const path = require("path");
const verifyJWT = require("../tokenauth");
const valid = require("../validation");

router.get("/get/:username", verifyJWT, api.GetUser);
router.post("/get", api.getuser);
router.post("/", api.createcurentuser);
//pass reset
router.post("/request-resetpassword", api.resetPass);
router.get("/reset/:userId/:token/:email", api.resetpass);
router.post("/resetpassword", api.changepass);
//update user
router.put("/update", verifyJWT, api.updateuser);
//get user orders
router.post("/my-orders", verifyJWT, api.getOrders);

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "resetpass.html"));
});
module.exports = router;
