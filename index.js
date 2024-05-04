const ex = require("express");
const app = ex();
const cors = require("cors");
const connectdb = require("./connectdb");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const error = require("./error");
const path = require("path");
const verify = require("./tokenauth");

//db connection
connectdb();
//mildaware
app.use(helmet());
app.use(cors());
app.use("/api/stripe/checkout/webhook", ex.raw({ type: "*/*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ex.urlencoded({ extended: true }));
app.use(ex.json({ limit: "10mb" }));
app.use(morgan("dev"));
// Middleware to set Content Security Policy header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'");
  next();
});
app.use(ex.static(path.join(__dirname, "./public")));

app.use("/api/user", require("./routes/user"));
app.use("/api/stripe", require("./routes/webhook"));
app.use(verify);
app.use("/api/order", require("./routes/orders"));
app.use("/api/restaurant", require("./routes/restaurant"));

//mildware for errors
app.use(error);

mongoose.connection.once("open", () => {
  console.log("connected to mongoDb");
  app.listen(3000, console.log("the port we use is 3000"));
});
