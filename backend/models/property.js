const mongoose = require("mongoose");

delete mongoose.models.Property;
const PropertySchema = new mongoose.Schema(
    {
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
