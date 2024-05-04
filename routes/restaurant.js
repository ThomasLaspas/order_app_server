const ex = require("express");
const router = ex.Router();
const valid = require("../validation");
const api = require("../controlers/restaurant");

//get my restaurant
router.get("/get/:username", api.getrest);
// get restaurants from city
router.get("/getres/:city", api.GetRest);
//get specific rest
router.get("/getspecify/:id", api.getspecificrest);
//crete restaurant
router.post("/create/:username", api.createrest);
// getrestaurant cities
router.post("/getcity", api.Getcityname);
//upadate restaurant
router.put(
  "/update/:username",
  valid.validateMyRestaurantRequest,
  api.updaterest
);
//delete restaurant
router.delete("/delete/:username", api.delrest);
//search method
router.post("/search/:username", api.searchedrest);
//delete menu
router.delete("/deletemenu/:restaurantName", api.deletemenu);
module.exports = router;
