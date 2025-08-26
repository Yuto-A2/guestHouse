const mongoose = require("mongoose");

delete mongoose.models.Guest;
const GuestSchema = new mongoose.Schema(
    {
        fname: {
            type: String,
            required: true,
        },
        lname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone_num: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Guest = mongoose.model("Guest", GuestSchema);

module.exports = Guest;
