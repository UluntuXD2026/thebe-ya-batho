const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Notifications = require("../models/Notifications");

router.get("/", authenticateToken, async(req, res) => {
    const notifications = await Notifications.find({
        user: req.user.userid
    }).sort({createdAt: -1})

    res.json(notifications)
})

module.exports = router;