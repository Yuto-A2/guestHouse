const mongoose = require("mongoose");
const Schema = mongoose.Schema;
delete mongoose.models.Reservation;
const ReservationSchema = new mongoose.Schema(
    {
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        guest: {
            type: Schema.Types.ObjectId,
            ref: 'Guest',
            required: true,
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
    },
    { timestamps: true }
);

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
