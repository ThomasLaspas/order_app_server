const User = require("../schemas/user");
const restaurant = require("../schemas/restaurant");

const createrest = async (req, res) => {
  const { username } = req.params;
  const { name, img } = req.body;
  try {
    if (!name || !img)
      return res
        .status(500)
        .json({ message: "Fill all fileds with iformation" });
    const user = await User.findOne({ username });

    const existrest = await restaurant.findOne({ user: user._id });
    if (existrest)
      return res
        .status(500)
        .json({ message: "You already create this restaurant" });

    const rest = await restaurant.create({
      user: user._id,
      restaurantName: name,
      createdAt: new Date(),
      imageUrl: img,
    });
    // Update the user's isAdmin property to true
    user.isAdmin = true;
    await user.save(); // Save the updated user document
    res.status(200).json({
      message: "Your restaurant was created successfully",
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "something wrong happend. Try again later" });
  }
};
const getrest = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });

    const rest = await restaurant.findOne({ user: user._id });
    if (!rest)
      return res.status(404).json({
        message:
          "Your restaurant do not exist. try to create one and come back later",
      });
    res.status(201).json(rest);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "something wrong happend. try again later" });
  }
};
const updaterest = async (req, res) => {
  const { username } = req.params;
  const {
    restaurantName,
    city,
    country,
    deliveryPrice,
    estimatedDeliveryTime,
    cousines,
    menuItems,
    img,
  } = req.body;

  try {
    const user = await User.findOne({ username });

    const upadate = {
      restaurantName,
      city,
      country,
      deliveryPrice,
      estimatedDeliveryTime,
      cousines,
      menuItems,
      imageUrl: img,
      lastUpdated: Date.now(),
    };

    const uprest = await restaurant.findOneAndUpdate(
      { user: user._id },
      upadate,
      {
        new: true,
      }
    );
    if (!uprest)
      return res
        .status(505)
        .json({ message: "Interval server error. Try again later" });
    res.status(200).json({ message: "you update your restaurant succesfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "something went wrong. try again later" });
  }
};
const delrest = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    const del = await restaurant.findOneAndDelete({ user: user._id });
    user.isAdmin = false;

    if (!del) return res.status(500).json({ message: "Interval server error" });
    await user.save();

    res.status(200).json({ message: "Your restaurant deleted succesfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong. Try again later" });
  }
};
const deletemenu = async (req, res) => {
  const { restaurantName } = req.params;
  const { id } = req.body;

  try {
    const rest = await restaurant.findOne({ restaurantName });

    // If the restaurant is not found, return 404 Not Found
    if (!rest) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Use $pull operator to remove the menuItem with the given itemId
    rest.menuItems.pull(id);

    // Save the updated restaurant
    await rest.save();

    // Return success message
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.log(err);
  }
};
const Getcityname = async (req, res) => {
  const { query } = req.body;
  const queryString = String(query);
  try {
    if (!queryString) return res.status(200).json(null);
    const rests = await restaurant.find({
      city: { $regex: `^${queryString}`, $options: "i" },
    });
    if (rests.length <= 0) return res.status(404).json({ message: "No match" });

    const uniqueCities = Array.from(new Set(rests.map((user) => user.city)));
    res.status(200).json({ uniqueCities });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something wrong jappend try again latter" });
  }
};

const searchedrest = async (req, res) => {
  const { username } = req.params;
  const { cousines, sorted, cousine } = req.body;
  const queryString = String(username);

  try {
    let query = {};
    if (queryString) {
      query.city = { $regex: `^${queryString}`, $options: "i" };
    }

    if (cousines && cousines.length > 0) {
      query.cousines = { $in: cousines };
    } else if (cousine) {
      // If no cousines are provided, filter by restaurantName or a single cousine
      query["$or"] = [{ restaurantName: cousine }, { cousines: cousine }];
    }

    let rests = await restaurant.find(query);

    if (sorted === "estimatedDeliveryTime") {
      rests = rests.sort(
        (a, b) => a.estimatedDeliveryTime - b.estimatedDeliveryTime
      );
    } else if (sorted === "deliveryPrice") {
      rests = rests.sort((a, b) => a.deliveryPrice - b.deliveryPrice);
    }

    return res.status(200).json({ rests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong try again later" });
  }
};

const GetRest = async (req, res) => {
  const { city } = req.params;
  try {
    const rest = await restaurant.find({ city });
    if (!rest)
      return res
        .status(404)
        .json({ message: "No restaurant found in this city" });

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something wrong happend" });
  }
};
const getspecificrest = async (req, res) => {
  const { id } = req.params;

  try {
    const rest = await restaurant.findById(id);
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "something wrong happend try again later" });
  }
};
module.exports = {
  createrest,
  getrest,
  updaterest,
  delrest,
  deletemenu,
  Getcityname,
  searchedrest,
  GetRest,
  getspecificrest,
};
