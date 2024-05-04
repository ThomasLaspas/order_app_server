const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "people" },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    village: { type: String },
  },
  cartItems: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
