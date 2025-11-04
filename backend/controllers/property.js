const Property = require('../models/property');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapBoxToken ? mbxGeocoding({ accessToken: mapBoxToken }) : null;

function isAuthed(req) {
  return req.isAuthenticated && req.isAuthenticated();
}
function isAdmin(req) {
  return isAuthed(req) && req.user?.role === 'admin';
}

// Show all properties
module.exports.index = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json(properties);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Create a new property
module.exports.createProperties = async (req, res) => {
  try {
    // 1) 認証を先に
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const { address, property_type } = req.body || {};
    if (!address || !property_type) {
      return res.status(400).json({ error: 'address と property_type は必須です' });
    }

    if (!geocoder) {
      return res.status(500).json({ error: 'Server misconfigured: MAPBOX_TOKEN missing' });
    }

    const geoRes = await geocoder.forwardGeocode({
      query: String(address).trim(),
      limit: 1
    }).send();

    const feature = geoRes?.body?.features?.[0];
    if (!feature?.geometry?.coordinates) {
      return res.status(400).json({
        error: 'Cannot find location for the given address'
      });
    }

    const newProperty = new Property({
      address: String(address).trim(),
      property_type: String(property_type).trim(),
      geometry: {
        type: 'Point',
        coordinates: feature.geometry.coordinates 
      }
    });

    await newProperty.save();
    return res.status(201).json(newProperty);
  } catch (e) {
    console.error('createProperties error:', e);
    res.status(500).json({ error: e.message || 'Unknown server error' });
  }
};

// Show a specific property
module.exports.showProperties = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Show edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update a property
module.exports.updateProperty = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const update = { ...req.body };

    if (typeof update.address === 'string' && update.address.trim()) {
      if (!geocoder) {
        return res.status(500).json({ error: 'Server misconfigured: MAPBOX_TOKEN missing' });
      }
      const geoRes = await geocoder.forwardGeocode({
        query: update.address.trim(),
        limit: 1
      }).send();
      const feature = geoRes?.body?.features?.[0];
      if (!feature?.geometry?.coordinates) {
        return res.status(400).json({ error: '住所の位置情報が見つかりません' });
      }
      update.geometry = {
        type: 'Point',
        coordinates: feature.geometry.coordinates
      };
    }

    const property = await Property.findByIdAndUpdate(id, update, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete a property
module.exports.deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    const property = await Property.findByIdAndDelete(id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json({ message: 'Property deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
