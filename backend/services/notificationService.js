const Notifications = require("../models/Notifications")

async function sendNotification(userId, payload){
    return await Notifications.create({
        user: userId,
        title: payload.title,
        body: payload.body,
        data: payload.data
    })
}

module.exports = {sendNotification}