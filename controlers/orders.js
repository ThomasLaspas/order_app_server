const dotenv = require("dotenv").config();
const stripe = require("stripe")(process.env.REACT_STRIPE_SECRET_KEY);
const frontent = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEB_HOOK;
const Orders = require("../schemas/orders");
const restaurant = require("../schemas/restaurant");
const User = require("../schemas/user");

const getOrders = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    const rest = await restaurant.findOne({ user: user._id });
    const orders = await Orders.find({ restaurant: rest._id })
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something wrong is happend" });
  }
};

const UpdateStatus = async (req, res) => {
  const { stat, id } = req.body;
  try {
    const order = await Orders.findByIdAndUpdate({ _id: id }, { status: stat });
    if (!order)
      return res.status(500).json({
        message: "something wrong happend updating the order try again",
      });
    res.status(200).json({ message: "Your order upadated succesfully" });
  } catch (err) {
    res.status(500).json({ message: "Something wrong happend try again" });
    console.log(err);
  }
};

const sliStripe = async (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      sig.toString(),
      STRIPE_ENDPOINT_SECRET
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something wet wrong try again" });
  }
  if (event.type === "checkout.session.completed") {
    const order = await Orders.findById(event.data.object.metadata?.orderid);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.totalAmount = event.data.object.amount_total / 100;
    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

const checkout = async (req, res) => {
  const { restid, userid, deliveryDetails, cartItems, deliveryPrice } =
    req.body;
  try {
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Athens",
    });
    const lineItems = cartItems.map((it) => ({
      price_data: {
        currency: "eur",
        product_data: {
          // Corrected typo from "priduct_data" to "product_data"
          name: it.name,
        },
        unit_amount: it.price * 100, // Corrected typo from "unit_amaount" to "unit_amount", and multiplied by 100 to convert to cents
      },
      quantity: it.quantity,
    }));
    const ord = await Orders.create({
      restaurant: restid,
      user: userid,
      deliveryDetails: deliveryDetails,
      cartItems: cartItems,
      createdAt: currentDate,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Delivery",
            type: "fixed_amount",
            fixed_amount: {
              amount: deliveryPrice * 100,
              currency: "eur",
            },
          },
        },
      ],
      mode: "payment",
      metadata: {
        restid: restid,
        orderid: ord._id.toString(),
      },
      success_url: `${frontent}/orderstatus?success=true`,
      cancel_url: `${frontent}/${restid}`,
    });
    console.log(session);

    if (!session.url) {
      await Orders.findByIdAndDelete(ord._id);
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    res.json({ url: session.url, message: "succes" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something Wrong happend" });
  }
};

module.exports = { checkout, sliStripe, getOrders, UpdateStatus };
