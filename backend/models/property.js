const mongoose = require("mongoose");

delete mongoose.models.Property;
const PropertySchema = new mongoose.Schema(
    {
        geometry: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        address: {
            type: String,
            required: true,
        },
        property_type: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Property = mongoose.model("Property", PropertySchema);

module.exports = Property;
