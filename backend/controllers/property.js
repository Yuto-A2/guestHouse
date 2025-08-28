const Property = require('../models/property');

module.exports.index = async (req, res) => {
    try {
    const properties = await Property.find({});
    res.json(properties);
} catch (e) {
    res.status(500).json({ error: e.message });
}
};

module.exports.createProperties = async (req, res) => {
    try {
        const newProperty = new Property(req.body);
        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports.showProperties = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        res.json(property);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
