require("dotenv").config()
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const resend = require("../utils/email");

const jwtKey = process.env.JWTKEY;

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const users = await User.find({
      $or: [{ username: username }, { email: email }],
    });

    if (users.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username: username,
      email: email,
      password: password,
    });

    await newUser.save();

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await resend.emails.send({
      from: "Thebe Ya Batho <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `<p>Your verification code is <b>${code}</b></p>`,
    });

    console.log("RESEND RESULT:", result);

    res.status(201).json({ message: `verification sent to ${email}` });
  } catch (err) {
    res.status.json({ message: "internal server error", err });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email, password: password });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const token = jwt.sign({ userid: user._id, email: user.email }, jwtKey);

    res
      .status(200)
      .json({ message: "user logged in successfully", token: token });
  } catch (err) {
    res.status(500).json({ message: "internal server error", err });
  }
});

module.exports = router;
