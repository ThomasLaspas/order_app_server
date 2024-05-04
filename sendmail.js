const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const pass = require("./schemas/passreset");

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",

  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

const resetpassword = async (user, res) => {
  const { _id, email, username } = user;
  const token = _id + uuidv4();
  const link = APP_URL + "api/user/reset/" + _id + "/" + token + "/" + email;
  const passoptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Password reset",
    html: `<div style="font-size:20px; color:black; background-color:white">
    <h1>please Reset your password</h1>
    <hr/>
    <h4>Hi ${username}</h4>
    <p>please Reset your password with two steps method. First click the link bellow</p>
    <p>This link <b>expires in 10 minuites</b>.</p>
    <br/>
    <a href="${link}">Reset</a>
    <div style="margin-top:10%;">
        <h5>Best regards</h5>
    </div>
</div>`,
  };
  let emailSent = false; // Flag to track if email was sent
  try {
    const trialtoken = await bcrypt.hash(token, 10);
    const Resetpassemail = await pass.create({
      userId: _id,
      token: trialtoken,
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });
    if (Resetpassemail) {
      transporter.sendMail(passoptions);
      emailSent = true;
    }
  } catch (err) {
    console.log(err);
    res.status(501).json(err.message);
  }
  // Send response based on emailSent flag
  if (emailSent) {
    res.status(201).json({
      success: "PENDING",
      message:
        "Reset password email has been sent to your account. Check your email",
    });
  } else {
    // If email wasn't sent, return an error response
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

module.exports = { resetpassword };
