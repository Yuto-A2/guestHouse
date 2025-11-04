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
// Create a new property
module.exports.createProperties = async (req, res) => {
  try {
    // 1) 認証チェックを最初に
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden: admin only' });

    // 2) 入力バリデーション（前後空白も除去）
    const address = (req.body?.address ?? '').trim();
    const property_type = (req.body?.property_type ?? '').trim();
    if (!address || !property_type) {
      return res.status(400).json({ error: 'address と property_type は必須です' });
    }

    // 3) Mapbox トークン確認
    if (!geocoder) {
      console.error('MAPBOX_TOKEN is missing or geocoder not initialized');
      return res.status(500).json({ error: 'Server misconfigured: MAPBOX_TOKEN missing' });
    }

    // 4) ジオコード（タイムアウト付きでハング対策）
    const geocodeWithTimeout = (query, ms = 7000) => {
      return Promise.race([
        geocoder.forwardGeocode({ query, limit: 1 }).send(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Geocoding timeout')), ms)),
      ]);
    };

    let feature;
    try {
      const geoRes = await geocodeWithTimeout(address, 7000);
      feature = geoRes?.body?.features?.[0];
    } catch (err) {
      console.error('Geocoding error:', err?.message || err);
      return res.status(502).json({ error: `Geocoding failed: ${err?.message || 'unknown error'}` });
    }

    // 5) 結果確認
    const coords = feature?.geometry?.coordinates; // [lng, lat]
    if (!Array.isArray(coords) || coords.length !== 2) {
      return res.status(400).json({
        error: 'Cannot find location for the given address. 市・州・国まで含めて入力してください。',
      });
    }

    // 6) 保存（ホワイトリストで生成）
    const newProperty = new Property({
      address,
      property_type,
      geometry: { type: 'Point', coordinates: coords }, // [経度, 緯度]
    });

    // デバッグしたい場合は以下を有効化
    // console.log('About to save:', JSON.stringify(newProperty.toObject(), null, 2));

    await newProperty.save();
    return res.status(201).json(newProperty);

  } catch (e) {
    console.error('createProperties error:', e);
    return res.status(500).json({ error: e.message || 'Unknown server error' });
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
