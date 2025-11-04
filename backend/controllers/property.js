const Property = require('../models/property');

function isAuthed(req) {
  return req.isAuthenticated && req.isAuthenticated();
}
function isAdmin(req) {
  return isAuthed(req) && req.user?.role === 'admin';
}

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
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

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

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.updateProperty = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const property = await Property.findByIdAndUpdate(id, { ...req.body }, { new: true });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const property = await Property.findByIdAndDelete(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
