const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String },
  country: { type: String },
  deliveryPrice: { type: Number },
  estimatedDeliveryTime: { type: Number },
  cousines: [{ type: String }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: String },
  createdAt: { type: Date, required: true },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
