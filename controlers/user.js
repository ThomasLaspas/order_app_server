const user = require("../schemas/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Orders = require("../schemas/orders");
const reset = require("../schemas/passreset");
const send = require("../sendmail");

const getuser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const founduser = await user.findOne({ email });
    if (!founduser) return res.status(401).json({ message: "User dont found" });
    // evaluate password
    const match = await bcrypt.compare(password, founduser.password);
    if (match) {
      //create JWTs
      const accessToken = jwt.sign(
        {
          username: founduser.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10y" }
      );
      const result = await founduser.save();

      res.json({
        Token: accessToken,
        data: {
          name: founduser.username,
          isadmin: founduser.isAdmin,
          email: founduser.email,
        },
      });
    } else {
      res.status(401).json({ message: "wrong password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
};
const GetUser = async (req, res) => {
  const { username } = req.params;
  try {
    const founduser = await user.findOne({ username });
    if (!founduser) return res.status(401).json({ message: "User dont found" });

    res.json({
      email: founduser.email,
      city: founduser.city,
      village: founduser.village,
      adres: founduser.addressLine1,
      id: founduser._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something went wrong" });
  }
};
const getOrders = async (req, res) => {
  const { username } = req.body;
  try {
    const userord = await user.findOne({ username });
    const orders = await Orders.find({ user: userord._id })
      .populate("restaurant")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders, userord });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something wrong is happend" });
  }
};
const updateuser = async (req, res) => {
  const { email, village, city, addressLine1 } = req.body;
  try {
    const update = {
      email,
      village,
      city,
      addressLine1,
    };
    const updateuser = await user.findOneAndUpdate({ email }, update, {
      new: true,
    });
    if (!updateuser) return res.status(500).json({ message: "Server error" });
    res.status(200).json({
      message: "user updated succesfully",
    });
  } catch (err) {
    res.status(500).json({ message: "something wrong happend" });
  }
};
const createcurentuser = async (req, res) => {
  const { username, password, email } = req.body;

  const duplicates = await user.findOne({ username });
  if (duplicates)
    return res
      .status(409)
      .json({ message: "this username already exist, try something else" });
  const emailduplicate = await user.findOne({ email });
  if (emailduplicate)
    return res
      .status(409)
      .json({ message: "this email already exist, try something else" });

  try {
    // encrypt the pwd
    const hashedpwd = await bcrypt.hash(password, 10);
    //store the new user
    const result = await user.create({
      username: username,
      password: hashedpwd,
      email: email,
    });

    res.status(201).json({ succes: "new user created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "something goes wrong try again later" });
  }
};
const resetPass = async (req, res) => {
  try {
    const { email } = req.body;
    const userreset = await user.findOne({ email });
    if (!userreset) {
      return res.status(404).json({ message: "this email is no exist" });
    }

    const existusser = await reset.findOne({ email });
    if (existusser) {
      if (existusser.expiresAt > Date.now()) {
        return res
          .status(500)
          .json({ message: "Reset password already send to your email" });
      }
      await reset.deleteOne({ email });
    }
    await send.resetpassword(userreset, res);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

const resetpass = async (req, res) => {
  const { userId, token, email } = req.params;

  try {
    const resetuer = await user.findById(userId);
    if (!resetuer) {
      const message = "try again later. Invalid passwrod reset link";
      res.redirect(`/api/user/resetpassword?status=error&message=${message}`);
    }

    const resetpass = await reset.findOne({ userId: userId });
    if (resetpass) {
      if (resetpass.expiresAt < Date.now()) {
        const message = " link has been expired";
        res.redirect(`/api/user/resetpassword?status=error&message=${message}`);
      } else {
        const isMatch = await bcrypt.compare(token, resetpass.token);
        if (!isMatch) {
          const message = " Invalid reset password. Please try again";
          res.redirect(
            `/api/user/resetpassword?status=error&message=${message}`
          );
        } else {
          res.redirect(
            `/api/user/resetpassword?id=${userId}&status=success&email=${email}`
          );
        }
      }
    } else {
      const message = " try again later. Invalid passwrod reset link";
      res.redirect(`/api/user/resetpassword?status=error&message=${message}`);
    }
  } catch (err) {
    res.status(404).json(err.message);
  }
};

const changepass = async (req, res) => {
  try {
    const { password, conf, email, userId } = req.body;

    if (password !== conf) {
      res
        .status(400)
        .json({ message: "your password did not match with confirm password" });
    } else {
      const user1 = await user.findOne({ email });

      const hashedpass = await bcrypt.hash(password, 10);
      const usernew = await user.findByIdAndUpdate(
        user1._id,

        { password: hashedpass }
      );
      if (usernew) {
        await reset.findOneAndDelete({ userId });

        const message = "your password succesfully reset.";
        res
          .status(200)
          .redirect(
            `/api/user/resetpassword?status=success&message=${message}`
          );
      }
    }
  } catch (err) {
    res.status(403).json(err.message);
  }
};

module.exports = {
  getuser,
  createcurentuser,
  changepass,
  resetPass,
  resetpass,
  GetUser,
  updateuser,
  getOrders,
};
