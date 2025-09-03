const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

delete mongoose.models.Guest;
const GuestSchema = new Schema(
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
            unique: true,
        },
        phone_num: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

GuestSchema.plugin(passportLocalMongoose, { usernameField: "email" });
const Guest = mongoose.model("Guest", GuestSchema);

module.exports = Guest;
