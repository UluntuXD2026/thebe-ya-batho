const express = require("express");
const User = require("../models/User");
const ContactRequest = require("../models/ContactRequest");
const router = express.Router();
const { sendNotification } = require("../services/notificationService");
const authenticateToken = require("../middleware/auth");
const EmergencyAlert = require("../models/EmergencyAlert");

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {type, location} = req.body

    const contacts = await ContactRequest.find({
      from: req.user.userid,
      status: "accepted",
    }).populate("to", "firstName lastName number");

    const alert = await EmergencyAlert.create({
        user: req.user.userid,
        type,
        location
    })

    for(let x = 0; x < contacts.length; x++){
        await sendNotification(contacts[x].to._id, {
            title: "Emergency Alert",
            body: "Your contact needs help",
            data: {
                emergencyId: alert._id,
                type,
                location,
                time: alert.createdAt,
                sender: req.user.userid
            }
        })
    }

    res.status(200).json({message: "Emergency sent"})

  } catch (err) {
    res.status(500).json({ message: "internal server error", err });
  }
});

module.exports = router;
